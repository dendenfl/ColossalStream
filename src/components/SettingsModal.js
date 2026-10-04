import { getLanguage, setLanguage, t } from '../services/i18n.js';
import { supabaseService } from '../services/supabase.js';
import { copyDiagnosticReport, getDiagnosticReport } from '../services/logger.js';

export class SettingsModal {
  constructor(container, onLanguageChange) {
    this.container = container;
    this.onLanguageChange = onLanguageChange;
    this.initDOM();
    this.bindEvents();
    window.cineSettingsInstance = this;
  }

  isOpen() {
    return this.overlay && !this.overlay.classList.contains('hidden');
  }

  initDOM() {
    this.container.innerHTML = `
      <div id="settings-overlay" class="fixed inset-0 bg-black/80 z-50 hidden items-center justify-center p-4 backdrop-blur-md transition-opacity duration-200">
        <div class="relative w-full max-w-md max-h-[92vh] overflow-y-auto bg-neutral-900 border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
          
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <div class="flex items-center gap-2">
              <span class="text-xl">⚙️</span>
              <h2 id="settings-title-text" class="text-base md:text-lg font-black text-white">${t('settingsTitle')}</h2>
            </div>
            <button id="settings-close-btn" class="w-8 h-8 rounded-full bg-white/10 hover:bg-red-600 text-white flex items-center justify-center text-sm font-bold transition cursor-pointer">
              ✕
            </button>
          </div>

          <div class="space-y-2">
            <label id="settings-lang-label" class="block text-xs font-bold text-neutral-400 uppercase tracking-wider">
              ${t('languageLabel')}
            </label>
            <div class="grid grid-cols-2 gap-3">
              <button id="btn-lang-en" class="lang-pill p-3.5 rounded-2xl border text-center font-bold text-sm transition flex flex-col items-center gap-1 cursor-pointer">
                <span class="text-2xl">🇬🇧</span>
                <span>English</span>
                <span class="lang-status h-4 flex items-center justify-center"></span>
              </button>
              <button id="btn-lang-pt" class="lang-pill p-3.5 rounded-2xl border text-center font-bold text-sm transition flex flex-col items-center gap-1 cursor-pointer">
                <span class="text-2xl">🇧🇷</span>
                <span>Português</span>
                <span class="lang-status h-4 flex items-center justify-center"></span>
              </button>
            </div>
          </div>

          <!-- Diagnostics & Telemetry Section -->
          <div id="settings-diag-section" class="p-4 rounded-2xl bg-neutral-800/80 border border-white/10 space-y-2.5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <span class="text-2xl">📋</span>
                <div>
                  <h3 id="settings-diag-title" class="text-xs md:text-sm font-bold text-white">${t('diagTitle')}</h3>
                  <p id="settings-diag-subtitle" class="text-[10px] text-neutral-400">${t('diagSubtitle')}</p>
                </div>
              </div>
              <span id="settings-diag-badge" class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">${t('diagReady')}</span>
            </div>

            <p id="settings-diag-desc" class="text-[11px] text-neutral-300 leading-snug">
              ${t('diagDesc')}
            </p>

            <div class="pt-1 flex items-center gap-2">
              <button 
                id="btn-copy-diag-logs" 
                class="flex-1 py-2.5 px-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>📋</span>
                <span id="btn-copy-diag-logs-text">${t('diagCopyBtn')}</span>
              </button>
              <button 
                id="btn-view-diag-logs" 
                class="py-2.5 px-3 bg-white/10 hover:bg-white/20 text-neutral-300 font-bold text-xs rounded-xl border border-white/10 transition active:scale-95 flex items-center justify-center gap-1 cursor-pointer flex-shrink-0"
                title="Visualizar logs"
              >
                <span>👁️</span>
                <span id="btn-view-diag-logs-text">${t('diagViewBtn')}</span>
              </button>
            </div>
            <div id="diag-copy-feedback" class="hidden text-[11px] text-emerald-400 font-bold flex items-center gap-1">
              <span>✓</span> <span>${t('diagCopiedFeedback')}</span>
            </div>
          </div>

          <!-- Cloud Sync & Supabase Account (Moved inside Settings) -->
          <div id="settings-cloud-section" class="p-4 rounded-2xl bg-neutral-800/80 border border-white/10 space-y-2.5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <span class="text-2xl">☁️</span>
                <div>
                  <h3 id="settings-cloud-title" class="text-xs md:text-sm font-bold text-white">${t('cloudSyncSectionTitle')}</h3>
                  <p id="settings-cloud-subtitle" class="text-[10px] text-neutral-400">${t('cloudSyncSectionSubtitle')}</p>
                </div>
              </div>
              <span id="settings-cloud-badge" class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-neutral-300">${t('cloudOffline')}</span>
            </div>

            <p id="settings-cloud-desc" class="text-[11px] text-neutral-300 leading-snug">
              ${t('cloudSyncSectionDesc')}
            </p>

            <div class="pt-1 flex items-center justify-between gap-2">
              <span id="settings-cloud-user-email" class="text-[11px] font-mono text-neutral-400 truncate max-w-[170px]"></span>
              <button 
                id="settings-cloud-action-btn" 
                class="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg transition active:scale-95 cursor-pointer flex-shrink-0"
              >
                ${t('cloudSignInAction')}
              </button>
            </div>
          </div>

          <!-- Cine7 AI Recommendation -->
          <div class="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/20 space-y-1">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-purple-300 flex items-center gap-1">
                <span>✨</span> Cine7 AI
              </span>
              <a 
                href="https://play.google.com/store/apps/details?id=com.cine7.mobile" 
                target="_blank" 
                rel="noopener noreferrer"
                class="text-[11px] font-bold text-white bg-purple-600 hover:bg-purple-500 px-2.5 py-1 rounded-lg shadow transition active:scale-95"
              >
                Google Play ➔
              </a>
            </div>
            <p id="settings-cine7-desc" class="text-[11px] text-neutral-400 leading-snug">
              ${t('cine7BannerTitle')} ${t('cine7BannerDesc')}
            </p>
          </div>

          <div class="pt-2 border-t border-white/10 flex justify-end">
            <button id="settings-save-btn" class="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl shadow transition active:scale-95 cursor-pointer">
              ${t('close')}
            </button>
          </div>

        </div>

        <!-- Standalone Logs Viewer Dialog -->
        <div id="diag-logs-viewer-modal" class="fixed inset-0 bg-black/90 z-50 hidden items-center justify-center p-4">
          <div class="relative w-full max-w-lg bg-neutral-900 border border-white/20 rounded-2xl p-5 shadow-2xl flex flex-col gap-3 max-h-[85vh]">
            <div class="flex items-center justify-between border-b border-white/10 pb-2">
              <div class="flex items-center gap-2">
                <span>📋</span>
                <h3 id="diag-viewer-title" class="text-sm font-bold text-white">${t('diagModalTitle')}</h3>
              </div>
              <button id="diag-viewer-close-btn" class="text-white hover:text-red-500 text-sm font-bold p-1 cursor-pointer">✕</button>
            </div>
            <textarea id="diag-logs-textarea" readonly class="w-full flex-1 min-h-[260px] bg-black/80 font-mono text-[10px] text-emerald-400 p-3 rounded-xl border border-white/10 select-all outline-none resize-none overflow-y-auto"></textarea>
            <div class="flex items-center justify-between pt-1">
              <span id="diag-viewer-hint" class="text-[10px] text-neutral-400">${t('diagSelectAllHint')}</span>
              <div class="flex gap-2">
                <button id="diag-viewer-copy-btn" class="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl cursor-pointer">${t('diagCopyAll')}</button>
                <button id="diag-viewer-close-btn-bottom" class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl cursor-pointer">${t('diagClose')}</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    `;

    this.overlay = this.container.querySelector('#settings-overlay');
    this.closeBtn = this.container.querySelector('#settings-close-btn');
    this.saveBtn = this.container.querySelector('#settings-save-btn');
    this.btnEn = this.container.querySelector('#btn-lang-en');
    this.btnPt = this.container.querySelector('#btn-lang-pt');
    this.titleText = this.container.querySelector('#settings-title-text');
    this.langLabel = this.container.querySelector('#settings-lang-label');
    this.cine7Desc = this.container.querySelector('#settings-cine7-desc');

    // Cloud section elements
    this.cloudTitle = this.container.querySelector('#settings-cloud-title');
    this.cloudSubtitle = this.container.querySelector('#settings-cloud-subtitle');
    this.cloudBadge = this.container.querySelector('#settings-cloud-badge');
    this.cloudDesc = this.container.querySelector('#settings-cloud-desc');
    this.cloudUserEmail = this.container.querySelector('#settings-cloud-user-email');
    this.cloudActionBtn = this.container.querySelector('#settings-cloud-action-btn');

    this.updateTexts();
    this.updateCloudStatus();

    window.addEventListener('cinetv:langChanged', () => {
      this.updateTexts();
      this.updateCloudStatus();
    });

    window.addEventListener('cinetv:authChanged', () => {
      this.updateCloudStatus();
    });
    window.addEventListener('cinetv:syncStatus', () => {
      this.updateCloudStatus();
    });
  }

