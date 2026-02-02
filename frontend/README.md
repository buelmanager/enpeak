# EnPeak Frontend

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Hosting-orange)](https://firebase.google.com/)

AI-powered English learning PWA application built with Next.js 14. Practice English conversation through free chat, expression practice, and roleplay scenarios.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Testing**: Vitest + React Testing Library
- **Deployment**: Firebase Hosting
- **PWA**: Progressive Web App support

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

### Testing

```bash
# Run tests once
npm test

# Watch mode
npm run test:watch
```

## Project Structure

```
frontend/
├── public/
│   └── manifest.json          # PWA configuration
├── src/
│   ├── app/
│   │   ├── talk/              # Unified conversation page
│   │   ├── cards/             # Vocabulary flashcards
│   │   ├── my/                # User stats and settings
│   │   ├── daily/             # Daily expressions
│   │   ├── create/            # Community scenario creation
│   │   ├── feedback/          # Feature requests
│   │   └── login/             # Authentication
│   ├── components/
│   │   ├── ModeSelector/      # Chat mode toggle
│   │   ├── ScenarioSelector/  # Roleplay scenario picker
│   │   ├── ChatWindow/        # Unified chat interface
│   │   └── BottomNav/         # Navigation bar
│   └── contexts/
│       └── TalkContext/       # Talk mode state management
├── package.json
├── next.config.js
└── tsconfig.json
```

## Routes

### Active Routes

| Route | Description |
|-------|-------------|
| `/talk` | Unified conversation page (Free Chat, Expression Practice, Roleplay) |
| `/cards` | Vocabulary flashcard learning |
| `/my` | My page with weekly learning statistics |
| `/daily` | Daily expression learning |
| `/create` | Create and share community scenarios |
| `/feedback` | Submit feature requests |
| `/login` | User authentication |

### Middleware Redirects

Legacy routes are automatically redirected:

| Old Route | New Route |
|-----------|-----------|
| `/` | `/talk` |
| `/chat` | `/talk` |
| `/vocabulary` | `/cards` |
| `/community` | `/talk?mode=roleplay` |
| `/roleplay` | `/talk?mode=roleplay` |

## Key Features

### Talk Modes

- **Free Chat**: Open-ended conversation with AI tutor
- **Expression Practice**: Learn and practice specific expressions
- **Roleplay**: Scenario-based conversation practice

### Scenario System

- Built-in scenarios (cafe, hotel, airport, etc.)
- Community-created scenarios
- Step-by-step guidance with learning tips

### Vocabulary Learning

- Flashcard-based learning
- Multiple practice modes
- Progress tracking

## Environment Variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_APP_URL=https://your-app-url.com
```

## Deployment

### Firebase Hosting

```bash
npm run build
npx firebase deploy --only hosting
```

Ensure Firebase CLI is installed and configured:

```bash
npm install -g firebase-tools
firebase login
```

## Testing

Tests are written using Vitest and React Testing Library:

```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# With UI
npx vitest --ui
```

## Contributing

This is a private project. For internal development only.

## License

Private - All rights reserved
