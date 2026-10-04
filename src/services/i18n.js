/**
 * Internationalization (i18n) Service
 * Supports 100% English and 100% Portuguese with runtime toggling
 */

export const TRANSLATIONS = {
  en: {
    appTitle: "ColossalStream",
    appSubtitle: "Android TV & Phone • Movies & Series",
    unifiedCatalog: "Unified Catalog",
    homeTab: "Home",
    moviesTab: "Movies",
    seriesTab: "Series",
    myListTab: "My List",
    searchPlaceholder: "Search movies & series...",
    searchButton: "Search",
    searchResults: "results found",
    searching: "Searching all catalogs...",
    noResultsTitle: "No content found",
    noResultsDesc: "Try searching with another title.",
    emptyMyListTitle: "Your list is empty",
    emptyMyListDesc: "Save movies and series here to watch later.",
    exploreCatalog: "Explore Catalog",
    recentlyAdded: "Recently Added",
    recentlyAddedSub: "New Arrivals",
    comedyMovies: "Comedy & Entertainment",
    comedySub: "Laughs & Fun",
    moodTitle: "What are you in the mood for?",
    moodIntense: "Intense",
    moodFunny: "Funny",
    moodRomantic: "Romantic",
    moodThoughtful: "Thought-Provoking",
    moodFamily: "Family",
    moodThriller: "Thriller",
    watchNow: "Watch Now",
    play: "Watch",
    details: "Details",
    synopsisDetails: "Details & Episodes",
    synopsisTitle: "Synopsis",
    selectServer: "Streaming Player",
    selectSeason: "Season",
    selectEpisode: "Episode",
    episodesTitle: "Episodes & Seasons",
    episodeLabel: "Episode",
    seasonLabel: "Season",
    nextEpisode: "Next Ep ⏭",
    prevEpisode: "⏮ Prev Ep",
    back: "Back",
    close: "Close",
    remove: "Remove",
    serverLabel: "Server:",
    connecting: "Connecting to Secure Stream...",
    loadingPlayer: "",
    pause: "Pause",
    resume: "Play",
    audioTrack: "Audio:",
    subtitlesTrack: "Subtitles:",
    settingsTitle: "Settings",
    languageLabel: "App Language",
    english: "English",
    portuguese: "Português (Brasil)",
    saveSettings: "Save Settings",
    resumeModalTitle: "Continue Watching?",
    resumeModalSubtitle: "You stopped at",
    resumeModalContinue: "Continue",
    resumeModalStartOver: "Start from Beginning",
    tvHint: "TV Remote: ◄ and ► on D-Pad",
    mobileHint: "Phone: Swipe left or right",
    serverAuto: "Ultra HD 4K Server",
    serverVidSrc: "Ultra HD Alternative",
    serverMulti: "Multi-Language Server",
    fitToScreen: "Fit to Screen",
    originalAspect: "Original (16:9)",
    cast: "Cast",
    castToTv: "Cast to TV / Chromecast",
    castSmartView: "Smart View / Cast to TV",
    castSmartViewDesc: "Search for Samsung TV, LG, Chromecast & Roku on Wi-Fi",
    recommended: "Recommended",
    castChromeDesc: "Cast to TV or Chromecast with Google Chrome",
    castExternalDesc: "Open with external player (Web Video Caster / VLC)",
    streamingPlayer: "Streaming Server",
    subtitlesCC: "Subtitles (CC)",
    subtitlesTitle: "Subtitles & Captions",
    subtitlesDesc: "Choose preferred subtitles language below:",
    subtitlesOff: "Off",
    subtitlesPt: "Português (Brasil)",
    subtitlesEn: "English",
    subtitlesEs: "Español",
    subtitlesAuto: "Auto / Source Default",
    playerSettings: "Player Options",
    tvPointerMode: "TV Cursor",
    cursorHint: "TV Remote: Arrows move cursor • OK clicks player • Up goes to top bar",
    streamServers: "Servers",
    serverSlowTitle: "Server slow?",
    serverSlowDesc: "Click to try next server",
    switchServer: "Switch ➔",
    streamServersTitle: "Playback Servers",
    streamServersDesc: "If a server freezes or is slow, choose another below:",
    activeBadge: "Active ✓",
    cancel: "Cancel",
    moviesRowTitle: "Movies",
    seriesRowTitle: "Series",
    moviesSub: "Trending & Popular",
    seriesSub: "Seasons & Episodes",
    spotlight: "Featured",
    continueHome: "Continue Watching",
    continueMovies: "Continue Watching: Movies",
    continueSeries: "Continue Watching: Series",
    toWatchMovies: "To Watch: Movies",
    toWatchSeries: "To Watch: Series",
    continueSub: "Hold OK to remove",
    watchlistSub: "Hold OK to remove",
    holdToRemove: "Hold OK to remove",
    itemRemoved: "Item removed",
    addToWatchlist: "To Watch",
    inWatchlist: "In List",
    resumeBadge: "Resume",
    changeEpisode: "Episodes 📑",
    nowPlaying: "Now Playing",
    seasonPrefix: "Season",
    epPrefix: "Ep",
    emptyList: "No items added yet",
    seeAll: "All",
    allMoviesTitle: "All Movies",
    allSeriesTitle: "All Series",
    filterAll: "All",
    titles: "titles",
    loaded: "loaded",
    available: "available",
    trendingMovies: "Trending & Popular",
    actionMovies: "Action & Blockbusters",
    familyMovies: "Kids & Family (Animation)",
    scifiMovies: "Sci-Fi & Thrillers",
    topRatedMovies: "Top Rated Classics",
    trendingSeries: "Trending & Popular",
    crimeSeries: "Crime & Gripping Dramas",
    familySeries: "Kids & Family Animation",
    scifiSeries: "Sci-Fi & Fantasy",
    actionSeries: "Action & Adventure",
    trendingSub: "Global Hits",
    actionSub: "Adrenaline",
    familySub: "All Ages",
    scifiSub: "Mind Bending",
    topRatedSub: "IMDb Legends",
    crimeSub: "Dark & Intense",
    fantasySub: "Epic Universes",
    cine7BannerTitle: "Not sure what to watch?",
    cine7BannerDesc: "Get smart suggestions with Cine7 AI app",
    cine7BannerBtn: "Open Cine7 AI ➔",
    watchTrailer: "Watch Trailer",
    readMore: "Read more",
    readLess: "Read less",
    trailerTitle: "Official Trailer",
    castTitle: "Cast & Crew",
    directorLabel: "Director:",
    similarTitle: "More Like This",
    nextEpisodeBtn: "Next Episode ⏭",
    loadMore: "Load More Content ▾",
    loadingMore: "Loading more...",
    allLoaded: "All titles loaded",
    noTrailer: "Trailer unavailable",
    discoveryTab: "Discover",
    downloadsTab: "Downloads",
    discoveryTitle: "Smart Discovery Hub",
    filterByPlatform: "Original Platforms",
    filterByYear: "Release Year",
    filterByRating: "Minimum Rating",
    filterByGenre: "Genres",
    sortBy: "Sort By",
    sortPopular: "Most Popular",
    sortRating: "Highest Rated",
    sortYear: "Newest Releases",
    sortTitle: "Title (A-Z)",
    masterpieces: "★ 8.0+ Masterpieces",
    highRated: "★ 7.0+ High Quality",
    goodRated: "★ 6.0+",
    downloadBtn: "Download",
    downloading: "Downloading",
    downloaded: "Downloaded",
    playOffline: "Play Offline",
    deleteDownload: "Delete",
    storageUsed: "Used",
    storageFree: "Available",
    storageTitle: "Device Storage",
    noDownloads: "No downloaded titles",
    noDownloadsSub: "Download movies and episodes to watch offline anywhere.",
    whoIsWatching: "Who is watching?",
    addProfile: "Add Profile",
    editProfile: "Edit Profile",
    manageProfiles: "Manage Profiles",
    done: "Done",
    profileName: "Profile Name",
    kidsMode: "Kids Profile",
    kidsBadge: "KIDS",
    kidsDescription: "Only family, animation, and PG-rated content.",
    enterPin: "Enter 4-Digit Parent PIN",
    wrongPin: "Incorrect PIN. Try again.",
    exitKids: "Exit Kids Mode",
    saveProfile: "Save",
    chooseAvatar: "Choose Avatar",
    defaultProfile: "Primary",
    kidsProfileName: "Kids",
    storageSubtitle: "Device internal storage",
    storageApp: "CineTv Downloads",
    storageOther: "Other Apps / System",
    storageTotalPrefix: "Total:",
    watchOfflineBadge: "Watch 100% offline",
    confirmDeleteDownload: "Delete this download from device?",
    discoverySubtitle: "Explore top titles filtered by networks, years and ratings",
    allYears: "All Years",
    years2010s: "2010s",
    classicsYears: "Classics (< 2010)",
    allRatings: "All Ratings",
    ratingMasterpieces: "★ 8.0+ Masterpieces",
    ratingHigh: "★ 7.0+ High Quality",
    ratingGood: "★ 6.0+",
    tapAvatarToChange: "Tap an avatar below to change",
    profileNamePlaceholder: "Enter profile name...",
    defaultPinHint: "Default PIN: 1234",
    confirmBtn: "Confirm",
    activeProfileBadge: "Active",
    confirmDeleteProfile: "Do you really want to delete this profile?",
    customProfilesSubtitle: "Custom Profiles",
    cloudSyncTitle: "Cloud Sync",
    cloudSyncSubtitle: "Keep your Continue Watching & Watchlists synced between Phone and TV",
    authHeaderTitle: "Cloud Sync",
    authHeaderSubtitle: "Supabase • Phone & Android TV",
    authSwitchLang: "Português 🇧🇷",
    signInTab: "Sign In",
    signUpTab: "Create Account",
    authSignInPrompt: "Sign in to sync your watch history and favorites between Phone and TV.",
    authSignUpPrompt: "Create a free account to never lose your movies and series progress.",
    emailLabel: "Email Address",
    emailPlaceholder: "example@gmail.com",
    passwordLabel: "Password",
    confirmPasswordLabel: "Confirm Password",
    passwordPlaceholder: "••••••••",
    showPassword: "Show password",
    hidePassword: "Hide password",
    passwordsDoNotMatch: "Passwords do not match.",
    passwordTooShort: "Password must be at least 6 characters.",
    signInBtn: "Sign In",
    signUpBtn: "Create Account",
    signOutBtn: "Sign Out",
    forgotPasswordBtn: "Forgot password?",
    resetSentSuccess: "Password reset link sent to your email!",
    syncNowBtn: "Sync Now 🔄",
    syncing: "Syncing...",
    processing: "Processing...",
    syncSuccess: "Cloud sync completed successfully!",
    syncError: "Sync error. Please check connection.",
    loginSuccess: "Signed in successfully!",
    signedInAs: "Connected as",
    notSignedIn: "Not connected",
    lastSync: "Last sync:",
    justNow: "Just now",
    contWatchingStat: "Continue Watching",
    myListStat: "My List",
    itemsCount: "items",
    savedCount: "saved",
    tvCloudHint: "💡 Tip: When opening CineTv on your Smart TV, sign in with the same email to load all your progress instantly.",
    sqlSetupTitle: "⚙️ Database Setup (Supabase SQL)",
    sqlSetupDesc: "If you just created the project in Supabase, make sure you ran the sync table SQL script in Supabase SQL Editor:",
    sqlSetupNote: "Configured project URL: hxogstmhgcoifvowwbrf.supabase.co",
    emailConfirmNotice: "⚠️ Account created! If email confirmation is enabled in Supabase, check your inbox (and spam) to confirm your account before logging in.\n\n💡 Tip: In Supabase Dashboard -> Authentication -> Providers -> Email, you can turn OFF 'Confirm email' to allow immediate logins without verification!",
    emailAlreadyRegistered: "This email is already registered. Please sign in.",
    invalidCredentialsNotice: "Incorrect email or password. Use the eye icon 👁️ to verify your password, or check if email verification was required in your inbox.",
    cloudConfigTitle: "Supabase Settings",
    supabaseUrlLabel: "Supabase Project URL",
    supabaseAnonLabel: "Supabase Anon Key",
    saveConfigBtn: "Save Settings",
    defaultDescription: "Watch now in high definition with cinematic audio.",

    // Diagnostics & System Telemetry
    diagTitle: "Diagnostics & Logs",
    diagSubtitle: "Technical telemetry & error logs",
    diagReady: "Ready",
    diagDesc: "Copy device specifications, video player telemetry, and system errors to send to support.",
    diagCopyBtn: "Copy System Logs",
    diagViewBtn: "View",
    diagCopiedFeedback: "Logs copied to clipboard! Paste them in your chat.",
    diagCopiedBtn: "✓ Copied!",
    diagModalTitle: "Diagnostic Report & Logs",
    diagSelectAllHint: "Long press to select all",
    diagCopyAll: "Copy All",
    diagClose: "Close",
    diagViewingTitle: "Diagnostic Report & Logs",

    // Cloud Status
    cloudSyncSectionTitle: "Cloud Sync & Backup",
    cloudSyncSectionSubtitle: "Supabase Cloud Sync",
    cloudSyncSectionDesc: "Sync your watch history and watchlist automatically across TV, phone and web.",
    cloudConnected: "✓ Connected",
    cloudOffline: "Offline / Local",
    cloudManageAccount: "Manage Account ➔",
    cloudSignInAction: "Sign In / Sign Up ➔",

    // Player Strings
    screenLocked: "Screen Locked",
    screenUnlocked: "Screen Unlocked",
    tapToUnlock: "Tap to unlock",
    dialogueBoostActive: "Dialogue Boost Active",
    dialogueBoostOff: "Dialogue Boost Off",
    dialogueBoostTitle: "Dialogue Boost (Night Mode)",
    dialogueBoostSubtitle: "Boosts voices & compresses loud explosions",
    tryBackupServer: "Trying backup server: {0}...",
    pressServerOrPlay: "Press Server to change source or Play to retry",
    webViewOutdated: "Video may not start: your Android System WebView is outdated. Please update it in the Play Store.",
    videoFormatUnsupported: "This video format is not supported on this device.",
    streamStartTimeout: "The stream did not start. Check your connection or try another server.",
    subtitlesEmbroidHint: "If this video already has hardcoded subtitles on screen, select Off below.",
    fontSizeLabel: "Font Size",
    syncOffsetLabel: "Sync Offset",
    playNow: "Play Now",
    dismiss: "Dismiss",
    serverMultiEmbed: "Server 1 (AnyEmbed VIP - Zero Ads)",
    serverVidLink: "Server 2 (VidLink Ultra - Fast 4K)",
    server2Embed: "Server 3 (2Embed Prime)",
    serverVidSrc: "Server 4 (VidSrc Pro)",
    serverAutoEmbed: "Server 5 (AutoEmbed HD - Backup)",
  },
  pt: {
    appTitle: "ColossalStream",
    appSubtitle: "Android TV & Celular • Filmes & Séries",
    unifiedCatalog: "Catálogo Unificado",
    homeTab: "Início",
    moviesTab: "Filmes",
    seriesTab: "Séries",
    myListTab: "Minha Lista",
    searchPlaceholder: "Buscar filmes e séries...",
    searchButton: "Buscar",
    searchResults: "resultados encontrados",
    searching: "Buscando em todos os catálogos...",
    noResultsTitle: "Nenhum conteúdo encontrado",
    noResultsDesc: "Tente pesquisar com outro título.",
    emptyMyListTitle: "Sua lista está vazia",
    emptyMyListDesc: "Salve filmes e séries aqui para assistir mais tarde.",
    exploreCatalog: "Explorar Catálogo",
    recentlyAdded: "Adicionados Recentemente",
    recentlyAddedSub: "Novidades no App",
    comedyMovies: "Comédia & Entretenimento",
    comedySub: "Risadas & Diversão",
    moodTitle: "O que você quer assistir hoje?",
    moodIntense: "Intenso",
    moodFunny: "Divertido",
    moodRomantic: "Romântico",
    moodThoughtful: "Para Refletir",
    moodFamily: "Família",
    moodThriller: "Suspense",
    watchNow: "Assistir Agora",
    play: "Assistir",
    details: "Detalhes",
    synopsisDetails: "Sinopse & Episódios",
    synopsisTitle: "Sinopse",
    selectServer: "Player de Reprodução",
    selectSeason: "Temporada",
    selectEpisode: "Episódio",
    episodesTitle: "Episódios & Temporadas",
    episodeLabel: "Episódio",
    seasonLabel: "Temporada",
    nextEpisode: "Próximo Ep ⏭",
    prevEpisode: "⏮ Ep Anterior",
    back: "Voltar",
    close: "Fechar",
    remove: "Remover",
    serverLabel: "Servidor:",
    connecting: "Conectando ao Stream Seguro...",
    loadingPlayer: "",
    pause: "Pausar",
    resume: "Continuar",
    audioTrack: "Áudio:",
    subtitlesTrack: "Legendas:",
    settingsTitle: "Configurações",
    languageLabel: "Idioma do Aplicativo",
    english: "English",
    portuguese: "Português (Brasil)",
    saveSettings: "Salvar Configurações",
    resumeModalTitle: "Continuar de Onde Parou?",
    resumeModalSubtitle: "Você parou em",
    resumeModalContinue: "Continuar",
    resumeModalStartOver: "Começar do Início",
    tvHint: "Controle TV: ◄ e ► no D-Pad",
    mobileHint: "Celular: Deslize para a esquerda ou direita",
    serverAuto: "Servidor Ultra HD 4K",
    serverVidSrc: "Ultra HD Alternativo",
    serverMulti: "Servidor Multi-Idiomas",
    fitToScreen: "Ajustar à Tela",
    originalAspect: "Original (16:9)",
    cast: "Transmitir",
    castToTv: "Transmitir para TV / Chromecast",
    castSmartView: "Smart View / Transmitir para TV",
    castSmartViewDesc: "Buscar TVs Samsung, LG, Chromecast, Fire TV e Roku no Wi-Fi",
    recommended: "Recomendado",
    castChromeDesc: "Transmitir para Smart TV ou Chromecast pelo Google Chrome",
    castExternalDesc: "Abrir com app transmissor externo (Web Video Caster / VLC)",
    streamingPlayer: "Servidor de Transmissão",
    subtitlesCC: "Legendas (CC)",
    subtitlesTitle: "Legendas & Áudio",
    subtitlesDesc: "Escolha o idioma de legendas preferido abaixo:",
    subtitlesOff: "Desativado",
    subtitlesPt: "Português (Brasil)",
    subtitlesEn: "English",
    subtitlesEs: "Español",
    subtitlesAuto: "Automático / Padrão",
    playerSettings: "Opções do Player",
    tvPointerMode: "Cursor TV",
    cursorHint: "Controle TV: Setas movem o cursor • OK clica no player • Cima vai para a barra",
    streamServers: "Servidores",
    serverSlowTitle: "Servidor demorando?",
    serverSlowDesc: "Clique para tentar o próximo servidor",
    switchServer: "Trocar ➔",
    streamServersTitle: "Servidores de Reprodução",
    streamServersDesc: "Se um servidor travar ou estiver lento, escolha outro abaixo:",
    activeBadge: "Ativo ✓",
    cancel: "Cancelar",
    moviesRowTitle: "Filmes",
    seriesRowTitle: "Séries",
    moviesSub: "Populares & Lançamentos",
    seriesSub: "Temporadas & Episódios",
    spotlight: "Destaque",
    continueHome: "Continuar Assistindo",
    continueMovies: "Continuar Assistindo: Filmes",
    continueSeries: "Continuar Assistindo: Séries",
    toWatchMovies: "Para Assistir: Filmes",
    toWatchSeries: "Para Assistir: Séries",
    continueSub: "Segure OK p/ remover",
    watchlistSub: "Segure OK p/ remover",
    holdToRemove: "Segure OK p/ remover",
    itemRemoved: "Item removido",
    addToWatchlist: "Minha Lista",
    inWatchlist: "Na Lista",
    resumeBadge: "Retomar",
    changeEpisode: "Episódios 📑",
    nowPlaying: "Reproduzindo",
    seasonPrefix: "Temporada",
    epPrefix: "Ep",
    emptyList: "Nenhum item adicionado",
    seeAll: "Todos",
    allMoviesTitle: "Todos os Filmes",
    allSeriesTitle: "Todas as Séries",
    filterAll: "Todos",
    titles: "títulos",
    loaded: "carregados",
    available: "disponíveis",
    trendingMovies: "Em Alta & Populares",
    actionMovies: "Ação & Blockbusters",
    familyMovies: "Crianças & Família (Animação)",
    scifiMovies: "Ficção Científica & Suspense",
    topRatedMovies: "Clássicos Mais Votados",
    trendingSeries: "Em Alta & Populares",
    crimeSeries: "Crime & Dramas Intensos",
    familySeries: "Animações Infantis & Família",
    scifiSeries: "Ficção & Fantasia",
    actionSeries: "Ação & Aventura",
    trendingSub: "Sucessos Globais",
    actionSub: "Adrenalina Pura",
    familySub: "Para Toda a Família",
    scifiSub: "Outros Mundos",
    topRatedSub: "Lendas do Cinema",
    crimeSub: "Mistérios & Máfia",
    fantasySub: "Universos Épicos",
    cine7BannerTitle: "Não sabe o que assistir?",
    cine7BannerDesc: "Receba recomendações inteligentes com o app Cine7 AI",
    cine7BannerBtn: "Baixar Cine7 AI ➔",
    watchTrailer: "Ver Trailer",
    readMore: "Ver mais",
    readLess: "Ver menos",
    trailerTitle: "Trailer Oficial",
    castTitle: "Elenco Principal",
    directorLabel: "Diretor:",
    similarTitle: "Títulos Semelhantes",
    nextEpisodeBtn: "Próximo Ep ⏭",
    loadMore: "Carregar Mais Conteúdo ▾",
    loadingMore: "Carregando mais...",
    allLoaded: "Todos os títulos carregados",
    noTrailer: "Trailer indisponível",
    discoveryTab: "Descobrir",
    downloadsTab: "Baixados",
    discoveryTitle: "Central Inteligente de Descoberta",
    filterByPlatform: "Plataformas Originais",
    filterByYear: "Ano de Lançamento",
    filterByRating: "Nota Mínima",
    filterByGenre: "Gêneros",
    sortBy: "Ordenar Por",
    sortPopular: "Mais Populares",
    sortRating: "Melhor Avaliados",
    sortYear: "Lançamentos Mais Recentes",
    sortTitle: "Título (A-Z)",
    masterpieces: "★ 8.0+ Obras-Primas",
    highRated: "★ 7.0+ Alta Qualidade",
    goodRated: "★ 6.0+",
    downloadBtn: "Baixar",
    downloading: "Baixando",
    downloaded: "Baixado",
    playOffline: "Assistir Offline",
    deleteDownload: "Excluir",
    storageUsed: "Usado",
    storageFree: "Disponível",
    storageTitle: "Armazenamento do Aparelho",
    noDownloads: "Nenhum título baixado",
    noDownloadsSub: "Baixe filmes e episódios para assistir offline em qualquer lugar.",
    whoIsWatching: "Quem está assistindo?",
    addProfile: "Adicionar Perfil",
    editProfile: "Editar Perfil",
    manageProfiles: "Gerenciar Perfis",
    done: "Concluído",
    profileName: "Nome do Perfil",
    kidsMode: "Perfil Infantil (Kids)",
    kidsBadge: "KIDS",
    kidsDescription: "Apenas animações, conteúdo infantil e para toda a família.",
    enterPin: "Digite o PIN dos Pais (4 dígitos)",
    wrongPin: "PIN incorreto. Tente novamente.",
    exitKids: "Sair do Modo Kids",
    saveProfile: "Salvar",
    chooseAvatar: "Escolher Avatar",
    defaultProfile: "Principal",
    kidsProfileName: "Kids",
    storageSubtitle: "Armazenamento interno do dispositivo",
    storageApp: "CineTv Baixados",
    storageOther: "Outros Apps / Sistema",
    storageTotalPrefix: "Total:",
    watchOfflineBadge: "Assista 100% sem internet",
    confirmDeleteDownload: "Deseja excluir este download do aparelho?",
    discoverySubtitle: "Explore os melhores títulos filtrados por plataformas e notas",
    allYears: "Todos os Anos",
    years2010s: "Anos 2010",
    classicsYears: "Clássicos (< 2010)",
    allRatings: "Todas as Notas",
    ratingMasterpieces: "★ 8.0+ Obras-Primas",
    ratingHigh: "★ 7.0+ Alta Qualidade",
    ratingGood: "★ 6.0+",
    tapAvatarToChange: "Toque em um avatar abaixo para trocar",
    profileNamePlaceholder: "Digite o nome do perfil...",
    defaultPinHint: "PIN padrão: 1234",
    confirmBtn: "Confirmar",
    activeProfileBadge: "Ativo",
    confirmDeleteProfile: "Deseja realmente excluir este perfil?",
    customProfilesSubtitle: "Perfis Personalizados",
    cloudSyncTitle: "Sincronização na Nuvem",
    cloudSyncSubtitle: "Mantenha o 'Continuar Assistindo' e favoritos sincronizados entre Celular e TV",
    authHeaderTitle: "Sincronização na Nuvem",
    authHeaderSubtitle: "Supabase • Celular & Android TV",
    authSwitchLang: "English 🇺🇸",
    signInTab: "Entrar",
    signUpTab: "Criar Conta",
    authSignInPrompt: "Faça login para sincronizar seu histórico e favoritos entre Celular e TV.",
    authSignUpPrompt: "Crie uma conta gratuita para nunca perder seus filmes e episódios.",
    emailLabel: "Endereço de E-mail",
    emailPlaceholder: "exemplo@gmail.com",
    passwordLabel: "Senha",
    confirmPasswordLabel: "Confirmar Senha",
    passwordPlaceholder: "••••••••",
    showPassword: "Ver senha",
    hidePassword: "Ocultar senha",
    passwordsDoNotMatch: "As senhas não coincidem.",
    passwordTooShort: "A senha deve conter no mínimo 6 caracteres.",
    signInBtn: "Entrar",
    signUpBtn: "Criar Conta",
    signOutBtn: "Sair da Conta",
    forgotPasswordBtn: "Esqueceu a senha?",
    resetSentSuccess: "Link de redefinição enviado para seu e-mail!",
    syncNowBtn: "Sincronizar Agora 🔄",
    syncing: "Sincronizando...",
    processing: "Processando...",
    syncSuccess: "Sincronização na nuvem concluída com sucesso!",
    syncError: "Erro ao sincronizar. Verifique a conexão.",
    loginSuccess: "Login efetuado com sucesso!",
    signedInAs: "Conectado como",
    notSignedIn: "Não conectado",
    lastSync: "Último sync:",
    justNow: "Agora mesmo",
    contWatchingStat: "Continuar Assistindo",
    myListStat: "Minha Lista",
    itemsCount: "itens",
    savedCount: "salvos",
    tvCloudHint: "💡 Dica: Ao abrir o CineTv na sua Smart TV, faça login com o mesmo e-mail para carregar todo o seu progresso instantaneamente.",
    sqlSetupTitle: "⚙️ Configuração do Banco (Supabase SQL)",
    sqlSetupDesc: "Se você acabou de criar o projeto no Supabase, certifique-se de ter executado o script SQL no SQL Editor do Supabase:",
    sqlSetupNote: "URL do projeto configurado: hxogstmhgcoifvowwbrf.supabase.co",
    emailConfirmNotice: "⚠️ Conta criada! Se a confirmação de e-mail estiver ativa no Supabase, verifique sua caixa de entrada (e spam) para confirmar o e-mail antes de entrar.\n\n💡 Dica: No painel do Supabase -> Authentication -> Providers -> Email, você pode DESATIVAR 'Confirm email' para permitir login imediato sem precisar de confirmação!",
    emailAlreadyRegistered: "Este e-mail já está cadastrado. Por favor, faça login na aba Entrar.",
    invalidCredentialsNotice: "E-mail ou senha incorretos. Use o ícone de olho 👁️ para conferir sua senha, ou verifique se o Supabase exigiu confirmação no seu e-mail.",
    cloudConfigTitle: "Configurações do Supabase",
    supabaseUrlLabel: "URL do Projeto Supabase",
    supabaseAnonLabel: "Anon Key do Supabase",
    saveConfigBtn: "Salvar Configurações",
    defaultDescription: "Assista agora em alta definição com som cinematográfico.",

    // Diagnostics & System Telemetry
    diagTitle: "Diagnóstico & Logs",
    diagSubtitle: "Telemetria e suporte técnico",
    diagReady: "Pronto",
    diagDesc: "Copie as informações do dispositivo, estado do reprodutor e erros para enviar ao suporte.",
    diagCopyBtn: "Copiar Logs do Sistema",
    diagViewBtn: "Ver",
    diagCopiedFeedback: "Logs copiados para a área de transferência! Cole na conversa.",
    diagCopiedBtn: "✓ Copiado!",
    diagModalTitle: "Relatório de Diagnóstico & Logs",
    diagSelectAllHint: "Pressione e segure para selecionar tudo",
    diagCopyAll: "Copiar Tudo",
    diagClose: "Fechar",
    diagViewingTitle: "Relatório de Diagnóstico & Logs",

    // Cloud Status
    cloudSyncSectionTitle: "Nuvem & Sincronização",
    cloudSyncSectionSubtitle: "Supabase Cloud Sync",
    cloudSyncSectionDesc: "Sincronize seu histórico e lista de favoritos automaticamente entre TV, celular e computador.",
    cloudConnected: "✓ Conectado",
    cloudOffline: "Offline / Local",
    cloudManageAccount: "Gerenciar Conta ➔",
    cloudSignInAction: "Entrar / Conta ➔",

    // Player Strings
    screenLocked: "Tela Bloqueada",
    screenUnlocked: "Tela Desbloqueada",
    tapToUnlock: "Toque para desbloquear",
    dialogueBoostActive: "Clareza de Voz Ativada",
    dialogueBoostOff: "Clareza de Voz Desativada",
    dialogueBoostTitle: "Clareza de Voz (Modo Noite)",
    dialogueBoostSubtitle: "Destaca falas e atenua efeitos explosivos",
    tryBackupServer: "Alternando para servidor reserva: {0}...",
    pressServerOrPlay: "Pressione Servidor ou aperte Play para tentar",
    webViewOutdated: "O vídeo pode não iniciar: seu Android System WebView está desatualizado. Atualize-o na Play Store.",
    videoFormatUnsupported: "Este formato de vídeo não é suportado neste dispositivo.",
    streamStartTimeout: "O stream não iniciou. Verifique sua conexão ou tente outro servidor.",
    subtitlesEmbroidHint: "Se este vídeo já possui legendas embutidas na imagem, selecione Desativado abaixo.",
    fontSizeLabel: "Tamanho da Fonte",
    syncOffsetLabel: "Sincronia / Atraso",
    playNow: "Assistir Agora",
    dismiss: "Cancelar",
    serverMultiEmbed: "Servidor 1 (AnyEmbed VIP - Sem Anúncios)",
    serverVidLink: "Servidor 2 (VidLink Ultra - Rápido 4K)",
    server2Embed: "Servidor 3 (2Embed Prime)",
    serverVidSrc: "Servidor 4 (VidSrc Pro)",
    serverAutoEmbed: "Servidor 5 (AutoEmbed HD - Reserva)",
  }
};

