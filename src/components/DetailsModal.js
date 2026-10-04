import { STREAM_SERVERS, MOVIE_CATEGORIES, SERIES_CATEGORIES } from '../services/resolvers.js';
import { fetchSeriesDetails, fetchItemDetails } from '../services/stremio.js';
import { t, getItemTitle, getItemDescription, translateTextAsync, formatItemDuration, localizeGenre, getServerDisplayName, getLanguage } from '../services/i18n.js';
import { isInWatchlist, toggleWatchlist, saveContinueWatching, isSeriesItem, isEpisodeWatched, markEpisodeWatched, markEpisodeUnwatched, getItemProgress } from '../services/storage.js';
import { showAppToast } from '../services/toast.js';

function normalizeGenre(g) {
  if (!g) return '';
  const s = g.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (s.includes('animac') || s.includes('animat')) return 'animation';
  if (s.includes('comed')) return 'comedy';
  if (s.includes('avent') || s.includes('advent')) return 'adventure';
  if (s.includes('acao') || s.includes('action')) return 'action';
  if (s.includes('ficc') || s.includes('sci')) return 'scifi';
  if (s.includes('crim') || s.includes('mister')) return 'crime';
  if (s.includes('dram')) return 'drama';
  if (s.includes('terror') || s.includes('horror')) return 'horror';
  if (s.includes('famil')) return 'family';
  if (s.includes('fantas')) return 'fantasy';
  if (s.includes('romanc')) return 'romance';
  if (s.includes('guerr') || s.includes('war')) return 'war';
  if (s.includes('musi')) return 'music';
  if (s.includes('doc')) return 'documentary';
  return s;
}

/**
 * Content Details Modal / Page
 * Displays rich movie/series metadata, synopsis, runtime, genres, official YouTube trailer,
 * top cast & director, "More Like This" recommendations, source picker with audio/sub info,
 * and interactive Season & Episode selector for series.
 */
export class DetailsModal {
  constructor(container, onPlay) {
    this.container = container;
    this.onPlay = onPlay;
    this.currentItem = null;
    this.selectedServerId = 'multiembed';
    this.selectedSeason = 1;
    this.selectedEpisode = 1;
    this.trailerYtId = null;
    this.openedAt = 0;

    this.initDOM();
    this.bindEvents();
    window.cineDetailsInstance = this;

    window.addEventListener('cinetv:langChanged', () => {
      if (this.isOpen() && this.currentItem) {
        this.show(this.currentItem);
      }
    });

    window.addEventListener('cinetv:episodeWatched', () => {
      if (this.isOpen() && isSeriesItem(this.currentItem)) {
        this.renderSeasonsAndEpisodes();
      }
    });

    window.addEventListener('cinetv:historyChanged', () => {
      if (this.isOpen() && isSeriesItem(this.currentItem)) {
        this.renderSeasonsAndEpisodes();
      }
    });
  }

  isOpen() {
    return this.overlay && !this.overlay.classList.contains('hidden');
  }

  isTrailerOpen() {
    return this.trailerOverlay && !this.trailerOverlay.classList.contains('hidden');
  }

