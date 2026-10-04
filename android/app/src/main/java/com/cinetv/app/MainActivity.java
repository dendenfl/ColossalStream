package com.cinetv.app;

import android.content.pm.ActivityInfo;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.InputDevice;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.os.SystemClock;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import androidx.activity.OnBackPressedCallback;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebChromeClient;
import com.getcapacitor.BridgeWebViewClient;
import java.io.ByteArrayInputStream;
import android.app.PictureInPictureParams;
import android.content.res.Configuration;
import android.util.Rational;
import androidx.webkit.JavaScriptReplyProxy;
import androidx.webkit.WebMessageCompat;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;
import org.json.JSONObject;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.ArrayList;
import android.media.session.MediaSession;
import android.media.session.PlaybackState;
import android.app.RemoteAction;
import android.app.PendingIntent;
import android.content.Intent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.IntentFilter;
import android.graphics.drawable.Icon;

public class MainActivity extends BridgeActivity {
    private boolean isPlayerActive = false;
    private volatile String lastCapturedStreamUrl = "";
    private final List<JavaScriptReplyProxy> videoReplyProxies = new CopyOnWriteArrayList<>();
    private volatile JavaScriptReplyProxy lastActiveVideoProxy = null;
    private volatile double lastReportedCurrentTime = 0.0;
    private volatile double lastReportedDuration = 0.0;
    private volatile boolean isReportedPaused = true;
    private volatile boolean isInternalKeyDispatch = false;
    private volatile boolean isSyntheticHardwareTap = false;
    private MediaSession mediaSession = null;
    private BroadcastReceiver pipActionReceiver = null;
    private static final String ACTION_PIP_CONTROL = "com.cinetv.app.PIP_CONTROL";
    private static final String EXTRA_PIP_COMMAND = "pip_cmd";

