import { describe, expect, it, vi } from "vitest";
import { CABINET_BACKUP_KEY, CABINET_STORAGE_KEY, MAX_RECENT, createCabinetStore, parseCabinet } from "@/lib/storage";

/** A minimal in-memory Storage with switchable failure modes. */
function memoryStorage({ failWrites = false } = {}): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => void data.delete(key),
    setItem: (key, value) => {
      if (failWrites) throw new DOMException("Quota exceeded", "QuotaExceededError");
      data.set(key, value);
    },
  };
}

let clock = 0;
const now = () => new Date(Date.UTC(2026, 9, 11, 12, 0, clock++)).toISOString();

describe("cabinet store", () => {
  it("starts empty and ready with fresh storage", () => {
    const store = createCabinetStore({ getStorage: () => memoryStorage(), now });
    expect(store.getSnapshot().status).toBe("ready");
    expect(store.getSnapshot().data.artifacts).toEqual([]);
  });

  it("serves a stable 'pending' snapshot for server rendering", () => {
    const store = createCabinetStore({ getStorage: () => memoryStorage(), now });
    expect(store.getServerSnapshot()).toBe(store.getServerSnapshot());
    expect(store.getServerSnapshot().status).toBe("pending");
  });

  it("saves and removes artifacts, persisting to storage", () => {
    const storage = memoryStorage();
    const store = createCabinetStore({ getStorage: () => storage, now });
    expect(store.toggleArtifact("DC-2442-CD")).toMatchObject({ saved: true, persisted: true });
    expect(store.isArtifactSaved("DC-2442-CD")).toBe(true);
    expect(JSON.parse(storage.getItem(CABINET_STORAGE_KEY)!).artifacts[0].id).toBe("DC-2442-CD");

    // A second store reading the same storage sees the saved item (persistence across reloads).
    const reloaded = createCabinetStore({ getStorage: () => storage, now });
    expect(reloaded.isArtifactSaved("DC-2442-CD")).toBe(true);

    expect(store.toggleArtifact("DC-2442-CD")).toMatchObject({ saved: false, persisted: true });
    expect(store.isArtifactSaved("DC-2442-CD")).toBe(false);
  });

  it("saves and removes collections independently", () => {
    const store = createCabinetStore({ getStorage: () => memoryStorage(), now });
    store.toggleCollection("COL-01");
    store.toggleArtifact("OB-2112-BO");
    expect(store.isCollectionSaved("COL-01")).toBe(true);
    store.removeCollection("COL-01");
    expect(store.isCollectionSaved("COL-01")).toBe(false);
    expect(store.isArtifactSaved("OB-2112-BO")).toBe(true);
  });

  it("records recently viewed items most-recent-first, de-duplicated and capped", () => {
    const store = createCabinetStore({ getStorage: () => memoryStorage(), now });
    for (let i = 1; i <= MAX_RECENT + 3; i++) store.recordView(`ID-${i}`);
    store.recordView("ID-5");
    const recent = store.getSnapshot().data.recent.map((e) => e.id);
    expect(recent).toHaveLength(MAX_RECENT);
    expect(recent[0]).toBe("ID-5");
    expect(new Set(recent).size).toBe(recent.length);
  });

  it("notifies subscribers and returns a new snapshot only on change", () => {
    const store = createCabinetStore({ getStorage: () => memoryStorage(), now });
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    const before = store.getSnapshot();
    expect(store.getSnapshot()).toBe(before);
    store.toggleArtifact("PL-0880-LP");
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot()).not.toBe(before);
    unsubscribe();
    store.toggleArtifact("PL-0880-LP");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("recovers from corrupted JSON, keeping a backup", () => {
    const storage = memoryStorage();
    storage.setItem(CABINET_STORAGE_KEY, "{not json");
    const store = createCabinetStore({ getStorage: () => storage, now });
    const snapshot = store.getSnapshot();
    expect(snapshot.status).toBe("recovered");
    expect(snapshot.data.artifacts).toEqual([]);
    expect(storage.getItem(CABINET_BACKUP_KEY)).toBe("{not json");
    expect(storage.getItem(CABINET_STORAGE_KEY)).toBeNull();
    store.acknowledgeRecovery();
    expect(store.getSnapshot().status).toBe("ready");
  });

  it("rejects well-formed JSON with the wrong shape", () => {
    expect(parseCabinet(JSON.stringify({ version: 2, artifacts: [], collections: [], recent: [] }))).toBeNull();
    expect(parseCabinet(JSON.stringify({ version: 1, artifacts: "nope", collections: [], recent: [] }))).toBeNull();
    expect(parseCabinet(JSON.stringify({ version: 1, artifacts: [{ id: "" , at: "x" }], collections: [], recent: [] }))).toBeNull();
  });

  it("de-duplicates entries when reading stored data", () => {
    const raw = JSON.stringify({
      version: 1,
      artifacts: [
        { id: "A", at: "1" },
        { id: "A", at: "2" },
      ],
      collections: [],
      recent: [],
    });
    expect(parseCabinet(raw)?.artifacts).toEqual([{ id: "A", at: "1" }]);
  });

  it("keeps working in memory when storage is unavailable, and says so", () => {
    const store = createCabinetStore({
      getStorage: () => {
        throw new DOMException("Blocked", "SecurityError");
      },
      now,
    });
    expect(store.getSnapshot().status).toBe("unavailable");
    expect(store.toggleArtifact("EV-1991-VE")).toMatchObject({ saved: true, persisted: false });
    expect(store.isArtifactSaved("EV-1991-VE")).toBe(true);
  });

  it("reports failed writes (for example a full quota) as not persisted", () => {
    const store = createCabinetStore({ getStorage: () => memoryStorage({ failWrites: true }), now });
    expect(store.toggleArtifact("SG-2332-GS")).toMatchObject({ saved: true, persisted: false });
    expect(store.getSnapshot().status).toBe("unavailable");
  });

  it("clears everything", () => {
    const storage = memoryStorage();
    const store = createCabinetStore({ getStorage: () => storage, now });
    store.toggleArtifact("A");
    store.toggleCollection("B");
    store.recordView("C");
    store.clearAll();
    expect(store.getSnapshot().data).toEqual({ version: 1, artifacts: [], collections: [], recent: [] });
    expect(JSON.parse(storage.getItem(CABINET_STORAGE_KEY)!).artifacts).toEqual([]);
  });
});
