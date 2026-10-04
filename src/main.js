import './services/logger.js';
import './style.css';
import './services/tvNavigation.js';
import { getUnifiedCatalog, MOVIE_CATEGORIES, SERIES_CATEGORIES } from './services/resolvers.js';
import { MediaRow } from './components/MediaRow.js';
import { HeroBanner } from './components/HeroBanner.js';
import { VideoPlayer } from './components/Player.js';
import { DetailsModal } from './components/DetailsModal.js';
import { SearchBar } from './components/SearchBar.js';
import { SettingsModal } from './components/SettingsModal.js';
import { CatalogModal } from './components/CatalogModal.js';
import { ProfileModal } from './components/ProfileModal.js';
import { AuthModal } from './components/AuthModal.js';
import { QuickActionModal } from './components/QuickActionModal.js';
import { DiscoveryHub } from './components/DiscoveryHub.js';
import { MyListPage } from './components/MyListPage.js';
import { profileService } from './services/profiles.js';
import { supabaseService } from './services/supabase.js';
import { fetchFullCatalog } from './services/stremio.js';
import { getContinueWatching, removeContinueWatching, getWatchlist, toggleWatchlist } from './services/storage.js';
import { t } from './services/i18n.js';

class CineTvApp {
  constructor() {
    this.currentTab = 'movies';
    this.cachedMovies = [];
    this.cachedSeries = [];
    this.init();
  }

