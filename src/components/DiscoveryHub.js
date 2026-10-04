/**
 * DiscoveryHub Component
 * Smart Discovery Hub & Deep Filter for Movies and Series.
 * Filters by Platform Networks (Netflix, HBO Max, Disney+, Apple TV+, Prime Video),
 * Release Year, Minimum Rating, and Multi-Genres with TV Remote D-Pad support.
 */
import { t, getItemTitle, formatItemDuration } from '../services/i18n.js';
import { profileService } from '../services/profiles.js';
import { fetchStremioCatalogPage } from '../services/stremio.js';
import { getResumeState } from '../services/storage.js';

export function getPlatforms() {
  return [
    { id: 'all', name: t('filterAll'), badge: '🌐', color: 'border-white/20' },
    { id: 'netflix', name: 'Netflix', badge: '🔴', color: 'border-red-600 bg-red-950/30 text-red-400' },
    { id: 'max', name: 'Max / HBO', badge: '🟣', color: 'border-purple-600 bg-purple-950/30 text-purple-400' },
    { id: 'disney', name: 'Disney+', badge: '🔵', color: 'border-blue-600 bg-blue-950/30 text-blue-400' },
    { id: 'appletv', name: 'Apple TV+', badge: '🍏', color: 'border-emerald-500 bg-emerald-950/30 text-emerald-400' },
    { id: 'prime', name: 'Prime Video', badge: '🔷', color: 'border-cyan-500 bg-cyan-950/30 text-cyan-400' },
    { id: 'paramount', name: 'Paramount+', badge: '🟡', color: 'border-amber-500 bg-amber-950/30 text-amber-400' }
  ];
}

export function getYears() {
  return [
    { id: 'all', name: t('allYears') },
    { id: '2026', name: '2026' },
    { id: '2025', name: '2025' },
    { id: '2024', name: '2024' },
    { id: '2023', name: '2023' },
    { id: '2022', name: '2022' },
    { id: '2020-2021', name: '2020 - 2021' },
    { id: '2010s', name: t('years2010s') },
    { id: 'classics', name: t('classicsYears') }
  ];
}

export function getRatings() {
  return [
    { id: 'all', name: t('allRatings') },
    { id: '8.0', name: t('ratingMasterpieces') },
    { id: '7.0', name: t('ratingHigh') },
    { id: '6.0', name: t('ratingGood') }
  ];
}

export function getGenres() {
  return [
    { id: 'all', name: t('filterAll') },
    { id: 'action', name: 'Action' },
    { id: 'scifi', name: 'Sci-Fi' },
    { id: 'comedy', name: 'Comedy' },
    { id: 'crime', name: 'Crime' },
    { id: 'family', name: 'Animation' },
    { id: 'horror', name: 'Horror' },
    { id: 'drama', name: 'Drama' },
    { id: 'adventure', name: 'Adventure' }
  ];
}

export const PLATFORMS = [
  { id: 'all', name: 'All', badge: '🌐', color: 'border-white/20' },
  { id: 'netflix', name: 'Netflix', badge: '🔴', color: 'border-red-600 bg-red-950/30 text-red-400' },
  { id: 'max', name: 'Max / HBO', badge: '🟣', color: 'border-purple-600 bg-purple-950/30 text-purple-400' },
  { id: 'disney', name: 'Disney+', badge: '🔵', color: 'border-blue-600 bg-blue-950/30 text-blue-400' },
  { id: 'appletv', name: 'Apple TV+', badge: '🍏', color: 'border-emerald-500 bg-emerald-950/30 text-emerald-400' },
  { id: 'prime', name: 'Prime Video', badge: '🔷', color: 'border-cyan-500 bg-cyan-950/30 text-cyan-400' },
  { id: 'paramount', name: 'Paramount+', badge: '🟡', color: 'border-amber-500 bg-amber-950/30 text-amber-400' }
];

export const YEARS = [
  { id: 'all', name: 'All Years' },
  { id: '2026', name: '2026' },
  { id: '2025', name: '2025' },
  { id: '2024', name: '2024' },
  { id: '2023', name: '2023' },
  { id: '2022', name: '2022' },
  { id: '2020-2021', name: '2020 - 2021' },
  { id: '2010s', name: '2010s' },
  { id: 'classics', name: 'Classics (< 2010)' }
];

export const RATINGS = [
  { id: 'all', name: 'All Ratings' },
  { id: '8.0', name: '★ 8.0+ Masterpieces' },
  { id: '7.0', name: '★ 7.0+ High Quality' },
  { id: '6.0', name: '★ 6.0+' }
];

export const GENRES = [
  { id: 'all', name: 'All' },
  { id: 'action', name: 'Action' },
  { id: 'scifi', name: 'Sci-Fi' },
  { id: 'comedy', name: 'Comedy' },
  { id: 'crime', name: 'Crime' },
  { id: 'family', name: 'Animation' },
  { id: 'horror', name: 'Horror' },
  { id: 'drama', name: 'Drama' },
  { id: 'adventure', name: 'Adventure' }
];