  initDOM() {
    this.container.innerHTML = `
      <div id="details-overlay" class="fixed inset-0 bg-[#08080a] z-50 hidden flex-col overflow-y-auto md:overflow-hidden no-scrollbar select-none" style="touch-action: pan-y;">
        
        <!-- Fullscreen Cinematic Hero Backdrop (Always covers the whole viewport) -->
        <div class="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
          <img 
            id="details-backdrop" loading="lazy" 
            src="" 
            alt="Backdrop" 
            class="w-full h-full object-cover object-center transition-opacity duration-700 opacity-0 scale-100" 
            referrerpolicy="no-referrer"
          />
          <!-- Multi-Directional Cinematic Gradient Overlays for High-Contrast Readability -->
          <div class="absolute inset-0 bg-gradient-to-r from-[#08080a] via-[#08080a]/90 md:via-[#08080a]/75 to-transparent z-10"></div>
          <div class="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/60 to-transparent z-10"></div>
          <div class="absolute inset-0 bg-gradient-to-b from-[#08080a]/90 via-transparent to-transparent z-10"></div>
        </div>

        <!-- 1-Screen Cinematic Dashboard Container -->
        <div id="details-card" class="relative z-10 w-full flex flex-col justify-start md:justify-between px-4 sm:px-6 md:px-10 md:py-6 box-border md:h-screen md:min-h-0">
          
          <!-- Top Navigation Bar -->
          <div class="relative z-20 flex items-center justify-between flex-shrink-0 mb-3 sm:mb-4">
            <!-- Back Button -->
            <button id="details-back-btn" class="px-4 py-2 rounded-full bg-black/60 hover:bg-[#e50914] text-white flex items-center gap-2 text-xs sm:text-sm font-semibold transition cursor-pointer border border-white/20 active:scale-95 shadow-xl backdrop-blur-md" tabindex="0">
              <span class="text-sm leading-none">←</span>
              <span id="details-back-label">${t('back')}</span>
            </button>

            <!-- Close (✕) Button -->
            <button id="details-close-btn" class="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/60 hover:bg-[#e50914] text-white flex items-center justify-center text-sm sm:text-base font-bold transition cursor-pointer border border-white/20 active:scale-90 shadow-xl backdrop-blur-md" aria-label="Close" tabindex="0">
              ✕
            </button>
          </div>

          <!-- Hero Center Row: Poster (Left) + Information & Actions (Right) -->
          <div class="relative z-20 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 md:gap-8 flex-initial md:flex-1 md:min-h-0 my-1 md:my-auto">
            
            <!-- Crisp 2:3 Movie / Series Poster -->
            <div class="relative w-28 sm:w-36 md:w-40 lg:w-44 rounded-2xl overflow-hidden shadow-2xl border border-white/20 aspect-[2/3] bg-[#121217] flex-shrink-0 hidden sm:block">
              <img id="details-poster" loading="lazy" src="" alt="" class="w-full h-full object-cover" referrerpolicy="no-referrer">
            </div>

            <!-- Content Column -->
            <div class="flex-1 min-w-0 flex flex-col justify-center space-y-2.5 sm:space-y-3 max-w-4xl">
              
              <!-- Badges Row (Single line, no wrap overlap) -->
              <div id="details-badges-row" class="flex items-center gap-1.5 flex-nowrap overflow-x-auto no-scrollbar py-0.5">
                <span id="details-type" class="text-[9.5px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md bg-[#e50914] text-white font-mono shadow-md flex-shrink-0">
                  FILME
                </span>
                <span id="details-rating" class="text-xs font-bold text-[#FFD700] bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md border border-amber-400/40 shadow flex-shrink-0">
                  ★ 8.8
                </span>
                <span id="details-year" class="font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded-md border border-white/10 text-xs flex-shrink-0">2024</span>
                <span id="details-duration" class="text-neutral-300 font-mono text-xs flex-shrink-0">2h 14m</span>
                <span class="text-[9.5px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded-md font-mono flex-shrink-0">
                  4K UHD
                </span>
                <span class="text-[9.5px] font-bold text-neutral-300 bg-white/10 border border-white/15 px-2 py-0.5 rounded-md font-mono flex-shrink-0">
                  16+
                </span>
              </div>

              <!-- Title -->
              <h1 id="details-title" class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight drop-shadow-2xl tracking-tight line-clamp-2">
                Título
              </h1>

              <!-- Genres -->
              <div id="details-genres" class="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-neutral-300 font-medium"></div>

              <!-- Synopsis Box (High-Contrast, Clean, perfectly fitted) -->
              <div id="details-synopsis-box" class="bg-white/[0.04] backdrop-blur-sm p-3 sm:p-3.5 rounded-2xl border border-white/10 space-y-1 max-w-3xl">
                <h3 id="details-synopsis-header" class="text-[9.5px] sm:text-xs font-black text-[#e50914] uppercase tracking-widest">${t('synopsisTitle')}</h3>
                <p id="details-desc" class="text-neutral-200 leading-relaxed text-xs sm:text-sm font-normal line-clamp-3 sm:line-clamp-4">
                  Descrição do título.
                </p>
              </div>

              <!-- Director & Cast Section -->
              <div id="details-cast-section" class="hidden space-y-1">
                <div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                  <span id="details-director-text" class="text-xs text-neutral-400 font-medium flex-shrink-0"></span>
                  <div id="details-cast-chips" class="flex items-center gap-1.5 flex-nowrap"></div>
                </div>
              </div>

              <!-- Action CTAs -->
              <div id="details-actions-row" class="flex items-center gap-2.5 pt-1.5 flex-wrap">
                <!-- Watch Now Button -->
                <button id="details-play-btn" class="h-10 sm:h-11 px-5 sm:px-6 bg-gradient-to-r from-[#e50914] to-[#b80710] hover:from-[#f40d17] hover:to-[#c70812] text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-950/60 transition duration-200 active:scale-95 cursor-pointer border border-red-400/30 backdrop-blur-sm" tabindex="0">
                  <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  <span id="details-play-label" class="tracking-wide">${t('watchNow')}</span>
                </button>

                <!-- Watchlist Button -->
                <button id="details-watchlist-btn" class="h-10 sm:h-11 px-4 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 border border-white/15 cursor-pointer backdrop-blur-md shadow-md" tabindex="0">
                  <span id="details-watchlist-icon" class="font-black">+</span>
                  <span id="details-watchlist-label">${t('addToWatchlist')}</span>
                </button>

                <!-- Trailer Button -->
                <button id="details-trailer-btn" class="h-10 sm:h-11 px-4 bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 border border-white/10 cursor-pointer backdrop-blur-md" tabindex="0">
                  <span>🎬</span>
                  <span id="details-trailer-label">${t('watchTrailer')}</span>
                </button>
              </div>

            </div>
          </div>

          <!-- Bottom Row: Seasons & Episodes (for series) OR "More Like This" (for movies) -->
          <div id="details-bottom-row" class="relative z-20 flex-shrink-0 pt-3 border-t border-white/10">
            <!-- Episodes Section for Series -->
            <div id="details-episodes-section" class="hidden space-y-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  <span class="text-xs text-neutral-400 font-bold uppercase tracking-wider flex-shrink-0">${t('seasonLabel')}:</span>
                  <div id="details-seasons-pills" class="flex items-center gap-1.5 flex-nowrap"></div>
                </div>
                <span id="details-selected-ep-badge" class="text-xs font-bold text-red-400 font-mono bg-red-950/60 border border-red-800/50 px-2.5 py-0.5 rounded-full flex-shrink-0">
                  S1 : E1
                </span>
              </div>
              <div id="details-episodes-grid" class="flex items-center gap-2 overflow-x-auto overflow-y-hidden no-scrollbar py-1" style="touch-action: pan-x pan-y; overscroll-behavior-x: contain;"></div>
            </div>

            <!-- "More Like This" for Movies -->
            <div id="details-similar-section" class="space-y-2">
              <h3 id="details-similar-header" class="text-xs font-bold text-neutral-300 uppercase tracking-widest">
                ${t('similarTitle')}
              </h3>
              <div id="details-similar-track" class="flex items-stretch gap-3 overflow-x-auto overflow-y-hidden no-scrollbar py-1" style="touch-action: pan-x pan-y; overscroll-behavior-x: contain;"></div>
            </div>
          </div>

        </div>

        <!-- Official YouTube Trailer Overlay Player -->
        <div id="trailer-overlay" class="fixed inset-0 bg-black/95 z-50 hidden flex-col items-center justify-center p-3 md:p-8 backdrop-blur-xl transition-all">
          <div class="relative w-full max-w-4xl aspect-video bg-neutral-950 rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
            <!-- Header buttons -->
            <div class="absolute top-3 left-3 z-30 flex items-center gap-2">
              <button id="trailer-external-btn" class="px-3 py-1.5 rounded-full bg-[#e50914] hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xl transition active:scale-95 cursor-pointer">
                <span>📺</span>
                <span id="trailer-external-label">${t('watchTrailer')} (App)</span>
              </button>
            </div>
            <iframe id="trailer-iframe" class="w-full h-full border-0 bg-black" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            <button id="trailer-close-btn" class="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/80 hover:bg-[#e50914] text-white flex items-center justify-center font-bold text-lg border border-white/20 shadow-2xl transition active:scale-90 cursor-pointer z-30" aria-label="Close Trailer">
              ✕
            </button>
          </div>
        </div>

      </div>
    `;

    this.overlay = this.container.querySelector('#details-overlay');
    this.card = this.container.querySelector('#details-card');
    this.closeBtn = this.container.querySelector('#details-close-btn');
    this.backBtn = this.container.querySelector('#details-back-btn');
    this.backLabel = this.container.querySelector('#details-back-label');
    this.playBtn = this.container.querySelector('#details-play-btn');
    this.playLabel = this.container.querySelector('#details-play-label');
    this.trailerBtn = this.container.querySelector('#details-trailer-btn');
    this.trailerLabel = this.container.querySelector('#details-trailer-label');
    this.watchlistBtn = this.container.querySelector('#details-watchlist-btn');
    this.watchlistIcon = this.container.querySelector('#details-watchlist-icon');
    this.watchlistLabel = this.container.querySelector('#details-watchlist-label');
    
    this.backdrop = this.container.querySelector('#details-backdrop');
    this.poster = this.container.querySelector('#details-poster');
    this.title = this.container.querySelector('#details-title');
    this.type = this.container.querySelector('#details-type');
    this.year = this.container.querySelector('#details-year');
    this.rating = this.container.querySelector('#details-rating');
    this.duration = this.container.querySelector('#details-duration');
    this.desc = this.container.querySelector('#details-desc');
    this.genres = this.container.querySelector('#details-genres');

    this.castSection = this.container.querySelector('#details-cast-section');
    this.directorText = this.container.querySelector('#details-director-text');
    this.castChips = this.container.querySelector('#details-cast-chips');

    this.episodesSection = this.container.querySelector('#details-episodes-section');
    this.seasonsPills = this.container.querySelector('#details-seasons-pills');
    this.episodesGrid = this.container.querySelector('#details-episodes-grid');
    this.selectedEpBadge = this.container.querySelector('#details-selected-ep-badge');
    this.synopsisHeader = this.container.querySelector('#details-synopsis-header');

    this.similarSection = this.container.querySelector('#details-similar-section');
    this.similarHeader = this.container.querySelector('#details-similar-header');
    this.similarTrack = this.container.querySelector('#details-similar-track');

    // Trailer Overlay
    this.trailerOverlay = this.container.querySelector('#trailer-overlay');
    this.trailerIframe = this.container.querySelector('#trailer-iframe');
    this.trailerCloseBtn = this.container.querySelector('#trailer-close-btn');
    this.trailerExternalBtn = this.container.querySelector('#trailer-external-btn');
    this.trailerExternalLabel = this.container.querySelector('#trailer-external-label');
  }

