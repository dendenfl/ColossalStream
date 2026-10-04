/**
 * Lightweight global toast notification
 */
export function showAppToast(message, icon = '🗑️', durationMs = 2200) {
  let toastEl = document.getElementById('cine-app-toast');
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'cine-app-toast';
    toastEl.className = 'fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-neutral-900/95 text-white border border-red-500/60 shadow-2xl px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 pointer-events-none opacity-0 translate-y-4 flex items-center gap-2 backdrop-blur-md';
    document.body.appendChild(toastEl);
  }

  toastEl.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  toastEl.classList.remove('opacity-0', 'translate-y-4');
  toastEl.classList.add('opacity-100', 'translate-y-0');

  clearTimeout(toastEl._timer);
  toastEl._timer = setTimeout(() => {
    toastEl.classList.remove('opacity-100', 'translate-y-0');
    toastEl.classList.add('opacity-0', 'translate-y-4');
  }, durationMs);
}

window.showAppToast = showAppToast;
