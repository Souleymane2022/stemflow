import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

const joinRoomSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["apprenant", "challenger", "mentor", "moderateur"]).optional().default("apprenant"),
});

const updateMissionProgressSchema = z.object({
  progress: z.number().min(0),
});

const updateUserProfileSchema = z.object({
  preferredLanguage: z.enum(["fr", "en"]).optional(),
  educationLevel: z.enum(["college", "lycee", "universite", "autodidacte"]).optional(),
  interests: z.array(z.enum(["science", "technology", "engineering", "mathematics"])).optional(),
  level: z.enum(["curieux", "explorateur", "analyste", "challenger", "mentor"]).optional(),
  xp: z.number().optional(),
  streak: z.number().optional(),
  onboardingCompleted: z.boolean().optional(),
});

const videoEngagementSchema = z.object({
  userId: z.string().min(1),
  contentId: z.string().min(1),
  watchTimeSeconds: z.number().min(0),
  completionPercentage: z.number().min(0).max(100),
  liked: z.boolean().optional().default(false),
  commented: z.boolean().optional().default(false),
  saved: z.boolean().optional().default(false),
  shared: z.boolean().optional().default(false),
  rewatchCount: z.number().optional().default(0),
});

const createContentSchema = z.object({
  contentType: z.enum(["video", "text_post", "image_post", "quiz", "infographic"]),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  videoUrl: z.string().optional(),
  textContent: z.string().optional(),
  imageUrl: z.string().optional(),
  category: z.enum(["science", "technology", "engineering", "mathematics"]),
  difficulty: z.enum(["debutant", "intermediaire", "avance"]),
  tags: z.array(z.string()).default([]),
  xpReward: z.number().default(25),
  authorId: z.string().min(1),
  authorName: z.string().min(1),
  authorAvatar: z.string().optional(),
  roomId: z.string().optional(),
  roomName: z.string().optional(),
  questions: z.array(z.object({
    question: z.string().min(1),
    options: z.array(z.string()).min(2).max(6),
    correctOptionIndex: z.number(),
    explanation: z.string().optional(),
  })).optional(),
});

const submitQuizSchema = z.object({
  userId: z.string().min(1),
  answers: z.array(z.number()),
});

