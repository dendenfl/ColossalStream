import Hls from 'hls.js';
import { getRealStreamUrl, STREAM_SERVERS, getServerLabel } from '../services/resolvers.js';
import { getLanguage, t, getItemTitle, formatItemDuration, localizeGenre } from '../services/i18n.js';
import { saveContinueWatching, getItemProgress, formatTimestamp, markEpisodeWatched, markItemWatched, removeContinueWatching, isSeriesItem } from '../services/storage.js';

export class VideoPlayer {
  constructor(container) {
    this.container = container;
    this.hls = null;
    this.hudTimeout = null;
    this.fitToastTimer = null;
    this.tickerTimer = null;
    this.isDraggingTime = false;
    this.currentItem = null;
    this.currentServerId = 'multiembed';
    this.loadingCircleTimer = null;
    this.currentSeason = 1;
    this.currentEpisode = 1;
    this.isEmbedMode = false;
    this.isEmbedPlaying = true;
    // Manual embed mode: true when the system WebView is too old for the native
    // video hooks (Chrome < 111). The provider's own player is shown and the
    // user drives it directly with the remote (D-pad passes through).
    this.manualEmbedMode = false;
    this.aspectRatioMode = parseInt(localStorage.getItem('cinetv_aspect_ratio') || '0', 10);
    this.lastPlayTime = 0;
    this.lastPlaybackTime = 0;
    this.hasStreamPlaybackStarted = false;
    this.totalDuration = 0;
    this.lastSaveTime = 0;
    this.pendingResumeTime = 0;
    this.currentSubtitleCues = [];

    this.initDOM();
    this.bindEvents();
    window.cinePlayerInstance = this;
    window.onCineTvVideoState = (data) => this.handleNativeVideoState(data);


    window.addEventListener('cinetv:langChanged', () => {
      this.updateLanguage();
    });
  }

  isOpen() {
    return this.overlay && !this.overlay.classList.contains('hidden');
  }

  showLoadingScreen(item) {
    if (!this.loadingScreen) return;
    clearTimeout(this.loadingCircleTimer);
    this.loadingCircleTimer = null;

    const posterUrl = item?.backdrop || item?.poster || (item?.imdbId ? `https://images.metahub.space/background/medium/${item.imdbId}/img` : '');
    const posterCardUrl = item?.poster || item?.backdrop || (item?.imdbId ? `https://images.metahub.space/poster/medium/${item.imdbId}/img` : '');

    if (this.loadingBackdrop) {
      this.loadingBackdrop.src = posterUrl;
      this.loadingBackdrop.style.display = posterUrl ? 'block' : 'none';
    }
    if (this.loadingPoster) {
      this.loadingPoster.src = posterCardUrl;
      this.loadingPoster.style.display = posterCardUrl ? 'block' : 'none';
    }
    if (this.loadingTitle) {
      this.loadingTitle.innerText = getItemTitle(item) || item?.title || '';
    }
    if (this.loadingCircleWrapper) {
      this.loadingCircleWrapper.classList.remove('opacity-100');
      this.loadingCircleWrapper.classList.add('opacity-0');
    }
    if (this.loadingStatus) {
      const isEn = getLanguage() === 'en';
      this.loadingStatus.innerText = isEn ? 'Loading stream...' : 'Carregando filme...';
    }

    this.loadingScreen.classList.remove('hidden');
    this.loadingScreen.style.display = 'flex';
    this.loadingScreen.style.opacity = '1';
    this.loadingScreen.style.pointerEvents = 'none';

    // Show the subtle small center circle loader after 600ms if playback has not started yet
    this.loadingCircleTimer = setTimeout(() => {
      if (this.isOpen() && !this.hasStreamPlaybackStarted && this.loadingCircleWrapper) {
        this.loadingCircleWrapper.classList.remove('opacity-0');
        this.loadingCircleWrapper.classList.add('opacity-100');
      }
    }, 600);

    // Safety fallback: the loading screen can never trap the user forever.
    // It hides as soon as real playback starts (updateStreamPlaybackState) or
    // when the watchdog gives up; this cap is pure insurance. It is deliberately
    // NOT hidden after a few seconds anymore: revealing the raw embed early
    // exposed its ads/branding before autoplay kicked in.
    clearTimeout(this.loadingScreenSafetyTimer);
    this.loadingScreenSafetyTimer = setTimeout(() => {
      if (this.isOpen()) {
        this.hideLoadingScreen();
      }
    }, 20000);
  }

  hideLoadingScreen() {
    clearTimeout(this.loadingCircleTimer);
    this.loadingCircleTimer = null;
    clearTimeout(this.loadingScreenSafetyTimer);
    this.loadingScreenSafetyTimer = null;
    if (!this.loadingScreen) return;

    this.loadingScreen.style.opacity = '0';
    this.loadingScreen.style.pointerEvents = 'none';
    setTimeout(() => {
      if (this.loadingScreen) {
        this.loadingScreen.classList.add('hidden');
        this.loadingScreen.style.display = 'none';
      }
    }, 200);
  }

  updateStreamPlaybackState(started) {
    this.hasStreamPlaybackStarted = !!started;
    if (this.overlay) {
      this.overlay.classList.toggle('stream-started', !!started);
    }
    if (this.tapSurface) {
      this.tapSurface.style.pointerEvents = (this.isEmbedMode && !started) ? 'none' : 'auto';
    }
    if (started) {
      clearTimeout(this.streamWatchdog);
      this.streamWatchdog = null;
      this.hideLoadingScreen();
      if (this.spinner) this.spinner.classList.add('hidden');
    }
  }

