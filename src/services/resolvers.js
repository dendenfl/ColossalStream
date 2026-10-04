/**
 * Multi-Source Stream Resolvers & Catalogs
 * Real Streams & Embed Providers for Movies, Series, and Live TV
 */
import { searchStremioCatalog, fetchStremioTopCatalog } from './stremio.js';
import { getItemTitle, getItemDescription, t, getLanguage } from './i18n.js';

// Multi-Engine High-Performance Streaming Servers (Fast 1080p/4K, Subtitles, Zero Ads)
// NOTE: Array order is the source of truth for server numbering AND the
// auto-fallback chain: playback starts at Server 1 and falls back 1 -> 2 -> 3 -> 4 -> 5.
// Display numbers are derived from this order via getServerLabel(), never hardcoded.
export const STREAM_SERVERS = [
  { id: "multiembed", name: "AnyEmbed VIP (Zero Ads & 1080p)", type: "embed" },
  { id: "vidlink", name: "VidLink Ultra (Fast 4K)", type: "embed" },
  { id: "2embed", name: "2Embed Prime", type: "embed" },
  { id: "vidsrc", name: "VidSrc Pro", type: "embed" },
  { id: "autoembed", name: "AutoEmbed HD (Backup)", type: "embed" }
];

// Server id -> i18n description key (descriptions carry no numbers on purpose)
const SERVER_LABEL_KEYS = {
  multiembed: "serverMultiEmbed",
  vidlink: "serverVidLink",
  "2embed": "server2Embed",
  vidsrc: "serverVidSrc",
  autoembed: "serverAutoEmbed"
};

/**
 * Single source of truth for server display labels, e.g. "Server 1 (AnyEmbed VIP - Zero Ads)".
 * The number is the server's position in STREAM_SERVERS, so reordering the
 * array automatically renumbers every label, toast, and the fallback chain.
 */
export function getServerLabel(serverId) {
  const idx = STREAM_SERVERS.findIndex(s => s.id === serverId);
  const key = SERVER_LABEL_KEYS[serverId];
  let desc = "";
  try {
    if (key && typeof t === "function") desc = t(key) || "";
  } catch (e) {}
  if (!desc) {
    const srv = STREAM_SERVERS.find(s => s.id === serverId);
    desc = (srv && srv.name) || String(serverId);
  }
  const n = idx >= 0 ? idx + 1 : "?";
  let isEn = true;
  try {
    if (typeof getLanguage === "function") isEn = getLanguage() === "en";
  } catch (e) {}
  return `${isEn ? "Server" : "Servidor"} ${n} (${desc})`;
}

export const BRAZILIAN_CATALOG = {
  superflix: [
    {
      id: "tt9218128",
      title: "Gladiador II (2024)",
      year: "2024",
      rating: "★ 8.2",
      type: "movie",
      duration: "2h 28m",
      poster: "https://images.metahub.space/poster/medium/tt9218128/img",
      backdrop: "https://images.metahub.space/background/medium/tt9218128/img",
      description: "Anos depois de testemunhar a morte do reverenciado herói Máximo, Lucius é forçado a lutar no Coliseu para restaurar a glória de Roma.",
      source: "ColossalStream",
      imdbId: "tt9218128"
    },
    {
      id: "tt15239678",
      title: "Duna: Parte 2 (2024)",
      year: "2024",
      rating: "★ 8.8",
      type: "movie",
      duration: "2h 46m",
      poster: "https://images.metahub.space/poster/medium/tt15239678/img",
      backdrop: "https://images.metahub.space/background/medium/tt15239678/img",
      description: "Paul Atreides se une a Chani e aos Fremen enquanto busca vingança contra os conspiradores que destruíram sua família.",
      source: "ColossalStream",
      imdbId: "tt15239678"
    },
    {
      id: "tt6263850",
      title: "Deadpool & Wolverine (2024)",
      year: "2024",
      rating: "★ 8.2",
      type: "movie",
      duration: "2h 08m",
      poster: "https://images.metahub.space/poster/medium/tt6263850/img",
      backdrop: "https://images.metahub.space/background/medium/tt6263850/img",
      description: "Wade Wilson tenta viver uma vida pacata até que a Autoridade de Variância Temporal o recruta para salvar o multiverso.",
      source: "ColossalStream",
      imdbId: "tt6263850"
    },
    {
      id: "tt8367814",
      title: "Magnatas do Crime (The Gentlemen)",
      year: "2019",
      rating: "★ 8.0",
      type: "movie",
      duration: "1h 53m",
      poster: "https://images.metahub.space/poster/medium/tt8367814/img",
      backdrop: "https://images.metahub.space/background/medium/tt8367814/img",
      description: "Um expatriado americano tenta vender seu lucrativo império de maconha em Londres, desencadeando complôs e subornos.",
      source: "ColossalStream",
      imdbId: "tt8367814"
    },
    {
      id: "tt18411490",
      title: "Alien: Romulus (2024)",
      year: "2024",
      rating: "★ 7.5",
      type: "movie",
      duration: "1h 59m",
      poster: "https://images.metahub.space/poster/medium/tt18411490/img",
      backdrop: "https://images.metahub.space/background/medium/tt18411490/img",
      description: "Jovens colonizadores exploram uma estação abandonada e se deparam com a criatura mais aterradora do universo.",
      source: "ColossalStream",
      imdbId: "tt18411490"
    }
  ],

  redecanais: [
    {
      id: "tt15435876",
      title: "Pinguim (The Penguin) - T1",
      year: "2024",
      rating: "★ 8.9",
      type: "series",
      duration: "8 Episódios",
      poster: "https://images.metahub.space/poster/medium/tt15435876/img",
      backdrop: "https://images.metahub.space/background/medium/tt15435876/img",
      description: "Após a morte de Carmine Falcone, Oz Cobb começa a traçar sua ascensão implacável para dominar o submundo de Gotham.",
      source: "ColossalStream",
      imdbId: "tt15435876",
      season: 1,
      episode: 1
    },
    {
      id: "tt2788316",
      title: "Xógum: A Gloriosa Saga do Japão",
      year: "2024",
      rating: "★ 8.9",
      type: "series",
      duration: "10 Episódios",
      poster: "https://images.metahub.space/poster/medium/tt2788316/img",
      backdrop: "https://images.metahub.space/background/medium/tt2788316/img",
      description: "No Japão de 1600, Lord Toranaga luta por sobrevivência enquanto um capitão inglês misterioso naufraga na costa.",
      source: "ColossalStream",
      imdbId: "tt2788316",
      season: 1,
      episode: 1
    },
    {
      id: "tt11126994",
      title: "Arcane - Temporada 2",
      year: "2024",
      rating: "★ 9.0",
      type: "series",
      duration: "9 Episódios",
      poster: "https://images.metahub.space/poster/medium/tt11126994/img",
      backdrop: "https://images.metahub.space/background/medium/tt11126994/img",
      description: "A tensão atinge proporções devastadoras entre a rica cidade de Piltover e os submundo de Zaun.",
      source: "ColossalStream",
      imdbId: "tt11126994",
      season: 2,
      episode: 1
    },
    {
      id: "tt1190634",
      title: "The Boys - Temporada 4",
      year: "2024",
      rating: "★ 8.7",
      type: "series",
      duration: "8 Episódios",
      poster: "https://images.metahub.space/poster/medium/tt1190634/img",
      backdrop: "https://images.metahub.space/background/medium/tt1190634/img",
      description: "Victoria Neuman está mais perto do Salão Oval sob o controle do Capitão Pátria, que consolida seu poder.",
      source: "ColossalStream",
      imdbId: "tt1190634",
      season: 4,
      episode: 1
    }
  ]
};

