/**
 * Multi-User Profiles & Kids Safe Space Service
 * Manages household profiles, avatar selection, Kids mode restrictions, and PIN security.
 */
import { t } from './i18n.js';
import { supabaseService } from './supabase.js';

const KEY_PROFILES = 'cinetv_profiles';
const KEY_ACTIVE_PROFILE_ID = 'cinetv_active_profile_id';

export const AVATAR_OPTIONS = [
  { icon: '🦁', name: 'Leão' },
  { icon: '🐯', name: 'Tigre' },
  { icon: '🦊', name: 'Raposa' },
  { icon: '🐺', name: 'Lobo' },
  { icon: '🦄', name: 'Unicórnio' },
  { icon: '🐼', name: 'Panda' },
  { icon: '🐨', name: 'Coala' },
  { icon: '🐱', name: 'Gatinho' },
  { icon: '🐶', name: 'Cachorrinho' },
  { icon: '👑', name: 'Coroa' },
  { icon: '🚀', name: 'Foguete' },
  { icon: '⭐', name: 'Estrela' },
  { icon: '🍿', name: 'Pipoca' },
  { icon: '🎬', name: 'Cinema' },
  { icon: '👾', name: 'Alien' },
  { icon: '🤖', name: 'Robô' },
  { icon: '🎮', name: 'Gamer' },
  { icon: '🎧', name: 'Música' },
  { icon: '⚡', name: 'Raio' },
  { icon: '🔥', name: 'Fogo' }
];

const DEFAULT_PROFILES = [
  {
    id: 'profile_primary',
    name: 'Principal',
    avatar: '🦁',
    isKids: false,
    createdAt: Date.now()
  },
  {
    id: 'profile_kids',
    name: 'Kids',
    avatar: '🦄',
    isKids: true,
    pin: '1234',
    createdAt: Date.now() + 1
  }
];

class ProfileService {
  constructor() {
    this.profiles = this.loadProfiles();
    this.activeProfileId = this.loadActiveProfileId();
  }

  loadProfiles() {
    try {
      const raw = localStorage.getItem(KEY_PROFILES);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
    this.saveProfiles(DEFAULT_PROFILES);
    return DEFAULT_PROFILES;
  }

  saveProfiles(profiles) {
    try {
      this.profiles = profiles;
      localStorage.setItem(KEY_PROFILES, JSON.stringify(profiles));
    } catch (e) {}
  }

  loadActiveProfileId() {
    try {
      const id = localStorage.getItem(KEY_ACTIVE_PROFILE_ID);
      if (id && this.profiles.some(p => p.id === id)) {
        return id;
      }
    } catch (e) {}
    const defaultId = this.profiles[0]?.id || 'profile_primary';
    this.setActiveProfileId(defaultId);
    return defaultId;
  }

  setActiveProfileId(id) {
    this.activeProfileId = id;
    try {
      localStorage.setItem(KEY_ACTIVE_PROFILE_ID, id);
    } catch (e) {}
  }

  getProfiles() {
    return this.profiles;
  }

  getActiveProfile() {
    return this.profiles.find(p => p.id === this.activeProfileId) || this.profiles[0];
  }

  isKidsMode() {
    const active = this.getActiveProfile();
    return !!active?.isKids;
  }

  switchProfile(profileId, enteredPin = null) {
    const current = this.getActiveProfile();
    const target = this.profiles.find(p => p.id === profileId);
    if (!target) return { success: false, reason: 'not_found' };

    // If currently in Kids Mode and trying to switch to an adult profile, verify PIN
    if (current?.isKids && !target.isKids) {
      const requiredPin = current.pin || '1234';
      if (enteredPin !== requiredPin) {
        return { success: false, reason: 'pin_required' };
      }
    }

    this.setActiveProfileId(target.id);
    window.dispatchEvent(new CustomEvent('cinetv:profileChanged', { detail: { profile: target } }));
    return { success: true, profile: target };
  }

  addProfile({ name, avatar, isKids = false, pin = '1234' }) {
    if (!name || !name.trim()) return null;
    const newProfile = {
      id: `profile_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      avatar: avatar || (isKids ? '🦄' : '🍿'),
      isKids: !!isKids,
      pin: pin || '1234',
      createdAt: Date.now()
    };
    const updated = [...this.profiles, newProfile];
    this.saveProfiles(updated);
    window.dispatchEvent(new CustomEvent('cinetv:profilesUpdated', { detail: { profiles: updated } }));
    supabaseService.scheduleSync();
    return newProfile;
  }

  updateProfile(profileId, updates) {
    const idx = this.profiles.findIndex(p => p.id === profileId);
    if (idx < 0) return null;
    this.profiles[idx] = { ...this.profiles[idx], ...updates };
    this.saveProfiles(this.profiles);
    window.dispatchEvent(new CustomEvent('cinetv:profilesUpdated', { detail: { profiles: this.profiles } }));
    if (this.activeProfileId === profileId) {
      window.dispatchEvent(new CustomEvent('cinetv:profileChanged', { detail: { profile: this.profiles[idx] } }));
    }
    supabaseService.scheduleSync();
    return this.profiles[idx];
  }

  deleteProfile(profileId) {
    if (this.profiles.length <= 1) return false;
    const updated = this.profiles.filter(p => p.id !== profileId);
    this.saveProfiles(updated);
    if (this.activeProfileId === profileId) {
      this.switchProfile(updated[0].id);
    }
    window.dispatchEvent(new CustomEvent('cinetv:profilesUpdated', { detail: { profiles: updated } }));
    supabaseService.scheduleSync();
    return true;
  }

  verifyKidsExitPin(pin) {
    const active = this.getActiveProfile();
    const requiredPin = active?.pin || '1234';
    return String(pin).trim() === String(requiredPin).trim();
  }

  /**
   * Generates a storage key scoped to the active profile
   */
  getScopedKey(baseKey) {
    const active = this.getActiveProfile();
    const profileId = active?.id || 'profile_primary';
    // Backwards compatibility for primary profile
    if (profileId === 'profile_primary') {
      return baseKey;
    }
    return `${baseKey}_${profileId}`;
  }
}

export const profileService = new ProfileService();
