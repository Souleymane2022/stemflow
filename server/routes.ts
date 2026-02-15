import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { registerSchema, loginSchema, activationSchema, forgotPasswordSchema, resetPasswordSchema } from "@shared/schema";
import { randomBytes, createHash } from "crypto";
import { sendPasswordResetEmail } from "./email";
import {
  analyzeContent,
  analyzeDiscussionQuality,
  getSmartRecommendations,
  analyzeUserProfile,
  chatWithAssistant,
  calculateLearnScore,
} from "./ai";

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Non authentifié" });
  }
  next();
}

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
  text: z.string().min(1).max(500),
  parentId: z.string().optional(),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/auth/register", async (req, res) => {
    try {
      const validation = registerSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Données invalides", details: validation.error.errors });
      }

      const { username, email, password } = validation.data;

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(409).json({ error: "Cet email est déjà utilisé" });
      }

      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(409).json({ error: "Ce nom d'utilisateur est déjà pris" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await storage.createUser({ username, email, password: hashedPassword });

      const { password: _, activationCode, ...safeUser } = user;
      res.status(201).json({ ...safeUser, activationCode, needsActivation: true });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de l'inscription" });
    }
  });

  app.post("/api/auth/activate", async (req, res) => {
    try {
      const validation = activationSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Données invalides", details: validation.error.errors });
      }

      const { email, code } = validation.data;
      const user = await storage.activateUser(email, code);
      if (!user) {
        return res.status(400).json({ error: "Code d'activation invalide" });
      }

      req.session.userId = user.id;

      const { password: _, activationCode: __, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de l'activation" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Données invalides", details: validation.error.errors });
      }

      const { email, password } = validation.data;
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Email ou mot de passe incorrect" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Email ou mot de passe incorrect" });
      }

      if (!user.isActive) {
        return res.status(403).json({ error: "Compte non activé. Veuillez entrer votre code d'activation.", needsActivation: true, email: user.email });
      }

      req.session.userId = user.id;

      const { password: _, activationCode: __, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la connexion" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Erreur lors de la déconnexion" });
      }
      res.clearCookie("connect.sid");
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Non authentifié" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ error: "Utilisateur non trouvé" });
    }

    const { password: _, activationCode: __, ...safeUser } = user;
    res.json(safeUser);
  });

  const resetRateLimit = new Map<string, number>();

  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const validation = forgotPasswordSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Email invalide" });
      }

      const { email } = validation.data;

      const lastRequest = resetRateLimit.get(email.toLowerCase());
      if (lastRequest && Date.now() - lastRequest < 60000) {
        return res.json({ message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé." });
      }
      resetRateLimit.set(email.toLowerCase(), Date.now());

      const user = await storage.getUserByEmail(email);
      if (user) {
        const token = randomBytes(32).toString("hex");
        const hashedToken = createHash("sha256").update(token).digest("hex");
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await storage.createPasswordResetToken(user.id, hashedToken, expiresAt);

        try {
          await sendPasswordResetEmail(email, token, user.username);
        } catch (emailError) {
          console.error("Email send error:", emailError);
        }
      }

      res.json({ message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé." });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Erreur lors de la demande" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const validation = resetPasswordSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Données invalides", details: validation.error.errors });
      }

      const { token, password } = validation.data;
      const hashedToken = createHash("sha256").update(token).digest("hex");
      const resetToken = await storage.getPasswordResetToken(hashedToken);

      if (!resetToken) {
        return res.status(400).json({ error: "Lien invalide ou expiré. Veuillez faire une nouvelle demande." });
      }

      if (new Date() > resetToken.expiresAt) {
        await storage.markTokenUsed(resetToken.id);
        return res.status(400).json({ error: "Ce lien a expiré. Veuillez faire une nouvelle demande." });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      await storage.updateUserPassword(resetToken.userId, hashedPassword);
      await storage.markTokenUsed(resetToken.id);

      await storage.deleteExpiredTokens();

      res.json({ message: "Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter." });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Erreur lors de la réinitialisation" });
    }
  });

  app.get("/api/feed", requireAuth, async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      let content;
      if (category && category !== "all") {
        content = await storage.getContentByCategory(category);
      } else {
        content = await storage.getAllContent();
      }

      const userLikes = await storage.getUserLikes(req.session.userId!);
      const contentWithLikes = content.map((c) => ({
        ...c,
        userLiked: userLikes.includes(c.id),
      }));

      res.json(contentWithLikes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch feed" });
    }
  });

  app.get("/api/feed/:category", requireAuth, async (req, res) => {
    try {
      const category = req.params.category as string;
      let content;
      if (category && category !== "all") {
        content = await storage.getContentByCategory(category);
      } else {
        content = await storage.getAllContent();
      }

      const userLikes = await storage.getUserLikes(req.session.userId!);
      const contentWithLikes = content.map((c) => ({
        ...c,
        userLiked: userLikes.includes(c.id),
      }));

      res.json(contentWithLikes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  app.get("/api/content/:id", requireAuth, async (req, res) => {
    try {
      const content = await storage.getContent(req.params.id as string);
      if (!content) {
        return res.status(404).json({ error: "Content not found" });
      }
      const userLiked = await storage.hasUserLiked(content.id, req.session.userId!);
      res.json({ ...content, userLiked });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  app.post("/api/content", requireAuth, async (req, res) => {
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

      await storage.createActivity({
        userId: contentData.authorId,
        username: contentData.authorName,
        activityType: "content_created",
        description: `a publié un nouveau contenu : ${content.title}`,
      });

      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to create content" });
    }
  });

  app.post("/api/content/:id/like", requireAuth, async (req, res) => {
    try {
      const result = await storage.toggleLike(req.params.id as string, req.session.userId!);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle like" });
    }
  });

  app.post("/api/content/:id/share", requireAuth, async (req, res) => {
    try {
      await storage.shareContent(req.params.id as string);
      const content = await storage.getContent(req.params.id as string);
      res.json({ success: true, shares: content?.shares ?? 0 });
    } catch (error) {
      res.status(500).json({ error: "Failed to share content" });
    }
  });

  app.get("/api/content/:id/comments", requireAuth, async (req, res) => {
    try {
      const comments = await storage.getComments(req.params.id as string);
      const userId = req.session.userId!;
      const commentsWithMeta = await Promise.all(
        comments.map(async (c) => {
          const replies = await storage.getReplies(c.id);
          return {
            ...c,
            userLiked: await storage.hasUserLikedComment(c.id, userId),
            replyCount: replies.length,
          };
        })
      );
      res.json(commentsWithMeta);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.post("/api/content/:id/comments", requireAuth, async (req, res) => {
    try {
      const validation = createCommentSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid request body", details: validation.error.errors });
      }
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      const comment = await storage.createComment({
        text: validation.data.text,
        userId: user.id,
        authorName: user.username,
        contentId: req.params.id as string,
        parentId: validation.data.parentId || null,
        createdAt: new Date().toISOString(),
      });
      res.json(comment);
    } catch (error) {
      res.status(500).json({ error: "Failed to create comment" });
    }
  });

  app.get("/api/comments/:id/replies", requireAuth, async (req, res) => {
    try {
      const replies = await storage.getReplies(req.params.id as string);
      const userId = req.session.userId!;
      const repliesWithLikes = await Promise.all(
        replies.map(async (r) => ({
          ...r,
          userLiked: await storage.hasUserLikedComment(r.id, userId),
        }))
      );
      res.json(repliesWithLikes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch replies" });
    }
  });

  app.post("/api/comments/:id/like", requireAuth, async (req, res) => {
    try {
      const result = await storage.toggleCommentLike(req.params.id as string, req.session.userId!);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to like comment" });
    }
  });

  app.delete("/api/comments/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteComment(req.params.id as string, req.session.userId!);
      if (!deleted) {
        return res.status(403).json({ error: "Impossible de supprimer ce commentaire" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete comment" });
    }
  });

  app.get("/api/content/:id/quiz", requireAuth, async (req, res) => {
    try {
      const questions = await storage.getQuizQuestions(req.params.id as string);
      res.json(questions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quiz questions" });
    }
  });

  app.post("/api/content/:id/quiz/submit", requireAuth, async (req, res) => {
    try {
      const validation = submitQuizSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid request body", details: validation.error.errors });
      }
      const questions = await storage.getQuizQuestions(req.params.id as string);
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
        contentId: req.params.id as string,
        answers: validation.data.answers,
        score,
        totalQuestions: questions.length,
      });

      const quizUser = await storage.getUser(validation.data.userId);
      const quizContent = await storage.getContent(req.params.id as string);
      if (quizUser) {
        await storage.createActivity({
          userId: quizUser.id,
          username: quizUser.username,
          activityType: "quiz_completed",
          description: `a complété un quiz : ${quizContent?.title || "Quiz"} (${score}/${questions.length})`,
        });
      }

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

  app.get("/api/content/:id/quiz/stats", requireAuth, async (req, res) => {
    try {
      const attempts = await storage.getQuizAttempts(req.params.id as string);
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

  app.get("/api/badges", requireAuth, async (req, res) => {
    try {
      const badges = await storage.getAllBadges();
      res.json(badges);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch badges" });
    }
  });

  app.get("/api/user-badges", requireAuth, async (req, res) => {
    try {
      const userBadges = await storage.getUserBadges(req.session.userId!);
      res.json(userBadges);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user badges" });
    }
  });

  app.get("/api/users/:id/badges", requireAuth, async (req, res) => {
    try {
      const userBadges = await storage.getUserBadges(req.params.id as string);
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

  app.get("/api/leaderboard/:category", requireAuth, async (req, res) => {
    try {
      const category = (req.params.category as string) === "all" ? undefined : (req.params.category as string);
      const leaderboard = await storage.getLeaderboard(category);
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  app.get("/api/rooms", requireAuth, async (req, res) => {
    try {
      const rooms = await storage.getAllRooms();
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rooms" });
    }
  });

  app.get("/api/rooms/:id", requireAuth, async (req, res) => {
    try {
      const room = await storage.getRoom(req.params.id as string);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }
      res.json(room);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch room" });
    }
  });

  app.get("/api/rooms/:id/posts", requireAuth, async (req, res) => {
    try {
      const posts = await storage.getRoomPosts(req.params.id as string);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch room posts" });
    }
  });

  app.post("/api/rooms/:id/posts", requireAuth, async (req, res) => {
    try {
      const textSchema = z.object({ text: z.string().min(1).max(1000) });
      const validation = textSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid request body", details: validation.error.errors });
      }
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      const post = await storage.createRoomPost({
        roomId: req.params.id as string,
        userId: user.id,
        username: user.username,
        text: validation.data.text,
      });
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to create room post" });
    }
  });

  app.post("/api/room-posts/:id/like", requireAuth, async (req, res) => {
    try {
      const result = await storage.likeRoomPost(req.params.id as string, req.session.userId!);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to like room post" });
    }
  });

  app.get("/api/rooms/:id/content", requireAuth, async (req, res) => {
    try {
      const content = await storage.getContentByRoom(req.params.id as string);
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch room content" });
    }
  });

  app.post("/api/rooms/:id/join", requireAuth, async (req, res) => {
    try {
      const validation = joinRoomSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid request body", details: validation.error.errors });
      }
      const { userId, role } = validation.data;
      const member = await storage.joinRoom(req.params.id as string, userId, role);
      const joinUser = await storage.getUser(userId);
      const joinRoom = await storage.getRoom(req.params.id as string);
      if (joinUser && joinRoom) {
        await storage.createActivity({
          userId: joinUser.id,
          username: joinUser.username,
          activityType: "room_joined",
          description: `a rejoint le salon "${joinRoom.name}"`,
        });
      }
      res.json(member);
    } catch (error) {
      res.status(500).json({ error: "Failed to join room" });
    }
  });

  app.get("/api/missions", requireAuth, async (req, res) => {
    try {
      const missions = await storage.getUserMissions(req.session.userId!);
      res.json(missions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch missions" });
    }
  });

  app.patch("/api/missions/:id/progress", requireAuth, async (req, res) => {
    try {
      const validation = updateMissionProgressSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid request body", details: validation.error.errors });
      }
      const { progress } = validation.data;
      const mission = await storage.updateMissionProgress(req.params.id as string, progress);
      if (!mission) {
        return res.status(404).json({ error: "Mission not found" });
      }
      res.json(mission);
    } catch (error) {
      res.status(500).json({ error: "Failed to update mission" });
    }
  });

  app.post("/api/missions/:id/complete", requireAuth, async (req, res) => {
    try {
      const mission = await storage.completeMission(req.params.id as string);
      if (!mission) {
        return res.status(404).json({ error: "Mission not found" });
      }
      res.json(mission);
    } catch (error) {
      res.status(500).json({ error: "Failed to complete mission" });
    }
  });

  app.get("/api/users/search", requireAuth, async (req, res) => {
    try {
      const q = (req.query.q as string) || "";
      if (!q.trim()) {
        return res.json([]);
      }
      const users = await storage.searchUsers(q);
      const safeUsers = users.map(({ password: _, activationCode: __, email: ___, ...u }) => u);
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ error: "Failed to search users" });
    }
  });

  app.get("/api/activity-feed", requireAuth, async (req, res) => {
    try {
      const following = await storage.getFollowing(req.session.userId!);
      const activities = await storage.getActivitiesFeed(following);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activity feed" });
    }
  });

  app.get("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id as string);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password: _, activationCode: __, ...safeUser } = user;
      const counts = await storage.getFollowCounts(req.params.id as string);
      res.json({ ...safeUser, ...counts });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.post("/api/users/:id/follow", requireAuth, async (req, res) => {
    try {
      const followerId = req.session.userId!;
      const followingId = req.params.id as string;
      if (followerId === followingId) {
        return res.status(400).json({ error: "Impossible de se suivre soi-meme" });
      }
      await storage.followUser(followerId, followingId);
      const follower = await storage.getUser(followerId);
      const target = await storage.getUser(followingId);
      if (follower && target) {
        await storage.createActivity({
          userId: followerId,
          username: follower.username,
          activityType: "room_joined",
          description: `suit maintenant ${target.username}`,
        });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to follow user" });
    }
  });

  app.delete("/api/users/:id/follow", requireAuth, async (req, res) => {
    try {
      await storage.unfollowUser(req.session.userId!, req.params.id as string);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to unfollow user" });
    }
  });

  app.get("/api/users/:id/followers", requireAuth, async (req, res) => {
    try {
      const followerIds = await storage.getFollowers(req.params.id as string);
      const counts = await storage.getFollowCounts(req.params.id as string);
      const profiles = await Promise.all(
        followerIds.map(async (id) => {
          const user = await storage.getUser(id);
          if (!user) return null;
          const { password: _, activationCode: __, email: ___, ...safe } = user;
          return safe;
        })
      );
      res.json({ count: counts.followers, users: profiles.filter(Boolean) });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch followers" });
    }
  });

  app.get("/api/users/:id/following", requireAuth, async (req, res) => {
    try {
      const followingIds = await storage.getFollowing(req.params.id as string);
      const counts = await storage.getFollowCounts(req.params.id as string);
      const profiles = await Promise.all(
        followingIds.map(async (id) => {
          const user = await storage.getUser(id);
          if (!user) return null;
          const { password: _, activationCode: __, email: ___, ...safe } = user;
          return safe;
        })
      );
      res.json({ count: counts.following, users: profiles.filter(Boolean) });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch following" });
    }
  });

  app.get("/api/users/:id/is-following", requireAuth, async (req, res) => {
    try {
      const isFollowing = await storage.isFollowing(req.session.userId!, req.params.id as string);
      res.json({ isFollowing });
    } catch (error) {
      res.status(500).json({ error: "Failed to check follow status" });
    }
  });

  app.get("/api/users/:id/activities", requireAuth, async (req, res) => {
    try {
      const activities = await storage.getActivitiesByUser(req.params.id as string);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  app.patch("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const validation = updateUserProfileSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid request body", details: validation.error.errors });
      }
      const user = await storage.updateUserProfile(req.params.id as string, validation.data);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.post("/api/engagement/video", requireAuth, async (req, res) => {
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

  app.post("/api/ai/analyze-content", requireAuth, async (req, res) => {
    try {
      const { title, content, contentType } = req.body;
      if (!title || !content) {
        return res.status(400).json({ error: "Title and content are required" });
      }
      const analysis = await analyzeContent(title, content, contentType || "text_post");
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ error: "Failed to analyze content" });
    }
  });

  app.post("/api/ai/analyze-comment", requireAuth, async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }
      const quality = await analyzeDiscussionQuality(text);
      res.json(quality);
    } catch (error) {
      res.status(500).json({ error: "Failed to analyze comment" });
    }
  });

  app.post("/api/ai/recommendations", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      let { interests, level, recentInteractions } = req.body;

      if (!interests || !level) {
        const user = await storage.getUser(userId);
        if (user) {
          interests = interests || user.interests || [];
          level = level || user.level || "curieux";
        }
      }

      if (!recentInteractions || recentInteractions.length === 0) {
        recentInteractions = await storage.getUserLikedCategories(userId, 20);
      }

      const recommendations = await getSmartRecommendations(
        interests || [],
        level || "curieux",
        recentInteractions || []
      );

      const allContent = await storage.getAllContent();
      const weights = recommendations.weights;

      const scored = allContent.map((c) => ({
        ...c,
        recommendationScore: (weights[c.category] || 0.25) * 100,
      }));
      scored.sort((a, b) => b.recommendationScore - a.recommendationScore);

      res.json({
        contents: scored.slice(0, 20),
        explanation: recommendations.explanation,
        weights: recommendations.weights,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get recommendations" });
    }
  });

  app.post("/api/ai/smart-profile", requireAuth, async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const user = await storage.getUser(userId);
      const userContent = await storage.getContentByAuthor(userId);
      const quizAttempts = await storage.getUserQuizAttempts(userId);

      const engagedFromDB = await storage.getUserEngagedCategories(userId);
      const authoredCategories = userContent.map((c) => c.category);
      const categoriesEngaged = Array.from(new Set([...engagedFromDB, ...authoredCategories]));
      const quizScores = quizAttempts.map((a) =>
        Math.round((a.score / a.totalQuestions) * 100)
      );

      const profileData = await analyzeUserProfile({
        xp: user?.xp || 0,
        contentCount: userContent.length,
        quizScores,
        interests: user?.interests || [],
        level: user?.level || "curieux",
        categoriesEngaged,
      });

      res.json(profileData);
    } catch (error) {
      res.status(500).json({ error: "Failed to analyze profile" });
    }
  });

  app.post("/api/ai/assistant", requireAuth, async (req, res) => {
    try {
      const { messages, context } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required" });
      }
      const response = await chatWithAssistant(messages, context);
      res.json({ response });
    } catch (error) {
      res.status(500).json({ error: "Failed to get assistant response" });
    }
  });

  app.get("/api/ai/learnscore/:contentId", requireAuth, async (req, res) => {
    try {
      const content = await storage.getContent(req.params.contentId as string);
      if (!content) {
        return res.status(404).json({ error: "Content not found" });
      }

      const quizAttempts = await storage.getQuizAttempts(req.params.contentId as string);
      const avgQuizScore = quizAttempts.length > 0
        ? quizAttempts.reduce((sum, a) => sum + (a.score / a.totalQuestions) * 100, 0) / quizAttempts.length
        : 0;

      const textForAnalysis = content.textContent || content.description || content.title;
      const analysis = await analyzeContent(content.title, textForAnalysis, content.contentType);

      const learnScore = calculateLearnScore({
        likes: content.likes ?? 0,
        comments: content.comments ?? 0,
        shares: content.shares ?? 0,
        quizAttempts: quizAttempts.length,
        avgQuizScore,
        aiQualityScore: analysis.learnScore,
      });

      res.json({
        learnScore,
        qualityIndicators: analysis.qualityIndicators,
        pedagogicalFeedback: analysis.pedagogicalFeedback,
        aiAnalysis: analysis,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to calculate LearnScore" });
    }
  });

  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      const notifications = await storage.getNotifications(req.session.userId!);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.get("/api/notifications/unread-count", requireAuth, async (req, res) => {
    try {
      const count = await storage.getUnreadNotificationCount(req.session.userId!);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch unread count" });
    }
  });

  app.patch("/api/notifications/:id/read", requireAuth, async (req, res) => {
    try {
      await storage.markNotificationRead(req.params.id as string);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark notification read" });
    }
  });

  app.patch("/api/notifications/read-all", requireAuth, async (req, res) => {
    try {
      await storage.markAllNotificationsRead(req.session.userId!);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark all notifications read" });
    }
  });

  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const user = await storage.getUser(userId);
      const userContent = await storage.getContentByAuthor(userId);
      const quizAttempts = await storage.getUserQuizAttempts(userId);
      const allContent = await storage.getAllContent();
      const missions = await storage.getUserMissions(userId);
      const badges = await storage.getUserBadges(userId);

      const completedMissions = missions.filter(m => m.completed).length;
      const totalQuizzes = quizAttempts.length;
      const avgQuizScore = totalQuizzes > 0
        ? Math.round(quizAttempts.reduce((sum, a) => sum + (a.score / a.totalQuestions) * 100, 0) / totalQuizzes)
        : 0;
      const perfectQuizzes = quizAttempts.filter(a => a.score === a.totalQuestions).length;

      const categoryBreakdown = { science: 0, technology: 0, engineering: 0, mathematics: 0 };
      const contentMap = new Map(allContent.map(c => [c.id, c]));
      const engagedContentIds = new Set<string>();

      const userLikedCategories = await storage.getUserLikedCategories(userId, 200);
      userLikedCategories.forEach(lc => {
        const cat = lc.category as keyof typeof categoryBreakdown;
        if (categoryBreakdown[cat] !== undefined) {
          categoryBreakdown[cat]++;
        }
      });
      quizAttempts.forEach(a => {
        if (!engagedContentIds.has(a.contentId)) {
          engagedContentIds.add(a.contentId);
          const content = contentMap.get(a.contentId);
          if (content) {
            const cat = content.category as keyof typeof categoryBreakdown;
            if (categoryBreakdown[cat] !== undefined) {
              categoryBreakdown[cat]++;
            }
          }
        }
      });
      userContent.forEach(c => {
        const cat = c.category as keyof typeof categoryBreakdown;
        if (categoryBreakdown[cat] !== undefined) {
          categoryBreakdown[cat]++;
        }
      });

      res.json({
        xp: user?.xp || 0,
        streak: user?.streak || 0,
        level: user?.level || "curieux",
        contentCreated: userContent.length,
        totalQuizzes,
        avgQuizScore,
        perfectQuizzes,
        completedMissions,
        totalMissions: missions.length,
        badgesEarned: badges.length,
        totalContentAvailable: allContent.length,
        categoryBreakdown,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  return httpServer;
}
