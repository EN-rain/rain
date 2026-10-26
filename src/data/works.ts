import imgChemQuest from '../assets/images/chemquest.png';
import imgTsukiai from '../assets/images/tsukiai.png';
import oozebirImg from '../assets/images/oozebir.png';
import cscprepImg from '../assets/images/Screenshot 2026-06-10 152807.png';
import cacheMeOutImg from '../assets/images/cachemeoutside.png';
import chemQuestIcon from '../assets/images/chemques-icon.svg';
import typeDuelIcon from '../assets/images/type-duel-logo.png';
import cashMeOutIcon from '../assets/images/cash-me-outside-logo.png';
import studentFlowIcon from '../assets/images/studentflow-logo.png';
import studentFlowBackground from '../assets/images/studentflow-bg.png';
import pocketTradeIcon from '../assets/images/pockettrade-icon.png';
import pocketTradeBackground from '../assets/images/pockettrade-bg.png';
import oozeborneIcon from '../assets/images/oozeborne-logo.png';
import cscprepIcon from '../assets/images/cscprep-logo.png';

export type WorkExperience = {
  year: string;
  role: string;
  place: string;
  summary: string;
  highlights: string[];
};

export type WorkProject = {
  id: string;
  year: string;
  title: string;
  line2: string;
  category: string;
  des: string;
  img: string;
  icon?: string;
  stack: string[];
  status?: string;
  hoursSpent?: string;
  timeline?: { label: string; detail: string }[];
  links?: { label: string; url: string; type: 'github' | 'drive' | 'live' }[];
};

export const experience: WorkExperience[] = [
  {
    year: '2025-2026',
    role: 'Full-Stack Developer Intern',
    place: 'BILT Information Technology Solutions, Villa iloilo',
    summary:
      'Designed and built two full-stack React dashboards with secure authentication (including 2FA). Developed a Node.js backend serving 15+ RESTful endpoints, integrated Supabase PostgreSQL with Row Level Security, and automated client reporting pipelines that process email-to-CSV workflows. \n Converted Figma designs into responsive, production-ready websites for 4 clients using Kajabi and custom CSS/JavaScript implementations, ensuring pixel-perfect fidelity and optimal performance.',
    highlights: ['React', 'Node.js', 'Express.js', 'Supabase', 'PostgreSQL', 'TypeScript', 'Tailwind CSS'],
  },
];

