import * as z from "zod/mini";

/**
 * The personal cabinet's storage layer: a tiny external store over localStorage.
 *
 * - Data is validated with Zod on every read; corrupted payloads are backed up and reset.
 * - When storage is unavailable (private mode, blocked cookies, quota), the store keeps working in
 *   memory and reports `status: "unavailable"` so the UI can say so honestly.
 * - Designed for React's useSyncExternalStore: snapshots are immutable and only replaced on change.
 */

export const CABINET_STORAGE_KEY = "palindrome.cabinet.v1";
export const CABINET_BACKUP_KEY = `${CABINET_STORAGE_KEY}.corrupt`;
export const MAX_RECENT = 8;

const entrySchema = z.object({
  id: z.string().check(z.minLength(1), z.maxLength(64)),
  at: z.string().check(z.minLength(1), z.maxLength(40)),
});

const cabinetSchema = z.object({
  version: z.literal(1),
  artifacts: z.array(entrySchema),
  collections: z.array(entrySchema),
  recent: z.array(entrySchema),
});

export type CabinetEntry = z.infer<typeof entrySchema>;
export type CabinetData = z.infer<typeof cabinetSchema>;
export type StorageStatus = "pending" | "ready" | "recovered" | "unavailable";

export interface CabinetSnapshot {
  data: CabinetData;
  status: StorageStatus;
}

export interface CommitResult {
  /** Whether the change reached persistent storage (false means it lives in memory only). */
  persisted: boolean;
}

export const EMPTY_CABINET: CabinetData = Object.freeze({
  version: 1,
  artifacts: [],
  collections: [],
  recent: [],
}) as CabinetData;

const SERVER_SNAPSHOT: CabinetSnapshot = Object.freeze({ data: EMPTY_CABINET, status: "pending" });

function uniqueById(entries: CabinetEntry[]): CabinetEntry[] {
  const seen = new Set<string>();
  return entries.filter((entry) => (seen.has(entry.id) ? false : (seen.add(entry.id), true)));
}

function normalizeData(data: CabinetData): CabinetData {
  return {
    version: 1,
    artifacts: uniqueById(data.artifacts),
    collections: uniqueById(data.collections),
    recent: uniqueById(data.recent).slice(0, MAX_RECENT),
  };
}

/** Parse a raw stored string. Returns null when the payload is unreadable or invalid. */
export function parseCabinet(raw: string): CabinetData | null {
  try {
    const result = cabinetSchema.safeParse(JSON.parse(raw));
    return result.success ? normalizeData(result.data) : null;
  } catch {
    return null;
  }
}

export interface CabinetStoreOptions {
  getStorage: () => Storage | null;
  now?: () => string;
}

export function createCabinetStore({ getStorage, now = () => new Date().toISOString() }: CabinetStoreOptions) {
  let snapshot: CabinetSnapshot | null = null;
  const listeners = new Set<() => void>();

  const safeStorage = (): Storage | null => {
    try {
      return getStorage();
    } catch {
      return null;
    }
  };

  function read(): CabinetSnapshot {
    const storage = safeStorage();
    if (!storage) return { data: EMPTY_CABINET, status: "unavailable" };

    let raw: string | null;
    try {
      raw = storage.getItem(CABINET_STORAGE_KEY);
    } catch {
      return { data: EMPTY_CABINET, status: "unavailable" };
    }
    if (raw === null) return { data: EMPTY_CABINET, status: "ready" };

    const data = parseCabinet(raw);
    if (data) return { data, status: "ready" };

    // Corrupted payload: keep a copy for inspection, then start again from empty.
    try {
      storage.setItem(CABINET_BACKUP_KEY, raw);
      storage.removeItem(CABINET_STORAGE_KEY);
    } catch {
      /* best effort */
    }
    return { data: EMPTY_CABINET, status: "recovered" };
  }

  function current(): CabinetSnapshot {
    if (!snapshot) snapshot = read();
    return snapshot;
  }

  function emit() {
    for (const listener of listeners) listener();
  }

  function commit(data: CabinetData): CommitResult {
    const previous = current();
    let persisted = false;
    if (previous.status !== "unavailable") {
      const storage = safeStorage();
      try {
        if (storage) {
          storage.setItem(CABINET_STORAGE_KEY, JSON.stringify(data));
          persisted = true;
        }
      } catch {
        persisted = false;
      }
    }
    const status: StorageStatus = persisted
      ? previous.status === "recovered"
        ? "recovered"
        : "ready"
      : "unavailable";
    snapshot = { data, status };
    emit();
    return { persisted };
  }

  function onStorageEvent(event: StorageEvent) {
    if (event.key === null || event.key === CABINET_STORAGE_KEY) {
      snapshot = read();
      emit();
    }
  }

  const has = (list: CabinetEntry[], id: string) => list.some((entry) => entry.id === id);

  return {
    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      if (listeners.size === 1 && typeof window !== "undefined") {
        window.addEventListener("storage", onStorageEvent);
      }
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0 && typeof window !== "undefined") {
          window.removeEventListener("storage", onStorageEvent);
        }
      };
    },

    getSnapshot: current,

    getServerSnapshot(): CabinetSnapshot {
      return SERVER_SNAPSHOT;
    },

    isArtifactSaved(id: string): boolean {
      return has(current().data.artifacts, id);
    },

    isCollectionSaved(id: string): boolean {
      return has(current().data.collections, id);
    },

    toggleArtifact(id: string): CommitResult & { saved: boolean } {
      const { data } = current();
      const saved = !has(data.artifacts, id);
      const artifacts = saved ? [{ id, at: now() }, ...data.artifacts] : data.artifacts.filter((e) => e.id !== id);
      return { ...commit({ ...data, artifacts }), saved };
    },

    removeArtifact(id: string): CommitResult {
      const { data } = current();
      return commit({ ...data, artifacts: data.artifacts.filter((e) => e.id !== id) });
    },

    toggleCollection(id: string): CommitResult & { saved: boolean } {
      const { data } = current();
      const saved = !has(data.collections, id);
      const collections = saved
        ? [{ id, at: now() }, ...data.collections]
        : data.collections.filter((e) => e.id !== id);
      return { ...commit({ ...data, collections }), saved };
    },

    removeCollection(id: string): CommitResult {
      const { data } = current();
      return commit({ ...data, collections: data.collections.filter((e) => e.id !== id) });
    },

    recordView(id: string): CommitResult {
      const { data } = current();
      if (data.recent[0]?.id === id) return { persisted: current().status !== "unavailable" };
      const recent = [{ id, at: now() }, ...data.recent.filter((e) => e.id !== id)].slice(0, MAX_RECENT);
      return commit({ ...data, recent });
    },

    clearRecent(): CommitResult {
      const { data } = current();
      return commit({ ...data, recent: [] });
    },

    clearAll(): CommitResult {
      return commit({ version: 1, artifacts: [], collections: [], recent: [] });
    },

    /** Mark a recovered-from-corruption notice as read. */
    acknowledgeRecovery(): void {
      const state = current();
      if (state.status === "recovered") {
        snapshot = { ...state, status: "ready" };
        emit();
      }
    },
  };
}

export type CabinetStore = ReturnType<typeof createCabinetStore>;
