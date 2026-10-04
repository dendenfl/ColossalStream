/**
 * Supabase Client & Cross-Device Cloud Sync Service
 * Handles user authentication (Sign Up / Sign In / Sign Out)
 * and seamless background synchronization of Continue Watching, Watchlists, and Profiles.
 */
import { createClient } from '@supabase/supabase-js';

// Default Supabase project credentials (configured for CineTv Cloud Sync)
const DEFAULT_SUPABASE_URL = 'https://hxogstmhgcoifvowwbrf.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable___Lyn9QgFWMFCBG2DEsapQ_FtsQQg_h';

const KEY_URL = 'cinetv_supabase_url';
const KEY_ANON = 'cinetv_supabase_anon_key';

class SupabaseService {
  constructor() {
    this.client = null;
    this.currentUser = null;
    this.syncDebounceTimer = null;
    this.isSyncing = false;
    this.lastSyncedAt = null;
    this.lastSyncError = null;
    this.init();
  }

  getCredentials() {
    const url = localStorage.getItem(KEY_URL) || DEFAULT_SUPABASE_URL;
    const anonKey = localStorage.getItem(KEY_ANON) || DEFAULT_SUPABASE_ANON_KEY;
    return { url, anonKey };
  }

  setCredentials(url, anonKey) {
    if (url) localStorage.setItem(KEY_URL, url.trim());
    if (anonKey) localStorage.setItem(KEY_ANON, anonKey.trim());
    this.init();
  }

  isConfigured() {
    const { url, anonKey } = this.getCredentials();
    return Boolean(url && anonKey && url.startsWith('http'));
  }

