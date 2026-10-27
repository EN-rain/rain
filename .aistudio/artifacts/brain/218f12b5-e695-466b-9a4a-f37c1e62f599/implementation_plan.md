# WebGL Section Scroll Transitions & Works Horizontal Timeline Redesign

This plan replaces the rigid custom SVG section masks and 3D card-stack scroll transforms with the cloned repository's directional **WebGL Mud-Normal & Contour-Edge Scroll Transition** across all sections, while redesigning the **Works** section into an interactive **Horizontal Timeline** powered by **Anime.js** choreography and a **velocity-reactive WebGL** backdrop.

## User Review & Critical Decisions

> [!IMPORTANT]
> **Updated Scope Based on Your Feedback**:
> - **Confirmed Decision 1 — Full-Bleed Sections with Cloned Repo WebGL Scroll Transitions**: Remove the custom SVG polygon masks (`mask-shaped-section`) and 3D card-stack scaling/rotation (`scale(1.2)`, `rotateZ`, counter-scaled containers) across `Home`, `About`, `Works`, and `Contact`. Each section now renders at clean, native `100vw × 100vh` (`scale(1)`) geometry for effortless layout editing, connected by the cloned repo's directional WebGL mud-normal + `fwidth` contour-edge scroll wipe shader.
> - **Confirmed Decision 2 — Unified Horizontal Works Timeline**: Arrange the Works timeline as a single continuous horizontal track starting with **Work Experience (`00 / EXPERIENCE`)** followed by **Featured Projects (`01`–`04`)** and ending with a **Full Archive Portal (`05 / ARCHIVE`)**.
> - **Confirmed Decision 3 — Velocity-Reactive WebGL Timeline Backdrop & Anime.js**: Pair a scroll-velocity-reactive WebGL energy wave and particle field behind the Works timeline with Anime.js SVG rail drawing, elastic node pulses, and staggered card reveals.

---

## 1. Overview & Core Concept

- **What It Does**:
  1. **WebGL Section Scroll Transitions**: Scrolling between `Home`, `About`, `Works`, and `Contact` triggers the cloned repo's directional WebGL shader transition—wiping vertically and diagonally with `mud_normal` organic distortion, luminance derivative (`fwidth`) wireframe contour etching, a pulsing luminous rim, and a rising section title indicator (`#01 Home`, `#02 About`, `#03 Works`, `#04 Contact`).
  2. **Native 1:1 Section Geometry**: Every section occupies a true `100vw × 100vh` frame without SVG cutout masks or counter-scaled wrapper math, making future layout edits clean and flexible.
  3. **Works Horizontal Timeline**: Once inside `#works`, vertical scroll smoothly scrubs a unified horizontal timeline track from Work Experience through Featured Projects to the Archive portal.
- **Target Audience / Persona**: Engineering recruiters, hiring managers, and collaborators exploring Edrian Nieves's portfolio.
- **Key Value**: Combines the signature WebGL shader transitions from the reference repository with a flexible, easy-to-edit section layout and a showcase horizontal timeline for Works.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Section-to-Section Scrolling (`Home ↔ About ↔ Works ↔ Contact`)**:
     - While viewing a section, it fills the full viewport cleanly at `1:1` scale.
     - Scrolling across a section boundary activates the **WebGL Scroll Transition Overlay**: the outgoing section's visual snapshot zooms subtly (`1.0 → 1.3`) while the incoming section zooms in (`1.3 → 1.0`) across a jagged `mud_normal` wavefront etched with `fwidth` contour lines and a bright wavefront glow.
     - During the transition between `About` and `Works`, the global `EN` monogram docks cleanly into the `WORK EXPERIENCE` heading at the start of the horizontal timeline.
  2. **Horizontal Timeline Scrubbing in `#works`**:
     - **Station 00 (`00 / EXPERIENCE`)**: Anchors the start of the timeline with the `WORK EXPERIENCE` title and the **Logicbase Interactive** (`2026 / INTERNSHIP`) milestone card.
     - **Stations 01–04 (`01`–`04 / SELECTED WORKS`)**: Scrubbing horizontally reveals featured project stations along a glowing SVG circuit rail. Each node pulses with Anime.js elastic rings and staggered card/tag reveals.
     - **Station 05 (`05 / ARCHIVE`)**: Terminal node at the end of the rail displaying total project count and an interactive trigger that opens the `/projects` archive view.
     - **Bottom Timeline Scrubber HUD**: Displays clickable station ticks (`EXP`, `01`–`04`, `ARCHIVE`) and progress percentage for instant jumping.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: High-craft dark-mode technical portfolio with atmospheric WebGL shaders and crisp architectural typography.
  - *Color Palette & Mood*: Deep obsidian (`#070709`) and stark white (`#ffffff`) contrast across sections, accented by electric violet (`#7c3aed`), soft lavender (`#a78bfa`), and luminous white contour edges during WebGL transitions.
  - *Typography & Hierarchy*: `Sora` for bold display headers and station numerals, `Space Grotesk` for editorial body copy, and `IBM Plex Mono` for technical metadata, timestamps, and timeline HUD coordinates.
  - *Component Styling & Layout*: Full-bleed `100vw × 100vh` section containers on desktop; responsive vertical flow on mobile (`<= 768px`).

