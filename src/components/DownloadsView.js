/**
 * DownloadsView Component
 * Dedicated Offline Media Manager dashboard.
 * Displays real-time device storage usage, downloading items with progress,
 * completed offline titles, and one-tap offline playback.
 */
import { downloadManager } from '../services/downloadManager.js';
import { t, getItemTitle } from '../services/i18n.js';

export class DownloadsView {
  constructor(container, { onPlayOffline }) {
    this.container = container;
    this.onPlayOffline = onPlayOffline || (() => {});
    this.initDOM();
    this.bindEvents();

    window.addEventListener('cinetv:downloadUpdated', () => this.render());
    window.addEventListener('cinetv:langChanged', () => {
      this.updateLanguage();
      this.render();
    });
  }

  initDOM() {
    this.container.innerHTML = `
      <div class="space-y-5">
        
        <!-- Storage Usage Banner -->
        <div class="bg-neutral-950/80 border border-white/10 rounded-3xl p-4 md:p-6 shadow-xl backdrop-blur-md space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <span class="text-xl">💾</span>
              <div>
                <h3 id="dl-storage-title" class="text-sm md:text-base font-black text-white">
                  ${t('storageTitle')}
                </h3>
                <p id="dl-storage-sub" class="text-xs text-neutral-400">
                  ${t('storageSubtitle')}
                </p>
              </div>
            </div>

            <div class="text-right font-mono">
              <span id="dl-storage-free" class="text-xs md:text-sm font-bold text-emerald-400">-- GB</span>
              <span id="dl-storage-free-label" class="text-[10px] text-neutral-400 block">${t('storageFree')}</span>
            </div>
          </div>

          <!-- Storage Meter Progress Bar -->
          <div class="w-full bg-neutral-900 rounded-full h-3 overflow-hidden border border-white/10 flex">
            <div id="dl-storage-bar-app" class="bg-gradient-to-r from-red-600 to-red-500 h-full transition-all duration-500" style="width: 15%;"></div>
            <div id="dl-storage-bar-other" class="bg-neutral-700 h-full transition-all duration-500" style="width: 45%;"></div>
          </div>

          <div class="flex items-center justify-between text-[11px] text-neutral-400 pt-0.5">
            <span class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span>
              <span id="dl-storage-app-label">${t('storageApp')}</span>
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-neutral-600 inline-block"></span>
              <span id="dl-storage-other-label">${t('storageOther')}</span>
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              <span id="dl-storage-total">${t('storageTotalPrefix')} 128 GB</span>
            </span>
          </div>
        </div>

        <!-- Downloads List Header -->
        <div class="flex items-center justify-between px-2">
          <h2 id="dl-header-title" class="text-base md:text-xl font-black text-white flex items-center gap-2">
            <span>📥</span>
            <span>${t('downloadsTab')}</span>
            <span id="dl-count-badge" class="ml-1 text-xs font-mono px-2.5 py-0.5 rounded-full bg-red-950/60 border border-red-500/40 text-red-400">
              0
            </span>
          </h2>
          <span id="dl-header-sub" class="text-[11px] text-neutral-400">${t('watchOfflineBadge')}</span>
        </div>

        <!-- Downloads Grid / List -->
        <div id="dl-list-container" class="space-y-3">
          <!-- Dynamically populated download cards -->
        </div>

        <!-- Empty State -->
        <div id="dl-empty-state" class="hidden py-20 text-center space-y-3">
          <div class="w-16 h-16 mx-auto rounded-3xl bg-neutral-900 border border-white/10 flex items-center justify-center text-3xl text-neutral-500">
            📥
          </div>
          <div>
            <h4 id="dl-empty-title" class="text-sm md:text-base font-bold text-neutral-300">
              ${t('noDownloads')}
            </h4>
            <p id="dl-empty-sub" class="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
              ${t('noDownloadsSub')}
            </p>
          </div>
        </div>

      </div>
    `;

    this.storageTitle = this.container.querySelector('#dl-storage-title');
    this.storageSub = this.container.querySelector('#dl-storage-sub');
    this.storageFreeText = this.container.querySelector('#dl-storage-free');
    this.storageFreeLabel = this.container.querySelector('#dl-storage-free-label');
    this.storageTotalText = this.container.querySelector('#dl-storage-total');
    this.storageAppLabel = this.container.querySelector('#dl-storage-app-label');
    this.storageOtherLabel = this.container.querySelector('#dl-storage-other-label');
    this.storageBarApp = this.container.querySelector('#dl-storage-bar-app');
    this.storageBarOther = this.container.querySelector('#dl-storage-bar-other');

    this.headerTitle = this.container.querySelector('#dl-header-title');
    this.headerSub = this.container.querySelector('#dl-header-sub');
    this.countBadge = this.container.querySelector('#dl-count-badge');
    this.listContainer = this.container.querySelector('#dl-list-container');
    this.emptyState = this.container.querySelector('#dl-empty-state');
    this.emptyTitle = this.container.querySelector('#dl-empty-title');
    this.emptySub = this.container.querySelector('#dl-empty-sub');

    this.render();
  }