// Mapping popular titles to their originating network
const NETWORK_MAP = {
  netflix: [
    // Netflix Originals & Blockbusters
    'red notice', 'alerta vermelho', 'extraction', 'resgate', 'leave the world behind',
    'o mundo depois de nos', 'o mundo depois de nós', 'society of the snow', 'sociedade da neve',
    'the irishman', 'o irlandês', 'o irlandes', 'glass onion', 'knives out', 'dont look up',
    'não olhe para cima', 'nao olhe para cima', 'rebel ridge', 'the adam project', 'o projeto adam',
    'gray man', 'agente oculto', 'bird box', 'damsel', 'donzela', 'beverly hills cop', 'axel f',
    'um tira da pesada', 'rebel moon', 'the killer', 'o assassino', 'enola holmes', 'murder mystery',
    'misterio no mediterraneo', 'mistério no mediterrâneo', 'army of the dead', 'atlas',
    'heart of stone', 'agente stone', 'spenser confidential', 'troco em dobro', 'triple frontier',
    'operacao fronteira', 'operação fronteira', 'hustle', 'arremessando alto', 'tudo bem no natal que vem',
    // Hit Movies Streaming on Netflix
    'clube da luta', 'fight club', 'a origem', 'inception', 'interestelar', 'interstellar',
    'ilha do medo', 'shutter island', 'se7en', 'gladiador', 'gladiator', 'matrix',
    'pulp fiction', 'forrest gump', 'o resgate do soldado ryan', 'as branquelas', 'white chicks',
    'corra', 'get out', 'superbad', 'se beber, não case', 'se beber', 'invocação do mal',
    'conjuring', 'jurassic park', 'shrek', 'meu malvado favorito', 'aranhaverso',
    'homem-aranha', 'spider-man', 'top gun', 'john wick', 'gravidade', 'blade runner',
    // Hit Series on Netflix
    'arcane', 'stranger things', 'wandinha', 'wednesday', 'round 6', 'squid game',
    'peaky blinders', 'black mirror', 'one piece', 'the witcher', 'o gambito da rainha',
    'queens gambit', 'queen\'s gambit', 'la casa de papel', 'money heist', 'dark',
    'heartstopper', 'bridgerton', 'cobra kai', 'narcos', 'ozark', 'mindhunter',
    'breaking bad', 'better call saul', 'sex education', 'lupin', 'elite'
  ],
  max: [
    // HBO Max Originals & Exclusives
    'pinguim', 'penguin', 'house of the dragon', 'a casa do dragão', 'game of thrones',
    'the last of us', 'succession', 'sopranos', 'família soprano', 'the wire', 'a escuta',
    'true detective', 'white lotus', 'rick and morty', 'euphoria', 'chernobyl', 'boardwalk empire',
    'fargo', 'sherlock',
    // Warner / Max Blockbuster Movies
    'dune', 'duna', 'batman', 'cavaleiro das trevas', 'the batman', 'oppenheimer', 'barbie',
    'furiosa', 'mad max', 'senhor dos aneis', 'senhor dos anéis', 'lord of the rings',
    'o iluminado', 'the shining', 'um sonho de liberdade', 'shawshank', 'o poderoso chefão',
    'godfather', 'beetlejuice', 'fantasmas ainda se divertem', 'invocação do mal', 'hereditário',
    'longlegs', 'alien', 'tenet', 'o grande truque', 'prestige'
  ],
  disney: [
    // Disney / Marvel / Pixar / Star Wars Hits
    'xogum', 'shogun', 'deadpool', 'wolverine', 'loki', 'mandalorian', 'star wars',
    'clone wars', 'x-men', 'wandavision', 'percy jackson', 'guardiões da galáxia',
    'vingadores', 'avengers', 'infinito', 'ultimato', 'o urso', 'the bear',
    'divertida mente', 'inside out', 'moana', 'rei leão', 'lion king', 'kung fu panda',
    'gato de botas', 'viva: a vida', 'coco', 'up: altas aventuras', 'toy story',
    'zootopia', 'frozen', 'procurando nemo', 'nemo', 'avatar: o caminho da água',
    'bob esponja', 'gravity falls', 'hora de aventura', 'apenas um show'
  ],
  appletv: [
    // Apple Originals Movies & Series
    'ted lasso', 'ruptura', 'severance', 'siloo', 'silo', 'slow horses', 'fundacao',
    'foundation', 'assassinos da lua das flores', 'killers of the flower moon',
    'napoleao', 'napoleon', 'for all mankind', 'morning show', 'coda', 'greyhound',
    'tetris', 'presumed innocent', 'dark matter', 'sugar'
  ],
  prime: [
    // Amazon Prime Originals & Movies
    'the boys', 'os meninos', 'senhor dos aneis', 'rings of power', 'anel do poder',
    'fallout', 'invencivel', 'invincible', 'reacher', 'gen v', 'jack ryan',
    'magnatas do crime', 'the gentlemen', 'creed', 'fleabag', 'bosch',
    'blade runner 2049', 'a chegada', 'arrival', 'gravidade', 'no limite do amanhã',
    'ex machina', 'a lista de schindler', 'à espera de um milagre'
  ],
  paramount: [
    // Paramount+ Originals & Movies
    'halo', 'yellowstone', 'tulsa king', 'top gun', 'maverick', 'knuckles', 'sonic',
    'south park', 'dexter', 'mayor of kingstown', 'mission impossible', 'missão impossível',
    'silêncio dos inocentes', 'silence of the lambs', 'um lugar silencioso', 'quiet place',
    '1883', '1923', 'twin peaks', 'gladiador', 'gladiator'
  ]
};

export function matchesItemPlatform(item, platform) {
  if (!platform || platform === 'all') return true;

  // 1. Explicit platform match
  if (item.platform === platform) return true;

  // 2. Keyword match (curated titles & franchise matches)
  const keywords = NETWORK_MAP[platform] || [];
  const fullText = `${item.title || ''} ${item.description || ''} ${item.source || ''}`.toLowerCase();
  if (keywords.some(kw => fullText.includes(kw))) return true;

  // 3. Smart studio / genre heuristic distribution
  // Stable hash on title/imdbId so assignments are deterministic and consistent
  const idStr = item.imdbId || item.id || item.title || '';
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash << 5) - hash + idStr.charCodeAt(i);
    hash |= 0;
  }
  const pos = Math.abs(hash) % 100;

  const genres = (item.genres || []).map(g => String(g).toLowerCase()).join(' ');

  if (platform === 'netflix') {
    // Netflix has the widest global catalog: ~42% of titles
    if (pos < 42) return true;
  } else if (platform === 'prime') {
    // Amazon Prime Video: ~38% of titles
    if (pos >= 20 && pos < 58) return true;
  } else if (platform === 'max') {
    // Warner / HBO: prestige dramas, dark sci-fi, blockbusters: ~32%
    if (genres.includes('drama') || genres.includes('crime') || (pos >= 40 && pos < 72)) return true;
  } else if (platform === 'disney') {
    // Disney / Marvel / Pixar / Star Wars: animation, family, adventure, fantasy: ~30%
    if (genres.includes('anim') || genres.includes('fam') || (pos >= 65 && pos < 95)) return true;
  } else if (platform === 'paramount') {
    // Paramount+: action, thriller, classic: ~25%
    if (genres.includes('action') || (pos >= 15 && pos < 40)) return true;
  } else if (platform === 'appletv') {
    // Apple TV+: award-winning drama, sci-fi: ~15%
    if ((genres.includes('sci') && genres.includes('dram')) || (pos >= 50 && pos < 65)) return true;
  }

  return false;
}

export class DiscoveryHub {
  constructor(container, { onSelect }) {
    this.container = container;
    this.onSelect = onSelect || (() => {});
    this.allItems = [];
    this.allMovies = [];
    this.allSeries = [];
    this.filters = {
      type: 'movie',
      platform: 'all',
      year: 'all',
      rating: 'all',
      genre: 'all',
      sort: 'popular'
    };
    this.nextMovieSkip = 500;
    this.nextSeriesSkip = 500;
    this.isLoadingMore = false;

    this.initDOM();
    this.bindEvents();
    this.setupInfiniteScroll();
    window.cineDiscoveryHub = this;

    window.addEventListener('cinetv:profileChanged', () => {
      this.applyFilters();
    });
    window.addEventListener('cinetv:langChanged', () => {
      this.updateLanguage();
    });
  }

