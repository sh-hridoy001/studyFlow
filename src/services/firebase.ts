import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  getDocFromServer,
  Unsubscribe,
} from 'firebase/firestore';
import { DailyTask, DateStudyRecord, ActiveStopwatchState } from '../types';

export const firebaseConfig = {
  apiKey: "AIzaSyCUxcipHqLxPtFEBsdEZ2Krg31bt4O5Nzc",
  authDomain: "study-traker-4cf8d.firebaseapp.com",
  projectId: "study-traker-4cf8d",
  storageBucket: "study-traker-4cf8d.firebasestorage.app",
  messagingSenderId: "247511330621",
  appId: "1:247511330621:web:c732d3554d7086bc261f54",
  measurementId: "G-11M8DX9EX8"
};

// Initialize Firebase App instance
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google Auth Provider setup
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Error handling per Firebase Skill instructions
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initial connection test
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is running in offline client mode.');
    }
    return false;
  }
}

// User Study Data Payload
export interface UserStudyDataPayload {
  tasks: DailyTask[];
  dateRecords: Record<string, DateStudyRecord>;
  stopwatch?: ActiveStopwatchState;
  lastUpdated: string;
  userEmail?: string | null;
  displayName?: string | null;
}

/**
 * Saves study data to users/{userId}/studyData/main document
 */
export async function saveUserStudyDataToFirestore(
  userId: string,
  data: {
    tasks: DailyTask[];
    dateRecords: Record<string, DateStudyRecord>;
    stopwatch?: ActiveStopwatchState;
  }
): Promise<void> {
  const path = `users/${userId}/studyData/main`;
  try {
    const payload: UserStudyDataPayload = {
      tasks: data.tasks,
      dateRecords: data.dateRecords,
      stopwatch: data.stopwatch,
      lastUpdated: new Date().toISOString(),
      userEmail: auth.currentUser?.email || null,
      displayName: auth.currentUser?.displayName || null,
    };

    const docRef = doc(db, 'users', userId, 'studyData', 'main');
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Fetches one-time study data from Firestore
 */
export async function fetchUserStudyDataFromFirestore(
  userId: string
): Promise<UserStudyDataPayload | null> {
  const path = `users/${userId}/studyData/main`;
  try {
    const docRef = doc(db, 'users', userId, 'studyData', 'main');
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data() as UserStudyDataPayload;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Subscribes to real-time updates for users/{userId}/studyData/main
 */
export function subscribeToUserStudyData(
  userId: string,
  onData: (data: UserStudyDataPayload | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const path = `users/${userId}/studyData/main`;
  const docRef = doc(db, 'users', userId, 'studyData', 'main');

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onData(snapshot.data() as UserStudyDataPayload);
      } else {
        onData(null);
      }
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// Google Sign In
export async function signInWithGoogleAuth(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

// Sign Out
export async function signOutUser(): Promise<void> {
  await signOut(auth);
}