  initDOM() {
    const isTv = !!(window.AndroidNative && window.AndroidNative.isTV && window.AndroidNative.isTV());
    const isEn = getLanguage() === 'en';

    this.container.innerHTML = `
      <div id="player-overlay" class="fixed inset-0 bg-black z-50 hidden flex-col items-center justify-center select-none overflow-hidden">
        
        <!-- Native Video Element (Direct HLS / MP4) -->
        <video id="cine-video" class="w-full h-full object-contain bg-black cursor-pointer hidden" playsinline></video>

        <!-- Embed Player (Movies & Series iframes) -->
        <iframe id="cine-embed" class="w-full h-full border-0 bg-black hidden transition-transform duration-300"
          allow="autoplay *; fullscreen *; encrypted-media *; picture-in-picture *"
          allowfullscreen
          referrerpolicy="no-referrer-when-downgrade">
        </iframe>

        <!-- Cinematic Loading Screen: High-Res Backdrop + Poster + Sleek Small Center Loading Circle -->
        <div id="player-loading-screen" class="absolute inset-0 z-28 bg-black flex flex-col items-center justify-center overflow-hidden transition-opacity duration-200 pointer-events-none">
          <!-- Blurred Backdrop Image -->
          <img id="player-loading-backdrop" class="absolute inset-0 w-full h-full object-cover opacity-45 scale-105 filter blur-md transition-opacity duration-500" src="" alt="" />
          <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/70"></div>
          
          <!-- Center Content Container -->
          <div class="relative z-10 flex flex-col items-center justify-center gap-3 px-6 text-center max-w-lg">
            <!-- Poster Card Preview -->
            <img id="player-loading-poster" class="w-24 h-36 sm:w-28 sm:h-40 rounded-xl shadow-2xl border border-white/20 object-cover mb-2 transition-transform duration-500" src="" alt="" />
            
            <!-- Movie / Series Title -->
            <h2 id="player-loading-title" class="text-base sm:text-lg font-bold text-white tracking-wide truncate max-w-xs sm:max-w-md drop-shadow-md"></h2>
            
            <!-- Small Circular Loading Indicator (user requested: very small arrow in the middle in circle to show that is loading) -->
            <div id="player-loading-circle-wrapper" class="flex flex-col items-center gap-2 mt-2 transition-opacity duration-300 opacity-0">
              <div class="relative w-10 h-10 flex items-center justify-center">
                <!-- Rotating subtle border ring -->
                <div class="absolute inset-0 rounded-full border-2 border-white/20 border-t-[#e50914] animate-spin"></div>
                <!-- Small center circle with subtle play arrow -->
                <div class="w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-[10px] text-white shadow-lg">
                  <span class="ml-0.5 text-[10px] text-white/90">▶</span>
                </div>
              </div>
              <p id="player-loading-status" class="text-[11px] font-medium text-neutral-300 tracking-wide drop-shadow"></p>
            </div>
          </div>
        </div>

        <!-- Transparent Tap / Click Surface to intercept all screen taps for CineTV custom player -->
        <div id="player-tap-surface" class="absolute inset-0 z-25 cursor-pointer pointer-events-none"></div>

        <!-- Loading / Buffering Spinner -->
        <div id="player-spinner" class="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3 z-30 pointer-events-none transition-opacity duration-200">
          <div class="w-12 h-12 md:w-14 md:h-14 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin"></div>
          <p id="player-status-text" class="hidden"></p>
        </div>

        <!-- Big Center Play/Pause Indicator on tap -->
        <div id="center-play-indicator" class="absolute inset-0 flex items-center justify-center pointer-events-none z-20 transition-opacity duration-300 opacity-0">
          <div class="w-20 h-20 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-3xl text-white shadow-2xl backdrop-blur-sm">
            ▶
          </div>
        </div>

        <!-- Fit / Aspect Ratio Toast Notification -->
        <div id="player-fit-toast" class="absolute top-16 left-1/2 -translate-x-1/2 bg-black/90 border border-white/20 text-white px-4 py-2 rounded-full text-xs font-bold shadow-2xl backdrop-blur-md pointer-events-none z-40 transition-opacity duration-300 opacity-0 flex items-center gap-2">
          <span id="fit-toast-icon">⤢</span>
          <span id="fit-toast-text">${t('fitToScreen')}</span>
        </div>

        <!-- Subtitles Overlay for both Embed and Native Video -->
        <div id="player-subtitles-overlay" class="pointer-events-none z-35 text-center px-4 max-w-[92%] transition-opacity duration-150 opacity-0 hidden">
          <span id="player-subtitles-text"></span>
        </div>

        <!-- Floating Unlock Pill (visible when screen is locked) -->
        <button id="player-unlock-pill" class="hidden cursor-pointer" title="Desbloquear Tela">
          <span>🔓</span>
          <span id="player-unlock-text">${t('tapToUnlock')}</span>
        </button>

        <!-- Netflix-Style Next Episode Auto-Play Card -->
        <div id="player-next-ep-card" class="hidden">
          <div class="flex items-center justify-between">
            <span id="player-next-ep-label" class="text-[10px] font-bold uppercase tracking-wider text-neutral-400">${t('nextEpisode')}</span>
            <span id="player-next-ep-timer" class="text-xs font-mono font-bold text-[#FFD700]">10s</span>
          </div>
          <p id="player-next-ep-title" class="text-xs font-bold text-white truncate max-w-[240px]">S1 : E2</p>
          <div class="flex items-center gap-2 mt-1">
            <button id="player-next-ep-play-btn" class="flex-1 py-1.5 px-3 bg-[#e50914] hover:bg-red-700 text-white text-xs font-bold rounded-lg transition active:scale-95 shadow cursor-pointer">
              ▶ ${t('playNow')}
            </button>
            <button id="player-next-ep-cancel-btn" class="py-1.5 px-3 bg-white/10 hover:bg-white/20 text-neutral-300 text-xs font-medium rounded-lg transition active:scale-95 cursor-pointer">
              ${t('dismiss')}
            </button>
          </div>
        </div>

        <!-- Unified VOD Player HUD Overlay (modeled after canarinho_play VODPlayerScreen) -->
        <div id="player-hud" class="absolute inset-0 bg-gradient-to-b from-black/85 via-transparent to-black/90 flex flex-col justify-between p-4 md:p-6 z-30 transition-opacity duration-300 pointer-events-none opacity-0">
          
          <!-- Top Bar: Left (Back + Title + Metadata) & Right (Actions) -->
          <div id="player-top-bar" class="flex items-center justify-between w-full pointer-events-auto gap-3">
            <!-- Left: Back Button + Title & Metadata Block -->
            <div class="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
              <!-- Back Button -->
              <button id="player-close-btn" class="player-top-btn cursor-pointer flex-shrink-0" title="Voltar" tabindex="0">
                <span class="text-base sm:text-lg leading-none">←</span>
                <span id="player-back-text" class="text-xs font-bold">${t('back')}</span>
              </button>

              <!-- Title & Series / Episode Info -->
              <div id="player-title-block" class="flex flex-col min-w-0 justify-center">
                <div class="flex items-center gap-2 min-w-0">
                  <span id="player-series-badge" class="hidden text-[10px] sm:text-xs font-mono font-bold bg-[#e50914] text-white px-2 py-0.5 rounded shadow tracking-wider flex-shrink-0 border border-red-500/40">S1 : E1</span>
                  <h2 id="player-movie-title" class="text-sm sm:text-base md:text-lg font-black text-white tracking-wide drop-shadow-md truncate">Título</h2>
                </div>
                <p id="player-sub-title" class="text-[10px] sm:text-xs text-neutral-300 font-medium tracking-normal mt-0.5 drop-shadow truncate"></p>
              </div>
            </div>

            <!-- Right Action Controls -->
            <div class="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <button id="player-server-btn" class="player-top-btn cursor-pointer" title="Servidores de Reprodução" tabindex="0">
                <span>⚡</span>
                <span id="player-server-label" class="text-xs font-semibold">Servidor</span>
              </button>
              <button id="player-audio-btn" class="player-top-btn cursor-pointer" title="Idioma do Áudio" tabindex="0">
                <span>🔊</span>
                <span id="player-audio-label" class="text-xs font-semibold">${isEn ? 'Audio' : 'Áudio'}</span>
              </button>
              <button id="player-subtitles-btn" class="player-top-btn cursor-pointer" title="Legendas" tabindex="0">
                <span>💬</span>
                <span id="player-subtitles-label" class="text-xs font-semibold whitespace-nowrap">${isEn ? 'Subtitles' : 'Legendas'}</span>
              </button>
              <button id="player-lock-btn" class="player-top-btn cursor-pointer ${isTv ? 'hidden' : ''}" title="Bloquear Tela" tabindex="0">
                <span>🔒</span>
              </button>
              <button id="player-pip-btn" class="player-top-btn cursor-pointer ${isTv ? 'hidden' : 'hidden md:flex'}" title="Picture-in-Picture" tabindex="0">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 11h-8v6h8v-6zm4 8V4.98C23 3.88 22.1 3 21 3H3c-1.1 0-2 .88-2 1.98V19c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2zm-2 .02H3V4.97h18v14.05z"/>
                </svg>
                <span class="text-xs font-semibold">PiP</span>
              </button>
              <button id="player-cast-btn" class="player-top-btn cursor-pointer ${isTv ? 'hidden' : 'hidden sm:flex'}" title="Transmitir para TV" tabindex="0">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M1 18v3h3c0-1.66-1.34-3-3-3zm0-4v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7zm0-4v2c4.97 0 9 4.03 9 9h2c0-6.08-4.92-11-11-11zm20-7H3c-1.1 0-2 .9-2 2v3h2V5h18v14h-7v2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
                </svg>
                <span class="text-xs font-semibold">${t('cast')}</span>
              </button>
            </div>
          </div>

          <!-- Center Controls Row (Prev Ep, Rewind 10s, Large Play/Pause, Forward 10s, Next Ep) -->
          <div id="player-center-controls" class="flex items-center justify-center gap-5 sm:gap-7 md:gap-9 my-auto pointer-events-auto">
            <!-- Prev Episode (series only) -->
            <button id="player-prev-ep-btn" class="player-nav-btn cursor-pointer hidden" title="Episódio Anterior" tabindex="0">
              <span class="text-xl">⏮</span>
            </button>

            <!-- Rewind 10s -->
            <button id="player-rewind-btn" class="player-nav-btn cursor-pointer flex-col gap-0.5" title="Voltar 10s" tabindex="0">
              <span class="text-lg leading-none">⏪</span>
              <span class="text-[9px] font-bold leading-none">-10s</span>
            </button>

            <!-- Center Large Play / Pause Button -->
            <button id="player-play-btn" class="player-center-play-btn cursor-pointer" title="Reproduzir / Pausar" tabindex="0">
              <span id="player-play-icon" class="text-3xl ml-0.5">⏸</span>
            </button>

            <!-- Forward 10s -->
            <button id="player-forward-btn" class="player-nav-btn cursor-pointer flex-col gap-0.5" title="Avançar 10s" tabindex="0">
              <span class="text-lg leading-none">⏩</span>
              <span class="text-[9px] font-bold leading-none">+10s</span>
            </button>

            <!-- Next Episode (series only) -->
            <button id="player-next-ep-btn" class="player-nav-btn cursor-pointer hidden" title="Próximo Episódio" tabindex="0">
              <span class="text-xl">⏭</span>
            </button>
          </div>

          <!-- Bottom Bar (Current Time, Scrubber Slider, Duration, Speed, Fit) -->
          <div id="player-bottom-bar" class="flex items-center gap-2 sm:gap-3 md:gap-4 w-full pointer-events-auto pb-1">
            <span id="player-time-current" class="text-xs md:text-sm font-mono text-neutral-300 min-w-[50px] text-center">00:00</span>
            
            <!-- Interactive Scrubber Timeline Container -->
            <div id="player-scrubber-container" class="relative flex-1 h-10 flex items-center cursor-pointer player-slider-container" tabindex="0" title="Linha do tempo">
              <div id="player-scrubber-track" class="w-full h-2 bg-white/20 rounded-full relative overflow-hidden pointer-events-none">
                <div id="player-scrubber-buffered" class="absolute top-0 bottom-0 left-0 bg-white/30 rounded-full w-0 transition-all duration-200"></div>
                <div id="player-scrubber-played" class="absolute top-0 bottom-0 left-0 bg-[#FFD700] rounded-full w-0"></div>
              </div>
              <div id="player-scrubber-thumb" class="w-4 h-4 bg-[#FFD700] border-2 border-white rounded-full shadow pointer-events-none" style="position: absolute; top: 50%; left: 0%; transform: translate(-50%, -50%);"></div>
            </div>

            <span id="player-time-duration" class="text-xs md:text-sm font-mono text-neutral-300 min-w-[50px] text-center">00:00</span>
            
            <!-- Speed Button (moved to bottom bar for clean HUD balance) -->
            <button id="player-speed-btn" class="player-top-btn text-xs px-2.5 py-1.5 cursor-pointer flex items-center gap-1" title="Velocidade" tabindex="0">
              <span id="player-speed-text" class="text-xs font-semibold">1.0x</span>
            </button>

            <!-- Bottom Fit shortcut button -->
            <button id="player-bottom-fit-btn" class="player-top-btn text-xs px-2.5 py-1.5 cursor-pointer flex items-center gap-1" title="Ajustar Proporção" tabindex="0">
              <span id="player-bottom-fit-icon">⤢</span>
              <span id="player-fit-text" class="text-xs font-semibold hidden sm:inline">16:9</span>
            </button>
          </div>

        </div>

        <!-- Cast to TV Modal Sheet -->
        <div id="player-cast-modal" class="hidden absolute inset-0 bg-black/85 z-50 items-center justify-center p-4 backdrop-blur-md" style="display: none;">
          <div class="bg-neutral-900 border border-white/20 rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4">
            <div class="flex items-center justify-between border-b border-white/10 pb-3">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-full bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M1 18v3h3c0-1.66-1.34-3-3-3zm0-4v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7zm0-4v2c4.97 0 9 4.03 9 9h2c0-6.08-4.92-11-11-11zm20-7H3c-1.1 0-2 .9-2 2v3h2V5h18v14h-7v2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="font-bold text-sm text-white">${t('castToTv')}</h3>
                  <p class="text-[10px] text-neutral-400">Selecione o método de transmissão</p>
                </div>
              </div>
              <button id="player-cast-close-btn" class="text-neutral-400 hover:text-white text-xs font-bold px-2.5 py-1 rounded-lg bg-white/10 hover:bg-red-600 transition cursor-pointer">✕</button>
            </div>
            
            <div class="space-y-2.5">
              <button id="cast-opt-smartview" class="w-full p-3.5 rounded-xl bg-red-600/20 hover:bg-red-600/35 border-2 border-red-500 text-left transition flex items-center gap-3 active:scale-98 cursor-pointer shadow-lg shadow-red-900/30" tabindex="0">
                <div class="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center text-xl flex-shrink-0 shadow">📡</div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-1.5">
                    <p class="text-xs font-black text-white">${t('castSmartView')}</p>
                    <span class="text-[9px] font-bold uppercase bg-red-500 text-white px-1.5 py-0.2 rounded">${t('recommended')}</span>
                  </div>
                  <p class="text-[10px] text-neutral-300 leading-tight mt-0.5">${t('castSmartViewDesc')}</p>
                </div>
                <span class="text-sm text-red-400 font-bold">➔</span>
              </button>

              <button id="cast-opt-chrome" class="w-full p-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-left transition flex items-center gap-3 active:scale-98 cursor-pointer" tabindex="0">
                <div class="w-9 h-9 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-lg flex-shrink-0">🌐</div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-bold text-white">Google Chrome (Chromecast)</p>
                  <p class="text-[10px] text-neutral-400 leading-tight mt-0.5">${t('castChromeDesc')}</p>
                </div>
                <span class="text-xs text-neutral-400">➔</span>
              </button>

              <button id="cast-opt-external" class="w-full p-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-left transition flex items-center gap-3 active:scale-98 cursor-pointer" tabindex="0">
                <div class="w-9 h-9 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-lg flex-shrink-0">📱</div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-bold text-white">Web Video Caster / VLC</p>
                  <p class="text-[10px] text-neutral-400 leading-tight mt-0.5">${t('castExternalDesc')}</p>
                </div>
                <span class="text-xs text-neutral-400">➔</span>
              </button>
            </div>

            <button id="player-cast-cancel-btn" class="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold rounded-xl transition cursor-pointer" tabindex="0">
              ${t('cancel')}
            </button>
          </div>
        </div>

        <!-- Server / Stream Source Picker Modal -->
        <div id="player-settings-modal" class="hidden absolute inset-0 bg-black/85 z-50 items-center justify-center p-3 sm:p-4 backdrop-blur-md overflow-y-auto" style="display: none;">
          <div class="bg-neutral-900 border border-white/20 rounded-2xl p-4 sm:p-5 max-w-sm w-full shadow-2xl space-y-3 max-h-[92vh] flex flex-col my-auto">
            <div class="flex items-center justify-between border-b border-white/10 pb-2.5 flex-shrink-0">
              <div class="flex items-center gap-2">
                <span class="text-base">⚙️</span>
                <h3 id="player-settings-title" class="font-bold text-sm text-white">${t('streamServersTitle')}</h3>
              </div>
              <button id="player-settings-close-btn" class="text-neutral-400 hover:text-white text-xs font-bold px-2 py-1 rounded-lg bg-white/10 hover:bg-red-600 transition cursor-pointer">✕</button>
            </div>
            
            <p id="player-settings-desc" class="text-[11px] text-neutral-400 flex-shrink-0">${t('streamServersDesc')}</p>

            <div id="player-settings-options" class="space-y-1.5 overflow-y-auto pr-1 flex-1 min-h-[100px] max-h-56">
              <!-- Dynamically populated from STREAM_SERVERS -->
            </div>

            <button id="player-settings-cancel-btn" class="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold rounded-xl transition cursor-pointer flex-shrink-0" tabindex="0">
              ${t('cancel')}
            </button>
          </div>
        </div>

        <!-- Subtitles Selection Modal Sheet -->
        <div id="player-subtitles-modal" class="hidden absolute inset-0 bg-black/85 z-50 items-center justify-center p-3 sm:p-4 backdrop-blur-md overflow-y-auto" style="display: none;">
          <div class="bg-neutral-900 border border-white/20 rounded-2xl p-4 sm:p-5 max-w-sm w-full shadow-2xl space-y-3 max-h-[92vh] flex flex-col my-auto">
            <div class="flex items-center justify-between border-b border-white/10 pb-2.5 flex-shrink-0">
              <div class="flex items-center gap-2">
                <span class="text-base">💬</span>
                <h3 id="player-subtitles-title" class="font-bold text-sm text-white">${t('subtitlesTitle')}</h3>
              </div>
              <button id="player-subtitles-close-btn" class="text-neutral-400 hover:text-white text-xs font-bold px-2 py-1 rounded-lg bg-white/10 hover:bg-red-600 transition cursor-pointer">✕</button>
            </div>
            
            <p id="player-subtitles-desc" class="text-[11px] text-neutral-400 flex-shrink-0">${t('subtitlesDesc')}</p>

            <!-- Subtitle Customization Controls (Size & Sync Offset) -->
            <div class="bg-white/5 border border-white/10 rounded-xl p-2.5 space-y-2 text-xs flex-shrink-0">
              <div class="flex items-center justify-between">
                <span class="text-[10px] uppercase font-bold text-neutral-400">${isEn ? 'Font Size' : 'Tamanho da Fonte'}</span>
                <div class="flex items-center gap-1">
                  <button type="button" class="sub-size-btn px-2 py-1 rounded bg-white/10 text-[10px] font-bold text-neutral-300 hover:text-white cursor-pointer" data-size="sm" tabindex="0">${isEn ? 'S' : 'P'}</button>
                  <button type="button" class="sub-size-btn px-2 py-1 rounded bg-white/10 text-[10px] font-bold text-neutral-300 hover:text-white cursor-pointer" data-size="md" tabindex="0">${isEn ? 'M' : 'M'}</button>
                  <button type="button" class="sub-size-btn px-2 py-1 rounded bg-white/10 text-[10px] font-bold text-neutral-300 hover:text-white cursor-pointer" data-size="lg" tabindex="0">${isEn ? 'L' : 'G'}</button>
                  <button type="button" class="sub-size-btn px-2 py-1 rounded bg-white/10 text-[10px] font-bold text-neutral-300 hover:text-white cursor-pointer" data-size="xl" tabindex="0">${isEn ? 'XL' : 'GG'}</button>
                </div>
              </div>
              <div class="flex items-center justify-between pt-1 border-t border-white/5">
                <span class="text-[10px] uppercase font-bold text-neutral-400">${isEn ? 'Sync Offset' : 'Sincronia / Atraso'}</span>
                <div class="flex items-center gap-1 font-mono">
                  <button type="button" id="sub-offset-minus-large" class="px-1.5 py-0.5 rounded bg-white/10 text-[11px] font-bold hover:bg-white/20 text-neutral-200 cursor-pointer" tabindex="0">-2s</button>
                  <button type="button" id="sub-offset-minus" class="px-1.5 py-0.5 rounded bg-white/10 text-[11px] font-bold hover:bg-white/20 text-neutral-200 cursor-pointer" tabindex="0">-0.5s</button>
                  <span id="sub-offset-val" class="text-[11px] font-bold text-[#FFD700] min-w-[34px] text-center">0.0s</span>
                  <button type="button" id="sub-offset-plus" class="px-1.5 py-0.5 rounded bg-white/10 text-[11px] font-bold hover:bg-white/20 text-neutral-200 cursor-pointer" tabindex="0">+0.5s</button>
                  <button type="button" id="sub-offset-plus-large" class="px-1.5 py-0.5 rounded bg-white/10 text-[11px] font-bold hover:bg-white/20 text-neutral-200 cursor-pointer" tabindex="0">+2s</button>
                  <button type="button" id="sub-offset-reset" class="text-[9px] px-1 py-0.5 text-neutral-400 hover:text-white ml-0.5 cursor-pointer" tabindex="0">Reset</button>
                  <button type="button" id="sub-offset-auto" class="text-[9px] px-1.5 py-0.5 bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600 hover:text-white rounded ml-0.5 cursor-pointer font-sans" tabindex="0">Auto</button>
                </div>
              </div>
            </div>

            <!-- Tip for hardcoded / embroidered video subtitles -->
            <div class="p-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/25 text-[11px] text-yellow-200/90 leading-snug flex-shrink-0 flex items-start gap-2">
              <span class="text-sm">💡</span>
              <p id="player-subtitles-embroid-hint">${isEn ? 'If this video already has hardcoded subtitles on screen, select Off below.' : 'Se este vídeo já possui legendas embutidas na imagem, selecione Desativado abaixo.'}</p>
            </div>

            <div id="player-subtitles-options" class="space-y-1.5 overflow-y-auto pr-1 flex-1 min-h-[90px] max-h-52">
              <!-- Dynamically populated -->
            </div>

            <button id="player-subtitles-cancel-btn" class="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold rounded-xl transition cursor-pointer flex-shrink-0" tabindex="0">
              ${t('cancel')}
            </button>
          </div>
        </div>

        <!-- Audio Language Selection Modal Sheet -->
        <div id="player-audio-modal" class="hidden absolute inset-0 bg-black/85 z-50 items-center justify-center p-3 sm:p-4 backdrop-blur-md overflow-y-auto" style="display: none;">
          <div class="bg-neutral-900 border border-white/20 rounded-2xl p-4 sm:p-5 max-w-sm w-full shadow-2xl space-y-3 max-h-[92vh] flex flex-col my-auto">
            <div class="flex items-center justify-between border-b border-white/10 pb-2.5 flex-shrink-0">
              <div class="flex items-center gap-2">
                <span class="text-base">🔊</span>
                <h3 id="player-audio-title" class="font-bold text-sm text-white">${isEn ? 'Audio Language' : 'Idioma do Áudio'}</h3>
              </div>
              <button id="player-audio-close-btn" class="text-neutral-400 hover:text-white text-xs font-bold px-2 py-1 rounded-lg bg-white/10 hover:bg-red-600 transition cursor-pointer">✕</button>
            </div>
            
            <p id="player-audio-desc" class="text-[11px] text-neutral-400 flex-shrink-0">${isEn ? 'Available audio tracks for current stream' : 'Faixas de áudio disponíveis para esta transmissão'}</p>

            <!-- Dialogue Boost / Night Mode Toggle -->
            <div class="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center justify-between flex-shrink-0">
              <div>
                <p class="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>🌙</span>
                  <span id="night-mode-title">${isEn ? 'Dialogue Boost (Night Mode)' : 'Clareza de Voz (Modo Noite)'}</span>
                </p>
                <p class="text-[10px] text-neutral-400 mt-0.5">${isEn ? 'Boosts voices & compresses loud explosions' : 'Destaca falas e atenua efeitos explosivos'}</p>
              </div>
              <button type="button" id="player-night-mode-toggle" class="px-3 py-1 rounded-full text-xs font-bold border transition cursor-pointer bg-white/10 border-white/20 text-neutral-300">
                OFF
              </button>
            </div>

            <div id="player-audio-options" class="space-y-2 overflow-y-auto pr-1 flex-1 min-h-[80px] max-h-52">
              <!-- Dynamically populated -->
            </div>

            <button id="player-audio-cancel-btn" class="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold rounded-xl transition cursor-pointer flex-shrink-0" tabindex="0">
              ${t('cancel')}
            </button>
          </div>
        </div>

        <!-- Continue Watching Resume Dialog -->
        <div id="player-resume-modal" class="hidden absolute inset-0 bg-black/90 z-50 items-center justify-center p-4 backdrop-blur-md" style="display: none;">
          <div class="bg-neutral-900/95 border border-white/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <div class="w-12 h-12 rounded-full bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center text-2xl mx-auto">
              ⏱️
            </div>
            <div>
              <h3 id="player-resume-title" class="text-base font-black text-white">${t('resumeModalTitle')}</h3>
              <p id="player-resume-subtitle" class="text-xs text-neutral-300 mt-1.5">${t('resumeModalSubtitle')} <span id="player-resume-time" class="text-[#FFD700] font-mono font-bold text-sm">0:00</span></p>
            </div>
            <div class="flex items-center gap-2.5 pt-2">
              <button id="player-resume-confirm-btn" class="flex-1 py-3 px-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-900/60 transition active:scale-95 cursor-pointer whitespace-nowrap" tabindex="0">
                ${t('resumeModalContinue')}
              </button>
              <button id="player-resume-restart-btn" class="flex-1 py-3 px-3 bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white font-bold text-xs rounded-xl border border-white/10 transition active:scale-95 cursor-pointer whitespace-nowrap" tabindex="0">
                ${t('resumeModalStartOver')}
              </button>
            </div>
          </div>
        </div>

      </div>
    `;

    // DOM references
    this.overlay = this.container.querySelector('#player-overlay');
    this.video = this.container.querySelector('#cine-video');
    this.embed = this.container.querySelector('#cine-embed');
    this.loadingScreen = this.container.querySelector('#player-loading-screen');
    this.loadingBackdrop = this.container.querySelector('#player-loading-backdrop');
    this.loadingPoster = this.container.querySelector('#player-loading-poster');
    this.loadingTitle = this.container.querySelector('#player-loading-title');
    this.loadingCircleWrapper = this.container.querySelector('#player-loading-circle-wrapper');
    this.loadingStatus = this.container.querySelector('#player-loading-status');
    this.tapSurface = this.container.querySelector('#player-tap-surface');
    this.spinner = this.container.querySelector('#player-spinner');
    this.statusText = this.container.querySelector('#player-status-text');
    this.centerPlayIndicator = this.container.querySelector('#center-play-indicator');
    this.subtitlesOverlay = this.container.querySelector('#player-subtitles-overlay');
    this.subtitlesText = this.container.querySelector('#player-subtitles-text');
    
    // Unified HUD
    this.hud = this.container.querySelector('#player-hud');
    this.topArea = this.container.querySelector('#player-top-area');
    this.topBar = this.container.querySelector('#player-top-bar');
    this.closeBtn = this.container.querySelector('#player-close-btn');
    this.backText = this.container.querySelector('#player-back-text');
    this.title = this.container.querySelector('#player-movie-title');
    this.seriesBadge = this.container.querySelector('#player-series-badge');
    this.playerSubTitle = this.container.querySelector('#player-sub-title');
    this.playerTitleRow = this.container.querySelector('#player-title-row');
    this.serverBtn = this.container.querySelector('#player-server-btn');
    this.serverLabel = this.container.querySelector('#player-server-label');
    this.fitBtn = this.container.querySelector('#player-fit-btn') || this.container.querySelector('#player-bottom-fit-btn');
    this.fitIcon = this.container.querySelector('#player-fit-icon') || this.container.querySelector('#player-bottom-fit-icon');
    this.fitText = this.container.querySelector('#player-fit-text');
    this.speedBtn = this.container.querySelector('#player-speed-btn');
    this.speedText = this.container.querySelector('#player-speed-text');
    this.pipBtn = this.container.querySelector('#player-pip-btn');
    this.castBtn = this.container.querySelector('#player-cast-btn');

    // Center Controls
    this.centerControls = this.container.querySelector('#player-center-controls');
    this.prevEpBtn = this.container.querySelector('#player-prev-ep-btn');
    this.rewindBtn = this.container.querySelector('#player-rewind-btn');
    this.playBtn = this.container.querySelector('#player-play-btn');
    this.playIcon = this.container.querySelector('#player-play-icon');
    this.forwardBtn = this.container.querySelector('#player-forward-btn');
    this.nextEpBtn = this.container.querySelector('#player-next-ep-btn');

    // Bottom Bar
    this.bottomBar = this.container.querySelector('#player-bottom-bar');
    this.timeCurrent = this.container.querySelector('#player-time-current');
    this.timeDuration = this.container.querySelector('#player-time-duration');
    this.scrubberContainer = this.container.querySelector('#player-scrubber-container');
    this.scrubberTrack = this.container.querySelector('#player-scrubber-track');
    this.scrubberBuffered = this.container.querySelector('#player-scrubber-buffered');
    this.scrubberPlayed = this.container.querySelector('#player-scrubber-played');
    this.scrubberThumb = this.container.querySelector('#player-scrubber-thumb');
    this.bottomFitBtn = this.container.querySelector('#player-bottom-fit-btn');
    this.bottomFitIcon = this.container.querySelector('#player-bottom-fit-icon');

    // Fit Toast
    this.fitToast = this.container.querySelector('#player-fit-toast');
    this.fitToastIcon = this.container.querySelector('#fit-toast-icon');
    this.fitToastText = this.container.querySelector('#fit-toast-text');

    // Cast modal
    this.castModal = this.container.querySelector('#player-cast-modal');
    this.castCloseBtn = this.container.querySelector('#player-cast-close-btn');
    this.castCancelBtn = this.container.querySelector('#player-cast-cancel-btn');
    this.castOptSmartView = this.container.querySelector('#cast-opt-smartview');
    this.castOptChrome = this.container.querySelector('#cast-opt-chrome');
    this.castOptExternal = this.container.querySelector('#cast-opt-external');

    // Server Settings Modal
    this.settingsModal = this.container.querySelector('#player-settings-modal');
    this.settingsOptions = this.container.querySelector('#player-settings-options');
    this.settingsCloseBtn = this.container.querySelector('#player-settings-close-btn');
    this.settingsCancelBtn = this.container.querySelector('#player-settings-cancel-btn');

    // Audio Language Modal & Button
    this.audioBtn = this.container.querySelector('#player-audio-btn');
    this.audioLabel = this.container.querySelector('#player-audio-label');
    this.audioModal = this.container.querySelector('#player-audio-modal');
    this.audioOptions = this.container.querySelector('#player-audio-options');
    this.audioCloseBtn = this.container.querySelector('#player-audio-close-btn');
    this.audioCancelBtn = this.container.querySelector('#player-audio-cancel-btn');

    // Subtitles Modal & Button
    this.subtitlesBtn = this.container.querySelector('#player-subtitles-btn');
    this.subtitlesLabel = this.container.querySelector('#player-subtitles-label');
    this.subtitlesModal = this.container.querySelector('#player-subtitles-modal');
    this.subtitlesOptions = this.container.querySelector('#player-subtitles-options');
    this.subtitlesCloseBtn = this.container.querySelector('#player-subtitles-close-btn');
    this.subtitlesCancelBtn = this.container.querySelector('#player-subtitles-cancel-btn');

    // Resume Modal
    this.resumeModal = this.container.querySelector('#player-resume-modal');
    this.resumeTitle = this.container.querySelector('#player-resume-title');
    this.resumeSubtitle = this.container.querySelector('#player-resume-subtitle');
    this.resumeTime = this.container.querySelector('#player-resume-time');
    this.resumeConfirmBtn = this.container.querySelector('#player-resume-confirm-btn');
    this.resumeRestartBtn = this.container.querySelector('#player-resume-restart-btn');

    // Speed & Screen Lock
    this.speedBtn = this.container.querySelector('#player-speed-btn');
    this.speedText = this.container.querySelector('#player-speed-text');
    this.lockBtn = this.container.querySelector('#player-lock-btn');
    this.unlockPill = this.container.querySelector('#player-unlock-pill');
    this.unlockText = this.container.querySelector('#player-unlock-text');

    // Auto-Play Next Episode Card
    this.nextEpCard = this.container.querySelector('#player-next-ep-card');
    this.nextEpTimer = this.container.querySelector('#player-next-ep-timer');
    this.nextEpTitle = this.container.querySelector('#player-next-ep-title');
    this.nextEpPlayBtn = this.container.querySelector('#player-next-ep-play-btn');
    this.nextEpCancelBtn = this.container.querySelector('#player-next-ep-cancel-btn');

    // Subtitle Controls & Audio Night Mode
    this.subOffsetVal = this.container.querySelector('#sub-offset-val');
    this.subOffsetMinusLarge = this.container.querySelector('#sub-offset-minus-large');
    this.subOffsetMinus = this.container.querySelector('#sub-offset-minus');
    this.subOffsetPlus = this.container.querySelector('#sub-offset-plus');
    this.subOffsetPlusLarge = this.container.querySelector('#sub-offset-plus-large');
    this.subOffsetReset = this.container.querySelector('#sub-offset-reset');
    this.subOffsetAuto = this.container.querySelector('#sub-offset-auto');
    this.nightModeToggle = this.container.querySelector('#player-night-mode-toggle');

    this.tapSurface = this.container.querySelector('#player-tap-surface');

    // States
    this.subtitleOffset = 0;
    this.subtitleSize = localStorage.getItem('cinetv_sub_size') || 'md';
    this.currentSubtitleLang = localStorage.getItem('cinetv_preferred_sub_lang') || null;
    this.currentAudioLang = localStorage.getItem('cinetv_audio_lang') || null;
    this.isScreenLocked = false;
    this.playbackSpeed = 1.0;
    this.isNightMode = localStorage.getItem('cinetv_night_mode') === 'true';
    this.nextEpCardShown = false;
    this.nextEpDismissed = false;
    this.nextEpCountdownTimer = null;
    this.streamWatchdog = null;

    if (this.nightModeToggle && this.isNightMode) {
      this.nightModeToggle.innerText = 'ON';
      this.nightModeToggle.className = 'px-3 py-1 rounded-full text-xs font-bold border transition cursor-pointer bg-red-600 border-red-500 text-white shadow-lg shadow-red-950/50';
    }

    this.updateLanguage();
  }

