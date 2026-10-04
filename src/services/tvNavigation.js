/**
 * tvNavigation.js - Ultra-Fast, Zero-Latency TV & Android TV Navigation Engine for CineTv
 * 
 * Features:
 * - Ultra-responsive D-Pad spatial navigation (Netflix-grade fluidity)
 * - Infinite row wrap-around & smooth card centering
 * - Column-aligned smart vertical row hopping
 * - Hero spotlight & Header tab transitions
 * - Modal stack management & 2D focus traps
 * - Full VideoPlayer HUD remote control integration (Play/Pause, Seek, Episodes, Audio/Subtitle menus)
 * - OK / Enter hold detection (tap = open/play, hold 700ms = Quick Action menu)
 * - Native Android TV hardware key bridge (`window.dispatchTvKey`, `window.dispatchTvKeyUp`)
 */

function isEnterKey(e) {
  const k = e.key || '';
  const c = e.keyCode || 0;
  return k === 'Enter' || k === 'Ok' || k === 'Select' || k === ' ' || c === 13 || c === 23 || c === 66;
}

function isBackKey(e) {
  const k = e.key || '';
  const c = e.keyCode || 0;
  return k === 'Escape' || k === 'Backspace' || k === 'GoBack' || c === 27 || c === 8 || c === 4;
}

function isMenuKey(e) {
  const k = e.key || '';
  const c = e.keyCode || 0;
  return k === 'ContextMenu' || k === 'Menu' || c === 82;
}

export class TvNavigation {
  constructor() {
    this.currentFocused = null;
    this.modalStack = [];
    this.tvEnterHoldingCard = null;
    this.tvEnterHoldStartTime = 0;
    this.tvEnterHoldTriggered = false;
    this.tvEnterHoldTimer = null;

    this.bindGlobalEvents();
    
    // Expose singleton on window
    window.cineTvNav = this;
    window.dispatchTvKey = (key, repeatCount) => this.dispatchKey(key, repeatCount);
    window.dispatchTvKeyUp = (key) => this.dispatchKeyUp(key);
  }