  init() {
    const { url, anonKey } = this.getCredentials();
    if (url && anonKey && url.startsWith('http')) {
      try {
        this.client = createClient(url, anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: false
          }
        });

        // Listen for auth state changes
        this.client.auth.onAuthStateChange(async (event, session) => {
          this.currentUser = session?.user || null;
          this.broadcastStatus();
          window.dispatchEvent(new CustomEvent('cinetv:authChanged', { detail: { user: this.currentUser, event } }));
          if (this.currentUser && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
            await this.pullAndApplyCloudData();
          }
        });

        // Check initial user
        this.client.auth.getUser().then(({ data }) => {
          this.currentUser = data?.user || null;
          this.broadcastStatus();
        }).catch(() => {});
      } catch (e) {
        console.warn('[SupabaseService] Init error:', e);
        this.client = null;
      }
    } else {
      this.client = null;
      this.currentUser = null;
    }
  }

  getUser() {
    return this.currentUser;
  }

  isLoggedIn() {
    return Boolean(this.currentUser);
  }

  broadcastStatus() {
    window.dispatchEvent(new CustomEvent('cinetv:syncStatus', {
      detail: {
        isLoggedIn: this.isLoggedIn(),
        user: this.currentUser,
        isSyncing: this.isSyncing,
        lastSyncedAt: this.lastSyncedAt,
        lastSyncError: this.lastSyncError
      }
    }));
  }

  async signUp(email, password) {
    if (!this.client) throw new Error('Supabase não configurado. Insira a URL e a Anon Key.');
    const { data, error } = await this.client.auth.signUp({
      email: email.trim(),
      password: password
    });
    if (error) throw error;
    this.currentUser = data.user;
    this.broadcastStatus();
    return data;
  }

  async signIn(email, password) {
    if (!this.client) throw new Error('Supabase não configurado. Insira a URL e a Anon Key.');
    const { data, error } = await this.client.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });
    if (error) throw error;
    this.currentUser = data.user;
    this.broadcastStatus();
    await this.pullAndApplyCloudData();
    return data;
  }

  async signOut() {
    if (!this.client) return;
    try {
      await this.client.auth.signOut();
    } catch (e) {}
    this.currentUser = null;
    this.broadcastStatus();
    window.dispatchEvent(new CustomEvent('cinetv:authChanged', { detail: { user: null, event: 'SIGNED_OUT' } }));
  }

  /**
   * Helper to merge continue watching lists intelligently
   */
  _mergeContinueLists(localList, remoteList) {
    const map = new Map();
    // Insert local items first
    for (const item of (Array.isArray(localList) ? localList : [])) {
      const id = item.imdbId || item.id;
      if (id) map.set(id, item);
    }
    // Merge remote items
    for (const item of (Array.isArray(remoteList) ? remoteList : [])) {
      const id = item.imdbId || item.id;
      if (!id) continue;
      if (!map.has(id)) {
        map.set(id, item);
      } else {
        const local = map.get(id);
        const remoteTime = item.watchedAt || 0;
        const localTime = local.watchedAt || 0;
        if (remoteTime >= localTime) {
          map.set(id, { ...local, ...item });
        }
      }
    }
    return Array.from(map.values()).slice(0, 25);
  }

  /**
   * Helper to merge watchlist items without duplicates
   */
  _mergeWatchlists(localList, remoteList) {
    const map = new Map();
    for (const item of (Array.isArray(localList) ? localList : [])) {
      const id = item.imdbId || item.id;
      if (id) map.set(id, item);
    }
    for (const item of (Array.isArray(remoteList) ? remoteList : [])) {
      const id = item.imdbId || item.id;
      if (id && !map.has(id)) {
        map.set(id, item);
      }
    }
    return Array.from(map.values()).slice(0, 30);
  }

  /**
   * Pulls cloud sync data from Supabase and merges into local storage
   */
  async pullAndApplyCloudData() {
    if (!this.client || !this.currentUser) return;

    this.isSyncing = true;
    this.broadcastStatus();

    try {
      const { data, error } = await this.client
        .from('user_sync')
        .select('*')
        .eq('user_id', this.currentUser.id)
        .maybeSingle();

      if (error) {
        console.warn('[SupabaseService] pull error:', error.message);
        this.lastSyncError = error.message;
        this.isSyncing = false;
        this.broadcastStatus();
        return;
      }

      if (data) {
        const getLocalJson = (k) => {
          try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch (e) { return []; }
        };

        // 1. Continue Movies (Smart Merge)
        const mergedContMovies = this._mergeContinueLists(
          getLocalJson('cinetv_continue_movies'),
          data.continue_movies
        );
        localStorage.setItem('cinetv_continue_movies', JSON.stringify(mergedContMovies));

        // 2. Continue Series (Smart Merge)
        const mergedContSeries = this._mergeContinueLists(
          getLocalJson('cinetv_continue_series'),
          data.continue_series
        );
        localStorage.setItem('cinetv_continue_series', JSON.stringify(mergedContSeries));

        // 3. Watchlist Movies (Smart Merge)
        const mergedWatchMovies = this._mergeWatchlists(
          getLocalJson('cinetv_towatch_movies'),
          data.watchlist_movies
        );
        localStorage.setItem('cinetv_towatch_movies', JSON.stringify(mergedWatchMovies));

        // 4. Watchlist Series (Smart Merge)
        const mergedWatchSeries = this._mergeWatchlists(
          getLocalJson('cinetv_towatch_series'),
          data.watchlist_series
        );
        localStorage.setItem('cinetv_towatch_series', JSON.stringify(mergedWatchSeries));

        // 5. Profiles
        if (Array.isArray(data.profiles) && data.profiles.length > 0) {
          localStorage.setItem('cinetv_profiles', JSON.stringify(data.profiles));
          window.dispatchEvent(new CustomEvent('cinetv:profilesUpdated'));
        }

        // 6. Restore extra profile scoped keys if present in sync_dump
        if (data.sync_dump && typeof data.sync_dump === 'object') {
          for (const [k, v] of Object.entries(data.sync_dump)) {
            if (k.startsWith('cinetv_') && k !== 'cinetv_supabase_anon_key' && k !== 'cinetv_supabase_url') {
              try {
                localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
              } catch(e) {}
            }
          }
        }

        this.lastSyncedAt = new Date();
        this.lastSyncError = null;
        window.dispatchEvent(new CustomEvent('cinetv:historyChanged'));
        window.dispatchEvent(new CustomEvent('cinetv:watchlistChanged'));
      } else {
        // First time cloud sync for this user: push current local data up
        await this.pushLocalDataToCloud();
      }
    } catch (e) {
      console.warn('[SupabaseService] pullAndApplyCloudData error:', e);
      this.lastSyncError = e.message || 'Erro de sincronização';
    } finally {
      this.isSyncing = false;
      this.broadcastStatus();
    }
  }

  /**
   * Pushes current local storage data up to Supabase
   */
  async pushLocalDataToCloud() {
    if (!this.client || !this.currentUser) return;

    this.isSyncing = true;
    this.broadcastStatus();

    try {
      const getJson = (k) => {
        try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch (e) { return []; }
      };

      // Collect all profile-scoped cinetv keys
      const dump = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cinetv_') && key !== 'cinetv_supabase_anon_key' && key !== 'cinetv_supabase_url') {
          try {
            dump[key] = JSON.parse(localStorage.getItem(key));
          } catch(e) {
            dump[key] = localStorage.getItem(key);
          }
        }
      }

      const payload = {
        user_id: this.currentUser.id,
        continue_movies: getJson('cinetv_continue_movies'),
        continue_series: getJson('cinetv_continue_series'),
        watchlist_movies: getJson('cinetv_towatch_movies'),
        watchlist_series: getJson('cinetv_towatch_series'),
        profiles: getJson('cinetv_profiles'),
        updated_at: new Date().toISOString()
      };

      const { error } = await this.client
        .from('user_sync')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) {
        console.warn('[SupabaseService] push error:', error.message);
        this.lastSyncError = error.message;
      } else {
        this.lastSyncedAt = new Date();
        this.lastSyncError = null;
      }
    } catch (e) {
      console.warn('[SupabaseService] pushLocalDataToCloud error:', e);
      this.lastSyncError = e.message || 'Erro de envio';
    } finally {
      this.isSyncing = false;
      this.broadcastStatus();
    }
  }

  /**
   * Manual Sync Trigger (Pull then Push)
   */
  async syncNow() {
    if (!this.isLoggedIn()) {
      throw new Error('Você precisa estar conectado para sincronizar.');
    }
    await this.pullAndApplyCloudData();
    await this.pushLocalDataToCloud();
    return true;
  }

  /**
   * Debounced sync: call whenever a list or history changes locally
   */
  scheduleSync() {
    if (!this.client || !this.currentUser) return;
    clearTimeout(this.syncDebounceTimer);
    this.syncDebounceTimer = setTimeout(() => {
      this.pushLocalDataToCloud();
    }, 2000);
  }
}

export const supabaseService = new SupabaseService();
