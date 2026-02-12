import { randomUUID } from "crypto";
import type { 
  User, InsertUser, Content, InsertContent, 
  Room, InsertRoom, Mission, InsertMission,
  RoomMember, EngagementStats, VideoEngagement,
  QuizQuestion, InsertQuizQuestion, QuizAttempt,
  Comment, InsertComment, Badge, UserBadge, LeaderboardEntry
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(id: string, profile: Partial<User>): Promise<User | undefined>;

  getAllContent(): Promise<Content[]>;
  getContentByCategory(category: string): Promise<Content[]>;
  getContentByRoom(roomId: string): Promise<Content[]>;
  getContent(id: string): Promise<Content | undefined>;
  createContent(content: InsertContent): Promise<Content>;
  likeContent(id: string): Promise<void>;
  getContentByAuthor(authorId: string): Promise<Content[]>;
  incrementCommentCount(contentId: string): Promise<void>;

  getQuizQuestions(contentId: string): Promise<QuizQuestion[]>;
  createQuizQuestion(question: InsertQuizQuestion): Promise<QuizQuestion>;
  createQuizQuestions(questions: InsertQuizQuestion[]): Promise<QuizQuestion[]>;
  submitQuizAttempt(attempt: Omit<QuizAttempt, 'id' | 'completedAt'>): Promise<QuizAttempt>;
  getQuizAttempts(contentId: string): Promise<QuizAttempt[]>;
  getUserQuizAttempts(userId: string): Promise<QuizAttempt[]>;

  getComments(contentId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  likeComment(id: string): Promise<void>;

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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private contents: Map<string, Content>;
  private rooms: Map<string, Room>;
  private roomMembers: Map<string, RoomMember>;
  private missions: Map<string, Mission>;
  private engagementStats: Map<string, EngagementStats>;
  private videoEngagements: Map<string, VideoEngagement>;
  private quizQuestions: Map<string, QuizQuestion>;
  private quizAttempts: Map<string, QuizAttempt>;
  private comments: Map<string, Comment>;
  private badges: Map<string, Badge>;
  private userBadges: Map<string, UserBadge>;

  constructor() {
    this.users = new Map();
    this.contents = new Map();
    this.rooms = new Map();
    this.roomMembers = new Map();
    this.missions = new Map();
    this.engagementStats = new Map();
    this.videoEngagements = new Map();
    this.quizQuestions = new Map();
    this.quizAttempts = new Map();
    this.comments = new Map();
    this.badges = new Map();
    this.userBadges = new Map();

    this.seedData();
  }

  private seedData() {
    const rooms: Room[] = [
      { id: "room-1", name: "Labo Science", description: "Explore les mystères de la science avec des expériences passionnantes", type: "public", category: "science", memberCount: 234, createdAt: new Date().toISOString() },
      { id: "room-2", name: "Tech Makers", description: "Construis des projets tech innovants avec la communauté", type: "public", category: "technology", memberCount: 189, createdAt: new Date().toISOString() },
      { id: "room-3", name: "Ingénieurs en herbe", description: "Conçois et crée des solutions d'ingénierie", type: "public", category: "engineering", memberCount: 156, createdAt: new Date().toISOString() },
      { id: "room-4", name: "Mathématiques Fun", description: "Les maths peuvent être amusantes ! Découvre-le ici", type: "public", category: "mathematics", memberCount: 203, createdAt: new Date().toISOString() },
      { id: "room-5", name: "Robotique Club", description: "Apprends à construire et programmer des robots", type: "public", category: "technology", memberCount: 142, createdAt: new Date().toISOString() },
      { id: "room-6", name: "Astronomie", description: "Explore l'univers et ses mystères", type: "public", category: "science", memberCount: 178, createdAt: new Date().toISOString() },
    ];
    rooms.forEach((room) => this.rooms.set(room.id, room));

    const contents: Content[] = [
      { id: "content-1", contentType: "video", title: "Comment fonctionne un trou noir ?", description: "Découvre les secrets des trous noirs et leur impact sur l'univers", videoUrl: "https://example.com/video1", textContent: null, imageUrl: null, roomId: "room-1", roomName: "Labo Science", category: "science", difficulty: "intermediaire", tags: ["#Physique", "#Espace"], xpReward: 35, authorId: "author-1", authorName: "Dr. Marie Curie", authorAvatar: null, likes: 156, comments: 23, shares: 12, createdAt: new Date().toISOString() },
      { id: "content-2", contentType: "text_post", title: "L'intelligence artificielle expliquée simplement", description: "Comprends les bases de l'IA en 5 minutes", videoUrl: null, textContent: "L'intelligence artificielle est la capacité d'une machine à imiter des comportements humains intelligents. Elle utilise des algorithmes d'apprentissage automatique pour analyser des données et prendre des décisions.", imageUrl: null, roomId: "room-2", roomName: "Tech Makers", category: "technology", difficulty: "debutant", tags: ["#IA", "#Tech"], xpReward: 25, authorId: "author-2", authorName: "Alan Turing", authorAvatar: null, likes: 89, comments: 15, shares: 8, createdAt: new Date().toISOString() },
      { id: "content-3", contentType: "quiz", title: "Quiz : Les équations du second degré", description: "Teste tes connaissances sur les équations quadratiques", videoUrl: null, textContent: null, imageUrl: null, roomId: "room-4", roomName: "Mathématiques Fun", category: "mathematics", difficulty: "intermediaire", tags: ["#Maths", "#Algèbre"], xpReward: 50, authorId: "author-3", authorName: "Pierre Fermat", authorAvatar: null, likes: 67, comments: 8, shares: 5, createdAt: new Date().toISOString() },
      { id: "content-4", contentType: "infographic", title: "Les étapes de la construction d'un pont", description: "Infographie interactive sur l'ingénierie des ponts", videoUrl: null, textContent: null, imageUrl: null, roomId: "room-3", roomName: "Ingénieurs en herbe", category: "engineering", difficulty: "debutant", tags: ["#Génie", "#Construction"], xpReward: 30, authorId: "author-4", authorName: "Gustave Eiffel", authorAvatar: null, likes: 112, comments: 19, shares: 14, createdAt: new Date().toISOString() },
      { id: "content-5", contentType: "video", title: "Programmer ton premier robot", description: "Apprends à coder un robot simple avec Arduino", videoUrl: "https://example.com/video2", textContent: null, imageUrl: null, roomId: "room-5", roomName: "Robotique Club", category: "technology", difficulty: "intermediaire", tags: ["#Robotique", "#Arduino"], xpReward: 40, authorId: "author-5", authorName: "Ada Lovelace", authorAvatar: null, likes: 203, comments: 45, shares: 28, createdAt: new Date().toISOString() },
      { id: "content-6", contentType: "image_post", title: "Les planètes du système solaire", description: "Une vue magnifique de notre système solaire", videoUrl: null, textContent: null, imageUrl: "https://example.com/image1", roomId: "room-6", roomName: "Astronomie", category: "science", difficulty: "debutant", tags: ["#Espace", "#Planètes"], xpReward: 20, authorId: "author-6", authorName: "Galileo Galilei", authorAvatar: null, likes: 345, comments: 56, shares: 42, createdAt: new Date().toISOString() },
      { id: "content-7", contentType: "text_post", title: "Le théorème de Pythagore dans la vraie vie", description: "Découvre comment le théorème de Pythagore est utilisé tous les jours", videoUrl: null, textContent: "Le théorème de Pythagore n'est pas juste une formule scolaire. Il est utilisé par les architectes pour calculer des diagonales, par les ingénieurs pour concevoir des structures, et même en navigation GPS.", imageUrl: null, roomId: "room-4", roomName: "Mathématiques Fun", category: "mathematics", difficulty: "debutant", tags: ["#Maths", "#Géométrie"], xpReward: 25, authorId: "author-7", authorName: "Pythagore", authorAvatar: null, likes: 178, comments: 32, shares: 18, createdAt: new Date().toISOString() },
      { id: "content-8", contentType: "video", title: "Construis un circuit électrique", description: "Tutoriel pas à pas pour créer ton premier circuit", videoUrl: "https://example.com/video3", textContent: null, imageUrl: null, roomId: "room-3", roomName: "Ingénieurs en herbe", category: "engineering", difficulty: "avance", tags: ["#Électronique", "#Circuit"], xpReward: 60, authorId: "author-8", authorName: "Nikola Tesla", authorAvatar: null, likes: 267, comments: 48, shares: 35, createdAt: new Date().toISOString() },
    ];
    contents.forEach((content) => this.contents.set(content.id, content));

    const quizQuestions: QuizQuestion[] = [
      { id: "qq-1", contentId: "content-3", question: "Quelle est la forme générale d'une équation du second degré ?", options: ["ax + b = 0", "ax² + bx + c = 0", "ax³ + bx² + cx + d = 0", "a/x + b = 0"], correctOptionIndex: 1, explanation: "La forme générale est ax² + bx + c = 0 avec a ≠ 0", order: 0 },
      { id: "qq-2", contentId: "content-3", question: "Que représente le discriminant Δ ?", options: ["La somme des racines", "Le produit des racines", "Il détermine le nombre de solutions", "La valeur de x"], correctOptionIndex: 2, explanation: "Δ = b² - 4ac détermine si l'équation a 0, 1 ou 2 solutions réelles", order: 1 },
      { id: "qq-3", contentId: "content-3", question: "Si Δ > 0, combien de solutions réelles a l'équation ?", options: ["0", "1", "2", "Infini"], correctOptionIndex: 2, explanation: "Quand Δ > 0, il y a deux solutions réelles distinctes", order: 2 },
      { id: "qq-4", contentId: "content-3", question: "Quelle est la formule pour trouver les racines ?", options: ["x = -b/2a", "x = (-b ± √Δ) / 2a", "x = c/a", "x = -b ± c"], correctOptionIndex: 1, explanation: "Les racines se calculent avec x = (-b ± √Δ) / 2a", order: 3 },
    ] as QuizQuestion[];
    quizQuestions.forEach((q) => this.quizQuestions.set(q.id, q));

    const badges: Badge[] = [
      { id: "badge-1", name: "Premier Pas", description: "Publie ton premier contenu", icon: "star", category: "contribution", requirement: "create_first_content", xpRequired: 0 },
      { id: "badge-2", name: "Mentor", description: "Atteins le niveau Mentor", icon: "crown", category: "performance", requirement: "reach_mentor_level", xpRequired: 15000 },
      { id: "badge-3", name: "Expert Quiz", description: "Obtiens 100% sur 5 quiz", icon: "brain", category: "performance", requirement: "perfect_quiz_5", xpRequired: 0 },
      { id: "badge-4", name: "Top Contributeur", description: "Publie 20 contenus", icon: "award", category: "contribution", requirement: "create_20_contents", xpRequired: 0 },
      { id: "badge-5", name: "Socialiste", description: "Rejoins 5 salons", icon: "users", category: "social", requirement: "join_5_rooms", xpRequired: 0 },
      { id: "badge-6", name: "Flamme Éternelle", description: "Maintiens une série de 30 jours", icon: "flame", category: "special", requirement: "streak_30", xpRequired: 0 },
      { id: "badge-7", name: "Scientifique", description: "Gagne 500 XP en Science", icon: "microscope", category: "performance", requirement: "science_500xp", xpRequired: 500 },
      { id: "badge-8", name: "Technologue", description: "Gagne 500 XP en Technologie", icon: "cpu", category: "performance", requirement: "technology_500xp", xpRequired: 500 },
    ];
    badges.forEach((badge) => this.badges.set(badge.id, badge));

    const missions: Mission[] = [
      { id: "mission-1", missionType: "watch_videos", title: "Explorateur du jour", description: "Regarde 3 vidéos de science", targetValue: 3, currentProgress: 1, xpReward: 100, frequency: "daily", category: "science", completed: false },
      { id: "mission-2", missionType: "complete_quiz", title: "Maître des quiz", description: "Complète 2 quiz cette semaine", targetValue: 2, currentProgress: 0, xpReward: 150, frequency: "weekly", completed: false },
      { id: "mission-3", missionType: "join_salon", title: "Socialise !", description: "Rejoins un nouveau salon", targetValue: 1, currentProgress: 0, xpReward: 75, frequency: "one_time", completed: false },
      { id: "mission-4", missionType: "comment", title: "Participe à la discussion", description: "Commente 2 publications", targetValue: 2, currentProgress: 1, xpReward: 50, frequency: "daily", completed: false },
      { id: "mission-5", missionType: "streak", title: "Série de 7 jours", description: "Connecte-toi 7 jours de suite", targetValue: 7, currentProgress: 3, xpReward: 300, frequency: "one_time", completed: false },
      { id: "mission-6", missionType: "share_content", title: "Ambassadeur STEM", description: "Partage 1 contenu avec un ami", targetValue: 1, currentProgress: 1, xpReward: 50, frequency: "daily", completed: true },
      { id: "mission-7", missionType: "create_content", title: "Créateur de contenu", description: "Publie un nouveau contenu", targetValue: 1, currentProgress: 0, xpReward: 200, frequency: "weekly", completed: false },
    ];
    missions.forEach((mission) => this.missions.set(mission.id, mission));

    const leaderboardUsers = [
      { id: "lb-user-1", username: "Dr. Marie Curie", password: "", xp: 4500, level: "challenger", streak: 15, onboardingCompleted: true, preferredLanguage: "fr", educationLevel: "universite", interests: ["science"] },
      { id: "lb-user-2", username: "Alan Turing", password: "", xp: 3800, level: "analyste", streak: 22, onboardingCompleted: true, preferredLanguage: "en", educationLevel: "universite", interests: ["technology", "mathematics"] },
      { id: "lb-user-3", username: "Ada Lovelace", password: "", xp: 3200, level: "analyste", streak: 10, onboardingCompleted: true, preferredLanguage: "en", educationLevel: "universite", interests: ["technology"] },
      { id: "lb-user-4", username: "Pierre Fermat", password: "", xp: 2900, level: "analyste", streak: 8, onboardingCompleted: true, preferredLanguage: "fr", educationLevel: "universite", interests: ["mathematics"] },
      { id: "lb-user-5", username: "Nikola Tesla", password: "", xp: 2500, level: "explorateur", streak: 12, onboardingCompleted: true, preferredLanguage: "en", educationLevel: "universite", interests: ["engineering", "technology"] },
    ];
    leaderboardUsers.forEach((u) => this.users.set(u.id, u as User));

    const seedComments: Comment[] = [
      { id: "comment-1", contentId: "content-1", userId: "lb-user-1", authorName: "Dr. Marie Curie", text: "Excellent contenu ! Les trous noirs sont fascinants.", likes: 5, createdAt: new Date(Date.now() - 3600000).toISOString() },
      { id: "comment-2", contentId: "content-2", userId: "lb-user-2", authorName: "Alan Turing", text: "Bonne introduction à l'IA. J'aurais ajouté un mot sur le deep learning.", likes: 3, createdAt: new Date(Date.now() - 7200000).toISOString() },
      { id: "comment-3", contentId: "content-1", userId: "lb-user-3", authorName: "Ada Lovelace", text: "Très bien expliqué, merci pour ce partage !", likes: 2, createdAt: new Date(Date.now() - 1800000).toISOString() },
    ];
    seedComments.forEach((c) => this.comments.set(c.id, c));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      preferredLanguage: null,
      educationLevel: null,
      interests: null,
      level: null,
      xp: null,
      streak: null,
      onboardingCompleted: null,
    };
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
      description: content.description ?? null,
      videoUrl: content.videoUrl ?? null,
      textContent: content.textContent ?? null,
      imageUrl: content.imageUrl ?? null,
      roomId: content.roomId ?? null,
      roomName: content.roomName ?? null,
      tags: content.tags ?? [],
      xpReward: content.xpReward ?? 25,
      authorAvatar: content.authorAvatar ?? null,
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
      content.likes = (content.likes ?? 0) + 1;
      this.contents.set(id, content);
    }
  }

  async getContentByAuthor(authorId: string): Promise<Content[]> {
    return Array.from(this.contents.values())
      .filter((c) => c.authorId === authorId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async incrementCommentCount(contentId: string): Promise<void> {
    const content = this.contents.get(contentId);
    if (content) {
      content.comments = (content.comments ?? 0) + 1;
      this.contents.set(contentId, content);
    }
  }

  async getQuizQuestions(contentId: string): Promise<QuizQuestion[]> {
    return Array.from(this.quizQuestions.values())
      .filter((q) => q.contentId === contentId)
      .sort((a, b) => a.order - b.order);
  }

  async createQuizQuestion(question: InsertQuizQuestion): Promise<QuizQuestion> {
    const id = randomUUID();
    const newQuestion: QuizQuestion = { ...question, id, explanation: question.explanation ?? null };
    this.quizQuestions.set(id, newQuestion);
    return newQuestion;
  }

  async createQuizQuestions(questions: InsertQuizQuestion[]): Promise<QuizQuestion[]> {
    return Promise.all(questions.map((q) => this.createQuizQuestion(q)));
  }

  async submitQuizAttempt(attempt: Omit<QuizAttempt, 'id' | 'completedAt'>): Promise<QuizAttempt> {
    const id = randomUUID();
    const newAttempt: QuizAttempt = { ...attempt, id, completedAt: new Date().toISOString() };
    this.quizAttempts.set(id, newAttempt);
    return newAttempt;
  }

  async getQuizAttempts(contentId: string): Promise<QuizAttempt[]> {
    return Array.from(this.quizAttempts.values()).filter((a) => a.contentId === contentId);
  }

  async getUserQuizAttempts(userId: string): Promise<QuizAttempt[]> {
    return Array.from(this.quizAttempts.values()).filter((a) => a.userId === userId);
  }

  async getComments(contentId: string): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter((c) => c.contentId === contentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const newComment: Comment = {
      ...comment,
      id,
      likes: 0,
      createdAt: comment.createdAt || new Date().toISOString(),
    };
    this.comments.set(id, newComment);
    await this.incrementCommentCount(comment.contentId);
    return newComment;
  }

  async likeComment(id: string): Promise<void> {
    const comment = this.comments.get(id);
    if (comment) {
      comment.likes = (comment.likes ?? 0) + 1;
      this.comments.set(id, comment);
    }
  }

  async getAllBadges(): Promise<Badge[]> {
    return Array.from(this.badges.values());
  }

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    return Array.from(this.userBadges.values()).filter((ub) => ub.userId === userId);
  }

  async awardBadge(userId: string, badgeId: string): Promise<UserBadge> {
    const id = randomUUID();
    const userBadge: UserBadge = { id, userId, badgeId, earnedAt: new Date().toISOString() };
    this.userBadges.set(id, userBadge);
    return userBadge;
  }

  async getLeaderboard(category?: string): Promise<LeaderboardEntry[]> {
    const allUsers = Array.from(this.users.values());
    const allContents = Array.from(this.contents.values());
    const allAttempts = Array.from(this.quizAttempts.values());

    return allUsers
      .map((user) => {
        const userContents = allContents.filter((c) => c.authorId === user.id);
        const userAttempts = allAttempts.filter((a) => a.userId === user.id);
        const avgQuizScore = userAttempts.length > 0
          ? userAttempts.reduce((sum, a) => sum + (a.score / a.totalQuestions) * 100, 0) / userAttempts.length
          : 0;
        const contentQuality = userContents.reduce((sum, c) => sum + (c.likes ?? 0) + (c.comments ?? 0) * 2 + (c.shares ?? 0) * 3, 0);
        const academicScore = Math.round(((user.xp || 0) * 0.4 + contentQuality * 0.3 + avgQuizScore * 0.3));

        return {
          userId: user.id,
          username: user.username,
          xp: user.xp || 0,
          level: user.level || "curieux",
          category: category,
          contentCount: userContents.length,
          quizScore: Math.round(avgQuizScore),
          academicScore,
        };
      })
      .sort((a, b) => b.academicScore - a.academicScore)
      .slice(0, 20);
  }

  async getAllRooms(): Promise<Room[]> {
    return Array.from(this.rooms.values()).sort((a, b) => b.memberCount - a.memberCount);
  }

  async getRoom(id: string): Promise<Room | undefined> {
    return this.rooms.get(id);
  }

  async createRoom(room: InsertRoom): Promise<Room> {
    const id = randomUUID();
    const newRoom: Room = { ...room, id, memberCount: 0, createdAt: new Date().toISOString() };
    this.rooms.set(id, newRoom);
    return newRoom;
  }

  async joinRoom(roomId: string, userId: string, role: string): Promise<RoomMember> {
    const id = randomUUID();
    const member: RoomMember = { id, roomId, userId, role: role as any, xpInRoom: 0, joinedAt: new Date().toISOString() };
    this.roomMembers.set(id, member);
    const room = this.rooms.get(roomId);
    if (room) {
      room.memberCount += 1;
      this.rooms.set(roomId, room);
    }
    return member;
  }

  async getUserMissions(userId: string): Promise<Mission[]> {
    return Array.from(this.missions.values());
  }

  async getMission(id: string): Promise<Mission | undefined> {
    return this.missions.get(id);
  }

  async createMission(mission: InsertMission): Promise<Mission> {
    const id = randomUUID();
    const newMission: Mission = { ...mission, id, currentProgress: 0, completed: false };
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
