import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import { app, auth, firebaseConfig } from './firebase';
export { auth, app };
import { DailyTask, PrimaryFolderId, DateStudyRecord } from '../types';

export const CALENDAR_SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

// Google Auth Provider setup with Calendar Events scope
const provider = new GoogleAuthProvider();
CALENDAR_SCOPES.forEach((scope) => provider.addScope(scope));

// In-memory token cache (NEVER in localStorage per Workspace skill guidelines)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Custom Client ID storage key in localStorage
export const CUSTOM_CLIENT_ID_STORAGE_KEY = 'studytracker_custom_google_client_id_v1';

export function getCustomClientId(): string {
  try {
    return localStorage.getItem(CUSTOM_CLIENT_ID_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function setCustomClientId(clientId: string): void {
  try {
    if (clientId.trim()) {
      localStorage.setItem(CUSTOM_CLIENT_ID_STORAGE_KEY, clientId.trim());
    } else {
      localStorage.removeItem(CUSTOM_CLIENT_ID_STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

export function getDefaultClientId(): string {
  return (firebaseConfig as { oAuthClientId?: string }).oAuthClientId || '';
}

/**
 * Listener for Auth State changes
 */
export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Sign in with Google using popup
 */
export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (!credential?.accessToken) {
      throw new Error('Could not obtain Google OAuth access token from sign-in.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-In failed:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Sign out from Google Auth
 */
export const signOutGoogle = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
};

/**
 * Get the current active access token
 */
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

// Google Calendar event color mapping
// Google Calendar color IDs: 9 = Blueberry/Indigo, 5 = Banana/Amber, 10 = Basil/Emerald
export const FOLDER_CALENDAR_COLORS: Record<PrimaryFolderId, string> = {
  academic: '9',  // Blueberry / Deep Blue
  admission: '5', // Banana / Warm Amber
  english: '10',  // Basil / Green
};

export interface CalendarEventPayload {
  summary: string;
  description: string;
  start: { dateTime: string; timeZone?: string };
  end: { dateTime: string; timeZone?: string };
  colorId?: string;
}

/**
 * Creates a single event on the user's primary Google Calendar
 */
export async function createGoogleCalendarEvent(
  accessToken: string,
  event: CalendarEventPayload
): Promise<any> {
  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.error?.message ||
        `Google Calendar API error (status ${response.status})`
    );
  }

  return response.json();
}

/**
 * Prepares events from tasks for a given date
 */
export function buildEventsForTasks(
  tasks: Array<{
    id: string;
    folderId: PrimaryFolderId;
    subjectName: string;
    topics: string;
    actualMinutes: number;
    completed: boolean;
    notes?: string;
  }>,
  dateStr: string, // YYYY-MM-DD
  baseStartHour: number = 9 // Default morning 9:00 AM start
): Array<{ task: any; payload: CalendarEventPayload }> {
  const events: Array<{ task: any; payload: CalendarEventPayload }> = [];

  // Filter tasks with actual study time > 0
  const activeTasks = tasks.filter((t) => t.actualMinutes > 0);

  let currentStartTime = new Date(`${dateStr}T09:00:00`);

  activeTasks.forEach((task, idx) => {
    const durationMs = task.actualMinutes * 60 * 1000;
    const startTime = new Date(currentStartTime.getTime());
    const endTime = new Date(startTime.getTime() + durationMs);

    const folderName =
      task.folderId === 'academic'
        ? 'Academic'
        : task.folderId === 'admission'
        ? 'Admission'
        : 'English Learning';

    const statusBadge = task.completed ? '✓ Completed' : 'In-Progress';

    const summary = `[${folderName}] ${task.subjectName} (${task.actualMinutes}m)`;
    const description = [
      `Category: ${folderName}`,
      `Subject: ${task.subjectName}`,
      `Topics: ${task.topics || 'Routine study session'}`,
      `Status: ${statusBadge}`,
      `Duration: ${task.actualMinutes} minutes`,
      task.notes ? `Notes: ${task.notes}` : null,
      '',
      'Tracked and synced via FocusTrack Study Planner.',
    ]
      .filter((line) => line !== null)
      .join('\n');

    events.push({
      task,
      payload: {
        summary,
        description,
        start: { dateTime: startTime.toISOString() },
        end: { dateTime: endTime.toISOString() },
        colorId: FOLDER_CALENDAR_COLORS[task.folderId],
      },
    });

    // Advance start time with 15-minute gap between study blocks
    currentStartTime = new Date(endTime.getTime() + 15 * 60 * 1000);
  });

  return events;
}