  updateWatchlistBtn() {
    if (!this.currentItem || !this.watchlistBtn) return;
    const inList = isInWatchlist(this.currentItem);
    if (inList) {
      if (this.watchlistIcon) this.watchlistIcon.innerText = "✓";
      if (this.watchlistLabel) this.watchlistLabel.innerText = t('inWatchlist');
      this.watchlistBtn.className = "py-2 px-1.5 bg-emerald-950/80 border border-emerald-500/60 text-emerald-400 font-bold text-[11px] sm:text-xs rounded-xl flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer whitespace-nowrap shadow-md backdrop-blur-md";
    } else {
      if (this.watchlistIcon) this.watchlistIcon.innerText = "+";
      if (this.watchlistLabel) this.watchlistLabel.innerText = t('addToWatchlist');
      this.watchlistBtn.className = "py-2 px-1.5 bg-neutral-900/70 hover:bg-neutral-800/80 text-white font-bold text-[11px] sm:text-xs rounded-xl flex items-center justify-center gap-1 transition active:scale-95 border border-white/20 cursor-pointer whitespace-nowrap shadow-md backdrop-blur-md";
    }
  }

  show(item) {
    this.openedAt = Date.now();
    this.currentItem = item;
    if (this.currentItem && isSeriesItem(this.currentItem)) {
      this.currentItem.type = 'series';
    }
    this.selectedServerId = 'multiembed';
    this.trailerYtId = null;
    this.updateWatchlistBtn();
    
    this.title.innerText = getItemTitle(item);
    this.desc.innerText = getItemDescription(item) || (t('synopsisTitle') + "...");
    this.year.innerText = item.year || "2024";
    this.rating.innerText = item.rating || "★ 8.0";
    this.type.innerText = this.currentItem?.type === 'series' ? t('seriesTab').toUpperCase() : t('moviesTab').toUpperCase();
    this.duration.innerText = formatItemDuration(item);
    
    const imdbId = item.imdbId || item.id;
    const isBroken = (url) => !url || url.includes('a3Z4sO4c5lM1p99kC7q0aB5i1p9') || url.includes('abf8tHq65a8g9f76a54f676f45a');

    const defaultPoster = imdbId ? `https://images.metahub.space/poster/medium/${imdbId}/img` : '';
    const defaultBackdrop = imdbId ? `https://images.metahub.space/background/medium/${imdbId}/img` : defaultPoster;

    const posterUrl = !isBroken(item.poster) ? item.poster : defaultPoster;
    const backdropUrl = !isBroken(item.backdrop) ? item.backdrop : defaultBackdrop;

    this.poster.src = posterUrl;

    if (this.backdrop) {
      this.backdrop.style.opacity = '0';
      this.backdrop.onload = () => {
        this.backdrop.style.opacity = '1';
      };
      this.backdrop.onerror = () => {
        if (defaultBackdrop && this.backdrop.src !== defaultBackdrop) {
          this.backdrop.src = defaultBackdrop;
        } else if (posterUrl) {
          this.backdrop.src = posterUrl;
        }
        this.backdrop.style.opacity = '1';
      };
      this.backdrop.src = backdropUrl;
    }

    this.poster.onerror = () => {
      if (defaultPoster && this.poster.src !== defaultPoster) {
        this.poster.src = defaultPoster;
      }
    };

    if (this.backLabel) this.backLabel.innerText = t('back');
    if (this.playLabel) this.playLabel.innerText = t('watchNow');
    if (this.trailerLabel) this.trailerLabel.innerText = t('watchTrailer');
    if (this.synopsisHeader) this.synopsisHeader.innerText = t('synopsisTitle');
    if (this.similarHeader) this.similarHeader.innerText = t('similarTitle');

    // Reset cast and trailer button until fetched
    this.castSection.classList.add('hidden');
    this.castChips.innerHTML = '';
    this.directorText.innerText = '';
    this.trailerBtn.classList.remove('opacity-50');

    // Genres
    const genreList = item.genres || [t('moviesTab')];
    this.genres.innerHTML = genreList.map(g => `
      <span class="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-neutral-300 text-[11px]">${localizeGenre(g)}</span>
    `).join('');

    // If Series, render Seasons & Episodes
    if (item.type === 'series') {
      if (this.card) this.card.classList.add('is-series');
      this.selectedSeason = item.season || 1;
      this.selectedEpisode = item.episode || 1;
      this.episodesSection.classList.remove('hidden');
      this.renderSeasonsAndEpisodes();

      // Dynamically fetch live Cinemeta metadata for full episodes and seasons
      if (imdbId) {
        fetchSeriesDetails(imdbId).then(details => {
          if (details && this.isOpen() && this.currentItem && (this.currentItem.id === item.id || this.currentItem.imdbId === item.imdbId)) {
            if (details.seasonsMap) this.currentItem.seasonsMap = details.seasonsMap;
            if (details.totalSeasons) this.currentItem.totalSeasons = details.totalSeasons;
            if (details.tmdbId) this.currentItem.tmdbId = details.tmdbId;
            this.renderSeasonsAndEpisodes();
          }
        }).catch(err => console.warn('[DetailsModal] fetchSeriesDetails error:', err));
      }
    } else {
      if (this.card) this.card.classList.remove('is-series');
      this.episodesSection.classList.add('hidden');
    }

    // Fetch rich item metadata (YouTube trailer, top cast, director)
    if (imdbId) {
      fetchItemDetails(imdbId, item.type || 'movie').then(richData => {
        if (richData && this.isOpen() && this.currentItem && (this.currentItem.id === item.id || this.currentItem.imdbId === item.imdbId)) {
          // Trailer ID
          if (richData.trailerYtId) {
            this.trailerYtId = richData.trailerYtId;
            this.trailerBtn.classList.remove('opacity-40');
            this.trailerBtn.title = t('watchTrailer');
          } else {
            this.trailerBtn.classList.add('opacity-40');
            this.trailerBtn.title = t('noTrailer');
          }

          // Director
          if (richData.director) {
            this.directorText.innerText = `${t('directorLabel')} ${richData.director}`;
          }

          // Cast
          if (Array.isArray(richData.cast) && richData.cast.length > 0) {
            this.castChips.innerHTML = richData.cast.map(actor => `
              <span class="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-neutral-200 text-[11px] font-medium">
                ${actor}
              </span>
            `).join('');
            this.castSection.classList.remove('hidden');
          }

          // Description: update synopsis if rich description exists and current was empty/generic
          if (richData.description && (!this.currentItem.description || this.currentItem.description.includes('catálogo Cinemeta'))) {
            this.currentItem.description = richData.description;
            this.desc.innerText = getItemDescription(this.currentItem);
          }

          // Genres & Similar: update with real genres and re-render similar
          if (Array.isArray(richData.genres) && richData.genres.length > 0) {
            this.currentItem.genres = richData.genres;
            this.genres.innerHTML = richData.genres.map(g => `
              <span class="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-neutral-300 text-[11px]">${localizeGenre(g)}</span>
            `).join('');
            this.renderSimilarItems();
          }

          // Rich Backdrop Image fallback from Cinemeta meta
          if (richData.tmdbId) {
            this.currentItem.tmdbId = richData.tmdbId;
          }
          if (richData.meta && richData.meta.background && this.backdrop) {
            const bg = richData.meta.background;
            if (!isBroken(bg) && (!item.backdrop || item.backdrop === defaultBackdrop)) {
              this.backdrop.src = bg;
            }
          }
        }
      }).catch(err => console.warn('[DetailsModal] fetchItemDetails error:', err));
    }

    // Translate description in background if needed
    const currentLang = getLanguage();
    const rawDesc = item.description || item.description_en || item.description_pt;
    if (rawDesc && rawDesc.length > 15 && !rawDesc.includes('catálogo Cinemeta')) {
      translateTextAsync(rawDesc, currentLang).then(translated => {
        if (translated && translated !== rawDesc && this.isOpen() && (this.currentItem?.imdbId === imdbId || this.currentItem?.id === item.id)) {
          this.desc.innerText = translated;
          if (currentLang === 'pt') this.currentItem.description_pt = translated;
          else this.currentItem.description_en = translated;
        }
      }).catch(() => {});
    }


    // Render "More Like This" similar titles row
    this.renderSimilarItems();

    this.overlay.classList.remove('hidden');
    this.overlay.classList.add('flex');
    document.body.classList.add('modal-open');

    if (window.cineTvNav) {
      window.cineTvNav.pushModal(this.overlay, '#details-play-btn');
    }
  }

