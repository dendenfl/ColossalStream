# ColossalStream (CineTV) 🎬

A modern, high-performance streaming application designed for Android TV boxes, Google TV, mobile, and web browsers. Built with Vite, Tailwind CSS, Capacitor, and custom Android WebView integration with D-Pad spatial navigation.

## ✨ Features

- **📺 Full Android TV & Google TV Remote Support**: 2D spatial D-pad navigation, automatic focus trapping in modals, and Netflix-grade carousel scrolling.
- **⚡ Multi-Source VOD Streaming**: Multiple stream resolver fallbacks (AnyEmbed VIP, VidLink Ultra, 2Embed, VidSrc) with intelligent 9-second auto-failover.
- **🛡️ Native Ad-Shield**: Embedded native Android request interceptor that neutralizes popunders, redirects, and injects clean ad configuration directly at the WebView layer.
- **🎯 Dynamic Content Discovery**: Movies, Series, Discovery Hub with genre/mood pickers, and Continue Watching history.
- **🌐 Cloud Profiles & Watchlist**: Multi-profile system with Supabase cloud synchronization.
- **💬 Multi-Language & Subtitles**: English and Portuguese localization with real-time subtitle offset adjustments and sizing.

## 🛠️ Tech Stack

- **Frontend**: Vite 6, Vanilla JS (ES Modules), Tailwind CSS
- **Mobile/TV Shell**: Capacitor 6 with custom `MainActivity.java`
- **Streaming Engine**: HLS.js, Custom Embed Stream Controller & Watchdog
- **Data & Metadata**: Cinemeta / Stremio API, TMDB, Supabase

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ & npm
- Android Studio / Android SDK (API 34+)
- Java JDK 17+

### Install Dependencies

```bash
npm install
```

### Development Server

```bash
npm run dev
```

### Build Web Distribution

```bash
npm run build
```

### Android APK Build

Sync web assets to Capacitor Android project and compile debug APK:

```bash
npx cap sync android
cd android
./gradlew assembleDebug
```

The compiled APK will be generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`

## 📄 License

MIT
