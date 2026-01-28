import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

// Validation schemas
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

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Feed - Get all content or filter by category
  app.get("/api/feed", async (req, res) => {
    try {
      const { category } = req.query;
      let content;
      
      if (category && category !== "all") {
        content = await storage.getContentByCategory(category as string);
      } else {
        content = await storage.getAllContent();
      }
      
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  // Get single content
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

  // Like content
  app.post("/api/content/:id/like", async (req, res) => {
    try {
      await storage.likeContent(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to like content" });
    }
  });

  // Rooms - Get all rooms
  app.get("/api/rooms", async (req, res) => {
    try {
      const rooms = await storage.getAllRooms();
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rooms" });
    }
  });

  // Get single room
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

  // Get room content
  app.get("/api/rooms/:id/content", async (req, res) => {
    try {
      const content = await storage.getContentByRoom(req.params.id);
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch room content" });
    }
  });

  // Join room
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

  // Missions - Get all missions for user
  app.get("/api/missions", async (req, res) => {
    try {
      const userId = req.query.userId as string || "default";
      const missions = await storage.getUserMissions(userId);
      res.json(missions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch missions" });
    }
  });

  // Update mission progress
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

  // Complete mission
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

  // User profile
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

  // Update user profile
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

  // Track video engagement
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
