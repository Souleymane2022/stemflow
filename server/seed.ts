import { db } from "./db";
import {
  rooms, users, contents, quizQuestions, quizAttempts, missions,
  commentsTable, badges, userBadges, activities, roomPosts, follows,
  notifications, videoEngagements, engagementStats, contentLikes,
  commentLikes, roomPostLikes, roomMembers, passwordResetTokens
} from "@shared/schema";
import { sql } from "drizzle-orm";

const africanFirstNames = [
  "Amadou", "Fatou", "Kwame", "Awa", "Kofi", "Nia", "Tariq", "Zainab", "Chidi", "Ngozi",
  "Ousmane", "Aminata", "Moussa", "Mariam", "Saliou", "Adama", "Binta", "Idrissa", "Aïcha", "Cheikh",
  "Youssouf", "Fanta", "Salif", "Kadiatou", "Mamadou", "Hawa", "Ibrahim", "Djibril", "Oumar", "Aliou",
  "Kossi", "Afia", "Sena", "Amevi", "Kwami", "Enyonam", "Kodjo", "Akouvi", "Kokou", "Afi",
  "Mahamoud", "Zara", "Abakar", "Fatime", "Ahmat", "Hissein", "Zenab", "Issa", "Khadidja", "Mahamat",
  "Sessinou", "Mahougnon", "Sègbégnon", "Fifamè", "Sèna", "Gbèdonougbo", "Sèdami", "Koffi", "Ahou", "Yao",
  "Senghor", "Thomas", "Nelson", "Desmond", "Wangari", "Miriam", "Fela", "Sankara", "Lumumba", "Nnamdi"
];

const africanLastNames = [
  "Diop", "Ndiaye", "Fall", "Sarr", "Sylla", "Diallo", "Barry", "Sow", "Touré", "Keita",
  "Traoré", "Cissé", "Camara", "Koulibaly", "Sanogo", "Ouattara", "Kouamé", "Koné", "Bamba",
  "Mensah", "Osei", "Appiah", "Boakye", "Owusu", "Nyarko", "Agyemang", "Ofori",
  "Dossou", "Gnonlonfoun", "Houngbédji", "Kiki", "Soglo", "Agbogba", "Kpessou", "Zannou",
  "Tchato", "Abderaman", "Hassan", "Goukouni", "Mbaigolmem", "Ngarlejy", "Yorongar", "Alhabo",
  "Adeyemi", "Okafor", "Nwachukwu", "Okeke", "Obi", "Okonkwo", "Eze", "Mbeki", "Zuma", "Mandela"
];

