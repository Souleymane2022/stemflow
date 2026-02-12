import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const AI_MODEL = "gpt-5-mini";

function extractJSON(text: string): any {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  return {};
}

export interface ContentAnalysis {
  detectedSubject: string;
  detectedDifficulty: string;
  suggestedTags: string[];
  summary: string;
  learnScore: number;
  pedagogicalFeedback: string;
  qualityIndicators: {
    clarity: number;
    accuracy: number;
    engagement: number;
    depth: number;
  };
}

export interface DiscussionQuality {
  score: number;
  label: "constructive" | "question" | "feedback" | "off_topic" | "encouragement";
  isValuable: boolean;
}

export interface SmartProfileData {
  detectedCompetencies: string[];
  strongAreas: string[];
  areasToImprove: string[];
  suggestedLevel: string;
  learningStyle: string;
  progressionSummary: string;
}

export async function analyzeContent(
  title: string,
  content: string,
  contentType: string
): Promise<ContentAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content: `Tu es un expert pédagogique STEM. Analyse le contenu éducatif et retourne UNIQUEMENT un objet JSON (sans markdown, sans explication) avec ces champs:
{
  "detectedSubject": "science" | "technology" | "engineering" | "mathematics",
  "detectedDifficulty": "debutant" | "intermediaire" | "avance",
  "suggestedTags": ["#tag1", "#tag2", "#tag3"],
  "summary": "résumé en 1-2 phrases",
  "learnScore": 0-100,
  "pedagogicalFeedback": "conseil pour améliorer",
  "qualityIndicators": { "clarity": 0-100, "accuracy": 0-100, "engagement": 0-100, "depth": 0-100 }
}`
        },
        {
          role: "user",
          content: `Type: ${contentType}\nTitre: ${title}\nContenu: ${content}`
        }
      ],
      max_completion_tokens: 4096,
    });

    const rawContent = response.choices[0]?.message?.content || "{}";
    const result = extractJSON(rawContent);
    return {
      detectedSubject: result.detectedSubject || "science",
      detectedDifficulty: result.detectedDifficulty || "debutant",
      suggestedTags: result.suggestedTags || [],
      summary: result.summary || "",
      learnScore: Math.min(100, Math.max(0, result.learnScore || 50)),
      pedagogicalFeedback: result.pedagogicalFeedback || "",
      qualityIndicators: {
        clarity: result.qualityIndicators?.clarity || 50,
        accuracy: result.qualityIndicators?.accuracy || 50,
        engagement: result.qualityIndicators?.engagement || 50,
        depth: result.qualityIndicators?.depth || 50,
      },
    };
  } catch (error) {
    console.error("AI content analysis error:", error);
    return {
      detectedSubject: "science",
      detectedDifficulty: "debutant",
      suggestedTags: [],
      summary: "",
      learnScore: 50,
      pedagogicalFeedback: "Analyse non disponible",
      qualityIndicators: { clarity: 50, accuracy: 50, engagement: 50, depth: 50 },
    };
  }
}

export async function analyzeDiscussionQuality(text: string): Promise<DiscussionQuality> {
  try {
    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content: `Analyse la qualité d'un commentaire éducatif STEM. Retourne UNIQUEMENT un objet JSON (sans markdown):
{
  "score": 0-100,
  "label": "constructive" | "question" | "feedback" | "off_topic" | "encouragement",
  "isValuable": true/false
}`
        },
        { role: "user", content: text }
      ],
      max_completion_tokens: 2048,
    });

    const result = extractJSON(response.choices[0]?.message?.content || "{}");
    return {
      score: Math.min(100, Math.max(0, result.score || 50)),
      label: result.label || "feedback",
      isValuable: result.isValuable ?? true,
    };
  } catch {
    return { score: 50, label: "feedback", isValuable: true };
  }
}

export async function getSmartRecommendations(
  interests: string[],
  level: string,
  recentInteractions: { category: string; liked: boolean }[]
): Promise<{ weights: Record<string, number>; explanation: string }> {
  try {
    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content: `Tu es un moteur de recommandation éducatif. Retourne UNIQUEMENT un objet JSON (sans markdown):
{
  "weights": { "science": 0-1, "technology": 0-1, "engineering": 0-1, "mathematics": 0-1 },
  "explanation": "phrase courte expliquant la recommandation"
}`
        },
        {
          role: "user",
          content: `Intérêts: ${interests.join(", ")}\nNiveau: ${level}\nInteractions récentes: ${JSON.stringify(recentInteractions)}`
        }
      ],
      max_completion_tokens: 2048,
    });

    const result = extractJSON(response.choices[0]?.message?.content || "{}");
    return {
      weights: result.weights || { science: 0.25, technology: 0.25, engineering: 0.25, mathematics: 0.25 },
      explanation: result.explanation || "Recommandations basées sur tes intérêts",
    };
  } catch {
    const weights: Record<string, number> = { science: 0.25, technology: 0.25, engineering: 0.25, mathematics: 0.25 };
    interests.forEach((i) => { if (weights[i] !== undefined) weights[i] = 0.5; });
    return { weights, explanation: "Recommandations basées sur tes intérêts" };
  }
}

