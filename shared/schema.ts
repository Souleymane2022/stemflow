import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Profile with STEM preferences
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  preferredLanguage: text("preferred_language").default("fr"),
  educationLevel: text("education_level"), // college, lycee, universite, autodidacte
  interests: text("interests").array(), // science, technology, engineering, mathematics
  level: text("level").default("curieux"), // curieux, explorateur, analyste, challenger, mentor
  xp: integer("xp").default(0),
  streak: integer("streak").default(0),
  onboardingCompleted: boolean("onboarding_completed").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// User Profile for onboarding
export const userProfileSchema = z.object({
  preferredLanguage: z.enum(["fr", "en"]),
  educationLevel: z.enum(["college", "lycee", "universite", "autodidacte"]),
  interests: z.array(z.enum(["science", "technology", "engineering", "mathematics"])).min(1),
  level: z.enum(["curieux", "explorateur", "analyste", "challenger", "mentor"]),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

// Content Entity for the feed
export const contentTypes = ["video", "text_post", "image_post", "quiz", "infographic"] as const;
export const categories = ["science", "technology", "engineering", "mathematics"] as const;
export const difficulties = ["debutant", "intermediaire", "avance"] as const;

export const contentSchema = z.object({
  id: z.string(),
  contentType: z.enum(contentTypes),
  title: z.string(),
  description: z.string().optional(),
  videoUrl: z.string().optional(),
  textContent: z.string().optional(),
  imageUrl: z.string().optional(),
  roomId: z.string().optional(),
  roomName: z.string().optional(),
  category: z.enum(categories),
  difficulty: z.enum(difficulties),
  xpReward: z.number().default(25),
  authorId: z.string(),
  authorName: z.string(),
  authorAvatar: z.string().optional(),
  likes: z.number().default(0),
  comments: z.number().default(0),
  shares: z.number().default(0),
  createdAt: z.string(),
});

export type Content = z.infer<typeof contentSchema>;

export const insertContentSchema = contentSchema.omit({ id: true, createdAt: true, likes: true, comments: true, shares: true });
export type InsertContent = z.infer<typeof insertContentSchema>;

// Room/Salon Entity
export const roomTypes = ["public", "private"] as const;
export const roomRoles = ["apprenant", "challenger", "mentor", "moderateur"] as const;

export const roomSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.enum(roomTypes),
  category: z.enum(categories),
  imageUrl: z.string().optional(),
  memberCount: z.number().default(0),
  createdAt: z.string(),
});

export type Room = z.infer<typeof roomSchema>;

export const insertRoomSchema = roomSchema.omit({ id: true, createdAt: true, memberCount: true });
export type InsertRoom = z.infer<typeof insertRoomSchema>;

// Room Membership
export const roomMemberSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  userId: z.string(),
  role: z.enum(roomRoles),
  xpInRoom: z.number().default(0),
  joinedAt: z.string(),
});

export type RoomMember = z.infer<typeof roomMemberSchema>;

// Mission Entity for gamification
export const missionTypes = ["watch_videos", "complete_quiz", "join_salon", "comment", "share_content", "win_battle", "create_content", "streak"] as const;
export const missionFrequencies = ["daily", "weekly", "one_time"] as const;

export const missionSchema = z.object({
  id: z.string(),
  missionType: z.enum(missionTypes),
  title: z.string(),
  description: z.string(),
  targetValue: z.number(),
  currentProgress: z.number().default(0),
  xpReward: z.number(),
  frequency: z.enum(missionFrequencies),
  category: z.enum(categories).optional(),
  completed: z.boolean().default(false),
  expiresAt: z.string().optional(),
});

export type Mission = z.infer<typeof missionSchema>;

export const insertMissionSchema = missionSchema.omit({ id: true, currentProgress: true, completed: true });
export type InsertMission = z.infer<typeof insertMissionSchema>;

// Engagement Stats for AI personalization
export const engagementStatsSchema = z.object({
  userId: z.string(),
  categoryStats: z.record(z.enum(categories), z.object({
    watchTime: z.number().default(0),
    completionRate: z.number().default(0),
    interactionCount: z.number().default(0),
  })),
  preferredDifficulty: z.enum(difficulties).default("debutant"),
});

export type EngagementStats = z.infer<typeof engagementStatsSchema>;

// Video Engagement tracking
export const videoEngagementSchema = z.object({
  id: z.string(),
  userId: z.string(),
  contentId: z.string(),
  watchTimeSeconds: z.number(),
  completionPercentage: z.number(),
  liked: z.boolean().default(false),
  commented: z.boolean().default(false),
  saved: z.boolean().default(false),
  shared: z.boolean().default(false),
  rewatchCount: z.number().default(0),
});

export type VideoEngagement = z.infer<typeof videoEngagementSchema>;
