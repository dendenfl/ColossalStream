/**
 * Stremio Addon Protocol Client
 * Directly connects to Cinemeta and Stremio HTTP addons
 */

const CINEMETA_BASE = 'https://v3-cinemeta.strem.io';

// Built-in fallback catalog to guarantee instant offline / startup availability
const FALLBACK_CATALOG = [
  {
    id: "tt15239678",
    title: "Dune: Part Two",
    year: "2024",
    rating: "8.8",
    type: "movie",
    poster: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s520b2e.jpg",
    description: "Paul Atreides se une a Chani e aos Fremen enquanto busca vingança contra os conspiradores que destruíram sua família.",
    genres: ["Ficção Científica", "Aventura"],
    source: "ColossalStream"
  },
  {
    id: "tt6263850",
    title: "Deadpool & Wolverine",
    year: "2024",
    rating: "8.2",
    type: "movie",
    poster: "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/9l1eZiJHmhr5jIlthMdJN5ZLOvd.jpg",
    description: "Wade Wilson tenta viver uma vida pacata até que a Autoridade de Variância Temporal o recruta para salvar o multiverso.",
    genres: ["Ação", "Comédia"],
    source: "ColossalStream"
  },
  {
    id: "tt9218128",
    title: "Gladiator II",
    year: "2024",
    rating: "8.1",
    type: "movie",
    poster: "https://image.tmdb.org/t/p/w500/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/euYIwmwkmz95mnEx7vG5vtJ4Jnv.jpg",
    description: "Anos depois de testemunhar a morte do reverenciado herói Máximo, Lucius é forçado a lutar no Coliseu.",
    genres: ["Ação", "Drama", "História"],
    source: "ColossalStream"
  },
  {
    id: "tt15435876",
    title: "The Penguin",
    year: "2024",
    rating: "8.9",
    type: "series",
    poster: "https://images.metahub.space/poster/medium/tt15435876/img",
    backdrop: "https://images.metahub.space/background/medium/tt15435876/img",
    description: "Após a morte de Carmine Falcone, Oz Cobb começa a traçar sua ascensão implacável para dominar Gotham.",
    genres: ["Crime", "Drama"],
    source: "ColossalStream"
  },
  {
    id: "tt11126994",
    title: "Arcane: Season 2",
    year: "2024",
    rating: "9.0",
    type: "series",
    poster: "https://images.metahub.space/poster/medium/tt11126994/img",
    backdrop: "https://images.metahub.space/background/medium/tt11126994/img",
    description: "A tensão explode entre a rica cidade de Piltover e as favelas de Zaun enquanto Vi e Jinx se enfrentam.",
    genres: ["Animação", "Ficção Científica"],
    source: "ColossalStream"
  },
  {
    id: "tt18411490",
    title: "Alien: Romulus",
    year: "2024",
    rating: "7.5",
    type: "movie",
    poster: "https://images.metahub.space/poster/medium/tt18411490/img",
    backdrop: "https://images.metahub.space/background/medium/tt18411490/img",
    description: "Jovens colonizadores exploram uma estação abandonada e se deparam com a criatura mais aterradora do universo.",
    genres: ["Terror", "Ficção Científica"],
    source: "ColossalStream"
  },
  {
    id: "tt13622970",
    title: "Moana 2",
    year: "2024",
    rating: "7.8",
    type: "movie",
    poster: "https://images.metahub.space/poster/medium/tt13622970/img",
    backdrop: "https://images.metahub.space/background/medium/tt13622970/img",
    description: "Moana e Maui reúnem uma nova tripulação de marinheiros improváveis para desbravar oceanos perigosos.",
    genres: ["Animação", "Aventura"],
    source: "ColossalStream"
  },
  {
    id: "tt2788316",
    title: "Shōgun",
    year: "2024",
    rating: "8.9",
    type: "series",
    poster: "https://image.tmdb.org/t/p/w500/7O4iVfOMQmdCSxhOg1WnzG1AgYT.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/jrrLwD6Z8K5E1a7qG0L4s6x3m7n.jpg",
    description: "No Japão de 1600, Lord Toranaga luta por sobrevivência enquanto um capitão inglês naufraga na costa.",
    genres: ["Drama", "História"],
    source: "ColossalStream"
  }
];