  bindEvents() {
    // Event delegation on list container
    this.listContainer.addEventListener('click', (e) => {
      const playBtn = e.target.closest('.dl-play-btn');
      if (playBtn) {
        const id = playBtn.dataset.id;
        const item = downloadManager.getDownloads().find(d => d.downloadId === id);
        if (item) {
          this.onPlayOffline(item);
        }
        return;
      }

      const deleteBtn = e.target.closest('.dl-delete-btn');
      if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        if (confirm(t('confirmDeleteDownload'))) {
          downloadManager.deleteDownload(id);
        }
        return;
      }
    });
  }

  render() {
    // 1. Update Storage Info
    const storage = downloadManager.getStorageInfo();
    if (this.storageFreeText) this.storageFreeText.innerText = `${storage.freeGB} GB`;
    if (this.storageTotalText) this.storageTotalText.innerText = `${t('storageTotalPrefix')} ${storage.totalGB} GB`;

    const downloads = downloadManager.getDownloads();
    const downloadedTotalBytes = downloads.reduce((acc, d) => acc + (d.sizeBytes || 0), 0);
    const downloadedGB = downloadedTotalBytes / (1024 * 1024 * 1024);
    const totalGB = parseFloat(storage.totalGB) || 128.0;
    const appPct = Math.min(100, Math.round((downloadedGB / totalGB) * 100));
    const usedOtherPct = Math.max(0, Math.min(100 - appPct, Math.round(((parseFloat(storage.usedGB) - downloadedGB) / totalGB) * 100)));

    if (this.storageBarApp) this.storageBarApp.style.width = `${Math.max(2, appPct)}%`;
    if (this.storageBarOther) this.storageBarOther.style.width = `${Math.max(10, usedOtherPct)}%`;

    // 2. Render Downloads List
    if (!downloads || downloads.length === 0) {
      this.listContainer.innerHTML = '';
      this.emptyState.classList.remove('hidden');
      this.countBadge.innerText = '0';
      return;
    }

    this.emptyState.classList.add('hidden');
    this.countBadge.innerText = String(downloads.length);

    this.listContainer.innerHTML = downloads.map(item => {
      const isComplete = item.status === 'completed';
      const progress = item.progress || 0;

      return `
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 bg-neutral-950/80 border border-white/10 hover:border-white/20 rounded-2xl transition shadow-lg">
          
          <!-- Left: Poster + Info -->
          <div class="flex items-center gap-3 w-full sm:w-auto">
            <img 
              src="${item.poster}" 
              alt="${item.title}" 
              class="w-14 h-20 rounded-xl object-cover border border-white/10 flex-shrink-0"
              onerror="this.src='https://images.metahub.space/poster/medium/tt9218128/img'"
            />
            <div class="flex flex-col min-w-0 flex-1">
              <h4 class="text-xs md:text-sm font-bold text-white truncate">
                ${getItemTitle(item)}
              </h4>
              <div class="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                <span>${item.year}</span>
                <span>•</span>
                <span class="font-mono text-neutral-300 font-bold">${item.size}</span>
                <span>•</span>
                <span class="px-1.5 py-0.2 rounded text-[9px] font-bold ${
                  isComplete 
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40' 
                    : (item.status === 'failed' ? 'bg-red-950/60 text-red-400 border border-red-500/40' : 'bg-amber-950/60 text-amber-400 border border-amber-500/40')
                }">
                  ${isComplete ? `✓ ${t('downloaded')}` : (item.status === 'failed' ? `✕ ${item.error || 'Falha no download'}` : `${t('downloading')} ${progress}%`)}
                </span>
              </div>

              <!-- Progress Bar if in progress -->
              ${(!isComplete && item.status !== 'failed') ? `
                <div class="w-full bg-neutral-800 rounded-full h-1.5 mt-2 overflow-hidden border border-white/10">
                  <div class="bg-red-600 h-full transition-all duration-300" style="width: ${progress}%;"></div>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Right: Action Buttons -->
          <div class="flex items-center gap-2.5 w-full sm:w-auto justify-end pt-1 sm:pt-0">
            ${isComplete ? `
              <button 
                class="dl-play-btn px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs transition shadow-lg shadow-red-900/40 flex items-center gap-1.5 active:scale-95 cursor-pointer"
                data-id="${item.downloadId}"
              >
                <span>▶</span>
                <span>${t('playOffline')}</span>
              </button>
            ` : ''}

            <button 
              class="dl-delete-btn w-9 h-9 rounded-xl bg-white/5 hover:bg-red-950/60 border border-white/10 hover:border-red-500 text-neutral-400 hover:text-red-400 flex items-center justify-center text-sm transition active:scale-90 cursor-pointer" 
              data-id="${item.downloadId}"
              title="${t('deleteDownload')}"
            >
              🗑️
            </button>
          </div>

        </div>
      `;
    }).join('');
  }

  updateLanguage() {
    if (this.storageTitle) this.storageTitle.innerText = t('storageTitle');
    if (this.storageSub) this.storageSub.innerText = t('storageSubtitle');
    if (this.storageFreeLabel) this.storageFreeLabel.innerText = t('storageFree');
    if (this.storageAppLabel) this.storageAppLabel.innerText = t('storageApp');
    if (this.storageOtherLabel) this.storageOtherLabel.innerText = t('storageOther');
    if (this.headerTitle) {
      const span = this.headerTitle.querySelector('span:nth-child(2)');
      if (span) span.innerText = t('downloadsTab');
    }
    if (this.headerSub) this.headerSub.innerText = t('watchOfflineBadge');
    if (this.emptyTitle) this.emptyTitle.innerText = t('noDownloads');
    if (this.emptySub) this.emptySub.innerText = t('noDownloadsSub');
  }
}
