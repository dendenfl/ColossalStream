import { t, getItemTitle, formatItemDuration, localizeGenre, getLanguage } from '../services/i18n.js';
import { fetchCatalogBatch } from '../services/stremio.js';
import { getResumeState } from '../services/storage.js';

const GENRE_ALIASES = {
  all: ['all', 'todos'],
  action: ['action', 'acao', 'ação', 'luta'],
  adventure: ['adventure', 'aventura'],
  'sci-fi': ['sci-fi', 'scifi', 'science fiction', 'ficcao', 'ficção', 'ficção científica', 'fantasy', 'fantasia'],
  comedy: ['comedy', 'comedia', 'comédia', 'humor', 'engraçado', 'funny'],
  drama: ['drama', 'dramático', 'dramatico'],
  crime: ['crime', 'policial', 'crim', 'mistério', 'misterio', 'mystery', 'investigação', 'investigacao', 'suspense', 'thriller', 'noir'],
  horror: ['horror', 'terror', 'medo', 'gore', 'slasher', 'assustador'],
  animation: ['animation', 'animacao', 'animação', 'anime', 'desenho', 'family', 'família', 'familia', 'infantil', 'kids']
};

function normalizeText(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function matchesGenre(item, targetGenre) {
  if (!targetGenre || targetGenre === 'all') return true;
  const targetKey = normalizeText(targetGenre);
  const aliases = GENRE_ALIASES[targetKey] || [targetKey];

  if (!item.genres || !Array.isArray(item.genres) || item.genres.length === 0) {
    const fullText = normalizeText((item.title || '') + ' ' + (item.description || ''));
    return aliases.some(a => fullText.includes(normalizeText(a)));
  }

  return item.genres.some(g => {
    const normG = normalizeText(g);
    return aliases.some(a => {
      const normA = normalizeText(a);
      return normG.includes(normA) || normA.includes(normG);
    });
  });
}

/**
 * CatalogModal Component
 * Full-screen scrollable grid view showing ALL movies or series
 * with dynamic pagination (infinite load more), live genre filtering,
 * and instant access to details modal.
 */
export class CatalogModal {
  constructor(container, { onSelect }) {
    this.container = container;
    this.onSelect = onSelect || (() => {});
    this.allItems = [];
    this.filteredItems = [];
    this.currentType = 'movie';
    this.selectedGenre = 'all';
    this.skip = 50;
    this.isLoadingMore = false;
    this.hasMore = true;

    this.initDOM();
    this.bindEvents();
    window.cineCatalogInstance = this;

    window.addEventListener('cinetv:langChanged', () => {
      if (this.isOpen()) {
        this.updateLanguage();
        this.render();
      }
    });
  }

  isOpen() {
    return this.overlay && !this.overlay.classList.contains('hidden');
  }

  initDOM() {
    this.container.innerHTML = `
      <div id="catalog-overlay" class="fixed inset-0 bg-black/95 z-40 hidden flex-col select-none overflow-hidden backdrop-blur-md">
        
        <!-- Sticky Top Header with Status Bar Clearance -->
        <header class="flex-shrink-0 bg-neutral-950/90 border-b border-white/10 px-3 pt-14 pb-3 flex flex-col gap-2.5 shadow-xl">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <!-- Back Button -->
              <button id="catalog-back-btn" class="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-red-600 text-white flex items-center gap-1.5 text-xs font-bold transition active:scale-95 border border-white/15 shadow cursor-pointer">
                <span class="text-sm leading-none">←</span>
                <span id="catalog-back-label">${t('back')}</span>
              </button>

              <h2 id="catalog-header-title" class="text-base md:text-lg font-black text-white tracking-wide">
                ${t('allMoviesTitle')}
              </h2>

              <span id="catalog-count-badge" class="text-[10px] md:text-xs font-mono font-bold bg-red-950/60 border border-red-500/40 text-red-400 px-2.5 py-0.5 rounded-full">
                0 ${t('titles')}
              </span>
            </div>

            <!-- Close Button -->
            <button id="catalog-close-btn" class="w-9 h-9 rounded-full bg-white/10 hover:bg-red-600 text-white flex items-center justify-center text-base font-bold transition border border-white/15 active:scale-90 cursor-pointer" aria-label="Close">
              ✕
            </button>
          </div>

          <!-- Genre Filter Pills Carousel -->
          <div id="catalog-genre-bar" class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <!-- Dynamically populated -->
          </div>
        </header>

        <!-- Scrollable Grid Body -->
        <main id="catalog-grid-container" class="flex-1 overflow-y-auto px-2.5 md:px-5 py-4 scroll-smooth">
          <div id="catalog-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 md:gap-3.5">
            <!-- Dynamically populated cards -->
          </div>

          <!-- Empty State -->
          <div id="catalog-empty" class="hidden py-16 text-center">
            <p class="text-3xl mb-2">🎬</p>
            <p class="text-sm font-bold text-neutral-300">${t('noResultsTitle')}</p>
          </div>

          <!-- Load More Trigger Container -->
          <div id="catalog-load-more-container" class="py-8 flex flex-col items-center justify-center gap-2">
            <button id="catalog-load-more-btn" class="px-6 py-2.5 bg-neutral-900 hover:bg-red-600 text-white border border-white/15 hover:border-red-500 rounded-2xl font-bold text-xs md:text-sm transition-all shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer">
              <span id="catalog-load-more-icon">▾</span>
              <span id="catalog-load-more-text">${t('loadMore')}</span>
            </button>
            <p id="catalog-load-more-hint" class="text-[10px] text-neutral-400 font-mono">
              +50 ${t('titles')} (Cinemeta HD)
            </p>
          </div>
        </main>

      </div>
    `;

    this.overlay = this.container.querySelector('#catalog-overlay');
    this.closeBtn = this.container.querySelector('#catalog-close-btn');
    this.backBtn = this.container.querySelector('#catalog-back-btn');
    this.backLabel = this.container.querySelector('#catalog-back-label');
    this.headerTitle = this.container.querySelector('#catalog-header-title');
    this.countBadge = this.container.querySelector('#catalog-count-badge');
    this.genreBar = this.container.querySelector('#catalog-genre-bar');
    this.gridContainer = this.container.querySelector('#catalog-grid-container');
    this.grid = this.container.querySelector('#catalog-grid');
    this.emptyState = this.container.querySelector('#catalog-empty');
    
    this.loadMoreContainer = this.container.querySelector('#catalog-load-more-container');
    this.loadMoreBtn = this.container.querySelector('#catalog-load-more-btn');
    this.loadMoreIcon = this.container.querySelector('#catalog-load-more-icon');
    this.loadMoreText = this.container.querySelector('#catalog-load-more-text');
    this.loadMoreHint = this.container.querySelector('#catalog-load-more-hint');
  }

  updateLanguage() {
    if (this.backLabel) this.backLabel.innerText = t('back');
    if (this.headerTitle) {
      this.headerTitle.innerText = this.currentType === 'series' ? t('allSeriesTitle') : t('allMoviesTitle');
    }
    if (this.loadMoreText && !this.isLoadingMore) {
      this.loadMoreText.innerText = this.hasMore ? t('loadMore') : t('allLoaded');
    }
    this.renderGenrePills();
    this.filterItems();
  }

  show(items, type = 'movie', initialGenre = 'all') {
    this.currentType = type;
    this.allItems = items ? [...items] : [];
    this.selectedGenre = initialGenre || 'all';
    this.skip = 50;
    this.hasMore = true;
    this.isLoadingMore = false;

    this.updateLanguage();
    this.renderGenrePills();
    this.filterItems();
    this.render();

    // If a specific genre was requested and local items are scarce, fetch dynamic batch
    if (this.selectedGenre !== 'all' && this.filteredItems.length < 20) {
      this.fetchGenreBatch(this.selectedGenre);
    }

    this.overlay.classList.remove('hidden');
    this.overlay.classList.add('flex');
    document.body.classList.add('modal-open');

    if (window.cineTvNav) {
      window.cineTvNav.pushModal(this.overlay, '.catalog-card');
    }

    // Scroll back to top
    if (this.gridContainer) {
      this.gridContainer.scrollTop = 0;
    }
  }

  close() {
    this.overlay.classList.add('hidden');
    this.overlay.classList.remove('flex');
    document.body.classList.remove('modal-open');
    if (window.cineTvNav) {
      window.cineTvNav.popModal();
    }
  }

  getAvailableCount(genre, isMovie) {
    const isPt = (localStorage.getItem('cinetv_lang') || 'pt') === 'pt';
    const thousandSep = isPt ? '.' : ',';

    const rawCounts = isMovie ? {
      all: 3500,
      action: 950,
      adventure: 800,
      'sci-fi': 650,
      comedy: 850,
      drama: 1200,
      crime: 550,
      horror: 450,
      animation: 400
    } : {
      all: 1800,
      action: 450,
      adventure: 380,
      'sci-fi': 320,
      comedy: 480,
      drama: 850,
      crime: 420,
      horror: 220,
      animation: 280
    };

    const gKey = (genre || 'all').toLowerCase();
    const count = rawCounts[gKey] || (isMovie ? 2500 : 1200);

    const formatted = count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, thousandSep);
    return `${formatted}+`;
  }

  filterItems() {
    if (this.selectedGenre === 'all') {
      this.filteredItems = [...this.allItems];
    } else {
      this.filteredItems = this.allItems.filter(item => matchesGenre(item, this.selectedGenre));
    }

    if (this.countBadge) {
      const isMovie = this.currentType === 'movie';
      const available = this.getAvailableCount(this.selectedGenre, isMovie);
      this.countBadge.innerText = `${this.filteredItems.length} ${t('loaded')} · ${available} ${t('available')}`;
    }
  }

  renderGenrePills() {
    const GENRES = [
      { id: 'all', labelKey: 'filterAll' },
      { id: 'Action', label: 'Action' },
      { id: 'Adventure', label: 'Adventure' },
      { id: 'Sci-Fi', label: 'Sci-Fi' },
      { id: 'Comedy', label: 'Comedy' },
      { id: 'Drama', label: 'Drama' },
      { id: 'Crime', label: 'Crime' },
      { id: 'Horror', label: 'Horror' },
      { id: 'Animation', label: 'Animation' }
    ];

    this.genreBar.innerHTML = GENRES.map(g => {
      const isAct = this.selectedGenre.toLowerCase() === g.id.toLowerCase();
      const text = g.labelKey ? t(g.labelKey) : localizeGenre(g.label);
      return `
        <button 
          data-genre="${g.id}" 
          class="genre-chip px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
            isAct 
              ? 'bg-red-600 text-white border-red-500 shadow-lg scale-105' 
              : 'bg-white/5 text-neutral-300 border-white/10 hover:bg-white/15'
          }"
        >
          ${text}
        </button>
      `;
    }).join('');
  }

  render() {
    if (!this.filteredItems || this.filteredItems.length === 0) {
      this.grid.innerHTML = '';
      this.emptyState.classList.remove('hidden');
      if (this.loadMoreContainer) this.loadMoreContainer.classList.add('hidden');
      return;
    }

    this.emptyState.classList.add('hidden');
    if (this.loadMoreContainer) this.loadMoreContainer.classList.remove('hidden');

    this.grid.innerHTML = this.filteredItems.map((item, index) => {
      const imdbId = item.imdbId || item.id;
      const isBroken = (url) => !url || url.includes('a3Z4sO4c5lM1p99kC7q0aB5i1p9') || url.includes('abf8tHq65a8g9f76a54f676f45a');
      const rating = item.rating || '★ 8.0';
      const year = item.year || '2024';
      const title = getItemTitle(item);

      const imgUrl = (!isBroken(item.backdrop))
        ? item.backdrop
        : (!isBroken(item.poster) ? item.poster : (imdbId ? `https://images.metahub.space/background/medium/${imdbId}/img` : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80'));

      const resumeState = getResumeState(item);
      const resumeProgress = resumeState ? resumeState.percentage : 0;

      return `
        <div 
          class="catalog-card media-card group relative flex-shrink-0 w-full cursor-pointer rounded-xl overflow-hidden bg-neutral-900 border border-white/10 hover:border-red-500 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-red-900/40 aspect-video"
          data-index="${index}"
          data-id="${imdbId}"
          tabindex="0"
        >
          <!-- Card Backdrop Image -->
          <img 
            src="${imgUrl}" 
            alt="${title}" 
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
            loading="lazy" 
            referrerpolicy="no-referrer"
            onerror="if (this.dataset.fb !== '1') { this.dataset.fb = '1'; this.src = '${item.poster || (imdbId ? `https://images.metahub.space/poster/medium/${imdbId}/img` : '')}'; }"
          />
          <!-- Dark Gradient Overlay for Text Readability -->
          <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none"></div>

          <!-- Floating Top Badges -->
          <div class="absolute top-1.5 left-1.5 flex items-center gap-1 pointer-events-none z-10">
            <span class="text-[8px] sm:text-[9px] font-mono font-bold bg-black/80 backdrop-blur-sm text-amber-400 px-1.5 py-0.5 rounded border border-amber-400/30">
              ${rating}
            </span>
            ${item.season && item.episode ? `
              <span class="text-[8px] sm:text-[9px] font-mono font-bold bg-red-600 text-white px-1.5 py-0.5 rounded shadow">
                S${item.season}:E${item.episode}
              </span>
            ` : `
              <span class="text-[8px] sm:text-[9px] font-mono font-bold bg-black/80 backdrop-blur-sm text-white/90 px-1.5 py-0.5 rounded border border-white/20">
                ${year}
              </span>
            `}
          </div>

          <!-- Quick Center Play Icon on Hover/Active -->
          <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div class="w-7 h-7 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-xl text-xs transform group-hover:scale-110 transition-transform">
              ▶
            </div>
          </div>

          <!-- Bottom Title & Duration Overlay (Inside Card) -->
          <div class="absolute bottom-0 inset-x-0 p-1.5 pointer-events-none z-10">
            <h3 class="text-[10.5px] sm:text-xs font-bold text-white group-hover:text-red-400 truncate leading-tight transition-colors drop-shadow">
              ${title}
            </h3>
            <p class="text-[8.5px] sm:text-[9px] text-neutral-400 font-mono mt-0.5 truncate drop-shadow">
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
    }).join('');

    this.bindCardEvents();
  }

  bindCardEvents() {
    this.grid.querySelectorAll('.catalog-card').forEach(card => {
      const getItem = () => {
        const index = parseInt(card.dataset.index, 10);
        return this.filteredItems[index];
      };

      const handleSelect = () => {
        const item = getItem();
        if (item) {
          this.onSelect(item);
        }
      };

      card._triggerOpen = handleSelect;
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

      card.addEventListener('click', handleSelect);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSelect();
      });
    });
  }

  async fetchGenreBatch(genre) {
    if (!genre || genre === 'all') return;
    try {
      if (this.filteredItems.length === 0) {
        if (this.emptyState) this.emptyState.classList.add('hidden');
        if (this.grid) {
          this.grid.innerHTML = `
            <div class="col-span-full py-16 flex flex-col items-center justify-center gap-3">
              <div class="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              <p class="text-xs text-neutral-400 font-mono tracking-wider">${t('loadingTitles') || 'Carregando títulos...'}</p>
            </div>
          `;
        }
      }
      const batch = await fetchCatalogBatch(this.currentType, genre, 0);
      if (batch && batch.length > 0) {
        this.mergeBatch(batch);
      } else {
        this.render();
      }
    } catch (e) {
      console.warn('[CatalogModal] fetchGenreBatch error:', e);
      this.render();
    }
  }

  mergeBatch(batch) {
    if (!batch || batch.length === 0) return;
    const itemMap = new Map();
    this.allItems.forEach(i => {
      const k = i.imdbId || i.id;
      if (k) itemMap.set(k, i);
    });

    batch.forEach(incoming => {
      const key = incoming.imdbId || incoming.id;
      if (!key) return;
      if (itemMap.has(key)) {
        const existing = itemMap.get(key);
        if (Array.isArray(incoming.genres) && incoming.genres.length > 0) {
          const combined = new Set([...(existing.genres || []), ...incoming.genres]);
          existing.genres = Array.from(combined);
        }
      } else {
        this.allItems.push(incoming);
        itemMap.set(key, incoming);
      }
    });

    this.filterItems();
    this.render();
  }

  async loadMore() {
    if (this.isLoadingMore || !this.hasMore) return;
    this.isLoadingMore = true;

    if (this.loadMoreText) this.loadMoreText.innerText = t('loadingMore');
    if (this.loadMoreIcon) this.loadMoreIcon.className = 'inline-block animate-spin';

    try {
      const genreParam = this.selectedGenre === 'all' ? null : this.selectedGenre;
      const batch = await fetchCatalogBatch(this.currentType, genreParam, this.skip);

      if (!batch || batch.length === 0) {
        this.hasMore = false;
        if (this.loadMoreText) this.loadMoreText.innerText = t('allLoaded');
        if (this.loadMoreIcon) {
          this.loadMoreIcon.className = '';
          this.loadMoreIcon.innerText = '✓';
        }
      } else {
        this.skip += 50;
        this.mergeBatch(batch);
        if (this.loadMoreText) this.loadMoreText.innerText = t('loadMore');
        if (this.loadMoreIcon) {
          this.loadMoreIcon.className = '';
          this.loadMoreIcon.innerText = '▾';
        }
      }
    } catch (err) {
      console.warn('[CatalogModal] loadMore failed:', err);
      if (this.loadMoreText) this.loadMoreText.innerText = t('loadMore');
      if (this.loadMoreIcon) {
        this.loadMoreIcon.className = '';
        this.loadMoreIcon.innerText = '▾';
      }
    } finally {
      this.isLoadingMore = false;
    }
  }

  bindEvents() {
    const handleClose = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      this.close();
    };

    this.closeBtn.addEventListener('click', handleClose);
    this.closeBtn.addEventListener('touchend', handleClose);
    this.closeBtn.addEventListener('pointerdown', handleClose);

    if (this.backBtn) {
      this.backBtn.addEventListener('click', handleClose);
      this.backBtn.addEventListener('touchend', handleClose);
      this.backBtn.addEventListener('pointerdown', handleClose);
    }

    // Genre Bar Filtering
    this.genreBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.genre-chip');
      if (btn && btn.dataset.genre) {
        this.selectedGenre = btn.dataset.genre;
        this.skip = 0;
        this.hasMore = true;
        this.renderGenrePills();
        this.filterItems();
        this.render();

        if (this.selectedGenre !== 'all' && this.filteredItems.length < 20) {
          this.fetchGenreBatch(this.selectedGenre);
        }

        if (this.gridContainer) {
          this.gridContainer.scrollTop = 0;
        }
      }
    });

    // Load More Button
    this.loadMoreBtn.addEventListener('click', () => {
      this.loadMore();
    });

    // Infinite Scroll trigger near bottom of container
    this.gridContainer.addEventListener('scroll', () => {
      if (this.isLoadingMore || !this.hasMore) return;
      const threshold = 350;
      const distFromBottom = this.gridContainer.scrollHeight - this.gridContainer.scrollTop - this.gridContainer.clientHeight;
      if (distFromBottom < threshold) {
        this.loadMore();
      }
    }, { passive: true });

    window.addEventListener('keydown', (e) => {
      if (this.isOpen() && (e.key === 'Escape' || e.key === 'Backspace')) {
        this.close();
      }
    });
  }
}
