# YogaSense AI — Master Build

**YogaSense AI** is an AI-driven yoga posture assistant web application. It uses a device camera to detect body joints in real-time using MediaPipe, compares joint angles against ideal reference targets for yoga poses, scores alignment, and translates technical deviations into encouraging, plain-English corrective feedback.

---

## 🌟 Key Features

- **Liquid Glass Design System (iOS 26 Inspired)**: Custom dark theme token layer built with Tailwind CSS, backdrop blur glass surfaces, glowing ambient gradient blobs, and Framer Motion micro-interactions.
- **Client-Side Computer Vision Pipeline**: Powered by `@mediapipe/tasks-vision` (PoseLandmarker) running 33-point body landmark detection via WASM and GPU delegates.
- **Real 3D/2D Geometry Engine**: `poseGeometry.ts` uses vector trigonometry (dot product angle calculations) to measure joint angles at knees, elbows, shoulders, hips, and spine alignment.
- **Rule-Based Posture Scoring**: `scoreEngine.ts` calculates exact joint angle deviations, sub-scores (0–100), joint classifications (Good / Slight / Poor), and category breakdown bars (Shoulder, Hip, Knee, Torso, Balance).
- **Personalized Plain-English Feedback**: `feedbackEngine.ts` maps technical joint deviations to warm, encouraging corrective tips and positive reinforcement.
- **Web Speech API Text-to-Speech (TTS)**: Built-in natural audio feedback reader for accessibility and hands-free guidance.
- **Local Persistence & Auth**: Self-contained client-side authentication and session logging built on IndexedDB (`idb`) and Web Crypto API.
- **Habit & Analytics Dashboard**: Dynamic streak tracker, daily goal progress ring, session history log, and Recharts progress line/bar charts.

---

## 🚀 Quick Setup & Run

### Prerequisites
- Node.js v18 or later
- npm v9 or later

### Installation & Launch

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev
```

Visit the local server URL printed by Vite (typically `http://localhost:5173`).

---

## 🏗 Architecture & File Structure

```
src/
├── components/          # Reusable Liquid Glass UI components
│   ├── AnimatedNumber.tsx
│   ├── BackgroundBlobs.tsx
│   ├── BodySkeletonDiagram.tsx
│   ├── BottomNav.tsx
│   ├── CircularProgressRing.tsx
│   ├── GlassButton.tsx
│   ├── GlassCard.tsx
│   ├── PoseSilhouette.tsx
│   ├── ProtectedRoute.tsx
│   ├── SkeletonOverlayCanvas.tsx
│   ├── StatusBadge.tsx
│   └── TopBar.tsx
├── data/
│   └── poses.ts         # 8 reference yoga poses with target joint angles & tolerances
├── lib/
│   ├── feedbackEngine.ts # Plain-English tip generation rules
│   ├── mediaPipeLoader.ts # MediaPipe WASM PoseLandmarker loader
│   ├── poseGeometry.ts   # Vector trigonometry joint angle calculation
│   └── scoreEngine.ts    # Posture scoring & tolerance decay logic
├── screens/
│   ├── FeedbackScreen.tsx
│   ├── HistoryScreen.tsx
│   ├── HomeScreen.tsx
│   ├── LibraryScreen.tsx
│   ├── LiveDetectScreen.tsx
│   ├── LoginScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── ProgressScreen.tsx
│   ├── RegisterScreen.tsx
│   └── ScoreScreen.tsx
├── services/
│   ├── authService.ts   # Local Auth service behind swappable interface
│   └── db.ts            # IndexedDB database operations (idb)
├── store/
│   ├── useAuthStore.ts  # Zustand global auth state
│   └── useSessionStore.ts # Zustand global session & streak state
└── types/
    └── index.ts         # Central TypeScript interfaces & types
```

---

## 🔬 Research Concept vs Implementation Notes

- **Pose Reference Alignment**: Uses standard vector trigonometry (joint triple dot-products and vertical spine tilt) which runs fully in-browser at 30+ FPS without needing a heavy cloud backend.
- **Client-Side Model Execution**: Utilizes MediaPipe PoseLandmarker WASM bundle with GPU delegate fallback to CPU to guarantee smooth frame rates across mobile and desktop devices.
- **Privacy First**: All video processing and landmark detection happens locally in your browser. Video frames are never recorded or transmitted over the network.