    private static final String CINETV_VIDEO_CONTROLLER_JS =
        "(function() {\n" +
        "  if (window.__CINETV_HOOKED__) return;\n" +
        "  if (window.self === window.top || window.location.hostname === 'localhost' || window.location.href.indexOf('localhost') !== -1 || window.location.href.indexOf('capacitor') !== -1 || window.location.protocol === 'file:' || window.location.protocol === 'capacitor:') return;\n" +
        "  window.__CINETV_HOOKED__ = true;\n" +
        "  try {\n" +
        "    window.open = function() { return null; };\n" +
        "    Object.defineProperty(window, 'open', { value: function() { return null; }, writable: false, configurable: false });\n" +
        "  } catch(e) {}\n" +
        "  try {\n" +
        "    window.aclib = { runPop: function(){}, runBanner: function(){} };\n" +
        "    window._Hasync = [];\n" +
        "    Object.defineProperty(window, 'aclib', { value: { runPop: function(){}, runBanner: function(){} }, writable: false, configurable: false });\n" +
        "  } catch(e) {}\n" +
        "  try {\n" +
        "    localStorage.setItem('__ad_impressions', '9999');\n" +
        "    localStorage.setItem('__ad_last_impression', String(Date.now() + 86400000));\n" +
        "  } catch(e) {}\n" +
        "  try {\n" +
        "    var _origFetch = window.fetch;\n" +
        "    if (_origFetch) {\n" +
        "      window.fetch = function() {\n" +
        "        var u = arguments[0];\n" +
        "        if (typeof u === 'string' && u.indexOf('/api/settings') !== -1) {\n" +
        "          return Promise.resolve(new Response(JSON.stringify([{ key: 'ad_config', value: JSON.stringify({ enabled: false, triggers: [], units: [] }) }]), { status: 200, headers: { 'Content-Type': 'application/json' } }));\n" +
        "        }\n" +
        "        return _origFetch.apply(this, arguments);\n" +
        "      };\n" +
        "    }\n" +
        "  } catch(e) {}\n" +
        "  var activeVideo = null;\n" +
        "  var lastReportedTime = 0;\n" +
        "  function safeUnmute(v) {\n" +
        "    if (!v) return;\n" +
        "    try {\n" +
        "      v.muted = false;\n" +
        "      if (v.volume < 1) v.volume = 1;\n" +
        "    } catch(e) {}\n" +
        "  }\n" +
        "  function dismissUnmute() {\n" +
        "    try {\n" +
        "      var vids = document.getElementsByTagName('video');\n" +
        "      for (var i = 0; i < vids.length; i++) {\n" +
        "        try { if (vids[i].muted) safeUnmute(vids[i]); } catch(e) {}\n" +
        "      }\n" +
        "      var unmuteSel = [\n" +
        "        '[class*=\"unmute\" i]', '[id*=\"unmute\" i]', '[aria-label*=\"unmute\" i]', '[title*=\"unmute\" i]',\n" +
        "        '.jw-display-icon-unmute', '.jw-icon-unmute', '.jw-unmute', '.vjs-unmute-control', '.vjs-unmute',\n" +
        "        '.vjs-unmute-overlay', '.click-to-unmute', '.plyr__control--mute', '.unmute-button', '.unmute-btn',\n" +
        "        '.unmute-banner', '.unmute-overlay', '[data-action*=\"unmute\" i]'\n" +
        "      ];\n" +
        "      for (var s = 0; s < unmuteSel.length; s++) {\n" +
        "        try {\n" +
        "          var els = document.querySelectorAll(unmuteSel[s]);\n" +
        "          for (var j = 0; j < els.length; j++) {\n" +
        "            try { if (typeof els[j].click === 'function') els[j].click(); } catch(e) {}\n" +
        "            els[j].style.setProperty('display', 'none', 'important');\n" +
        "            els[j].style.setProperty('pointer-events', 'none', 'important');\n" +
        "          }\n" +
        "        } catch(e) {}\n" +
        "      }\n" +
        "    } catch (e) {}\n" +
        "  }\n" +
        "  function disableIframeCaptions() {\n" +
        "    try {\n" +
        "      var vids = document.getElementsByTagName('video');\n" +
        "      for (var i = 0; i < vids.length; i++) {\n" +
        "        try {\n" +
        "          vids[i].controls = false;\n" +
        "          vids[i].removeAttribute('controls');\n" +
        "        } catch(e) {}\n" +
        "        if (vids[i].textTracks) {\n" +
        "          for (var j = 0; j < vids[i].textTracks.length; j++) {\n" +
        "            try { vids[i].textTracks[j].mode = 'disabled'; } catch(e) {}\n" +
        "          }\n" +
        "        }\n" +
        "      }\n" +
        "      if (window.jwplayer && typeof window.jwplayer === 'function') {\n" +
        "        try {\n" +
        "          var jw = window.jwplayer();\n" +
        "          if (jw && typeof jw.setCurrentCaptions === 'function') jw.setCurrentCaptions(0);\n" +
        "        } catch(e) {}\n" +
        "      }\n" +
        "    } catch(e) {}\n" +
        "  }\n" +
        "  var _cleanCss = '#bar, #seek, #btns, #time, #bSubs, #bSet, #bMute, #bCast, #bFs, #bPip, #bNext, #bPrev, #bBack, #vol, #volr, #volpop, #brand, #resume, #mSubs, #mSet, .jw-controls, .jw-controlbar, .jw-controls-backdrop, .jw-display-controls, .jw-display-icon-display, .jw-display-icon-container, .vjs-control-bar, .vjs-loading-spinner, .plyr__controls, .art-bottom, .art-controls, media-controls, [data-media-controls], vds-controls, media-mute-button, media-volume-range, media-volume-slider, media-time-slider, media-time-display, media-fullscreen-button, media-pip-button, media-captions-button, media-seek-backward-button, media-seek-forward-button, media-live-button, media-toggle-button, media-tooltip, media-captions, media-gesture, media-buffering-indicator, vds-mute-button, vds-volume-slider, vds-time-slider, vds-time, vds-fullscreen-button, vds-pip-button, vds-caption-button, vds-captions, vds-buffering-indicator, vds-tooltip, [class*=\"vds-controls\"], [class*=\"media-controls\"], video::-webkit-media-controls, video::-webkit-media-controls-enclosure, video::-webkit-media-controls-panel, video::-webkit-media-controls-play-button, video::-webkit-media-controls-start-playback-button, video::-webkit-media-controls-timeline, video::-webkit-media-controls-current-time-display, video::-webkit-media-controls-time-remaining-display, video::-webkit-media-controls-mute-button, video::-webkit-media-controls-volume-slider, video::-webkit-media-controls-fullscreen-button, [class*=subtitle], [class*=caption], [class*=text-track], [class*=texttrack], [id*=subtitle], [id*=caption], .art-subtitle, .art-subtitles, .jw-text-track-container, .jw-text-track-cue, .jw-text-track-display, .jw-captions, .jw-subtitles, .vjs-text-track-display, .vjs-text-track-cue, .vjs-subtitles, .plyr__captions, .plyr__caption, .shaka-text-container, .dplayer-subtitle, ::cue, video::cue, *::cue, .jw-logo, [class*=watermark], .time-slider, [class*=\"_slider_\"], [class*=\"_serverRow_\"], [class*=\"_server\"], [class*=\"_group_\"], [class*=\"_time_\"], [class*=\"_submenu\"], [class*=\"_radio\"], [class*=\"_menu\"], [data-media-slider], [data-media-button], [data-media-menu], [data-media-time-slider], [data-media-captions], media-time-range, media-slider, media-slider-value, media-slider-preview, [class*=\"control-bar\"], [class*=\"controlbar\"], [class*=\"player-controls\"], [class*=\"video-controls\"], [class*=\"bottom-controls\"], .fullpage-bg, [class*=\"fullpage\"], [class*=\"banner\"], [id*=\"banner\"], [class*=\"adbox\"], [id*=\"adbox\"], [class*=\"ad-\"]:not([class*=\"download\"]):not([class*=\"head\"]), [id*=\"ad-\"]:not([id*=\"download\"]):not([id*=\"head\"]), [class*=\"ads-\"], [id*=\"ads-\"], [class*=\"popunder\"], [id*=\"popunder\"], [class*=\"popup\"], [id*=\"popup\"], [id*=\"cinex-popunder\"], [class*=\"overlay\"]:not(#player-overlay), .b-lazy:not(img), [id*=\"histats\"], iframe[src*=\"ad\"], iframe[src*=\"pop\"], iframe[src*=\"click\"], [data-ad], [data-zone], a[target=\"_blank\"][href*=\"bet\"], a[target=\"_blank\"][href*=\"casino\"], .top-bar-gradient, .top-search-pill, .search-hint-text, .top-stats-cluster, .stat-icon, .stat-text, [class*=\"top-search\"], [class*=\"top-stats\"], [class*=\"top-bar\"], [class*=\"header-overlay\"], #ad-script-container, [id*=\"ad-script\"], [class*=\"ad-overlay\"], [id*=\"ad-overlay\"], [class*=\"countdown\"], [class*=\"smartlink\"], [data-ad-overlay], .ad-countdown-content, .ad-countdown-text, .ad-overlay-prompt, div[style*=\"z-index: 60\"], div[style*=\"zIndex: 60\"], div[style*=\"z-index:60\"], div[style*=\"zIndex:60\"], div[style*=\"z-index: 99999\"], div[style*=\"zIndex: 99999\"], div[style*=\"z-index: 99998\"], div[style*=\"zIndex: 99998\"] { display: none !important; opacity: 0 !important; visibility: hidden !important; pointer-events: none !important; height: 0 !important; max-height: 0 !important; overflow: hidden !important; }';\n" +
        "  function injectCleanCss() {\n" +
        "    try {\n" +
        "      var target = document.head || document.documentElement;\n" +
        "      if (!target) return;\n" +
        "      var style = document.getElementById('cinetv-embed-cleaner');\n" +
        "      if (!style) {\n" +
        "        style = document.createElement('style');\n" +
        "        style.id = 'cinetv-embed-cleaner';\n" +
        "        style.textContent = _cleanCss;\n" +
        "        target.appendChild(style);\n" +
        "      }\n" +
        "    } catch(e) {}\n" +
        "  }\n" +
        "  function sendToHost(type, payload) {\n" +
        "    try {\n" +
        "      var msg = JSON.stringify({ type: type, payload: payload, href: window.location.href });\n" +
        "      if (window.CineTvBridge && typeof window.CineTvBridge.postMessage === 'function') {\n" +
        "        window.CineTvBridge.postMessage(msg);\n" +
        "      }\n" +
        "      if (window.parent && window.parent !== window) {\n" +
        "        window.parent.postMessage({ fromCineTvHook: true, type: type, payload: payload }, '*');\n" +
        "      }\n" +
        "      if (window.top && window.top !== window) {\n" +
        "        window.top.postMessage({ fromCineTvHook: true, type: type, payload: payload }, '*');\n" +
        "      }\n" +
        "    } catch (e) {}\n" +
        "  }\n" +
        "  function reportState(force) {\n" +
        "    var v = activeVideo || document.querySelector('video');\n" +
        "    if (!v) return;\n" +
        "    var now = Date.now();\n" +
        "    if (!force && (now - lastReportedTime < 500)) return;\n" +
        "    lastReportedTime = now;\n" +
        "    sendToHost('VIDEO_STATE', {\n" +
        "      currentTime: v.currentTime || 0,\n" +
        "      duration: v.duration || 0,\n" +
        "      paused: v.paused,\n" +
        "      playbackRate: v.playbackRate || 1,\n" +
        "      volume: v.volume,\n" +
        "      muted: v.muted,\n" +
        "      src: v.currentSrc || v.src || ''\n" +
        "    });\n" +
        "  }\n" +
        "  function triggerAutoPlay(v) {\n" +
        "    if (!v) return;\n" +
        "    try {\n" +
        "      var p = v.play();\n" +
        "      if (p && typeof p.then === 'function') {\n" +
        "        p.then(function() {\n" +
        "          safeUnmute(v);\n" +
        "          reportState(true);\n" +
        "        }).catch(function() {\n" +
        "          try {\n" +
        "            v.muted = true;\n" +
        "            var p2 = v.play();\n" +
        "            if (p2 && typeof p2.then === 'function') {\n" +
        "              p2.then(function() {\n" +
        "                reportState(true);\n" +
        "                setTimeout(function() { safeUnmute(v); reportState(true); }, 800);\n" +
        "              }).catch(function() {});\n" +
        "            }\n" +
        "          } catch (e) {}\n" +
        "        });\n" +
        "      }\n" +
        "    } catch (e) {}\n" +
        "  }\n" +
        "  function clickPlayButtons() {\n" +
        "    var v = activeVideo || document.querySelector('video');\n" +
        "    if (v && !v.paused) return;\n" +
        "    var sel = [\n" +
        "      '#bigPlay', '#bigplay', '#bPlay', '.playbtnx', '#playbtnx',\n" +
        "      '.jw-bigplay', '.jw-display-icon-container', '.vjs-big-play-button', '.plyr__control--overlaid',\n" +
        "      'button[aria-label=\"Play\"]', 'button[aria-label=\"Reproduzir\"]',\n" +
        "      '#play', '.click-to-play', '.play-wrapper',\n" +
        "      '[data-plyr=\"play\"]', '.player-poster', '#player-poster',\n" +
        "      'media-play-button', 'vds-play-button', '[class*=\"play-button\"]',\n" +
        "      '[aria-label*=\"play\" i]', '.play-btn', 'button[title*=\"play\" i]',\n" +
        "      'button[aria-label*=\"reproduzir\" i]', '.jw-display-icon-display', '.art-state-init',\n" +
        "      'button[id*=\"play\" i]', 'div[id*=\"play\" i]'\n" +
        "    ];\n" +
        "    for (var i = 0; i < sel.length; i++) {\n" +
        "      try {\n" +
        "        var el = document.querySelector(sel[i]);\n" +
        "        if (el && typeof el.click === 'function') {\n" +
        "          el.click();\n" +
        "          break;\n" +
        "        }\n" +
        "      } catch (e) {}\n" +
        "    }\n" +
        "    if (v && v.paused) triggerAutoPlay(v);\n" +
        "  }\n" +
        "  function hookVideo(v) {\n" +
        "    if (!v || v.__cinetv_hooked) return;\n" +
        "    v.__cinetv_hooked = true;\n" +
        "    try { v.setAttribute('autoplay', 'true'); v.setAttribute('playsinline', 'true'); } catch(e) {}\n" +
        "    activeVideo = v;\n" +
        "    disableIframeCaptions();\n" +
        "    dismissUnmute();\n" +
        "    triggerAutoPlay(v);\n" +
        "    var evts = ['play', 'pause', 'playing', 'timeupdate', 'durationchange', 'seeking', 'seeked', 'loadedmetadata', 'ratechange'];\n" +
        "    for (var i = 0; i < evts.length; i++) {\n" +
        "      (function(ev) {\n" +
        "        v.addEventListener(ev, function() { reportState(ev !== 'timeupdate'); });\n" +
        "      })(evts[i]);\n" +
        "    }\n" +
        "    reportState(true);\n" +
        "  }\n" +
        "  function removeAdOverlays() {\n" +
        "    try {\n" +
        "      var adSels = [\n" +
        "        '.fullpage-bg', '[id*=\"popunder\"]', '[class*=\"popunder\"]',\n" +
        "        '#cinex-popunder-ad', '[id*=\"ad-\"]', '[class*=\"ad-banner\"]',\n" +
        "        'iframe[src*=\"sandbox\"]', 'iframe[src*=\"ad\"]', 'a[target=\"_blank\"][href*=\"bet\"]',\n" +
        "        'a[target=\"_blank\"][href*=\"casino\"]', '[class*=\"monetag\"]', '#ad-script-container',\n" +
        "        '[data-ad-overlay]', '.ad-overlay-prompt', '.ad-countdown-content'\n" +
        "      ];\n" +
        "      for (var a = 0; a < adSels.length; a++) {\n" +
        "        var ads = document.querySelectorAll(adSels[a]);\n" +
        "        for (var b = 0; b < ads.length; b++) {\n" +
        "          try { ads[b].remove(); } catch(e) { ads[b].style.display = 'none'; }\n" +
        "        }\n" +
        "      }\n" +
        "      var topGrad = document.querySelector('.top-bar-gradient');\n" +
        "      if (topGrad) {\n" +
        "        var p = topGrad.parentElement;\n" +
        "        if (p && p !== document.body && p !== document.documentElement) {\n" +
        "          try { p.remove(); } catch(e) { p.style.display = 'none'; }\n" +
        "        } else { try { topGrad.remove(); } catch(e) { topGrad.style.display = 'none'; } }\n" +
        "      }\n" +
        "      var searchPills = document.querySelectorAll('.top-search-pill, .search-hint-text, .top-stats-cluster');\n" +
        "      for (var spi = 0; spi < searchPills.length; spi++) {\n" +
        "        var sp = searchPills[spi];\n" +
        "        var topContainer = sp.closest('div[style*=\"z-index: 60\"], div[style*=\"z-index:60\"], div[style*=\"zIndex: 60\"], div[style*=\"zIndex:60\"]') || (sp.parentElement && sp.parentElement.parentElement && sp.parentElement.parentElement.parentElement);\n" +
        "        if (topContainer && topContainer !== document.body && topContainer !== document.documentElement) {\n" +
        "          try { topContainer.remove(); } catch(e) { topContainer.style.display = 'none'; }\n" +
        "        } else { try { sp.remove(); } catch(e) { sp.style.display = 'none'; } }\n" +
        "      }\n" +
        "      var allElements = document.querySelectorAll('button, a, div, span, p');\n" +
        "      for (var ai = 0; ai < allElements.length; ai++) {\n" +
        "        var el = allElements[ai];\n" +
        "        var txt = (el.textContent || '').trim();\n" +
        "        if (txt === 'SEARCH (S)' || txt.indexOf('SEARCH (S)') !== -1 || (txt.indexOf('SEARCH') !== -1 && el.tagName === 'BUTTON')) {\n" +
        "          var curr = el;\n" +
        "          while (curr && curr !== document.body && curr !== document.documentElement) {\n" +
        "            var r = curr.getBoundingClientRect();\n" +
        "            if (r.top <= 80 && !curr.querySelector('video')) {\n" +
        "              var par = curr.parentElement;\n" +
        "              if (par && par !== document.body && par !== document.documentElement && par.getBoundingClientRect().top <= 80 && !par.querySelector('video')) {\n" +
        "                curr = par;\n" +
        "              } else { break; }\n" +
        "            } else { break; }\n" +
        "          }\n" +
        "          if (curr && curr !== document.body && !curr.querySelector('video')) {\n" +
        "            try { curr.remove(); } catch(e) { curr.style.display = 'none'; }\n" +
        "          }\n" +
        "        }\n" +
        "      }\n" +
        "    } catch(e) {}\n" +
        "  }\n" +
        "  function scan() {\n" +
        "    injectCleanCss();\n" +
        "    removeAdOverlays();\n" +
        "    disableIframeCaptions();\n" +
        "    dismissUnmute();\n" +
        "    var vids = document.getElementsByTagName('video');\n" +
        "    for (var i = 0; i < vids.length; i++) {\n" +
        "      hookVideo(vids[i]);\n" +
        "    }\n" +
        "    try {\n" +
        "      var players = document.querySelectorAll('media-player, vds-media');\n" +
        "      for (var p = 0; p < players.length; p++) {\n" +
        "        if (players[p].shadowRoot) {\n" +
        "          var sVids = players[p].shadowRoot.querySelectorAll('video');\n" +
        "          for (var sv = 0; sv < sVids.length; sv++) hookVideo(sVids[sv]);\n" +
        "        }\n" +
        "      }\n" +
        "    } catch(e) {}\n" +
        "    if (!activeVideo || activeVideo.paused) clickPlayButtons();\n" +
        "  }\n" +
        "  scan();\n" +
        "  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan);\n" +
        "  window.addEventListener('load', function() { scan(); setTimeout(scan, 500); setTimeout(scan, 1500); setTimeout(scan, 3000); });\n" +
        "  try {\n" +
        "    var _obs = new MutationObserver(function() { removeAdOverlays(); injectCleanCss(); });\n" +
        "    if (document.documentElement) { _obs.observe(document.documentElement, { childList: true, subtree: true }); }\n" +
        "    else { document.addEventListener('DOMContentLoaded', function() { if (document.documentElement) _obs.observe(document.documentElement, { childList: true, subtree: true }); }); }\n" +
        "  } catch(e) {}\n" +
        "  var scanCount = 0;\n" +
        "  var scanInterval = setInterval(function() {\n" +
        "    scanCount++;\n" +
        "    scan();\n" +
        "    if ((activeVideo && !activeVideo.paused) || scanCount >= 20) {\n" +
        "      clearInterval(scanInterval);\n" +
        "    }\n" +
        "  }, 300);\n" +
        "  var keepAliveTimer = setInterval(function() {\n" +
        "    if (!activeVideo) scan();\n" +
        "    else {\n" +
        "      if (activeVideo.muted) safeUnmute(activeVideo);\n" +
        "      if (!activeVideo.paused) reportState(false);\n" +
        "    }\n" +
        "  }, 1000);\n" +
        "  function executeCommand(cmd) {\n" +
        "    if (!cmd) return;\n" +
        "    var action = cmd.action || cmd.type;\n" +
        "    var v = activeVideo || document.querySelector('video');\n" +
        "    if (action === 'disableSubtitles') {\n" +
        "      disableIframeCaptions();\n" +
        "      return;\n" +
        "    }\n" +
        "    if (action === 'unmute') {\n" +
        "      if (v) safeUnmute(v);\n" +
        "      dismissUnmute();\n" +
        "      reportState(true);\n" +
        "      return;\n" +
        "    }\n" +
        "    if (!v) { clickPlayButtons(); return;\n" +
        "    }\n" +
        "    if (action === 'play') {\n" +
        "      if (v.paused) {\n" +
        "        var p = v.play();\n" +
        "        if (p && typeof p.then === 'function') {\n" +
        "          p.then(function() { safeUnmute(v); }).catch(function() { v.muted = true; v.play().catch(function(){}); });\n" +
        "        }\n" +
        "      } else {\n" +
        "        safeUnmute(v);\n" +
        "      }\n" +
        "      reportState(true);\n" +
        "    } else if (action === 'pause') {\n" +
        "      if (!v.paused) { v.pause(); }\n" +
        "      reportState(true);\n" +
        "    } else if (action === 'togglePlay') {\n" +
        "      if (v.paused) {\n" +
        "        var p = v.play();\n" +
        "        if (p && typeof p.then === 'function') {\n" +
        "          p.then(function() { safeUnmute(v); }).catch(function() { v.muted = true; v.play().catch(function(){}); });\n" +
        "        }\n" +
        "      } else {\n" +
        "        v.pause();\n" +
        "      }\n" +
        "      reportState(true);\n" +
        "    } else if (action === 'seek') {\n" +
        "      var t = Number(cmd.time);\n" +
        "      if (!isNaN(t) && isFinite(t)) { v.currentTime = Math.max(0, Math.min(v.duration || Infinity, t)); reportState(true); }\n" +
        "    } else if (action === 'seekDelta') {\n" +
        "      var d = Number(cmd.delta);\n" +
        "      if (!isNaN(d) && isFinite(d)) {\n" +
        "        var cur = v.currentTime || 0;\n" +
        "        v.currentTime = Math.max(0, Math.min(v.duration || Infinity, cur + d));\n" +
        "        reportState(true);\n" +
        "      }\n" +
        "    } else if (action === 'setPlaybackRate') {\n" +
        "      var r = Number(cmd.rate);\n" +
        "      if (!isNaN(r) && r > 0) v.playbackRate = r;\n" +
        "    } else if (action === 'setVolume') {\n" +
        "      var vol = Number(cmd.volume);\n" +
        "      if (!isNaN(vol)) v.volume = Math.max(0, Math.min(1, vol));\n" +
        "    } else if (action === 'getState') {\n" +
        "      reportState(true);\n" +
        "    }\n" +
        "  }\n" +
        "  function setupBridgeListener() {\n" +
        "    if (window.CineTvBridge) {\n" +
        "      window.CineTvBridge.onmessage = function(event) {\n" +
        "        try {\n" +
        "          var d = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;\n" +
        "          executeCommand(d);\n" +
        "        } catch (err) {}\n" +
        "      };\n" +
        "    } else {\n" +
        "      setTimeout(setupBridgeListener, 250);\n" +
        "    }\n" +
        "  }\n" +
        "  setupBridgeListener();\n" +
        "  window.addEventListener('message', function(ev) {\n" +
        "    try {\n" +
        "      var d = ev.data;\n" +
        "      if (typeof d === 'string') { try { d = JSON.parse(d); } catch (e) {} }\n" +
        "      if (d && (d.cinetvCommand || d.action)) executeCommand(d);\n" +
        "    } catch (e) {}\n" +
        "  });\n" +
        "  window.__CineTvControl = executeCommand;\n" +
        "})();";

