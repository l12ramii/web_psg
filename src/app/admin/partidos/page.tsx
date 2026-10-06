import React from "react";
import Link from "next/link";
import {
  CalendarPlus,
  FileSpreadsheet,
  Edit3,
  Shield,
  CheckCircle2,
  Calendar,
  MapPin,
} from "lucide-react";
import { getMatches } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RivalShield } from "@/components/ui/RivalShield";
import { formatMatchDate, getCompetitionLabel } from "@/lib/utils";

export const revalidate = 0;

export default async function AdminPartidosPage() {
  const matches = await getMatches();

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-black uppercase tracking-tight text-primary sm:text-5xl">
            Partidos y{" "}
            <span className="text-glow-subtle text-accent-cyan">Actas Digitales</span>
          </h1>
          <p className="text-xs font-medium text-secondary sm:text-sm">
            Gestiona los partidos programados, introduce marcadores y actualiza
            las estadísticas oficiales.
          </p>
        </div>

        <Link href="/admin/partidos/nuevo">
          <Button size="lg" className="shadow-glow-subtle">
            <CalendarPlus className="h-4 w-4" /> Programar Nuevo Partido
          </Button>
        </Link>
      </div>

      {/* Matches List */}
      <div className="space-y-4 rounded-xl border border-white/10 bg-surface p-4 sm:p-6 inner-light">
        <div className="divide-y divide-white/10">
          {matches.map((match) => (
            <div
              key={match.id}
              className="flex select-none flex-col justify-between gap-4 py-5 md:flex-row md:items-center min-w-0"
            >
              {/* Match Details */}
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <RivalShield
                  src={match.rival?.shield_url}
                  name={match.rival?.name}
                  size="md"
                  className="h-14 w-14"
                />

                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={match.competition} dot>
                      {getCompetitionLabel(match.competition)}
                    </Badge>
                    <span className="font-display text-xs font-bold uppercase text-secondary">
                      {match.is_home ? "Local" : "Visitante"}
                    </span>
                    {match.field?.name && (
                      <span className="inline-flex items-center gap-1 rounded bg-surface-elevated px-2 py-0.5 font-display text-[11px] font-bold uppercase text-accent-cyan">
                        <MapPin className="h-3 w-3" />
                        {match.field.name}
                      </span>
                    )}
                  </div>

                  <h3 className="truncate font-display text-xl font-bold uppercase tracking-wide text-primary sm:text-2xl">
                    PSG Fútbol 7{" "}
                    <span className="font-normal text-muted">vs</span>{" "}
                    {match.rival?.name || "Rival"}
                  </h3>

                  <p className="flex items-center gap-1.5 text-xs font-medium capitalize text-secondary truncate">
                    <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-accent-cyan" />
                    <span className="truncate">{formatMatchDate(match.match_date)}</span>
                  </p>
                </div>
              </div>

              {/* Status and Action */}
              <div className="flex items-center gap-4 self-end md:self-center flex-shrink-0">
                {match.is_finished ? (
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="block font-display text-[10px] font-bold uppercase tracking-wider text-success">
                        Acta Cerrada
                      </span>
                      <span className="font-display text-2xl font-black text-primary">
                        {match.psg_score} - {match.rival_score}
                      </span>
                    </div>

                    <Link href={`/admin/partidos/${match.id}/acta`}>
                      <Button variant="secondary" size="md">
                        <Edit3 className="h-3.5 w-3.5" /> Modificar Acta
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="rounded-lg border border-warning/25 bg-warning/10 px-3 py-1.5 font-display text-xs font-bold uppercase tracking-wider text-warning">
                      Pendiente de Acta
                    </span>

                    <Link href={`/admin/partidos/${match.id}/acta`}>
                      <Button size="md" className="shadow-glow-subtle">
                        <FileSpreadsheet className="h-4 w-4" /> Rellenar Acta
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