export const MOVIE_CATEGORIES = {
  trending: [
    { id: "tt9218128", imdbId: "tt9218128", title: "Gladiador II (2024)", year: "2024", rating: "★ 8.2", type: "movie", duration: "2h 28m", poster: "https://images.metahub.space/poster/medium/tt9218128/img", backdrop: "https://images.metahub.space/background/medium/tt9218128/img", genres: ["Ação", "Drama"] },
    { id: "tt15239678", imdbId: "tt15239678", title: "Duna: Parte 2 (2024)", year: "2024", rating: "★ 8.8", type: "movie", duration: "2h 46m", poster: "https://images.metahub.space/poster/medium/tt15239678/img", backdrop: "https://images.metahub.space/background/medium/tt15239678/img", genres: ["Ficção Científica", "Aventura"] },
    { id: "tt6263850", imdbId: "tt6263850", title: "Deadpool & Wolverine (2024)", year: "2024", rating: "★ 8.2", type: "movie", duration: "2h 08m", poster: "https://images.metahub.space/poster/medium/tt6263850/img", backdrop: "https://images.metahub.space/background/medium/tt6263850/img", genres: ["Ação", "Comédia"] },
    { id: "tt18411490", imdbId: "tt18411490", title: "Alien: Romulus (2024)", year: "2024", rating: "★ 7.5", type: "movie", duration: "1h 59m", poster: "https://images.metahub.space/poster/medium/tt18411490/img", backdrop: "https://images.metahub.space/background/medium/tt18411490/img", genres: ["Terror", "Ficção Científica"] },
    { id: "tt8367814", imdbId: "tt8367814", title: "Magnatas do Crime (2019)", year: "2019", rating: "★ 8.0", type: "movie", duration: "1h 53m", poster: "https://images.metahub.space/poster/medium/tt8367814/img", backdrop: "https://images.metahub.space/background/medium/tt8367814/img", genres: ["Crime", "Ação"] },
    { id: "tt15398776", imdbId: "tt15398776", title: "Oppenheimer (2023)", year: "2023", rating: "★ 8.9", type: "movie", duration: "3h 00m", poster: "https://images.metahub.space/poster/medium/tt15398776/img", backdrop: "https://images.metahub.space/background/medium/tt15398776/img", genres: ["Drama", "História"] },
    { id: "tt9362722", imdbId: "tt9362722", title: "Homem-Aranha: Através do Aranhaverso (2023)", year: "2023", rating: "★ 8.7", type: "movie", duration: "2h 20m", poster: "https://images.metahub.space/poster/medium/tt9362722/img", backdrop: "https://images.metahub.space/background/medium/tt9362722/img", genres: ["Animação", "Ação"] },
    { id: "tt1745960", imdbId: "tt1745960", title: "Top Gun: Maverick (2022)", year: "2022", rating: "★ 8.3", type: "movie", duration: "2h 10m", poster: "https://images.metahub.space/poster/medium/tt1745960/img", backdrop: "https://images.metahub.space/background/medium/tt1745960/img", genres: ["Ação", "Drama"] },
    { id: "tt10366206", imdbId: "tt10366206", title: "John Wick: Baba Yaga (2023)", year: "2023", rating: "★ 8.0", type: "movie", duration: "2h 49m", poster: "https://images.metahub.space/poster/medium/tt10366206/img", backdrop: "https://images.metahub.space/background/medium/tt10366206/img", genres: ["Ação", "Crime"] },
    { id: "tt22022452", imdbId: "tt22022452", title: "Divertida Mente 2 (2024)", year: "2024", rating: "★ 8.0", type: "movie", duration: "1h 36m", poster: "https://images.metahub.space/poster/medium/tt22022452/img", backdrop: "https://images.metahub.space/background/medium/tt22022452/img", genres: ["Animação", "Comédia"] },
    { id: "tt1877830", imdbId: "tt1877830", title: "The Batman (2022)", year: "2022", rating: "★ 7.8", type: "movie", duration: "2h 56m", poster: "https://images.metahub.space/poster/medium/tt1877830/img", backdrop: "https://images.metahub.space/background/medium/tt1877830/img", genres: ["Ação", "Crime"] , description: "Em seu segundo ano de combate ao crime, Batman investiga a corrupção secreta de Gotham City enquanto persegue o misterioso e sádico Charada." },
    { id: "tt14230458", imdbId: "tt14230458", title: "Pobres Criaturas (2023)", year: "2023", rating: "★ 7.9", type: "movie", duration: "2h 21m", poster: "https://images.metahub.space/poster/medium/tt14230458/img", backdrop: "https://images.metahub.space/background/medium/tt14230458/img", genres: ["Comédia", "Drama"] , description: "A fantástica história da evolução de Bella Baxter, uma jovem trazida de volta à vida por um brilhante e heterodoxo cientista." },
    { id: "tt1517268", imdbId: "tt1517268", title: "Barbie (2023)", year: "2023", rating: "★ 7.0", type: "movie", duration: "1h 54m", poster: "https://images.metahub.space/poster/medium/tt1517268/img", backdrop: "https://images.metahub.space/background/medium/tt1517268/img", genres: ["Comédia", "Aventura"] , description: "Barbie deixa o mundo perfeito da Barbielândia para viver uma jornada existencial de autodescoberta no imperfeito mundo real." },
    { id: "tt12037194", imdbId: "tt12037194", title: "Furiosa: Uma Saga Mad Max (2024)", year: "2024", rating: "★ 7.6", type: "movie", duration: "2h 28m", poster: "https://images.metahub.space/poster/medium/tt12037194/img", backdrop: "https://images.metahub.space/background/medium/tt12037194/img", genres: ["Ação", "Ficção Científica"] , description: "A história de origem da jovem guerreira Furiosa e sua sangrenta jornada de vingança e sobrevivência pelo deserto devastado." },
    { id: "tt11389872", imdbId: "tt11389872", title: "Planeta dos Macacos: O Reinado (2024)", year: "2024", rating: "★ 7.0", type: "movie", duration: "2h 25m", poster: "https://images.metahub.space/poster/medium/tt11389872/img", backdrop: "https://images.metahub.space/background/medium/tt11389872/img", genres: ["Ação", "Ficção Científica"] , description: "Gerações após o reinado de César, um jovem chimpanzé desafia um tirano símio em busca da verdade sobre o passado da humanidade." }
  ],
  action: [
    { id: "tt10366206", imdbId: "tt10366206", title: "John Wick: Baba Yaga (2023)", year: "2023", rating: "★ 8.0", type: "movie", duration: "2h 49m", poster: "https://images.metahub.space/poster/medium/tt10366206/img", backdrop: "https://images.metahub.space/background/medium/tt10366206/img", genres: ["Ação", "Crime"] },
    { id: "tt1745960", imdbId: "tt1745960", title: "Top Gun: Maverick (2022)", year: "2022", rating: "★ 8.3", type: "movie", duration: "2h 10m", poster: "https://images.metahub.space/poster/medium/tt1745960/img", backdrop: "https://images.metahub.space/background/medium/tt1745960/img", genres: ["Ação", "Drama"] },
    { id: "tt1392190", imdbId: "tt1392190", title: "Mad Max: Estrada da Fúria (2015)", year: "2015", rating: "★ 8.1", type: "movie", duration: "2h 00m", poster: "https://images.metahub.space/poster/medium/tt1392190/img", backdrop: "https://images.metahub.space/background/medium/tt1392190/img", genres: ["Ação", "Ficção Científica"] },
    { id: "tt0468569", imdbId: "tt0468569", title: "Batman: O Cavaleiro das Trevas (2008)", year: "2008", rating: "★ 9.0", type: "movie", duration: "2h 32m", poster: "https://images.metahub.space/poster/medium/tt0468569/img", backdrop: "https://images.metahub.space/background/medium/tt0468569/img", genres: ["Ação", "Crime"] , description: "Com a ajuda de Jim Gordon e Harvey Dent, Batman mantém a ordem até que o Coringa espalha o caos absoluto por Gotham." },
    { id: "tt4154796", imdbId: "tt4154796", title: "Vingadores: Ultimato (2019)", year: "2019", rating: "★ 8.4", type: "movie", duration: "3h 01m", poster: "https://images.metahub.space/poster/medium/tt4154796/img", backdrop: "https://images.metahub.space/background/medium/tt4154796/img", genres: ["Ação", "Ficção Científica"] },
    { id: "tt1877830", imdbId: "tt1877830", title: "The Batman (2022)", year: "2022", rating: "★ 7.8", type: "movie", duration: "2h 56m", poster: "https://images.metahub.space/poster/medium/tt1877830/img", backdrop: "https://images.metahub.space/background/medium/tt1877830/img", genres: ["Ação", "Crime"] },
    { id: "tt9603212", imdbId: "tt9603212", title: "Missão Impossível: Acerto de Contas (2023)", year: "2023", rating: "★ 7.7", type: "movie", duration: "2h 43m", poster: "https://images.metahub.space/poster/medium/tt9603212/img", backdrop: "https://images.metahub.space/background/medium/tt9603212/img", genres: ["Ação", "Aventura"] , description: "Ethan Hunt e sua equipe do FMI enfrentam uma misteriosa inteligência artificial com poder de controlar o destino do planeta." },
    { id: "tt12263384", imdbId: "tt12263384", title: "Resgate 2 (2023)", year: "2023", rating: "★ 7.0", type: "movie", duration: "2h 02m", poster: "https://images.metahub.space/poster/medium/tt12263384/img", backdrop: "https://images.metahub.space/background/medium/tt12263384/img", genres: ["Ação", "Thriller"] , description: "Depois de sobreviver milagrosamente, o mercenário Tyler Rake embarca em uma missão ainda mais mortal para resgatar a família de um criminoso impiedoso." },
    { id: "tt1630029", imdbId: "tt1630029", title: "Avatar: O Caminho da Água (2022)", year: "2022", rating: "★ 7.6", type: "movie", duration: "3h 12m", poster: "https://images.metahub.space/poster/medium/tt1630029/img", backdrop: "https://images.metahub.space/background/medium/tt1630029/img", genres: ["Ação", "Aventura"] , description: "Jake Sully e Neytiri exploram os deslumbrantes oceanos de Pandora enquanto protegem sua família de uma nova ameaça militar humana." },
    { id: "tt0172495", imdbId: "tt0172495", title: "Gladiador (2000)", year: "2000", rating: "★ 8.5", type: "movie", duration: "2h 35m", poster: "https://images.metahub.space/poster/medium/tt0172495/img", backdrop: "https://images.metahub.space/background/medium/tt0172495/img", genres: ["Ação", "Drama"] , description: "Um honrado general romano é traído por um imperador tirano e se torna o maior gladiador da arena em busca de justiça e vingança." },
    { id: "tt0381061", imdbId: "tt0381061", title: "007: Cassino Royale (2006)", year: "2006", rating: "★ 8.0", type: "movie", duration: "2h 24m", poster: "https://images.metahub.space/poster/medium/tt0381061/img", backdrop: "https://images.metahub.space/background/medium/tt0381061/img", genres: ["Ação", "Aventura"] , description: "Em sua primeira missão como agente 007, James Bond precisa derrotar um financista do terrorismo em uma tensa e letal partida de pôquer em Montenegro." },
    { id: "tt1375666", imdbId: "tt1375666", title: "A Origem (2010)", year: "2010", rating: "★ 8.8", type: "movie", duration: "2h 28m", poster: "https://images.metahub.space/poster/medium/tt1375666/img", backdrop: "https://images.metahub.space/background/medium/tt1375666/img", genres: ["Ação", "Ficção Científica"] },
    { id: "tt4154756", imdbId: "tt4154756", title: "Vingadores: Guerra Infinita (2018)", year: "2018", rating: "★ 8.4", type: "movie", duration: "2h 29m", poster: "https://images.metahub.space/poster/medium/tt4154756/img", backdrop: "https://images.metahub.space/background/medium/tt4154756/img", genres: ["Ação", "Aventura"] , description: "Os Vingadores e os Guardiões da Galáxia unem forças desesperadas para impedir o tirano intergaláctico Thanos de reunir as Joias do Infinito." },
    { id: "tt10872600", imdbId: "tt10872600", title: "Homem-Aranha: Sem Volta para Casa (2021)", year: "2021", rating: "★ 8.2", type: "movie", duration: "2h 28m", poster: "https://images.metahub.space/poster/medium/tt10872600/img", backdrop: "https://images.metahub.space/background/medium/tt10872600/img", genres: ["Ação", "Aventura"] , description: "Com sua identidade secreta revelada, Peter Parker busca a ajuda do Doutor Estranho, desencadeando a abertura do multiverso e vilões lendários." },
    { id: "tt0133093", imdbId: "tt0133093", title: "Matrix (1999)", year: "1999", rating: "★ 8.7", type: "movie", duration: "2h 16m", poster: "https://images.metahub.space/poster/medium/tt0133093/img", backdrop: "https://images.metahub.space/background/medium/tt0133093/img", genres: ["Ação", "Ficção Científica"] }
  ],
  family: [
    { id: "tt13622970", imdbId: "tt13622970", title: "Moana 2 (2024)", year: "2024", rating: "★ 7.8", type: "movie", duration: "1h 40m", poster: "https://images.metahub.space/poster/medium/tt13622970/img", backdrop: "https://images.metahub.space/background/medium/tt13622970/img", genres: ["Animação", "Aventura"] },
    { id: "tt22022452", imdbId: "tt22022452", title: "Divertida Mente 2 (2024)", year: "2024", rating: "★ 8.0", type: "movie", duration: "1h 36m", poster: "https://images.metahub.space/poster/medium/tt22022452/img", backdrop: "https://images.metahub.space/background/medium/tt22022452/img", genres: ["Animação", "Comédia"] },
    { id: "tt7510222", imdbId: "tt7510222", title: "Meu Malvado Favorito 4 (2024)", year: "2024", rating: "★ 7.2", type: "movie", duration: "1h 34m", poster: "https://images.metahub.space/poster/medium/tt7510222/img", backdrop: "https://images.metahub.space/background/medium/tt7510222/img", genres: ["Animação", "Comédia"] },
    { id: "tt9362722", imdbId: "tt9362722", title: "Homem-Aranha: Através do Aranhaverso (2023)", year: "2023", rating: "★ 8.7", type: "movie", duration: "2h 20m", poster: "https://images.metahub.space/poster/medium/tt9362722/img", backdrop: "https://images.metahub.space/background/medium/tt9362722/img", genres: ["Animação", "Ação"] },
    { id: "tt6105098", imdbId: "tt6105098", title: "O Rei Leão (2019)", year: "2019", rating: "★ 7.1", type: "movie", duration: "1h 58m", poster: "https://images.metahub.space/poster/medium/tt6105098/img", backdrop: "https://images.metahub.space/background/medium/tt6105098/img", genres: ["Animação", "Família"] },
    { id: "tt21692408", imdbId: "tt21692408", title: "Kung Fu Panda 4 (2024)", year: "2024", rating: "★ 6.7", type: "movie", duration: "1h 34m", poster: "https://images.metahub.space/poster/medium/tt21692408/img", backdrop: "https://images.metahub.space/background/medium/tt21692408/img", genres: ["Animação", "Aventura"] , description: "Convocado para se tornar o Líder Espiritual do Vale da Paz, Po precisa treinar um novo Dragão Guerreiro enquanto enfrenta a Camaleoa." },
    { id: "tt3915174", imdbId: "tt3915174", title: "Gato de Botas 2: O Último Pedido (2022)", year: "2022", rating: "★ 7.9", type: "movie", duration: "1h 42m", poster: "https://images.metahub.space/poster/medium/tt3915174/img", backdrop: "https://images.metahub.space/background/medium/tt3915174/img", genres: ["Animação", "Comédia"] , description: "Tendo gastado oito de suas nove vidas, o lendário Gato de Botas parte em busca da mística Estrela dos Desejos enquanto foge da própria Morte." },
    { id: "tt2380307", imdbId: "tt2380307", title: "Viva: A Vida é uma Festa (2017)", year: "2017", rating: "★ 8.4", type: "movie", duration: "1h 45m", poster: "https://images.metahub.space/poster/medium/tt2380307/img", backdrop: "https://images.metahub.space/background/medium/tt2380307/img", genres: ["Animação", "Família"] , description: "O jovem Miguel viaja à mágica e colorida Terra dos Mortos para desvendar um segredo de sua família e realizar seu sonho musical." },
    { id: "tt3521164", imdbId: "tt3521164", title: "Moana: Um Mar de Aventuras (2016)", year: "2016", rating: "★ 7.6", type: "movie", duration: "1h 47m", poster: "https://images.metahub.space/poster/medium/tt3521164/img", backdrop: "https://images.metahub.space/background/medium/tt3521164/img", genres: ["Animação", "Aventura"] , description: "A jovem navegadora Moana parte em uma jornada pelo Oceano Pacífico em busca do semideus Maui para salvar seu povo e restaurar o coração de Te Fiti." },
    { id: "tt1049413", imdbId: "tt1049413", title: "Up: Altas Aventuras (2009)", year: "2009", rating: "★ 8.3", type: "movie", duration: "1h 36m", poster: "https://images.metahub.space/poster/medium/tt1049413/img", backdrop: "https://images.metahub.space/background/medium/tt1049413/img", genres: ["Animação", "Aventura"] , description: "O idoso Carl Fredricksen amarra milhares de balões em sua casa para voar até a América do Sul, levando acidentalmente um jovem escoteiro tagarela." },
    { id: "tt1979376", imdbId: "tt1979376", title: "Toy Story 4 (2019)", year: "2019", rating: "★ 7.7", type: "movie", duration: "1h 40m", poster: "https://images.metahub.space/poster/medium/tt1979376/img", backdrop: "https://images.metahub.space/background/medium/tt1979376/img", genres: ["Animação", "Comédia"] , description: "Woody, Buzz e seus amigos embarcam em uma viagem repleta de aventuras com Garfinho, descobrindo o verdadeiro valor da lealdade e liberdade." },
    { id: "tt2948356", imdbId: "tt2948356", title: "Zootopia (2016)", year: "2016", rating: "★ 8.0", type: "movie", duration: "1h 48m", poster: "https://images.metahub.space/poster/medium/tt2948356/img", backdrop: "https://images.metahub.space/background/medium/tt2948356/img", genres: ["Animação", "Comédia"] , description: "A otimista coelha policial Judy Hopps e a esperta raposa Nick Wilde se unem para desvendar um mistério que ameaça a paz da metrópole animal." },
    { id: "tt4520988", imdbId: "tt4520988", title: "Frozen II (2019)", year: "2019", rating: "★ 6.8", type: "movie", duration: "1h 43m", poster: "https://images.metahub.space/poster/medium/tt4520988/img", backdrop: "https://images.metahub.space/background/medium/tt4520988/img", genres: ["Animação", "Aventura"] , description: "Elsa, Anna, Kristoff e Olaf partem para a misteriosa Floresta Encantada para desvendar a origem dos poderes mágicos de gelo de Elsa." },
    { id: "tt0266543", imdbId: "tt0266543", title: "Procurando Nemo (2003)", year: "2003", rating: "★ 8.2", type: "movie", duration: "1h 40m", poster: "https://images.metahub.space/poster/medium/tt0266543/img", backdrop: "https://images.metahub.space/background/medium/tt0266543/img", genres: ["Animação", "Aventura"] , description: "O preocupado peixe-palhaço Marlin cruza o vasto oceano ao lado da esquecida Dory em busca de seu filho capturado por mergulhadores." },
    { id: "tt0298148", imdbId: "tt0298148", title: "Shrek 2 (2004)", year: "2004", rating: "★ 7.3", type: "movie", duration: "1h 33m", poster: "https://images.metahub.space/poster/medium/tt0298148/img", backdrop: "https://images.metahub.space/background/medium/tt0298148/img", genres: ["Animação", "Comédia"] , description: "Shrek e Fiona viajam ao reino de Tão Tão Distante para conhecer os pais da princesa, enfrentando as armações da Fada Madrinha e do Príncipe Encantado." }
  ],
  scifi: [
    { id: "tt0816692", imdbId: "tt0816692", title: "Interestelar (2014)", year: "2014", rating: "★ 8.7", type: "movie", duration: "2h 49m", poster: "https://images.metahub.space/poster/medium/tt0816692/img", backdrop: "https://images.metahub.space/background/medium/tt0816692/img", genres: ["Ficção Científica", "Drama"] },
    { id: "tt1375666", imdbId: "tt1375666", title: "A Origem (2010)", year: "2010", rating: "★ 8.8", type: "movie", duration: "2h 28m", poster: "https://images.metahub.space/poster/medium/tt1375666/img", backdrop: "https://images.metahub.space/background/medium/tt1375666/img", genres: ["Ficção Científica", "Ação"] },
    { id: "tt1856101", imdbId: "tt1856101", title: "Blade Runner 2049 (2017)", year: "2017", rating: "★ 8.0", type: "movie", duration: "2h 44m", poster: "https://images.metahub.space/poster/medium/tt1856101/img", backdrop: "https://images.metahub.space/background/medium/tt1856101/img", genres: ["Ficção Científica", "Drama"] },
    { id: "tt0133093", imdbId: "tt0133093", title: "Matrix (1999)", year: "1999", rating: "★ 8.7", type: "movie", duration: "2h 16m", poster: "https://images.metahub.space/poster/medium/tt0133093/img", backdrop: "https://images.metahub.space/background/medium/tt0133093/img", genres: ["Ficção Científica", "Ação"] },
    { id: "tt15239678", imdbId: "tt15239678", title: "Duna: Parte 2 (2024)", year: "2024", rating: "★ 8.8", type: "movie", duration: "2h 46m", poster: "https://images.metahub.space/poster/medium/tt15239678/img", backdrop: "https://images.metahub.space/background/medium/tt15239678/img", genres: ["Ficção Científica", "Aventura"] },
    { id: "tt18411490", imdbId: "tt18411490", title: "Alien: Romulus (2024)", year: "2024", rating: "★ 7.5", type: "movie", duration: "1h 59m", poster: "https://images.metahub.space/poster/medium/tt18411490/img", backdrop: "https://images.metahub.space/background/medium/tt18411490/img", genres: ["Terror", "Ficção Científica"] },
    { id: "tt2543164", imdbId: "tt2543164", title: "A Chegada (2016)", year: "2016", rating: "★ 7.9", type: "movie", duration: "1h 56m", poster: "https://images.metahub.space/poster/medium/tt2543164/img", backdrop: "https://images.metahub.space/background/medium/tt2543164/img", genres: ["Ficção Científica", "Drama"] , description: "Uma brilhante linguista é convocada pelo exército para tentar se comunicar com seres extraterrestres após o pouso de doze naves na Terra." },
    { id: "tt1454468", imdbId: "tt1454468", title: "Gravidade (2013)", year: "2013", rating: "★ 7.7", type: "movie", duration: "1h 31m", poster: "https://images.metahub.space/poster/medium/tt1454468/img", backdrop: "https://images.metahub.space/background/medium/tt1454468/img", genres: ["Ficção Científica", "Thriller"] , description: "Dois astronautas lutam desesperadamente pela sobrevivência após destroços espaciais destruírem sua estação em órbita da Terra." },
    { id: "tt6723592", imdbId: "tt6723592", title: "Tenet (2020)", year: "2020", rating: "★ 7.3", type: "movie", duration: "2h 30m", poster: "https://images.metahub.space/poster/medium/tt6723592/img", backdrop: "https://images.metahub.space/background/medium/tt6723592/img", genres: ["Ficção Científica", "Ação"] , description: "Munido de uma única palavra, um agente secreto viaja pelo mundo da espionagem em uma missão que desafia as leis do tempo para evitar a Terceira Guerra Mundial." },
    { id: "tt1631867", imdbId: "tt1631867", title: "No Limite do Amanhã (2014)", year: "2014", rating: "★ 7.9", type: "movie", duration: "1h 53m", poster: "https://images.metahub.space/poster/medium/tt1631867/img", backdrop: "https://images.metahub.space/background/medium/tt1631867/img", genres: ["Ficção Científica", "Ação"] , description: "Um militar preso em um loop temporal revive o mesmo dia de uma batalha alienígena toda vez que morre, aprimorando suas táticas a cada renascimento." },
    { id: "tt0470752", imdbId: "tt0470752", title: "Ex Machina (2014)", year: "2014", rating: "★ 7.7", type: "movie", duration: "1h 48m", poster: "https://images.metahub.space/poster/medium/tt0470752/img", backdrop: "https://images.metahub.space/background/medium/tt0470752/img", genres: ["Ficção Científica", "Drama"] , description: "Um jovem programador é convidado para realizar o teste de Turing em Ava, uma inteligência artificial humanoide ultra-avançada e sedutora." },
    { id: "tt0107290", imdbId: "tt0107290", title: "Jurassic Park (1993)", year: "1993", rating: "★ 8.2", type: "movie", duration: "2h 07m", poster: "https://images.metahub.space/poster/medium/tt0107290/img", backdrop: "https://images.metahub.space/background/medium/tt0107290/img", genres: ["Ficção Científica", "Aventura"] , description: "Cientistas clonam dinossauros em um parque temático em uma ilha remota, mas uma falha de segurança liberta as criaturas mais letais da história." },
    { id: "tt0482571", imdbId: "tt0482571", title: "O Grande Truque (2006)", year: "2006", rating: "★ 8.5", type: "movie", duration: "2h 10m", poster: "https://images.metahub.space/poster/medium/tt0482571/img", backdrop: "https://images.metahub.space/background/medium/tt0482571/img", genres: ["Ficção Científica", "Drama"] , description: "Na Londres do século XIX, dois mágicos obcecados travam uma rivalidade destrutiva e mortal para criar o maior truque de teletransporte do mundo." },
    { id: "tt1130884", imdbId: "tt1130884", title: "Ilha do Medo (2010)", year: "2010", rating: "★ 8.2", type: "movie", duration: "2h 18m", poster: "https://images.metahub.space/poster/medium/tt1130884/img", backdrop: "https://images.metahub.space/background/medium/tt1130884/img", genres: ["Mistério", "Thriller"] , description: "Dois agentes federais investigam o misterioso desaparecimento de uma paciente em um hospital psiquiátrico de segurança máxima em uma ilha isolada." },
    { id: "tt0114369", imdbId: "tt0114369", title: "Se7en: Os Sete Crimes Capitais (1995)", year: "1995", rating: "★ 8.6", type: "movie", duration: "2h 07m", poster: "https://images.metahub.space/poster/medium/tt0114369/img", backdrop: "https://images.metahub.space/background/medium/tt0114369/img", genres: ["Crime", "Thriller"] , description: "Dois detetives de homicídios investigam os crimes chocantes e metodológicos de um assassino em série obcecado pelos sete pecados capitais." }
  ],
  toprated: [
    { id: "tt0068646", imdbId: "tt0068646", title: "O Poderoso Chefão (1972)", year: "1972", rating: "★ 9.2", type: "movie", duration: "2h 55m", poster: "https://images.metahub.space/poster/medium/tt0068646/img", backdrop: "https://images.metahub.space/background/medium/tt0068646/img", genres: ["Crime", "Drama"] , description: "O patriarca idoso de uma dinastia do crime organizado em Nova York transfere o controle de seu império clandestino para seu filho relutante." },
    { id: "tt0111161", imdbId: "tt0111161", title: "Um Sonho de Liberdade (1994)", year: "1994", rating: "★ 9.3", type: "movie", duration: "2h 22m", poster: "https://images.metahub.space/poster/medium/tt0111161/img", backdrop: "https://images.metahub.space/background/medium/tt0111161/img", genres: ["Drama"] , description: "Dois homens presos criam um forte laço de amizade ao longo dos anos, encontrando consolo e redenção através de atos de decência e esperança." },
    { id: "tt0110912", imdbId: "tt0110912", title: "Pulp Fiction (1994)", year: "1994", rating: "★ 8.9", type: "movie", duration: "2h 34m", poster: "https://images.metahub.space/poster/medium/tt0110912/img", backdrop: "https://images.metahub.space/background/medium/tt0110912/img", genres: ["Crime", "Drama"] , description: "As vidas de dois assassinos da máfia, um boxeador, a esposa de um gângster e dois assaltantes se entrelaçam em histórias eletrizantes." },
    { id: "tt0137523", imdbId: "tt0137523", title: "Clube da Luta (1999)", year: "1999", rating: "★ 8.8", type: "movie", duration: "2h 19m", poster: "https://images.metahub.space/poster/medium/tt0137523/img", backdrop: "https://images.metahub.space/background/medium/tt0137523/img", genres: ["Drama"] , description: "Um homem desiludido e um fabricante de sabonetes excêntrico criam um clube clandestino de lutas que rapidamente sai do controle." },
    { id: "tt0468569", imdbId: "tt0468569", title: "Batman: O Cavaleiro das Trevas (2008)", year: "2008", rating: "★ 9.0", type: "movie", duration: "2h 32m", poster: "https://images.metahub.space/poster/medium/tt0468569/img", backdrop: "https://images.metahub.space/background/medium/tt0468569/img", genres: ["Ação", "Crime"] },
    { id: "tt0109830", imdbId: "tt0109830", title: "Forrest Gump (1994)", year: "1994", rating: "★ 8.8", type: "movie", duration: "2h 22m", poster: "https://images.metahub.space/poster/medium/tt0109830/img", backdrop: "https://images.metahub.space/background/medium/tt0109830/img", genres: ["Drama", "Romance"] , description: "A história dos Estados Unidos se desenrola através do olhar puro e generoso de um homem do Alabama que inspira todos ao seu redor." },
    { id: "tt0099685", imdbId: "tt0099685", title: "Os Bons Companheiros (1990)", year: "1990", rating: "★ 8.7", type: "movie", duration: "2h 25m", poster: "https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg", backdrop: "https://image.tmdb.org/t/p/w780/sw7mordbZxgITU877yTpZCud90M.jpg", genres: ["Crime", "Drama"] , description: "A fascinante trajetória de Henry Hill e sua ascensão vertiginosa no submundo da máfia ítalo-americana em Nova York." },
    { id: "tt0120737", imdbId: "tt0120737", title: "O Senhor dos Anéis: A Sociedade do Anel (2001)", year: "2001", rating: "★ 8.9", type: "movie", duration: "2h 58m", poster: "https://images.metahub.space/poster/medium/tt0120737/img", backdrop: "https://images.metahub.space/background/medium/tt0120737/img", genres: ["Ação", "Aventura"] , description: "O jovem hobbit Frodo Bolseiro herda um anel mágico e parte em uma épica jornada para destruí-lo na Montanha da Perdição." },
    { id: "tt0167260", imdbId: "tt0167260", title: "O Senhor dos Anéis: O Retorno do Rei (2003)", year: "2003", rating: "★ 9.0", type: "movie", duration: "3h 21m", poster: "https://images.metahub.space/poster/medium/tt0167260/img", backdrop: "https://images.metahub.space/background/medium/tt0167260/img", genres: ["Ação", "Aventura"] , description: "A batalha decisiva pelo destino da Terra Média se aproxima enquanto Frodo e Sam chegam ao coração sombrio de Mordor com o Um Anel." },
    { id: "tt0108052", imdbId: "tt0108052", title: "A Lista de Schindler (1993)", year: "1993", rating: "★ 9.0", type: "movie", duration: "3h 15m", poster: "https://images.metahub.space/poster/medium/tt0108052/img", backdrop: "https://images.metahub.space/background/medium/tt0108052/img", genres: ["Biografia", "Drama"] , description: "O empresário alemão Oskar Schindler arrisca sua fortuna e vida para salvar mais de mil judeus dos campos de concentração nazistas." },
    { id: "tt0050083", imdbId: "tt0050083", title: "12 Homens e uma Sentença (1957)", year: "1957", rating: "★ 9.0", type: "movie", duration: "1h 36m", poster: "https://images.metahub.space/poster/medium/tt0050083/img", backdrop: "https://images.metahub.space/background/medium/tt0050083/img", genres: ["Crime", "Drama"] , description: "Doze jurados isolados debatem o destino de um jovem acusado de homicídio, enquanto um único jurado questiona as certezas de todos." },
    { id: "tt0102926", imdbId: "tt0102926", title: "O Silêncio dos Inocentes (1991)", year: "1991", rating: "★ 8.6", type: "movie", duration: "1h 58m", poster: "https://images.metahub.space/poster/medium/tt0102926/img", backdrop: "https://images.metahub.space/background/medium/tt0102926/img", genres: ["Crime", "Drama"] , description: "A jovem agente do FBI Clarice Starling busca a mente brilhante e perturbadora do Dr. Hannibal Lecter para capturar um psicopata." },
    { id: "tt0120815", imdbId: "tt0120815", title: "O Resgate do Soldado Ryan (1998)", year: "1998", rating: "★ 8.6", type: "movie", duration: "2h 49m", poster: "https://images.metahub.space/poster/medium/tt0120815/img", backdrop: "https://images.metahub.space/background/medium/tt0120815/img", genres: ["Drama", "Guerra"] , description: "Após o histórico desembarque na Normandia, o Capitão Miller lidera seus homens atrás das linhas inimigas para resgatar o soldado James Ryan." },
    { id: "tt0120689", imdbId: "tt0120689", title: "À Espera de um Milagre (1999)", year: "1999", rating: "★ 8.6", type: "movie", duration: "3h 09m", poster: "https://images.metahub.space/poster/medium/tt0120689/img", backdrop: "https://images.metahub.space/background/medium/tt0120689/img", genres: ["Crime", "Drama"] , description: "No corredor da morte de uma prisão, um guarda descobre que um gigante gentil condenado possui um dom divino milagroso e curador." },
    { id: "tt0172495", imdbId: "tt0172495", title: "Gladiador (2000)", year: "2000", rating: "★ 8.5", type: "movie", duration: "2h 35m", poster: "https://images.metahub.space/poster/medium/tt0172495/img", backdrop: "https://images.metahub.space/background/medium/tt0172495/img", genres: ["Ação", "Drama"] }
  ],
  comedy: [
    { id: "tt6263850", imdbId: "tt6263850", title: "Deadpool & Wolverine (2024)", year: "2024", rating: "★ 8.2", type: "movie", duration: "2h 08m", poster: "https://images.metahub.space/poster/medium/tt6263850/img", backdrop: "https://images.metahub.space/background/medium/tt6263850/img", genres: ["Comédia", "Ação", "Comedy"] },
    { id: "tt1517268", imdbId: "tt1517268", title: "Barbie (2023)", year: "2023", rating: "★ 7.0", type: "movie", duration: "1h 54m", poster: "https://images.metahub.space/poster/medium/tt1517268/img", backdrop: "https://images.metahub.space/background/medium/tt1517268/img", genres: ["Comédia", "Aventura", "Comedy"] },
    { id: "tt14230458", imdbId: "tt14230458", title: "Pobres Criaturas (2023)", year: "2023", rating: "★ 7.9", type: "movie", duration: "2h 21m", poster: "https://images.metahub.space/poster/medium/tt14230458/img", backdrop: "https://images.metahub.space/background/medium/tt14230458/img", genres: ["Comédia", "Drama", "Comedy"] },
    { id: "tt22022452", imdbId: "tt22022452", title: "Divertida Mente 2 (2024)", year: "2024", rating: "★ 8.0", type: "movie", duration: "1h 36m", poster: "https://images.metahub.space/poster/medium/tt22022452/img", backdrop: "https://images.metahub.space/background/medium/tt22022452/img", genres: ["Animação", "Comédia", "Comedy"] },
    { id: "tt2049403", imdbId: "tt2049403", title: "Os Fantasmas Ainda se Divertem: Beetlejuice (2024)", year: "2024", rating: "★ 7.1", type: "movie", duration: "1h 44m", poster: "https://images.metahub.space/poster/medium/tt2049403/img", backdrop: "https://images.metahub.space/background/medium/tt2049403/img", genres: ["Comédia", "Fantasia", "Comedy"] },
    { id: "tt7510222", imdbId: "tt7510222", title: "Meu Malvado Favorito 4 (2024)", year: "2024", rating: "★ 7.2", type: "movie", duration: "1h 34m", poster: "https://images.metahub.space/poster/medium/tt7510222/img", backdrop: "https://images.metahub.space/background/medium/tt7510222/img", genres: ["Animação", "Comédia", "Comedy"] },
    { id: "tt3915174", imdbId: "tt3915174", title: "Gato de Botas 2: O Último Pedido (2022)", year: "2022", rating: "★ 7.9", type: "movie", duration: "1h 42m", poster: "https://images.metahub.space/poster/medium/tt3915174/img", backdrop: "https://images.metahub.space/background/medium/tt3915174/img", genres: ["Animação", "Comédia", "Comedy"] },
    { id: "tt0298148", imdbId: "tt0298148", title: "Shrek 2 (2004)", year: "2004", rating: "★ 7.3", type: "movie", duration: "1h 33m", poster: "https://images.metahub.space/poster/medium/tt0298148/img", backdrop: "https://images.metahub.space/background/medium/tt0298148/img", genres: ["Animação", "Comédia", "Comedy"] },
    { id: "tt1119646", imdbId: "tt1119646", title: "Se Beber, Não Case! (2009)", year: "2009", rating: "★ 7.7", type: "movie", duration: "1h 40m", poster: "https://images.metahub.space/poster/medium/tt1119646/img", backdrop: "https://images.metahub.space/background/medium/tt1119646/img", genres: ["Comédia", "Comedy"] },
    { id: "tt0829482", imdbId: "tt0829482", title: "Superbad: É Hoje (2007)", year: "2007", rating: "★ 7.6", type: "movie", duration: "1h 53m", poster: "https://images.metahub.space/poster/medium/tt0829482/img", backdrop: "https://images.metahub.space/background/medium/tt0829482/img", genres: ["Comédia", "Comedy"] },
    { id: "tt0381707", imdbId: "tt0381707", title: "As Branquelas (2004)", year: "2004", rating: "★ 7.1", type: "movie", duration: "1h 49m", poster: "https://images.metahub.space/poster/medium/tt0381707/img", backdrop: "https://images.metahub.space/background/medium/tt0381707/img", genres: ["Comédia", "Crime", "Comedy"] },
    { id: "tt0271383", imdbId: "tt0271383", title: "O Auto da Compadecida (2000)", year: "2000", rating: "★ 8.7", type: "movie", duration: "1h 44m", poster: "https://images.metahub.space/poster/medium/tt0271383/img", backdrop: "https://images.metahub.space/background/medium/tt0271383/img", genres: ["Comédia", "Aventura", "Comedy"] }
  ],
  horror: [
    { id: "tt18411490", imdbId: "tt18411490", title: "Alien: Romulus (2024)", year: "2024", rating: "★ 7.5", type: "movie", duration: "1h 59m", poster: "https://images.metahub.space/poster/medium/tt18411490/img", backdrop: "https://images.metahub.space/background/medium/tt18411490/img", genres: ["Terror", "Ficção Científica", "Horror"] },
    { id: "tt13433802", imdbId: "tt13433802", title: "Um Lugar Silencioso: Dia Um (2024)", year: "2024", rating: "★ 7.0", type: "movie", duration: "1h 39m", poster: "https://images.metahub.space/poster/medium/tt13433802/img", backdrop: "https://images.metahub.space/background/medium/tt13433802/img", genres: ["Terror", "Ficção Científica", "Horror"] },
    { id: "tt23468450", imdbId: "tt23468450", title: "Longlegs: Vínculo Mortal (2024)", year: "2024", rating: "★ 7.2", type: "movie", duration: "1h 41m", poster: "https://images.metahub.space/poster/medium/tt23468450/img", backdrop: "https://images.metahub.space/background/medium/tt23468450/img", genres: ["Terror", "Mistério", "Horror"] },
    { id: "tt1457767", imdbId: "tt1457767", title: "Invocação do Mal (2013)", year: "2013", rating: "★ 7.5", type: "movie", duration: "1h 52m", poster: "https://images.metahub.space/poster/medium/tt1457767/img", backdrop: "https://images.metahub.space/background/medium/tt1457767/img", genres: ["Terror", "Mistério", "Horror"] },
    { id: "tt3065204", imdbId: "tt3065204", title: "Invocação do Mal 2 (2016)", year: "2016", rating: "★ 7.3", type: "movie", duration: "2h 14m", poster: "https://images.metahub.space/poster/medium/tt3065204/img", backdrop: "https://images.metahub.space/background/medium/tt3065204/img", genres: ["Terror", "Mistério", "Horror"] },
    { id: "tt5052448", imdbId: "tt5052448", title: "Corra! (Get Out) (2017)", year: "2017", rating: "★ 7.8", type: "movie", duration: "1h 44m", poster: "https://images.metahub.space/poster/medium/tt5052448/img", backdrop: "https://images.metahub.space/background/medium/tt5052448/img", genres: ["Terror", "Mistério", "Horror"] },
    { id: "tt7784604", imdbId: "tt7784604", title: "Hereditário (2018)", year: "2018", rating: "★ 7.3", type: "movie", duration: "2h 07m", poster: "https://images.metahub.space/poster/medium/tt7784604/img", backdrop: "https://images.metahub.space/background/medium/tt7784604/img", genres: ["Terror", "Drama", "Horror"] },
    { id: "tt0081505", imdbId: "tt0081505", title: "O Iluminado (1980)", year: "1980", rating: "★ 8.4", type: "movie", duration: "2h 26m", poster: "https://images.metahub.space/poster/medium/tt0081505/img", backdrop: "https://images.metahub.space/background/medium/tt0081505/img", genres: ["Terror", "Drama", "Horror"] },
    { id: "tt15474914", imdbId: "tt15474914", title: "Sorria (Smile) (2022)", year: "2022", rating: "★ 6.7", type: "movie", duration: "1h 55m", poster: "https://images.metahub.space/poster/medium/tt15474914/img", backdrop: "https://images.metahub.space/background/medium/tt15474914/img", genres: ["Terror", "Mistério", "Horror"] }
  ],
  adventure: [
    { id: "tt15239678", imdbId: "tt15239678", title: "Duna: Parte 2 (2024)", year: "2024", rating: "★ 8.8", type: "movie", duration: "2h 46m", poster: "https://images.metahub.space/poster/medium/tt15239678/img", backdrop: "https://images.metahub.space/background/medium/tt15239678/img", genres: ["Aventura", "Ficção Científica", "Adventure"] },
    { id: "tt12037194", imdbId: "tt12037194", title: "Furiosa: Uma Saga Mad Max (2024)", year: "2024", rating: "★ 7.6", type: "movie", duration: "2h 28m", poster: "https://images.metahub.space/poster/medium/tt12037194/img", backdrop: "https://images.metahub.space/background/medium/tt12037194/img", genres: ["Aventura", "Ação", "Adventure"] },
    { id: "tt0167260", imdbId: "tt0167260", title: "O Senhor dos Anéis: O Retorno do Rei (2003)", year: "2003", rating: "★ 9.0", type: "movie", duration: "3h 21m", poster: "https://images.metahub.space/poster/medium/tt0167260/img", backdrop: "https://images.metahub.space/background/medium/tt0167260/img", genres: ["Aventura", "Ação", "Adventure"] },
    { id: "tt0120737", imdbId: "tt0120737", title: "O Senhor dos Anéis: A Sociedade do Anel (2001)", year: "2001", rating: "★ 8.9", type: "movie", duration: "2h 58m", poster: "https://images.metahub.space/poster/medium/tt0120737/img", backdrop: "https://images.metahub.space/background/medium/tt0120737/img", genres: ["Aventura", "Ação", "Adventure"] },
    { id: "tt1630029", imdbId: "tt1630029", title: "Avatar: O Caminho da Água (2022)", year: "2022", rating: "★ 7.6", type: "movie", duration: "3h 12m", poster: "https://images.metahub.space/poster/medium/tt1630029/img", backdrop: "https://images.metahub.space/background/medium/tt1630029/img", genres: ["Aventura", "Ação", "Adventure"] },
    { id: "tt0107290", imdbId: "tt0107290", title: "Jurassic Park (1993)", year: "1993", rating: "★ 8.2", type: "movie", duration: "2h 07m", poster: "https://images.metahub.space/poster/medium/tt0107290/img", backdrop: "https://images.metahub.space/background/medium/tt0107290/img", genres: ["Aventura", "Ficção Científica", "Adventure"] },
    { id: "tt13622970", imdbId: "tt13622970", title: "Moana 2 (2024)", year: "2024", rating: "★ 7.8", type: "movie", duration: "1h 40m", poster: "https://images.metahub.space/poster/medium/tt13622970/img", backdrop: "https://images.metahub.space/background/medium/tt13622970/img", genres: ["Aventura", "Animação", "Adventure"] }
  ],
  netflix: [
    { id: "tt7991608", imdbId: "tt7991608", title: "Red Notice (2021)", title_en: "Red Notice (2021)", title_pt: "Alerta Vermelho (2021)", year: "2021", rating: "★ 7.3", type: "movie", duration: "1h 58m", poster: "https://images.metahub.space/poster/medium/tt7991608/img", backdrop: "https://images.metahub.space/background/medium/tt7991608/img", genres: ["Ação", "Comédia"], platform: "netflix", description: "Um agente do FBI se une relutantemente ao segundo ladrão de arte mais procurado do mundo para capturar a criminosa mais esquiva de todas.", description_en: "An FBI profiler pursuing the world's most wanted art thief becomes his reluctant partner in crime to catch an elusive crook who's always one step ahead.", description_pt: "Um agente do FBI se une relutantemente ao segundo ladrão de arte mais procurado do mundo para capturar a criminosa mais esquiva de todas." },
    { id: "tt8936646", imdbId: "tt8936646", title: "Extraction (2020)", title_en: "Extraction (2020)", title_pt: "Resgate (2020)", year: "2020", rating: "★ 7.8", type: "movie", duration: "1h 56m", poster: "https://images.metahub.space/poster/medium/tt8936646/img", backdrop: "https://images.metahub.space/background/medium/tt8936646/img", genres: ["Ação", "Thriller"], platform: "netflix", description: "Um mercenário destemido e desiludido aceita a missão impossível de resgatar o filho sequestrado de um poderoso chefão do crime internacional.", description_en: "A black-market mercenary who has nothing to lose is hired to rescue the kidnapped son of an imprisoned international crime lord in Bangladesh.", description_pt: "Um mercenário destemido e desiludido aceita a missão impossível de resgatar o filho sequestrado de um poderoso chefão do crime internacional." },
    { id: "tt12263384", imdbId: "tt12263384", title: "Extraction 2 (2023)", title_en: "Extraction 2 (2023)", title_pt: "Resgate 2 (2023)", year: "2023", rating: "★ 7.7", type: "movie", duration: "2h 02m", poster: "https://images.metahub.space/poster/medium/tt12263384/img", backdrop: "https://images.metahub.space/background/medium/tt12263384/img", genres: ["Ação", "Thriller"], platform: "netflix", description: "Depois de sobreviver milagrosamente, o mercenário Tyler Rake embarca em uma missão ainda mais mortal para resgatar a família de um criminoso impiedoso.", description_en: "Back from the brink of death, highly skilled commando Tyler Rake takes on another dangerous mission to save the imprisoned family of a ruthless gangster.", description_pt: "Depois de sobreviver milagrosamente, o mercenário Tyler Rake embarca em uma missão ainda mais mortal para resgatar a família de um criminoso impiedoso." },
    { id: "tt12747748", imdbId: "tt12747748", title: "Leave the World Behind (2023)", title_en: "Leave the World Behind (2023)", title_pt: "O Mundo Depois de Nós (2023)", year: "2023", rating: "★ 7.4", type: "movie", duration: "2h 21m", poster: "https://images.metahub.space/poster/medium/tt12747748/img", backdrop: "https://images.metahub.space/background/medium/tt12747748/img", genres: ["Drama", "Mistério"], platform: "netflix", description: "As férias tranquilas de uma família em Long Island são abruptamente interrompidas por dois estranhos que trazem notícias aterrorizantes de um ciberataque global.", description_en: "A family's quiet getaway is interrupted by two strangers bearing news of a mysterious cyberattack, forcing both families to cope with an impending collapse.", description_pt: "As férias tranquilas de uma família em Long Island são abruptamente interrompidas por dois estranhos que trazem notícias aterrorizantes de um ciberataque global." },
    { id: "tt16277242", imdbId: "tt16277242", title: "Society of the Snow (2023)", title_en: "Society of the Snow (2023)", title_pt: "A Sociedade da Neve (2023)", year: "2023", rating: "★ 8.3", type: "movie", duration: "2h 24m", poster: "https://images.metahub.space/poster/medium/tt16277242/img", backdrop: "https://images.metahub.space/background/medium/tt16277242/img", genres: ["Aventura", "Biografia"], platform: "netflix", description: "A épica e comovente história real dos sobreviventes da queda de um avião na Cordilheira dos Andes em 1972 e sua heróica luta pela vida.", description_en: "The incredible real-life story of the Uruguayan rugby team stranded in the heart of the Andes mountains after their plane crashes in 1972.", description_pt: "A épica e comovente história real dos sobreviventes da queda de um avião na Cordilheira dos Andes em 1972 e sua heróica luta pela vida." },
    { id: "tt1302006", imdbId: "tt1302006", title: "The Irishman (2019)", title_en: "The Irishman (2019)", title_pt: "O Irlandês (2019)", year: "2019", rating: "★ 8.2", type: "movie", duration: "3h 29m", poster: "https://images.metahub.space/poster/medium/tt1302006/img", backdrop: "https://images.metahub.space/background/medium/tt1302006/img", genres: ["Crime", "Drama"], platform: "netflix", description: "Frank Sheeran, um veterano de guerra e assassino profissional da máfia, relembra seu envolvimento no lendário desaparecimento de Jimmy Hoffa.", description_en: "Hitman Frank Sheeran looks back at the secrets he kept as a loyal member of the Bufalino crime family and his involvement in the disappearance of Jimmy Hoffa.", description_pt: "Frank Sheeran, um veterano de guerra e assassino profissional da máfia, relembra seu envolvimento no lendário desaparecimento de Jimmy Hoffa." },
    { id: "tt11564570", imdbId: "tt11564570", title: "Glass Onion: A Knives Out Mystery (2022)", title_en: "Glass Onion: A Knives Out Mystery (2022)", title_pt: "Glass Onion: Um Mistério Knives Out (2022)", year: "2022", rating: "★ 7.6", type: "movie", duration: "2h 19m", poster: "https://images.metahub.space/poster/medium/tt11564570/img", backdrop: "https://images.metahub.space/background/medium/tt11564570/img", genres: ["Comédia", "Crime"], platform: "netflix", description: "O mestre detetive Benoit Blanc viaja até uma ilha privada na Grécia para desvendar um intricado jogo de assassinato entre amigos bilionários.", description_en: "Master detective Benoit Blanc travels to a private Greek island to unravel a layered mystery involving an eccentric tech billionaire and his eclectic group of friends.", description_pt: "O mestre detetive Benoit Blanc viaja até uma ilha privada na Grécia para desvendar um intricado jogo de assassinato entre amigos bilionários." },
    { id: "tt11286314", imdbId: "tt11286314", title: "Don't Look Up (2021)", title_en: "Don't Look Up (2021)", title_pt: "Não Olhe Para Cima (2021)", year: "2021", rating: "★ 7.5", type: "movie", duration: "2h 18m", poster: "https://images.metahub.space/poster/medium/tt11286314/img", backdrop: "https://images.metahub.space/background/medium/tt11286314/img", genres: ["Comédia", "Ficção Científica"], platform: "netflix", description: "Dois astrônomos medíocres fazem uma turnê desesperada pela mídia global para alertar a humanidade sobre a aproximação de um cometa mortal que destruirá a Terra.", description_en: "Two low-level astronomers must go on a giant media tour to warn mankind of an approaching comet that will destroy planet Earth.", description_pt: "Dois astrônomos medíocres fazem uma turnê desesperada pela mídia global para alertar a humanidade sobre a aproximação de um cometa mortal que destruirá a Terra." },
    { id: "tt11756556", imdbId: "tt11756556", title: "Rebel Ridge (2024)", title_en: "Rebel Ridge (2024)", title_pt: "Rebel Ridge (2024)", year: "2024", rating: "★ 7.5", type: "movie", duration: "2h 11m", poster: "https://image.tmdb.org/t/p/w500/xEt2GSz9z5rSVpIHMiGdtf0czyf.jpg", backdrop: "https://image.tmdb.org/t/p/original/cyKH7pDFlxIXluqRyNoHHEpxSDX.jpg", genres: ["Ação", "Crime", "Drama", "Suspense"], platform: "netflix", description: "Um ex-fuzileiro naval enfrenta a corrupção violenta e sistêmica em uma pequena cidade após a polícia confiscar injustamente a fiança de seu primo.", description_en: "A former Marine confronts corruption in a small town when local law enforcement unjustly seizes the bag of cash he needs to post his cousin's bail.", description_pt: "Um ex-fuzileiro naval enfrenta a corrupção violenta e sistêmica em uma pequena cidade após a polícia confiscar injustamente a fiança de seu primo." },
    { id: "tt2463208", imdbId: "tt2463208", title: "The Adam Project (2022)", title_en: "The Adam Project (2022)", title_pt: "O Projeto Adam (2022)", year: "2022", rating: "★ 7.3", type: "movie", duration: "1h 46m", poster: "https://images.metahub.space/poster/medium/tt2463208/img", backdrop: "https://images.metahub.space/background/medium/tt2463208/img", genres: ["Ação", "Ficção Científica"], platform: "netflix", description: "Um piloto de caça viajante no tempo faz um pouso forçado em 2022 e se junta à sua própria versão de 12 anos em uma missão para salvar o futuro.", description_en: "Time-traveling fighter pilot Adam Reed teams up with his 12-year-old self and his late father to come to terms with his past while saving the future.", description_pt: "Um piloto de caça viajante no tempo faz um pouso forçado em 2022 e se junta à sua própria versão de 12 anos em uma missão para salvar o futuro." },
    { id: "tt1649418", imdbId: "tt1649418", title: "The Gray Man (2022)", title_en: "The Gray Man (2022)", title_pt: "Agente Oculto (2022)", year: "2022", rating: "★ 7.2", type: "movie", duration: "2h 02m", poster: "https://images.metahub.space/poster/medium/tt1649418/img", backdrop: "https://images.metahub.space/background/medium/tt1649418/img", genres: ["Ação", "Thriller"], platform: "netflix", description: "Quando o agente mais habilidoso da CIA descobre segredos obscuros da agência, um ex-colega psicopata coloca sua cabeça a prêmio em uma caçada global.", description_en: "When the CIA's top skilled operative accidentally uncovers dark agency secrets, he becomes the target of a global manhunt by a sociopathic rogue mercenary.", description_pt: "Quando o agente mais habilidoso da CIA descobre segredos obscuros da agência, um ex-colega psicopata coloca sua cabeça a prêmio em uma caçada global." },
    { id: "tt2734604", imdbId: "tt2734604", title: "Bird Box (2018)", title_en: "Bird Box (2018)", title_pt: "Bird Box (2018)", year: "2018", rating: "★ 7.4", type: "movie", duration: "2h 04m", poster: "https://images.metahub.space/poster/medium/tt2734604/img", backdrop: "https://images.metahub.space/background/medium/tt2734604/img", genres: ["Terror", "Ficção Científica"], platform: "netflix", description: "Cinco anos após uma presença invisível e misteriosa levar a população ao suicídio, uma mãe e seus dois filhos tentam desesperadamente navegar vendados até um refúgio seguro.", description_en: "Five years after an ominous unseen presence drives most of society to suicide, a mother and her two children make a desperate bid to reach safety while blindfolded.", description_pt: "Cinco anos após uma presença invisível e misteriosa levar a população ao suicídio, uma mãe e seus dois filhos tentam desesperadamente navegar vendados até um refúgio seguro." },
    { id: "tt13452446", imdbId: "tt13452446", title: "Damsel (2024)", title_en: "Damsel (2024)", title_pt: "Donzela (2024)", year: "2024", rating: "★ 7.1", type: "movie", duration: "1h 50m", poster: "https://images.metahub.space/poster/medium/tt13452446/img", backdrop: "https://images.metahub.space/background/medium/tt13452446/img", genres: ["Ação", "Fantasia"], platform: "netflix", description: "O casamento de conto de fadas de uma donzela vira uma batalha mortal pela sobrevivência quando ela descobre que a família real a ofereceu em sacrifício a um dragão cuspente de fogo.", description_en: "A dutiful damsel agrees to marry a handsome prince, only to discover it was a trap: the royal family recruits her as a sacrifice to repay an ancient debt to a dragon.", description_pt: "O casamento de conto de fadas de uma donzela vira uma batalha mortal pela sobrevivência quando ela descobre que a família real a ofereceu em sacrifício a um dragão cuspente de fogo." },
    { id: "tt3083016", imdbId: "tt3083016", title: "Beverly Hills Cop: Axel F (2024)", title_en: "Beverly Hills Cop: Axel F (2024)", title_pt: "Um Tira da Pesada 4: Axel Foley (2024)", year: "2024", rating: "★ 7.0", type: "movie", duration: "1h 58m", poster: "https://images.metahub.space/poster/medium/tt3083016/img", backdrop: "https://images.metahub.space/background/medium/tt3083016/img", genres: ["Ação", "Comédia"], platform: "netflix", description: "O lendário detetive de Detroit Axel Foley está de volta a Beverly Hills para proteger sua filha e desmascarar uma perigosa conspiração criminosa.", description_en: "Detective Axel Foley is back in Beverly Hills after his daughter's life is threatened, teaming up with a new partner and old pals to uncover a conspiracy.", description_pt: "O lendário detetive de Detroit Axel Foley está de volta a Beverly Hills para proteger sua filha e desmascarar uma perigosa conspiração criminosa." },
    { id: "tt14998742", imdbId: "tt14998742", title: "Rebel Moon - Part One: A Child of Fire (2023)", title_en: "Rebel Moon - Part One: A Child of Fire (2023)", title_pt: "Rebel Moon - Parte 1: A Menina do Fogo (2023)", year: "2023", rating: "★ 6.8", type: "movie", duration: "2h 15m", poster: "https://images.metahub.space/poster/medium/tt14998742/img", backdrop: "https://images.metahub.space/background/medium/tt14998742/img", genres: ["Ação", "Ficção Científica"], platform: "netflix", description: "Quando uma colônia pacífica nos confins da galáxia se vê ameaçada pelos exércitos do tirano Mundo-Mãe, uma jovem misteriosa reúne rebeldes destemidos para lutar.", description_en: "When a peaceful colony on the edge of the galaxy finds itself threatened by the armies of the tyrannical Regent Balisarius, a mysterious stranger becomes its best hope.", description_pt: "Quando uma colônia pacífica nos confins da galáxia se vê ameaçada pelos exércitos do tirano Mundo-Mãe, uma jovem misteriosa reúne rebeldes destemidos para lutar." },
    { id: "tt1136617", imdbId: "tt1136617", title: "The Killer (2023)", title_en: "The Killer (2023)", title_pt: "O Assassino (2023)", year: "2023", rating: "★ 7.2", type: "movie", duration: "1h 58m", poster: "https://images.metahub.space/poster/medium/tt1136617/img", backdrop: "https://images.metahub.space/background/medium/tt1136617/img", genres: ["Ação", "Crime"], platform: "netflix", description: "Após um erro quase fatal em Paris, um assassino metódico e calculista trava uma caçada implacável contra seus próprios empregadores em uma vingança pessoal internacional.", description_en: "After a fateful near-miss, an assassin battles his employers and himself on an international manhunt he insists isn't personal.", description_pt: "Após um erro quase fatal em Paris, um assassino metódico e calculista trava uma caçada implacável contra seus próprios empregadores em uma vingança pessoal internacional." },
    { id: "tt7846844", imdbId: "tt7846844", title: "Enola Holmes (2020)", title_en: "Enola Holmes (2020)", title_pt: "Enola Holmes (2020)", year: "2020", rating: "★ 7.3", type: "movie", duration: "2h 03m", poster: "https://images.metahub.space/poster/medium/tt7846844/img", backdrop: "https://images.metahub.space/background/medium/tt7846844/img", genres: ["Aventura", "Mistério"], platform: "netflix", description: "Ao descobrir que sua mãe desapareceu misteriosamente, a destemida e perspicaz adolescente Enola supera seu famoso irmão Sherlock para desvendar uma conspiração política.", description_en: "While searching for her missing mother, intrepid teen Enola Holmes uses her sleuthing skills to outsmart big brother Sherlock and help a runaway lord.", description_pt: "Ao descobrir que sua mãe desapareceu misteriosamente, a destemida e perspicaz adolescente Enola supera seu famoso irmão Sherlock para desvendar uma conspiração política." },
    { id: "tt1618434", imdbId: "tt1618434", title: "Murder Mystery (2019)", title_en: "Murder Mystery (2019)", title_pt: "Mistério no Mediterrâneo (2019)", year: "2019", rating: "★ 7.0", type: "movie", duration: "1h 37m", poster: "https://images.metahub.space/poster/medium/tt1618434/img", backdrop: "https://images.metahub.space/background/medium/tt1618434/img", genres: ["Comédia", "Mistério"], platform: "netflix", description: "Um policial de Nova York e sua esposa cabeleireira viajam em lua de mel pela Europa e acabam se tornando os principais suspeitos do assassinato de um bilionário em seu iate.", description_en: "A New York cop and his hairdresser wife go on a European vacation to reinvigorate the spark in their marriage, but end up framed for the death of an elderly billionaire.", description_pt: "Um policial de Nova York e sua esposa cabeleireira viajam em lua de mel pela Europa e acabam se tornando os principais suspeitos do assassinato de um bilionário em seu iate." },
    { id: "tt0993840", imdbId: "tt0993840", title: "Army of the Dead (2021)", title_en: "Army of the Dead (2021)", title_pt: "Army of the Dead: Invasão em Las Vegas (2021)", year: "2021", rating: "★ 6.8", type: "movie", duration: "2h 28m", poster: "https://images.metahub.space/poster/medium/tt0993840/img", backdrop: "https://images.metahub.space/background/medium/tt0993840/img", genres: ["Ação", "Terror"], platform: "netflix", description: "Após um surto zumbi que isola Las Vegas do restante do mundo, um grupo de mercenários arrisca a maior aposta de suas vidas ao invadir a zona de quarentena para realizar o maior assalto da história.", description_en: "Following a zombie outbreak in Las Vegas, a group of mercenaries take the ultimate gamble, venturing into the quarantine zone to pull off the greatest heist ever attempted.", description_pt: "Após um surto zumbi que isola Las Vegas do restante do mundo, um grupo de mercenários arrisca a maior aposta de suas vidas ao invadir a zona de quarentena para realizar o maior assalto da história." },
    { id: "tt14856980", imdbId: "tt14856980", title: "Atlas (2024)", title_en: "Atlas (2024)", title_pt: "Atlas (2024)", year: "2024", rating: "★ 6.7", type: "movie", duration: "1h 58m", poster: "https://images.metahub.space/poster/medium/tt14856980/img", backdrop: "https://images.metahub.space/background/medium/tt14856980/img", genres: ["Ação", "Ficção Científica"], platform: "netflix", description: "Uma brilhante analista de dados com profunda desconfiança da inteligência artificial descobre que sua única esperança de salvar a humanidade de um robô renegado pode ser confiar nela.", description_en: "A brilliant counterterrorism data analyst with a deep distrust of AI discovers that her only hope of saving humanity from a renegade robot is to trust it.", description_pt: "Uma brilhante analista de dados com profunda desconfiança da inteligência artificial descobre que sua única esperança de salvar a humanidade de um robô renegado pode ser confiar nela." }
  ]
};

