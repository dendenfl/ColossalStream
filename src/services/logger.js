/**
 * CineTV In-App Diagnostic Logger & System Telemetry
 * Captures console output, player events, device specs, and errors
 * for user support and debugging.
 */

const MAX_LOGS = 150;
if (!window.__CINETV_LOGS__) {
  window.__CINETV_LOGS__ = [];
}

const originalConsole = {
  log: console.log.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
  info: console.info.bind(console)
};

function formatArg(arg) {
  if (arg === null) return 'null';
  if (arg === undefined) return 'undefined';
  if (typeof arg === 'string') return arg;
  if (arg instanceof Error) return `${arg.name}: ${arg.message}\n${arg.stack || ''}`;
  try {
    return JSON.stringify(arg);
  } catch (e) {
    return String(arg);
  }
}

function pushLog(level, args) {
  try {
    const timestamp = new Date().toISOString().substring(11, 23); // HH:mm:ss.sss
    const message = Array.from(args).map(formatArg).join(' ');
    window.__CINETV_LOGS__.push({
      time: timestamp,
      level,
      msg: message
    });
    if (window.__CINETV_LOGS__.length > MAX_LOGS) {
      window.__CINETV_LOGS__.shift();
    }
  } catch (e) {}
}

// Hook console methods
console.log = function(...args) {
  pushLog('LOG', args);
  originalConsole.log(...args);
};
console.info = function(...args) {
  pushLog('INFO', args);
  originalConsole.info(...args);
};
console.warn = function(...args) {
  pushLog('WARN', args);
  originalConsole.warn(...args);
};
console.error = function(...args) {
  pushLog('ERROR', args);
  originalConsole.error(...args);
};

// Catch global uncaught errors
window.addEventListener('error', (event) => {
  pushLog('UNCAUGHT', [event.message, event.filename, event.lineno, event.colno, event.error]);
});

window.addEventListener('unhandledrejection', (event) => {
  pushLog('UNHANDLED_REJECTION', [event.reason]);
});

/**
 * Returns formatted diagnostic report as string
 */
export function getDiagnosticReport() {
  const isTv = !!(window.AndroidNative && window.AndroidNative.isTV && window.AndroidNative.isTV());
  const player = window.cinePlayerInstance;
  const video = document.getElementById('cine-video');
  const embed = document.getElementById('cine-embed');

  const report = {
    reportTimestamp: new Date().toISOString(),
    app: {
      name: "CineTV",
      version: "1.0.0",
      isTvDevice: isTv,
      language: localStorage.getItem('cinetv_lang') || 'pt'
    },
    device: {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      screen: `${window.screen.width}x${window.screen.height} (DPR: ${window.devicePixelRatio})`,
      onLine: navigator.onLine,
      deviceMemory: navigator.deviceMemory ? `${navigator.deviceMemory}GB` : 'N/A',
      hardwareConcurrency: navigator.hardwareConcurrency || 'N/A'
    },
    bridge: {
      hasAndroidNative: !!window.AndroidNative,
      hasCineTvBridge: !!window.CineTvBridge,
      lastCapturedStream: window.AndroidNative?.getLastCapturedStream?.() || 'none'
    },
    player: player ? {
      isOpen: player.isOpen(),
      isEmbedMode: player.isEmbedMode,
      isEmbedPlaying: player.isEmbedPlaying,
      currentServerId: player.currentServerId,
      currentSeason: player.currentSeason,
      currentEpisode: player.currentEpisode,
      lastPlaybackTime: player.lastPlaybackTime,
      totalDuration: player.totalDuration,
      hasStreamPlaybackStarted: player.hasStreamPlaybackStarted,
      embedSrc: embed?.src || 'none',
      currentItem: player.currentItem ? {
        id: player.currentItem.id,
        imdbId: player.currentItem.imdbId,
        title: player.currentItem.title,
        type: player.currentItem.type
      } : null,
      videoTag: video ? {
        paused: video.paused,
        currentTime: video.currentTime,
        duration: video.duration,
        currentSrc: video.currentSrc || video.src,
        readyState: video.readyState,
        networkState: video.networkState,
        error: video.error ? { code: video.error.code, message: video.error.message } : null
      } : null
    } : null,
    settings: {
      aspectRatio: localStorage.getItem('cinetv_aspect_ratio') || '0',
      nightMode: localStorage.getItem('cinetv_night_mode') || 'false',
      storedProgressCount: Object.keys(localStorage).filter(k => k.startsWith('cinetv_progress_')).length
    },
    recentLogs: (window.__CINETV_LOGS__ || []).slice(-80).map(l => `[${l.time}] [${l.level}] ${l.msg}`)
  };

  return JSON.stringify(report, null, 2);
}

/**
 * Copies the diagnostic report to clipboard
 */
export async function copyDiagnosticReport() {
  const text = getDiagnosticReport();
  let success = false;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      success = true;
    } catch (e) {}
  }

  if (!success) {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '-9999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      success = document.execCommand('copy');
      document.body.removeChild(textarea);
    } catch (e) {}
  }

  return { success, text };
}