const createCommentSchema = z.object({
  userId: z.string().min(1),
  authorName: z.string().min(1),
  text: z.string().min(1).max(500),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/feed/:category", async (req, res) => {
    try {
      const category = req.params.category;
      let content;
      if (category && category !== "all") {
        content = await storage.getContentByCategory(category);
      } else {
        content = await storage.getAllContent();
      }
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  app.get("/api/content/:id", async (req, res) => {
    try {
      const content = await storage.getContent(req.params.id);
      if (!content) {
        return res.status(404).json({ error: "Content not found" });
      }
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  app.post("/api/content", async (req, res) => {
    try {
      const validation = createContentSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid request body", details: validation.error.errors });
      }
      const { questions, ...contentData } = validation.data;
      const content = await storage.createContent({ ...contentData, createdAt: new Date().toISOString() });

      if (contentData.contentType === "quiz" && questions && questions.length > 0) {
        const quizQuestions = questions.map((q, i) => ({
          contentId: content.id,
          question: q.question,
          options: q.options,
          correctOptionIndex: q.correctOptionIndex,
          explanation: q.explanation,
          order: i,
        }));
        await storage.createQuizQuestions(quizQuestions);
      }

      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to create content" });
    }
  });

  app.post("/api/content/:id/like", async (req, res) => {
    try {
      await storage.likeContent(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to like content" });
    }
  });

  app.get("/api/content/:id/comments", async (req, res) => {
    try {
      const comments = await storage.getComments(req.params.id);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.post("/api/content/:id/comments", async (req, res) => {
    try {
      const validation = createCommentSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid request body", details: validation.error.errors });
      }
      const comment = await storage.createComment({
        ...validation.data,
        contentId: req.params.id,
        createdAt: new Date().toISOString(),
      });
      res.json(comment);
    } catch (error) {
      res.status(500).json({ error: "Failed to create comment" });
    }
  });

  app.get("/api/content/:id/quiz", async (req, res) => {
    try {
      const questions = await storage.getQuizQuestions(req.params.id);
      res.json(questions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quiz questions" });
    }
  });

  app.post("/api/content/:id/quiz/submit", async (req, res) => {
    try {
      const validation = submitQuizSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid request body", details: validation.error.errors });
      }
      const questions = await storage.getQuizQuestions(req.params.id);
      if (questions.length === 0) {
        return res.status(404).json({ error: "Quiz not found" });
      }

      let score = 0;
      validation.data.answers.forEach((answer, i) => {
        if (i < questions.length && questions[i].correctOptionIndex === answer) {
          score++;
        }
      });

      const attempt = await storage.submitQuizAttempt({
        userId: validation.data.userId,
        contentId: req.params.id,
        answers: validation.data.answers,
        score,
        totalQuestions: questions.length,
      });

      res.json({
        ...attempt,
        questions: questions.map((q, i) => ({
          ...q,
          userAnswer: validation.data.answers[i],
          isCorrect: validation.data.answers[i] === q.correctOptionIndex,
        })),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit quiz" });
    }
  });

  app.get("/api/content/:id/quiz/stats", async (req, res) => {
    try {
      const attempts = await storage.getQuizAttempts(req.params.id);
      const totalAttempts = attempts.length;
      const avgScore = totalAttempts > 0
        ? attempts.reduce((sum, a) => sum + (a.score / a.totalQuestions) * 100, 0) / totalAttempts
        : 0;
      const perfectScores = attempts.filter((a) => a.score === a.totalQuestions).length;

      res.json({
        totalAttempts,
        averageScore: Math.round(avgScore),
        perfectScores,
        successRate: totalAttempts > 0 ? Math.round((attempts.filter((a) => a.score >= a.totalQuestions * 0.5).length / totalAttempts) * 100) : 0,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quiz stats" });
    }
  });

  app.get("/api/badges", async (req, res) => {
    try {
      const badges = await storage.getAllBadges();
      res.json(badges);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch badges" });
    }
  });

  app.get("/api/users/:id/badges", async (req, res) => {
    try {
      const userBadges = await storage.getUserBadges(req.params.id);
      const allBadges = await storage.getAllBadges();
      const result = allBadges.map((badge) => ({
        ...badge,
        earned: userBadges.some((ub) => ub.badgeId === badge.id),
        earnedAt: userBadges.find((ub) => ub.badgeId === badge.id)?.earnedAt,
      }));
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user badges" });
    }
  });

  app.get("/api/leaderboard/:category", async (req, res) => {
    try {
      const category = req.params.category === "all" ? undefined : req.params.category;
      const leaderboard = await storage.getLeaderboard(category);
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  app.get("/api/rooms", async (req, res) => {
    try {
      const rooms = await storage.getAllRooms();
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rooms" });
    }
  });

  app.get("/api/rooms/:id", async (req, res) => {
    try {
      const room = await storage.getRoom(req.params.id);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }
      res.json(room);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch room" });
    }
  });

  app.get("/api/rooms/:id/content", async (req, res) => {
    try {
      const content = await storage.getContentByRoom(req.params.id);
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch room content" });
    }
  });

  app.post("/api/rooms/:id/join", async (req, res) => {
    try {
      const validation = joinRoomSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid request body", details: validation.error.errors });
      }
      const { userId, role } = validation.data;
      const member = await storage.joinRoom(req.params.id, userId, role);
      res.json(member);
    } catch (error) {
      res.status(500).json({ error: "Failed to join room" });
    }
  });

  app.get("/api/missions", async (req, res) => {
    try {
      const userId = req.query.userId as string || "default";
      const missions = await storage.getUserMissions(userId);
      res.json(missions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch missions" });
    }
  });

  app.patch("/api/missions/:id/progress", async (req, res) => {
    try {
      const validation = updateMissionProgressSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid request body", details: validation.error.errors });
      }
      const { progress } = validation.data;
      const mission = await storage.updateMissionProgress(req.params.id, progress);
      if (!mission) {
        return res.status(404).json({ error: "Mission not found" });
      }
      res.json(mission);
    } catch (error) {
      res.status(500).json({ error: "Failed to update mission" });
    }
  });

  app.post("/api/missions/:id/complete", async (req, res) => {
    try {
      const mission = await storage.completeMission(req.params.id);
      if (!mission) {
        return res.status(404).json({ error: "Mission not found" });
      }
      res.json(mission);
    } catch (error) {
      res.status(500).json({ error: "Failed to complete mission" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const validation = updateUserProfileSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid request body", details: validation.error.errors });
      }
      const user = await storage.updateUserProfile(req.params.id, validation.data);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.post("/api/engagement/video", async (req, res) => {
    try {
      const validation = videoEngagementSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid request body", details: validation.error.errors });
      }
      const engagement = await storage.trackVideoEngagement(validation.data);
      res.json(engagement);
    } catch (error) {
      res.status(500).json({ error: "Failed to track engagement" });
    }
  });

  return httpServer;
}
