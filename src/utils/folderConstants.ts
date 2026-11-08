import { FolderDefinition } from '../types';

export const FOLDER_COLOR_PRESETS = [
  { name: 'Indigo', color: '#4F46E5', lightBg: 'bg-indigo-50/70', darkBg: 'dark:bg-indigo-950/30', borderClass: 'border-indigo-200 dark:border-indigo-800/60', badgeClass: 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800' },
  { name: 'Amber', color: '#D97706', lightBg: 'bg-amber-50/70', darkBg: 'dark:bg-amber-950/30', borderClass: 'border-amber-200 dark:border-amber-800/60', badgeClass: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800' },
  { name: 'Emerald', color: '#059669', lightBg: 'bg-emerald-50/70', darkBg: 'dark:bg-emerald-950/30', borderClass: 'border-emerald-200 dark:border-emerald-800/60', badgeClass: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800' },
  { name: 'Violet', color: '#7C3AED', lightBg: 'bg-purple-50/70', darkBg: 'dark:bg-purple-950/30', borderClass: 'border-purple-200 dark:border-purple-800/60', badgeClass: 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800' },
  { name: 'Rose', color: '#E11D48', lightBg: 'bg-rose-50/70', darkBg: 'dark:bg-rose-950/30', borderClass: 'border-rose-200 dark:border-rose-800/60', badgeClass: 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800' },
  { name: 'Cyan', color: '#0891B2', lightBg: 'bg-cyan-50/70', darkBg: 'dark:bg-cyan-950/30', borderClass: 'border-cyan-200 dark:border-cyan-800/60', badgeClass: 'text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-800' },
  { name: 'Blue', color: '#2563EB', lightBg: 'bg-blue-50/70', darkBg: 'dark:bg-blue-950/30', borderClass: 'border-blue-200 dark:border-blue-800/60', badgeClass: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800' },
  { name: 'Fuchsia', color: '#C026D3', lightBg: 'bg-fuchsia-50/70', darkBg: 'dark:bg-fuchsia-950/30', borderClass: 'border-fuchsia-200 dark:border-fuchsia-800/60', badgeClass: 'text-fuchsia-700 dark:text-fuchsia-300 bg-fuchsia-50 dark:bg-fuchsia-950/60 border-fuchsia-200 dark:border-fuchsia-800' },
];

export const DEFAULT_DYNAMIC_FOLDERS: FolderDefinition[] = [
  {
    id: 'academic',
    name: 'Academic (Campus Studies)',
    subtitle: 'University coursework, lectures, lab reports & semester exams',
    color: '#4F46E5',
    lightBg: 'bg-indigo-50/70',
    darkBg: 'dark:bg-indigo-950/30',
    borderClass: 'border-indigo-200 dark:border-indigo-800/60',
    badgeClass: 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800',
    icon: 'academic',
    subjects: [
      'Computer Systems Architecture',
      'Linear Algebra & Optimization',
      'Algorithms & Data Structures',
      'Operating Systems',
    ],
  },
  {
    id: 'admission',
    name: 'Admission',
    subtitle: 'Competitive exams, GRE/SAT/GMAT prep, SOPs & admission test practice',
    color: '#D97706',
    lightBg: 'bg-amber-50/70',
    darkBg: 'dark:bg-amber-950/30',
    borderClass: 'border-amber-200 dark:border-amber-800/60',
    badgeClass: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
    icon: 'admission',
    subjects: [
      'Quantitative Reasoning',
      'Verbal Strategy & Logic',
      'Mock Exam Practice',
      'Analytical Writing',
    ],
  },
  {
    id: 'english',
    name: 'English Learning',
    subtitle: 'IELTS/TOEFL preparation, speaking fluency, vocabulary & grammar drills',
    color: '#059669',
    lightBg: 'bg-emerald-50/70',
    darkBg: 'dark:bg-emerald-950/30',
    borderClass: 'border-emerald-200 dark:border-emerald-800/60',
    badgeClass: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
    icon: 'english',
    subjects: [
      'IELTS Academic Reading',
      'Speaking & Active Vocabulary',
      'Writing Task 2',
      'Listening Drills',
    ],
  },
];

export const PRIMARY_FOLDERS: Record<string, FolderDefinition> = DEFAULT_DYNAMIC_FOLDERS.reduce(
  (acc, f) => ({ ...acc, [f.id]: f }),
  {}
);

export const INITIAL_DAILY_TASKS = [
  {
    id: 'task-acad-1',
    folderId: 'academic',
    subjectName: 'Computer Systems Architecture',
    topics: 'Pipelining hazards & branch prediction simulation',
    targetMinutes: 120, // 2h
    actualMinutes: 90,  // 1.5h done
    completed: false,
    notes: 'Review lecture slides 14-22 before testing simulator code.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-acad-2',
    folderId: 'academic',
    subjectName: 'Linear Algebra & Optimization',
    topics: 'Singular Value Decomposition (SVD) practice proofs',
    targetMinutes: 90,
    actualMinutes: 90,
    completed: true,
    notes: 'Completed problem set 4 successfully.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-adm-1',
    folderId: 'admission',
    subjectName: 'Quantitative Reasoning',
    topics: 'Permutations, combinations & probability advanced drills',
    targetMinutes: 90,
    actualMinutes: 60,
    completed: false,
    notes: '35 questions timed set.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-adm-2',
    folderId: 'admission',
    subjectName: 'Verbal Strategy & Logic',
    topics: 'Text completion double/triple blanks & analytical writing template',
    targetMinutes: 60,
    actualMinutes: 30,
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-eng-1',
    folderId: 'english',
    subjectName: 'IELTS Academic Reading',
    topics: 'True/False/Not Given passage drills & speed skimming',
    targetMinutes: 60,
    actualMinutes: 60,
    completed: true,
    notes: 'Cambridge IELTS Book 17 Test 2 Passage 3.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-eng-2',
    folderId: 'english',
    subjectName: 'Speaking & Active Vocabulary',
    topics: '30-minute podcast shadowing + 20 C1 collocations flashcards',
    targetMinutes: 45,
    actualMinutes: 20,
    completed: false,
    createdAt: new Date().toISOString(),
  },
];