  updatePills() {
    const current = getLanguage();
    const isEn = current === 'en';

    const enStatus = this.btnEn?.querySelector('.lang-status');
    const ptStatus = this.btnPt?.querySelector('.lang-status');

    if (isEn) {
      this.btnEn.className = 'lang-pill p-3.5 rounded-2xl border-2 border-red-500 bg-red-600/25 text-white shadow-lg shadow-red-900/40 text-center font-bold text-sm transition flex flex-col items-center gap-1 cursor-pointer';
      this.btnPt.className = 'lang-pill p-3.5 rounded-2xl border border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white text-center font-bold text-sm transition flex flex-col items-center gap-1 cursor-pointer';
      if (enStatus) enStatus.innerHTML = '<span class="text-[10px] text-red-400 font-bold tracking-wide">✓ Active</span>';
      if (ptStatus) ptStatus.innerHTML = '';
      this.btnPt.classList.remove('tv-focused');
      this.btnPt.blur();
    } else {
      this.btnEn.className = 'lang-pill p-3.5 rounded-2xl border border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white text-center font-bold text-sm transition flex flex-col items-center gap-1 cursor-pointer';
      this.btnPt.className = 'lang-pill p-3.5 rounded-2xl border-2 border-red-500 bg-red-600/25 text-white shadow-lg shadow-red-900/40 text-center font-bold text-sm transition flex flex-col items-center gap-1 cursor-pointer';
      if (enStatus) enStatus.innerHTML = '';
      if (ptStatus) ptStatus.innerHTML = '<span class="text-[10px] text-red-400 font-bold tracking-wide">✓ Ativo</span>';
      this.btnEn.classList.remove('tv-focused');
      this.btnEn.blur();
    }
  }

