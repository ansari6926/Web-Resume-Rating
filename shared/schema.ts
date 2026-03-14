import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(), // Changed from email to username for consistency
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ["student", "recruiter"] }).notNull().default("student"),
});

export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  studentName: text("student_name").notNull(),
  title: text("title").notNull(), 
  filePath: text("file_path").notNull(),
  version: integer("version").notNull().default(1),
  status: text("status").notNull().default("Pending Review"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  resumeId: integer("resume_id").notNull(),
  recruiterId: integer("recruiter_id").notNull(),
  score: integer("score").notNull(),
  comments: text("comments").notNull(),
  strengthLevel: text("strength_level", { enum: ["Weak", "Average", "Strong"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const resumesRelations = relations(resumes, ({ one, many }) => ({
  student: one(users, {
    fields: [resumes.studentId],
    references: [users.id],
  }),
  reviews: many(reviews),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  resume: one(resumes, {
    fields: [reviews.resumeId],
    references: [resumes.id],
  }),
  recruiter: one(users, {
    fields: [reviews.recruiterId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  resumes: many(resumes),
  reviews: many(reviews),
}));

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertResumeSchema = createInsertSchema(resumes).omit({ id: true, createdAt: true, version: true, studentName: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true, strengthLevel: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Resume = typeof resumes.$inferSelect;
export type InsertResume = z.infer<typeof insertResumeSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
