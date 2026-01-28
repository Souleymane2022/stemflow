# STEM FLOW

A TikTok-style educational platform for STEM learning with gamification elements.

## Overview

STEM FLOW is a mobile-first educational application that makes learning Science, Technology, Engineering, and Mathematics engaging and social. The platform combines:

- **Personalized Feed**: Content tailored to user interests and level
- **Community Rooms**: Social learning spaces with roles and challenges
- **Gamification**: Missions, XP rewards, and progression system
- **AI Personalization**: Difficulty adjustment based on engagement metrics

### Slogan
"Scroll. Learn. Level Up."

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
│   │   └── utils.ts                  # Utility functions
│   ├── pages/
│   │   ├── Feed.tsx                  # Main content feed
│   │   ├── Home.tsx                  # Landing page
│   │   ├── Missions.tsx              # User missions/gamification
│   │   ├── Onboarding.tsx            # 4-step onboarding flow
│   │   ├── Profile.tsx               # User profile and stats
│   │   ├── RoomDetail.tsx            # Room detail with tabs
│   │   └── Rooms.tsx                 # Room listing page
│   ├── App.tsx                       # Main app with routing
│   └── index.css                     # Theme colors (violet-fuchsia)
├── index.html                        # HTML entry with meta tags
server/
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

### 3. Community Rooms (Salons)
- Public/private rooms by category
- Roles: Apprenant, Challenger, Mentor, Modérateur
- Publications, challenges, and leaderboards

### 4. Missions/Gamification
- Mission types: watch_videos, complete_quiz, join_salon, comment, share, streak
- Frequencies: daily, weekly, one_time
- XP rewards and progress tracking

### 5. User Profile
- Level progression with XP
- Streak tracking
- Interest badges
- Achievement system

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

## Theme Colors

The app uses a violet-fuchsia gradient theme:
- Primary: HSL(280, 80%, 55%) - Violet
- Accent: HSL(320, 75%, 55%) - Fuchsia/Pink
- Supporting gradients for category colors

## Technologies

- **Frontend**: React, Vite, TanStack Query, Wouter, Framer Motion
- **State Management**: Zustand with persistence
- **UI**: Shadcn/ui, Tailwind CSS
- **Backend**: Express.js with in-memory storage
- **Validation**: Zod schemas
- **Icons**: Lucide React

## Running the App

The application runs with `npm run dev` which starts:
- Express server on port 5000
- Vite dev server for frontend

## User Preferences

- Mobile-first design (optimized for 400px width)
- Dark/light theme support with system preference detection
- French as default language
- Gamification-focused UX with XP, streaks, and missions
