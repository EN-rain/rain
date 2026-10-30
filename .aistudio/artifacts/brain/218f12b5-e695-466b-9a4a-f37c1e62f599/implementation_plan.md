# Implementation Plan: Fantasy Clipboard Works & Vintage Contact Desk

Restructure the portfolio to feature the fantasy clipboard layout from `fantasy-clipboard.zip` for the **Works** section with an entrance scatter-and-settle animation, update navigation to 4 bookmark tabs (**Home**, **About**, **Works**, **Contact**), and establish **Page 2** as a vintage typewriter **Contact** desk.

---

## User Review Required

> [!IMPORTANT]
> - **Navigation Structure**: The 4 bookmark tabs will be **Home** (returns to desk folder), **About** (opens the Page 1.5 spread dossier), **Works** (opens the animated fantasy clipboard), and **Contact** (triggers the WebGL transition to Page 2 vintage typewriter desk).
> - **Works Interaction**: Clicking any of the 6 projects on the front paper will smoothly update the picture frame with the project's screenshot and display its tech stack tags on the small note, along with an interactive link to inspect the repository.
> - **Animation Behavior**: The clipboard pieces start scattered across the desk background with randomized rotations and offsets, then seamlessly animate and settle into the exact pixel-perfect positions and rotations defined in `index.html`. A "Re-scatter" button allows replaying this sequence anytime.

---

## Proposed Changes

### 1. Asset Pipeline & Preloading
- Ensure clipboard assets extracted from `/public/assets/aistudio/fantasy-clipboard_49c7cd9d.zip` are located at `/public/assets/clipboard/`:
  - `clipboard-board.png`
  - `bottom-paper.png`
  - `middle-paper.png`
  - `front-paper.png`
  - `transparent-photo-frame.png`
  - `small-note.png`
  - `clipboard-clip.png`
- Register these assets in `ALL_AHEAD_OF_TIME_ASSETS` in `src/App.tsx` so they are fully decoded into memory before the loading screen completes.

---

### 2. Navigation Bookmark Tabs (`src/components/BookmarkTabs.tsx`)
- Expand `TABS` array to 4 distinct bookmark tabs with alternating typewriter rotations and z-index hierarchy:
  1. **Home** (`paperId: 'home'`) — resets stationery and folder.
  2. **About** (`paperId: 'about'`) — triggers the Page 1.5 dossier spread.
  3. **Works** (`paperId: 'works'`) — opens the fantasy clipboard modal/view.
  4. **Contact** (`paperId: 'contact'`) — triggers the WebGL section transition to Page 2.

---

### 3. Fantasy Clipboard Works Component (`src/components/FantasyClipboardWorks.tsx`)
- Migrate `index.html` CSS coordinate system (`aspect-ratio: 1672/941`):
  - **Board Asset**: `left: 16.9856%`, `top: 9.1392%`, `width: 64.8923%`, `height: 75.8767%`.
  - **Bottom Paper**: `left: 34.7488%`, `top: 18.7035%`, `rotate: 1.4deg`.
  - **Middle Paper**: `left: 35.3469%`, `top: 17.6408%`, `rotate: -1.1deg`.
  - **Front Paper**: `left: 35.9450%`, `top: 16.5781%`, `rotate: 0deg`.
  - **Photo Frame**: `left: 20.6340%`, `top: 20.9352%`, `width: 12.8589%`, `height: 24.4421%`.
  - **Small Note**: `left: 18.4211%`, `top: 45.8023%`, `width: 16.4474%`, `height: 35.6004%`.
  - **Clipboard Clip**: `left: 50.1%`, `top: 8%`, `width: 14.4%`, `height: 10.9%`.
- **Entrance Animation (Scatter to Settle)**:
  - On mount/open, each asset starts at an offset scattered coordinate beyond the board edges with randomized rotations (-25° to +25°).
  - Animate each element into its exact target HTML coordinate using spring/cubic-bezier physics with staggered delays.
  - Provide a vintage stamp **"Re-scatter / Assemble"** control button.
- **Front Paper Content**:
  - Title at the top: `PROJECTS` (vintage stamped serif/typewriter typography).
  - 6 project items formatted strictly as:
    ```
    - StudentFlow           2024 – 2025
    - PocketTrade           June 2026
    - ChemQuest             2024 – 2025
    - TypeDuel              May 2026
    - TsukiAI               2025 – 2026
    - Auvrynt               July – Oct 2026
    ```
  - Interactive selection highlight (ink underline and quill marker).
- **Small Note Content**:
  - Exclusively displays the **Tech Stack** chips/pills for the currently active project (e.g., Next.js, TypeScript, Node.js, Express, PostgreSQL for StudentFlow).
- **Picture Frame Content**:
  - Image only: renders the active project's screenshot (`/assets/projects/studentflow.png`, etc.) clipped neatly inside the transparent photo frame.
  - Hover action reveals a subtle vintage wax seal or link to open the GitHub repository.

---

### 4. Page 2: Vintage Typewriter Contact Desk (`src/components/VintageContactDesk.tsx`)
- Replace the old case board with a vintage typewriter message station matching the user's preference:
  - Vintage telegram dispatch card with input fields:
    - `Agent Callsign / Name`
    - `Return Frequency / Email`
    - `Dispatch Message`
    - `Transmit Dispatch` button with mechanical typewriter sound feedback / visual typewriter key press effect.
  - Pinned communication channels:
    - GitHub profile link (`https://github.com/EN-rain`)
    - Direct email link (`edrian.vipscaleph@gmail.com`)
    - Location / Timezone status indicator.
  - Return to Desk bookmark navigation button to transition back to Page 1.

---

### 5. Orchestration in `src/App.tsx` and `src/components/VintageStationery.tsx`
- Connect bookmark navigation:
  - Clicking `Home` resets any open spread and returns to desk.
  - Clicking `About` displays the Page 1.5 spread dossier.
  - Clicking `Works` opens the `FantasyClipboardWorks` scene.
  - Clicking `Contact` triggers `handleSwitchPage(2)` through the WebGL transition overlay.

---

## Verification Plan

### Automated Checks
- `lint_applet`: Verify syntax, TypeScript types, and import validity.
- `compile_applet`: Confirm full Vite React production build succeeds with no missing dependencies or assets.

### Interactive User Experience Verification
- **Preload Flow**: Confirm loading bar smoothly loads all assets including clipboard textures.
- **Bookmarks**: Verify 4 tabs (Home, About, Works, Contact) click seamlessly.
- **Works Scatter & Settle**: Verify assets scatter in background and smoothly settle into the exact coordinates of `index.html`.
- **Works Selection**: Click through all 6 projects; check that photo frame updates image only and small note updates tech stack.
- **Page 2 Contact**: Switch to Page 2; verify WebGL transition runs without purple tint, typewriter dispatch desk loads, and contact links function.
