import { randomUUID } from "crypto";
import type { 
  User, InsertUser, Content, InsertContent, 
  Room, InsertRoom, Mission, InsertMission,
  RoomMember, EngagementStats, VideoEngagement,
  QuizQuestion, InsertQuizQuestion, QuizAttempt,
  Comment, InsertComment, Badge, UserBadge, LeaderboardEntry,
  Follow, Activity, RoomPost, Notification,
  PasswordResetToken
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  activateUser(email: string, code: string): Promise<User | undefined>;
  updateUserProfile(id: string, profile: Partial<User>): Promise<User | undefined>;

  getAllContent(): Promise<Content[]>;
  getContentByCategory(category: string): Promise<Content[]>;
  getContentByRoom(roomId: string): Promise<Content[]>;
  getContent(id: string): Promise<Content | undefined>;
  createContent(content: InsertContent): Promise<Content>;
  toggleLike(contentId: string, userId: string): Promise<{ liked: boolean; likeCount: number }>;
  hasUserLiked(contentId: string, userId: string): Promise<boolean>;
  getUserLikes(userId: string): Promise<string[]>;
  getUserLikedCategories(userId: string, limit?: number): Promise<{ category: string; liked: boolean }[]>;
  getUserEngagedCategories(userId: string): Promise<string[]>;
  shareContent(contentId: string): Promise<void>;
  getContentByAuthor(authorId: string): Promise<Content[]>;
  incrementCommentCount(contentId: string): Promise<void>;
  decrementCommentCount(contentId: string): Promise<void>;

  getQuizQuestions(contentId: string): Promise<QuizQuestion[]>;
  createQuizQuestion(question: InsertQuizQuestion): Promise<QuizQuestion>;
  createQuizQuestions(questions: InsertQuizQuestion[]): Promise<QuizQuestion[]>;
  submitQuizAttempt(attempt: Omit<QuizAttempt, 'id' | 'completedAt'>): Promise<QuizAttempt>;
  getQuizAttempts(contentId: string): Promise<QuizAttempt[]>;
  getUserQuizAttempts(userId: string): Promise<QuizAttempt[]>;

  getComments(contentId: string): Promise<Comment[]>;
  getReplies(parentId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(commentId: string, userId: string): Promise<boolean>;
  toggleCommentLike(commentId: string, userId: string): Promise<{ liked: boolean; likeCount: number }>;
  hasUserLikedComment(commentId: string, userId: string): Promise<boolean>;
  getCommentById(commentId: string): Promise<Comment | undefined>;

  getAllBadges(): Promise<Badge[]>;
  getUserBadges(userId: string): Promise<UserBadge[]>;
  awardBadge(userId: string, badgeId: string): Promise<UserBadge>;

  getLeaderboard(category?: string): Promise<LeaderboardEntry[]>;

  getAllRooms(): Promise<Room[]>;
  getRoom(id: string): Promise<Room | undefined>;
  createRoom(room: InsertRoom): Promise<Room>;
  joinRoom(roomId: string, userId: string, role: string): Promise<RoomMember>;

  getUserMissions(userId: string): Promise<Mission[]>;
  getMission(id: string): Promise<Mission | undefined>;
  createMission(mission: InsertMission): Promise<Mission>;
  updateMissionProgress(id: string, progress: number): Promise<Mission | undefined>;
  completeMission(id: string): Promise<Mission | undefined>;

  getEngagementStats(userId: string): Promise<EngagementStats | undefined>;
  trackVideoEngagement(engagement: Omit<VideoEngagement, 'id'>): Promise<VideoEngagement>;

  getRoomPosts(roomId: string): Promise<RoomPost[]>;
  createRoomPost(post: Omit<RoomPost, 'id' | 'likes' | 'createdAt'>): Promise<RoomPost>;
  likeRoomPost(postId: string, userId: string): Promise<{ liked: boolean; likeCount: number }>;

  followUser(followerId: string, followingId: string): Promise<void>;
  unfollowUser(followerId: string, followingId: string): Promise<void>;
  getFollowers(userId: string): Promise<string[]>;
  getFollowing(userId: string): Promise<string[]>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
  getFollowCounts(userId: string): Promise<{followers: number, following: number}>;
  createActivity(activity: {userId: string, username: string, activityType: string, description: string, metadata?: string}): Promise<Activity>;
  getActivitiesByUser(userId: string): Promise<Activity[]>;
  getActivitiesFeed(userIds: string[]): Promise<Activity[]>;
  searchUsers(query: string): Promise<User[]>;

  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notif: Omit<Notification, "id" | "read" | "createdAt">): Promise<Notification>;
  markNotificationRead(id: string): Promise<void>;
  markAllNotificationsRead(userId: string): Promise<void>;
  getUnreadNotificationCount(userId: string): Promise<number>;

  createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  markTokenUsed(tokenId: string): Promise<void>;
  deleteExpiredTokens(): Promise<void>;
  updateUserPassword(userId: string, hashedPassword: string): Promise<void>;

  getUserByOAuthId(oauthId: string): Promise<User | undefined>;
  createOrLinkOAuthUser(oauthId: string, oauthProvider: string, email: string | null, firstName: string | null, lastName: string | null, profileImageUrl: string | null): Promise<User>;
}

import { DatabaseStorage } from "./dbStorage";
export const storage: IStorage = new DatabaseStorage();
