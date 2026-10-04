/**
 * Local Storage Engine for:
 * 1. Continue Watching (Movies & Series with current season/episode)
 * 2. To Watch / Watchlist (Movies & Series)
 */

import { profileService } from './profiles.js';
import { supabaseService } from './supabase.js';

const KEY_CONTINUE_MOVIES = 'cinetv_continue_movies';
const KEY_CONTINUE_SERIES = 'cinetv_continue_series';
const KEY_TOWATCH_MOVIES = 'cinetv_towatch_movies';
const KEY_TOWATCH_SERIES = 'cinetv_towatch_series';
const KEY_WATCHED_ITEMS = 'cinetv_watched_items';
const KEY_WATCHED_EPISODES = 'cinetv_watched_episodes';

const getScoped = (baseKey) => profileService.getScopedKey(baseKey);

// Empty starters so Continue Watching & Watchlists reflect real user actions
const STARTER_CONTINUE_MOVIES = [];
const STARTER_CONTINUE_SERIES = [];
const STARTER_TOWATCH_MOVIES = [];
const STARTER_TOWATCH_SERIES = [];

export function isSeriesItem(item) {
  if (!item) return false;
  return item.type === 'series' || 
         item.type === 'tv' || 
         Boolean(item.totalSeasons || item.seasonEpisodes || item.seasonsMap || (item.season && item.episode));
}

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Only filter legacy unplayed starter items from continue watching keys, NEVER from towatch/watchlist!
        const isContinueKey = typeof key === 'string' && key.includes('continue');
        const cleaned = parsed.filter(item => {
          if (!item) return false;
          if (isContinueKey) {
            const starterIds = ['tt15435876', 'tt11126994', 'tt2788316', 'tt1190634', 'tt6263850', 'tt18411490'];
            if (starterIds.includes(item.id || item.imdbId)) {
              return Boolean(item.watchedAt || (item.currentTime && item.currentTime > 0));
            }
          }
          return true;
        });
        cleaned.forEach(item => {
          if (item.imdbId === 'tt12455644' || item.id === 'tt12455644') {
            item.id = 'tt13622970';
            item.imdbId = 'tt13622970';
          }
          if (item.imdbId === 'tt15474916' || item.id === 'tt15474916') {
            item.id = 'tt15435876';
            item.imdbId = 'tt15435876';
          }
          const imdbId = item.imdbId || item.id;
          if (imdbId) {
            item.poster = `https://images.metahub.space/poster/medium/${imdbId}/img`;
            item.backdrop = `https://images.metahub.space/background/medium/${imdbId}/img`;
          }
        });
        return cleaned;
      }
    }
  } catch (e) {}
  return fallback;
}

function saveJson(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {}
}

export function getContinueWatching(type = 'movie') {
  const isPrimary = profileService.getActiveProfile()?.id === 'profile_primary';
  const baseKey = type === 'movie' ? KEY_CONTINUE_MOVIES : KEY_CONTINUE_SERIES;
  const starters = isPrimary ? (type === 'movie' ? STARTER_CONTINUE_MOVIES : STARTER_CONTINUE_SERIES) : [];
  const list = loadJson(getScoped(baseKey), starters);
  const watchedIds = new Set(getWatchedItems());
  return list.filter(item => {
    const id = item.imdbId || item.id;
    return !watchedIds.has(id);
  });
}

