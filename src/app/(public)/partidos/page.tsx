"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  Search,
  Loader2,
} from "lucide-react";
import { MatchWithRival, Competition } from "@/lib/supabase/types";
import { MatchCard } from "@/components/public/MatchCard";
import { CompetitionSelector } from "@/components/public/CompetitionSelector";
import { getMatches, getCompetitions } from "@/lib/data";

export default function PartidosPage() {
  const [matches, setMatches] = useState<MatchWithRival[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"todos" | "proximos" | "finalizados">("todos");
  const [competitionFilter, setCompetitionFilter] = useState<string>("todas");
  const [searchRival, setSearchRival] = useState("");

  useEffect(() => {
    Promise.all([getMatches(), getCompetitions()])
      .then(([matchesData, compsData]) => {
        setMatches(matchesData);
        setCompetitions(compsData);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredMatches = matches.filter((m) => {
    if (tab === "proximos" && m.is_finished) return false;
    if (tab === "finalizados" && !m.is_finished) return false;

    if (competitionFilter !== "todas") {
      const matchCompId = m.competition_id;
      const matchCompType = m.competition;
      if (
        matchCompId !== competitionFilter &&
        matchCompType !== competitionFilter &&
        m.competition_ref?.name !== competitionFilter
      ) {
        return false;
      }
    }

    if (searchRival.trim()) {
      const q = searchRival.toLowerCase();
      const rivalMatch = m.rival?.name?.toLowerCase().includes(q);
      return rivalMatch;
    }

    return true;
  });

  const upcomingCount = matches.filter((m) => !m.is_finished).length;
  const finishedCount = matches.filter((m) => m.is_finished).length;

  return (
    <div className="container mx-auto space-y-10 px-4 py-12 pb-28">
      {/* Header */}
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent-cyan/40 bg-surface-elevated/90 px-4 py-1.5 font-display text-xs font-bold uppercase tracking-widest text-accent-cyan shadow-glow-subtle">
          <Calendar className="h-3.5 w-3.5" /> Calendario Oficial & Actas
        </div>
        <h1 className="font-display text-4xl font-black uppercase tracking-tight text-primary sm:text-6xl">
          Fixture &{" "}
          <span className="text-glow-subtle text-accent-cyan">Marcadores</span>
        </h1>
        <p className="mx-auto max-w-xl text-sm font-medium text-secondary sm:text-base">
          Consulta la programación de los próximos encuentros y el histórico de
          actas y resultados del PSG Fútbol 7.
        </p>
      </div>

      {/* Controls: Segmented Tabs & Filters */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-white/10 bg-surface p-4 inner-light backdrop-blur-md lg:flex-row">
        {/* Status Tabs (Responsive, zero overflow on all viewports) */}
        <div className="grid w-full grid-cols-3 gap-1 rounded-xl border border-white/10 bg-surface-elevated/60 p-1 sm:flex sm:w-auto sm:gap-1.5 sm:p-1.5">
          <button
            onClick={() => setTab("todos")}
            className={`flex items-center justify-center gap-1 rounded-lg px-2 py-2 font-display text-[11px] font-bold uppercase tracking-tight transition-all duration-200 focus-ring sm:px-4 sm:text-xs sm:tracking-wider ${
              tab === "todos"
                ? "border border-accent-cyan/40 bg-surface-elevated text-primary shadow-glow-subtle"
                : "text-secondary hover:text-primary"
            }`}
          >
            <span>Todos</span>
            <span className="rounded-full bg-white/10 px-1.5 py-0.5 font-sans text-[10px] font-bold text-accent-cyan">
              {matches.length}
            </span>
          </button>
          <button
            onClick={() => setTab("proximos")}
            className={`flex items-center justify-center gap-1 rounded-lg px-2 py-2 font-display text-[11px] font-bold uppercase tracking-tight transition-all duration-200 focus-ring sm:px-4 sm:text-xs sm:tracking-wider ${
              tab === "proximos"
                ? "border border-accent-cyan/40 bg-surface-elevated text-primary shadow-glow-subtle"
                : "text-secondary hover:text-primary"
            }`}
          >
            <Clock className="h-3 w-3 flex-shrink-0 text-accent-cyan sm:h-3.5 sm:w-3.5" />
            <span>Próximos</span>
            <span className="rounded-full bg-white/10 px-1.5 py-0.5 font-sans text-[10px] font-bold text-accent-cyan">
              {upcomingCount}
            </span>
          </button>
          <button
            onClick={() => setTab("finalizados")}
            className={`flex items-center justify-center gap-1 rounded-lg px-2 py-2 font-display text-[11px] font-bold uppercase tracking-tight transition-all duration-200 focus-ring sm:px-4 sm:text-xs sm:tracking-wider ${
              tab === "finalizados"
                ? "border border-accent-cyan/40 bg-surface-elevated text-primary shadow-glow-subtle"
                : "text-secondary hover:text-primary"
            }`}
          >
            <CheckCircle2 className="h-3 w-3 flex-shrink-0 text-success sm:h-3.5 sm:w-3.5" />
            <span>Resultados</span>
            <span className="rounded-full bg-white/10 px-1.5 py-0.5 font-sans text-[10px] font-bold text-success">
              {finishedCount}
            </span>
          </button>
        </div>

        {/* Right Filter Controls */}
        <div className="flex w-full flex-col items-center gap-3 sm:flex-row lg:w-auto">
          {/* Rival search */}
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Buscar por rival..."
              value={searchRival}
              onChange={(e) => setSearchRival(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-surface-elevated/60 py-2 pl-9 pr-3 text-xs font-medium text-primary placeholder-muted focus-ring focus:border-accent-cyan focus:outline-none"
            />
          </div>

          {/* Competition select */}
          <CompetitionSelector
            competitions={competitions}
            value={competitionFilter}
            onChange={setCompetitionFilter}
            className="w-full sm:w-60"
          />
        </div>
      </div>

      {/* Match Grid or Loading / Empty State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-surface py-20 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-accent-cyan" />
          <p className="mt-4 font-display text-sm font-bold uppercase tracking-wider text-secondary">
            Cargando...
          </p>
        </div>
      ) : filteredMatches.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-surface py-16 text-center">
          <Calendar className="h-12 w-12 text-muted" />
          <h4 className="mt-3 text-lg font-bold text-primary font-display">
            No se encontraron partidos
          </h4>
          <p className="mt-1 text-sm text-secondary">
            {matches.length === 0
              ? "Aún no hay partidos programados en la base de datos de Supabase."
              : "Prueba seleccionando otro filtro de competición o estado."}
          </p>
        </div>
      )}
    </div>
  );
}
