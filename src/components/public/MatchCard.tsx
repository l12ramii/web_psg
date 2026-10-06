"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Calendar,
  MapPin,
  Trophy,
  Flame,
  FileSpreadsheet,
  Users,
  Award,
  Sparkles,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { MatchWithRival, MatchDetail } from "@/lib/supabase/types";
import {
  formatMatchDate,
  getCompetitionLabel,
  cn,
  getPositionName,
  getPositionBadgeColor,
  getPositionShort,
} from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { PsgShield } from "@/components/ui/PsgShield";
import { RivalShield } from "@/components/ui/RivalShield";
import { getMatchById } from "@/lib/data";

interface MatchCardProps {
  match: MatchWithRival;
  showActaButton?: boolean;
}

export function MatchCard({ match, showActaButton = true }: MatchCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [matchDetail, setMatchDetail] = useState<MatchDetail | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

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

  const handleOpenActa = async () => {
    setShowModal(true);
    setLoadingStats(true);
    try {
      const detail = await getMatchById(match.id);
      setMatchDetail(detail);
    } catch {
      // Fallback
    } finally {
      setLoadingStats(false);
    }
  };

  // Group events from match detail
  const scorers =
    matchDetail?.stats?.filter((s) => s.played && s.goals > 0) || [];
  const assistants =
    matchDetail?.stats?.filter((s) => s.played && s.assists > 0) || [];
  const yellowCarded =
    matchDetail?.stats?.filter((s) => s.played && s.yellow_cards > 0) || [];
  const redCarded =
    matchDetail?.stats?.filter((s) => s.played && s.red_cards > 0) || [];
  const cleanSheetKeepers =
    matchDetail?.stats?.filter(
      (s) => s.played && s.clean_sheet && s.player?.position === "portero"
    ) || [];
  const playedSquad = matchDetail?.stats?.filter((s) => s.played) || [];

  return (
    <>
      <div
        onClick={handleOpenActa}
        className={cn(
          "group relative flex cursor-pointer select-none flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-surface p-4 sm:p-6 inner-light transition-all duration-200 ease-out hover:-translate-y-1 hover:border-accent-cyan/50 hover:shadow-glow-subtle",
          match.is_finished &&
            isPsgWin &&
            "border-success/30 hover:border-success/60 hover:shadow-glow-emerald",
          match.is_finished &&
            isPsgLoss &&
            "border-danger/30 hover:border-danger/60 hover:shadow-glow-crimson"
        )}
      >
        {/* Header Bar */}
        <div className="mb-4 flex items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <Badge variant={match.competition_ref?.type || match.competition} dot>
              {match.competition_ref?.name || getCompetitionLabel(match.competition)}
            </Badge>
            <span className="font-display text-xs font-bold uppercase tracking-wider text-secondary">
              {match.is_home ? "Local" : "Visitante"}
            </span>
            {match.field?.name && (
              <span className="inline-flex items-center gap-1 rounded bg-surface-elevated px-2 py-0.5 font-display text-[10px] font-bold uppercase text-accent-cyan truncate max-w-[140px] sm:max-w-none">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{match.field.name}</span>
              </span>
            )}
          </div>

          {match.is_finished ? (
            <span
              className={cn(
                "rounded-full border px-2.5 py-0.5 font-display text-[10px] font-bold uppercase tracking-widest flex-shrink-0",
                isPsgWin &&
                  "border-success/40 bg-success/15 text-success shadow-glow-emerald",
                isPsgDraw &&
                  "border-warning/40 bg-warning/15 text-warning shadow-glow-gold",
                isPsgLoss &&
                  "border-danger/40 bg-danger/15 text-danger shadow-glow-crimson"
              )}
            >
              {isPsgWin ? "Victoria PSG" : isPsgDraw ? "Empate" : "Derrota"}
            </span>
          ) : (
            <span className="rounded-full border border-accent-cyan/40 bg-accent-cyan/15 px-2.5 py-0.5 font-display text-[10px] font-bold uppercase tracking-widest text-accent-cyan shadow-glow-subtle flex-shrink-0">
              Próxima Jornada
            </span>
          )}
        </div>

        {/* Head-to-Head Arena Showcase (Symmetric & Centered on all devices) */}
        <div className="my-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-2 sm:gap-4">
          {/* Team 1 */}
          <div className="flex flex-col items-center justify-center text-center min-w-0 px-1">
            <div className="mb-2 transition-transform duration-200 group-hover:scale-105">
              {match.is_home ? (
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-surface-elevated p-2 shadow-inner sm:h-16 sm:w-16">
                  <PsgShield size="md" />
                </div>
              ) : (
                <RivalShield
                  src={match.rival?.shield_url}
                  name={match.rival?.name}
                  size="md"
                  className="h-14 w-14 sm:h-16 sm:w-16"
                />
              )}
            </div>
            <span
              title={match.is_home ? "PSG F7" : match.rival?.name || "Rival"}
              className="w-full truncate font-display text-sm font-bold uppercase tracking-wide text-primary sm:text-base md:text-lg"
            >
              {match.is_home ? "PSG F7" : match.rival?.name || "Rival"}
            </span>
          </div>

          {/* Center: Score or VS Badge (Always Strictly Centered) */}
          <div className="flex flex-shrink-0 flex-col items-center justify-center text-center px-1 sm:px-2 min-w-[68px] sm:min-w-[90px]">
            {match.is_finished ? (
              <div className="flex items-center gap-1 font-display text-2xl font-black text-primary sm:text-4xl">
                <span
                  className={
                    match.is_home
                      ? "text-glow-subtle text-accent-cyan"
                      : "text-primary"
                  }
                >
                  {match.is_home ? match.psg_score : match.rival_score}
                </span>
                <span className="font-light text-muted">:</span>
                <span
                  className={
                    !match.is_home
                      ? "text-glow-subtle text-accent-cyan"
                      : "text-primary"
                  }
                >
                  {!match.is_home ? match.psg_score : match.rival_score}
                </span>
              </div>
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-surface-elevated font-display text-xs font-bold text-accent-cyan">
                VS
              </div>
            )}
          </div>

          {/* Team 2 */}
          <div className="flex flex-col items-center justify-center text-center min-w-0 px-1">
            <div className="mb-2 transition-transform duration-200 group-hover:scale-105">
              {!match.is_home ? (
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-surface-elevated p-2 shadow-inner sm:h-16 sm:w-16">
                  <PsgShield size="md" />
                </div>
              ) : (
                <RivalShield
                  src={match.rival?.shield_url}
                  name={match.rival?.name}
                  size="md"
                  className="h-14 w-14 sm:h-16 sm:w-16"
                />
              )}
            </div>
            <span
              title={!match.is_home ? "PSG F7" : match.rival?.name || "Rival"}
              className="w-full truncate font-display text-sm font-bold uppercase tracking-wide text-primary sm:text-base md:text-lg"
            >
              {!match.is_home ? "PSG F7" : match.rival?.name || "Rival"}
            </span>
          </div>
        </div>

        {/* Match Date Footer & Click Trigger */}
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-secondary">
          <div className="flex items-center gap-1.5 min-w-0">
            <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-accent-cyan" />
            <span className="truncate capitalize">
              {formatMatchDate(match.match_date)}
            </span>
          </div>

          <div className="flex flex-shrink-0 items-center gap-1 font-display text-xs font-bold uppercase tracking-wider text-accent-cyan transition-colors group-hover:text-primary">
            <span>{match.is_finished ? "Ver Acta" : "Detalles"}</span>
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* DIGITAL MATCH SHEET MODAL (ACTA OFICIAL DIGITAL)           */}
      {/* ======================================================== */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          match.is_finished
            ? `Acta Oficial: PSG ${match.psg_score} - ${match.rival_score} ${match.rival?.name}`
            : `Ficha de Partido: PSG vs ${match.rival?.name}`
        }
      >
        <div className="space-y-6">
          {/* Match Scoreline Card - Symmetrical 3-Column Layout */}
          <div className="space-y-4 rounded-xl border border-white/10 bg-surface-elevated/40 p-4 sm:p-6 text-center">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 font-display text-xs font-bold uppercase tracking-wider text-secondary">
              <Badge variant={match.competition_ref?.type || match.competition} dot>
                {match.competition_ref?.name || getCompetitionLabel(match.competition)}
              </Badge>
              <span className="truncate ml-2">{formatMatchDate(match.match_date)}</span>
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 py-3">
              {/* Left Side: PSG */}
              <div className="flex flex-col items-center justify-center text-center min-w-0 px-1">
                <div className="mb-1.5 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl border border-accent-cyan/40 bg-surface-elevated p-1 shadow-glow-subtle">
                  <PsgShield size="md" />
                </div>
                <span className="w-full truncate font-display text-sm sm:text-lg font-bold text-primary">
                  PSG F7
                </span>
                <span className="text-[10px] font-bold uppercase text-accent-cyan">
                  {match.is_home ? "Local" : "Visitante"}
                </span>
              </div>

              {/* Center: Score or VS Badge (Always Centered) */}
              <div className="flex flex-shrink-0 flex-col items-center justify-center text-center px-1 sm:px-2 min-w-[70px] sm:min-w-[90px]">
                {match.is_finished ? (
                  <>
                    <div className="flex items-center gap-1.5 font-display text-3xl font-black tracking-wider text-primary sm:text-5xl">
                      <span className="text-glow-subtle text-accent-cyan">
                        {match.psg_score}
                      </span>
                      <span className="font-light text-muted">:</span>
                      <span>{match.rival_score}</span>
                    </div>
                    <span
                      className={cn(
                        "mt-1 rounded-full border px-2 py-0.5 font-display text-[9px] sm:text-[10px] font-bold uppercase whitespace-nowrap",
                        isPsgWin &&
                          "border-success/40 bg-success/15 text-success",
                        isPsgDraw &&
                          "border-warning/40 bg-warning/15 text-warning",
                        isPsgLoss &&
                          "border-danger/40 bg-danger/15 text-danger"
                      )}
                    >
                      {isPsgWin
                        ? "Victoria PSG"
                        : isPsgDraw
                          ? "Empate"
                          : "Derrota"}
                    </span>
                  </>
                ) : (
                  <div className="rounded-lg border border-white/10 bg-surface-elevated px-3 py-1 sm:px-4 sm:py-1.5 font-display text-xl sm:text-2xl font-black text-accent-cyan">
                    VS
                  </div>
                )}
              </div>

              {/* Right Side: Rival */}
              <div className="flex flex-col items-center justify-center text-center min-w-0 px-1">
                <div className="mb-1.5 flex items-center justify-center">
                  <RivalShield
                    src={match.rival?.shield_url}
                    name={match.rival?.name}
                    size="md"
                    className="h-12 w-12 sm:h-14 sm:w-14"
                  />
                </div>
                <span
                  title={match.rival?.name || "Rival"}
                  className="w-full truncate font-display text-sm sm:text-lg font-bold text-primary"
                >
                  {match.rival?.name || "Rival"}
                </span>
                <span className="text-[10px] font-bold uppercase text-secondary">
                  {!match.is_home ? "Local" : "Visitante"}
                </span>
              </div>
            </div>

            {/* Field / Sede location banner in modal */}
            {(matchDetail?.field || match.field) && (
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 border-t border-white/10 pt-2.5 text-xs text-secondary">
                <MapPin className="h-3.5 w-3.5 text-accent-cyan flex-shrink-0" />
                <span className="font-bold text-primary">{(matchDetail?.field || match.field)?.name}</span>
                {(matchDetail?.field || match.field)?.address && (
                  <span className="text-secondary text-[11px]">· {(matchDetail?.field || match.field)?.address}</span>
                )}
                {(matchDetail?.field || match.field)?.maps_url && (
                  <a
                    href={(matchDetail?.field || match.field)!.maps_url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-accent-cyan hover:underline text-[11px] ml-1"
                  >
                    <ExternalLink className="h-3 w-3" /> Google Maps
                  </a>
                )}
              </div>
            )}
          </div>

          {/* If Match is finished: Show detailed events & sheet */}
          {match.is_finished ? (
            <div className="space-y-5">
              {/* Goalscorers & Assists Section */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Goleadores */}
                <div className="space-y-2.5 rounded-xl border border-white/10 bg-surface-elevated/30 p-4">
                  <h4 className="flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wider text-accent-cyan">
                    ⚽ Goleadores del PSG
                  </h4>
                  {scorers.length > 0 ? (
                    <div className="space-y-1.5">
                      {scorers.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between border-b border-white/5 py-1 text-xs last:border-0"
                        >
                          <span className="font-bold text-primary">
                            #{s.player?.dorsal} {s.player?.nickname}
                          </span>
                          <span className="rounded bg-accent-cyan/15 px-2 py-0.5 font-display font-black text-accent-cyan">
                            {s.goals} {s.goals === 1 ? "Gol" : "Goles"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs italic text-muted">
                      Sin goles registrados en el acta.
                    </p>
                  )}
                </div>

                {/* Asistencias */}
                <div className="space-y-2.5 rounded-xl border border-white/10 bg-surface-elevated/30 p-4">
                  <h4 className="flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wider text-success">
                    🎯 Asistencias de Gol
                  </h4>
                  {assistants.length > 0 ? (
                    <div className="space-y-1.5">
                      {assistants.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between border-b border-white/5 py-1 text-xs last:border-0"
                        >
                          <span className="font-bold text-primary">
                            #{s.player?.dorsal} {s.player?.nickname}
                          </span>
                          <span className="rounded bg-success/15 px-2 py-0.5 font-display font-black text-success">
                            {s.assists}{" "}
                            {s.assists === 1 ? "Asistencia" : "Asistencias"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs italic text-muted">
                      Sin asistencias registradas.
                    </p>
                  )}
                </div>
              </div>

              {/* Disciplinary & Clean Sheet */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Clean Sheet */}
                <div className="space-y-2 rounded-xl border border-white/10 bg-surface-elevated/30 p-4">
                  <h4 className="flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wider text-warning">
                    🛡️ Portería a Cero
                  </h4>
                  {cleanSheetKeepers.length > 0 ? (
                    cleanSheetKeepers.map((s) => (
                      <div
                        key={s.id}
                        className="text-xs font-bold text-warning"
                      >
                        #{s.player?.dorsal} {s.player?.nickname} (Imbatible)
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted">
                      Goles encajados en el encuentro.
                    </p>
                  )}
                </div>

                {/* Cards */}
                <div className="space-y-2 rounded-xl border border-white/10 bg-surface-elevated/30 p-4">
                  <h4 className="flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wider text-secondary">
                    ⚠️ Amonestaciones & Tarjetas
                  </h4>
                  {yellowCarded.length > 0 || redCarded.length > 0 ? (
                    <div className="space-y-1 text-xs">
                      {yellowCarded.map((s) => (
                        <div
                          key={s.id}
                          className="font-semibold text-warning"
                        >
                          🟨 #{s.player?.dorsal} {s.player?.nickname} (
                          {s.yellow_cards} amarillas)
                        </div>
                      ))}
                      {redCarded.map((s) => (
                        <div key={s.id} className="font-bold text-danger">
                          🟥 #{s.player?.dorsal} {s.player?.nickname} (Tarjeta
                          Roja)
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-success">
                      Juego limpio, sin tarjetas sancionadas.
                    </p>
                  )}
                </div>
              </div>

              {/* Complete Lineup / Convocados */}
              <div className="space-y-3 border-t border-white/10 pt-4">
                <div className="flex items-center justify-between">
                  <h4 className="flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wider text-primary">
                    <Users className="h-4 w-4 text-accent-cyan" /> Convocatoria
                    Oficial ({playedSquad.length} Jugadores)
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {playedSquad.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-surface-elevated/50 p-2.5 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-display font-bold text-accent-cyan flex-shrink-0">
                          {(s.player?.position === "entrenador" ||
                            s.player?.position === "utillero") &&
                          s.player?.dorsal === 0
                            ? s.player?.position === "entrenador"
                              ? "DT"
                              : "UTI"
                            : `#${s.player?.dorsal}`}
                        </span>
                        <span className="max-w-[100px] truncate font-medium text-primary">
                          {s.player?.nickname}
                        </span>
                      </div>
                      <Badge
                        variant={s.player?.position}
                        className="px-1.5 py-0 text-[9px] flex-shrink-0"
                      >
                        {getPositionShort(s.player?.position)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2 rounded-xl bg-surface-elevated/30 p-6 text-center">
              <Calendar className="mx-auto h-10 w-10 text-accent-cyan opacity-80" />
              <h4 className="font-display text-lg font-bold text-primary">
                Partido Programado
              </h4>
              <p className="mx-auto max-w-sm text-xs text-secondary">
                El acta oficial y las estadísticas individuales se publicarán
                una vez finalizado el encuentro.
              </p>
            </div>
          )}

          {/* Admin Edit Shortcut Footer */}
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <span className="text-xs text-muted">
              PSG Fútbol 7 · Acta Digital
            </span>
            <Link href={`/admin/partidos/${match.id}/acta`}>
              <Button variant="outline" size="sm">
                <FileSpreadsheet className="h-3.5 w-3.5" /> Editar en Backoffice
                CM
              </Button>
            </Link>
          </div>
        </div>
      </Modal>
    </>
  );
}
