import { db } from "./db";
import {
  users, contents, quizQuestions, quizAttempts, commentsTable, badges, userBadges,
  rooms, roomMembers, missions, follows, activities, roomPosts, notifications,
  videoEngagements, engagementStats, contentLikes, commentLikes, roomPostLikes,
  type User, type InsertUser, type Content, type InsertContent,
  type Room, type InsertRoom, type Mission, type InsertMission,
  type RoomMember, type EngagementStats, type VideoEngagement,
  type QuizQuestion, type InsertQuizQuestion, type QuizAttempt,
  type Comment, type InsertComment, type Badge, type UserBadge, type LeaderboardEntry,
  type Follow, type Activity, type RoomPost, type Notification,
} from "@shared/schema";
import { IStorage } from "./storage";
import { eq, and, desc, asc, sql, ilike, inArray, isNull, count } from "drizzle-orm";
import { randomUUID } from "crypto";

export class DatabaseStorage implements IStorage {

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = randomUUID();
    const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const [created] = await db.insert(users).values({
      id,
      username: user.username,
      email: user.email.toLowerCase(),
      password: user.password,
      isActive: false,
      activationCode,
      preferredLanguage: "fr",
      educationLevel: null,
      interests: null,
      level: "curieux",
      xp: 0,
      streak: 0,
      onboardingCompleted: false,
      createdAt: new Date().toISOString(),
    }).returning();
    return created;
  }

  async activateUser(email: string, code: string): Promise<User | undefined> {
    const user = await this.getUserByEmail(email.toLowerCase());
    if (!user || user.activationCode !== code) return undefined;
    const [updated] = await db.update(users)
      .set({ isActive: true, activationCode: null })
      .where(eq(users.id, user.id))
      .returning();
    return updated;
  }

  async updateUserProfile(id: string, profile: Partial<User>): Promise<User | undefined> {
    const [updated] = await db.update(users)
      .set(profile)
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async getAllContent(): Promise<Content[]> {
    return db.select().from(contents).orderBy(desc(contents.createdAt));
  }

  async getContentByCategory(category: string): Promise<Content[]> {
    return db.select().from(contents).where(eq(contents.category, category)).orderBy(desc(contents.createdAt));
  }

  async getContentByRoom(roomId: string): Promise<Content[]> {
    return db.select().from(contents).where(eq(contents.roomId, roomId)).orderBy(desc(contents.createdAt));
  }

  async getContent(id: string): Promise<Content | undefined> {
    const [content] = await db.select().from(contents).where(eq(contents.id, id));
    return content;
  }

  async createContent(content: InsertContent): Promise<Content> {
    const [created] = await db.insert(contents).values({
      id: randomUUID(),
      ...content,
      likes: 0,
      comments: 0,
      shares: 0,
    }).returning();
    return created;
  }

  async toggleLike(contentId: string, userId: string): Promise<{ liked: boolean; likeCount: number }> {
    const [existing] = await db.select().from(contentLikes)
      .where(and(eq(contentLikes.contentId, contentId), eq(contentLikes.userId, userId)));

    if (existing) {
      await db.delete(contentLikes)
        .where(and(eq(contentLikes.contentId, contentId), eq(contentLikes.userId, userId)));
      await db.update(contents)
        .set({ likes: sql`GREATEST(${contents.likes} - 1, 0)` })
        .where(eq(contents.id, contentId));
      const [updated] = await db.select().from(contents).where(eq(contents.id, contentId));
      return { liked: false, likeCount: updated?.likes ?? 0 };
    } else {
      await db.insert(contentLikes).values({ id: randomUUID(), contentId, userId });
      await db.update(contents)
        .set({ likes: sql`${contents.likes} + 1` })
        .where(eq(contents.id, contentId));
      const [updated] = await db.select().from(contents).where(eq(contents.id, contentId));
      return { liked: true, likeCount: updated?.likes ?? 0 };
    }
  }

  async hasUserLiked(contentId: string, userId: string): Promise<boolean> {
    const [existing] = await db.select().from(contentLikes)
      .where(and(eq(contentLikes.contentId, contentId), eq(contentLikes.userId, userId)));
    return !!existing;
  }

  async getUserLikes(userId: string): Promise<string[]> {
    const rows = await db.select({ contentId: contentLikes.contentId })
      .from(contentLikes)
      .where(eq(contentLikes.userId, userId));
    return rows.map(r => r.contentId);
  }

  async getUserLikedCategories(userId: string, limit = 20): Promise<{ category: string; liked: boolean }[]> {
    const rows = await db.select({ category: contents.category })
      .from(contentLikes)
      .innerJoin(contents, eq(contentLikes.contentId, contents.id))
      .where(eq(contentLikes.userId, userId))
      .limit(limit);
    return rows.map(r => ({ category: r.category || "science", liked: true }));
  }

  async getUserEngagedCategories(userId: string): Promise<string[]> {
    const likedCategories = await db.selectDistinct({ category: contents.category })
      .from(contentLikes)
      .innerJoin(contents, eq(contentLikes.contentId, contents.id))
      .where(eq(contentLikes.userId, userId));
    const quizCategories = await db.selectDistinct({ category: contents.category })
      .from(quizAttempts)
      .innerJoin(contents, eq(quizAttempts.contentId, contents.id))
      .where(eq(quizAttempts.userId, userId));
    const all = new Set([
      ...likedCategories.map(r => r.category).filter(Boolean),
      ...quizCategories.map(r => r.category).filter(Boolean),
    ]);
    return Array.from(all) as string[];
  }

  async shareContent(contentId: string): Promise<void> {
    await db.update(contents)
      .set({ shares: sql`${contents.shares} + 1` })
      .where(eq(contents.id, contentId));
  }

  async getContentByAuthor(authorId: string): Promise<Content[]> {
    return db.select().from(contents).where(eq(contents.authorId, authorId)).orderBy(desc(contents.createdAt));
  }

  async incrementCommentCount(contentId: string): Promise<void> {
    await db.update(contents)
      .set({ comments: sql`${contents.comments} + 1` })
      .where(eq(contents.id, contentId));
  }

  async decrementCommentCount(contentId: string): Promise<void> {
    await db.update(contents)
      .set({ comments: sql`GREATEST(${contents.comments} - 1, 0)` })
      .where(eq(contents.id, contentId));
  }

  async getQuizQuestions(contentId: string): Promise<QuizQuestion[]> {
    return db.select().from(quizQuestions).where(eq(quizQuestions.contentId, contentId)).orderBy(asc(quizQuestions.order));
  }

  async createQuizQuestion(question: InsertQuizQuestion): Promise<QuizQuestion> {
    const [created] = await db.insert(quizQuestions).values({
      id: randomUUID(),
      ...question,
    }).returning();
    return created;
  }

  async createQuizQuestions(questions: InsertQuizQuestion[]): Promise<QuizQuestion[]> {
    if (questions.length === 0) return [];
    const values = questions.map(q => ({ id: randomUUID(), ...q }));
    return db.insert(quizQuestions).values(values).returning();
  }

  async submitQuizAttempt(attempt: Omit<QuizAttempt, 'id' | 'completedAt'>): Promise<QuizAttempt> {
    const [created] = await db.insert(quizAttempts).values({
      id: randomUUID(),
      ...attempt,
      completedAt: new Date().toISOString(),
    }).returning();
    return created;
  }

  async getQuizAttempts(contentId: string): Promise<QuizAttempt[]> {
    return db.select().from(quizAttempts).where(eq(quizAttempts.contentId, contentId)).orderBy(desc(quizAttempts.completedAt));
  }

  async getUserQuizAttempts(userId: string): Promise<QuizAttempt[]> {
    return db.select().from(quizAttempts).where(eq(quizAttempts.userId, userId)).orderBy(desc(quizAttempts.completedAt));
  }

  async getComments(contentId: string): Promise<Comment[]> {
    return db.select().from(commentsTable)
      .where(and(eq(commentsTable.contentId, contentId), isNull(commentsTable.parentId)))
      .orderBy(desc(commentsTable.createdAt));
  }

  async getReplies(parentId: string): Promise<Comment[]> {
    return db.select().from(commentsTable)
      .where(eq(commentsTable.parentId, parentId))
      .orderBy(asc(commentsTable.createdAt));
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [created] = await db.insert(commentsTable).values({
      id: randomUUID(),
      ...comment,
      likes: 0,
    }).returning();
    return created;
  }

  async deleteComment(commentId: string, userId: string): Promise<boolean> {
    const [comment] = await db.select().from(commentsTable).where(eq(commentsTable.id, commentId));
    if (!comment || comment.userId !== userId) return false;

    const replies = await db.select().from(commentsTable).where(eq(commentsTable.parentId, commentId));
    if (replies.length > 0) {
      await db.delete(commentLikes).where(inArray(commentLikes.commentId, replies.map(r => r.id)));
      await db.delete(commentsTable).where(eq(commentsTable.parentId, commentId));
    }

    await db.delete(commentLikes).where(eq(commentLikes.commentId, commentId));
    await db.delete(commentsTable).where(eq(commentsTable.id, commentId));

    const totalDeleted = 1 + replies.length;
    for (let i = 0; i < totalDeleted; i++) {
      await this.decrementCommentCount(comment.contentId);
    }

    return true;
  }

  async toggleCommentLike(commentId: string, userId: string): Promise<{ liked: boolean; likeCount: number }> {
    const [existing] = await db.select().from(commentLikes)
      .where(and(eq(commentLikes.commentId, commentId), eq(commentLikes.userId, userId)));

    if (existing) {
      await db.delete(commentLikes)
        .where(and(eq(commentLikes.commentId, commentId), eq(commentLikes.userId, userId)));
      await db.update(commentsTable)
        .set({ likes: sql`GREATEST(${commentsTable.likes} - 1, 0)` })
        .where(eq(commentsTable.id, commentId));
      const [updated] = await db.select().from(commentsTable).where(eq(commentsTable.id, commentId));
      return { liked: false, likeCount: updated?.likes ?? 0 };
    } else {
      await db.insert(commentLikes).values({ id: randomUUID(), commentId, userId });
      await db.update(commentsTable)
        .set({ likes: sql`${commentsTable.likes} + 1` })
        .where(eq(commentsTable.id, commentId));
      const [updated] = await db.select().from(commentsTable).where(eq(commentsTable.id, commentId));
      return { liked: true, likeCount: updated?.likes ?? 0 };
    }
  }

  async hasUserLikedComment(commentId: string, userId: string): Promise<boolean> {
    const [existing] = await db.select().from(commentLikes)
      .where(and(eq(commentLikes.commentId, commentId), eq(commentLikes.userId, userId)));
    return !!existing;
  }

  async getCommentById(commentId: string): Promise<Comment | undefined> {
    const [comment] = await db.select().from(commentsTable).where(eq(commentsTable.id, commentId));
    return comment;
  }

  async getAllBadges(): Promise<Badge[]> {
    return db.select().from(badges);
  }

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    return db.select().from(userBadges).where(eq(userBadges.userId, userId));
  }

  async awardBadge(userId: string, badgeId: string): Promise<UserBadge> {
    const [created] = await db.insert(userBadges).values({
      id: randomUUID(),
      userId,
      badgeId,
      earnedAt: new Date().toISOString(),
    }).returning();
    return created;
  }

  async getLeaderboard(category?: string): Promise<LeaderboardEntry[]> {
    const allUsers = await db.select().from(users);
    const allContents = await db.select().from(contents);
    const allAttempts = await db.select().from(quizAttempts);

    const entries: LeaderboardEntry[] = allUsers.map(user => {
      const userContents = allContents.filter(c => c.authorId === user.id);
      const contentCount = userContents.length;

      const userAttempts = allAttempts.filter(a => a.userId === user.id);
      const avgQuizScore = userAttempts.length > 0
        ? userAttempts.reduce((sum, a) => sum + (a.totalQuestions > 0 ? (a.score / a.totalQuestions) * 100 : 0), 0) / userAttempts.length
        : 0;

      const contentQuality = contentCount * 10;
      const xp = user.xp ?? 0;
      const academicScore = xp * 0.4 + contentQuality * 0.3 + avgQuizScore * 0.3;

      return {
        userId: user.id,
        username: user.username,
        xp,
        level: user.level ?? "curieux",
        category: category ?? "general",
        contentCount,
        quizScore: Math.round(avgQuizScore),
        academicScore: Math.round(academicScore),
      };
    });

    entries.sort((a, b) => b.academicScore - a.academicScore);
    return entries.slice(0, 20);
  }

  async getAllRooms(): Promise<Room[]> {
    return db.select().from(rooms);
  }

  async getRoom(id: string): Promise<Room | undefined> {
    const [room] = await db.select().from(rooms).where(eq(rooms.id, id));
    return room;
  }

  async createRoom(room: InsertRoom): Promise<Room> {
    const [created] = await db.insert(rooms).values({
      id: randomUUID(),
      ...room,
      memberCount: 0,
    }).returning();
    return created;
  }

  async joinRoom(roomId: string, userId: string, role: string): Promise<RoomMember> {
    const [member] = await db.insert(roomMembers).values({
      id: randomUUID(),
      roomId,
      userId,
      role,
      xpInRoom: 0,
      joinedAt: new Date().toISOString(),
    }).returning();

    await db.update(rooms)
      .set({ memberCount: sql`${rooms.memberCount} + 1` })
      .where(eq(rooms.id, roomId));

    return member;
  }

  async getUserMissions(userId: string): Promise<Mission[]> {
    return db.select().from(missions);
  }

  async getMission(id: string): Promise<Mission | undefined> {
    const [mission] = await db.select().from(missions).where(eq(missions.id, id));
    return mission;
  }

  async createMission(mission: InsertMission): Promise<Mission> {
    const [created] = await db.insert(missions).values({
      id: randomUUID(),
      ...mission,
      currentProgress: 0,
      completed: false,
    }).returning();
    return created;
  }

  async updateMissionProgress(id: string, progress: number): Promise<Mission | undefined> {
    const mission = await this.getMission(id);
    if (!mission) return undefined;

    const completed = progress >= mission.targetValue;
    const [updated] = await db.update(missions)
      .set({ currentProgress: progress, completed })
      .where(eq(missions.id, id))
      .returning();
    return updated;
  }

  async completeMission(id: string): Promise<Mission | undefined> {
    const [updated] = await db.update(missions)
      .set({ completed: true })
      .where(eq(missions.id, id))
      .returning();
    return updated;
  }

  async getEngagementStats(userId: string): Promise<EngagementStats | undefined> {
    const [stats] = await db.select().from(engagementStats).where(eq(engagementStats.userId, userId));
    return stats;
  }

  async trackVideoEngagement(engagement: Omit<VideoEngagement, 'id'>): Promise<VideoEngagement> {
    const [created] = await db.insert(videoEngagements).values({
      id: randomUUID(),
      ...engagement,
    }).returning();
    return created;
  }

  async getRoomPosts(roomId: string): Promise<RoomPost[]> {
    return db.select().from(roomPosts).where(eq(roomPosts.roomId, roomId)).orderBy(desc(roomPosts.createdAt));
  }

  async createRoomPost(post: Omit<RoomPost, 'id' | 'likes' | 'createdAt'>): Promise<RoomPost> {
    const [created] = await db.insert(roomPosts).values({
      id: randomUUID(),
      ...post,
      likes: 0,
      createdAt: new Date().toISOString(),
    }).returning();
    return created;
  }

  async likeRoomPost(postId: string, userId: string): Promise<{ liked: boolean; likeCount: number }> {
    const [existing] = await db.select().from(roomPostLikes)
      .where(and(eq(roomPostLikes.postId, postId), eq(roomPostLikes.userId, userId)));

    if (existing) {
      await db.delete(roomPostLikes)
        .where(and(eq(roomPostLikes.postId, postId), eq(roomPostLikes.userId, userId)));
      await db.update(roomPosts)
        .set({ likes: sql`GREATEST(${roomPosts.likes} - 1, 0)` })
        .where(eq(roomPosts.id, postId));
      const [updated] = await db.select().from(roomPosts).where(eq(roomPosts.id, postId));
      return { liked: false, likeCount: updated?.likes ?? 0 };
    } else {
      await db.insert(roomPostLikes).values({ id: randomUUID(), postId, userId });
      await db.update(roomPosts)
        .set({ likes: sql`${roomPosts.likes} + 1` })
        .where(eq(roomPosts.id, postId));
      const [updated] = await db.select().from(roomPosts).where(eq(roomPosts.id, postId));
      return { liked: true, likeCount: updated?.likes ?? 0 };
    }
  }

  async followUser(followerId: string, followingId: string): Promise<void> {
    const existing = await this.isFollowing(followerId, followingId);
    if (existing) return;
    await db.insert(follows).values({
      id: randomUUID(),
      followerId,
      followingId,
      createdAt: new Date().toISOString(),
    });
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    await db.delete(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
  }

  async getFollowers(userId: string): Promise<string[]> {
    const rows = await db.select({ followerId: follows.followerId })
      .from(follows)
      .where(eq(follows.followingId, userId));
    return rows.map(r => r.followerId);
  }

  async getFollowing(userId: string): Promise<string[]> {
    const rows = await db.select({ followingId: follows.followingId })
      .from(follows)
      .where(eq(follows.followerId, userId));
    return rows.map(r => r.followingId);
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const [existing] = await db.select().from(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
    return !!existing;
  }

  async getFollowCounts(userId: string): Promise<{ followers: number; following: number }> {
    const [followersResult] = await db.select({ count: count() }).from(follows).where(eq(follows.followingId, userId));
    const [followingResult] = await db.select({ count: count() }).from(follows).where(eq(follows.followerId, userId));
    return {
      followers: followersResult?.count ?? 0,
      following: followingResult?.count ?? 0,
    };
  }

  async createActivity(activity: { userId: string; username: string; activityType: string; description: string; metadata?: string }): Promise<Activity> {
    const [created] = await db.insert(activities).values({
      id: randomUUID(),
      userId: activity.userId,
      username: activity.username,
      activityType: activity.activityType,
      description: activity.description,
      metadata: activity.metadata ?? null,
      createdAt: new Date().toISOString(),
    }).returning();
    return created;
  }

  async getActivitiesByUser(userId: string): Promise<Activity[]> {
    return db.select().from(activities).where(eq(activities.userId, userId)).orderBy(desc(activities.createdAt));
  }

  async getActivitiesFeed(userIds: string[]): Promise<Activity[]> {
    if (userIds.length === 0) return [];
    return db.select().from(activities).where(inArray(activities.userId, userIds)).orderBy(desc(activities.createdAt));
  }

  async searchUsers(query: string): Promise<User[]> {
    return db.select().from(users).where(ilike(users.username, `%${query}%`));
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }

  async createNotification(notif: Omit<Notification, "id" | "read" | "createdAt">): Promise<Notification> {
    const [created] = await db.insert(notifications).values({
      id: randomUUID(),
      ...notif,
      read: false,
      createdAt: new Date().toISOString(),
    }).returning();
    return created;
  }

  async markNotificationRead(id: string): Promise<void> {
    await db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id));
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await db.update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const [result] = await db.select({ count: count() })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
    return result?.count ?? 0;
  }
}
