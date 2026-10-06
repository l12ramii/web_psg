"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CalendarPlus,
  ArrowLeft,
  Shield,
  Plus,
  Calendar,
  ChevronDown,
  Check,
  Loader2,
  MapPin,
} from "lucide-react";
import { getRivals, getFields, addMatch } from "@/lib/data";
import { Rival, Field } from "@/lib/supabase/types";
import { Button } from "@/components/ui/Button";
import { RivalShield } from "@/components/ui/RivalShield";

export default function NuevoPartidoPage() {
  const router = useRouter();
  const [rivals, setRivals] = useState<Rival[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [rivalId, setRivalId] = useState<string>("");
  const [fieldId, setFieldId] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHome, setIsHome] = useState<boolean>(true);
  const [matchDate, setMatchDate] = useState<string>("");
  const [competition, setCompetition] = useState<"liga" | "copa" | "amistoso">(
    "liga"
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingRivals, setLoadingRivals] = useState<boolean>(true);
  const [loadingFields, setLoadingFields] = useState<boolean>(true);

  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
    d.setHours(18, 0, 0, 0);
    setMatchDate(d.toISOString().slice(0, 16));

    getRivals()
      .then((data) => {
        setRivals(data);
        if (data.length > 0) setRivalId(data[0].id);
      })
      .finally(() => {
        setLoadingRivals(false);
      });

    getFields()
      .then((data) => {
        setFields(data);
        if (data.length > 0) setFieldId(data[0].id);
      })
      .finally(() => {
        setLoadingFields(false);
      });
  }, []);

  const selectedRival = rivals.find((r) => r.id === rivalId);
  const selectedField = fields.find((f) => f.id === fieldId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rivalId || !matchDate) {
      alert("Por favor completa todos los campos (selecciona un rival y una fecha).");
      return;
    }

    setIsLoading(true);
    try {
      await addMatch({
        rival_id: rivalId,
        field_id: fieldId || null,
        is_home: isHome,
        match_date: new Date(matchDate).toISOString(),
        competition,
      });

      router.push("/admin/partidos");
      router.refresh();
    } catch (err: any) {
      alert("Error al programar el partido en Supabase: " + (err?.message || ""));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-20">
      {/* Back Button */}
      <Link
        href="/admin/partidos"
        className="inline-flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wider text-secondary transition-colors hover:text-primary focus-ring rounded-lg px-2 py-1"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a Partidos
      </Link>

      <div className="relative space-y-6 overflow-hidden rounded-xl border border-white/10 bg-surface p-6 shadow-xl inner-light sm:p-10">
        <div className="space-y-1 border-b border-white/10 pb-4">
          <h1 className="font-display text-3xl font-black uppercase tracking-wide text-primary sm:text-4xl">
            Programar{" "}
            <span className="text-glow-subtle text-accent-cyan">Nuevo Encuentro</span>
          </h1>
          <p className="text-xs font-medium text-secondary">
            Fija la fecha, hora, condición y rival para el próximo partido del
            PSG F7.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rich Visual Rival Selector with Crest / Shield */}
          <div className="space-y-2 relative">
            <div className="flex items-center justify-between">
              <label className="font-display text-xs font-bold uppercase tracking-wider text-secondary">
                Equipo Rival *
              </label>
              <Link
                href="/admin/rivales"
                className="flex items-center gap-1 font-display text-xs font-bold uppercase tracking-wider text-accent-cyan hover:underline"
              >
                <Plus className="h-3.5 w-3.5" /> Crear nuevo rival
              </Link>
            </div>

            {loadingRivals ? (
              <div className="flex items-center gap-2 p-3 text-xs text-secondary">
                <Loader2 className="h-4 w-4 animate-spin text-accent-cyan" />
                <span>Cargando...</span>
              </div>
            ) : rivals.length === 0 ? (
              <div className="rounded-xl border border-warning/30 bg-warning/15 p-4 text-xs text-warning">
                <p>No hay rivales registrados en Supabase aún.</p>
                <Link
                  href="/admin/rivales"
                  className="mt-2 inline-flex items-center gap-1 font-bold underline"
                >
                  <Plus className="h-3 w-3" /> Registrar un rival primero
                </Link>
              </div>
            ) : (
              <>
                {/* Custom Dropdown Trigger */}
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-surface-elevated px-4 py-3 text-left transition-all hover:border-accent-cyan/50 focus-ring"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <RivalShield
                      src={selectedRival?.shield_url}
                      name={selectedRival?.name}
                      size="sm"
                    />
                    <span className="truncate font-display text-sm font-bold uppercase tracking-wide text-primary">
                      {selectedRival?.name || "Seleccionar equipo rival..."}
                    </span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-secondary transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180 text-accent-cyan" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Options List */}
                {isDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <div className="absolute left-0 right-0 top-full mt-2 z-30 max-h-60 overflow-y-auto rounded-xl border border-white/10 bg-surface-elevated p-1.5 shadow-2xl backdrop-blur-xl">
                      {rivals.map((rival) => {
                        const isSelected = rival.id === rivalId;
                        return (
                          <button
                            key={rival.id}
                            type="button"
                            onClick={() => {
                              setRivalId(rival.id);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                              isSelected
                                ? "bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30"
                                : "text-primary hover:bg-white/5"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <RivalShield
                                src={rival.shield_url}
                                name={rival.name}
                                size="xs"
                              />
                              <span className="truncate font-display text-xs font-bold uppercase">
                                {rival.name}
                              </span>
                            </div>
                            {isSelected && <Check className="h-4 w-4 flex-shrink-0 text-accent-cyan" />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Campo de Juego / Sede Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-display text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-accent-cyan" />
                Campo de Juego / Sede
              </label>
              <Link
                href="/admin/campos"
                className="flex items-center gap-1 font-display text-xs font-bold uppercase tracking-wider text-accent-cyan hover:underline"
              >
                <Plus className="h-3.5 w-3.5" /> Gestionar campos
              </Link>
            </div>

            {loadingFields ? (
              <div className="flex items-center gap-2 p-3 text-xs text-secondary">
                <Loader2 className="h-4 w-4 animate-spin text-accent-cyan" />
                <span>Cargando campos...</span>
              </div>
            ) : fields.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-surface-elevated/40 p-3 text-xs text-secondary flex items-center justify-between">
                <span>No hay campos creados todavía.</span>
                <Link
                  href="/admin/campos"
                  className="font-bold text-accent-cyan underline"
                >
                  Crear campo
                </Link>
              </div>
            ) : (
              <select
                value={fieldId}
                onChange={(e) => setFieldId(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-surface-elevated px-4 py-3 text-sm font-medium text-primary focus-ring focus:border-accent-cyan focus:outline-none"
              >
                <option value="">-- Sin campo asignado --</option>
                {fields.map((field) => (
                  <option key={field.id} value={field.id}>
                    {field.name} {field.address ? `(${field.address})` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Condition: Home / Away */}
          <div className="space-y-2">
            <label className="block font-display text-xs font-bold uppercase tracking-wider text-secondary">
              Condición de Juego
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsHome(true)}
                className={`rounded-xl border px-4 py-3.5 font-display text-sm font-bold uppercase tracking-wider transition-all focus-ring ${
                  isHome
                    ? "border-accent-cyan/40 bg-surface-elevated text-primary shadow-glow-subtle"
                    : "border-white/10 bg-surface-elevated/40 text-secondary hover:text-primary"
                }`}
              >
                Local (Campo PSG)
              </button>
              <button
                type="button"
                onClick={() => setIsHome(false)}
                className={`rounded-xl border px-4 py-3.5 font-display text-sm font-bold uppercase tracking-wider transition-all focus-ring ${
                  !isHome
                    ? "border-accent-cyan/40 bg-surface-elevated text-primary shadow-glow-subtle"
                    : "border-white/10 bg-surface-elevated/40 text-secondary hover:text-primary"
                }`}
              >
                Visitante
              </button>
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-2">
            <label className="block font-display text-xs font-bold uppercase tracking-wider text-secondary">
              Fecha y Hora del Encuentro
            </label>
            <input
              type="datetime-local"
              value={matchDate}
              onChange={(e) => setMatchDate(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-surface-elevated px-4 py-3 text-sm font-medium text-primary focus-ring focus:border-accent-cyan focus:outline-none"
              required
            />
          </div>

          {/* Competición */}
          <div className="space-y-2">
            <label className="block font-display text-xs font-bold uppercase tracking-wider text-secondary">
              Competición
            </label>
            <select
              value={competition}
              onChange={(e) => setCompetition(e.target.value as any)}
              className="w-full rounded-xl border border-white/10 bg-surface-elevated px-4 py-3 text-sm font-medium text-primary focus-ring focus:border-accent-cyan focus:outline-none"
            >
              <option value="liga">Liga Oficial F7</option>
              <option value="copa">Copa</option>
              <option value="amistoso">Partido Amistoso</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-white/10 pt-4">
            <Link href="/admin/partidos" className="w-full sm:w-auto">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto px-6 py-3 min-h-[44px]"
              >
                Cancelar
              </Button>
            </Link>
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={rivals.length === 0}
              size="lg"
              className="w-full sm:w-auto px-6 py-3 min-h-[44px] shadow-glow-subtle"
            >
              <CalendarPlus className="h-4 w-4" /> Guardar Partido
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
