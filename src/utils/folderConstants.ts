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
    subjectFolders: [
      {
        id: 'subj-acad-1',
        name: 'Computer Systems Architecture',
        description: 'Pipelining, memory hierarchy, cache coherence, CPU design',
        chapters: [
          {
            id: 'chap-csa-1',
            title: 'Instruction Set Architecture (ISA) & RISC vs CISC',
            notes: 'MIPS registers: $zero always 0. R-type format: opcode (6), rs (5), rt (5), rd (5), shamt (5), funct (6). Branch instructions use PC-relative addressing.',
            importantPoints: 'Formula: CPU Time = Instruction Count × CPI × Clock Cycle Time.\nSpeedup = Execution Time (Old) / Execution Time (New).',
            completed: true,
          },
          {
            id: 'chap-csa-2',
            title: 'Pipelining Hazards & Branch Prediction',
            notes: 'Structural, Data (RAW, WAR, WAW), and Control hazards. Forwarding resolves data hazards without stalling when possible.',
            importantPoints: 'Branches cause 1-3 stall cycles unless dynamic 2-bit branch predictor is used.',
            completed: false,
          },
          {
            id: 'chap-csa-3',
            title: 'Cache Memory & Virtual Memory',
            notes: 'Direct mapped, N-way set associative, fully associative. Cache line size trade-offs (spatial vs temporal locality).',
            importantPoints: 'AMAT = Hit Time + (Miss Rate × Miss Penalty).\nPage Table Size = Number of Virtual Pages × PTE size.',
            completed: false,
          },
        ],
      },
      {
        id: 'subj-acad-2',
        name: 'Linear Algebra & Optimization',
        description: 'Vector spaces, eigenvalues, SVD, convex optimization',
        chapters: [
          {
            id: 'chap-la-1',
            title: 'Eigenvalues, Eigenvectors & Diagonalization',
            notes: 'Det(A - λI) = 0 yields characteristic polynomial. If A has n linearly independent eigenvectors, A = PDP^-1.',
            importantPoints: 'Trace(A) = sum of eigenvalues.\nDeterminant(A) = product of eigenvalues.',
            completed: true,
          },
          {
            id: 'chap-la-2',
            title: 'Singular Value Decomposition (SVD)',
            notes: 'Every matrix A (m x n) has SVD: A = U Σ V^T. Columns of U are left singular vectors, columns of V are right singular vectors.',
            importantPoints: 'A^T A has eigenvalues σ_i^2. Useful for PCA and low-rank matrix approximation.',
            completed: false,
          },
        ],
      },
      {
        id: 'subj-acad-3',
        name: 'Algorithms & Data Structures',
        description: 'Dynamic programming, graph algorithms, divide & conquer',
        chapters: [
          {
            id: 'chap-algo-1',
            title: 'Dynamic Programming & Memoization',
            notes: 'Identify optimal substructure and overlapping subproblems. Define state DP[i][j], recurrence relation, and base cases.',
            importantPoints: '0/1 Knapsack: DP[i][w] = max(DP[i-1][w], DP[i-1][w-wt[i]] + val[i]). Time O(n*W).',
            completed: false,
          },
        ],
      },
      {
        id: 'subj-acad-4',
        name: 'Operating Systems',
        description: 'Process synchronization, scheduling, virtual memory, concurrency',
        chapters: [
          {
            id: 'chap-os-1',
            title: 'Process Synchronization & Semaphores',
            notes: 'Race conditions occur in critical sections. Mutual exclusion, progress, bounded waiting must be guaranteed.',
            importantPoints: 'Semaphores: wait(S) decrements, signal(S) increments atomically. Avoid deadlocks (Coffman conditions).',
            completed: false,
          },
        ],
      },
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
    subjectFolders: [
      {
        id: 'subj-adm-1',
        name: 'Quantitative Reasoning',
        description: 'Arithmetic, Algebra, Geometry, Data Analysis',
        chapters: [
          {
            id: 'chap-quant-1',
            title: 'Permutations, Combinations & Probability',
            notes: 'Order matters: P(n, r) = n! / (n-r)!. Order does NOT matter: C(n, r) = n! / (r!(n-r)!). Complement rule: P(At least 1) = 1 - P(None).',
            importantPoints: 'Circular arrangement: (n - 1)!\nDividing into identical groups: divide by group factorial.',
            completed: false,
          },
          {
            id: 'chap-quant-2',
            title: 'Work, Rate & Speed Problems',
            notes: 'Work = Rate × Time. If A takes x days and B takes y days, combined rate = (1/x + 1/y) per day.',
            importantPoints: 'Average Speed = Total Distance / Total Time (NOT the average of speeds!).',
            completed: true,
          },
        ],
      },
      {
        id: 'subj-adm-2',
        name: 'Verbal Strategy & Logic',
        description: 'Text completion, sentence equivalence, reading comprehension',
        chapters: [
          {
            id: 'chap-verb-1',
            title: 'Text Completion Pivot Words & Tone Analysis',
            notes: 'Look for contrast pivots (however, despite, nonetheless) vs support pivots (furthermore, indeed, similarly). Read whole sentence before looking at choices.',
            importantPoints: 'Eliminate options with extreme emotional charges unless passage warrants it.',
            completed: false,
          },
        ],
      },
      {
        id: 'subj-adm-3',
        name: 'Mock Exam Practice',
        description: 'Full-length timed mock tests and diagnostic reviews',
        chapters: [],
      },
      {
        id: 'subj-adm-4',
        name: 'Analytical Writing',
        description: 'Issue essay templates, argument analysis logic',
        chapters: [],
      },
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
    subjectFolders: [
      {
        id: 'subj-eng-1',
        name: 'IELTS Academic Reading',
        description: 'Skimming, scanning, True/False/Not Given, Heading Matching',
        chapters: [
          {
            id: 'chap-read-1',
            title: 'True / False / Not Given Strategy',
            notes: 'TRUE: matches exactly with passage meaning. FALSE: contradicts or negates passage statement. NOT GIVEN: passage does not state or neither confirms nor denies.',
            importantPoints: 'Watch out for 100% qualifiers (always, never, only, all) vs partial qualifiers (often, usually, some).',
            completed: true,
          },
        ],
      },
      {
        id: 'subj-eng-2',
        name: 'Speaking & Active Vocabulary',
        description: 'Idiomatic expressions, fluency fillers, discourse markers',
        chapters: [
          {
            id: 'chap-speak-1',
            title: 'Part 2 Cue Card Structure & Complex Connectors',
            notes: 'Use PPF technique (Past, Present, Future) to speak for full 2 minutes without stopping.',
            importantPoints: 'Key phrases: "Looking back at that moment...", "What struck me most was...", "Had I known then...".',
            completed: false,
          },
        ],
      },
      {
        id: 'subj-eng-3',
        name: 'Writing Task 2',
        description: 'Opinion essays, discussion essays, problem-solution',
        chapters: [],
      },
      {
        id: 'subj-eng-4',
        name: 'Listening Drills',
        description: 'Section 4 monologues, map labeling, spelling trap alerts',
        chapters: [],
      },
    ],
  },
];

// Helper to ensure any folder has synchronized subjectFolders and subjects
export function ensureFolderSubjectStructure(folder: FolderDefinition): FolderDefinition {
  const currentSubjects = folder.subjects || [];
  let subjectFolders = folder.subjectFolders || [];

  // Guarantee each subject string has a matching SubjectFolder object
  const existingNames = new Set(subjectFolders.map((sf) => sf.name));
  const mergedSubjectFolders = [...subjectFolders];

  currentSubjects.forEach((subjName) => {
    if (!existingNames.has(subjName)) {
      mergedSubjectFolders.push({
        id: `subj-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: subjName,
        chapters: [],
        createdAt: new Date().toISOString(),
      });
      existingNames.add(subjName);
    }
  });

  return {
    ...folder,
    subjects: currentSubjects,
    subjectFolders: mergedSubjectFolders,
  };
}

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
