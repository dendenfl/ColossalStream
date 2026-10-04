/**
 * ProfileModal Component
 * Netflix-style "Quem está assistindo?" profile picker, manager, and Kids PIN gateway.
 */
import { profileService, AVATAR_OPTIONS } from '../services/profiles.js';
import { t } from '../services/i18n.js';

export class ProfileModal {
  constructor(container, onProfileChanged) {
    this.container = container;
    this.onProfileChanged = onProfileChanged || (() => {});
    this.isManaging = false;
    this.targetProfileToSwitch = null;
    this.initDOM();
    this.bindEvents();

    window.addEventListener('cinetv:profilesUpdated', () => this.renderProfiles());
    window.addEventListener('cinetv:profileChanged', (e) => {
      this.renderProfiles();
      this.onProfileChanged(e.detail?.profile);
    });
    window.addEventListener('cinetv:langChanged', () => this.updateLanguage());
  }

  isOpen() {
    return this.overlay && !this.overlay.classList.contains('hidden');
  }

  initDOM() {
    this.container.innerHTML = `
      <div id="profile-overlay" class="fixed inset-0 bg-black/95 z-50 hidden flex-col items-center justify-center select-none overflow-y-auto px-4 py-8 backdrop-blur-lg">
        
        <!-- Main Profile Picker View -->
        <div id="profile-picker-view" class="w-full max-w-2xl flex flex-col items-center text-center gap-8">
          <div>
            <h1 id="profile-picker-title" class="text-2xl md:text-4xl font-black text-white tracking-wide">
              ${t('whoIsWatching')}
            </h1>
            <p id="profile-picker-subtitle" class="text-xs md:text-sm text-neutral-400 mt-1">
              ColossalStream • ${t('customProfilesSubtitle')}
            </p>
          </div>

          <!-- Profiles Grid -->
          <div id="profile-grid" class="flex flex-wrap items-center justify-center gap-5 md:gap-8 max-w-xl">
            <!-- Dynamically populated profile cards -->
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-4 pt-4">
            <button id="profile-manage-btn" class="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-neutral-300 hover:text-white text-xs md:text-sm font-bold transition active:scale-95 cursor-pointer">
              ${t('manageProfiles')}
            </button>
            <button id="profile-close-btn" class="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-neutral-300 hover:text-white text-xs md:text-sm font-bold transition active:scale-95 cursor-pointer">
              ${t('close')}
            </button>
          </div>
        </div>

        <!-- Sub-Modal 1: PIN Verification Modal (for exiting Kids mode) -->
        <div id="profile-pin-view" class="hidden w-full max-w-sm bg-neutral-950 border border-white/20 rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-5">
          <div class="w-14 h-14 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-2xl">
            🔒
          </div>
          <div>
            <h3 id="profile-pin-title" class="text-base md:text-lg font-black text-white">
              ${t('enterPin')}
            </h3>
            <p id="profile-pin-hint" class="text-xs text-neutral-400 mt-1">${t('defaultPinHint')}</p>
          </div>

          <!-- PIN Input -->
          <input 
            type="password" 
            id="profile-pin-input" 
            maxlength="4" 
            inputmode="numeric" 
            pattern="[0-9]*" 
            placeholder="••••" 
            class="w-36 text-center text-3xl tracking-widest font-mono py-2 bg-neutral-900 border border-white/30 focus:border-red-500 rounded-2xl text-white outline-none" 
          />
          <p id="profile-pin-error" class="text-xs text-red-500 font-bold hidden">${t('wrongPin')}</p>

          <div class="flex items-center gap-3 w-full pt-2">
            <button id="profile-pin-cancel-btn" class="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition cursor-pointer">
              ${t('cancel')}
            </button>
            <button id="profile-pin-confirm-btn" class="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition shadow-lg shadow-red-900/40 cursor-pointer">
              ${t('confirmBtn')}
            </button>
          </div>
        </div>

        <!-- Sub-Modal 2: Add / Edit Profile View -->
        <div id="profile-edit-view" class="hidden w-full max-w-md bg-neutral-950 border border-white/20 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <div class="flex items-center gap-2">
              <span class="text-xl">✏️</span>
              <h3 id="profile-edit-title" class="text-base md:text-lg font-black text-white">
                ${t('editProfile')}
              </h3>
            </div>
            <button id="profile-edit-close-btn" class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white flex items-center justify-center font-bold text-sm cursor-pointer transition">
              ✕
            </button>
          </div>

          <!-- Big Live Avatar Preview -->
          <div class="flex flex-col items-center gap-1.5 py-1">
            <div id="profile-edit-avatar-preview" class="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-neutral-900 border-2 border-red-500 flex items-center justify-center text-4xl md:text-5xl shadow-[0_0_25px_rgba(220,38,38,0.5)] transition-all">
              🦁
            </div>
            <p id="profile-avatar-hint" class="text-[11px] text-neutral-400">${t('tapAvatarToChange')}</p>
          </div>

          <!-- Name Input -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
              <span>👤</span>
              <span>${t('profileName')}</span>
            </label>
            <input 
              type="text" 
              id="profile-name-input" 
              maxlength="20" 
              placeholder="${t('profileNamePlaceholder')}" 
              class="w-full px-4 py-2.5 bg-neutral-900 border border-white/20 focus:border-red-500 rounded-xl text-white text-sm outline-none transition" 
            />
          </div>

          <!-- Avatar Grid Picker -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
              <span>🎨</span>
              <span>${t('chooseAvatar')}</span>
            </label>
            <div id="profile-avatar-picker" class="grid grid-cols-5 sm:grid-cols-10 gap-2 max-h-40 overflow-y-auto p-2 bg-neutral-900/70 rounded-2xl border border-white/10">
              ${AVATAR_OPTIONS.map(a => `
                <button type="button" class="avatar-opt-btn w-10 h-10 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-white/15 hover:border-red-500 flex items-center justify-center text-xl transition active:scale-90 cursor-pointer" data-avatar="${a.icon}" title="${a.name}">
                  ${a.icon}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Kids Mode Checkbox Toggle -->
          <label class="flex items-center gap-3 p-3 rounded-2xl bg-neutral-900/80 border border-white/10 cursor-pointer select-none hover:border-white/20 transition">
            <input type="checkbox" id="profile-kids-toggle" class="w-4 h-4 accent-red-600 rounded cursor-pointer" />
            <div class="flex flex-col">
              <span class="text-xs font-bold text-white flex items-center gap-1.5">
                <span>${t('kidsMode')}</span>
                <span class="px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-600 text-white">KIDS</span>
              </span>
              <span class="text-[10px] text-neutral-400">${t('kidsDescription')}</span>
            </div>
          </label>

          <!-- Buttons -->
          <div class="flex items-center gap-2.5 pt-1">
            <button id="profile-edit-delete-btn" class="hidden py-2.5 px-3.5 rounded-xl bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/40 font-bold text-xs transition cursor-pointer active:scale-95 flex items-center gap-1" title="Excluir Perfil">
              <span>🗑️</span>
            </button>
            <button id="profile-edit-cancel-btn" class="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition cursor-pointer active:scale-95">
              ${t('cancel')}
            </button>
            <button id="profile-edit-save-btn" class="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition shadow-lg shadow-red-900/40 cursor-pointer active:scale-95">
              ${t('saveProfile')}
            </button>
          </div>
        </div>

      </div>
    `;

    this.overlay = this.container.querySelector('#profile-overlay');
    this.pickerView = this.container.querySelector('#profile-picker-view');
    this.pinView = this.container.querySelector('#profile-pin-view');
    this.editView = this.container.querySelector('#profile-edit-view');

    this.profileGrid = this.container.querySelector('#profile-grid');
    this.manageBtn = this.container.querySelector('#profile-manage-btn');
    this.closeBtn = this.container.querySelector('#profile-close-btn');

    this.pinInput = this.container.querySelector('#profile-pin-input');
    this.pinError = this.container.querySelector('#profile-pin-error');
    this.pinConfirmBtn = this.container.querySelector('#profile-pin-confirm-btn');
    this.pinCancelBtn = this.container.querySelector('#profile-pin-cancel-btn');

    this.editTitle = this.container.querySelector('#profile-edit-title');
    this.avatarPreview = this.container.querySelector('#profile-edit-avatar-preview');
    this.nameInput = this.container.querySelector('#profile-name-input');
    this.kidsToggle = this.container.querySelector('#profile-kids-toggle');
    this.editDeleteBtn = this.container.querySelector('#profile-edit-delete-btn');
    this.editSaveBtn = this.container.querySelector('#profile-edit-save-btn');
    this.editCancelBtn = this.container.querySelector('#profile-edit-cancel-btn');
    this.editCloseBtn = this.container.querySelector('#profile-edit-close-btn');
    this.avatarPicker = this.container.querySelector('#profile-avatar-picker');

    this.selectedAvatar = '🦁';
    this.editingProfileId = null;
  }

  bindEvents() {
    this.closeBtn.addEventListener('click', () => this.close());
    this.manageBtn.addEventListener('click', () => {
      this.isManaging = !this.isManaging;
      this.manageBtn.innerText = this.isManaging ? t('done') : t('manageProfiles');
      this.manageBtn.className = this.isManaging
        ? 'px-5 py-2 rounded-full bg-red-600 text-white text-xs md:text-sm font-bold transition active:scale-95 cursor-pointer shadow-lg shadow-red-900/50'
        : 'px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-neutral-300 hover:text-white text-xs md:text-sm font-bold transition active:scale-95 cursor-pointer';
      this.renderProfiles();
    });

    // PIN Handlers
    this.pinCancelBtn.addEventListener('click', () => this.showPickerView());
    this.pinConfirmBtn.addEventListener('click', () => this.verifyAndSwitch());
    this.pinInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.verifyAndSwitch();
    });

    // Edit/Add Handlers
    this.editCloseBtn.addEventListener('click', () => this.showPickerView());
    this.editCancelBtn.addEventListener('click', () => this.showPickerView());
    this.editSaveBtn.addEventListener('click', () => this.saveProfileData());

    if (this.editDeleteBtn) {
      this.editDeleteBtn.addEventListener('click', () => {
        if (!this.editingProfileId) return;
        if (confirm(t('confirmDeleteProfile'))) {
          profileService.deleteProfile(this.editingProfileId);
          this.showPickerView();
          this.renderProfiles();
        }
      });
    }

    // Avatar selector clicks
    this.avatarPicker.querySelectorAll('.avatar-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectAvatar(btn.dataset.avatar);
      });
    });
  }

  selectAvatar(icon) {
    this.selectedAvatar = icon;
    if (this.avatarPreview) {
      this.avatarPreview.innerText = icon;
    }
    this.avatarPicker.querySelectorAll('.avatar-opt-btn').forEach(btn => {
      if (btn.dataset.avatar === icon) {
        btn.classList.add('border-red-500', 'bg-red-950/70', 'scale-110', 'shadow-[0_0_12px_rgba(220,38,38,0.7)]');
        btn.classList.remove('border-white/15', 'bg-neutral-900');
      } else {
        btn.classList.remove('border-red-500', 'bg-red-950/70', 'scale-110', 'shadow-[0_0_12px_rgba(220,38,38,0.7)]');
        btn.classList.add('border-white/15', 'bg-neutral-900');
      }
    });
  }

  show() {
    this.isManaging = false;
    this.manageBtn.innerText = t('manageProfiles');
    this.manageBtn.className = 'px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-neutral-300 hover:text-white text-xs md:text-sm font-bold transition active:scale-95 cursor-pointer';
    this.showPickerView();
    this.renderProfiles();
    this.overlay.classList.remove('hidden');
    this.overlay.classList.add('flex');
    if (window.cineTvNav) {
      window.cineTvNav.pushModal(this.overlay, '.profile-card.border-4, .profile-card, #profile-close-btn');
    }
  }

  close() {
    this.overlay.classList.add('hidden');
    this.overlay.classList.remove('flex');
    this.showPickerView();
    if (window.cineTvNav) {
      window.cineTvNav.popModal();
    }
  }

  showPickerView() {
    this.pickerView.classList.remove('hidden');
    this.pinView.classList.add('hidden');
    this.editView.classList.add('hidden');
    this.pinError.classList.add('hidden');
    this.pinInput.value = '';
    this.targetProfileToSwitch = null;
    if (window.cineTvNav) {
      setTimeout(() => {
        const target = this.profileGrid?.querySelector('.profile-card.border-4') ||
                       this.profileGrid?.querySelector('.profile-card') ||
                       this.closeBtn;
        if (target) window.cineTvNav.setFocus(target, true);
      }, 50);
    }
  }

  showPinView(targetProfile) {
    this.targetProfileToSwitch = targetProfile;
    this.pickerView.classList.add('hidden');
    this.pinView.classList.remove('hidden');
    this.editView.classList.add('hidden');
    this.pinError.classList.add('hidden');
    this.pinInput.value = '';
    setTimeout(() => {
      this.pinInput.focus();
      if (window.cineTvNav) window.cineTvNav.setFocus(this.pinInput, true);
    }, 100);
  }

  showEditView(profile = null) {
    this.editingProfileId = profile ? profile.id : null;
    this.pickerView.classList.add('hidden');
    this.pinView.classList.add('hidden');
    this.editView.classList.remove('hidden');

    const profiles = profileService.getProfiles();
    if (this.editDeleteBtn) {
      if (profile && profiles.length > 1) {
        this.editDeleteBtn.classList.remove('hidden');
      } else {
        this.editDeleteBtn.classList.add('hidden');
      }
    }

    if (profile) {
      this.editTitle.innerText = `${t('editProfile')}: ${profile.name}`;
      this.nameInput.value = profile.name || '';
      this.kidsToggle.checked = !!profile.isKids;
      this.selectAvatar(profile.avatar || '🦁');
    } else {
      this.editTitle.innerText = t('addProfile');
      this.nameInput.value = '';
      this.kidsToggle.checked = false;
      this.selectAvatar('🦁');
    }
    setTimeout(() => {
      this.nameInput.focus();
      this.nameInput.select();
      if (window.cineTvNav) window.cineTvNav.setFocus(this.nameInput, true);
    }, 100);
  }

  verifyAndSwitch() {
    const pin = this.pinInput.value.trim();
    if (!profileService.verifyKidsExitPin(pin)) {
      this.pinError.classList.remove('hidden');
      this.pinInput.value = '';
      this.pinInput.focus();
      return;
    }
    if (this.targetProfileToSwitch) {
      profileService.switchProfile(this.targetProfileToSwitch.id, pin);
      this.close();
    }
  }

  saveProfileData() {
    const name = this.nameInput.value.trim();
    if (!name) return;

    if (this.editingProfileId) {
      profileService.updateProfile(this.editingProfileId, {
        name,
        avatar: this.selectedAvatar,
        isKids: this.kidsToggle.checked
      });
    } else {
      profileService.addProfile({
        name,
        avatar: this.selectedAvatar,
        isKids: this.kidsToggle.checked,
        pin: '1234'
      });
    }
    this.showPickerView();
    this.renderProfiles();
  }

  renderProfiles() {
    const profiles = profileService.getProfiles();
    const active = profileService.getActiveProfile();

    this.profileGrid.innerHTML = `
      ${profiles.map(p => {
        const isActive = p.id === active?.id;
        return `
          <div class="flex flex-col items-center gap-2 group">
            <div 
              class="profile-card relative w-20 h-20 md:w-28 md:h-28 rounded-3xl flex items-center justify-center text-4xl md:text-5xl transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'border-4 border-red-600 bg-neutral-900 shadow-[0_0_25px_rgba(220,38,38,0.6)] scale-105' 
                  : 'border-2 border-white/15 bg-neutral-900/90 hover:border-white/50 hover:scale-105'
              }"
              data-id="${p.id}"
              tabindex="0"
            >
              <span>${p.avatar || '🦁'}</span>

              ${p.isKids ? `
                <span class="absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-600 text-white shadow-md border border-blue-400 pointer-events-none">
                  KIDS
                </span>
              ` : ''}

              ${this.isManaging && profiles.length > 1 ? `
                <button class="profile-delete-btn absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center justify-center shadow-lg border border-white/20 active:scale-90 cursor-pointer z-10" data-id="${p.id}" title="Excluir Perfil" tabindex="0">
                  ✕
                </button>
              ` : ''}
            </div>

            <div class="flex flex-col items-center">
              <span class="text-xs md:text-sm font-bold text-neutral-200 group-hover:text-white transition">
                ${p.name}
              </span>
              ${isActive ? `
                <span class="text-[9px] text-red-500 font-mono font-bold">● ${t('activeProfileBadge')}</span>
              ` : ''}

              <!-- Clickable Edit Pill Button under the name -->
              <button 
                class="profile-name-edit-btn mt-1 text-[11px] text-neutral-400 hover:text-white bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 flex items-center gap-1 font-semibold transition py-0.5 px-2.5 rounded-full active:scale-95 cursor-pointer" 
                data-id="${p.id}"
                title="${t('editProfile')}"
                tabindex="0"
              >
                <span>✏️</span>
                <span>${t('editProfile') || 'Editar'}</span>
              </button>
            </div>
          </div>
        `;
      }).join('')}

      <!-- Add Profile Button (Max 5 profiles) -->
      ${profiles.length < 5 ? `
        <div class="flex flex-col items-center gap-2 group cursor-pointer" id="profile-add-card" tabindex="0">
          <div class="w-20 h-20 md:w-28 md:h-28 rounded-3xl border-2 border-dashed border-white/20 hover:border-white/50 bg-white/5 hover:bg-white/10 flex items-center justify-center text-3xl md:text-4xl text-neutral-400 group-hover:text-white transition-all group-hover:scale-105">
            +
          </div>
          <span class="text-xs md:text-sm font-bold text-neutral-400 group-hover:text-white transition">
            ${t('addProfile')}
          </span>
        </div>
      ` : ''}
    `;

    // Bind edit button clicks (pill under the name)
    this.profileGrid.querySelectorAll('.profile-name-edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const id = btn.dataset.id;
        const target = profiles.find(p => p.id === id);
        if (target) {
          this.showEditView(target);
        }
      });
    });

    // Bind card clicks
    this.profileGrid.querySelectorAll('.profile-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.profile-name-edit-btn') || e.target.closest('.profile-delete-btn')) {
          return;
        }
        const id = card.dataset.id;
        const target = profiles.find(p => p.id === id);
        if (!target) return;

        if (this.isManaging) {
          this.showEditView(target);
          return;
        }

        // Check if currently in Kids mode and trying to switch to adult
        if (profileService.isKidsMode() && !target.isKids) {
          this.showPinView(target);
          return;
        }

        profileService.switchProfile(id);
        this.close();
      });
    });

    // Bind delete clicks
    this.profileGrid.querySelectorAll('.profile-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        if (confirm(t('confirmDeleteProfile'))) {
          profileService.deleteProfile(id);
        }
      });
    });

    // Bind add profile click
    const addCard = this.profileGrid.querySelector('#profile-add-card');
    if (addCard) {
      addCard.addEventListener('click', () => {
        this.showEditView(null);
      });
    }
  }

  updateLanguage() {
    const title = this.container.querySelector('#profile-picker-title');
    if (title) title.innerText = t('whoIsWatching');
    if (this.manageBtn) this.manageBtn.innerText = this.isManaging ? t('done') : t('manageProfiles');
    if (this.closeBtn) this.closeBtn.innerText = t('close');
    this.renderProfiles();
  }
}
