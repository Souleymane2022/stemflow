import { randomUUID } from "crypto";
import type { 
  User, InsertUser, Content, InsertContent, 
  Room, InsertRoom, Mission, InsertMission,
  RoomMember, EngagementStats, VideoEngagement 
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(id: string, profile: Partial<User>): Promise<User | undefined>;

  // Content
  getAllContent(): Promise<Content[]>;
  getContentByCategory(category: string): Promise<Content[]>;
  getContentByRoom(roomId: string): Promise<Content[]>;
  getContent(id: string): Promise<Content | undefined>;
  createContent(content: InsertContent): Promise<Content>;
  likeContent(id: string): Promise<void>;

  // Rooms
  getAllRooms(): Promise<Room[]>;
  getRoom(id: string): Promise<Room | undefined>;
  createRoom(room: InsertRoom): Promise<Room>;
  joinRoom(roomId: string, userId: string, role: string): Promise<RoomMember>;

  // Missions
  getUserMissions(userId: string): Promise<Mission[]>;
  getMission(id: string): Promise<Mission | undefined>;
  createMission(mission: InsertMission): Promise<Mission>;
  updateMissionProgress(id: string, progress: number): Promise<Mission | undefined>;
  completeMission(id: string): Promise<Mission | undefined>;

  // Engagement
  getEngagementStats(userId: string): Promise<EngagementStats | undefined>;
  trackVideoEngagement(engagement: Omit<VideoEngagement, 'id'>): Promise<VideoEngagement>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private contents: Map<string, Content>;
  private rooms: Map<string, Room>;
  private roomMembers: Map<string, RoomMember>;
  private missions: Map<string, Mission>;
  private engagementStats: Map<string, EngagementStats>;
  private videoEngagements: Map<string, VideoEngagement>;

  constructor() {
    this.users = new Map();
    this.contents = new Map();
    this.rooms = new Map();
    this.roomMembers = new Map();
    this.missions = new Map();
    this.engagementStats = new Map();
    this.videoEngagements = new Map();

    this.seedData();
  }

  private seedData() {
    // Seed Rooms
    const rooms: Room[] = [
      {
        id: "room-1",
        name: "Labo Science",
        description: "Explore les mystères de la science avec des expériences passionnantes",
        type: "public",
        category: "science",
        memberCount: 234,
        createdAt: new Date().toISOString(),
      },
      {
        id: "room-2",
        name: "Tech Makers",
        description: "Construis des projets tech innovants avec la communauté",
        type: "public",
        category: "technology",
        memberCount: 189,
        createdAt: new Date().toISOString(),
      },
      {
        id: "room-3",
        name: "Ingénieurs en herbe",
        description: "Conçois et crée des solutions d'ingénierie",
        type: "public",
        category: "engineering",
        memberCount: 156,
        createdAt: new Date().toISOString(),
      },
      {
        id: "room-4",
        name: "Mathématiques Fun",
        description: "Les maths peuvent être amusantes ! Découvre-le ici",
        type: "public",
        category: "mathematics",
        memberCount: 203,
        createdAt: new Date().toISOString(),
      },
      {
        id: "room-5",
        name: "Robotique Club",
        description: "Apprends à construire et programmer des robots",
        type: "public",
        category: "technology",
        memberCount: 142,
        createdAt: new Date().toISOString(),
      },
      {
        id: "room-6",
        name: "Astronomie",
        description: "Explore l'univers et ses mystères",
        type: "public",
        category: "science",
        memberCount: 178,
        createdAt: new Date().toISOString(),
      },
    ];

    rooms.forEach((room) => this.rooms.set(room.id, room));

    // Seed Content
    const contents: Content[] = [
      {
        id: "content-1",
        contentType: "video",
        title: "Comment fonctionne un trou noir ?",
        description: "Découvre les secrets des trous noirs et leur impact sur l'univers",
        videoUrl: "https://example.com/video1",
        roomId: "room-1",
        roomName: "Labo Science",
        category: "science",
        difficulty: "intermediaire",
        xpReward: 35,
        authorId: "author-1",
        authorName: "Dr. Marie Curie",
        likes: 156,
        comments: 23,
        shares: 12,
        createdAt: new Date().toISOString(),
      },
      {
        id: "content-2",
        contentType: "text_post",
        title: "L'intelligence artificielle expliquée simplement",
        description: "Comprends les bases de l'IA en 5 minutes",
        textContent: "L'intelligence artificielle est la capacité d'une machine à imiter des comportements humains intelligents...",
        roomId: "room-2",
        roomName: "Tech Makers",
        category: "technology",
        difficulty: "debutant",
        xpReward: 25,
        authorId: "author-2",
        authorName: "Alan Turing",
        likes: 89,
        comments: 15,
        shares: 8,
        createdAt: new Date().toISOString(),
      },
      {
        id: "content-3",
        contentType: "quiz",
        title: "Quiz : Les équations du second degré",
        description: "Teste tes connaissances sur les équations quadratiques",
        roomId: "room-4",
        roomName: "Mathématiques Fun",
        category: "mathematics",
        difficulty: "intermediaire",
        xpReward: 50,
        authorId: "author-3",
        authorName: "Pierre Fermat",
        likes: 67,
        comments: 8,
        shares: 5,
        createdAt: new Date().toISOString(),
      },
      {
        id: "content-4",
        contentType: "infographic",
        title: "Les étapes de la construction d'un pont",
        description: "Infographie interactive sur l'ingénierie des ponts",
        roomId: "room-3",
        roomName: "Ingénieurs en herbe",
        category: "engineering",
        difficulty: "debutant",
        xpReward: 30,
        authorId: "author-4",
        authorName: "Gustave Eiffel",
        likes: 112,
        comments: 19,
        shares: 14,
        createdAt: new Date().toISOString(),
      },
      {
        id: "content-5",
        contentType: "video",
        title: "Programmer ton premier robot",
        description: "Apprends à coder un robot simple avec Arduino",
        videoUrl: "https://example.com/video2",
        roomId: "room-5",
        roomName: "Robotique Club",
        category: "technology",
        difficulty: "intermediaire",
        xpReward: 40,
        authorId: "author-5",
        authorName: "Ada Lovelace",
        likes: 203,
        comments: 45,
        shares: 28,
        createdAt: new Date().toISOString(),
      },
      {
        id: "content-6",
        contentType: "image_post",
        title: "Les planètes du système solaire",
        description: "Une vue magnifique de notre système solaire",
        imageUrl: "https://example.com/image1",
        roomId: "room-6",
        roomName: "Astronomie",
        category: "science",
        difficulty: "debutant",
        xpReward: 20,
        authorId: "author-6",
        authorName: "Galileo Galilei",
        likes: 345,
        comments: 56,
        shares: 42,
        createdAt: new Date().toISOString(),
      },
      {
        id: "content-7",
        contentType: "text_post",
        title: "Le théorème de Pythagore dans la vraie vie",
        description: "Découvre comment le théorème de Pythagore est utilisé tous les jours",
        textContent: "Le théorème de Pythagore n'est pas juste une formule scolaire. Il est utilisé par les architectes, les ingénieurs...",
        roomId: "room-4",
        roomName: "Mathématiques Fun",
        category: "mathematics",
        difficulty: "debutant",
        xpReward: 25,
        authorId: "author-7",
        authorName: "Pythagore",
        likes: 178,
        comments: 32,
        shares: 18,
        createdAt: new Date().toISOString(),
      },
      {
        id: "content-8",
        contentType: "video",
        title: "Construis un circuit électrique",
        description: "Tutoriel pas à pas pour créer ton premier circuit",
        videoUrl: "https://example.com/video3",
        roomId: "room-3",
        roomName: "Ingénieurs en herbe",
        category: "engineering",
        difficulty: "avance",
        xpReward: 60,
        authorId: "author-8",
        authorName: "Nikola Tesla",
        likes: 267,
        comments: 48,
        shares: 35,
        createdAt: new Date().toISOString(),
      },
    ];

    contents.forEach((content) => this.contents.set(content.id, content));

    // Seed Missions
    const missions: Mission[] = [
      {
        id: "mission-1",
        missionType: "watch_videos",
        title: "Explorateur du jour",
        description: "Regarde 3 vidéos de science",
        targetValue: 3,
        currentProgress: 1,
        xpReward: 100,
        frequency: "daily",
        category: "science",
        completed: false,
      },
      {
        id: "mission-2",
        missionType: "complete_quiz",
        title: "Maître des quiz",
        description: "Complète 2 quiz cette semaine",
        targetValue: 2,
        currentProgress: 0,
        xpReward: 150,
        frequency: "weekly",
        completed: false,
      },
      {
        id: "mission-3",
        missionType: "join_salon",
        title: "Socialise !",
        description: "Rejoins un nouveau salon",
        targetValue: 1,
        currentProgress: 0,
        xpReward: 75,
        frequency: "one_time",
        completed: false,
      },
      {
        id: "mission-4",
        missionType: "comment",
        title: "Participe à la discussion",
        description: "Commente 2 publications",
        targetValue: 2,
        currentProgress: 1,
        xpReward: 50,
        frequency: "daily",
        completed: false,
      },
      {
        id: "mission-5",
        missionType: "streak",
        title: "Série de 7 jours",
        description: "Connecte-toi 7 jours de suite",
        targetValue: 7,
        currentProgress: 3,
        xpReward: 300,
        frequency: "one_time",
        completed: false,
      },
      {
        id: "mission-6",
        missionType: "share_content",
        title: "Ambassadeur STEM",
        description: "Partage 1 contenu avec un ami",
        targetValue: 1,
        currentProgress: 1,
        xpReward: 50,
        frequency: "daily",
        completed: true,
      },
    ];

    missions.forEach((mission) => this.missions.set(mission.id, mission));
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUserProfile(id: string, profile: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...profile };
    this.users.set(id, updated);
    return updated;
  }

  // Content
  async getAllContent(): Promise<Content[]> {
    return Array.from(this.contents.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getContentByCategory(category: string): Promise<Content[]> {
    return Array.from(this.contents.values())
      .filter((c) => c.category === category)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getContentByRoom(roomId: string): Promise<Content[]> {
    return Array.from(this.contents.values())
      .filter((c) => c.roomId === roomId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getContent(id: string): Promise<Content | undefined> {
    return this.contents.get(id);
  }

  async createContent(content: InsertContent): Promise<Content> {
    const id = randomUUID();
    const newContent: Content = {
      ...content,
      id,
      likes: 0,
      comments: 0,
      shares: 0,
      createdAt: new Date().toISOString(),
    };
    this.contents.set(id, newContent);
    return newContent;
  }

  async likeContent(id: string): Promise<void> {
    const content = this.contents.get(id);
    if (content) {
      content.likes += 1;
      this.contents.set(id, content);
    }
  }

  // Rooms
  async getAllRooms(): Promise<Room[]> {
    return Array.from(this.rooms.values()).sort(
      (a, b) => b.memberCount - a.memberCount
    );
  }

  async getRoom(id: string): Promise<Room | undefined> {
    return this.rooms.get(id);
  }

  async createRoom(room: InsertRoom): Promise<Room> {
    const id = randomUUID();
    const newRoom: Room = {
      ...room,
      id,
      memberCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.rooms.set(id, newRoom);
    return newRoom;
  }

  async joinRoom(roomId: string, userId: string, role: string): Promise<RoomMember> {
    const id = randomUUID();
    const member: RoomMember = {
      id,
      roomId,
      userId,
      role: role as any,
      xpInRoom: 0,
      joinedAt: new Date().toISOString(),
    };
    this.roomMembers.set(id, member);
    
    const room = this.rooms.get(roomId);
    if (room) {
      room.memberCount += 1;
      this.rooms.set(roomId, room);
    }
    
    return member;
  }

  // Missions
  async getUserMissions(userId: string): Promise<Mission[]> {
    return Array.from(this.missions.values());
  }

  async getMission(id: string): Promise<Mission | undefined> {
    return this.missions.get(id);
  }

  async createMission(mission: InsertMission): Promise<Mission> {
    const id = randomUUID();
    const newMission: Mission = {
      ...mission,
      id,
      currentProgress: 0,
      completed: false,
    };
    this.missions.set(id, newMission);
    return newMission;
  }

  async updateMissionProgress(id: string, progress: number): Promise<Mission | undefined> {
    const mission = this.missions.get(id);
    if (!mission) return undefined;
    mission.currentProgress = progress;
    if (progress >= mission.targetValue) {
      mission.completed = true;
    }
    this.missions.set(id, mission);
    return mission;
  }

  async completeMission(id: string): Promise<Mission | undefined> {
    const mission = this.missions.get(id);
    if (!mission) return undefined;
    mission.completed = true;
    mission.currentProgress = mission.targetValue;
    this.missions.set(id, mission);
    return mission;
  }

  // Engagement
  async getEngagementStats(userId: string): Promise<EngagementStats | undefined> {
    return this.engagementStats.get(userId);
  }

  async trackVideoEngagement(engagement: Omit<VideoEngagement, 'id'>): Promise<VideoEngagement> {
    const id = randomUUID();
    const newEngagement: VideoEngagement = { ...engagement, id };
    this.videoEngagements.set(id, newEngagement);
    return newEngagement;
  }
}

export const storage = new MemStorage();