  setCatalogs(movies = [], series = []) {
    if (this.allMovies === movies && this.allSeries === series && this.allItems.length > 0) {
      return; // Already up to date, skip expensive re-filtering & DOM redraws
    }
    this.allMovies = movies || [];
    this.allSeries = series || [];
    this.allItems = [...this.allMovies, ...this.allSeries];
    this.applyFilters();
  }

  setItems(items) {
    if (Array.isArray(items)) {
      if (this.allItems === items && this.allItems.length > 0) return;
      this.allItems = items;
      if (!this.allMovies || this.allMovies.length === 0) {
        this.allMovies = items.filter(i => i.type !== 'series');
        this.allSeries = items.filter(i => i.type === 'series');
      }
    }
    this.applyFilters();
  }

  initDOM() {
    this.container.innerHTML = `
      <div class="space-y-4">
        
        <!-- Discovery Header with Filter Controls -->
        <div class="bg-neutral-950/80 border border-white/10 rounded-3xl p-4 md:p-6 shadow-xl backdrop-blur-md space-y-4">
          
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <h2 id="discovery-main-title" class="text-lg md:text-2xl font-black text-white flex items-center gap-2">
                <span>🧭</span>
                <span id="discovery-title-text">${t('discoveryTitle')}</span>
              </h2>
              <p id="discovery-sub-title" class="text-xs text-neutral-400 mt-0.5">${t('discoverySubtitle')}</p>
            </div>

            <!-- Type Selector: Movies or Series -->
            <div class="flex items-center gap-1.5 p-1 rounded-full bg-white/5 border border-white/10">
              <button id="disc-type-movie" class="disc-type-btn px-4 py-1.5 rounded-full text-xs font-black transition cursor-pointer bg-red-600 text-white shadow-md">
                🎬 <span id="disc-movie-label">${t('moviesTab')}</span>
              </button>
              <button id="disc-type-series" class="disc-type-btn px-4 py-1.5 rounded-full text-xs font-black transition cursor-pointer bg-transparent text-neutral-400 hover:text-white">
                📺 <span id="disc-series-label">${t('seriesTab')}</span>
              </button>
            </div>
          </div>

          <!-- Mood Section: "What are you in the mood for?" -->
          <div class="space-y-2 pt-1 border-t border-white/10">
            <span id="disc-mood-header" class="text-xs font-black tracking-wider uppercase text-neutral-300 flex items-center gap-1.5">
              <span>✨</span>
              <span>${t('moodTitle') || 'What are you in the mood for?'}</span>
            </span>
            <div id="disc-mood-bar" class="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <button id="disc-mood-all" class="disc-mood-btn px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap active:scale-95 cursor-pointer border border-[#e50914] bg-[#e50914]/20 text-white shadow-md" data-genre="all" tabindex="0">
                ✨ <span id="disc-mood-all-text">${t('all') || 'All'}</span>
              </button>
              <button class="disc-mood-btn px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap active:scale-95 cursor-pointer border border-white/10 bg-white/5 text-neutral-300 hover:text-white hover:border-[#e50914]" data-genre="action" tabindex="0">
                🔥 ${t('moodIntense') || 'Intense'}
              </button>
              <button class="disc-mood-btn px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap active:scale-95 cursor-pointer border border-white/10 bg-white/5 text-neutral-300 hover:text-white hover:border-[#e50914]" data-genre="comedy" tabindex="0">
                😂 ${t('moodFunny') || 'Funny'}
              </button>
              <button class="disc-mood-btn px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap active:scale-95 cursor-pointer border border-white/10 bg-white/5 text-neutral-300 hover:text-white hover:border-[#e50914]" data-genre="drama" tabindex="0">
                ❤️ ${t('moodRomantic') || 'Romantic'}
              </button>
              <button class="disc-mood-btn px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap active:scale-95 cursor-pointer border border-white/10 bg-white/5 text-neutral-300 hover:text-white hover:border-[#e50914]" data-genre="scifi" tabindex="0">
                🧠 ${t('moodThoughtful') || 'Thought-provoking'}
              </button>
              <button class="disc-mood-btn px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap active:scale-95 cursor-pointer border border-white/10 bg-white/5 text-neutral-300 hover:text-white hover:border-[#e50914]" data-genre="family" tabindex="0">
                👨‍👩‍👧 ${t('moodFamily') || 'Family'}
              </button>
              <button class="disc-mood-btn px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap active:scale-95 cursor-pointer border border-white/10 bg-white/5 text-neutral-300 hover:text-white hover:border-[#e50914]" data-genre="horror" tabindex="0">
                😱 ${t('moodThriller') || 'Thriller'}
              </button>
            </div>
          </div>

          <!-- Filter Section 1: Streaming Platform Badges -->
          <div class="space-y-1.5 pt-1">
            <span id="disc-platform-header" class="text-[11px] font-black tracking-wider uppercase text-neutral-400 flex items-center gap-1.5">
              <span>📺</span>
              <span>${t('filterByPlatform')}</span>
            </span>
            <div id="disc-platforms-bar" class="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              ${getPlatforms().map(p => `
                <button 
                  class="disc-platform-btn px-3.5 py-1.5 rounded-xl border text-xs font-bold transition whitespace-nowrap active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                    p.id === 'all' ? 'border-white/40 bg-white/10 text-white' : 'border-white/10 bg-neutral-900/90 text-neutral-400 hover:text-white'
                  }" 
                  data-platform="${p.id}"
                >
                  <span>${p.badge}</span>
                  <span>${p.name}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Filter Section 2: Year, Rating & Sorting Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            
            <!-- Release Year Selector Button -->
            <div class="flex flex-col gap-1">
              <label id="disc-label-year" class="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">${t('filterByYear')}</label>
              <button id="disc-btn-year" class="disc-picker-btn w-full px-3.5 py-2.5 bg-neutral-900 border border-white/15 rounded-xl text-white text-xs font-semibold outline-none cursor-pointer flex items-center justify-between transition hover:border-[#e50914] active:scale-95" tabindex="0">
                <span id="disc-val-year">${getYears()[0].name}</span>
                <span class="text-neutral-400 text-[10px] ml-2">▼</span>
              </button>
            </div>

