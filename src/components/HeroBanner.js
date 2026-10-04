import { t, getItemTitle } from '../services/i18n.js';
import { isInWatchlist, toggleWatchlist } from '../services/storage.js';
import { showAppToast } from '../services/toast.js';

/**
 * HeroBanner Component
 * Cinematic widescreen spotlight hero carousel for TV and Mobile homepages.
 */
export class HeroBanner {
  constructor(container, { onPlay, onOpenDetails } = {}) {
    this.container = container;
    this.onPlay = onPlay || (() => {});
    this.onOpenDetails = onOpenDetails || (() => {});
    this.items = [];
    this.currentIndex = 0;
    this.autoTimer = null;

    this.initDOM();
    this.bindEvents();

    window.addEventListener('cinetv:langChanged', () => {
      this.updateLanguage();
    });

    window.addEventListener('cinetv:watchlistChanged', () => {
      this.updateWatchlistState();
    });
  }

  initDOM() {
    this.container.innerHTML = `
      <section id="hero-spotlight" class="relative w-full rounded-2xl md:rounded-3xl overflow-hidden bg-[#08080a] border border-white/10 shadow-2xl select-none mb-2 md:mb-3">
        <!-- Backdrop Image Container -->
        <div class="relative w-full h-[180px] sm:h-[250px] md:h-[310px] lg:h-[360px] overflow-hidden">
          <img 
            id="hero-backdrop" loading="lazy" 
            src="" 
            alt="Hero Spotlight" 
            class="w-full h-full object-cover object-top sm:object-center transition-opacity duration-700 opacity-0"
            referrerpolicy="no-referrer"
          />
          <!-- Multi-Directional Cinematic Gradient Fades -->
          <div class="absolute inset-0 bg-gradient-to-r from-[#08080a] via-[#08080a]/80 to-transparent z-10"></div>
          <div class="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/35 to-transparent z-10"></div>
          <div class="absolute inset-0 bg-gradient-to-b from-[#08080a]/60 via-transparent to-transparent z-10"></div>
        </div>

        <!-- Hero Content Overlay -->
        <div class="absolute inset-0 z-20 flex flex-col justify-end p-3.5 sm:p-5 md:p-7 max-w-2xl pointer-events-none">
          <!-- Spotlight Badge & Rating & Metadata Line -->
          <div class="flex items-center gap-1.5 mb-1.5 flex-wrap">
            <span class="text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-[#e50914] text-white px-2 py-0.5 rounded-md shadow-md">
              ✦ <span id="hero-badge-text">FEATURED</span>
            </span>
            <span id="hero-rating" class="text-[9px] sm:text-xs font-mono font-bold bg-black/70 backdrop-blur-md text-[#FFD700] px-1.5 py-0.5 rounded-md border border-amber-400/30">
              ★ 8.8
            </span>
            <span id="hero-year" class="text-[9px] sm:text-xs font-mono font-bold text-neutral-300 bg-white/10 px-1.5 py-0.5 rounded-md border border-white/10">
              2024
            </span>
            <span id="hero-duration" class="text-[9px] sm:text-xs font-mono font-bold text-neutral-400 bg-white/5 px-1.5 py-0.5 rounded-md">
              2h 46m
            </span>
            <span class="text-[8.5px] sm:text-[9.5px] font-mono font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-1.5 py-0.5 rounded-md">
              4K UHD
            </span>
          </div>

          <!-- Hero Title -->
          <h1 id="hero-title" class="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white drop-shadow-2xl tracking-tight leading-tight line-clamp-1 mb-1">
            Loading...
          </h1>

          <!-- Genre Trail (Clean dots without chunky pills) -->
          <div id="hero-genres" class="flex items-center gap-1.5 mb-1.5 flex-wrap text-[10px] sm:text-xs text-neutral-300 font-medium">
          </div>

          <!-- Overview / Description (Line-clamped) -->
          <p id="hero-desc" class="text-[11px] sm:text-xs md:text-sm text-neutral-300/90 line-clamp-2 leading-relaxed mb-2.5 drop-shadow hidden sm:block">
          </p>

          <!-- Interactive Action Buttons: Watch Now + My List + Details -->
          <div class="flex items-center gap-2 pointer-events-auto mt-0.5 flex-wrap">
            <!-- Primary CTA: Watch Now -->
            <button 
              id="hero-play-btn" 
              class="px-4 sm:px-5 py-2 rounded-xl bg-[#e50914] hover:bg-red-700 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-red-950/60 active:scale-95 transition-all cursor-pointer border border-red-500/30"
              tabindex="0"
            >
              <span class="text-xs">▶</span>
              <span id="hero-play-label">${t('watchNow') || 'Assistir'}</span>
            </button>

            <!-- Secondary: + My List -->
            <button 
              id="hero-watchlist-btn" 
              class="px-3.5 sm:px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 border border-white/15 active:scale-95 transition-all cursor-pointer backdrop-blur-md"
              tabindex="0"
            >
              <span id="hero-watchlist-icon" class="font-black">+</span>
              <span id="hero-watchlist-label">${t('addToWatchlist') || 'Minha Lista'}</span>
            </button>

            <!-- Info: Details -->
            <button 
              id="hero-info-btn" 
              class="px-3.5 sm:px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 border border-white/10 active:scale-95 transition-all cursor-pointer backdrop-blur-md"
              tabindex="0"
            >
              <span>ℹ</span>
              <span id="hero-info-label">${t('details') || 'Detalhes'}</span>
            </button>
          </div>
        </div>

        <!-- Carousel Dots Indicator (Bottom Right) -->
        <div id="hero-dots" class="absolute bottom-3 right-4 z-20 flex items-center gap-1.5 pointer-events-auto">
        </div>
      </section>
    `;

    this.backdropEl = this.container.querySelector('#hero-backdrop');
    this.titleEl = this.container.querySelector('#hero-title');
    this.ratingEl = this.container.querySelector('#hero-rating');
    this.yearEl = this.container.querySelector('#hero-year');
    this.durationEl = this.container.querySelector('#hero-duration');
    this.genresEl = this.container.querySelector('#hero-genres');
    this.descEl = this.container.querySelector('#hero-desc');
    this.playBtn = this.container.querySelector('#hero-play-btn');
    this.watchlistBtn = this.container.querySelector('#hero-watchlist-btn');
    this.watchlistIcon = this.container.querySelector('#hero-watchlist-icon');
    this.watchlistLabel = this.container.querySelector('#hero-watchlist-label');
    this.infoBtn = this.container.querySelector('#hero-info-btn');
    this.dotsEl = this.container.querySelector('#hero-dots');
    this.playLabel = this.container.querySelector('#hero-play-label');
    this.infoLabel = this.container.querySelector('#hero-info-label');
    this.badgeText = this.container.querySelector('#hero-badge-text');

    this.updateLanguage();
  }

