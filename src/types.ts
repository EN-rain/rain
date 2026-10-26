export type ViewMode = 'study' | 'spatial' | 'physics' | 'compare';

export type PaletteId = 'ultramarine' | 'crimson' | 'sumi' | 'solar';

export interface PalettePreset {
  id: PaletteId;
  name: string;
  subtitle: string;
  deepInk: [number, number, number];
  coreBlue: [number, number, number];
  brightEdge: [number, number, number];
  emberPrimary: [number, number, number];
  emberSecondary: [number, number, number];
  swatchHex: string;
}

export interface EnsoSceneConfig {
  viewMode: ViewMode;
  palette: PaletteId;
  flowSpeed: number;
  bristleDetail: number;
  inkDensity: number;
  emberIntensity: number;
  horizonRadius: number;
  compareSplit: number; // 0 = 100% WebGL, 1 = 100% Reference Image
  showEditorial: boolean;
  dockCollapsed: boolean;
  audioEnabled: boolean;
}

export const PALETTE_PRESETS: Record<PaletteId, PalettePreset> = {
  ultramarine: {
    id: 'ultramarine',
    name: 'Ultramarine Study',
    subtitle: 'Original Cobalt & Sumi Ink',
    deepInk: [0.035, 0.085, 0.28],
    coreBlue: [0.14, 0.31, 0.76],
    brightEdge: [0.46, 0.65, 0.98],
    emberPrimary: [0.95, 0.45, 0.21],
    emberSecondary: [1.0, 0.68, 0.36],
    swatchHex: '#244fc2',
  },
  crimson: {
    id: 'crimson',
    name: 'Crimson Eclipse',
    subtitle: 'Vermilion & Obsidian',
    deepInk: [0.24, 0.03, 0.06],
    coreBlue: [0.72, 0.12, 0.18],
    brightEdge: [0.98, 0.48, 0.42],
    emberPrimary: [1.0, 0.72, 0.28],
    emberSecondary: [0.95, 0.35, 0.20],
    swatchHex: '#b81f2e',
  },
  sumi: {
    id: 'sumi',
    name: 'Monolith Sumi',
    subtitle: 'Charcoal & Silver Wash',
    deepInk: [0.06, 0.07, 0.09],
    coreBlue: [0.22, 0.25, 0.30],
    brightEdge: [0.58, 0.62, 0.68],
    emberPrimary: [0.92, 0.48, 0.24],
    emberSecondary: [0.85, 0.65, 0.45],
    swatchHex: '#38404d',
  },
  solar: {
    id: 'solar',
    name: 'Cerulean Corona',
    subtitle: 'Cyan & Gold Accretion',
    deepInk: [0.02, 0.14, 0.26],
    coreBlue: [0.08, 0.48, 0.78],
    brightEdge: [0.38, 0.82, 0.98],
    emberPrimary: [1.0, 0.60, 0.18],
    emberSecondary: [1.0, 0.84, 0.40],
    swatchHex: '#147ac7',
  },
};
