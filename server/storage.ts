import {
  users,
  assignments,
  chatMessages,
  type User,
  type UpsertUser,
  type Assignment,
  type InsertAssignment,
  type ChatMessage,
  type InsertChatMessage,
  type UpdateUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, count } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, userData: UpdateUser): Promise<User>;
  
  // Assignment operations
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  getAssignmentsByUser(userId: string): Promise<Assignment[]>;
  updateAssignmentStatus(id: number, status: string, submittedAt?: Date): Promise<Assignment>;
  getAssignmentStats(userId: string): Promise<{
    pending: number;
    completed: number;
    graded: number;
  }>;
  
  // Chat operations
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(limit?: number): Promise<(ChatMessage & { user: User })[]>;
  getChatMessageCount(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, userData: UpdateUser): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        firstName: userData.firstName,
        lastName: userData.lastName,
        username: userData.username,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Assignment operations
  async createAssignment(assignment: InsertAssignment): Promise<Assignment> {
    const [newAssignment] = await db
      .insert(assignments)
      .values({
        ...assignment,
        submittedAt: new Date(),
        status: "submitted",
      })
      .returning();
    return newAssignment;
  }

  async getAssignmentsByUser(userId: string): Promise<Assignment[]> {
    return await db
      .select()
      .from(assignments)
      .where(eq(assignments.userId, userId))
      .orderBy(desc(assignments.createdAt));
  }

  async updateAssignmentStatus(id: number, status: string, submittedAt?: Date): Promise<Assignment> {
    const [assignment] = await db
      .update(assignments)
      .set({ status, submittedAt })
      .where(eq(assignments.id, id))
      .returning();
    return assignment;
  }

  async getAssignmentStats(userId: string): Promise<{
    pending: number;
    completed: number;
    graded: number;
  }> {
    const [pendingCount] = await db
      .select({ count: count() })
      .from(assignments)
      .where(eq(assignments.userId, userId))
      .where(eq(assignments.status, "pending"));

    const [completedCount] = await db
      .select({ count: count() })
      .from(assignments)
      .where(eq(assignments.userId, userId))
      .where(eq(assignments.status, "submitted"));

    const [gradedCount] = await db
      .select({ count: count() })
      .from(assignments)
      .where(eq(assignments.userId, userId))
      .where(eq(assignments.status, "graded"));

    return {
      pending: pendingCount?.count || 0,
      completed: completedCount?.count || 0,
      graded: gradedCount?.count || 0,
    };
  }

  // Chat operations
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getChatMessages(limit = 50): Promise<(ChatMessage & { user: User })[]> {
    return await db
      .select({
        id: chatMessages.id,
        userId: chatMessages.userId,
        content: chatMessages.content,
        createdAt: chatMessages.createdAt,
        user: users,
      })
      .from(chatMessages)
      .innerJoin(users, eq(chatMessages.userId, users.id))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  async getChatMessageCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(chatMessages);
    return result?.count || 0;
  }
}

export const storage = new DatabaseStorage();
