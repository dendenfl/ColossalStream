import { t, getItemTitle, formatItemDuration } from '../services/i18n.js';
import { showAppToast } from '../services/toast.js';
import { getResumeState } from '../services/storage.js';

/**
 * MediaRow Component
 * Renders a horizontal, touch-swipeable & D-Pad focusable carousel row for Movies or Series.
 */
export class MediaRow {
  constructor(container, { id, titleKey, icon, badgeKey, onSelect, onPlay, onRemove, onSeeAll }) {
    this.container = container;
    this.id = id;
    this.titleKey = titleKey;
    this.icon = icon;
    this.badgeKey = badgeKey;
    this.onSelect = onSelect || (() => {});
    this.onPlay = onPlay || (() => {});
    this.onRemove = onRemove || null;
    this.onSeeAll = onSeeAll || null;
    this.items = [];
    this.pendingFocusIndex = undefined;
    
    this.initDOM();
    this.bindEvents();

    window.addEventListener('cinetv:langChanged', () => {
      this.updateLanguage();
    });
  }

  updateLanguage() {
    if (this.titleEl) this.titleEl.innerText = t(this.titleKey);
    if (this.badgeEl) this.badgeEl.innerText = t(this.badgeKey);
    if (this.seeAllText) this.seeAllText.innerText = t('seeAll');

    if (!this.trackEl) return;
    const cards = this.trackEl.querySelectorAll('.media-card');
    cards.forEach((card) => {
      const idx = parseInt(card.dataset.index, 10);
      const item = this.items[idx];
      if (!item) return;
      const title = getItemTitle(item);
      const h3 = card.querySelector('h3');
      if (h3) h3.textContent = title;
      const img = card.querySelector('img');
      if (img) img.alt = title;
      const durationP = card.querySelector('p');
      if (durationP) durationP.textContent = formatItemDuration(item);
    });
  }

  removeItem(item, card) {
    if (!this.onRemove || !item) return;

    const itemTitle = getItemTitle(item) || t('itemRemoved') || 'Item removido';

    if (typeof showAppToast === 'function') {
      showAppToast(`${itemTitle}: ${t('itemRemoved') || 'Removido'}`, '🗑️');
    }

    const cardIndex = parseInt(card?.dataset?.index || '0', 10);
    this.pendingFocusIndex = Math.max(0, cardIndex);

    this.onRemove(item);
  }

  initDOM() {
    this.container.innerHTML = `
      <section class="space-y-1.5 py-0.5 select-none media-row-inner">
        <!-- Row Header -->
        <div class="flex items-center justify-between px-1.5 py-0.5">
          <div class="flex items-center gap-2">
            <span class="text-sm md:text-base">${this.icon}</span>
            <h2 id="${this.id}-title" class="text-xs md:text-sm font-black text-white tracking-wide">
              ${t(this.titleKey)}
            </h2>
            <span id="${this.id}-badge" class="text-[9px] md:text-[10px] text-neutral-400 font-mono font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
              ${t(this.badgeKey)}
            </span>
          </div>
        </div>

        <!-- Horizontal Scrollable Track -->
        <div id="${this.id}-track" class="media-row-track flex items-stretch gap-2.5 sm:gap-3 overflow-x-auto overflow-y-hidden no-scrollbar py-1 px-1" style="touch-action: pan-x pan-y; -webkit-overflow-scrolling: touch; overscroll-behavior-x: contain;">
          <!-- Cards injected dynamically -->
        </div>
      </section>
    `;

    this.titleEl = this.container.querySelector(`#${this.id}-title`);
    this.badgeEl = this.container.querySelector(`#${this.id}-badge`);
    this.trackEl = this.container.querySelector(`#${this.id}-track`);
    this.prevBtn = this.container.querySelector(`#${this.id}-prev`);
    this.nextBtn = this.container.querySelector(`#${this.id}-next`);
    this.seeAllBtn = this.container.querySelector(`#${this.id}-see-all`);
    this.seeAllText = this.container.querySelector(`#${this.id}-see-all-text`);

    this.bindTrackSwipe();
  }

