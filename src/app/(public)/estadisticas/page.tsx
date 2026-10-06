"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Trophy,
  Target,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Search,
  Loader2,
  Users,
  Award,
  ChevronRight,
  TrendingUp,
  Flame,
  User,
  Shield,
  Zap,
} from "lucide-react";
import { getPlayerStatsSummary, getCompetitions } from "@/lib/data";
import { PlayerStatsSummary, Competition } from "@/lib/supabase/types";
import { getPositionName, parsePhotoUrls, getCompetitionLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { PlayerPhotoCarousel } from "@/components/public/PlayerPhotoCarousel";
import { CompetitionSelector } from "@/components/public/CompetitionSelector";

type StatTab = "resumen" | "pichichi" | "asistencias" | "zamora" | "tarjetas";

export default function EstadisticasPage() {
  const [stats, setStats] = useState<PlayerStatsSummary[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [competitionFilter, setCompetitionFilter] = useState<string>("todas");
  const [activeTab, setActiveTab] = useState<StatTab>("resumen");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerStatsSummary | null>(null);

  useEffect(() => {
    Promise.all([
      getPlayerStatsSummary(competitionFilter),
      getCompetitions(),
    ])
      .then(([statsData, compsData]) => {
        setStats(statsData);
        setCompetitions(compsData);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [competitionFilter]);

  const handleCompetitionChange = (newComp: string) => {
    setCompetitionFilter(newComp);
    setLoading(true);
    getPlayerStatsSummary(newComp)
      .then((data) => {
        setStats(data);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Filtrar jugadores según búsqueda
  const matchesSearch = (player: PlayerStatsSummary) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      player.nickname?.toLowerCase().includes(q) ||
      player.first_name?.toLowerCase().includes(q) ||
      player.last_name?.toLowerCase().includes(q) ||
      String(player.dorsal).includes(q) ||
      player.position?.toLowerCase().includes(q)
    );
  };

  // Filtrar jugadores de campo y plantilla activa para rankings
  const activePlayers = stats.filter((p) => p.is_active && matchesSearch(p));
  const playersOnly = activePlayers.filter(
    (p) => p.position !== "entrenador" && p.position !== "utillero"
  );
  const goalkeepers = activePlayers.filter((p) => p.position === "portero");

  // Rankings calculados
  // 1. Pichichi (Goles DESC, luego PJ ASC, luego Asistencias DESC)
  const pichichiList = [...playersOnly]
    .sort((a, b) => {
      if (b.total_goals !== a.total_goals) return b.total_goals - a.total_goals;
      if (b.total_assists !== a.total_assists) return b.total_assists - a.total_assists;
      return a.matches_played - b.matches_played;
    });

  // 2. Asistencias (Asistencias DESC, luego PJ ASC, luego Goles DESC)
  const assistsList = [...playersOnly]
    .sort((a, b) => {
      if (b.total_assists !== a.total_assists) return b.total_assists - a.total_assists;
      if (b.total_goals !== a.total_goals) return b.total_goals - a.total_goals;
      return a.matches_played - b.matches_played;
    });

  // 3. Zamora (Porterías a cero DESC, luego menor promedio de goles encajados)
  const zamoraList = [...goalkeepers]
    .sort((a, b) => {
      if (b.total_clean_sheets !== a.total_clean_sheets) {
        return b.total_clean_sheets - a.total_clean_sheets;
      }
      const avgA = a.matches_played > 0 ? (a.goals_conceded || 0) / a.matches_played : 999;
      const avgB = b.matches_played > 0 ? (b.goals_conceded || 0) / b.matches_played : 999;
      return avgA - avgB;
    });

  // 4. Tarjetas / Disciplina (Total tarjetas ponderadas: rojas x3 + amarillas x1)
  const cardsList = [...activePlayers]
    .map((p) => ({
      ...p,
      penaltyPoints: p.total_red_cards * 3 + p.total_yellow_cards,
      totalCards: p.total_red_cards + p.total_yellow_cards,
    }))
    .sort((a, b) => {
      if (b.penaltyPoints !== a.penaltyPoints) return b.penaltyPoints - a.penaltyPoints;
      return b.total_yellow_cards - a.total_yellow_cards;
    });

  // Resumen de líderes
  const topScorer = pichichiList[0];
  const topAssistant = assistsList[0];
  const topKeeper = zamoraList[0];
  const mostCarded = cardsList.filter((p) => p.totalCards > 0)[0];

  const currentCompetitionObj = competitions.find((c) => c.id === competitionFilter);
  const currentCompLabel = currentCompetitionObj
    ? currentCompetitionObj.name
    : competitionFilter === "todas"
    ? "Todas las Competiciones"
    : getCompetitionLabel(competitionFilter as any);

  return (
    <div className="container mx-auto space-y-12 px-4 py-12 pb-28">
      {/* Header Banner */}
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent-cyan/40 bg-surface-elevated/90 px-4 py-1.5 font-display text-xs font-bold uppercase tracking-widest text-accent-cyan shadow-glow-subtle">
          <Trophy className="h-3.5 w-3.5 text-warning" /> Estadísticas Oficiales · Temporada 2026/27
        </div>
        <h1 className="font-display text-4xl font-black uppercase tracking-tight text-primary sm:text-6xl">
          Rendimiento & <span className="text-glow-subtle text-accent-cyan">Estadísticas</span>
        </h1>
        <p className="mx-auto max-w-xl text-sm font-medium text-secondary sm:text-base">
          Consulta la tabla de goleadores (Pichichi), máximos asistentes, trofeo Zamora de porteros y el registro disciplinario del PSG F7.
        </p>
      </div>

      {/* Control Panel: Filters, Tabs, and Search */}
      <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-surface p-4 inner-light backdrop-blur-md">
        <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
          {/* Category Tabs */}
          <div className="flex w-full flex-wrap sm:flex-nowrap items-center gap-1.5 rounded-xl border border-white/10 bg-surface-elevated/60 p-1.5 lg:w-auto max-w-full overflow-x-auto">
            <button
              onClick={() => setActiveTab("resumen")}
              className={`flex flex-1 sm:flex-initial items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 font-display text-xs font-bold uppercase tracking-wider transition-all duration-200 focus-ring ${
                activeTab === "resumen"
                  ? "border border-accent-cyan/40 bg-surface-elevated text-primary shadow-glow-subtle"
                  : "text-secondary hover:bg-surface-elevated/60 hover:text-primary"
              }`}
            >
              <Trophy className="h-3.5 w-3.5 text-warning" />
              <span>Resumen</span>
            </button>

            <button
              onClick={() => setActiveTab("pichichi")}
              className={`flex flex-1 sm:flex-initial items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 font-display text-xs font-bold uppercase tracking-wider transition-all duration-200 focus-ring ${
                activeTab === "pichichi"
                  ? "border border-accent-cyan/40 bg-surface-elevated text-primary shadow-glow-subtle"
                  : "text-secondary hover:bg-surface-elevated/60 hover:text-primary"
              }`}
            >
              <Target className="h-3.5 w-3.5 text-accent-cyan" />
              <span>Goleadores (Pichichi)</span>
            </button>

            <button
              onClick={() => setActiveTab("asistencias")}
              className={`flex flex-1 sm:flex-initial items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 font-display text-xs font-bold uppercase tracking-wider transition-all duration-200 focus-ring ${
                activeTab === "asistencias"
                  ? "border border-accent-cyan/40 bg-surface-elevated text-primary shadow-glow-subtle"
                  : "text-secondary hover:bg-surface-elevated/60 hover:text-primary"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-success" />
              <span>Asistencias</span>
            </button>

            <button
              onClick={() => setActiveTab("zamora")}
              className={`flex flex-1 sm:flex-initial items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 font-display text-xs font-bold uppercase tracking-wider transition-all duration-200 focus-ring ${
                activeTab === "zamora"
                  ? "border border-accent-cyan/40 bg-surface-elevated text-primary shadow-glow-subtle"
                  : "text-secondary hover:bg-surface-elevated/60 hover:text-primary"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-warning" />
              <span>Trofeo Zamora</span>
            </button>

            <button
              onClick={() => setActiveTab("tarjetas")}
              className={`flex flex-1 sm:flex-initial items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 font-display text-xs font-bold uppercase tracking-wider transition-all duration-200 focus-ring ${
                activeTab === "tarjetas"
                  ? "border border-accent-cyan/40 bg-surface-elevated text-primary shadow-glow-subtle"
                  : "text-secondary hover:bg-surface-elevated/60 hover:text-primary"
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5 text-danger" />
              <span>Tarjetas</span>
            </button>
          </div>

          {/* Right Controls: Competition Filter and Live Search */}
          <div className="flex w-full flex-col items-center gap-3 sm:flex-row lg:w-auto">
            <CompetitionSelector
              competitions={competitions}
              value={competitionFilter}
              onChange={handleCompetitionChange}
              className="w-full sm:w-64"
            />

            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Buscar jugador..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-surface-elevated/60 py-2 pl-10 pr-4 text-xs font-medium text-primary placeholder-muted transition-colors focus-ring focus:border-accent-cyan focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Filter Breadcrumb / Active scope indicator */}
        <div className="flex items-center justify-between border-t border-white/5 pt-3 text-xs text-secondary">
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold uppercase tracking-wider text-muted">
              Mostrando datos para:
            </span>
            <span className="rounded-md border border-accent-cyan/30 bg-accent-cyan/10 px-2 py-0.5 font-display text-xs font-bold text-accent-cyan">
              {currentCompLabel}
            </span>
          </div>
          <span className="font-display font-bold uppercase tracking-wider text-muted">
            {activePlayers.length} Jugadores analizados
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-surface py-24 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-accent-cyan" />
          <p className="mt-4 font-display text-sm font-bold uppercase tracking-wider text-secondary">
            Calculando estadísticas oficiales...
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* TAB 1: RESUMEN GENERAL (Top Cards + Compact Tables) */}
          {activeTab === "resumen" && (
            <div className="space-y-10">
              {/* Top Leader Showcase Cards */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Pichichi Leader */}
                <div
                  onClick={() => topScorer && setSelectedPlayer(topScorer)}
                  className="group relative flex cursor-pointer select-none flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-surface p-6 inner-light transition-all duration-200 hover:-translate-y-1 hover:border-accent-cyan/50 hover:shadow-glow-subtle"
                >
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent-cyan/30 bg-surface-elevated text-accent-cyan shadow-glow-subtle">
                          <Target className="h-4 w-4" />
                        </div>
                        <h4 className="font-display text-sm font-bold uppercase tracking-wide text-primary">
                          Máximo Goleador
                        </h4>
                      </div>
                      <span className="rounded-full border border-accent-cyan/40 bg-accent-cyan/15 px-2 py-0.5 font-display text-[10px] font-bold text-accent-cyan">
                        PICHICHI
                      </span>
                    </div>

                    <div className="my-3 flex items-center gap-4">
                      <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-surface-elevated">
                        {topScorer && parsePhotoUrls(topScorer.photo_url)[0] ? (
                          <img
                            src={parsePhotoUrls(topScorer.photo_url)[0]}
                            alt={topScorer.nickname}
                            className="h-full w-full object-cover object-top transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <User className="h-8 w-8 text-muted" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-display text-xs font-bold text-accent-cyan">
                          {topScorer ? `#${topScorer.dorsal}` : "#--"}
                        </span>
                        <h5 className="truncate font-display text-xl font-bold uppercase text-primary group-hover:text-accent-cyan">
                          {topScorer?.nickname || "Sin datos"}
                        </h5>
                        <p className="truncate text-xs text-secondary">
                          {topScorer ? `${topScorer.first_name} ${topScorer.last_name || ""}` : "--"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-baseline justify-between border-t border-white/10 pt-4">
                    <span className="font-display text-xs font-bold uppercase tracking-wider text-secondary">
                      Goles Totales
                    </span>
                    <span className="font-display text-4xl font-black text-accent-cyan text-glow-subtle">
                      {topScorer?.total_goals ?? 0}
                    </span>
                  </div>
                </div>

                {/* Assists Leader */}
                <div
                  onClick={() => topAssistant && setSelectedPlayer(topAssistant)}
                  className="group relative flex cursor-pointer select-none flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-surface p-6 inner-light transition-all duration-200 hover:-translate-y-1 hover:border-success/50 hover:shadow-glow-emerald"
                >
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-success/30 bg-surface-elevated text-success shadow-inner">
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <h4 className="font-display text-sm font-bold uppercase tracking-wide text-primary">
                          Máximo Asistente
                        </h4>
                      </div>
                      <span className="rounded-full border border-success/40 bg-success/15 px-2 py-0.5 font-display text-[10px] font-bold text-success">
                        PLAYMAKER
                      </span>
                    </div>

                    <div className="my-3 flex items-center gap-4">
                      <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-surface-elevated">
                        {topAssistant && parsePhotoUrls(topAssistant.photo_url)[0] ? (
                          <img
                            src={parsePhotoUrls(topAssistant.photo_url)[0]}
                            alt={topAssistant.nickname}
                            className="h-full w-full object-cover object-top transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <User className="h-8 w-8 text-muted" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-display text-xs font-bold text-success">
                          {topAssistant ? `#${topAssistant.dorsal}` : "#--"}
                        </span>
                        <h5 className="truncate font-display text-xl font-bold uppercase text-primary group-hover:text-success">
                          {topAssistant?.nickname || "Sin datos"}
                        </h5>
                        <p className="truncate text-xs text-secondary">
                          {topAssistant ? `${topAssistant.first_name} ${topAssistant.last_name || ""}` : "--"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-baseline justify-between border-t border-white/10 pt-4">
                    <span className="font-display text-xs font-bold uppercase tracking-wider text-secondary">
                      Asistencias
                    </span>
                    <span className="font-display text-4xl font-black text-success">
                      {topAssistant?.total_assists ?? 0}
                    </span>
                  </div>
                </div>

                {/* Zamora Leader */}
                <div
                  onClick={() => topKeeper && setSelectedPlayer(topKeeper)}
                  className="group relative flex cursor-pointer select-none flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-surface p-6 inner-light transition-all duration-200 hover:-translate-y-1 hover:border-warning/50 hover:shadow-glow-gold"
                >
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-warning/30 bg-surface-elevated text-warning shadow-inner">
                          <ShieldCheck className="h-4 w-4" />
                        </div>
                        <h4 className="font-display text-sm font-bold uppercase tracking-wide text-primary">
                          Guante de Oro
                        </h4>
                      </div>
                      <span className="rounded-full border border-warning/40 bg-warning/15 px-2 py-0.5 font-display text-[10px] font-bold text-warning">
                        ZAMORA
                      </span>
                    </div>

                    <div className="my-3 flex items-center gap-4">
                      <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-surface-elevated">
                        {topKeeper && parsePhotoUrls(topKeeper.photo_url)[0] ? (
                          <img
                            src={parsePhotoUrls(topKeeper.photo_url)[0]}
                            alt={topKeeper.nickname}
                            className="h-full w-full object-cover object-top transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <User className="h-8 w-8 text-muted" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-display text-xs font-bold text-warning">
                          {topKeeper ? `#${topKeeper.dorsal}` : "#--"}
                        </span>
                        <h5 className="truncate font-display text-xl font-bold uppercase text-primary group-hover:text-warning">
                          {topKeeper?.nickname || "Sin datos"}
                        </h5>
                        <p className="truncate text-xs text-secondary">
                          {topKeeper ? `${topKeeper.first_name} ${topKeeper.last_name || ""}` : "--"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-baseline justify-between border-t border-white/10 pt-4">
                    <span className="font-display text-xs font-bold uppercase tracking-wider text-secondary">
                      Porterías a Cero
                    </span>
                    <span className="font-display text-4xl font-black text-warning">
                      {topKeeper?.total_clean_sheets ?? 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Two Column Grid with Pichichi and Assists Summaries */}
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Pichichi Quick Table */}
                <div className="space-y-4 rounded-xl border border-white/10 bg-surface p-6 inner-light">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-accent-cyan" />
                      <h3 className="font-display text-lg font-bold uppercase tracking-wide text-primary">
                        Top Goleadores
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab("pichichi")}
                      className="font-display text-xs font-bold uppercase tracking-wider text-accent-cyan hover:underline"
                    >
                      Ver todos
                    </button>
                  </div>

                  <div className="divide-y divide-white/5">
                    {pichichiList.slice(0, 5).map((player, idx) => (
                      <PlayerStatRow
                        key={player.player_id}
                        rank={idx + 1}
                        player={player}
                        mainStat={player.total_goals}
                        mainLabel="goles"
                        subStat={`${player.matches_played} PJ`}
                        accentColor="text-accent-cyan"
                        onSelect={() => setSelectedPlayer(player)}
                      />
                    ))}
                    {pichichiList.length === 0 && (
                      <p className="py-6 text-center text-xs text-secondary">
                        No hay registros de goles para esta competición.
                      </p>
                    )}
                  </div>
                </div>

                {/* Assists Quick Table */}
                <div className="space-y-4 rounded-xl border border-white/10 bg-surface p-6 inner-light">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-success" />
                      <h3 className="font-display text-lg font-bold uppercase tracking-wide text-primary">
                        Top Asistentes
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab("asistencias")}
                      className="font-display text-xs font-bold uppercase tracking-wider text-success hover:underline"
                    >
                      Ver todos
                    </button>
                  </div>

                  <div className="divide-y divide-white/5">
                    {assistsList.slice(0, 5).map((player, idx) => (
                      <PlayerStatRow
                        key={player.player_id}
                        rank={idx + 1}
                        player={player}
                        mainStat={player.total_assists}
                        mainLabel="asist."
                        subStat={`${player.matches_played} PJ`}
                        accentColor="text-success"
                        onSelect={() => setSelectedPlayer(player)}
                      />
                    ))}
                    {assistsList.length === 0 && (
                      <p className="py-6 text-center text-xs text-secondary">
                        No hay registros de asistencias para esta competición.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TABLA PICHICHI COMPLETA */}
          {activeTab === "pichichi" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-primary">
                    Tabla de Goleadores (Pichichi)
                  </h3>
                  <p className="text-xs text-secondary">
                    Clasificación oficial por número de goles marcados.
                  </p>
                </div>
                <Badge variant="liga" dot>
                  {pichichiList.length} Jugadores
                </Badge>
              </div>

              <div className="overflow-hidden rounded-xl border border-white/10 bg-surface shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-white/10 bg-surface-elevated/80 font-display text-xs font-bold uppercase tracking-wider text-secondary">
                      <tr>
                        <th className="px-4 py-3 text-center w-12">#</th>
                        <th className="px-4 py-3">Jugador</th>
                        <th className="px-4 py-3 text-center hidden sm:table-cell">Posición</th>
                        <th className="px-4 py-3 text-center">Partidos (PJ)</th>
                        <th className="px-4 py-3 text-center">Goles</th>
                        <th className="px-4 py-3 text-center hidden md:table-cell">Promedio (G/PJ)</th>
                        <th className="px-4 py-3 text-center hidden sm:table-cell">Asistencias</th>
                        <th className="px-4 py-3 text-right">Ficha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm font-medium">
                      {pichichiList.map((player, idx) => {
                        const ratio =
                          player.matches_played > 0
                            ? (player.total_goals / player.matches_played).toFixed(2)
                            : "0.00";
                        return (
                          <tr
                            key={player.player_id}
                            onClick={() => setSelectedPlayer(player)}
                            className="cursor-pointer transition-colors hover:bg-surface-elevated/60"
                          >
                            <td className="px-4 py-3.5 text-center">
                              <RankBadge rank={idx + 1} />
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-white/10 bg-surface-elevated">
                                  {parsePhotoUrls(player.photo_url)[0] ? (
                                    <img
                                      src={parsePhotoUrls(player.photo_url)[0]}
                                      alt={player.nickname}
                                      className="h-full w-full object-cover object-top"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-muted">
                                      <User className="h-5 w-5" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-display text-sm font-bold uppercase text-primary">
                                      {player.nickname}
                                    </span>
                                    <span className="font-display text-xs font-bold text-accent-cyan">
                                      #{player.dorsal}
                                    </span>
                                  </div>
                                  <p className="truncate text-xs text-secondary">
                                    {player.first_name} {player.last_name || ""}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-center hidden sm:table-cell">
                              <Badge variant={player.position}>
                                {getPositionName(player.position)}
                              </Badge>
                            </td>
                            <td className="px-4 py-3.5 text-center font-display text-sm font-bold text-secondary">
                              {player.matches_played}
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <span className="font-display text-lg font-black text-accent-cyan">
                                {player.total_goals}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-center font-display text-xs font-bold text-secondary hidden md:table-cell">
                              {ratio}
                            </td>
                            <td className="px-4 py-3.5 text-center font-display text-sm font-bold text-secondary hidden sm:table-cell">
                              {player.total_assists}
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                                Ver <ChevronRight className="ml-1 h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                      {pichichiList.length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-secondary">
                            No hay datos para los filtros seleccionados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TABLA ASISTENCIAS COMPLETA */}
          {activeTab === "asistencias" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-primary">
                    Tabla de Máximos Asistentes (Playmakers)
                  </h3>
                  <p className="text-xs text-secondary">
                    Clasificación oficial de pases de gol y creación de jugadas.
                  </p>
                </div>
                <Badge variant="copa" dot>
                  {assistsList.length} Jugadores
                </Badge>
              </div>

              <div className="overflow-hidden rounded-xl border border-white/10 bg-surface shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-white/10 bg-surface-elevated/80 font-display text-xs font-bold uppercase tracking-wider text-secondary">
                      <tr>
                        <th className="px-4 py-3 text-center w-12">#</th>
                        <th className="px-4 py-3">Jugador</th>
                        <th className="px-4 py-3 text-center hidden sm:table-cell">Posición</th>
                        <th className="px-4 py-3 text-center">Partidos (PJ)</th>
                        <th className="px-4 py-3 text-center">Asistencias</th>
                        <th className="px-4 py-3 text-center hidden md:table-cell">Promedio (A/PJ)</th>
                        <th className="px-4 py-3 text-center hidden sm:table-cell">Goles</th>
                        <th className="px-4 py-3 text-right">Ficha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm font-medium">
                      {assistsList.map((player, idx) => {
                        const ratio =
                          player.matches_played > 0
                            ? (player.total_assists / player.matches_played).toFixed(2)
                            : "0.00";
                        return (
                          <tr
                            key={player.player_id}
                            onClick={() => setSelectedPlayer(player)}
                            className="cursor-pointer transition-colors hover:bg-surface-elevated/60"
                          >
                            <td className="px-4 py-3.5 text-center">
                              <RankBadge rank={idx + 1} />
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-white/10 bg-surface-elevated">
                                  {parsePhotoUrls(player.photo_url)[0] ? (
                                    <img
                                      src={parsePhotoUrls(player.photo_url)[0]}
                                      alt={player.nickname}
                                      className="h-full w-full object-cover object-top"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-muted">
                                      <User className="h-5 w-5" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-display text-sm font-bold uppercase text-primary">
                                      {player.nickname}
                                    </span>
                                    <span className="font-display text-xs font-bold text-success">
                                      #{player.dorsal}
                                    </span>
                                  </div>
                                  <p className="truncate text-xs text-secondary">
                                    {player.first_name} {player.last_name || ""}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-center hidden sm:table-cell">
                              <Badge variant={player.position}>
                                {getPositionName(player.position)}
                              </Badge>
                            </td>
                            <td className="px-4 py-3.5 text-center font-display text-sm font-bold text-secondary">
                              {player.matches_played}
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <span className="font-display text-lg font-black text-success">
                                {player.total_assists}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-center font-display text-xs font-bold text-secondary hidden md:table-cell">
                              {ratio}
                            </td>
                            <td className="px-4 py-3.5 text-center font-display text-sm font-bold text-secondary hidden sm:table-cell">
                              {player.total_goals}
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                                Ver <ChevronRight className="ml-1 h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                      {assistsList.length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-secondary">
                            No hay datos para los filtros seleccionados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TABLA TROFEO ZAMORA COMPLETA */}
          {activeTab === "zamora" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-primary">
                    Trofeo Zamora (Portería PSG)
                  </h3>
                  <p className="text-xs text-secondary">
                    Rendimiento de los porteros bajo palos: imbatibilidad y goles encajados.
                  </p>
                </div>
                <Badge variant="portero" dot>
                  {zamoraList.length} Porteros
                </Badge>
              </div>

              <div className="overflow-hidden rounded-xl border border-white/10 bg-surface shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-white/10 bg-surface-elevated/80 font-display text-xs font-bold uppercase tracking-wider text-secondary">
                      <tr>
                        <th className="px-4 py-3 text-center w-12">#</th>
                        <th className="px-4 py-3">Portero</th>
                        <th className="px-4 py-3 text-center">Partidos (PJ)</th>
                        <th className="px-4 py-3 text-center">Porterías a Cero</th>
                        <th className="px-4 py-3 text-center">Goles Encajados</th>
                        <th className="px-4 py-3 text-center hidden md:table-cell">Promedio Coef.</th>
                        <th className="px-4 py-3 text-right">Ficha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm font-medium">
                      {zamoraList.map((player, idx) => {
                        const ratio =
                          player.matches_played > 0
                            ? ((player.goals_conceded || 0) / player.matches_played).toFixed(2)
                            : "0.00";
                        return (
                          <tr
                            key={player.player_id}
                            onClick={() => setSelectedPlayer(player)}
                            className="cursor-pointer transition-colors hover:bg-surface-elevated/60"
                          >
                            <td className="px-4 py-3.5 text-center">
                              <RankBadge rank={idx + 1} />
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-white/10 bg-surface-elevated">
                                  {parsePhotoUrls(player.photo_url)[0] ? (
                                    <img
                                      src={parsePhotoUrls(player.photo_url)[0]}
                                      alt={player.nickname}
                                      className="h-full w-full object-cover object-top"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-muted">
                                      <User className="h-5 w-5" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-display text-sm font-bold uppercase text-primary">
                                      {player.nickname}
                                    </span>
                                    <span className="font-display text-xs font-bold text-warning">
                                      #{player.dorsal}
                                    </span>
                                  </div>
                                  <p className="truncate text-xs text-secondary">
                                    {player.first_name} {player.last_name || ""}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-center font-display text-sm font-bold text-secondary">
                              {player.matches_played}
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <span className="font-display text-lg font-black text-warning">
                                {player.total_clean_sheets}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-center font-display text-sm font-bold text-danger">
                              {player.goals_conceded ?? 0}
                            </td>
                            <td className="px-4 py-3.5 text-center font-display text-xs font-bold text-secondary hidden md:table-cell">
                              {ratio} goles/partido
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                                Ver <ChevronRight className="ml-1 h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                      {zamoraList.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-secondary">
                            No hay porteros registrados con partidos en esta competición.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TABLA DISCIPLINA Y TARJETAS */}
          {activeTab === "tarjetas" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-primary">
                    Disciplina & Tarjetas (Fair Play)
                  </h3>
                  <p className="text-xs text-secondary">
                    Registro acumulado de amonestaciones y expulsiones de la plantilla.
                  </p>
                </div>
                <Badge variant="delantero" dot>
                  {cardsList.length} Jugadores
                </Badge>
              </div>

              <div className="overflow-hidden rounded-xl border border-white/10 bg-surface shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-white/10 bg-surface-elevated/80 font-display text-xs font-bold uppercase tracking-wider text-secondary">
                      <tr>
                        <th className="px-4 py-3 text-center w-12">#</th>
                        <th className="px-4 py-3">Jugador</th>
                        <th className="px-4 py-3 text-center hidden sm:table-cell">Posición</th>
                        <th className="px-4 py-3 text-center">Partidos (PJ)</th>
                        <th className="px-4 py-3 text-center">Amarillas 🟨</th>
                        <th className="px-4 py-3 text-center">Rojas 🟥</th>
                        <th className="px-4 py-3 text-center">Puntos Disciplina</th>
                        <th className="px-4 py-3 text-right">Ficha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm font-medium">
                      {cardsList.map((player, idx) => (
                        <tr
                          key={player.player_id}
                          onClick={() => setSelectedPlayer(player)}
                          className="cursor-pointer transition-colors hover:bg-surface-elevated/60"
                        >
                          <td className="px-4 py-3.5 text-center">
                            <RankBadge rank={idx + 1} />
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-white/10 bg-surface-elevated">
                                {parsePhotoUrls(player.photo_url)[0] ? (
                                  <img
                                    src={parsePhotoUrls(player.photo_url)[0]}
                                    alt={player.nickname}
                                    className="h-full w-full object-cover object-top"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-muted">
                                    <User className="h-5 w-5" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-display text-sm font-bold uppercase text-primary">
                                    {player.nickname}
                                  </span>
                                  <span className="font-display text-xs font-bold text-accent-cyan">
                                    #{player.dorsal}
                                  </span>
                                </div>
                                <p className="truncate text-xs text-secondary">
                                  {player.first_name} {player.last_name || ""}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-center hidden sm:table-cell">
                            <Badge variant={player.position}>
                              {getPositionName(player.position)}
                            </Badge>
                          </td>
                          <td className="px-4 py-3.5 text-center font-display text-sm font-bold text-secondary">
                            {player.matches_played}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span className="inline-flex items-center justify-center rounded-md border border-warning/30 bg-warning/10 px-2 py-0.5 font-display text-xs font-bold text-warning">
                              {player.total_yellow_cards}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span className="inline-flex items-center justify-center rounded-md border border-danger/30 bg-danger/10 px-2 py-0.5 font-display text-xs font-bold text-danger">
                              {player.total_red_cards}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center font-display text-sm font-bold text-primary">
                            {player.penaltyPoints} pts
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                              Ver <ChevronRight className="ml-1 h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {cardsList.length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-secondary">
                            No hay datos disciplinarios para los filtros seleccionados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de Ficha del Jugador Seleccionado */}
      {selectedPlayer && (
        <Modal
          isOpen={Boolean(selectedPlayer)}
          onClose={() => setSelectedPlayer(null)}
          title={`Ficha Oficial #${selectedPlayer.dorsal} · ${selectedPlayer.nickname}`}
        >
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-6 rounded-xl border border-white/10 bg-surface-elevated/40 p-4 sm:flex-row">
              <div className="w-36 sm:w-44 flex-shrink-0">
                <PlayerPhotoCarousel
                  photos={parsePhotoUrls(selectedPlayer.photo_url)}
                  alt={selectedPlayer.nickname}
                  showThumbnails={true}
                  isModal={true}
                />
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left min-w-0">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <Badge variant={selectedPlayer.position} dot>
                    {getPositionName(selectedPlayer.position)}
                  </Badge>
                  <span className="rounded-md border border-white/10 bg-surface-elevated px-2 py-0.5 font-display text-xs font-bold text-accent-cyan">
                    DORSAL #{selectedPlayer.dorsal}
                  </span>
                </div>

                <h3 className="truncate font-display text-2xl font-bold uppercase tracking-wide text-primary sm:text-3xl">
                  {selectedPlayer.nickname}
                </h3>
                <p className="text-sm text-secondary">
                  Nombre: {selectedPlayer.first_name} {selectedPlayer.last_name || ""}
                </p>
                <div className="inline-flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wider text-accent-cyan">
                  <Flame className="h-4 w-4" /> Jugador Oficial · PSG F7
                </div>
              </div>
            </div>

            {/* Desglose Estadístico en Modal */}
            <div className="border-t border-white/10 pt-4">
              <div className="mb-3 flex items-center justify-between">
                <h5 className="flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-widest text-accent-cyan">
                  <Sparkles className="h-4 w-4" /> Estadísticas en: {currentCompLabel}
                </h5>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-white/10 bg-surface-elevated/40 p-4 text-center">
                  <span className="font-display text-xs font-bold uppercase tracking-wider text-secondary">
                    Partidos
                  </span>
                  <p className="mt-1 font-display text-2xl font-bold text-primary">
                    {selectedPlayer.matches_played}
                  </p>
                </div>

                {selectedPlayer.position === "portero" ? (
                  <>
                    <div className="rounded-xl border border-white/10 bg-surface-elevated/40 p-4 text-center">
                      <span className="font-display text-xs font-bold uppercase tracking-wider text-warning">
                        Imbatibles
                      </span>
                      <p className="mt-1 font-display text-2xl font-bold text-warning">
                        {selectedPlayer.total_clean_sheets}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-surface-elevated/40 p-4 text-center">
                      <span className="font-display text-xs font-bold uppercase tracking-wider text-danger">
                        Encajados
                      </span>
                      <p className="mt-1 font-display text-2xl font-bold text-danger">
                        {selectedPlayer.goals_conceded ?? 0}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="rounded-xl border border-white/10 bg-surface-elevated/40 p-4 text-center">
                      <span className="font-display text-xs font-bold uppercase tracking-wider text-accent-cyan">
                        Goles
                      </span>
                      <p className="mt-1 font-display text-2xl font-bold text-accent-cyan">
                        {selectedPlayer.total_goals}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-surface-elevated/40 p-4 text-center">
                      <span className="font-display text-xs font-bold uppercase tracking-wider text-success">
                        Asistencias
                      </span>
                      <p className="mt-1 font-display text-2xl font-bold text-success">
                        {selectedPlayer.total_assists}
                      </p>
                    </div>
                  </>
                )}

                <div className="rounded-xl border border-white/10 bg-surface-elevated/40 p-4 text-center">
                  <span className="font-display text-xs font-bold uppercase tracking-wider text-secondary">
                    Tarjetas
                  </span>
                  <div className="mt-1 flex items-center justify-center gap-2">
                    <span className="font-display text-sm font-bold text-warning">
                      {selectedPlayer.total_yellow_cards} 🟨
                    </span>
                    <span className="font-display text-sm font-bold text-danger">
                      {selectedPlayer.total_red_cards} 🟥
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Link href="/plantilla">
                <Button variant="outline" size="sm">
                  Ver en Plantilla General <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Subcomponente de fila rápida
function PlayerStatRow({
  rank,
  player,
  mainStat,
  mainLabel,
  subStat,
  accentColor,
  onSelect,
}: {
  rank: number;
  player: PlayerStatsSummary;
  mainStat: number;
  mainLabel: string;
  subStat: string;
  accentColor: string;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className="group flex cursor-pointer items-center justify-between py-3 transition-colors hover:bg-surface-elevated/40 px-2 rounded-lg"
    >
      <div className="flex items-center gap-3 min-w-0">
        <RankBadge rank={rank} />
        <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg border border-white/10 bg-surface-elevated">
          {parsePhotoUrls(player.photo_url)[0] ? (
            <img
              src={parsePhotoUrls(player.photo_url)[0]}
              alt={player.nickname}
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted">
              <User className="h-4 w-4" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate font-display text-sm font-bold uppercase text-primary group-hover:text-accent-cyan">
              {player.nickname}
            </span>
            <span className="font-display text-xs font-bold text-secondary">
              #{player.dorsal}
            </span>
          </div>
          <p className="truncate text-xs text-muted">{subStat}</p>
        </div>
      </div>

      <div className="text-right">
        <span className={`font-display text-xl font-black ${accentColor}`}>
          {mainStat}
        </span>
        <span className="block font-display text-[10px] uppercase tracking-wider text-secondary">
          {mainLabel}
        </span>
      </div>
    </div>
  );
}

// Subcomponente de medalla de ranking
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-warning/20 border border-warning/40 font-display text-xs font-black text-warning shadow-glow-gold">
        🥇
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-300/20 border border-slate-300/40 font-display text-xs font-black text-slate-200">
        🥈
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-700/20 border border-amber-700/40 font-display text-xs font-black text-amber-500">
        🥉
      </span>
    );
  }
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-surface-elevated font-display text-xs font-bold text-secondary">
      {rank}
    </span>
  );
}

