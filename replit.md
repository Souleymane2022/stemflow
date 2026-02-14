# STEM FLOW

A TikTok-style educational platform for STEM learning with gamification elements.

## Overview

STEM FLOW is a mobile-first educational application that makes learning Science, Technology, Engineering, and Mathematics engaging and social. The platform combines:

- **Personalized Feed**: Content tailored to user interests and level
- **Community Rooms**: Social learning spaces with roles and challenges
- **Gamification**: Missions, XP rewards, and progression system
- **AI Personalization**: Difficulty adjustment based on engagement metrics
- **AI Features**: LearnScore, smart recommendations, content analysis, AI assistant, smart profile evolution

### Slogan
"Scroll. Learn. Level Up."

## Brand Identity

### Core Values
- **Apprentissage & Progression**: Growth, levels, continuous evolution
- **Accessibilité & Inclusion**: Simplicity, clarity, diversity
- **Innovation & Technologie**: Modernity, intelligence, future
- **Communauté & Collaboration**: Links, networks, sharing
- **Fierté et Potentiel Africain**: Energy, youth, creativity

### Visual Keywords
Flow · Progression · Connexion · Intelligence · Énergie · Futur

## Color Palette

### Primary Colors
| Color | Hex | HSL | Purpose |
|-------|-----|-----|---------|
| Deep Tech Blue | #0B3C5D | 200 78% 20% | Trust, Knowledge, Technology, Credibility |
| Green Energy | #00C896 | 164 100% 39% | Progression, Success, Innovation, Youth |

### Secondary Colors
| Color | Hex | HSL | Purpose |
|-------|-----|-----|---------|
| Warm Yellow/Orange | #F5B700 | 46 100% 48% | African Energy, Motivation, Gamification |
| Light Gray | #F4F6F8 | 210 25% 97% | Readability, Comfort |
| Soft Black | #1E1E1E | 0 0% 12% | Text, Contrast |