  async init() {
    this.searchContainer = document.getElementById('search-root');
    this.settingsContainer = document.getElementById('settings-root');
    this.catalogContainer = document.getElementById('catalog-root');
    this.playerContainer = document.getElementById('player-root');
    this.detailsContainer = document.getElementById('details-root');
    this.profileContainer = document.getElementById('profile-root');
    this.authContainer = document.getElementById('auth-root');

    // Header buttons
    this.btnSettings = document.getElementById('btn-open-settings');
    this.btnSettingsMobile = document.getElementById('btn-open-settings-mobile');
    this.btnProfile = document.getElementById('btn-open-profile');
    this.btnProfileMobile = document.getElementById('btn-open-profile-mobile');
    this.headerProfileAvatar = document.getElementById('header-profile-avatar');
    this.headerProfileAvatarMobile = document.getElementById('header-profile-avatar-mobile');
    this.headerProfileName = document.getElementById('header-profile-name');
    this.btnOpenSearch = document.getElementById('btn-open-search');
    this.btnOpenSearchMobile = document.getElementById('btn-open-search-mobile');

    // 4 Sticky Navigation Tabs & Page Containers (Movies, Series, Discover, My List)
    this.btnTabMovies = document.getElementById('tab-btn-movies');
    this.btnTabSeries = document.getElementById('tab-btn-series');
    this.btnTabDiscovery = document.getElementById('tab-btn-discovery');
    this.btnTabMylist = document.getElementById('tab-btn-mylist');

    this.tabMoviesLabel = document.getElementById('tab-movies-label');
    this.tabSeriesLabel = document.getElementById('tab-series-label');
    this.tabDiscoveryLabel = document.getElementById('tab-discovery-label');
    this.tabMylistLabel = document.getElementById('tab-mylist-label');

    this.pageMovies = document.getElementById('page-movies');
    this.pageSeries = document.getElementById('page-series');
    this.pageDiscovery = document.getElementById('page-discovery');
    this.pageMylist = document.getElementById('page-mylist');

    // Cine7 AI Banner labels
    this.bannerCine7Title = document.getElementById('banner-cine7-title');
    this.bannerCine7Desc = document.getElementById('banner-cine7-desc');

    // Initialize Video Player with Real Embeds and HLS Time Bar
    this.player = new VideoPlayer(this.playerContainer);

    // Initialize Content Details Page with Episode & Server Picker
    this.detailsModal = new DetailsModal(this.detailsContainer, (item, serverId, season, episode) => {
      this.playItem(item, serverId, season, episode);
    });

    // Initialize Full Catalog Modal for "All" view
    this.catalogModal = new CatalogModal(this.catalogContainer, {
      onSelect: (item) => this.detailsModal.show(item)
    });

    // Initialize Settings Modal
    this.settingsModal = new SettingsModal(this.settingsContainer, (lang) => {
      console.log("[CineTv] Language switched to:", lang);
    });

    // Initialize Cloud Sync / Supabase Auth Modal
    this.authModal = new AuthModal(this.authContainer, () => {
      this.updateHeaderAuth();
      this.loadUserLists();
    });

    // Initialize Multi-User Profiles & Kids Mode Modal (Feature 3)
    this.profileModal = new ProfileModal(this.profileContainer, (profile) => {
      this.handleProfileChanged(profile);
    });

    // Initialize Long-Press / OK-Hold Quick Action Modal
    this.quickActionModal = new QuickActionModal();

    // Initialize Smart Discovery Hub & Deep Filter (Feature 2)
    this.discoveryHub = new DiscoveryHub(this.pageDiscovery, {
      onSelect: (item) => this.detailsModal.show(item)
    });

    // Initialize Universal Search Bar
    this.searchBar = new SearchBar(this.searchContainer, {
      onPlay: (item) => this.playItem(item),
      onOpenDetails: (item) => this.detailsModal.show(item)
    });

    // Initialize Cinematic Hero Spotlight Banner
    this.heroContainer = document.getElementById('hero-banner-root');
    this.heroBanner = new HeroBanner(this.heroContainer, {
      onPlay: (item) => this.playItem(item),
      onOpenDetails: (item) => this.detailsModal.show(item)
    });

    // Initialize Dedicated My List Page
    this.myListPage = new MyListPage(this.pageMylist, {
      onSelect: (item) => this.detailsModal.show(item),
      onExplore: () => this.switchTab('movies')
    });

    // -------------------------------------------------------------
    // PAGE 1: MOVIES ROWS (8 Rows)
    // -------------------------------------------------------------
    // 1. Continue Watching: Movies
    this.rowContinueMovies = new MediaRow(document.getElementById('row-continue-movies'), {
      id: 'continue-movies',
      titleKey: 'continueMovies',
      icon: '▶️',
      badgeKey: 'continueSub',
      onSelect: (item) => this.detailsModal.show(item),
      onRemove: (item) => removeContinueWatching(item)
    });

    // 2. Trending & Popular Movies
    this.rowMoviesTrending = new MediaRow(document.getElementById('row-movies-trending'), {
      id: 'movies-trending',
      titleKey: 'trendingMovies',
      icon: '🔥',
      badgeKey: 'trendingSub',
      onSelect: (item) => this.detailsModal.show(item),
      onSeeAll: () => this.openAllCatalog('movie', 'all')
    });

    // 3. Recently Added Movies
    this.rowMoviesRecent = new MediaRow(document.getElementById('row-movies-recent'), {
      id: 'movies-recent',
      titleKey: 'recentlyAdded',
      icon: '✨',
      badgeKey: 'recentlyAddedSub',
      onSelect: (item) => this.detailsModal.show(item),
      onSeeAll: () => this.openAllCatalog('movie', 'all')
    });

    // 4. Action & Blockbusters
    this.rowMoviesAction = new MediaRow(document.getElementById('row-movies-action'), {
      id: 'movies-action',
      titleKey: 'actionMovies',
      icon: '💥',
      badgeKey: 'actionSub',
      onSelect: (item) => this.detailsModal.show(item),
      onSeeAll: () => this.openAllCatalog('movie', 'Action')
    });

    // 5. Top Rated Classics
    this.rowMoviesToprated = new MediaRow(document.getElementById('row-movies-toprated'), {
      id: 'movies-toprated',
      titleKey: 'topRatedMovies',
      icon: '🏆',
      badgeKey: 'topRatedSub',
      onSelect: (item) => this.detailsModal.show(item),
      onSeeAll: () => this.openAllCatalog('movie', 'Drama')
    });

    // 6. Comedy & Entertainment
    this.rowMoviesComedy = new MediaRow(document.getElementById('row-movies-comedy'), {
      id: 'movies-comedy',
      titleKey: 'comedyMovies',
      icon: '🍿',
      badgeKey: 'comedySub',
      onSelect: (item) => this.detailsModal.show(item),
      onSeeAll: () => this.openAllCatalog('movie', 'Comedy')
    });

    // 7. Kids & Family (Animation)
    this.rowMoviesFamily = new MediaRow(document.getElementById('row-movies-family'), {
      id: 'movies-family',
      titleKey: 'familyMovies',
      icon: '🎈',
      badgeKey: 'familySub',
      onSelect: (item) => this.detailsModal.show(item),
      onSeeAll: () => this.openAllCatalog('movie', 'Animation')
    });

    // 8. Sci-Fi & Thrillers
    this.rowMoviesScifi = new MediaRow(document.getElementById('row-movies-scifi'), {
      id: 'movies-scifi',
      titleKey: 'scifiMovies',
      icon: '🚀',
      badgeKey: 'scifiSub',
      onSelect: (item) => this.detailsModal.show(item),
      onSeeAll: () => this.openAllCatalog('movie', 'Sci-Fi')
    });

    // -------------------------------------------------------------
    // PAGE 2: SERIES ROWS (8 Rows)
    // -------------------------------------------------------------
    // 1. Continue Watching: Series
    this.rowContinueSeries = new MediaRow(document.getElementById('row-continue-series'), {
      id: 'continue-series',
      titleKey: 'continueSeries',
      icon: '▶️',
      badgeKey: 'continueSub',
      onSelect: (item) => this.detailsModal.show(item),
      onRemove: (item) => removeContinueWatching(item)
    });

    // 2. Trending & Popular Series
    this.rowSeriesTrending = new MediaRow(document.getElementById('row-series-trending'), {
      id: 'series-trending',
      titleKey: 'trendingSeries',
      icon: '🔥',
      badgeKey: 'trendingSub',
      onSelect: (item) => this.detailsModal.show(item),
      onSeeAll: () => this.openAllCatalog('series', 'all')
    });

    // 3. Recently Added Series
    this.rowSeriesRecent = new MediaRow(document.getElementById('row-series-recent'), {
      id: 'series-recent',
      titleKey: 'recentlyAdded',
      icon: '✨',
      badgeKey: 'recentlyAddedSub',
      onSelect: (item) => this.detailsModal.show(item),
      onSeeAll: () => this.openAllCatalog('series', 'all')
    });

    // 4. Crime & Gripping Dramas
    this.rowSeriesCrime = new MediaRow(document.getElementById('row-series-crime'), {
      id: 'series-crime',
      titleKey: 'crimeSeries',
      icon: '🕵️',
      badgeKey: 'crimeSub',
      onSelect: (item) => this.detailsModal.show(item),
      onSeeAll: () => this.openAllCatalog('series', 'Crime')
    });

    // 5. Top Rated & Award Winning Series
    this.rowSeriesToprated = new MediaRow(document.getElementById('row-series-toprated'), {
      id: 'series-toprated',
      titleKey: 'topRatedSeries',
      icon: '🏆',
      badgeKey: 'topRatedSub',
      onSelect: (item) => this.detailsModal.show(item),
      onSeeAll: () => this.openAllCatalog('series', 'Drama')
    });

    // 6. Sci-Fi & Fantasy Series
    this.rowSeriesScifi = new MediaRow(document.getElementById('row-series-scifi'), {
      id: 'series-scifi',
      titleKey: 'scifiSeries',
      icon: '🌌',
      badgeKey: 'scifiSub',
      onSelect: (item) => this.detailsModal.show(item),
      onSeeAll: () => this.openAllCatalog('series', 'Sci-Fi')
    });

    // 7. Action & Adventure Series
    this.rowSeriesAction = new MediaRow(document.getElementById('row-series-action'), {
      id: 'series-action',
      titleKey: 'actionSeries',
      icon: '⚔️',
      badgeKey: 'actionSub',
      onSelect: (item) => this.detailsModal.show(item),
      onSeeAll: () => this.openAllCatalog('series', 'Action')
    });

    // 8. Kids & Family Animation
    this.rowSeriesFamily = new MediaRow(document.getElementById('row-series-family'), {
      id: 'series-family',
      titleKey: 'familySeries',
      icon: '🎨',
      badgeKey: 'familySub',
      onSelect: (item) => this.detailsModal.show(item),
      onSeeAll: () => this.openAllCatalog('series', 'Animation')
    });

    // Wire global instances for Android Native Bridge
    window.cineApp = this;
    window.cinePlayerInstance = this.player;
    window.cineDetailsInstance = this.detailsModal;
    window.cineDetailsModal = this.detailsModal;
    window.cineCatalogInstance = this.catalogModal;
    window.cineSettingsInstance = this.settingsModal;
    window.cineSearchInstance = this.searchBar;
    window.cineProfileModal = this.profileModal;
    window.cineDiscoveryHub = this.discoveryHub;
    window.cineAuthModal = this.authModal;
    window.cineHeroBanner = this.heroBanner;
    window.cineQuickActionModal = this.quickActionModal;

    // Handle Android hardware back button and gesture navigation
    window.handleAppBackButton = () => {
      console.log("[CineTv] Android Back button pressed");

      // 0. Quick Action Modal
      if (this.quickActionModal && this.quickActionModal.el && !this.quickActionModal.el.classList.contains('hidden') && this.quickActionModal.el.style.display !== 'none') {
        this.quickActionModal.close();
        return true;
      }

      // 0a. Discovery Hub Picker Modal
      if (this.discoveryHub && typeof this.discoveryHub.isPickerOpen === 'function' && this.discoveryHub.isPickerOpen()) {
        this.discoveryHub.closePicker();
        return true;
      }

      // 0b. Auth Modal
      if (this.authModal && this.authModal.isOpen()) {
        this.authModal.close();
        return true;
      }

      // 1. Profile Modal
      if (this.profileModal && this.profileModal.isOpen()) {
        this.profileModal.close();
        return true;
      }

      // 2. Settings Modal
      if (this.settingsModal && this.settingsModal.isOpen()) {
        this.settingsModal.close();
        return true;
      }

      // 3. Player Modal
      if (this.player && this.player.isOpen()) {
        if (this.player.handleBack && this.player.handleBack()) {
          return true;
        }
        this.player.close();
        return true;
      }

      // 4. Details Modal
      if (this.detailsModal && this.detailsModal.isOpen()) {
        this.detailsModal.close();
        return true;
      }

      // 5. Catalog Modal
      if (this.catalogModal && this.catalogModal.isOpen()) {
        this.catalogModal.close();
        return true;
      }

      // 6. Search Results Overlay
      if (this.searchBar && this.searchBar.isOpen()) {
        this.searchBar.close();
        return true;
      }

      // 7. If on a secondary tab (Series, Discover, My List), go back to Movies tab first
      if (this.currentTab !== 'movies') {
        this.switchTab('movies');
        return true;
      }

      // 8. On main movies page with nothing open: return false to let Android minimize app smoothly
      return false;
    };

    // Open Search Overlay on button click (Desktop and Mobile)
    const openSearch = () => {
      if (this.searchBar) this.searchBar.open();
    };
    if (this.btnOpenSearch) this.btnOpenSearch.addEventListener('click', openSearch);
    if (this.btnOpenSearchMobile) this.btnOpenSearchMobile.addEventListener('click', openSearch);

    // Open Profile Modal on button click (Desktop and Mobile)
    const openProfile = () => this.profileModal.show();
    if (this.btnProfile) this.btnProfile.addEventListener('click', openProfile);
    if (this.btnProfileMobile) this.btnProfileMobile.addEventListener('click', openProfile);

    // Open Settings Modal on button click (Desktop and Mobile)
    const openSettings = () => this.settingsModal.show();
    if (this.btnSettings) this.btnSettings.addEventListener('click', openSettings);
    if (this.btnSettingsMobile) this.btnSettingsMobile.addEventListener('click', openSettings);

    // Bind 4 Tab buttons clicks
    if (this.btnTabMovies) {
      this.btnTabMovies.addEventListener('click', () => this.switchTab('movies'));
    }

    if (this.btnTabSeries) {
      this.btnTabSeries.addEventListener('click', () => this.switchTab('series'));
    }

    if (this.btnTabDiscovery) {
      this.btnTabDiscovery.addEventListener('click', () => this.switchTab('discovery'));
    }

    if (this.btnTabMylist) {
      this.btnTabMylist.addEventListener('click', () => this.switchTab('mylist'));
    }

    // Refresh dynamic rows on history, watchlist, profile, auth, or language changes
    window.addEventListener('cinetv:historyChanged', () => this.loadUserLists());
    window.addEventListener('cinetv:watchlistChanged', () => this.loadUserLists());
    window.addEventListener('cinetv:profileChanged', (e) => this.handleProfileChanged(e.detail?.profile));
    window.addEventListener('cinetv:profilesUpdated', () => this.updateHeaderProfile());
    window.addEventListener('cinetv:authChanged', () => {
      this.updateHeaderAuth();
      this.loadUserLists();
    });
    window.addEventListener('cinetv:syncStatus', () => this.updateHeaderAuth());
    window.addEventListener('cinetv:langChanged', () => {
      this.updateStaticTranslations();
      this.updateHeaderAuth();
      this.loadUserLists();
      this.populateCategoryRows();
    });

    // Initial translation, profile, and data loading
    this.updateStaticTranslations();
    this.updateHeaderProfile();
    this.updateHeaderAuth();
    this.loadUserLists();
    this.populateCategoryRows();
    await this.loadCatalogs();
  }