// 15 Series per category with exact totalSeasons & seasonEpisodes
export const SERIES_CATEGORIES = {
  trending: [
    { id: "tt15435876", imdbId: "tt15435876", title: "Pinguim (The Penguin) - T1", year: "2024", rating: "★ 8.9", type: "series", duration: "8 Episódios", poster: "https://images.metahub.space/poster/medium/tt15435876/img", backdrop: "https://images.metahub.space/background/medium/tt15435876/img", genres: ["Crime", "Drama"], season: 1, episode: 1, episodesCount: 8, totalSeasons: 1, seasonEpisodes: { 1: 8 } },
    { id: "tt2788316", imdbId: "tt2788316", title: "Xógum: A Gloriosa Saga do Japão", year: "2024", rating: "★ 8.9", type: "series", duration: "10 Episódios", poster: "https://images.metahub.space/poster/medium/tt2788316/img", backdrop: "https://images.metahub.space/background/medium/tt2788316/img", genres: ["Drama", "História"], season: 1, episode: 1, episodesCount: 10, totalSeasons: 1, seasonEpisodes: { 1: 10 } },
    { id: "tt11126994", imdbId: "tt11126994", title: "Arcane - Temporada 2", year: "2024", rating: "★ 9.0", type: "series", duration: "9 Episódios", poster: "https://images.metahub.space/poster/medium/tt11126994/img", backdrop: "https://images.metahub.space/background/medium/tt11126994/img", genres: ["Animação", "Ação"], season: 2, episode: 1, episodesCount: 9, totalSeasons: 2, seasonEpisodes: { 1: 9, 2: 9 } },
    { id: "tt1190634", imdbId: "tt1190634", title: "The Boys - Temporada 4", year: "2024", rating: "★ 8.7", type: "series", duration: "8 Episódios", poster: "https://images.metahub.space/poster/medium/tt1190634/img", backdrop: "https://images.metahub.space/background/medium/tt1190634/img", genres: ["Ação", "Comédia"], season: 4, episode: 1, episodesCount: 8, totalSeasons: 4, seasonEpisodes: { 1: 8, 2: 8, 3: 8, 4: 8 } },
    { id: "tt11198330", imdbId: "tt11198330", title: "A Casa do Dragão - T2", year: "2024", rating: "★ 8.4", type: "series", duration: "8 Episódios", poster: "https://images.metahub.space/poster/medium/tt11198330/img", backdrop: "https://images.metahub.space/background/medium/tt11198330/img", genres: ["Drama", "Fantasia"], season: 2, episode: 1, episodesCount: 8, totalSeasons: 2, seasonEpisodes: { 1: 10, 2: 8 } },
    { id: "tt12637874", imdbId: "tt12637874", title: "Fallout", year: "2024", rating: "★ 8.4", type: "series", duration: "8 Episódios", poster: "https://images.metahub.space/poster/medium/tt12637874/img", backdrop: "https://images.metahub.space/background/medium/tt12637874/img", genres: ["Ficção Científica", "Ação"], season: 1, episode: 1, episodesCount: 8, totalSeasons: 1, seasonEpisodes: { 1: 8 } },
    { id: "tt3581920", imdbId: "tt3581920", title: "The Last of Us", year: "2023", rating: "★ 8.8", type: "series", duration: "9 Episódios", poster: "https://images.metahub.space/poster/medium/tt3581920/img", backdrop: "https://images.metahub.space/background/medium/tt3581920/img", genres: ["Drama", "Ficção Científica"], season: 1, episode: 1, episodesCount: 9, totalSeasons: 1, seasonEpisodes: { 1: 9 } },
    { id: "tt4574334", imdbId: "tt4574334", title: "Stranger Things", year: "2016", rating: "★ 8.7", type: "series", duration: "4 Temporadas", poster: "https://images.metahub.space/poster/medium/tt4574334/img", backdrop: "https://images.metahub.space/background/medium/tt4574334/img", genres: ["Ficção Científica", "Drama"], season: 1, episode: 1, episodesCount: 8, totalSeasons: 4, seasonEpisodes: { 1: 8, 2: 9, 3: 8, 4: 9 } },
    { id: "tt9288030", imdbId: "tt9288030", title: "Reacher", year: "2022", rating: "★ 8.1", type: "series", duration: "2 Temporadas", poster: "https://images.metahub.space/poster/medium/tt9288030/img", backdrop: "https://images.metahub.space/background/medium/tt9288030/img", genres: ["Ação", "Crime"], season: 1, episode: 1, episodesCount: 8, totalSeasons: 2, seasonEpisodes: { 1: 8, 2: 8 } },
    { id: "tt14452776", imdbId: "tt14452776", title: "O Urso (The Bear)", year: "2022", rating: "★ 8.6", type: "series", duration: "3 Temporadas", poster: "https://images.metahub.space/poster/medium/tt14452776/img", backdrop: "https://images.metahub.space/background/medium/tt14452776/img", genres: ["Drama", "Comédia"], season: 1, episode: 1, episodesCount: 8, totalSeasons: 3, seasonEpisodes: { 1: 8, 2: 10, 3: 10 } },
    { id: "tt7660850", imdbId: "tt7660850", title: "Succession", year: "2018", rating: "★ 8.9", type: "series", duration: "4 Temporadas", poster: "https://images.metahub.space/poster/medium/tt7660850/img", backdrop: "https://images.metahub.space/background/medium/tt7660850/img", genres: ["Drama"], season: 1, episode: 1, episodesCount: 10, totalSeasons: 4, seasonEpisodes: { 1: 10, 2: 10, 3: 9, 4: 10 } },
    { id: "tt9140554", imdbId: "tt9140554", title: "Loki", year: "2021", rating: "★ 8.2", type: "series", duration: "2 Temporadas", poster: "https://images.metahub.space/poster/medium/tt9140554/img", backdrop: "https://images.metahub.space/background/medium/tt9140554/img", genres: ["Ação", "Ficção Científica"], season: 1, episode: 1, episodesCount: 6, totalSeasons: 2, seasonEpisodes: { 1: 6, 2: 6 } },
    { id: "tt11280740", imdbId: "tt11280740", title: "Ruptura (Severance)", year: "2022", rating: "★ 8.7", type: "series", duration: "1 Temporada", poster: "https://images.metahub.space/poster/medium/tt11280740/img", backdrop: "https://images.metahub.space/background/medium/tt11280740/img", genres: ["Drama", "Ficção Científica"], season: 1, episode: 1, episodesCount: 9, totalSeasons: 1, seasonEpisodes: { 1: 9 } },
    { id: "tt14688458", imdbId: "tt14688458", title: "Silo", year: "2023", rating: "★ 8.1", type: "series", duration: "2 Temporadas", poster: "https://images.metahub.space/poster/medium/tt14688458/img", backdrop: "https://images.metahub.space/background/medium/tt14688458/img", genres: ["Drama", "Ficção Científica"], season: 1, episode: 1, episodesCount: 10, totalSeasons: 2, seasonEpisodes: { 1: 10, 2: 10 } },
    { id: "tt11041332", imdbId: "tt11041332", title: "Yellowjackets", year: "2021", rating: "★ 7.8", type: "series", duration: "2 Temporadas", poster: "https://images.metahub.space/poster/medium/tt11041332/img", backdrop: "https://images.metahub.space/background/medium/tt11041332/img", genres: ["Drama", "Mistério"], season: 1, episode: 1, episodesCount: 10, totalSeasons: 2, seasonEpisodes: { 1: 10, 2: 9 } }
  ],
  crime: [
    { id: "tt0903747", imdbId: "tt0903747", title: "Breaking Bad", year: "2008", rating: "★ 9.5", type: "series", duration: "5 Temporadas", poster: "https://images.metahub.space/poster/medium/tt0903747/img", backdrop: "https://images.metahub.space/background/medium/tt0903747/img", genres: ["Crime", "Drama"], season: 1, episode: 1, episodesCount: 7, totalSeasons: 5, seasonEpisodes: { 1: 7, 2: 13, 3: 13, 4: 13, 5: 16 } },
    { id: "tt3032476", imdbId: "tt3032476", title: "Better Call Saul", year: "2015", rating: "★ 9.0", type: "series", duration: "6 Temporadas", poster: "https://images.metahub.space/poster/medium/tt3032476/img", backdrop: "https://images.metahub.space/background/medium/tt3032476/img", genres: ["Crime", "Drama"], season: 1, episode: 1, episodesCount: 10, totalSeasons: 6, seasonEpisodes: { 1: 10, 2: 10, 3: 10, 4: 10, 5: 10, 6: 13 } },
    { id: "tt2442560", imdbId: "tt2442560", title: "Peaky Blinders", year: "2013", rating: "★ 8.8", type: "series", duration: "6 Temporadas", poster: "https://images.metahub.space/poster/medium/tt2442560/img", backdrop: "https://images.metahub.space/background/medium/tt2442560/img", genres: ["Crime", "Drama"], season: 1, episode: 1, episodesCount: 6, totalSeasons: 6, seasonEpisodes: { 1: 6, 2: 6, 3: 6, 4: 6, 5: 6, 6: 6 } },
    { id: "tt5290382", imdbId: "tt5290382", title: "Mindhunter", year: "2017", rating: "★ 8.6", type: "series", duration: "2 Temporadas", poster: "https://images.metahub.space/poster/medium/tt5290382/img", backdrop: "https://images.metahub.space/background/medium/tt5290382/img", genres: ["Crime", "Drama"], season: 1, episode: 1, episodesCount: 10, totalSeasons: 2, seasonEpisodes: { 1: 10, 2: 9 } },
    { id: "tt0773262", imdbId: "tt0773262", title: "Dexter", year: "2006", rating: "★ 8.6", type: "series", duration: "8 Temporadas", poster: "https://images.metahub.space/poster/medium/tt0773262/img", backdrop: "https://images.metahub.space/background/medium/tt0773262/img", genres: ["Crime", "Drama"], season: 1, episode: 1, episodesCount: 12, totalSeasons: 8, seasonEpisodes: { 1: 12, 2: 12, 3: 12, 4: 12, 5: 12, 6: 12, 7: 12, 8: 12 } },
    { id: "tt0141842", imdbId: "tt0141842", title: "Família Soprano (The Sopranos)", year: "1999", rating: "★ 9.2", type: "series", duration: "6 Temporadas", poster: "https://images.metahub.space/poster/medium/tt0141842/img", backdrop: "https://images.metahub.space/background/medium/tt0141842/img", genres: ["Crime", "Drama"], season: 1, episode: 1, episodesCount: 13, totalSeasons: 6, seasonEpisodes: { 1: 13, 2: 13, 3: 13, 4: 13, 5: 13, 6: 21 } },
    { id: "tt0306414", imdbId: "tt0306414", title: "A Escuta (The Wire)", year: "2002", rating: "★ 9.3", type: "series", duration: "5 Temporadas", poster: "https://images.metahub.space/poster/medium/tt0306414/img", backdrop: "https://images.metahub.space/background/medium/tt0306414/img", genres: ["Crime", "Drama"], season: 1, episode: 1, episodesCount: 13, totalSeasons: 5, seasonEpisodes: { 1: 13, 2: 12, 3: 12, 4: 13, 5: 10 } },
    { id: "tt2356777", imdbId: "tt2356777", title: "True Detective", year: "2014", rating: "★ 8.9", type: "series", duration: "4 Temporadas", poster: "https://images.metahub.space/poster/medium/tt2356777/img", backdrop: "https://images.metahub.space/background/medium/tt2356777/img", genres: ["Crime", "Drama"], season: 1, episode: 1, episodesCount: 8, totalSeasons: 4, seasonEpisodes: { 1: 8, 2: 8, 3: 8, 4: 6 } },
    { id: "tt2707408", imdbId: "tt2707408", title: "Narcos", year: "2015", rating: "★ 8.8", type: "series", duration: "3 Temporadas", poster: "https://images.metahub.space/poster/medium/tt2707408/img", backdrop: "https://images.metahub.space/background/medium/tt2707408/img", genres: ["Crime", "Biografia"], season: 1, episode: 1, episodesCount: 10, totalSeasons: 3, seasonEpisodes: { 1: 10, 2: 10, 3: 10 } },
    { id: "tt2802850", imdbId: "tt2802850", title: "Fargo", year: "2014", rating: "★ 8.9", type: "series", duration: "5 Temporadas", poster: "https://images.metahub.space/poster/medium/tt2802850/img", backdrop: "https://images.metahub.space/background/medium/tt2802850/img", genres: ["Crime", "Drama"], season: 1, episode: 1, episodesCount: 10, totalSeasons: 5, seasonEpisodes: { 1: 10, 2: 10, 3: 10, 4: 11, 5: 10 } },
    { id: "tt5071412", imdbId: "tt5071412", title: "Ozark", year: "2017", rating: "★ 8.5", type: "series", duration: "4 Temporadas", poster: "https://images.metahub.space/poster/medium/tt5071412/img", backdrop: "https://images.metahub.space/background/medium/tt5071412/img", genres: ["Crime", "Drama"], season: 1, episode: 1, episodesCount: 10, totalSeasons: 4, seasonEpisodes: { 1: 10, 2: 10, 3: 10, 4: 14 } },
    { id: "tt1475582", imdbId: "tt1475582", title: "Sherlock", year: "2010", rating: "★ 9.1", type: "series", duration: "4 Temporadas", poster: "https://images.metahub.space/poster/medium/tt1475582/img", backdrop: "https://images.metahub.space/background/medium/tt1475582/img", genres: ["Crime", "Mistério"], season: 1, episode: 1, episodesCount: 3, totalSeasons: 4, seasonEpisodes: { 1: 3, 2: 3, 3: 3, 4: 3 } },
    { id: "tt1124373", imdbId: "tt1124373", title: "Sons of Anarchy", year: "2008", rating: "★ 8.6", type: "series", duration: "7 Temporadas", poster: "https://images.metahub.space/poster/medium/tt1124373/img", backdrop: "https://images.metahub.space/background/medium/tt1124373/img", genres: ["Crime", "Drama"], season: 1, episode: 1, episodesCount: 13, totalSeasons: 7, seasonEpisodes: { 1: 13, 2: 13, 3: 13, 4: 14, 5: 13, 6: 13, 7: 13 } },
    { id: "tt0979432", imdbId: "tt0979432", title: "Boardwalk Empire", year: "2010", rating: "★ 8.6", type: "series", duration: "5 Temporadas", poster: "https://images.metahub.space/poster/medium/tt0979432/img", backdrop: "https://images.metahub.space/background/medium/tt0979432/img", genres: ["Crime", "Drama"], season: 1, episode: 1, episodesCount: 12, totalSeasons: 5, seasonEpisodes: { 1: 12, 2: 12, 3: 12, 4: 12, 5: 8 } },
    { id: "tt15435876", imdbId: "tt15435876", title: "Pinguim (The Penguin)", year: "2024", rating: "★ 8.9", type: "series", duration: "8 Episódios", poster: "https://images.metahub.space/poster/medium/tt15435876/img", backdrop: "https://images.metahub.space/background/medium/tt15435876/img", genres: ["Crime", "Drama"], season: 1, episode: 1, episodesCount: 8, totalSeasons: 1, seasonEpisodes: { 1: 8 } }
  ],
  family: [
    { id: "tt0417299", imdbId: "tt0417299", title: "Avatar: A Lenda de Aang", year: "2005", rating: "★ 9.3", type: "series", duration: "3 Temporadas", poster: "https://images.metahub.space/poster/medium/tt0417299/img", backdrop: "https://images.metahub.space/background/medium/tt0417299/img", genres: ["Animação", "Aventura"], season: 1, episode: 1, episodesCount: 20, totalSeasons: 3, seasonEpisodes: { 1: 20, 2: 20, 3: 21 } },
    { id: "tt1865718", imdbId: "tt1865718", title: "Gravity Falls: Um Verão de Mistérios", year: "2012", rating: "★ 8.9", type: "series", duration: "2 Temporadas", poster: "https://images.metahub.space/poster/medium/tt1865718/img", backdrop: "https://images.metahub.space/background/medium/tt1865718/img", genres: ["Animação", "Comédia"], season: 1, episode: 1, episodesCount: 20, totalSeasons: 2, seasonEpisodes: { 1: 20, 2: 20 } },
    { id: "tt0458290", imdbId: "tt0458290", title: "Star Wars: The Clone Wars", year: "2008", rating: "★ 8.4", type: "series", duration: "7 Temporadas", poster: "https://images.metahub.space/poster/medium/tt0458290/img", backdrop: "https://images.metahub.space/background/medium/tt0458290/img", genres: ["Animação", "Ação"], season: 1, episode: 1, episodesCount: 22, totalSeasons: 7, seasonEpisodes: { 1: 22, 2: 22, 3: 22, 4: 22, 5: 20, 6: 13, 7: 12 } },
    { id: "tt16026746", imdbId: "tt16026746", title: "X-Men '97", year: "2024", rating: "★ 8.9", type: "series", duration: "10 Episódios", poster: "https://images.metahub.space/poster/medium/tt16026746/img", backdrop: "https://images.metahub.space/background/medium/tt16026746/img", genres: ["Animação", "Ação"], season: 1, episode: 1, episodesCount: 10, totalSeasons: 1, seasonEpisodes: { 1: 10 } },
    { id: "tt0103359", imdbId: "tt0103359", title: "Batman: A Série Animada (1992)", year: "1992", rating: "★ 9.0", type: "series", duration: "4 Temporadas", poster: "https://images.metahub.space/poster/medium/tt0103359/img", backdrop: "https://images.metahub.space/background/medium/tt0103359/img", genres: ["Animação", "Ação"], season: 1, episode: 1, episodesCount: 65, totalSeasons: 4, seasonEpisodes: { 1: 65, 2: 20, 3: 10, 4: 14 } },
    { id: "tt2861424", imdbId: "tt2861424", title: "Rick and Morty", year: "2013", rating: "★ 9.1", type: "series", duration: "7 Temporadas", poster: "https://images.metahub.space/poster/medium/tt2861424/img", backdrop: "https://images.metahub.space/background/medium/tt2861424/img", genres: ["Animação", "Comédia"], season: 1, episode: 1, episodesCount: 11, totalSeasons: 7, seasonEpisodes: { 1: 11, 2: 10, 3: 10, 4: 10, 5: 10, 6: 10, 7: 10 } },
    { id: "tt1305826", imdbId: "tt1305826", title: "Hora de Aventura (Adventure Time)", year: "2010", rating: "★ 8.6", type: "series", duration: "10 Temporadas", poster: "https://images.metahub.space/poster/medium/tt1305826/img", backdrop: "https://images.metahub.space/background/medium/tt1305826/img", genres: ["Animação", "Aventura"], season: 1, episode: 1, episodesCount: 26, totalSeasons: 10, seasonEpisodes: { 1: 26, 2: 26, 3: 26, 4: 26, 5: 52, 6: 43, 7: 26, 8: 27, 9: 14, 10: 16 } },
    { id: "tt11126994", imdbId: "tt11126994", title: "Arcane - Temporada 2", year: "2024", rating: "★ 9.0", type: "series", duration: "9 Episódios", poster: "https://images.metahub.space/poster/medium/tt11126994/img", backdrop: "https://images.metahub.space/background/medium/tt11126994/img", genres: ["Animação", "Ação"], season: 2, episode: 1, episodesCount: 9, totalSeasons: 2, seasonEpisodes: { 1: 9, 2: 9 } },
    { id: "tt1710308", imdbId: "tt1710308", title: "Apenas um Show (Regular Show)", year: "2010", rating: "★ 8.5", type: "series", duration: "8 Temporadas", poster: "https://images.metahub.space/poster/medium/tt1710308/img", backdrop: "https://images.metahub.space/background/medium/tt1710308/img", genres: ["Animação", "Comédia"], season: 1, episode: 1, episodesCount: 12, totalSeasons: 8, seasonEpisodes: { 1: 12, 2: 28, 3: 40, 4: 40, 5: 40, 6: 31, 7: 39, 8: 31 } },
    { id: "tt0206512", imdbId: "tt0206512", title: "Bob Esponja Calça Quadrada", year: "1999", rating: "★ 8.2", type: "series", duration: "14 Temporadas", poster: "https://images.metahub.space/poster/medium/tt0206512/img", backdrop: "https://images.metahub.space/background/medium/tt0206512/img", genres: ["Animação", "Comédia"], season: 1, episode: 1, episodesCount: 20, totalSeasons: 14, seasonEpisodes: { 1: 20, 2: 20, 3: 20, 4: 20, 5: 20 } },
    { id: "tt6741278", imdbId: "tt6741278", title: "Invencível (Invincible)", year: "2021", rating: "★ 8.7", type: "series", duration: "2 Temporadas", poster: "https://images.metahub.space/poster/medium/tt6741278/img", backdrop: "https://images.metahub.space/background/medium/tt6741278/img", genres: ["Animação", "Ação"], season: 1, episode: 1, episodesCount: 8, totalSeasons: 2, seasonEpisodes: { 1: 8, 2: 8 } },
    { id: "tt6517102", imdbId: "tt6517102", title: "Castlevania", year: "2017", rating: "★ 8.3", type: "series", duration: "4 Temporadas", poster: "https://images.metahub.space/poster/medium/tt6517102/img", backdrop: "https://images.metahub.space/background/medium/tt6517102/img", genres: ["Animação", "Ação"], season: 1, episode: 1, episodesCount: 4, totalSeasons: 4, seasonEpisodes: { 1: 4, 2: 8, 3: 10, 4: 10 } },
    { id: "tt1695360", imdbId: "tt1695360", title: "A Lenda de Korra", year: "2012", rating: "★ 8.4", type: "series", duration: "4 Temporadas", poster: "https://images.metahub.space/poster/medium/tt1695360/img", backdrop: "https://images.metahub.space/background/medium/tt1695360/img", genres: ["Animação", "Ação"], season: 1, episode: 1, episodesCount: 12, totalSeasons: 4, seasonEpisodes: { 1: 12, 2: 14, 3: 13, 4: 13 } },
    { id: "tt0278238", imdbId: "tt0278238", title: "Samurai Jack", year: "2001", rating: "★ 8.5", type: "series", duration: "5 Temporadas", poster: "https://images.metahub.space/poster/medium/tt0278238/img", backdrop: "https://images.metahub.space/background/medium/tt0278238/img", genres: ["Animação", "Ação"], season: 1, episode: 1, episodesCount: 13, totalSeasons: 5, seasonEpisodes: { 1: 13, 2: 13, 3: 13, 4: 13, 5: 10 } },
    { id: "tt0852863", imdbId: "tt0852863", title: "Phineas e Ferb", year: "2007", rating: "★ 8.1", type: "series", duration: "4 Temporadas", poster: "https://images.metahub.space/poster/medium/tt0852863/img", backdrop: "https://images.metahub.space/background/medium/tt0852863/img", genres: ["Animação", "Comédia"], season: 1, episode: 1, episodesCount: 26, totalSeasons: 4, seasonEpisodes: { 1: 26, 2: 39, 3: 35, 4: 36 } }
  ],
  scifi: [
    { id: "tt4574334", imdbId: "tt4574334", title: "Stranger Things", year: "2016", rating: "★ 8.7", type: "series", duration: "4 Temporadas", poster: "https://images.metahub.space/poster/medium/tt4574334/img", backdrop: "https://images.metahub.space/background/medium/tt4574334/img", genres: ["Ficção Científica", "Drama"], season: 1, episode: 1, episodesCount: 8, totalSeasons: 4, seasonEpisodes: { 1: 8, 2: 9, 3: 8, 4: 9 } },
    { id: "tt3581920", imdbId: "tt3581920", title: "The Last of Us", year: "2023", rating: "★ 8.8", type: "series", duration: "9 Episódios", poster: "https://images.metahub.space/poster/medium/tt3581920/img", backdrop: "https://images.metahub.space/background/medium/tt3581920/img", genres: ["Drama", "Ficção Científica"], season: 1, episode: 1, episodesCount: 9, totalSeasons: 1, seasonEpisodes: { 1: 9 } },
    { id: "tt12637874", imdbId: "tt12637874", title: "Fallout", year: "2024", rating: "★ 8.4", type: "series", duration: "8 Episódios", poster: "https://images.metahub.space/poster/medium/tt12637874/img", backdrop: "https://images.metahub.space/background/medium/tt12637874/img", genres: ["Ficção Científica", "Ação"], season: 1, episode: 1, episodesCount: 8, totalSeasons: 1, seasonEpisodes: { 1: 8 } },
    { id: "tt5753856", imdbId: "tt5753856", title: "Dark", year: "2017", rating: "★ 8.7", type: "series", duration: "3 Temporadas", poster: "https://images.metahub.space/poster/medium/tt5753856/img", backdrop: "https://images.metahub.space/background/medium/tt5753856/img", genres: ["Ficção Científica", "Mistério"], season: 1, episode: 1, episodesCount: 10, totalSeasons: 3, seasonEpisodes: { 1: 10, 2: 8, 3: 8 } },
    { id: "tt2085059", imdbId: "tt2085059", title: "Black Mirror", year: "2011", rating: "★ 8.7", type: "series", duration: "6 Temporadas", poster: "https://images.metahub.space/poster/medium/tt2085059/img", backdrop: "https://images.metahub.space/background/medium/tt2085059/img", genres: ["Ficção Científica", "Drama"], season: 1, episode: 1, episodesCount: 6, totalSeasons: 6, seasonEpisodes: { 1: 3, 2: 4, 3: 6, 4: 6, 5: 3, 6: 5 } },
    { id: "tt0944947", imdbId: "tt0944947", title: "Game of Thrones", year: "2011", rating: "★ 9.2", type: "series", duration: "8 Temporadas", poster: "https://images.metahub.space/poster/medium/tt0944947/img", backdrop: "https://images.metahub.space/background/medium/tt0944947/img", genres: ["Ação", "Fantasia"], season: 1, episode: 1, episodesCount: 10, totalSeasons: 8, seasonEpisodes: { 1: 10, 2: 10, 3: 10, 4: 10, 5: 10, 6: 10, 7: 7, 8: 6 } },
    { id: "tt5180504", imdbId: "tt5180504", title: "The Witcher", year: "2019", rating: "★ 8.0", type: "series", duration: "3 Temporadas", poster: "https://images.metahub.space/poster/medium/tt5180504/img", backdrop: "https://images.metahub.space/background/medium/tt5180504/img", genres: ["Ação", "Fantasia"], season: 1, episode: 1, episodesCount: 8, totalSeasons: 3, seasonEpisodes: { 1: 8, 2: 8, 3: 8 } },
    { id: "tt11198330", imdbId: "tt11198330", title: "A Casa do Dragão", year: "2022", rating: "★ 8.4", type: "series", duration: "2 Temporadas", poster: "https://images.metahub.space/poster/medium/tt11198330/img", backdrop: "https://images.metahub.space/background/medium/tt11198330/img", genres: ["Ação", "Fantasia"], season: 1, episode: 1, episodesCount: 10, totalSeasons: 2, seasonEpisodes: { 1: 10, 2: 8 } },
    { id: "tt8111088", imdbId: "tt8111088", title: "O Mandaloriano (The Mandalorian)", year: "2019", rating: "★ 8.6", type: "series", duration: "3 Temporadas", poster: "https://images.metahub.space/poster/medium/tt8111088/img", backdrop: "https://images.metahub.space/background/medium/tt8111088/img", genres: ["Ação", "Ficção Científica"], season: 1, episode: 1, episodesCount: 8, totalSeasons: 3, seasonEpisodes: { 1: 8, 2: 8, 3: 8 } },
    { id: "tt0475784", imdbId: "tt0475784", title: "Westworld", year: "2016", rating: "★ 8.5", type: "series", duration: "4 Temporadas", poster: "https://images.metahub.space/poster/medium/tt0475784/img", backdrop: "https://images.metahub.space/background/medium/tt0475784/img", genres: ["Ficção Científica", "Drama"], season: 1, episode: 1, episodesCount: 10, totalSeasons: 4, seasonEpisodes: { 1: 10, 2: 10, 3: 8, 4: 8 } },
    { id: "tt0436992", imdbId: "tt0436992", title: "Doctor Who", year: "2005", rating: "★ 8.6", type: "series", duration: "13 Temporadas", poster: "https://images.metahub.space/poster/medium/tt0436992/img", backdrop: "https://images.metahub.space/background/medium/tt0436992/img", genres: ["Aventura", "Ficção Científica"], season: 1, episode: 1, episodesCount: 13, totalSeasons: 13, seasonEpisodes: { 1: 13, 2: 13, 3: 13, 4: 13, 5: 13 } },
    { id: "tt3230854", imdbId: "tt3230854", title: "The Expanse", year: "2015", rating: "★ 8.5", type: "series", duration: "6 Temporadas", poster: "https://images.metahub.space/poster/medium/tt3230854/img", backdrop: "https://images.metahub.space/background/medium/tt3230854/img", genres: ["Drama", "Ficção Científica"], season: 1, episode: 1, episodesCount: 10, totalSeasons: 6, seasonEpisodes: { 1: 10, 2: 13, 3: 13, 4: 10, 5: 10, 6: 6 } },
    { id: "tt2934286", imdbId: "tt2934286", title: "Halo", year: "2022", rating: "★ 7.3", type: "series", duration: "2 Temporadas", poster: "https://images.metahub.space/poster/medium/tt2934286/img", backdrop: "https://images.metahub.space/background/medium/tt2934286/img", genres: ["Ação", "Ficção Científica"], season: 1, episode: 1, episodesCount: 9, totalSeasons: 2, seasonEpisodes: { 1: 9, 2: 8 } },
    { id: "tt0804484", imdbId: "tt0804484", title: "Fundação (Foundation)", year: "2021", rating: "★ 7.6", type: "series", duration: "2 Temporadas", poster: "https://images.metahub.space/poster/medium/tt0804484/img", backdrop: "https://images.metahub.space/background/medium/tt0804484/img", genres: ["Drama", "Ficção Científica"], season: 1, episode: 1, episodesCount: 10, totalSeasons: 2, seasonEpisodes: { 1: 10, 2: 10 } },
    { id: "tt13016388", imdbId: "tt13016388", title: "O Problema dos 3 Corpos", year: "2024", rating: "★ 7.5", type: "series", duration: "1 Temporada", poster: "https://images.metahub.space/poster/medium/tt13016388/img", backdrop: "https://images.metahub.space/background/medium/tt13016388/img", genres: ["Aventura", "Ficção Científica"], season: 1, episode: 1, episodesCount: 8, totalSeasons: 1, seasonEpisodes: { 1: 8 } }
  ],
  action: [
    { id: "tt0944947", imdbId: "tt0944947", title: "Game of Thrones", year: "2011", rating: "★ 9.2", type: "series", duration: "8 Temporadas", poster: "https://images.metahub.space/poster/medium/tt0944947/img", backdrop: "https://images.metahub.space/background/medium/tt0944947/img", genres: ["Ação", "Fantasia"], season: 1, episode: 1, episodesCount: 10, totalSeasons: 8, seasonEpisodes: { 1: 10, 2: 10, 3: 10, 4: 10, 5: 10, 6: 10, 7: 7, 8: 6 } },
    { id: "tt5180504", imdbId: "tt5180504", title: "The Witcher", year: "2019", rating: "★ 8.0", type: "series", duration: "3 Temporadas", poster: "https://images.metahub.space/poster/medium/tt5180504/img", backdrop: "https://images.metahub.space/background/medium/tt5180504/img", genres: ["Ação", "Fantasia"], season: 1, episode: 1, episodesCount: 8, totalSeasons: 3, seasonEpisodes: { 1: 8, 2: 8, 3: 8 } },
    { id: "tt9140554", imdbId: "tt9140554", title: "Loki", year: "2021", rating: "★ 8.2", type: "series", duration: "2 Temporadas", poster: "https://images.metahub.space/poster/medium/tt9140554/img", backdrop: "https://images.metahub.space/background/medium/tt9140554/img", genres: ["Ação", "Ficção Científica"], season: 1, episode: 1, episodesCount: 6, totalSeasons: 2, seasonEpisodes: { 1: 6, 2: 6 } },
    { id: "tt9288030", imdbId: "tt9288030", title: "Reacher", year: "2022", rating: "★ 8.1", type: "series", duration: "2 Temporadas", poster: "https://images.metahub.space/poster/medium/tt9288030/img", backdrop: "https://images.metahub.space/background/medium/tt9288030/img", genres: ["Ação", "Crime"], season: 1, episode: 1, episodesCount: 8, totalSeasons: 2, seasonEpisodes: { 1: 8, 2: 8 } },
    { id: "tt3322312", imdbId: "tt3322312", title: "Demolidor (Daredevil)", year: "2015", rating: "★ 8.6", type: "series", duration: "3 Temporadas", poster: "https://images.metahub.space/poster/medium/tt3322312/img", backdrop: "https://images.metahub.space/background/medium/tt3322312/img", genres: ["Ação", "Crime"], season: 1, episode: 1, episodesCount: 13, totalSeasons: 3, seasonEpisodes: { 1: 13, 2: 13, 3: 13 } },
    { id: "tt5675620", imdbId: "tt5675620", title: "O Justiceiro (The Punisher)", year: "2017", rating: "★ 8.5", type: "series", duration: "2 Temporadas", poster: "https://images.metahub.space/poster/medium/tt5675620/img", backdrop: "https://images.metahub.space/background/medium/tt5675620/img", genres: ["Ação", "Crime"], season: 1, episode: 1, episodesCount: 13, totalSeasons: 2, seasonEpisodes: { 1: 13, 2: 13 } },
    { id: "tt2306299", imdbId: "tt2306299", title: "Vikings", year: "2013", rating: "★ 8.5", type: "series", duration: "6 Temporadas", poster: "https://images.metahub.space/poster/medium/tt2306299/img", backdrop: "https://images.metahub.space/background/medium/tt2306299/img", genres: ["Ação", "Aventura"], season: 1, episode: 1, episodesCount: 9, totalSeasons: 6, seasonEpisodes: { 1: 9, 2: 10, 3: 10, 4: 20, 5: 20, 6: 20 } },
    { id: "tt1190634", imdbId: "tt1190634", title: "The Boys", year: "2019", rating: "★ 8.7", type: "series", duration: "4 Temporadas", poster: "https://images.metahub.space/poster/medium/tt1190634/img", backdrop: "https://images.metahub.space/background/medium/tt1190634/img", genres: ["Ação", "Comédia"], season: 1, episode: 1, episodesCount: 8, totalSeasons: 4, seasonEpisodes: { 1: 8, 2: 8, 3: 8, 4: 8 } },
    { id: "tt2017109", imdbId: "tt2017109", title: "Banshee", year: "2013", rating: "★ 8.4", type: "series", duration: "4 Temporadas", poster: "https://images.metahub.space/poster/medium/tt2017109/img", backdrop: "https://images.metahub.space/background/medium/tt2017109/img", genres: ["Ação", "Crime"], season: 1, episode: 1, episodesCount: 10, totalSeasons: 4, seasonEpisodes: { 1: 10, 2: 10, 3: 10, 4: 8 } },
    { id: "tt0285331", imdbId: "tt0285331", title: "24 Horas (24)", year: "2001", rating: "★ 8.4", type: "series", duration: "9 Temporadas", poster: "https://images.metahub.space/poster/medium/tt0285331/img", backdrop: "https://images.metahub.space/background/medium/tt0285331/img", genres: ["Ação", "Crime"], season: 1, episode: 1, episodesCount: 24, totalSeasons: 9, seasonEpisodes: { 1: 24, 2: 24, 3: 24, 4: 24, 5: 24, 6: 24, 7: 24, 8: 24, 9: 12 } },
    { id: "tt5057054", imdbId: "tt5057054", title: "Jack Ryan", year: "2018", rating: "★ 8.0", type: "series", duration: "4 Temporadas", poster: "https://images.metahub.space/poster/medium/tt5057054/img", backdrop: "https://images.metahub.space/background/medium/tt5057054/img", genres: ["Ação", "Drama"], season: 1, episode: 1, episodesCount: 8, totalSeasons: 4, seasonEpisodes: { 1: 8, 2: 8, 3: 8, 4: 6 } },
    { id: "tt11734264", imdbId: "tt11734264", title: "A Lista Terminal (The Terminal List)", year: "2022", rating: "★ 7.9", type: "series", duration: "1 Temporada", poster: "https://images.metahub.space/poster/medium/tt11734264/img", backdrop: "https://images.metahub.space/background/medium/tt11734264/img", genres: ["Ação", "Drama"], season: 1, episode: 1, episodesCount: 8, totalSeasons: 1, seasonEpisodes: { 1: 8 } },
    { id: "tt2193021", imdbId: "tt2193021", title: "Arrow", year: "2012", rating: "★ 7.5", type: "series", duration: "8 Temporadas", poster: "https://images.metahub.space/poster/medium/tt2193021/img", backdrop: "https://images.metahub.space/background/medium/tt2193021/img", genres: ["Ação", "Aventura"], season: 1, episode: 1, episodesCount: 23, totalSeasons: 8, seasonEpisodes: { 1: 23, 2: 23, 3: 23, 4: 23, 5: 23, 6: 23, 7: 22, 8: 10 } },
    { id: "tt3107288", imdbId: "tt3107288", title: "The Flash", year: "2014", rating: "★ 7.5", type: "series", duration: "9 Temporadas", poster: "https://images.metahub.space/poster/medium/tt3107288/img", backdrop: "https://images.metahub.space/background/medium/tt3107288/img", genres: ["Ação", "Aventura"], season: 1, episode: 1, episodesCount: 23, totalSeasons: 9, seasonEpisodes: { 1: 23, 2: 23, 3: 23, 4: 23, 5: 22, 6: 19, 7: 18, 8: 20, 9: 13 } },
    { id: "tt7221388", imdbId: "tt7221388", title: "Cobra Kai", year: "2018", rating: "★ 8.4", type: "series", duration: "6 Temporadas", poster: "https://images.metahub.space/poster/medium/tt7221388/img", backdrop: "https://images.metahub.space/background/medium/tt7221388/img", genres: ["Ação", "Comédia"], season: 1, episode: 1, episodesCount: 10, totalSeasons: 6, seasonEpisodes: { 1: 10, 2: 10, 3: 10, 4: 10, 5: 10, 6: 15 } }
  ],
  comedy: [
    { id: "tt1190634", imdbId: "tt1190634", title: "The Boys", year: "2019", rating: "★ 8.7", type: "series", duration: "4 Temporadas", poster: "https://images.metahub.space/poster/medium/tt1190634/img", backdrop: "https://images.metahub.space/background/medium/tt1190634/img", genres: ["Comédia", "Ação", "Comedy"], season: 1, episode: 1, episodesCount: 8, totalSeasons: 4, seasonEpisodes: { 1: 8, 2: 8, 3: 8, 4: 8 } },
    { id: "tt14452776", imdbId: "tt14452776", title: "O Urso (The Bear)", year: "2022", rating: "★ 8.6", type: "series", duration: "3 Temporadas", poster: "https://images.metahub.space/poster/medium/tt14452776/img", backdrop: "https://images.metahub.space/background/medium/tt14452776/img", genres: ["Comédia", "Drama", "Comedy"], season: 1, episode: 1, episodesCount: 8, totalSeasons: 3, seasonEpisodes: { 1: 8, 2: 10, 3: 10 } },
    { id: "tt2467372", imdbId: "tt2467372", title: "Brooklyn Nine-Nine", year: "2013", rating: "★ 8.4", type: "series", duration: "8 Temporadas", poster: "https://images.metahub.space/poster/medium/tt2467372/img", backdrop: "https://images.metahub.space/background/medium/tt2467372/img", genres: ["Comédia", "Crime", "Comedy"], season: 1, episode: 1, episodesCount: 22, totalSeasons: 8, seasonEpisodes: { 1: 22, 2: 23, 3: 23, 4: 22, 5: 22, 6: 18, 7: 13, 8: 10 } },
    { id: "tt0386676", imdbId: "tt0386676", title: "The Office", year: "2005", rating: "★ 9.0", type: "series", duration: "9 Temporadas", poster: "https://images.metahub.space/poster/medium/tt0386676/img", backdrop: "https://images.metahub.space/background/medium/tt0386676/img", genres: ["Comédia", "Comedy"], season: 1, episode: 1, episodesCount: 6, totalSeasons: 9, seasonEpisodes: { 1: 6, 2: 22, 3: 25, 4: 19, 5: 28, 6: 26, 7: 26, 8: 24, 9: 25 } },
    { id: "tt0108778", imdbId: "tt0108778", title: "Friends", year: "1994", rating: "★ 8.9", type: "series", duration: "10 Temporadas", poster: "https://images.metahub.space/poster/medium/tt0108778/img", backdrop: "https://images.metahub.space/background/medium/tt0108778/img", genres: ["Comédia", "Romance", "Comedy"], season: 1, episode: 1, episodesCount: 24, totalSeasons: 10, seasonEpisodes: { 1: 24, 2: 24, 3: 25, 4: 24, 5: 24, 6: 25, 7: 24, 8: 24, 9: 24, 10: 17 } },
    { id: "tt7221388", imdbId: "tt7221388", title: "Cobra Kai", year: "2018", rating: "★ 8.4", type: "series", duration: "6 Temporadas", poster: "https://images.metahub.space/poster/medium/tt7221388/img", backdrop: "https://images.metahub.space/background/medium/tt7221388/img", genres: ["Comédia", "Ação", "Comedy"], season: 1, episode: 1, episodesCount: 10, totalSeasons: 6, seasonEpisodes: { 1: 10, 2: 10, 3: 10, 4: 10, 5: 10, 6: 15 } }
  ],
  horror: [
    { id: "tt4574334", imdbId: "tt4574334", title: "Stranger Things", year: "2016", rating: "★ 8.7", type: "series", duration: "4 Temporadas", poster: "https://images.metahub.space/poster/medium/tt4574334/img", backdrop: "https://images.metahub.space/background/medium/tt4574334/img", genres: ["Terror", "Ficção Científica", "Horror"], season: 1, episode: 1, episodesCount: 8, totalSeasons: 4, seasonEpisodes: { 1: 8, 2: 9, 3: 8, 4: 9 } },
    { id: "tt3581920", imdbId: "tt3581920", title: "The Last of Us", year: "2023", rating: "★ 8.8", type: "series", duration: "9 Episódios", poster: "https://images.metahub.space/poster/medium/tt3581920/img", backdrop: "https://images.metahub.space/background/medium/tt3581920/img", genres: ["Terror", "Drama", "Horror"], season: 1, episode: 1, episodesCount: 9, totalSeasons: 1, seasonEpisodes: { 1: 9 } },
    { id: "tt11041332", imdbId: "tt11041332", title: "Yellowjackets", year: "2021", rating: "★ 7.8", type: "series", duration: "2 Temporadas", poster: "https://images.metahub.space/poster/medium/tt11041332/img", backdrop: "https://images.metahub.space/background/medium/tt11041332/img", genres: ["Terror", "Mistério", "Horror"], season: 1, episode: 1, episodesCount: 10, totalSeasons: 2, seasonEpisodes: { 1: 10, 2: 9 } },
    { id: "tt6763664", imdbId: "tt6763664", title: "A Maldição da Residência Hill", year: "2018", rating: "★ 8.6", type: "series", duration: "10 Episódios", poster: "https://images.metahub.space/poster/medium/tt6763664/img", backdrop: "https://images.metahub.space/background/medium/tt6763664/img", genres: ["Terror", "Drama", "Horror"], season: 1, episode: 1, episodesCount: 10, totalSeasons: 1, seasonEpisodes: { 1: 10 } }
  ]
};

