"use client";

import React from "react";
import { Filter, Trophy } from "lucide-react";
import { Competition } from "@/lib/supabase/types";
import { getCompetitionLabel } from "@/lib/utils";

interface CompetitionSelectorProps {
  competitions: Competition[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  variant?: "select" | "pills";
}

export function CompetitionSelector({
  competitions,
  value,
  onChange,
  className = "",
  variant = "select",
}: CompetitionSelectorProps) {
  if (variant === "pills") {
    return (
      <div
        className={`flex max-w-full items-center gap-1.5 overflow-x-auto rounded-xl border border-white/10 bg-surface-elevated/60 p-1.5 backdrop-blur-md ${className}`}
      >
        <button
          type="button"
          onClick={() => onChange("todas")}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 font-display text-xs font-bold uppercase tracking-wider transition-all duration-200 focus-ring ${
            value === "todas"
              ? "border border-accent-cyan/40 bg-surface-elevated text-primary shadow-glow-subtle"
              : "text-secondary hover:bg-surface-elevated/60 hover:text-primary"
          }`}
        >
          <Trophy className="h-3.5 w-3.5 text-accent-cyan" />
          <span>Todas</span>
        </button>

        {competitions.map((comp) => {
          const isActive = value === comp.id || value === comp.name;
          return (
            <button
              key={comp.id}
              type="button"
              onClick={() => onChange(comp.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 font-display text-xs font-bold uppercase tracking-wider transition-all duration-200 focus-ring ${
                isActive
                  ? "border border-accent-cyan/40 bg-surface-elevated text-primary shadow-glow-subtle"
                  : "text-secondary hover:bg-surface-elevated/60 hover:text-primary"
              }`}
            >
              <span>{comp.name}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`relative flex items-center ${className}`}>
      <div className="pointer-events-none absolute left-3 flex items-center text-accent-cyan">
        <Filter className="h-4 w-4" />
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full cursor-pointer appearance-none rounded-xl border border-white/10 bg-surface-elevated py-2.5 pl-9 pr-8 font-display text-xs font-bold uppercase tracking-wider text-primary shadow-sm backdrop-blur-md transition-colors hover:border-accent-cyan/40 focus-ring focus:border-accent-cyan focus:outline-none"
        aria-label="Filtrar por competición"
      >
        <option value="todas">Todas las Competiciones</option>
        {competitions.length > 0 ? (
          competitions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({getCompetitionLabel(c.type)})
            </option>
          ))
        ) : (
          <>
            <option value="liga">Liga Oficial</option>
            <option value="copa">Copa</option>
            <option value="amistoso">Amistosos</option>
          </>
        )}
      </select>
      <div className="pointer-events-none absolute right-3 flex items-center text-secondary">
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}

