/**
 * AuthModal Component
 * Supabase Authentication & Cross-Device Cloud Sync Manager
 * Supports Sign In, Sign Up, Sign Out, Manual Sync, Show/Hide Password,
 * Dual-language (EN/PT) header switcher, and Supabase Email Confirmation handling.
 */
import { supabaseService } from '../services/supabase.js';
import { getContinueWatching, getWatchlist } from '../services/storage.js';
import { t, getLanguage, setLanguage } from '../services/i18n.js';

export class AuthModal {
  constructor(container, onAuthChanged) {
    this.container = container;
    this.onAuthChanged = onAuthChanged || (() => {});
    this.mode = 'signin'; // 'signin' | 'signup'
    this.showPass = false;
    this.showConfirmPass = false;

    this.initDOM();
    this.bindEvents();

    window.addEventListener('cinetv:authChanged', () => this.render());
    window.addEventListener('cinetv:syncStatus', () => this.render());
    window.addEventListener('cinetv:langChanged', () => this.render());
  }

  isOpen() {
    return this.overlay && !this.overlay.classList.contains('hidden');
  }

  initDOM() {
    this.container.innerHTML = `
      <div id="auth-overlay" class="fixed inset-0 bg-black/90 z-50 hidden flex items-center justify-center select-none overflow-y-auto px-4 py-8 backdrop-blur-md">
        <div class="w-full max-w-md bg-neutral-950 border border-white/15 rounded-3xl p-5 md:p-7 shadow-2xl flex flex-col gap-5 relative">
          
          <!-- Header with Language Switcher & Close Button -->
          <div class="flex items-center justify-between border-b border-white/10 pb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-xl shadow-lg shadow-red-900/40 flex-shrink-0">
                ☁️
              </div>
              <div>
                <h2 id="auth-header-title" class="text-base md:text-lg font-black text-white tracking-wide">
                  ${t('authHeaderTitle')}
                </h2>
                <p id="auth-header-sub" class="text-[11px] text-neutral-400">
                  ${t('authHeaderSubtitle')}
                </p>
              </div>
            </div>

            <!-- Top Right Action Controls: Lang Switcher & Close Button -->
            <div class="flex items-center gap-2">
              <button 
                id="auth-lang-toggle-btn" 
                class="h-8 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-neutral-200 hover:text-white transition cursor-pointer active:scale-95 flex items-center gap-1 shadow-sm"
                title="Mudar Idioma / Change Language"
              >
                ${getLanguage() === 'en' ? '🇧🇷 PT' : '🇺🇸 EN'}
              </button>

              <button 
                id="auth-close-btn" 
                class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white flex items-center justify-center text-base transition active:scale-95 cursor-pointer"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- Dynamic Body Content -->
          <div id="auth-body-content"></div>

        </div>
      </div>
    `;

    this.overlay = this.container.querySelector('#auth-overlay');
    this.bodyContent = this.container.querySelector('#auth-body-content');
    this.closeBtn = this.container.querySelector('#auth-close-btn');
    this.langToggleBtn = this.container.querySelector('#auth-lang-toggle-btn');
  }