- **Interactive Feedback & Motion**:
  - **WebGL Scroll Wipe**: Directional (`uDirection = 1` down, `-1` up) shader wipe with `mud_normal` distortion and `fwidth` luminance edge detection.
  - **Anime.js Timeline Micro-Interactions**: SVG timeline path `strokeDashoffset` drawing, elastic node activation rings, and magnetic hover states on project cards.
  - **Velocity-Reactive Works Shader**: Horizontal scroll speed amplifies the WebGL energy wave ribbon and particle streak intensity behind the timeline track.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Replace SVG Masked Card-Stack with Full-Bleed Sections + WebGL Scroll Shader**
  - *Chosen Approach*: Remove `.mask-shaped-section` SVG masks and the `scale(0.5..1.2)` / `rotateZ(10deg)` / `rotateY(70deg)` 3D card-stack transforms; use a dedicated fullscreen WebGL 2 transition canvas (`SectionScrollTransition`) ported from the cloned repo's `RouteTransitionRenderer` to transition between sections.
  - *Why*: Eliminates counter-scaling math (`invScale = 1 / 1.2`) and SVG clipping boundaries so any section can be edited with standard CSS/Tailwind positioning while delivering the exact WebGL scroll transition look from the cloned repo.
  - *Alternatives Considered*: Keeping the SVG mask and adding WebGL inside each card—rejected because the SVG mask clips full-screen effects and makes layout edits brittle.

- **Decision 2: Scroll-Driven Horizontal Timeline Pinning in `#works`**
  - *Chosen Approach*: Keep `#works` pinned during its scroll window so vertical wheel/touch scroll scrubs the horizontal track (`0 → 1` progress) before triggering the WebGL transition into `#contact`.
  - *Why*: Preserves natural single-page vertical scrolling while giving the user full control over horizontal timeline scrubbing and station jumping.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Portfolio Scroll Controller                      │
│   Lenis Smooth Scroll ──► Section Progress & Transition State [0..3]    │
└───────────────┬─────────────────────────────────────────┬───────────────┘
                │                                         │
                ▼                                         ▼
┌───────────────────────────────────────┐ ┌───────────────────────────────┐
│   WebGL Section Scroll Transition     │ │   Global EN Monogram Docker   │
│  (Ported from Cloned Repo Shader)     │ │  Tracks Home ──► About ──►    │
│  • Directional mud_normal wavefront   │ │  Works Station 00 [EN] Target │
│  • fwidth(luma) contour edge etching  │ └───────────────────────────────┘
│  • UV zoom (1.0 ↔ 1.3) + rim glow     │
│  • Section HUD (#01..#04 title lift)  │
└───────────────┬───────────────────────┘
                │ Reveals Full-Bleed 100vw × 100vh Sections (No SVG Mask)
                ▼
┌───────────────┬───────────────┬─────────────────────────────────────────┐
│ #01 Home      │ #02 About     │ #03 Works (Horizontal Timeline)         │
│ Full-bleed    │ Full-bleed    │ ┌─────────────────────────────────────┐ │
│ Hero +        │ WebGL Enso +  │ │ Velocity-Reactive WebGL Backdrop    │ │
│ Parallax      │ GitHub Graph  │ │ (Energy Wave + Particle Field)      │ │
└───────────────┴───────────────┘ ├─────────────────────────────────────┤ │
                                  │ Anime.js Choreographed Track        │ │
                                  │ [00 EXP]─[01]─[02]─[03]─[04]─[05]   │ │
                                  ├─────────────────────────────────────┤ │
                                  │ Interactive Bottom Scrubber HUD     │ │
                                  └─────────────────────────────────────┘ │
                                  #04 Contact (Full-bleed White Canvas)   │
                                  └───────────────────────────────────────┘
```

- **Data Model & State**:
  - **Section Transition State**: Active section index (`0..3`), transition pair (`fromIndex`, `toIndex`), normalized transition progress (`uProgress ∈ [0, 1]`), and scroll direction (`uDirection ∈ {1, -1}`).
  - **Works Timeline State**: Normalized horizontal progress (`timelineProgress ∈ [0, 1]`), smoothed scroll velocity (`uVelocity`), active station index (`0..5`), and expanded project modal/route navigation state.

- **Interactive Component & State Mapping**:
  - **Scroll Transition Shader**: Receives `uProgress`, `uDirection`, and `uTime` on each scroll frame during section transitions; renders transparent (`display: none` / `opacity: 0`) when settled inside a section so DOM interactions remain 100% native and unobstructed.
  - **Works Horizontal Track & Scrubber**: Translates `translate3d(-progress * maxTrackScroll, 0, 0)` on desktop, triggers Anime.js node animations when `activeStation` updates, and allows clicking any bottom HUD station button to scroll directly to that station's scroll offset.