  openTrailer() {
    if (!this.trailerYtId) {
      const title = getItemTitle(this.currentItem);
      const query = encodeURIComponent(`${title} official trailer`);
      const url = `https://www.youtube.com/results?search_query=${query}`;
      if (window.AndroidNative && window.AndroidNative.openExternalUrl) {
        window.AndroidNative.openExternalUrl(url);
      } else {
        window.open(url, '_blank');
      }
      return;
    }

    // Direct Native YouTube playback on Android / TV (avoids WebView Error 153 and plays full 4K HDR)
    if (window.AndroidNative && window.AndroidNative.openYouTube) {
      window.AndroidNative.openYouTube(this.trailerYtId);
      return;
    }

    // Web / PC fallback
    this.trailerIframe.src = `https://www.youtube.com/embed/${this.trailerYtId}?autoplay=1&enablejsapi=1&origin=https://www.youtube.com&playsinline=1`;
    this.trailerOverlay.classList.remove('hidden');
    this.trailerOverlay.classList.add('flex');

    if (window.cineTvNav) {
      window.cineTvNav.pushModal(this.trailerOverlay, '#trailer-close-btn');
    }
  }

  openTrailerExternal() {
    if (!this.trailerYtId) return;
    if (window.AndroidNative && window.AndroidNative.openYouTube) {
      window.AndroidNative.openYouTube(this.trailerYtId);
      this.closeTrailer();
    } else {
      window.open(`https://www.youtube.com/watch?v=${this.trailerYtId}`, '_blank');
    }
  }

