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
  MapPin,
  ExternalLink,
  Navigation,
} from "lucide-react";
import { getFields, addField, updateField, deleteField } from "@/lib/data";
import { Field } from "@/lib/supabase/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";

export default function AdminCamposPage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal create/edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState<Field | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadFields = async () => {
    try {
      const data = await getFields();
      setFields(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFields();
  }, []);

  const openNewFieldModal = () => {
    setEditingField(null);
    setName("");
    setAddress("");
    setMapsUrl("");
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const openEditFieldModal = (field: Field) => {
    setEditingField(field);
    setName(field.name);
    setAddress(field.address || "");
    setMapsUrl(field.maps_url || "");
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Por favor introduce el nombre del campo de juego.");
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    const cleanAddress = address.trim() || null;
    const cleanMapsUrl = mapsUrl.trim() || null;

    try {
      if (editingField) {
        const updated = await updateField(editingField.id, {
          name: name.trim(),
          address: cleanAddress,
          maps_url: cleanMapsUrl,
        });

        if (updated) {
          setFields((prev) =>
            prev.map((f) => (f.id === editingField.id ? updated : f))
          );
        }
      } else {
        const newField = await addField({
          name: name.trim(),
          address: cleanAddress,
          maps_url: cleanMapsUrl,
        });
        setFields((prev) => [...prev, newField]);
      }

      setIsModalOpen(false);
      setName("");
      setAddress("");
      setMapsUrl("");
      setEditingField(null);
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Error al guardar el campo en la base de datos."
      );
    } finally {
      setSaving(false);
    }
  };

  const promptDelete = (field: Field) => {
    setFieldToDelete(field);
    setErrorMessage(null);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!fieldToDelete) return;

    setDeleting(true);
    setErrorMessage(null);
    try {
      await deleteField(fieldToDelete.id);
      setFields((prev) => prev.filter((f) => f.id !== fieldToDelete.id));
      setDeleteModalOpen(false);
      setFieldToDelete(null);
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          "No se puede eliminar este campo. Es posible que tenga partidos asignados en el calendario."
      );
    } finally {
      setDeleting(false);
    }
  };

  const filteredFields = fields.filter(
    (f) =>
      f.name?.toLowerCase().includes(search.toLowerCase()) ||
      f.address?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-black uppercase tracking-tight text-primary sm:text-5xl">
            Campos de{" "}
            <span className="text-glow-subtle text-accent-cyan">Juego & Sedes</span>
          </h1>
          <p className="text-xs font-medium text-secondary sm:text-sm">
            Gestión de las instalaciones deportivas, polideportivos y ubicaciones GPS donde compite el PSG.
          </p>
        </div>

        <Button
          onClick={openNewFieldModal}
          size="lg"
          className="shadow-glow-subtle px-5 py-3"
        >
          <Plus className="h-4 w-4" /> Añadir Nuevo Campo
        </Button>
      </div>

      {/* Search & Counter */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-white/10 bg-surface p-4 inner-light sm:flex-row">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Buscar campo por nombre o dirección..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-surface-elevated/60 py-2.5 pl-10 pr-4 text-xs font-medium text-primary placeholder-muted focus-ring focus:border-accent-cyan focus:outline-none"
          />
        </div>

        <span className="rounded-lg border border-white/10 bg-surface-elevated px-3 py-1.5 font-display text-xs font-bold uppercase text-secondary">
          {filteredFields.length} Campos Registrados
        </span>
      </div>

      {/* Fields Grid or Loading / Empty */}
      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-surface py-20 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-accent-cyan" />
          <p className="mt-4 font-display text-sm font-bold uppercase tracking-wider text-secondary">
            Cargando campos de fútbol...
          </p>
        </div>
      ) : filteredFields.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-surface py-16 text-center">
          <MapPin className="mx-auto h-12 w-12 text-muted" />
          <h4 className="mt-3 font-display text-lg font-bold text-primary">
            No se encontraron campos de juego
          </h4>
          <p className="mt-1 text-sm text-secondary">
            {search
              ? "No hay ningún campo que coincida con tu búsqueda."
              : "Añade campos para asociarlos a los partidos y mostrar su localización a la afición."}
          </p>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="mt-3 text-xs font-bold uppercase text-accent-cyan hover:underline"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFields.map((field) => (
            <div
              key={field.id}
              className="group relative flex flex-col justify-between rounded-xl border border-white/10 bg-surface p-5 inner-light transition-all duration-200 ease-out hover:-translate-y-1 hover:border-accent-cyan/50 hover:shadow-glow-subtle min-w-0"
            >
              {/* Field Info */}
              <div className="space-y-3 min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-accent-cyan/30 bg-surface-elevated text-accent-cyan shadow-glow-subtle transition-transform duration-200 group-hover:scale-105">
                    <MapPin className="h-6 w-6" />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <h3
                      title={field.name}
                      className="truncate font-display text-lg font-bold uppercase tracking-wide text-primary transition-colors group-hover:text-accent-cyan"
                    >
                      {field.name}
                    </h3>
                    <span className="flex items-center gap-1 font-display text-[11px] font-bold uppercase tracking-wider text-success">
                      <Check className="h-3.5 w-3.5" /> Sede Disponible
                    </span>
                  </div>
                </div>

                {/* Address & Navigation */}
                <div className="space-y-1.5 rounded-lg border border-white/5 bg-surface-elevated/40 p-3 text-xs">
                  <div className="flex items-start gap-2 text-secondary">
                    <Navigation className="h-3.5 w-3.5 flex-shrink-0 text-muted mt-0.5" />
                    <span className="break-words line-clamp-2">
                      {field.address || "Dirección no especificada"}
                    </span>
                  </div>

                  {field.maps_url && (
                    <div className="pt-1">
                      <a
                        href={field.maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wider text-accent-cyan hover:text-primary transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Ver en Google Maps
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons: Edit / Delete */}
              <div className="mt-4 flex items-center justify-end gap-2 border-t border-white/10 pt-3">
                <Button
                  onClick={() => openEditFieldModal(field)}
                  variant="secondary"
                  size="sm"
                  className="gap-1.5 text-xs font-bold"
                >
                  <Edit className="h-3.5 w-3.5 text-accent-cyan" /> Editar
                </Button>
                <button
                  onClick={() => promptDelete(field)}
                  title="Eliminar campo"
                  className="flex items-center gap-1.5 rounded-lg border border-danger/30 bg-danger/10 px-3 py-1.5 font-display text-xs font-bold uppercase tracking-wider text-danger transition-colors hover:bg-danger/25 hover:text-white focus-ring"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit Field */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          if (!saving) {
            setIsModalOpen(false);
            setEditingField(null);
          }
        }}
        title={editingField ? `Editar Campo: ${editingField.name}` : "Añadir Nuevo Campo de Juego"}
      >
        <form onSubmit={handleSave} className="space-y-5">
          {errorMessage && (
            <div className="rounded-xl border border-danger/40 bg-danger/15 p-3.5 text-xs font-medium text-danger flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Input
            label="Nombre del Campo o Instalación *"
            placeholder="Ej: Campo Municipal El Ferial"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Dirección / Ubicación Física"
            placeholder="Ej: Calle de los Deportes 14, Madrid"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <Input
            label="Enlace a Google Maps (URL / GPS)"
            placeholder="Ej: https://maps.google.com/?q=..."
            value={mapsUrl}
            onChange={(e) => setMapsUrl(e.target.value)}
          />

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-white/10 pt-4">
            <Button
              type="button"
              variant="secondary"
              size="md"
              className="w-full sm:w-auto px-6 py-2.5 min-h-[44px]"
              disabled={saving}
              onClick={() => {
                setIsModalOpen(false);
                setEditingField(null);
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
              {editingField ? "Guardar Cambios" : "Guardar Campo"}
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
            setFieldToDelete(null);
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
              ¿Estás seguro de que deseas eliminar el campo{" "}
              <strong className="text-primary uppercase">
                {fieldToDelete?.name}
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
                setFieldToDelete(null);
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