  handleProfileChanged(profile) {
    this.updateHeaderProfile();
    this.loadUserLists();
    this.populateCategoryRows();
    if (this.currentTab === 'discovery') {
      this.discoveryHub.applyFilters();
    }
  }

  updateHeaderProfile() {
    const p = profileService.getActiveProfile();
    const avatar = p?.avatar || '🦁';
    const name = p?.name || 'Principal';

    const deskAvatar = this.headerProfileAvatar || document.getElementById('header-profile-avatar');
    if (deskAvatar) {
      deskAvatar.innerText = avatar;
    }
    const mobileAvatar = this.headerProfileAvatarMobile || document.getElementById('header-profile-avatar-mobile');
    if (mobileAvatar) {
      mobileAvatar.innerText = avatar;
    }
    const nameEl = this.headerProfileName || document.getElementById('header-profile-name');
    if (nameEl) {
      nameEl.innerText = p?.isKids ? `${name} 🎈` : name;
    }
  }

  updateHeaderAuth() {
    if (this.settingsModal && typeof this.settingsModal.updateCloudStatus === 'function') {
      this.settingsModal.updateCloudStatus();
    }
  }

  switchTab(tab) {
    this.currentTab = tab;

    const activeClass = 'tab-btn px-2.5 sm:px-3.5 py-1 rounded-full font-black text-xs md:text-sm transition flex items-center gap-1 bg-[#e50914] text-white shadow-lg shadow-red-950/60 active:scale-95 cursor-pointer whitespace-nowrap';
    const inactiveClass = 'tab-btn px-2.5 sm:px-3.5 py-1 rounded-full font-black text-xs md:text-sm transition flex items-center gap-1 bg-white/10 hover:bg-white/15 text-neutral-400 hover:text-white border border-white/10 active:scale-95 cursor-pointer whitespace-nowrap';

    if (this.btnTabMovies) this.btnTabMovies.className = (tab === 'movies') ? activeClass : inactiveClass;
    if (this.btnTabSeries) this.btnTabSeries.className = (tab === 'series') ? activeClass : inactiveClass;
    if (this.btnTabDiscovery) this.btnTabDiscovery.className = (tab === 'discovery') ? activeClass : inactiveClass;
    if (this.btnTabMylist) this.btnTabMylist.className = (tab === 'mylist') ? activeClass : inactiveClass;

    if (this.pageMovies) this.pageMovies.classList.toggle('hidden', tab !== 'movies');
    if (this.pageSeries) this.pageSeries.classList.toggle('hidden', tab !== 'series');
    if (this.pageDiscovery) this.pageDiscovery.classList.toggle('hidden', tab !== 'discovery');
    if (this.pageMylist) this.pageMylist.classList.toggle('hidden', tab !== 'mylist');

    if (this.heroContainer) {
      this.heroContainer.classList.toggle('hidden', tab === 'discovery' || tab === 'mylist');
    }
    if (this.heroBanner) {
      const isKids = profileService.isKidsMode();
      if (tab === 'movies') {
        this.heroBanner.setItems(isKids ? MOVIE_CATEGORIES.family : (this.cachedMovies?.length ? this.cachedMovies.slice(0, 6) : MOVIE_CATEGORIES.trending));
      } else if (tab === 'series') {
        this.heroBanner.setItems(isKids ? SERIES_CATEGORIES.family : (this.cachedSeries?.length ? this.cachedSeries.slice(0, 6) : SERIES_CATEGORIES.trending));
      }
    }

    if (tab === 'series') {
      this.populateSeriesRows();
    }

    if (tab === 'discovery') {
      if (this.discoveryHub && this.discoveryHub.setCatalogs) {
        this.discoveryHub.setCatalogs(this.cachedMovies, this.cachedSeries);
      } else if (this.discoveryHub) {
        const items = (this.discoveryHub.filters.type === 'series') ? this.cachedSeries : this.cachedMovies;
        this.discoveryHub.setItems(items);
      }
    }

    if (tab === 'mylist') {
      if (this.myListPage) {
        this.myListPage.refresh();
      }
    }

    const mainContainer = document.getElementById('dashboard-main') || document.querySelector('main');
    if (mainContainer) {
      mainContainer.scrollTo({ top: 0, behavior: 'auto' });
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }

    if (window.cineTvNav) {
      const activeTabBtn = document.getElementById('tab-btn-' + tab);
      if (activeTabBtn) {
        window.cineTvNav.setFocus(activeTabBtn, true);
      } else {
        window.cineTvNav.focusInitialElement();
      }
    }
  }