/**
 * Builds real embed streaming URL for any movie or series title
 */
export function getRealStreamUrl(item, serverId = "multiembed", customSeason = null, customEpisode = null) {
  // If it's a direct HLS stream, return directly
  if (item.isHls && item.streamUrl) {
    return { url: item.streamUrl, isEmbed: false };
  }

  // Direct stream / offline playback
  if (item.localStreamUrl || serverId === 'offline') {
    const directUrl = item.localStreamUrl || item.streamUrl;
    if (directUrl) return { url: directUrl, isEmbed: false };
  }

  const rawId = item.imdbId || item.id || "tt8367814";
  const match = String(rawId).match(/tt\d+/);
  const imdbId = match ? match[0] : rawId;
  const tmdbId = item.tmdbId || item.tmdb_id || null;
  const targetId = tmdbId || imdbId;
  const season = customSeason || item.season || 1;
  const episode = customEpisode || item.episode || 1;
  const isSeries = item.type === "series";

  let url = "";
  if (serverId === "multiembed") {
    // Server 1: AnyEmbed VIP (Zero Ads, Fast 1080p, TMDB/IMDb compatible)
    url = isSeries
      ? (tmdbId ? `https://anyembed.xyz/embed/tmdb-tv-${tmdbId}-${season}-${episode}?logo=false` : `https://anyembed.xyz/embed/imdb-tv-${imdbId}-${season}-${episode}?logo=false`)
      : (tmdbId ? `https://anyembed.xyz/embed/tmdb-movie-${tmdbId}?logo=false` : `https://anyembed.xyz/embed/imdb-movie-${imdbId}?logo=false`);
  } else if (serverId === "vidlink") {
    // Server 2: VidLink Ultra (Fast 4K)
    url = isSeries
      ? (tmdbId ? `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}?autoplay=true` : `https://vidlink.pro/tv/${imdbId}/${season}/${episode}?autoplay=true`)
      : (tmdbId ? `https://vidlink.pro/movie/${tmdbId}?autoplay=true` : `https://vidlink.pro/movie/${imdbId}?autoplay=true`);
  } else if (serverId === "2embed") {
    // Server 3: 2Embed Prime
    url = isSeries
      ? `https://www.2embed.cc/embedtv/${imdbId}&s=${season}&e=${episode}`
      : `https://www.2embed.cc/embed/${imdbId}`;
  } else if (serverId === "vidsrc") {
    // Server 4: VidSrc Pro
    url = isSeries
      ? `https://vidsrc.to/embed/tv/${imdbId}/${season}/${episode}`
      : `https://vidsrc.me/embed/movie?imdb=${imdbId}`;
  } else if (serverId === "autoembed") {
    // Server 5: AutoEmbed HD (Backup)
    url = isSeries
      ? `https://player.autoembed.co/embed/tv/${imdbId}/${season}/${episode}?autoplay=1`
      : `https://player.autoembed.co/embed/movie/${imdbId}?autoplay=1`;
  } else {
    // Default fallback: AnyEmbed VIP
    url = isSeries
      ? (tmdbId ? `https://anyembed.xyz/embed/tmdb-tv-${tmdbId}-${season}-${episode}?logo=false` : `https://anyembed.xyz/embed/imdb-tv-${imdbId}-${season}-${episode}?logo=false`)
      : (tmdbId ? `https://anyembed.xyz/embed/tmdb-movie-${tmdbId}?logo=false` : `https://anyembed.xyz/embed/imdb-movie-${imdbId}?logo=false`);
  }

  return { url, isEmbed: true };
}

