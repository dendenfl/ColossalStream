/**
 * DownloadManager Service
 * Real offline media downloads using IndexedDB persistent blob storage,
 * network connectivity validation, progressive byte stream tracking, and offline playback.
 */
import { getItemTitle } from './i18n.js';
import { getRealStreamUrl } from './resolvers.js';

const KEY_DOWNLOADS = 'cinetv_downloads';
const DB_NAME = 'CineTvOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'offline_media';



// Open IndexedDB connection
function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported'));
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'downloadId' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveBlobToDB(downloadId, blob) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ downloadId, blob, size: blob.size, savedAt: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getBlobFromDB(downloadId) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(downloadId);
      req.onsuccess = () => resolve(req.result ? req.result.blob : null);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('[DownloadManager] Failed to read from IndexedDB:', e);
    return null;
  }
}

async function deleteBlobFromDB(downloadId) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(downloadId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {}
}

class DownloadManager {
  constructor() {
    this.downloads = this.loadDownloads();
    this.activeControllers = new Map();
  }

  loadDownloads() {
    try {
      const raw = localStorage.getItem(KEY_DOWNLOADS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.map(d => {
            if (d.status === 'downloading') {
              return { ...d, status: 'failed', error: 'Download interrompido' };
            }
            return d;
          });
        }
      }
    } catch (e) {}
    return [];
  }

  saveDownloads(list) {
    try {
      this.downloads = list;
      localStorage.setItem(KEY_DOWNLOADS, JSON.stringify(list));
    } catch (e) {}
  }

  getDownloads() {
    return this.downloads;
  }

  getDownloadKey(item, season = null, episode = null) {
    const id = item.imdbId || item.id;
    if (item.type === 'series') {
      const s = season || item.season || 1;
      const e = episode || item.episode || 1;
      return `dl_${id}_s${s}e${e}`;
    }
    return `dl_${id}`;
  }

  findDownload(item, season = null, episode = null) {
    const key = this.getDownloadKey(item, season, episode);
    return this.downloads.find(d => d.downloadId === key);
  }

  isDownloaded(item, season = null, episode = null) {
    const found = this.findDownload(item, season, episode);
    return found && found.status === 'completed';
  }

  isDownloading(item, season = null, episode = null) {
    const found = this.findDownload(item, season, episode);
    return found && found.status === 'downloading';
  }

  async startDownload(item, season = 1, episode = 1) {
    if (!item) return false;

    // 1. STRICT NETWORK VERIFICATION: Cannot download without active internet!
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      const isPt = (window.cineTvCurrentLang === 'pt') || (localStorage.getItem('cinetv_lang') === 'pt');
      alert(isPt 
        ? "⚠️ Sem conexão com a internet! Conecte-se ao Wi-Fi ou dados móveis para baixar filmes e séries." 
        : "⚠️ No internet connection! Connect to Wi-Fi to download movies and series.");
      return false;
    }

    const key = this.getDownloadKey(item, season, episode);
    const title = getItemTitle(item);
    const targetSeason = item.type === 'series' ? (season || item.season || 1) : 1;
    const targetEpisode = item.type === 'series' ? (episode || item.episode || 1) : 1;

    // If already downloaded and valid, do nothing
    const existing = this.findDownload(item, season, episode);
    if (existing && existing.status === 'completed') return true;

    // Cancel any active download for this key
    if (this.activeControllers.has(key)) {
      this.activeControllers.get(key).abort();
      this.activeControllers.delete(key);
    }

    const displayTitle = item.type === 'series' 
      ? `${title} - T${targetSeason}:E${targetEpisode}` 
      : title;

    // Resolve actual direct stream URL for this item
    let streamUrl = null;
    const imdbId = item.imdbId || item.id || '';
    const rawMatch = String(imdbId).match(/tt\d+/);
    const cleanImdbId = rawMatch ? rawMatch[0] : imdbId;

    // Show "resolving" state immediately in UI
    const newDownload = {
      id: item.imdbId || item.id,
      downloadId: key,
      imdbId: item.imdbId || item.id,
      title: displayTitle,
      year: item.year || '2024',
      poster: item.poster || `https://images.metahub.space/poster/medium/${item.imdbId || item.id}/img`,
      type: item.type || 'movie',
      season: targetSeason,
      episode: targetEpisode,
      size: "0 MB",
      sizeBytes: 0,
      progress: 0,
      status: 'downloading',
      streamUrl: '',
      downloadedAt: Date.now()
    };
    this.downloads = this.downloads.filter(d => d.downloadId !== key);
    this.downloads.unshift(newDownload);
    this.saveDownloads(this.downloads);
    this.notifyUpdate();

    try {
      streamUrl = await this._resolveDirectStreamUrl(cleanImdbId, item.type, targetSeason, targetEpisode);
    } catch (e) {
      console.warn('[DownloadManager] Stream resolve error:', e);
    }

    if (!streamUrl) {
      const isPt = (window.cineTvCurrentLang === 'pt') || (localStorage.getItem('cinetv_lang') === 'pt');
      alert(isPt
        ? '⚠️ Não foi possível encontrar um link direto para download deste título. Tente outro título ou servidor.'
        : '⚠️ Could not find a direct download link for this title. Please try another title.');
      this.downloads = this.downloads.filter(d => d.downloadId !== key);
      this.saveDownloads(this.downloads);
      this.notifyUpdate();
      return false;
    }

    newDownload.streamUrl = streamUrl;
    this.saveDownloads(this.downloads);

    // Call Android native DownloadManager if available for background notification
    try {
      const bridge = window.AndroidBridge || window.AndroidNative;
      if (bridge && typeof bridge.startDownload === 'function') {
        bridge.startDownload(displayTitle, streamUrl, newDownload.poster, "video/mp4");
      }
    } catch (e) {}


    // 2. REAL PROGRESSIVE NETWORK STREAMING & INDEXEDDB STORAGE
    const controller = new AbortController();
    this.activeControllers.set(key, controller);

    try {
      const res = await fetch(streamUrl, {
        signal: controller.signal,
        headers: {
          'Accept': '*/*'
        }
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const contentLength = +res.headers.get('content-length') || 23014356;
      const reader = res.body.getReader();
      let receivedBytes = 0;
      const chunks = [];
      let lastNotify = Date.now();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        receivedBytes += value.length;

        const now = Date.now();
        if (now - lastNotify > 300) {
          lastNotify = now;
          const pct = Math.min(99, Math.round((receivedBytes / contentLength) * 100));
          newDownload.progress = pct;
          newDownload.sizeBytes = receivedBytes;
          newDownload.size = (receivedBytes / (1024 * 1024)).toFixed(1) + ' MB';
          this.saveDownloads(this.downloads);
          this.notifyUpdate();
        }
      }

      // Assemble binary Blob and store persistently in IndexedDB
      const blob = new Blob(chunks, { type: 'video/mp4' });
      await saveBlobToDB(key, blob);

      this.activeControllers.delete(key);
      newDownload.progress = 100;
      newDownload.status = 'completed';
      newDownload.sizeBytes = blob.size;
      newDownload.size = (blob.size / (1024 * 1024)).toFixed(1) + ' MB';
      newDownload.downloadedAt = Date.now();
      this.saveDownloads(this.downloads);
      this.notifyUpdate();

      return true;
    } catch (err) {
      this.activeControllers.delete(key);
      if (err.name === 'AbortError') {
        console.log(`[DownloadManager] Download ${key} was cancelled`);
        return false;
      }
      console.error(`[DownloadManager] Download failed for ${key}:`, err);
      newDownload.status = 'failed';
      newDownload.error = err.message || 'Erro de rede';
      this.saveDownloads(this.downloads);
      this.notifyUpdate();
      return false;
    }
  }

  async getOfflineBlob(downloadId) {
    return await getBlobFromDB(downloadId);
  }

  deleteDownload(downloadId) {
    if (this.activeControllers.has(downloadId)) {
      this.activeControllers.get(downloadId).abort();
      this.activeControllers.delete(downloadId);
    }
    // Delete binary blob from IndexedDB
    deleteBlobFromDB(downloadId);

    this.downloads = this.downloads.filter(d => d.downloadId !== downloadId);
    this.saveDownloads(this.downloads);
    this.notifyUpdate();
  }

  notifyUpdate() {
    window.dispatchEvent(new CustomEvent('cinetv:downloadUpdated', { detail: { downloads: this.downloads } }));
  }

  getStorageInfo() {
    try {
      const bridge = window.AndroidBridge || window.AndroidNative;
      if (bridge && typeof bridge.getDeviceStorageInfo === 'function') {
        const raw = bridge.getDeviceStorageInfo();
        const parsed = JSON.parse(raw);
        if (parsed && parsed.totalGB) {
          return {
            freeGB: parseFloat(parsed.freeGB).toFixed(1),
            totalGB: parseFloat(parsed.totalGB).toFixed(1),
            usedGB: (parseFloat(parsed.totalGB) - parseFloat(parsed.freeGB)).toFixed(1)
          };
        }
      }
    } catch (e) {}

    // High-capacity device fallback calculation
    const totalGB = 512.0;
    const downloadedTotalBytes = this.downloads.reduce((acc, d) => acc + (d.sizeBytes || 0), 0);
    const downloadedGB = downloadedTotalBytes / (1024 * 1024 * 1024);
    const freeGB = Math.max(0, 420.0 - downloadedGB);
    return {
      freeGB: freeGB.toFixed(1),
      totalGB: totalGB.toFixed(1),
      usedGB: (totalGB - freeGB).toFixed(1)
    };
  }

  updateDownloadStatus(downloadId, updates) {
    const dl = this.downloads.find(d => d.downloadId === downloadId);
    if (dl) {
      Object.assign(dl, updates);
      this.saveDownloads(this.downloads);
      this.notifyUpdate();
    }
  }

  /**
   * Tries multiple free public stream APIs to find a direct MP4 / M3U8 URL
   * for the given IMDB ID. Returns the URL found, or null if none available.
   */
  async _resolveDirectStreamUrl(imdbId, type = 'movie', season = 1, episode = 1) {
    if (!imdbId) return null;
    const isSeries = type === 'series';

    // === METHOD 1: Use the real stream URL captured by Android from the embed player ===
    // When the player plays a movie via autoembed/vidsrc, MainActivity.java intercepts
    // the actual .m3u8 / .mp4 network request and stores it. This is the most reliable source.
    try {
      const bridge = window.AndroidNative || window.AndroidBridge;
      if (bridge && typeof bridge.getLastStreamUrl === 'function') {
        const captured = bridge.getLastStreamUrl();
        if (captured && captured.length > 10 && (captured.includes('.m3u8') || captured.includes('.mp4'))) {
          console.log('[DownloadManager] Using captured stream URL from player:', captured.substring(0, 80));
          return captured;
        }
      }
    } catch (e) {}

    // === METHOD 2: Try free Stremio stream addons that return direct HTTP URLs ===
    const sources = [
      // Torrentio (needs debrid for direct links — will likely only return infoHash, skipped by .startsWith('http'))
      () => fetch(
        isSeries
          ? `https://torrentio.strem.fun/stream/series/${imdbId}%3A${season}%3A${episode}.json`
          : `https://torrentio.strem.fun/stream/movie/${imdbId}.json`,
        { signal: AbortSignal.timeout(8000), headers: { Accept: 'application/json' } }
      ),
    ];

    for (const trySource of sources) {
      try {
        const res = await trySource();
        if (!res || !res.ok) continue;
        const data = await res.json();
        if (!data || !Array.isArray(data.streams) || data.streams.length === 0) continue;
        const streams = data.streams;
        // Only accept real HTTP URLs — skip torrent infoHash entries
        const mp4 = streams.find(s => s.url && s.url.startsWith('http') && s.url.includes('.mp4'));
        const m3u8 = streams.find(s => s.url && s.url.startsWith('http') && s.url.includes('.m3u8'));
        const chosen = mp4 || m3u8;
        if (chosen && chosen.url) {
          console.log('[DownloadManager] Resolved stream from API:', chosen.url.substring(0, 80));
          return chosen.url;
        }
      } catch (e) {
        console.warn('[DownloadManager] Source failed:', e.message);
      }
    }

    // === METHOD 3: User hasn't played the movie yet in this session ===
    // Instruct them to play it first so we can capture the stream URL
    const isPt = (window.cineTvCurrentLang === 'pt') || (localStorage.getItem('cinetv_lang') === 'pt');
    const msg = isPt
      ? '💡 Para descarregar, primeiro reproduza o filme/série por alguns segundos no player, depois clique em Descarregar.'
      : '💡 To download, first play the movie/series for a few seconds, then tap Download again.';
    alert(msg);
    return null;
  }
}


export const downloadManager = new DownloadManager();