  setItems(items) {
    const hadFocusInThisTrack = this.trackEl && (
      this.trackEl.contains(document.activeElement) ||
      (window.cineTvNav && this.trackEl.contains(window.cineTvNav.currentFocused))
    );
    const targetIdx = this.pendingFocusIndex !== undefined ? this.pendingFocusIndex : 0;
    this.pendingFocusIndex = undefined;

    this.items = (items || []).slice(0, 30);

    // Automatically hide removable rows (Continue Watching, To Watch) when empty to keep TV dashboard dense & clean
    if (this.onRemove && (!this.items || this.items.length === 0)) {
      this.container.classList.add('hidden');
      if (hadFocusInThisTrack && window.cineTvNav) {
        setTimeout(() => {
          const nextRowCard = window.cineTvNav.getFirstVisibleCardOnActiveTab();
          if (nextRowCard) {
            window.cineTvNav.setFocus(nextRowCard, true);
          } else {
            window.cineTvNav.focusInitialElement();
          }
        }, 50);
      }
      return;
    } else {
      this.container.classList.remove('hidden');
    }

    this.render();

    if (hadFocusInThisTrack && window.cineTvNav) {
      setTimeout(() => {
        const allCards = Array.from(this.trackEl.querySelectorAll('.media-card'));
        if (allCards.length > 0) {
          const safeIdx = Math.min(targetIdx, allCards.length - 1);
          const nextTarget = allCards[safeIdx];
          if (nextTarget) {
            window.cineTvNav.setFocus(nextTarget, true);
            return;
          }
        }
        window.cineTvNav.focusInitialElement();
      }, 60);
    }
  }

  render() {
    if (!this.items || this.items.length === 0) {
      this.trackEl.innerHTML = `
        <div class="py-2 px-3 text-xs text-neutral-500 italic">
          ${this.onRemove ? t('emptyList') : t('searching')}
        </div>
      `;
      return;
    }

    const isContinueRow = this.id.includes('continue');
    const isInfinite = !this.onRemove && !isContinueRow && this.items.length >= 8;
    const renderList = this.items;

    this.trackEl.innerHTML = renderList.map((item, index) => {
      return this.renderCardHTML(item, index % this.items.length, isContinueRow);
    }).join('');

    // Attach interaction events
    this.trackEl.querySelectorAll('.media-card').forEach((card) => {
      this.bindCardEvents(card);
    });

    if (this._scrollHandler) {
      this.trackEl.removeEventListener('scroll', this._scrollHandler);
      this._scrollHandler = null;
    }

    if (isInfinite) {
      let isAppending = false;
      this._scrollHandler = () => {
        if (isAppending) return;
        if (this.trackEl.scrollLeft + this.trackEl.clientWidth >= this.trackEl.scrollWidth - 450) {
          isAppending = true;
          this.appendBatch();
          setTimeout(() => { isAppending = false; }, 120);
        }
      };
      this.trackEl.addEventListener('scroll', this._scrollHandler, { passive: true });
    }
  }