export async function analyzeUserProfile(
  userStats: {
    xp: number;
    contentCount: number;
    quizScores: number[];
    interests: string[];
    level: string;
    categoriesEngaged: string[];
  }
): Promise<SmartProfileData> {
  try {
    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content: `Analyse le profil d'un apprenant STEM et génère une évolution intelligente. Retourne UNIQUEMENT un objet JSON (sans markdown):
{
  "detectedCompetencies": ["compétence1", "compétence2"],
  "strongAreas": ["domaine1"],
  "areasToImprove": ["domaine1"],
  "suggestedLevel": "curieux" | "explorateur" | "analyste" | "challenger" | "mentor",
  "learningStyle": "visuel" | "pratique" | "théorique" | "polyvalent",
  "progressionSummary": "résumé en 2 phrases"
}`
        },
        {
          role: "user",
          content: `XP: ${userStats.xp}\nContenu créé: ${userStats.contentCount}\nScores quiz: ${JSON.stringify(userStats.quizScores)}\nIntérêts: ${userStats.interests.join(", ")}\nNiveau: ${userStats.level}\nCatégories engagées: ${userStats.categoriesEngaged.join(", ")}`
        }
      ],
      max_completion_tokens: 4096,
    });

    const result = extractJSON(response.choices[0]?.message?.content || "{}");
    return {
      detectedCompetencies: result.detectedCompetencies || [],
      strongAreas: result.strongAreas || [],
      areasToImprove: result.areasToImprove || [],
      suggestedLevel: result.suggestedLevel || "curieux",
      learningStyle: result.learningStyle || "polyvalent",
      progressionSummary: result.progressionSummary || "Continue ton parcours STEM !",
    };
  } catch {
    return {
      detectedCompetencies: ["Curiosité scientifique"],
      strongAreas: [],
      areasToImprove: ["Explorer plus de catégories"],
      suggestedLevel: "curieux",
      learningStyle: "polyvalent",
      progressionSummary: "Continue ton parcours STEM !",
    };
  }
}

export async function chatWithAssistant(
  messages: { role: "user" | "assistant" | "system"; content: string }[],
  context?: string
): Promise<ReadableStream<string> | string> {
  try {
    const systemMessage = {
      role: "system" as const,
      content: `Tu es STEM Flow Assistant, un tuteur IA spécialisé en Sciences, Technologie, Ingénierie et Mathématiques (STEM). Tu es conçu pour les étudiants africains francophones.

Tes capacités:
1. Reformulation: Tu peux reformuler des concepts complexes de manière simple
2. Vérification mathématique: Tu peux vérifier des calculs et formules (supporte LaTeX)
3. Suggestions pédagogiques: Tu proposes des exercices adaptés au niveau
4. Explication étape par étape: Tu décomposes les problèmes en étapes claires

Règles:
- Réponds toujours en français
- Utilise des analogies concrètes du quotidien
- Encourage l'apprenant avec bienveillance
- Si tu n'es pas sûr, dis-le honnêtement
- Utilise LaTeX pour les formules: $formule$ ou $$formule$$
${context ? `\nContexte additionnel: ${context}` : ""}`
    };

    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [systemMessage, ...messages],
      max_completion_tokens: 4096,
    });

    return response.choices[0]?.message?.content || "Désolé, je n'ai pas pu générer une réponse.";
  } catch (error) {
    console.error("AI assistant error:", error);
    return "Désolé, une erreur s'est produite. Réessaie dans un moment.";
  }
}

export function calculateLearnScore(content: {
  likes: number;
  comments: number;
  shares: number;
  quizAttempts: number;
  avgQuizScore: number;
  aiQualityScore: number;
}): number {
  const engagementScore = Math.min(100,
    (content.likes * 2) + (content.comments * 5) + (content.shares * 8)
  );
  const quizImpact = content.quizAttempts > 0
    ? (content.avgQuizScore * 0.6 + Math.min(content.quizAttempts * 10, 100) * 0.4)
    : 0;
  const score = Math.round(
    content.aiQualityScore * 0.4 +
    engagementScore * 0.3 +
    quizImpact * 0.3
  );
  return Math.min(100, Math.max(0, score));
}
