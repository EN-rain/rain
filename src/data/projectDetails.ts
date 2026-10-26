export type ProjectReadmeSection = {
  eyebrow: string;
  title: string;
  items: string[];
};

export type ProjectDetail = {
  overview: string[];
  features: string[];
  architecture: { label: string; detail: string }[];
  readmeSections: ProjectReadmeSection[];
};

export const projectDetails: Record<string, ProjectDetail> = {
  '01': {
    overview: [
      'ChemQuest2 is a Godot 4.6 chemistry-learning game that combines a story-driven hometown hub with quests, an element glossary, achievements, and interactive minigames. It supports desktop preview and Android export through Godot\'s mobile renderer.',
      'Chapter One branches from the hometown into lessons for elements, compounds, mixtures, separation methods, accuracy and precision, density, and states of matter. NPC interactions, buildings, quests, and rewards connect those lessons to the game\'s progression.',
      'Shared managers coordinate quests, saving, spawning, dialogue, music, sound effects, fades, guidance, and feedback. Project data files hold quest definitions and learning content, while Godot user storage preserves the player\'s current scene and progress.',
    ],
    features: [
      'Story-driven hometown hub',
      'Quest-based lesson progression',
      'Elements, compounds, and mixtures lessons',
      'Separation-method activities',
      'Accuracy, precision, and density challenges',
      'States-of-matter platforming and minigames',
      'Element glossary and achievements',
      'Local saves and Android export support',
    ],
    architecture: [
      { label: 'Intro and menu', detail: 'Godot opens the intro scene, then routes the player through the main menu and into the story flow.' },
      { label: 'Hometown hub', detail: 'NPCs, dialogue, panels, maps, and building entrances direct the player toward lesson objectives.' },
      { label: 'Quest progression', detail: 'QuestManager loads quest definitions, tracks active objectives, and connects hub interactions to lesson progression.' },
      { label: 'Lesson areas', detail: 'Building One and Building Two contain separate chemistry lessons, activities, platforming sections, and minigames.' },
      { label: 'Save and export', detail: 'SaveManager writes progress to local user storage, while the Android preset packages the mobile build.' },
    ],
    readmeSections: [
      {
        eyebrow: 'Configuration',
        title: 'Project information',
        items: [
          'Built with Godot 4.6 using the mobile renderer and a 1280 × 720 default viewport.',
          'The intro scene leads to the main menu and the main game flow.',
          'Targets desktop preview and Android export.',
          'Touch support uses mouse-to-touch emulation and mobile-oriented settings.',
        ],
      },
      {
        eyebrow: 'Input and content',
        title: 'Controls and lesson coverage',
        items: [
          'Desktop controls include movement, interaction, jumping, and dropping.',
          'Building One covers elements, compounds, mixtures, separation methods, and accuracy versus precision.',
          'Building Two covers density challenges and states-of-matter platforming or minigames.',
          'The glossary provides element information and achievements connect rewards to quest completion.',
        ],
      },
      {
        eyebrow: 'Repository',
        title: 'Structure and systems',
        items: [
          'Shared assets contain fonts, UI, characters, and environments.',
          'Global folders contain autoload managers, shared data, music, and sound effects.',
          'Chapter One contains the hometown hub, NPCs, panels, map, building entrances, and lesson scenes.',
          'Quest, save, spawn, dialogue, music, fade, guide, and feedback managers coordinate runtime behavior.',
        ],
      },
      {
        eyebrow: 'Development',
        title: 'Data, running, and export',
        items: [
          'Quest, feedback, and glossary information is stored in project data files.',
          'Install Godot 4.6 or newer, open the project, run it, and start from the intro screen.',
          'Playable Android builds are distributed through repository releases.',
          'The Android preset enables a 64-bit ARM build; generated editor and local platform folders stay out of version control.',
        ],
      },
    ],
  },
  '02': {
    overview: [
      'StudentFlow is a student-management system with a Laravel web application, Laravel REST API, and native Java Android client. It supports administrator, teacher, and student roles across school and classroom workflows.',
      'The platform includes teacher and student management, classes, enrollment, join requests, attendance, grade categories, grade items, scores, assignments, announcements, exams, reports, activity logs, and school settings. Student accounts can also use configured social sign-in providers.',
      'Blade pages use web sessions, while API clients use Laravel Sanctum bearer tokens. SQLite supports local development, Dompdf produces reports, and the Android application uses Java 17, XML layouts, Retrofit, Gson, OkHttp, Material Components, and AndroidX Security.',
      'Teachers create classes, manage enrollment or join-code requests, record attendance and grades, publish announcements, create assignments and exams, then review student progress and reports. Students access their dashboard, class work, grades, attendance, announcements, and supported exam flows through the Android client.',
      'The repository includes Laravel feature tests, API and web QA scripts, migration and seeding workflows, Android setup notes, and deployment configuration. Starter data can create administrator, teacher, student, class, enrollment, assessment, grade, and attendance records for local QA.',
    ],
    features: [
      'Administrator, teacher, and student roles',
      'Teacher and student management',
      'Classes, enrollment, and join requests',
      'Attendance tracking',
      'Grade categories, items, and scores',
      'Assignments and submissions',
      'Announcements and email delivery',
      'Exams, attempts, answers, and magic links',
      'Reports and PDF export',
      'Native Java Android client',
      'Google and GitHub student sign-in',
      'Activity logs and school settings',
    ],
    architecture: [
      { label: 'Role-based entry points', detail: 'Administrators and teachers use the Laravel Blade application; students use Android for their primary student-facing flows.' },
      { label: 'Session and API authentication', detail: 'Blade uses web sessions. Android and other API consumers use Sanctum bearer tokens, with configured Google and GitHub student sign-in.' },
      { label: 'Classroom operations', detail: 'Laravel routes, controllers, middleware, and services manage classes, enrollments, join requests, attendance, grades, assignments, announcements, and exams.' },
      { label: 'Academic records', detail: 'Models, migrations, factories, and seeders persist school users, class records, assessment data, submissions, scores, attendance, settings, and activity logs.' },
      { label: 'Student delivery', detail: 'The Android client calls the JSON API through Retrofit, stores its bearer token securely, and presents student dashboards, classes, work, grades, attendance, and exams.' },
      { label: 'Reports and notifications', detail: 'Laravel returns Blade or JSON responses, sends configured email notifications, and generates supported PDF reports through Dompdf.' },
    ],
    readmeSections: [
      {
        eyebrow: 'Repository',
        title: 'Project structure',
        items: [
          'Laravel application code is separated into controllers, models, middleware, mail, services, routes, Blade resources, and database files.',
          'Feature tests live under the test suite, while the native Java Android client is maintained in its own directory.',
          'Documentation covers the API, Android setup, deployment, hosting, and the user manual.',
          'PowerShell scripts provide web, API, and combined QA workflows.',
        ],
      },
      {
        eyebrow: 'Requirements',
        title: 'Stack and setup',
        items: [
          'Requires PHP 8.2 or newer, Composer, Node.js, npm, and a Laravel-supported database.',
          'Local setup installs Composer and frontend dependencies, creates the application key, runs migrations and seeders, and builds frontend assets.',
          'The local web server runs through Laravel\'s development command.',
          'Starter seed data can create administrators, teachers, students, classes, enrollment, assessments, grades, and attendance for QA.',
        ],
      },
      {
        eyebrow: 'Authentication and mobile',
        title: 'Web, API, and Android access',
        items: [
          'The Blade application uses session authentication; API clients use Sanctum bearer tokens.',
          'The API covers login, social sign-in, password recovery, profile, password change, and logout.',
          'The Android app targets modern Android versions, uses Java 17, and connects through Retrofit.',
          'Emulators use the host-mapping address for local development, while physical devices use the computer\'s LAN address.',
        ],
      },
      {
        eyebrow: 'Quality and delivery',
        title: 'Modules, testing, and deployment',
        items: [
          'API groups cover administration, classes, students, attendance, assignments, announcements, exams, reports, and student-facing actions.',
          'Backend tests, formatting checks, database rebuilds, and PowerShell QA scripts are documented.',
          'Deployment files include container and hosting configuration plus supporting scripts.',
          'Environment files, authentication secrets, access tokens, and production databases must not be committed.',
        ],
      },
    ],
  },
  '03': {
    overview: [
      'TsukiAI Voice Chat is a .NET 8 and WPF desktop voice assistant with a local HTTP API, multi-provider language-model support, semantic memory, and Discord voice integration through a Node.js bridge.',
      'Its voice pipeline follows speech-to-text, model inference, and text-to-speech. The application supports local and remote inference, configurable cloud providers, and an optional Chroma-backed semantic-memory service.',
      'The solution separates core services, the WPF runtime, automated tests, the Discord bridge, and helper scripts. Retry policies, circuit breakers, correlation IDs, and bounded queues improve resilience around outbound requests and memory write-back.',
    ],
    features: [
      'WPF desktop voice interface',
      'Speech-to-text, model, and text-to-speech pipeline',
      'Local and remote inference support',
      'Multi-provider model routing',
      'Chroma-backed semantic memory',
      'Local ASP.NET Core API',
      'Discord voice bridge',
      'Optional local speech synthesis',
      'Retries, circuit breakers, and correlation IDs',
      'Core and runtime test projects',
    ],
    architecture: [
      { label: 'Voice input', detail: 'Audio enters through the WPF application or Discord bridge and is prepared for recognition.' },
      { label: 'Speech to text', detail: 'The voice pipeline converts captured audio into text through a configured local or cloud service.' },
      { label: 'Model and memory', detail: 'Core services route text to a selected model provider and optionally use semantic memory.' },
      { label: 'Text to speech', detail: 'The generated response is converted into audio through the configured synthesis service.' },
      { label: 'Desktop or Discord output', detail: 'Audio returns to the desktop UI or Discord bridge with resilience around external requests.' },
    ],
    readmeSections: [
      {
        eyebrow: 'Capabilities',
        title: 'Voice and AI runtime',
        items: [
          'The primary flow is speech recognition, language-model inference, then speech synthesis.',
          'Supports both local and remote inference with configurable model routing.',
          'Semantic memory can connect through a Chroma-backed service.',
          'The Discord bridge supplies voice input and output outside the desktop interface.',
        ],
      },
      {
        eyebrow: 'Repository',
        title: 'Solution layout',
        items: [
          'Core services and models are separated from the WPF voice application and local HTTP API.',
          'Core tests and voice-runtime tests are maintained as separate projects.',
          'The Discord bridge is a Node.js sidecar.',
          'Utility scripts include semantic-memory helpers.',
        ],
      },
      {
        eyebrow: 'Requirements',
        title: 'Prerequisites and configuration',
        items: [
          'Requires Windows 10 or 11 and the .NET 8 SDK.',
          'The Discord bridge requires Node.js 18 or newer.',
          'Local speech synthesis and cloud speech or translation services are optional.',
          'Runtime provider endpoints and credentials are configured through the project environment file.',
        ],
      },
      {
        eyebrow: 'Development',
        title: 'Build, run, test, and troubleshoot',
        items: [
          'The solution supports standard .NET build, run, restore, and test commands.',
          'The WPF project hosts the local API used by the bridge and tooling.',
          'Discord audio troubleshooting includes checking bot permissions, voice-channel configuration, and the bridge API address.',
          'Speech failures should be checked against configured provider endpoints and local API availability.',
        ],
      },
    ],
  },
  '04': {
    overview: [
      'Oozeborne is a Godot 4.6 four-player cooperative survivors game backed by Moon Server, a custom containerized game backend. The client contains scenes, scripts, assets, and resource data for classes, skills, and items.',
      'Moon Server separates account and lobby work from active gameplay. A Node.js lobby API handles authentication, rooms, profiles, and administration, while a Go WebSocket server runs an authoritative simulation at 20 updates per second.',
      'PostgreSQL stores persistent player data, Redis handles session state, room registration, and pub/sub, and a Next.js Moon Control Center provides administration and live monitoring. Docker Compose connects the full stack.',
    ],
    features: [
      'Four-player cooperative survivors gameplay',
      'Email-authenticated JWT accounts',
      'Room-based multiplayer lobbies',
      'Five main classes and eighteen subclasses',
      'Skill trees and player progression',
      'Status effects, shops, coins, and upgrades',
      'Authoritative 20 Hz Go simulation',
      'PostgreSQL and Redis services',
      'Live tuning and administration portal',
      'Docker Compose deployment',
    ],
    architecture: [
      { label: 'Godot client', detail: 'The client supplies authentication, lobby, class selection, survivor gameplay, skills, items, effects, and UI.' },
      { label: 'Lobby API', detail: 'The Node.js REST service handles JWT authentication, rooms, profiles, and administration.' },
      { label: 'Game server', detail: 'The Go WebSocket service runs the authoritative 20 Hz simulation and synchronizes rooms.' },
      { label: 'PostgreSQL and Redis', detail: 'PostgreSQL stores persistent player data; Redis manages sessions, rooms, and pub/sub.' },
      { label: 'Control center', detail: 'The Next.js portal monitors and tunes services while Docker Compose runs the stack.' },
    ],
    readmeSections: [
      {
        eyebrow: 'Repository',
        title: 'Workspace structure',
        items: [
          'The Godot client separates scripts, scenes, assets, class or skill resources, and a legacy unused code-generation tool.',
          'Moon Server contains the Go game server, Node.js lobby API, Next.js admin portal, database migrations, and container configuration.',
          'Architecture documentation and development utilities live in dedicated folders.',
          'The repository is licensed under MIT.',
        ],
      },
      {
        eyebrow: 'Local development',
        title: 'Starting the stack',
        items: [
          'Copy the example environment configuration and start the full service stack with Docker Compose.',
          'Open the Godot project and run the client after the services are healthy.',
          'The README documents local and remote update workflows for service deployment.',
          'Development administrator access must be changed before any non-local use.',
        ],
      },
      {
        eyebrow: 'Services',
        title: 'Backend responsibilities',
        items: [
          'The lobby API handles authentication, rooms, profiles, and administration.',
          'The game server provides the authoritative 20 Hz WebSocket simulation.',
          'The admin portal provides the Moon Control Center.',
          'PostgreSQL stores persistent player data, Redis stores runtime state, and a development database browser is included.',
        ],
      },
      {
        eyebrow: 'Operations',
        title: 'Gameplay, commands, and documentation',
        items: [
          'Documented gameplay includes five main classes, eighteen subclasses, skill trees, progression, status effects, shops, coins, upgrades, and slime variants.',
          'Docker Compose commands cover start, background start, stop, log viewing, database reset, and single-service rebuilds.',
          'Requirements include Godot 4.6, Docker, and Docker Compose, with Go and Node.js optional for direct service development.',
          'Documentation covers workspace, game, multiplayer, and server architecture.',
        ],
      },
    ],
  },
  '05': {
    overview: [
      'TypeDuel is a competitive 2D pixel typing duel built with Godot and a Node.js backend. Players log in, enter matchmaking or create custom rooms, select a character loadout, and fight through round-based typing battles.',
      'Matches combine speed and accuracy with health, mana, active skills, passive disruption effects, win streaks, forfeits, and rematches. The documented roster includes Riven, Liora, and Zephon.',
      'REST endpoints support account, lobby, room, social, and history workflows, while Socket.IO and WebSocket connections synchronize match events. Live rooms remain in memory and SQLite persists accounts, social records, chat, leaderboards, and history.',
    ],
    features: [
      'Real-time multiplayer typing duels',
      'Matchmaking and custom rooms',
      'Three playable characters',
      'Active skills and passive disruption effects',
      'Skill-selection and typing phases',
      'Health, mana, streak, and rematch systems',
      'Friends and direct or global chat',
      'Leaderboards and match history',
      'Socket.IO and WebSocket synchronization',
      'SQLite persistence',
    ],
    architecture: [
      { label: 'Login and lobby', detail: 'The Godot client uses Express routes for accounts, profiles, matchmaking, custom rooms, chat, and friends.' },
      { label: 'Loadout selection', detail: 'Each player chooses one character, two active skills, and one passive before the match.' },
      { label: 'Round phases', detail: 'Each round moves from skill selection to shared typing with WPM, accuracy, typos, mana, and mutations.' },
      { label: 'Realtime synchronization', detail: 'Socket.IO and WebSocket events carry joins, skill picks, progress, HP, phases, forfeits, and voice relay.' },
      { label: 'Results and persistence', detail: 'SQLite stores persistent records while the server cleans stale rooms, chat, uploads, and disconnects.' },
    ],
    readmeSections: [
      {
        eyebrow: 'Repository',
        title: 'Project layout',
        items: [
          'The Godot client contains UI, gameplay, entity, audio, and HUD scenes plus autoload, domain, and network-service scripts.',
          'The Node.js server contains controllers, routes, realtime handlers, room and matchmaking services, SQLite schema, balance data, migrations, and seeds.',
          'Shared API contracts document request, response, and room-state expectations.',
          'Architecture, game-design, and gameplay-flow documents are included.',
        ],
      },
      {
        eyebrow: 'Requirements',
        title: 'Run locally',
        items: [
          'Requires Godot 4.6 or a compatible Godot 4.x build, Node.js 18 or newer, and npm.',
          'The backend installs dependencies, initializes the SQLite schema, runs migrations, and seeds an empty database.',
          'The Godot project begins from its login scene and points to the local backend during development.',
          'Two Godot instances with separate accounts can be used for local multiplayer testing; Docker is optional.',
        ],
      },
      {
        eyebrow: 'Gameplay and networking',
        title: 'Match flow and API',
        items: [
          'Players enter matchmaking or a custom room, select one character, two active skills, and one passive, then repeat skill-select and typing phases.',
          'The same sentence is used for both players while the game tracks WPM, accuracy, typos, mana, and passive mutations.',
          'A match ends through zero health, forfeit, or disconnect auto-forfeit, then updates history and leaderboards.',
          'API and realtime groups cover accounts, rooms, game data, chat, friends, feedback, progress, HP, phases, forfeits, and voice relay.',
        ],
      },
      {
        eyebrow: 'Data and development',
        title: 'Balance, persistence, and credits',
        items: [
          'Character, skill, and sentence definitions are shared through JSON data files in the client and server.',
          'Riven, Liora, and Zephon have documented health, damage, and innate traits.',
          'Rooms remain in memory; users, social data, leaderboards, chat, and match history use SQLite.',
          'The server cleans stale rooms, disconnect forfeits, old chat, and unused uploads; the automated test command is currently a placeholder.',
          'The README credits the UI, audio, sprite, and Universal LPC asset sources.',
        ],
      },
    ],
  },
  '06': {
    overview: [
      'CSCprep is a React 19 and Vite reviewer application for Civil Service Exam practice. It provides randomized exams, subject-specific sessions, optional timed mode, answer review, themes, and smooth scrolling.',
      'The question bank combines five local JSON files for verbal reasoning, numerical reasoning, analytical ability, Filipino, and general information. Figure and table items can use cropped images stored with the public assets.',
      'The repository includes scripts that extract, audit, and crop source material from reviewer PDFs. The documented CSC 11 data set contains 716 extracted questions and 716 JSON questions, with no missing or duplicate IDs.',
      'Question text is cleaned after extraction to fix OCR issues, remove section labels, and improve explanations. The application is fully client-side: reviewer content, exam generation, session state, and review behavior are bundled into the React application rather than supplied by a separate backend.',
    ],
    features: [
      'Random and subject-based exam sessions',
      'Optional one-hour timed mode',
      'Answer review with correct and wrong filters',
      'Skipped-item confirmation',
      'In-app exit confirmation',
      'Dark and light themes',
      'Smooth transitions and Lenis scrolling',
      'Image-backed questions',
      'Five local subject question banks',
      'PDF extraction and audit scripts',
      '716-question CSC 11 audit match',
    ],
    architecture: [
      { label: 'Source PDF and question assets', detail: 'Reviewer PDFs provide the source material; helper scripts extract questions, audit CSC 11 coverage, and crop figure or table images.' },
      { label: 'Subject JSON files', detail: 'Verbal reasoning, numerical reasoning, analytical ability, Filipino, and general-information JSON files hold the cleaned question data.' },
      { label: 'Question-bank assembly', detail: 'A TypeScript question-bank module combines all subject files into the collection available to the reviewer.' },
      { label: 'Session generation', detail: 'Exam utilities create random or subject-specific sessions and apply question-history or cooldown behavior to limit repetition.' },
      { label: 'React examination flow', detail: 'The UI manages questions, timer mode, answers, skipped-item confirmation, exit confirmation, review filters, and the theme.' },
      { label: 'Vite build output', detail: 'Vite packages the client-only reviewer and its local content for deployment; no separate application API is required.' },
    ],
    readmeSections: [
      {
        eyebrow: 'Features',
        title: 'Reviewer behavior',
        items: [
          'Supports random and subject-specific sessions, an optional one-hour timer, and answer review filters.',
          'Confirms skipped items before submission and confirms exits inside the application.',
          'Includes dark and light themes, smooth transitions, and Lenis scrolling.',
          'Figure and table questions can display cropped images.',
        ],
      },
      {
        eyebrow: 'Development',
        title: 'Install, build, and preview',
        items: [
          'The README documents dependency installation, the Vite development server, production builds, production preview, and type checking.',
          'The app is built with React 19, TypeScript, Vite, and Lenis.',
          'No separate backend setup is described because the question data is bundled with the project.',
        ],
      },
      {
        eyebrow: 'Repository',
        title: 'Source structure',
        items: [
          'The main application file owns the exam UI and flow, while the stylesheet contains themes and animations.',
          'Five subject JSON files are combined through the question-bank module.',
          'Exam utilities handle session generation and question-history behavior.',
          'Public assets contain cropped question images, and scripts contain extraction, audit, and cropping helpers.',
        ],
      },
      {
        eyebrow: 'Data quality',
        title: 'Question-bank verification',
        items: [
          'The CSC 11 reviewer PDF was checked against the JSON bank.',
          'The audit found 716 extracted questions and 716 JSON questions.',
          'No CSC 11 question IDs were missing or duplicated.',
          'Extracted text was cleaned for OCR issues, section labels, and explanations.',
          'Generated builds, dependencies, source PDFs, extraction logs, and local-only files remain excluded from commits.',
        ],
      },
    ],
  },
  '07': {
    overview: [
      'PocketTrade is a used-phone marketplace with a Flutter Android application, NestJS API, and React administration panel. The repository separates mobile, backend, admin, QA scripts, and supporting documentation.',
      'The platform supports email and password sign-in, OTP verification and reset, JWT access and refresh tokens, listings, favorites, conversations, blocks, reports, push tokens, and administrative operations.',
      'Prisma and PostgreSQL persist marketplace data, Cloudinary stores uploaded media, Socket.IO supports realtime communication, and Firebase Cloud Messaging delivers push notifications. The admin panel uses React, Vite, Tailwind CSS, and Recharts; Flutter uses Dio, GoRouter, and secure storage.',
      'Listings are moderated before public visibility: sellers submit a listing with one to five images, the backend validates and stores it as pending, and administrators approve or reject it through the dashboard. Only approved public statuses are returned to buyer-facing listing search and detail endpoints.',
      'The repository also documents implementation limits. The mobile sign-in experience is password-first even though the API supports direct email-only OTP login, seller editing is broader in the backend than in the current mobile UI, and chat does not support image attachments, calls, payments, ratings, or identity verification.',
    ],
    features: [
      'Flutter Android marketplace app',
      'React administration panel',
      'Email and password authentication',
      'Email OTP verification and password reset',
      'JWT access and refresh tokens',
      'Used-phone listing management',
      'Favorites and conversations',
      'Blocks, reports, and push tokens',
      'Cloudinary media storage',
      'Socket.IO and Firebase notifications',
      'Listing approval and rejection workflow',
      'Admin metrics, analytics, and activity logs',
    ],
    architecture: [
      { label: 'Marketplace clients', detail: 'Buyers and sellers use the Flutter Android application, while administrators use the React dashboard for moderation, reports, accounts, and analytics.' },
      { label: 'Authentication service', detail: 'NestJS handles registration, password login, OTP creation and verification, password reset, JWT access tokens, refresh-token rotation, and active-account checks.' },
      { label: 'Listing and moderation service', detail: 'Authenticated sellers submit listing details and one to five images. The API validates ownership and content, writes a pending record, and exposes it to the administrator review queue.' },
      { label: 'Prisma and PostgreSQL', detail: 'Prisma persists users, listings, images, favorites, conversations, messages, reports, notification tokens, OTP records, and refresh-token data.' },
      { label: 'Media and live communication', detail: 'Cloudinary stores validated uploads, Socket.IO delivers authorized conversation events, and Firebase notifies recipient devices about messages or important events.' },
      { label: 'Public marketplace delivery', detail: 'Only approved listings are returned to public search and listing-detail responses; buyers can favorite a listing or create an authorized conversation with its seller.' },
    ],
    readmeSections: [
      {
        eyebrow: 'Repository',
        title: 'Project structure',
        items: [
          'The backend contains the NestJS API, Prisma schema, migrations, seed data, and Jest tests.',
          'The admin directory contains the React and TypeScript administration panel.',
          'The mobile directory contains the Flutter Android client.',
          'QA scripts, test output, and supporting implementation notes are stored separately.',
        ],
      },
      {
        eyebrow: 'Requirements',
        title: 'Stack and services',
        items: [
          'Requires Node.js, npm, PostgreSQL, Flutter, and the Android SDK.',
          'The backend uses NestJS, TypeScript, Prisma, and PostgreSQL.',
          'Cloud media, transactional email, and push notification services are required for complete functionality.',
          'The admin panel uses React, Vite, Tailwind CSS, and Recharts; mobile uses Dio, GoRouter, and secure storage.',
        ],
      },
      {
        eyebrow: 'Setup and API',
        title: 'Backend, admin, and mobile flow',
        items: [
          'Backend setup installs dependencies, generates Prisma code, applies migrations, seeds development data, and starts the API.',
          'The development seed includes administrator, buyer, seller, listing, favorite, and conversation examples.',
          'The admin panel points to the API through its frontend environment configuration.',
          'The Flutter app uses the emulator host address locally and the computer\'s LAN address on a physical device.',
          'Authentication routes cover OTP, registration, login, password recovery, refresh, and logout; marketplace routes cover listings and supporting modules.',
        ],
      },
      {
        eyebrow: 'Quality and deployment',
        title: 'Tests, builds, and release notes',
        items: [
          'Backend tests and builds, admin builds and linting, and Flutter analysis and APK builds are documented.',
          'A Windows QA runner supports API, APK, and custom base-address options and writes logs to a QA results folder.',
          'Deployment guidance is provided in a dedicated document.',
          'A separate implementation-status document distinguishes complete, partial, and unavailable features.',
          'Environment files and service credentials must not be committed.',
        ],
      },
    ],
  },
  '08': {
    overview: [
      'Cache Me Outside is a newspaper-style time capsule for selected internet moments from 2020. Visitors can move through the year by month and day, reading each entry in an archive designed to feel deliberate rather than endless.',
      'The project pairs the public archive with an editorial workspace for preparing and reviewing entries before they are shared. That workflow keeps the collection focused and gives each moment room to be presented with context.',
      'Its scope stays intentionally limited to 2020. The collection is curated around that year instead of trying to capture every event or continuously pull in new material.',
    ],
    features: [
      'Newspaper-style 2020 archive',
      'Year, month, and day public routes',
      'Curated archive entries',
      'Editorial workspace',
      'Draft and review process',
      'Preview before publishing',
      'Organized entry status',
      'Archive and page management',
    ],
    architecture: [
      { label: 'Curated collection', detail: 'The project begins with a selected set of moments from 2020, prepared with the information needed for an archive entry.' },
      { label: 'Editorial preparation', detail: 'Entries are shaped into a consistent newspaper-style format, with copy, visuals, and supporting context prepared together.' },
      { label: 'Review and preview', detail: 'Draft entries can be checked in the archive presentation before they are made part of the public collection.' },
      { label: 'Public archive', detail: 'Published entries are organized by month and day, giving visitors a simple path through the year.' },
    ],
    readmeSections: [
      {
        eyebrow: 'Archive concept',
        title: 'A focused year to revisit',
        items: [
          'The archive is centered entirely on 2020, rather than attempting to become a constantly updated news source.',
          'Visitors begin in the year archive and can move through its months and individual days.',
          'The newspaper-inspired presentation gives each selected moment a more considered place to live.',
        ],
      },
      {
        eyebrow: 'Editorial workflow',
        title: 'From draft to archive',
        items: [
          'New entries can be prepared as drafts before joining the public collection.',
          'Review keeps the writing, imagery, source context, and archive presentation aligned.',
          'A preview step helps confirm how an entry will read in the final newspaper layout.',
        ],
      },
      {
        eyebrow: 'Collection care',
        title: 'Clear archive boundaries',
        items: [
          'The collection stays limited to its 2020 theme so the experience remains focused.',
          'Entries move through clear working states, helping separate in-progress material from published archive pieces.',
          'The project is maintained as a curated record, not an automated stream of internet content.',
        ],
      },
      {
        eyebrow: 'Visitor experience',
        title: 'Browse the year naturally',
        items: [
          'Year, month, and day views make it easy to explore the archive at different levels.',
          'The same visual language carries across the collection so browsing feels cohesive.',
          'The project continues to develop as the archive and its editorial presentation grow.',
        ],
      },
    ],
  },
};
