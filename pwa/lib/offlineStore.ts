// EduNaija 0-Data Offline-First Engine
// Powers full offline study, question banking, and background syncing using IndexedDB

export interface OfflineQuestion {
  id: number;
  subject: string;
  year: number;
  topic: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface OfflineResult {
  id?: number;
  subject: string;
  score: number;
  total: number;
  timestamp: number;
  synced: boolean;
}

const DB_NAME = "edunaija_zero_data_db";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject("IndexedDB not supported");
      return;
    }

    const req = window.indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("questions")) {
        db.createObjectStore("questions", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("results_queue")) {
        db.createObjectStore("results_queue", { autoIncrement: true });
      }
      if (!db.objectStoreNames.contains("metadata")) {
        db.createObjectStore("metadata", { keyPath: "key" });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveOfflinePack(packData: any): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(["questions", "metadata"], "readwrite");
    const qStore = tx.objectStore("questions");
    const mStore = tx.objectStore("metadata");

    let count = 0;
    if (packData.offline_questions && Array.isArray(packData.offline_questions)) {
      for (const q of packData.offline_questions) {
        qStore.put(q);
        count++;
      }
    }

    mStore.put({
      key: "last_download",
      timestamp: Date.now(),
      total_questions: count,
      version: packData.pack_version || "2026.2.0"
    });

    if (packData.offline_formulas) {
      mStore.put({
        key: "formulas",
        data: packData.offline_formulas
      });
    }

    if (packData.offline_mnemonics) {
      mStore.put({
        key: "mnemonics",
        data: packData.offline_mnemonics
      });
    }

    tx.oncomplete = () => resolve(count);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getOfflineFormulas(): Promise<Record<string, Array<{ name: string; formula: string }>> | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("metadata", "readonly");
    const store = tx.objectStore("metadata");
    const req = store.get("formulas");
    req.onsuccess = () => resolve(req.result ? req.result.data : null);
    req.onerror = () => reject(tx.error);
  });
}

export async function getOfflineQuestions(subject?: string): Promise<OfflineQuestion[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("questions", "readonly");
    const store = tx.objectStore("questions");
    const req = store.getAll();

    req.onsuccess = () => {
      let list: OfflineQuestion[] = req.result || [];
      if (subject && subject !== "All") {
        list = list.filter(q => q.subject.toLowerCase() === subject.toLowerCase());
      }
      resolve(list);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function queueOfflineResult(result: OfflineResult): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("results_queue", "readwrite");
    const store = tx.objectStore("results_queue");
    store.add({ ...result, synced: false, timestamp: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getQueuedResults(): Promise<OfflineResult[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("results_queue", "readonly");
    const store = tx.objectStore("results_queue");
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function clearSyncedResults(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("results_queue", "readwrite");
    const store = tx.objectStore("results_queue");
    store.clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function syncOfflineQueueWithServer(): Promise<{ synced: number; xp: number } | null> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return null; // Still offline
  }

  try {
    const pending = await getQueuedResults();
    if (pending.length === 0) return { synced: 0, xp: 0 };

    const res = await fetch("/api/backend/zero-data/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        completed_quizzes: pending,
        sync_timestamp: Date.now()
      })
    });

    if (res.ok) {
      const data = await res.json();
      await clearSyncedResults();
      return { synced: data.synced_quizzes, xp: data.xp_awarded };
    }
  } catch (err) {
    console.warn("Background sync postponed, server unreachable:", err);
  }
  return null;
}
