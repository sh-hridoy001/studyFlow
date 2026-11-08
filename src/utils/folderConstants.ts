import { FolderDefinition, PrimaryFolderId } from '../types';

export const PRIMARY_FOLDERS: Record<PrimaryFolderId, FolderDefinition> = {
  academic: {
    id: 'academic',
    name: 'Academic (Campus Studies)',
    subtitle: 'University coursework, lectures, lab reports & semester exams',
    color: '#4F46E5', // Indigo
    lightBg: 'bg-indigo-50/70',
    darkBg: 'dark:bg-indigo-950/30',
    borderClass: 'border-indigo-200 dark:border-indigo-800/60',
    badgeClass: 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800',
    icon: 'academic',
  },
  admission: {
    id: 'admission',
    name: 'Admission',
    subtitle: 'Competitive exams, GRE/SAT/GMAT prep, SOPs & admission test practice',
    color: '#D97706', // Amber
    lightBg: 'bg-amber-50/70',
    darkBg: 'dark:bg-amber-950/30',
    borderClass: 'border-amber-200 dark:border-amber-800/60',
    badgeClass: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
    icon: 'admission',
  },
  english: {
    id: 'english',
    name: 'English Learning',
    subtitle: 'IELTS/TOEFL preparation, speaking fluency, vocabulary & grammar drills',
    color: '#059669', // Emerald
    lightBg: 'bg-emerald-50/70',
    darkBg: 'dark:bg-emerald-950/30',
    borderClass: 'border-emerald-200 dark:border-emerald-800/60',
    badgeClass: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
    icon: 'english',
  },
};

export const INITIAL_DAILY_TASKS = [
  {
    id: 'task-acad-1',
    folderId: 'academic' as PrimaryFolderId,
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
    folderId: 'academic' as PrimaryFolderId,
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
    folderId: 'admission' as PrimaryFolderId,
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
    folderId: 'admission' as PrimaryFolderId,
    subjectName: 'Verbal Strategy & Logic',
    topics: 'Text completion double/triple blanks & analytical writing template',
    targetMinutes: 60,
    actualMinutes: 30,
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-eng-1',
    folderId: 'english' as PrimaryFolderId,
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
    folderId: 'english' as PrimaryFolderId,
    subjectName: 'Speaking & Active Vocabulary',
    topics: '30-minute podcast shadowing + 20 C1 collocations flashcards',
    targetMinutes: 45,
    actualMinutes: 20,
    completed: false,
    createdAt: new Date().toISOString(),
  },
];