const TITLE_TRANSLATIONS = {
  "tt9218128": {
    en: {
      title: "Gladiator II (2024)",
      desc: "Years after witnessing the death of the revered hero Maximus, Lucius is forced into the Colosseum to fight for Rome."
    },
    pt: {
      title: "Gladiador II (2024)",
      desc: "Anos depois de testemunhar a morte do reverenciado herói Máximo, Lucius é forçado a lutar no Coliseu para restaurar a glória de Roma."
    }
  },
  "tt15239678": {
    en: {
      title: "Dune: Part Two (2024)",
      desc: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family."
    },
    pt: {
      title: "Duna: Parte 2 (2024)",
      desc: "Paul Atreides se une a Chani e aos Fremen enquanto busca vingança contra os conspiradores que destruíram sua família."
    }
  },
  "tt6263850": {
    en: {
      title: "Deadpool & Wolverine (2024)",
      desc: "A listless Wade Wilson toils away in civilian life until the Time Variance Authority pulls him into a multiversal mission."
    },
    pt: {
      title: "Deadpool & Wolverine (2024)",
      desc: "Wade Wilson tenta viver uma vida pacata até que a Autoridade de Variância Temporal o recruta para salvar o multiverso."
    }
  },
  "tt8367814": {
    en: {
      title: "The Gentlemen (2019)",
      desc: "An American expat tries to sell off his highly profitable marijuana empire in London, triggering plots, schemes, and blackmail."
    },
    pt: {
      title: "Magnatas do Crime (2019)",
      desc: "Um expatriado americano tenta vender seu lucrativo império de maconha em Londres, desencadeando complôs e subornos."
    }
  },
  "tt15435876": {
    en: {
      title: "The Penguin (2024)",
      desc: "Following the events of The Batman, Oz Cobb strives to seize control of Gotham City's criminal underworld amidst the chaos."
    },
    pt: {
      title: "Pinguim (2024)",
      desc: "Após os eventos de The Batman, Oz Cobb luta para assumir o controle do submundo do crime de Gotham City em meio ao caos."
    }
  },
  "tt2788316": {
    en: {
      title: "Shōgun (2024)",
      desc: "In feudal Japan, Lord Yoshii Toranaga navigates mortal political threats as a mysterious English ship is found marooned in a nearby fishing village."
    },
    pt: {
      title: "Xógum: A Gloriosa Saga do Japão (2024)",
      desc: "No Japão feudal de 1600, Lorde Yoshii Toranaga luta por sua vida enquanto seus inimigos no Conselho de Regentes se unem contra ele."
    }
  },
  "tt11126994": {
    en: {
      title: "Arcane (2021)",
      desc: "Set in the League of Legends universe, two sisters fight on opposite sides of a war between the utopian city of Piltover and the oppressed underground Zaun."
    },
    pt: {
      title: "Arcane (2021)",
      desc: "Ambientada no universo de League of Legends, duas irmãs lutam em lados opostos de uma guerra entre a rica cidade de Piltover e a oprimida Zaun."
    }
  },
  "tt1190634": {
    en: {
      title: "The Boys (2019)",
      desc: "A group of vigilantes set out to take down corrupt superheroes who abuse their superpowers instead of using them for good."
    },
    pt: {
      title: "The Boys (2019)",
      desc: "Um grupo de vigilantes se propõe a derrubar super-heróis corruptos que abusam de seus superpoderes em vez de usá-los para o bem."
    }
  },
  "tt18411490": {
    en: {
      title: "Alien: Romulus (2024)",
      desc: "While scavenging the deep ends of a derelict space station, a group of young space colonizers come face to face with a terrifying alien life form."
    },
    pt: {
      title: "Alien: Romulus (2024)",
      desc: "Jovens colonizadores exploram uma estação abandonada e se deparam com a criatura mais aterradora do universo."
    }
  },
  "tt10366206": {
    en: {
      title: "John Wick: Chapter 4 (2023)",
      desc: "John Wick uncovers a path to defeating The High Table, facing off against a new enemy with powerful alliances across the globe."
    },
    pt: {
      title: "John Wick 4: Baba Yaga (2023)",
      desc: "John Wick descobre um caminho para derrotar a Alta Cúpula, mas terá que enfrentar um novo inimigo global implacável."
    }
  },
  "tt1745960": {
    en: {
      title: "Top Gun: Maverick (2022)",
      desc: "After thirty years, Maverick is still pushing the envelope as a top naval aviator, but must confront ghosts of his past."
    },
    pt: {
      title: "Top Gun: Maverick (2022)",
      desc: "Depois de mais de trinta anos como um dos principais aviadores da Marinha, Pete Mitchell treina novos recrutas para uma missão letal."
    }
  },
  "tt1392190": {
    en: {
      title: "Mad Max: Fury Road (2015)",
      desc: "In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler in search for her homeland with the aid of a group of female prisoners."
    },
    pt: {
      title: "Mad Max: Estrada da Fúria (2015)",
      desc: "Em um mundo pós-apocalíptico, Max se junta à Imperatriz Furiosa em uma fuga alucinante pelo deserto contra um tirano."
    }
  },
  "tt0468569": {
    en: {
      title: "The Dark Knight (2008)",
      desc: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests."
    },
    pt: {
      title: "Batman: O Cavaleiro das Trevas (2008)",
      desc: "Com a ajuda do tenente Jim Gordon e do promotor Harvey Dent, Batman combate o Coringa, um gênio psicopata que quer destruir Gotham."
    }
  },
  "tt4154796": {
    en: {
      title: "Avengers: Endgame (2019)",
      desc: "After the devastating events of Infinity War, the universe is in ruins. The remaining Avengers assemble once more to reverse Thanos' actions."
    },
    pt: {
      title: "Vingadores: Ultimato (2019)",
      desc: "Após o estalo devastador de Thanos, os Vingadores restantes se reúnem em uma última jornada no tempo para restaurar o universo."
    }
  },
  "tt12455644": {
    en: {
      title: "Moana 2 (2024)",
      desc: "Moana journeys to the far seas of Oceania after receiving an unexpected call from her wayfinding ancestors."
    },
    pt: {
      title: "Moana 2 (2024)",
      desc: "Moana e Maui reúnem uma nova tripulação de marinheiros improváveis para desbravar oceanos perigosos."
    }
  },
  "tt13622970": {
    en: {
      title: "Moana 2 (2024)",
      desc: "Moana journeys to the far seas of Oceania after receiving an unexpected call from her wayfinding ancestors."
    },
    pt: {
      title: "Moana 2 (2024)",
      desc: "Moana e Maui reúnem uma nova tripulação de marinheiros improváveis para desbravar oceanos perigosos."
    }
  },
  "tt22022452": {
    en: {
      title: "Inside Out 2 (2024)",
      desc: "Follow Riley in her teenage years as she encounters new emotions, including Anxiety, Envy, Ennui, and Embarrassment."
    },
    pt: {
      title: "Divertida Mente 2 (2024)",
      desc: "A mente de Riley entra na adolescência e passa por uma repentina reforma para dar espaço a novas emoções: Ansiedade, Inveja e Vergonha."
    }
  },
  "tt7510222": {
    en: {
      title: "Despicable Me 4 (2024)",
      desc: "Gru, Lucy, and their girls welcome a new member to the family, Gru Jr., who is intent on tormenting his dad, while facing a new nemesis."
    },
    pt: {
      title: "Meu Malvado Favorito 4 (2024)",
      desc: "Gru e Lucy dão as boas-vindas ao novo membro da família, Gru Jr., enquanto enfrentam um novo e perigoso nêmesis."
    }
  },
  "tt9362722": {
    en: {
      title: "Spider-Man: Across the Spider-Verse (2023)",
      desc: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence."
    },
    pt: {
      title: "Homem-Aranha: Através do Aranhaverso (2023)",
      desc: "Miles Morales é catapultado pelo Multiverso, onde encontra uma equipe de Pessoas-Aranha encarregadas de proteger a própria existência."
    }
  },
  "tt6105098": {
    en: {
      title: "The Lion King (2019)",
      desc: "After the murder of his father, a young lion prince flees his kingdom only to learn the true meaning of responsibility and bravery."
    },
    pt: {
      title: "O Rei Leão (2019)",
      desc: "Após a trágica perda do pai, o jovem príncipe Simba precisa descobrir sua verdadeira força e reivindicar seu trono na savana."
    }
  },
  "tt0816692": {
    en: {
      title: "Interstellar (2014)",
      desc: "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot is tasked to pilot a spacecraft along with a team of researchers to find a new planet."
    },
    pt: {
      title: "Interestelar (2014)",
      desc: "Com a Terra à beira do colapso, um grupo de exploradores viaja através de um buraco de minhoca no espaço para garantir a sobrevivência humana."
    }
  },
  "tt1375666": {
    en: {
      title: "Inception (2010)",
      desc: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O."
    },
    pt: {
      title: "A Origem (2010)",
      desc: "Um ladrão habilidoso em invadir os sonhos de outras pessoas recebe a missão quase impossível de plantar uma ideia no subconsciente de um alvo."
    }
  },
  "tt1856101": {
    en: {
      title: "Blade Runner 2049 (2017)",
      desc: "Young Blade Runner K's discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard, who's been missing for thirty years."
    },
    pt: {
      title: "Blade Runner 2049 (2017)",
      desc: "O policial K desenterra um segredo há muito tempo enterrado que tem o potencial de mergulhar o que resta da sociedade no caos total."
    }
  },
  "tt0133093": {
    en: {
      title: "The Matrix (1999)",
      desc: "When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth: the life he knows is the elaborate deception of an evil cyber-intelligence."
    },
    pt: {
      title: "Matrix (1999)",
      desc: "O jovem programador Neo descobre que a realidade que conhece é uma ilusão criada por inteligências artificiais para escravizar a humanidade."
    }
  },
  "tt15398776": {
    en: {
      title: "Oppenheimer (2023)",
      desc: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb."
    },
    pt: {
      title: "Oppenheimer (2023)",
      desc: "A história do físico americano J. Robert Oppenheimer e seu papel fundamental na criação da primeira bomba atômica no Projeto Manhattan."
    }
  },
  "tt0068646": {
    en: {
      title: "The Godfather (1972)",
      desc: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant youngest son."
    },
    pt: {
      title: "O Poderoso Chefão (1972)",
      desc: "O patriarca Don Vito Corleone comanda uma poderosa dinastia da máfia de Nova York enquanto seu filho Michael assume o império."
    }
  },
  "tt0111161": {
    en: {
      title: "The Shawshank Redemption (1994)",
      desc: "A banker convicted of uxoricide forms a friendship over a quarter of a century with a hardened convict, while maintaining his innocence."
    },
    pt: {
      title: "Um Sonho de Liberdade (1994)",
      desc: "Dois homens presos desenvolvem uma amizade profunda ao longo dos anos, encontrando consolo e redenção através de atos de decência mútua."
    }
  },
  "tt0110912": {
    en: {
      title: "Pulp Fiction (1994)",
      desc: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption."
    },
    pt: {
      title: "Pulp Fiction: Tempo de Violência (1994)",
      desc: "Histórias interconectadas de assassinos de aluguel, um boxeador e a esposa de um mafioso no submundo do crime em Los Angeles."
    }
  },
  "tt0137523": {
    en: {
      title: "Fight Club (1999)",
      desc: "An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into much more."
    },
    pt: {
      title: "Clube da Luta (1999)",
      desc: "Um homem desiludido e um fabricante de sabonetes excêntrico criam um clube clandestino de lutas que rapidamente sai do controle."
    }
  },
  "tt15474916": {
    en: {
      title: "The Penguin - Season 1",
      desc: "Following the death of Carmine Falcone, Oz Cobb begins his ruthless quest to seize control of Gotham's criminal underworld."
    },
    pt: {
      title: "Pinguim - Temporada 1",
      desc: "Após a morte de Carmine Falcone, Oz Cobb começa a traçar sua ascensão implacável para dominar o submundo de Gotham."
    }
  },
  "tt15435876": {
    en: {
      title: "The Penguin - Season 1",
      desc: "Following the death of Carmine Falcone, Oz Cobb begins his ruthless quest to seize control of Gotham's criminal underworld."
    },
    pt: {
      title: "Pinguim - Temporada 1",
      desc: "Após a morte de Carmine Falcone, Oz Cobb começa a traçar sua ascensão implacável para dominar o submundo de Gotham."
    }
  },
  "tt2788316": {
    en: {
      title: "Shōgun (2024)",
      desc: "When a mysterious European ship is found marooned in a nearby fishing village, Lord Toranaga discovers secrets that could tip the scales of power."
    },
    pt: {
      title: "Xógum: A Gloriosa Saga do Japão",
      desc: "No Japão de 1600, Lord Toranaga luta por sobrevivência enquanto um capitão inglês misterioso naufraga na costa."
    }
  },
  "tt11126994": {
    en: {
      title: "Arcane: Season 2",
      desc: "Tensions flare between the utopian city of Piltover and the oppressed underground of Zaun as Vi and Jinx face off."
    },
    pt: {
      title: "Arcane - Temporada 2",
      desc: "A tensão atinge proporções devastadoras entre a rica cidade de Piltover e os submundo de Zaun."
    }
  },
  "tt1190634": {
    en: {
      title: "The Boys: Season 4",
      desc: "Victoria Neuman is closer than ever to the Oval Office and under the tight grip of Homelander, who is consolidating his power."
    },
    pt: {
      title: "The Boys - Temporada 4",
      desc: "Victoria Neuman está mais perto do Salão Oval sob o controle do Capitão Pátria, que consolida seu poder."
    }
  },
  "tt11198330": {
    en: {
      title: "House of the Dragon - Season 2",
      desc: "Westeros is on the brink of a bloody civil war as the Green and Black Councils fight for King Aegon and Queen Rhaenyra respectively."
    },
    pt: {
      title: "A Casa do Dragão - Temporada 2",
      desc: "Westeros está à beira de uma guerra civil sangrenta enquanto os conselhos Verde e Preto batalham pela legitimidade ao Trono de Ferro."
    }
  },
  "tt0903747": {
    en: {
      title: "Breaking Bad",
      desc: "A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student."
    },
    pt: {
      title: "Breaking Bad: A Química do Mal",
      desc: "Um professor de química com câncer terminal decide produzir metanfetamina para garantir o futuro financeiro de sua família."
    }
  },
  "tt3032476": {
    en: {
      title: "Better Call Saul",
      desc: "The trials and tribulations of criminal lawyer Jimmy McGill in the years leading up to his fateful run-in with Walter White and Jesse Pinkman."
    },
    pt: {
      title: "Better Call Saul",
      desc: "A transformação do modesto advogado Jimmy McGill no extravagante e inescrupuloso defensor criminal Saul Goodman."
    }
  },
  "tt2442560": {
    en: {
      title: "Peaky Blinders",
      desc: "A gangster family epic set in 1900s England, centering on a gang who sew razor blades in the peaks of their caps, and their fierce boss Tommy Shelby."
    },
    pt: {
      title: "Peaky Blinders: Sangue, Apostas e Navalhas",
      desc: "Na Inglaterra de 1919, Tommy Shelby lidera uma perigosa gangue criminosa determinada a expandir seu império de apostas e contrabando."
    }
  },
  "tt5290382": {
    en: {
      title: "Mindhunter",
      desc: "In the late 1970s, two FBI agents expand criminal science by delving into the psychology of murder and interviewing imprisoned serial killers."
    },
    pt: {
      title: "Mindhunter",
      desc: "Dois agentes do FBI entrevistam assassinos em série presos na esperança de desvendar padrões e solucionar investigações em andamento."
    }
  },
  "tt0773262": {
    en: {
      title: "Dexter",
      desc: "A forensic expert for the Miami police department leads a secret parallel life as a vigilante serial killer hunting criminals who escaped justice."
    },
    pt: {
      title: "Dexter",
      desc: "Um especialista forense da polícia de Miami esconde uma vida dupla como serial killer que caça criminosos impunes pela justiça."
    }
  },
  "tt0417299": {
    en: {
      title: "Avatar: The Last Airbender",
      desc: "In a war-torn world of elemental magic, a young boy reawakens to undertake a dangerous mystic quest to fulfill his destiny as the Avatar."
    },
    pt: {
      title: "Avatar: A Lenda de Aang",
      desc: "O jovem Aang deve dominar os quatro elementos para restaurar a paz e o equilíbrio no mundo contra a tirania da Nação do Fogo."
    }
  },
  "tt1865718": {
    en: {
      title: "Gravity Falls",
      desc: "Twin siblings Dipper and Mabel Pines spend the summer at their great-uncle's tourist trap in the enigmatic town of Gravity Falls, Oregon."
    },
    pt: {
      title: "Gravity Falls: Um Verão de Mistérios",
      desc: "Os gêmeos Dipper e Mabel vão passar o verão com o tio-avô Stan e descobrem que a cidade abriga segredos sobrenaturais inacreditáveis."
    }
  },
  "tt0458290": {
    en: {
      title: "Star Wars: The Clone Wars",
      desc: "Jedi Knights lead the Grand Army of the Republic against the droid army of the Separatists in an epic galactic conflict."
    },
    pt: {
      title: "Star Wars: A Guerra dos Clones",
      desc: "Cavaleiros Jedi lideram o Grande Exército da República contra a ofensiva das forças Separatistas em uma galáxia em guerra."
    }
  },
  "tt16026746": {
    en: {
      title: "X-Men '97",
      desc: "A band of mutants use their uncanny gifts to protect a world that hates and fears them, challenged like never before following the loss of Professor X."
    },
    pt: {
      title: "X-Men '97",
      desc: "Os X-Men enfrentam novos perigos e desafios sem precedentes após a partida de seu mentor, Charles Xavier."
    }
  },
  "tt4574334": {
    en: {
      title: "Stranger Things",
      desc: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl."
    },
    pt: {
      title: "Stranger Things",
      desc: "O desaparecimento de um garoto leva seus amigos a investigarem experimentos secretos do governo e forças sobrenaturais aterrorizantes."
    }
  },
  "tt3581920": {
    en: {
      title: "The Last of Us",
      desc: "After a global pandemic destroys civilization, a hardened survivor takes charge of a 14-year-old girl who may be humanity's last hope."
    },
    pt: {
      title: "The Last of Us",
      desc: "Vinte anos após a queda da civilização, Joel é contratado para contrabandear Ellie, uma jovem imune a um fungo mortal, através dos EUA."
    }
  },
  "tt12637874": {
    en: {
      title: "Fallout",
      desc: "In a future, post-apocalyptic Los Angeles brought about by nuclear decimation, citizens must live in underground bunkers to protect themselves."
    },
    pt: {
      title: "Fallout",
      desc: "Uma moradora de um refúgio subterrâneo sofisticado é forçada a emergir no deserto radioativo e hostil deixado por uma guerra nuclear."
    }
  },
  "tt5753856": {
    en: {
      title: "Dark",
      desc: "A family saga with a supernatural twist, set in a German town where the disappearance of two young children exposes the relationships among four families."
    },
    pt: {
      title: "Dark",
      desc: "O desaparecimento de duas crianças em uma pequena cidade alemã revela segredos sinistros e uma complexa teia de viagens no tempo."
    }
  },
  "tt2085059": {
    en: {
      title: "Black Mirror",
      desc: "An anthology series exploring a twisted, high-tech multiverse where humanity's greatest innovations and darkest instincts collide."
    },
    pt: {
      title: "Black Mirror",
      desc: "Série antológica que explora um futuro próximo sombrio onde as maiores inovações tecnológicas colidem com os piores instintos humanos."
    }
  },
  "tt0944947": {
    en: {
      title: "Game of Thrones",
      desc: "Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia."
    },
    pt: {
      title: "Game of Thrones: A Guerra dos Tronos",
      desc: "Famílias nobres lutam pelo controle do Trono de Ferro de Westeros enquanto uma ameaça ancestral desperta no extremo norte."
    }
  },
  "tt5180504": {
    en: {
      title: "The Witcher",
      desc: "Geralt of Rivia, a solitary monster hunter, struggles to find his place in a world where people often prove more wicked than beasts."
    },
    pt: {
      title: "The Witcher",
      desc: "Geralt de Rívia, um caçador de monstros solitário, navega por um continente brutal onde os humanos costumam ser mais perversos que as feras."
    }
  },
  "tt9140554": {
    en: {
      title: "Loki",
      desc: "The mercurial villain Loki resumes his role as the God of Mischief in a new series that takes place after the events of Avengers: Endgame."
    },
    pt: {
      title: "Loki",
      desc: "O Deus da Trapaça viaja pelas linhas temporais após roubar o Tesseract e é capturado pela misteriosa Autoridade de Variância Temporal."
    }
  },
  "tt9288030": {
    en: {
      title: "Reacher",
      desc: "Jack Reacher, a veteran military police investigator, enters civilian life and is falsely accused of murder."
    },
    pt: {
      title: "Reacher",
      desc: "O ex-policial militar Jack Reacher é preso injustamente por um assassinato que não cometeu e descobre uma vasta conspiração policial."
    }
  },
  "tt3322312": {
    en: {
      title: "Daredevil",
      desc: "A blind lawyer by day, vigilante by night. Matt Murdock fights the crime of New York as Daredevil."
    },
    pt: {
      title: "Demolidor",
      desc: "Cego desde a infância, o advogado Matt Murdock usa seus sentidos sobre-humanos para combater o crime nas ruas de Hell's Kitchen."
    }
  },
  "tt0109830": {
    "en": {
      "title": "Forrest Gump (1994)",
      "desc": "The history of the United States from the 1950s to the '70s unfolds from the perspective of an Alabama man with an IQ of 75."
    },
    "pt": {
      "title": "Forrest Gump: O Contador de Histórias (1994)",
      "desc": "A história dos Estados Unidos se desenrola através do olhar puro e generoso de um homem do Alabama que inspira todos ao seu redor."
    }
  },
  "tt0099685": {
    "en": {
      "title": "Goodfellas (1990)",
      "desc": "The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners Jimmy Conway and Tommy DeVito."
    },
    "pt": {
      "title": "Os Bons Companheiros (1990)",
      "desc": "A fascinante trajetória de Henry Hill e sua ascensão vertiginosa no submundo da máfia ítalo-americana em Nova York."
    }
  },
  "tt0120737": {
    "en": {
      "title": "The Lord of the Rings: The Fellowship of the Ring (2001)",
      "desc": "A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth."
    },
    "pt": {
      "title": "O Senhor dos Anéis: A Sociedade do Anel (2001)",
      "desc": "O jovem hobbit Frodo Bolseiro herda um anel mágico e parte em uma épica jornada para destruí-lo na Montanha da Perdição."
    }
  },
  "tt0167260": {
    "en": {
      "title": "The Lord of the Rings: The Return of the King (2003)",
      "desc": "Gandalf and Aragorn lead the World of Men against Sauron's army to draw his gaze from Frodo and Sam as they approach Mount Doom."
    },
    "pt": {
      "title": "O Senhor dos Anéis: O Retorno do Rei (2003)",
      "desc": "A batalha decisiva pelo destino da Terra Média se aproxima enquanto Frodo e Sam chegam ao coração sombrio de Mordor com o Um Anel."
    }
  },
  "tt0108052": {
    "en": {
      "title": "Schindler's List (1993)",
      "desc": "In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution."
    },
    "pt": {
      "title": "A Lista de Schindler (1993)",
      "desc": "O empresário alemão Oskar Schindler arrisca sua fortuna e vida para salvar mais de mil judeus dos campos de concentração nazistas."
    }
  },
  "tt0050083": {
    "en": {
      "title": "12 Angry Men (1957)",
      "desc": "The jury in a New York City murder trial is frustrated by a single member whose skeptical caution forces them to more carefully consider the evidence."
    },
    "pt": {
      "title": "12 Homens e uma Sentença (1957)",
      "desc": "Doze jurados isolados debatem o destino de um jovem acusado de homicídio, enquanto um único jurado questiona as certezas de todos."
    }
  },
  "tt0102926": {
    "en": {
      "title": "The Silence of the Lambs (1991)",
      "desc": "A young FBI cadet must receive the help of an incarcerated and manipulative cannibal killer to help catch another serial killer."
    },
    "pt": {
      "title": "O Silêncio dos Inocentes (1991)",
      "desc": "A jovem agente do FBI Clarice Starling busca a mente brilhante e perturbadora do Dr. Hannibal Lecter para capturar um psicopata."
    }
  },
  "tt0120815": {
    "en": {
      "title": "Saving Private Ryan (1998)",
      "desc": "Following the Normandy Landings, a group of U.S. soldiers go behind enemy lines to retrieve a paratrooper whose brothers have been killed in action."
    },
    "pt": {
      "title": "O Resgate do Soldado Ryan (1998)",
      "desc": "Após o histórico desembarque na Normandia, o Capitão Miller lidera seus homens atrás das linhas inimigas para resgatar o soldado James Ryan."
    }
  },
  "tt0120689": {
    "en": {
      "title": "The Green Mile (1999)",
      "desc": "A tale set on death row in a Southern prison, where gentle giant John Coffey possesses the mysterious, miraculous power to heal people's ailments."
    },
    "pt": {
      "title": "À Espera de um Milagre (1999)",
      "desc": "No corredor da morte de uma prisão, um guarda descobre que um gigante gentil condenado possui um dom divino milagroso e curador."
    }
  },
  "tt0172495": {
    "en": {
      "title": "Gladiator (2000)",
      "desc": "A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery."
    },
    "pt": {
      "title": "Gladiador (2000)",
      "desc": "Um honrado general romano é traído por um imperador tirano e se torna o maior gladiador da arena em busca de justiça e vingança."
    }
  },
  "tt14452776": {
    "en": {
      "title": "The Bear",
      "desc": "A young fine-dining chef comes home to Chicago to run his family Italian beef sandwich shop after a tragic death."
    },
    "pt": {
      "title": "O Urso",
      "desc": "Um jovem chef de alta gastronomia retorna a Chicago para comandar a lanchonete da família após uma tragédia pessoal."
    }
  },
  "tt7660850": {
    "en": {
      "title": "Succession",
      "desc": "The Roy family is known for controlling the biggest media and entertainment company in the world. However, their world changes when their aging father steps down."
    },
    "pt": {
      "title": "Succession",
      "desc": "Os herdeiros da família Roy travam uma guerra brutal e impiedosa pelo controle do maior conglomerado de mídia do mundo."
    }
  },
  "tt11280740": {
    "en": {
      "title": "Severance",
      "desc": "Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives."
    },
    "pt": {
      "title": "Ruptura",
      "desc": "Funcionários de uma misteriosa corporação passam por um procedimento cirúrgico que separa cirurgicamente suas memórias profissionais e pessoais."
    }
  },
  "tt14688458": {
    "en": {
      "title": "Silo",
      "desc": "Men and women live in a giant subterranean silo with several regulations which they believe are in place to protect them from the toxic world above."
    },
    "pt": {
      "title": "Silo",
      "desc": "Milhares de pessoas sobrevivem em um gigantesco silo subterrâneo sem saber a verdade sobre a catástrofe que devastou a superfície."
    }
  },
  "tt11041332": {
    "en": {
      "title": "Yellowjackets",
      "desc": "A wildly talented high school girl soccer team becomes the (un)lucky survivors of a plane crash deep in the Ontario wilderness."
    },
    "pt": {
      "title": "Yellowjackets",
      "desc": "Um time de futebol feminino do ensino médio sobrevive à queda de um avião na floresta e desce a um vórtice psicológico de selvageria."
    }
  },
  "tt0141842": {
    "en": {
      "title": "The Sopranos",
      "desc": "New Jersey mob boss Tony Soprano deals with personal and professional issues in his home and business life that affect his mental state."
    },
    "pt": {
      "title": "Família Soprano",
      "desc": "O chefão da máfia de Nova Jersey Tony Soprano equilibra os perigos de seus negócios escusos com os dramas de sua família e terapia."
    }
  },
  "tt0306414": {
    "en": {
      "title": "The Wire",
      "desc": "The Baltimore drug scene, as seen through the eyes of drug dealers and law enforcement."
    },
    "pt": {
      "title": "A Escuta",
      "desc": "Uma análise realista e crua do narcotráfico, política e corrupção em Baltimore através dos olhos de policiais e traficantes."
    }
  },
  "tt2356777": {
    "en": {
      "title": "True Detective",
      "desc": "Anthology series in which police investigations unearth the personal and professional secrets of those involved, both within and outside the law."
    },
    "pt": {
      "title": "True Detective",
      "desc": "Detetives perturbados investigam crimes macabros que revelam segredos sombrios e abalam suas próprias vidas pessoais e sanidade."
    }
  },
  "tt2707408": {
    "en": {
      "title": "Narcos",
      "desc": "A chronicled look at the criminal exploits of Colombian drug lord Pablo Escobar, as well as the many other drug kingpins who plagued the country."
    },
    "pt": {
      "title": "Narcos",
      "desc": "A ascensão e perseguição implacável a Pablo Escobar e o cartel de Medellín por agentes da DEA americana e forças colombianas."
    }
  },
  "tt2802850": {
    "en": {
      "title": "Fargo",
      "desc": "Various chronicles of deception, intrigue, and murder in and around frozen Minnesota, leading back to Fargo, North Dakota."
    },
    "pt": {
      "title": "Fargo",
      "desc": "Histórias antológicas de crimes inusitados, assassinatos e humor ácido ambientadas nas cidades geladas de Minnesota e Dakota do Norte."
    }
  },
  "tt5071412": {
    "en": {
      "title": "Ozark",
      "desc": "A financial advisor drags his family from Chicago to the Missouri Ozarks, where he must launder $500 million in five years for a drug boss."
    },
    "pt": {
      "title": "Ozark",
      "desc": "Um consultor financeiro se muda com a família para o lago de Ozark para lavar milhões de dólares para um sanguinário cartel mexicano."
    }
  },
  "tt1475582": {
    "en": {
      "title": "Sherlock",
      "desc": "A modern update finds the famous sleuth and his doctor partner solving crime in 21st-century London."
    },
    "pt": {
      "title": "Sherlock",
      "desc": "Uma releitura moderna e genial dos clássicos mistérios do detetive Sherlock Holmes e Dr. John Watson na Londres do século XXI."
    }
  },
  "tt1124373": {
    "en": {
      "title": "Sons of Anarchy",
      "desc": "A biker struggles to balance being a father and being involved in an outlaw motorcycle club."
    },
    "pt": {
      "title": "Sons of Anarchy",
      "desc": "Jax Teller enfrenta dilemas morais entre a lealdade ao seu clube de motoqueiros fora da lei e o futuro de sua família."
    }
  },
  "tt0979432": {
    "en": {
      "title": "Boardwalk Empire",
      "desc": "An Atlantic City politician plays both sides of the law by conspiring with gangsters during the Prohibition era."
    },
    "pt": {
      "title": "Boardwalk Empire",
      "desc": "Na era da Lei Seca, o tesoureiro de Atlantic City Enoch 'Nucky' Thompson comanda o contrabando de bebidas e a política local."
    }
  },
  "tt0103359": {
    "en": {
      "title": "Batman: The Animated Series",
      "desc": "The Dark Knight battles crime in Gotham City with occasional help from Robin and Batgirl in this definitive animated classic."
    },
    "pt": {
      "title": "Batman: A Série Animada (1992)",
      "desc": "O Cavaleiro das Trevas patrulha os céus sombrios de Gotham City enfrentando os mais icônicos vilões nesta obra-prima da animação."
    }
  },
  "tt2861424": {
    "en": {
      "title": "Rick and Morty",
      "desc": "The fractured domestic lives of a cynical mad scientist and his good-hearted but fretful grandson who travel across the multiverse."
    },
    "pt": {
      "title": "Rick and Morty",
      "desc": "As aventuras interdimensionais surreais e caóticas de um cientista genial e sociopata com seu neto medroso e inseguro."
    }
  },
  "tt1305826": {
    "en": {
      "title": "Adventure Time",
      "desc": "A 12-year-old boy and his best friend, a wise 28-year-old dog with magical powers, go on a series of surreal adventures with each other in the Land of Ooo."
    },
    "pt": {
      "title": "Hora de Aventura",
      "desc": "O jovem herói Finn e seu irmão adotivo Jake, um cão com poderes mágicos, exploram a mística e pós-apocalíptica Terra de Ooo."
    }
  },
  "tt1710308": {
    "en": {
      "title": "Regular Show",
      "desc": "The daily surreal adventures of a blue jay and a raccoon who work as groundskeepers at a local park."
    },
    "pt": {
      "title": "Apenas um Show",
      "desc": "Mordecai e Rigby, dois amigos jardineiros que tentam escapar do trabalho, acabam desencadeando loucuras sobrenaturais."
    }
  },
  "tt0206512": {
    "en": {
      "title": "SpongeBob SquarePants",
      "desc": "The misadventures of a talking sea sponge who works at a fast food restaurant, attends a boating school, and lives in an underwater pineapple."
    },
    "pt": {
      "title": "Bob Esponja Calça Quadrada",
      "desc": "O otimista Bob Esponja e seu melhor amigo Patrick vivem hilárias e inocentes trapalhadas no fundo do mar na Fenda do Biquíni."
    }
  },
  "tt6741278": {
    "en": {
      "title": "Invincible",
      "desc": "An adult animated superhero series that revolves around 17-year-old Mark Grayson, who's just like every other guy his age — except his father is the most powerful superhero on the planet."
    },
    "pt": {
      "title": "Invencível",
      "desc": "O jovem Mark Grayson descobre seus superpoderes herdados de seu pai, o Omni-Man, mas logo desvenda um segredo aterrador."
    }
  },
  "tt6517102": {
    "en": {
      "title": "Castlevania",
      "desc": "A vampire hunter fights to save a besieged city from an army of otherworldly beasts controlled by Dracula."
    },
    "pt": {
      "title": "Castlevania",
      "desc": "Trevor Belmont, Sypha e Alucard unem forças para impedir o exército de monstros sanguinários liderado pelo Conde Drácula."
    }
  },
  "tt1695360": {
    "en": {
      "title": "The Legend of Korra",
      "desc": "Avatar Korra fights to keep Republic City safe from the real-world threats of the physical and spiritual realms."
    },
    "pt": {
      "title": "A Lenda de Korra",
      "desc": "A destemida Korra assume o manto de Avatar para dominar os quatro elementos e manter a paz na moderna Cidade República."
    }
  },
  "tt0278238": {
    "en": {
      "title": "Samurai Jack",
      "desc": "A samurai sent through a time portal to a dystopian future must find a way back to the past to defeat the shape-shifting demon Aku."
    },
    "pt": {
      "title": "Samurai Jack",
      "desc": "Um nobre samurai lançado em um futuro distópico precisa encontrar o caminho de volta ao passado para destruir o demônio Aku."
    }
  },
  "tt0852863": {
    "en": {
      "title": "Phineas and Ferb",
      "desc": "Phineas and Ferb invent innovative grand projects during summer vacation while their pet platypus leads a double life as a secret agent."
    },
    "pt": {
      "title": "Phineas e Ferb",
      "desc": "Dois irmãos geniais criam invenções inacreditáveis nas férias de verão enquanto seu ornitorrinco atua como o agente secreto Perry."
    }
  },
  "tt8111088": {
    "en": {
      "title": "The Mandalorian",
      "desc": "The travels of a lone bounty hunter in the outer reaches of the galaxy, far from the authority of the New Republic."
    },
    "pt": {
      "title": "O Mandaloriano",
      "desc": "Um caçador de recompensas solitário protege uma criança misteriosa através dos confins da galáxia de Star Wars."
    }
  },
  "tt0475784": {
    "en": {
      "title": "Westworld",
      "desc": "At the intersection of the near future and the reimagined past, explore a world in which every human appetite can be indulged without consequence."
    },
    "pt": {
      "title": "Westworld",
      "desc": "Em um parque temático futurista do Velho Oeste, androides com inteligência artificial começam a despertar e se rebelar contra os humanos."
    }
  },
  "tt0436992": {
    "en": {
      "title": "Doctor Who",
      "desc": "The further adventures in time and space of the alien adventurer known as the Doctor and their companions from planet Earth."
    },
    "pt": {
      "title": "Doctor Who",
      "desc": "O lendário Senhor do Tempo alienígena conhecido como O Doutor viaja através das eras e do universo a bordo da TARDIS."
    }
  },
  "tt3230854": {
    "en": {
      "title": "The Expanse",
      "desc": "In the 24th century, a disparate band of antiheroes unravel a vast conspiracy that threatens the fragile peace and survival of humanity."
    },
    "pt": {
      "title": "The Expanse",
      "desc": "No século XXIV, a tripulação de uma nave descobre uma conspiração interestelar e uma tecnologia alienígena que pode extinguir a humanidade."
    }
  },
  "tt2934286": {
    "en": {
      "title": "Halo",
      "desc": "Aliens threaten human existence in an epic 26th-century showdown. Master Chief leads Spartan super-soldiers in defense of mankind."
    },
    "pt": {
      "title": "Halo",
      "desc": "No século XXVI, o lendário soldado cibernético Master Chief lidera a resistência da humanidade contra a aliança alienígena Covenant."
    }
  },
  "tt0804484": {
    "en": {
      "title": "Foundation",
      "desc": "A complex saga of humans scattered on planets throughout the galaxy all living under the rule of the Galactic Empire."
    },
    "pt": {
      "title": "Fundação",
      "desc": "Baseada na monumental obra de Isaac Asimov, um grupo de cientistas tenta salvar a civilização humana da iminente queda do Império Galáctico."
    }
  },
  "tt13016388": {
    "en": {
      "title": "3 Body Problem",
      "desc": "A fateful decision made in 1960s China reverberates in the present, where a group of scientists partner with a detective to confront an extraterrestrial threat."
    },
    "pt": {
      "title": "O Problema dos 3 Corpos",
      "desc": "Uma decisão tomada na China na década de 1960 ecoa no presente, onde cientistas e um detetive enfrentam o iminente primeiro contato alienígena."
    }
  },
  "tt5675620": {
    "en": {
      "title": "The Punisher",
      "desc": "After the murder of his family, Marine veteran Frank Castle becomes the vigilante known as 'The Punisher' to wage war on crime."
    },
    "pt": {
      "title": "O Justiceiro",
      "desc": "Após a tragédia que destruiu sua família, Frank Castle adota a alcunha de Justiceiro e declara guerra implacável contra o submundo do crime."
    }
  },
  "tt2306299": {
    "en": {
      "title": "Vikings",
      "desc": "Vikings transports us to the brutal and mysterious world of Ragnar Lothbrok, a Norse warrior and farmer who yearns to explore."
    },
    "pt": {
      "title": "Vikings",
      "desc": "As sagas épicas e sangrentas do lendário líder guerreiro nórdico Ragnar Lothbrok e seus filhos desbravando novos mares."
    }
  },
  "tt2017109": {
    "en": {
      "title": "Banshee",
      "desc": "An ex-con assumes the identity of a murdered sheriff in the small Amish town of Banshee, where his former lover and crimes await."
    },
    "pt": {
      "title": "Banshee",
      "desc": "Um ex-presidiário assume a identidade do falecido xerife da pequena cidade de Banshee para escapar de mafiosos e impor sua própria lei."
    }
  },
  "tt0285331": {
    "en": {
      "title": "24",
      "desc": "Counter Terrorist Unit agent Jack Bauer races against the clock to subvert terrorist plots and save his nation from ultimate catastrophe."
    },
    "pt": {
      "title": "24 Horas",
      "desc": "O agente federal Jack Bauer corre contra o relógio em tempo real para impedir ataques terroristas e proteger a segurança nacional."
    }
  },
  "tt5057054": {
    "en": {
      "title": "Tom Clancy's Jack Ryan",
      "desc": "Up-and-coming CIA analyst Jack Ryan is thrust into dangerous field assignments after discovering a pattern in terrorist communications."
    },
    "pt": {
      "title": "Jack Ryan",
      "desc": "O analista da CIA Jack Ryan é arrancado de sua mesa de escritório e jogado em perigosas missões internacionais de contraterrorismo."
    }
  },
  "tt11734264": {
    "en": {
      "title": "The Terminal List",
      "desc": "A former Navy SEAL officer investigates why his entire platoon was ambushed during a high-stakes covert mission."
    },
    "pt": {
      "title": "A Lista Terminal",
      "desc": "O comandante dos Navy SEALs James Reece investiga a misteriosa emboscada que eliminou seu pelotão e parte em busca de vingança."
    }
  },
  "tt2193021": {
    "en": {
      "title": "Arrow",
      "desc": "Spoiled billionaire playboy Oliver Queen is missing and presumed dead when his yacht is lost at sea. Five years later, he returns with a mission to save Starling City."
    },
    "pt": {
      "title": "Arrow",
      "desc": "Após cinco anos náufrago em uma ilha perigosa, o bilionário Oliver Queen retorna para sua cidade como um vigilante encapuzado armado com arco e flecha."
    }
  },
  "tt3107288": {
    "en": {
      "title": "The Flash",
      "desc": "After being struck by lightning, Barry Allen wakes up from his coma to discover he's been given the power of super speed, becoming the Flash."
    },
    "pt": {
      "title": "The Flash",
      "desc": "Atingido por um raio de matéria escura, Barry Allen ganha a velocidade da luz e se torna o herói Flash para proteger Central City."
    }
  },
  "tt7221388": {
    "en": {
      "title": "Cobra Kai",
      "desc": "Decades after their 1984 All Valley Karate Tournament bout, a middle-aged Daniel LaRusso and Johnny Lawrence find themselves martial-arts rivals again."
    },
    "pt": {
      "title": "Cobra Kai",
      "desc": "Trinta anos após a clássica final de karatê, Daniel LaRusso e Johnny Lawrence reacendem sua histórica rivalidade marcial."
    }
  },
  "tt1877830": {
    "en": {
      "title": "The Batman (2022)",
      "desc": "When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city's hidden corruption and question his family's involvement."
    },
    "pt": {
      "title": "The Batman (2022)",
      "desc": "Em seu segundo ano de combate ao crime, Batman investiga a corrupção secreta de Gotham City enquanto persegue o misterioso e sádico Charada."
    }
  },
  "tt14230458": {
    "en": {
      "title": "Poor Things (2023)",
      "desc": "The incredible tale about the fantastical evolution of Bella Baxter, a young woman brought back to life by the brilliant and unorthodox scientist Dr. Godwin Baxter."
    },
    "pt": {
      "title": "Pobres Criaturas (2023)",
      "desc": "A fantástica história da evolução de Bella Baxter, uma jovem trazida de volta à vida por um brilhante e heterodoxo cientista."
    }
  },
  "tt1517268": {
    "en": {
      "title": "Barbie (2023)",
      "desc": "Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land. However, when they get a chance to go to the real world, they soon discover the joys and perils of living among humans."
    },
    "pt": {
      "title": "Barbie (2023)",
      "desc": "Barbie deixa o mundo perfeito da Barbielândia para viver uma jornada existencial de autodescoberta no imperfeito mundo real."
    }
  },
  "tt12037194": {
    "en": {
      "title": "Furiosa: A Mad Max Saga (2024)",
      "desc": "The origin story of renegade warrior Furiosa before her encounter and teamup with Mad Max."
    },
    "pt": {
      "title": "Furiosa: Uma Saga Mad Max (2024)",
      "desc": "A história de origem da jovem guerreira Furiosa e sua sangrenta jornada de vingança e sobrevivência pelo deserto devastado."
    }
  },
  "tt11389872": {
    "en": {
      "title": "Kingdom of the Planet of the Apes (2024)",
      "desc": "Many years after the reign of Caesar, a young ape goes on a journey that will lead him to question everything he's been taught about the past and make choices that will define a future for apes and humans alike."
    },
    "pt": {
      "title": "Planeta dos Macacos: O Reinado (2024)",
      "desc": "Gerações após o reinado de César, um jovem chimpanzé desafia um tirano símio em busca da verdade sobre o passado da humanidade."
    }
  },
  "tt9603212": {
    "en": {
      "title": "Mission: Impossible - Dead Reckoning (2023)",
      "desc": "Ethan Hunt and his IMF team must track down a terrifying new weapon that threatens all of humanity before it falls into the wrong hands."
    },
    "pt": {
      "title": "Missão: Impossível - Acerto de Contas (2023)",
      "desc": "Ethan Hunt e sua equipe do FMI enfrentam uma misteriosa inteligência artificial com poder de controlar o destino do planeta."
    }
  },
  "tt12263384": {
    "en": {
      "title": "Extraction 2 (2023)",
      "desc": "Back from the brink of death, highly skilled commando Tyler Rake takes on another dangerous mission to save the imprisoned family of a ruthless gangster."
    },
    "pt": {
      "title": "Resgate 2 (2023)",
      "desc": "Depois de sobreviver milagrosamente, o mercenário Tyler Rake embarca em uma missão ainda mais mortal para resgatar a família de um criminoso impiedoso."
    }
  },
  "tt1630029": {
    "en": {
      "title": "Avatar: The Way of Water (2022)",
      "desc": "Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na'vi race to protect their home."
    },
    "pt": {
      "title": "Avatar: O Caminho da Água (2022)",
      "desc": "Jake Sully e Neytiri exploram os deslumbrantes oceanos de Pandora enquanto protegem sua família de uma nova ameaça militar humana."
    }
  },
  "tt0381061": {
    "en": {
      "title": "Casino Royale (2006)",
      "desc": "After earning 00 status and a licence to kill, secret agent James Bond sets out on his first mission as 007 to defeat a private banker funding terrorists in a high-stakes game of poker."
    },
    "pt": {
      "title": "007: Cassino Royale (2006)",
      "desc": "Em sua primeira missão como agente 007, James Bond precisa derrotar um financista do terrorismo em uma tensa e letal partida de pôquer em Montenegro."
    }
  },
  "tt4154756": {
    "en": {
      "title": "Avengers: Infinity War (2018)",
      "desc": "The Avengers and their allies must be willing to sacrifice all in an attempt to defeat the powerful Thanos before his blitz of devastation and ruin puts an end to the universe."
    },
    "pt": {
      "title": "Vingadores: Guerra Infinita (2018)",
      "desc": "Os Vingadores e os Guardiões da Galáxia unem forças desesperadas para impedir o tirano intergaláctico Thanos de reunir as Joias do Infinito."
    }
  },
  "tt10872600": {
    "en": {
      "title": "Spider-Man: No Way Home (2021)",
      "desc": "With Spider-Man's identity now revealed, Peter asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds start to appear."
    },
    "pt": {
      "title": "Homem-Aranha: Sem Volta para Casa (2021)",
      "desc": "Com sua identidade secreta revelada, Peter Parker busca a ajuda do Doutor Estranho, desencadeando a abertura do multiverso e vilões lendários."
    }
  },
  "tt21692408": {
    "en": {
      "title": "Kung Fu Panda 4 (2024)",
      "desc": "After Po is tapped to become the Spiritual Leader of the Valley of Peace, he needs to find and train a new Dragon Warrior, while a wicked sorceress plans to re-summon all the master villains."
    },
    "pt": {
      "title": "Kung Fu Panda 4 (2024)",
      "desc": "Convocado para se tornar o Líder Espiritual do Vale da Paz, Po precisa treinar um novo Dragão Guerreiro enquanto enfrenta a Camaleoa."
    }
  },
  "tt3915174": {
    "en": {
      "title": "Puss in Boots: The Last Wish (2022)",
      "desc": "When Puss in Boots discovers that his passion for adventure has taken its toll and he has burned through eight of his nine lives, he launches on an epic journey to restore them."
    },
    "pt": {
      "title": "Gato de Botas 2: O Último Pedido (2022)",
      "desc": "Tendo gastado oito de suas nove vidas, o lendário Gato de Botas parte em busca da mística Estrela dos Desejos enquanto foge da própria Morte."
    }
  },
  "tt2380307": {
    "en": {
      "title": "Coco (2017)",
      "desc": "Aspiring musician Miguel, confronted with his family's ancestral ban on music, enters the Land of the Dead to find his great-great-grandfather, a legendary singer."
    },
    "pt": {
      "title": "Viva: A Vida é uma Festa (2017)",
      "desc": "O jovem Miguel viaja à mágica e colorida Terra dos Mortos para desvendar um segredo de sua família e realizar seu sonho musical."
    }
  },
  "tt3521164": {
    "en": {
      "title": "Moana (2016)",
      "desc": "In Ancient Polynesia, when a terrible curse incurred by the Demigod Maui reaches Moana's island, she answers the Ocean's call to seek out the Demigod to set things right."
    },
    "pt": {
      "title": "Moana: Um Mar de Aventuras (2016)",
      "desc": "A jovem navegadora Moana parte em uma jornada pelo Oceano Pacífico em busca do semideus Maui para salvar seu povo e restaurar o coração de Te Fiti."
    }
  },
  "tt1049413": {
    "en": {
      "title": "Up (2009)",
      "desc": "78-year-old Carl Fredricksen travels to Paradise Falls in his house equipped with balloons, inadvertently taking a young stowaway."
    },
    "pt": {
      "title": "Up: Altas Aventuras (2009)",
      "desc": "O idoso Carl Fredricksen amarra milhares de balões em sua casa para voar até a América do Sul, levando acidentalmente um jovem escoteiro tagarela."
    }
  },
  "tt1979376": {
    "en": {
      "title": "Toy Story 4 (2019)",
      "desc": "When a new toy called 'Forky' joins Woody and the gang, a road trip alongside old and new friends reveals how big the world can be for a toy."
    },
    "pt": {
      "title": "Toy Story 4 (2019)",
      "desc": "Woody, Buzz e seus amigos embarcam em uma viagem repleta de aventuras com Garfinho, descobrindo o verdadeiro valor da lealdade e liberdade."
    }
  },
  "tt2948356": {
    "en": {
      "title": "Zootopia (2016)",
      "desc": "In a city of anthropomorphic animals, a rookie bunny cop and a cynical con artist fox must work together to uncover a conspiracy."
    },
    "pt": {
      "title": "Zootopia: Essa Cidade é o Bicho (2016)",
      "desc": "A otimista coelha policial Judy Hopps e a esperta raposa Nick Wilde se unem para desvendar um mistério que ameaça a paz da metrópole animal."
    }
  },
  "tt4520988": {
    "en": {
      "title": "Frozen II (2019)",
      "desc": "Anna, Elsa, Kristoff, Olaf and Sven leave Arendelle to travel to an ancient, autumn-bound forest of an enchanted land to find the origin of Elsa's powers."
    },
    "pt": {
      "title": "Frozen II (2019)",
      "desc": "Elsa, Anna, Kristoff e Olaf partem para a misteriosa Floresta Encantada para desvendar a origem dos poderes mágicos de gelo de Elsa."
    }
  },
  "tt0266543": {
    "en": {
      "title": "Finding Nemo (2003)",
      "desc": "After his son is captured in the Great Barrier Reef and taken to Sydney, a timid clownfish sets out on a journey to bring him home."
    },
    "pt": {
      "title": "Procurando Nemo (2003)",
      "desc": "O preocupado peixe-palhaço Marlin cruza o vasto oceano ao lado da esquecida Dory em busca de seu filho capturado por mergulhadores."
    }
  },
  "tt0298148": {
    "en": {
      "title": "Shrek 2 (2004)",
      "desc": "Shrek and Fiona travel to the Kingdom of Far Far Away, where Fiona's parents are King and Queen, to celebrate their marriage, but things go awry."
    },
    "pt": {
      "title": "Shrek 2 (2004)",
      "desc": "Shrek e Fiona viajam ao reino de Tão Tão Distante para conhecer os pais da princesa, enfrentando as armações da Fada Madrinha e do Príncipe Encantado."
    }
  },
  "tt2543164": {
    "en": {
      "title": "Arrival (2016)",
      "desc": "A linguist works with the military to communicate with alien lifeforms after twelve mysterious spacecraft appear around the world."
    },
    "pt": {
      "title": "A Chegada (2016)",
      "desc": "Uma brilhante linguista é convocada pelo exército para tentar se comunicar com seres extraterrestres após o pouso de doze naves na Terra."
    }
  },
  "tt1454468": {
    "en": {
      "title": "Gravity (2013)",
      "desc": "Two astronauts work together to survive after an accident leaves them stranded in space."
    },
    "pt": {
      "title": "Gravidade (2013)",
      "desc": "Dois astronautas lutam desesperadamente pela sobrevivência após destroços espaciais destruírem sua estação em órbita da Terra."
    }
  },
  "tt6723592": {
    "en": {
      "title": "Tenet (2020)",
      "desc": "Armed with only one word, Tenet, and fighting for the survival of the entire world, a Protagonist journeys through a twilight world of international espionage on a mission that will unfold in something beyond real time."
    },
    "pt": {
      "title": "Tenet (2020)",
      "desc": "Munido de uma única palavra, um agente secreto viaja pelo mundo da espionagem em uma missão que desafia as leis do tempo para evitar a Terceira Guerra Mundial."
    }
  },
  "tt1631867": {
    "en": {
      "title": "Edge of Tomorrow (2014)",
      "desc": "A soldier fighting aliens gets to relive the same day over and over again, the day restarting every time he dies."
    },
    "pt": {
      "title": "No Limite do Amanhã (2014)",
      "desc": "Um militar preso em um loop temporal revive o mesmo dia de uma batalha alienígena toda vez que morre, aprimorando suas táticas a cada renascimento."
    }
  },
  "tt0470752": {
    "en": {
      "title": "Ex Machina (2014)",
      "desc": "A young programmer is selected to participate in a ground-breaking experiment in synthetic intelligence by evaluating the human qualities of a highly advanced humanoid A.I."
    },
    "pt": {
      "title": "Ex Machina (2014)",
      "desc": "Um jovem programador é convidado para realizar o teste de Turing em Ava, uma inteligência artificial humanoide ultra-avançada e sedutora."
    }
  },
  "tt0107290": {
    "en": {
      "title": "Jurassic Park (1993)",
      "desc": "A pragmatic paleontologist touring an almost complete theme park on an island in Central America is tasked with protecting a couple of kids after a power failure causes the park's cloned dinosaurs to run loose."
    },
    "pt": {
      "title": "Jurassic Park: O Parque dos Dinossauros (1993)",
      "desc": "Cientistas clonam dinossauros em um parque temático em uma ilha remota, mas uma falha de segurança liberta as criaturas mais letais da história."
    }
  },
  "tt0482571": {
    "en": {
      "title": "The Prestige (2006)",
      "desc": "After a tragic accident, two stage magicians in 1890s London engage in a battle to create the ultimate illusion while sacrificing everything they have to outwit each other."
    },
    "pt": {
      "title": "O Grande Truque (2006)",
      "desc": "Na Londres do século XIX, dois mágicos obcecados travam uma rivalidade destrutiva e mortal para criar o maior truque de teletransporte do mundo."
    }
  },
  "tt1130884": {
    "en": {
      "title": "Shutter Island (2010)",
      "desc": "In 1954, a U.S. Marshal investigates the disappearance of a murderer who escaped from a hospital for the criminally insane."
    },
    "pt": {
      "title": "Ilha do Medo (2010)",
      "desc": "Dois agentes federais investigam o misterioso desaparecimento de uma paciente em um hospital psiquiátrico de segurança máxima em uma ilha isolada."
    }
  },
  "tt0114369": {
    "en": {
      "title": "Se7en (1995)",
      "desc": "Two detectives, a rookie and a veteran, hunt a serial killer who uses the seven deadly sins as his motives."
    },
    "pt": {
      "title": "Se7en: Os Sete Crimes Capitais (1995)",
      "desc": "Dois detetives de homicídios investigam os crimes chocantes e metodológicos de um assassino em série obcecado pelos sete pecados capitais."
    }
  },
  "tt7991608": {
    "en": {
      "title": "Red Notice (2021)",
      "desc": "An FBI profiler pursuing the world's most wanted art thief becomes his reluctant partner in crime to catch an elusive crook who's always one step ahead."
    },
    "pt": {
      "title": "Alerta Vermelho (2021)",
      "desc": "Um agente do FBI se une relutantemente ao segundo ladrão de arte mais procurado do mundo para capturar a criminosa mais esquiva de todas."
    }
  },
  "tt8936646": {
    "en": {
      "title": "Extraction (2020)",
      "desc": "A black-market mercenary who has nothing to lose is hired to rescue the kidnapped son of an imprisoned international crime lord in Bangladesh."
    },
    "pt": {
      "title": "Resgate (2020)",
      "desc": "Um mercenário destemido aceita a missão impossível de resgatar o filho sequestrado de um poderoso chefão do crime internacional."
    }
  },
  "tt12747748": {
    "en": {
      "title": "Leave the World Behind (2023)",
      "desc": "A family's quiet getaway is interrupted by two strangers bearing news of a mysterious cyberattack, forcing both families to cope with an impending collapse."
    },
    "pt": {
      "title": "O Mundo Depois de Nós (2023)",
      "desc": "As férias tranquilas de uma família são interrompidas por dois estranhos que trazem notícias de um misterioso ciberataque global."
    }
  },
  "tt16277242": {
    "en": {
      "title": "Society of the Snow (2023)",
      "desc": "The incredible real-life story of the Uruguayan rugby team stranded in the heart of the Andes mountains after their plane crashes in 1972."
    },
    "pt": {
      "title": "A Sociedade da Neve (2023)",
      "desc": "A épica e comovente história real dos sobreviventes da queda de um avião na Cordilheira dos Andes em 1972 e sua heróica luta pela vida."
    }
  },
  "tt1302006": {
    "en": {
      "title": "The Irishman (2019)",
      "desc": "Hitman Frank Sheeran looks back at the secrets he kept as a loyal member of the Bufalino crime family and his involvement in the disappearance of Jimmy Hoffa."
    },
    "pt": {
      "title": "O Irlandês (2019)",
      "desc": "Frank Sheeran, um veterano de guerra e assassino profissional da máfia, relembra seu envolvimento no lendário desaparecimento de Jimmy Hoffa."
    }
  },
  "tt11564570": {
    "en": {
      "title": "Glass Onion: A Knives Out Mystery (2022)",
      "desc": "Master detective Benoit Blanc travels to a private Greek island to unravel a layered mystery involving an eccentric tech billionaire and his eclectic group of friends."
    },
    "pt": {
      "title": "Glass Onion: Um Mistério Knives Out (2022)",
      "desc": "O mestre detetive Benoit Blanc viaja até uma ilha privada na Grécia para desvendar um intricado jogo de assassinato entre amigos bilionários."
    }
  },
  "tt11286314": {
    "en": {
      "title": "Don't Look Up (2021)",
      "desc": "Two low-level astronomers must go on a giant media tour to warn mankind of an approaching comet that will destroy planet Earth."
    },
    "pt": {
      "title": "Não Olhe Para Cima (2021)",
      "desc": "Dois astrônomos medíocres fazem uma turnê desesperada pela mídia global para alertar a humanidade sobre a aproximação de um cometa mortal que destruirá a Terra."
    }
  },
  "tt11756556": {
    "en": {
      "title": "Rebel Ridge (2024)",
      "desc": "A former Marine confronts corruption in a small town when local law enforcement unjustly seizes the bag of cash he needs to post his cousin's bail."
    },
    "pt": {
      "title": "Rebel Ridge (2024)",
      "desc": "Um ex-fuzileiro naval enfrenta a corrupção violenta e sistêmica em uma pequena cidade após a polícia confiscar injustamente a fiança de seu primo."
    }
  },
  "tt2463208": {
    "en": {
      "title": "The Adam Project (2022)",
      "desc": "Time-traveling fighter pilot Adam Reed teams up with his 12-year-old self and his late father to come to terms with his past while saving the future."
    },
    "pt": {
      "title": "O Projeto Adam (2022)",
      "desc": "Um piloto de caça viajante no tempo faz um pouso forçado em 2022 e se junta à sua versão de 12 anos em uma missão para salvar o futuro."
    }
  },
  "tt1649418": {
    "en": {
      "title": "The Gray Man (2022)",
      "desc": "When the CIA's top skilled operative accidentally uncovers dark agency secrets, he becomes the target of a global manhunt by a sociopathic rogue mercenary."
    },
    "pt": {
      "title": "Agente Oculto (2022)",
      "desc": "Quando o agente mais habilidoso da CIA descobre segredos obscuros da agência, um ex-colega psicopata coloca sua cabeça a prêmio em uma caçada global."
    }
  },
  "tt2734604": {
    "en": {
      "title": "Bird Box (2018)",
      "desc": "Five years after an ominous unseen presence drives most of society to suicide, a mother and her two children make a desperate bid to reach safety while blindfolded."
    },
    "pt": {
      "title": "Bird Box (2018)",
      "desc": "Cinco anos após uma presença invisível e misteriosa levar a população ao suicídio, uma mãe e seus dois filhos tentam desesperadamente navegar vendados até um refúgio seguro."
    }
  },
  "tt13452446": {
    "en": {
      "title": "Damsel (2024)",
      "desc": "A dutiful damsel agrees to marry a handsome prince, only to discover it was a trap: the royal family recruits her as a sacrifice to repay an ancient debt to a dragon."
    },
    "pt": {
      "title": "Donzela (2024)",
      "desc": "O casamento de conto de fadas de uma donzela vira uma batalha mortal pela sobrevivência quando a família real a oferece em sacrifício a um dragão."
    }
  },
  "tt3083016": {
    "en": {
      "title": "Beverly Hills Cop: Axel F (2024)",
      "desc": "Detective Axel Foley is back in Beverly Hills after his daughter's life is threatened, teaming up with a new partner and old pals to uncover a conspiracy."
    },
    "pt": {
      "title": "Um Tira da Pesada 4: Axel Foley (2024)",
      "desc": "O lendário detetive de Detroit Axel Foley está de volta a Beverly Hills para proteger sua filha e desmascarar uma perigosa conspiração criminosa."
    }
  },
  "tt14998742": {
    "en": {
      "title": "Rebel Moon - Part One: A Child of Fire (2023)",
      "desc": "When a peaceful colony on the edge of the galaxy finds itself threatened by the armies of the tyrannical Regent Balisarius, a mysterious stranger becomes its best hope."
    },
    "pt": {
      "title": "Rebel Moon - Parte 1: A Menina do Fogo (2023)",
      "desc": "Quando uma colônia pacífica se vê ameaçada pelos exércitos do tirano Mundo-Mãe, uma jovem misteriosa reúne rebeldes destemidos para lutar."
    }
  },
  "tt1136617": {
    "en": {
      "title": "The Killer (2023)",
      "desc": "After a fateful near-miss, an assassin battles his employers and himself on an international manhunt he insists isn't personal."
    },
    "pt": {
      "title": "O Assassino (2023)",
      "desc": "Após um erro quase fatal em Paris, um assassino metódico e calculista trava uma caçada implacável contra seus próprios empregadores."
    }
  },
  "tt7846844": {
    "en": {
      "title": "Enola Holmes (2020)",
      "desc": "While searching for her missing mother, intrepid teen Enola Holmes uses her sleuthing skills to outsmart big brother Sherlock and help a runaway lord."
    },
    "pt": {
      "title": "Enola Holmes (2020)",
      "desc": "Ao descobrir que sua mãe desapareceu misteriosamente, a destemida e perspicaz adolescente Enola supera seu famoso irmão Sherlock para desvendar uma conspiração."
    }
  },
  "tt1618434": {
    "en": {
      "title": "Murder Mystery (2019)",
      "desc": "A New York cop and his hairdresser wife go on a European vacation to reinvigorate the spark in their marriage, but end up framed for the death of an elderly billionaire."
    },
    "pt": {
      "title": "Mistério no Mediterrâneo (2019)",
      "desc": "Um policial de Nova York e sua esposa viajam de férias pela Europa e acabam se tornando os principais suspeitos do assassinato de um bilionário em seu iate."
    }
  },
  "tt0993840": {
    "en": {
      "title": "Army of the Dead (2021)",
      "desc": "Following a zombie outbreak in Las Vegas, a group of mercenaries take the ultimate gamble, venturing into the quarantine zone to pull off the greatest heist ever attempted."
    },
    "pt": {
      "title": "Army of the Dead: Invasão em Las Vegas (2021)",
      "desc": "Após um surto zumbi que isola Las Vegas, um grupo de mercenários arrisca tudo invadindo a zona de quarentena para realizar o maior assalto da história."
    }
  },
  "tt14856980": {
    "en": {
      "title": "Atlas (2024)",
      "desc": "A brilliant counterterrorism data analyst with a deep distrust of AI discovers that her only hope of saving humanity from a renegade robot is to trust it."
    },
    "pt": {
      "title": "Atlas (2024)",
      "desc": "Uma brilhante analista de dados com profunda desconfiança da IA descobre que sua única esperança de salvar a humanidade de um robô renegado pode ser confiar nela."
    }
  },
  "tt2049403": {
    "en": {
      "title": "Beetlejuice Beetlejuice (2024)",
      "desc": "After a family tragedy, three generations of the Deetz family return home to Winter River, where Lydia's life is turned upside down when the portal to the Afterlife opens."
    },
    "pt": {
      "title": "Os Fantasmas Ainda se Divertem: Beetlejuice (2024)",
      "desc": "Três gerações da família Deetz retornam a Winter River e abrem acidentalmente o portal para o pós-vida, libertando o travesso Beetlejuice."
    }
  },
  "tt1119646": {
    "en": {
      "title": "The Hangover (2009)",
      "desc": "Three buddies wake up from a bachelor party in Las Vegas with no memory of the previous night and the bachelor missing. They must retrace their steps to find him before the wedding."
    },
    "pt": {
      "title": "Se Beber, Não Case! (2009)",
      "desc": "Três padrinhos de casamento acordam em Las Vegas sem memória da noite anterior e sem o noivo, precisando desvendar pistas absurdas antes da cerimônia."
    }
  },
  "tt0829482": {
    "en": {
      "title": "Superbad (2007)",
      "desc": "Two co-dependent high school seniors are forced to deal with separation anxiety after their plan to stage a booze-soaked party goes awry."
    },
    "pt": {
      "title": "Superbad: É Hoje (2007)",
      "desc": "Dois melhores amigos do ensino médio tentam comprar bebidas para uma festa lendária e acabam vivendo uma das noites mais caóticas de suas vidas."
    }
  },
  "tt0381707": {
    "en": {
      "title": "White Chicks (2004)",
      "desc": "Two FBI agent brothers go undercover as white high-society women in the Hamptons to protect them from a kidnapping plot."
    },
    "pt": {
      "title": "As Branquelas (2004)",
      "desc": "Dois atrapalhados agentes do FBI se disfarçam de socialites loiras nos Hamptons para desmantelar um plano de sequestro em meio a muita confusão."
    }
  },
  "tt0271383": {
    "en": {
      "title": "A Dog's Will (2000)",
      "desc": "The lively and deceitful João Grilo and the timid Chicó face poverty and powerful landowners in the Northeast of Brazil, finding redemption through wit and humor."
    },
    "pt": {
      "title": "O Auto da Compadecida (2000)",
      "desc": "As hilárias peripécias dos sertanejos João Grilo e Chicó no sertão da Paraíba, enganando os poderosos com esperteza até o julgamento celestial."
    }
  },
  "tt13433802": {
    "en": {
      "title": "A Quiet Place: Day One (2024)",
      "desc": "A young woman named Sam must navigate the chaotic first hours of an invasion by ferocious alien creatures with ultra-sensitive hearing in New York City."
    },
    "pt": {
      "title": "Um Lugar Silencioso: Dia Um (2024)",
      "desc": "Uma mulher chamada Sam luta para sobreviver ao primeiro dia do aterrorizante ataque alienígena por criaturas cegas orientadas pelo som em Nova York."
    }
  },
  "tt23468450": {
    "en": {
      "title": "Longlegs (2024)",
      "desc": "In pursuit of a serial killer, an FBI agent uncovers a series of occult clues that she must solve to end his terrifying killing spree."
    },
    "pt": {
      "title": "Longlegs: Vínculo Mortal (2024)",
      "desc": "Uma agente novata do FBI desvenda pistas ocultas e perturbadoras enquanto persegue um assassino em série com ligações ao sobrenatural."
    }
  },
  "tt1457767": {
    "en": {
      "title": "The Conjuring (2013)",
      "desc": "Paranormal investigators Ed and Lorraine Warren work to help a family terrorized by a dark presence in their secluded farmhouse."
    },
    "pt": {
      "title": "Invocação do Mal (2013)",
      "desc": "Os investigadores paranormais Ed e Lorraine Warren viajam para ajudar uma família aterrorizada por uma presença demoníaca em sua casa de fazenda."
    }
  },
  "tt3065204": {
    "en": {
      "title": "The Conjuring 2 (2016)",
      "desc": "Ed and Lorraine Warren travel to North London to help a single mother raising four children alone in a house plagued by a malicious poltergeist."
    },
    "pt": {
      "title": "Invocação do Mal 2 (2016)",
      "desc": "Os investigadores Ed e Lorraine Warren viajam a Londres para ajudar uma família assolada pelo misterioso poltergeist de Enfield."
    }
  },
  "tt5052448": {
    "en": {
      "title": "Get Out (2017)",
      "desc": "A young African-American visits his white girlfriend's parents for the weekend, where his simmering uneasiness about their reception reaches a boiling point."
    },
    "pt": {
      "title": "Corra! (2017)",
      "desc": "Um jovem fotógrafo negro viaja para conhecer a família de sua namorada branca e aos poucos descobre segredos perturbadores e macabros."
    }
  },
  "tt7784604": {
    "en": {
      "title": "Hereditary (2018)",
      "desc": "A grieving family is tormented by tragic and disturbing occurrences after the death of their secretive grandmother."
    },
    "pt": {
      "title": "Hereditário (2018)",
      "desc": "Após a morte da avó matriarca, uma família começa a desvendar segredos aterrorizantes e uma herança sombria e inevitável."
    }
  },
  "tt0081505": {
    "en": {
      "title": "The Shining (1980)",
      "desc": "A family heads to an isolated hotel for the winter where a sinister presence influences the father into violence, while his psychic son sees horrific forebodings."
    },
    "pt": {
      "title": "O Iluminado (1980)",
      "desc": "Um escritor aceita o trabalho de zelador de inverno em um hotel isolado nas montanhas, onde forças sobrenaturais e o isolamento o levam à loucura homicida."
    }
  },
  "tt15474914": {
    "en": {
      "title": "Smile (2022)",
      "desc": "After witnessing a bizarre, traumatic incident involving a patient, a psychiatrist becomes increasingly convinced she is being threatened by an uncanny entity."
    },
    "pt": {
      "title": "Sorria (2022)",
      "desc": "Após testemunhar um incidente traumático com uma paciente, uma médica é perseguida por uma presença sobrenatural que se manifesta através de sorrisos macabros."
    }
  },
  "tt2467372": {
    "en": {
      "title": "Brooklyn Nine-Nine",
      "desc": "Comedy series following the exploits of Det. Jake Peralta and his diverse, lovable colleagues as they police the NYPD's 99th Precinct."
    },
    "pt": {
      "title": "Brooklyn Nine-Nine",
      "desc": "O brilhante e imaturo detetive Jake Peralta e seus excêntricos colegas da 99ª Delegacia do Brooklyn sob a liderança do capitão Raymond Holt."
    }
  },
  "tt0386676": {
    "en": {
      "title": "The Office",
      "desc": "A mockumentary on a group of typical office workers, where the workday consists of ego clashes, inappropriate behavior, and tedium."
    },
    "pt": {
      "title": "The Office: Vida de Escritório",
      "desc": "O cotidiano cômico e desastroso dos funcionários da empresa de papel Dunder Mifflin em Scranton sob a liderança do gerente Michael Scott."
    }
  },
  "tt0108778": {
    "en": {
      "title": "Friends",
      "desc": "Follows the personal and professional lives of six twenty to thirty-something-year-old friends living in Manhattan."
    },
    "pt": {
      "title": "Friends",
      "desc": "As vidas amorosas e profissionais de seis amigos inseparáveis vivendo em Manhattan ao longo de dez memoráveis temporadas."
    }
  },
  "tt6763664": {
    "en": {
      "title": "The Haunting of Hill House",
      "desc": "Flashing between past and present, a fractured family confronts haunting memories of their old home and the terrifying events that drove them from it."
    },
    "pt": {
      "title": "A Maldição da Residência Hill",
      "desc": "Irmãos adultos lidam com traumas de infância após terem crescido na que se tornaria a mansão mal-assombrada mais famosa do país."
    }
  }
};