export function formatTimestamp(totalSeconds) {
  const sec = Math.max(0, Math.round(totalSeconds || 0));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) {
    return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export function getItemProgress(item, season = null, episode = null) {
  if (!item) return null;
  const isSeries = isSeriesItem(item);
  const list = getContinueWatching(isSeries ? 'series' : 'movie');
  const id = item.imdbId || item.id;
  const found = list.find(i => (i.imdbId || i.id) === id);
  if (!found) return null;

  if (isSeries && season !== null && episode !== null) {
    // Check if progress matches this specific episode
    if (Number(found.season) !== Number(season) || Number(found.episode) !== Number(episode)) {
      // Different episode: check if episodeProgress map exists
      const epData = found.episodesProgress && (found.episodesProgress[`${season}:${episode}`] || found.episodesProgress[`${Number(season)}:${Number(episode)}`]);
      if (epData && epData.currentTime > 15) {
        if (epData.duration > 60 && (epData.currentTime >= epData.duration * 0.93 || epData.duration - epData.currentTime <= 25)) {
          return null;
        }
        return epData;
      }
      return null;
    }
  }

  if (found.currentTime && found.currentTime > 15) {
    // If finished (>93% or within 25 seconds of end), treat as finished (start fresh)
    if (found.duration > 60 && (found.currentTime >= found.duration * 0.93 || found.duration - found.currentTime <= 25)) {
      return null;
    }
    return {
      currentTime: found.currentTime,
      duration: found.duration || 0,
      formattedTime: formatTimestamp(found.currentTime),
      percentage: found.duration ? Math.min(100, Math.round((found.currentTime / found.duration) * 100)) : 0
    };
  }
  return null;
}

export function getResumeState(item) {
  if (!item) return null;
  const isSeries = isSeriesItem(item);
  const list = getContinueWatching(isSeries ? 'series' : 'movie');
  const id = item.imdbId || item.id;
  const found = list.find(i => (i.imdbId || i.id) === id);
  if (!found) return null;

  const cur = found.currentTime || 0;
  const dur = found.duration || (isSeries ? 2700 : 7200);
  if (dur > 60 && (cur >= dur * 0.93 || dur - cur <= 25)) {
    return null;
  }
  const percentage = dur > 0 ? Math.min(100, Math.round((cur / dur) * 100)) : 0;
  return {
    currentTime: cur,
    duration: dur,
    formattedTime: formatTimestamp(cur),
    percentage: percentage
  };
}

export function saveContinueWatching(item, season = 1, episode = 1, currentTime = 0, duration = 0) {
  if (!item) return;
  const isSeries = isSeriesItem(item);
  const baseKey = isSeries ? KEY_CONTINUE_SERIES : KEY_CONTINUE_MOVIES;
  const key = getScoped(baseKey);
  const isPrimary = profileService.getActiveProfile()?.id === 'profile_primary';
  const starters = isPrimary ? (isSeries ? STARTER_CONTINUE_SERIES : STARTER_CONTINUE_MOVIES) : [];
  const list = loadJson(key, starters);

  const id = item.imdbId || item.id;
  const existingIdx = list.findIndex(i => (i.imdbId || i.id) === id);
  const existing = existingIdx >= 0 ? list[existingIdx] : null;

  const targetSeason = isSeries ? (season || item.season || 1) : undefined;
  const targetEpisode = isSeries ? (episode || item.episode || 1) : undefined;

  let progressMap = (existing && existing.episodesProgress) ? { ...existing.episodesProgress } : {};

  // Preserve existing time if not supplied in this call, unless switching to a different episode
  const episodeChanged = isSeries && existing && (existing.season !== targetSeason || existing.episode !== targetEpisode);
  let finalCurrentTime = currentTime > 0 ? Math.round(currentTime) : (episodeChanged ? 0 : (existing ? (existing.currentTime || 0) : 0));
  let finalDuration = duration > 0 ? Math.round(duration) : (episodeChanged ? 0 : (existing ? (existing.duration || 0) : 0));

  if (isSeries && targetSeason && targetEpisode && currentTime > 0) {
    progressMap[`${targetSeason}:${targetEpisode}`] = {
      currentTime: Math.round(currentTime),
      duration: Math.round(duration),
      formattedTime: formatTimestamp(currentTime)
    };
  }

  const updatedItem = {
    ...item,
    type: isSeries ? 'series' : (item.type || 'movie'),
    season: targetSeason,
    episode: targetEpisode,
    currentTime: finalCurrentTime,
    duration: finalDuration,
    episodesProgress: progressMap,
    watchedAt: Date.now()
  };

  if (existingIdx >= 0) {
    list.splice(existingIdx, 1);
  }
  list.unshift(updatedItem);

  // Keep max 20 items
  if (list.length > 20) list.pop();

  saveJson(key, list);

  // Synchronize watched episode state: in-progress episodes MUST NOT be marked as watched
  if (isSeries && targetSeason && targetEpisode) {
    const isCompleted = finalDuration > 300 && (finalCurrentTime >= finalDuration * 0.90 || (finalDuration - finalCurrentTime <= 25 && finalCurrentTime > finalDuration * 0.85));
    if (!isCompleted && finalCurrentTime > 0) {
      markEpisodeUnwatched(item, targetSeason, targetEpisode);
    } else if (isCompleted) {
      markEpisodeWatched(item, targetSeason, targetEpisode);
    }
  }

  window.dispatchEvent(new CustomEvent('cinetv:historyChanged', { detail: { type: isSeries ? 'series' : 'movie' } }));
  supabaseService.scheduleSync();
}

export function removeContinueWatching(item) {
  if (!item) return;
  const isSeries = isSeriesItem(item);
  const baseKey = isSeries ? KEY_CONTINUE_SERIES : KEY_CONTINUE_MOVIES;
  const key = getScoped(baseKey);
  const isPrimary = profileService.getActiveProfile()?.id === 'profile_primary';
  const starters = isPrimary ? (isSeries ? STARTER_CONTINUE_SERIES : STARTER_CONTINUE_MOVIES) : [];
  const list = loadJson(key, starters);
  const id = item.imdbId || item.id;
  const filtered = list.filter(i => (i.imdbId || i.id) !== id);
  saveJson(key, filtered);
  window.dispatchEvent(new CustomEvent('cinetv:historyChanged', { detail: { type: isSeries ? 'series' : 'movie' } }));
  supabaseService.scheduleSync();
}

export function getWatchlist(type = 'movie') {
  const isPrimary = profileService.getActiveProfile()?.id === 'profile_primary';
  const baseKey = type === 'movie' ? KEY_TOWATCH_MOVIES : KEY_TOWATCH_SERIES;
  const starters = isPrimary ? (type === 'movie' ? STARTER_TOWATCH_MOVIES : STARTER_TOWATCH_SERIES) : [];
  return loadJson(getScoped(baseKey), starters);
}

export function isInWatchlist(item) {
  if (!item) return false;
  const isSeries = isSeriesItem(item);
  const list = getWatchlist(isSeries ? 'series' : 'movie');
  const id = item.imdbId || item.id;
  return list.some(i => (i.imdbId || i.id) === id);
}

export function toggleWatchlist(item) {
  if (!item) return false;
  const isSeries = isSeriesItem(item);
  const baseKey = isSeries ? KEY_TOWATCH_SERIES : KEY_TOWATCH_MOVIES;
  const key = getScoped(baseKey);
  const isPrimary = profileService.getActiveProfile()?.id === 'profile_primary';
  const starters = isPrimary ? (isSeries ? STARTER_TOWATCH_SERIES : STARTER_TOWATCH_MOVIES) : [];
  const list = loadJson(key, starters);
  const id = item.imdbId || item.id;
  const idx = list.findIndex(i => (i.imdbId || i.id) === id);

  let added = false;
  if (idx >= 0) {
    list.splice(idx, 1);
    added = false;
  } else {
    const itemToSave = { ...item };
    if (isSeries) itemToSave.type = 'series';
    list.unshift(itemToSave);
    added = true;
  }

  saveJson(key, list);
  window.dispatchEvent(new CustomEvent('cinetv:watchlistChanged', { detail: { type: isSeries ? 'series' : 'movie', added } }));
  supabaseService.scheduleSync();
  return added;
}

export function getWatchedItems() {
  return loadJson(getScoped(KEY_WATCHED_ITEMS), []);
}

export function isItemWatched(item) {
  if (!item) return false;
  const id = item.imdbId || item.id;
  const list = getWatchedItems();
  return list.includes(id);
}

export function markItemWatched(item) {
  if (!item) return;
  const id = item.imdbId || item.id;
  const key = getScoped(KEY_WATCHED_ITEMS);
  const list = loadJson(key, []);
  if (!list.includes(id)) {
    list.unshift(id);
    saveJson(key, list);
  }
  // Remove from continue watching so it immediately disappears from the row!
  removeContinueWatching(item);
  window.dispatchEvent(new CustomEvent('cinetv:watchedChanged', { detail: { id, watched: true } }));
  supabaseService.scheduleSync();
}

export function markItemUnwatched(item) {
  if (!item) return;
  const id = item.imdbId || item.id;
  const key = getScoped(KEY_WATCHED_ITEMS);
  const list = loadJson(key, []);
  const filtered = list.filter(i => i !== id);
  saveJson(key, filtered);
  window.dispatchEvent(new CustomEvent('cinetv:watchedChanged', { detail: { id, watched: false } }));
  supabaseService.scheduleSync();
}

export function getWatchedEpisodes() {
  return loadJson(getScoped(KEY_WATCHED_EPISODES), []);
}

export function isEpisodeWatched(seriesItem, season, episode) {
  if (!seriesItem || season === null || episode === null) return false;
  const id = seriesItem.imdbId || seriesItem.id;
  const epKey = `${id}:S${season}:E${episode}`;
  const list = getWatchedEpisodes();
  return list.includes(epKey);
}

export function markEpisodeWatched(seriesItem, season, episode) {
  if (!seriesItem || season === null || episode === null) return;
  const id = seriesItem.imdbId || seriesItem.id;
  const epKey = `${id}:S${season}:E${episode}`;
  const key = getScoped(KEY_WATCHED_EPISODES);
  const list = loadJson(key, []);
  if (!list.includes(epKey)) {
    list.unshift(epKey);
    saveJson(key, list);
    window.dispatchEvent(new CustomEvent('cinetv:episodeWatched', { detail: { seriesId: id, season, episode, watched: true } }));
    supabaseService.scheduleSync();
  }
}

export function markEpisodeUnwatched(seriesItem, season, episode) {
  if (!seriesItem || season === null || episode === null) return;
  const id = seriesItem.imdbId || seriesItem.id;
  const epKey = `${id}:S${season}:E${episode}`;
  const key = getScoped(KEY_WATCHED_EPISODES);
  const list = loadJson(key, []);
  const filtered = list.filter(i => i !== epKey);
  saveJson(key, filtered);
  window.dispatchEvent(new CustomEvent('cinetv:episodeWatched', { detail: { seriesId: id, season, episode, watched: false } }));
  supabaseService.scheduleSync();
}

