export type StationeryState =
  | 'hidden'
  | 'entering'
  | 'visible'
  | 'leaving'
  | 'journal-opening'
  | 'journal-open'
  | 'journal-closing';

export interface BookmarkItem {
  id: string;
  label: string;
  paperId: string;
  rotation: string;
  overshoot: number;
  introDelay: number;
  outroDelay: number;
}

export interface VintageStationeryProps {
  autoPlay?: boolean;
  onBookmarkClick?: (paperId: string) => void;
  onStateChange?: (state: StationeryState) => void;
  assetsPath?: string;
  className?: string;
  initialPage?: 1 | 2;
  page?: 1 | 2;
  onPageChange?: (page: 1 | 2) => void;
}

export interface ScrapbookTapeConfig {
  src: string;
  x: string;
  y: string;
  rotation: number;
  width?: string;
}

export interface ScrapbookItemNote {
  id: string;
  tapes?: ScrapbookTapeConfig[];
  tape?: string;
  tapePosition?: 'top-left' | 'top-right' | 'top-center' | 'top-left-diagonal' | 'top-right-diagonal';
  tapeStyle?: React.CSSProperties;
  style?: React.CSSProperties;
  text?: string;
}

export interface DossierSideCard {
  tag?: string;
  title: string;
  subtitle?: string;
  caseNo?: string;
  date?: string;
  classification?: string;
  lines: string[];
  stack?: string[];
  repoUrl?: string;
  stamp?: string;
}

export interface ScrapbookItem {
  id: string;
  title: string;
  frame?: {
    id?: string;
    image?: string;
    logo?: string;
    imageFit?: 'cover' | 'contain';
    style?: React.CSSProperties;
  };
  note?: ScrapbookItemNote;
  notes?: ScrapbookItemNote[];
  cx?: number;
  cy?: number;
  dossierDetails?: {
    leftCard?: DossierSideCard;
    rightCard?: DossierSideCard;
  };
}

export interface ScrapbookBoardProps {
  assetsPath?: string;
  onBack?: () => void;
  className?: string;
  items?: ScrapbookItem[];
  dimLevel?: number;
  enableShader?: boolean;
  active?: boolean;
  entered?: boolean;
  transitionComplete?: boolean;
}

export interface PaperStackProps {
  assetsPath: string;
  paperBundleRef: React.RefObject<HTMLDivElement | null>;
  sheetOneRef?: React.RefObject<HTMLImageElement | null>;
  sheetTwoRef?: React.RefObject<HTMLImageElement | null>;
  sheetThreeRef?: React.RefObject<HTMLImageElement | null>;
  children?: React.ReactNode;
}

export interface BookmarkTabsProps {
  assetsPath: string;
  tabOneRef: React.RefObject<HTMLButtonElement | null>;
  tabTwoRef: React.RefObject<HTMLButtonElement | null>;
  tabThreeRef: React.RefObject<HTMLButtonElement | null>;
  tabFourRef: React.RefObject<HTMLButtonElement | null>;
  onSelectBookmark: (paperId: string) => void;
  disabled?: boolean;
}

export interface DeskAccentsProps {
  assetsPath: string;
  photoBundleRef: React.RefObject<HTMLDivElement | null>;
  photoRef: React.RefObject<HTMLImageElement | null>;
  portraitRef: React.RefObject<HTMLImageElement | null>;
  magnifierRef: React.RefObject<HTMLImageElement | null>;
  glassReflectionRef: React.RefObject<HTMLDivElement | null>;
}

export interface JournalOverlayProps {
  assetsPath: string;
  visible: boolean;
  state: StationeryState;
  activeBookmark: string | null;
  openingVideoRef: React.RefObject<HTMLVideoElement | null>;
  closingVideoRef: React.RefObject<HTMLVideoElement | null>;
  onClose: () => void;
  disabled?: boolean;
}
