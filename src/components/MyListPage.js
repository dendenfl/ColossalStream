import { getWatchlist } from '../services/storage.js';
import { t, getItemTitle, formatItemDuration } from '../services/i18n.js';

/**
 * MyListPage Component
 * Dedicated page for the user's saved Watchlist / "Minha Lista".
 * Features:
 * - 2:3 Portrait cards matching the streaming aesthetic
 * - Filter pills: All, Movies, Series
 * - Empty state with "Explore Catalog" CTA
 * - TV Remote D-Pad friendly
 * - Real-time sync with local storage & Supabase
 */
export class MyListPage {
  constructor(container, { onSelect, onExplore } = {}) {
    this.container = container;
    this.onSelect = onSelect || (() => {});
    this.onExplore = onExplore || (() => {});
    this.currentFilter = 'all'; // 'all' | 'movie' | 'series'
    this.allItems = [];

    this.initDOM();
    this.bindEvents();
    this.refresh();
  }

  initDOM() {
    this.container.innerHTML = `
      <section class="space-y-4 px-2 md:px-4 py-3 select-none">
        <!-- Header: Title & Filter Pills -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
          <div class="flex items-center gap-2.5">
            <span class="text-xl">🔖</span>
            <h1 id="mylist-title" class="text-lg md:text-xl font-black text-white tracking-wide">
              ${t('myListTab')}
            </h1>
            <span id="mylist-total-badge" class="text-xs font-mono font-bold bg-[#e50914]/20 border border-[#e50914]/40 text-red-400 px-2.5 py-0.5 rounded-full">
              0
            </span>
          </div>

          <!-- Filter Pills (All, Movies, Series) -->
          <div id="mylist-filter-bar" class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button 
              id="mylist-filter-all"
              data-filter="all"
              class="mylist-filter-btn px-3.5 py-1 rounded-full text-xs font-bold transition cursor-pointer border active:scale-95 bg-[#e50914] text-white border-[#e50914] shadow"
            >
              ${t('filterAll')}
            </button>
            <button 
              id="mylist-filter-movies"
              data-filter="movie"
              class="mylist-filter-btn px-3.5 py-1 rounded-full text-xs font-bold transition cursor-pointer border active:scale-95 bg-white/10 text-neutral-300 border-white/10 hover:bg-white/20 hover:text-white"
            >
              ${t('moviesTab')}
            </button>
            <button 
              id="mylist-filter-series"
              data-filter="series"
              class="mylist-filter-btn px-3.5 py-1 rounded-full text-xs font-bold transition cursor-pointer border active:scale-95 bg-white/10 text-neutral-300 border-white/10 hover:bg-white/20 hover:text-white"
            >
              ${t('seriesTab')}
            </button>
          </div>
        </div>

        <!-- Grid Container -->
        <div id="mylist-grid" class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2 sm:gap-3">
          <!-- Dynamic 2:3 portrait cards -->
        </div>

        <!-- Empty State Container -->
        <div id="mylist-empty" class="hidden flex flex-col items-center justify-center py-20 text-center px-4">
          <div class="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl mb-4 text-neutral-500 shadow-inner">
            🔖
          </div>
          <h2 id="mylist-empty-title" class="text-base sm:text-lg font-black text-white mb-1.5">
            ${t('emptyMyListTitle')}
          </h2>
          <p id="mylist-empty-desc" class="text-xs sm:text-sm text-neutral-400 max-w-sm mb-6 leading-relaxed">
            ${t('emptyMyListDesc')}
          </p>
          <button 
            id="mylist-btn-explore" 
            class="px-5 py-2.5 rounded-full bg-[#e50914] hover:bg-red-700 text-white font-bold text-xs sm:text-sm transition flex items-center gap-2 active:scale-95 shadow-lg shadow-red-950/60 cursor-pointer"
          >
            <span>🧭</span>
            <span id="mylist-explore-label">${t('exploreCatalog')}</span>
          </button>
        </div>
      </section>
    `;

    this.titleEl = this.container.querySelector('#mylist-title');
    this.totalBadgeEl = this.container.querySelector('#mylist-total-badge');
    this.gridEl = this.container.querySelector('#mylist-grid');
    this.emptyEl = this.container.querySelector('#mylist-empty');
    this.emptyTitleEl = this.container.querySelector('#mylist-empty-title');
    this.emptyDescEl = this.container.querySelector('#mylist-empty-desc');
    this.exploreBtn = this.container.querySelector('#mylist-btn-explore');
    this.exploreLabel = this.container.querySelector('#mylist-explore-label');
  }