  updateStaticTranslations() {
    if (this.tabMoviesLabel) this.tabMoviesLabel.innerText = t('moviesTab');
    if (this.tabSeriesLabel) this.tabSeriesLabel.innerText = t('seriesTab');
    if (this.tabDiscoveryLabel) this.tabDiscoveryLabel.innerText = t('discoveryTab') || 'Discover';
    if (this.tabMylistLabel) this.tabMylistLabel.innerText = t('myListTab') || 'My List';
    if (this.bannerCine7Title) this.bannerCine7Title.innerText = t('cine7BannerTitle');
    if (this.bannerCine7Desc) this.bannerCine7Desc.innerText = t('cine7BannerDesc');
    this.updateHeaderProfile();
  }

  loadUserLists() {
    const cwMovies = getContinueWatching('movie') || [];
    const cwSeries = getContinueWatching('series') || [];

    if (this.rowContinueMovies) this.rowContinueMovies.setItems(cwMovies);
    if (this.rowContinueSeries) this.rowContinueSeries.setItems(cwSeries);
    if (this.myListPage) this.myListPage.refresh();
  }

  buildRowItems(categorySeed, fullCatalog, genreKeyword, maxCount = 30) {
    const list = [...(categorySeed || [])];
    const seen = new Set(list.map(i => i.imdbId || i.id));
    if (fullCatalog && fullCatalog.length > 0) {
      if (genreKeyword) {
        const kw = genreKeyword.toLowerCase();
        for (const item of fullCatalog) {
          if (list.length >= maxCount) break;
          const id = item.imdbId || item.id;
          if (!seen.has(id) && item.genres && item.genres.some(g => g.toLowerCase().includes(kw))) {
            seen.add(id);
            list.push(item);
          }
        }
      }
      for (const item of fullCatalog) {
        if (list.length >= maxCount) break;
        const id = item.imdbId || item.id;
        if (!seen.has(id)) {
          seen.add(id);
          list.push(item);
        }
      }
    }
    return list.slice(0, maxCount);
  }