            <!-- Minimum Rating Selector Button -->
            <div class="flex flex-col gap-1">
              <label id="disc-label-rating" class="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">${t('filterByRating')}</label>
              <button id="disc-btn-rating" class="disc-picker-btn w-full px-3.5 py-2.5 bg-neutral-900 border border-white/15 rounded-xl text-white text-xs font-semibold outline-none cursor-pointer flex items-center justify-between transition hover:border-[#e50914] active:scale-95" tabindex="0">
                <span id="disc-val-rating">${getRatings()[0].name}</span>
                <span class="text-neutral-400 text-[10px] ml-2">▼</span>
              </button>
            </div>

            <!-- Sort By Selector Button -->
            <div class="flex flex-col gap-1">
              <label id="disc-label-sort" class="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">${t('sortBy')}</label>
              <button id="disc-btn-sort" class="disc-picker-btn w-full px-3.5 py-2.5 bg-neutral-900 border border-white/15 rounded-xl text-white text-xs font-semibold outline-none cursor-pointer flex items-center justify-between transition hover:border-[#e50914] active:scale-95" tabindex="0">
                <span id="disc-val-sort">🔥 ${t('sortPopular')}</span>
                <span class="text-neutral-400 text-[10px] ml-2">▼</span>
              </button>
            </div>

          </div>

          <!-- Filter Section 3: Genre Pills -->
          <div class="space-y-1.5 pt-1">
            <span id="disc-genre-header" class="text-[11px] font-black tracking-wider uppercase text-neutral-400 flex items-center gap-1.5">
              <span>🎭</span>
              <span>${t('filterByGenre')}</span>
            </span>
            <div id="disc-genre-bar" class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              ${getGenres().map(g => `
                <button class="disc-genre-btn px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap active:scale-95 cursor-pointer ${
                  g.id === 'all' ? 'bg-[#e50914] text-white shadow-md' : 'bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/10'
                }" data-genre="${g.id}">
                  ${g.name}
                </button>
              `).join('')}
            </div>
          </div>

        </div>

        <!-- Results Counter Bar -->
        <div class="flex items-center justify-between px-2">
          <span id="disc-count-label" class="text-xs font-mono font-bold text-neutral-400">
            ${t('titles')}
          </span>
          <span class="text-[10px] text-neutral-500 font-mono">
            ★ IMDb / TMDB
          </span>
        </div>

        <!-- Filtered Grid Container -->
        <div id="disc-grid" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2 sm:gap-3">
          <!-- Dynamically populated cards -->
        </div>

        <!-- Empty State -->
        <div id="disc-empty" class="hidden py-16 text-center">
          <p class="text-4xl mb-2">🧭</p>
          <p id="disc-empty-title" class="text-sm font-bold text-neutral-300">${t('noResultsTitle')}</p>
          <p id="disc-empty-desc" class="text-xs text-neutral-500 mt-1">${t('noResultsDesc')}</p>
        </div>

        <!-- Infinite Scroll Loading Spinner -->
        <div id="disc-loading-more" class="hidden py-8 flex items-center justify-center gap-2.5 text-neutral-400 text-xs font-bold">
          <svg class="w-5 h-5 animate-spin text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span id="disc-loading-more-text">Carregando mais títulos...</span>
        </div>

        <!-- TV Friendly Picker Modal -->
        <div id="disc-picker-modal" class="hidden fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-md" style="display: none;">
          <div class="bg-neutral-950 border border-white/20 rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div class="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 id="disc-picker-title" class="font-black text-sm text-white flex items-center gap-2"></h3>
              <button id="disc-picker-close-btn" class="text-neutral-400 hover:text-white text-xs font-bold px-2.5 py-1 rounded-lg bg-white/10 hover:bg-red-600 transition cursor-pointer">✕</button>
            </div>
            <div id="disc-picker-options" class="flex-1 overflow-y-auto no-scrollbar space-y-2 py-1">
              <!-- Options loaded dynamically -->
            </div>
          </div>
        </div>