  bindEvents() {
    // Filter buttons
    const filterBtns = this.container.querySelectorAll('.mylist-filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        this.setFilter(filter);
      });
    });

    // Explore button
    if (this.exploreBtn) {
      this.exploreBtn.addEventListener('click', () => {
        this.onExplore();
      });
    }

    // Grid item clicks
    this.gridEl.addEventListener('click', (e) => {
      const card = e.target.closest('.media-card');
      if (!card) return;
      const id = card.dataset.id;
      const item = this.allItems.find(i => (i.imdbId || i.id) === id);
      if (item) {
        this.onSelect(item);
      }
    });

    // Listen to changes
    window.addEventListener('cinetv:watchlistChanged', () => {
      this.refresh();
    });

    window.addEventListener('cinetv:langChanged', () => {
      this.updateLanguage();
      this.render();
    });
  }

  updateLanguage() {
    if (this.titleEl) this.titleEl.innerText = t('myListTab');
    if (this.emptyTitleEl) this.emptyTitleEl.innerText = t('emptyMyListTitle');
    if (this.emptyDescEl) this.emptyDescEl.innerText = t('emptyMyListDesc');
    if (this.exploreLabel) this.exploreLabel.innerText = t('exploreCatalog');

    const btnAll = this.container.querySelector('#mylist-filter-all');
    const btnMovies = this.container.querySelector('#mylist-filter-movies');
    const btnSeries = this.container.querySelector('#mylist-filter-series');
    if (btnAll) btnAll.innerText = t('filterAll');
    if (btnMovies) btnMovies.innerText = t('moviesTab');
    if (btnSeries) btnSeries.innerText = t('seriesTab');
  }

  setFilter(filter) {
    this.currentFilter = filter;
    const filterBtns = this.container.querySelectorAll('.mylist-filter-btn');
    filterBtns.forEach(btn => {
      const isActive = btn.dataset.filter === filter;
      btn.className = isActive
        ? 'mylist-filter-btn px-3.5 py-1 rounded-full text-xs font-bold transition cursor-pointer border active:scale-95 bg-[#e50914] text-white border-[#e50914] shadow'
        : 'mylist-filter-btn px-3.5 py-1 rounded-full text-xs font-bold transition cursor-pointer border active:scale-95 bg-white/10 text-neutral-300 border-white/10 hover:bg-white/20 hover:text-white';
    });
    this.render();
  }

  refresh() {
    const movies = getWatchlist('movie') || [];
    const series = getWatchlist('series') || [];
    this.allItems = [...movies, ...series];

    if (this.totalBadgeEl) {
      this.totalBadgeEl.innerText = `${this.allItems.length}`;
    }

    this.render();
  }

  getFilteredItems() {
    if (this.currentFilter === 'movie') {
      return this.allItems.filter(i => i.type !== 'series');
    }
    if (this.currentFilter === 'series') {
      return this.allItems.filter(i => i.type === 'series');
    }
    return this.allItems;
  }

  render() {
    const items = this.getFilteredItems();

    if (!items || items.length === 0) {
      this.gridEl.innerHTML = '';
      this.gridEl.classList.add('hidden');
      this.emptyEl.classList.remove('hidden');
      return;
    }

    this.emptyEl.classList.add('hidden');
    this.gridEl.classList.remove('hidden');

    this.gridEl.innerHTML = items.map((item, index) => {
      const imdbId = item.imdbId || item.id;
      const isBroken = (url) => !url || url.includes('a3Z4sO4c5lM1p99kC7q0aB5i1p9') || url.includes('abf8tHq65a8g9f76a54f676f45a');
      const rating = item.rating || '★ 8.0';
      const year = item.year || '2024';
      const isSeries = item.type === 'series';

      // Standard 2:3 portrait poster with fallback
      const imgUrl = !isBroken(item.poster)
        ? item.poster
        : (!isBroken(item.backdrop)
            ? item.backdrop
            : (imdbId ? `https://images.metahub.space/poster/medium/${imdbId}/img` : ''));

      return `
        <div 
          class="media-card group relative flex-shrink-0 w-full cursor-pointer rounded-xl overflow-hidden bg-[#121217] border border-white/10 hover:border-[#e50914] transition-all duration-300 transform hover:scale-[1.03] active:scale-95 shadow-lg hover:shadow-red-950/40 aspect-[2/3]"
          data-id="${imdbId}"
          data-index="${index}"
          tabindex="0"
        >
          <!-- Card Poster Image -->
          <img 
            src="${imgUrl}" 
            alt="${getItemTitle(item)}" 
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 relative z-0" 
            loading="lazy"
            referrerpolicy="no-referrer"
            onerror="if (!this.dataset.fb) { this.dataset.fb = '1'; this.src = '${!isBroken(item.backdrop) ? item.backdrop : ''}'; } else { this.style.opacity = '0'; }"
          />
          <!-- Dark Gradient Scrim -->
          <div class="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/30 to-transparent pointer-events-none"></div>

          <!-- Floating Badges -->
          <div class="absolute top-1.5 left-1.5 flex items-center gap-1 pointer-events-none z-10">
            <span class="text-[8.5px] font-mono font-bold bg-black/80 backdrop-blur-sm text-[#FFD700] px-1.5 py-0.5 rounded border border-amber-400/30">
              ${rating}
            </span>
          </div>
          <div class="absolute top-1.5 right-1.5 flex items-center gap-1 pointer-events-none z-10">
            <span class="text-[8px] font-mono font-bold bg-black/80 backdrop-blur-sm text-neutral-300 px-1.5 py-0.5 rounded border border-white/15">
              ${isSeries ? (t('seriesTab') || 'Série') : (t('moviesTab') || 'Filme')}
            </span>
          </div>

          <!-- Quick Center Play Icon on Hover -->
          <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div class="w-8 h-8 rounded-full bg-[#e50914]/90 text-white flex items-center justify-center shadow-xl text-xs transform group-hover:scale-110 transition-transform">
              ▶
            </div>
          </div>

          <!-- Bottom Title & Duration Inside Card -->
          <div class="absolute bottom-0 inset-x-0 p-2 pointer-events-none z-10">
            <h3 class="text-xs font-bold text-white group-hover:text-red-400 truncate leading-tight transition-colors drop-shadow">
              ${getItemTitle(item)}
            </h3>
            <p class="text-[9px] text-neutral-400 font-mono mt-0.5 truncate drop-shadow">
              ${year} ${item.duration ? `· ${formatItemDuration(item)}` : ''}
            </p>
          </div>
        </div>
      `;
    }).join('');

    // Attach custom open action for TV Remote Enter
    const cards = this.gridEl.querySelectorAll('.media-card');
    cards.forEach(card => {
      const id = card.dataset.id;
      const item = this.allItems.find(i => (i.imdbId || i.id) === id);
      if (item) {
        card._triggerOpen = () => this.onSelect(item);
      }
    });
  }
}