  bindGlobalEvents() {
    // Standard keyboard event listeners for browser / PC / testing
    document.addEventListener('keydown', (e) => {
      // Ignore if user is typing in a real text input
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
        if (e.key === 'Escape' || (e.key === 'ArrowDown' && e.target.id === 'search-input')) {
          // Let navigation handle exiting search input
        } else {
          return;
        }
      }

      const key = e.key;
      const repeatCount = e.repeat ? 1 : 0;
      const handled = this.handleKeyEvent(key, repeatCount, e);
      if (handled) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, { capture: true });

    document.addEventListener('keyup', (e) => {
      const key = e.key;
      this.dispatchKeyUp(key);
    }, { capture: true });

    // Ensure initial focus on load
    window.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => this.focusInitialElement(), 250);
    });
  }

  /**
   * Dispatch key from Native Android bridge (ACTION_DOWN)
   */
  dispatchKey(key, repeatCount = 0) {
    return this.handleKeyEvent(key, repeatCount, { key, repeatCount, preventDefault: () => {}, stopPropagation: () => {} });
  }

  /**
   * Dispatch key up from Native Android bridge (ACTION_UP)
   */
  dispatchKeyUp(key) {
    if (key === 'Enter' || key === 'Ok' || key === 'Select' || key === ' ') {
      this.cancelEnterHold();
    }
  }

  cancelEnterHold() {
    clearTimeout(this.tvEnterHoldTimer);
    if (this.tvEnterHoldingCard) {
      this.tvEnterHoldingCard.classList.remove('card-holding');
    }
    this.tvEnterHoldingCard = null;
    this.tvEnterHoldStartTime = 0;
    this.tvEnterHoldTriggered = false;
  }

  /**
   * Main Key Router
   */
  handleKeyEvent(key, repeatCount = 0, eventObj = {}) {
    this.lastRepeatCount = repeatCount;
    const e = {
      key: key,
      keyCode: key === 'Enter' ? 13 : (key === 'Escape' ? 27 : (key === 'ArrowUp' ? 38 : (key === 'ArrowDown' ? 40 : (key === 'ArrowLeft' ? 37 : (key === 'ArrowRight' ? 39 : 0))))),
      repeatCount: repeatCount,
      repeat: repeatCount > 0,
      preventDefault: () => { if (eventObj.preventDefault) eventObj.preventDefault(); },
      stopPropagation: () => { if (eventObj.stopPropagation) eventObj.stopPropagation(); }
    };

    // 1. Back key handling
    if (isBackKey(e)) {
      if (window.handleAppBackButton) {
        const handled = window.handleAppBackButton();
        return !!handled;
      }
      return false;
    }

    // 2. Active Player Remote Control
    const playerEl = document.getElementById('player-overlay');
    const isPlayerOpen = playerEl && !playerEl.classList.contains('hidden') && playerEl.style.display !== 'none';
    
    // Check if any sub-modal is open on top of Player or Dashboard
    const topModal = this.getTopModal();
    if (topModal && topModal !== playerEl) {
      return this.handleModalKeys(e, topModal);
    }

    if (isPlayerOpen) {
      return this.handlePlayerKeys(e);
    }

    // 3. Dashboard / Main UI Navigation
    return this.handleDashboardKeys(e);
  }

  /**
   * Set Focus to a given DOM element and apply visual styling
   */
  setFocus(element, scrollIntoView = true) {
    if (!element) return;
    if (this.currentFocused === element && element.classList.contains('tv-focused')) return;

    // Clear focus from previous element
    if (this.currentFocused && this.currentFocused !== element) {
      this.currentFocused.classList.remove('tv-focused');
    }

    this.currentFocused = element;
    element.classList.add('tv-focused');

    if (typeof element.focus === 'function') {
      try {
        element.focus({ preventScroll: true });
      } catch (err) {
        element.focus();
      }
    }

    if (scrollIntoView) {
      this.scrollElementIntoView(element);
    }
  }

  /**
   * Smooth & Fast scroll alignment
   */
  scrollElementIntoView(element) {
    if (!element) return;

    // If it's a card in a horizontal row track:
    const track = element.closest('.media-row-track');
    if (track) {
      // Anchored First-Stop Navigation (Netflix/Apple TV style):
      // The selector always stays on the first content slot on the left,
      // and the track scrolls to pull the rest of the content through this first stop.
      // Uses instant ('auto') scrolling: 'smooth' animations queue up and stutter
      // when the user presses left/right rapidly on a D-pad.
      const cardLeft = element.offsetLeft;
      const targetScroll = Math.max(0, cardLeft - 4);
      track.scrollTo({ left: targetScroll, behavior: 'auto' });

      // Only scroll vertically if the row is currently outside or partially cut off
      const rowContainer = element.closest('.media-row-container') || element.closest('section');
      if (rowContainer) {
        const rect = rowContainer.getBoundingClientRect();
        const vh = window.innerHeight || document.documentElement.clientHeight;
        if (rect.top < 70 || rect.bottom > vh - 40) {
          rowContainer.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'auto' });
        }
      }
      return;
    }

    // If it's in a grid (Discovery, My List, Catalog modal) or general container:
    try {
      element.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'auto' });
    } catch (err) {}
  }

  /**
   * Modal Management
   */
  pushModal(modalEl, initialFocusSelector = null) {
    if (!modalEl) return;
    this.modalStack.push({
      el: modalEl,
      previousFocused: this.currentFocused
    });

    document.body.classList.add('modal-open');

    setTimeout(() => {
      let target = null;
      if (initialFocusSelector) {
        target = modalEl.querySelector(initialFocusSelector);
      }
      if (!target) {
        target = modalEl.querySelector('.tv-focused') ||
                 modalEl.querySelector('button:not([disabled]):not(.hidden)') ||
                 modalEl.querySelector('.media-card') ||
                 modalEl.querySelector('[tabindex="0"]') ||
                 modalEl.querySelector('input:not([disabled])');
      }
      if (target) {
        this.setFocus(target, true);
      }
    }, 40);
  }

  popModal() {
    if (this.modalStack.length === 0) return;
    const entry = this.modalStack.pop();

    if (this.modalStack.length === 0) {
      const isPlayerOpen = document.getElementById('player-overlay') && !document.getElementById('player-overlay').classList.contains('hidden');
      if (!isPlayerOpen) {
        document.body.classList.remove('modal-open');
      }
    }

    if (entry.previousFocused && document.body.contains(entry.previousFocused)) {
      this.setFocus(entry.previousFocused, true);
    } else {
      this.focusInitialElement();
    }
  }

  popSpecificModal(modalEl) {
    if (!modalEl) return;
    const idx = this.modalStack.findIndex(entry => entry.el === modalEl);
    if (idx !== -1) {
      const entry = this.modalStack.splice(idx, 1)[0];
      if (this.modalStack.length === 0) {
        const isPlayerOpen = document.getElementById('player-overlay') && !document.getElementById('player-overlay').classList.contains('hidden');
        if (!isPlayerOpen) {
          document.body.classList.remove('modal-open');
        }
      }
      if (entry.previousFocused && document.body.contains(entry.previousFocused)) {
        this.setFocus(entry.previousFocused, true);
      }
    }
  }

  isModalOpen() {
    return this.modalStack.length > 0;
  }

  getTopModal() {
    if (this.modalStack.length > 0) {
      for (let i = this.modalStack.length - 1; i >= 0; i--) {
        const modal = this.modalStack[i].el;
        if (modal && !modal.classList.contains('hidden') && modal.style.display !== 'none') {
          return modal;
        }
      }
    }

    // Fallback: check DOM for visible overlays
    const overlays = [
      '#disc-picker-modal',
      '#quick-action-modal',
      '#player-resume-modal',
      '#player-subtitles-modal',
      '#player-audio-modal',
      '#player-settings-modal',
      '#player-cast-modal',
      '#auth-overlay',
      '#profile-overlay',
      '#settings-overlay',
      '#catalog-overlay',
      '#trailer-overlay',
      '#details-overlay',
      '#search-modal',
      '#search-results-overlay'
    ];

    for (const sel of overlays) {
      const el = document.querySelector(sel);
      if (el && !el.classList.contains('hidden') && el.style.display !== 'none') {
        return el;
      }
    }

    return null;
  }

  /**
   * Robust visibility check respecting CSS display, opacity, and ancestors
   */
  isElementVisible(el) {
    if (!el || !document.body.contains(el)) return false;
    try {
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
      let p = el.parentElement;
      while (p && p !== document.body) {
        const ps = window.getComputedStyle(p);
        if (ps.display === 'none' || ps.visibility === 'hidden') return false;
        p = p.parentElement;
      }
      return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0;
    } catch (e) {
      return el.offsetWidth > 0 || el.offsetHeight > 0;
    }
  }

  /**
   * Find first visible card in current active tab
   */
  getFirstVisibleCardOnActiveTab() {
    const pages = ['#page-movies', '#page-series', '#page-discovery', '#page-mylist'];
    for (const pageSel of pages) {
      const page = document.querySelector(pageSel);
      if (page && !page.classList.contains('hidden') && page.style.display !== 'none') {
        const tracks = Array.from(page.querySelectorAll('.media-row-track')).filter(track => {
          const container = track.closest('.media-row-container') || track.closest('section') || track.parentElement;
          if (container && (container.classList.contains('hidden') || container.style.display === 'none')) return false;
          return track.querySelectorAll('.media-card').length > 0;
        });
        for (const track of tracks) {
          const firstCard = track.querySelector('.media-card');
          if (firstCard && this.isElementVisible(firstCard)) return firstCard;
        }
        const anyCard = Array.from(page.querySelectorAll('.media-card')).find(c => {
          return this.isElementVisible(c);
        });
        if (anyCard) return anyCard;
        const btn = page.querySelector('button:not([disabled])');
        if (btn && this.isElementVisible(btn)) return btn;
      }
    }
    return null;
  }

  /**
   * Initial focus setup
   */
  focusInitialElement() {
    const topModal = this.getTopModal();
    if (topModal) {
      const target = topModal.querySelector('.tv-focused') ||
                     topModal.querySelector('button:not([disabled])') ||
                     topModal.querySelector('.media-card') ||
                     topModal.querySelector('input');
      if (target) {
        this.setFocus(target, true);
        return;
      }
    }

    const firstCard = this.getFirstVisibleCardOnActiveTab();
    if (firstCard) {
      this.setFocus(firstCard, true);
      return;
    }

    const currentTab = (window.cineApp && window.cineApp.currentTab) || 'movies';
    const tabBtn = document.getElementById('tab-btn-' + currentTab) || document.getElementById('tab-btn-movies');
    if (tabBtn) {
      this.setFocus(tabBtn, true);
    }
  }

  /**
   * Dashboard & Catalog Browsing Key Handler
   */
  handleDashboardKeys(e) {
    const key = e.key;
    const current = this.currentFocused;

    if (!current || !document.body.contains(current) || !this.isElementVisible(current)) {
      this.focusInitialElement();
      return true;
    }

    // 1. Menu / ContextMenu Key -> Trigger Quick Action on card
    if (isMenuKey(e)) {
      if (current.classList.contains('media-card')) {
        e.preventDefault();
        if (typeof current._triggerQuickAction === 'function') {
          current._triggerQuickAction();
        } else if (typeof current._triggerRemove === 'function') {
          current._triggerRemove();
        }
        return true;
      }
    }

    // 2. OK / Enter Key Handling
    if (isEnterKey(e)) {
      // If typing in search input
      if (current.id === 'search-input' || current.tagName === 'INPUT') {
        current.focus();
        if (window.AndroidNative && window.AndroidNative.showKeyboard) {
          window.AndroidNative.showKeyboard();
        }
        return true;
      }

      // Media Card OK Press -> Instant open / play
      if (current.classList.contains('media-card')) {
        e.preventDefault();
        this.cancelEnterHold();
        if (typeof current._triggerOpen === 'function') {
          current._triggerOpen();
        } else if (typeof current.click === 'function') {
          current.click();
        }
        return true;
      }

      // General Button / Interactive Element Click
      e.preventDefault();
      if (typeof current._triggerOpen === 'function') {
        current._triggerOpen();
      } else if (typeof current.click === 'function') {
        current.click();
      }
      return true;
    }

    // Cancel any holding if user navigated away
    this.cancelEnterHold();

    // 3. Header Section (Tabs, Search, Profile, Settings)
    const isHeader = current.closest('header') || current.classList.contains('tab-btn');
    if (isHeader) {
      return this.handleHeaderKeys(e, current);
    }

    // 4. Hero Spotlight Banner
    if (current.id === 'hero-play-btn' || current.id === 'hero-info-btn' || current.id === 'hero-watchlist-btn' || current.closest('#hero-banner-root')) {
      return this.handleHeroBannerKeys(e, current);
    }

    // 5. Discovery Hub Page
    if (current.closest('#page-discovery')) {
      return this.handleDiscoveryKeys(e, current);
    }

    // 6. My List Page
    if (current.closest('#page-mylist')) {
      return this.handleMyListKeys(e, current);
    }

    // 7. Media Row Content Cards
    if (current.classList.contains('media-card') || current.classList.contains('btn-track-see-all')) {
      return this.handleRowCardKeys(e, current);
    }

    // Fallback: stay focused on content
    const fallback = this.getFirstVisibleCardOnActiveTab();
    if (fallback) {
      this.setFocus(fallback, true);
      return true;
    }

    return false;
  }

  /**
   * Header Navigation (Tabs, Search, Profile, Settings)
   */
  handleHeaderKeys(e, current) {
    const key = e.key;
    const tabMovies = document.getElementById('tab-btn-movies');
    const tabSeries = document.getElementById('tab-btn-series');
    const tabDiscovery = document.getElementById('tab-btn-discovery');
    const tabMyList = document.getElementById('tab-btn-mylist');

    const btnSearch = document.getElementById('btn-open-search') || document.getElementById('btn-open-search-mobile');
    const btnProfile = document.getElementById('btn-open-profile') || document.getElementById('btn-open-profile-mobile');
    const btnSettings = document.getElementById('btn-open-settings') || document.getElementById('btn-open-settings-mobile');

    const tabsList = [tabMovies, tabSeries, tabDiscovery, tabMyList].filter(Boolean);
    const headerButtons = [btnSearch, btnProfile, btnSettings].filter(Boolean);
    const allHeaderItems = [...tabsList, ...headerButtons];

    let idx = allHeaderItems.indexOf(current);
    if (idx === -1) {
      idx = allHeaderItems.findIndex(el => el.contains(current));
    }
    if (idx === -1) {
      idx = 0;
    }
    const isCurrentTab = idx < tabsList.length;
    const isCurrentBtn = idx >= tabsList.length;

    if (key === 'ArrowRight') {
      e.preventDefault();
      if (idx < allHeaderItems.length - 1) {
        this.setFocus(allHeaderItems[idx + 1], true);
      } else if (allHeaderItems.length > 0) {
        // Infinite wrap: right from Settings wraps back to Movies tab
        this.setFocus(allHeaderItems[0], true);
      }
      return true;
    }

    if (key === 'ArrowLeft') {
      e.preventDefault();
      if (idx > 0) {
        this.setFocus(allHeaderItems[idx - 1], true);
      } else if (idx === 0 && allHeaderItems.length > 0) {
        // Infinite wrap: left from Movies wraps to Settings button
        this.setFocus(allHeaderItems[allHeaderItems.length - 1], true);
      }
      return true;
    }

    if (key === 'ArrowUp') {
      e.preventDefault();
      // If on tabs, jump directly up to action buttons (Search, Profile, or Settings)
      if (isCurrentTab) {
        if (btnSearch && this.isElementVisible(btnSearch)) {
          this.setFocus(btnSearch, true);
        } else if (headerButtons.length > 0) {
          this.setFocus(headerButtons[0], true);
        }
        return true;
      }
      // If already on action buttons, keep focus
      return true;
    }

    if (key === 'ArrowDown') {
      e.preventDefault();

      // If currently on an action button (Search, Profile, Settings), jump down to the active tab
      if (isCurrentBtn) {
        const currentTab = (window.cineApp && window.cineApp.currentTab) || 'movies';
        const activeTab = document.getElementById('tab-btn-' + currentTab) || tabMovies;
        if (activeTab && this.isElementVisible(activeTab)) {
          this.setFocus(activeTab, true);
          return true;
        }
      }

      // If currently on Discovery Tab
      if (current === tabDiscovery) {
        const firstDisc = document.getElementById('disc-type-movie') ||
                          document.querySelector('#disc-mood-bar .disc-mood-btn') ||
                          document.querySelector('#disc-platforms-bar .disc-platform-btn') ||
                          document.querySelector('#page-discovery .media-card');
        if (firstDisc && this.isElementVisible(firstDisc)) {
          this.setFocus(firstDisc, true);
          return true;
        }
      }

      // If currently on My List Tab
      if (current === tabMyList) {
        const firstMyList = document.querySelector('#page-mylist .mylist-filter-btn') ||
                            document.querySelector('#page-mylist .media-card') ||
                            document.getElementById('mylist-btn-explore');
        if (firstMyList && this.isElementVisible(firstMyList)) {
          this.setFocus(firstMyList, true);
          return true;
        }
      }

      // For Movies / Series Tabs: Jump to Hero Spotlight or First Row
      const heroPlay = document.getElementById('hero-play-btn');
      const heroBanner = document.getElementById('hero-banner-root');
      if (heroBanner && !heroBanner.classList.contains('hidden') && heroPlay && this.isElementVisible(heroPlay)) {
        this.setFocus(heroPlay, true);
        return true;
      }

      const firstCard = this.getFirstVisibleCardOnActiveTab();
      if (firstCard) {
        this.setFocus(firstCard, true);
        return true;
      }
      return true;
    }

    return false;
  }

  /**
   * Hero Spotlight Banner Key Handler
   */
  handleHeroBannerKeys(e, current) {
    const key = e.key;
    const playBtn = document.getElementById('hero-play-btn');
    const watchlistBtn = document.getElementById('hero-watchlist-btn');
    const infoBtn = document.getElementById('hero-info-btn');

    if (key === 'ArrowLeft') {
      e.preventDefault();
      if (current === infoBtn && watchlistBtn) {
        this.setFocus(watchlistBtn, true);
      } else if (current === watchlistBtn && playBtn) {
        this.setFocus(playBtn, true);
      } else if (current === playBtn) {
        // Cycle Hero Carousel Previous
        if (window.cineHeroBanner && typeof window.cineHeroBanner.prev === 'function') {
          window.cineHeroBanner.prev();
        }
      }
      return true;
    }

    if (key === 'ArrowRight') {
      e.preventDefault();
      if (current === playBtn && watchlistBtn) {
        this.setFocus(watchlistBtn, true);
      } else if (current === watchlistBtn && infoBtn) {
        this.setFocus(infoBtn, true);
      } else if (current === infoBtn) {
        // Cycle Hero Carousel Next
        if (window.cineHeroBanner && typeof window.cineHeroBanner.next === 'function') {
          window.cineHeroBanner.next();
        }
      }
      return true;
    }

    if (key === 'ArrowUp') {
      e.preventDefault();
      if (current === infoBtn) {
        const btnSearch = document.getElementById('btn-open-search');
        if (btnSearch) {
          this.setFocus(btnSearch, true);
          return true;
        }
      }
      const currentTab = (window.cineApp && window.cineApp.currentTab) || 'movies';
      const activeTab = document.getElementById('tab-btn-' + currentTab) || document.getElementById('tab-btn-movies');
      if (activeTab) {
        this.setFocus(activeTab, true);
      }
      return true;
    }

    if (key === 'ArrowDown') {
      e.preventDefault();
      const firstCard = this.getFirstVisibleCardOnActiveTab();
      if (firstCard) {
        this.setFocus(firstCard, true);
      }
      return true;
    }

    return false;
  }

  /**
   * Media Row Content Cards Navigation (Netflix-Grade Smoothness)
   */
  handleRowCardKeys(e, currentCard) {
    const key = e.key;

    // Horizontal Move (ArrowLeft / ArrowRight) with Seamless Infinite Wrap
    if (key === 'ArrowRight') {
      e.preventDefault();
      const wrapper = currentCard.closest('.media-card-wrapper');
      const nextWrapper = wrapper ? wrapper.nextElementSibling : currentCard.nextElementSibling;
      const nextCard = nextWrapper?.querySelector ? (nextWrapper.querySelector('.media-card') || nextWrapper) : nextWrapper;

      if (nextCard && nextCard.classList.contains('media-card')) {
        this.setFocus(nextCard, true);
      } else {
        // End of row: wrap to the very first card in the row (infinite Netflix experience)
        const track = currentCard.closest('.media-row-track');
        if (track) {
          const allCards = Array.from(track.querySelectorAll('.media-card'));
          if (allCards.length > 1) {
            this.setFocus(allCards[0], true);
          }
        }
      }
      return true;
    }

    if (key === 'ArrowLeft') {
      e.preventDefault();
      const wrapper = currentCard.closest('.media-card-wrapper');
      const prevWrapper = wrapper ? wrapper.previousElementSibling : currentCard.previousElementSibling;
      const prevCard = prevWrapper?.querySelector ? (prevWrapper.querySelector('.media-card') || prevWrapper) : prevWrapper;

      if (prevCard && prevCard.classList.contains('media-card')) {
        this.setFocus(prevCard, true);
      } else {
        // Start of row: wrap to the last card in the row
        const track = currentCard.closest('.media-row-track');
        if (track) {
          const allCards = Array.from(track.querySelectorAll('.media-card'));
          if (allCards.length > 1) {
            this.setFocus(allCards[allCards.length - 1], true);
          }
        }
      }
      return true;
    }

    // Vertical Row Hopping (ArrowDown / ArrowUp)
    if (key === 'ArrowDown') {
      e.preventDefault();
      const nextRowCard = this.findCardInAdjacentRow(currentCard, 'down');
      if (nextRowCard) {
        this.setFocus(nextRowCard, true);
      }
      return true;
    }

    if (key === 'ArrowUp') {
      e.preventDefault();
      const prevRowCard = this.findCardInAdjacentRow(currentCard, 'up');
      if (prevRowCard) {
        this.setFocus(prevRowCard, true);
      } else {
        // At topmost row: jump to Hero Spotlight if visible, else jump to Header Tab!
        const mainContainer = document.getElementById('dashboard-main') || document.querySelector('main');
        if (mainContainer) mainContainer.scrollTo({ top: 0, behavior: 'auto' });

        const heroPlay = document.getElementById('hero-play-btn');
        const heroBanner = document.getElementById('hero-banner-root');
        if (heroBanner && !heroBanner.classList.contains('hidden') && heroPlay) {
          this.setFocus(heroPlay, true);
        } else {
          const currentTab = (window.cineApp && window.cineApp.currentTab) || 'movies';
          const activeTab = document.getElementById('tab-btn-' + currentTab) || document.getElementById('tab-btn-movies');
          if (activeTab) this.setFocus(activeTab, true);
        }
      }
      return true;
    }

    return false;
  }

  /**
   * Find corresponding card in adjacent row directly straight ahead (visual spatial alignment)
   */
  findCardInAdjacentRow(currentCard, direction = 'down') {
    if (!currentCard) return null;

    const currentTrack = currentCard.closest('.media-row-track');
    if (!currentTrack) return null;

    // Get current active page container
    const activePage = currentCard.closest('[id^="page-"]') || 
      document.querySelector('#page-movies:not(.hidden), #page-series:not(.hidden), #page-discovery:not(.hidden), #page-mylist:not(.hidden)') ||
      document.getElementById('dashboard-main') ||
      document.body;

    // Find all visible tracks in DOM order (matches visual top-to-bottom for
    // stacked rows). Avoids getBoundingClientRect() per track, which forced
    // a synchronous layout on every keypress and caused lag on TV boxes.
    const allTracks = Array.from(activePage.querySelectorAll('.media-row-track')).filter(track => {
      if (track.classList.contains('hidden') || track.style.display === 'none') return false;
      const container = track.closest('.media-row-container') || track.closest('section') || track.parentElement;
      if (container && (container.classList.contains('hidden') || container.style.display === 'none')) return false;
      return track.querySelector('.media-card') !== null;
    });

    const currentIdx = allTracks.indexOf(currentTrack);
    if (currentIdx === -1) return null;

    const targetIdx = direction === 'up' ? currentIdx - 1 : currentIdx + 1;
    if (targetIdx < 0 || targetIdx >= allTracks.length) return null;

    const targetTrack = allTracks[targetIdx];

    const targetCards = Array.from(targetTrack.querySelectorAll('.media-card'));
    if (targetCards.length === 0) return null;

    // In fixed first-stop navigation, pick the card currently sitting at the first stop of targetTrack
    let bestCard = targetCards[0];
    let minDistance = Infinity;
    const targetScrollLeft = targetTrack.scrollLeft;

    for (let i = 0; i < targetCards.length; i++) {
      const card = targetCards[i];
      const distance = Math.abs(card.offsetLeft - targetScrollLeft);
      if (distance < minDistance) {
        minDistance = distance;
        bestCard = card;
      }
    }

    return bestCard;
  }

  /**
   * Discovery Hub Key Handler (Filter bars & Grid)
   */
  handleDiscoveryKeys(e, current) {
    const key = e.key;
    const tabDiscovery = document.getElementById('tab-btn-discovery');
    const discPage = document.getElementById('page-discovery');
    if (!discPage) return false;

    // Collect all 6 levels of interactive elements in Discovery Hub
    const typeBtns = Array.from(discPage.querySelectorAll('.disc-type-btn')).filter(el => el.offsetParent !== null);
    const moodBtns = Array.from(discPage.querySelectorAll('#disc-mood-bar .disc-mood-btn')).filter(el => el.offsetParent !== null);
    const platformBtns = Array.from(discPage.querySelectorAll('#disc-platforms-bar .disc-platform-btn')).filter(el => el.offsetParent !== null);
    const pickerBtns = [
      document.getElementById('disc-btn-year'),
      document.getElementById('disc-btn-rating'),
      document.getElementById('disc-btn-sort')
    ].filter(el => el && el.offsetParent !== null);
    const genreBtns = Array.from(discPage.querySelectorAll('#disc-genre-bar .disc-genre-btn')).filter(el => el.offsetParent !== null);
    
    const grid = document.getElementById('disc-grid');
    const cards = grid ? Array.from(grid.querySelectorAll('.media-card')).filter(el => el.offsetParent !== null) : [];

    // LEVEL 5: Grid Cards
    if (current.classList.contains('media-card')) {
      const idx = cards.indexOf(current);
      if (idx === -1) return false;
      const cols = grid ? (window.getComputedStyle(grid).gridTemplateColumns.split(' ').length || 4) : 4;

      if (key === 'ArrowRight') {
        e.preventDefault();
        if (idx < cards.length - 1) {
          this.setFocus(cards[idx + 1], true);
        }
        return true;
      }
      if (key === 'ArrowLeft') {
        e.preventDefault();
        if (idx > 0) {
          this.setFocus(cards[idx - 1], true);
        }
        return true;
      }
      if (key === 'ArrowDown') {
        e.preventDefault();
        if (window.cineDiscoveryHub && idx + cols * 2 >= cards.length) {
          window.cineDiscoveryHub.loadNextBatch();
        }
        const updatedCards = grid ? Array.from(grid.querySelectorAll('.media-card')).filter(el => el.offsetParent !== null) : cards;
        if (idx + cols < updatedCards.length) {
          this.setFocus(updatedCards[idx + cols], true);
        } else if (idx < updatedCards.length - 1) {
          this.setFocus(updatedCards[updatedCards.length - 1], true);
        }
        return true;
      }
      if (key === 'ArrowUp') {
        e.preventDefault();
        if (idx - cols >= 0) {
          this.setFocus(cards[idx - cols], true);
        } else {
          // Top row of grid -> jump up to Level 4 (Genre Pills)
          const activeGenre = genreBtns.find(b => b.classList.contains('bg-[#e50914]') || b.classList.contains('bg-red-600')) || genreBtns[0];
          if (activeGenre) {
            this.setFocus(activeGenre, true);
          } else if (pickerBtns.length > 0) {
            this.setFocus(pickerBtns[0], true);
          }
        }
        return true;
      }
      return false;
    }

    // LEVEL 4: Genre Pills (#disc-genre-bar)
    if (current.classList.contains('disc-genre-btn')) {
      const idx = genreBtns.indexOf(current);

      if (key === 'ArrowRight') {
        e.preventDefault();
        if (idx < genreBtns.length - 1) {
          this.setFocus(genreBtns[idx + 1], true);
        }
        return true;
      }
      if (key === 'ArrowLeft') {
        e.preventDefault();
        if (idx > 0) {
          this.setFocus(genreBtns[idx - 1], true);
        }
        return true;
      }
      if (key === 'ArrowDown') {
        e.preventDefault();
        if (cards.length > 0) {
          this.setFocus(cards[0], true);
        }
        return true;
      }
      if (key === 'ArrowUp') {
        e.preventDefault();
        // Jump to Level 3 (Picker Buttons: Year, Rating, Sort)
        if (pickerBtns.length > 0) {
          const closest = this.findClosestElementInDirection(current, pickerBtns, 'up') || pickerBtns[0];
          this.setFocus(closest, true);
        } else if (platformBtns.length > 0) {
          this.setFocus(platformBtns[0], true);
        }
        return true;
      }
      return false;
    }

    // LEVEL 3: Custom Picker Buttons (#disc-btn-year, #disc-btn-rating, #disc-btn-sort)
    if (pickerBtns.includes(current)) {
      const idx = pickerBtns.indexOf(current);

      if (key === 'ArrowRight') {
        e.preventDefault();
        if (idx < pickerBtns.length - 1) {
          this.setFocus(pickerBtns[idx + 1], true);
        }
        return true;
      }
      if (key === 'ArrowLeft') {
        e.preventDefault();
        if (idx > 0) {
          this.setFocus(pickerBtns[idx - 1], true);
        }
        return true;
      }
      if (key === 'ArrowDown') {
        e.preventDefault();
        // Jump to Level 4 (Genre Pills)
        const activeGenre = genreBtns.find(b => b.classList.contains('bg-[#e50914]') || b.classList.contains('bg-red-600')) || genreBtns[0];
        if (activeGenre) {
          this.setFocus(activeGenre, true);
        } else if (cards.length > 0) {
          this.setFocus(cards[0], true);
        }
        return true;
      }
      if (key === 'ArrowUp') {
        e.preventDefault();
        // Jump to Level 2 (Platforms Bar)
        const activePlat = platformBtns.find(b => b.classList.contains('border-[#e50914]') || b.classList.contains('bg-white/10')) || platformBtns[0];
        if (activePlat) {
          this.setFocus(activePlat, true);
        } else if (moodBtns.length > 0) {
          this.setFocus(moodBtns[0], true);
        }
        return true;
      }
      return false;
    }

    // LEVEL 2: Platform Buttons (#disc-platforms-bar)
    if (current.classList.contains('disc-platform-btn')) {
      const idx = platformBtns.indexOf(current);

      if (key === 'ArrowRight') {
        e.preventDefault();
        if (idx < platformBtns.length - 1) {
          this.setFocus(platformBtns[idx + 1], true);
        }
        return true;
      }
      if (key === 'ArrowLeft') {
        e.preventDefault();
        if (idx > 0) {
          this.setFocus(platformBtns[idx - 1], true);
        }
        return true;
      }
      if (key === 'ArrowDown') {
        e.preventDefault();
        // Jump to Level 3 (Picker Buttons)
        if (pickerBtns.length > 0) {
          this.setFocus(pickerBtns[0], true);
        } else if (genreBtns.length > 0) {
          this.setFocus(genreBtns[0], true);
        }
        return true;
      }
      if (key === 'ArrowUp') {
        e.preventDefault();
        // Jump to Level 1 (Mood Buttons)
        if (moodBtns.length > 0) {
          this.setFocus(moodBtns[0], true);
        } else if (typeBtns.length > 0) {
          this.setFocus(typeBtns[0], true);
        } else if (tabDiscovery) {
          this.setFocus(tabDiscovery, true);
        }
        return true;
      }
      return false;
    }

    // LEVEL 1: Mood Buttons (#disc-mood-bar)
    if (current.classList.contains('disc-mood-btn')) {
      const idx = moodBtns.indexOf(current);

      if (key === 'ArrowRight') {
        e.preventDefault();
        if (idx < moodBtns.length - 1) {
          this.setFocus(moodBtns[idx + 1], true);
        }
        return true;
      }
      if (key === 'ArrowLeft') {
        e.preventDefault();
        if (idx > 0) {
          this.setFocus(moodBtns[idx - 1], true);
        }
        return true;
      }
      if (key === 'ArrowDown') {
        e.preventDefault();
        // Jump to Level 2 (Platforms Bar)
        if (platformBtns.length > 0) {
          this.setFocus(platformBtns[0], true);
        } else if (pickerBtns.length > 0) {
          this.setFocus(pickerBtns[0], true);
        }
        return true;
      }
      if (key === 'ArrowUp') {
        e.preventDefault();
        // Jump to Level 0 (Type Buttons: Movie / Series)
        const activeType = typeBtns.find(b => b.classList.contains('bg-red-600')) || typeBtns[0];
        if (activeType) {
          this.setFocus(activeType, true);
        } else if (tabDiscovery) {
          this.setFocus(tabDiscovery, true);
        }
        return true;
      }
      return false;
    }

    // LEVEL 0: Type Buttons (.disc-type-btn: Movie vs Series)
    if (current.classList.contains('disc-type-btn')) {
      const idx = typeBtns.indexOf(current);

      if (key === 'ArrowRight') {
        e.preventDefault();
        if (idx < typeBtns.length - 1) {
          this.setFocus(typeBtns[idx + 1], true);
        }
        return true;
      }
      if (key === 'ArrowLeft') {
        e.preventDefault();
        if (idx > 0) {
          this.setFocus(typeBtns[idx - 1], true);
        }
        return true;
      }
      if (key === 'ArrowDown') {
        e.preventDefault();
        // Jump to Level 1 (Mood Buttons)
        if (moodBtns.length > 0) {
          this.setFocus(moodBtns[0], true);
        } else if (platformBtns.length > 0) {
          this.setFocus(platformBtns[0], true);
        }
        return true;
      }
      if (key === 'ArrowUp') {
        e.preventDefault();
        // Jump to Header Tab
        if (tabDiscovery) {
          this.setFocus(tabDiscovery, true);
        }
        return true;
      }
      return false;
    }

    // Fallback if focused on something else in discovery page
    if (key === 'ArrowDown') {
      e.preventDefault();
      if (cards.length > 0) this.setFocus(cards[0], true);
      return true;
    }
    if (key === 'ArrowUp') {
      e.preventDefault();
      if (tabDiscovery) this.setFocus(tabDiscovery, true);
      return true;
    }

    return false;
  }

  /**
   * My List Page Key Handler
   */
  handleMyListKeys(e, current) {
    const key = e.key;
    const myListPage = document.getElementById('page-mylist');
    if (!myListPage) return false;

    const tabMyList = document.getElementById('tab-btn-mylist');
    const cards = Array.from(myListPage.querySelectorAll('.media-card'));

    if (current.classList.contains('media-card')) {
      const idx = cards.indexOf(current);
      const cols = (window.innerWidth >= 1280) ? 7 : (window.innerWidth >= 1024 ? 6 : (window.innerWidth >= 768 ? 4 : (window.innerWidth >= 640 ? 3 : 2)));

      if (key === 'ArrowRight') {
        e.preventDefault();
        if (idx < cards.length - 1) this.setFocus(cards[idx + 1], true);
        return true;
      }
      if (key === 'ArrowLeft') {
        e.preventDefault();
        if (idx > 0) this.setFocus(cards[idx - 1], true);
        return true;
      }
      if (key === 'ArrowDown') {
        e.preventDefault();
        if (idx + cols < cards.length) {
          this.setFocus(cards[idx + cols], true);
        } else if (idx < cards.length - 1) {
          this.setFocus(cards[cards.length - 1], true);
        }
        return true;
      }
      if (key === 'ArrowUp') {
        e.preventDefault();
        if (idx - cols >= 0) {
          this.setFocus(cards[idx - cols], true);
        } else {
          const activePill = myListPage.querySelector('.mylist-filter-btn.bg-\\[\\#e50914\\]') ||
                             myListPage.querySelector('.mylist-filter-btn');
          if (activePill) this.setFocus(activePill, true);
          else if (tabMyList) this.setFocus(tabMyList, true);
        }
        return true;
      }
      return false;
    }

    // Filter Buttons
    if (current.classList.contains('mylist-filter-btn')) {
      if (key === 'ArrowUp' && tabMyList) {
        e.preventDefault();
        this.setFocus(tabMyList, true);
        return true;
      }
      if (key === 'ArrowDown') {
        e.preventDefault();
        if (cards.length > 0) {
          this.setFocus(cards[0], true);
        } else {
          const exploreBtn = myListPage.querySelector('#mylist-btn-explore');
          if (exploreBtn) this.setFocus(exploreBtn, true);
        }
        return true;
      }
      if (key === 'ArrowLeft') {
        e.preventDefault();
        const prev = current.previousElementSibling;
        if (prev) this.setFocus(prev, true);
        return true;
      }
      if (key === 'ArrowRight') {
        e.preventDefault();
        const next = current.nextElementSibling;
        if (next) this.setFocus(next, true);
        return true;
      }
    }

    return false;
  }

  /**
   * Modal 2D Spatial Focus Trapping & Navigation
   */
  handleModalKeys(e, modal) {
    const key = e.key;
    const focusables = Array.from(modal.querySelectorAll('button:not([disabled]):not(.hidden), .media-card, [tabindex="0"]:not([disabled]), input:not([disabled]), select:not([disabled])'))
      .filter(el => el.offsetParent !== null && !el.classList.contains('hidden'));

    if (focusables.length === 0) return false;

    if (!this.currentFocused || !modal.contains(this.currentFocused)) {
      this.setFocus(focusables[0], true);
      return true;
    }

    const current = this.currentFocused;
    const currentIndex = focusables.indexOf(current);

    if (isEnterKey(e)) {
      e.preventDefault();
      if (current.tagName === 'INPUT') {
        current.focus();
        if (window.AndroidNative && window.AndroidNative.showKeyboard) {
          window.AndroidNative.showKeyboard();
        }
      } else if (typeof current._triggerOpen === 'function') {
        current._triggerOpen();
      } else if (typeof current.click === 'function') {
        current.click();
      }
      return true;
    }

    if (key === 'ArrowRight') {
      e.preventDefault();
      const rightEl = this.findClosestElementInDirection(current, focusables, 'right');
      if (rightEl) {
        this.setFocus(rightEl, true);
      } else {
        const next = focusables[(currentIndex + 1) % focusables.length];
        this.setFocus(next, true);
      }
      return true;
    }

    if (key === 'ArrowLeft') {
      e.preventDefault();
      const leftEl = this.findClosestElementInDirection(current, focusables, 'left');
      if (leftEl) {
        this.setFocus(leftEl, true);
      } else {
        const prev = focusables[(currentIndex - 1 + focusables.length) % focusables.length];
        this.setFocus(prev, true);
      }
      return true;
    }

    if (key === 'ArrowDown') {
      e.preventDefault();
      const downEl = this.findClosestElementInDirection(current, focusables, 'down');
      if (downEl) {
        this.setFocus(downEl, true);
      } else {
        const next = focusables[(currentIndex + 1) % focusables.length];
        this.setFocus(next, true);
      }
      return true;
    }

    if (key === 'ArrowUp') {
      e.preventDefault();
      const upEl = this.findClosestElementInDirection(current, focusables, 'up');
      if (upEl) {
        this.setFocus(upEl, true);
      } else {
        const prev = focusables[(currentIndex - 1 + focusables.length) % focusables.length];
        this.setFocus(prev, true);
      }
      return true;
    }

    return false;
  }

  /**
   * VideoPlayer HUD Remote Navigation (Instant Response)
   */
  handlePlayerKeys(e) {
    const player = window.cinePlayerInstance;
    if (!player) return false;

    const key = e.key;

    // Dedicated Media Keys
    if (key === 'MediaPlayPause' || key === 'MediaPlay' || key === 'MediaPause') {
      e.preventDefault();
      player.togglePlay();
      return true;
    }
    if (key === 'FastForward') {
      e.preventDefault();
      player.seek(10);
      return true;
    }
    if (key === 'Rewind') {
      e.preventDefault();
      player.seek(-10);
      return true;
    }

    // Any D-Pad key wakes or keeps HUD visible
    const hudWasVisible = player.isHudVisible();
    player.resetHUDTimeout();

    // If HUD was hidden, first D-Pad tap wakes HUD and focuses center Play button
    if (!hudWasVisible) {
      player.showHUD(true);
      return true;
    }

    // Keep HUD visible while user navigates without resetting focus
    player.showHUD(false);

    const current = this.currentFocused;
    const playBtn = document.getElementById('player-play-btn');
    const rewindBtn = document.getElementById('player-rewind-btn');
    const forwardBtn = document.getElementById('player-forward-btn');
    const prevEpBtn = document.getElementById('player-prev-ep-btn');
    const nextEpBtn = document.getElementById('player-next-ep-btn');
    const scrubberContainer = document.getElementById('player-scrubber-container');
    const topBar = document.getElementById('player-top-bar');

    const centerControls = [prevEpBtn, rewindBtn, playBtn, forwardBtn, nextEpBtn].filter(el => el && !el.classList.contains('hidden') && el.offsetParent !== null);
    const topButtons = topBar ? Array.from(topBar.querySelectorAll('button:not([disabled]):not(.hidden)')).filter(el => el.offsetParent !== null) : [];

    // 1. Center Controls Row (Rewind, Play, Forward, Prev/Next Ep)
    if (centerControls.includes(current)) {
      const idx = centerControls.indexOf(current);

      if (isEnterKey(e)) {
        e.preventDefault();
        current.click();
        return true;
      }

      if (key === 'ArrowRight') {
        e.preventDefault();
        if (idx < centerControls.length - 1) {
          this.setFocus(centerControls[idx + 1], false);
        }
        return true;
      }

      if (key === 'ArrowLeft') {
        e.preventDefault();
        if (idx > 0) {
          this.setFocus(centerControls[idx - 1], false);
        }
        return true;
      }

      if (key === 'ArrowUp') {
        e.preventDefault();
        // Jump to Top Controls Bar
        if (topButtons.length > 0) {
          const closestTop = this.findClosestElementInDirection(current, topButtons, 'up') || topButtons[0];
          this.setFocus(closestTop, false);
        }
        return true;
      }

      if (key === 'ArrowDown') {
        e.preventDefault();
        // Jump to Scrubber Timeline
        if (scrubberContainer) {
          this.setFocus(scrubberContainer, false);
        }
        return true;
      }

      return true;
    }

    // 2. Top Bar Controls (Back, Speed, Server, Audio, Subtitles, Fit)
    if (topButtons.includes(current)) {
      const idx = topButtons.indexOf(current);

      if (isEnterKey(e)) {
        e.preventDefault();
        current.click();
        return true;
      }

      if (key === 'ArrowRight') {
        e.preventDefault();
        if (idx < topButtons.length - 1) {
          this.setFocus(topButtons[idx + 1], false);
        }
        return true;
      }

      if (key === 'ArrowLeft') {
        e.preventDefault();
        if (idx > 0) {
          this.setFocus(topButtons[idx - 1], false);
        }
        return true;
      }

      if (key === 'ArrowDown') {
        e.preventDefault();
        // Jump down to center play button
        if (playBtn) {
          this.setFocus(playBtn, false);
        }
        return true;
      }

      return true;
    }

    // 3. Scrubber Timeline Slider
    if (current === scrubberContainer) {
      if (key === 'ArrowLeft') {
        e.preventDefault();
        player.seek(-10);
        return true;
      }

      if (key === 'ArrowRight') {
        e.preventDefault();
        player.seek(10);
        return true;
      }

      if (key === 'ArrowUp') {
        e.preventDefault();
        if (playBtn) {
          this.setFocus(playBtn, false);
        }
        return true;
      }

      if (isEnterKey(e)) {
        e.preventDefault();
        player.togglePlay();
        return true;
      }

      return true;
    }

    // Fallback: focus center play button
    if (playBtn) {
      this.setFocus(playBtn, false);
      return true;
    }

    return false;
  }

  /**
   * Spatial Distance Vector calculation for 2D directional navigation
   */
  findClosestElementInDirection(currentEl, candidateList, direction) {
    if (!currentEl || !candidateList || candidateList.length === 0) return null;

    const currentRect = currentEl.getBoundingClientRect();
    const currentCenter = {
      x: currentRect.left + currentRect.width / 2,
      y: currentRect.top + currentRect.height / 2
    };

    let bestElement = null;
    let minDistance = Infinity;

    for (const el of candidateList) {
      if (el === currentEl) continue;

      const rect = el.getBoundingClientRect();
      const center = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };

      const dx = center.x - currentCenter.x;
      const dy = center.y - currentCenter.y;

      let isInDirection = false;
      let primaryDist = 0;
      let secondaryDist = 0;

      switch (direction) {
        case 'up':
          isInDirection = dy < -2;
          primaryDist = Math.abs(dy);
          secondaryDist = Math.abs(dx);
          break;
        case 'down':
          isInDirection = dy > 2;
          primaryDist = Math.abs(dy);
          secondaryDist = Math.abs(dx);
          break;
        case 'left':
          isInDirection = dx < -2;
          primaryDist = Math.abs(dx);
          secondaryDist = Math.abs(dy);
          break;
        case 'right':
          isInDirection = dx > 2;
          primaryDist = Math.abs(dx);
          secondaryDist = Math.abs(dy);
          break;
      }

      if (isInDirection) {
        // Weighted distance metric favoring the primary axis
        const weightedDist = primaryDist + (secondaryDist * 1.8);
        if (weightedDist < minDistance) {
          minDistance = weightedDist;
          bestElement = el;
        }
      }
    }

    return bestElement;
  }
}

// Instantiate engine singleton immediately
const tvNavInstance = new TvNavigation();
export default tvNavInstance;
