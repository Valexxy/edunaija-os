'use client';

const DB_NAME = 'EduNaijaOfflineDB';
const STORE_NAME = 'pendingAnswers';
const DB_VERSION = 1;

export interface QueuedAnswer {
  id?: number;
  submissionId: string;
  examId: string;
  studentKey: string;
  questionId: string | number;
  selectedOption: string;
  timeSpentMs: number;
  timestamp: number;
  synced: boolean;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('IndexedDB not available in SSR'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('synced', 'synced', { unique: false });
        store.createIndex('examId', 'examId', { unique: false });
      }
    };
    req.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result);
    req.onerror = () => reject(req.error);
  });
}

export async function queueAnswer(answer: Omit<QueuedAnswer, 'id' | 'synced'>): Promise<{ status: string }> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.add({ ...answer, synced: false });
      tx.oncomplete = () => resolve({ status: 'QUEUED_OFFLINE' });
    });
  } catch {
    return { status: 'IDB_UNAVAILABLE' };
  }
}

export async function syncPendingAnswers(apiBase: string = '/api/backend'): Promise<number> {
  if (typeof window === 'undefined' || !navigator.onLine) return 0;
  let synced = 0;
  try {
    const db = await openDB();
    const unsynced: QueuedAnswer[] = await new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const all = (req.result as QueuedAnswer[]) || [];
        resolve(all.filter((a) => !a.synced));
      };
      req.onerror = () => resolve([]);
    });

    for (const answer of unsynced) {
      try {
        const res = await fetch(`${apiBase}/quiz/submit-answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(answer),
          signal: AbortSignal.timeout(5000),
        });
        if (res.ok) {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          tx.objectStore(STORE_NAME).put({ ...answer, synced: true });
          synced++;
        }
      } catch {
        // Still offline
      }
    }
  } catch {
    // IDB error handling
  }
  return synced;
}

export async function getPendingCount(): Promise<number> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const all = (req.result as QueuedAnswer[]) || [];
        resolve(all.filter((a) => !a.synced).length);
      };
      req.onerror = () => resolve(0);
    });
  } catch {
    return 0;
  }
}
