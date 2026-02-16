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
  private contentLikes: Map<string, Set<string>>;
  private commentLikes: Map<string, Set<string>>;
  private follows: Map<string, Follow>;
  private activities: Map<string, Activity>;
  private notifications: Map<string, Notification>;
  private roomPosts: Map<string, RoomPost>;
  private roomPostLikes: Map<string, Set<string>>;

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
    this.contentLikes = new Map();
    this.commentLikes = new Map();
    this.follows = new Map();
    this.activities = new Map();
    this.notifications = new Map();
    this.roomPosts = new Map();
    this.roomPostLikes = new Map();

    this.seedData();
  }

  private seedData() {
    const rooms: Room[] = [
      { id: "room-1", name: "Labo Science", description: "Explore les mystères de la science avec des expériences passionnantes", type: "public", category: "science", imageUrl: null, memberCount: 234, createdAt: new Date().toISOString() },
      { id: "room-2", name: "Tech Makers", description: "Construis des projets tech innovants avec la communauté", type: "public", category: "technology", imageUrl: null, memberCount: 189, createdAt: new Date().toISOString() },
      { id: "room-3", name: "Ingénieurs en herbe", description: "Conçois et crée des solutions d'ingénierie", type: "public", category: "engineering", imageUrl: null, memberCount: 156, createdAt: new Date().toISOString() },
      { id: "room-4", name: "Mathématiques Fun", description: "Les maths peuvent être amusantes ! Découvre-le ici", type: "public", category: "mathematics", imageUrl: null, memberCount: 203, createdAt: new Date().toISOString() },
      { id: "room-5", name: "Robotique Club", description: "Apprends à construire et programmer des robots", type: "public", category: "technology", imageUrl: null, memberCount: 142, createdAt: new Date().toISOString() },
      { id: "room-6", name: "Astronomie", description: "Explore l'univers et ses mystères", type: "public", category: "science", imageUrl: null, memberCount: 178, createdAt: new Date().toISOString() },
    ];
    rooms.forEach((room) => this.rooms.set(room.id, room));

    const contents: Content[] = [
      { id: "content-1", contentType: "video", title: "Comment fonctionne un trou noir ?", description: "Découvre les secrets des trous noirs et leur impact sur l'espace-temps. Une animation fascinante qui te plonge au coeur de ces objets cosmiques.", videoUrl: "https://www.youtube.com/watch?v=e-P5IFTqB98", textContent: null, imageUrl: null, roomId: "room-1", roomName: "Labo Science", category: "science", difficulty: "intermediaire", tags: ["#Physique", "#Espace", "#TrousNoirs"], xpReward: 35, authorId: "author-1", authorName: "TED-Ed", authorAvatar: null, likes: 456, comments: 67, shares: 34, createdAt: new Date(Date.now() - 3600000).toISOString() },
      { id: "content-9", contentType: "video", title: "Comment fonctionnent les panneaux solaires ?", description: "L'énergie solaire expliquée simplement : comment les photons se transforment en électricité grâce à l'effet photovoltaïque.", videoUrl: "https://www.youtube.com/watch?v=xKxrkht7CpY", textContent: null, imageUrl: null, roomId: "room-1", roomName: "Labo Science", category: "science", difficulty: "debutant", tags: ["#Énergie", "#Solaire", "#Physique"], xpReward: 30, authorId: "author-1", authorName: "TED-Ed", authorAvatar: null, likes: 378, comments: 45, shares: 28, createdAt: new Date(Date.now() - 7200000).toISOString() },
      { id: "content-10", contentType: "video", title: "Qu'est-ce que la matière noire ?", description: "La matière noire compose 27% de l'univers mais reste invisible. Découvre ce mystère de la physique moderne.", videoUrl: "https://www.youtube.com/watch?v=HneiEA1B8ks", textContent: null, imageUrl: null, roomId: "room-6", roomName: "Astronomie", category: "science", difficulty: "avance", tags: ["#Astrophysique", "#MatièreNoire", "#Cosmologie"], xpReward: 50, authorId: "author-6", authorName: "Kurzgesagt", authorAvatar: null, likes: 534, comments: 89, shares: 67, createdAt: new Date(Date.now() - 14400000).toISOString() },
      { id: "content-11", contentType: "video", title: "Comment le cerveau traite-t-il la douleur ?", description: "Explore les mécanismes fascinants par lesquels ton cerveau détecte et interprète les signaux de douleur.", videoUrl: "https://www.youtube.com/watch?v=I7wfDenj6CQ", textContent: null, imageUrl: null, roomId: "room-1", roomName: "Labo Science", category: "science", difficulty: "intermediaire", tags: ["#Neuroscience", "#Cerveau", "#Biologie"], xpReward: 35, authorId: "author-1", authorName: "TED-Ed", authorAvatar: null, likes: 289, comments: 34, shares: 21, createdAt: new Date(Date.now() - 28800000).toISOString() },
      { id: "content-12", contentType: "video", title: "La chimie de l'amour", description: "Quelles molécules sont responsables de l'amour ? Dopamine, ocytocine, sérotonine : la science des émotions.", videoUrl: "https://www.youtube.com/watch?v=169N81xAffQ", textContent: null, imageUrl: null, roomId: "room-1", roomName: "Labo Science", category: "science", difficulty: "debutant", tags: ["#Chimie", "#Biologie", "#Émotions"], xpReward: 25, authorId: "author-1", authorName: "TED-Ed", authorAvatar: null, likes: 623, comments: 78, shares: 56, createdAt: new Date(Date.now() - 43200000).toISOString() },
      { id: "content-13", contentType: "video", title: "La gravité expliquée par le MIT", description: "Qu'est-ce que la gravité ? Ce concept fondamental de la physique expliqué par les professeurs du MIT. Licence CC BY-NC-SA.", videoUrl: "https://archive.org/download/MITRES.TLL-004F13/MITRES_TLL-004F13_gravity_300k.mp4", textContent: null, imageUrl: null, roomId: "room-1", roomName: "Labo Science", category: "science", difficulty: "intermediaire", tags: ["#Physique", "#Gravité", "#MIT"], xpReward: 35, authorId: "author-1", authorName: "MIT OpenCourseWare", authorAvatar: null, likes: 312, comments: 41, shares: 25, createdAt: new Date(Date.now() - 57600000).toISOString() },
      { id: "content-2", contentType: "text_post", title: "L'intelligence artificielle expliquée simplement", description: "Comprends les bases de l'IA en 5 minutes", videoUrl: null, textContent: "L'intelligence artificielle est la capacité d'une machine à imiter des comportements humains intelligents. Elle utilise des algorithmes d'apprentissage automatique pour analyser des données et prendre des décisions. Les réseaux de neurones, inspirés du cerveau humain, permettent aux machines d'apprendre à partir d'exemples. L'IA est partout : dans ton téléphone, tes réseaux sociaux, et même dans la médecine.", imageUrl: null, roomId: "room-2", roomName: "Tech Makers", category: "technology", difficulty: "debutant", tags: ["#IA", "#Tech", "#MachineLearning"], xpReward: 25, authorId: "author-2", authorName: "Alan Turing", authorAvatar: null, likes: 289, comments: 45, shares: 28, createdAt: new Date(Date.now() - 72000000).toISOString() },
      { id: "content-5", contentType: "video", title: "Programmer ton premier robot", description: "Apprends les bases de la programmation robotique avec Arduino. De la LED clignotante au robot mobile.", videoUrl: "https://www.youtube.com/watch?v=fCxzA9_kg6s", textContent: null, imageUrl: null, roomId: "room-5", roomName: "Robotique Club", category: "technology", difficulty: "intermediaire", tags: ["#Robotique", "#Arduino", "#Code"], xpReward: 40, authorId: "author-5", authorName: "Ada Lovelace", authorAvatar: null, likes: 403, comments: 65, shares: 48, createdAt: new Date(Date.now() - 86400000).toISOString() },
      { id: "content-14", contentType: "video", title: "Le logiciel qui a envoyé l'homme sur la Lune", description: "L'histoire de Margaret Hamilton et du code qui a sauvé la mission Apollo 11. Une pionnière de l'informatique.", videoUrl: "https://www.youtube.com/watch?v=kYCZPXSVvOQ", textContent: null, imageUrl: null, roomId: "room-2", roomName: "Tech Makers", category: "technology", difficulty: "intermediaire", tags: ["#Histoire", "#NASA", "#Code"], xpReward: 35, authorId: "author-1", authorName: "TED-Ed", authorAvatar: null, likes: 567, comments: 89, shares: 72, createdAt: new Date(Date.now() - 100800000).toISOString() },
      { id: "content-15", contentType: "video", title: "Comment fonctionne Internet ?", description: "Des câbles sous-marins aux data centers : le voyage d'un paquet de données à travers le réseau mondial.", videoUrl: "https://www.youtube.com/watch?v=x3c1ih2NJEg", textContent: null, imageUrl: null, roomId: "room-2", roomName: "Tech Makers", category: "technology", difficulty: "debutant", tags: ["#Internet", "#Réseau", "#Web"], xpReward: 30, authorId: "author-2", authorName: "Kurzgesagt", authorAvatar: null, likes: 445, comments: 56, shares: 39, createdAt: new Date(Date.now() - 115200000).toISOString() },
      { id: "content-16", contentType: "video", title: "Qu'est-ce qu'un algorithme ?", description: "Les algorithmes sont partout dans ta vie quotidienne. Apprends ce concept fondamental de l'informatique.", videoUrl: "https://www.youtube.com/watch?v=6hfOvs8pY1k", textContent: null, imageUrl: null, roomId: "room-2", roomName: "Tech Makers", category: "technology", difficulty: "debutant", tags: ["#Algorithme", "#Informatique", "#Logique"], xpReward: 25, authorId: "author-1", authorName: "TED-Ed", authorAvatar: null, likes: 356, comments: 42, shares: 31, createdAt: new Date(Date.now() - 129600000).toISOString() },
      { id: "content-17", contentType: "video", title: "Introduction à la programmation", description: "Les bases de la programmation expliquées par le MIT : variables, boucles, conditions. Licence CC BY-NC-SA.", videoUrl: "https://archive.org/download/MITRES.TLL-004F13/MITRES_TLL-004F13_basic_programming_300k.mp4", textContent: null, imageUrl: null, roomId: "room-2", roomName: "Tech Makers", category: "technology", difficulty: "debutant", tags: ["#Programmation", "#MIT", "#Code"], xpReward: 30, authorId: "author-5", authorName: "MIT OpenCourseWare", authorAvatar: null, likes: 278, comments: 34, shares: 45, createdAt: new Date(Date.now() - 144000000).toISOString() },
      { id: "content-4", contentType: "infographic", title: "Les étapes de la construction d'un pont", description: "De la conception à la réalisation : découvre les principes d'ingénierie derrière les plus grands ponts du monde.", videoUrl: null, textContent: "La construction d'un pont suit des étapes précises : 1) Étude du terrain et des besoins, 2) Conception et calculs de résistance, 3) Choix des matériaux (acier, béton, câbles), 4) Fondations et piliers, 5) Construction du tablier, 6) Tests de charge et sécurité. Les ponts suspendus utilisent des câbles en acier pour supporter des portées de plus de 2 km.", imageUrl: null, roomId: "room-3", roomName: "Ingénieurs en herbe", category: "engineering", difficulty: "debutant", tags: ["#Génie", "#Construction", "#Ponts"], xpReward: 30, authorId: "author-4", authorName: "Gustave Eiffel", authorAvatar: null, likes: 312, comments: 39, shares: 24, createdAt: new Date(Date.now() - 158400000).toISOString() },
      { id: "content-8", contentType: "video", title: "Construis un circuit électrique", description: "Tutoriel pas à pas pour créer ton premier circuit : résistances, LED, et loi d'Ohm.", videoUrl: "https://www.youtube.com/watch?v=mc979OhitAg", textContent: null, imageUrl: null, roomId: "room-3", roomName: "Ingénieurs en herbe", category: "engineering", difficulty: "avance", tags: ["#Électronique", "#Circuit", "#LoiOhm"], xpReward: 60, authorId: "author-8", authorName: "Nikola Tesla", authorAvatar: null, likes: 367, comments: 58, shares: 45, createdAt: new Date(Date.now() - 172800000).toISOString() },
      { id: "content-18", contentType: "video", title: "Comment construire un gratte-ciel ?", description: "L'ingénierie derrière les plus hauts bâtiments du monde : fondations, structure et résistance au vent.", videoUrl: "https://www.youtube.com/watch?v=azEvfD4c6ow", textContent: null, imageUrl: null, roomId: "room-3", roomName: "Ingénieurs en herbe", category: "engineering", difficulty: "intermediaire", tags: ["#Architecture", "#Construction", "#Ingénierie"], xpReward: 40, authorId: "author-4", authorName: "Gustave Eiffel", authorAvatar: null, likes: 423, comments: 52, shares: 38, createdAt: new Date(Date.now() - 187200000).toISOString() },
      { id: "content-19", contentType: "video", title: "La chimie au quotidien - NISE Network", description: "Découvre comment la chimie est présente dans ta vie quotidienne avec cette animation du réseau NISE. Licence CC BY-NC-SA.", videoUrl: "https://vimeo.com/399952193", textContent: null, imageUrl: null, roomId: "room-3", roomName: "Ingénieurs en herbe", category: "engineering", difficulty: "debutant", tags: ["#Chimie", "#Quotidien", "#NISE"], xpReward: 30, authorId: "author-8", authorName: "NISE Network", authorAvatar: null, likes: 298, comments: 43, shares: 32, createdAt: new Date(Date.now() - 201600000).toISOString() },
      { id: "content-20", contentType: "video", title: "Le système solaire en miniature", description: "Construis un modèle du système solaire et comprends les distances entre planètes. Animation NISE Network, Licence CC BY-NC-SA.", videoUrl: "https://vimeo.com/850662292", textContent: null, imageUrl: null, roomId: "room-3", roomName: "Ingénieurs en herbe", category: "engineering", difficulty: "debutant", tags: ["#Espace", "#Modèle", "#NISE"], xpReward: 30, authorId: "author-4", authorName: "NISE Network", authorAvatar: null, likes: 489, comments: 67, shares: 54, createdAt: new Date(Date.now() - 216000000).toISOString() },
      { id: "content-21", contentType: "video", title: "Comment fonctionne une fusée ?", description: "La propulsion des fusées expliquée : la troisième loi de Newton en action pour quitter l'atmosphère.", videoUrl: "https://www.youtube.com/watch?v=yvVFqt4BGck", textContent: null, imageUrl: null, roomId: "room-3", roomName: "Ingénieurs en herbe", category: "engineering", difficulty: "avance", tags: ["#Fusée", "#Propulsion", "#Espace"], xpReward: 50, authorId: "author-8", authorName: "Nikola Tesla", authorAvatar: null, likes: 534, comments: 78, shares: 61, createdAt: new Date(Date.now() - 230400000).toISOString() },
      { id: "content-3", contentType: "quiz", title: "Quiz : Les équations du second degré", description: "Teste tes connaissances sur les équations quadratiques et le discriminant.", videoUrl: null, textContent: null, imageUrl: null, roomId: "room-4", roomName: "Mathématiques Fun", category: "mathematics", difficulty: "intermediaire", tags: ["#Maths", "#Algèbre", "#Équations"], xpReward: 50, authorId: "author-3", authorName: "Pierre Fermat", authorAvatar: null, likes: 267, comments: 38, shares: 25, createdAt: new Date(Date.now() - 244800000).toISOString() },
      { id: "content-7", contentType: "text_post", title: "Le théorème de Pythagore dans la vraie vie", description: "Découvre comment le théorème de Pythagore est utilisé tous les jours", videoUrl: null, textContent: "Le théorème de Pythagore n'est pas juste une formule scolaire. Il est utilisé par les architectes pour calculer des diagonales, par les ingénieurs pour concevoir des structures, par les pilotes pour calculer des trajectoires, et même dans ton GPS pour mesurer des distances. La formule a² + b² = c² est l'une des plus élégantes des mathématiques.", imageUrl: null, roomId: "room-4", roomName: "Mathématiques Fun", category: "mathematics", difficulty: "debutant", tags: ["#Maths", "#Géométrie", "#Pythagore"], xpReward: 25, authorId: "author-7", authorName: "Pythagore", authorAvatar: null, likes: 378, comments: 52, shares: 38, createdAt: new Date(Date.now() - 259200000).toISOString() },
      { id: "content-22", contentType: "video", title: "La vie infinie de Pi", description: "Pi (π) est un nombre irrationnel qui fascine les mathématiciens depuis des millénaires. Découvre ses secrets.", videoUrl: "https://www.youtube.com/watch?v=9a5vHXsUvUw", textContent: null, imageUrl: null, roomId: "room-4", roomName: "Mathématiques Fun", category: "mathematics", difficulty: "debutant", tags: ["#Pi", "#Nombres", "#Géométrie"], xpReward: 30, authorId: "author-1", authorName: "TED-Ed", authorAvatar: null, likes: 512, comments: 73, shares: 56, createdAt: new Date(Date.now() - 273600000).toISOString() },
      { id: "content-23", contentType: "video", title: "Peux-tu résoudre l'énigme du pont ?", description: "Une énigme de logique mathématique captivante. Arriveras-tu à traverser le pont avant les zombies ?", videoUrl: "https://www.youtube.com/watch?v=7yDmGnA8Hw0", textContent: null, imageUrl: null, roomId: "room-4", roomName: "Mathématiques Fun", category: "mathematics", difficulty: "intermediaire", tags: ["#Logique", "#Énigme", "#Probabilité"], xpReward: 40, authorId: "author-1", authorName: "TED-Ed", authorAvatar: null, likes: 689, comments: 95, shares: 78, createdAt: new Date(Date.now() - 288000000).toISOString() },
      { id: "content-24", contentType: "video", title: "Pourquoi les compagnies aériennes vendent trop de billets ?", description: "La surbooking expliqué par les probabilités et les statistiques. Les maths au service du business.", videoUrl: "https://www.youtube.com/watch?v=ZFNstNKgEDI", textContent: null, imageUrl: null, roomId: "room-4", roomName: "Mathématiques Fun", category: "mathematics", difficulty: "avance", tags: ["#Probabilité", "#Statistiques", "#Économie"], xpReward: 45, authorId: "author-1", authorName: "TED-Ed", authorAvatar: null, likes: 423, comments: 61, shares: 47, createdAt: new Date(Date.now() - 302400000).toISOString() },
      { id: "content-6", contentType: "video", title: "Les planètes du système solaire", description: "Un voyage à travers notre système solaire : taille, distance et caractéristiques de chaque planète.", videoUrl: "https://www.youtube.com/watch?v=libKVRa01L8", textContent: null, imageUrl: null, roomId: "room-6", roomName: "Astronomie", category: "science", difficulty: "debutant", tags: ["#Espace", "#Planètes", "#Astronomie"], xpReward: 25, authorId: "author-6", authorName: "Galileo Galilei", authorAvatar: null, likes: 545, comments: 76, shares: 52, createdAt: new Date(Date.now() - 316800000).toISOString() },
    ];
    contents.forEach((content) => this.contents.set(content.id, content));

    const quizQuestions: QuizQuestion[] = [
      { id: "qq-1", contentId: "content-1", question: "Qu'est-ce qu'un trou noir ?", options: ["Une étoile très brillante", "Une région où la gravité est si forte que rien ne peut s'en échapper", "Un trou dans l'espace vide", "Une planète sans lumière"], correctOptionIndex: 1, explanation: "Un trou noir est une région de l'espace-temps où la gravité est si intense que rien, pas même la lumière, ne peut s'en échapper.", order: 0 },
      { id: "qq-2", contentId: "content-1", question: "Comment se forme un trou noir stellaire ?", options: ["Par collision de planètes", "Par l'effondrement d'une étoile massive", "Par explosion du Big Bang", "Par refroidissement d'une nébuleuse"], correctOptionIndex: 1, explanation: "Un trou noir stellaire se forme quand une étoile massive (plus de 20 fois le Soleil) s'effondre sur elle-même en fin de vie.", order: 1 },
      { id: "qq-3", contentId: "content-3", question: "Quelle est la forme générale d'une équation du second degré ?", options: ["ax + b = 0", "ax² + bx + c = 0", "ax³ + bx² + cx + d = 0", "a/x + b = 0"], correctOptionIndex: 1, explanation: "La forme générale est ax² + bx + c = 0 avec a ≠ 0", order: 0 },
      { id: "qq-4", contentId: "content-3", question: "Que représente le discriminant Δ ?", options: ["La somme des racines", "Le produit des racines", "Il détermine le nombre de solutions", "La valeur de x"], correctOptionIndex: 2, explanation: "Δ = b² - 4ac détermine si l'équation a 0, 1 ou 2 solutions réelles", order: 1 },
      { id: "qq-5", contentId: "content-3", question: "Si Δ > 0, combien de solutions réelles ?", options: ["0", "1", "2", "Infini"], correctOptionIndex: 2, explanation: "Quand Δ > 0, il y a deux solutions réelles distinctes", order: 2 },
      { id: "qq-6", contentId: "content-5", question: "Quel langage est utilisé pour programmer Arduino ?", options: ["Python", "C/C++", "Java", "JavaScript"], correctOptionIndex: 1, explanation: "Arduino utilise un langage basé sur C/C++ avec des fonctions spécifiques comme setup() et loop().", order: 0 },
      { id: "qq-7", contentId: "content-5", question: "Que signifie LED ?", options: ["Light Energy Device", "Light Emitting Diode", "Low Energy Display", "Laser Emitting Device"], correctOptionIndex: 1, explanation: "LED signifie Light Emitting Diode (diode électroluminescente).", order: 1 },
      { id: "qq-8", contentId: "content-8", question: "Quelle est la loi d'Ohm ?", options: ["P = UI", "U = R × I", "E = mc²", "F = ma"], correctOptionIndex: 1, explanation: "La loi d'Ohm établit que la tension U est égale au produit de la résistance R par l'intensité I.", order: 0 },
      { id: "qq-9", contentId: "content-8", question: "Quelle unité mesure la résistance électrique ?", options: ["Ampère", "Volt", "Ohm", "Watt"], correctOptionIndex: 2, explanation: "L'ohm (Ω) est l'unité de mesure de la résistance électrique.", order: 1 },
      { id: "qq-10", contentId: "content-9", question: "Quel phénomène permet aux panneaux solaires de produire de l'électricité ?", options: ["L'effet de serre", "L'effet photovoltaïque", "La fusion nucléaire", "L'effet Doppler"], correctOptionIndex: 1, explanation: "L'effet photovoltaïque convertit l'énergie lumineuse en énergie électrique.", order: 0 },
      { id: "qq-11", contentId: "content-9", question: "De quel matériau sont principalement faits les panneaux solaires ?", options: ["Cuivre", "Aluminium", "Silicium", "Fer"], correctOptionIndex: 2, explanation: "Le silicium est le semi-conducteur principal utilisé dans les cellules photovoltaïques.", order: 1 },
      { id: "qq-12", contentId: "content-10", question: "Quel pourcentage de l'univers est composé de matière noire ?", options: ["5%", "15%", "27%", "50%"], correctOptionIndex: 2, explanation: "La matière noire compose environ 27% de l'univers, tandis que la matière ordinaire n'en représente que 5%.", order: 0 },
      { id: "qq-13", contentId: "content-10", question: "Pourquoi la matière noire est-elle appelée 'noire' ?", options: ["Elle est de couleur noire", "Elle n'émet pas de lumière détectable", "Elle absorbe toute la lumière", "Elle se trouve dans les trous noirs"], correctOptionIndex: 1, explanation: "La matière noire est 'noire' car elle n'émet, n'absorbe ni ne réfléchit la lumière.", order: 1 },
      { id: "qq-14", contentId: "content-11", question: "Quels récepteurs détectent la douleur ?", options: ["Photorécepteurs", "Nocicepteurs", "Mécanorécepteurs", "Thermorécepteurs"], correctOptionIndex: 1, explanation: "Les nocicepteurs sont des récepteurs sensoriels spécialisés dans la détection de la douleur.", order: 0 },
      { id: "qq-15", contentId: "content-11", question: "Où le signal de douleur est-il principalement traité ?", options: ["Dans le coeur", "Dans le cerveau", "Dans la moelle épinière", "Dans le foie"], correctOptionIndex: 1, explanation: "Le cerveau interprète et traite les signaux de douleur, notamment dans le cortex somatosensoriel.", order: 1 },
      { id: "qq-16", contentId: "content-14", question: "Qui a dirigé l'équipe de développement du logiciel Apollo ?", options: ["Alan Turing", "Margaret Hamilton", "Grace Hopper", "Ada Lovelace"], correctOptionIndex: 1, explanation: "Margaret Hamilton a dirigé l'équipe du MIT qui a développé le logiciel de navigation d'Apollo.", order: 0 },
      { id: "qq-17", contentId: "content-14", question: "En quelle année le premier alunissage a-t-il eu lieu ?", options: ["1965", "1967", "1969", "1971"], correctOptionIndex: 2, explanation: "Apollo 11 a atterri sur la Lune le 20 juillet 1969.", order: 1 },
      { id: "qq-18", contentId: "content-15", question: "Quel protocole est utilisé pour naviguer sur le web ?", options: ["FTP", "HTTP/HTTPS", "SMTP", "SSH"], correctOptionIndex: 1, explanation: "HTTP (HyperText Transfer Protocol) et sa version sécurisée HTTPS sont les protocoles du web.", order: 0 },
      { id: "qq-19", contentId: "content-15", question: "Comment les données voyagent-elles entre les continents ?", options: ["Par satellite uniquement", "Par ondes radio", "Par câbles sous-marins à fibre optique", "Par Wi-Fi longue portée"], correctOptionIndex: 2, explanation: "Plus de 95% du trafic intercontinental passe par des câbles sous-marins à fibre optique.", order: 1 },
      { id: "qq-20", contentId: "content-16", question: "Qu'est-ce qu'un algorithme ?", options: ["Un type d'ordinateur", "Une suite d'instructions pour résoudre un problème", "Un langage de programmation", "Un logiciel antivirus"], correctOptionIndex: 1, explanation: "Un algorithme est une suite finie d'instructions ordonnées permettant de résoudre un problème.", order: 0 },
      { id: "qq-21", contentId: "content-16", question: "Quel algorithme est utilisé pour trier des éléments ?", options: ["Algorithme de Dijkstra", "Algorithme de tri à bulles", "Algorithme RSA", "Algorithme PageRank"], correctOptionIndex: 1, explanation: "Le tri à bulles est un algorithme simple de tri qui compare les éléments adjacents.", order: 1 },
      { id: "qq-22", contentId: "content-18", question: "Quel est le gratte-ciel le plus haut du monde en 2024 ?", options: ["Empire State Building", "Shanghai Tower", "Burj Khalifa", "One World Trade Center"], correctOptionIndex: 2, explanation: "Le Burj Khalifa à Dubaï culmine à 828 mètres, ce qui en fait le plus haut bâtiment du monde.", order: 0 },
      { id: "qq-23", contentId: "content-18", question: "Pourquoi les gratte-ciel oscillent-ils au vent ?", options: ["Erreur de construction", "Pour absorber l'énergie du vent et éviter de casser", "À cause des tremblements de terre", "Car les matériaux sont défectueux"], correctOptionIndex: 1, explanation: "La flexibilité est voulue : elle permet au bâtiment d'absorber l'énergie du vent sans se briser.", order: 1 },
      { id: "qq-24", contentId: "content-21", question: "Quelle loi de Newton explique la propulsion d'une fusée ?", options: ["Première loi (inertie)", "Deuxième loi (F=ma)", "Troisième loi (action-réaction)", "Loi de la gravitation"], correctOptionIndex: 2, explanation: "La troisième loi de Newton (action-réaction) : les gaz éjectés vers le bas poussent la fusée vers le haut.", order: 0 },
      { id: "qq-25", contentId: "content-21", question: "Quelle vitesse une fusée doit-elle atteindre pour quitter la Terre ?", options: ["1 000 km/h", "11 200 km/h", "28 000 km/h", "100 000 km/h"], correctOptionIndex: 1, explanation: "La vitesse de libération terrestre est d'environ 11 200 km/h (11,2 km/s).", order: 1 },
      { id: "qq-26", contentId: "content-22", question: "Quelle est la valeur approchée de Pi ?", options: ["2,14159", "3,14159", "4,14159", "3,41592"], correctOptionIndex: 1, explanation: "Pi (π) est approximativement égal à 3,14159... C'est un nombre irrationnel avec des décimales infinies.", order: 0 },
      { id: "qq-27", contentId: "content-22", question: "Que mesure Pi ?", options: ["L'aire d'un cercle", "Le rapport entre la circonférence et le diamètre", "Le rayon d'un cercle", "La diagonale d'un carré"], correctOptionIndex: 1, explanation: "Pi est le rapport constant entre la circonférence d'un cercle et son diamètre.", order: 1 },
      { id: "qq-28", contentId: "content-23", question: "Dans l'énigme du pont, combien de personnes doivent traverser ?", options: ["2", "3", "4", "5"], correctOptionIndex: 2, explanation: "Quatre personnes doivent traverser le pont avant l'arrivée des zombies.", order: 0 },
      { id: "qq-29", contentId: "content-23", question: "Quel concept mathématique est au coeur de cette énigme ?", options: ["La trigonométrie", "L'optimisation et la logique", "Les fractions", "Les statistiques"], correctOptionIndex: 1, explanation: "L'énigme demande d'optimiser le temps de traversée en utilisant la logique combinatoire.", order: 1 },
      { id: "qq-30", contentId: "content-24", question: "Que signifie 'surbooking' ?", options: ["Annulation de vol", "Vente de plus de billets que de places", "Retard de vol", "Vol avec escale"], correctOptionIndex: 1, explanation: "Le surbooking consiste à vendre plus de billets que de sièges disponibles, en anticipant les annulations.", order: 0 },
      { id: "qq-31", contentId: "content-24", question: "Quel outil mathématique permet de calculer le risque de surbooking ?", options: ["La géométrie", "Les probabilités et statistiques", "L'algèbre linéaire", "Le calcul différentiel"], correctOptionIndex: 1, explanation: "Les compagnies utilisent les probabilités pour estimer le taux de no-show et décider du niveau de surbooking.", order: 1 },
      { id: "qq-32", contentId: "content-6", question: "Combien de planètes composent notre système solaire ?", options: ["7", "8", "9", "10"], correctOptionIndex: 1, explanation: "Notre système solaire compte 8 planètes depuis que Pluton a été reclassée en planète naine en 2006.", order: 0 },
      { id: "qq-33", contentId: "content-6", question: "Quelle est la plus grande planète du système solaire ?", options: ["Saturne", "Neptune", "Jupiter", "Uranus"], correctOptionIndex: 2, explanation: "Jupiter est la plus grande planète avec un diamètre de 139 820 km, soit 11 fois celui de la Terre.", order: 1 },
      { id: "qq-34", contentId: "content-12", question: "Quelle hormone est appelée 'l'hormone de l'amour' ?", options: ["Adrénaline", "Cortisol", "Ocytocine", "Insuline"], correctOptionIndex: 2, explanation: "L'ocytocine est souvent appelée l'hormone de l'amour car elle est libérée lors de câlins et de liens sociaux.", order: 0 },
      { id: "qq-35", contentId: "content-13", question: "Quelle force maintient les planètes en orbite autour du Soleil ?", options: ["La force électromagnétique", "La force gravitationnelle", "La force nucléaire", "La force centrifuge"], correctOptionIndex: 1, explanation: "La force gravitationnelle, décrite par Newton puis Einstein, maintient les planètes en orbite autour du Soleil.", order: 0 },
      { id: "qq-36", contentId: "content-13", question: "Qui a formulé la loi de la gravitation universelle ?", options: ["Albert Einstein", "Isaac Newton", "Galileo Galilei", "Johannes Kepler"], correctOptionIndex: 1, explanation: "Isaac Newton a formulé la loi de la gravitation universelle en 1687 dans ses Principia Mathematica.", order: 1 },
      { id: "qq-37", contentId: "content-17", question: "Qu'est-ce qu'une variable en programmation ?", options: ["Une erreur dans le code", "Un espace mémoire qui stocke une valeur", "Un type de processeur", "Un langage de programmation"], correctOptionIndex: 1, explanation: "Une variable est un espace mémoire nommé qui permet de stocker et manipuler des données dans un programme.", order: 0 },
      { id: "qq-38", contentId: "content-17", question: "Qu'est-ce qu'une boucle en programmation ?", options: ["Un bug informatique", "Une instruction qui se répète", "Un type de variable", "Un commentaire dans le code"], correctOptionIndex: 1, explanation: "Une boucle est une structure qui permet de répéter un bloc d'instructions un certain nombre de fois.", order: 1 },
      { id: "qq-39", contentId: "content-19", question: "Dans quels produits du quotidien trouve-t-on de la chimie ?", options: ["Uniquement les médicaments", "Les cosmétiques, aliments et vêtements", "Seulement les produits industriels", "Aucun produit naturel"], correctOptionIndex: 1, explanation: "La chimie est présente partout : cosmétiques, aliments, textiles, plastiques, produits d'entretien et bien plus.", order: 0 },
      { id: "qq-40", contentId: "content-20", question: "Quelle planète est la plus proche du Soleil ?", options: ["Vénus", "Terre", "Mercure", "Mars"], correctOptionIndex: 2, explanation: "Mercure est la planète la plus proche du Soleil, à une distance moyenne de 58 millions de km.", order: 0 },
      { id: "qq-41", contentId: "content-20", question: "Pourquoi un modèle réduit du système solaire est-il utile ?", options: ["Pour décorer", "Pour comprendre les échelles et distances entre planètes", "Pour remplacer un télescope", "Pour calculer la gravité"], correctOptionIndex: 1, explanation: "Un modèle réduit aide à visualiser les immenses distances et les tailles relatives des planètes.", order: 1 },
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
      { id: "mission-1", missionType: "watch_videos", title: "Explorateur du jour", description: "Regarde 3 vidéos de science", targetValue: 3, currentProgress: 1, xpReward: 100, frequency: "daily", category: "science", completed: false, expiresAt: null },
      { id: "mission-2", missionType: "complete_quiz", title: "Maître des quiz", description: "Complète 2 quiz cette semaine", targetValue: 2, currentProgress: 0, xpReward: 150, frequency: "weekly", category: null, completed: false, expiresAt: null },
      { id: "mission-3", missionType: "join_salon", title: "Socialise !", description: "Rejoins un nouveau salon", targetValue: 1, currentProgress: 0, xpReward: 75, frequency: "one_time", category: null, completed: false, expiresAt: null },
      { id: "mission-4", missionType: "comment", title: "Participe à la discussion", description: "Commente 2 publications", targetValue: 2, currentProgress: 1, xpReward: 50, frequency: "daily", category: null, completed: false, expiresAt: null },
      { id: "mission-5", missionType: "streak", title: "Série de 7 jours", description: "Connecte-toi 7 jours de suite", targetValue: 7, currentProgress: 3, xpReward: 300, frequency: "one_time", category: null, completed: false, expiresAt: null },
      { id: "mission-6", missionType: "share_content", title: "Ambassadeur STEM", description: "Partage 1 contenu avec un ami", targetValue: 1, currentProgress: 1, xpReward: 50, frequency: "daily", category: null, completed: true, expiresAt: null },
      { id: "mission-7", missionType: "create_content", title: "Créateur de contenu", description: "Publie un nouveau contenu", targetValue: 1, currentProgress: 0, xpReward: 200, frequency: "weekly", category: null, completed: false, expiresAt: null },
    ];
    missions.forEach((mission) => this.missions.set(mission.id, mission));

    const leaderboardUsers: User[] = [
      { id: "lb-user-1", username: "Dr. Marie Curie", email: "marie@stemflow.com", password: "", isActive: true, activationCode: null, oauthId: null, oauthProvider: null, profileImageUrl: null, xp: 4500, level: "challenger", streak: 15, onboardingCompleted: true, preferredLanguage: "fr", educationLevel: "universite", interests: ["science"], createdAt: new Date().toISOString() },
      { id: "lb-user-2", username: "Alan Turing", email: "alan@stemflow.com", password: "", isActive: true, activationCode: null, oauthId: null, oauthProvider: null, profileImageUrl: null, xp: 3800, level: "analyste", streak: 22, onboardingCompleted: true, preferredLanguage: "en", educationLevel: "universite", interests: ["technology", "mathematics"], createdAt: new Date().toISOString() },
      { id: "lb-user-3", username: "Ada Lovelace", email: "ada@stemflow.com", password: "", isActive: true, activationCode: null, oauthId: null, oauthProvider: null, profileImageUrl: null, xp: 3200, level: "analyste", streak: 10, onboardingCompleted: true, preferredLanguage: "en", educationLevel: "universite", interests: ["technology"], createdAt: new Date().toISOString() },
      { id: "lb-user-4", username: "Pierre Fermat", email: "pierre@stemflow.com", password: "", isActive: true, activationCode: null, oauthId: null, oauthProvider: null, profileImageUrl: null, xp: 2900, level: "analyste", streak: 8, onboardingCompleted: true, preferredLanguage: "fr", educationLevel: "universite", interests: ["mathematics"], createdAt: new Date().toISOString() },
      { id: "lb-user-5", username: "Nikola Tesla", email: "nikola@stemflow.com", password: "", isActive: true, activationCode: null, oauthId: null, oauthProvider: null, profileImageUrl: null, xp: 2500, level: "explorateur", streak: 12, onboardingCompleted: true, preferredLanguage: "en", educationLevel: "universite", interests: ["engineering", "technology"], createdAt: new Date().toISOString() },
    ];
    leaderboardUsers.forEach((u) => this.users.set(u.id, u));

    const seedComments: Comment[] = [
      { id: "comment-1", contentId: "content-1", userId: "lb-user-1", authorName: "Dr. Marie Curie", text: "Excellent contenu ! Les trous noirs sont fascinants.", parentId: null, likes: 5, createdAt: new Date(Date.now() - 3600000).toISOString() },
      { id: "comment-2", contentId: "content-2", userId: "lb-user-2", authorName: "Alan Turing", text: "Bonne introduction à l'IA. J'aurais ajouté un mot sur le deep learning.", parentId: null, likes: 3, createdAt: new Date(Date.now() - 7200000).toISOString() },
      { id: "comment-3", contentId: "content-1", userId: "lb-user-3", authorName: "Ada Lovelace", text: "Très bien expliqué, merci pour ce partage !", parentId: null, likes: 2, createdAt: new Date(Date.now() - 1800000).toISOString() },
      { id: "comment-4", contentId: "content-1", userId: "lb-user-2", authorName: "Alan Turing", text: "Tout à fait d'accord ! La singularité est le concept le plus intrigant.", parentId: "comment-1", likes: 1, createdAt: new Date(Date.now() - 3000000).toISOString() },
      { id: "comment-5", contentId: "content-1", userId: "lb-user-4", authorName: "Pierre Fermat", text: "Les maths derrière la relativité générale sont magnifiques.", parentId: "comment-1", likes: 3, createdAt: new Date(Date.now() - 2400000).toISOString() },
      { id: "comment-6", contentId: "content-2", userId: "lb-user-5", authorName: "Nikola Tesla", text: "Le deep learning est effectivement crucial pour comprendre l'IA moderne.", parentId: "comment-2", likes: 2, createdAt: new Date(Date.now() - 6000000).toISOString() },
    ];
    seedComments.forEach((c) => this.comments.set(c.id, c));

    const seedActivities: Activity[] = [
      { id: "act-1", userId: "lb-user-1", username: "Dr. Marie Curie", activityType: "content_created", description: "a publie un nouveau contenu : Comment fonctionne un trou noir ?", metadata: null, createdAt: new Date(Date.now() - 1800000).toISOString() },
      { id: "act-2", userId: "lb-user-2", username: "Alan Turing", activityType: "quiz_completed", description: "a complete un quiz en Technologie avec 95%", metadata: null, createdAt: new Date(Date.now() - 3600000).toISOString() },
      { id: "act-3", userId: "lb-user-3", username: "Ada Lovelace", activityType: "room_joined", description: "a rejoint le salon Robotique Club", metadata: null, createdAt: new Date(Date.now() - 7200000).toISOString() },
      { id: "act-4", userId: "lb-user-4", username: "Pierre Fermat", activityType: "badge_earned", description: "a obtenu le badge Expert Quiz", metadata: null, createdAt: new Date(Date.now() - 10800000).toISOString() },
      { id: "act-5", userId: "lb-user-5", username: "Nikola Tesla", activityType: "level_up", description: "est passe au niveau Explorateur", metadata: null, createdAt: new Date(Date.now() - 14400000).toISOString() },
      { id: "act-6", userId: "lb-user-1", username: "Dr. Marie Curie", activityType: "mission_completed", description: "a complete la mission Explorateur du jour", metadata: null, createdAt: new Date(Date.now() - 18000000).toISOString() },
      { id: "act-7", userId: "lb-user-2", username: "Alan Turing", activityType: "content_created", description: "a publie un nouveau contenu : L'intelligence artificielle expliquee simplement", metadata: null, createdAt: new Date(Date.now() - 21600000).toISOString() },
      { id: "act-8", userId: "lb-user-3", username: "Ada Lovelace", activityType: "quiz_completed", description: "a complete un quiz en Mathematiques avec 100%", metadata: null, createdAt: new Date(Date.now() - 25200000).toISOString() },
      { id: "act-9", userId: "lb-user-4", username: "Pierre Fermat", activityType: "content_created", description: "a publie un nouveau contenu : Le theoreme de Pythagore dans la vraie vie", metadata: null, createdAt: new Date(Date.now() - 28800000).toISOString() },
      { id: "act-10", userId: "lb-user-5", username: "Nikola Tesla", activityType: "room_joined", description: "a rejoint le salon Ingenieurs en herbe", metadata: null, createdAt: new Date(Date.now() - 32400000).toISOString() },
    ];
    seedActivities.forEach((a) => this.activities.set(a.id, a));

    const seedRoomPosts: RoomPost[] = [
      { id: "rp-1", roomId: "room-1", userId: "lb-user-1", username: "Dr. Marie Curie", text: "Qui a vu le dernier documentaire sur les trous noirs ? Les images du James Webb sont incroyables !", likes: 12, createdAt: new Date(Date.now() - 1800000).toISOString() },
      { id: "rp-2", roomId: "room-1", userId: "lb-user-4", username: "Pierre Fermat", text: "Je recommande le livre 'Cosmos' de Carl Sagan pour comprendre les bases de l'astrophysique. Un classique !", likes: 8, createdAt: new Date(Date.now() - 5400000).toISOString() },
      { id: "rp-3", roomId: "room-1", userId: "lb-user-3", username: "Ada Lovelace", text: "Est-ce que quelqu'un peut m'expliquer la difference entre fusion et fission nucleaire ? Je prepare un expose.", likes: 5, createdAt: new Date(Date.now() - 10800000).toISOString() },
      { id: "rp-4", roomId: "room-2", userId: "lb-user-2", username: "Alan Turing", text: "Je viens de terminer mon premier projet avec React et Node.js. Le full-stack, c'est passionnant !", likes: 15, createdAt: new Date(Date.now() - 3600000).toISOString() },
      { id: "rp-5", roomId: "room-2", userId: "lb-user-5", username: "Nikola Tesla", text: "Quelqu'un a deja utilise un Raspberry Pi pour un projet IoT ? Je cherche des idees pour debuter.", likes: 9, createdAt: new Date(Date.now() - 7200000).toISOString() },
      { id: "rp-6", roomId: "room-2", userId: "lb-user-3", username: "Ada Lovelace", text: "L'IA generative va revolutionner la facon dont on apprend. Qu'en pensez-vous ?", likes: 11, createdAt: new Date(Date.now() - 14400000).toISOString() },
      { id: "rp-7", roomId: "room-1", userId: "lb-user-5", username: "Nikola Tesla", text: "La physique quantique me fascine. Avez-vous des ressources pour les debutants ?", likes: 7, createdAt: new Date(Date.now() - 21600000).toISOString() },
    ];
    seedRoomPosts.forEach((p) => this.roomPosts.set(p.id, p));

    const seedNotifications: Notification[] = [
      { id: "notif-1", userId: "user-1", type: "xp_gained", title: "Bienvenue sur STEM FLOW !", message: "Tu as gagné 50 XP de bienvenue. Commence ton aventure STEM !", read: false, createdAt: new Date(Date.now() - 600000).toISOString() },
      { id: "notif-2", userId: "user-1", type: "badge_earned", title: "Nouveau badge: Explorateur", message: "Tu as débloqué le badge Explorateur. Continue comme ça !", read: false, createdAt: new Date(Date.now() - 1800000).toISOString() },
      { id: "notif-3", userId: "user-1", type: "level_up", title: "Tu es maintenant niveau Curieux", message: "Félicitations ! Tu as atteint le niveau Curieux.", read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
      { id: "notif-4", userId: "user-1", type: "streak_milestone", title: "3 jours de streak!", message: "Tu es connecté 3 jours de suite. Continue pour débloquer des récompenses !", read: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
    ];
    seedNotifications.forEach((n) => this.notifications.set(n.id, n));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email.toLowerCase());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const user: User = {
      ...insertUser,
      id,
      email: insertUser.email.toLowerCase(),
      isActive: false,
      activationCode,
      oauthId: null,
      oauthProvider: null,
      profileImageUrl: null,
      preferredLanguage: "fr",
      educationLevel: null,
      interests: null,
      level: "curieux",
      xp: 0,
      streak: 0,
      onboardingCompleted: false,
      createdAt: new Date().toISOString(),
    };
    this.users.set(id, user);
    return user;
  }

  async activateUser(email: string, code: string): Promise<User | undefined> {
    const user = Array.from(this.users.values()).find(
      (u) => u.email === email.toLowerCase()
    );
    if (!user || user.activationCode !== code) return undefined;
    const activated = { ...user, isActive: true, activationCode: null };
    this.users.set(user.id, activated);
    return activated;
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

  async toggleLike(contentId: string, userId: string): Promise<{ liked: boolean; likeCount: number }> {
    const content = this.contents.get(contentId);
    if (!content) return { liked: false, likeCount: 0 };

    if (!this.contentLikes.has(contentId)) {
      this.contentLikes.set(contentId, new Set());
    }
    const likes = this.contentLikes.get(contentId)!;

    if (likes.has(userId)) {
      likes.delete(userId);
      content.likes = Math.max(0, (content.likes ?? 0) - 1);
      this.contents.set(contentId, content);
      return { liked: false, likeCount: content.likes };
    } else {
      likes.add(userId);
      content.likes = (content.likes ?? 0) + 1;
      this.contents.set(contentId, content);
      return { liked: true, likeCount: content.likes };
    }
  }

  async hasUserLiked(contentId: string, userId: string): Promise<boolean> {
    return this.contentLikes.get(contentId)?.has(userId) || false;
  }

  async getUserLikes(userId: string): Promise<string[]> {
    const likedContentIds: string[] = [];
    this.contentLikes.forEach((userSet, contentId) => {
      if (userSet.has(userId)) likedContentIds.push(contentId);
    });
    return likedContentIds;
  }

  async getUserLikedCategories(userId: string, limit = 20): Promise<{ category: string; liked: boolean }[]> {
    const likedContentIds = await this.getUserLikes(userId);
    return likedContentIds.slice(0, limit).map(contentId => {
      const content = this.contents.get(contentId);
      return { category: content?.category || "science", liked: true };
    });
  }

  async getUserEngagedCategories(userId: string): Promise<string[]> {
    const likedContentIds = await this.getUserLikes(userId);
    const categories = new Set<string>();
    likedContentIds.forEach(contentId => {
      const content = this.contents.get(contentId);
      if (content) categories.add(content.category);
    });
    this.quizAttempts.forEach(attempt => {
      if (attempt.userId === userId) {
        const content = this.contents.get(attempt.contentId);
        if (content) categories.add(content.category);
      }
    });
    return Array.from(categories);
  }

  async shareContent(contentId: string): Promise<void> {
    const content = this.contents.get(contentId);
    if (content) {
      content.shares = (content.shares ?? 0) + 1;
      this.contents.set(contentId, content);
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

  async decrementCommentCount(contentId: string): Promise<void> {
    const content = this.contents.get(contentId);
    if (content) {
      content.comments = Math.max(0, (content.comments ?? 0) - 1);
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
      .filter((c) => c.contentId === contentId && !c.parentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getReplies(parentId: string): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter((c) => c.parentId === parentId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async getCommentById(commentId: string): Promise<Comment | undefined> {
    return this.comments.get(commentId);
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const newComment: Comment = {
      ...comment,
      id,
      parentId: comment.parentId || null,
      likes: 0,
      createdAt: comment.createdAt || new Date().toISOString(),
    };
    this.comments.set(id, newComment);
    await this.incrementCommentCount(comment.contentId);
    return newComment;
  }

  async deleteComment(commentId: string, userId: string): Promise<boolean> {
    const comment = this.comments.get(commentId);
    if (!comment) return false;
    if (comment.userId !== userId) return false;
    const replies = Array.from(this.comments.values()).filter((c) => c.parentId === commentId);
    for (const reply of replies) {
      this.comments.delete(reply.id);
      await this.decrementCommentCount(reply.contentId);
    }
    this.comments.delete(commentId);
    await this.decrementCommentCount(comment.contentId);
    return true;
  }

  async toggleCommentLike(commentId: string, userId: string): Promise<{ liked: boolean; likeCount: number }> {
    const comment = this.comments.get(commentId);
    if (!comment) return { liked: false, likeCount: 0 };
    if (!this.commentLikes.has(commentId)) {
      this.commentLikes.set(commentId, new Set());
    }
    const likes = this.commentLikes.get(commentId)!;
    if (likes.has(userId)) {
      likes.delete(userId);
      comment.likes = Math.max(0, (comment.likes ?? 0) - 1);
    } else {
      likes.add(userId);
      comment.likes = (comment.likes ?? 0) + 1;
    }
    this.comments.set(commentId, comment);
    return { liked: likes.has(userId), likeCount: comment.likes ?? 0 };
  }

  async hasUserLikedComment(commentId: string, userId: string): Promise<boolean> {
    return this.commentLikes.get(commentId)?.has(userId) ?? false;
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
    return Array.from(this.rooms.values()).sort((a, b) => (b.memberCount ?? 0) - (a.memberCount ?? 0));
  }

  async getRoom(id: string): Promise<Room | undefined> {
    return this.rooms.get(id);
  }

  async createRoom(room: InsertRoom): Promise<Room> {
    const id = randomUUID();
    const newRoom: Room = { ...room, id, imageUrl: room.imageUrl ?? null, memberCount: 0, createdAt: new Date().toISOString() };
    this.rooms.set(id, newRoom);
    return newRoom;
  }

  async joinRoom(roomId: string, userId: string, role: string): Promise<RoomMember> {
    const id = randomUUID();
    const member: RoomMember = { id, roomId, userId, role: role as any, xpInRoom: 0, joinedAt: new Date().toISOString() };
    this.roomMembers.set(id, member);
    const room = this.rooms.get(roomId);
    if (room) {
      room.memberCount = (room.memberCount ?? 0) + 1;
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
    const newMission: Mission = { ...mission, id, category: mission.category ?? null, expiresAt: mission.expiresAt ?? null, currentProgress: 0, completed: false };
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

  async followUser(followerId: string, followingId: string): Promise<void> {
    const existing = Array.from(this.follows.values()).find(
      (f) => f.followerId === followerId && f.followingId === followingId
    );
    if (existing) return;
    const id = randomUUID();
    const follow: Follow = { id, followerId, followingId, createdAt: new Date().toISOString() };
    this.follows.set(id, follow);
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    const entry = Array.from(this.follows.entries()).find(
      ([, f]) => f.followerId === followerId && f.followingId === followingId
    );
    if (entry) {
      this.follows.delete(entry[0]);
    }
  }

  async getFollowers(userId: string): Promise<string[]> {
    return Array.from(this.follows.values())
      .filter((f) => f.followingId === userId)
      .map((f) => f.followerId);
  }

  async getFollowing(userId: string): Promise<string[]> {
    return Array.from(this.follows.values())
      .filter((f) => f.followerId === userId)
      .map((f) => f.followingId);
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    return Array.from(this.follows.values()).some(
      (f) => f.followerId === followerId && f.followingId === followingId
    );
  }

  async getFollowCounts(userId: string): Promise<{followers: number, following: number}> {
    const followers = Array.from(this.follows.values()).filter((f) => f.followingId === userId).length;
    const following = Array.from(this.follows.values()).filter((f) => f.followerId === userId).length;
    return { followers, following };
  }

  async createActivity(activity: {userId: string, username: string, activityType: string, description: string, metadata?: string}): Promise<Activity> {
    const id = randomUUID();
    const newActivity: Activity = {
      id,
      userId: activity.userId,
      username: activity.username,
      activityType: activity.activityType as any,
      description: activity.description,
      metadata: activity.metadata || null,
      createdAt: new Date().toISOString(),
    };
    this.activities.set(id, newActivity);
    return newActivity;
  }

  async getActivitiesByUser(userId: string): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter((a) => a.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getActivitiesFeed(userIds: string[]): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter((a) => userIds.includes(a.userId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 50);
  }

  async searchUsers(query: string): Promise<User[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.users.values())
      .filter((u) => u.username.toLowerCase().includes(lowerQuery))
      .slice(0, 20);
  }

  async getRoomPosts(roomId: string): Promise<RoomPost[]> {
    return Array.from(this.roomPosts.values())
      .filter((p) => p.roomId === roomId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createRoomPost(post: Omit<RoomPost, 'id' | 'likes' | 'createdAt'>): Promise<RoomPost> {
    const id = randomUUID();
    const newPost: RoomPost = {
      ...post,
      id,
      likes: 0,
      createdAt: new Date().toISOString(),
    };
    this.roomPosts.set(id, newPost);
    return newPost;
  }

  async likeRoomPost(postId: string, userId: string): Promise<{ liked: boolean; likeCount: number }> {
    const post = this.roomPosts.get(postId);
    if (!post) return { liked: false, likeCount: 0 };
    if (!this.roomPostLikes.has(postId)) {
      this.roomPostLikes.set(postId, new Set());
    }
    const likes = this.roomPostLikes.get(postId)!;
    if (likes.has(userId)) {
      likes.delete(userId);
      post.likes = Math.max(0, (post.likes ?? 0) - 1);
    } else {
      likes.add(userId);
      post.likes = (post.likes ?? 0) + 1;
    }
    this.roomPosts.set(postId, post);
    return { liked: likes.has(userId), likeCount: post.likes ?? 0 };
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createNotification(notif: Omit<Notification, "id" | "read" | "createdAt">): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = {
      ...notif,
      id,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationRead(id: string): Promise<void> {
    const notif = this.notifications.get(id);
    if (notif) {
      this.notifications.set(id, { ...notif, read: true });
    }
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    this.notifications.forEach((notif, id) => {
      if (notif.userId === userId && !notif.read) {
        this.notifications.set(id, { ...notif, read: true });
      }
    });
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    return Array.from(this.notifications.values())
      .filter((n) => n.userId === userId && !n.read)
      .length;
  }

  async createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<PasswordResetToken> {
    const id = randomUUID();
    const resetToken: PasswordResetToken = { id, userId, token, expiresAt, used: false, createdAt: new Date() };
    return resetToken;
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    return undefined;
  }

  async markTokenUsed(tokenId: string): Promise<void> {}

  async deleteExpiredTokens(): Promise<void> {}

  async updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      this.users.set(userId, { ...user, password: hashedPassword });
    }
  }

  async getUserByOAuthId(oauthId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((u) => u.oauthId === oauthId);
  }

  async createOrLinkOAuthUser(oauthId: string, oauthProvider: string, email: string | null, firstName: string | null, lastName: string | null, profileImageUrl: string | null): Promise<User> {
    if (email) {
      const existing = await this.getUserByEmail(email);
      if (existing) {
        const updated = { ...existing, oauthId, oauthProvider, profileImageUrl: profileImageUrl || existing.profileImageUrl };
        this.users.set(existing.id, updated);
        return updated;
      }
    }
    const byOauth = await this.getUserByOAuthId(oauthId);
    if (byOauth) return byOauth;
    const id = randomUUID();
    const username = firstName ? `${firstName}${lastName ? '_' + lastName : ''}_${id.slice(0, 4)}` : `user_${id.slice(0, 8)}`;
    const user: User = {
      id, username, email: email || `${oauthId}@oauth.local`, password: "oauth_no_password",
      isActive: true, activationCode: null, oauthId, oauthProvider, profileImageUrl,
      preferredLanguage: "fr", educationLevel: null, interests: null,
      level: "curieux", xp: 0, streak: 0, onboardingCompleted: false,
      createdAt: new Date().toISOString(),
    };
    this.users.set(id, user);
    return user;
  }
}

import { DatabaseStorage } from "./dbStorage";
export const storage: IStorage = new DatabaseStorage();