const generateUsers = (count: number) => {
  const generated = [];
  const usedUsernames = new Set(["Dr. Marie Curie", "Cheikh Anta Diop"]);

  generated.push(
    { id: "lb-user-1", username: "Dr. Marie Curie", email: "marie@stemflow.com", password: "", isActive: true, activationCode: null, xp: 8500, level: "mentor", streak: 45, onboardingCompleted: true, preferredLanguage: "fr", educationLevel: "universite", interests: ["science"], createdAt: new Date().toISOString() },
    { id: "lb-user-2", username: "Cheikh Anta Diop", email: "cheikh@stemflow.com", password: "", isActive: true, activationCode: null, xp: 9800, level: "mentor", streak: 60, onboardingCompleted: true, preferredLanguage: "fr", educationLevel: "universite", interests: ["science", "technology", "mathematics", "engineering"], createdAt: new Date().toISOString() }
  );

  for (let i = 0; i < count; i++) {
    let fn, ln, username;
    do {
      fn = africanFirstNames[Math.floor(Math.random() * africanFirstNames.length)];
      ln = africanLastNames[Math.floor(Math.random() * africanLastNames.length)];
      username = `${fn} ${ln}`;
    } while (usedUsernames.has(username));

    usedUsernames.add(username);

    generated.push({
      id: `af-user-${i}`,
      username: username,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@stemflow.africa`,
      password: "",
      isActive: true,
      activationCode: null,
      xp: Math.floor(Math.random() * 5000),
      level: ["debutant", "explorateur", "analyste", "challenger", "mentor"][Math.floor(Math.random() * 5)],
      streak: Math.floor(Math.random() * 30),
      onboardingCompleted: true,
      preferredLanguage: "fr",
      educationLevel: ["lycee", "universite", "professionnel"][Math.floor(Math.random() * 3)],
      interests: [["science", "technology"], ["engineering", "mathematics"], ["science", "mathematics"]][Math.floor(Math.random() * 3)],
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString()
    });
  }
  return generated;
};

export async function seedDatabase() {
  try {
    console.log("Clearing existing database entries to force fresh African content seed...");
    await db.delete(passwordResetTokens);
    await db.delete(roomPostLikes);
    await db.delete(commentLikes);
    await db.delete(contentLikes);
    await db.delete(engagementStats);
    await db.delete(videoEngagements);
    await db.delete(notifications);
    await db.delete(roomPosts);
    await db.delete(activities);
    await db.delete(follows);
    await db.delete(missions);
    await db.delete(roomMembers);
    await db.delete(rooms);
    await db.delete(userBadges);
    await db.delete(badges);
    await db.delete(commentsTable);
    await db.delete(quizAttempts);
    await db.delete(quizQuestions);
    await db.delete(contents);
    await db.delete(users);

    const newUsers = generateUsers(150);

    await db.insert(rooms).values([
      { id: "room-1", name: "Innovations d'Afrique", description: "L'Afrique qui invente, crée et innove en STEM.", type: "public", category: "technology", imageUrl: null, memberCount: 1530, createdAt: new Date().toISOString() },
      { id: "room-2", name: "Tech Makers", description: "Construis des projets tech innovants avec la communauté", type: "public", category: "technology", imageUrl: null, memberCount: 890, createdAt: new Date().toISOString() },
      { id: "room-3", name: "Mathématiques Pures", description: "Les mathématiques fractales, géométrie et algèbre avancée", type: "public", category: "mathematics", imageUrl: null, memberCount: 1102, createdAt: new Date().toISOString() },
      { id: "room-4", name: "Espace & Aérospatial", description: "Satellites africains et explorations aérospatiales", type: "public", category: "science", imageUrl: null, memberCount: 2403, createdAt: new Date().toISOString() }
    ]);

    // Insert Users by chunks of 50 to avoid SQLite limits
    for (let i = 0; i < newUsers.length; i += 50) {
      const chunk = newUsers.slice(i, i + 50);
      await db.insert(users).values(chunk);
    }

    await db.insert(contents).values([
      { id: "content-a1", contentType: "video", title: "Fractales Africaines : L'Origine Cachée", description: "Comment l'architecture et l'art africains utilisent depuis des millénaires les mathématiques fractales.", videoUrl: "https://www.youtube.com/watch?v=7n36qV4LcqQ", textContent: null, imageUrl: null, roomId: "room-3", roomName: "Mathématiques Pures", category: "mathematics", difficulty: "intermediaire", tags: ["#Afrique", "#Fractales", "#Maths"], xpReward: 50, authorId: "lb-user-2", authorName: "Cheikh Anta Diop", authorAvatar: null, likes: 14500, comments: 2304, shares: 8900, createdAt: new Date(Date.now() - 3600000).toISOString() },
      { id: "content-a2", contentType: "video", title: "GAINDESAT-1A : Le 1er Satellite du Sénégal 🇸🇳", description: "Revivez le lancement historique du tout premier satellite spatial du Sénégal. Une avancée technologique majeure !", videoUrl: "https://www.youtube.com/watch?v=O13e9wNUXbM", textContent: null, imageUrl: null, roomId: "room-4", roomName: "Espace & Aérospatial", category: "science", difficulty: "debutant", tags: ["#Sénégal", "#Espace", "#Satellite"], xpReward: 60, authorId: "af-user-1", authorName: "TechAfrica", authorAvatar: null, likes: 23000, comments: 4100, shares: 12050, createdAt: new Date(Date.now() - 7200000).toISOString() },
      { id: "content-a3", contentType: "video", title: "Zipline : Drones Médicaux au Rwanda 🇷🇼", description: "Comment cette startup technologique utilise l'ingénierie aérospatiale pour sauver des vies au Rwanda et au Ghana.", videoUrl: "https://www.youtube.com/watch?v=jEbRVNxL44c", textContent: null, imageUrl: null, roomId: "room-2", roomName: "Tech Makers", category: "technology", difficulty: "debutant", tags: ["#Rwanda", "#Drones", "#Santé", "#Tech"], xpReward: 40, authorId: "af-user-15", authorName: "Mark Rober", authorAvatar: null, likes: 350000, comments: 12054, shares: 45000, createdAt: new Date(Date.now() - 14400000).toISOString() },
      { id: "content-a4", contentType: "video", title: "Intelligence Artificielle Made in Bénin 🇧🇯", description: "Découvrez l'écosystème IA florissant au Bénin et Sèmè City. Des jeunes développeurs créent le futur.", videoUrl: "https://www.youtube.com/watch?v=R0_qBtk5PzM", textContent: null, imageUrl: null, roomId: "room-1", roomName: "Innovations d'Afrique", category: "technology", difficulty: "avance", tags: ["#Bénin", "#IA", "#SèmèCity", "#Innovation"], xpReward: 70, authorId: "af-user-42", authorName: "Africa Sciences", authorAvatar: null, likes: 18400, comments: 1540, shares: 6200, createdAt: new Date(Date.now() - 28800000).toISOString() },
      { id: "content-a5", contentType: "video", title: "Startups et Hubs Tech à N'Djamena, Tchad 🇹🇩", description: "Le Tchad se digitalise à une vitesse fulgurante. Visite des incubateurs tech les plus prometteurs du pays.", videoUrl: "https://www.youtube.com/watch?v=Jm_O4k544xY", textContent: null, imageUrl: null, roomId: "room-1", roomName: "Innovations d'Afrique", category: "technology", difficulty: "debutant", tags: ["#Tchad", "#Startups", "#Numérique"], xpReward: 45, authorId: "af-user-88", authorName: "Tech 235", authorAvatar: null, likes: 9600, comments: 853, shares: 2100, createdAt: new Date(Date.now() - 43200000).toISOString() },
      { id: "content-a6", contentType: "text_post", title: "KEMET : Le berceau de la science", description: "La science africaine antique", videoUrl: null, textContent: "Bien avant l'ère moderne, l'Afrique antique maîtrisait l'astronomie, l'architecture, la chimie et la médecine. Les papyrus médicaux d'Égypte en sont la preuve, mais aussi les observatoires astronomiques de Nabta Playa. Nous sommes les héritiers de cette science !", imageUrl: null, roomId: "room-1", roomName: "Innovations d'Afrique", category: "science", difficulty: "debutant", tags: ["#Histoire", "#Science", "#Afrique"], xpReward: 30, authorId: "lb-user-2", authorName: "Cheikh Anta Diop", authorAvatar: null, likes: 42000, comments: 6540, shares: 18000, createdAt: new Date(Date.now() - 72000000).toISOString() },
      { id: "content-a7", contentType: "quiz", title: "Quiz : Les inventeurs africains et afro-descendants", description: "Teste tes connaissances sur les grands inventeurs noirs de l'histoire.", videoUrl: null, textContent: null, imageUrl: null, roomId: "room-1", roomName: "Innovations d'Afrique", category: "technology", difficulty: "intermediaire", tags: ["#Inventions", "#Histoire", "#Quiz"], xpReward: 100, authorId: "lb-user-1", authorName: "Dr. Marie Curie", authorAvatar: null, likes: 8500, comments: 1200, shares: 3200, createdAt: new Date(Date.now() - 244800000).toISOString() }
    ]);

    await db.insert(quizQuestions).values([
      { id: "qa-1", contentId: "content-a7", question: "Qui a inventé le système moderne de feux de circulation (tricolores) ?", options: ["Thomas Edison", "Garrett Morgan", "Nikola Tesla", "Henry Ford"], correctOptionIndex: 1, explanation: "Garrett Morgan, un inventeur afro-américain, a breveté le feu de circulation à trois positions novateur en 1923, après avoir été témoin d'un terrible accident.", order: 0 },
      { id: "qa-2", contentId: "content-a7", question: "Quel ingénieur malien a conçu la base de données du système de navigation spatial de la sonde Rosetta ?", options: ["Cheick Modibo Diarra", "Bouaré Fily Sissoko", "Lamine Traoré", "Seydou Keita"], correctOptionIndex: 0, explanation: "Dr Cheick Modibo Diarra est un astrophysicien interplanétaire célèbre qui a travaillé de nombreuses années pour la NASA.", order: 1 },
      { id: "qa-3", contentId: "content-a7", question: "Qui est Arthur Zang ?", options: ["L'inventeur de l'ordinateur personnel", "Créateur du Cardiopad, première tablette médicale africaine", "Découvreur du boson de Higgs", "Pionnier de l'IA au Nigeria"], correctOptionIndex: 1, explanation: "L'ingénieur camerounais Arthur Zang a inventé le Cardiopad, une tablette tactile permettant d'enregistrer et traiter à distance les signaux cardiaques.", order: 2 }
    ]);

    await db.insert(badges).values([
      { id: "badge-1", name: "Premier Pas", description: "Complète ton premier contenu", icon: "footprints", category: "contribution", requirement: "Complete 1 content", xpRequired: 0 },
      { id: "badge-2", name: "Explorateur STEM", description: "Explore 10 contenus différents", icon: "compass", category: "contribution", requirement: "View 10 contents", xpRequired: 100 },
      { id: "badge-3", name: "Génie Africain", description: "Vu 5 contenus de la catégorie 'Innovations d'Afrique'", icon: "crown", category: "contribution", requirement: "View 5 Africa contents", xpRequired: 200 },
      { id: "badge-6", name: "Accro STEM", description: "7 jours de streak", icon: "flame", category: "performance", requirement: "7 day streak", xpRequired: 300 }
    ]);

    await db.insert(missions).values([
      { id: "mission-1", missionType: "watch_videos", title: "Découvre notre génie", description: "Regarde 3 vidéos liées à l'Afrique", targetValue: 3, currentProgress: 1, xpReward: 500, frequency: "daily", category: "technology", completed: false, expiresAt: null },
      { id: "mission-5", missionType: "streak", title: "Toujours connecté !", description: "Connecte-toi 3 jours de suite", targetValue: 3, currentProgress: 1, xpReward: 300, frequency: "one_time", category: null, completed: false, expiresAt: null }
    ]);

    // Generate random comments and activities
    const commentsData = [];
    const activitiesData = [];
    for (let i = 0; i < 50; i++) {
      const actingUser = newUsers[Math.floor(Math.random() * newUsers.length)];
      commentsData.push({
        id: `comment - rand - ${i}`,
        contentId: ["content-a1", "content-a2", "content-a3", "content-a4", "content-a5"][Math.floor(Math.random() * 5)],
        userId: actingUser.id,
        authorName: actingUser.username,
        text: ["C'est incroyable d'apprendre ça ! L'Afrique bouge !", "Wouah, ça c'est une sacrée innovation, je suis fier !", "Je savais même pas qu'on travaillait sur ces technos chez nous.", "Merci pour le partage, STEM Flow est la meilleure app !!", "Les fractales africaines, ça c'est un pur joyau intellectuel.", "Je veux lancer une start up comme eux au Togo !"][Math.floor(Math.random() * 6)],
        parentId: null,
        likes: Math.floor(Math.random() * 500),
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString()
      });

      activitiesData.push({
        id: `act - rand - ${i}`,
        userId: actingUser.id,
        username: actingUser.username,
        activityType: ["content_viewed", "quiz_completed", "badge_earned", "level_up"][Math.floor(Math.random() * 4)],
        description: "A été très actif aujourd'hui.",
        metadata: null,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString()
      });
    }

    await db.insert(commentsTable).values(commentsData);
    await db.insert(activities).values(activitiesData);

    console.log("Database seeded successfully with 150+ African users and viral STEM contents!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}