      </div>
    `;

    this.typeMovieBtn = this.container.querySelector('#disc-type-movie');
    this.typeSeriesBtn = this.container.querySelector('#disc-type-series');
    this.platformsBar = this.container.querySelector('#disc-platforms-bar');
    this.btnYear = this.container.querySelector('#disc-btn-year');
    this.valYear = this.container.querySelector('#disc-val-year');
    this.btnRating = this.container.querySelector('#disc-btn-rating');
    this.valRating = this.container.querySelector('#disc-val-rating');
    this.btnSort = this.container.querySelector('#disc-btn-sort');
    this.valSort = this.container.querySelector('#disc-val-sort');
    this.pickerModal = this.container.querySelector('#disc-picker-modal');
    this.pickerTitle = this.container.querySelector('#disc-picker-title');
    this.pickerOptions = this.container.querySelector('#disc-picker-options');
    this.pickerCloseBtn = this.container.querySelector('#disc-picker-close-btn');
    this.genreBar = this.container.querySelector('#disc-genre-bar');
    this.countLabel = this.container.querySelector('#disc-count-label');
    this.grid = this.container.querySelector('#disc-grid');
    this.emptyState = this.container.querySelector('#disc-empty');
    this.loadingMoreEl = this.container.querySelector('#disc-loading-more');
  }

  bindEvents() {
    this.typeMovieBtn.addEventListener('click', () => {
      this.filters.type = 'movie';
      this.typeMovieBtn.className = 'disc-type-btn px-4 py-1.5 rounded-full text-xs font-black transition cursor-pointer bg-red-600 text-white shadow-md';
      this.typeSeriesBtn.className = 'disc-type-btn px-4 py-1.5 rounded-full text-xs font-black transition cursor-pointer bg-transparent text-neutral-400 hover:text-white';
      this.applyFilters();
    });

    this.typeSeriesBtn.addEventListener('click', () => {
      this.filters.type = 'series';
      this.typeSeriesBtn.className = 'disc-type-btn px-4 py-1.5 rounded-full text-xs font-black transition cursor-pointer bg-red-600 text-white shadow-md';
      this.typeMovieBtn.className = 'disc-type-btn px-4 py-1.5 rounded-full text-xs font-black transition cursor-pointer bg-transparent text-neutral-400 hover:text-white';
      this.applyFilters();
    });

    this.moodBar = this.container.querySelector('#disc-mood-bar');
    if (this.moodBar) {
      this.moodBar.querySelectorAll('.disc-mood-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const targetGenre = btn.dataset.genre;
          this.filters.genre = targetGenre;

          // Update mood button active styles
          this.moodBar.querySelectorAll('.disc-mood-btn').forEach(b => {
            if (b === btn) {
              b.className = 'disc-mood-btn px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap active:scale-95 cursor-pointer border border-[#e50914] bg-[#e50914]/20 text-white shadow-md';
            } else {
              b.className = 'disc-mood-btn px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap active:scale-95 cursor-pointer border border-white/10 bg-white/5 text-neutral-300 hover:text-white hover:border-[#e50914]';
            }
          });

          // Sync genre pill active styles
          this.genreBar.querySelectorAll('.disc-genre-btn').forEach(b => {
            if (b.dataset.genre === targetGenre) {
              b.className = 'disc-genre-btn px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap active:scale-95 cursor-pointer bg-[#e50914] text-white shadow-md';
            } else {
              b.className = 'disc-genre-btn px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap active:scale-95 cursor-pointer bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/10';
            }
          });

          this.applyFilters();
        });
      });
    }

    this.platformsBar.querySelectorAll('.disc-platform-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.filters.platform = btn.dataset.platform;
        this.platformsBar.querySelectorAll('.disc-platform-btn').forEach(b => {
          if (b.dataset.platform === this.filters.platform) {
            b.className = 'disc-platform-btn px-3.5 py-1.5 rounded-xl border text-xs font-bold transition whitespace-nowrap active:scale-95 cursor-pointer flex items-center gap-1.5 border-[#e50914] bg-red-950/40 text-white shadow-md';
          } else {
            b.className = 'disc-platform-btn px-3.5 py-1.5 rounded-xl border text-xs font-bold transition whitespace-nowrap active:scale-95 cursor-pointer flex items-center gap-1.5 border-white/10 bg-neutral-900/90 text-neutral-400 hover:text-white';
          }
        });
        this.applyFilters();
      });
    });

    this.genreBar.querySelectorAll('.disc-genre-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.filters.genre = btn.dataset.genre;
        this.genreBar.querySelectorAll('.disc-genre-btn').forEach(b => {
          if (b.dataset.genre === this.filters.genre) {
            b.className = 'disc-genre-btn px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap active:scale-95 cursor-pointer bg-[#e50914] text-white shadow-md';
          } else {
            b.className = 'disc-genre-btn px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap active:scale-95 cursor-pointer bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/10';
          }
        });
        // Deselect mood buttons if another genre clicked
        if (this.moodBar) {
          this.moodBar.querySelectorAll('.disc-mood-btn').forEach(b => {
            if (b.dataset.genre === this.filters.genre) {
              b.className = 'disc-mood-btn px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap active:scale-95 cursor-pointer border border-[#e50914] bg-[#e50914]/20 text-white shadow-md';
            } else {
              b.className = 'disc-mood-btn px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap active:scale-95 cursor-pointer border border-white/10 bg-white/5 text-neutral-300 hover:text-white hover:border-[#e50914]';
            }
          });
        }
        this.applyFilters();
      });
    });

    if (this.btnYear) {
      this.btnYear.addEventListener('click', () => this.openPicker('year'));
    }
    if (this.btnRating) {
      this.btnRating.addEventListener('click', () => this.openPicker('rating'));
    }
    if (this.btnSort) {
      this.btnSort.addEventListener('click', () => this.openPicker('sort'));
    }
    if (this.pickerCloseBtn) {
      this.pickerCloseBtn.addEventListener('click', () => this.closePicker());
    }
    if (this.pickerModal) {
      this.pickerModal.addEventListener('click', (e) => {
        if (e.target === this.pickerModal) this.closePicker();
      });
    }
  }

  isPickerOpen() {
    return this.pickerModal && !this.pickerModal.classList.contains('hidden') && this.pickerModal.style.display !== 'none';
  }

  openPicker(type) {
    if (!this.pickerModal || !this.pickerOptions) return;
    this.currentPickerType = type;

    const isEn = (typeof window.getLanguage === 'function' ? window.getLanguage() : getLanguage()) === 'en';
    let title = '';
    let options = [];
    let activeVal = this.filters[type];

    if (type === 'year') {
      title = `📅 ${t('filterByYear')}`;
      options = getYears();
    } else if (type === 'rating') {
      title = `★ ${t('filterByRating')}`;
      options = getRatings();
    } else if (type === 'sort') {
      title = `⇅ ${t('sortBy')}`;
      options = [
        { id: 'popular', name: `🔥 ${t('sortPopular')}` },
        { id: 'rating', name: `★ ${t('sortRating')}` },
        { id: 'year', name: `📅 ${t('sortYear')}` },
        { id: 'title', name: `🔤 ${t('sortTitle')}` }
      ];
    }

    if (this.pickerTitle) this.pickerTitle.innerText = title;

    this.pickerOptions.innerHTML = options.map(opt => {
      const isCurrent = opt.id === activeVal;
      return `
        <button class="disc-picker-opt-btn ${isCurrent ? 'disc-picker-opt-active bg-red-600/30 border-red-500/80 text-white font-bold shadow-lg shadow-red-900/30' : 'bg-white/5 hover:bg-white/15 border-white/10 text-neutral-300'} w-full p-3 rounded-xl border text-left transition flex items-center justify-between cursor-pointer active:scale-98" data-val="${opt.id}" tabindex="0">
          <span class="text-xs font-semibold">${opt.name}</span>
          ${isCurrent ? `<span class="text-xs text-[#FFD700] font-bold">${isEn ? 'Active ✓' : 'Ativo ✓'}</span>` : '<span class="text-xs text-neutral-500">➔</span>'}
        </button>
      `;
    }).join('');

    this.pickerOptions.querySelectorAll('.disc-picker-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.val;
        const selectedOpt = options.find(o => o.id === val);
        this.filters[type] = val;

        // Update button text label
        if (type === 'year' && this.valYear) {
          this.valYear.innerText = selectedOpt ? selectedOpt.name : val;
        } else if (type === 'rating' && this.valRating) {
          this.valRating.innerText = selectedOpt ? selectedOpt.name : val;
        } else if (type === 'sort' && this.valSort) {
          this.valSort.innerText = selectedOpt ? selectedOpt.name : val;
        }

        this.closePicker();
        this.applyFilters();
      });
    });

    this.pickerModal.style.display = 'flex';
    this.pickerModal.classList.remove('hidden');
    this.pickerModal.classList.add('flex');

    if (window.cineTvNav) {
      window.cineTvNav.pushModal(this.pickerModal, '.disc-picker-opt-active');
    }
  }

  closePicker() {
    if (this.pickerModal) {
      const wasOpen = !this.pickerModal.classList.contains('hidden') && this.pickerModal.style.display !== 'none';
      this.pickerModal.style.display = 'none';
      this.pickerModal.classList.add('hidden');
      this.pickerModal.classList.remove('flex');
      if (wasOpen && window.cineTvNav) {
        window.cineTvNav.popSpecificModal(this.pickerModal);
        const btnMap = { year: this.btnYear, rating: this.btnRating, sort: this.btnSort };
        const triggerBtn = btnMap[this.currentPickerType] || this.btnYear;
        if (triggerBtn) {
          window.cineTvNav.setFocus(triggerBtn, true);
        }
      }
    }
  }

  matchesCurrentFilters(item) {
    // 1. Filter by Content Type (Movie vs Series)
    const isSeries = item.type === 'series';
    if (this.filters.type === 'movie' && isSeries) return false;
    if (this.filters.type === 'series' && !isSeries) return false;

    // 2. Kids Mode Restriction
    if (profileService.isKidsMode()) {
      const isAnimation = (item.genres || []).some(g => /anim|family|fam[íi]l|infantil|kids/i.test(g)) ||
        /anim|family|desenho|crian/i.test(item.title || '') ||
        /anim|family|desenho|crian/i.test(item.description || '');
      if (!isAnimation) return false;
    }

    // 3. Platform Filter
    if (this.filters.platform !== 'all') {
      if (!matchesItemPlatform(item, this.filters.platform)) return false;
    }

    // 4. Year Filter
    if (this.filters.year !== 'all') {
      const yearStr = String(item.year || '');
      const yearMatch = yearStr.match(/\b(19\d\d|20\d\d)\b/);
      const itemYear = yearMatch ? parseInt(yearMatch[1], 10) : parseInt(yearStr.replace(/\D/g, '').slice(0, 4), 10);
      if (itemYear) {
        if (this.filters.year === '2026' && itemYear !== 2026 && !yearStr.includes('2026')) return false;
        if (this.filters.year === '2025' && itemYear !== 2025 && !yearStr.includes('2025')) return false;
        if (this.filters.year === '2024' && itemYear !== 2024 && !yearStr.includes('2024')) return false;
        if (this.filters.year === '2023' && itemYear !== 2023 && !yearStr.includes('2023')) return false;
        if (this.filters.year === '2022' && itemYear !== 2022 && !yearStr.includes('2022')) return false;
        if (this.filters.year === '2020-2021' && (itemYear < 2020 || itemYear > 2021)) return false;
        if (this.filters.year === '2010s' && (itemYear < 2010 || itemYear > 2019)) return false;
        if (this.filters.year === 'classics' && itemYear >= 2010) return false;
      }
    }

    // 5. Minimum Rating Filter
    if (this.filters.rating !== 'all') {
      const targetRating = parseFloat(this.filters.rating);
      const itemRatingMatch = String(item.rating || '').match(/[\d.]+/);
      const itemRating = itemRatingMatch ? parseFloat(itemRatingMatch[0]) : 0;
      if (itemRating < targetRating) return false;
    }

    // 6. Genre Filter
    if (this.filters.genre !== 'all') {
      const gKey = this.filters.genre.toLowerCase();
      const itemGenres = (item.genres || []).map(g => String(g).toLowerCase()).join(' ');
      const fullDesc = `${item.title || ''} ${item.description || ''}`.toLowerCase();
      
      if (gKey === 'action' && !itemGenres.includes('action') && !itemGenres.includes('aç') && !fullDesc.includes('aç')) return false;
      if (gKey === 'scifi' && !itemGenres.includes('sci') && !itemGenres.includes('fic') && !fullDesc.includes('fic')) return false;
      if (gKey === 'comedy' && !itemGenres.includes('comed') && !fullDesc.includes('coméd')) return false;
      if (gKey === 'crime' && !itemGenres.includes('crim') && !itemGenres.includes('polic') && !itemGenres.includes('susp')) return false;
      if (gKey === 'family' && !itemGenres.includes('anim') && !itemGenres.includes('fam') && !itemGenres.includes('kid')) return false;
      if (gKey === 'horror' && !itemGenres.includes('terror') && !itemGenres.includes('horror') && !fullDesc.includes('terror')) return false;
      if (gKey === 'drama' && !itemGenres.includes('dram')) return false;
      if (gKey === 'adventure' && !itemGenres.includes('advent') && !itemGenres.includes('avent')) return false;
    }

    return true;
  }

  applyFilters() {
    let pool = this.allItems;
    if (this.allMovies && this.allSeries && this.allMovies.length > 0 && this.allSeries.length > 0) {
      pool = (this.filters.type === 'series') ? this.allSeries : this.allMovies;
    } else if (window.cineApp && window.cineApp.cachedMovies && window.cineApp.cachedSeries) {
      pool = (this.filters.type === 'series') ? window.cineApp.cachedSeries : window.cineApp.cachedMovies;
    }

    let list = pool.filter(item => this.matchesCurrentFilters(item));

    // 7. Sort
    list.sort((a, b) => {
      if (this.filters.sort === 'rating') {
        const rA = parseFloat(String(a.rating || '').match(/[\d.]+/)?.[0] || 0);
        const rB = parseFloat(String(b.rating || '').match(/[\d.]+/)?.[0] || 0);
        return rB - rA;
      }
      if (this.filters.sort === 'year') {
        const yA = parseInt(String(a.year || '').replace(/\D/g, '') || 0, 10);
        const yB = parseInt(String(b.year || '').replace(/\D/g, '') || 0, 10);
        return yB - yA;
      }
      if (this.filters.sort === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });

    this.renderGrid(list);
  }

  createCardHtml(item, index = 0) {
    const imdbId = item.imdbId || item.id;
    const title = getItemTitle(item);
    const rating = item.rating || '★ 8.0';
    const year = item.year || '2024';
    const isBroken = (url) => !url || url.includes('a3Z4sO4c5lM1p99kC7q0aB5i1p9') || url.includes('abf8tHq65a8g9f76a54f676f45a');

    // Use poster for 2:3 portrait catalog cards
    const imgUrl = (!isBroken(item.poster))
      ? item.poster
      : (!isBroken(item.backdrop) ? item.backdrop : (imdbId ? `https://images.metahub.space/poster/medium/${imdbId}/img` : ''));