const TITLE_NAME_MAP = {
  "alerta vermelho": { en: "Red Notice", pt: "Alerta Vermelho" },
  "red notice": { en: "Red Notice", pt: "Alerta Vermelho" },
  "resgate": { en: "Extraction", pt: "Resgate" },
  "extraction": { en: "Extraction", pt: "Resgate" },
  "resgate 2": { en: "Extraction 2", pt: "Resgate 2" },
  "extraction 2": { en: "Extraction 2", pt: "Resgate 2" },
  "o mundo depois de nós": { en: "Leave the World Behind", pt: "O Mundo Depois de Nós" },
  "leave the world behind": { en: "Leave the World Behind", pt: "O Mundo Depois de Nós" },
  "a sociedade da neve": { en: "Society of the Snow", pt: "A Sociedade da Neve" },
  "society of the snow": { en: "Society of the Snow", pt: "A Sociedade da Neve" },
  "o irlandês": { en: "The Irishman", pt: "O Irlandês" },
  "the irishman": { en: "The Irishman", pt: "O Irlandês" },
  "glass onion: um mistério knives out": { en: "Glass Onion: A Knives Out Mystery", pt: "Glass Onion: Um Mistério Knives Out" },
  "glass onion": { en: "Glass Onion: A Knives Out Mystery", pt: "Glass Onion: Um Mistério Knives Out" },
  "não olhe para cima": { en: "Don't Look Up", pt: "Não Olhe Para Cima" },
  "don't look up": { en: "Don't Look Up", pt: "Não Olhe Para Cima" },
  "rebel ridge": { en: "Rebel Ridge", pt: "Rebel Ridge" },
  "o projeto adam": { en: "The Adam Project", pt: "O Projeto Adam" },
  "the adam project": { en: "The Adam Project", pt: "O Projeto Adam" },
  "agente oculto": { en: "The Gray Man", pt: "Agente Oculto" },
  "the gray man": { en: "The Gray Man", pt: "Agente Oculto" },
  "bird box": { en: "Bird Box", pt: "Bird Box" },
  "donzela": { en: "Damsel", pt: "Donzela" },
  "damsel": { en: "Damsel", pt: "Donzela" },
  "um tira da pesada 4: axel foley": { en: "Beverly Hills Cop: Axel F", pt: "Um Tira da Pesada 4: Axel Foley" },
  "beverly hills cop: axel f": { en: "Beverly Hills Cop: Axel F", pt: "Um Tira da Pesada 4: Axel Foley" },
  "rebel moon - parte 1: a menina do fogo": { en: "Rebel Moon - Part One: A Child of Fire", pt: "Rebel Moon - Parte 1: A Menina do Fogo" },
  "rebel moon - part one: a child of fire": { en: "Rebel Moon - Part One: A Child of Fire", pt: "Rebel Moon - Parte 1: A Menina do Fogo" },
  "rebel moon": { en: "Rebel Moon - Part One: A Child of Fire", pt: "Rebel Moon - Parte 1: A Menina do Fogo" },
  "o assassino": { en: "The Killer", pt: "O Assassino" },
  "the killer": { en: "The Killer", pt: "O Assassino" },
  "enola holmes": { en: "Enola Holmes", pt: "Enola Holmes" },
  "mistério no mediterrâneo": { en: "Murder Mystery", pt: "Mistério no Mediterrâneo" },
  "murder mystery": { en: "Murder Mystery", pt: "Mistério no Mediterrâneo" },
  "army of the dead: invasão em las vegas": { en: "Army of the Dead", pt: "Army of the Dead: Invasão em Las Vegas" },
  "army of the dead": { en: "Army of the Dead", pt: "Army of the Dead: Invasão em Las Vegas" },
  "atlas": { en: "Atlas", pt: "Atlas" },
  "se beber, não case!": { en: "The Hangover", pt: "Se Beber, Não Case!" },
  "the hangover": { en: "The Hangover", pt: "Se Beber, Não Case!" },
  "superbad: é hoje": { en: "Superbad", pt: "Superbad: É Hoje" },
  "superbad": { en: "Superbad", pt: "Superbad: É Hoje" },
  "as branquelas": { en: "White Chicks", pt: "As Branquelas" },
  "white chicks": { en: "White Chicks", pt: "As Branquelas" },
  "o auto da compadecida": { en: "A Dog's Will", pt: "O Auto da Compadecida" },
  "a dog's will": { en: "A Dog's Will", pt: "O Auto da Compadecida" },
  "um lugar silencioso: dia um": { en: "A Quiet Place: Day One", pt: "Um Lugar Silencioso: Dia Um" },
  "a quiet place: day one": { en: "A Quiet Place: Day One", pt: "Um Lugar Silencioso: Dia Um" },
  "longlegs: vínculo mortal": { en: "Longlegs", pt: "Longlegs: Vínculo Mortal" },
  "longlegs": { en: "Longlegs", pt: "Longlegs: Vínculo Mortal" },
  "invocação do mal": { en: "The Conjuring", pt: "Invocação do Mal" },
  "the conjuring": { en: "The Conjuring", pt: "Invocação do Mal" },
  "invocação do mal 2": { en: "The Conjuring 2", pt: "Invocação do Mal 2" },
  "the conjuring 2": { en: "The Conjuring 2", pt: "Invocação do Mal 2" },
  "corra!": { en: "Get Out", pt: "Corra!" },
  "get out": { en: "Get Out", pt: "Corra!" },
  "hereditário": { en: "Hereditary", pt: "Hereditário" },
  "hereditary": { en: "Hereditary", pt: "Hereditário" },
  "o iluminado": { en: "The Shining", pt: "O Iluminado" },
  "the shining": { en: "The Shining", pt: "O Iluminado" },
  "sorria": { en: "Smile", pt: "Sorria" },
  "smile": { en: "Smile", pt: "Sorria" },
  "os fantasmas ainda se divertem: beetlejuice": { en: "Beetlejuice Beetlejuice", pt: "Os Fantasmas Ainda se Divertem: Beetlejuice" },
  "beetlejuice beetlejuice": { en: "Beetlejuice Beetlejuice", pt: "Os Fantasmas Ainda se Divertem: Beetlejuice" },
  "pinguim": { en: "The Penguin", pt: "Pinguim" },
  "the penguin": { en: "The Penguin", pt: "Pinguim" },
  "xógum: a gloriosa saga do japão": { en: "Shōgun", pt: "Xógum: A Gloriosa Saga do Japão" },
  "shōgun": { en: "Shōgun", pt: "Xógum: A Gloriosa Saga do Japão" },
  "shogun": { en: "Shōgun", pt: "Xógum: A Gloriosa Saga do Japão" },
  "a casa do dragão": { en: "House of the Dragon", pt: "A Casa do Dragão" },
  "house of the dragon": { en: "House of the Dragon", pt: "A Casa do Dragão" },
  "o urso": { en: "The Bear", pt: "O Urso" },
  "the bear": { en: "The Bear", pt: "O Urso" },
  "família soprano": { en: "The Sopranos", pt: "Família Soprano" },
  "the sopranos": { en: "The Sopranos", pt: "Família Soprano" },
  "a escuta": { en: "The Wire", pt: "A Escuta" },
  "the wire": { en: "The Wire", pt: "A Escuta" },
  "avatar: a lenda de aang": { en: "Avatar: The Last Airbender", pt: "Avatar: A Lenda de Aang" },
  "avatar: the last airbender": { en: "Avatar: The Last Airbender", pt: "Avatar: A Lenda de Aang" },
  "gravity falls: um verão de mistérios": { en: "Gravity Falls", pt: "Gravity Falls: Um Verão de Mistérios" },
  "gravity falls": { en: "Gravity Falls", pt: "Gravity Falls: Um Verão de Mistérios" },
  "hora de aventura": { en: "Adventure Time", pt: "Hora de Aventura" },
  "adventure time": { en: "Adventure Time", pt: "Hora de Aventura" },
  "apenas um show": { en: "Regular Show", pt: "Apenas um Show" },
  "regular show": { en: "Regular Show", pt: "Apenas um Show" },
  "bob esponja calça quadrada": { en: "SpongeBob SquarePants", pt: "Bob Esponja Calça Quadrada" },
  "spongebob squarepants": { en: "SpongeBob SquarePants", pt: "Bob Esponja Calça Quadrada" },
  "invencível": { en: "Invincible", pt: "Invencível" },
  "invincible": { en: "Invincible", pt: "Invencível" },
  "a lenda de korra": { en: "The Legend of Korra", pt: "A Lenda de Korra" },
  "the legend of korra": { en: "The Legend of Korra", pt: "A Lenda de Korra" },
  "o mandaloriano": { en: "The Mandalorian", pt: "O Mandaloriano" },
  "the mandalorian": { en: "The Mandalorian", pt: "O Mandaloriano" },
  "o problema dos 3 corpos": { en: "3 Body Problem", pt: "O Problema dos 3 Corpos" },
  "3 body problem": { en: "3 Body Problem", pt: "O Problema dos 3 Corpos" },
  "demolidor": { en: "Daredevil", pt: "Demolidor" },
  "daredevil": { en: "Daredevil", pt: "Demolidor" },
  "o justiceiro": { en: "The Punisher", pt: "O Justiceiro" },
  "the punisher": { en: "The Punisher", pt: "O Justiceiro" },
  "24 horas": { en: "24", pt: "24 Horas" },
  "a lista terminal": { en: "The Terminal List", pt: "A Lista Terminal" },
  "the terminal list": { en: "The Terminal List", pt: "A Lista Terminal" },
  "a maldição da residência hill": { en: "The Haunting of Hill House", pt: "A Maldição da Residência Hill" },
  "the haunting of hill house": { en: "The Haunting of Hill House", pt: "A Maldição da Residência Hill" }
};