    /** Returns true when running on a TV or TV box (Android TV / Fire TV / Android Box). */
    private boolean isTvDevice() {
        try {
            android.app.UiModeManager uiModeManager = (android.app.UiModeManager) getSystemService(UI_MODE_SERVICE);
            if (uiModeManager != null && uiModeManager.getCurrentModeType() == android.content.res.Configuration.UI_MODE_TYPE_TELEVISION) {
                return true;
            }
            if (getPackageManager().hasSystemFeature("android.software.leanback") ||
                getPackageManager().hasSystemFeature("android.hardware.type.television")) {
                return true;
            }
            if (!getPackageManager().hasSystemFeature(android.content.pm.PackageManager.FEATURE_TOUCHSCREEN)) {
                return true;
            }
            android.os.BatteryManager bm = (android.os.BatteryManager) getSystemService(BATTERY_SERVICE);
            if (bm != null) {
                int capacity = bm.getIntProperty(android.os.BatteryManager.BATTERY_PROPERTY_CAPACITY);
                if (capacity <= 0 && !getPackageManager().hasSystemFeature(android.content.pm.PackageManager.FEATURE_TELEPHONY)) {
                    return true;
                }
            }
            String model = Build.MODEL != null ? Build.MODEL.toLowerCase() : "";
            String brand = Build.BRAND != null ? Build.BRAND.toLowerCase() : "";
            String product = Build.PRODUCT != null ? Build.PRODUCT.toLowerCase() : "";
            String hardware = Build.HARDWARE != null ? Build.HARDWARE.toLowerCase() : "";
            if (model.contains("tv") || model.contains("box") || model.contains("h96") || model.contains("x96") ||
                brand.contains("tv") || product.contains("tv") || product.contains("box") ||
                hardware.contains("amlogic") || hardware.contains("allwinner") || hardware.contains("rockchip")) {
                return true;
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    private void initMediaSession() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            try {
                mediaSession = new MediaSession(this, "CineTvMediaSession");
                mediaSession.setCallback(new MediaSession.Callback() {
                    @Override
                    public void onPlay() {
                        dispatchMediaPlayPause();
                    }

                    @Override
                    public void onPause() {
                        dispatchMediaPlayPause();
                    }

                    @Override
                    public void onFastForward() {
                        dispatchMediaFastForward();
                    }

                    @Override
                    public void onRewind() {
                        dispatchMediaRewind();
                    }
                });
                mediaSession.setFlags(MediaSession.FLAG_HANDLES_MEDIA_BUTTONS | MediaSession.FLAG_HANDLES_TRANSPORT_CONTROLS);
            } catch (Exception e) {
                android.util.Log.w("CineTV", "MediaSession init error: " + e.getMessage());
            }
        }
    }

    private void updateMediaSessionState(boolean isPlaying, long positionMs) {
        if (mediaSession != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            try {
                PlaybackState.Builder stateBuilder = new PlaybackState.Builder()
                    .setActions(
                        PlaybackState.ACTION_PLAY |
                        PlaybackState.ACTION_PAUSE |
                        PlaybackState.ACTION_PLAY_PAUSE |
                        PlaybackState.ACTION_FAST_FORWARD |
                        PlaybackState.ACTION_REWIND
                    );
                int state = isPlaying ? PlaybackState.STATE_PLAYING : PlaybackState.STATE_PAUSED;
                stateBuilder.setState(state, positionMs, 1.0f);
                mediaSession.setPlaybackState(stateBuilder.build());
            } catch (Exception ignored) {}
        }
    }

    private void initPipReceiver() {
        try {
            pipActionReceiver = new BroadcastReceiver() {
                @Override
                public void onReceive(Context context, Intent intent) {
                    if (intent == null) return;
                    String cmd = intent.getStringExtra(EXTRA_PIP_COMMAND);
                    if ("play_pause".equals(cmd)) {
                        dispatchMediaPlayPause();
                    } else if ("rewind".equals(cmd)) {
                        dispatchMediaRewind();
                    } else if ("forward".equals(cmd)) {
                        dispatchMediaFastForward();
                    }
                }
            };
            IntentFilter filter = new IntentFilter(ACTION_PIP_CONTROL);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                registerReceiver(pipActionReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
            } else {
                registerReceiver(pipActionReceiver, filter);
            }
        } catch (Exception e) {
            android.util.Log.w("CineTV", "PiP receiver register error: " + e.getMessage());
        }
    }

    public void updatePipParams(boolean active) {
        this.isPlayerActive = active;
        if (mediaSession != null) {
            mediaSession.setActive(active);
            updateMediaSessionState(active && !isReportedPaused, (long)(lastReportedCurrentTime * 1000));
        }
        // PiP is only for phones/tablets — skip entirely on TV boxes
        if (isTvDevice()) return;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            runOnUiThread(() -> {
                try {
                    if (getPackageManager().hasSystemFeature(android.content.pm.PackageManager.FEATURE_PICTURE_IN_PICTURE)) {
                        PictureInPictureParams.Builder builder = new PictureInPictureParams.Builder();
                        builder.setAspectRatio(new Rational(16, 9));
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                            builder.setAutoEnterEnabled(active);
                        }

                        if (active) {
                            ArrayList<RemoteAction> actions = new ArrayList<>();
                            int flag = Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
                                ? PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                                : PendingIntent.FLAG_UPDATE_CURRENT;

                            // 1. Rewind 10s
                            Intent rewIntent = new Intent(ACTION_PIP_CONTROL).putExtra(EXTRA_PIP_COMMAND, "rewind");
                            PendingIntent rewPi = PendingIntent.getBroadcast(this, 101, rewIntent, flag);
                            actions.add(new RemoteAction(
                                Icon.createWithResource(this, android.R.drawable.ic_media_rew),
                                "-10s", "-10s", rewPi
                            ));

                            // 2. Play / Pause
                            Intent playIntent = new Intent(ACTION_PIP_CONTROL).putExtra(EXTRA_PIP_COMMAND, "play_pause");
                            PendingIntent playPi = PendingIntent.getBroadcast(this, 102, playIntent, flag);
                            int playIconRes = isReportedPaused ? android.R.drawable.ic_media_play : android.R.drawable.ic_media_pause;
                            actions.add(new RemoteAction(
                                Icon.createWithResource(this, playIconRes),
                                isReportedPaused ? "Play" : "Pause", isReportedPaused ? "Play" : "Pause", playPi
                            ));

                            // 3. Fast Forward 10s
                            Intent ffIntent = new Intent(ACTION_PIP_CONTROL).putExtra(EXTRA_PIP_COMMAND, "forward");
                            PendingIntent ffPi = PendingIntent.getBroadcast(this, 103, ffIntent, flag);
                            actions.add(new RemoteAction(
                                Icon.createWithResource(this, android.R.drawable.ic_media_ff),
                                "+10s", "+10s", ffPi
                            ));

                            builder.setActions(actions);
                        }

                        setPictureInPictureParams(builder.build());
                    }
                } catch (Exception ignored) {}
            });
        }
    }

    @Override
    public void onResume() {
        super.onResume();
    }

    @Override
    public void onDestroy() {
        if (pipActionReceiver != null) {
            try {
                unregisterReceiver(pipActionReceiver);
            } catch (Exception ignored) {}
            pipActionReceiver = null;
        }
        if (mediaSession != null) {
            try {
                mediaSession.release();
            } catch (Exception ignored) {}
            mediaSession = null;
        }
        super.onDestroy();
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        initMediaSession();
        initPipReceiver();
        WebView.setWebContentsDebuggingEnabled(true);

        // Fill entire screen across display notch / camera cutouts (zero grey bars)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            WindowManager.LayoutParams lp = getWindow().getAttributes();
            lp.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            getWindow().setAttributes(lp);
        }
        getWindow().setBackgroundDrawable(new ColorDrawable(Color.BLACK));

        // Modern Android 10-15 Back Press & Gesture Dispatcher
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                WebView webView = getBridge() != null ? getBridge().getWebView() : null;
                if (webView != null) {
                    webView.evaluateJavascript("(function() { return window.handleAppBackButton ? window.handleAppBackButton() : false; })();", value -> {
                        if (!"true".equals(value)) {
                            // User is on main home page: minimize smoothly without killing app
                            moveTaskToBack(true);
                        }
                    });
                } else {
                    moveTaskToBack(true);
                }
            }
        });

        if (bridge != null && bridge.getWebView() != null) {
            WebView webView = bridge.getWebView();
            webView.setBackgroundColor(Color.BLACK);
            WebSettings settings = webView.getSettings();
            
            // Critical settings for Android TV box streaming & low memory performance
            settings.setJavaScriptEnabled(true);
            settings.setDomStorageEnabled(true);
            settings.setDatabaseEnabled(true);
            settings.setMediaPlaybackRequiresUserGesture(false);
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
            settings.setAllowFileAccess(true);
            settings.setCacheMode(WebSettings.LOAD_DEFAULT);
            settings.setLoadWithOverviewMode(true);
            settings.setUseWideViewPort(true);
            settings.setSupportMultipleWindows(false);
            settings.setJavaScriptCanOpenWindowsAutomatically(false);

            // Enable third-party cookies (critical for iframe embed players and CDN authentication)
            android.webkit.CookieManager cookieManager = android.webkit.CookieManager.getInstance();
            cookieManager.setAcceptCookie(true);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                cookieManager.setAcceptThirdPartyCookies(webView, true);
            }

            // LAYER_TYPE_NONE enables direct window surface compositing in Chromium,
            // preventing black video playback on TV box Mali/Allwinner/Amlogic GPUs
            webView.setLayerType(View.LAYER_TYPE_NONE, null);

            // Universal modern Chrome UA prevents TV bot/platform blocks (AutoEmbed, VidLink, Cloudflare)
            String universalUa = "Mozilla/5.0 (Linux; Android 13; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36";
            settings.setUserAgentString(universalUa);

            // Disable X-Requested-With header on external origins to prevent Cloudflare/Turnstile anti-bot checks from blocking TV WebViews
            try {
                if (WebViewFeature.isFeatureSupported(WebViewFeature.REQUESTED_WITH_HEADER_ALLOW_LIST)) {
                    androidx.webkit.WebSettingsCompat.setRequestedWithHeaderOriginAllowList(settings, Collections.emptySet());
                }
            } catch (Throwable ignored) {}

            // Ad-Shielding WebViewClient: blocks ad networks and external redirects
            webView.setWebViewClient(new BridgeWebViewClient(getBridge()) {
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    Uri url = request.getUrl();
                    String scheme = url.getScheme() != null ? url.getScheme().toLowerCase() : "";
                    String host = url.getHost() != null ? url.getHost().toLowerCase() : "";

                    // Always allow internal app requests
                    if ("localhost".equals(host) || "capacitor".equals(scheme)) {
                        return false;
                    }

                    // Allow Google Play Store and market:// links to open externally in Google Play app
                    if (host.contains("play.google.com") || "market".equals(scheme)) {
                        try {
                            android.content.Intent intent = new android.content.Intent(android.content.Intent.ACTION_VIEW, url);
                            intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
                            startActivity(intent);
                        } catch (Exception ignored) {}
                        return true;
                    }

                    // Subframes and redirects: immediately block known aggressive ad/casino redirect domains
                    String urlStr = url.toString().toLowerCase();
                    if (urlStr.contains("casino") || urlStr.contains("bet365") || urlStr.contains("blazebet") ||
                        urlStr.contains("1xbet") || urlStr.contains("bonushunter") || urlStr.contains("monetag") ||
                        urlStr.contains("adsterra") || urlStr.contains("chatmate") || urlStr.contains("post-court") ||
                        urlStr.contains("mossandtin") || urlStr.contains("push-sdk") || urlStr.contains("popcash") ||
                        urlStr.contains("exoclick") || urlStr.contains("juicyads") || urlStr.contains("propellerads") ||
                        urlStr.contains("sandbox.php") || urlStr.contains("embedblocked") || urlStr.contains("clickadu") ||
                        urlStr.contains("hilltopads") || urlStr.contains("aclib") || urlStr.contains("llvpn")) {
                        return true;
                    }

                    // Always allow legitimate video streaming engines and CDNs
                    if (host.contains("autoembed") || host.contains("nextgencloudfabric") ||
                        host.contains("cloudorchestranova") || host.contains("vidlink") ||
                        host.contains("vidsrc") || host.contains("vsembed") || host.contains("2embed") ||
                        host.contains("multiembed") || host.contains("superflix") || host.contains("redecanais") ||
                        host.contains("vidplay") || host.contains("megacloud") || host.contains("rabbitstream") ||
                        host.contains("smashystream") || host.contains("anyembed") ||
                        host.contains("strem") || host.contains("metahub") || host.contains("cloudflare") ||
                        host.contains("cinemeta") || host.contains("gstatic")) {
                        return false;
                    }

                    // Block external navigation / ad popups from redirecting the app to Chrome
                    if (request.isForMainFrame()) {
                        return true;
                    }

                    return false;
                }

                @Override
                public void onReceivedError(WebView view, WebResourceRequest request, android.webkit.WebResourceError error) {
                    // Suppress default Android WebView error page to avoid showing the white box with green Android robot
                    if (request.isForMainFrame()) {
                        view.loadData("<html><body style='background-color:#000000;'></body></html>", "text/html", "utf-8");
                    }
                }

                @Override
                public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                    String url = request.getUrl().toString().toLowerCase();
                    String originalUrl = request.getUrl().toString();

                    // Capture stream URLs from embed players (.m3u8 HLS playlists and direct .mp4s)
                    // These are the actual video streams used for playback — we save them for offline download
                    if (isPlayerActive && (url.contains(".m3u8") || url.contains(".mp4")) &&
                        !url.contains("ytimg") && !url.contains("googlevideo") &&
                        !url.contains("youtube") && !url.contains("thumbnail") &&
                        !url.contains("poster") && !url.contains("preview") &&
                        originalUrl.startsWith("http")) {
                        // Prefer master playlists (.m3u8) but a direct .mp4 works too
                        if (url.contains("master") || url.contains("index") || url.contains(".m3u8") ||
                            (url.contains(".mp4") && lastCapturedStreamUrl.isEmpty())) {
                            lastCapturedStreamUrl = originalUrl;
                        }
                    }

                    // Intercept and neutralize disable-devtool anti-debugging scripts that blank out embed player DOM
                    if (url.contains("disable-devtool")) {
                        return new WebResourceResponse("application/javascript", "utf-8", new ByteArrayInputStream("".getBytes()));
                    }

                    // Return valid empty VAST XML for video ad requests to skip pre-rolls instantly
                    if (url.contains("vast") || url.contains("vpaid") || url.contains("preroll") || url.contains("ad_rules") || url.contains("adtag")) {
                        String emptyVast = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><VAST version=\"3.0\"></VAST>";
                        return new WebResourceResponse("text/xml", "utf-8", new ByteArrayInputStream(emptyVast.getBytes()));
                    }

                    // Intercept AnyEmbed settings API to permanently disable all embedded ad campaigns and popunders
                    if (url.contains("/api/settings")) {
                        String disabledAdConfig = "[{\"key\":\"ad_config\",\"value\":\"{\\\"enabled\\\":false,\\\"triggers\\\":[],\\\"units\\\":[]}\"}]";
                        return new WebResourceResponse("application/json", "utf-8", new ByteArrayInputStream(disabledAdConfig.getBytes()));
                    }

                    // Intercept and neutralize known ad networks, trackers & popunders without blocking stream paths
                    if (url.contains("llvpn") || url.contains("adsco.re") || url.contains("aclib") ||
                        url.contains("cdn4ads") || url.contains("vhprose") || url.contains("qhprose") ||
                        url.contains("bajrgcgpxk") || url.contains("cegeliwsfihdv") || url.contains("histats") ||
                        url.contains("tag.min.js") || url.contains("sandbox.php") || url.contains("embedblocked") ||
                        url.contains("streamingnow.mov/sandbox") || url.contains("streamingnow.mov/?play=") ||
                        url.contains("ycookiejar") || url.contains("ocookiejar") ||
                        url.contains("hpyfemxn") || url.contains("fgiwttkijlcrrl") ||
                        url.contains("tagivi") || url.contains("doubleclick") || url.contains("googlesyndication") ||
                        url.contains("adservice.google") || url.contains("adsystem") || url.contains("adsterra") ||
                        url.contains("popcash") || url.contains("ignitioncasino") ||
                        url.contains("propellerads") || url.contains("exoclick") || url.contains("juicyads") ||
                        url.contains("onclickmega") || url.contains("popunder") || url.contains("adnxs") ||
                        url.contains("springserve") || url.contains("aniview") || url.contains("vdo.ai") ||
                        url.contains("vidazoo") || url.contains("spotxchange") || url.contains("openx.net") ||
                        url.contains("pubmatic") || url.contains("rubiconproject") || url.contains("outbrain") ||
                        url.contains("taboola") || url.contains("adx") || url.contains("trafficjunky") ||
                        url.contains("trafficfactory") || url.contains("revcontent") || url.contains("popads") ||
                        url.contains("revenuehits") || url.contains("monetag") || url.contains("hilltopads") ||
                        url.contains("clickadu") || url.contains("coinhive") || url.contains("chatmate") ||
                        url.contains("post-court") || url.contains("mossandtin") || url.contains("push-sdk") ||
                        url.contains("adserver") || url.contains("adskeeper") ||
                        url.contains("poringasitia") || url.contains("profiton") ||
                        url.contains("eq.") || url.contains("parklogic") ||
                        url.contains("casino") || url.contains("bet365") || url.contains("blazebet") ||
                        url.contains("1xbet") || url.contains("bonushunter")) {
                        return new WebResourceResponse("application/javascript", "utf-8", new ByteArrayInputStream("".getBytes()));
                    }

                    // Always allow legitimate video streaming engines, API calls, YouTube and CDNs
                    if (url.contains("autoembed") || url.contains("nextgencloudfabric") ||
                        url.contains("cloudorchestranova") || url.contains("vidlink") ||
                        url.contains("vidsrc") || url.contains("vsembed") || url.contains("2embed") ||
                        url.contains("multiembed") || url.contains("superflix") || url.contains("redecanais") ||
                        url.contains("vidplay") || url.contains("megacloud") || url.contains("rabbitstream") ||
                        url.contains("smashystream") || url.contains("anyembed") ||
                        url.contains(".m3u8") || url.contains(".ts") || url.contains(".mp4") ||
                        url.contains("youtube.com") || url.contains("youtu.be") || url.contains("googlevideo.com") ||
                        url.contains("ytimg.com") || url.contains("metahub.space") || url.contains("cinemeta") ||
                        url.contains("cloudflare") || url.contains("cdnjs") || url.contains("gstatic")) {
                        return super.shouldInterceptRequest(view, request);
                    }
                    return super.shouldInterceptRequest(view, request);
                }

                @Override
                public void onPageFinished(WebView view, String url) {
                    super.onPageFinished(view, url);
                    // NEVER inject ad killer into internal app UI (localhost / capacitor)
                    if (url != null && (url.contains("localhost") || url.startsWith("capacitor:"))) {
                        return;
                    }

                    // Prevent external embed popups from opening new windows
                    view.evaluateJavascript("try { window.open = function() { return null; }; } catch(e) {}", null);
                }
            });

            // Prevent window.open dialogs / popups & suppress third-party logcat spam
            webView.setWebChromeClient(new BridgeWebChromeClient(getBridge()) {
                @Override
                public boolean onCreateWindow(WebView view, boolean isDialog, boolean isUserGesture, android.os.Message resultMsg) {
                    return false;
                }

                @Override
                public boolean onConsoleMessage(android.webkit.ConsoleMessage consoleMessage) {
                    if (consoleMessage != null) {
                        String msg = consoleMessage.message();
                        String src = consoleMessage.sourceId();
                        if (msg != null) {
                            if (msg.contains("font-size:0") || msg.contains("cnrU5") || msg.contains("ODxGu4") ||
                                msg.contains("PhWMD5") || msg.contains("disable-devtool") || msg.contains("OTS parsing error")) {
                                return true;
                            }
                        }
                        if (src != null) {
                            if (src.contains("disable-devtool") || src.contains("jsdelivr") ||
                                src.contains("cloudflare") || src.contains("turnstile") ||
                                src.contains("streamingnow")) {
                                return true;
                            }
                        }
                    }
                    return super.onConsoleMessage(consoleMessage);
                }
            });

            // Register Native Controller under bridge names
            NativeInterface nativeBridge = new NativeInterface();
            webView.addJavascriptInterface(nativeBridge, "AndroidNative");
            webView.addJavascriptInterface(nativeBridge, "AndroidOrientation");
            webView.addJavascriptInterface(nativeBridge, "AndroidBridge");

            // Install Document-Start Controller Script into all frames and origins
            try {
                if (WebViewFeature.isFeatureSupported(WebViewFeature.DOCUMENT_START_SCRIPT)) {
                    Set<String> allOrigins = Collections.singleton("*");
                    WebViewCompat.addDocumentStartJavaScript(webView, CINETV_VIDEO_CONTROLLER_JS, allOrigins);
                }
            } catch (Exception e) {
                android.util.Log.w("CineTV", "Failed to register DOCUMENT_START_SCRIPT: " + e.getMessage());
            }

            // Install WebMessageListener for bidirectional control between app HUD and all iframe video players
            try {
                if (WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) {
                    Set<String> allOrigins = Collections.singleton("*");
                    WebViewCompat.addWebMessageListener(webView, "CineTvBridge", allOrigins, new WebViewCompat.WebMessageListener() {
                        @Override
                        public void onPostMessage(WebView view, WebMessageCompat message, Uri sourceOrigin, boolean isMainFrame, JavaScriptReplyProxy replyProxy) {
                            if (isMainFrame) return;
                            String data = message.getData();
                            if (data == null || data.trim().isEmpty()) return;
                            try {
                                JSONObject json = new JSONObject(data);
                                String type = json.optString("type", "");
                                if ("VIDEO_STATE".equals(type)) {
                                    lastActiveVideoProxy = replyProxy;
                                    if (!videoReplyProxies.contains(replyProxy)) {
                                        videoReplyProxies.add(replyProxy);
                                    }
                                    JSONObject payload = json.optJSONObject("payload");
                                    if (payload != null) {
                                        lastReportedCurrentTime = payload.optDouble("currentTime", 0.0);
                                        lastReportedDuration = payload.optDouble("duration", 0.0);
                                        isReportedPaused = payload.optBoolean("paused", true);
                                        String streamSrc = payload.optString("src", "");
                                        if (!streamSrc.isEmpty() && (streamSrc.contains(".m3u8") || streamSrc.contains(".mp4"))) {
                                            lastCapturedStreamUrl = streamSrc;
                                        }
                                    }

                                    runOnUiThread(() -> {
                                        updateMediaSessionState(!isReportedPaused, (long)(lastReportedCurrentTime * 1000));
                                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && isInPictureInPictureMode()) {
                                            updatePipParams(true);
                                        }
                                        WebView mainWebView = getBridge() != null ? getBridge().getWebView() : null;
                                        if (mainWebView != null) {
                                            mainWebView.evaluateJavascript("if (window.onCineTvVideoState) { window.onCineTvVideoState(" + data + "); }", null);
                                        }
                                    });
                                }
                            } catch (Exception ignored) {}
                        }
                    });
                }
            } catch (Exception e) {
                android.util.Log.w("CineTV", "Failed to register WEB_MESSAGE_LISTENER: " + e.getMessage());
            }
        }
    }

    private long lastUnmuteDispatchTime = 0;

    @Override
    public boolean dispatchTouchEvent(MotionEvent ev) {
        if (isSyntheticHardwareTap) {
            return super.dispatchTouchEvent(ev);
        }
        if (isPlayerActive && ev.getAction() == MotionEvent.ACTION_UP) {
            long now = SystemClock.uptimeMillis();
            if (now - lastUnmuteDispatchTime > 800) {
                lastUnmuteDispatchTime = now;
                sendVideoCommand("{\"action\":\"unmute\"}");
            }
        }
        return super.dispatchTouchEvent(ev);
    }

    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        if (isInternalKeyDispatch) {
            return super.dispatchKeyEvent(event);
        }
        WebView webView = getBridge() != null ? getBridge().getWebView() : null;
        if (webView != null) {
            int keyCode = event.getKeyCode();
            boolean isDpadOrNav = (
                keyCode == KeyEvent.KEYCODE_DPAD_UP ||
                keyCode == KeyEvent.KEYCODE_DPAD_DOWN ||
                keyCode == KeyEvent.KEYCODE_DPAD_LEFT ||
                keyCode == KeyEvent.KEYCODE_DPAD_RIGHT ||
                keyCode == KeyEvent.KEYCODE_DPAD_CENTER ||
                keyCode == KeyEvent.KEYCODE_ENTER ||
                keyCode == KeyEvent.KEYCODE_NUMPAD_ENTER ||
                keyCode == KeyEvent.KEYCODE_BACK ||
                keyCode == KeyEvent.KEYCODE_ESCAPE ||
                keyCode == KeyEvent.KEYCODE_MENU ||
                keyCode == KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE ||
                keyCode == KeyEvent.KEYCODE_HEADSETHOOK ||
                keyCode == KeyEvent.KEYCODE_MEDIA_PLAY ||
                keyCode == KeyEvent.KEYCODE_MEDIA_PAUSE ||
                keyCode == KeyEvent.KEYCODE_MEDIA_FAST_FORWARD ||
                keyCode == KeyEvent.KEYCODE_MEDIA_REWIND
            );

            if (isDpadOrNav) {
                String keyName = "Enter";
                if (keyCode == KeyEvent.KEYCODE_DPAD_UP) keyName = "ArrowUp";
                else if (keyCode == KeyEvent.KEYCODE_DPAD_DOWN) keyName = "ArrowDown";
                else if (keyCode == KeyEvent.KEYCODE_DPAD_LEFT) keyName = "ArrowLeft";
                else if (keyCode == KeyEvent.KEYCODE_DPAD_RIGHT) keyName = "ArrowRight";
                else if (keyCode == KeyEvent.KEYCODE_BACK || keyCode == KeyEvent.KEYCODE_ESCAPE) keyName = "Escape";
                else if (keyCode == KeyEvent.KEYCODE_MENU) keyName = "ContextMenu";
                else if (keyCode == KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE || keyCode == KeyEvent.KEYCODE_HEADSETHOOK) keyName = "MediaPlayPause";
                else if (keyCode == KeyEvent.KEYCODE_MEDIA_PLAY) keyName = "MediaPlay";
                else if (keyCode == KeyEvent.KEYCODE_MEDIA_PAUSE) keyName = "MediaPause";
                else if (keyCode == KeyEvent.KEYCODE_MEDIA_FAST_FORWARD) keyName = "FastForward";
                else if (keyCode == KeyEvent.KEYCODE_MEDIA_REWIND) keyName = "Rewind";

                final String finalKey = keyName;
                final int repeatCount = event.getRepeatCount();
                if (event.getAction() == KeyEvent.ACTION_DOWN) {
                    webView.evaluateJavascript(String.format("(function() { if (window.dispatchTvKey) { return window.dispatchTvKey('%s', %d); } return false; })();", finalKey, repeatCount), null);
                } else if (event.getAction() == KeyEvent.ACTION_UP) {
                    webView.evaluateJavascript(String.format("(function() { if (window.dispatchTvKeyUp) { return window.dispatchTvKeyUp('%s'); } return false; })();", finalKey), null);
                }
                return true;
            }
        }
        return super.dispatchKeyEvent(event);
    }

    @Override
    public void onBackPressed() {
        WebView webView = getBridge() != null ? getBridge().getWebView() : null;
        if (webView != null) {
            webView.evaluateJavascript("(function() { return window.handleAppBackButton ? window.handleAppBackButton() : false; })();", value -> {
                if (!"true".equals(value)) {
                    moveTaskToBack(true);
                }
            });
            return;
        }
        super.onBackPressed();
    }

    @Override
    protected void onUserLeaveHint() {
        super.onUserLeaveHint();
        // Never enter PiP on TV boxes — only on phones/tablets
        if (isPlayerActive && !isTvDevice() && Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            enterPip();
        }
    }

    @Override
    public void onPictureInPictureModeChanged(boolean isInPictureInPictureMode, Configuration newConfig) {
        super.onPictureInPictureModeChanged(isInPictureInPictureMode, newConfig);
        WebView webView = getBridge() != null ? getBridge().getWebView() : null;
        if (webView != null) {
            webView.evaluateJavascript(String.format("(function() { if (window.cinePlayerInstance && window.cinePlayerInstance.onPipModeChanged) { window.cinePlayerInstance.onPipModeChanged(%b); } })();", isInPictureInPictureMode), null);
        }
    }

    public void enterPip() {
        if (isTvDevice()) return;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            runOnUiThread(() -> {
                try {
                    if (getPackageManager().hasSystemFeature(android.content.pm.PackageManager.FEATURE_PICTURE_IN_PICTURE)) {
                        PictureInPictureParams.Builder builder = new PictureInPictureParams.Builder();
                        Rational aspectRatio = new Rational(16, 9);
                        builder.setAspectRatio(aspectRatio);
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                            builder.setAutoEnterEnabled(true);
                        }

                        ArrayList<RemoteAction> actions = new ArrayList<>();
                        int flag = Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
                            ? PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                            : PendingIntent.FLAG_UPDATE_CURRENT;

                        Intent rewIntent = new Intent(ACTION_PIP_CONTROL).putExtra(EXTRA_PIP_COMMAND, "rewind");
                        PendingIntent rewPi = PendingIntent.getBroadcast(this, 101, rewIntent, flag);
                        actions.add(new RemoteAction(Icon.createWithResource(this, android.R.drawable.ic_media_rew), "-10s", "-10s", rewPi));

                        Intent playIntent = new Intent(ACTION_PIP_CONTROL).putExtra(EXTRA_PIP_COMMAND, "play_pause");
                        PendingIntent playPi = PendingIntent.getBroadcast(this, 102, playIntent, flag);
                        int playIconRes = isReportedPaused ? android.R.drawable.ic_media_play : android.R.drawable.ic_media_pause;
                        actions.add(new RemoteAction(Icon.createWithResource(this, playIconRes), isReportedPaused ? "Play" : "Pause", isReportedPaused ? "Play" : "Pause", playPi));

                        Intent ffIntent = new Intent(ACTION_PIP_CONTROL).putExtra(EXTRA_PIP_COMMAND, "forward");
                        PendingIntent ffPi = PendingIntent.getBroadcast(this, 103, ffIntent, flag);
                        actions.add(new RemoteAction(Icon.createWithResource(this, android.R.drawable.ic_media_ff), "+10s", "+10s", ffPi));

                        builder.setActions(actions);
                        enterPictureInPictureMode(builder.build());
                    }
                } catch (Exception e) {
                    try {
                        enterPictureInPictureMode();
                    } catch (Exception ignored) {}
                }
            });
        }
    }

    public void dispatchHardwareTap(final float x, final float y) {
        runOnUiThread(() -> {
            WebView webView = getBridge() != null ? getBridge().getWebView() : null;
            if (webView == null) return;

            isSyntheticHardwareTap = true;
            try {
                long downTime = SystemClock.uptimeMillis();
                int source = isTvDevice() ? InputDevice.SOURCE_MOUSE : InputDevice.SOURCE_TOUCHSCREEN;

                MotionEvent down = MotionEvent.obtain(
                    downTime,
                    downTime,
                    MotionEvent.ACTION_DOWN,
                    x,
                    y,
                    1.0f, // pressure
                    1.0f, // size
                    0,    // metaState
                    1.0f, // xPrecision
                    1.0f, // yPrecision
                    0,    // deviceId
                    0     // edgeFlags
                );
                down.setSource(source);
                webView.dispatchTouchEvent(down);

                // On TV boxes without native touchscreen, also dispatch touch event as fallback for Chromium gesture detector
                if (isTvDevice()) {
                    MotionEvent downTouch = MotionEvent.obtain(down);
                    downTouch.setSource(InputDevice.SOURCE_TOUCHSCREEN);
                    webView.dispatchTouchEvent(downTouch);
                }

                webView.postDelayed(() -> {
                    try {
                        long upTime = SystemClock.uptimeMillis();
                        MotionEvent up = MotionEvent.obtain(
                            downTime,
                            upTime,
                            MotionEvent.ACTION_UP,
                            x,
                            y,
                            0.0f, // pressure
                            1.0f, // size
                            0,    // metaState
                            1.0f, // xPrecision
                            1.0f, // yPrecision
                            0,    // deviceId
                            0     // edgeFlags
                        );
                        up.setSource(source);
                        webView.dispatchTouchEvent(up);

                        if (isTvDevice()) {
                            MotionEvent upTouch = MotionEvent.obtain(up);
                            upTouch.setSource(InputDevice.SOURCE_TOUCHSCREEN);
                            webView.dispatchTouchEvent(upTouch);
                        }
                    } finally {
                        isSyntheticHardwareTap = false;
                    }
                }, 70);
            } catch (Exception e) {
                isSyntheticHardwareTap = false;
            }
        });
    }

    public void simulateClickCenter() {
        simulateClickAt(0.50f, 0.50f);
    }

    public void simulateDoubleTapLeft() {
        simulateDoubleTapAt(0.25f, 0.50f);
    }

    public void simulateDoubleTapRight() {
        simulateDoubleTapAt(0.75f, 0.50f);
    }

    public void simulateDoubleTapAt(float xRatio, float yRatio) {
        runOnUiThread(() -> {
            WebView webView = getBridge() != null ? getBridge().getWebView() : null;
            if (webView == null) return;

            int width = webView.getWidth();
            int height = webView.getHeight();
            if (width <= 0 || height <= 0) {
                android.util.DisplayMetrics dm = getResources().getDisplayMetrics();
                width = dm.widthPixels;
                height = dm.heightPixels;
            }

            float x = width * xRatio;
            float y = height * yRatio;

            dispatchHardwareTap(x, y);

            webView.postDelayed(() -> {
                dispatchHardwareTap(x, y);
            }, 140);
        });
    }

    public void simulateClickAt(float xRatio, float yRatio) {
        runOnUiThread(() -> {
            WebView webView = getBridge() != null ? getBridge().getWebView() : null;
            if (webView == null) return;

            int width = webView.getWidth();
            int height = webView.getHeight();
            if (width <= 0 || height <= 0) {
                android.util.DisplayMetrics dm = getResources().getDisplayMetrics();
                width = dm.widthPixels;
                height = dm.heightPixels;
            }

            float x = width * xRatio;
            float y = height * yRatio;
            dispatchHardwareTap(x, y);
        });
    }

    public void simulateClickPixel(float x, float y) {
        dispatchHardwareTap(x, y);
    }

    public void sendVideoCommand(String jsonCommand) {
        if (jsonCommand == null || jsonCommand.trim().isEmpty()) return;
        if (lastActiveVideoProxy != null) {
            try {
                lastActiveVideoProxy.postMessage(jsonCommand);
            } catch (Exception ignored) {}
        }
        for (JavaScriptReplyProxy proxy : videoReplyProxies) {
            try {
                if (proxy != lastActiveVideoProxy) {
                    proxy.postMessage(jsonCommand);
                }
            } catch (Exception ignored) {}
        }
        runOnUiThread(() -> {
            WebView webView = getBridge() != null ? getBridge().getWebView() : null;
            if (webView != null) {
                webView.evaluateJavascript("(function() { try { var c = " + jsonCommand + "; if (window.__CineTvControl) window.__CineTvControl(c); } catch(e){} })();", null);
                webView.evaluateJavascript("(function() { try { var frames = document.querySelectorAll('iframe'); for(var i=0; i<frames.length; i++) { try { frames[i].contentWindow.postMessage(" + jsonCommand + ", '*'); } catch(e){} } } catch(e){} })();", null);
            }
        });
    }

    public void dispatchMediaPlayPause() {
        sendVideoCommand("{\"action\":\"togglePlay\"}");
        runOnUiThread(() -> {
            WebView webView = getBridge() != null ? getBridge().getWebView() : null;
            if (webView != null) {
                webView.evaluateJavascript("if (window.cinePlayerInstance) window.cinePlayerInstance.togglePlay();", null);
            }
        });
    }

    private boolean isNativeSeeking = false;

    public void dispatchMediaRewind() {
        if (isNativeSeeking) return;
        isNativeSeeking = true;
        try {
            sendVideoCommand("{\"action\":\"seekDelta\",\"delta\":-10}");
            runOnUiThread(() -> {
                WebView webView = getBridge() != null ? getBridge().getWebView() : null;
                if (webView != null) {
                    webView.evaluateJavascript("if (window.cinePlayerInstance && typeof window.cinePlayerInstance.seekFromNative === 'function') window.cinePlayerInstance.seekFromNative(-10);", null);
                }
            });
        } finally {
            isNativeSeeking = false;
        }
    }

    public void dispatchMediaFastForward() {
        if (isNativeSeeking) return;
        isNativeSeeking = true;
        try {
            sendVideoCommand("{\"action\":\"seekDelta\",\"delta\":10}");
            runOnUiThread(() -> {
                WebView webView = getBridge() != null ? getBridge().getWebView() : null;
                if (webView != null) {
                    webView.evaluateJavascript("if (window.cinePlayerInstance && typeof window.cinePlayerInstance.seekFromNative === 'function') window.cinePlayerInstance.seekFromNative(10);", null);
                }
            });
        } finally {
            isNativeSeeking = false;
        }
    }

    public void dispatchScrubberClick(float ratio) {
        if (lastReportedDuration > 0) {
            double target = Math.max(0.0, Math.min(lastReportedDuration, (double) ratio * lastReportedDuration));
            sendVideoCommand("{\"action\":\"seek\",\"time\":" + target + "}");
        }
    }

    public class NativeInterface {
        @JavascriptInterface
        public void setLandscape() {
            runOnUiThread(() -> {
                setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                    WindowManager.LayoutParams lp = getWindow().getAttributes();
                    lp.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
                    getWindow().setAttributes(lp);
                }
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                    WindowInsetsController controller = getWindow().getInsetsController();
                    if (controller != null) {
                        controller.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
                        controller.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
                    }
                } else {
                    getWindow().getDecorView().setSystemUiVisibility(
                        View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                        | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                        | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                    );
                }
            });
        }

        @JavascriptInterface
        public void setPortrait() {
            runOnUiThread(() -> {
                setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                    WindowInsetsController controller = getWindow().getInsetsController();
                    if (controller != null) {
                        controller.show(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
                    }
                } else {
                    getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_VISIBLE);
                }
            });
        }

        @JavascriptInterface
        public void minimizeApp() {
            runOnUiThread(() -> moveTaskToBack(true));
        }

        @JavascriptInterface
        public void openYouTube(String videoId) {
            runOnUiThread(() -> {
                if (videoId == null || videoId.trim().isEmpty()) return;
                try {
                    // Try native YouTube app directly
                    android.content.Intent appIntent = new android.content.Intent(android.content.Intent.ACTION_VIEW, Uri.parse("vnd.youtube:" + videoId.trim()));
                    appIntent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(appIntent);
                } catch (Exception e) {
                    try {
                        // Fallback to web URL
                        android.content.Intent webIntent = new android.content.Intent(android.content.Intent.ACTION_VIEW, Uri.parse("https://www.youtube.com/watch?v=" + videoId.trim()));
                        webIntent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
                        startActivity(webIntent);
                    } catch (Exception ignored) {}
                }
            });
        }

        @JavascriptInterface
        public void openExternalUrl(String url) {
            runOnUiThread(() -> {
                if (url == null || url.trim().isEmpty()) return;
                try {
                    android.content.Intent intent = new android.content.Intent(android.content.Intent.ACTION_VIEW, Uri.parse(url.trim()));
                    intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(intent);
                } catch (Exception ignored) {}
            });
        }

        @JavascriptInterface
        public void openCastSettings() {
            runOnUiThread(() -> {
                // 1. First priority on Samsung (Galaxy S24, etc.): Samsung Smart View CastingActivity
                try {
                    android.content.Intent smartViewIntent = new android.content.Intent();
                    smartViewIntent.setClassName("com.samsung.android.smartmirroring", "com.samsung.android.smartmirroring.CastingActivity");
                    smartViewIntent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(smartViewIntent);
                    return;
                } catch (Exception ignored) {}

                // 2. Android System Cast Settings (Pixel, Motorola, Xiaomi, OnePlus)
                try {
                    android.content.Intent intent = new android.content.Intent("android.settings.CAST_SETTINGS");
                    intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(intent);
                    return;
                } catch (Exception ignored) {}

                // 3. Android Provider Settings ACTION_CAST_SETTINGS
                try {
                    android.content.Intent intent = new android.content.Intent(android.provider.Settings.ACTION_CAST_SETTINGS);
                    intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(intent);
                    return;
                } catch (Exception ignored) {}

                // 4. Fallback to Wireless Display Settings
                try {
                    android.content.Intent intent = new android.content.Intent("android.settings.WIFI_DISPLAY_SETTINGS");
                    intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(intent);
                } catch (Exception ignored) {}
            });
        }

        @JavascriptInterface
        public void castWithChrome(String url) {
            runOnUiThread(() -> {
                if (url == null || url.trim().isEmpty()) return;
                try {
                    android.content.Intent chromeIntent = new android.content.Intent(android.content.Intent.ACTION_VIEW, Uri.parse(url.trim()));
                    chromeIntent.setPackage("com.android.chrome");
                    chromeIntent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(chromeIntent);
                } catch (Exception e) {
                    try {
                        android.content.Intent fallbackIntent = new android.content.Intent(android.content.Intent.ACTION_VIEW, Uri.parse(url.trim()));
                        fallbackIntent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
                        startActivity(fallbackIntent);
                    } catch (Exception ignored) {}
                }
            });
        }

        @JavascriptInterface
        public void castStream(String url, String title) {
            runOnUiThread(() -> {
                if (url == null || url.trim().isEmpty()) return;
                String cleanUrl = url.trim();
                try {
                    // Try Web Video Caster directly if installed
                    android.content.Intent wvcIntent = new android.content.Intent(android.content.Intent.ACTION_VIEW, Uri.parse(cleanUrl));
                    wvcIntent.setPackage("com.instantbits.cast.webvideo");
                    wvcIntent.putExtra("title", title != null ? title : "CineTv");
                    wvcIntent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(wvcIntent);
                    return;
                } catch (Exception ignored) {}

                try {
                    android.content.Intent castIntent = new android.content.Intent(android.content.Intent.ACTION_VIEW);
                    if (cleanUrl.contains(".m3u8")) {
                        castIntent.setDataAndType(Uri.parse(cleanUrl), "application/x-mpegURL");
                    } else if (cleanUrl.contains(".mp4")) {
                        castIntent.setDataAndType(Uri.parse(cleanUrl), "video/*");
                    } else {
                        castIntent.setData(Uri.parse(cleanUrl));
                    }
                    castIntent.putExtra("title", title != null ? title : "CineTv");
                    castIntent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);

                    android.content.Intent chooser = android.content.Intent.createChooser(castIntent, "Transmitir para TV / Cast");
                    chooser.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(chooser);
                } catch (Exception e) {
                    try {
                        android.content.Intent fallbackIntent = new android.content.Intent(android.content.Intent.ACTION_VIEW, Uri.parse(cleanUrl));
                        fallbackIntent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
                        startActivity(fallbackIntent);
                    } catch (Exception ignored) {}
                }
            });
        }

        @JavascriptInterface
        public void clickCenter() {
            MainActivity.this.simulateClickCenter();
        }

        @JavascriptInterface
        public void simulateClickCenter() {
            MainActivity.this.simulateClickCenter();
        }

        @JavascriptInterface
        public void clickAt(float xRatio, float yRatio) {
            simulateClickAt(xRatio, yRatio);
        }

        @JavascriptInterface
        public void clickPixel(float x, float y) {
            simulateClickPixel(x, y);
        }

        @JavascriptInterface
        public void doubleTapLeft() {
            simulateDoubleTapLeft();
        }

        @JavascriptInterface
        public void doubleTapRight() {
            simulateDoubleTapRight();
        }

        @JavascriptInterface
        public boolean isTV() {
            return MainActivity.this.isTvDevice();
        }

        @JavascriptInterface
        public void showKeyboard() {
            runOnUiThread(() -> {
                WebView webView = getBridge() != null ? getBridge().getWebView() : null;
                if (webView != null) {
                    android.view.inputmethod.InputMethodManager imm = (android.view.inputmethod.InputMethodManager) getSystemService(android.content.Context.INPUT_METHOD_SERVICE);
                    if (imm != null) {
                        imm.showSoftInput(webView, android.view.inputmethod.InputMethodManager.SHOW_IMPLICIT);
                    }
                }
            });
        }

        @JavascriptInterface
        public void setPlayerActive(boolean active) {
            MainActivity.this.isPlayerActive = active;
            updatePipParams(active);
            if (!active) {
                lastCapturedStreamUrl = "";
                lastActiveVideoProxy = null;
                videoReplyProxies.clear();
                lastReportedCurrentTime = 0.0;
                lastReportedDuration = 0.0;
                isReportedPaused = true;
            }
        }

        @JavascriptInterface
        public void dispatchMediaPlayPause() {
            MainActivity.this.dispatchMediaPlayPause();
        }

        @JavascriptInterface
        public void dispatchMediaRewind() {
            MainActivity.this.dispatchMediaRewind();
        }

        @JavascriptInterface
        public void dispatchMediaFastForward() {
            MainActivity.this.dispatchMediaFastForward();
        }

        @JavascriptInterface
        public void dispatchScrubberClick(float ratio) {
            MainActivity.this.dispatchScrubberClick(ratio);
        }

        @JavascriptInterface
        public void sendVideoCommand(String jsonCommand) {
            MainActivity.this.sendVideoCommand(jsonCommand);
        }

        @JavascriptInterface
        public double getVideoCurrentTime() {
            return lastReportedCurrentTime;
        }

        @JavascriptInterface
        public double getVideoDuration() {
            return lastReportedDuration;
        }

        @JavascriptInterface
        public boolean isVideoPaused() {
            return isReportedPaused;
        }

        @JavascriptInterface
        public String getLastStreamUrl() {
            return lastCapturedStreamUrl != null ? lastCapturedStreamUrl : "";
        }

        @JavascriptInterface
        public void clearStreamUrl() {
            lastCapturedStreamUrl = "";
        }

        @JavascriptInterface
        public void enterPipMode() {
            enterPip();
        }

        @JavascriptInterface
        public boolean isPipSupported() {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                return getPackageManager().hasSystemFeature(android.content.pm.PackageManager.FEATURE_PICTURE_IN_PICTURE);
            }
            return false;
        }

        @JavascriptInterface
        public boolean isInPipMode() {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                return isInPictureInPictureMode();
            }
            return false;
        }

        @JavascriptInterface
        public void startDownload(String title, String url, String poster, String mimeType) {
            runOnUiThread(() -> {
                try {
                    android.app.DownloadManager downloadManager = (android.app.DownloadManager) getSystemService(DOWNLOAD_SERVICE);
                    if (downloadManager == null || url == null || url.trim().isEmpty()) return;

                    Uri uri = Uri.parse(url.trim());
                    android.app.DownloadManager.Request request = new android.app.DownloadManager.Request(uri);
                    String safeTitle = (title != null && !title.trim().isEmpty()) ? title.trim() : "ColossalStream";
                    request.setTitle(safeTitle);
                    request.setDescription("Baixando com ColossalStream");
                    request.setNotificationVisibility(android.app.DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);

                    String fileName = safeTitle.replaceAll("[^a-zA-Z0-9.-]", "_") + ".mp4";
                    request.setDestinationInExternalPublicDir(android.os.Environment.DIRECTORY_DOWNLOADS, fileName);
                    request.setAllowedOverMetered(true);
                    request.setAllowedOverRoaming(true);

                    downloadManager.enqueue(request);
                    android.widget.Toast.makeText(MainActivity.this, "Download iniciado: " + safeTitle, android.widget.Toast.LENGTH_SHORT).show();
                } catch (Exception e) {
                    try {
                        android.widget.Toast.makeText(MainActivity.this, "Iniciando download...", android.widget.Toast.LENGTH_SHORT).show();
                    } catch (Exception ignored) {}
                }
            });
        }

        @JavascriptInterface
        public String getDeviceStorageInfo() {
            try {
                android.os.StatFs stat = new android.os.StatFs(android.os.Environment.getDataDirectory().getPath());
                long bytesAvailable = stat.getAvailableBytes();
                long bytesTotal = stat.getTotalBytes();
                double freeGB = (double) bytesAvailable / (1024L * 1024L * 1024L);
                double totalGB = (double) bytesTotal / (1024L * 1024L * 1024L);
                return String.format(java.util.Locale.US, "{\"freeGB\": %.1f, \"totalGB\": %.1f}", freeGB, totalGB);
            } catch (Exception e) {
                return "{\"freeGB\": 45.0, \"totalGB\": 128.0}";
            }
        }
    }
}