  populateSeriesRows() {
    if (this.seriesRowsLoaded) return;
    this.seriesRowsLoaded = true;
    const isKids = profileService.isKidsMode();
    if (isKids) {
      if (this.rowSeriesTrending) this.rowSeriesTrending.setItems(SERIES_CATEGORIES.family);
      if (this.rowSeriesRecent) this.rowSeriesRecent.setItems(SERIES_CATEGORIES.family.slice(2, 30));
      if (this.rowSeriesCrime) this.rowSeriesCrime.setItems(SERIES_CATEGORIES.family);
      if (this.rowSeriesToprated) this.rowSeriesToprated.setItems(SERIES_CATEGORIES.family);
      if (this.rowSeriesFamily) this.rowSeriesFamily.setItems(SERIES_CATEGORIES.family);
      if (this.rowSeriesScifi) this.rowSeriesScifi.setItems(SERIES_CATEGORIES.family);
      if (this.rowSeriesAction) this.rowSeriesAction.setItems(SERIES_CATEGORIES.family);
    } else {
      const seriesList = this.cachedSeries || [];
      if (this.rowSeriesTrending) this.rowSeriesTrending.setItems(this.buildRowItems(SERIES_CATEGORIES.trending, seriesList, null, 30));
      if (this.rowSeriesRecent) this.rowSeriesRecent.setItems(this.buildRowItems(SERIES_CATEGORIES.trending, seriesList, null, 30));
      if (this.rowSeriesCrime) this.rowSeriesCrime.setItems(this.buildRowItems(SERIES_CATEGORIES.crime, seriesList, 'crime', 30));
      if (this.rowSeriesToprated) this.rowSeriesToprated.setItems(this.buildRowItems(SERIES_CATEGORIES.trending, seriesList, 'drama', 30));
      if (this.rowSeriesFamily) this.rowSeriesFamily.setItems(this.buildRowItems(SERIES_CATEGORIES.family, seriesList, 'animation', 30));
      if (this.rowSeriesScifi) this.rowSeriesScifi.setItems(this.buildRowItems(SERIES_CATEGORIES.scifi, seriesList, 'sci-fi', 30));
      if (this.rowSeriesAction) this.rowSeriesAction.setItems(this.buildRowItems(SERIES_CATEGORIES.action, seriesList, 'action', 30));
    }
  }