### Color Usage Rules
- **Blue** = Structure & Credibility
- **Green** = Progression & Impact
- **Yellow** = Motivation & Engagement

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── feed/
│   │   │   └── ContentCard.tsx       # Feed content card component
│   │   ├── ui/                       # Shadcn UI components
│   │   ├── StemFlowLogo.tsx          # Brand logo component
│   │   ├── ThemeProvider.tsx         # Dark/light theme context
│   │   └── ThemeToggle.tsx           # Theme toggle button
│   ├── lib/
│   │   ├── queryClient.ts            # TanStack Query setup
│   │   ├── userState.ts              # Zustand user state store
│   │   ├── celebrations.ts           # Confetti celebrations for achievements
│   │   ├── dailyQuests.ts            # Daily quests zustand store
│   │   ├── leagues.ts                # League system zustand store
│   │   └── utils.ts                  # Utility functions
│   ├── pages/
│   │   ├── Achievements.tsx          # Badge collection page
│   │   ├── AIAssistant.tsx           # AI tutoring assistant chat
│   │   ├── Feed.tsx                  # Main content feed with smart recommendations
│   │   ├── Home.tsx                  # Landing page
│   │   ├── Missions.tsx              # User missions/gamification
│   │   ├── Onboarding.tsx            # 4-step onboarding flow
│   │   ├── Profile.tsx               # User profile with AI smart evolution
│   │   ├── RoomDetail.tsx            # Room detail with tabs
│   │   └── Rooms.tsx                 # Room listing page
│   ├── App.tsx                       # Main app with routing
│   └── index.css                     # Theme colors (African Innovation)
├── index.html                        # HTML entry with meta tags
server/
├── ai.ts                             # AI service (OpenAI) - analysis, recommendations, assistant
├── routes.ts                         # API endpoints with Zod validation
├── storage.ts                        # In-memory storage with seed data
└── index.ts                          # Express server setup
shared/
└── schema.ts                         # TypeScript types and Zod schemas
```

## Key Features

### 1. Onboarding Flow
- Language selection (French/English)
- Education level (Collège, Lycée, Université, Autodidacte)
- STEM interests (minimum 1 required)
- Starting level (Curieux → Mentor)

### 2. Content Feed
- Multi-format content: video, text_post, image_post, quiz, infographic
- Category filtering: Science, Technology, Engineering, Mathematics
- Difficulty levels: Débutant, Intermédiaire, Avancé
- XP rewards per content
- 24 STEM micro-contents from YouTube (TED-Ed, Khan Academy, Kurzgesagt), Vimeo (NISE Network), Archive.org (MIT OCW)
- 41 quiz questions across all content

### 2b. Social Interactions
- Like/unlike posts with animated heart and toggle
- Threaded comments with replies (parentId support)
- Comment likes (toggle per user)
- Reply indicator UI with @mention
- Share to 5 platforms: Facebook, X/Twitter, WhatsApp, Instagram, LinkedIn
- Copy link to clipboard
- Native Web Share API support
- Bookmark/save posts
- API: POST /api/comments/:id/like, GET /api/comments/:id/replies

### 3. Community Rooms (Salons)
- Public/private rooms by category
- Roles: Apprenant, Challenger, Mentor, Modérateur
- Publications, challenges, and leaderboards

### 4. Missions/Gamification
- Mission types: watch_videos, complete_quiz, join_salon, comment, share, streak
- Frequencies: daily, weekly, one_time
- XP rewards and progress tracking
- Daily Quests: 3 randomized quests per day with auto-reset at midnight
- Quest types: view_content, like_content, comment, quiz, share, visit_room

### 5. User Profile
- Level progression with XP
- Streak tracking
- Interest badges
- Achievement system
- League & streak freeze display

### 6. League System (Duolingo-inspired)
- 10-tier progression: Bronze, Argent, Or, Saphir, Rubis, Emeraude, Améthyste, Perle, Obsidienne, Diamant
- Weekly XP tracking with promotions/demotions
- League banner on Leaderboard page
- Zustand-persisted state (client/src/lib/leagues.ts)

### 7. Daily Quests System
- 3 random quests daily from 8 templates
- Auto-reset at midnight
- XP multiplier with XP Boost (2x)
- Streak Freeze inventory to protect streaks
- Widget on Missions page (DailyQuestsWidget)
- Zustand-persisted state (client/src/lib/dailyQuests.ts)

### 8. Achievements & Badges
- Badge collection page (/achievements)
- Categories: Contribution, Performance, Social, Special
- Locked/unlocked visual states
- API: GET /api/badges, GET /api/user-badges

### 9. Celebrations
- canvas-confetti library for visual feedback
- Triggers: XP gains, level ups, mission/quest completion, streak milestones, badge earned, league promotion
- Library: client/src/lib/celebrations.ts

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/feed` | Get all content (filter: ?category=) |
| GET | `/api/content/:id` | Get single content |
| POST | `/api/content/:id/like` | Like content |
| GET | `/api/rooms` | Get all rooms |
| GET | `/api/rooms/:id` | Get room details |
| GET | `/api/rooms/:id/content` | Get room content |
| POST | `/api/rooms/:id/join` | Join a room |
| GET | `/api/missions` | Get user missions |
| PATCH | `/api/missions/:id/progress` | Update mission progress |
| POST | `/api/missions/:id/complete` | Complete mission |
| GET | `/api/users/:id` | Get user profile |
| PATCH | `/api/users/:id` | Update user profile |
| POST | `/api/engagement/video` | Track video engagement |
| POST | `/api/ai/analyze-content` | AI content analysis (subject, difficulty, tags, LearnScore) |
| POST | `/api/ai/analyze-comment` | AI discussion quality detection |
| POST | `/api/ai/recommendations` | Smart feed recommendations based on user profile |
| POST | `/api/ai/smart-profile` | AI smart profile evolution analysis |
| POST | `/api/ai/assistant` | AI STEM tutoring assistant chat |
| GET | `/api/ai/learnscore/:contentId` | Calculate LearnScore for content |

## Gradient Utilities

Custom CSS gradient classes for the African Innovation theme:

- `.gradient-stem` - Blue to Green (Tech → Progression)
- `.gradient-energy` - Green to Yellow (Progression → Motivation)
- `.gradient-innovation` - Blue to Yellow (Tech → Énergie)
- `.gradient-african` - Full brand: Blue → Green → Yellow
- `.gradient-stem-text` - Text gradient effect

## Technologies

- **Frontend**: React, Vite, TanStack Query, Wouter, Framer Motion
- **State Management**: Zustand with persistence
- **UI**: Shadcn/ui, Tailwind CSS
- **Backend**: Express.js with in-memory storage
- **Validation**: Zod schemas
- **Icons**: Lucide React

## Authentication & Security

- **Registration**: Unique email/username enforcement (409 on duplicates)
- **Account Activation**: 6-digit code generated on registration, must be entered to activate account
- **Login**: Blocked for inactive accounts (returns 403 with needsActivation flag)
- **Password Security**: bcrypt hashing (12 rounds)
- **Sessions**: express-session with httpOnly cookies (7-day expiry)
- **Auth Routes**: POST /api/auth/register, /api/auth/activate, /api/auth/login, /api/auth/logout, GET /api/auth/me
- **Middleware**: requireAuth on all /api/* except auth routes

## Running the App

The application runs with `npm run dev` which starts:
- Express server on port 5000
- Vite dev server for frontend

## User Preferences

- Mobile-first design (optimized for 400px width)
- Dark/light theme support with system preference detection
- French as default language
- Gamification-focused UX with XP, streaks, and missions