  updateLanguage() {
    if (this.playLabel) this.playLabel.innerText = t('play') || 'Assistir';
    if (this.infoLabel) this.infoLabel.innerText = t('details') || 'Detalhes';
    if (this.badgeText) this.badgeText.innerText = t('spotlight') || 'Destaque';
    if (this.items && this.items.length > 0) {
      this.renderCurrent();
    }
  }

  bindEvents() {
    if (this.playBtn) {
      this.playBtn.addEventListener('click', () => {
        const item = this.getCurrentItem();
        if (item) this.onPlay(item);
      });
    }

    if (this.watchlistBtn) {
      this.watchlistBtn.addEventListener('click', () => {
        const item = this.getCurrentItem();
        if (!item) return;
        const added = toggleWatchlist(item);
        this.updateWatchlistState();
        if (typeof showAppToast === 'function') {
          const title = getItemTitle(item);
          showAppToast(`${title}: ${added ? (t('addedToWatchlist') || 'Adicionado à Minha Lista') : (t('itemRemoved') || 'Removido')}`, added ? '🔖' : '🗑️');
        }
      });
    }

    if (this.infoBtn) {
      this.infoBtn.addEventListener('click', () => {
        const item = this.getCurrentItem();
        if (item) this.onOpenDetails(item);
      });
    }

    // Pause auto-rotation on mouse hover
    const section = this.container.querySelector('#hero-spotlight');
    if (section) {
      section.addEventListener('mouseenter', () => this.stopAutoCycle());
      section.addEventListener('mouseleave', () => this.startAutoCycle());
    }
  }

  updateWatchlistState() {
    const item = this.getCurrentItem();
    if (!item || !this.watchlistBtn) return;
    const inList = isInWatchlist(item);
    if (this.watchlistIcon) this.watchlistIcon.innerText = inList ? '✓' : '+';
    if (this.watchlistLabel) this.watchlistLabel.innerText = inList ? (t('inMyList') || 'Na Minha Lista') : (t('addToWatchlist') || 'Minha Lista');
    if (inList) {
      this.watchlistBtn.className = 'px-3.5 sm:px-4 py-2 rounded-xl bg-red-600/30 hover:bg-red-600/40 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 border border-red-500/50 active:scale-95 transition-all cursor-pointer backdrop-blur-md shadow-md';
    } else {
      this.watchlistBtn.className = 'px-3.5 sm:px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 border border-white/15 active:scale-95 transition-all cursor-pointer backdrop-blur-md';
    }
  }