/**
 * Returns a rich unified catalog for Movies or Series
 */
const unifiedCatalogCache = {
  movie: null,
  series: null
};

export async function getUnifiedCatalog(type = 'movie') {
  if (unifiedCatalogCache[type] && Array.isArray(unifiedCatalogCache[type]) && unifiedCatalogCache[type].length > 0) {
    return unifiedCatalogCache[type];
  }

  const seen = new Set();
  const combined = [];

  const addItem = (item) => {
    if (!item) return;
    const key = item.imdbId || item.id;
    if (!key || seen.has(key)) return;
    seen.add(key);
    combined.push(item);
  };

  if (type === 'movie') {
    // 1. Curated built-in categories (70+ top movies across all genres)
    Object.values(MOVIE_CATEGORIES).forEach(list => {
      if (Array.isArray(list)) list.forEach(addItem);
    });
    if (Array.isArray(BRAZILIAN_CATALOG.superflix)) {
      BRAZILIAN_CATALOG.superflix.forEach(addItem);
    }
    // 2. Online Cinemeta Top Movies
    try {
      const stremioMovies = await fetchStremioTopCatalog('movie');
      if (Array.isArray(stremioMovies)) stremioMovies.forEach(addItem);
    } catch (e) {}

    unifiedCatalogCache[type] = combined;
    return combined;
  } else {
    // 1. Curated built-in categories (75 top series across all genres)
    Object.values(SERIES_CATEGORIES).forEach(list => {
      if (Array.isArray(list)) list.forEach(addItem);
    });
    if (Array.isArray(BRAZILIAN_CATALOG.redecanais)) {
      BRAZILIAN_CATALOG.redecanais.forEach(addItem);
    }
    // 2. Online Cinemeta Top Series
    try {
      const stremioSeries = await fetchStremioTopCatalog('series');
      if (Array.isArray(stremioSeries)) stremioSeries.forEach(addItem);
    } catch (e) {}

    unifiedCatalogCache[type] = combined;
    return combined;
  }
}

