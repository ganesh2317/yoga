# YogaSense AI — Master Build (Round 3 Refined)

**YogaSense AI** is a client-side AI-driven posture assistant and guided yoga practice application. Built with React 18, TypeScript, Vite, Tailwind CSS, MediaPipe, and Fraunces serif typography, it provides real-time body tracking, posture scoring, auto pose recognition, and detailed posture reference guides.

---

## 🌟 Key Features & Refinement Rounds

- **Pose Reference Guide & Setup Steps (Round 3)**:
  - Sequential 3–5 step instructions (`setupSteps`) and key form cues (`alignmentCues`) for all 8 reference poses.
  - Parameterized SVG line-art pose illustrations (`PoseReferenceIllustration.tsx`) showing exact target body shapes.
  - Pre-tracking "Get Ready" screen on `/live/:poseId` allowing users to study position before scoring starts.
  - Collapsible mid-session pose reference panel and horizontally-scrollable reference drawer in Free Practice mode (`/live`).

- **Boutique Editorial Design Overhaul (Round 3)**:
  - **Typography**: Paired variable serif **Fraunces** (`@fontsource/fraunces`) for large numbers, hero titles, score numbers, and greetings with **Inter** for data UI.
  - **Color Palette**: Neutral graphite-black base (`#0C0D10`), warm off-white glass fill (`rgba(244,241,236,0.05)`), deep muted forest green (`#3F6B4F`), warm ochre/gold (`#C9A66B`), and warm rust/terracotta (`#C1502E`).
  - **Depth & Texture**: Fine static film-grain overlay (`.bg-grain`) and 1px specular top edge highlights (`::before`).

- **Free Practice & Auto Pose Recognition (`/live`) (Round 2)**:
  - Real-time pose recognition engine continuously scores joint angles against reference poses and prompts the user when a pose is held for ~1.5s.

- **Single-Source Mirror Container (Round 2)**:
  - Mirroring wrapper `<div className="transform -scale-x-100">` flips both camera stream and SVG/canvas overlay together, keeping anatomical left/right wrist/knee landmarks aligned.

- **Real-Time CV Engine & Posture Analysis (Round 1)**:
  - `@mediapipe/tasks-vision` PoseLandmarker (33 keypoints) running locally via GPU/WASM.
  - Vector trigonometry joint angle calculation (`poseGeometry.ts`) and tolerance scoring (`scoreEngine.ts`).
  - Web Speech API Text-to-Speech audio reader (`feedbackEngine.ts`).

---

## 🎨 Design System Tokens

| Element | Token | Usage |
| :--- | :--- | :--- |
| **Base Background** | `#0C0D10` | Neutral graphite-black (no blue tint) |
| **Glass Surface** | `rgba(244,241,236,0.05)` | Warm off-white liquid glass surface |
| **Glass Border** | `rgba(244,241,236,0.10)` | Subtle warm glass border |
| **Primary Accent** | `#3F6B4F` | Deep muted forest/moss green |
| **Secondary Accent**| `#C9A66B` | Warm ochre/gold highlight & active state |
| **Alert/Tertiary** | `#C1502E` | Warm rust/terracotta for corrections |
| **Text Primary** | `#F4F1EC` | Warm off-white |
| **Display Font** | `Fraunces` | Variable serif for scores, titles & greetings |
| **Body Font** | `Inter` | Sans-serif for labels & data density |

---

## 🚀 Quick Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev
```

Visit `http://localhost:5173` in your web browser.

---

## 🏗 Repository Structure

```
src/
├── components/          # Reusable Liquid Glass & SVG UI components
│   ├── AnimatedNumber.tsx
│   ├── BackgroundBlobs.tsx
│   ├── BodySkeletonDiagram.tsx
│   ├── BottomNav.tsx
│   ├── CircularProgressRing.tsx
│   ├── GlassButton.tsx
│   ├── GlassCard.tsx
│   ├── PoseReferenceIllustration.tsx # Custom line-art SVG silhouettes
│   ├── ProtectedRoute.tsx
│   ├── SkeletonOverlayCanvas.tsx
│   ├── StatusBadge.tsx
│   └── TopBar.tsx
├── data/
│   └── poses.ts         # 8 reference poses with target angles, setupSteps & alignmentCues
├── hooks/
│   └── usePoseTracking.ts # Shared camera & MediaPipe tracking hook
├── lib/
│   ├── feedbackEngine.ts # Plain-English tip generation rules
│   ├── mediaPipeLoader.ts # WASM PoseLandmarker loader
│   ├── poseGeometry.ts   # Vector trigonometry joint angle calculation
│   └── scoreEngine.ts    # Posture scoring decay engine
├── screens/
│   ├── FeedbackScreen.tsx
│   ├── FreeTrackScreen.tsx # Free practice & auto pose recognition screen
│   ├── HistoryScreen.tsx
│   ├── HomeScreen.tsx
│   ├── LibraryScreen.tsx
│   ├── LiveDetectScreen.tsx # Target pose scored session screen
│   ├── LoginScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── ProgressScreen.tsx
│   ├── RegisterScreen.tsx
│   └── ScoreScreen.tsx
├── services/
│   ├── authService.ts   # Client-side WebCrypto auth
│   └── db.ts            # IndexedDB operations (idb)
├── store/
│   ├── useAuthStore.ts
│   └── useSessionStore.ts
└── types/
    └── index.ts         # TypeScript definitions
```
