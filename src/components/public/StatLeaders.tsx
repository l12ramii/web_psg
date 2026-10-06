"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Trophy,
  Target,
  Sparkles,
  ShieldCheck,
  User,
  ChevronRight,
  Filter,
  Loader2,
} from "lucide-react";
import { PlayerStatsSummary, Competition } from "@/lib/supabase/types";
import { parsePhotoUrls } from "@/lib/utils";
import { getStatLeaders } from "@/lib/data";
import { CompetitionSelector } from "./CompetitionSelector";

interface StatLeadersProps {
  topScorer?: PlayerStatsSummary | null;
  topAssistant?: PlayerStatsSummary | null;
  topKeeper?: PlayerStatsSummary | null;
  competitions?: Competition[];
  showFilter?: boolean;
}

export function StatLeaders({
  topScorer: initialTopScorer,
  topAssistant: initialTopAssistant,
  topKeeper: initialTopKeeper,
  competitions = [],
  showFilter = true,
}: StatLeadersProps) {
  const [competitionFilter, setCompetitionFilter] = useState("todas");
  const [topScorer, setTopScorer] = useState(initialTopScorer);
  const [topAssistant, setTopAssistant] = useState(initialTopAssistant);
  const [topKeeper, setTopKeeper] = useState(initialTopKeeper);
  const [loading, setLoading] = useState(false);

  const handleCompetitionChange = (newComp: string) => {
    setCompetitionFilter(newComp);
    setLoading(true);
    getStatLeaders(newComp)
      .then((leaders) => {
        setTopScorer(leaders.topScorer);
        setTopAssistant(leaders.topAssistant);
        setTopKeeper(leaders.topKeeper);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const leaders = [
    {
      title: "Máximo Goleador",
      icon: Target,
      statLabel: "Goles Totales",
      statValue: topScorer?.total_goals ?? 0,
      player: topScorer,
      borderHover: "hover:border-accent-cyan/50 hover:shadow-glow-subtle",
      textColor: "text-accent-cyan",
      badgeColor: "bg-accent-cyan/15 text-accent-cyan border-accent-cyan/40",
      badge: "PICHICHI DE ORO",
      categoryTab: "pichichi",
    },
    {
      title: "Máximo Asistente",
      icon: Sparkles,
      statLabel: "Asistencias Clave",
      statValue: topAssistant?.total_assists ?? 0,
      player: topAssistant,
      borderHover: "hover:border-success/50 hover:shadow-glow-emerald",
      textColor: "text-success",
      badgeColor: "bg-success/15 text-success border-success/40",
      badge: "MEJOR PLAYMAKER",
      categoryTab: "asistencias",
    },
    {
      title: "Guante Imbatible",
      icon: ShieldCheck,
      statLabel: "Porterías a Cero",
      statValue: topKeeper?.total_clean_sheets ?? 0,
      player: topKeeper,
      borderHover: "hover:border-warning/50 hover:shadow-glow-gold",
      textColor: "text-warning",
      badgeColor: "bg-warning/15 text-warning border-warning/40",
      badge: "TROFEO ZAMORA",
      categoryTab: "zamora",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Dynamic Competition Filter Bar */}
      {showFilter && competitions.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-white/10 bg-surface-elevated/40 p-3 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary">
            <Filter className="h-3.5 w-3.5 text-accent-cyan" />
            <span>Filtrar cuadro de honor:</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <CompetitionSelector
              competitions={competitions}
              value={competitionFilter}
              onChange={handleCompetitionChange}
              className="w-full sm:w-60"
            />
            {loading && (
              <Loader2 className="h-4 w-4 animate-spin text-accent-cyan flex-shrink-0" />
            )}
          </div>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {leaders.map((leader) => {
          const Icon = leader.icon;
          return (
            <Link
              key={leader.title}
              href={`/estadisticas`}
              className={`group relative flex select-none flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-surface p-6 inner-light transition-all duration-200 ease-out hover:-translate-y-1 ${leader.borderHover}`}
            >
              <div>
                {/* Card Header */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-surface-elevated text-primary shadow-inner">
                      <Icon className="h-4 w-4 text-accent-cyan" />
                    </div>
                    <h4 className="font-display text-base font-bold uppercase tracking-wide text-primary">
                      {leader.title}
                    </h4>
                  </div>
                  <span
                    className={`rounded-full border px-2 py-0.5 font-display text-[10px] font-bold tracking-wider ${leader.badgeColor}`}
                  >
                    {leader.badge}
                  </span>
                </div>

                {/* Player Portrait & Info */}
                <div className="my-4 flex items-center gap-4 min-w-0">
                  <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-surface-elevated shadow-md">
                    {parsePhotoUrls(leader.player?.photo_url)[0] ? (
                      <img
                        src={parsePhotoUrls(leader.player?.photo_url)[0]}
                        alt={leader.player?.nickname || leader.title}
                        className="h-full w-full object-cover object-top transition-all duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <User className="h-8 w-8 text-muted" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <span className="font-display text-xs font-bold uppercase tracking-wider text-accent-cyan">
                      {leader.player ? `Dorsal #${leader.player.dorsal}` : "Dorsal #--"}
                    </span>
                    <h5 className="truncate font-display text-xl font-bold uppercase tracking-wide text-primary transition-colors group-hover:text-accent-cyan">
                      {leader.player?.nickname || "Por definir"}
                    </h5>
                    <p className="truncate text-xs text-secondary">
                      {leader.player ? `${leader.player.first_name} ${leader.player.last_name || ""}` : "Sin datos de plantilla"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stat Counter Footer */}
              <div className="mt-4 flex items-baseline justify-between border-t border-white/10 pt-4">
                <span className="font-display text-xs font-bold uppercase tracking-wider text-secondary">
                  {leader.statLabel}
                </span>
                <span
                  className={`font-display text-4xl font-black ${leader.textColor} text-glow-subtle`}
                >
                  {leader.statValue}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
