import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
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

export const rooms = pgTable("rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  memberCount: integer("member_count").default(0),
  createdAt: text("created_at").notNull(),
});

export const insertRoomSchema = createInsertSchema(rooms).omit({ id: true, memberCount: true });
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Room = typeof rooms.$inferSelect;

export const roomMembers = pgTable("room_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: text("room_id").notNull(),
  userId: text("user_id").notNull(),
  role: text("role").notNull(),
  xpInRoom: integer("xp_in_room").default(0),
  joinedAt: text("joined_at").notNull(),
});

export const insertRoomMemberSchema = createInsertSchema(roomMembers).omit({ id: true, xpInRoom: true });
export type InsertRoomMember = z.infer<typeof insertRoomMemberSchema>;
export type RoomMember = typeof roomMembers.$inferSelect;

export const missionTypes = ["watch_videos", "complete_quiz", "join_salon", "comment", "share_content", "win_battle", "create_content", "streak"] as const;
export const missionFrequencies = ["daily", "weekly", "one_time"] as const;

export const missions = pgTable("missions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  missionType: text("mission_type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  targetValue: integer("target_value").notNull(),
  currentProgress: integer("current_progress").default(0),
  xpReward: integer("xp_reward").notNull(),
  frequency: text("frequency").notNull(),
  category: text("category"),
  completed: boolean("completed").default(false),
  expiresAt: text("expires_at"),
});

export const insertMissionSchema = createInsertSchema(missions).omit({ id: true, currentProgress: true, completed: true });
export type InsertMission = z.infer<typeof insertMissionSchema>;
export type Mission = typeof missions.$inferSelect;

export const follows = pgTable("follows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  followerId: text("follower_id").notNull(),
  followingId: text("following_id").notNull(),
  createdAt: text("created_at").notNull(),
});

export const insertFollowSchema = createInsertSchema(follows).omit({ id: true });
export type InsertFollow = z.infer<typeof insertFollowSchema>;
export type Follow = typeof follows.$inferSelect;

export const activityTypes = ["content_created", "quiz_completed", "room_joined", "badge_earned", "level_up", "mission_completed"] as const;

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  username: text("username").notNull(),
  activityType: text("activity_type").notNull(),
  description: text("description").notNull(),
  metadata: text("metadata"),
  createdAt: text("created_at").notNull(),
});

export const insertActivitySchema = createInsertSchema(activities).omit({ id: true });
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

export const roomPosts = pgTable("room_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: text("room_id").notNull(),
  userId: text("user_id").notNull(),
  username: text("username").notNull(),
  text: text("text").notNull(),
  likes: integer("likes").default(0),
  createdAt: text("created_at").notNull(),
});

export const insertRoomPostSchema = createInsertSchema(roomPosts).omit({ id: true, likes: true });
export type InsertRoomPost = z.infer<typeof insertRoomPostSchema>;
export type RoomPost = typeof roomPosts.$inferSelect;

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false),
  createdAt: text("created_at").notNull(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, read: true });
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

export const videoEngagements = pgTable("video_engagements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  contentId: text("content_id").notNull(),
  watchTimeSeconds: integer("watch_time_seconds").notNull(),
  completionPercentage: integer("completion_percentage").notNull(),
  liked: boolean("liked").default(false),
  commented: boolean("commented").default(false),
  saved: boolean("saved").default(false),
  shared: boolean("shared").default(false),
  rewatchCount: integer("rewatch_count").default(0),
});

export const insertVideoEngagementSchema = createInsertSchema(videoEngagements).omit({ id: true });
export type InsertVideoEngagement = z.infer<typeof insertVideoEngagementSchema>;
export type VideoEngagement = typeof videoEngagements.$inferSelect;

export const engagementStats = pgTable("engagement_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().unique(),
  categoryStats: jsonb("category_stats"),
  preferredDifficulty: text("preferred_difficulty").default("debutant"),
});

export const insertEngagementStatsSchema = createInsertSchema(engagementStats).omit({ id: true });
export type InsertEngagementStats = z.infer<typeof insertEngagementStatsSchema>;
export type EngagementStats = typeof engagementStats.$inferSelect;

export const contentLikes = pgTable("content_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contentId: text("content_id").notNull(),
  userId: text("user_id").notNull(),
});

export const insertContentLikeSchema = createInsertSchema(contentLikes).omit({ id: true });
export type InsertContentLike = z.infer<typeof insertContentLikeSchema>;
export type ContentLike = typeof contentLikes.$inferSelect;

export const commentLikes = pgTable("comment_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  commentId: text("comment_id").notNull(),
  userId: text("user_id").notNull(),
});

export const insertCommentLikeSchema = createInsertSchema(commentLikes).omit({ id: true });
export type InsertCommentLike = z.infer<typeof insertCommentLikeSchema>;
export type CommentLike = typeof commentLikes.$inferSelect;

export const roomPostLikes = pgTable("room_post_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: text("post_id").notNull(),
  userId: text("user_id").notNull(),
});

export const insertRoomPostLikeSchema = createInsertSchema(roomPostLikes).omit({ id: true });
export type InsertRoomPostLike = z.infer<typeof insertRoomPostLikeSchema>;
export type RoomPostLike = typeof roomPostLikes.$inferSelect;

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({ id: true, createdAt: true });
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email invalide"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token requis"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});