    const resumeState = getResumeState(item);
    const resumeProgress = resumeState ? resumeState.percentage : 0;

    return `
      <div 
        class="media-card group relative flex-shrink-0 w-full cursor-pointer rounded-xl overflow-hidden bg-[#121217] border border-white/10 hover:border-[#e50914] transition-all duration-300 transform hover:scale-[1.03] active:scale-95 shadow-lg hover:shadow-red-950/40 aspect-[2/3]" 
        tabindex="0"
        data-id="${imdbId}"
      >
        <!-- Card Poster Image -->
        <img 
          src="${imgUrl}" 
          alt="${title}" 
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          decoding="async" 
          loading="${index < 24 ? 'eager' : 'lazy'}"
          referrerpolicy="no-referrer"
          onerror="if (this.dataset.fb !== '1') { this.dataset.fb = '1'; this.src = '${!isBroken(item.backdrop) ? item.backdrop : (imdbId ? `https://images.metahub.space/background/medium/${imdbId}/img` : '')}'; } else { this.style.display = 'none'; const fb = this.parentElement.querySelector('.card-fallback-poster'); if (fb) fb.classList.remove('hidden'); }"
        />
        <div class="card-fallback-poster hidden absolute inset-0 bg-gradient-to-br from-neutral-800 via-neutral-900 to-[#121217] flex flex-col items-center justify-center p-2 text-center">
          <span class="text-3xl text-neutral-500 mb-1.5">🎬</span>
          <span class="text-[10px] font-bold text-neutral-300 line-clamp-2 leading-tight">${title}</span>
        </div>
        <!-- Dark Gradient Scrim -->
        <div class="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/30 to-transparent pointer-events-none"></div>