  updateTexts() {
    this.updatePills();
    if (this.titleText) this.titleText.innerText = t('settingsTitle');
    if (this.langLabel) this.langLabel.innerText = t('languageLabel');
    if (this.cine7Desc) this.cine7Desc.innerText = `${t('cine7BannerTitle')} ${t('cine7BannerDesc')}`;
    if (this.saveBtn) this.saveBtn.innerText = t('close');
    this.updateCloudStatus();
    this.updateDiagTexts();
  }

  updateDiagTexts() {
    const diagTitle = this.container.querySelector('#settings-diag-title');
    const diagSubtitle = this.container.querySelector('#settings-diag-subtitle');
    const diagBadge = this.container.querySelector('#settings-diag-badge');
    const diagDesc = this.container.querySelector('#settings-diag-desc');
    const copyText = this.container.querySelector('#btn-copy-diag-logs-text');
    const viewText = this.container.querySelector('#btn-view-diag-logs-text');

    if (diagTitle) diagTitle.innerText = t('diagTitle');
    if (diagSubtitle) diagSubtitle.innerText = t('diagSubtitle');
    if (diagBadge) diagBadge.innerText = t('diagReady');
    if (diagDesc) diagDesc.innerText = t('diagDesc');
    if (copyText) copyText.innerText = t('diagCopyBtn');
    if (viewText) viewText.innerText = t('diagViewBtn');

    const viewerTitle = this.container.querySelector('#diag-viewer-title');
    const viewerHint = this.container.querySelector('#diag-viewer-hint');
    const viewerCopyBtn = this.container.querySelector('#diag-viewer-copy-btn');
    const viewerCloseBtnBottom = this.container.querySelector('#diag-viewer-close-btn-bottom');

    if (viewerTitle) viewerTitle.innerText = t('diagModalTitle');
    if (viewerHint) viewerHint.innerText = t('diagSelectAllHint');
    if (viewerCopyBtn) viewerCopyBtn.innerText = t('diagCopyAll');
    if (viewerCloseBtnBottom) viewerCloseBtnBottom.innerText = t('diagClose');
  }

  updateCloudStatus() {
    const isLogged = supabaseService.isLoggedIn();
    const user = supabaseService.getUser();

    if (this.cloudTitle) {
      this.cloudTitle.innerText = t('cloudSyncSectionTitle');
    }
    if (this.cloudSubtitle) {
      this.cloudSubtitle.innerText = t('cloudSyncSectionSubtitle');
    }
    if (this.cloudDesc) {
      this.cloudDesc.innerText = t('cloudSyncSectionDesc');
    }

    if (isLogged) {
      if (this.cloudBadge) {
        this.cloudBadge.className = 'text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
        this.cloudBadge.innerText = t('cloudConnected');
      }
      if (this.cloudUserEmail) {
        this.cloudUserEmail.innerText = user?.email || t('cloudConnected');
      }
      if (this.cloudActionBtn) {
        this.cloudActionBtn.innerText = t('cloudManageAccount');
        this.cloudActionBtn.className = 'px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition active:scale-95 cursor-pointer flex-shrink-0';
      }
    } else {
      if (this.cloudBadge) {
        this.cloudBadge.className = 'text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-neutral-400';
        this.cloudBadge.innerText = t('cloudOffline');
      }
      if (this.cloudUserEmail) {
        this.cloudUserEmail.innerText = '';
      }
      if (this.cloudActionBtn) {
        this.cloudActionBtn.innerText = t('cloudSignInAction');
        this.cloudActionBtn.className = 'px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg transition active:scale-95 cursor-pointer flex-shrink-0';
      }
    }
  }

