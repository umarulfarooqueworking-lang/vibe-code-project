# Nike Sneaker 3D Motion Website · Anatomy of Motion

A high-performance, studio-grade 3D product motion experience powered by a **10-second, 300-frame sequential canvas engine** (30 FPS, 16:9 landscape).

Built for [vibe-code-project](https://github.com/umarulfarooqueworking-lang/vibe-code-project).

---

## 🎬 Motion Timeline Choreography

The sequence features a black-and-white Nike sneaker floating against a uniform matte charcoal backdrop with soft white key illumination and restrained cool rim lighting, framed from a three-quarter lateral perspective.

| Phase | Timecode | Frames | Description |
|---|---|---|---|
| **Act 01: Assembled Stance** | `00:00.00 – 00:02.00` | Frames 001 – 060 | Fully assembled sneaker centered in locked 3/4 perspective. |
| **Act 02: Vertical Deconstruction** | `00:02.00 – 00:06.00` | Frames 061 – 180 | Suspended laces lift above eyelets; mesh upper rises with Swoosh intact; midsole and rubber tread separate below in staggered easing. |
| **Act 03: Exploded Anatomy Hold** | `00:06.00 – 00:08.00` | Frames 181 – 240 | Stationary hold with zero camera drift. Clear vertical gaps expose insole contours, internal dampening chambers, and waffle lugs. |
| **Act 04: Precision Reassembly** | `00:08.00 – 00:10.00` | Frames 241 – 300 | Symmetrical retracing along coordinate axes. Mechanical lock completed by ~9.5s, holding identical opening scale and lighting. |

---

## ✨ Features & Architecture

- **High-Performance Canvas Engine**:
  - High-DPI Retina scaling (`devicePixelRatio`).
  - Preloaded asynchronous decoded frame pipeline (300 frames in RAM).
  - Bidirectional fluidity (scrubs seamlessly forward and backward).
  - Real-time canvas inpainting to seamlessly remove bottom-right watermark stars.
- **Dual Playback Modes**:
  - **Scroll Mode**: Apple-style scroll-driven scrubbing (480vh travel) with inertia lerp damping.
  - **Autoplay Video Mode**: True 30.0 FPS playback with Play/Pause, Loop, and Reverse (`R`).
- **Interactive Scrubber & Stepper**:
  - Drag timeline scrubber across all 300 frames with real-time timecode (`00:00.00` to `00:10.00`).
  - Frame-by-frame step buttons (`⏮ -1` / `+1 ⏭`).
  - Playback speed toggles: `0.5x` (slow-motion analysis), `1.0x` (real-time), `2.0x`.
- **Interactive Component Hotspots**:
  - Pulsating callout badges appear during the exploded phase (Frames 70–255).
  - Inspect **Suspended Lace System**, **Engineered Mesh Upper & Swoosh**, **Contoured Insole**, **Sculpted EVA Midsole**, and **Waffle Outsole**.
- **Procedural Sound Design (Web Audio API)**:
  - Real-time synthesized pneumatic whoosh, frame scrub clicks, and reassembly magnetic lock (zero external audio files).
  - Mute/unmute toggle (`M`).
- **Export Suite**:
  - **📸 Snapshot**: Instant download of the current frame at native resolution (`.jpg`).
  - **🎥 Export 30fps Video**: Records all 300 frames in real-time via `MediaRecorder` into a 10-second 30 FPS video (`.webm`/`.mp4`).
- **Collector Reservation Flow**:
  - Interactive modal with size selector (US 7 to 12) and simulated order confirmation.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|---|---|
| `Space` | Play / Pause Autoplay |
| `←` / `→` | Step frame backward / forward |
| `Shift + ←` / `Shift + →` | Jump 10 frames backward / forward |
| `R` | Reverse playback direction |
| `M` | Toggle sound effects (SFX) |
| `F` | Toggle fullscreen mode |

---

## 🚀 Running the Project

Inside `vibe-code-project`:

### Production Server (Zero external dependencies)
```bash
npm start
# Server starts at http://localhost:3000
```

### Vite Dev Server (Hot Module Replacement)
```bash
npm run dev
# Starts Vite on http://localhost:5173
```

### Build Production Bundle
```bash
npm run build
```
The compiled output is saved to `dist/`, ready to deploy to Netlify, Vercel, or GitHub Pages.