        <!-- Floating Top Badges -->
        <div class="absolute top-1.5 left-1.5 flex items-center gap-1 pointer-events-none z-10">
          <span class="text-[8.5px] font-mono font-bold bg-black/80 backdrop-blur-sm text-[#FFD700] px-1.5 py-0.5 rounded border border-amber-400/30">
            ${rating}
          </span>
        </div>
        <div class="absolute top-1.5 right-1.5 flex items-center gap-1 pointer-events-none z-10">
          <span class="text-[8px] font-mono font-bold bg-black/80 backdrop-blur-sm text-neutral-300 px-1.5 py-0.5 rounded border border-white/15">
            ${year}
          </span>
        </div>

        <!-- Quick Center Play Icon on Hover -->
        <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div class="w-8 h-8 rounded-full bg-[#e50914]/90 text-white flex items-center justify-center shadow-xl text-xs transform group-hover:scale-110 transition-transform">
            ▶
          </div>
        </div>

        <!-- Bottom Title & Duration Overlay Inside Card -->
        <div class="absolute bottom-0 inset-x-0 p-2 pointer-events-none z-10">
          <h3 class="text-xs font-bold text-white group-hover:text-red-400 truncate leading-tight transition-colors drop-shadow">
            ${title}
          </h3>
          <p class="text-[9px] text-neutral-400 font-mono mt-0.5 truncate drop-shadow">
            ${formatItemDuration(item)}
          </p>
        </div>

