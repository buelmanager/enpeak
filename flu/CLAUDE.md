# Flu - AI English Learning Flutter App

## Project Overview

Flutter rewrite of EnPeak (Next.js PWA). AI-powered English learning app with voice conversation, vocabulary flashcards, and roleplay scenarios. Consumes the same FastAPI backend.

---

## Architecture

```
lib/
├── core/                          # Shared infrastructure
│   ├── config/                    # Environment config
│   ├── constants/                 # Colors, typography, API endpoints
│   ├── di/                        # GetIt dependency injection
│   ├── errors/                    # Result type, Failure classes
│   ├── network/                   # Dio API client + interceptors
│   └── theme/                     # Material theme
└── features/                      # Feature-first clean architecture
    ├── auth/                      # Firebase auth
    ├── cards/                     # Vocabulary flashcards (A1-C2)
    ├── chat/                      # Free conversation with AI
    ├── community/                 # Community scenarios
    ├── create/                    # Scenario creation
    ├── daily/                     # Daily expression
    ├── feedback/                  # Grammar feedback + feature requests
    ├── home/                      # Dashboard
    ├── login/                     # Login screen
    ├── my/                        # Profile + settings
    ├── navigation/                # Bottom nav shell
    ├── rag/                       # RAG search
    ├── roleplay/                  # Scenario roleplay
    ├── speech/                    # STT/TTS services
    ├── stats/                     # Learning statistics
    ├── talk/                      # Talk page (3 modes)
    └── vocabulary/                # Word management
```

Each feature follows: `data/ (datasources, models, repositories)` + `domain/ (entities, repositories)` + `presentation/ (pages, widgets, providers)`

---

## Tech Stack

| Component | Choice | Reason |
|-----------|--------|--------|
| Framework | Flutter 3.38.4 | Cross-platform (iOS, Android, Web) |
| Language | Dart 3.10.3 | Type-safe, null-safe |
| State Management | Riverpod | Less boilerplate than BLoC, compile-time safety |
| HTTP Client | Dio | Interceptors, retry logic, timeouts |
| DI | GetIt | Simple singleton registration |
| Speech-to-Text | speech_to_text | Native platform STT |
| Text-to-Speech | flutter_tts (local) + backend Edge TTS (HD) | Hybrid approach |
| Local Storage | SharedPreferences + Hive | Settings + structured data |
| Auth | Firebase Auth | Same as original app |
| Charts | fl_chart | Learning statistics visualization |
| Flashcards | flutter_card_swiper | Vocabulary card UI |

---

## Backend API

- **Base URL**: Environment variable `API_URL` (default: http://localhost:7860)
- **Auth**: Bearer token via `HF_TOKEN`
- **Hosted on**: HuggingFace Spaces (Docker)
- **No backend changes needed** - Flutter consumes same API

### Key Endpoints
| Feature | Endpoints |
|---------|-----------|
| Chat | POST /api/chat, POST /api/translate |
| Roleplay | GET/POST /api/roleplay/* |
| Speech | POST /api/speech/tts, /api/speech/stt |
| Vocabulary | GET/POST /api/vocabulary/* |
| RAG | GET/POST /api/rag/* |
| Feedback | POST /api/feedback/grammar |
| Community | GET/POST /api/scenarios/* |

---

## Design System

```
Primary: #0D9488 (teal-600)
Background: #FAF9F7 (warm off-white)
Surface: #FFFFFF
Text Primary: #1A1A1A
Text Secondary: #8A8A8A
Border: #E5E5E5
Error: #EF4444
Success: #10B981
Warning: #F59E0B

Cards: white bg, borderRadius 16, border #E5E5E5, subtle shadow
Bottom Nav: 2 tabs (Home, Stats) + floating Talk button (72px teal circle, centered)
```

---

## Navigation Structure

```
NavigationShell (BottomAppBar)
├── Home (tab 0) - Dashboard
├── Stats (tab 1) - Learning analytics
└── Talk Button (FAB, centered) → /talk

/talk - Full screen with 3 mode tabs:
  ├── Free Chat
  ├── Expression Practice
  └── Roleplay

Other routes: /cards, /my, /daily, /create, /feedback, /login
```

---

## Error Handling

Uses sealed `Result<T>` type:
```dart
sealed class Result<T> { Ok<T> | Err<T> }
```

Failure types: ServerFailure, NetworkFailure, CacheFailure, ValidationFailure

---

## Environment Variables

```
API_URL=http://localhost:7860
HF_TOKEN=
PRODUCTION=false
```

---

## Build & Run

```bash
# Development
flutter run

# Build iOS
flutter build ios

# Build Android
flutter build apk

# Build Web (PWA)
flutter build web
```

---

## Coding Conventions

- No emoji in code, comments, or UI text
- Korean UI labels for app chrome
- English for learning content
- Immutable models (final fields)
- Result type for error handling (no try/catch at presentation layer)
- Feature-first directory organization
- Riverpod for state management (no BLoC)
