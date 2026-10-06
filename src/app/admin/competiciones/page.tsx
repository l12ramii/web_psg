"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Check,
  Search,
  Loader2,
  Edit,
  Trash2,
  AlertTriangle,
  Trophy,
  Calendar,
  Filter,
} from "lucide-react";
import {
  getCompetitions,
  addCompetition,
  updateCompetition,
  deleteCompetition,
  getMatches,
} from "@/lib/data";
import { Competition, CompetitionType, MatchWithRival } from "@/lib/supabase/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { getCompetitionLabel } from "@/lib/utils";

export default function AdminCompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [matches, setMatches] = useState<MatchWithRival[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("todas");

  // Modal create/edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState<Competition | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<CompetitionType>("liga");
  const [saving, setSaving] = useState(false);

  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [competitionToDelete, setCompetitionToDelete] = useState<Competition | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [compsData, matchesData] = await Promise.all([
        getCompetitions(),
        getMatches(),
      ]);
      setCompetitions(compsData);
      setMatches(matchesData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openNewModal = () => {
    setEditingCompetition(null);
    setName("");
    setType("liga");
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (comp: Competition) => {
    setEditingCompetition(comp);
    setName(comp.name);
    setType(comp.type);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Por favor introduce el nombre de la competición.");
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    try {
      if (editingCompetition) {
        const updated = await updateCompetition(editingCompetition.id, {
          name: name.trim(),
          type,
        });

        if (updated) {
          setCompetitions((prev) =>
            prev.map((c) => (c.id === editingCompetition.id ? updated : c))
          );
        }
      } else {
        const newComp = await addCompetition({
          name: name.trim(),
          type,
        });
        setCompetitions((prev) => [...prev, newComp]);
      }

      setIsModalOpen(false);
      setName("");
      setType("liga");
      setEditingCompetition(null);
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Error al guardar la competición en la base de datos."
      );
    } finally {
      setSaving(false);
    }
  };

  const promptDelete = (comp: Competition) => {
    setCompetitionToDelete(comp);
    setErrorMessage(null);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!competitionToDelete) return;

    setDeleting(true);
    setErrorMessage(null);
    try {
      await deleteCompetition(competitionToDelete.id);
      setCompetitions((prev) => prev.filter((c) => c.id !== competitionToDelete.id));
      setDeleteModalOpen(false);
      setCompetitionToDelete(null);
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          "No se puede eliminar esta competición. Es posible que tenga partidos asignados en el calendario."
      );
    } finally {
      setDeleting(false);
    }
  };

  const getMatchCountForComp = (comp: Competition) => {
    return matches.filter(
      (m) =>
        m.competition_id === comp.id ||
        (m.competition === comp.type && !m.competition_id)
    ).length;
  };

  const filteredCompetitions = competitions.filter((c) => {
    const matchesSearch = c.name?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "todas" || c.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-black uppercase tracking-tight text-primary sm:text-5xl">
            Competiciones &{" "}
            <span className="text-glow-subtle text-accent-cyan">Torneos</span>
          </h1>
          <p className="text-xs font-medium text-secondary sm:text-sm">
            Gestión de las ligas oficiales, copas y torneos amistosos en los que participa el PSG F7.
          </p>
        </div>

        <Button
          onClick={openNewModal}
          size="lg"
          className="shadow-glow-subtle px-5 py-3"
        >
          <Plus className="h-4 w-4" /> Añadir Nueva Competición
        </Button>
      </div>

      {/* Search, Filter & Counter */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-white/10 bg-surface p-4 inner-light sm:flex-row">
        <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row flex-1">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Buscar competición..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-surface-elevated/60 py-2.5 pl-10 pr-4 text-xs font-medium text-primary placeholder-muted focus-ring focus:border-accent-cyan focus:outline-none"
            />
          </div>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Filter className="h-4 w-4 text-muted flex-shrink-0" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full cursor-pointer rounded-xl border border-white/10 bg-surface-elevated px-3 py-2.5 font-display text-xs font-bold uppercase text-primary focus-ring focus:border-accent-cyan focus:outline-none sm:w-auto"
            >
              <option value="todas">Todos los Tipos</option>
              <option value="liga">Ligas</option>
              <option value="copa">Copas</option>
              <option value="amistoso">Amistosos</option>
            </select>
          </div>
        </div>

        <span className="rounded-lg border border-white/10 bg-surface-elevated px-3 py-1.5 font-display text-xs font-bold uppercase text-secondary">
          {filteredCompetitions.length} Competiciones
        </span>
      </div>

      {/* Grid or Loading / Empty */}
      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-surface py-20 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-accent-cyan" />
          <p className="mt-4 font-display text-sm font-bold uppercase tracking-wider text-secondary">
            Cargando competiciones...
          </p>
        </div>
      ) : filteredCompetitions.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-surface py-16 text-center">
          <Trophy className="mx-auto h-12 w-12 text-muted" />
          <h4 className="mt-3 font-display text-lg font-bold text-primary">
            No se encontraron competiciones
          </h4>
          <p className="mt-1 text-sm text-secondary">
            {search || typeFilter !== "todas"
              ? "No hay ninguna competición que coincida con tus filtros."
              : "Añade competiciones para categorizar los partidos del PSG (Liga, Copa, Amistosos)."}
          </p>
          {(search || typeFilter !== "todas") && (
            <button
              onClick={() => {
                setSearch("");
                setTypeFilter("todas");
              }}
              className="mt-3 text-xs font-bold uppercase text-accent-cyan hover:underline"
            >
              Restablecer filtros
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCompetitions.map((comp) => {
            const matchCount = getMatchCountForComp(comp);
            return (
              <div
                key={comp.id}
                className="group relative flex flex-col justify-between rounded-xl border border-white/10 bg-surface p-5 inner-light transition-all duration-200 ease-out hover:-translate-y-1 hover:border-accent-cyan/50 hover:shadow-glow-subtle min-w-0"
              >
                {/* Header Info */}
                <div className="space-y-4 min-w-0">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border p-2 shadow-inner transition-transform duration-200 group-hover:scale-105 ${
                        comp.type === "liga"
                          ? "border-accent-cyan/40 bg-accent-cyan/15 text-accent-cyan"
                          : comp.type === "copa"
                          ? "border-purple-500/40 bg-purple-500/15 text-purple-300"
                          : "border-slate-500/40 bg-slate-500/15 text-slate-300"
                      }`}
                    >
                      <Trophy className="h-6 w-6" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <h3
                        title={comp.name}
                        className="truncate font-display text-lg font-bold uppercase tracking-wide text-primary transition-colors group-hover:text-accent-cyan"
                      >
                        {comp.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge variant={comp.type} dot>
                          {getCompetitionLabel(comp.type)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Matches Stats block */}
                  <div className="flex items-center justify-between rounded-lg border border-white/5 bg-surface-elevated/40 p-3 text-xs">
                    <span className="text-secondary flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-accent-cyan" />
                      Partidos vinculados
                    </span>
                    <span className="font-display font-bold uppercase text-primary">
                      {matchCount} {matchCount === 1 ? "partido" : "partidos"}
                    </span>
                  </div>
                </div>

                {/* Action Buttons: Edit / Delete */}
                <div className="mt-4 flex items-center justify-end gap-2 border-t border-white/10 pt-3">
                  <Button
                    onClick={() => openEditModal(comp)}
                    variant="secondary"
                    size="sm"
                    className="gap-1.5 text-xs font-bold"
                  >
                    <Edit className="h-3.5 w-3.5 text-accent-cyan" /> Editar
                  </Button>
                  <button
                    onClick={() => promptDelete(comp)}
                    title="Eliminar competición"
                    className="flex items-center gap-1.5 rounded-lg border border-danger/30 bg-danger/10 px-3 py-1.5 font-display text-xs font-bold uppercase tracking-wider text-danger transition-colors hover:bg-danger/25 hover:text-white focus-ring"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add / Edit Competition */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          if (!saving) {
            setIsModalOpen(false);
            setEditingCompetition(null);
          }
        }}
        title={
          editingCompetition
            ? `Editar Competición: ${editingCompetition.name}`
            : "Añadir Nueva Competición"
        }
      >
        <form onSubmit={handleSave} className="space-y-5">
          {errorMessage && (
            <div className="rounded-xl border border-danger/40 bg-danger/15 p-3.5 text-xs font-medium text-danger flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Input
            label="Nombre de la Competición *"
            placeholder="Ej: Liga Apertura F7, Torneo de Copa, Amistosos"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="space-y-2">
            <label className="block font-display text-xs font-bold uppercase tracking-wider text-secondary">
              Formato / Tipo de Torneo *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as CompetitionType)}
              className="w-full rounded-xl border border-white/10 bg-surface-elevated px-4 py-3 text-sm font-medium text-primary focus-ring focus:border-accent-cyan focus:outline-none"
            >
              <option value="liga">Liga (Puntos / Jornadas)</option>
              <option value="copa">Copa / Eliminatoria</option>
              <option value="amistoso">Amistoso / Pretemporada</option>
            </select>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-white/10 pt-4">
            <Button
              type="button"
              variant="secondary"
              size="md"
              className="w-full sm:w-auto px-6 py-2.5 min-h-[44px]"
              disabled={saving}
              onClick={() => {
                setIsModalOpen(false);
                setEditingCompetition(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="md"
              className="w-full sm:w-auto px-6 py-2.5 min-h-[44px]"
              isLoading={saving}
            >
              <Check className="h-4 w-4" />{" "}
              {editingCompetition ? "Guardar Cambios" : "Guardar Competición"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Confirm Delete */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          if (!deleting) {
            setDeleteModalOpen(false);
            setCompetitionToDelete(null);
          }
        }}
        title="Confirmar Eliminación"
      >
        <div className="space-y-4">
          {errorMessage ? (
            <div className="rounded-xl border border-danger/40 bg-danger/15 p-3.5 text-xs font-medium text-danger flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          ) : (
            <p className="text-sm text-secondary">
              ¿Estás seguro de que deseas eliminar la competición{" "}
              <strong className="text-primary uppercase">
                {competitionToDelete?.name}
              </strong>
              ? Esta acción no se puede deshacer.
            </p>
          )}

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-white/10 pt-4">
            <Button
              type="button"
              variant="secondary"
              size="md"
              className="w-full sm:w-auto px-6 py-2.5 min-h-[44px]"
              disabled={deleting}
              onClick={() => {
                setDeleteModalOpen(false);
                setCompetitionToDelete(null);
              }}
            >
              Cancelar
            </Button>
            <button
              type="button"
              disabled={deleting}
              onClick={confirmDelete}
              className="flex items-center justify-center gap-2 rounded-xl border border-danger/40 bg-danger px-6 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-white shadow-glow-crimson transition-all hover:bg-danger/80 disabled:opacity-50 min-h-[44px]"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Eliminando...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  <span>Eliminar Definitivamente</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