  populateCategoryRows() {
    this.seriesRowsLoaded = false;
    const isKids = profileService.isKidsMode();

    if (isKids) {
      // In Kids Mode: Family & Animation friendly content ONLY
      if (this.rowMoviesTrending) this.rowMoviesTrending.setItems(MOVIE_CATEGORIES.family.slice(0, 30));
      if (this.rowMoviesRecent) this.rowMoviesRecent.setItems(MOVIE_CATEGORIES.family.slice(5, 35));
      if (this.rowMoviesAction) this.rowMoviesAction.setItems(MOVIE_CATEGORIES.family.filter(m => m.genres && (m.genres.includes('Aventura') || m.genres.includes('Adventure'))));
      if (this.rowMoviesToprated) this.rowMoviesToprated.setItems(MOVIE_CATEGORIES.family.filter(m => parseFloat(m.rating?.replace(/[^\d.]/g, '') || '0') >= 7.5));
      if (this.rowMoviesComedy) this.rowMoviesComedy.setItems(MOVIE_CATEGORIES.comedy || MOVIE_CATEGORIES.family);
      if (this.rowMoviesFamily) this.rowMoviesFamily.setItems(MOVIE_CATEGORIES.family);
      if (this.rowMoviesScifi) this.rowMoviesScifi.setItems(MOVIE_CATEGORIES.family.filter(m => m.genres && (m.genres.includes('Comédia') || m.genres.includes('Comedy'))));
    } else {
      // Normal Mode
      const moviesList = this.cachedMovies || [];
      if (this.rowMoviesTrending) this.rowMoviesTrending.setItems(this.buildRowItems(MOVIE_CATEGORIES.trending, moviesList, null, 30));
      if (this.rowMoviesRecent) this.rowMoviesRecent.setItems(this.buildRowItems(MOVIE_CATEGORIES.netflix, moviesList, null, 30));
      if (this.rowMoviesAction) this.rowMoviesAction.setItems(this.buildRowItems(MOVIE_CATEGORIES.action, moviesList, 'action', 30));
      if (this.rowMoviesToprated) this.rowMoviesToprated.setItems(this.buildRowItems(MOVIE_CATEGORIES.toprated, moviesList, 'drama', 30));
      if (this.rowMoviesComedy) this.rowMoviesComedy.setItems(this.buildRowItems(MOVIE_CATEGORIES.comedy, moviesList, 'comedy', 30));
      if (this.rowMoviesFamily) this.rowMoviesFamily.setItems(this.buildRowItems(MOVIE_CATEGORIES.family, moviesList, 'animation', 30));
      if (this.rowMoviesScifi) this.rowMoviesScifi.setItems(this.buildRowItems(MOVIE_CATEGORIES.scifi, moviesList, 'sci-fi', 30));
    }

    if (this.currentTab === 'series') {
      this.populateSeriesRows();
    }

    if (this.heroBanner) {
      if (isKids) {
        this.heroBanner.setItems(this.currentTab === 'series' ? SERIES_CATEGORIES.family : MOVIE_CATEGORIES.family);
      } else {
        this.heroBanner.setItems(this.currentTab === 'series' ? SERIES_CATEGORIES.trending : MOVIE_CATEGORIES.trending);
      }
    }
  }

