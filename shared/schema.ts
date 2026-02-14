import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  isActive: boolean("is_active").default(false),
  activationCode: text("activation_code"),
  preferredLanguage: text("preferred_language").default("fr"),
  educationLevel: text("education_level"),
  interests: text("interests").array(),
  level: text("level").default("curieux"),
  xp: integer("xp").default(0),
  streak: integer("streak").default(0),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  createdAt: text("created_at"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

export const registerSchema = z.object({
  username: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(50),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const activationSchema = z.object({
  email: z.string().email("Email invalide"),
  code: z.string().length(6, "Le code doit contenir 6 chiffres"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const userProfileSchema = z.object({
  preferredLanguage: z.enum(["fr", "en"]),
  educationLevel: z.enum(["college", "lycee", "universite", "autodidacte"]),
  interests: z.array(z.enum(["science", "technology", "engineering", "mathematics"])).min(1),
  level: z.enum(["curieux", "explorateur", "analyste", "challenger", "mentor"]),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

export const contentTypes = ["video", "text_post", "image_post", "quiz", "infographic"] as const;
export const categories = ["science", "technology", "engineering", "mathematics"] as const;
export const difficulties = ["debutant", "intermediaire", "avance"] as const;

export const contents = pgTable("contents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contentType: text("content_type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  videoUrl: text("video_url"),
  textContent: text("text_content"),
  imageUrl: text("image_url"),
  roomId: text("room_id"),
  roomName: text("room_name"),
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull(),
  tags: text("tags").array().default(sql`'{}'::text[]`),
  xpReward: integer("xp_reward").default(25),
  authorId: text("author_id").notNull(),
  authorName: text("author_name").notNull(),
  authorAvatar: text("author_avatar"),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  createdAt: text("created_at").notNull(),
});

export const insertContentSchema = createInsertSchema(contents).omit({
  id: true,
  likes: true,
  comments: true,
  shares: true,
});
export type InsertContent = z.infer<typeof insertContentSchema>;
export type Content = typeof contents.$inferSelect;

export const quizQuestions = pgTable("quiz_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contentId: text("content_id").notNull(),
  question: text("question").notNull(),
  options: text("options").array().notNull(),
  correctOptionIndex: integer("correct_option_index").notNull(),
  explanation: text("explanation"),
  order: integer("order").notNull(),
});

export const insertQuizQuestionSchema = createInsertSchema(quizQuestions).omit({ id: true });
export type InsertQuizQuestion = z.infer<typeof insertQuizQuestionSchema>;
export type QuizQuestion = typeof quizQuestions.$inferSelect;

export const quizAttempts = pgTable("quiz_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  contentId: text("content_id").notNull(),
  answers: integer("answers").array().notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  completedAt: text("completed_at").notNull(),
});

export const insertQuizAttemptSchema = createInsertSchema(quizAttempts).omit({ id: true });
export type InsertQuizAttempt = z.infer<typeof insertQuizAttemptSchema>;
export type QuizAttempt = typeof quizAttempts.$inferSelect;

export const commentsTable = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contentId: text("content_id").notNull(),
  userId: text("user_id").notNull(),
  authorName: text("author_name").notNull(),
  text: text("text").notNull(),
  parentId: text("parent_id"),
  likes: integer("likes").default(0),
  createdAt: text("created_at").notNull(),
});

export const insertCommentSchema = createInsertSchema(commentsTable).omit({ id: true, likes: true });
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof commentsTable.$inferSelect;

export const badges = pgTable("badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  category: text("category").notNull(),
  requirement: text("requirement").notNull(),
  xpRequired: integer("xp_required").default(0),
});

export const insertBadgeSchema = createInsertSchema(badges).omit({ id: true });
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type Badge = typeof badges.$inferSelect;

export const userBadges = pgTable("user_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  badgeId: text("badge_id").notNull(),
  earnedAt: text("earned_at").notNull(),
});

export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({ id: true });
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type UserBadge = typeof userBadges.$inferSelect;

export const leaderboardEntrySchema = z.object({
  userId: z.string(),
  username: z.string(),
  xp: z.number(),
  level: z.string(),
  category: z.string().optional(),
  contentCount: z.number().default(0),
  quizScore: z.number().default(0),
  academicScore: z.number().default(0),
});

export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;

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

export const roomMemberSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  userId: z.string(),
  role: z.enum(roomRoles),
  xpInRoom: z.number().default(0),
  joinedAt: z.string(),
});

export type RoomMember = z.infer<typeof roomMemberSchema>;

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

export const activityTypes = ["content_created", "quiz_completed", "room_joined", "badge_earned", "level_up", "mission_completed"] as const;

export const followSchema = z.object({
  id: z.string(),
  followerId: z.string(),
  followingId: z.string(),
  createdAt: z.string(),
});

export type Follow = z.infer<typeof followSchema>;

export const activitySchema = z.object({
  id: z.string(),
  userId: z.string(),
  username: z.string(),
  activityType: z.enum(activityTypes),
  description: z.string(),
  metadata: z.string().nullable().optional(),
  createdAt: z.string(),
});

export type Activity = z.infer<typeof activitySchema>;