  setItems(items) {
    if (!items || items.length === 0) {
      this.container.classList.add('hidden');
      return;
    }
    const newSlice = items.slice(0, 6);
    if (this.items && this.items.length === newSlice.length && this.items.every((it, idx) => (it.imdbId || it.id) === (newSlice[idx].imdbId || newSlice[idx].id))) {
      return; // Already current, avoid re-rendering and image flashing
    }
    this.container.classList.remove('hidden');
    this.items = newSlice;
    this.currentIndex = 0;
    this.renderDots();
    this.renderCurrent();
    this.startAutoCycle();
  }

  getCurrentItem() {
    if (!this.items || this.items.length === 0) return null;
    return this.items[this.currentIndex];
  }

  renderDots() {
    if (!this.dotsEl) return;
    this.dotsEl.innerHTML = this.items.map((_, idx) => `
      <button 
        class="hero-dot h-1.5 rounded-full transition-all duration-300 cursor-pointer ${idx === this.currentIndex ? 'bg-[#e50914] w-5' : 'bg-white/30 hover:bg-white/60 w-1.5'}" 
        data-index="${idx}"
        aria-label="Slide ${idx + 1}"
      ></button>
    `).join('');

    this.dotsEl.querySelectorAll('.hero-dot').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.index, 10);
        this.goTo(idx);
      });
    });
  }

  renderCurrent() {
    const item = this.getCurrentItem();
    if (!item) return;

    const imdbId = item.imdbId || item.id;
    const isBroken = (url) => !url || url.includes('a3Z4sO4c5lM1p99kC7q0aB5i1p9') || url.includes('abf8tHq65a8g9f76a54f676f45a');

    const backdropUrl = !isBroken(item.backdrop)
      ? item.backdrop
      : (imdbId ? `https://images.metahub.space/background/medium/${imdbId}/img` : item.poster);

    if (this.backdropEl) {
      this.backdropEl.style.opacity = '0';
      setTimeout(() => {
        this.backdropEl.src = backdropUrl;
        this.backdropEl.onerror = () => {
          if (item.poster) this.backdropEl.src = item.poster;
        };
        this.backdropEl.onload = () => {
          this.backdropEl.style.opacity = '1';
        };
      }, 150);
    }

    if (this.titleEl) {
      this.titleEl.innerText = getItemTitle(item);
    }
    if (this.ratingEl) {
      this.ratingEl.innerText = item.rating || '★ 8.5';
    }
    if (this.yearEl) {
      this.yearEl.innerText = item.year || '2024';
    }
    if (this.durationEl) {
      this.durationEl.innerText = item.duration || (item.episodesCount ? `${item.episodesCount} Eps` : 'HD');
    }
    if (this.genresEl) {
      const genres = item.genres || ['Streaming', 'Populares'];
      this.genresEl.innerHTML = genres.map((g, i) => `
        <span class="text-neutral-300 font-medium">${g}</span>
        ${i < genres.length - 1 ? '<span class="text-neutral-600">•</span>' : ''}
      `).join('');
    }
    if (this.descEl) {
      this.descEl.innerText = item.description || t('defaultDescription') || 'Assista em alta definição e som cinematográfico.';
    }

    this.updateWatchlistState();

    // Update active dot
    if (this.dotsEl) {
      this.dotsEl.querySelectorAll('.hero-dot').forEach((d, idx) => {
        if (idx === this.currentIndex) {
          d.className = 'hero-dot h-1.5 rounded-full transition-all duration-300 cursor-pointer bg-[#e50914] w-5';
        } else {
          d.className = 'hero-dot h-1.5 rounded-full transition-all duration-300 cursor-pointer bg-white/30 hover:bg-white/60 w-1.5';
        }
      });
    }
  }

  goTo(index) {
    if (index >= 0 && index < this.items.length) {
      this.currentIndex = index;
      this.renderCurrent();
      this.startAutoCycle();
    }
  }

  next() {
    if (this.items.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.items.length;
    this.renderCurrent();
  }

  prev() {
    if (this.items.length === 0) return;
    this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
    this.renderCurrent();
  }

  startAutoCycle() {
    this.stopAutoCycle();
    this.autoTimer = setInterval(() => {
      this.next();
    }, 8000);
  }

  stopAutoCycle() {
    if (this.autoTimer) {
      clearInterval(this.autoTimer);
      this.autoTimer = null;
    }
  }
}
