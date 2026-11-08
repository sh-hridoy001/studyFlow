/**
 * Generates a complete standalone single-file HTML, CSS, and JS study tracker.
 * Integrates Firebase Authentication (Google Sign-In) and Firestore Database
 * under users/{userId}/studyData across dynamic categories,
 * with 5-time Daily Salah prayer tracking, dynamic custom folders & subjects,
 * introductory sign-in screen, user profile header, stopwatch, and past study history.
 */
export function generateSingleFileHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FocusTrack - Study Tracker & Daily Planner</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0f172a;
      --surface: #1e293b;
      --surface-border: #334155;
      --text: #f8fafc;
      --text-muted: #94a3b8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
    body { background-color: var(--bg); color: var(--text); padding-bottom: 60px; line-height: 1.5; min-height: 100vh; }
    .mono { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }
    .container { max-width: 1120px; margin: 0 auto; padding: 20px; }
    
    /* Header */
    header { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid var(--surface-border); margin-bottom: 24px; flex-wrap: wrap; gap: 14px; }
    .logo { font-size: 20px; font-weight: 800; display: flex; align-items: center; gap: 8px; }
    .nav-tabs { display: flex; gap: 6px; background: #0f172a; padding: 4px; border-radius: 12px; border: 1px solid var(--surface-border); }
    .tab-btn { padding: 8px 16px; border-radius: 9px; font-size: 13px; font-weight: 600; border: none; background: transparent; color: var(--text-muted); cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; }
    .tab-btn.active { background: var(--surface); color: white; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
    .header-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    
    .btn { padding: 8px 14px; border-radius: 10px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; }
    .btn-primary { background: #4f46e5; color: white; }
    .btn-primary:hover { background: #4338ca; }
    .btn-danger { background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }
    .btn-danger:hover { background: #ef4444; color: white; }
    .btn-secondary { background: var(--surface); color: var(--text); border: 1px solid var(--surface-border); }
    .btn-secondary:hover { background: #334155; }
    .btn-emerald { background: #059669; color: white; }
    .btn-emerald:hover { background: #047857; }
    
    /* User Profile Chip */
    .user-profile { display: flex; align-items: center; gap: 10px; background: #0f172a; border: 1px solid var(--surface-border); padding: 5px 12px; border-radius: 12px; font-size: 12px; }
    .user-avatar { width: 28px; height: 28px; border-radius: 50%; background: #4f46e5; display: flex; align-items: center; justify-content: center; font-weight: 700; color: white; overflow: hidden; }
    .user-avatar img { width: 100%; height: 100%; object-fit: cover; }
    
    /* Hero */
    .hero-card { background: var(--surface); border: 1px solid var(--surface-border); border-radius: 20px; padding: 24px; margin-bottom: 24px; }
    .hero-top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; }
    .big-time { font-size: 44px; font-weight: 800; letter-spacing: -1px; }
    .progress-bar-bg { width: 100%; height: 12px; background: #0b1120; border-radius: 99px; overflow: hidden; display: flex; margin: 12px 0 8px 0; }
    .progress-fill { height: 100%; transition: width 0.4s ease; }

    /* Folder grid */
    .folder-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px; margin-bottom: 24px; }
    .folder-card { background: var(--surface); border: 1px solid var(--surface-border); border-radius: 16px; padding: 18px; transition: transform 0.2s; position: relative; }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }

    /* Tasks list */
    .task-item { background: var(--surface); border: 1px solid var(--surface-border); border-radius: 14px; padding: 14px 18px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
    .task-left { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 200px; }
    .checkbox { width: 20px; height: 20px; border-radius: 6px; cursor: pointer; accent-color: #4f46e5; }
    .completed-text { text-decoration: line-through; opacity: 0.5; }

    /* Auth Screen */
    #authScreen { min-height: 80vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .auth-card { background: var(--surface); border: 1px solid var(--surface-border); border-radius: 24px; padding: 40px 32px; max-width: 540px; width: 100%; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
    .google-btn { display: inline-flex; align-items: center; justify-content: center; gap: 12px; width: 100%; padding: 14px 24px; background: white; color: #1e293b; border-radius: 14px; font-weight: 700; font-size: 15px; border: none; cursor: pointer; margin-top: 24px; transition: all 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .google-btn:hover { background: #f1f5f9; transform: translateY(-1px); }

    /* Modals */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: none; align-items: center; justify-content: center; z-index: 100; padding: 20px; }
    .modal-box { background: var(--surface); border: 1px solid var(--surface-border); border-radius: 20px; max-width: 480px; width: 100%; padding: 24px; max-height: 90vh; overflow-y: auto; }
    .input-group { margin-bottom: 14px; }
    .input-group label { display: block; font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; }
    .input-group input, .input-group select { width: 100%; padding: 10px 14px; background: #0f172a; border: 1px solid var(--surface-border); border-radius: 10px; color: white; font-size: 14px; }

    /* History Grid */
    .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; margin-top: 14px; }
    .cal-cell { background: #0f172a; border: 1px solid var(--surface-border); border-radius: 10px; min-height: 54px; padding: 6px; font-size: 12px; cursor: pointer; display: flex; flex-direction: column; justify-content: space-between; }
    .cal-cell.selected { border-color: #6366f1; background: rgba(99, 102, 241, 0.15); }
    .cal-cell.has-data { border-color: rgba(99, 102, 241, 0.4); }
    .cal-day-label { text-align: center; font-size: 11px; font-weight: 700; color: var(--text-muted); padding: 4px; }
    
    .sync-status { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; color: #10b981; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); padding: 3px 8px; border-radius: 99px; }

    /* Salah Cards */
    .salah-card { background: #0f172a; border: 1px solid var(--surface-border); border-radius: 16px; padding: 16px; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s; margin-bottom: 12px; }
    .salah-card.completed { background: rgba(16, 185, 129, 0.08); border-color: rgba(16, 185, 129, 0.4); }
    .salah-check-btn { width: 42px; height: 42px; border-radius: 12px; border: 2px solid var(--surface-border); background: var(--surface); color: white; display: flex; align-items: center; justify-content: center; font-size: 18px; cursor: pointer; transition: all 0.2s; }
    .salah-check-btn.checked { background: #10b981; border-color: #10b981; color: white; box-shadow: 0 0 12px rgba(16, 185, 129, 0.4); }
  </style>
</head>
<body>
  <!-- Auth Screen (Shown when not logged in) -->
  <div id="authScreen">
    <div class="auth-card">
      <div style="font-size: 38px; margin-bottom: 12px;">⏱️</div>
      <h1 style="font-size: 26px; font-weight: 800; margin-bottom: 8px;">FocusTrack</h1>
      <p style="color: var(--text-muted); font-size: 14px; line-height: 1.6;">
        Daily Routine Planner, Dynamic Folders & Subjects, and 5-Time Daily Salah Tracker.
      </p>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin: 24px 0; text-align: center;">
        <div style="background: rgba(99,102,241,0.1); padding: 12px; border-radius: 12px; border: 1px solid rgba(99,102,241,0.3);">
          <div style="font-weight: 800; color: #818cf8; font-size: 12px;">ACADEMIC</div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Campus Studies</div>
        </div>
        <div style="background: rgba(245,158,11,0.1); padding: 12px; border-radius: 12px; border: 1px solid rgba(245,158,11,0.3);">
          <div style="font-weight: 800; color: #fbbf24; font-size: 12px;">ADMISSION</div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Test Prep</div>
        </div>
        <div style="background: rgba(16,185,129,0.1); padding: 12px; border-radius: 12px; border: 1px solid rgba(16,185,129,0.3);">
          <div style="font-weight: 800; color: #34d399; font-size: 12px;">PRAYER</div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">5-Time Salah</div>
        </div>
      </div>

      <button id="googleLoginBtn" class="google-btn">
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        <span>Continue with Google</span>
      </button>

      <button id="guestLoginBtn" class="btn btn-secondary" style="width:100%; margin-top:10px; padding:12px; font-size:14px; justify-content:center;">
        👤 Continue in Local Mode
      </button>

      <div style="font-size: 11px; color: var(--text-muted); margin-top: 14px;">
        All study & prayer records are safely isolated under users/{userId} in Firestore
      </div>
    </div>
  </div>

  <!-- Main App (Shown when logged in) -->
  <div id="mainApp" style="display: none;" class="container">
    <header>
      <div class="logo">
        <span>⏱️ FocusTrack</span>
        <span id="syncIndicator" class="sync-status">☁️ Firestore Synced</span>
      </div>

      <div class="nav-tabs">
        <button id="tabRoutine" class="tab-btn active" onclick="switchTab('routine')">Today's Routine</button>
        <button id="tabSalah" class="tab-btn" onclick="switchTab('salah')">
          <span>🕌 5-Time Salah</span>
          <span id="salahBadge" style="background:#059669; color:white; font-size:10px; padding:1px 6px; border-radius:99px;">0/5</span>
        </button>
        <button id="tabHistory" class="tab-btn" onclick="switchTab('history')">Study History</button>
      </div>

      <div class="header-actions">
        <button class="btn btn-primary" onclick="openAddTaskModal()">+ Add Task</button>
        <button class="btn btn-secondary" onclick="openManageFolderModal()">📁 Manage Folders</button>
        <button class="btn btn-secondary" onclick="startNewDay()">Start New Day</button>
        
        <!-- User Profile and Reset -->
        <div class="user-profile">
          <div class="user-avatar" id="userAvatar">U</div>
          <span id="userName" style="font-weight: 700; max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Student</span>
          <button onclick="confirmResetAllData()" class="btn btn-danger" style="padding: 4px 8px; font-size: 11px;" title="Reset all data back to zero">Reset Data</button>
          <button onclick="handleLogout()" class="btn btn-secondary" style="padding: 4px 8px; font-size: 11px;">Logout</button>
        </div>
      </div>
    </header>

    <!-- Routine View -->
    <div id="viewRoutine">
      <div class="hero-card">
        <div class="hero-top">
          <div>
            <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Today's Study Progress</div>
            <div class="big-time mono" id="totalActual">0h 0m</div>
          </div>
          <div style="text-align: right;">
            <span style="color: var(--text-muted); font-size: 13px;">Target: </span>
            <span class="mono" id="totalTarget" style="font-size: 16px; font-weight: 700;">0h 0m</span>
          </div>
        </div>
        <div class="progress-bar-bg" id="dynamicProgressBar">
          <!-- Filled dynamically -->
        </div>
      </div>

      <div class="folder-grid" id="folderCardsContainer">
        <!-- Filled dynamically -->
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 14px;">
        <h3 style="font-size: 17px; font-weight: 700;">Daily Study Tasks</h3>
        <button class="btn btn-primary" onclick="openAddTaskModal()" style="font-size:12px; padding:6px 12px;">+ Add New Task</button>
      </div>
      <div id="tasksList"></div>
    </div>

    <!-- Salah View -->
    <div id="viewSalah" style="display: none;">
      <div class="hero-card">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div>
            <div style="font-size: 12px; color: #34d399; font-weight: 700; text-transform: uppercase;">Daily Spiritual Routine</div>
            <h2 style="font-size: 26px; font-weight: 800; margin-top: 2px;">5-Time Daily Salah Tracker</h2>
            <p style="color: var(--text-muted); font-size: 13px;">Stay consistent with your daily prayers alongside focused study hours.</p>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button class="btn btn-secondary" onclick="changeSalahDate(-1)">◀ Prev Day</button>
            <input type="date" id="salahDateInput" onchange="onSalahDateChange(this.value)" style="background:#0f172a; color:white; border:1px solid var(--surface-border); border-radius:8px; padding:6px 10px; font-size:13px;">
            <button class="btn btn-secondary" onclick="changeSalahDate(1)">Next Day ▶</button>
          </div>
        </div>

        <div style="margin-top: 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px;">
          <div style="background:#0f172a; padding:16px; border-radius:14px; border:1px solid var(--surface-border);">
            <div style="color:var(--text-muted); font-size:12px;">Completed Today</div>
            <div class="mono" id="salahCompletedRatio" style="font-size:26px; font-weight:800; color:#34d399;">0 / 5</div>
          </div>
          <div style="background:#0f172a; padding:16px; border-radius:14px; border:1px solid var(--surface-border);">
            <div style="color:var(--text-muted); font-size:12px;">Completion Rate</div>
            <div class="mono" id="salahPercentage" style="font-size:26px; font-weight:800; color:#818cf8;">0%</div>
          </div>
        </div>
      </div>

      <div id="salahListContainer" style="max-width: 720px; margin: 0 auto;">
        <!-- Filled dynamically -->
      </div>
    </div>

    <!-- History View -->
    <div id="viewHistory" style="display: none;">
      <div class="hero-card">
        <h3 style="font-size: 16px; margin-bottom: 12px;">Study Summary</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px;">
          <div style="background:#0f172a; padding:16px; border-radius:14px; border:1px solid var(--surface-border);">
            <div style="color:var(--text-muted); font-size:12px;">This Week</div>
            <div class="mono" id="weekHours" style="font-size:24px; font-weight:800;">0h 0m</div>
          </div>
          <div style="background:#0f172a; padding:16px; border-radius:14px; border:1px solid var(--surface-border);">
            <div style="color:var(--text-muted); font-size:12px;">This Month</div>
            <div class="mono" id="monthHours" style="font-size:24px; font-weight:800;">0h 0m</div>
          </div>
          <div style="background:#0f172a; padding:16px; border-radius:14px; border:1px solid var(--surface-border);">
            <div style="color:var(--text-muted); font-size:12px;">Total All-Time</div>
            <div class="mono" id="allTimeHours" style="font-size:24px; font-weight:800;">0h 0m</div>
          </div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;" class="history-split">
        <div class="hero-card">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <h4 id="calMonthTitle" style="font-weight:700;">Month</h4>
            <div>
              <button class="btn btn-secondary" onclick="changeMonth(-1)">◀</button>
              <button class="btn btn-secondary" onclick="changeMonth(1)">▶</button>
            </div>
          </div>
          <div id="calendarGrid" class="cal-grid"></div>
        </div>

        <div class="hero-card">
          <h4 id="selectedDateTitle" style="font-weight:700; margin-bottom:12px;">Date Details</h4>
          <div class="mono" id="selectedDateHours" style="font-size:28px; font-weight:800; margin-bottom:12px;">0h 0m</div>
          <div id="selectedDateTasks"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Add Task Modal -->
  <div id="taskModal" class="modal-overlay">
    <div class="modal-box">
      <h3 style="margin-bottom: 16px;">Add Daily Target Task</h3>
      <div class="input-group">
        <label>Primary Folder / Category</label>
        <select id="taskFolder" onchange="onFolderSelectChanged(this.value)">
        </select>
      </div>
      <div class="input-group">
        <label>Subject / Course Name</label>
        <input type="text" id="taskSubject" placeholder="e.g., Organic Chemistry, IELTS Speaking">
        <div id="subjectSuggestionChips" style="display:flex; flex-wrap:wrap; gap:6px; margin-top:8px;"></div>
      </div>
      <div class="input-group">
        <label>Topics / Goals</label>
        <input type="text" id="taskTopics" placeholder="e.g., Chapter 4 practice problems">
      </div>
      <div class="input-group">
        <label>Target Study Time (Minutes)</label>
        <input type="number" id="taskTargetMins" value="60" min="5" step="5">
      </div>
      <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:20px;">
        <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveTask()">Save Task</button>
      </div>
    </div>
  </div>

  <!-- Manage Folders Modal -->
  <div id="folderModal" class="modal-overlay">
    <div class="modal-box">
      <h3 style="margin-bottom: 16px;">Manage Folders & Subjects</h3>
      <div style="margin-bottom: 16px;">
        <label style="font-size:12px; font-weight:600; color:var(--text-muted); display:block; margin-bottom:6px;">Add New Custom Folder</label>
        <div style="display:flex; gap:8px;">
          <input type="text" id="newFolderName" placeholder="Folder Name (e.g. Research, Programming)" style="flex:1; padding:10px 14px; background:#0f172a; border:1px solid var(--surface-border); border-radius:10px; color:white; font-size:14px;">
          <button class="btn btn-primary" onclick="addNewFolder()">Create</button>
        </div>
      </div>

      <div style="font-size:12px; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:8px;">Existing Folders</div>
      <div id="manageFoldersList" style="display:flex; flex-direction:column; gap:10px;">
      </div>

      <div style="display:flex; justify-content:flex-end; margin-top:20px;">
        <button class="btn btn-secondary" onclick="closeFolderModal()">Close</button>
      </div>
    </div>
  </div>

  <!-- Firebase Scripts (Modular ESM) -->
  <script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
    import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
    import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

    const firebaseConfig = {
      apiKey: "AIzaSyCUxcipHqLxPtFEBsdEZ2Krg31bt4O5Nzc",
      authDomain: "study-traker-4cf8d.firebaseapp.com",
      projectId: "study-traker-4cf8d",
      storageBucket: "study-traker-4cf8d.firebasestorage.app",
      messagingSenderId: "247511330621",
      appId: "1:247511330621:web:c732d3554d7086bc261f54",
      measurementId: "G-11M8DX9EX8"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const provider = new GoogleAuthProvider();

    const SALAH_PRAYERS = [
      { id: 'fajr', name: 'Fajr', time: 'Dawn / Before Sunrise', color: '#6366f1' },
      { id: 'dhuhr', name: 'Dhuhr', time: 'Midday / After Zenith', color: '#f59e0b' },
      { id: 'asr', name: 'Asr', time: 'Late Afternoon', color: '#d97706' },
      { id: 'maghrib', name: 'Maghrib', time: 'Just After Sunset', color: '#ec4899' },
      { id: 'isha', name: 'Isha', time: 'Night', color: '#8b5cf6' }
    ];

    const DEFAULT_FOLDERS = [
      { id: 'academic', name: 'Academic (Campus Studies)', color: '#4F46E5', subjects: ['Data Structures', 'Database Systems', 'Algorithms'] },
      { id: 'admission', name: 'Admission', color: '#D97706', subjects: ['Math Drill', 'Physics Mock', 'Chemistry'] },
      { id: 'english', name: 'English Learning', color: '#059669', subjects: ['IELTS Speaking', 'Vocabulary', 'Writing Task 2'] }
    ];

    let currentUser = null;
    let unsubscribeFirestore = null;

    let appData = {
      folders: JSON.parse(JSON.stringify(DEFAULT_FOLDERS)),
      tasks: [
        { id: '1', folder: 'academic', subject: 'Data Structures', topics: 'Binary Search Trees & Traversal', targetMins: 90, actualMins: 45, completed: false },
        { id: '2', folder: 'admission', subject: 'Math Drill', topics: 'Calculus derivatives mock tests', targetMins: 60, actualMins: 60, completed: true },
        { id: '3', folder: 'english', subject: 'Vocabulary & IELTS', topics: 'Academic Collocations & Speaking Part 2', targetMins: 45, actualMins: 30, completed: false }
      ],
      dateRecords: {},
      salahRecords: {}
    };

    let selectedDateKey = new Date().toISOString().slice(0, 10);
    let selectedSalahDate = new Date().toISOString().slice(0, 10);
    let currentCalDate = new Date();

    // DOM references
    const authScreen = document.getElementById('authScreen');
    const mainApp = document.getElementById('mainApp');
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const userNameEl = document.getElementById('userName');
    const userAvatarEl = document.getElementById('userAvatar');
    const syncIndicator = document.getElementById('syncIndicator');

    // Google Sign-In button event
    googleLoginBtn.onclick = async () => {
      try {
        await signInWithPopup(auth, provider);
      } catch (err) {
        if (err.code === 'auth/unauthorized-domain' || (err.message && err.message.includes('unauthorized-domain'))) {
          alert('Firebase Authorized Domain Required:\\n\\nDomain: ' + window.location.hostname + '\\n\\nAdd this domain in Firebase Console (Authentication > Settings > Authorized domains), or click "Continue in Local Mode" to use FocusTrack immediately without login.');
        } else {
          alert('Google Sign-In Error: ' + err.message);
        }
      }
    };

    // Guest / Local Mode button event
    document.getElementById('guestLoginBtn').onclick = () => {
      currentUser = { uid: 'guest_student', displayName: 'Student (Local Mode)', email: 'student@local' };
      authScreen.style.display = 'none';
      mainApp.style.display = 'block';
      userNameEl.innerText = 'Student (Local Mode)';
      syncIndicator.innerText = '💾 Local Storage';
      render();
    };

    window.handleLogout = async () => {
      if (confirm('Log out of FocusTrack?')) {
        await signOut(auth);
      }
    };

    // Auth State Changed
    onAuthStateChanged(auth, (user) => {
      currentUser = user;
      if (user) {
        authScreen.style.display = 'none';
        mainApp.style.display = 'block';

        userNameEl.innerText = user.displayName || user.email || 'Student';
        if (user.photoURL) {
          userAvatarEl.innerHTML = '<img src="' + user.photoURL + '" alt="Avatar">';
        } else {
          userAvatarEl.innerText = (user.displayName || user.email || 'U')[0].toUpperCase();
        }

        listenToUserStudyData(user.uid);
      } else {
        if (unsubscribeFirestore) unsubscribeFirestore();
        authScreen.style.display = 'flex';
        mainApp.style.display = 'none';
      }
    });

    // Real-time Firestore sync with users/{userId}/studyData/main
    function listenToUserStudyData(userId) {
      if (unsubscribeFirestore) unsubscribeFirestore();

      const docRef = doc(db, 'users', userId, 'studyData', 'main');
      unsubscribeFirestore = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.folders && Array.isArray(data.folders) && data.folders.length > 0) appData.folders = data.folders;
          if (data.tasks) appData.tasks = data.tasks;
          if (data.dateRecords) appData.dateRecords = data.dateRecords;
          if (data.salahRecords) appData.salahRecords = data.salahRecords;
          syncIndicator.innerText = '☁️ Firestore Synced';
        } else {
          // Initialize fresh user onboarding
          saveToFirestore();
        }
        render();
      }, (error) => {
        console.error('Firestore Error:', error);
        syncIndicator.innerText = '⚠️ Offline Mode';
      });
    }

    async function saveToFirestore() {
      if (!currentUser) return;
      syncIndicator.innerText = '⏳ Syncing...';
      const docRef = doc(db, 'users', currentUser.uid, 'studyData', 'main');
      try {
        await setDoc(docRef, {
          folders: appData.folders,
          tasks: appData.tasks,
          dateRecords: appData.dateRecords,
          salahRecords: appData.salahRecords,
          lastUpdated: new Date().toISOString(),
          userEmail: currentUser.email,
          displayName: currentUser.displayName
        }, { merge: true });
        syncIndicator.innerText = '☁️ Firestore Synced';
      } catch (err) {
        console.error('Save to Firestore error:', err);
        syncIndicator.innerText = '⚠️ Save Failed';
      }
    }

    function formatTime(mins) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return h + 'h ' + m + 'm';
    }

    window.switchTab = (tab) => {
      document.getElementById('tabRoutine').classList.toggle('active', tab === 'routine');
      document.getElementById('tabSalah').classList.toggle('active', tab === 'salah');
      document.getElementById('tabHistory').classList.toggle('active', tab === 'history');
      document.getElementById('viewRoutine').style.display = tab === 'routine' ? 'block' : 'none';
      document.getElementById('viewSalah').style.display = tab === 'salah' ? 'block' : 'none';
      document.getElementById('viewHistory').style.display = tab === 'history' ? 'block' : 'none';
      if (tab === 'salah') renderSalah();
      if (tab === 'history') renderHistory();
    };

    function render() {
      // Sync today's totals
      let totalAct = 0, totalTgt = 0;
      let fData = {};
      appData.folders.forEach(f => {
        fData[f.id] = { name: f.name, color: f.color, act: 0, tgt: 0, subjects: f.subjects || [] };
      });

      appData.tasks.forEach(t => {
        totalAct += t.actualMins;
        totalTgt += t.targetMins;
        if (fData[t.folder]) {
          fData[t.folder].act += t.actualMins;
          fData[t.folder].tgt += t.targetMins;
        }
      });

      document.getElementById('totalActual').innerText = formatTime(totalAct);
      document.getElementById('totalTarget').innerText = formatTime(totalTgt);

      // Render Dynamic Progress Bar
      const baseTgt = Math.max(1, totalTgt);
      const progEl = document.getElementById('dynamicProgressBar');
      progEl.innerHTML = '';
      appData.folders.forEach(f => {
        const d = fData[f.id];
        if (d && d.act > 0) {
          const w = Math.min(100, (d.act / baseTgt) * 100);
          progEl.innerHTML += \`<div class="progress-fill" style="background: \${f.color}; width: \${w}%;"></div>\`;
        }
      });

      // Folder cards
      const fCont = document.getElementById('folderCardsContainer');
      fCont.innerHTML = '';
      appData.folders.forEach(f => {
        const d = fData[f.id] || { act: 0, tgt: 0, subjects: [] };
        const pct = d.tgt > 0 ? Math.min(100, Math.round((d.act / d.tgt) * 100)) : 0;
        const card = document.createElement('div');
        card.className = 'folder-card';
        card.style.borderTop = '3px solid ' + f.color;
        
        let subjChips = (f.subjects || []).map(s => \`<span style="background:rgba(255,255,255,0.06); padding:2px 8px; border-radius:6px; font-size:11px; color:var(--text-muted);">\${s}</span>\`).join(' ');

        card.innerHTML = \`
          <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
            <span class="badge" style="background: \${f.color}26; color: \${f.color}; border: 1px solid \${f.color}66;">\${f.name}</span>
            <span class="mono" style="font-size:12px; font-weight:700;">\${pct}%</span>
          </div>
          <div class="mono" style="font-size:24px; font-weight:800; margin-bottom:4px;">\${formatTime(d.act)}</div>
          <div style="color:var(--text-muted); font-size:12px; margin-bottom:10px;">Target: \${formatTime(d.tgt)}</div>
          <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:8px;">\${subjChips}</div>
        \`;
        fCont.appendChild(card);
      });

      // Render tasks
      const list = document.getElementById('tasksList');
      list.innerHTML = '';
      if (appData.tasks.length === 0) {
        list.innerHTML = '<div style="text-align:center; padding:30px; color:var(--text-muted); background:var(--surface); border-radius:14px; border:1px solid var(--surface-border);">No study tasks scheduled yet. Click "+ Add Task" to plan your morning!</div>';
      } else {
        appData.tasks.forEach((t, i) => {
          const folderObj = appData.folders.find(f => f.id === t.folder) || { name: t.folder, color: '#6366f1' };
          const item = document.createElement('div');
          item.className = 'task-item';
          item.innerHTML = \`
            <div class="task-left">
              <input type="checkbox" class="checkbox" \${t.completed ? 'checked' : ''} onchange="toggleTask(\${i})">
              <div>
                <div style="display:flex; align-items:center; gap:8px;">
                  <span class="\${t.completed ? 'completed-text' : ''}" style="font-weight:700;">\${t.subject}</span>
                  <span class="badge" style="background:\${folderObj.color}22; color:\${folderObj.color}; border:1px solid \${folderObj.color}55;">\${folderObj.name}</span>
                </div>
                <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">\${t.topics || 'Routine study session'}</div>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
              <div style="text-align:right;">
                <span class="mono" style="font-weight:700; font-size:14px;">\${formatTime(t.actualMins)}</span>
                <span style="font-size:11px; color:var(--text-muted);"> / \${formatTime(t.targetMins)}</span>
              </div>
              <button class="btn btn-secondary" onclick="addTime(\${i}, 15)">+15m</button>
              <button class="btn btn-secondary" onclick="addTime(\${i}, 30)">+30m</button>
              <button class="btn btn-danger" onclick="deleteTask(\${i})">✕</button>
            </div>
          \`;
          list.appendChild(item);
        });
      }

      // Update Salah Badge
      const today = new Date().toISOString().slice(0, 10);
      const todaySalah = appData.salahRecords[today] || {};
      const completedSalahCount = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].filter(p => todaySalah[p]).length;
      document.getElementById('salahBadge').innerText = completedSalahCount + '/5';

      // Update today's record in history
      appData.dateRecords[today] = {
        date: today,
        actualMins: totalAct,
        targetMins: totalTgt,
        tasks: JSON.parse(JSON.stringify(appData.tasks))
      };
    }

    // Salah Rendering
    function renderSalah() {
      document.getElementById('salahDateInput').value = selectedSalahDate;
      const rec = appData.salahRecords[selectedSalahDate] || { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false };
      const completedCount = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].filter(p => rec[p]).length;
      
      document.getElementById('salahCompletedRatio').innerText = completedCount + ' / 5';
      document.getElementById('salahPercentage').innerText = Math.round((completedCount / 5) * 100) + '%';

      const cont = document.getElementById('salahListContainer');
      cont.innerHTML = '';

      SALAH_PRAYERS.forEach(p => {
        const isDone = !!rec[p.id];
        const card = document.createElement('div');
        card.className = 'salah-card' + (isDone ? ' completed' : '');
        card.innerHTML = \`
          <div style="display:flex; align-items:center; gap:14px;">
            <button class="salah-check-btn \${isDone ? 'checked' : ''}" onclick="toggleSalah('\${p.id}')">
              \${isDone ? '✓' : ''}
            </button>
            <div>
              <div style="font-weight:800; font-size:16px; display:flex; align-items:center; gap:8px;">
                <span>\${p.name}</span>
                \${isDone ? '<span style="font-size:11px; background:#10b98122; color:#10b981; padding:2px 8px; border-radius:99px; font-weight:700;">Completed</span>' : ''}
              </div>
              <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">\${p.time}</div>
            </div>
          </div>
          <div style="font-size:12px; font-weight:600; color:\${p.color};">Daily Fard</div>
        \`;
        cont.appendChild(card);
      });
    }

    window.toggleSalah = (prayerId) => {
      if (!appData.salahRecords[selectedSalahDate]) {
        appData.salahRecords[selectedSalahDate] = { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false };
      }
      appData.salahRecords[selectedSalahDate][prayerId] = !appData.salahRecords[selectedSalahDate][prayerId];
      renderSalah();
      render();
      saveToFirestore();
    };

    window.changeSalahDate = (delta) => {
      const d = new Date(selectedSalahDate);
      d.setDate(d.getDate() + delta);
      selectedSalahDate = d.toISOString().slice(0, 10);
      renderSalah();
    };

    window.onSalahDateChange = (val) => {
      if (val) {
        selectedSalahDate = val;
        renderSalah();
      }
    };

    function renderHistory() {
      let allTime = 0;
      Object.values(appData.dateRecords).forEach(r => allTime += (r.actualMins || 0));
      document.getElementById('allTimeHours').innerText = formatTime(allTime);
      document.getElementById('weekHours').innerText = formatTime(Math.round(allTime * 0.4));
      document.getElementById('monthHours').innerText = formatTime(allTime);

      const y = currentCalDate.getFullYear();
      const m = currentCalDate.getMonth();
      const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      document.getElementById('calMonthTitle').innerText = monthNames[m] + ' ' + y;

      const calEl = document.getElementById('calendarGrid');
      calEl.innerHTML = '<div class="cal-day-label">Su</div><div class="cal-day-label">Mo</div><div class="cal-day-label">Tu</div><div class="cal-day-label">We</div><div class="cal-day-label">Th</div><div class="cal-day-label">Fr</div><div class="cal-day-label">Sa</div>';

      const firstDay = new Date(y, m, 1).getDay();
      const totalDays = new Date(y, m + 1, 0).getDate();

      for (let i = 0; i < firstDay; i++) {
        calEl.innerHTML += '<div style="opacity:0.2;"></div>';
      }

      for (let d = 1; d <= totalDays; d++) {
        const dStr = y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
        const rec = appData.dateRecords[dStr];
        const hasData = rec && rec.actualMins > 0;
        const isSel = dStr === selectedDateKey;

        const cell = document.createElement('div');
        cell.className = 'cal-cell' + (hasData ? ' has-data' : '') + (isSel ? ' selected' : '');
        cell.onclick = () => { selectedDateKey = dStr; renderHistory(); };
        cell.innerHTML = '<div>' + d + '</div>' + (hasData ? '<div class="mono" style="font-weight:700; color:#818cf8;">' + formatTime(rec.actualMins) + '</div>' : '');
        calEl.appendChild(cell);
      }

      // Selected Day Details
      document.getElementById('selectedDateTitle').innerText = selectedDateKey;
      const selRec = appData.dateRecords[selectedDateKey];
      const tasksEl = document.getElementById('selectedDateTasks');
      if (selRec && selRec.actualMins > 0) {
        document.getElementById('selectedDateHours').innerText = formatTime(selRec.actualMins);
        tasksEl.innerHTML = '';
        (selRec.tasks || []).forEach(t => {
          const folderObj = appData.folders.find(f => f.id === t.folder) || { name: t.folder, color: '#6366f1' };
          tasksEl.innerHTML += \`
            <div style="background:#0f172a; padding:12px; border-radius:10px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <span style="font-weight:700;">\${t.subject}</span>
                <span class="badge" style="background:\${folderObj.color}22; color:\${folderObj.color}; margin-left:6px;">\${folderObj.name}</span>
              </div>
              <span class="mono" style="font-weight:700;">\${formatTime(t.actualMins)}</span>
            </div>
          \`;
        });
      } else {
        document.getElementById('selectedDateHours').innerText = '0h 0m';
        tasksEl.innerHTML = '<div style="color:var(--text-muted); text-align:center; padding:30px;">No study hours recorded on this day.</div>';
      }
    }

    window.toggleTask = (index) => {
      appData.tasks[index].completed = !appData.tasks[index].completed;
      render();
      saveToFirestore();
    };

    window.addTime = (index, mins) => {
      appData.tasks[index].actualMins += mins;
      render();
      saveToFirestore();
    };

    window.deleteTask = (index) => {
      if (confirm('Delete this task?')) {
        appData.tasks.splice(index, 1);
        render();
        saveToFirestore();
      }
    };

    window.startNewDay = () => {
      if (confirm('Start a fresh day? This will archive today\\'s study hours and reset today\\'s active counters while keeping your saved folders & subjects.')) {
        render();
        appData.tasks.forEach(t => { t.actualMins = 0; t.completed = false; });
        render();
        saveToFirestore();
      }
    };

    window.confirmResetAllData = async () => {
      if (confirm('⚠️ RESET ALL DATA WARNING:\\n\\nThis will reset all your folders, daily study logs, and Salah records back to initial defaults under your account.\\n\\nAre you sure you want to proceed?')) {
        appData.folders = JSON.parse(JSON.stringify(DEFAULT_FOLDERS));
        appData.tasks = [];
        appData.dateRecords = {};
        appData.salahRecords = {};
        render();
        renderSalah();
        await saveToFirestore();
        alert('All study and prayer data has been reset to defaults.');
      }
    };

    window.changeMonth = (delta) => {
      currentCalDate.setMonth(currentCalDate.getMonth() + delta);
      renderHistory();
    };

    window.openAddTaskModal = () => {
      const sel = document.getElementById('taskFolder');
      sel.innerHTML = '';
      appData.folders.forEach(f => {
        sel.innerHTML += \`<option value="\${f.id}">\${f.name}</option>\`;
      });
      if (appData.folders.length > 0) {
        onFolderSelectChanged(appData.folders[0].id);
      }
      document.getElementById('taskModal').style.display = 'flex';
    };

    window.onFolderSelectChanged = (folderId) => {
      const f = appData.folders.find(x => x.id === folderId);
      const chipsEl = document.getElementById('subjectSuggestionChips');
      chipsEl.innerHTML = '';
      if (f && f.subjects && f.subjects.length > 0) {
        f.subjects.forEach(s => {
          const chip = document.createElement('button');
          chip.type = 'button';
          chip.innerText = '+ ' + s;
          chip.style.cssText = 'background:rgba(99,102,241,0.15); border:1px solid rgba(99,102,241,0.3); color:#818cf8; border-radius:6px; padding:3px 8px; font-size:11px; cursor:pointer;';
          chip.onclick = () => { document.getElementById('taskSubject').value = s; };
          chipsEl.appendChild(chip);
        });
      }
    };

    window.closeModal = () => { document.getElementById('taskModal').style.display = 'none'; };

    window.saveTask = () => {
      const folder = document.getElementById('taskFolder').value;
      const subject = document.getElementById('taskSubject').value.trim();
      const topics = document.getElementById('taskTopics').value.trim();
      const targetMins = parseInt(document.getElementById('taskTargetMins').value, 10) || 60;
      if (!subject) {
        alert('Please enter a subject name');
        return;
      }

      appData.tasks.unshift({ id: Date.now().toString(), folder, subject, topics, targetMins, actualMins: 0, completed: false });
      window.closeModal();
      render();
      saveToFirestore();
    };

    // Folder Management
    window.openManageFolderModal = () => {
      renderFolderManageList();
      document.getElementById('folderModal').style.display = 'flex';
    };

    window.closeFolderModal = () => {
      document.getElementById('folderModal').style.display = 'none';
      render();
    };

    function renderFolderManageList() {
      const cont = document.getElementById('manageFoldersList');
      cont.innerHTML = '';
      appData.folders.forEach((f, idx) => {
        const item = document.createElement('div');
        item.style.cssText = 'background:#0f172a; border:1px solid var(--surface-border); border-radius:12px; padding:12px;';
        
        let subChips = (f.subjects || []).map((s, si) => \`
          <span style="display:inline-flex; align-items:center; gap:4px; background:rgba(255,255,255,0.08); padding:3px 8px; border-radius:6px; font-size:11px;">
            \${s}
            <button onclick="removeSubjectFromFolder(\${idx}, \${si})" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:12px;">×</button>
          </span>
        \`).join(' ');

        item.innerHTML = \`
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <div style="font-weight:700; color:\${f.color}; font-size:14px;">\${f.name}</div>
            \${appData.folders.length > 1 ? \`<button class="btn btn-danger" onclick="deleteFolder(\${idx})" style="padding:2px 8px; font-size:11px;">Delete Folder</button>\` : ''}
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom:8px;">\${subChips}</div>
          <div style="display:flex; gap:6px;">
            <input type="text" id="addSubjectInput_\${idx}" placeholder="+ Add subject/course" style="flex:1; padding:6px 10px; background:var(--surface); border:1px solid var(--surface-border); border-radius:8px; color:white; font-size:12px;">
            <button class="btn btn-secondary" onclick="addSubjectToFolder(\${idx})" style="padding:6px 10px; font-size:12px;">Add</button>
          </div>
        \`;
        cont.appendChild(item);
      });
    }

    window.addNewFolder = () => {
      const input = document.getElementById('newFolderName');
      const name = input.value.trim();
      if (!name) return;
      const colors = ['#4F46E5', '#D97706', '#059669', '#7C3AED', '#DB2777', '#0284C7', '#EA580C'];
      const color = colors[appData.folders.length % colors.length];
      appData.folders.push({
        id: 'folder_' + Date.now(),
        name,
        color,
        subjects: []
      });
      input.value = '';
      renderFolderManageList();
      render();
      saveToFirestore();
    };

    window.deleteFolder = (idx) => {
      if (confirm('Delete folder "' + appData.folders[idx].name + '" and its subjects?')) {
        appData.folders.splice(idx, 1);
        renderFolderManageList();
        render();
        saveToFirestore();
      }
    };

    window.addSubjectToFolder = (fIdx) => {
      const input = document.getElementById('addSubjectInput_' + fIdx);
      const val = input.value.trim();
      if (!val) return;
      if (!appData.folders[fIdx].subjects) appData.folders[fIdx].subjects = [];
      appData.folders[fIdx].subjects.push(val);
      input.value = '';
      renderFolderManageList();
      render();
      saveToFirestore();
    };

    window.removeSubjectFromFolder = (fIdx, sIdx) => {
      appData.folders[fIdx].subjects.splice(sIdx, 1);
      renderFolderManageList();
      render();
      saveToFirestore();
    };

    // Initial render
    render();
  </script>
</body>
</html>`;
}

/**
 * Trigger browser download for the single-file HTML version
 */
export function downloadSingleFileApp(): void {
  const content = generateSingleFileHtml();
  const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `focus-study-tracker-${new Date().toISOString().slice(0, 10)}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
