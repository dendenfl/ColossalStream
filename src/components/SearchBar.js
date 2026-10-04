import { searchAllAppContent } from '../services/resolvers.js';
import { t, getItemTitle, getItemDescription, translateTextAsync, getLanguage } from '../services/i18n.js';

export class SearchBar {
  constructor(container, { onPlay, onOpenDetails }) {
    this.container = container;
    this.onPlay = onPlay;
    this.onOpenDetails = onOpenDetails;
    this.debounceTimer = null;
    this.isSearching = false;
    this.initDOM();
    this.bindEvents();
    window.cineSearchInstance = this;

    window.addEventListener('cinetv:langChanged', () => {
      this.updateLanguage();
    });
  }

  isOpen() {
    return this.modal && !this.modal.classList.contains('hidden');
  }

  open() {
    if (!this.modal) return;
    this.modal.classList.remove('hidden');
    this.modal.classList.add('flex');
    if (this.input) {
      this.input.focus();
      if (window.AndroidNative && window.AndroidNative.showKeyboard) {
        window.AndroidNative.showKeyboard();
      }
    }
    if (window.cineTvNav) {
      window.cineTvNav.pushModal(this.modal, '#search-input');
    }
  }

  close(skipFocusReturn = false) {
    if (!this.modal) return;
    this.modal.classList.add('hidden');
    this.modal.classList.remove('flex');
    if (this.input) {
      this.input.blur();
    }
    if (window.cineTvNav) {
      window.cineTvNav.popSpecificModal(this.modal);
      if (!skipFocusReturn) {
        const trigger = document.getElementById('btn-open-search');
        if (trigger) window.cineTvNav.setFocus(trigger, false);
      }
    }
  }

  hideResults() {
    this.close();
  }

  showResults() {
    // Already in modal
  }

  initDOM() {
    this.container.innerHTML = `
      <!-- Dedicated Dark Charcoal Streaming Search Overlay -->
      <div id="search-modal" class="fixed inset-0 z-50 bg-[#08080a]/90 backdrop-blur-2xl hidden flex-col items-center pt-8 sm:pt-14 px-3 sm:px-6">
        <!-- Search Modal Card -->
        <div id="search-modal-card" class="w-full max-w-3xl bg-[#121217] border border-white/15 rounded-2xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh] ring-1 ring-white/10">
          <!-- Search Input Bar inside Modal -->
          <div class="flex items-center px-4 py-3 border-b border-white/10 bg-white/[0.02] gap-3">
            <div class="text-[#e50914] flex items-center flex-shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>

            <input
              id="search-input"
              type="text"
              autocomplete="off"
              placeholder="${t('searchPlaceholder') || 'Buscar filmes, séries, gêneros...'}"
              class="flex-1 min-w-0 bg-transparent text-white text-sm sm:text-base placeholder-neutral-500 border-0 outline-none focus:outline-none focus:ring-0 pr-2 pl-0 select-text cursor-text font-medium"
              style="outline: none !important; -webkit-tap-highlight-color: transparent !important; box-shadow: none !important;"
            />

            <!-- Clear Button -->
            <button id="search-clear-btn" class="hidden text-neutral-400 hover:text-white px-2 text-sm font-bold flex-shrink-0 cursor-pointer" title="Limpar">
              ✕
            </button>

            <!-- Search Button -->
            <button id="search-submit-btn" class="px-3.5 py-1.5 bg-[#e50914] hover:bg-red-700 text-white rounded-full text-xs font-bold transition active:scale-95 shadow flex-shrink-0 cursor-pointer">
              ${t('searchButton') || 'Buscar'}
            </button>

            <!-- Close Modal Button -->
            <button id="search-close-results" class="w-8 h-8 rounded-full bg-white/10 hover:bg-red-600 text-white flex items-center justify-center text-sm font-black transition cursor-pointer flex-shrink-0" title="${t('close') || 'Fechar'}">
              ✕
            </button>
          </div>

          <!-- Results Header with Count -->
          <div id="search-results-header" class="hidden flex items-center justify-between px-5 py-2.5 bg-white/[0.02] border-b border-white/10">
            <span class="text-xs font-bold text-red-400 font-mono" id="search-count-badge">0 ${t('searchResults')}</span>
          </div>

          <!-- Loading Indicator -->
          <div id="search-spinner" class="hidden p-8 flex flex-col items-center justify-center gap-2">
            <div class="w-8 h-8 border-3 border-[#e50914] border-t-transparent rounded-full animate-spin"></div>
            <p id="search-spinner-text" class="text-xs text-neutral-400 font-mono">${t('searching')}</p>
          </div>

          <!-- Results Scrollable List -->
          <div id="search-results-list" class="p-2 sm:p-3 overflow-y-auto space-y-1.5 divide-y divide-white/5 no-scrollbar flex-1">
            <!-- Dynamically populated result items -->
          </div>

          <!-- Empty State -->
          <div id="search-empty" class="hidden p-10 text-center">
            <p class="text-3xl mb-2">🔍</p>
            <p id="search-empty-title" class="text-sm font-bold text-white">${t('noResultsTitle')}</p>
            <p id="search-empty-desc" class="text-xs text-neutral-400 mt-1">${t('noResultsDesc')}</p>
          </div>
        </div>
      </div>
    `;

    this.modal = this.container.querySelector('#search-modal');
    this.card = this.container.querySelector('#search-modal-card');
    this.input = this.container.querySelector('#search-input');
    this.clearBtn = this.container.querySelector('#search-clear-btn');
    this.submitBtn = this.container.querySelector('#search-submit-btn');
    this.resultsHeader = this.container.querySelector('#search-results-header');
    this.resultsList = this.container.querySelector('#search-results-list');
    this.countBadge = this.container.querySelector('#search-count-badge');
    this.spinner = this.container.querySelector('#search-spinner');
    this.spinnerText = this.container.querySelector('#search-spinner-text');
    this.emptyState = this.container.querySelector('#search-empty');
    this.emptyTitle = this.container.querySelector('#search-empty-title');
    this.emptyDesc = this.container.querySelector('#search-empty-desc');
    this.closeBtn = this.container.querySelector('#search-close-results');
  }