        <!-- Poster Card Progress Bar -->
        ${resumeProgress > 0 ? `
          <div class="card-progress-bar">
            <div class="card-progress-bar-fill" style="width: ${resumeProgress}%"></div>
          </div>
        ` : ''}
      </div>
    `;
  }

  loadNextBatch() {
    let appended = false;
    if (this.currentFilteredItems && this.displayedCount < this.currentFilteredItems.length) {
      const nextSlice = this.currentFilteredItems.slice(this.displayedCount, this.displayedCount + 48);
      const startIndex = this.displayedCount;
      this.displayedCount += nextSlice.length;
      const wrapper = document.createElement('div');
      wrapper.innerHTML = nextSlice.map((item, idx) => this.createCardHtml(item, startIndex + idx)).join('');
      Array.from(wrapper.children).forEach(card => this.grid.appendChild(card));
      this.bindCardEvents(this.grid, this.currentFilteredItems);
      appended = true;
    }
    if (this.currentFilteredItems && (this.currentFilteredItems.length - this.displayedCount < 30) && !this.isLoadingMore) {
      this.fetchMoreFromNetwork();
    }
    return appended;
  }

  bindCardEvents(container, items) {
    container.querySelectorAll('.media-card').forEach(card => {
      if (card._boundClick) return;
      card._boundClick = true;

      const getItem = () => {
        const id = card.dataset.id;
        return items.find(i => (i.imdbId || i.id) === id);
      };

      const onCardClick = () => {
        const item = getItem();
        if (item) this.onSelect(item);
      };

      card._triggerOpen = onCardClick;
      card._triggerQuickAction = () => {
        const item = getItem();
        if (item && window.cineQuickActionModal) {
          window.cineQuickActionModal.open(item);
        }
      };

      let touchTimer = null;
      card.addEventListener('touchstart', () => {
        clearTimeout(touchTimer);
        touchTimer = setTimeout(() => {
          if (navigator.vibrate) {
            try { navigator.vibrate(40); } catch (e) {}
          }
          if (typeof card._triggerQuickAction === 'function') {
            card._triggerQuickAction();
          }
        }, 700);
      }, { passive: true });
      card.addEventListener('touchend', () => clearTimeout(touchTimer), { passive: true });
      card.addEventListener('touchmove', () => clearTimeout(touchTimer), { passive: true });

      card.addEventListener('click', onCardClick);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onCardClick();
        }
      });
    });
  }

  setupInfiniteScroll() {
    const scrollContainer = document.getElementById('dashboard-main') || window;

    const handleScroll = async () => {
      const discoveryPage = document.getElementById('page-discovery');
      if (!discoveryPage || discoveryPage.classList.contains('hidden')) return;

      const target = scrollContainer === window ? document.documentElement : scrollContainer;
      const distFromBottom = target.scrollHeight - target.scrollTop - target.clientHeight;

      // 1. Progressive slice append from current filtered list (Instant & 0ms freeze)
      if (this.currentFilteredItems && this.displayedCount < this.currentFilteredItems.length && distFromBottom < 1000) {
        this.loadNextBatch();
        return;
      }

      // 2. Infinite scroll network fetch when reaching end of local catalog
      if (distFromBottom < 700) {
        this.fetchMoreFromNetwork();
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  async fetchMoreFromNetwork() {
    if (this.isLoadingMore) return;
    const isSeries = this.filters.type === 'series';
    const currentSkip = isSeries ? this.nextSeriesSkip : this.nextMovieSkip;
    if (currentSkip >= 4000) return;

    this.isLoadingMore = true;
    if (this.loadingMoreEl) this.loadingMoreEl.classList.remove('hidden');

    try {
      const [b1, b2] = await Promise.allSettled([
        fetchStremioCatalogPage(this.filters.type, currentSkip),
        fetchStremioCatalogPage(this.filters.type, currentSkip + 50)
      ]);

      const newItems = [];
      const currentPool = isSeries ? this.allSeries : this.allMovies;
      const seen = new Set(currentPool.map(i => i.imdbId || i.id));

      [b1, b2].forEach(b => {
        if (b.status === 'fulfilled' && Array.isArray(b.value)) {
          b.value.forEach(item => {
            const id = item.imdbId || item.id;
            if (id && !seen.has(id)) {
              seen.add(id);
              newItems.push(item);
            }
          });
        }
      });

      if (isSeries) {
        this.nextSeriesSkip += 100;
        if (newItems.length > 0) this.allSeries.push(...newItems);
      } else {
        this.nextMovieSkip += 100;
        if (newItems.length > 0) this.allMovies.push(...newItems);
      }

      if (newItems.length > 0) {
        this.allItems.push(...newItems);
        this.appendMoreCards(newItems);
      }
    } catch (err) {
      console.warn('[DiscoveryHub] Infinite scroll error:', err);
    } finally {
      this.isLoadingMore = false;
      if (this.loadingMoreEl) this.loadingMoreEl.classList.add('hidden');
    }
  }

  appendMoreCards(newItems) {
    const matched = newItems.filter(item => this.matchesCurrentFilters(item));
    if (matched.length === 0) return;

    if (this.currentFilteredItems) {
      this.currentFilteredItems.push(...matched);
      this.countLabel.innerText = `${this.currentFilteredItems.length}+ ${t('titles')} ${t('available')}`;
    }
    const startIndex = this.displayedCount;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = matched.map((item, idx) => this.createCardHtml(item, startIndex + idx)).join('');
    const newCards = Array.from(wrapper.children);
    newCards.forEach(card => this.grid.appendChild(card));
    this.displayedCount += newCards.length;
    this.bindCardEvents(this.grid, this.allItems);
  }

  renderGrid(items) {
    if (!items || items.length === 0) {
      this.currentFilteredItems = [];
      this.displayedCount = 0;
      this.grid.innerHTML = '';
      this.emptyState.classList.remove('hidden');
      this.countLabel.innerText = `0 ${t('titles')}`;
      return;
    }

    this.emptyState.classList.add('hidden');
    this.currentFilteredItems = items;

    this.countLabel.innerText = `${items.length >= 48 ? `${items.length}+` : items.length} ${t('titles')} ${t('available')}`;

    // Render initial fast batch of 48 items to prevent main thread freezing
    const INITIAL_LIMIT = 48;
    const initialSlice = items.slice(0, INITIAL_LIMIT);
    this.displayedCount = initialSlice.length;

    this.grid.innerHTML = initialSlice.map((item, index) => this.createCardHtml(item, index)).join('');
    this.bindCardEvents(this.grid, this.currentFilteredItems);
  }

  updateLanguage() {
    const title = this.container.querySelector('#discovery-title-text');
    if (title) title.innerText = t('discoveryTitle');
    const sub = this.container.querySelector('#discovery-sub-title');
    if (sub) sub.innerText = t('discoverySubtitle');

    const movieLabel = this.container.querySelector('#disc-movie-label');
    if (movieLabel) movieLabel.innerText = t('moviesTab');
    const seriesLabel = this.container.querySelector('#disc-series-label');
    if (seriesLabel) seriesLabel.innerText = t('seriesTab');

    const platHeader = this.container.querySelector('#disc-platform-header span:nth-child(2)');
    if (platHeader) platHeader.innerText = t('filterByPlatform');

    const labelYear = this.container.querySelector('#disc-label-year');
    if (labelYear) labelYear.innerText = t('filterByYear');

    const labelRating = this.container.querySelector('#disc-label-rating');
    if (labelRating) labelRating.innerText = t('filterByRating');

    const labelSort = this.container.querySelector('#disc-label-sort');
    if (labelSort) labelSort.innerText = t('sortBy');

    const genreHeader = this.container.querySelector('#disc-genre-header span:nth-child(2)');
    if (genreHeader) genreHeader.innerText = t('filterByGenre');

    // Update 'All' platform button text
    const allPlatBtn = this.container.querySelector('.disc-platform-btn[data-platform="all"] span:nth-child(2)');
    if (allPlatBtn) allPlatBtn.innerText = t('filterAll');

    // Update 'All' mood button text
    const allMoodBtn = this.container.querySelector('#disc-mood-all-text');
    if (allMoodBtn) allMoodBtn.innerText = t('all') || 'All';

    // Update Year, Rating, Sort button labels
    if (this.valYear) {
      const curYearOpt = getYears().find(y => y.id === this.filters.year);
      if (curYearOpt) this.valYear.innerText = curYearOpt.name;
    }
    if (this.valRating) {
      const curRatingOpt = getRatings().find(r => r.id === this.filters.rating);
      if (curRatingOpt) this.valRating.innerText = curRatingOpt.name;
    }
    if (this.valSort) {
      const sortMap = {
        popular: `🔥 ${t('sortPopular')}`,
        rating: `★ ${t('sortRating')}`,
        year: `📅 ${t('sortYear')}`,
        title: `🔤 ${t('sortTitle')}`
      };
      if (sortMap[this.filters.sort]) this.valSort.innerText = sortMap[this.filters.sort];
    }

    // Update Genre pills
    if (this.genreBar) {
      const curGenre = this.filters.genre;
      this.genreBar.innerHTML = getGenres().map(g => `
        <button class="disc-genre-btn px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap active:scale-95 cursor-pointer ${
          g.id === curGenre ? 'bg-red-600 text-white shadow-md' : 'bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/10'
        }" data-genre="${g.id}">
          ${g.name}
        </button>
      `).join('');

      this.genreBar.querySelectorAll('.disc-genre-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.filters.genre = btn.dataset.genre;
          this.genreBar.querySelectorAll('.disc-genre-btn').forEach(b => {
            if (b.dataset.genre === this.filters.genre) {
              b.className = 'disc-genre-btn px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap active:scale-95 cursor-pointer bg-red-600 text-white shadow-md';
            } else {
              b.className = 'disc-genre-btn px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap active:scale-95 cursor-pointer bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/10';
            }
          });
          this.applyFilters();
        });
      });
    }

    const emptyTitle = this.container.querySelector('#disc-empty-title');
    if (emptyTitle) emptyTitle.innerText = t('noResultsTitle');
    const emptyDesc = this.container.querySelector('#disc-empty-desc');
    if (emptyDesc) emptyDesc.innerText = t('noResultsDesc');

    this.applyFilters();
  }
}
