export interface SocialLink {
  id: "instagram" | "twitch" | "youtube";
  name: string;
  handle: string;
  url: string;
  description: string;
  badge: string;
  color: string;
  hoverBorder: string;
  hoverText: string;
  ctaText: string;
}

export const CLUB_INFO = {
  name: "PSG Fútbol 7",
  shortName: "PSG F7",
  slogan: "Fuerza · Resurgimiento · Garra",
  motto: "El Fénix Nunca se Rinde",
  season: "Temporada Regular 2026/27",
  category: "Fútbol 7 Aficionado",
} as const;

/**
 * Configuración centralizada de Redes Sociales del PSG F7.
 * Modifica las URLs y handles aquí o mediante variables de entorno si se configuran.
 */
export const SOCIAL_LINKS: Record<"instagram" | "twitch" | "youtube", SocialLink> = {
  instagram: {
    id: "instagram",
    name: "Instagram",
    handle: "@psgf7_oficial",
    url: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://instagram.com/psgf7_oficial",
    description: "Fotos oficiales de partidos, convocatorias, mejores jugadas y la actualidad del vestuario en tiempo real.",
    badge: "Fotos & Reels",
    color: "#E1306C",
    hoverBorder: "hover:border-[#E1306C]/60",
    hoverText: "group-hover:text-[#E1306C]",
    ctaText: "Seguir en Instagram",
  },
  twitch: {
    id: "twitch",
    name: "Twitch",
    handle: "psgf7_tv",
    url: process.env.NEXT_PUBLIC_TWITCH_URL || "https://twitch.tv/psgf7_tv",
    description: "Retransmisiones en directo de nuestros partidos, tertulias con los jugadores y análisis táctico post-partido.",
    badge: "Directos en Vivo",
    color: "#9146FF",
    hoverBorder: "hover:border-[#9146FF]/60",
    hoverText: "group-hover:text-[#9146FF]",
    ctaText: "Ver Canal de Twitch",
  },
  youtube: {
    id: "youtube",
    name: "YouTube",
    handle: "@PSGFutbol7",
    url: process.env.NEXT_PUBLIC_YOUTUBE_URL || "https://youtube.com/@PSGFutbol7",
    description: "Resúmenes en alta definición, goles de la jornada, paradas decisivas y recopilatorios de la temporada.",
    badge: "Highlights & Goles",
    color: "#FF0000",
    hoverBorder: "hover:border-[#FF0000]/60",
    hoverText: "group-hover:text-[#FF0000]",
    ctaText: "Suscribirse al Canal",
  },
};

export const SOCIAL_LINKS_LIST: SocialLink[] = [
  SOCIAL_LINKS.instagram,
  SOCIAL_LINKS.twitch,
  SOCIAL_LINKS.youtube,
];

