import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { PlayerPosition, CompetitionType } from "./supabase/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMatchDate(dateString: string): string {
  if (!dateString) return "";
  try {
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return String(dateString);

    const formatter = new Intl.DateTimeFormat("es-ES", {
      timeZone: "Europe/Madrid",
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const map: Record<string, string> = {};
    parts.forEach((p) => {
      map[p.type] = p.value;
    });

    const weekday = map.weekday
      ? map.weekday.charAt(0).toUpperCase() + map.weekday.slice(1)
      : "";
    return `${weekday}, ${map.day} de ${map.month} · ${map.hour}:${map.minute} hs`;
  } catch {
    return String(dateString);
  }
}

export function formatShortDate(dateString: string): string {
  if (!dateString) return "";
  try {
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return String(dateString);

    const formatter = new Intl.DateTimeFormat("es-ES", {
      timeZone: "Europe/Madrid",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const map: Record<string, string> = {};
    parts.forEach((p) => {
      map[p.type] = p.value;
    });

    return `${map.day}/${map.month}/${map.year} · ${map.hour}:${map.minute}`;
  } catch {
    return String(dateString);
  }
}

export function getRelativeTime(dateString: string): string {
  try {
    const date =
      typeof dateString === "string"
        ? parseISO(dateString)
        : new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: es });
  } catch {
    return dateString;
  }
}

export function getPositionName(pos: PlayerPosition): string {
  switch (pos) {
    case "portero":
      return "Portero";
    case "defensa":
      return "Defensa";
    case "medio":
      return "Centrocampista";
    case "delantero":
      return "Delantero";
    case "entrenador":
      return "Entrenador";
    case "utillero":
      return "Utillero";
    default:
      return pos;
  }
}

export function getPositionShort(pos: PlayerPosition): string {
  switch (pos) {
    case "portero":
      return "POR";
    case "defensa":
      return "DEF";
    case "medio":
      return "MED";
    case "delantero":
      return "DEL";
    case "entrenador":
      return "DT";
    case "utillero":
      return "UTI";
    default:
      return pos;
  }
}

export const POSITION_ORDER: Record<PlayerPosition, number> = {
  entrenador: 1,
  utillero: 2,
  portero: 3,
  defensa: 4,
  medio: 5,
  delantero: 6,
};

export function sortPlayersByPositionAndDorsal<
  T extends { position: PlayerPosition; dorsal: number }
>(players: T[]): T[] {
  return [...players].sort((a, b) => {
    const posA = POSITION_ORDER[a.position] ?? 99;
    const posB = POSITION_ORDER[b.position] ?? 99;
    if (posA !== posB) {
      return posA - posB;
    }
    return (a.dorsal || 0) - (b.dorsal || 0);
  });
}

export function getPositionBadgeColor(pos: PlayerPosition): string {
  switch (pos) {
    case "portero":
      return "bg-amber-500/20 text-amber-300 border-amber-500/30";
    case "defensa":
      return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    case "medio":
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    case "delantero":
      return "bg-rose-500/20 text-rose-300 border-rose-500/30";
    case "entrenador":
      return "bg-purple-500/20 text-purple-300 border-purple-500/30";
    case "utillero":
      return "bg-teal-500/20 text-teal-300 border-teal-500/30";
    default:
      return "bg-slate-500/20 text-slate-300 border-slate-500/30";
  }
}

export function getCompetitionLabel(comp: CompetitionType): string {
  switch (comp) {
    case "liga":
      return "Liga F7";
    case "copa":
      return "Copa F7";
    case "amistoso":
      return "Amistoso";
    default:
      return comp;
  }
}

export function parsePhotoUrls(
  photoUrl?: string | null,
  photoUrls?: string[] | null
): string[] {
  if (Array.isArray(photoUrls) && photoUrls.length > 0) {
    return photoUrls
      .filter((u): u is string => typeof u === "string" && u.trim().length > 0)
      .map((u) => u.trim());
  }
  if (!photoUrl || typeof photoUrl !== "string") return [];

  const raw = photoUrl.trim();
  if (!raw) return [];

  if (raw.startsWith("[") && raw.endsWith("]")) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .filter(
            (item): item is string =>
              typeof item === "string" && item.trim().length > 0
          )
          .map((item) => item.trim());
      }
    } catch {
      // Not JSON, continue to string parsing
    }
  }

  // Split by newlines first
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const result: string[] = [];

  for (const line of lines) {
    if (line.includes("data:")) {
      if (line.startsWith("data:") && !line.slice(5).includes("data:")) {
        result.push(line);
      } else {
        const regex =
          /(data:[^;]+;base64,[A-Za-z0-9+/=]+|https?:\/\/[^\s,]+|\/[^\s,]+|[^\s,]+)/g;
        let match;
        while ((match = regex.exec(line)) !== null) {
          const item = match[0].trim();
          if (item && item !== ",") result.push(item);
        }
      }
    } else if (line.includes(",")) {
      const parts = line.split(",").map((p) => p.trim()).filter(Boolean);
      result.push(...parts);
    } else {
      result.push(line);
    }
  }

  return result.filter((u) => u.length > 0);
}

/**
 * Optimizes/compresses an image file before upload (creating a high-quality lightweight Data URL).
 * Keeps dimensions within maxWidth/maxHeight and outputs JPEG data URI for fast performance.
 */
export async function compressImageFile(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve("");
      return;
    }

    if (file.type === "image/svg+xml" || file.type === "image/gif") {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || "");
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) {
        resolve("");
        return;
      }

      const img = new Image();
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve(src);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        try {
          const isTransparentFormat =
            file.type === "image/png" ||
            file.type === "image/webp" ||
            file.name?.toLowerCase().endsWith(".png") ||
            file.name?.toLowerCase().endsWith(".webp");

          const formatType = isTransparentFormat ? "image/webp" : "image/jpeg";
          let compressedDataUrl = canvas.toDataURL(formatType, quality);

          if (!compressedDataUrl || compressedDataUrl === "data:,") {
            compressedDataUrl = canvas.toDataURL(
              isTransparentFormat ? "image/png" : "image/jpeg",
              quality
            );
          }
          resolve(compressedDataUrl || src);
        } catch {
          resolve(src);
        }
      };

      img.onerror = () => {
        resolve(src);
      };

      img.src = src;
    };

    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}


