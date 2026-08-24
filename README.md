# YogaSense AI — Master Build (Round 4 Refined)

**YogaSense AI** is a client-side AI-driven posture assistant and guided yoga practice application. Built with React 18, TypeScript, Vite, Tailwind CSS, MediaPipe PoseLandmarker, and Manrope/Inter typography, it provides real-time body tracking, posture scoring, auto pose recognition, and detailed posture reference guides.

---

## 🌟 Key Features & Refinement Rounds

- **Hardened Tracking Pipeline (Round 4)**:
  - Upgraded MediaPipe engine to high-precision `pose_landmarker_heavy.task` running on GPU with 0.65 confidence thresholds.
  - Per-landmark visibility gating (threshold >= 0.6): occluded or low-confidence keypoints are excluded from joint angle calculation to prevent hallucinated scores.
  - Exponential Moving Average (EMA) temporal smoothing (`alpha = 0.45`) across consecutive frames eliminates skeleton twitching/jitter.
  - Full-Body-in-Frame Guard: detects lower-body landmark visibility and displays an on-screen prompt (*"Step back so your full body is visible"*) when user is too close to camera.
  - Rolling window hysteresis (12-frame window) on auto-match detector prevents label flickering between candidate poses.

- **20 Reference Asanas (Round 4)**:
  - Expanded pose library to 20 total poses with complete setup steps, alignment cues, anatomical target angles, and custom SVG line-art figures:
    *Standing*: Mountain (Tadasana), Triangle (Trikonasana), Warrior I (Virabhadrasana I), Chair (Utkatasana), Low Lunge (Anjaneyasana)
    *Seated*: Lotus (Padmasana), Child's Pose (Balasana), Cat-Cow (Marjaryasana-Bitilasana), Boat (Navasana), Seated Forward Bend (Paschimottanasana)
    *Backbend*: Cobra (Bhujangasana), Bridge (Setu Bandhasana), Camel (Ustrasana), Bow (Dhanurasana)
    *Inversion*: Downward Dog (Adho Mukha Svanasana)
    *Balance*: Tree (Vrikshasana), Eagle (Garudasana), Dancer (Natarajasana), Half Moon (Ardha Chandrasana)
    *Twist*: Half Spinal Twist (Ardha Matsyendrasana)

- **Reference Color Palette & Amber Liquid Glass Material (Round 4)**:
  - **Base Background**: Deep charcoal-navy near-black (`#0A0E14` base, `#0F1620` surface).
  - **Card Surface**: Dark charcoal fill `#151B24` (90% opacity), `rgba(255,255,255,0.08)` border, `backdrop-filter: blur(20px)`.
  - **Primary Accent**: Bright emerald green (`#22C55E` → `#34D399` gradient) for CTAs, active bottom-nav, progress arcs, and skeleton dots.
  - **Amber Liquid-Glass Material**: Warm gold specular mount sweep (`@keyframes liquidSweep`), amber-tinted frosted overlay blur (`.glass-amber-modal`), traveling ring arc glint, and amber icon tap glow (`#F59E0B`).
  - **Typography**: Clean modern sans pairing of **Manrope** (headings, numbers, scores) + **Inter** (body & UI).

- **Pose Reference Guide & Setup Steps (Round 3)**:
  - Pre-tracking "Get Ready" overlay on `/live/:poseId` and collapsible mid-session reference guide.

- **Free Practice & Auto Pose Recognition (`/live`) (Round 2)**:
  - Real-time pose recognition engine continuously scores joint angles against reference poses and prompts the user when a pose is held for ~1.5s.

---

## 🎨 Design System Tokens

| Element | Token | Usage |
| :--- | :--- | :--- |
| **Base Background** | `#0A0E14` | Deep charcoal-navy near-black |
| **Surface Layer** | `#0F1620` | Screen & panel background |
| **Card Fill** | `#151B24` | Dark charcoal card surface (~90% opacity) |
| **Primary Accent** | `#22C55E` → `#34D399` | Bright emerald green primary CTAs & active tabs |
| **Amber Material** | `#F59E0B` | Liquid-glass sheen, warning bars, "Slight" status |
| **Error/Poor** | `#EF4444` | Red alert status |
| **Text Primary** | `#F5F7FA` | Clean off-white primary |
| **Headings Font** | `Manrope` | Modern sans for scores, numbers & headings |
| **Body Font** | `Inter` | Sans-serif for body & data density |

---

## 🚀 Quick Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev
```

Visit `http://localhost:5173` or `http://localhost:5175` in your web browser.

---

## 🏗 Repository Structure

```
src/
├── components/          # Liquid Glass & SVG UI components
│   ├── AnimatedNumber.tsx
│   ├── BackgroundBlobs.tsx
│   ├── BodySkeletonDiagram.tsx
│   ├── BottomNav.tsx
│   ├── CircularProgressRing.tsx
│   ├── GlassButton.tsx
│   ├── GlassCard.tsx
│   ├── PoseReferenceIllustration.tsx # Custom line-art SVG silhouettes for 20 poses
│   ├── ProtectedRoute.tsx
│   ├── SkeletonOverlayCanvas.tsx
│   ├── StatusBadge.tsx
│   └── TopBar.tsx
├── data/
│   └── poses.ts         # 20 reference poses with target angles, setupSteps & alignmentCues
├── hooks/
│   └── usePoseTracking.ts # Camera, PoseLandmarker heavy, EMA smoothing & full-body guard
├── lib/
│   ├── feedbackEngine.ts # Plain-English tip generation rules
│   ├── mediaPipeLoader.ts # Heavy/Full GPU PoseLandmarker loader
│   ├── poseGeometry.ts   # Vector trigonometry & 0.6 visibility gating
│   └── scoreEngine.ts    # Posture scoring decay engine
├── screens/
│   ├── FeedbackScreen.tsx
│   ├── FreeTrackScreen.tsx # Free practice & auto pose recognition (rolling hysteresis)
│   ├── HistoryScreen.tsx
│   ├── HomeScreen.tsx
│   ├── LibraryScreen.tsx # 20 poses with category chips (Standing, Seated, Backbend, etc.)
│   ├── LiveDetectScreen.tsx # Target pose scored session screen
│   ├── LoginScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── ProgressScreen.tsx
│   ├── RegisterScreen.tsx
│   └── ScoreScreen.tsx
├── services/
│   ├── authService.ts
│   └── db.ts            # IndexedDB operations (idb)
├── store/
│   ├── useAuthStore.ts
│   └── useSessionStore.ts
└── types/
    └── index.ts         # TypeScript definitions
```