  updateLanguage() {
    if (this.input) this.input.placeholder = t('searchPlaceholder');
    if (this.submitBtn) this.submitBtn.innerText = t('searchButton');
    if (this.closeBtn) this.closeBtn.innerText = '✕';
    if (this.spinnerText) this.spinnerText.innerText = t('searching');
    if (this.emptyTitle) this.emptyTitle.innerText = t('noResultsTitle');
    if (this.emptyDesc) this.emptyDesc.innerText = t('noResultsDesc');
  }

  bindEvents() {
    this.input.addEventListener('click', (e) => {
      e.stopPropagation();
      this.input.focus();
      if (window.AndroidNative && window.AndroidNative.showKeyboard) {
        window.AndroidNative.showKeyboard();
      }
    });

    this.input.addEventListener('focus', () => {
      if (window.AndroidNative && window.AndroidNative.showKeyboard) {
        window.AndroidNative.showKeyboard();
      }
    });

    this.input.addEventListener('input', () => {
      const val = this.input.value.trim();
      if (val.length > 0) {
        this.clearBtn.classList.remove('hidden');
      } else {
        this.clearBtn.classList.add('hidden');
        this.resultsList.innerHTML = '';
        if (this.resultsHeader) this.resultsHeader.classList.add('hidden');
        this.emptyState.classList.add('hidden');
        return;
      }

      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.performSearch(val);
      }, 350);
    });

    this.clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.input.value = '';
      this.clearBtn.classList.add('hidden');
      this.resultsList.innerHTML = '';
      if (this.resultsHeader) this.resultsHeader.classList.add('hidden');
      this.emptyState.classList.add('hidden');
      this.input.focus();
    });

    this.submitBtn.addEventListener('click', () => {
      const val = this.input.value.trim();
      if (val.length > 0) {
        this.performSearch(val);
      }
    });

    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = this.input.value.trim();
        if (val.length > 0) {
          this.performSearch(val);
        }
      } else if (e.key === 'Escape') {
        this.close();
      }
    });

    this.closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.close();
    });

    // Close when clicking outside modal card
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.close();
        }
      });
    }
  }

  async performSearch(query) {
    if (!query || query.length < 2) return;

    this.showResults();
    this.spinner.classList.remove('hidden');
    this.emptyState.classList.add('hidden');
    if (this.resultsHeader) this.resultsHeader.classList.remove('hidden');
    this.resultsList.innerHTML = '';
    this.countBadge.innerText = t('searching');

    try {
      const results = await searchAllAppContent(query);
      this.spinner.classList.add('hidden');

      if (!results || results.length === 0) {
        this.countBadge.innerText = `0 ${t('searchResults')}`;
        this.emptyState.classList.remove('hidden');
        return;
      }

      this.countBadge.innerText = `${results.length} ${t('searchResults')}`;
      this.renderResults(results);
    } catch (err) {
      console.warn("Search execution error:", err);
      this.spinner.classList.add('hidden');
      this.emptyState.classList.remove('hidden');
    }
  }

  renderResults(results) {
    const lang = getLanguage();
    const isEn = lang === 'en';
    const playText = isEn ? 'Watch' : 'Assistir';

    this.resultsList.innerHTML = results.map((item, index) => {
      const typeLabel = item.type === 'series' 
        ? (isEn ? 'Series' : 'Série') 
        : (item.type === 'live' ? (isEn ? 'Live' : 'Ao Vivo') : (isEn ? 'Movie' : 'Filme'));
      const typeColor = item.type === 'series' 
        ? 'bg-indigo-900/70 text-indigo-300 border-indigo-700' 
        : (item.type === 'live' ? 'bg-emerald-900/70 text-emerald-300 border-emerald-700' : 'bg-red-900/70 text-red-300 border-red-700');
      const posterUrl = item.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=300&q=80';
      const itemTitle = getItemTitle(item);
      const itemDesc = getItemDescription(item);
      const id = item.imdbId || item.id;

      return `
        <div class="search-item group p-3 sm:p-3.5 rounded-xl hover:bg-white/10 transition flex items-start sm:items-center justify-between gap-3 cursor-pointer border border-transparent hover:border-white/10" data-index="${index}" tabindex="0">
          <div class="flex items-start sm:items-center gap-3 flex-1 min-w-0">
            <div class="relative w-14 sm:w-16 h-20 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-900 border border-white/10 shadow-md">
              <img src="${posterUrl}" alt="${itemTitle}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" onerror="this.src='https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=300&q=80'" loading="lazy"/>
            </div>
            <div class="flex-1 min-w-0 space-y-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-[9px] px-2 py-0.5 rounded-full border font-mono font-bold ${typeColor}">${typeLabel}</span>
                <span class="text-[10px] text-neutral-300 font-mono">${item.year || '2024'}</span>
                <span class="text-[10px] text-amber-400 font-bold font-mono">${item.rating || '★ 8.0'}</span>
                ${item.duration ? `<span class="text-[10px] text-neutral-400 font-mono">• ${item.duration}</span>` : ''}
              </div>
              <h4 class="search-title text-xs sm:text-sm font-bold text-white group-hover:text-red-400 transition leading-snug line-clamp-1" data-id="${id}">
                ${itemTitle}
              </h4>
              <p class="search-desc text-[11px] sm:text-xs text-neutral-300 line-clamp-2 leading-relaxed mt-0.5" data-id="${id}">
                ${itemDesc}
              </p>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row items-center gap-2 flex-shrink-0 self-center">
            <button class="btn-search-play px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-red-900/50 active:scale-95 cursor-pointer whitespace-nowrap" tabindex="0">
              <span>▶</span> <span>${playText}</span>
            </button>
            <button class="btn-search-info p-2 sm:px-3 sm:py-2 bg-white/10 hover:bg-white/20 text-neutral-200 rounded-xl text-xs font-semibold transition active:scale-95 cursor-pointer whitespace-nowrap flex items-center gap-1" title="${isEn ? 'Info' : 'Detalhes'}" tabindex="0">
              <span>ℹ️</span> <span class="hidden sm:inline">${isEn ? 'Info' : 'Detalhes'}</span>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Asynchronously translate dynamic descriptions in background if needed
    results.forEach(item => {
      const id = item.imdbId || item.id;
      const rawDesc = item.description || item.description_en || item.description_pt;
      if (rawDesc && rawDesc.length > 15 && !rawDesc.includes('catálogo Cinemeta')) {
        translateTextAsync(rawDesc, lang).then(translated => {
          if (translated && translated !== rawDesc) {
            const el = this.resultsList.querySelector(`.search-desc[data-id="${id}"]`);
            if (el) el.innerText = translated;
            if (lang === 'pt') item.description_pt = translated;
            else item.description_en = translated;
          }
        }).catch(() => {});
      }
    });

    // Attach click and touch handlers to items and buttons
    const itemElements = this.resultsList.querySelectorAll('.search-item');
    itemElements.forEach(el => {
      const idx = parseInt(el.dataset.index, 10);
      const item = results[idx];

      const playBtn = el.querySelector('.btn-search-play');
      const infoBtn = el.querySelector('.btn-search-info');

      let lastActionTime = 0;
      const handleDetails = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        if (Date.now() - lastActionTime < 400) return;
        lastActionTime = Date.now();
        this.close(true);
        if (this.onOpenDetails) {
          this.onOpenDetails(item);
        } else if (window.cineDetailsInstance) {
          window.cineDetailsInstance.show(item);
        }
      };

      const handlePlay = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        if (Date.now() - lastActionTime < 400) return;
        lastActionTime = Date.now();
        this.close(true);
        if (this.onPlay) {
          this.onPlay(item);
        } else if (window.cinePlayerInstance) {
          window.cinePlayerInstance.play(item);
        }
      };

      if (playBtn) {
        playBtn.addEventListener('click', handlePlay);
        playBtn.addEventListener('touchend', handlePlay);
      }

      if (infoBtn) {
        infoBtn.addEventListener('click', handleDetails);
        infoBtn.addEventListener('touchend', handleDetails);
      }

      el.addEventListener('click', handleDetails);
      el.addEventListener('touchend', (e) => {
        if (e.target && (playBtn?.contains(e.target) || infoBtn?.contains(e.target))) {
          return;
        }
        handleDetails(e);
      });

      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === 'Ok' || e.keyCode === 13 || e.keyCode === 23) {
          e.preventDefault();
          handleDetails(e);
        }
      });
    });
  }
}