  bindEvents() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.hide());
    }

    if (this.langToggleBtn) {
      this.langToggleBtn.addEventListener('click', () => {
        const nextLang = getLanguage() === 'en' ? 'pt' : 'en';
        setLanguage(nextLang);
        if (this.langToggleBtn) {
          this.langToggleBtn.innerText = nextLang === 'en' ? '🇧🇷 PT' : '🇺🇸 EN';
        }
        this.render();
      });
    }

    if (this.overlay) {
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) this.hide();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (this.isOpen() && (e.key === 'Escape' || e.key === 'Backspace')) {
        const activeTag = document.activeElement?.tagName?.toLowerCase();
        if (e.key === 'Escape' || activeTag !== 'input') {
          e.preventDefault();
          this.hide();
        }
      }
    });
  }

  show() {
    if (!this.overlay) return;
    this.overlay.classList.remove('hidden');
    this.overlay.classList.add('flex');
    this.render();
    if (window.cineTvNav) {
      window.cineTvNav.pushModal(this.overlay, '#auth-email-input, .auth-switch-btn, button');
    }
  }

  hide() {
    if (!this.overlay) return;
    this.overlay.classList.add('hidden');
    this.overlay.classList.remove('flex');
    if (window.cineTvNav) {
      window.cineTvNav.popModal();
    }
  }

  close() {
    this.hide();
  }

  render() {
    if (!this.isOpen() || !this.bodyContent) return;

    // Update header translations
    const titleEl = this.container.querySelector('#auth-header-title');
    const subEl = this.container.querySelector('#auth-header-sub');
    if (titleEl) titleEl.innerText = t('authHeaderTitle');
    if (subEl) subEl.innerText = t('authHeaderSubtitle');
    if (this.langToggleBtn) {
      this.langToggleBtn.innerText = getLanguage() === 'en' ? '🇧🇷 PT' : '🇺🇸 EN';
    }

    const user = supabaseService.getUser();
    if (user) {
      this.renderLoggedInView(user);
    } else {
      this.renderLoggedOutView();
    }
  }

  renderLoggedInView(user) {
    const contMovies = getContinueWatching('movie');
    const contSeries = getContinueWatching('series');
    const watchMovies = getWatchlist('movie');
    const watchSeries = getWatchlist('series');

    const lastSync = supabaseService.lastSyncedAt 
      ? new Date(supabaseService.lastSyncedAt).toLocaleTimeString() 
      : t('justNow');

    this.bodyContent.innerHTML = `
      <div class="flex flex-col gap-5">
        <!-- User Badge -->
        <div class="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl flex-shrink-0">
            🟢
          </div>
          <div class="flex-1 min-w-0">
            <span class="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
              ${t('signedInAs')}
            </span>
            <p class="text-sm font-black text-white truncate" title="${user.email || ''}">
              ${user.email || 'User'}
            </p>
            <p class="text-[11px] text-neutral-400 mt-0.5">
              ${t('lastSync')} <span class="text-neutral-300 font-semibold">${lastSync}</span>
            </p>
          </div>
        </div>

        <!-- Sync Stats Cards with Clear Movies & Series Breakdown -->
        <div class="grid grid-cols-2 gap-2.5">
          <div class="p-3 rounded-xl bg-white/5 border border-white/5 text-center flex flex-col justify-between">
            <span class="text-xs text-neutral-400">${t('contWatchingStat')}</span>
            <p class="text-lg font-black text-white my-0.5">
              ${contMovies.length + contSeries.length} <span class="text-xs text-neutral-400 font-normal">${t('itemsCount')}</span>
            </p>
            <span class="text-[10px] text-neutral-400">
              🎬 ${contMovies.length} ${t('moviesTab')} • 📺 ${contSeries.length} ${t('seriesTab')}
            </span>
          </div>
          <div class="p-3 rounded-xl bg-white/5 border border-white/5 text-center flex flex-col justify-between">
            <span class="text-xs text-neutral-400">${t('myListStat')}</span>
            <p class="text-lg font-black text-white my-0.5">
              ${watchMovies.length + watchSeries.length} <span class="text-xs text-neutral-400 font-normal">${t('savedCount')}</span>
            </p>
            <span class="text-[10px] text-neutral-400">
              🎬 ${watchMovies.length} ${t('moviesTab')} • 📺 ${watchSeries.length} ${t('seriesTab')}
            </span>
          </div>
        </div>

        <!-- Feedback Alert Banner -->
        <div id="auth-alert-banner" class="hidden p-3 rounded-xl text-xs font-semibold whitespace-pre-line"></div>

        <!-- Action Buttons -->
        <div class="flex flex-col gap-2.5 pt-2">
          <button 
            id="auth-sync-now-btn" 
            class="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-black text-sm transition shadow-lg shadow-red-900/40 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>🔄</span>
            <span id="auth-sync-text">${t('syncNowBtn')}</span>
          </button>

          <button 
            id="auth-signout-btn" 
            class="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-neutral-300 hover:text-white font-bold text-xs transition border border-white/10 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>🚪</span>
            <span>${t('signOutBtn')}</span>
          </button>
        </div>

        <!-- TV & Cross-Device Info -->
        <p class="text-center text-[11px] text-neutral-400 leading-relaxed">
          ${t('tvCloudHint')}
        </p>
      </div>
    `;

    // Bind Logged In Buttons
    const syncBtn = this.bodyContent.querySelector('#auth-sync-now-btn');
    const syncText = this.bodyContent.querySelector('#auth-sync-text');
    const signoutBtn = this.bodyContent.querySelector('#auth-signout-btn');
    const alertBanner = this.bodyContent.querySelector('#auth-alert-banner');

    if (syncBtn) {
      syncBtn.addEventListener('click', async () => {
        try {
          syncBtn.disabled = true;
          syncText.innerText = t('syncing');
          await supabaseService.syncNow();
          alertBanner.className = 'p-3 rounded-xl text-xs font-semibold bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 block text-center';
          alertBanner.innerText = `✓ ${t('syncSuccess')}`;
          setTimeout(() => {
            this.render();
          }, 1500);
        } catch (err) {
          alertBanner.className = 'p-3 rounded-xl text-xs font-semibold bg-red-950/80 border border-red-500/40 text-red-300 block text-center whitespace-pre-line';
          alertBanner.innerText = `Erro: ${err.message || t('syncError')}`;
          syncBtn.disabled = false;
          syncText.innerText = t('syncNowBtn');
        }
      });
    }

    if (signoutBtn) {
      signoutBtn.addEventListener('click', async () => {
        await supabaseService.signOut();
      });
    }
  }

  renderLoggedOutView() {
    const isSignIn = this.mode === 'signin';

    this.bodyContent.innerHTML = `
      <div class="flex flex-col gap-4">
        <!-- Tab Selector: Sign In / Create Account -->
        <div class="flex rounded-xl bg-white/5 p-1 border border-white/10">
          <button 
            id="auth-tab-signin" 
            class="flex-1 py-2 rounded-lg text-xs font-black transition cursor-pointer ${isSignIn ? 'bg-red-600 text-white shadow' : 'text-neutral-400 hover:text-white'}"
          >
            ${t('signInTab')}
          </button>
          <button 
            id="auth-tab-signup" 
            class="flex-1 py-2 rounded-lg text-xs font-black transition cursor-pointer ${!isSignIn ? 'bg-red-600 text-white shadow' : 'text-neutral-400 hover:text-white'}"
          >
            ${t('signUpTab')}
          </button>
        </div>

        <p class="text-xs text-neutral-400 text-center px-1 leading-relaxed">
          ${isSignIn ? t('authSignInPrompt') : t('authSignUpPrompt')}
        </p>

        <!-- Feedback Alert Banner -->
        <div id="auth-alert-banner" class="hidden p-3.5 rounded-xl text-xs font-medium whitespace-pre-line leading-relaxed"></div>

        <!-- Form Fields -->
        <form id="auth-form" class="flex flex-col gap-3">
          <!-- Email Input -->
          <div>
            <label class="block text-[11px] font-bold text-neutral-300 mb-1">
              ${t('emailLabel')}
            </label>
            <input 
              type="email" 
              id="auth-email-input" 
              required 
              placeholder="${t('emailPlaceholder')}" 
              class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/20 focus:border-red-500 text-white text-sm outline-none transition"
            />
          </div>

          <!-- Password Input with Show/Hide Eye Toggle -->
          <div>
            <label class="block text-[11px] font-bold text-neutral-300 mb-1">
              ${t('passwordLabel')}
            </label>
            <div class="relative flex items-center">
              <input 
                type="${this.showPass ? 'text' : 'password'}" 
                id="auth-pass-input" 
                required 
                minlength="6"
                placeholder="${t('passwordPlaceholder')}" 
                class="w-full pl-3.5 pr-11 py-2.5 rounded-xl bg-neutral-900 border border-white/20 focus:border-red-500 text-white text-sm outline-none transition font-sans"
              />
              <button 
                type="button" 
                id="auth-toggle-pass-btn" 
                class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition cursor-pointer text-base"
                title="${this.showPass ? t('hidePassword') : t('showPassword')}"
              >
                ${this.showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <!-- Confirm Password Input (Only for Sign Up) -->
          ${!isSignIn ? `
            <div>
              <label class="block text-[11px] font-bold text-neutral-300 mb-1">
                ${t('confirmPasswordLabel')}
              </label>
              <div class="relative flex items-center">
                <input 
                  type="${this.showConfirmPass ? 'text' : 'password'}" 
                  id="auth-confirm-pass-input" 
                  required 
                  minlength="6"
                  placeholder="${t('passwordPlaceholder')}" 
                  class="w-full pl-3.5 pr-11 py-2.5 rounded-xl bg-neutral-900 border border-white/20 focus:border-red-500 text-white text-sm outline-none transition font-sans"
                />
                <button 
                  type="button" 
                  id="auth-toggle-confirm-pass-btn" 
                  class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition cursor-pointer text-base"
                  title="${this.showConfirmPass ? t('hidePassword') : t('showPassword')}"
                >
                  ${this.showConfirmPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
          ` : ''}

          <!-- Forgot Password Link (Only in Sign In mode) -->
          ${isSignIn ? `
            <div class="flex justify-end -mt-1">
              <button 
                type="button" 
                id="auth-forgot-pass-btn" 
                class="text-[11px] text-neutral-400 hover:text-white underline transition cursor-pointer"
              >
                ${t('forgotPasswordBtn')}
              </button>
            </div>
          ` : ''}

          <!-- Submit Button -->
          <button 
            type="submit" 
            id="auth-submit-btn" 
            class="mt-2 w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-black text-sm transition shadow-lg shadow-red-900/40 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span id="auth-submit-text">${isSignIn ? t('signInBtn') : t('signUpBtn')}</span>
          </button>
        </form>

        <!-- Collapsible SQL Helper for first-time Supabase setup -->
        <details class="mt-1 text-xs border border-white/10 rounded-xl bg-white/5 p-3 group">
          <summary class="cursor-pointer font-bold text-neutral-300 hover:text-white flex items-center justify-between">
            <span>${t('sqlSetupTitle')}</span>
            <span class="text-neutral-500 text-[10px]">▼</span>
          </summary>
          <div class="mt-3 text-[11px] text-neutral-400 space-y-2">
            <p>${t('sqlSetupDesc')}</p>
            <div class="relative">
              <pre class="bg-black/60 p-2.5 rounded-lg text-[10px] font-mono text-neutral-300 overflow-x-auto border border-white/10 max-h-32 select-all">
CREATE TABLE IF NOT EXISTS public.user_sync (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  continue_movies JSONB DEFAULT '[]'::jsonb,
  continue_series JSONB DEFAULT '[]'::jsonb,
  watchlist_movies JSONB DEFAULT '[]'::jsonb,
  watchlist_series JSONB DEFAULT '[]'::jsonb,
  profiles JSONB DEFAULT '[]'::jsonb,
  sync_dump JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.user_sync ENABLE ROW LEVEL SECURITY;
-- Explicit grants: required for tables created after 2026-10-30, when Supabase
-- stops auto-granting new public tables (without these the app gets 42501).
GRANT SELECT, INSERT, UPDATE ON public.user_sync TO authenticated;
CREATE POLICY "Users can read own sync data" ON public.user_sync FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sync data" ON public.user_sync FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sync data" ON public.user_sync FOR UPDATE USING (auth.uid() = user_id);
              </pre>
            </div>
            <p class="text-[10px] text-neutral-500">${t('sqlSetupNote')}</p>
          </div>
        </details>

      </div>
    `;

    // Elements
    const tabSignIn = this.bodyContent.querySelector('#auth-tab-signin');
    const tabSignUp = this.bodyContent.querySelector('#auth-tab-signup');
    const form = this.bodyContent.querySelector('#auth-form');
    const emailInput = this.bodyContent.querySelector('#auth-email-input');
    const passInput = this.bodyContent.querySelector('#auth-pass-input');
    const confirmPassInput = this.bodyContent.querySelector('#auth-confirm-pass-input');
    const togglePassBtn = this.bodyContent.querySelector('#auth-toggle-pass-btn');
    const toggleConfirmPassBtn = this.bodyContent.querySelector('#auth-toggle-confirm-pass-btn');
    const submitBtn = this.bodyContent.querySelector('#auth-submit-btn');
    const submitText = this.bodyContent.querySelector('#auth-submit-text');
    const alertBanner = this.bodyContent.querySelector('#auth-alert-banner');
    const forgotBtn = this.bodyContent.querySelector('#auth-forgot-pass-btn');

    // Forgot password handler
    if (forgotBtn) {
      forgotBtn.addEventListener('click', async () => {
        const email = emailInput?.value?.trim();
        if (!email) {
          alertBanner.className = 'p-3.5 rounded-xl text-xs font-semibold bg-amber-950/90 border border-amber-500/40 text-amber-300 block text-center';
          alertBanner.innerText = `⚠️ Digite seu e-mail acima primeiro / Enter your email above first.`;
          return;
        }
        try {
          forgotBtn.disabled = true;
          forgotBtn.innerText = t('processing');
          await supabaseService.client.auth.resetPasswordForEmail(email);
          alertBanner.className = 'p-3.5 rounded-xl text-xs font-semibold bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 block text-center';
          alertBanner.innerText = `✓ ${t('resetSentSuccess')}`;
        } catch (err) {
          alertBanner.className = 'p-3.5 rounded-xl text-xs font-semibold bg-red-950/90 border border-red-500/40 text-red-300 block text-center';
          alertBanner.innerText = `Erro: ${err.message}`;
        } finally {
          forgotBtn.disabled = false;
          forgotBtn.innerText = t('forgotPasswordBtn');
        }
      });
    }

    // Password visibility toggle
    if (togglePassBtn && passInput) {
      togglePassBtn.addEventListener('click', () => {
        this.showPass = !this.showPass;
        passInput.type = this.showPass ? 'text' : 'password';
        togglePassBtn.innerText = this.showPass ? '🙈' : '👁️';
        togglePassBtn.title = this.showPass ? t('hidePassword') : t('showPassword');
      });
    }

    if (toggleConfirmPassBtn && confirmPassInput) {
      toggleConfirmPassBtn.addEventListener('click', () => {
        this.showConfirmPass = !this.showConfirmPass;
        confirmPassInput.type = this.showConfirmPass ? 'text' : 'password';
        toggleConfirmPassBtn.innerText = this.showConfirmPass ? '🙈' : '👁️';
        toggleConfirmPassBtn.title = this.showConfirmPass ? t('hidePassword') : t('showPassword');
      });
    }

    if (tabSignIn) {
      tabSignIn.addEventListener('click', () => {
        this.mode = 'signin';
        this.render();
      });
    }

    if (tabSignUp) {
      tabSignUp.addEventListener('click', () => {
        this.mode = 'signup';
        this.render();
      });
    }

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput?.value?.trim();
        const pass = passInput?.value;
        const confirmPass = confirmPassInput?.value;

        if (!email || !pass) return;

        // Validation for Sign Up
        if (this.mode === 'signup') {
          if (confirmPassInput && pass !== confirmPass) {
            alertBanner.className = 'p-3.5 rounded-xl text-xs font-semibold bg-red-950/90 border border-red-500/40 text-red-300 block text-center';
            alertBanner.innerText = `✕ ${t('passwordsDoNotMatch')}`;
            return;
          }
          if (pass.length < 6) {
            alertBanner.className = 'p-3.5 rounded-xl text-xs font-semibold bg-red-950/90 border border-red-500/40 text-red-300 block text-center';
            alertBanner.innerText = `✕ ${t('passwordTooShort')}`;
            return;
          }
        }

        submitBtn.disabled = true;
        submitText.innerText = t('processing');
        alertBanner.classList.add('hidden');

        try {
          if (this.mode === 'signin') {
            await supabaseService.signIn(email, pass);
            alertBanner.className = 'p-3.5 rounded-xl text-xs font-semibold bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 block text-center';
            alertBanner.innerText = `✓ ${t('loginSuccess')}`;
            setTimeout(() => {
              this.render();
            }, 1000);
          } else {
            const data = await supabaseService.signUp(email, pass);
            
            // Check if account already existed
            if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
              alertBanner.className = 'p-3.5 rounded-xl text-xs font-semibold bg-amber-950/90 border border-amber-500/40 text-amber-300 block whitespace-pre-line';
              alertBanner.innerText = `⚠️ ${t('emailAlreadyRegistered')}`;
              submitBtn.disabled = false;
              submitText.innerText = t('signUpBtn');
              return;
            }

            // Check if confirmation email is required
            if (!data.session) {
              alertBanner.className = 'p-3.5 rounded-xl text-xs font-medium bg-amber-950/90 border border-amber-500/50 text-amber-200 block whitespace-pre-line text-left leading-relaxed';
              alertBanner.innerText = t('emailConfirmNotice');
              submitBtn.disabled = false;
              submitText.innerText = t('signUpBtn');
              return;
            }

            // Successfully signed in right away
            alertBanner.className = 'p-3.5 rounded-xl text-xs font-semibold bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 block text-center';
            alertBanner.innerText = `✓ ${t('loginSuccess')}`;
            setTimeout(() => {
              this.render();
            }, 1200);
          }
        } catch (err) {
          alertBanner.className = 'p-3.5 rounded-xl text-xs font-semibold bg-red-950/90 border border-red-500/40 text-red-300 block text-left whitespace-pre-line leading-relaxed';
          let msg = err.message || t('syncError');
          
          if (msg.includes('Invalid login credentials')) {
            msg = t('invalidCredentialsNotice');
          } else if (msg.includes('User already registered')) {
            msg = t('emailAlreadyRegistered');
          } else if (msg.includes('Password should be at least')) {
            msg = t('passwordTooShort');
          }
          
          alertBanner.innerText = msg;
          submitBtn.disabled = false;
          submitText.innerText = isSignIn ? t('signInBtn') : t('signUpBtn');
        }
      });
    }
  }
}
