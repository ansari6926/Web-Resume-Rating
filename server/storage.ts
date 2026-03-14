import { db } from "./db";
import { users, resumes, reviews, type User, type InsertUser, type Resume, type InsertResume, type Review, type InsertReview } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  sessionStore: session.Store;
  createResume(resume: InsertResume & { studentId: number, studentName: string, version: number }): Promise<Resume>;
  getResumesByStudentId(studentId: number): Promise<(Resume & { reviews: Review[] })[]>;
  getAllResumes(): Promise<(Resume & { reviews: Review[] })[]>;
  getResume(id: number): Promise<(Resume & { reviews: Review[] }) | undefined>;
  getLatestResumeVersion(studentId: number): Promise<number>;
  createReview(review: InsertReview & { strengthLevel: "Weak" | "Average" | "Strong" }): Promise<Review>;
  getReviewsByResumeId(resumeId: number): Promise<Review[]>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async createResume(resume: InsertResume & { studentId: number, studentName: string, version: number }): Promise<Resume> {
    const [newResume] = await db.insert(resumes).values(resume).returning();
    return newResume;
  }

  async getResumesByStudentId(studentId: number): Promise<(Resume & { reviews: Review[] })[]> {
    const userResumes = await db.select().from(resumes).where(eq(resumes.studentId, studentId)).orderBy(desc(resumes.createdAt));
    return await Promise.all(userResumes.map(async (resume) => {
      const resumeReviews = await db.select().from(reviews).where(eq(reviews.resumeId, resume.id));
      return { ...resume, reviews: resumeReviews };
    }));
  }

  async getAllResumes(): Promise<(Resume & { reviews: Review[] })[]> {
    const allResumes = await db.select().from(resumes).orderBy(desc(resumes.createdAt));
    return await Promise.all(allResumes.map(async (resume) => {
      const resumeReviews = await db.select().from(reviews).where(eq(reviews.resumeId, resume.id));
      return { ...resume, reviews: resumeReviews };
    }));
  }

  async getResume(id: number): Promise<(Resume & { reviews: Review[] }) | undefined> {
    const [resume] = await db.select().from(resumes).where(eq(resumes.id, id));
    if (!resume) return undefined;
    const resumeReviews = await db.select().from(reviews).where(eq(reviews.resumeId, id));
    return { ...resume, reviews: resumeReviews };
  }

  async getLatestResumeVersion(studentId: number): Promise<number> {
    const [latest] = await db.select().from(resumes)
      .where(eq(resumes.studentId, studentId))
      .orderBy(desc(resumes.version))
      .limit(1);
    return latest ? latest.version : 0;
  }

  async createReview(review: InsertReview & { strengthLevel: "Weak" | "Average" | "Strong" }): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async getReviewsByResumeId(resumeId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.resumeId, resumeId));
  }
}

export const storage = new DatabaseStorage();
