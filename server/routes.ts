import { resumes, reviews } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { db } from "./db";
import { insertResumeSchema, insertReviewSchema } from "@shared/schema";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for disk storage
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage_multer = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_multer,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  }
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);

  app.get(api.resumes.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const user = req.user as any;
    if (user.role === "recruiter") {
      const resumes = await storage.getAllResumes();
      res.json(resumes);
    } else {
      const resumes = await storage.getResumesByStudentId(user.id);
      res.json(resumes);
    }
  });

  app.post(api.resumes.create.path, upload.single("file"), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    try {
      const currentVersion = await storage.getLatestResumeVersion(user.id);
      
      const resume = await storage.createResume({
        title: req.body.title || req.file.originalname,
        filePath: req.file.path,
        studentId: user.id,
        studentName: user.name,
        version: currentVersion + 1,
      });
      res.status(201).json(resume);
    } catch (err) {
      res.status(500).json({ message: "Failed to save resume" });
    }
  });

  app.get(api.resumes.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const resume = await storage.getResume(Number(req.params.id));
    if (!resume) return res.status(404).json({ message: "Resume not found" });
    
    const user = req.user as any;
    if (user.role !== "recruiter" && resume.studentId !== user.id) {
      return res.sendStatus(403);
    }

    res.json(resume);
  });

  app.get("/api/resumes/:id/download", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const resume = await storage.getResume(Number(req.params.id));
    if (!resume) return res.status(404).json({ message: "Resume not found" });

    const user = req.user as any;
    if (user.role !== "recruiter" && resume.studentId !== user.id) {
      return res.sendStatus(403);
    }

    const filePath = path.resolve(resume.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.download(filePath, `${resume.studentName.replace(/\s+/g, '_')}_v${resume.version}.pdf`);
  });

  app.post(api.reviews.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    if (user.role !== "recruiter") return res.sendStatus(403);

    try {
      const input = api.reviews.create.input.parse(req.body);
      
      let strengthLevel: "Weak" | "Average" | "Strong" = "Weak";
      if (input.score >= 80) strengthLevel = "Strong";
      else if (input.score >= 50) strengthLevel = "Average";

      const review = await storage.createReview({
        ...input,
        recruiterId: user.id,
        strengthLevel,
      });

      // Update resume status based on score
      const newStatus = input.score >= 80 ? "Approved" : "Needs Improvement";
      await db.update(resumes).set({ status: newStatus }).where(eq(resumes.id, input.resumeId));

      res.status(201).json(review);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  return httpServer;
}
