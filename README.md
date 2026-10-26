# React Folder Scroll Animation

A smooth scrolling React application with folder-like sections that scale based on viewport position.

## Features

- Smooth scroll with Lenis
- Hardware-accelerated animations
- TypeScript support
- Modular component structure
- Responsive folder-shaped sections

## Project Structure

```
├── public/
│   └── images/             # Static images (served at /images/)
├── src/
│   ├── assets/
│   │   ├── images/         # Images imported in components
│   │   └── icons/          # SVG icons
│   ├── components/         # React components
│   │   ├── Section.tsx
│   │   ├── FolderWrapper.tsx
│   │   └── index.ts
│   ├── hooks/              # Custom React hooks
│   │   └── useSmoothScroll.ts
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   ├── constants/          # App constants
│   │   └── sections.ts
│   ├── utils/              # Utility functions
│   │   └── scroll.ts
│   ├── styles/             # CSS variables
│   │   └── variables.css
│   ├── App.tsx             # Main app component
│   ├── App.css             # App styles
│   ├── index.css           # Global styles
│   └── main.tsx            # Entry point
├── vite.config.ts          # Vite config with path aliases
├── tsconfig.json           # TypeScript config
└── package.json
```

## Image Usage

### Importing images in components:
```tsx
import heroImage from '@images/hero.jpg';
<img src={heroImage} alt="Hero" />
```

### Using public images:
```tsx
<img src="/images/hero.jpg" alt="Hero" />
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Technologies

- React 18
- TypeScript
- Vite
- Lenis (smooth scroll)