  renderCardHTML(item, originalIndex, isContinueRow) {
    const imdbId = item.imdbId || item.id;
    const isBroken = (url) => !url || url.includes('a3Z4sO4c5lM1p99kC7q0aB5i1p9') || url.includes('abf8tHq65a8g9f76a54f676f45a');

    // For Continue Watching, prefer 16:9 backdrop; for catalog, prefer 2:3 portrait poster
    const imgUrl = isContinueRow
      ? (!isBroken(item.backdrop) ? item.backdrop : (!isBroken(item.poster) ? item.poster : (imdbId ? `https://images.metahub.space/background/medium/${imdbId}/img` : '')))
      : (!isBroken(item.poster) ? item.poster : (!isBroken(item.backdrop) ? item.backdrop : (imdbId ? `https://images.metahub.space/poster/medium/${imdbId}/img` : '')));

    const rating = item.rating || '★ 8.0';
    const year = item.year || '2024';

    if (isContinueRow) {
      return `
        <div class="media-card-wrapper flex flex-col flex-shrink-0 w-[170px] sm:w-[200px] md:w-[220px]" style="touch-action: pan-x pan-y;">
          <div 
            class="media-card group relative flex-shrink-0 w-full cursor-pointer rounded-xl overflow-hidden bg-[#121217] border border-white/10 hover:border-[#e50914] transition-all duration-300 transform hover:scale-[1.03] active:scale-95 shadow-lg hover:shadow-red-950/40 aspect-video"
            data-id="${imdbId}"
            data-index="${originalIndex}"
            data-removable="${this.onRemove ? 'true' : 'false'}"
            tabindex="0"
            style="touch-action: pan-x pan-y;"
          >
            <!-- Card Thumbnail Image -->
            <img 
              src="${imgUrl}" 
              alt="${getItemTitle(item)}" 
              draggable="false"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 relative z-0 pointer-events-none select-none" 
              decoding="async"
              loading="eager"
              referrerpolicy="no-referrer"
              onerror="if (!this.dataset.fb) { this.dataset.fb = '1'; this.src = '${!isBroken(item.poster) ? item.poster : (imdbId ? `https://images.metahub.space/poster/medium/${imdbId}/img` : '')}'; } else { this.style.display = 'none'; const fb = this.parentElement.querySelector('.card-fallback-poster'); if (fb) fb.classList.remove('hidden'); }"
            />
            <div class="card-fallback-poster hidden absolute inset-0 bg-gradient-to-br from-neutral-800 via-neutral-900 to-[#121217] flex flex-col items-center justify-center p-3 text-center">
              <span class="text-2xl text-neutral-500 mb-1">🎬</span>
              <span class="text-[11px] font-bold text-neutral-300 line-clamp-2 leading-tight">${getItemTitle(item)}</span>
            </div>
            <!-- Dark Gradient Scrim -->
            <div class="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/40 to-transparent pointer-events-none"></div>

            <!-- Floating Top Badges -->
            <div class="absolute top-1.5 left-1.5 flex items-center gap-1 pointer-events-none z-10">
              ${item.season && item.episode ? `
                <span class="text-[8.5px] font-mono font-bold bg-[#e50914] text-white px-1.5 py-0.5 rounded shadow">
                  S${item.season}:E${item.episode}
                </span>
              ` : `
                <span class="text-[8.5px] font-mono font-bold bg-black/80 backdrop-blur-sm text-white/90 px-1.5 py-0.5 rounded border border-white/20">
                  ${year}
                </span>
              `}
            </div>

            <!-- Quick Center Play Icon on Hover -->
            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div class="w-8 h-8 rounded-full bg-[#e50914]/90 text-white flex items-center justify-center shadow-xl text-xs transform group-hover:scale-110 transition-transform">
                ▶
              </div>
            </div>

            <!-- Bottom Title Inside Card -->
            <div class="absolute bottom-2 inset-x-0 px-2 pointer-events-none z-10">
              <h3 class="text-xs font-bold text-white group-hover:text-red-400 truncate leading-tight transition-colors drop-shadow">
                ${getItemTitle(item)}
              </h3>
              <p class="text-[9px] text-neutral-400 font-mono mt-0.5 truncate drop-shadow">
                ${formatItemDuration(item)}
              </p>
            </div>

            <!-- Thin Red Playback Progress Bar -->
            <div class="absolute bottom-0 inset-x-0 h-1 bg-neutral-800/80 z-20">
              <div class="h-full bg-[#e50914] rounded-full" style="width: ${Math.min(100, Math.max(5, item.progress || Math.round(((item.currentTime || 0) / (item.durationSec || 7200)) * 100)))}%"></div>
            </div>
          </div>
        </div>
      `;
    }

    // Standard 2:3 Portrait Card for Catalog Sections
    const resumeState = getResumeState(item);
    const resumeProgress = resumeState ? resumeState.percentage : 0;

    return `
      <div class="media-card-wrapper flex flex-col flex-shrink-0 w-[115px] sm:w-[130px] md:w-[145px]" style="touch-action: pan-x pan-y;">
        <div 
          class="media-card group relative flex-shrink-0 w-full cursor-pointer rounded-xl overflow-hidden bg-[#121217] border border-white/10 hover:border-[#e50914] transition-all duration-300 transform hover:scale-[1.03] active:scale-95 shadow-lg hover:shadow-red-950/40 aspect-[2/3]"
          data-id="${imdbId}"
          data-index="${originalIndex}"
          data-removable="${this.onRemove ? 'true' : 'false'}"
          tabindex="0"
          style="touch-action: pan-x pan-y;"
        >
          <!-- Card Thumbnail Image -->
          <img 
            src="${imgUrl}" 
            alt="${getItemTitle(item)}" 
            draggable="false"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 relative z-0 pointer-events-none select-none" 
            decoding="async"
            loading="eager"
            referrerpolicy="no-referrer"
            onerror="if (!this.dataset.fb) { this.dataset.fb = '1'; this.src = '${!isBroken(item.backdrop) ? item.backdrop : (imdbId ? `https://images.metahub.space/background/medium/${imdbId}/img` : '')}'; } else { this.style.display = 'none'; const fb = this.parentElement.querySelector('.card-fallback-poster'); if (fb) fb.classList.remove('hidden'); }"
          />
          <div class="card-fallback-poster hidden absolute inset-0 bg-gradient-to-br from-neutral-800 via-neutral-900 to-[#121217] flex flex-col items-center justify-center p-2 text-center">
            <span class="text-3xl text-neutral-500 mb-1.5">🎬</span>
            <span class="text-[10px] font-bold text-neutral-300 line-clamp-2 leading-tight">${getItemTitle(item)}</span>
          </div>
          <!-- Dark Gradient Scrim for Legibility -->
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

          <!-- Bottom Title & Duration Inside Card -->
          <div class="absolute bottom-0 inset-x-0 p-2 pointer-events-none z-10">
            <h3 class="text-xs font-bold text-white group-hover:text-red-400 truncate leading-tight transition-colors drop-shadow">
              ${getItemTitle(item)}
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
      </div>
    `;
  }

  bindCardEvents(card) {
    if (!card || card._boundEvents) return;
    card._boundEvents = true;

    const cardId = card.dataset.id;
    const getItem = () => this.items.find(i => (i.imdbId || i.id) === cardId) || this.items[parseInt(card.dataset.index, 10)];

    card._triggerOpen = () => {
      const item = getItem();
      if (item) {
        this.onSelect(item);
      }
    };

    card._triggerRemove = () => {
      const item = getItem();
      if (item) {
        this.removeItem(item, card);
      }
    };

    card._triggerQuickAction = () => {
      const item = getItem();
      if (item && window.cineQuickActionModal) {
        window.cineQuickActionModal.open(item);
      } else if (item && this.onRemove) {
        this.removeItem(item, card);
      }
    };

    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let isScrolling = false;
    let touchHoldTimer = null;
    let pressFeedbackTimer = null;
    let touchHoldTriggered = false;

    let mouseHoldTimer = null;
    let mouseHoldTriggered = false;

    // Touch handling (Mobile / Tablet) - Long-press for Quick Action Menu
    card.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
        isScrolling = false;
        touchHoldTriggered = false;

        clearTimeout(touchHoldTimer);
        clearTimeout(pressFeedbackTimer);

        // Delay visual press feedback so swipe gestures don't trigger the card transform
        pressFeedbackTimer = setTimeout(() => {
          if (!isScrolling) {
            card.classList.add('card-holding');
          }
        }, 180);

        touchHoldTimer = setTimeout(() => {
          touchHoldTriggered = true;
          card.classList.remove('card-holding');
          if (navigator.vibrate) {
            try { navigator.vibrate(45); } catch (err) {}
          }
          if (typeof card._triggerQuickAction === 'function') {
            card._triggerQuickAction();
          }
        }, 700);
      }
    }, { passive: true });

    card.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        const deltaX = Math.abs(e.touches[0].clientX - touchStartX);
        const deltaY = Math.abs(e.touches[0].clientY - touchStartY);
        if (deltaX > 8 || deltaY > 8) {
          isScrolling = true;
          if (touchHoldTimer) {
            clearTimeout(touchHoldTimer);
            touchHoldTimer = null;
          }
          if (pressFeedbackTimer) {
            clearTimeout(pressFeedbackTimer);
            pressFeedbackTimer = null;
          }
          card.classList.remove('card-holding');
        }
      }
    }, { passive: true });

    card.addEventListener('touchend', (e) => {
      if (touchHoldTimer) {
        clearTimeout(touchHoldTimer);
        touchHoldTimer = null;
      }
      if (pressFeedbackTimer) {
        clearTimeout(pressFeedbackTimer);
        pressFeedbackTimer = null;
      }
      card.classList.remove('card-holding');

      if (touchHoldTriggered) {
        touchHoldTriggered = false;
        card.dataset.lastHandled = String(Date.now());
        return;
      }

      if (isScrolling) return;

      // If user was swiping the track, suppress card click
      if (Date.now() - (this.trackEl._lastSwipeTime || 0) < 300) {
        return;
      }

      // Clean tap — open card
      card.dataset.lastHandled = String(Date.now());
      const item = getItem();
      if (item) {
        this.onSelect(item);
      }
    });

    // Mouse long-press (Desktop / Air mouse only - avoid touch collisions)
    if (!('ontouchstart' in window)) {
      card.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        mouseHoldTriggered = false;
        clearTimeout(mouseHoldTimer);
        card.classList.add('card-holding');

        mouseHoldTimer = setTimeout(() => {
          mouseHoldTriggered = true;
          card.classList.remove('card-holding');
          if (typeof card._triggerQuickAction === 'function') {
            card._triggerQuickAction();
          }
        }, 850);
      });

      card.addEventListener('mouseup', () => {
        if (mouseHoldTimer) {
          clearTimeout(mouseHoldTimer);
          mouseHoldTimer = null;
        }
        card.classList.remove('card-holding');
      });

      card.addEventListener('mouseleave', () => {
        if (mouseHoldTimer) {
          clearTimeout(mouseHoldTimer);
          mouseHoldTimer = null;
        }
        card.classList.remove('card-holding');
      });
    }

    card.addEventListener('click', (e) => {
      if (mouseHoldTriggered || touchHoldTriggered) {
        mouseHoldTriggered = false;
        touchHoldTriggered = false;
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (Date.now() - (this.trackEl._lastSwipeTime || 0) < 300) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      const lastTouch = parseInt(card.dataset.lastHandled || '0', 10);
      if (Date.now() - lastTouch < 600) return;
      const item = getItem();
      if (item) {
        this.onSelect(item);
      }
    });
  }

  bindTrackSwipe() {
    if (!this.trackEl || this.trackEl._hasTrackSwipe) return;
    this.trackEl._hasTrackSwipe = true;

    let isTouching = false;
    let isSwiping = false;
    let startX = 0;
    let startY = 0;
    let startScrollLeft = 0;
    let lastX = 0;
    let lastTime = 0;
    let velocity = 0;
    let rafId = null;

    const onStart = (clientX, clientY) => {
      isTouching = true;
      isSwiping = false;
      startX = clientX;
      startY = clientY;
      lastX = clientX;
      lastTime = Date.now();
      startScrollLeft = this.trackEl.scrollLeft;
      velocity = 0;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    const onMove = (clientX, clientY) => {
      if (!isTouching) return;
      const dx = clientX - startX;
      const dy = clientY - startY;

      if (!isSwiping) {
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 6) {
          isSwiping = true;
        } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) {
          // Vertical page scroll detected, release track dragging
          isTouching = false;
          return;
        }
      }

      if (isSwiping) {
        const now = Date.now();
        const dt = Math.max(1, now - lastTime);
        velocity = (lastX - clientX) / dt;
        lastX = clientX;
        lastTime = now;

        this.trackEl.scrollLeft = startScrollLeft - dx;
      }
    };

    const onEnd = () => {
      if (!isTouching && !isSwiping) return;
      isTouching = false;

      if (isSwiping) {
        isSwiping = false;
        this.trackEl._lastSwipeTime = Date.now();

        // Smooth momentum coasting
        if (Math.abs(velocity) > 0.1) {
          let currentVel = velocity * 12;
          const glide = () => {
            if (Math.abs(currentVel) < 0.2) return;
            this.trackEl.scrollLeft += currentVel;
            currentVel *= 0.92;
            rafId = requestAnimationFrame(glide);
          };
          rafId = requestAnimationFrame(glide);
        }
      }
    };

    this.trackEl.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) {
        onStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    this.trackEl.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        onMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    this.trackEl.addEventListener('touchend', onEnd, { passive: true });
    this.trackEl.addEventListener('touchcancel', onEnd, { passive: true });

    // Mouse drag support for desktop / air-mouse / emulator
    let isMouseDown = false;
    this.trackEl.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      isMouseDown = true;
      onStart(e.clientX, e.clientY);
    });
    window.addEventListener('mousemove', (e) => {
      if (!isMouseDown) return;
      onMove(e.clientX, e.clientY);
    });
    window.addEventListener('mouseup', () => {
      if (!isMouseDown) return;
      isMouseDown = false;
      onEnd();
    });
  }

  appendBatch() {
    if (!this.items || this.items.length === 0) return;
    const currentCardsCount = this.trackEl.querySelectorAll('.media-card').length;
    if (currentCardsCount >= 180) return; // Cap at 6 full loops of 30 cards

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = this.items.map((item, idx) => this.renderCardHTML(item, idx, false)).join('');

    const newWrappers = Array.from(tempDiv.children);
    newWrappers.forEach(wrapper => {
      this.trackEl.appendChild(wrapper);
      const card = wrapper.querySelector('.media-card');
      if (card) {
        this.bindCardEvents(card);
      }
    });
  }

  bindEvents() {
    // Top See All button click
    if (this.seeAllBtn && this.onSeeAll) {
      this.seeAllBtn.addEventListener('click', () => this.onSeeAll());
    }

    // Scroll buttons
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => {
        this.trackEl.scrollBy({ left: -320, behavior: 'smooth' });
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        this.trackEl.scrollBy({ left: 320, behavior: 'smooth' });
      });
    }
  }
}
