  closeTrailer() {
    if (this.trailerIframe) {
      this.trailerIframe.src = 'about:blank';
    }
    if (this.trailerOverlay && !this.trailerOverlay.classList.contains('hidden')) {
      this.trailerOverlay.classList.add('hidden');
      this.trailerOverlay.classList.remove('flex');
      if (window.cineTvNav) {
        window.cineTvNav.popModal();
      }
    }
  }

  renderSimilarItems() {
    if (!this.currentItem) return;
    if (this.similarHeader) this.similarHeader.innerText = t('similarTitle');
    const isSeries = this.currentItem.type === 'series';
    const currentType = this.currentItem.type || (isSeries ? 'series' : 'movie');
    const currentId = this.currentItem.imdbId || this.currentItem.id;
    const targetGenres = new Set((this.currentItem.genres || []).map(normalizeGenre).filter(Boolean));

    // Candidate pool matching the exact same content type
    let pool = [];
    if (isSeries) {
      Object.values(SERIES_CATEGORIES).forEach(list => {
        if (Array.isArray(list)) pool.push(...list);
      });
      if (window.cineApp?.cachedSeries) pool.push(...window.cineApp.cachedSeries);
    } else {
      Object.values(MOVIE_CATEGORIES).forEach(list => {
        if (Array.isArray(list)) pool.push(...list);
      });
      if (window.cineApp?.cachedMovies) pool.push(...window.cineApp.cachedMovies);
    }

    // Filter, deduplicate, score by genuine genre overlap
    const seen = new Set([currentId]);
    const scored = [];

    pool.forEach(item => {
      const id = item.imdbId || item.id;
      if (!id || seen.has(id)) return;
      seen.add(id);

      // STRICT TYPE CHECK: Never recommend a series for a movie or vice versa
      if (item.type && item.type !== currentType) return;

      let score = 0;
      const itemGenres = (item.genres || []).map(normalizeGenre).filter(Boolean);
      itemGenres.forEach(ig => {
        if (targetGenres.has(ig)) {
          score += (ig === 'animation' || ig === 'family' || ig === 'scifi' || ig === 'crime') ? 3 : 2;
        }
      });

      // Include items with genuine genre overlap
      if (score > 0) {
        scored.push({ item, score });
      }
    });

    scored.sort((a, b) => b.score - a.score);
    let recommendations = scored.slice(0, 10).map(s => s.item);

    // Fallback & Top-up: If genre overlap produces fewer than 8 recommendations,
    // top up with popular items of the same content type so "More Like This" is always a full rich rail
    if (recommendations.length < 8) {
      const recSeen = new Set([currentId, ...recommendations.map(r => r.imdbId || r.id)]);
      for (const item of pool) {
        if (recommendations.length >= 10) break;
        const id = item.imdbId || item.id;
        if (!id || recSeen.has(id)) continue;
        if (item.type && item.type !== currentType) continue;
        recSeen.add(id);
        recommendations.push(item);
      }
    }

    if (recommendations.length === 0) {
      this.similarSection.classList.add('hidden');
      return;
    }

    this.similarSection.classList.remove('hidden');
    this.similarTrack.innerHTML = recommendations.map(rec => {
      const imdbId = rec.imdbId || rec.id;
      const isBroken = (url) => !url || url.includes('a3Z4sO4c5lM1p99kC7q0aB5i1p9') || url.includes('abf8tHq65a8g9f76a54f676f45a');
      const poster = !isBroken(rec.poster)
        ? rec.poster
        : (imdbId ? `https://images.metahub.space/poster/medium/${imdbId}/img` : '');
      const title = getItemTitle(rec);
      const rating = rec.rating || '★ 8.0';

      return `
        <div data-id="${imdbId}" tabindex="0" class="similar-card flex-shrink-0 w-28 sm:w-32 cursor-pointer rounded-2xl overflow-hidden bg-[#121217] border border-white/10 hover:border-[#e50914] transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-black/80 group" style="touch-action: pan-x pan-y;">
          <div class="relative w-full aspect-[2/3] bg-neutral-950 overflow-hidden">
            <img src="${poster}" alt="${title}" draggable="false" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none select-none" loading="lazy" referrerpolicy="no-referrer" onerror="if (this.dataset.fb !== '1') { this.dataset.fb = '1'; this.src = 'https://images.metahub.space/poster/medium/${imdbId}/img'; }">
            <div class="absolute inset-0 bg-gradient-to-t from-[#08080a] via-transparent to-transparent pointer-events-none"></div>
            <div class="absolute top-2 left-2 bg-black/80 backdrop-blur-sm px-1.5 py-0.5 rounded-md text-[9px] font-mono text-[#FFD700] font-bold border border-amber-400/40 shadow">
              ${rating}
            </div>
          </div>
          <div class="p-2 bg-[#121217]">
            <p class="text-xs font-bold text-white group-hover:text-red-400 truncate leading-tight transition-colors">
              ${title}
            </p>
          </div>
        </div>
      `;
    }).join('');

    // Attach click events on recommendation cards
    this.similarTrack.querySelectorAll('.similar-card').forEach(card => {
      card.addEventListener('click', () => {
        if (Date.now() - (this.openedAt || 0) < 500) return;
        const id = card.dataset.id;
        const target = recommendations.find(r => (r.imdbId || r.id) === id);
        if (target) {
          this.show(target);
          const cardEl = this.container.querySelector('#details-card > div:last-child');
          if (cardEl) cardEl.scrollTop = 0;
        }
      });
    });
  }

