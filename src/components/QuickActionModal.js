/**
 * QuickActionModal Component
 * Appears when long-pressing a card on mobile or holding OK on TV box remote.
 * Provides instant actions: Play Now, Add/Remove My List, Mark as Watched, View Details.
 */
import { t, getItemTitle, formatItemDuration } from '../services/i18n.js';
import { isInWatchlist, toggleWatchlist, getResumeState, saveContinueWatching, removeContinueWatching, isItemWatched, markItemWatched, markItemUnwatched } from '../services/storage.js';

export class QuickActionModal {
  constructor(container) {
    this.container = container || document.body;
    this.currentItem = null;
    this.init();
  }

  init() {
    const isEn = (typeof window.getLanguage === 'function' ? window.getLanguage() : '') === 'en';

    const modalHtml = `
      <div id="quick-action-modal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md hidden items-center justify-center p-4 transition-opacity duration-200 opacity-0" style="display: none;">
        <div class="bg-[#141419] border border-white/20 rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4 transform transition-all duration-200 scale-95">
          <!-- Card Header / Preview -->
          <div class="flex gap-3 items-center border-b border-white/10 pb-3">
            <img id="qa-poster" loading="lazy" src="" alt="Poster" class="w-14 h-20 object-cover rounded-lg border border-white/10 flex-shrink-0 shadow-md bg-neutral-800" />
            <div class="min-w-0 flex-1">
              <h3 id="qa-title" class="font-bold text-sm text-white truncate">Title</h3>
              <div class="flex items-center gap-2 mt-1 text-[11px] text-neutral-400 font-mono">
                <span id="qa-year" class="bg-white/10 px-1.5 py-0.5 rounded text-neutral-300">2024</span>
                <span id="qa-rating" class="text-[#FFD700] font-bold">★ 8.0</span>
                <span id="qa-duration" class="truncate">2h 10m</span>
              </div>
              <p id="qa-type" class="text-[10px] text-red-500 font-semibold uppercase tracking-wider mt-1">Movie</p>
            </div>
            <button id="qa-close-btn" class="self-start text-neutral-400 hover:text-white p-1.5 rounded-lg bg-white/5 hover:bg-red-600 transition cursor-pointer text-xs" title="Close">✕</button>
          </div>

          <!-- Action Buttons List -->
          <div class="space-y-2">
            <!-- Play Immediately -->
            <button id="qa-btn-play" class="tv-focusable w-full py-2.5 px-4 bg-[#e50914] hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center justify-between transition active:scale-95 shadow-lg shadow-red-950/40 cursor-pointer" tabindex="0">
              <div class="flex items-center gap-2.5">
                <span class="text-base">▶</span>
                <span id="qa-lbl-play">${isEn ? 'Play Now' : 'Assistir Agora'}</span>
              </div>
              <span class="text-xs opacity-70">➔</span>
            </button>

            <!-- Add / Remove My List -->
            <button id="qa-btn-mylist" class="tv-focusable w-full py-2.5 px-4 bg-white/10 hover:bg-white/15 border border-white/10 text-neutral-200 text-xs font-bold rounded-xl flex items-center justify-between transition active:scale-95 cursor-pointer" tabindex="0">
              <div class="flex items-center gap-2.5">
                <span id="qa-icn-mylist" class="text-base">+</span>
                <span id="qa-lbl-mylist">${isEn ? 'Add to My List' : 'Adicionar à Minha Lista'}</span>
              </div>
              <span id="qa-status-mylist" class="text-xs text-neutral-400"></span>
            </button>

            <!-- Mark as Watched / Unwatched -->
            <button id="qa-btn-watched" class="tv-focusable w-full py-2.5 px-4 bg-white/10 hover:bg-white/15 border border-white/10 text-neutral-200 text-xs font-bold rounded-xl flex items-center justify-between transition active:scale-95 cursor-pointer" tabindex="0">
              <div class="flex items-center gap-2.5">
                <span id="qa-icn-watched" class="text-base">✓</span>
                <span id="qa-lbl-watched">${isEn ? 'Mark as Watched' : 'Marcar como Assistido'}</span>
              </div>
              <span id="qa-status-watched" class="text-xs text-neutral-400"></span>
            </button>

            <!-- View Full Details & Episodes -->
            <button id="qa-btn-details" class="tv-focusable w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/5 text-neutral-300 text-xs font-medium rounded-xl flex items-center justify-between transition active:scale-95 cursor-pointer" tabindex="0">
              <div class="flex items-center gap-2.5">
                <span class="text-base">ℹ️</span>
                <span>${isEn ? 'Details & Episodes' : 'Detalhes & Episódios'}</span>
              </div>
              <span class="text-xs text-neutral-500">➔</span>
            </button>
          </div>

          <!-- Cancel -->
          <button id="qa-btn-cancel" class="tv-focusable w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white text-xs font-bold rounded-xl transition cursor-pointer" tabindex="0">
            ${t('cancel') || 'Cancel'}
          </button>
        </div>
      </div>
    `;

    const div = document.createElement('div');
    div.innerHTML = modalHtml;
    this.el = div.firstElementChild;
    this.container.appendChild(this.el);

    this.cardBox = this.el.querySelector('.bg-\\[\\#141419\\]');
    this.posterImg = this.el.querySelector('#qa-poster');
    this.titleEl = this.el.querySelector('#qa-title');
    this.yearEl = this.el.querySelector('#qa-year');
    this.ratingEl = this.el.querySelector('#qa-rating');
    this.durationEl = this.el.querySelector('#qa-duration');
    this.typeEl = this.el.querySelector('#qa-type');
    this.closeBtn = this.el.querySelector('#qa-close-btn');

    this.btnPlay = this.el.querySelector('#qa-btn-play');
    this.btnMyList = this.el.querySelector('#qa-btn-mylist');
    this.icnMyList = this.el.querySelector('#qa-icn-mylist');
    this.lblMyList = this.el.querySelector('#qa-lbl-mylist');
    this.statusMyList = this.el.querySelector('#qa-status-mylist');

    this.btnWatched = this.el.querySelector('#qa-btn-watched');
    this.icnWatched = this.el.querySelector('#qa-icn-watched');
    this.lblWatched = this.el.querySelector('#qa-lbl-watched');
    this.statusWatched = this.el.querySelector('#qa-status-watched');

    this.btnDetails = this.el.querySelector('#qa-btn-details');
    this.btnCancel = this.el.querySelector('#qa-btn-cancel');

    this.bindEvents();
  }