export const projects: WorkProject[] = [
  {
    id: '01',
    year: '2024-2025',
    title: 'ChemQuest2',
    line2: 'STORY-DRIVEN CHEMISTRY LEARNING GAME',
    category: 'GAMES / EDUCATION',
    des: 'A story-led chemistry game where players explore a hometown and complete quests. Short activities make topics such as elements, mixtures, density, and states of matter easier to understand. Progress, achievements, and a glossary give learners a clear reason to keep exploring.',
    img: imgChemQuest,
    icon: chemQuestIcon,
    stack: ['Godot 4.6', 'GDScript', 'Android', 'JSON'],
    links: [
      { label: 'GitHub', url: 'https://github.com/EN-rain/ChemQuest', type: 'github' },
      { label: 'Google Drive', url: 'https://drive.google.com/file/d/1DcR2BbWSssGNkvtVhNa-P65hFhzOb3RD/view?usp=drive_link', type: 'drive' },
      { label: 'v1.0.0 Release', url: 'https://github.com/EN-rain/ChemQuest/releases/tag/v1.0.0', type: 'github' },
    ],
  },
  {
    id: '02',
    year: '2024-2025',
    title: 'StudentFlow',
    line2: 'STUDENT MANAGEMENT WEB, API, AND ANDROID APP',
    category: 'WEB / MOBILE / EDUCATION',
    des: 'A school hub that helps administrators, teachers, and students stay on top of everyday learning. Teachers can manage classes, attendance, assignments, grades, and announcements in one place. Students can follow their work, results, and important updates from the web or mobile app.',
    img: studentFlowBackground,
    icon: studentFlowIcon,
    stack: ['Laravel 12', 'PHP 8.2', 'Blade', 'Sanctum', 'SQLite', 'Dompdf', 'Java 17', 'Retrofit'],
    links: [{ label: 'GitHub', url: 'https://github.com/EN-rain/StudentFLow', type: 'github' }],
  },
  {
    id: '03',
    year: '2025-2026',
    title: 'TsukiAI Voice Chat',
    line2: 'WPF VOICE ASSISTANT + DISCORD BRIDGE',
    category: 'AI / VOICE',
    des: 'A desktop voice companion that listens and responds out loud. It can remember useful context during a conversation, making interactions feel less repetitive. It can also join voice conversations through Discord.',
    img: imgTsukiai,
    stack: ['.NET 8', 'WPF', 'ASP.NET Core', 'Node.js', 'Discord', 'Chroma', 'VOICEVOX'],
    links: [{ label: 'GitHub', url: 'https://github.com/EN-rain/TsukiAI-Desktop', type: 'github' }],
  },
  {
    id: '04',
    year: '2026-Present',
    title: 'Oozeborne',
    line2: '4-PLAYER CO-OP SURVIVORS + MOON SERVER',
    category: 'GAMES / MULTIPLAYER (IN DEVELOPMENT)',
    des: 'An in-development co-op survival game where up to four players team up against waves of enemies. Players need to stay together, adapt to the chaos, and survive for as long as possible. The experience is built around shared action and replayable runs.',
    img: oozebirImg,
    icon: oozeborneIcon,
    stack: ['Godot 4.6', 'Go', 'WebSockets', 'Node.js', 'PostgreSQL', 'Redis', 'Next.js', 'Docker'],
    links: [{ label: 'GitHub', url: 'https://github.com/EN-rain/Oozeborne', type: 'github' }],
    status: 'In Development',
  },
  {
    id: '05',
    year: 'May 2026 (hackathon project)',
    title: 'TypeDuel',
    line2: 'COMPETITIVE PIXEL TYPING DUEL',
    category: 'GAMES / MULTIPLAYER',
    des: 'A fast pixel-art typing battle where every word affects the fight. Players race through prompts, use character abilities, and compete on speed and accuracy. Challenge a friend in a private room or jump into a matched duel.',
    img: '',
    icon: typeDuelIcon,
    stack: ['Godot 4.6', 'Node.js', 'Express', 'Socket.IO', 'WebSockets', 'SQLite'],
    links: [
      { label: 'GitHub', url: 'https://github.com/EN-rain/TypeDuel', type: 'github' },
      { label: 'v1.0.0 Release', url: 'https://github.com/EN-rain/TypeDuel/releases/tag/v1.0.0', type: 'github' },
    ],
    status: 'MVP',
  },
  {
    id: '06',
    year: 'May-June 2026',
    title: 'CSCprep',
    line2: 'CIVIL SERVICE EXAM REVIEWER',
    category: 'WEB / EDUCATION',
    des: 'A focused Civil Service Exam practice tool for building confidence before test day. Learners can take quick quizzes, focus on one subject, or try a timed session. Clear answer reviews show what went right and where more practice is needed.',
    img: cscprepImg,
    icon: cscprepIcon,
    stack: ['React 19', 'TypeScript', 'Vite', 'Lenis', 'JSON'],
    links: [
      { label: 'GitHub', url: 'https://github.com/EN-rain/CSCprep', type: 'github' },
      { label: 'Live Site', url: 'https://cs-cprep.vercel.app', type: 'live' },
    ],
  },
  {
    id: '07',
    year: 'June 2026',
    title: 'PocketTrade',
    line2: 'USED-PHONE MARKETPLACE',
    category: 'WEB / MOBILE / MARKETPLACE',
    des: 'A safer place to buy and sell used phones. Browse listings, save favorites, and chat directly with sellers when you find a device you like. Built-in reporting helps users flag anything that does not look right.',
    img: pocketTradeBackground,
    icon: pocketTradeIcon,
    stack: ['Flutter', 'Dart', 'NestJS', 'TypeScript', 'Prisma', 'PostgreSQL', 'React', 'Cloudinary', 'Socket.IO', 'Firebase'],
    links: [{ label: 'GitHub', url: 'https://github.com/EN-rain/PocketTrade', type: 'github' }],
  },
  {
    id: '08',
    year: '2026-Present',
    title: 'Cache Me Outside',
    line2: 'NEWSPAPER-STYLE 2020 INTERNET TIME CAPSULE',
    category: 'WEB / ARCHIVE / CMS',
    des: 'A newspaper-style time capsule for memorable internet moments from 2020. Visitors can browse the year by month and day, discovering stories in a more deliberate, archival format. It is designed to make a familiar year feel worth revisiting.',
    img: cacheMeOutImg,
    icon: cashMeOutIcon,
    stack: ['Next.js', 'Supabase', 'Resend', 'Vercel'],
    links: [{ label: 'GitHub', url: 'https://github.com/EN-rain/Cache-Me-Out', type: 'github' }],
    status: 'In Development',
  },
];