  show() {
    this.updateTexts();
    this.overlay.classList.remove('hidden');
    this.overlay.classList.add('flex');
    document.body.classList.add('modal-open');
    const current = getLanguage();
    const activeSelector = current === 'en' ? '#btn-lang-en' : '#btn-lang-pt';
    if (window.cineTvNav) {
      window.cineTvNav.pushModal(this.overlay, activeSelector);
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

  bindEvents() {
    this.closeBtn.addEventListener('click', () => this.close());
    this.saveBtn.addEventListener('click', () => this.close());

    // Diagnostic logs handlers
    const copyBtn = this.container.querySelector('#btn-copy-diag-logs');
    const copyText = this.container.querySelector('#btn-copy-diag-logs-text');
    const viewBtn = this.container.querySelector('#btn-view-diag-logs');
    const feedback = this.container.querySelector('#diag-copy-feedback');
    const viewerModal = this.container.querySelector('#diag-logs-viewer-modal');
    const viewerTextarea = this.container.querySelector('#diag-logs-textarea');
    const viewerCloseBtn = this.container.querySelector('#diag-viewer-close-btn');
    const viewerCloseBtnBottom = this.container.querySelector('#diag-viewer-close-btn-bottom');
    const viewerCopyBtn = this.container.querySelector('#diag-viewer-copy-btn');

    if (copyBtn) {
      copyBtn.addEventListener('click', async (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        const res = await copyDiagnosticReport();
        if (feedback) {
          feedback.classList.remove('hidden');
          feedback.innerHTML = `<span>✓</span> <span>${t('diagCopiedFeedback')}</span>`;
          setTimeout(() => {
            if (feedback) feedback.classList.add('hidden');
          }, 5000);
        }
        if (copyText) {
          copyText.innerText = t('diagCopiedBtn');
          setTimeout(() => {
            if (copyText) copyText.innerText = t('diagCopyBtn');
          }, 2500);
        }
        if (!res.success && viewerModal && viewerTextarea) {
          viewerTextarea.value = res.text;
          viewerModal.classList.remove('hidden');
          viewerModal.classList.add('flex');
        }
      });
    }

    if (viewBtn) {
      viewBtn.addEventListener('click', (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        const report = getDiagnosticReport();
        if (viewerModal && viewerTextarea) {
          viewerTextarea.value = report;
          viewerModal.classList.remove('hidden');
          viewerModal.classList.add('flex');
          viewerTextarea.focus();
          viewerTextarea.select();
        }
      });
    }

    if (viewerCloseBtn) {
      viewerCloseBtn.addEventListener('click', () => {
        if (viewerModal) {
          viewerModal.classList.add('hidden');
          viewerModal.classList.remove('flex');
        }
      });
    }

    if (viewerCloseBtnBottom) {
      viewerCloseBtnBottom.addEventListener('click', () => {
        if (viewerModal) {
          viewerModal.classList.add('hidden');
          viewerModal.classList.remove('flex');
        }
      });
    }

    if (viewerCopyBtn) {
      viewerCopyBtn.addEventListener('click', async () => {
        await copyDiagnosticReport();
        viewerCopyBtn.innerText = t('diagCopiedBtn');
        setTimeout(() => {
          if (viewerCopyBtn) viewerCopyBtn.innerText = t('diagCopyAll');
        }, 2000);
      });
    }

    if (this.cloudActionBtn) {
      this.cloudActionBtn.addEventListener('click', (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        this.close();
        const auth = window.cineAuthModal || (window.cineApp && window.cineApp.authModal);
        if (auth) {
          setTimeout(() => auth.show(), 80);
        }
      });
    }

    this.btnEn.addEventListener('click', () => {
      setLanguage('en');
      this.updateTexts();
      if (window.cineTvNav) {
        window.cineTvNav.setFocus(this.btnEn);
      }
      this.btnPt.classList.remove('tv-focused');
      this.btnPt.blur();
      if (this.onLanguageChange) this.onLanguageChange('en');
    });

    this.btnPt.addEventListener('click', () => {
      setLanguage('pt');
      this.updateTexts();
      if (window.cineTvNav) {
        window.cineTvNav.setFocus(this.btnPt);
      }
      this.btnEn.classList.remove('tv-focused');
      this.btnEn.blur();
      if (this.onLanguageChange) this.onLanguageChange('pt');
    });

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });
  }
}