  bindEvents() {
    this.closeBtn.addEventListener('click', () => this.close());
    this.btnCancel.addEventListener('click', () => this.close());

    this.el.addEventListener('click', (e) => {
      if (e.target === this.el) this.close();
    });

    this.btnPlay.addEventListener('click', () => {
      if (Date.now() - (this.openedAt || 0) < 450) return;
      const item = this.currentItem;
      this.close();
      if (item && window.cinePlayerInstance) {
        window.cinePlayerInstance.play(item);
      }
    });

    this.btnMyList.addEventListener('click', () => {
      if (Date.now() - (this.openedAt || 0) < 450) return;
      if (!this.currentItem) return;
      toggleWatchlist(this.currentItem);
      this.updateMyListUI();
      if (window.cineApp && window.cineApp.populateWatchlists) {
        window.cineApp.populateWatchlists();
      }
    });

    this.btnWatched.addEventListener('click', () => {
      if (!this.currentItem) return;
      const watched = isItemWatched(this.currentItem);
      if (watched) {
        markItemUnwatched(this.currentItem);
      } else {
        markItemWatched(this.currentItem);
      }
      this.updateWatchedUI();
      if (window.cineApp && window.cineApp.loadUserLists) {
        window.cineApp.loadUserLists();
      } else if (window.cineApp && window.cineApp.populateContinueWatching) {
        window.cineApp.populateContinueWatching();
      }
      this.close();
    });

    const triggerDetails = () => {
      const item = this.currentItem;
      this.el.style.display = 'none';
      this.el.classList.add('hidden');
      this.close();
      const details = window.cineDetailsInstance || window.cineDetailsModal;
      if (item && details) {
        if (typeof details.show === 'function') details.show(item);
        else if (typeof details.open === 'function') details.open(item);
      }
    };
    this.btnDetails.addEventListener('click', triggerDetails);
    this.btnDetails.addEventListener('touchend', (e) => {
      e.preventDefault();
      triggerDetails();
    });
  }