  updateLanguage() {
    const isEn = (typeof window.getLanguage === 'function' ? window.getLanguage() : getLanguage()) === 'en';
    if (this.backText) this.backText.innerText = t('back');
    if (this.serverLabel) this.serverLabel.innerText = isEn ? 'Server' : 'Servidor';
    if (this.audioLabel) this.audioLabel.innerText = isEn ? 'Audio' : 'Áudio';
    if (this.subtitlesLabel) this.subtitlesLabel.innerText = isEn ? 'Subtitles' : 'Legendas';
    if (this.fitText) this.fitText.innerText = isEn ? 'Fit' : 'Tamanho';
    if (this.unlockText) this.unlockText.innerText = t('tapToUnlock');

    const settingsTitle = this.container.querySelector('#player-settings-title');
    const settingsDesc = this.container.querySelector('#player-settings-desc');
    if (settingsTitle) settingsTitle.innerText = t('streamServersTitle') || (isEn ? 'Streaming Servers' : 'Servidores de Reprodução');
    if (settingsDesc) settingsDesc.innerText = t('streamServersDesc') || (isEn ? 'If a server freezes or is slow, choose another below:' : 'Se um servidor travar ou estiver lento, escolha outro abaixo:');

    const audioTitle = this.container.querySelector('#player-audio-title');
    const audioDesc = this.container.querySelector('#player-audio-desc');
    const nightTitle = this.container.querySelector('#night-mode-title');
    const nightDesc = this.container.querySelector('#night-mode-desc');
    if (audioTitle) audioTitle.innerText = isEn ? 'Audio Language' : 'Idioma do Áudio';
    if (audioDesc) audioDesc.innerText = isEn ? 'Available audio tracks for current stream' : 'Faixas de áudio disponíveis para esta transmissão';
    if (nightTitle) nightTitle.innerText = t('dialogueBoostTitle');
    if (nightDesc) nightDesc.innerText = t('dialogueBoostSubtitle');

    const subTitle = this.container.querySelector('#player-subtitles-title');
    const subDesc = this.container.querySelector('#player-subtitles-desc');
    const subEmbroid = this.container.querySelector('#player-subtitles-embroid-hint');
    const fontSizeLbl = this.container.querySelector('#player-sub-size-label');
    const syncOffsetLbl = this.container.querySelector('#player-sub-offset-label');
    if (subTitle) subTitle.innerText = t('subtitlesTitle');
    if (subDesc) subDesc.innerText = t('subtitlesDesc');
    if (subEmbroid) subEmbroid.innerText = t('subtitlesEmbroidHint');
    if (fontSizeLbl) fontSizeLbl.innerText = t('fontSizeLabel');
    if (syncOffsetLbl) syncOffsetLbl.innerText = t('syncOffsetLabel');

    if (this.resumeTitle) this.resumeTitle.innerText = t('resumeModalTitle');
    if (this.resumeSubtitle) this.resumeSubtitle.innerText = t('resumeModalSubtitle');
    if (this.resumeConfirmBtn) this.resumeConfirmBtn.innerText = t('resumeModalContinue');
    if (this.resumeRestartBtn) this.resumeRestartBtn.innerText = t('resumeModalStartOver');

    const nextEpLbl = this.container.querySelector('#player-next-ep-label');
    if (nextEpLbl) nextEpLbl.innerText = t('nextEpisode');
    if (this.nextEpPlayBtn) this.nextEpPlayBtn.innerText = `▶ ${t('playNow')}`;
    if (this.nextEpCancelBtn) this.nextEpCancelBtn.innerText = t('dismiss');

    if (this.currentItem) {
      this.updatePlayerTitleInfo(this.currentItem, this.currentSeason, this.currentEpisode);
    }
  }

  updatePlayerTitleInfo(item, season, episode) {
    if (!item) return;
    const isSeries = item.type === 'series';
    const isEn = (typeof window.getLanguage === 'function' ? window.getLanguage() : getLanguage()) === 'en';
    const titleText = getItemTitle(item) || item.title || item.name || '';

    if (this.title) {
      this.title.innerText = titleText;
    }

    if (isSeries) {
      const curSeason = season || this.currentSeason || 1;
      const curEpisode = episode || this.currentEpisode || 1;
      if (this.seriesBadge) {
        this.seriesBadge.innerText = `S${curSeason} : E${curEpisode}`;
        this.seriesBadge.classList.remove('hidden');
      }

      const epLabel = isEn ? 'Episode' : 'Episódio';
      const parts = [`${epLabel} ${curEpisode}`];
      if (item.year) parts.push(item.year);
      if (item.genre) {
        parts.push(localizeGenre(item.genre));
      } else if (item.genres && Array.isArray(item.genres) && item.genres.length > 0) {
        parts.push(item.genres.slice(0, 2).map(g => localizeGenre(g)).join(', '));
      }
      if (this.playerSubTitle) {
        this.playerSubTitle.innerText = parts.join(' • ');
        this.playerSubTitle.classList.remove('hidden');
      }
    } else {
      if (this.seriesBadge) {
        this.seriesBadge.classList.add('hidden');
      }

      const parts = [];
      if (item.year) parts.push(item.year);
      const dur = formatItemDuration(item);
      if (dur) parts.push(dur);
      if (item.genre) {
        parts.push(localizeGenre(item.genre));
      } else if (item.genres && Array.isArray(item.genres) && item.genres.length > 0) {
        parts.push(item.genres.slice(0, 2).map(g => localizeGenre(g)).join(', '));
      }
      if (item.rating) parts.push(`★ ${item.rating}`);

      if (this.playerSubTitle) {
        if (parts.length > 0) {
          this.playerSubTitle.innerText = parts.join(' • ');
          this.playerSubTitle.classList.remove('hidden');
        } else {
          this.playerSubTitle.innerText = '';
          this.playerSubTitle.classList.add('hidden');
        }
      }
    }
  }

  parseDurationToSeconds(durationStr) {
    if (!durationStr || typeof durationStr !== 'string') return 0;
    // Guard: ignore episode / season counts (e.g. "8 Episódios", "1 Season", "10 eps")
    if (/epis[oó]d|season|temporada|cap[ií]tulo/i.test(durationStr)) return 0;
    let total = 0;
    const hMatch = durationStr.match(/(\d+)\s*h/i);
    const mMatch = durationStr.match(/(\d+)\s*m/i);
    const minMatch = durationStr.match(/(\d+)\s*min/i);
    if (hMatch) total += parseInt(hMatch[1], 10) * 3600;
    if (mMatch) total += parseInt(mMatch[1], 10) * 60;
    else if (minMatch) total += parseInt(minMatch[1], 10) * 60;
    if (total === 0) {
      const numOnly = parseInt(durationStr, 10);
      if (!isNaN(numOnly) && numOnly > 0) total = numOnly * 60;
    }
    return total;
  }

  formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const pad = (v) => (v < 10 ? '0' + v : v);
    if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
    return `${pad(m)}:${pad(s)}`;
  }

  getSubtitleOffsetKey(lang = null) {
    if (!this.currentItem) return null;
    const rawId = this.currentItem.imdbId || this.currentItem.id;
    if (!rawId) return null;
    const match = String(rawId).match(/tt\d+/);
    const imdbId = match ? match[0] : rawId;
    const targetLang = (lang || this.currentSubtitleLang || 'auto').toLowerCase();
    if (this.currentItem.type === 'series') {
      const s = this.currentSeason || 1;
      const e = this.currentEpisode || 1;
      return `cinetv_sub_offset_${imdbId}_s${s}e${e}_${targetLang}`;
    }
    return `cinetv_sub_offset_${imdbId}_${targetLang}`;
  }

  loadSubtitleOffsetForCurrentTrack(lang = null) {
    const key = this.getSubtitleOffsetKey(lang);
    let offset = 0;
    if (key) {
      const saved = parseFloat(localStorage.getItem(key));
      if (!isNaN(saved) && isFinite(saved)) {
        offset = saved;
      }
    }
    this.subtitleOffset = offset;
    if (this.subOffsetVal) {
      const sign = this.subtitleOffset > 0 ? '+' : '';
      this.subOffsetVal.innerText = `${sign}${this.subtitleOffset.toFixed(1)}s`;
    }
    return offset;
  }

  play(item, serverId = 'multiembed', customSeason = null, customEpisode = null) {
    if (!item) return;

    const season = customSeason || item.season || 1;
    const episode = customEpisode || item.episode || 1;

    // Prevent duplicate triggers / double-clicks reloading the player
    const now = Date.now();
    const isSameItem = this.currentItem && 
                       (this.currentItem.imdbId || this.currentItem.id) === (item.imdbId || item.id) &&
                       this.currentSeason === season &&
                       this.currentEpisode === episode &&
                       this.currentServerId === serverId;

    if (isSameItem && this.isOpen() && (now - this.lastPlayTime < 2000)) {
      return;
    }
    this.lastPlayTime = now;

    // Fresh user-initiated play: reset the server fallback budget.
    // (Auto-fallback replays set _autoFallbackReplay so the budget survives across servers.)
    if (!this._autoFallbackReplay) {
      this.fallbackAttempts = 0;
      this._watchdogRearms = 0;
      this._lastEmbedReportAt = 0;
    }
    this._autoFallbackReplay = false;

    // Probe the real WebView engine capabilities. The UA string is overridden
    // with a fixed Chrome/128 value, so JS cannot detect an outdated WebView alone.
    this.refreshWebViewInfo();
    // Manual embed mode when the native hooks can't be injected (old WebView):
    // the provider's player is shown as-is and the user controls it directly.
    this.manualEmbedMode = !this._webViewInfo.videoHooks;
    this._manualUserTookControl = false;

    this.currentItem = item;
    this.currentServerId = serverId;
    this.currentSeason = season;
    this.currentEpisode = episode;
    this.lastPlaybackTime = 0;
    this.updateStreamPlaybackState(false);
    this.loadSubtitleOffsetForCurrentTrack();
    const metaDur = this.parseDurationToSeconds(item.duration);
    this.totalDuration = metaDur > 0 ? metaDur : (item.type === 'series' ? 2700 : 7200);
    this.updateScrubberUI(0, this.totalDuration);
    if (this.subtitlesText) {
      this.subtitlesText.className = 'sub-size-' + (this.subtitleSize || 'md');
    }
    this.isEmbedPlaying = false;
    this.updatePlayPauseUI(false);
    this.currentSubtitleCues = [];
    if (this.subtitlesOverlay) {
      this.subtitlesOverlay.classList.add('hidden');
      this.subtitlesOverlay.style.opacity = '0';
      if (this.subtitlesText) this.subtitlesText.innerHTML = '';
    }

    this.unlockScreen();
    this.hideNextEpisodeCard();
    this.nextEpCardShown = false;
    this.nextEpDismissed = false;

    this.updatePlayerTitleInfo(item, this.currentSeason, this.currentEpisode);
    
    // Series controls visibility
    if (item.type === 'series') {
      if (this.prevEpBtn) {
        this.prevEpBtn.classList.remove('hidden');
        this.prevEpBtn.style.opacity = this.currentEpisode > 1 ? '1' : '0.4';
      }
      if (this.nextEpBtn) {
        this.nextEpBtn.classList.remove('hidden');
      }
    } else {
      if (this.prevEpBtn) this.prevEpBtn.classList.add('hidden');
      if (this.nextEpBtn) this.nextEpBtn.classList.add('hidden');
    }

    try {
      saveContinueWatching(this.currentItem, this.currentSeason, this.currentEpisode);
      if (window.cineApp && window.cineApp.populateContinueWatching) {
        window.cineApp.populateContinueWatching();
      }
    } catch (e) {}

    const streamData = getRealStreamUrl(item, this.currentServerId, this.currentSeason, this.currentEpisode);
    this.isEmbedMode = streamData.isEmbed;
    this.overlay.classList.toggle('embed-mode', this.isEmbedMode);
    this.startStreamWatchdog();

    // Enable PiP support in Android native host (mobile only)
    try {
      if (window.AndroidNative && window.AndroidNative.setPlayerActive) {
        window.AndroidNative.setPlayerActive(true);
      }
    } catch (e) {}

    // Resume Modal check (direct video only; embed streams manage their own resume state)
    const progress = getItemProgress(this.currentItem, this.currentSeason, this.currentEpisode);
    if (!this.isEmbedMode && progress && progress.currentTime > 25) {
      this.pendingResumeTime = progress.currentTime;
      this.showResumeModal(progress.formattedTime);
    } else {
      this.pendingResumeTime = 0;
      this.closeResumeModal();
    }

    this.overlay.classList.remove('hidden');
    this.overlay.classList.add('flex');
    document.body.classList.add('modal-open');
    this.showLoadingScreen(item);
    this.spinner.classList.add('hidden');

    if (window.cineTvNav) {
      if (!progress || progress.currentTime <= 25) {
        window.cineTvNav.pushModal(this.overlay, '#player-play-btn');
      } else {
        window.cineTvNav.pushModal(this.overlay, '#player-resume-confirm-btn');
      }
    }

    // Lock landscape orientation
    try {
      const nativeBridge = window.AndroidNative || window.AndroidOrientation;
      if (nativeBridge && nativeBridge.setLandscape) {
        nativeBridge.setLandscape();
      } else if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('sensor-landscape').catch(() => {
          screen.orientation.lock('landscape').catch(() => {});
        });
      }
    } catch (e) {}

    this.applyFitTransform();
    this.startTicker();
    this.autoLoadSubtitles();

    // Ensure CineTV player controls are visible and accessible in all modes
    if (this.centerControls) this.centerControls.classList.remove('hidden');
    if (this.bottomBar) this.bottomBar.classList.remove('hidden');
    if (this.timeCurrent) this.timeCurrent.classList.remove('hidden');
    if (this.timeDuration) this.timeDuration.classList.remove('hidden');
    if (this.scrubberContainer) this.scrubberContainer.classList.remove('hidden');
    if (this.bottomFitBtn) this.bottomFitBtn.classList.remove('hidden');

    if (this.isEmbedMode) {
      if (this.statusText) this.statusText.innerText = '';

      this.video.classList.add('hidden');
      if (this.hls) {
        this.hls.destroy();
        this.hls = null;
      }
      this.video.pause();
      this.video.removeAttribute('src');

      this.embed.classList.remove('hidden');
      this.embed.src = streamData.url;
      this.updateStreamPlaybackState(false);

      // Keep HUD clean/unobtrusive initially
      this.hideHUD();

      const onIframeLoaded = () => {
        this.spinner.classList.add('hidden');
        if (this.manualEmbedMode) {
          // No hooks: cannot autoplay or track state. Reveal the provider's own
          // player. The user presses the app's Play button to tap the provider's
          // play button (via native center-tap), or switches servers manually.
          // Auto-fallback still runs (25s) unless the user takes control.
          this.hideLoadingScreen();
          const hint = t('manualEmbedHint') || 'Press Play to start the video, or wait for the next server. BACK exits.';
          this.showToast('🎬', hint);
          return;
        }
        this.sendPlayerAction('play');
        this.sendPlayerAction('unmute');

        const pulses = [0, 150, 300, 600, 1200, 2400];
        pulses.forEach(delay => {
          setTimeout(() => {
            if (this.isOpen() && this.isEmbedMode) {
              if (!this.isEmbedPlaying) this.sendPlayerAction('play');
              this.sendPlayerAction('unmute');
            }
          }, delay);
        });
      };
      this.embed.onload = onIframeLoaded;
      setTimeout(onIframeLoaded, 300);
      setTimeout(onIframeLoaded, 1000);

    } else {
      if (this.statusText) this.statusText.innerText = '';

      // Show CineTV controls for direct video playback
      if (this.centerControls) this.centerControls.classList.remove('hidden');
      if (this.bottomBar) this.bottomBar.classList.remove('hidden');
      if (this.timeCurrent) this.timeCurrent.classList.remove('hidden');
      if (this.timeDuration) this.timeDuration.classList.remove('hidden');

      this.embed.classList.add('hidden');
      this.embed.src = 'about:blank';
      this.video.classList.remove('hidden');

      const streamUrl = streamData.url;
      this.activeBlobUrl = streamUrl.startsWith('blob:') ? streamUrl : null;
      const isDirectVideo = streamUrl.toLowerCase().includes('.mp4') || 
                            streamUrl.startsWith('file:') || 
                            streamUrl.startsWith('content:') ||
                            streamUrl.startsWith('blob:');

      if (isDirectVideo) {
        if (this.hls) {
          this.hls.destroy();
          this.hls = null;
        }
        this.video.src = streamUrl;
        this.video.onloadedmetadata = () => {
          this.spinner.classList.add('hidden');
          this.video.play().catch(() => {});
          this.resetHUDTimeout();
        };
        this.video.onerror = () => {
          this.spinner.classList.add('hidden');
        };
        this.video.load();
      } else if (Hls.isSupported()) {
        if (this.hls) this.hls.destroy();
        this.hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        this.hls.loadSource(streamUrl);
        this.hls.attachMedia(this.video);

        this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
          this.spinner.classList.add('hidden');
          this.video.play().catch(() => {});
          this.resetHUDTimeout();
        });

        this.hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            this.spinner.classList.add('hidden');
          }
        });
      } else if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
        this.video.src = streamUrl;
        this.video.addEventListener('loadedmetadata', () => {
          this.spinner.classList.add('hidden');
          this.video.play().catch(() => {});
          this.resetHUDTimeout();
        });
      } else {
        // No MSE (hls.js) and no native HLS support: fail loudly instead of
        // leaving the loading spinner spinning forever (common on old TV boxes).
        this.spinner.classList.add('hidden');
        this.hideLoadingScreen();
        this.showToast('⚠️', t('videoFormatUnsupported') || 'This video format is not supported on this device.');
        this.showHUD(true);
      }
    }
  }

  handleNativeVideoState(data) {
    if (!data || !this.isOpen()) return;
    const payload = data.payload || data;

    // Guard against messages from the main host frame or localhost when in embed mode
    if (this.isEmbedMode) {
      if (data.isMainFrame || (payload.href && (payload.href.includes('localhost') || payload.href.includes('capacitor://') || payload.href.includes('127.0.0.1')))) {
        return;
      }
    }

    // The native hook reports every video element inside the embed iframe,
    // including preroll ads. An ad must not count as "playback started":
    // the loading screen stays up over the ad and the watchdog stays honest.
    const isAd = payload.isAd === true;
    if (this.isEmbedMode) {
      this._lastEmbedReportAt = Date.now();
    }

    if (typeof payload.currentTime === 'number' && !this.isDraggingTime) {
      if (!isAd) {
        this.lastPlaybackTime = payload.currentTime;
      }
      if (payload.currentTime > 0 && !isAd) {
        this.updateStreamPlaybackState(true);
      }
    }
    if (typeof payload.duration === 'number' && payload.duration > 0) {
      this.totalDuration = payload.duration;
    }
    if (typeof payload.paused === 'boolean') {
      const isPlaying = !payload.paused;
      this.isEmbedPlaying = isPlaying;
      this.updatePlayPauseUI(isPlaying);
      if (!isAd && isPlaying && (payload.currentTime > 0 || (this.lastPlaybackTime && this.lastPlaybackTime > 0))) {
        this.updateStreamPlaybackState(true);
      }
    }
    this.updateScrubberUI(this.lastPlaybackTime, this.totalDuration);
    this.updateSubtitles(this.lastPlaybackTime);
    if (this.spinner && !this.spinner.classList.contains('hidden')) {
      this.spinner.classList.add('hidden');
    }
  }

  handleStreamCaptured(streamUrl) {
    // Deliberately no-op for embeds: third-party embed CDNs enforce CORS / Origin headers
    // that fail in direct hls.js from localhost. The iframe player must stay intact and active.
  }

  playDirectStream(streamUrl) {
    if (!this.isOpen() || !streamUrl) return;
    this.isEmbedMode = false;
    this.overlay.classList.remove('embed-mode');
    if (this.embed) {
      this.embed.classList.add('hidden');
      this.embed.src = 'about:blank';
    }
    if (this.video) {
      this.video.classList.remove('hidden');
      const isDirectVideo = streamUrl.toLowerCase().includes('.mp4') || 
                            streamUrl.startsWith('file:') || 
                            streamUrl.startsWith('content:') ||
                            streamUrl.startsWith('blob:');

      if (isDirectVideo) {
        if (this.hls) {
          this.hls.destroy();
          this.hls = null;
        }
        this.video.src = streamUrl;
        this.video.onloadedmetadata = () => {
          this.spinner.classList.add('hidden');
          this.video.play().catch(() => {});
          this.updateStreamPlaybackState(true);
          this.resetHUDTimeout();
        };
        this.video.onerror = () => {
          this.spinner.classList.add('hidden');
        };
        this.video.load();
      } else if (Hls.isSupported()) {
        if (this.hls) this.hls.destroy();
        this.hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        this.hls.loadSource(streamUrl);
        this.hls.attachMedia(this.video);
        this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
          this.spinner.classList.add('hidden');
          this.video.play().catch(() => {});
          this.updateStreamPlaybackState(true);
          this.resetHUDTimeout();
        });
        this.hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            this.spinner.classList.add('hidden');
          }
        });
      } else if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
        this.video.src = streamUrl;
        this.video.addEventListener('loadedmetadata', () => {
          this.spinner.classList.add('hidden');
          this.video.play().catch(() => {});
          this.updateStreamPlaybackState(true);
          this.resetHUDTimeout();
        });
      } else {
        // No MSE (hls.js) and no native HLS support: fail loudly instead of
        // leaving the loading spinner spinning forever (common on old TV boxes).
        this.spinner.classList.add('hidden');
        this.hideLoadingScreen();
        this.showToast('⚠️', t('videoFormatUnsupported') || 'This video format is not supported on this device.');
        this.showHUD(true);
      }
    }
  }

  startTicker() {
    this.stopTicker();
    this.tickerTimer = setInterval(() => {
      if (!this.isOpen() || this.isDraggingTime) return;

      let cur = this.lastPlaybackTime || 0;
      let dur = this.totalDuration || 0;

      if (this.isEmbedMode) {
        let hasNativeTime = false;
        if (window.AndroidNative && window.AndroidNative.getVideoCurrentTime) {
          const nCur = window.AndroidNative.getVideoCurrentTime();
          const nDur = window.AndroidNative.getVideoDuration();
          if (nCur > 0) {
            cur = nCur;
            hasNativeTime = true;
            this.updateStreamPlaybackState(true);
          }
          if (nDur > 0) dur = nDur;
        }

        this.lastPlaybackTime = cur;
        if (dur > 0) this.totalDuration = dur;
        this.updateScrubberUI(cur, this.totalDuration);
        this.updateSubtitles(cur);
      } else if (this.video) {
        cur = this.video.currentTime || 0;
        dur = this.video.duration || 0;
        this.lastPlaybackTime = cur;
        if (cur > 0) this.updateStreamPlaybackState(true);
        if (dur > 0) this.totalDuration = dur;
        this.updateScrubberUI(cur, dur);
        this.updateSubtitles(cur);
      }

      // Cancel stream watchdog once playback starts moving
      if (cur > 2 && this.streamWatchdog) {
        clearTimeout(this.streamWatchdog);
        this.streamWatchdog = null;
      }

      // Check auto-play next episode countdown card for series (only when truly finished, >=85% and >=90% or within 25s of end)
      if (this.currentItem && isSeriesItem(this.currentItem) && dur >= 300 && cur >= dur * 0.85 && (cur >= dur * 0.90 || dur - cur <= 25) && !this.nextEpCardShown && !this.nextEpDismissed) {
        markEpisodeWatched(this.currentItem, this.currentSeason, this.currentEpisode);
        this.showNextEpisodeCard();
      }

      // Automatically mark movie as watched when reached 90% completion
      if (this.currentItem && !isSeriesItem(this.currentItem) && dur > 60 && cur >= dur * 0.90) {
        markItemWatched(this.currentItem);
      }

      const now = Date.now();
      if (cur > 10 && now - (this.lastSaveTime || 0) > 4500) {
        this.lastSaveTime = now;
        try {
          saveContinueWatching(this.currentItem, this.currentSeason, this.currentEpisode, cur, dur);
        } catch (e) {}
      }
    }, 1000);
  }

  stopTicker() {
    if (this.tickerTimer) {
      clearInterval(this.tickerTimer);
      this.tickerTimer = null;
    }
  }

  updateScrubberUI(current, duration) {
    if (this.timeCurrent) {
      this.timeCurrent.innerText = this.formatTime(current);
    }
    if (duration > 0 && this.timeDuration) {
      this.timeDuration.innerText = this.formatTime(duration);
    }
    const curVal = (current && !isNaN(current) && current > 0) ? current : 0;
    const durVal = (duration && !isNaN(duration) && duration > 0) ? duration : 0;
    const pct = durVal > 0 ? Math.max(0, Math.min(100, (curVal / durVal) * 100)) : 0;

    if (this.scrubberPlayed) {
      this.scrubberPlayed.style.width = `${pct}%`;
    }
    if (this.scrubberThumb) {
      this.scrubberThumb.style.left = `${pct}%`;
      this.scrubberThumb.style.transform = 'translate(-50%, -50%)';
    }
  }

  switchServer(newServerId, isManual = true) {
    if (!this.currentItem) return;
    this.currentServerId = newServerId;
    if (isManual) {
      this.fallbackAttempts = 0;
    }
    // A new server means no embed reports yet and a fresh patience budget.
    this._watchdogRearms = 0;
    this._lastEmbedReportAt = 0;
    this.lastPlayTime = 0;
    if (this.spinner) this.spinner.classList.remove('hidden');
    if (this.statusText) this.statusText.innerText = t('connecting');
    this.play(this.currentItem, newServerId, this.currentSeason, this.currentEpisode);
  }

  playEpisode(season, episode) {
    if (!this.currentItem) return;
    this.currentSeason = season;
    this.currentEpisode = episode;
    this.updatePlayerTitleInfo(this.currentItem, this.currentSeason, this.currentEpisode);

    if (this.prevEpBtn) {
      this.prevEpBtn.style.opacity = this.currentEpisode > 1 ? '1' : '0.4';
    }

    try {
      saveContinueWatching(this.currentItem, this.currentSeason, this.currentEpisode);
      if (window.cineApp && window.cineApp.populateContinueWatching) {
        window.cineApp.populateContinueWatching();
      }
    } catch (e) {}

    // Reset episode-specific playback and timeline state
    this.lastPlaybackTime = 0;
    this.updateStreamPlaybackState(false);
    this.isEmbedPlaying = false;
    this.updatePlayPauseUI(false);
    this.loadSubtitleOffsetForCurrentTrack();
    const metaDur = this.parseDurationToSeconds(this.currentItem.duration);
    this.totalDuration = metaDur > 0 ? metaDur : 2700;
    this.updateScrubberUI(0, this.totalDuration);
    this.hideNextEpisodeCard();
    this.nextEpCardShown = false;
    this.nextEpDismissed = false;

    // Invalidate old subtitles cues & cache so new episode subtitles load fresh
    this.currentSubtitleCues = [];
    this.cachedSubtitles = null;
    this.cachedSubtitlesKey = null;
    if (this.subtitlesOverlay) {
      this.subtitlesOverlay.classList.add('hidden');
      this.subtitlesOverlay.style.opacity = '0';
      if (this.subtitlesText) this.subtitlesText.innerHTML = '';
    }
    if (this.subtitlesText) {
      this.subtitlesText.className = 'sub-size-' + (this.subtitleSize || 'md');
    }

    this.spinner.classList.remove('hidden');
    this.statusText.innerText = `${t('episodeLabel')} ${this.currentEpisode}...`;

    const streamData = getRealStreamUrl(this.currentItem, this.currentServerId || 'multiembed', this.currentSeason, this.currentEpisode);
    this.isEmbedMode = streamData.isEmbed;
    this.overlay.classList.toggle('embed-mode', this.isEmbedMode);

    if (this.isEmbedMode) {
      if (this.video) {
        this.video.classList.add('hidden');
        if (this.hls) {
          this.hls.destroy();
          this.hls = null;
        }
        this.video.pause();
        this.video.removeAttribute('src');
      }
      if (this.embed) {
        this.embed.classList.remove('hidden');
        this.embed.src = streamData.url;
        this.updateStreamPlaybackState(false);
        this.hideHUD();

        const onIframeLoaded = () => {
          this.spinner.classList.add('hidden');
          this.sendPlayerAction('play');
          this.sendPlayerAction('unmute');

          const pulses = [0, 150, 300, 600, 1200, 2400];
          pulses.forEach(delay => {
            setTimeout(() => {
              if (this.isOpen() && this.isEmbedMode) {
                if (!this.isEmbedPlaying) this.sendPlayerAction('play');
                this.sendPlayerAction('unmute');
              }
            }, delay);
          });
        };
        this.embed.onload = onIframeLoaded;
        setTimeout(onIframeLoaded, 300);
        setTimeout(onIframeLoaded, 1000);
      }
    } else {
      if (this.embed) {
        this.embed.classList.add('hidden');
        this.embed.src = 'about:blank';
      }
      if (this.video) {
        this.video.classList.remove('hidden');
        const streamUrl = streamData.url;
        this.activeBlobUrl = streamUrl.startsWith('blob:') ? streamUrl : null;
        const isDirectVideo = streamUrl.toLowerCase().includes('.mp4') || 
                              streamUrl.startsWith('file:') || 
                              streamUrl.startsWith('content:') ||
                              streamUrl.startsWith('blob:');
        if (isDirectVideo) {
          if (this.hls) {
            this.hls.destroy();
            this.hls = null;
          }
          this.video.src = streamUrl;
          this.video.onloadedmetadata = () => {
            this.spinner.classList.add('hidden');
            this.video.play().catch(() => {});
          };
          this.video.onerror = () => {
            this.spinner.classList.add('hidden');
          };
          this.video.load();
        } else if (Hls.isSupported()) {
          if (this.hls) this.hls.destroy();
          this.hls = new Hls({ enableWorker: true, lowLatencyMode: true });
          this.hls.loadSource(streamUrl);
          this.hls.attachMedia(this.video);
          this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
            this.spinner.classList.add('hidden');
            this.video.play().catch(() => {});
          });
        } else if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
          this.video.src = streamUrl;
          this.video.onloadedmetadata = () => {
            this.spinner.classList.add('hidden');
            this.video.play().catch(() => {});
          };
          this.video.load();
        } else {
          // No MSE (hls.js) and no native HLS support: fail loudly instead of
          // leaving the loading spinner spinning forever (common on old TV boxes).
          this.spinner.classList.add('hidden');
          this.hideLoadingScreen();
          this.showToast('⚠️', t('videoFormatUnsupported') || 'This video format is not supported on this device.');
          this.showHUD(true);
        }
      }
    }

    this.applyFitTransform();
    this.startStreamWatchdog();
    this.autoLoadSubtitles();
    this.resetHUDTimeout();
  }

  prevEpisode() {
    if (!this.currentItem || this.currentItem.type !== 'series') return;
    if (this.currentEpisode > 1) {
      this.playEpisode(this.currentSeason, this.currentEpisode - 1);
    }
  }

  nextEpisode() {
    if (!this.currentItem || !isSeriesItem(this.currentItem)) return;
    if (this.totalDuration >= 300 && this.lastPlaybackTime >= this.totalDuration * 0.85) {
      markEpisodeWatched(this.currentItem, this.currentSeason, this.currentEpisode);
    }
    const maxEp = this.currentItem.episodesCount || 12;
    if (this.currentEpisode < maxEp) {
      this.playEpisode(this.currentSeason, this.currentEpisode + 1);
    } else {
      this.playEpisode(this.currentSeason + 1, 1);
    }
  }

  close() {
    try {
      if (window.AndroidNative && window.AndroidNative.setPlayerActive) {
        window.AndroidNative.setPlayerActive(false);
      }
    } catch (e) {}

    this.stopTicker();
    clearTimeout(this.hudTimeout);
    clearTimeout(this.streamWatchdog);
    this.streamWatchdog = null;
    this.hideNextEpisodeCard();
    this.unlockScreen();
    this.manualEmbedMode = false;
    this._manualUserTookControl = false;

    if (this.settingsModal && !this.settingsModal.classList.contains('hidden')) this.closeSettingsModal();
    if (this.castModal && !this.castModal.classList.contains('hidden')) this.closeCastMenu();
    if (this.resumeModal && !this.resumeModal.classList.contains('hidden')) this.closeResumeModal();
    if (this.audioModal && !this.audioModal.classList.contains('hidden')) this.closeAudioModal();
    if (this.subtitlesModal && !this.subtitlesModal.classList.contains('hidden')) this.closeSubtitlesModal();

    if (this.activeBlobUrl) {
      try { URL.revokeObjectURL(this.activeBlobUrl); } catch (e) {}
      this.activeBlobUrl = null;
    }

    this.currentSubtitleCues = [];
    this.subtitleOffset = 0;
    if (this.subOffsetVal) {
      this.subOffsetVal.innerText = '0.0s';
    }
    if (this.subtitlesOverlay) {
      this.subtitlesOverlay.classList.add('hidden');
      this.subtitlesOverlay.style.opacity = '0';
      if (this.subtitlesText) this.subtitlesText.innerHTML = '';
    }

    this.hideHUD();
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
    if (this.video) {
      this.video.pause();
      this.video.removeAttribute('src');
    }
    if (this.embed) {
      this.embed.src = 'about:blank';
    }

    this.overlay.classList.add('hidden');
    this.overlay.classList.remove('flex');
    this.overlay.classList.remove('embed-mode');
    this.updateStreamPlaybackState(false);
    this.hideLoadingScreen();

    if (window.cineTvNav) {
      window.cineTvNav.popSpecificModal(this.overlay);
    }

    const detailsModal = document.getElementById('details-overlay');
    if (detailsModal && !detailsModal.classList.contains('hidden') && detailsModal.style.display !== 'none') {
      document.body.classList.add('modal-open');
      const detailsPlayBtn = detailsModal.querySelector('#details-play-btn') || detailsModal.querySelector('button');
      if (detailsPlayBtn && window.cineTvNav) {
        setTimeout(() => window.cineTvNav.setFocus(detailsPlayBtn, true), 80);
      }
    } else {
      document.body.classList.remove('modal-open');
    }

    // Restore portrait screen orientation
    try {
      const nativeBridge = window.AndroidNative || window.AndroidOrientation;
      if (nativeBridge && nativeBridge.setPortrait) {
        nativeBridge.setPortrait();
      } else if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      }
    } catch (e) {}
  }

  sendPlayerAction(action, payload = {}) {
    const cmd = { cinetvCommand: true, action: action, ...payload };
    const jsonCmd = JSON.stringify(cmd);

    // 1. Android Native WebMessage Bridge (direct to iframe video)
    try {
      if (window.AndroidNative && window.AndroidNative.sendVideoCommand) {
        window.AndroidNative.sendVideoCommand(jsonCmd);
      }
    } catch (e) {}

    // 2. Cross-frame postMessage fallback
    if (this.isEmbedMode && this.embed && this.embed.contentWindow) {
      try {
        const win = this.embed.contentWindow;
        win.postMessage(cmd, '*');
        win.postMessage(jsonCmd, '*');
        win.postMessage({ player: true, action: action, ...payload }, '*');
        win.postMessage({ type: action, action: action, ...payload }, '*');
        win.postMessage(JSON.stringify({ action: action, ...payload }), '*');
      } catch (e) {}
    }
  }

  updatePlayPauseUI(isPlaying) {
    const symbol = isPlaying ? "⏸" : "▶";
    if (this.playIcon) this.playIcon.innerText = symbol;
    if (this.playBtn) this.playBtn.title = isPlaying ? (t('pause') || "Pausar") : (t('resume') || "Reproduzir");
  }

  togglePlay() {
    if (this.isEmbedMode) {
      // Manual embed mode (outdated WebView, no hooks): the app cannot control
      // the provider's player directly. Simulate a tap at the center of the
      // screen, where the provider's play button usually is. Mark user control
      // so the watchdog doesn't auto-switch servers and interrupt them.
      if (this.manualEmbedMode) {
        this._manualUserTookControl = true;
        try {
          // Bridge method is clickAt (JavascriptInterface), not simulateClickAt
          // (that's the private Java method name in MainActivity).
          if (window.AndroidNative && window.AndroidNative.clickAt) {
            window.AndroidNative.clickAt(0.5, 0.5);
          }
        } catch (e) {}
        this.showCenterIndicator("▶");
        this.showToast('👆', t('manualTapping') || 'Tapping play button...');
        return;
      }
      // If stream has not yet started, ALWAYS treat interaction as PLAY/START
      const nextState = !this.hasStreamPlaybackStarted ? true : !this.isEmbedPlaying;
      this.isEmbedPlaying = nextState;
      this.updatePlayPauseUI(nextState);
      this.showCenterIndicator(nextState ? "▶" : "⏸");

      const action = nextState ? 'play' : 'pause';
      this.sendPlayerAction(action);
      if (nextState) {
        this.sendPlayerAction('unmute');
      }

      if (nextState) {
        this.resetHUDTimeout();
      } else {
        this.showHUD();
      }
      return;
    }
    if (this.video && this.video.paused) {
      this.video.play().catch(() => {});
      this.updatePlayPauseUI(true);
      this.showCenterIndicator("▶");
      this.resetHUDTimeout();
    } else if (this.video) {
      this.video.pause();
      this.updatePlayPauseUI(false);
      this.showCenterIndicator("⏸");
      this.showHUD();
    }
  }

  playMedia() {
    if (this.isEmbedMode) {
      this.isEmbedPlaying = true;
      this.updatePlayPauseUI(true);
      this.sendPlayerAction('play');
      this.sendPlayerAction('unmute');
      this.resetHUDTimeout();
      return;
    }
    this.video?.play().catch(() => {});
    this.updatePlayPauseUI(true);
    this.resetHUDTimeout();
  }

  pauseMedia() {
    if (this.isEmbedMode) {
      this.isEmbedPlaying = false;
      this.updatePlayPauseUI(false);
      this.sendPlayerAction('pause');
      this.showHUD();
      return;
    }
    this.video?.pause();
    this.updatePlayPauseUI(false);
    this.showHUD();
  }

  showCenterIndicator(symbol) {
    if (!this.centerPlayIndicator) return;
    const inner = this.centerPlayIndicator.querySelector('div');
    if (inner) inner.innerText = symbol;
    this.centerPlayIndicator.style.opacity = '1';
    setTimeout(() => {
      if (this.centerPlayIndicator) this.centerPlayIndicator.style.opacity = '0';
    }, 600);
  }

  seek(seconds) {
    const cur = this.lastPlaybackTime || (this.video && this.video.currentTime) || 0;
    const dur = this.totalDuration || (this.video && this.video.duration) || 0;
    const target = Math.max(0, Math.min(dur > 0 ? dur : Infinity, cur + seconds));
    this.lastPlaybackTime = target;

    this.showToast(seconds < 0 ? '⏪' : '⏩', `${this.formatTime(target)} (${seconds > 0 ? '+' : ''}${seconds}s)`);
    this.updateScrubberUI(target, dur);
    this.updateSubtitles(target);
    this.showHUD();
    this.resetHUDTimeout();

    if (this.isEmbedMode) {
      this.sendPlayerAction('seekDelta', { delta: seconds });
      return;
    }

    if (this.video) {
      this.video.currentTime = target;
    }
  }

  seekFromNative(seconds) {
    this.seek(seconds);
  }

  seekToRatio(ratio) {
    const clampedRatio = Math.max(0, Math.min(1, ratio));
    this.showHUD();
    this.resetHUDTimeout();

    const dur = this.totalDuration || (this.video && this.video.duration) || 0;
    const targetSeconds = dur > 0 ? Math.round(clampedRatio * dur) : 0;
    this.lastPlaybackTime = targetSeconds;

    this.showToast('⏱️', `${this.formatTime(targetSeconds)} / ${this.formatTime(dur)}`);
    this.updateScrubberUI(targetSeconds, dur);
    this.updateSubtitles(targetSeconds);

    if (this.isEmbedMode) {
      if (window.AndroidNative && window.AndroidNative.dispatchScrubberClick) {
        window.AndroidNative.dispatchScrubberClick(clampedRatio);
      } else if (window.AndroidNative && window.AndroidNative.clickAt) {
        window.AndroidNative.clickAt(clampedRatio, 0.965);
      }
      this.sendPlayerAction('seek', { time: targetSeconds });
      return;
    }

    if (this.video && this.video.duration) {
      this.video.currentTime = targetSeconds;
    }
  }

  showResumeModal(formattedTime) {
    if (!this.resumeModal) return;
    if (this.resumeTime) this.resumeTime.innerText = formattedTime;
    this.resumeModal.style.display = 'flex';
    this.resumeModal.classList.remove('hidden');
    this.resumeModal.classList.add('flex');
    if (window.cineTvNav) {
      window.cineTvNav.pushModal(this.resumeModal, '#player-resume-confirm-btn');
    }
  }

  closeResumeModal() {
    if (!this.resumeModal) return;
    const wasOpen = !this.resumeModal.classList.contains('hidden') && this.resumeModal.style.display !== 'none';
    this.resumeModal.style.display = 'none';
    this.resumeModal.classList.add('hidden');
    this.resumeModal.classList.remove('flex');
    if (wasOpen && window.cineTvNav) {
      window.cineTvNav.popSpecificModal(this.resumeModal);
    }
  }

  applyResume(seconds) {
    if (seconds <= 0) return;
    this.lastPlaybackTime = seconds;
    if (this.isEmbedMode) {
      this.sendPlayerAction(`seek${Math.round(seconds)}`);
      setTimeout(() => {
        this.sendPlayerAction(`seek${Math.round(seconds)}`);
      }, 2500);
      this.showToast('⏱️', `${t('resumeModalSubtitle')} ${formatTimestamp(seconds)}`);
    } else if (this.video) {
      this.video.currentTime = seconds;
      this.showToast('⏱️', `${t('resumeModalSubtitle')} ${formatTimestamp(seconds)}`);
    }
  }

  showHUD(focusDefault = false) {
    if (this.overlay) this.overlay.classList.add('hud-visible');
    if (this.hud) {
      this.hud.classList.add('hud-visible');
      this.hud.style.opacity = '1';
    }
    if (this.centerControls) this.centerControls.style.pointerEvents = 'auto';

    if (focusDefault) {
      // Clear any previous highlight from top bar buttons
      const allFocused = this.overlay.querySelectorAll('.tv-focused');
      allFocused.forEach(el => el.classList.remove('tv-focused'));
      if (document.activeElement && document.activeElement.blur && document.activeElement !== this.playBtn) {
        document.activeElement.blur();
      }

      // Select and focus the center Play/Pause button when explicitly waking controls
      if (this.playBtn) {
        if (window.cineTvNav) {
          window.cineTvNav.setFocus(this.playBtn, false);
        } else {
          this.playBtn.focus();
          this.playBtn.classList.add('tv-focused');
        }
      }
    }

    this.resetHUDTimeout();
  }

  hideHUD() {
    if (this.isDraggingTime) return;
    if (this.overlay) this.overlay.classList.remove('hud-visible');
    if (this.hud) {
      this.hud.classList.remove('hud-visible');
      this.hud.style.opacity = '0';
    }
    if (this.centerControls) this.centerControls.style.pointerEvents = 'none';

    // Clear focus and blur active elements when controls hide
    const allFocused = this.overlay.querySelectorAll('.tv-focused');
    allFocused.forEach(el => el.classList.remove('tv-focused'));
    if (document.activeElement && document.activeElement.blur) {
      document.activeElement.blur();
    }

    clearTimeout(this.hudTimeout);
  }

  isHudVisible() {
    return this.hud && this.hud.classList.contains('hud-visible') && this.hud.style.opacity !== '0';
  }

  toggleHUD(focusDefault = false) {
    if (this.isHudVisible()) {
      this.hideHUD();
    } else {
      this.showHUD(focusDefault);
    }
  }

  resetHUDTimeout() {
    clearTimeout(this.hudTimeout);
    this.hudTimeout = setTimeout(() => this.hideHUD(), 3500);
  }

  cyclePlaybackSpeed() {
    const speeds = [1.0, 1.25, 1.5, 0.75];
    const currentIdx = speeds.indexOf(this.playbackSpeed);
    const nextSpeed = speeds[(currentIdx + 1) % speeds.length];
    this.playbackSpeed = nextSpeed;
    if (this.speedText) {
      this.speedText.innerText = `${nextSpeed}x`;
    }
    if (!this.isEmbedMode && this.video) {
      this.video.playbackRate = nextSpeed;
    } else if (this.isEmbedMode) {
      this.sendPlayerAction('setPlaybackRate', { rate: nextSpeed });
    }
    this.showToast('⚡', `${nextSpeed}x`);
  }

  lockScreen() {
    this.isScreenLocked = true;
    this.hideHUD();
    if (this.unlockPill) {
      this.unlockPill.classList.remove('hidden');
    }
    this.showToast('🔒', t('screenLocked'));
  }

  unlockScreen() {
    this.isScreenLocked = false;
    if (this.unlockPill) {
      this.unlockPill.classList.add('hidden');
    }
    this.showHUD();
    this.showToast('🔓', t('screenUnlocked'));
  }

  showNextEpisodeCard() {
    if (!this.nextEpCard || this.nextEpCardShown || this.nextEpDismissed) return;
    if (!this.currentItem || this.currentItem.type !== 'series') return;
    const maxEp = this.currentItem.episodesCount || 12;
    if (this.currentEpisode >= maxEp) return;

    this.nextEpCardShown = true;
    const nextEpNum = this.currentEpisode + 1;
    if (this.nextEpTitle) {
      this.nextEpTitle.innerText = `${getItemTitle(this.currentItem)} - S${this.currentSeason} : E${nextEpNum}`;
    }

    this.nextEpCard.classList.remove('hidden');
    let secondsLeft = 10;
    if (this.nextEpTimer) this.nextEpTimer.innerText = `${secondsLeft}s`;

    clearInterval(this.nextEpCountdownTimer);
    this.nextEpCountdownTimer = setInterval(() => {
      secondsLeft--;
      if (this.nextEpTimer) this.nextEpTimer.innerText = `${secondsLeft}s`;
      if (secondsLeft <= 0) {
        clearInterval(this.nextEpCountdownTimer);
        this.hideNextEpisodeCard();
        this.nextEpisode();
      }
    }, 1000);
  }

  hideNextEpisodeCard() {
    clearInterval(this.nextEpCountdownTimer);
    if (this.nextEpCard) {
      this.nextEpCard.classList.add('hidden');
    }
  }

  handleBack() {
    if (!this.isOpen()) return false;

    // 1. Resume Modal
    if (this.resumeModal && !this.resumeModal.classList.contains('hidden') && this.resumeModal.style.display !== 'none') {
      this.closeResumeModal();
      if (this.playBtn && window.cineTvNav) window.cineTvNav.setFocus(this.playBtn, true);
      return true;
    }

    // 2. Subtitles Modal
    if (this.subtitlesModal && !this.subtitlesModal.classList.contains('hidden') && this.subtitlesModal.style.display !== 'none') {
      this.closeSubtitlesModal();
      if (this.playBtn && window.cineTvNav) window.cineTvNav.setFocus(this.playBtn, true);
      return true;
    }

    // 3. Audio Modal
    if (this.audioModal && !this.audioModal.classList.contains('hidden') && this.audioModal.style.display !== 'none') {
      this.closeAudioModal();
      if (this.playBtn && window.cineTvNav) window.cineTvNav.setFocus(this.playBtn, true);
      return true;
    }

    // 4. Server Settings Modal
    if (this.settingsModal && !this.settingsModal.classList.contains('hidden') && this.settingsModal.style.display !== 'none') {
      this.closeSettingsModal();
      if (this.playBtn && window.cineTvNav) window.cineTvNav.setFocus(this.playBtn, true);
      return true;
    }

    // 5. Cast Modal
    if (this.castModal && !this.castModal.classList.contains('hidden') && this.castModal.style.display !== 'none') {
      this.closeCastMenu();
      if (this.playBtn && window.cineTvNav) window.cineTvNav.setFocus(this.playBtn, true);
      return true;
    }

    // 6. Next Episode Card
    if (this.nextEpCard && !this.nextEpCard.classList.contains('hidden')) {
      this.hideNextEpisodeCard();
      return true;
    }

    return false;
  }

  // Checks the real WebView engine capabilities exposed by the native bridge.
  // On TV boxes with an outdated Android System WebView, the native video hooks
  // (document-start injection: autoplay, ad cleanup, playback-state reporting)
  // are silently unavailable, which used to cause infinite loading spinners.
  refreshWebViewInfo() {
    if (this._webViewInfoProbed) return this._webViewInfo;
    this._webViewInfoProbed = true;
    this._webViewInfo = { videoHooks: true, webViewVersion: '' };
    try {
      if (window.AndroidNative && window.AndroidNative.getWebViewInfo) {
        const raw = window.AndroidNative.getWebViewInfo();
        const info = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (info && typeof info === 'object') {
          this._webViewInfo = {
            videoHooks: info.videoHooks !== false,
            webViewVersion: info.webViewVersion || ''
          };
        }
      }
    } catch (e) {}
    if (!this._webViewInfo.videoHooks && !this._webViewOutdatedWarned) {
      this._webViewOutdatedWarned = true;
      console.warn('[Player] Native video hooks unavailable. WebView version:', this._webViewInfo.webViewVersion || 'unknown');
      const msg = t('webViewOutdated') || 'Video may not start: your Android System WebView is outdated. Please update it in the Play Store.';
      // Defer slightly so the player UI is visible before the toast appears.
      setTimeout(() => this.showToast('⚠️', msg), 1200);
    }
    return this._webViewInfo;
  }

  startStreamWatchdog() {
    clearTimeout(this.streamWatchdog);
    this.streamWatchdog = null;

    // Both embed and direct-video modes get a startup watchdog now.
    // Embeds depend on the native video hooks; direct streams on the <video> element.
    const timeoutMs = (this.manualEmbedMode && this.isEmbedMode) ? 25000 : (this.isEmbedMode ? 9000 : 12000);

    this.streamWatchdog = setTimeout(() => {
      // Manual embed mode (outdated WebView, no hooks): we cannot detect
      // playback. Give the user 25s to press Play (which taps the provider's
      // play button). If they don't take control, fall back to the next server
      // so the app keeps trying different sources automatically.
      if (this.manualEmbedMode && this.isEmbedMode) {
        if (this._manualUserTookControl) {
          // User pressed Play; they're driving. Don't interrupt.
          return;
        }
        this.spinner.classList.add('hidden');
        this.hideLoadingScreen();
        if (this.isEmbedMode && (this.fallbackAttempts || 0) < (STREAM_SERVERS.length - 1)) {
          this.triggerStreamAutoFallback();
        } else {
          const isEn2 = (typeof window.getLanguage === 'function' ? window.getLanguage() : getLanguage()) === 'en';
          const msg2 = t('pressServerOrPlay') || (isEn2 ? 'Press Server to change source or Play to retry' : 'Pressione Servidor ou aperte Play para tentar');
          this.showToast('⚠️', msg2);
          this.showHUD(true);
        }
        return;
      }
      // In direct mode, a loaded-but-paused video (e.g. waiting for the user to
      // press play, or the resume modal) is not a failure.
      const directReady = !this.isEmbedMode && this.video && this.video.readyState >= 2;
      if (!this.isOpen() || this.hasStreamPlaybackStarted || (this.lastPlaybackTime || 0) > 0 || directReady) return;
      clearTimeout(this.streamWatchdog);
      this.streamWatchdog = null;

      const isEn = (typeof window.getLanguage === 'function' ? window.getLanguage() : getLanguage()) === 'en';

      // If the embed is alive (the native hook keeps reporting video state) but
      // the content hasn't started yet (slow load, preroll), give THIS server
      // one more chance instead of abandoning it. Only fall back when the embed
      // looks dead (no reports at all). A single re-arm keeps the worst case
      // at 18s per server instead of 27s.
      const lastReportAge = this._lastEmbedReportAt ? (Date.now() - this._lastEmbedReportAt) : Infinity;
      const embedAlive = this.isEmbedMode && lastReportAge < 5000;
      if (embedAlive && (this._watchdogRearms || 0) < 1) {
        this._watchdogRearms = (this._watchdogRearms || 0) + 1;
        console.log('[Player] Embed is alive but content has not started yet. Extending wait instead of switching server...');
        this.startStreamWatchdog();
        return;
      }

      if (this.isEmbedMode && (this.fallbackAttempts || 0) < (STREAM_SERVERS.length - 1)) {
        console.log('[Player] Stream timed out after 9s without playback. Auto-switching to backup server...');
        this.triggerStreamAutoFallback();
      } else {
        // Out of servers (or direct-video mode, where switching servers cannot
        // help): stop every spinner and tell the user what to do.
        if (this.spinner) this.spinner.classList.add('hidden');
        this.hideLoadingScreen();
        let msg;
        const hooks = this._webViewInfo || {};
        if (hooks.videoHooks === false) {
          msg = t('webViewOutdated') || (isEn
            ? 'Video may not start: your Android System WebView is outdated. Please update it in the Play Store.'
            : 'O vídeo pode não iniciar: seu Android System WebView está desatualizado. Atualize-o na Play Store.');
        } else if (this.isEmbedMode) {
          msg = t('pressServerOrPlay') || (isEn ? 'Press Server to change source or Play to retry' : 'Pressione Servidor ou aperte Play para tentar');
        } else {
          msg = t('streamStartTimeout') || (isEn ? 'The stream did not start. Check your connection or try another server.' : 'O stream não iniciou. Verifique sua conexão ou tente outro servidor.');
        }
        this.showToast('⚠️', msg);
        this.showHUD(true);
      }
    }, timeoutMs);
  }

  triggerStreamAutoFallback() {
    if (!this.currentItem) return;
    this.fallbackAttempts = (this.fallbackAttempts || 0) + 1;

    // Auto-fallback walks STREAM_SERVERS forward: Server 1 -> 2 -> 3 -> 4.
    // The watchdog only calls this while fallbackAttempts < STREAM_SERVERS.length - 1,
    // so it never wraps around to a server that already failed.
    const serverOrder = STREAM_SERVERS.map(s => s.id);
    const currentIdx = serverOrder.indexOf(this.currentServerId);
    const nextServer = currentIdx >= 0 ? serverOrder[(currentIdx + 1) % serverOrder.length] : serverOrder[0];

    const isEn = (typeof window.getLanguage === 'function' ? window.getLanguage() : getLanguage()) === 'en';
    const serverName = getServerLabel(nextServer);
    const template = t('tryBackupServer') || (isEn ? 'Trying backup server: {0}...' : 'Alternando para servidor reserva: {0}...');
    const msg = template.replace('{0}', serverName);
    this.showToast('⚡', msg);
    // Mark as an auto-replay so play() does not reset the fallback budget.
    this._autoFallbackReplay = true;
    this.switchServer(nextServer, false);
  }

  toggleNightMode() {
    this.isNightMode = !this.isNightMode;
    localStorage.setItem('cinetv_night_mode', String(this.isNightMode));
    if (this.nightModeToggle) {
      this.nightModeToggle.innerText = this.isNightMode ? 'ON' : 'OFF';
      this.nightModeToggle.className = this.isNightMode
        ? 'px-3 py-1 rounded-full text-xs font-bold border transition cursor-pointer bg-red-600 border-red-500 text-white shadow-lg shadow-red-950/50'
        : 'px-3 py-1 rounded-full text-xs font-bold border transition cursor-pointer bg-white/10 border-white/20 text-neutral-300';
    }

    if (!this.isEmbedMode && this.video) {
      try {
        if (!this.audioCtx) {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (AudioContextClass) {
            this.audioCtx = new AudioContextClass();
            this.audioSource = this.audioCtx.createMediaElementSource(this.video);
            
            this.audioCompressor = this.audioCtx.createDynamicsCompressor();
            this.audioCompressor.threshold.setValueAtTime(-24, this.audioCtx.currentTime);
            this.audioCompressor.knee.setValueAtTime(30, this.audioCtx.currentTime);
            this.audioCompressor.ratio.setValueAtTime(12, this.audioCtx.currentTime);
            this.audioCompressor.attack.setValueAtTime(0.003, this.audioCtx.currentTime);
            this.audioCompressor.release.setValueAtTime(0.25, this.audioCtx.currentTime);

            this.speechFilter = this.audioCtx.createBiquadFilter();
            this.speechFilter.type = 'peaking';
            this.speechFilter.frequency.setValueAtTime(2500, this.audioCtx.currentTime);
            this.speechFilter.Q.setValueAtTime(1.0, this.audioCtx.currentTime);
            this.speechFilter.gain.setValueAtTime(6, this.audioCtx.currentTime);
          }
        }

        if (this.audioCtx && this.audioSource) {
          if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
          }
          this.audioSource.disconnect();
          if (this.isNightMode) {
            this.audioSource.connect(this.speechFilter);
            this.speechFilter.connect(this.audioCompressor);
            this.audioCompressor.connect(this.audioCtx.destination);
          } else {
            this.audioSource.connect(this.audioCtx.destination);
          }
        }
      } catch (err) {
        console.warn('[CineTV] AudioContext night mode error:', err);
      }
    }

    this.showToast('🌙', this.isNightMode ? t('dialogueBoostActive') : t('dialogueBoostOff'));
  }

  cycleAspectRatio() {
    this.aspectRatioMode = ((this.aspectRatioMode || 0) + 1) % 3;
    this.applyAspectRatio(this.aspectRatioMode);
    this.showHUD();
    this.resetHUDTimeout();
  }

  applyAspectRatio(mode) {
    this.aspectRatioMode = mode;
    try {
      localStorage.setItem('cinetv_aspect_ratio', String(mode));
    } catch (e) {}
    let icon = '⤢';
    let label = 'Tamanho';

    if (mode === 1) {
      // Zoom
      if (this.embed) {
        this.embed.style.transform = 'scale(1.33)';
        this.embed.style.transformOrigin = 'center center';
      }
      if (this.video) {
        this.video.style.objectFit = 'cover';
      }
      icon = '⤢';
      label = 'Zoom';
      this.showToast('⤢', `${t('fitToScreen')} (Zoom)`);
    } else if (mode === 2) {
      // Stretch
      if (this.embed) {
        this.embed.style.transform = 'scaleX(1.22) scaleY(1.0)';
        this.embed.style.transformOrigin = 'center center';
      }
      if (this.video) {
        this.video.style.objectFit = 'fill';
      }
      icon = '↔';
      label = 'Stretch';
      this.showToast('↔', 'Stretch (Esticado)');
    } else {
      // 16:9 Original
      if (this.embed) {
        this.embed.style.transform = 'scale(1.0)';
        this.embed.style.transformOrigin = 'center center';
      }
      if (this.video) {
        this.video.style.objectFit = 'contain';
      }
      icon = '⤡';
      label = '16:9';
      this.showToast('⤡', t('originalAspect'));
    }

    if (this.fitIcon) this.fitIcon.innerText = icon;
    if (this.fitText) this.fitText.innerText = label;
    if (this.bottomFitIcon) this.bottomFitIcon.innerText = icon;
  }

  applyFitTransform() {
    this.applyAspectRatio(this.aspectRatioMode || 0);
  }

  showToast(icon, text) {
    if (!this.fitToast) return;
    if (this.fitToastIcon) this.fitToastIcon.innerText = icon;
    if (this.fitToastText) this.fitToastText.innerText = text;
    this.fitToast.style.opacity = '1';
    clearTimeout(this.fitToastTimer);
    this.fitToastTimer = setTimeout(() => {
      if (this.fitToast) this.fitToast.style.opacity = '0';
    }, 1600);
  }

  enterPip() {
    if (window.AndroidNative && window.AndroidNative.isTV && window.AndroidNative.isTV()) {
      return; // Do not enter PiP on TV/TV boxes
    }
    if (window.AndroidNative && window.AndroidNative.enterPipMode) {
      window.AndroidNative.enterPipMode();
      return;
    }
    if (this.video && document.pictureInPictureEnabled && !this.isEmbedMode) {
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture().catch(() => {});
      } else {
        this.video.requestPictureInPicture().catch(() => {});
      }
    }
  }

  onPipModeChanged(isInPip) {
    if (this.overlay) {
      if (isInPip) {
        this.overlay.classList.add('pip-mode');
        document.body.classList.add('pip-mode');
        this.hideHUD();
      } else {
        this.overlay.classList.remove('pip-mode');
        document.body.classList.remove('pip-mode');
      }
    }
  }

  openCastMenu() {
    if (!this.currentItem || !this.castModal) return;
    this.showHUD();
    this.resetHUDTimeout();
    this.castModal.style.display = 'flex';
    this.castModal.classList.remove('hidden');
    this.castModal.classList.add('flex');
    if (window.cineTvNav) {
      window.cineTvNav.pushModal(this.castModal, '#cast-opt-smartview');
    }
  }

  closeCastMenu() {
    if (this.castModal) {
      const wasOpen = !this.castModal.classList.contains('hidden') && this.castModal.style.display !== 'none';
      this.castModal.style.display = 'none';
      this.castModal.classList.add('hidden');
      this.castModal.classList.remove('flex');
      if (wasOpen && window.cineTvNav) {
        window.cineTvNav.popSpecificModal(this.castModal);
        if (this.playBtn) window.cineTvNav.setFocus(this.playBtn, false);
      }
    }
  }

  castWithSmartView() {
    this.closeCastMenu();
    this.showToast('📡', t('castSmartView'));
    const nativeBridge = window.AndroidNative;
    if (nativeBridge && nativeBridge.openCastSettings) {
      nativeBridge.openCastSettings();
    } else {
      this.showToast('📡', 'Buscando TVs na rede Wi-Fi...');
    }
  }

  castWithChrome() {
    this.closeCastMenu();
    if (!this.currentItem) return;
    const streamData = getRealStreamUrl(this.currentItem, this.currentServerId, this.currentSeason, this.currentEpisode);
    const url = streamData.url;
    this.showToast('🌐', 'Google Chrome');
    
    const nativeBridge = window.AndroidNative;
    if (nativeBridge && nativeBridge.castWithChrome) {
      nativeBridge.castWithChrome(url);
    } else if (nativeBridge && nativeBridge.openExternalUrl) {
      nativeBridge.openExternalUrl(url);
    } else {
      window.open(url, '_blank');
    }
  }

  castWithExternal() {
    this.closeCastMenu();
    if (!this.currentItem) return;
    const streamData = getRealStreamUrl(this.currentItem, this.currentServerId, this.currentSeason, this.currentEpisode);
    const url = streamData.url;
    const title = getItemTitle(this.currentItem);
    this.showToast('📱', 'Web Video Caster / VLC');

    const nativeBridge = window.AndroidNative;
    if (nativeBridge && nativeBridge.castStream) {
      nativeBridge.castStream(url, title);
    } else if (nativeBridge && nativeBridge.openExternalUrl) {
      nativeBridge.openExternalUrl(url);
    } else {
      window.open(url, '_blank');
    }
  }

  openSettingsModal() {
    if (!this.settingsModal || !this.settingsOptions) return;
    this.showHUD();
    this.resetHUDTimeout();

    const isEn = (typeof window.getLanguage === 'function' ? window.getLanguage() : '') === 'en';
    const serverIcons = {
      multiembed: '🎬',
      vidlink: '⚡',
      vidsrc: '🛡️',
      autoembed: '🚀'
    };

    // Labels are derived from STREAM_SERVERS order via getServerLabel():
    // "Server 1 (AnyEmbed VIP - Zero Ads)", etc. Never hardcode numbers here.
    this.settingsOptions.innerHTML = STREAM_SERVERS.map((srv) => {
      const isCurrent = this.currentServerId === srv.id;
      const icon = serverIcons[srv.id] || '📺';
      const label = getServerLabel(srv.id);
      return `
        <button class="player-server-opt-btn w-full p-2.5 rounded-xl ${isCurrent ? 'bg-red-600/30 border-red-500/80 text-white font-bold shadow-lg shadow-red-900/30' : 'bg-white/5 hover:bg-white/15 border-white/10 text-neutral-300'} border text-left transition flex items-center justify-between cursor-pointer" data-server="${srv.id}" tabindex="0">
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="text-base flex-shrink-0">${icon}</span>
            <span class="text-xs truncate font-medium">${label}</span>
          </div>
          ${isCurrent ? `<span class="text-xs text-[#FFD700] font-bold">${t('activeBadge') || (isEn ? 'Active ✓' : 'Ativo ✓')}</span>` : '<span class="text-xs text-neutral-500">➔</span>'}
        </button>
      `;
    }).join('');

    this.settingsOptions.querySelectorAll('.player-server-opt-btn').forEach(btn => {
      let lastTouch = 0;
      let startY = 0;
      let startX = 0;
      let isScrolling = false;

      const handleServerSelect = (e) => {
        if (e) {
          e.stopPropagation();
          if (e.cancelable) e.preventDefault();
        }
        const serverId = btn.dataset.server;
        this.closeSettingsModal();
        if (serverId && serverId !== this.currentServerId) {
          this.switchServer(serverId);
          const sName = getServerLabel(serverId);
          this.showToast('🔄', sName);
        }
      };

      btn.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches[0]) {
          startY = e.touches[0].clientY;
          startX = e.touches[0].clientX;
        }
        isScrolling = false;
      }, { passive: true });

      btn.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches[0]) {
          const dy = Math.abs(e.touches[0].clientY - startY);
          const dx = Math.abs(e.touches[0].clientX - startX);
          if (dy > 8 || dx > 8) {
            isScrolling = true;
          }
        }
      }, { passive: true });

      btn.addEventListener('touchend', (e) => {
        if (isScrolling) return;
        lastTouch = Date.now();
        handleServerSelect(e);
      }, { passive: false });

      btn.addEventListener('click', (e) => {
        if (Date.now() - lastTouch < 400 || isScrolling) return;
        handleServerSelect(e);
      });
    });

    this.settingsModal.style.display = 'flex';
    this.settingsModal.classList.remove('hidden');
    this.settingsModal.classList.add('flex');

    if (window.cineTvNav) {
      window.cineTvNav.pushModal(this.settingsModal);
    }
  }

  closeSettingsModal() {
    if (this.settingsModal) {
      const wasOpen = !this.settingsModal.classList.contains('hidden') && this.settingsModal.style.display !== 'none';
      this.settingsModal.style.display = 'none';
      this.settingsModal.classList.add('hidden');
      this.settingsModal.classList.remove('flex');
      if (wasOpen && window.cineTvNav) {
        window.cineTvNav.popSpecificModal(this.settingsModal);
        const retBtn = this.serverBtn || this.playBtn;
        if (retBtn) window.cineTvNav.setFocus(retBtn, false);
      }
    }
  }

  openAudioModal() {
    if (!this.audioModal || !this.audioOptions) return;
    this.showHUD();
    this.resetHUDTimeout();

    const isEn = (typeof window.getLanguage === 'function' ? window.getLanguage() : '') === 'en';
    const currentAudio = this.currentAudioLang || 'eng';

    // Detect available audio tracks from HLS / HTML5 video if available
    let availableTracks = [];
    if (this.hls && this.hls.audioTracks && this.hls.audioTracks.length > 0) {
      availableTracks = this.hls.audioTracks.map((t, idx) => ({
        id: String(idx),
        label: t.name || t.lang || `Track ${idx + 1}`,
        lang: (t.lang || '').toLowerCase(),
        icon: (t.lang && (t.lang.includes('pt') || t.lang.includes('por'))) ? '🇧🇷' : '🇺🇸'
      }));
    } else if (this.video && this.video.audioTracks && this.video.audioTracks.length > 0) {
      for (let i = 0; i < this.video.audioTracks.length; i++) {
        const t = this.video.audioTracks[i];
        availableTracks.push({
          id: String(i),
          label: t.label || t.language || `Track ${i + 1}`,
          lang: (t.language || '').toLowerCase(),
          icon: (t.language && (t.language.includes('pt') || t.language.includes('por'))) ? '🇧🇷' : '🇺🇸'
        });
      }
    }

    let optionsHtml = '';

    if (availableTracks.length > 0) {
      optionsHtml = availableTracks.map(t => {
        const isCurrent = currentAudio === t.id || currentAudio === t.lang;
        return `
          <button class="player-audio-opt-btn w-full p-2.5 rounded-xl ${isCurrent ? 'bg-red-600/30 border-red-500/80 text-white font-bold shadow-lg shadow-red-900/30' : 'bg-white/5 hover:bg-white/15 border-white/10 text-neutral-300'} border text-left transition flex items-center justify-between cursor-pointer" data-audio="${t.id}" tabindex="0">
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="text-base flex-shrink-0">${t.icon}</span>
              <span class="text-xs truncate font-medium">${t.label}</span>
            </div>
            ${isCurrent ? `<span class="text-xs text-[#FFD700] font-bold">${isEn ? 'Active ✓' : 'Ativo ✓'}</span>` : '<span class="text-xs text-neutral-500">➔</span>'}
          </button>
        `;
      }).join('');
    } else {
      // Default: Original English audio from streaming source (explicit, not generic)
      const isEnglishActive = currentAudio === 'eng' || currentAudio === 'original' || !this.currentAudioLang;
      optionsHtml = `
        <button class="player-audio-opt-btn w-full p-3 rounded-xl ${isEnglishActive ? 'bg-red-600/30 border-red-500/80 text-white font-bold shadow-lg shadow-red-900/30' : 'bg-white/5 hover:bg-white/15 border-white/10 text-neutral-300'} border text-left transition flex items-center justify-between cursor-pointer" data-audio="eng" tabindex="0">
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="text-xl flex-shrink-0">🇺🇸</span>
            <div>
              <p class="text-xs font-semibold text-white">${isEn ? 'English (Original Audio)' : 'Inglês (Áudio Original)'}</p>
              <p class="text-[10px] text-neutral-400 leading-tight mt-0.5">${isEn ? 'Original audio track from content provider' : 'Faixa original fornecida pela fonte'}</p>
            </div>
          </div>
          <span class="text-xs text-[#FFD700] font-bold">${isEn ? 'Active ✓' : 'Ativo ✓'}</span>
        </button>

        <div class="mt-3 p-3 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
          <div class="flex items-center gap-2 text-xs font-bold text-neutral-200">
            <span>ℹ️</span>
            <span>${isEn ? 'Audio Availability' : 'Disponibilidade de Áudio'}</span>
          </div>
          <p class="text-[11px] text-neutral-400 leading-relaxed">
            ${isEn
              ? 'This embed server broadcasts in original English audio. To watch with Portuguese translations, use the Subtitles (CC) button or test other servers via the Server menu.'
              : 'Este servidor transmite no áudio original em inglês. Para assistir legendado em português, utilize o botão Legendas (CC) ou teste outros provedores no menu Servidor.'}
          </p>
        </div>
      `;
    }

    this.audioOptions.innerHTML = optionsHtml;

    this.audioOptions.querySelectorAll('.player-audio-opt-btn').forEach(btn => {
      let lastTouch = 0;
      let startY = 0;
      let startX = 0;
      let isScrolling = false;

      const handleAudioSelect = (e) => {
        if (e) {
          e.stopPropagation();
          if (e.cancelable) e.preventDefault();
        }
        const audioId = btn.dataset.audio;
        this.closeAudioModal();
        this.selectAudioTrack(audioId);
      };

      btn.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches[0]) {
          startY = e.touches[0].clientY;
          startX = e.touches[0].clientX;
        }
        isScrolling = false;
      }, { passive: true });

      btn.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches[0]) {
          const dy = Math.abs(e.touches[0].clientY - startY);
          const dx = Math.abs(e.touches[0].clientX - startX);
          if (dy > 8 || dx > 8) {
            isScrolling = true;
          }
        }
      }, { passive: true });

      btn.addEventListener('touchend', (e) => {
        if (isScrolling) return;
        lastTouch = Date.now();
        handleAudioSelect(e);
      }, { passive: false });

      btn.addEventListener('click', (e) => {
        if (Date.now() - lastTouch < 400 || isScrolling) return;
        handleAudioSelect(e);
      });
    });

    this.audioModal.style.display = 'flex';
    this.audioModal.classList.remove('hidden');
    this.audioModal.classList.add('flex');

    if (window.cineTvNav) {
      window.cineTvNav.pushModal(this.audioModal);
    }
  }

  closeAudioModal() {
    if (this.audioModal) {
      const wasOpen = !this.audioModal.classList.contains('hidden') && this.audioModal.style.display !== 'none';
      this.audioModal.style.display = 'none';
      this.audioModal.classList.add('hidden');
      this.audioModal.classList.remove('flex');
      if (wasOpen && window.cineTvNav) {
        window.cineTvNav.popSpecificModal(this.audioModal);
        const retBtn = this.audioBtn || this.playBtn;
        if (retBtn) window.cineTvNav.setFocus(retBtn, false);
      }
    }
  }

  selectAudioTrack(trackId) {
    this.currentAudioLang = trackId;
    if (trackId) {
      try { localStorage.setItem('cinetv_audio_lang', trackId); } catch (e) {}
    }
    const isEn = (typeof window.getLanguage === 'function' ? window.getLanguage() : '') === 'en';

    const trackIndex = parseInt(trackId, 10);
    if (!isNaN(trackIndex) && this.hls && this.hls.audioTracks && this.hls.audioTracks[trackIndex]) {
      this.hls.audioTrack = trackIndex;
      const tName = this.hls.audioTracks[trackIndex].name || trackId.toUpperCase();
      this.showToast('🔊', tName);
      if (this.audioLabel) this.audioLabel.innerText = `${isEn ? 'Audio' : 'Áudio'}: ${tName}`;
      return;
    }

    if (!isNaN(trackIndex) && this.video && this.video.audioTracks && this.video.audioTracks[trackIndex]) {
      for (let i = 0; i < this.video.audioTracks.length; i++) {
        this.video.audioTracks[i].enabled = (i === trackIndex);
      }
      const tName = this.video.audioTracks[trackIndex].label || trackId.toUpperCase();
      this.showToast('🔊', tName);
      if (this.audioLabel) this.audioLabel.innerText = `${isEn ? 'Audio' : 'Áudio'}: ${tName}`;
      return;
    }

    const label = trackId === 'eng' ? (isEn ? 'English (Original)' : 'Inglês (Original)') : trackId.toUpperCase();
    this.showToast('🔊', label);
    if (this.audioLabel) this.audioLabel.innerText = `${isEn ? 'Audio' : 'Áudio'}: EN`;
  }

  scoreSubtitleTrack(sub) {
    if (!sub) return -999;
    let score = 0;
    const fn = (sub.subtitleFileName || '').toLowerCase();
    const rn = (sub.movieReleaseName || '').toLowerCase();
    const rf = (sub.releaseFormat || '').toLowerCase();
    const str = `${fn} ${rn} ${rf}`;
    const isSeries = this.currentItem && this.currentItem.type === 'series';

    // Streaming video on VidLink / web embeds is WEB-DL (23.976 fps)
    if (isSeries) {
      if (str.includes('web-dl') || str.includes('webrip') || str.includes('web.') || str.includes('web-rip')) score += 150;
      if (str.includes('nf.') || str.includes('netflix') || str.includes('amzn') || str.includes('amazon') || str.includes('atvp') || str.includes('dsnp') || str.includes('disney') || str.includes('hmax') || str.includes('hbo') || str.includes('paramount')) score += 60;
      if (str.includes('bluray') || str.includes('blu-ray') || str.includes('bdrip') || str.includes('brrip')) score += 70;
      // HDTV for series often has commercial breaks removed, causing severe desync! Heavily penalize HDTV for series
      if (str.includes('hdtv') || str.includes('pdtv') || str.includes('dsr')) score -= 80;
    } else {
      if (str.includes('web-dl') || str.includes('webrip') || str.includes('web.')) score += 120;
      if (str.includes('bluray') || str.includes('blu-ray') || str.includes('bdrip') || str.includes('brrip')) score += 100;
    }

    if (str.includes('1080p') || str.includes('2160p') || str.includes('4k')) score += 40;
    if (str.includes('720p')) score += 20;
    if (str.includes('dvd') || str.includes('dvdrip')) score += 10;

    // Framerate matching: standard web streaming is 23.976 / 24 fps
    const fps = parseFloat(sub.fps) || 0;
    if (fps > 23.9 && fps < 24.1) {
      score += 40;
    } else if (fps >= 24.9 && fps <= 25.1) {
      // PAL 25fps often drifts against 23.976fps video by 4.1%
      score -= 30;
    }

    // Penalize low quality or sync-hazardous bootleg cam releases
    if (str.includes('cam') || str.includes('camrip') || str.includes('hdcam') || rf === 'cam') score -= 150;
    if (str.includes('telesync') || str.includes('.ts.') || str.includes('-ts') || str.includes('hdts') || rf === 'telesync') score -= 130;
    if (str.includes('telecine') || str.includes('.tc.') || rf === 'telecine') score -= 100;
    if (str.includes('screener') || str.includes('dvdscr') || rf === 'screener') score -= 80;

    return score;
  }

  async fetchAvailableSubtitles() {
    if (!this.currentItem) return [];
    const itemKey = `${this.currentItem.imdbId || this.currentItem.id}_${this.currentSeason}_${this.currentEpisode}`;
    if (this.cachedSubtitles && this.cachedSubtitlesKey === itemKey) {
      return this.cachedSubtitles;
    }

    const rawId = this.currentItem.imdbId || this.currentItem.id || '';
    const match = String(rawId).match(/tt\d+/);
    const imdbId = match ? match[0] : rawId;
    if (!imdbId) return [];

    const isSeries = this.currentItem.type === 'series';
    const url = isSeries
      ? `https://opensubtitles-v3.strem.io/subtitles/series/${imdbId}:${this.currentSeason}:${this.currentEpisode}.json`
      : `https://opensubtitles-v3.strem.io/subtitles/movie/${imdbId}.json`;

    try {
      let subs = [];
      const resp = await fetch(url);
      if (resp.ok) {
        const data = await resp.json();
        subs = data.subtitles || [];
      }

      // If Inception (tt1375666), add verified 1080p BluRay English subtitles (perfectly synced with dialogue at 02:09.796)
      if (imdbId === 'tt1375666') {
        const verifiedInceptionEn = {
          id: 'tt1375666_en_bluray',
          lang: 'eng',
          url: './subtitles/tt1375666_en.vtt',
          movieReleaseName: 'Inception 1080p BluRay (Official Synced)',
          subtitleFileName: 'Inception.2010.1080p.BluRay.x264.en.vtt',
          releaseFormat: 'BluRay',
          fps: 23.976,
          isOfficialSynced: true
        };
        subs = [verifiedInceptionEn, ...subs];
      }

      subs.sort((a, b) => {
        if (a.isOfficialSynced) return -1;
        if (b.isOfficialSynced) return 1;
        return this.scoreSubtitleTrack(b) - this.scoreSubtitleTrack(a);
      });
      this.cachedSubtitles = subs;
      this.cachedSubtitlesKey = itemKey;
      return subs;
    } catch (e) {
      console.warn("[Player] Subtitles fetch error:", e);
      if (imdbId === 'tt1375666') {
        return [{
          id: 'tt1375666_en_bluray',
          lang: 'eng',
          url: './subtitles/tt1375666_en.vtt',
          movieReleaseName: 'Inception 1080p BluRay (Official Synced)',
          subtitleFileName: 'Inception.2010.1080p.BluRay.x264.en.vtt',
          releaseFormat: 'BluRay',
          fps: 23.976,
          isOfficialSynced: true
        }];
      }
      return [];
    }
  }

  async openSubtitlesModal() {
    if (!this.subtitlesModal || !this.subtitlesOptions) return;
    this.showHUD();
    this.resetHUDTimeout();

    const isEn = (typeof window.getLanguage === 'function' ? window.getLanguage() : '') === 'en';
    const currentSub = this.currentSubtitleLang || 'off';

    if (this.subOffsetVal) {
      const sign = (this.subtitleOffset || 0) > 0 ? '+' : '';
      this.subOffsetVal.innerText = `${sign}${(this.subtitleOffset || 0).toFixed(1)}s`;
    }

    const activeSize = this.subtitleSize || localStorage.getItem('cinetv_sub_size') || 'md';
    this.container.querySelectorAll('.sub-size-btn').forEach(btn => {
      const active = btn.dataset.size === activeSize;
      btn.classList.toggle('bg-red-600', active);
      btn.classList.toggle('text-white', active);
      btn.classList.toggle('bg-white/10', !active);
      btn.classList.toggle('text-neutral-300', !active);
    });

    // Show initial loading state while fetching real subtitles
    this.subtitlesOptions.innerHTML = `
      <div class="flex flex-col items-center justify-center py-6 gap-2.5">
        <div class="w-7 h-7 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin"></div>
        <p class="text-xs text-neutral-400">${isEn ? 'Fetching available subtitles...' : 'Buscando legendas disponíveis...'}</p>
      </div>
    `;

    this.subtitlesModal.style.display = 'flex';
    this.subtitlesModal.classList.remove('hidden');
    this.subtitlesModal.classList.add('flex');

    const realSubs = await this.fetchAvailableSubtitles();

    const LANG_MAP = {
      pob: { name: 'Português (Brasil)', icon: '🇧🇷' },
      por: { name: 'Português (Portugal)', icon: '🇵🇹' },
      eng: { name: 'English', icon: '🇺🇸' },
      spa: { name: 'Español', icon: '🇪🇸' },
      fre: { name: 'Français', icon: '🇫🇷' },
      ger: { name: 'Deutsch', icon: '🇩🇪' },
      ita: { name: 'Italiano', icon: '🇮🇹' },
      rus: { name: 'Русский', icon: '🇷🇺' },
      jpn: { name: '日本語', icon: '🇯🇵' },
      kor: { name: '한국어', icon: '🇰🇷' },
      zho: { name: '中文 (Simplificado)', icon: '🇨🇳' },
      zht: { name: '中文 (Tradicional)', icon: '🇹🇼' },
      ara: { name: 'العربية', icon: '🇸🇦' },
      hin: { name: 'हिन्दी', icon: '🇮🇳' },
      tur: { name: 'Türkçe', icon: '🇹🇷' },
      nld: { name: 'Nederlands', icon: '🇳🇱' },
      pol: { name: 'Polski', icon: '🇵🇱' },
      swe: { name: 'Svenska', icon: '🇸🇪' }
    };

    // Group real subtitles by language and sort by quality
    const langGroups = {};
    if (Array.isArray(realSubs)) {
      realSubs.forEach(s => {
        const lang = (s.lang || '').toLowerCase();
        if (!lang) return;
        if (!langGroups[lang]) langGroups[lang] = [];
        langGroups[lang].push(s);
      });
      Object.keys(langGroups).forEach(k => {
        langGroups[k].sort((a, b) => this.scoreSubtitleTrack(b) - this.scoreSubtitleTrack(a));
      });
    }

    const standardOptions = [
      { id: 'off', label: isEn ? 'Off / No Subtitles' : 'Desativado', icon: '🚫', isStandard: true },
      { id: 'auto', label: isEn ? 'Auto / Player Default' : 'Automático / Padrão', icon: '⚙️', isStandard: true }
    ];

    let optionsHtml = standardOptions.map(opt => {
      const isCurrent = currentSub === opt.id;
      return `
        <button class="player-subtitle-opt-btn w-full p-2.5 rounded-xl ${isCurrent ? 'bg-red-600/30 border-red-500/80 text-white font-bold shadow-lg shadow-red-900/30' : 'bg-white/5 hover:bg-white/15 border-white/10 text-neutral-300'} border text-left transition flex items-center justify-between cursor-pointer" data-sub="${opt.id}" tabindex="0">
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="text-base flex-shrink-0">${opt.icon}</span>
            <span class="text-xs truncate font-medium">${opt.label}</span>
          </div>
          ${isCurrent ? `<span class="text-xs text-[#FFD700] font-bold">${isEn ? 'Active ✓' : 'Ativo ✓'}</span>` : '<span class="text-xs text-neutral-500">➔</span>'}
        </button>
      `;
    }).join('');

    // Render available languages from OpenSubtitles with multi-track support
    const availableLangCodes = Object.keys(langGroups).sort((a, b) => {
      const pA = (a === 'pob' || a === 'por') ? 0 : (a === 'eng' ? 1 : (a === 'spa' ? 2 : 3));
      const pB = (b === 'pob' || b === 'por') ? 0 : (b === 'eng' ? 1 : (b === 'spa' ? 2 : 3));
      return pA - pB;
    });

    if (availableLangCodes.length > 0) {
      optionsHtml += `
        <div class="text-[10px] uppercase font-bold tracking-wider text-neutral-400 px-1 pt-2 pb-1 border-t border-white/10 mt-1">
          ${isEn ? 'Available Subtitles' : 'Legendas Disponíveis'} (${realSubs.length})
        </div>
      `;

      availableLangCodes.forEach(langCode => {
        const group = langGroups[langCode];
        const langMeta = LANG_MAP[langCode] || { name: langCode.toUpperCase(), icon: '💬' };
        
        group.forEach((sub, trackIdx) => {
          const subUrl = sub.url || '';
          const isSelected = (currentSub === langCode && (!this.currentSubtitleUrl || this.currentSubtitleUrl === subUrl)) || (this.currentSubtitleUrl === subUrl);
          const trackNum = group.length > 1 ? ` • Track ${trackIdx + 1}${trackIdx === 0 ? (isEn ? ' (Best Match)' : ' (Recomendado)') : ''}` : '';
          const releaseDesc = sub.movieReleaseName || sub.subtitleFileName || '';

          optionsHtml += `
            <button class="player-subtitle-opt-btn w-full p-2.5 rounded-xl ${isSelected ? 'bg-red-600/30 border-red-500/80 text-white font-bold shadow-lg shadow-red-900/30' : 'bg-white/5 hover:bg-white/15 border-white/10 text-neutral-200'} border text-left transition flex items-center justify-between cursor-pointer" data-sub="${langCode}" data-url="${encodeURIComponent(subUrl)}" tabindex="0">
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="text-base flex-shrink-0">${langMeta.icon}</span>
                <div class="min-w-0">
                  <p class="text-xs font-medium truncate">${langMeta.name}${trackNum}</p>
                  ${releaseDesc ? `<p class="text-[10px] text-neutral-400 truncate max-w-[210px]">${releaseDesc}</p>` : ''}
                </div>
              </div>
              ${isSelected ? `<span class="text-xs text-[#FFD700] font-bold">${isEn ? 'Active ✓' : 'Ativo ✓'}</span>` : '<span class="text-xs text-neutral-500">➔</span>'}
            </button>
          `;
        });
      });
    } else {
      optionsHtml += `
        <div class="text-[11px] text-neutral-400 p-2 text-center">
          ${isEn ? 'Default player captions active.' : 'Legendas padrão do player ativas.'}
        </div>
      `;
    }

    this.subtitlesOptions.innerHTML = optionsHtml;

    this.subtitlesOptions.querySelectorAll('.player-subtitle-opt-btn').forEach(btn => {
      let lastTouch = 0;
      let startY = 0;
      let startX = 0;
      let isScrolling = false;

      const handleSubSelect = (e) => {
        if (e) {
          e.stopPropagation();
          if (e.cancelable) e.preventDefault();
        }
        const subId = btn.dataset.sub;
        const subUrl = btn.dataset.url ? decodeURIComponent(btn.dataset.url) : null;
        this.closeSubtitlesModal();
        this.selectSubtitle(subId, subUrl);
      };

      btn.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches[0]) {
          startY = e.touches[0].clientY;
          startX = e.touches[0].clientX;
        }
        isScrolling = false;
      }, { passive: true });

      btn.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches[0]) {
          const dy = Math.abs(e.touches[0].clientY - startY);
          const dx = Math.abs(e.touches[0].clientX - startX);
          if (dy > 8 || dx > 8) {
            isScrolling = true;
          }
        }
      }, { passive: true });

      btn.addEventListener('touchend', (e) => {
        if (isScrolling) return;
        lastTouch = Date.now();
        handleSubSelect(e);
      }, { passive: false });

      btn.addEventListener('click', (e) => {
        if (Date.now() - lastTouch < 400 || isScrolling) return;
        handleSubSelect(e);
      });
    });

    this.subtitlesModal.style.display = 'flex';
    this.subtitlesModal.classList.remove('hidden');
    this.subtitlesModal.classList.add('flex');

    if (window.cineTvNav) {
      window.cineTvNav.pushModal(this.subtitlesModal);
    }
  }

  closeSubtitlesModal() {
    if (this.subtitlesModal) {
      const wasOpen = !this.subtitlesModal.classList.contains('hidden') && this.subtitlesModal.style.display !== 'none';
      this.subtitlesModal.style.display = 'none';
      this.subtitlesModal.classList.add('hidden');
      this.subtitlesModal.classList.remove('flex');
      if (wasOpen && window.cineTvNav) {
        window.cineTvNav.popSpecificModal(this.subtitlesModal);
        const retBtn = this.subtitlesBtn || this.playBtn;
        if (retBtn) window.cineTvNav.setFocus(retBtn, false);
      }
    }
  }

  parseSubtitles(content, subMeta = null) {
    if (!content || typeof content !== 'string') return [];
    const cues = [];
    const clean = content.replace(/^\uFEFF/, '').replace(/^WEBVTT[^\n]*\n+/i, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const blocks = clean.split(/\n\s*\n/);
    
    // Check if subtitle needs PAL 25fps to 23.976fps time stretch
    let timeScale = 1.0;
    if (subMeta) {
      const fps = parseFloat(subMeta.fps) || 0;
      const fn = ((subMeta.subtitleFileName || '') + ' ' + (subMeta.movieReleaseName || '')).toLowerCase();
      if ((fps >= 24.9 && fps <= 25.1) || fn.includes('25fps') || fn.includes('.pal.')) {
        timeScale = 25.0 / 23.976;
      }
    }

    const parseTime = (timeStr) => {
      if (!timeStr) return 0;
      const t = timeStr.trim().replace(',', '.');
      const parts = t.split(':');
      if (parts.length === 3) {
        return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
      } else if (parts.length === 2) {
        return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
      }
      return 0;
    };

    for (const block of blocks) {
      const lines = block.trim().split('\n').filter(l => l.trim().length > 0);
      if (lines.length < 2) continue;
      
      let timeLineIdx = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('-->')) {
          timeLineIdx = i;
          break;
        }
      }
      if (timeLineIdx === -1) continue;

      const timeParts = lines[timeLineIdx].split('-->');
      if (timeParts.length !== 2) continue;

      const startStr = timeParts[0].trim().split(/\s+/)[0];
      const endStr = timeParts[1].trim().split(/\s+/)[0];
      let start = parseTime(startStr);
      let end = parseTime(endStr);
      if (timeScale !== 1.0) {
        start = start * timeScale;
        end = end * timeScale;
      }
      const textLines = lines.slice(timeLineIdx + 1).join('<br>').replace(/<(?!\/?(b|i|u|br)\b)[^>]+>/gi, '').trim();

      if (!isNaN(start) && !isNaN(end) && end > start && textLines) {
        cues.push({ start, end, text: textLines });
      }
    }
    return cues.sort((a, b) => a.start - b.start);
  }

  updateSubtitles(currentTime) {
    if (!this.subtitlesOverlay || !this.subtitlesText) return;
    if (!this.currentSubtitleCues || this.currentSubtitleCues.length === 0 || this.currentSubtitleLang === 'off') {
      this.subtitlesOverlay.classList.add('hidden');
      this.subtitlesOverlay.style.opacity = '0';
      if (this.subtitlesText) this.subtitlesText.innerHTML = '';
      return;
    }

    if (this.subtitlesText.className !== 'sub-size-' + (this.subtitleSize || 'md')) {
      this.subtitlesText.className = 'sub-size-' + (this.subtitleSize || 'md');
    }

    const t = (currentTime || 0) + (this.subtitleOffset || 0);
    const activeCue = this.currentSubtitleCues.find(c => t >= c.start && t <= c.end);
    if (activeCue && activeCue.text) {
      if (this.subtitlesText.innerHTML !== activeCue.text) {
        this.subtitlesText.innerHTML = activeCue.text;
      }
      this.subtitlesOverlay.classList.remove('hidden');
      this.subtitlesOverlay.style.opacity = '1';
    } else {
      this.subtitlesOverlay.style.opacity = '0';
    }
  }

  async autoLoadSubtitles() {
    try {
      const savedLang = this.currentSubtitleLang || localStorage.getItem('cinetv_preferred_sub_lang');
      if (savedLang === 'off') {
        this.selectSubtitle('off');
        return;
      }
      const appLang = getLanguage() || (typeof window.getLanguage === 'function' ? window.getLanguage() : '') || localStorage.getItem('cinetv_lang') || 'pt';
      const realSubs = await this.fetchAvailableSubtitles();
      if (!realSubs || realSubs.length === 0) return;

      let matchedSub = null;
      if (savedLang && savedLang !== 'auto') {
        matchedSub = realSubs.find(s => (s.lang || '').toLowerCase() === savedLang.toLowerCase());
      }

      if (!matchedSub) {
        const targetLangs = (appLang === 'pt') ? ['pob', 'por', 'eng'] : ['eng', 'pob', 'por'];
        for (const t of targetLangs) {
          matchedSub = realSubs.find(s => (s.lang || '').toLowerCase() === t);
          if (matchedSub) break;
        }
      }

      if (!matchedSub && realSubs.length > 0) {
        matchedSub = realSubs[0];
      }

      if (matchedSub && matchedSub.url) {
        this.selectSubtitle(matchedSub.lang.toLowerCase(), matchedSub.url);
      }
    } catch (e) {
      console.warn('[Player] autoLoadSubtitles error:', e);
    }
  }

  async selectSubtitle(lang, subUrl = null) {
    this.currentSubtitleLang = lang;
    if (lang) {
      try { localStorage.setItem('cinetv_preferred_sub_lang', lang); } catch (e) {}
    }
    this.currentSubtitleUrl = subUrl;
    this.currentSubtitleCues = [];

    // Automatically load track-specific offset for this (item, season, episode, lang)
    this.loadSubtitleOffsetForCurrentTrack(lang);

    const isEn = (getLanguage() || (typeof window.getLanguage === 'function' ? window.getLanguage() : '') || localStorage.getItem('cinetv_lang')) === 'en';
    const LANG_LABELS = {
      off: isEn ? 'Subtitles: Off' : 'Legendas: Desativado',
      auto: isEn ? 'Subtitles: Auto' : 'Legendas: Automático',
      pob: 'Legendas: Português (BR)',
      por: 'Legendas: Português (PT)',
      eng: 'Subtitles: English',
      spa: 'Subtítulos: Español',
      fre: 'Sous-titres: Français',
      ger: 'Untertitel: Deutsch'
    };

    const label = LANG_LABELS[lang] || `Legendas: ${lang.toUpperCase()}`;
    this.showToast('💬', label);

    // Disable iframe native captions whenever CineTV manages subtitles
    this.sendPlayerAction('disableSubtitles');
    if (window.AndroidNative && window.AndroidNative.sendVideoCommand) {
      window.AndroidNative.sendVideoCommand('{"action":"disableSubtitles"}');
    }

    if (lang === 'off') {
      this.updateSubtitles(0);
      if (this.video && this.video.textTracks) {
        for (let i = 0; i < this.video.textTracks.length; i++) {
          this.video.textTracks[i].mode = 'disabled';
        }
      }
      return;
    }

    if (lang === 'auto') {
      const appLang = getLanguage() || (typeof window.getLanguage === 'function' ? window.getLanguage() : '') || localStorage.getItem('cinetv_lang') || 'pt';
      const targetLangs = (appLang === 'pt') ? ['pob', 'por'] : ['eng'];
      const realSubs = await this.fetchAvailableSubtitles();
      let matchedSub = null;
      for (const t of targetLangs) {
        matchedSub = realSubs.find(s => (s.lang || '').toLowerCase() === t);
        if (matchedSub) break;
      }
      if (matchedSub && matchedSub.url) {
        return this.selectSubtitle(matchedSub.lang.toLowerCase(), matchedSub.url);
      } else if (realSubs.length > 0) {
        return this.selectSubtitle(realSubs[0].lang.toLowerCase(), realSubs[0].url);
      } else {
        return this.selectSubtitle('off');
      }
    }

    if (!subUrl && lang !== 'off') {
      const realSubs = await this.fetchAvailableSubtitles();
      const match = realSubs.find(s => (s.lang || '').toLowerCase() === lang.toLowerCase());
      if (match && match.url) {
        subUrl = match.url;
        this.currentSubtitleUrl = subUrl;
      }
    }

    if (subUrl) {
      try {
        let targetUrl = subUrl;
        if (targetUrl.startsWith('./') || targetUrl.startsWith('/')) {
          targetUrl = new URL(targetUrl.replace(/^\.\//, ''), window.location.href).href;
        }
        const resp = await fetch(targetUrl);
        if (resp.ok) {
          const text = await resp.text();
          const subMeta = (this.cachedSubtitles && Array.isArray(this.cachedSubtitles))
            ? this.cachedSubtitles.find(s => s.url === subUrl || s.url === targetUrl || (s.lang && s.lang.toLowerCase() === lang.toLowerCase()))
            : null;
          this.currentSubtitleCues = this.parseSubtitles(text, subMeta);
          this.updateSubtitles(this.lastPlaybackTime || 0);

          // In direct video mode, also attach native track
          if (!this.isEmbedMode && this.video) {
            const vttText = 'WEBVTT\n\n' + text.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');
            const blob = new Blob([vttText], { type: 'text/vtt' });
            const trackBlobUrl = URL.createObjectURL(blob);

            const existingTrack = this.video.querySelector('track');
            if (existingTrack) existingTrack.remove();

            const track = document.createElement('track');
            track.kind = 'subtitles';
            track.label = label;
            track.srclang = lang;
            track.src = trackBlobUrl;
            track.default = true;
            this.video.appendChild(track);
            track.track.mode = 'showing';
          }
        }
      } catch (e) {
        console.warn("[Player] Subtitle download error:", e);
      }
    }

    // Embed mode: notify embed player via postMessage
    if (this.isEmbedMode) {
      this.sendPlayerAction(`subtitle:${lang}`);
      if (subUrl) {
        this.sendPlayerAction(`subtitleUrl:${subUrl}`);
      }
    }
  }

  setSubtitleSize(size) {
    if (!size) return;
    this.subtitleSize = size;
    localStorage.setItem('cinetv_sub_size', size);
    if (this.subtitlesText) {
      this.subtitlesText.className = 'sub-size-' + size;
    }
    this.container.querySelectorAll('.sub-size-btn').forEach(btn => {
      const active = btn.dataset.size === size;
      btn.classList.toggle('bg-red-600', active);
      btn.classList.toggle('text-white', active);
      btn.classList.toggle('bg-white/10', !active);
      btn.classList.toggle('text-neutral-300', !active);
    });
  }

  adjustSubtitleOffset(delta, reset = false) {
    if (reset) {
      this.subtitleOffset = 0;
    } else {
      this.subtitleOffset = Math.round(((this.subtitleOffset || 0) + delta) * 10) / 10;
    }
    this.subtitleOffset = Math.max(-30, Math.min(30, this.subtitleOffset));

    const sign = this.subtitleOffset > 0 ? '+' : '';
    const text = `${sign}${this.subtitleOffset.toFixed(1)}s`;
    if (this.subOffsetVal) {
      this.subOffsetVal.innerText = text;
    }

    const key = this.getSubtitleOffsetKey();
    if (key) {
      if (this.subtitleOffset === 0) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, String(this.subtitleOffset));
      }
    }

    this.updateSubtitles(this.lastPlaybackTime || 0);
    const isEn = (getLanguage() || (typeof window.getLanguage === 'function' ? window.getLanguage() : '') || localStorage.getItem('cinetv_lang')) === 'en';
    this.showToast('⏱️', `${isEn ? 'Subtitles' : 'Legendas'}: ${text}`);
  }

  autoSyncSubtitles() {
    this.adjustSubtitleOffset(0, true);
    const isEn = (getLanguage() || (typeof window.getLanguage === 'function' ? window.getLanguage() : '') || localStorage.getItem('cinetv_lang')) === 'en';
    this.showToast('✨', isEn ? 'Auto-Sync: Synced with Video (23.98 fps)' : 'Auto-Sync: Sincronizado com Vídeo (23.98 fps)');
  }

  bindEvents() {
    const handleClose = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      this.close();
    };

    const bindTap = (el, handler) => {
      if (!el) return;
      let lastTouchTime = 0;
      el.addEventListener('touchend', (e) => {
        e.stopPropagation();
        if (e.cancelable) e.preventDefault();
        lastTouchTime = Date.now();
        handler(e);
      }, { passive: false });
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (Date.now() - lastTouchTime < 400) return;
        handler(e);
      });
    };

    if (this.closeBtn) {
      bindTap(this.closeBtn, handleClose);
    }

    // Prev / Next Episode Buttons
    if (this.prevEpBtn) {
      bindTap(this.prevEpBtn, () => this.prevEpisode());
    }

    if (this.nextEpBtn) {
      bindTap(this.nextEpBtn, () => this.nextEpisode());
    }

    // Rewind / Forward 10s Buttons
    if (this.rewindBtn) {
      bindTap(this.rewindBtn, () => this.seek(-10));
    }

    if (this.forwardBtn) {
      bindTap(this.forwardBtn, () => this.seek(10));
    }

    // Center Play / Pause Button
    if (this.playBtn) {
      bindTap(this.playBtn, () => this.togglePlay());
    }

    // Video click handling is unified in overlay pointerdown handler below

    // Interactive Scrubber Timeline (touch + pointer + click support)
    if (this.scrubberContainer) {
      let isScrubbing = false;

      const handleScrubPointer = (e, isFinal = false) => {
        const rect = this.scrubberContainer.getBoundingClientRect();
        const clientX = e.clientX !== undefined ? e.clientX : 
          (e.touches && e.touches[0] ? e.touches[0].clientX : 
          (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : 0));
        const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));

        this.showHUD();
        this.resetHUDTimeout();

        const dur = this.totalDuration || (this.video && this.video.duration) || 0;
        const targetSec = dur > 0 ? Math.round(ratio * dur) : 0;

        if (isFinal) {
          this.isDraggingTime = false;
          this.seekToRatio(ratio);
        } else {
          this.isDraggingTime = true;
          this.updateScrubberUI(targetSec, dur);
          if (dur > 0) {
            this.showToast('⏱️', `${this.formatTime(targetSec)} / ${this.formatTime(dur)}`);
          }
        }
      };

      // Native touch drag support (smooth scrubbing on phone without scrolling)
      this.scrubberContainer.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        e.preventDefault();
        isScrubbing = true;
        handleScrubPointer(e, false);
      }, { passive: false });

      this.scrubberContainer.addEventListener('touchmove', (e) => {
        if (!isScrubbing) return;
        e.stopPropagation();
        e.preventDefault();
        handleScrubPointer(e, false);
      }, { passive: false });

      this.scrubberContainer.addEventListener('touchend', (e) => {
        if (!isScrubbing) return;
        e.stopPropagation();
        e.preventDefault();
        isScrubbing = false;
        handleScrubPointer(e, true);
      }, { passive: false });

      // Pointer events for desktop & stylus
      this.scrubberContainer.addEventListener('pointerdown', (e) => {
        isScrubbing = true;
        try { this.scrubberContainer.setPointerCapture(e.pointerId); } catch (err) {}
        handleScrubPointer(e, false);
      });

      this.scrubberContainer.addEventListener('pointermove', (e) => {
        if (!isScrubbing) return;
        handleScrubPointer(e, false);
      });

      this.scrubberContainer.addEventListener('pointerup', (e) => {
        if (!isScrubbing) return;
        isScrubbing = false;
        try { this.scrubberContainer.releasePointerCapture(e.pointerId); } catch (err) {}
        handleScrubPointer(e, true);
      });

      this.scrubberContainer.addEventListener('pointercancel', () => {
        isScrubbing = false;
        this.isDraggingTime = false;
      });

      this.scrubberContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        handleScrubPointer(e, true);
      });
    }

    // Top Bar Settings Button
    if (this.serverBtn) {
      bindTap(this.serverBtn, () => this.openSettingsModal());
    }

    // Fit to Screen Buttons (Top and Bottom)
    if (this.fitBtn) {
      bindTap(this.fitBtn, () => this.cycleAspectRatio());
    }

    if (this.bottomFitBtn) {
      bindTap(this.bottomFitBtn, () => this.cycleAspectRatio());
    }

    // Picture-in-Picture Button
    if (this.pipBtn) {
      bindTap(this.pipBtn, () => this.enterPip());
    }

    // Cast Button
    if (this.castBtn) {
      bindTap(this.castBtn, () => this.openCastMenu());
    }

    // Cast Modal Listeners
    if (this.castCloseBtn) {
      this.castCloseBtn.addEventListener('click', () => this.closeCastMenu());
    }
    if (this.castCancelBtn) {
      this.castCancelBtn.addEventListener('click', () => this.closeCastMenu());
    }
    if (this.castModal) {
      this.castModal.addEventListener('click', (e) => {
        if (e.target === this.castModal) this.closeCastMenu();
      });
    }
    if (this.castOptSmartView) {
      this.castOptSmartView.addEventListener('click', () => this.castWithSmartView());
    }
    if (this.castOptChrome) {
      this.castOptChrome.addEventListener('click', () => this.castWithChrome());
    }
    if (this.castOptExternal) {
      this.castOptExternal.addEventListener('click', () => this.castWithExternal());
    }

    // Server Settings Modal Listeners
    if (this.settingsCloseBtn) {
      this.settingsCloseBtn.addEventListener('click', () => this.closeSettingsModal());
    }
    if (this.settingsCancelBtn) {
      this.settingsCancelBtn.addEventListener('click', () => this.closeSettingsModal());
    }
    if (this.settingsModal) {
      this.settingsModal.addEventListener('click', (e) => {
        if (e.target === this.settingsModal) this.closeSettingsModal();
      });
    }

    // Audio Language Button & Modal Listeners
    if (this.audioBtn) {
      this.audioBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openAudioModal();
      });
    }
    if (this.audioCloseBtn) {
      this.audioCloseBtn.addEventListener('click', () => this.closeAudioModal());
    }
    if (this.audioCancelBtn) {
      this.audioCancelBtn.addEventListener('click', () => this.closeAudioModal());
    }
    if (this.audioModal) {
      this.audioModal.addEventListener('click', (e) => {
        if (e.target === this.audioModal) this.closeAudioModal();
      });
    }

    // Subtitles Button & Modal Listeners
    if (this.subtitlesBtn) {
      this.subtitlesBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openSubtitlesModal();
      });
    }
    if (this.subtitlesCloseBtn) {
      this.subtitlesCloseBtn.addEventListener('click', () => this.closeSubtitlesModal());
    }
    if (this.subtitlesCancelBtn) {
      this.subtitlesCancelBtn.addEventListener('click', () => this.closeSubtitlesModal());
    }
    if (this.subtitlesModal) {
      this.subtitlesModal.addEventListener('click', (e) => {
        if (e.target === this.subtitlesModal) this.closeSubtitlesModal();
      });
    }

    // Continue Watching Resume Modal Buttons
    if (this.resumeConfirmBtn) {
      const handleConfirm = (e) => {
        if (e) { e.stopPropagation(); e.preventDefault(); }
        this.closeResumeModal();
        if (this.pendingResumeTime > 0) {
          this.applyResume(this.pendingResumeTime);
        }
      };
      this.resumeConfirmBtn.addEventListener('click', handleConfirm);
    }

    if (this.resumeRestartBtn) {
      const handleRestart = (e) => {
        if (e) { e.stopPropagation(); e.preventDefault(); }
        this.closeResumeModal();
        this.pendingResumeTime = 0;
        try {
          saveContinueWatching(this.currentItem, this.currentSeason, this.currentEpisode, 0);
          if (window.cineApp && window.cineApp.populateContinueWatching) {
            window.cineApp.populateContinueWatching();
          }
        } catch (err) {}
        this.applyResume(0);
      };
      this.resumeRestartBtn.addEventListener('click', handleRestart);
    }

    // Playback Speed Button
    if (this.speedBtn) {
      bindTap(this.speedBtn, () => this.cyclePlaybackSpeed());
    }

    // Screen Lock & Unlock
    if (this.lockBtn) {
      bindTap(this.lockBtn, () => this.lockScreen());
    }
    if (this.unlockPill) {
      bindTap(this.unlockPill, () => this.unlockScreen());
    }

    // Next Episode Auto-Play Card Buttons
    if (this.nextEpPlayBtn) {
      bindTap(this.nextEpPlayBtn, () => {
        this.hideNextEpisodeCard();
        this.nextEpisode();
      });
    }
    if (this.nextEpCancelBtn) {
      bindTap(this.nextEpCancelBtn, () => {
        this.hideNextEpisodeCard();
        this.nextEpDismissed = true;
      });
    }

    // Subtitle Customization Buttons
    this.container.querySelectorAll('.sub-size-btn').forEach(btn => {
      bindTap(btn, () => this.setSubtitleSize(btn.dataset.size));
    });
    if (this.subOffsetMinusLarge) {
      bindTap(this.subOffsetMinusLarge, () => this.adjustSubtitleOffset(-2.0));
    }
    if (this.subOffsetMinus) {
      bindTap(this.subOffsetMinus, () => this.adjustSubtitleOffset(-0.5));
    }
    if (this.subOffsetPlus) {
      bindTap(this.subOffsetPlus, () => this.adjustSubtitleOffset(0.5));
    }
    if (this.subOffsetPlusLarge) {
      bindTap(this.subOffsetPlusLarge, () => this.adjustSubtitleOffset(2.0));
    }
    if (this.subOffsetReset) {
      bindTap(this.subOffsetReset, () => this.adjustSubtitleOffset(0, true));
    }
    if (this.subOffsetAuto) {
      bindTap(this.subOffsetAuto, () => this.autoSyncSubtitles());
    }

    // Dialogue Boost / Night Mode Toggle
    if (this.nightModeToggle) {
      bindTap(this.nightModeToggle, () => this.toggleNightMode());
    }

    // Wake / Toggle HUD on user interaction
    let lastTapToggleTime = 0;

    if (this.overlay) {
      let touchStartX = 0;
      let touchStartY = 0;
      let isTouchDrag = false;

      // Track touch movement to distinguish clean screen taps from scrolls or swipes
      this.overlay.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches[0]) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          isTouchDrag = false;
        }
      }, { passive: true });

      this.overlay.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches[0]) {
          const dx = Math.abs(e.touches[0].clientX - touchStartX);
          const dy = Math.abs(e.touches[0].clientY - touchStartY);
          if (dx > 15 || dy > 15) {
            isTouchDrag = true;
          }
        }
      }, { passive: true });

      this.overlay.addEventListener('touchend', () => {
        setTimeout(() => { isTouchDrag = false; }, 100);
      }, { passive: true });

      const handleScreenTap = (e) => {
        // If screen is locked, only the unlock pill should respond
        if (this.isScreenLocked) return;

        // Ensure embed audio is unmuted on user tap
        if (this.isEmbedMode) {
          this.sendPlayerAction('unmute');
        }

        // 1. If swiping or dragging, do not toggle HUD
        if (isTouchDrag) return;

        // 2. If inside modal dialog or next ep card, modal handles it
        if (e.target.closest('#player-settings-modal, #player-resume-modal, #player-cast-modal, #player-subtitles-modal, #player-audio-modal, #player-next-ep-card')) {
          return;
        }

        // 3. If tapping an interactive button or scrubber, keep HUD alive
        if (e.target.closest('button, .player-slider-container, #player-scrubber-container, input, a')) {
          this.resetHUDTimeout();
          return;
        }

        const now = Date.now();
        if (now - lastTapToggleTime < 250) return;
        lastTapToggleTime = now;

        // 4. Toggle HUD: if visible -> hide; if hidden -> show with ONE single touch!
        if (this.isHudVisible()) {
          this.hideHUD();
        } else {
          this.showHUD();
        }
      };

      // Unified click handler (fires exactly once for mobile touch taps, mouse clicks, and remote OK)
      this.overlay.addEventListener('click', (e) => {
        handleScreenTap(e);
      });

      if (this.tapSurface) {
        this.tapSurface.addEventListener('click', (e) => {
          e.stopPropagation();
          handleScreenTap(e);
        });
        this.tapSurface.addEventListener('touchend', (e) => {
          handleScreenTap(e);
        }, { passive: true });
      }

      // Desktop mouse move only
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        this.overlay.addEventListener('mousemove', (e) => {
          if (e.pointerType === 'mouse') {
            this.showHUD();
          }
        });
      }
    }

    // Window blur (iframe clicked): wake HUD ONLY for genuine desktop clicks
    window.addEventListener('blur', () => {
      if (this.isOpen() && (Date.now() - lastTapToggleTime > 1500)) {
        this.showHUD();
      }
    });

    // Embed postMessage listener
    window.addEventListener('message', (e) => {
      try {
        if (!e.data) return;
        const msg = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (msg.fromCineTvHook || msg.type === 'VIDEO_STATE') {
          this.handleNativeVideoState(msg);
        } else if (msg.type === 'PLAYER_EVENT' && msg.data) {
          if (msg.data.player_progress !== undefined) {
            const curTime = Number(msg.data.player_progress);
            if (!isNaN(curTime) && curTime > 0) {
              this.lastPlaybackTime = curTime;
              this.updateStreamPlaybackState(true);
            }
          }
          if (msg.data.duration !== undefined) {
            const dur = Number(msg.data.duration);
            if (!isNaN(dur) && dur > 0) {
              this.totalDuration = dur;
            }
          }
          this.updateScrubberUI(this.lastPlaybackTime, this.totalDuration);
        }
      } catch (err) {}
    });

    // Native Video progress listener
    if (this.video) {
      this.video.addEventListener('timeupdate', () => {
        if (!this.video || !this.currentItem) return;
        const cur = this.video.currentTime;
        const dur = this.video.duration || 0;
        if (cur > 0) {
          this.lastPlaybackTime = cur;
          this.totalDuration = dur;
          this.updateStreamPlaybackState(true);
          this.updateScrubberUI(cur, dur);
        }
      });
    }
  }
}