const CINEMETA_CATALOG_URL = 'https://cinemeta-catalogs.strem.io/top';

export function mapCinemetaMeta(m, defaultType = 'movie') {
  const id = m.id || m.imdb_id;
  if (!id) return null;
  return {
    id: id,
    imdbId: id,
    title: m.name,
    year: m.releaseInfo || m.year || "2024",
    rating: m.imdbRating ? `★ ${m.imdbRating}` : "★ 8.0",
    type: m.type || defaultType,
    poster: id ? `https://images.metahub.space/poster/medium/${id}/img` : (m.poster || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80"),
    backdrop: id ? `https://images.metahub.space/background/medium/${id}/img` : (m.background || m.poster),
    description: m.description || "",
    genres: m.genres || ["Action", "Drama"],
    source: "ColossalStream"
  };
}

/**
 * Fetches a single page of 50 items from Cinemeta by skip offset
 */
export async function fetchStremioCatalogPage(type = 'movie', skip = 0) {
  try {
    const url = skip === 0
      ? `${CINEMETA_CATALOG_URL}/catalog/${type}/top.json`
      : `${CINEMETA_CATALOG_URL}/catalog/${type}/top/skip=${skip}.json`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' }, signal: AbortSignal.timeout(6000) });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data || !data.metas || !Array.isArray(data.metas)) return [];
    return data.metas.map(m => mapCinemetaMeta(m, type)).filter(Boolean);
  } catch (err) {
    console.warn(`[stremio] fetchStremioCatalogPage ${type} skip=${skip} failed:`, err.message);
    return [];
  }
}

export async function fetchStremioTopCatalog(type = 'movie') {
  try {
    // Fetch top 4 pages concurrently (200 top titles - fast & reliable boot)
    const skips = [0, 50, 100, 150];
    const pageUrls = skips.map(s => 
      s === 0 
        ? `${CINEMETA_CATALOG_URL}/catalog/${type}/top.json`
        : `${CINEMETA_CATALOG_URL}/catalog/${type}/top/skip=${s}.json`
    );

    const responses = await Promise.allSettled(
      pageUrls.map(url => fetch(url, { headers: { 'Accept': 'application/json' }, signal: AbortSignal.timeout(6000) }))
    );

    const items = [];
    const seen = new Set();

    for (const r of responses) {
      if (r.status === 'fulfilled' && r.value.ok) {
        try {
          const data = await r.value.json();
          if (data && data.metas && Array.isArray(data.metas)) {
            data.metas.forEach(m => {
              const item = mapCinemetaMeta(m, type);
              if (item && !seen.has(item.id)) {
                seen.add(item.id);
                items.push(item);
              }
            });
          }
        } catch (e) {}
      }
    }

    if (items.length > 0) {
      return items;
    }
  } catch (err) {
    console.warn("Stremio multi-page fetch error:", err.message);
  }
  return FALLBACK_CATALOG.filter(item => !type || item.type === type);
}

/**
 * Fetches 200+ items across multiple pages for the full grid "All" view
 */
export async function fetchFullCatalog(type = 'movie') {
  return fetchStremioTopCatalog(type);
}

export async function searchStremioCatalog(query) {
  if (!query || query.trim().length === 0) return [];
  const q = encodeURIComponent(query.trim());
  const results = [];

  try {
    const [movieRes, seriesRes] = await Promise.allSettled([
      fetch(`${CINEMETA_BASE}/catalog/movie/top/search=${q}.json`, { signal: AbortSignal.timeout(4500) }),
      fetch(`${CINEMETA_BASE}/catalog/series/top/search=${q}.json`, { signal: AbortSignal.timeout(4500) })
    ]);

    if (movieRes.status === 'fulfilled' && movieRes.value.ok) {
      const data = await movieRes.value.json();
      if (data?.metas) {
        data.metas.forEach(m => {
          results.push({
            id: m.id,
            imdbId: m.imdb_id || m.id,
            title: m.name,
            year: m.releaseInfo || m.year || "2024",
            rating: m.imdbRating ? `★ ${m.imdbRating}` : "★ 8.0",
            type: "movie",
            poster: m.poster || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80",
            backdrop: m.background || m.poster,
            description: m.description || "",
            genres: m.genres || ["Action", "Drama"],
            source: "ColossalStream"
          });
        });
      }
    }

    if (seriesRes.status === 'fulfilled' && seriesRes.value.ok) {
      const data = await seriesRes.value.json();
      if (data?.metas) {
        data.metas.forEach(m => {
          results.push({
            id: m.id,
            imdbId: m.imdb_id || m.id,
            title: m.name,
            year: m.releaseInfo || m.year || "2024",
            rating: m.imdbRating ? `★ ${m.imdbRating}` : "★ 8.0",
            type: "series",
            poster: m.poster || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80",
            backdrop: m.background || m.poster,
            description: m.description || "",
            genres: m.genres || ["Action", "Drama"],
            source: "ColossalStream"
          });
        });
      }
    }
  } catch (err) {
    console.warn("Cinemeta search error:", err.message);
  }

  return results;
}

const seriesDetailsCache = new Map();

/**
 * Fetches real metadata, seasons, and full episode lists for any series from Cinemeta
 */
export async function fetchSeriesDetails(imdbId) {
  if (!imdbId) return null;
  if (seriesDetailsCache.has(imdbId)) {
    return seriesDetailsCache.get(imdbId);
  }

  try {
    const res = await fetch(`${CINEMETA_BASE}/meta/series/${imdbId}.json`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(6000)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data && data.meta && Array.isArray(data.meta.videos) && data.meta.videos.length > 0) {
      const seasonsMap = {};
      data.meta.videos.forEach(v => {
        const s = v.season;
        if (s === undefined || s === null || s < 1) return; // Skip specials / season 0
        if (!seasonsMap[s]) {
          seasonsMap[s] = [];
        }
        seasonsMap[s].push({
          season: s,
          episode: v.episode || v.number || seasonsMap[s].length + 1,
          name: v.name || v.title || `Episode ${v.episode || seasonsMap[s].length + 1}`,
          overview: v.overview || v.description || "",
          thumbnail: v.thumbnail || "",
          released: v.released || v.firstAired || ""
        });
      });

      // Sort episodes numerically within each season
      Object.keys(seasonsMap).forEach(s => {
        seasonsMap[s].sort((a, b) => a.episode - b.episode);
      });

      const result = {
        meta: data.meta,
        tmdbId: data.meta.moviedb_id || data.meta.tmdb_id || null,
        seasonsMap,
        totalSeasons: Object.keys(seasonsMap).length,
        episodesCount: data.meta.videos.length
      };

      seriesDetailsCache.set(imdbId, result);
      return result;
    }
  } catch (err) {
    console.warn(`[Cinemeta] Series details fetch failed for ${imdbId}:`, err.message);
  }

  return null;
}

const itemDetailsCache = new Map();

/**
 * Fetches comprehensive metadata for any movie or series from Cinemeta,
 * including YouTube trailer ID, cast list, director, runtime, genres, and episodes if series.
 */
export async function fetchItemDetails(imdbId, type = 'movie') {
  if (!imdbId) return null;
  const cacheKey = `${type}_${imdbId}`;
  if (itemDetailsCache.has(cacheKey)) {
    return itemDetailsCache.get(cacheKey);
  }

  try {
    const res = await fetch(`${CINEMETA_BASE}/meta/${type}/${imdbId}.json`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(6000)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data && data.meta) {
      const m = data.meta;

      // Extract YouTube trailer ID
      let trailerYtId = null;
      if (Array.isArray(m.trailerStreams) && m.trailerStreams.length > 0) {
        const tr = m.trailerStreams.find(t => t.ytId);
        if (tr) trailerYtId = tr.ytId;
      }
      if (!trailerYtId && Array.isArray(m.trailers) && m.trailers.length > 0) {
        const tr = m.trailers.find(t => t.source);
        if (tr) trailerYtId = tr.source;
      }
      if (!trailerYtId && typeof m.trailer === 'string') {
        const match = m.trailer.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
        if (match) trailerYtId = match[1];
      }

      // Cast and Director
      const cast = Array.isArray(m.cast) ? m.cast.slice(0, 6) : [];
      const director = Array.isArray(m.director) 
        ? m.director.join(', ') 
        : (typeof m.director === 'string' ? m.director : '');

      const enriched = {
        meta: m,
        tmdbId: m.moviedb_id || m.tmdb_id || null,
        trailerYtId,
        cast,
        director,
        runtime: m.runtime || '',
        genres: m.genres || [],
        description: m.description || ''
      };

      itemDetailsCache.set(cacheKey, enriched);
      return enriched;
    }
  } catch (err) {
    console.warn(`[Cinemeta] Meta fetch failed for ${imdbId}:`, err.message);
  }

  return null;
}

const catalogBatchCache = new Map();

/**
 * Fetches paginated batch of movies or series from Cinemeta
 * @param {'movie'|'series'} type 
 * @param {string|null} genre (e.g. 'Action', 'Animation', 'Sci-Fi', 'all')
 * @param {number} skip offset (0, 50, 100...)
 */
export async function fetchCatalogBatch(type = 'movie', genre = null, skip = 0) {
  const normGenre = (!genre || genre.toLowerCase() === 'all' || genre.toLowerCase() === 'todos') ? null : genre;
  const cacheKey = `${type}_${normGenre || 'all'}_${skip}`;
  if (catalogBatchCache.has(cacheKey)) {
    return catalogBatchCache.get(cacheKey);
  }

  try {
    let path = `/catalog/${type}/top`;
    if (normGenre) {
      path += `/genre=${encodeURIComponent(normGenre)}`;
      if (skip > 0) {
        path += `&skip=${skip}.json`;
      } else {
        path += `.json`;
      }
    } else {
      if (skip > 0) {
        path += `/skip=${skip}.json`;
      } else {
        path += `.json`;
      }
    }

    let res = null;
    try {
      res = await fetch(`https://cinemeta-catalogs.strem.io/top${path}`, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(6000)
      });
    } catch (e) {
      // Fallback to base
      res = await fetch(`${CINEMETA_BASE}${path}`, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(6000)
      });
    }
    if (!res || !res.ok) throw new Error(`HTTP ${res?.status || 500}`);
    const data = await res.json();
    if (data && Array.isArray(data.metas)) {
      const items = data.metas.map(m => {
        const id = m.id || m.imdb_id;
        return {
          id: id,
          imdbId: id,
          title: m.name || m.title || 'Untitled',
          year: m.year ? String(m.year) : '2024',
          rating: m.imdbRating ? `★ ${m.imdbRating}` : '★ 8.0',
          type: type,
          duration: type === 'series' ? '8 Episódios' : (m.runtime || '2h 15m'),
          poster: m.poster || `https://images.metahub.space/poster/medium/${id}/img`,
          backdrop: m.background || `https://images.metahub.space/background/medium/${id}/img`,
          description: m.description || '',
          genres: m.genres || (type === 'movie' ? ['Action'] : ['Drama']),
          source: 'ColossalStream'
        };
      });

      catalogBatchCache.set(cacheKey, items);
      return items;
    }
  } catch (err) {
    console.warn(`[Cinemeta] Catalog batch fetch failed (${type}, ${normGenre}, skip=${skip}):`, err.message);
  }

  return [];
}