  updateMyListUI() {
    if (!this.currentItem) return;
    const isEn = (typeof window.getLanguage === 'function' ? window.getLanguage() : '') === 'en';
    const isIn = isInWatchlist(this.currentItem);
    if (isIn) {
      this.icnMyList.innerText = '✓';
      this.lblMyList.innerText = isEn ? 'In My List' : 'Na Minha Lista';
      this.statusMyList.innerText = isEn ? 'Added' : 'Salvo';
      this.btnMyList.classList.add('border-red-500/50', 'bg-red-950/20');
    } else {
      this.icnMyList.innerText = '+';
      this.lblMyList.innerText = isEn ? 'Add to My List' : 'Adicionar à Minha Lista';
      this.statusMyList.innerText = '';
      this.btnMyList.classList.remove('border-red-500/50', 'bg-red-950/20');
    }
  }

  updateWatchedUI() {
    if (!this.currentItem) return;
    const isEn = (typeof window.getLanguage === 'function' ? window.getLanguage() : '') === 'en';
    const isWatched = isItemWatched(this.currentItem);
    if (isWatched) {
      this.icnWatched.innerText = '↺';
      this.lblWatched.innerText = isEn ? 'Mark as Unwatched' : 'Desmarcar Assistido';
      this.statusWatched.innerText = isEn ? 'Watched ✓' : 'Assistido ✓';
    } else {
      this.icnWatched.innerText = '✓';
      this.lblWatched.innerText = isEn ? 'Mark as Watched' : 'Marcar como Assistido';
      this.statusWatched.innerText = '';
    }
  }

  open(item) {
    if (!item) return;
    this.currentItem = item;

    const isEn = (typeof window.getLanguage === 'function' ? window.getLanguage() : '') === 'en';
    this.titleEl.innerText = getItemTitle(item);
    this.yearEl.innerText = item.year || '2024';
    this.ratingEl.innerText = item.rating || '★ 8.0';
    this.durationEl.innerText = formatItemDuration(item);
    this.typeEl.innerText = item.type === 'series' ? (isEn ? 'Series' : 'Série') : (isEn ? 'Movie' : 'Filme');

    const poster = item.poster || item.backdrop || (item.imdbId ? `https://images.metahub.space/poster/medium/${item.imdbId}/img` : '');
    this.posterImg.src = poster;

    this.updateMyListUI();
    this.updateWatchedUI();

    this.openedAt = Date.now();
    this.el.style.display = 'flex';
    this.el.classList.remove('hidden');
    requestAnimationFrame(() => {
      this.el.classList.remove('opacity-0');
      this.cardBox.classList.remove('scale-95');
      this.cardBox.classList.add('scale-100');
    });

    if (window.cineTvNav) {
      window.cineTvNav.pushModal(this.el, '#qa-btn-play');
    }
  }

  close() {
    this.el.classList.add('opacity-0');
    this.cardBox.classList.remove('scale-100');
    this.cardBox.classList.add('scale-95');
    setTimeout(() => {
      this.el.style.display = 'none';
      this.el.classList.add('hidden');
    }, 200);

    if (window.cineTvNav) {
      window.cineTvNav.popModal();
    }
  }
}