  renderSeasonsAndEpisodes() {
    if (!this.currentItem) return;

    let seasonsList = [];
    if (this.currentItem.seasonsMap && Object.keys(this.currentItem.seasonsMap).length > 0) {
      seasonsList = Object.keys(this.currentItem.seasonsMap).map(Number).sort((a, b) => a - b);
    } else if (this.currentItem.seasonEpisodes && Object.keys(this.currentItem.seasonEpisodes).length > 0) {
      seasonsList = Object.keys(this.currentItem.seasonEpisodes).map(Number).sort((a, b) => a - b);
    } else {
      const totalSeasons = this.currentItem.totalSeasons || 1;
      for (let s = 1; s <= totalSeasons; s++) seasonsList.push(s);
    }

    if (seasonsList.length === 0) seasonsList = [1];

    if (!seasonsList.includes(this.selectedSeason)) {
      this.selectedSeason = seasonsList[0];
    }

    // Determine episodes for selectedSeason
    let episodeItems = [];
    if (this.currentItem.seasonsMap && this.currentItem.seasonsMap[this.selectedSeason]) {
      episodeItems = this.currentItem.seasonsMap[this.selectedSeason];
    } else {
      let epCount = 10;
      if (this.currentItem.seasonEpisodes && this.currentItem.seasonEpisodes[this.selectedSeason]) {
        epCount = this.currentItem.seasonEpisodes[this.selectedSeason];
      } else if (this.currentItem.episodesCount) {
        epCount = this.currentItem.episodesCount;
      }
      for (let e = 1; e <= epCount; e++) {
        episodeItems.push({
          season: this.selectedSeason,
          episode: e,
          name: `${t('epPrefix')} ${e}`
        });
      }
    }

    const hasEp = episodeItems.some(ep => ep.episode === this.selectedEpisode);
    if (!hasEp && episodeItems.length > 0) {
      this.selectedEpisode = episodeItems[0].episode;
    }

    // Update badge
    this.selectedEpBadge.innerText = `S${this.selectedSeason} : E${this.selectedEpisode}`;

    // Render season pills
    let seasonsHtml = '';
    for (const s of seasonsList) {
      const isAct = s === this.selectedSeason;
      seasonsHtml += `
        <button data-season="${s}" tabindex="0" class="season-pill px-3 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap cursor-pointer flex-shrink-0 ${
          isAct ? 'bg-red-600 text-white shadow-md shadow-red-900/50 border border-red-500' : 'bg-white/10 text-neutral-300 hover:bg-white/20 border border-white/10'
        }">
          ${t('seasonPrefix')} ${s}
        </button>
      `;
    }
    this.seasonsPills.innerHTML = seasonsHtml;

    // Render episodes horizontal track
    let episodesHtml = '';
    for (const ep of episodeItems) {
      const isAct = ep.episode === this.selectedEpisode;
      const isWatched = isEpisodeWatched(this.currentItem, this.selectedSeason, ep.episode);
      const epProgress = !isWatched ? getItemProgress(this.currentItem, this.selectedSeason, ep.episode) : null;
      const isInProgress = !isWatched && Boolean(epProgress && epProgress.currentTime > 15);
      const pct = isInProgress ? Math.max(5, Math.min(95, epProgress.percentage || Math.round((epProgress.currentTime / (epProgress.duration || 2700)) * 100))) : 0;
      const cleanName = ep.name && !ep.name.toLowerCase().startsWith('episode') && !ep.name.toLowerCase().startsWith('episódio')
        ? ep.name
        : '';
      episodesHtml += `
        <button data-episode="${ep.episode}" tabindex="0" class="episode-chip relative overflow-hidden px-3 py-1.5 rounded-xl text-center transition flex-shrink-0 flex items-center gap-1.5 border cursor-pointer ${
          isAct 
            ? 'border-red-500 bg-red-950/90 text-white font-bold ring-1 ring-red-500 shadow-md shadow-red-900/40' 
            : (isWatched 
                ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/40' 
                : (isInProgress
                    ? 'border-amber-500/50 bg-amber-950/25 text-amber-200 hover:bg-amber-900/35'
                    : 'border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10'))
        }" title="${ep.name || ''}">
          <span class="text-[9px] ${isWatched ? 'text-emerald-400 font-bold' : (isInProgress ? 'text-amber-400 font-bold' : 'text-neutral-400')} font-mono">${t('epPrefix')}</span>
          <span class="text-xs font-black">${ep.episode}</span>
          ${isWatched ? `<span class="text-[11px] text-emerald-400 font-black leading-none ml-0.5" title="${t('watched') || 'Watched'}">✓</span>` : ''}
          ${isInProgress ? `<span class="text-[9px] text-amber-400 font-bold leading-none ml-0.5">${pct}%</span>` : ''}
          ${cleanName ? `<span class="text-[9px] ${isWatched ? 'text-emerald-300/80' : (isInProgress ? 'text-amber-200/80' : 'text-neutral-300')} truncate max-w-[80px] block leading-none">${cleanName}</span>` : ''}
          ${isInProgress ? `<div class="absolute bottom-0 left-0 right-0 h-[2.5px] bg-black/50 pointer-events-none"><div class="h-full bg-amber-500 rounded-r-full" style="width: ${pct}%"></div></div>` : ''}
        </button>
      `;
    }
    this.episodesGrid.innerHTML = episodesHtml;
  }