const GENRE_MAP = {
  "en": {
    "Ação": "Action",
    "Action": "Action",
    "Aventura": "Adventure",
    "Adventure": "Adventure",
    "Ficção Científica": "Sci-Fi",
    "Ficção": "Sci-Fi",
    "Sci-Fi": "Sci-Fi",
    "Drama": "Drama",
    "Crime": "Crime",
    "Comédia": "Comedy",
    "Comedy": "Comedy",
    "Terror": "Horror",
    "Horror": "Horror",
    "Animação": "Animation",
    "Animation": "Animation",
    "História": "History",
    "History": "History",
    "Guerra": "War",
    "War": "War",
    "Fantasia": "Fantasy",
    "Fantasy": "Fantasy",
    "Biografia": "Biography",
    "Biography": "Biography",
    "Mistério": "Mystery",
    "Mystery": "Mystery",
    "Família": "Family",
    "Family": "Family",
    "Romance": "Romance",
    "Suspense": "Thriller",
    "Thriller": "Thriller",
    "Documentário": "Documentary",
    "Documentary": "Documentary",
    "Geral": "General",
    "Filme": "Movie",
    "Série": "Series"
  },
  "pt": {
    "Action": "Ação",
    "Ação": "Ação",
    "Adventure": "Aventura",
    "Aventura": "Aventura",
    "Sci-Fi": "Ficção Científica",
    "Ficção Científica": "Ficção Científica",
    "Ficção": "Ficção Científica",
    "Drama": "Drama",
    "Crime": "Crime",
    "Comedy": "Comédia",
    "Comédia": "Comédia",
    "Horror": "Terror",
    "Terror": "Terror",
    "Animation": "Animação",
    "Animação": "Animação",
    "History": "História",
    "História": "História",
    "War": "Guerra",
    "Guerra": "Guerra",
    "Fantasy": "Fantasia",
    "Fantasia": "Fantasia",
    "Biography": "Biografia",
    "Biografia": "Biografia",
    "Mystery": "Mistério",
    "Mistério": "Mistério",
    "Family": "Família",
    "Família": "Família",
    "Romance": "Romance",
    "Thriller": "Suspense",
    "Suspense": "Suspense",
    "Documentary": "Documentário",
    "Documentário": "Documentário",
    "General": "Geral",
    "Movie": "Filme",
    "Series": "Série"
  }
};

