import React from "react";
import Link from "next/link";
import {
  Flame,
  Shield,
  Trophy,
  ChevronRight,
  Calendar,
  ArrowRight,
  Sparkles,
  Clock,
} from "lucide-react";
import {
  getNextMatch,
  getLastResult,
  getStatLeaders,
  getMatches,
  getPlayers,
  getCompetitions,
} from "@/lib/data";
import { CountdownTimer } from "@/components/public/CountdownTimer";
import { StatLeaders } from "@/components/public/StatLeaders";
import { MatchCard } from "@/components/public/MatchCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PsgShield } from "@/components/ui/PsgShield";
import { RivalShield } from "@/components/ui/RivalShield";
import { formatMatchDate, getCompetitionLabel } from "@/lib/utils";

export const revalidate = 0;

export default async function HomePage() {
  const nextMatch = await getNextMatch();
  const lastResult = await getLastResult();
  const leaders = await getStatLeaders();
  const allMatches = await getMatches();
  const allPlayers = await getPlayers();
  const competitions = await getCompetitions();

  const finishedMatches = allMatches.filter((m) => m.is_finished);
  const totalGoals = finishedMatches.reduce(
    (acc, m) => acc + (m.psg_score || 0),
    0
  );

  return (
    <div className="space-y-16 pb-24">
      {/* 1. MONUMENTAL HERO SECTION */}
      <section className="relative overflow-hidden border-b border-white/10 bg-stadium-spotlight py-16 md:py-24">
        {/* Background stadium lighting aura */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-[350px] w-[600px] -translate-x-1/2 rounded-full bg-accent-cyan/10 blur-[120px]" />
        <div className="pointer-events-none absolute left-1/4 top-1/4 h-[300px] w-[400px] rounded-full bg-accent-blue/15 blur-[100px]" />

        {/* Soccer Net Background Pattern */}
        <div className="bg-soccer-mesh pointer-events-none absolute inset-0 opacity-40" />

        {/* Tiger Claw Slash SVG Watermark (Section 3.3 of DESIGN_SYSTEM.md) */}
        <svg
          viewBox="0 0 100 100"
          fill="currentColor"
          className="pointer-events-none absolute -right-8 -top-8 h-80 w-80 text-accent-cyan opacity-5 md:h-96 md:w-96"
        >
          <path d="M20 5 C 32 35, 38 65, 12 95 C 26 70, 42 35, 28 5 Z" />
          <path d="M50 2 C 62 35, 68 70, 42 98 C 56 75, 72 38, 58 2 Z" />
          <path d="M80 12 C 92 40, 96 72, 74 96 C 86 75, 100 45, 88 12 Z" />
        </svg>

        <div className="container relative z-10 mx-auto max-w-5xl space-y-6 px-4 text-center">
          {/* Emblem Badge Pill */}
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl border border-accent-cyan/40 bg-surface-elevated/80 p-2 shadow-glow backdrop-blur-md transition-transform duration-300 hover:scale-105">
              <PsgShield size="xl" priority />
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent-cyan/40 bg-surface-elevated/90 px-4 py-1.5 font-display text-xs font-bold uppercase tracking-[0.2em] text-accent-cyan shadow-glow-subtle backdrop-blur-md">
              <Flame className="h-4 w-4 animate-pulse text-accent-cyan" />
              <span>Fuerza · Resurgimiento · Garra</span>
            </div>
          </div>

          {/* Monumental Headline */}
          <h1 className="font-display text-5xl font-black uppercase leading-none tracking-tight text-primary sm:text-7xl md:text-8xl">
            PSG <span className="text-glow-subtle text-accent-cyan">FÚTBOL 7</span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-2xl text-base font-medium leading-relaxed text-secondary sm:text-xl">
            El corazón de un equipo forjado en el compañerismo y la pasión. Sigue
            todos los partidos, clasificaciones y el rendimiento individual de
            cada jugador.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link href="/plantilla">
              <Button size="lg" className="text-base shadow-glow-subtle">
                Ver Plantilla Oficial <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/partidos">
              <Button variant="secondary" size="lg" className="text-base">
                <Calendar className="h-5 w-5 text-accent-cyan" /> Calendario &
                Actas
              </Button>
            </Link>
          </div>

          {/* Quick Stats Ticker Bar */}
          <div className="mx-auto grid max-w-3xl grid-cols-2 gap-4 pt-8 sm:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-surface p-4 inner-light backdrop-blur-md">
              <span className="block font-display text-xs font-bold uppercase tracking-wider text-secondary">
                Plantilla
              </span>
              <span className="font-display text-2xl font-bold text-primary">
                {allPlayers.length} Jugadores
              </span>
            </div>

            <div className="rounded-xl border border-white/10 bg-surface p-4 inner-light backdrop-blur-md">
              <span className="block font-display text-xs font-bold uppercase tracking-wider text-secondary">
                Partidos Jugados
              </span>
              <span className="text-glow-subtle font-display text-2xl font-bold text-accent-cyan">
                {finishedMatches.length} Jornadas
              </span>
            </div>

            <div className="rounded-xl border border-white/10 bg-surface p-4 inner-light backdrop-blur-md">
              <span className="block font-display text-xs font-bold uppercase tracking-wider text-secondary">
                Goles a Favor
              </span>
              <span className="font-display text-2xl font-bold text-success">
                {totalGoals} Goles
              </span>
            </div>

            <div className="rounded-xl border border-white/10 bg-surface p-4 inner-light backdrop-blur-md">
              <span className="block font-display text-xs font-bold uppercase tracking-wider text-secondary">
                Eficacia
              </span>
              <span className="font-display text-2xl font-bold text-warning">
                100% Pasión
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MATCHDAY HUD SECTION (Next Match + Recent Result) */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Próximo Partido Card */}
          <div className="relative flex select-none flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-surface p-6 inner-light sm:p-8">
            <div>
              <div className="mb-6 flex items-center justify-between gap-2 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-ping rounded-full bg-accent-cyan" />
                  <h3 className="font-display text-xs font-bold uppercase tracking-widest text-accent-cyan">
                    Próxima Cita Oficial
                  </h3>
                </div>
                {nextMatch && (
                  <Badge variant={nextMatch.competition_ref?.type || nextMatch.competition} dot>
                    {nextMatch.competition_ref?.name || getCompetitionLabel(nextMatch.competition)}
                  </Badge>
                )}
              </div>

              {nextMatch ? (
                <div className="space-y-6">
                  {/* Teams Row (Symmetric & Centered on all devices) */}
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 py-2 w-full">
                    {/* PSG Side */}
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3.5 min-w-0 text-center sm:text-left">
                      <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl border border-accent-cyan/40 bg-surface-elevated p-1 shadow-glow-subtle flex-shrink-0">
                        <PsgShield size="md" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate font-display text-lg sm:text-2xl font-bold text-primary">
                          PSG F7
                        </span>
                        <span className="font-display text-[10px] sm:text-xs font-bold uppercase tracking-wider text-accent-cyan">
                          {nextMatch.is_home ? "Local" : "Visitante"}
                        </span>
                      </div>
                    </div>

                    {/* VS Badge (Always Centered) */}
                    <div className="flex justify-center flex-shrink-0 px-1 sm:px-2 min-w-[50px] sm:min-w-[70px]">
                      <span className="rounded-lg border border-white/10 bg-surface-elevated px-2.5 py-1 sm:px-3 font-display text-xs sm:text-sm font-bold text-accent-cyan">
                        VS
                      </span>
                    </div>

                    {/* Rival Side */}
                    <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-3.5 min-w-0 text-center sm:text-right">
                      <div className="min-w-0 flex-1">
                        <span
                          title={nextMatch.rival?.name || "Rival"}
                          className="block truncate font-display text-lg sm:text-2xl font-bold text-primary"
                        >
                          {nextMatch.rival?.name || "Rival"}
                        </span>
                        <span className="font-display text-[10px] sm:text-xs font-bold uppercase tracking-wider text-secondary">
                          {!nextMatch.is_home ? "Local" : "Visitante"}
                        </span>
                      </div>
                      <div className="flex items-center justify-center flex-shrink-0">
                        <RivalShield
                          src={nextMatch.rival?.shield_url}
                          name={nextMatch.rival?.name}
                          size="md"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Match Date and Field */}
                  <div className="rounded-xl border border-white/10 bg-surface-elevated/40 p-4 text-center text-xs text-secondary">
                    <p className="font-display text-sm font-bold capitalize text-primary">
                      {formatMatchDate(nextMatch.match_date)}
                    </p>
                    <p className="mt-1 text-xs text-secondary">
                      Sede:{" "}
                      {nextMatch.field?.name ? (
                        <span className="text-primary font-semibold">
                          {nextMatch.field.name}
                          {nextMatch.field.address ? ` (${nextMatch.field.address})` : ""}
                        </span>
                      ) : nextMatch.is_home ? (
                        "Campo Principal PSG F7"
                      ) : (
                        "Instalaciones del Rival"
                      )}
                    </p>
                  </div>

                  {/* Countdown Timer */}
                  <div className="flex flex-col items-center pt-2">
                    <span className="mb-3 flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-widest text-secondary">
                      <Clock className="h-3.5 w-3.5 text-accent-cyan" /> Cuenta
                      atrás para el pitido inicial
                    </span>
                    <CountdownTimer targetDate={nextMatch.match_date} />
                  </div>
                </div>
              ) : (
                /* Empty State (DESIGN_SYSTEM Section 3.2) */
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="h-12 w-12 text-muted" />
                  <h4 className="mt-3 text-lg font-bold text-primary font-display">
                    No hay próximos partidos
                  </h4>
                  <p className="mt-1 text-sm text-secondary">
                    Actualmente no hay encuentros programados en el calendario.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end border-t border-white/10 pt-4">
              <Link
                href="/partidos"
                className="inline-flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wider text-accent-cyan transition-colors hover:text-primary"
              >
                Ver calendario completo de la temporada{" "}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Último Resultado Oficial */}
          <div className="relative flex select-none flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-surface p-6 inner-light sm:p-8">
            <div>
              <div className="mb-6 flex items-center justify-between gap-2 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-success" />
                  <h3 className="font-display text-xs font-bold uppercase tracking-widest text-primary">
                    Último Resultado Oficial
                  </h3>
                </div>
                {lastResult && (
                  <Badge variant={lastResult.competition_ref?.type || lastResult.competition} dot>
                    {lastResult.competition_ref?.name || getCompetitionLabel(lastResult.competition)}
                  </Badge>
                )}
              </div>

              {lastResult ? (
                <div className="space-y-4">
                  <MatchCard match={lastResult} />
                </div>
              ) : (
                /* Empty State (DESIGN_SYSTEM Section 3.2) */
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Trophy className="h-12 w-12 text-muted" />
                  <h4 className="mt-3 text-lg font-bold text-primary font-display">
                    Sin resultados registrados
                  </h4>
                  <p className="mt-1 text-sm text-secondary">
                    Aún no hay resultados de partidos registrados en el sistema.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end border-t border-white/10 pt-4">
              <Link
                href="/partidos"
                className="inline-flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wider text-secondary transition-colors hover:text-primary"
              >
                Historial completo de actas y marcadores{" "}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TROPHY AWARDS & STAT LEADERS */}
      <section className="container mx-auto px-4">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-1 inline-flex items-center gap-2 font-display text-xs font-bold uppercase tracking-widest text-warning">
              <Trophy className="h-4 w-4 text-warning" />
              <span>Rendimiento Individual</span>
            </div>
            <h2 className="font-display text-4xl font-bold uppercase tracking-tight text-primary sm:text-5xl">
              Cuadro de{" "}
              <span className="text-warning">Honor</span>
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/estadisticas">
              <Button size="sm" className="shadow-glow-subtle">
                <Trophy className="h-4 w-4" /> Ver Tablas y Rankings
              </Button>
            </Link>
            <Link href="/plantilla">
              <Button variant="outline" size="sm">
                Ver Plantilla
              </Button>
            </Link>
          </div>
        </div>

        <StatLeaders
          topScorer={leaders.topScorer}
          topAssistant={leaders.topAssistant}
          topKeeper={leaders.topKeeper}
          competitions={competitions}
        />
      </section>

      {/* 4. CLUB IDENTITY & VALUES */}
      <section className="container mx-auto px-4">
        <div className="relative mx-auto max-w-4xl space-y-6 overflow-hidden rounded-xl border border-white/10 bg-surface p-8 text-center inner-light sm:p-14">
          {/* Tiger Claw Slash SVG Watermark */}
          <svg
            viewBox="0 0 100 100"
            fill="currentColor"
            className="pointer-events-none absolute -right-4 -top-4 h-48 w-48 text-accent-cyan opacity-5"
          >
            <path d="M20 5 C 32 35, 38 65, 12 95 C 26 70, 42 35, 28 5 Z" />
            <path d="M50 2 C 62 35, 68 70, 42 98 C 56 75, 72 38, 58 2 Z" />
            <path d="M80 12 C 92 40, 96 72, 74 96 C 86 75, 100 45, 88 12 Z" />
          </svg>

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-accent-cyan/40 bg-surface-elevated p-1.5 shadow-glow-subtle">
            <PsgShield size="md" />
          </div>

          <h3 className="font-display text-3xl font-bold uppercase leading-tight tracking-tight text-primary sm:text-5xl">
            El Fénix Nunca se Rinde
          </h3>
          <p className="mx-auto max-w-xl text-sm font-medium leading-relaxed text-secondary sm:text-base">
            Fútbol 7 con identidad, entrega en cada balón dividido y
            el orgullo de competir juntos bajo los mismos colores.
          </p>

          <div className="pt-2">
            <Link href="/plantilla">
              <Button variant="gold" size="lg" className="text-base">
                <Sparkles className="h-4 w-4" /> Conoce la Plantilla 2026/27
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