  close() {
    this.closeTrailer();
    this.overlay.classList.add('hidden');
    this.overlay.classList.remove('flex');
    document.body.classList.remove('modal-open');
    if (window.cineTvNav) {
      window.cineTvNav.popModal();
    }
  }

  bindEvents() {
    const handleClose = (e) => {
      // Prevent accidental dismissal immediately upon modal open (ghost clicks/taps)
      if (Date.now() - (this.openedAt || 0) < 400) return;
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      this.close();
    };

    this.closeBtn.addEventListener('click', handleClose);
    this.closeBtn.addEventListener('touchend', handleClose);
    if (this.backBtn) {
      this.backBtn.addEventListener('click', handleClose);
      this.backBtn.addEventListener('touchend', handleClose);
    }

    this.trailerCloseBtn.addEventListener('click', () => this.closeTrailer());
    this.trailerOverlay.addEventListener('click', (e) => {
      if (e.target === this.trailerOverlay) this.closeTrailer();
    });

    const handleTrailer = (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      if (Date.now() - (this.openedAt || 0) < 150) return;
      this.openTrailer();
    };
    this.trailerBtn.addEventListener('click', handleTrailer);
    this.trailerBtn.addEventListener('touchend', handleTrailer);

    if (this.trailerExternalBtn) {
      const handleTrailerExternal = (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        if (Date.now() - (this.openedAt || 0) < 150) return;
        this.openTrailerExternal();
      };
      this.trailerExternalBtn.addEventListener('click', handleTrailerExternal);
      this.trailerExternalBtn.addEventListener('touchend', handleTrailerExternal);
    }

    const handleWatchlist = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (Date.now() - (this.openedAt || 0) < 150) return;
      if (this.currentItem) {
        const added = toggleWatchlist(this.currentItem);
        this.updateWatchlistBtn();
        const itemTitle = getItemTitle(this.currentItem) || '';
        showAppToast(
          added 
            ? `${itemTitle}: ${t('inWatchlist') || 'Na Lista'}` 
            : `${itemTitle}: ${t('itemRemoved') || 'Removido'}`,
          added ? '🔖' : '🗑️'
        );
      }
    };