/**
 * Searches all content across local catalogs and Stremio/Cinemeta
 */
export async function searchAllAppContent(query) {
  if (!query || query.trim().length === 0) return [];
  const q = query.trim().toLowerCase();
  const candidates = [];

  // 1. Gather all local catalog movies & series
  Object.values(MOVIE_CATEGORIES).forEach(list => {
    if (Array.isArray(list)) candidates.push(...list);
  });
  Object.values(SERIES_CATEGORIES).forEach(list => {
    if (Array.isArray(list)) candidates.push(...list);
  });
  BRAZILIAN_CATALOG.superflix.forEach(item => candidates.push(item));
  BRAZILIAN_CATALOG.redecanais.forEach(item => candidates.push(item));

  if (window.cineApp?.cachedMovies) candidates.push(...window.cineApp.cachedMovies);
  if (window.cineApp?.cachedSeries) candidates.push(...window.cineApp.cachedSeries);

  const localResults = [];
  const localSeen = new Set();

  candidates.forEach(item => {
    const key = item.imdbId || item.id;
    if (!key || localSeen.has(key)) return;

    const origTitle = (item.title || item.name || '').toLowerCase();
    const transTitle = (getItemTitle(item) || '').toLowerCase();
    const origDesc = (item.description || '').toLowerCase();
    const transDesc = (getItemDescription(item) || '').toLowerCase();
    const genres = (item.genres || []).join(' ').toLowerCase();

    if (origTitle.includes(q) || transTitle.includes(q) || origDesc.includes(q) || transDesc.includes(q) || genres.includes(q)) {
      localSeen.add(key);
      localResults.push(item);
    }
  });

  // 2. Online Stremio Cinemeta Search
  const onlineResults = await searchStremioCatalog(query);

  // Combine and deduplicate
  const seen = new Set();
  const combined = [];

  localResults.forEach(item => {
    const key = item.imdbId || item.id;
    if (!seen.has(key)) {
      seen.add(key);
      combined.push(item);
    }
  });

  onlineResults.forEach(item => {
    const key = item.imdbId || item.id;
    if (!seen.has(key)) {
      seen.add(key);
      combined.push(item);
    }
  });

  return combined;
}
