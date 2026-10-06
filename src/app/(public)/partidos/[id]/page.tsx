import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Calendar,
  Shield,
  Flame,
  ArrowLeft,
  Users,
  Trophy,
  Award,
  Sparkles,
  FileSpreadsheet,
  MapPin,
  ExternalLink,
  Navigation,
} from "lucide-react";
import { getMatchById } from "@/lib/data";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PsgShield } from "@/components/ui/PsgShield";
import { RivalShield } from "@/components/ui/RivalShield";
import {
  formatMatchDate,
  getCompetitionLabel,
  cn,
  getPositionName,
  getPositionShort,
} from "@/lib/utils";

export const revalidate = 0;

interface MatchDetailPageProps {
  params: {
    id: string;
  };
}

export default async function MatchDetailPage({ params }: MatchDetailPageProps) {
  const match = await getMatchById(params.id);

  if (!match) {
    notFound();
  }

  const isPsgWin =
    match.is_finished &&
    match.psg_score !== null &&
    match.rival_score !== null &&
    match.psg_score > match.rival_score;

  const isPsgDraw =
    match.is_finished &&
    match.psg_score !== null &&
    match.rival_score !== null &&
    match.psg_score === match.rival_score;

  const isPsgLoss =
    match.is_finished &&
    match.psg_score !== null &&
    match.rival_score !== null &&
    match.psg_score < match.rival_score;

  const scorers = match.stats?.filter((s) => s.played && s.goals > 0) || [];
  const assistants = match.stats?.filter((s) => s.played && s.assists > 0) || [];
  const yellowCarded = match.stats?.filter((s) => s.played && s.yellow_cards > 0) || [];
  const redCarded = match.stats?.filter((s) => s.played && s.red_cards > 0) || [];
  const cleanSheetKeepers =
    match.stats?.filter(
      (s) => s.played && s.clean_sheet && s.player?.position === "portero"
    ) || [];
  const playedSquad = match.stats?.filter((s) => s.played) || [];

  return (
    <div className="container mx-auto max-w-4xl space-y-8 px-4 py-12 pb-28">
      {/* Back button */}
      <Link
        href="/partidos"
        className="inline-flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wider text-secondary transition-colors hover:text-primary focus-ring rounded-lg px-2 py-1"
      >
        <ArrowLeft className="h-4 w-4" /> Volver al Calendario & Resultados
      </Link>

      {/* Main Match Header Card */}
      <div className="relative space-y-6 overflow-hidden rounded-xl border border-white/10 bg-surface p-6 text-center shadow-xl inner-light sm:p-10">
        <div className="flex flex-col items-center justify-between gap-4 border-b border-white/10 pb-4 sm:flex-row">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={match.competition} dot>
              {getCompetitionLabel(match.competition)}
            </Badge>
            <span className="font-display text-xs font-bold uppercase text-secondary">
              {match.is_home ? "Local" : "Visitante"}
            </span>
            {match.field?.name && (
              <span className="inline-flex items-center gap-1 rounded bg-surface-elevated px-2 py-0.5 font-display text-[10px] font-bold uppercase text-accent-cyan">
                <MapPin className="h-3 w-3" />
                {match.field.name}
              </span>
            )}
          </div>

          <span className="font-display text-xs font-bold uppercase tracking-wider text-accent-cyan capitalize">
            {formatMatchDate(match.match_date)}
          </span>
        </div>

        {/* Head-to-Head Arena (Symmetric & Centered on all devices) */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 py-6 w-full">
          {/* PSG Side */}
          <div className="flex flex-col items-center justify-center text-center min-w-0 px-1">
            <div className="mb-2 flex h-16 w-16 sm:h-24 sm:w-24 items-center justify-center rounded-xl border border-accent-cyan/40 bg-surface-elevated p-2 shadow-glow-subtle">
              <PsgShield size="xl" />
            </div>
            <span className="w-full truncate font-display text-lg sm:text-3xl font-black uppercase text-primary">
              PSG F7
            </span>
            <span className="text-[10px] font-bold uppercase text-accent-cyan">
              {match.is_home ? "Local" : "Visitante"}
            </span>
          </div>

          {/* Center Scoreline / VS */}
          <div className="flex flex-shrink-0 flex-col items-center justify-center text-center px-1 sm:px-2 min-w-[70px] sm:min-w-[100px]">
            {match.is_finished ? (
              <div className="flex items-center gap-1.5 font-display text-3xl font-black text-primary sm:text-6xl">
                <span className={match.is_home ? "text-accent-cyan text-glow-subtle" : "text-primary"}>
                  {match.psg_score}
                </span>
                <span className="font-light text-muted">:</span>
                <span className={!match.is_home ? "text-accent-cyan text-glow-subtle" : "text-primary"}>
                  {match.rival_score}
                </span>
              </div>
            ) : (
              <span className="rounded-lg border border-white/10 bg-surface-elevated px-3 py-1 sm:px-4 sm:py-2 font-display text-xl sm:text-2xl font-black text-accent-cyan">
                VS
              </span>
            )}
          </div>

          {/* Rival Side */}
          <div className="flex flex-col items-center justify-center text-center min-w-0 px-1">
            <div className="mb-2 flex items-center justify-center">
              <RivalShield
                src={match.rival?.shield_url}
                name={match.rival?.name}
                size="xl"
              />
            </div>
            <span
              title={match.rival?.name || "Rival"}
              className="w-full truncate font-display text-lg sm:text-3xl font-black uppercase text-primary"
            >
              {match.rival?.name || "Rival"}
            </span>
            <span className="text-[10px] font-bold uppercase text-secondary">
              {!match.is_home ? "Local" : "Visitante"}
            </span>
          </div>
        </div>

        {/* Outcome banner */}
        {match.is_finished && (
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface-elevated px-4 py-1.5 font-display text-xs font-bold uppercase tracking-widest">
            <span
              className={cn(
                isPsgWin && "text-success",
                isPsgDraw && "text-warning",
                isPsgLoss && "text-danger"
              )}
            >
              {isPsgWin ? "Victoria Oficial del PSG F7" : isPsgDraw ? "Empate en el Marcador" : "Derrota"}
            </span>
          </div>
        )}
      </div>

      {/* Sede / Field Venue Card */}
      {match.field && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-white/10 bg-surface p-4 sm:p-5 inner-light">
          <div className="flex items-center gap-3.5 min-w-0 w-full sm:w-auto">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-accent-cyan/30 bg-surface-elevated text-accent-cyan shadow-glow-subtle">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block font-display text-base font-bold uppercase text-primary truncate">
                Sede: {match.field.name}
              </span>
              <span className="block text-xs text-secondary truncate">
                {match.field.address || "Instalaciones deportivas"}
              </span>
            </div>
          </div>

          {match.field.maps_url && (
            <a
              href={match.field.maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-accent-cyan/40 bg-accent-cyan/15 px-4 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-accent-cyan transition-all hover:bg-accent-cyan hover:text-black focus-ring flex-shrink-0"
            >
              <Navigation className="h-3.5 w-3.5" />
              <span>Abrir en Google Maps</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      )}

      {/* Match Events & Stats Section */}
      {match.is_finished ? (
        <div className="space-y-6">
          {/* Scorers and Assists */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4 rounded-xl border border-white/10 bg-surface p-6 inner-light">
              <h3 className="flex items-center gap-2 font-display text-xl font-bold uppercase text-accent-cyan">
                ⚽ Goleadores del Partido
              </h3>
              {scorers.length > 0 ? (
                <div className="space-y-2">
                  {scorers.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-surface-elevated/40 p-3 text-sm"
                    >
                      <span className="font-bold text-primary">
                        #{s.player?.dorsal} {s.player?.nickname} ({s.player?.first_name})
                      </span>
                      <span className="rounded bg-accent-cyan/15 px-3 py-1 font-display font-black text-accent-cyan text-sm">
                        {s.goals} {s.goals === 1 ? "Gol" : "Goles"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs italic text-muted">No se registraron goles en este partido.</p>
              )}
            </div>

            <div className="space-y-4 rounded-xl border border-white/10 bg-surface p-6 inner-light">
              <h3 className="flex items-center gap-2 font-display text-xl font-bold uppercase text-success">
                🎯 Asistencias de Gol
              </h3>
              {assistants.length > 0 ? (
                <div className="space-y-2">
                  {assistants.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-surface-elevated/40 p-3 text-sm"
                    >
                      <span className="font-bold text-primary">
                        #{s.player?.dorsal} {s.player?.nickname} ({s.player?.first_name})
                      </span>
                      <span className="rounded bg-success/15 px-3 py-1 font-display font-black text-success text-sm">
                        {s.assists} {s.assists === 1 ? "Asistencia" : "Asistencias"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs italic text-muted">Sin asistencias computadas.</p>
              )}
            </div>
          </div>

          {/* Full Lineup */}
          <div className="space-y-6 rounded-xl border border-white/10 bg-surface p-6 inner-light sm:p-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="flex items-center gap-2.5 font-display text-2xl font-bold uppercase text-primary">
                <Users className="h-5 w-5 text-accent-cyan" /> Convocatoria PSG F7 ({playedSquad.length} Jugadores)
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {playedSquad.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-surface-elevated/40 p-3"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-display text-sm font-bold text-accent-cyan flex-shrink-0">
                      {(s.player?.position === "entrenador" ||
                        s.player?.position === "utillero") &&
                      s.player?.dorsal === 0
                        ? s.player?.position === "entrenador"
                          ? "DT"
                          : "UTI"
                        : `#${s.player?.dorsal}`}
                    </span>
                    <span className="truncate text-sm font-bold text-primary">
                      {s.player?.nickname}
                    </span>
                  </div>
                  <Badge variant={s.player?.position} className="px-2 py-0.5 text-[9px] flex-shrink-0">
                    {getPositionShort(s.player?.position)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Empty State (DESIGN_SYSTEM Section 3.2) */
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-surface p-12 text-center">
          <Calendar className="h-12 w-12 text-muted" />
          <h3 className="mt-3 font-display text-2xl font-bold text-primary">Partido por Disputar</h3>
          <p className="mt-1 max-w-md text-sm text-secondary">
            El acta digital oficial y las estadísticas de los jugadores se cargarán al finalizar el partido.
          </p>
        </div>
      )}
    </div>
  );
}

