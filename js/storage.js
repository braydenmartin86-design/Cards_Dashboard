// Persistence: storage keys, window.storage/localStorage abstraction, defaults.

const STORAGE_KEY = "cardflip_ev_portfolio_v1";
const POKEMON_STORAGE_KEY = "cardflip_ev_pokemon_v1";
const BUY_STORAGE_KEY = "cardflip_ev_buylist_v1";
const BOX_STORAGE_KEY = "cardflip_ev_boxbreaks_v1";
const TARGETS_STORAGE_KEY = "cardflip_ev_targets_v1";
const CONTENT_STORAGE_KEY = "cardflip_ev_content_v1";
const CONTENT_GOAL_STORAGE_KEY = "cardflip_ev_content_goal_v1";
const MANUAL_EXPENSES_STORAGE_KEY = "cardflip_ev_manual_expenses_v1";
const SAVED_SCANS_STORAGE_KEY = "cardflip_ev_saved_scans_v1";

// ===== Storage abstraction: Claude.ai artifact persistent storage when available (syncs
// per-user across every device/session automatically, no backend needed), falling back to
// plain localStorage if this file is ever downloaded and hosted as a standalone webpage —
// or, per Anthropic's own docs, while viewing an unpublished artifact in chat, since
// "storage operations will not succeed until the artifact is published."
//
// Every value is wrapped with a savedAt timestamp. This matters: without it, a read simply
// preferred whichever source answered (usually window.storage), even if that copy was older
// than what's in localStorage — e.g. a stale cloud snapshot from before a field existed, or
// an in-flight write that completed after a newer one. That's what caused avg fields and
// newly-won cards to silently revert. Now a read always keeps whichever copy has the newer
// timestamp, regardless of which source it came from or which write finished first.
//
// Writes to the same key are also serialized through a per-key queue, so two overlapping
// saves (e.g. winning a card, then immediately navigating away) can never resolve out of
// order and clobber each other.
const hasArtifactStorage = typeof window !== "undefined" && window.storage && typeof window.storage.get === "function";
const _writeQueues = {};

function unwrapEnvelope(parsed) {
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && "data" in parsed && "savedAt" in parsed) {
    return { data: parsed.data, savedAt: Number(parsed.savedAt) || 0 };
  }
  // Legacy value saved before this envelope existed — still usable, just always loses a
  // recency tie-break against anything saved after this fix, which is the safe default.
  return { data: parsed, savedAt: 0 };
}

// ===== Cloud sync (Supabase) =====
// When signed in, every key is also stored in the `app_data` table (one row per user + key),
// so all devices signed into the same account see the same data. Row-level security in
// Supabase restricts each row to its owner. Signed out, the app works exactly as before,
// from this browser's localStorage only.
const CLOUD_TABLE = "app_data";
const CLOUD_SYNCED_FLAG = "cardflip_ev_cloud_synced_";
const PRESYNC_BACKUP_KEY = "cardflip_ev_presync_backup_v1";

// What each key last held in storage, as JSON. storageSet skips writes that wouldn't change
// anything — otherwise every page load re-saves everything with a fresh savedAt, which makes
// a device's stale copy look "newest" and lets it overwrite newer data from another device.
const _lastPersisted = {};

// Status shown in the header's sync button: { state: "off" | "ok" | "error", message? }
let cloudSyncStatus = { state: "off" };
const _syncListeners = new Set();
function setCloudSyncStatus(status) {
  cloudSyncStatus = status;
  _syncListeners.forEach((fn) => fn(status));
}
function onCloudSyncStatus(fn) {
  _syncListeners.add(fn);
  return () => _syncListeners.delete(fn);
}

async function cloudUser() {
  if (!supabaseClient) return null;
  try {
    const { data } = await supabaseClient.auth.getSession();
    return data?.session?.user || null;
  } catch (e) {
    return null;
  }
}

async function cloudGet(key) {
  const { data, error } = await supabaseClient
    .from(CLOUD_TABLE)
    .select("data, saved_at")
    .eq("key", key)
    .maybeSingle();
  if (error) throw error;
  return data ? { data: data.data, savedAt: Number(data.saved_at) || 0 } : null;
}

async function cloudSet(key, envelope) {
  const { error } = await supabaseClient
    .from(CLOUD_TABLE)
    .upsert({ key, data: envelope.data, saved_at: envelope.savedAt }, { onConflict: "user_id,key" });
  if (error) throw error;
}

function isFirstCloudSync(user) {
  try {
    return !localStorage.getItem(CLOUD_SYNCED_FLAG + user.id);
  } catch (e) {
    return true;
  }
}

// Called once a full load has completed while signed in; from then on this device merges
// with the cloud by "newest wins" instead of deferring to the cloud copy.
async function markCloudSynced() {
  const user = await cloudUser();
  if (!user) return;
  try {
    localStorage.setItem(CLOUD_SYNCED_FLAG + user.id, String(Date.now()));
  } catch (e) {}
}