let currentLanguage = (typeof localStorage !== 'undefined' ? localStorage.getItem('cinetv_lang') : null) || 'en';

export function getLanguage() {
  return currentLanguage;
}
if (typeof window !== 'undefined') {
  window.getLanguage = getLanguage;
}

export function setLanguage(lang) {
  if (lang !== 'en' && lang !== 'pt') lang = 'en';
  currentLanguage = lang;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('cinetv_lang', lang);
  }
  if (typeof document !== 'undefined') {
    applyTranslationsToDOM();
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cinetv:langChanged', { detail: lang }));
  }
}

export function t(key) {
  const dict = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  return dict[key] || TRANSLATIONS.en[key] || key;
}

const translationMemoryCache = new Map();

/**
 * Translates arbitrary text between EN and PT using fast translation memory
 */
export async function translateTextAsync(text, targetLang = 'pt') {
  if (!text || typeof text !== 'string' || text.trim().length < 4) return text;
  const trimmed = text.trim();
  const langPair = targetLang === 'pt' ? 'en|pt-BR' : 'pt-BR|en';
  const cacheKey = `${langPair}:${trimmed.slice(0, 80)}`;
  
  if (translationMemoryCache.has(cacheKey)) {
    return translationMemoryCache.get(cacheKey);
  }

  try {
    const chunk = trimmed.slice(0, 400);
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${langPair}`, {
      signal: AbortSignal.timeout(3500)
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.responseData?.translatedText) {
        let result = data.responseData.translatedText;
        result = result.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
        translationMemoryCache.set(cacheKey, result);
        return result;
      }
    }
  } catch (e) {}
  return text;
}

function formatTitleLanguage(titleStr, lang) {
  if (!titleStr || typeof titleStr !== 'string') return titleStr || '';
  if (lang === 'en') {
    return titleStr
      .replace(/\bTemporada\s+(\d+)/gi, 'Season $1')
      .replace(/\bTemp\.?\s*(\d+)/gi, 'Season $1')
      .replace(/\s*-\s*T(\d+)\b/gi, ' - S$1')
      .replace(/\bT(\d+)\s*:\s*E(\d+)\b/gi, 'S$1:E$2')
      .replace(/\bEpisódio\s+(\d+)/gi, 'Episode $1')
      .replace(/\bEpisodio\s+(\d+)/gi, 'Episode $1');
  } else {
    return titleStr
      .replace(/\bSeason\s+(\d+)/gi, 'Temporada $1')
      .replace(/\s*-\s*S(\d+)\b/gi, ' - T$1')
      .replace(/\bEpisode\s+(\d+)/gi, 'Episódio $1');
  }
}

export function getItemTitle(item) {
  if (!item) return '';
  const lang = getLanguage();
  const id = item.imdbId || item.id;
  if (id && TITLE_TRANSLATIONS[id]?.[lang]?.title) {
    return formatTitleLanguage(TITLE_TRANSLATIONS[id][lang].title, lang);
  }

  // Explicit title_en / title_pt on item object
  if (lang === 'en' && (item.title_en || item.titleEn)) {
    return formatTitleLanguage(item.title_en || item.titleEn, lang);
  }
  if (lang === 'pt' && (item.title_pt || item.titlePt)) {
    return formatTitleLanguage(item.title_pt || item.titlePt, lang);
  }

  const rawTitle = (item.title || item.name || '').trim();
  if (!rawTitle) return '';

  // Check TITLE_NAME_MAP directly
  const cleanKey = rawTitle.toLowerCase().trim();
  if (TITLE_NAME_MAP[cleanKey]?.[lang]) {
    return formatTitleLanguage(TITLE_NAME_MAP[cleanKey][lang], lang);
  }

  // Check TITLE_NAME_MAP without trailing year e.g. " (2024)"
  const keyNoYear = cleanKey.replace(/\s*\(\d{4}\)$/, '').trim();
  if (TITLE_NAME_MAP[keyNoYear]?.[lang]) {
    const yearMatch = rawTitle.match(/\((\d{4})\)$/);
    const yr = yearMatch ? ` (${yearMatch[1]})` : '';
    return formatTitleLanguage(`${TITLE_NAME_MAP[keyNoYear][lang]}${yr}`, lang);
  }

  // Smart dual-language title parser
  // Matches "Portuguese (English) (Year)" or "Portuguese (English)" or "Portuguese (English) - T1"
  const dualMatch = rawTitle.match(/^([^(]+?)\s*\(([^)]+)\)(.*)$/);
  if (dualMatch) {
    const ptPart = dualMatch[1].trim();
    const enPart = dualMatch[2].trim();
    const rest = dualMatch[3] ? dualMatch[3].trim() : '';

    // Verify enPart is a title string, not just a pure year or number
    if (isNaN(enPart) && enPart.length > 1) {
      if (lang === 'en') {
        const finalRest = rest ? ` ${rest}` : '';
        return formatTitleLanguage(`${enPart}${finalRest}`, lang);
      } else {
        const finalRest = rest ? ` ${rest}` : '';
        return formatTitleLanguage(`${ptPart}${finalRest}`, lang);
      }
    }
  }

  const baseTitle = lang === 'en'
    ? (item.title_en || item.titleEn || item.name || item.title)
    : (item.title_pt || item.titlePt || item.title || item.name);

  if (baseTitle) {
    const langPair = lang === 'pt' ? 'en|pt-BR' : 'pt-BR|en';
    const cacheKey = `${langPair}:${baseTitle.trim().slice(0, 80)}`;
    if (translationMemoryCache.has(cacheKey)) {
      return formatTitleLanguage(translationMemoryCache.get(cacheKey), lang);
    }
    return formatTitleLanguage(baseTitle, lang);
  }
  return formatTitleLanguage(item.title || '', lang);
}

export function getItemDescription(item) {
  if (!item) return '';
  const lang = getLanguage();
  const id = item.imdbId || item.id;
  if (id && TITLE_TRANSLATIONS[id]?.[lang]?.desc) {
    return TITLE_TRANSLATIONS[id][lang].desc;
  }

  // Explicit description_en / description_pt on item object
  if (lang === 'en' && (item.description_en || item.descriptionEn)) {
    return item.description_en || item.descriptionEn;
  }
  if (lang === 'pt' && (item.description_pt || item.descriptionPt)) {
    return item.description_pt || item.descriptionPt;
  }

  const rawTitle = (item.title || item.name || '').toLowerCase().trim();
  const keyNoYear = rawTitle.replace(/\s*\(\d{4}\)$/, '').trim();
  if (TITLE_NAME_MAP[keyNoYear]?.[lang]?.desc) {
    return TITLE_NAME_MAP[keyNoYear][lang].desc;
  }

  const baseDesc = lang === 'en'
    ? (item.description_en || item.descriptionEn || item.description)
    : (item.description_pt || item.descriptionPt || item.description);

  if (baseDesc && !baseDesc.includes('catálogo Cinemeta')) {
    const langPair = lang === 'pt' ? 'en|pt-BR' : 'pt-BR|en';
    const cacheKey = `${langPair}:${baseDesc.trim().slice(0, 80)}`;
    if (translationMemoryCache.has(cacheKey)) {
      return translationMemoryCache.get(cacheKey);
    }
    return baseDesc;
  }

  const title = getItemTitle(item) || 'Content';
  return lang === 'en'
    ? `${title} - Available in Ultra HD 4K on ColossalStream.`
    : `${title} - Disponível em Ultra HD 4K no ColossalStream.`;
}

export function formatItemDuration(item) {
  if (!item) return '';
  if (item.type === 'series') {
    let count = item.episodesCount;
    if (!count && typeof item.duration === 'string') {
      const match = item.duration.match(/\d+/);
      if (match) count = parseInt(match[0], 10);
    }
    count = count || 8;
    return `${count} ${t('episodeLabel')}s`;
  }
  if (typeof item.duration === 'string') {
    return item.duration;
  }
  return '2h 15m';
}

export function localizeGenre(genre) {
  const lang = getLanguage();
  const map = GENRE_MAP[lang] || {};
  return map[genre] || genre;
}

export function getServerDisplayName(serverId) {
  const isEn = getLanguage() === 'en';
  return isEn ? 'Ultra HD 4K Server' : 'Servidor Ultra HD 4K';
}

export function applyTranslationsToDOM() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key) {
      el.innerText = t(key);
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key) {
      el.placeholder = t(key);
    }
  });
}