    this.watchlistBtn.addEventListener('click', handleWatchlist);
    this.watchlistBtn.addEventListener('touchend', handleWatchlist);

    let isLaunching = false;
    const triggerPlay = (source) => {
      // Prevent accidental triggering immediately upon modal open
      if (Date.now() - (this.openedAt || 0) < 150) return;
      if (isLaunching) return;
      isLaunching = true;
      setTimeout(() => { isLaunching = false; }, 1200);

      this.close();
      if (this.currentItem) {
        saveContinueWatching(this.currentItem, this.selectedSeason, this.selectedEpisode);
        this.onPlay(this.currentItem, this.selectedServerId, this.selectedSeason, this.selectedEpisode);
      }
    };

    this.playBtn.addEventListener('click', (e) => {
      e.preventDefault();
      triggerPlay('click');
    });
    this.playBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      e.stopPropagation();
      triggerPlay('touchend');
    });

    // Season Pill click & touch
    const handleSeasonSelect = (e) => {
      const btn = e.target.closest('.season-pill');
      if (btn && btn.dataset.season) {
        if (e.type === 'touchend') {
          e.preventDefault();
          e.stopPropagation();
        }
        this.selectedSeason = parseInt(btn.dataset.season, 10);
        this.renderSeasonsAndEpisodes();
      }
    };
    this.seasonsPills.addEventListener('click', handleSeasonSelect);
    this.seasonsPills.addEventListener('touchend', handleSeasonSelect);

    // Episode Grid click & touch
    const handleEpisodeSelect = (e) => {
      const chip = e.target.closest('.episode-chip');
      if (chip && chip.dataset.episode) {
        if (e.type === 'touchend') {
          e.preventDefault();
          e.stopPropagation();
        }
        this.selectedEpisode = parseInt(chip.dataset.episode, 10);
        this.renderSeasonsAndEpisodes();
      }
    };
    this.episodesGrid.addEventListener('click', handleEpisodeSelect);
    this.episodesGrid.addEventListener('touchend', handleEpisodeSelect);

    // Close on clicking backdrop outside card
    this.overlay.addEventListener('click', (e) => {
      if (Date.now() - (this.openedAt || 0) < 400) return;
      if (e.target === this.overlay) this.close();
    });

    window.addEventListener('keydown', (e) => {
      if (this.isTrailerOpen() && (e.key === 'Escape' || e.key === 'Backspace')) {
        this.closeTrailer();
        e.stopPropagation();
        return;
      }
      if (this.overlay.classList.contains('flex')) {
        if (e.key === 'Escape' || e.key === 'Backspace') {
          this.close();
        }
      }
    });
  }
}