  async loadCatalogs() {
    try {
      const [movies, series] = await Promise.all([
        getUnifiedCatalog('movie'),
        getUnifiedCatalog('series')
      ]);

      // Cache full catalogs
      this.cachedMovies = movies;
      this.cachedSeries = series;

      // Update Discovery Hub items
      if (this.discoveryHub) {
        if (this.discoveryHub.setCatalogs) {
          this.discoveryHub.setCatalogs(movies, series);
        } else {
          this.discoveryHub.setItems(this.discoveryHub.filters.type === 'series' ? series : movies);
        }
      }

      // Populate 30 items for category rows and update hero spotlight if not in Kids mode
      if (!profileService.isKidsMode()) {
        if (movies && movies.length > 0) {
          if (this.rowMoviesTrending) this.rowMoviesTrending.setItems(this.buildRowItems(MOVIE_CATEGORIES.trending, movies, null, 30));
          if (this.rowMoviesRecent) this.rowMoviesRecent.setItems(this.buildRowItems(MOVIE_CATEGORIES.netflix, movies, null, 30));
          if (this.rowMoviesAction) this.rowMoviesAction.setItems(this.buildRowItems(MOVIE_CATEGORIES.action, movies, 'action', 30));
          if (this.rowMoviesToprated) this.rowMoviesToprated.setItems(this.buildRowItems(MOVIE_CATEGORIES.toprated, movies, 'drama', 30));
          if (this.rowMoviesComedy) this.rowMoviesComedy.setItems(this.buildRowItems(MOVIE_CATEGORIES.comedy, movies, 'comedy', 30));
          if (this.rowMoviesFamily) this.rowMoviesFamily.setItems(this.buildRowItems(MOVIE_CATEGORIES.family, movies, 'animation', 30));
          if (this.rowMoviesScifi) this.rowMoviesScifi.setItems(this.buildRowItems(MOVIE_CATEGORIES.scifi, movies, 'sci-fi', 30));
          if (this.currentTab === 'movies' && this.heroBanner) {
            this.heroBanner.setItems(movies.slice(0, 6));
          }
        }
        // Defer series row rendering until Series tab is active to preserve memory & bandwidth on TV boot
        if (this.currentTab === 'series') {
          this.seriesRowsLoaded = false;
          this.populateSeriesRows();
          if (this.heroBanner && series && series.length > 0) {
            this.heroBanner.setItems(series.slice(0, 6));
          }
        }
      }
    } catch (e) {
      console.warn("Failed loading catalogs:", e);
    }
  }

  async openAllCatalog(type = 'movie', initialGenre = 'all') {
    const localItems = type === 'movie' ? this.cachedMovies : this.cachedSeries;
    this.catalogModal.show(localItems, type, initialGenre);

    try {
      const fullList = await fetchFullCatalog(type);
      if (fullList && fullList.length > 0) {
        if (this.catalogModal.isOpen() && this.catalogModal.currentType === type) {
          this.catalogModal.mergeBatch(fullList);
        }
      }
    } catch (e) {
      console.warn("Full catalog loading:", e);
    }
  }

  playItem(item, serverId = 'multiembed', season = null, episode = null) {
    if (!item) return;
    this.player.play(item, serverId, season, episode);
  }
}

// Boot application
window.addEventListener('DOMContentLoaded', () => {
  window.cineApp = new CineTvApp();
});