// Lists (cards, targets, box breaks…) are combined by item id: everything in the cloud, plus
// anything only this device has. Single values (e.g. the content goal) keep the cloud copy.
function mergeFirstSync(cloudData, localData) {
  if (localData == null) return cloudData;
  if (!Array.isArray(cloudData) || !Array.isArray(localData)) return cloudData;
  const cloudIds = new Set(cloudData.filter((i) => i && i.id != null).map((i) => i.id));
  const cloudJson = new Set(cloudData.map((i) => JSON.stringify(i)));
  const localOnly = localData.filter((i) =>
    i && i.id != null ? !cloudIds.has(i.id) : !cloudJson.has(JSON.stringify(i))
  );
  return [...cloudData, ...localOnly];
}

// Keeps whatever this browser had before its first sync replaced it, just in case.
function backupBeforeFirstSync(key, raw) {
  try {
    const backup = JSON.parse(localStorage.getItem(PRESYNC_BACKUP_KEY) || "{}");
    if (!(key in backup)) {
      backup[key] = raw;
      localStorage.setItem(PRESYNC_BACKUP_KEY, JSON.stringify(backup));
    }
  } catch (e) {}
}

async function storageGet(key) {
  let artifactEnv = null;
  let localEnv = null;
  let localRaw = null;

  if (hasArtifactStorage) {
    try {
      const result = await window.storage.get(key, false);
      if (result && result.value != null) artifactEnv = unwrapEnvelope(JSON.parse(result.value));
    } catch (e) {
      // Expected while unpublished/testing in chat, or on a plan without persistent storage.
    }
  }
  try {
    localRaw = localStorage.getItem(key);
    if (localRaw) localEnv = unwrapEnvelope(JSON.parse(localRaw));
  } catch (e) {
    console.error("localStorage read failed for", key, e);
  }

  let chosen = null;
  if (artifactEnv && localEnv) {
    chosen = artifactEnv.savedAt >= localEnv.savedAt ? artifactEnv : localEnv;
  } else {
    chosen = artifactEnv || localEnv;
  }

  const user = await cloudUser();
  if (user) {
    try {
      const cloudEnv = await cloudGet(key);
      let winner = null;
      if (cloudEnv && isFirstCloudSync(user)) {
        // First time this device syncs: combine instead of picking one side, so neither
        // laptop's entries are lost no matter which one signed in first.
        const merged = mergeFirstSync(cloudEnv.data, chosen ? chosen.data : null);
        if (JSON.stringify(merged) === JSON.stringify(cloudEnv.data)) {
          winner = cloudEnv;
        } else {
          winner = { data: merged, savedAt: Date.now() };
          await cloudSet(key, winner);
        }
        if (localRaw && chosen && JSON.stringify(chosen.data) !== JSON.stringify(winner.data)) {
          backupBeforeFirstSync(key, localRaw);
        }
      } else if (cloudEnv && (!chosen || cloudEnv.savedAt >= chosen.savedAt)) {
        winner = cloudEnv;
      } else if (chosen) {
        // This device has something newer than the cloud (or the cloud has nothing yet).
        await cloudSet(key, chosen);
      }
      if (winner) {
        // Mirror the cloud copy locally so this device also has it offline.
        chosen = winner;
        try {
          localStorage.setItem(key, JSON.stringify(winner));
        } catch (e) {}
      }
      setCloudSyncStatus({ state: "ok" });
    } catch (e) {
      console.warn("Cloud read failed for", key, e);
      setCloudSyncStatus({ state: "error", message: e.message || String(e) });
    }
  }

  if (!chosen) return null;
  _lastPersisted[key] = JSON.stringify(chosen.data);
  return chosen.data;
}

async function storageSet(key, value) {
  const valueJson = JSON.stringify(value);
  if (_lastPersisted[key] === valueJson) return true;
  _lastPersisted[key] = valueJson;

  const envelope = { data: value, savedAt: Date.now() };
  const payload = JSON.stringify(envelope);

  // Chain onto any write already in flight for this exact key, so writes complete strictly
  // in the order they were started rather than racing over the network.
  const prior = _writeQueues[key] || Promise.resolve();
  const next = prior
    .catch(() => {})
    .then(async () => {
      try {
        localStorage.setItem(key, payload);
      } catch (e) {
        console.error("localStorage write failed for", key, e);
      }
      if (hasArtifactStorage) {
        try {
          await window.storage.set(key, payload, false);
        } catch (e) {
          // Expected while unpublished/testing — the localStorage write above still covers it.
        }
      }
      if (await cloudUser()) {
        try {
          await cloudSet(key, envelope);
          setCloudSyncStatus({ state: "ok" });
        } catch (e) {
          console.warn("Cloud save failed for", key, e);
          setCloudSyncStatus({ state: "error", message: e.message || String(e) });
        }
      }
    });
  _writeQueues[key] = next;
  await next;
  return true;
}

// Starter data for a browser with nothing saved yet (and for "Reset list" on Monthly Targets).
// Empty means new users start with blank lists; add entries here to ship starter data.
const SEED_CARDS = [];
const SEED_POKEMON = [];
const SEED_TARGETS = [];

const DEFAULT_CARDS = () => SEED_CARDS.map((c, i) => ({ id: `seed-${i}`, ...c }));
const DEFAULT_POKEMON = () => SEED_POKEMON.map((c, i) => ({ id: `pkmn-seed-${i}`, ...c }));
const DEFAULT_TARGETS = () => SEED_TARGETS.map((t) => ({ ...t, id: crypto.randomUUID() }));
const DEFAULT_CONTENT_GOAL = { count: 1, period: "week" };
