import React from "react";
import Link from "next/link";
import { Trophy, Shield, Heart, Zap, Lock } from "lucide-react";
import { PsgShield } from "@/components/ui";

export function Footer() {
  return (
    <footer className="relative w-full overflow-hidden border-t border-white/10 bg-surface text-secondary">
      {/* Top ambient illumination stripe */}
      <div className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-accent-cyan/40 to-transparent" />

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand & Identity */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent-cyan/40 bg-surface-elevated p-1 shadow-glow-subtle">
                <PsgShield size="sm" />
              </div>
              <div>
                <span className="font-display text-3xl font-black tracking-wider text-primary">
                  PSG <span className="text-lg text-accent-cyan">FÚTBOL 7</span>
                </span>
                <span className="-mt-1 block font-display text-[10px] uppercase tracking-[0.2em] text-secondary">
                  Club de Barrio Oficial
                </span>
              </div>
            </div>

            <p className="max-w-md text-sm leading-relaxed text-secondary">
              El Fénix renace en cada partido. Pasión, juego colectivo y la
              máxima entrega por los colores azul marino y blanco en la liga de
              Fútbol 7.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 font-display text-xs font-bold uppercase tracking-widest text-accent-cyan">
              <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-surface-elevated px-3 py-1">
                <Trophy className="h-3.5 w-3.5 text-warning" /> Pasión
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-surface-elevated px-3 py-1">
                <Shield className="h-3.5 w-3.5 text-accent-cyan" /> Resurgimiento
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-surface-elevated px-3 py-1">
                <Zap className="h-3.5 w-3.5 text-accent-blue" /> Garra
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-display text-xs font-bold uppercase tracking-widest text-primary">
              Portal Oficial
            </h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <Link
                  href="/"
                  className="transition-colors hover:text-accent-cyan"
                >
                  Inicio & Próximos Partidos
                </Link>
              </li>
              <li>
                <Link
                  href="/plantilla"
                  className="transition-colors hover:text-accent-cyan"
                >
                  Plantilla & Jugadores F7
                </Link>
              </li>
              <li>
                <Link
                  href="/partidos"
                  className="transition-colors hover:text-accent-cyan"
                >
                  Calendario & Marcadores
                </Link>
              </li>
              <li>
                <Link
                  href="/estadisticas"
                  className="transition-colors hover:text-accent-cyan"
                >
                  Estadísticas & Rankings
                </Link>
              </li>
            </ul>
          </div>

          {/* CM & Backoffice Access */}
          <div className="space-y-3">
            <h4 className="font-display text-xs font-bold uppercase tracking-widest text-primary">
              Gestión del Club
            </h4>
            <p className="text-xs text-secondary">
              Panel ultra-simplificado para el registro de actas, convocatorias
              y estadísticas en vivo.
            </p>
            <div className="pt-2">
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-surface-elevated px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-accent-cyan shadow-sm transition-all hover:border-accent-cyan/50 hover:bg-surface-elevated/80 hover:text-primary focus-ring"
              >
                <Lock className="h-3.5 w-3.5" /> Acceso Backoffice CM
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Credits Bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-muted sm:flex-row">
          <p>
            © {new Date().getFullYear()} PSG Fútbol 7. Todos los derechos reservados.
          </p>
          <p className="flex items-center gap-1.5 font-medium text-secondary">
            Hecho con{" "}
            <Heart className="h-3.5 w-3.5 fill-danger text-danger" />{" "}
            para los guerreros del PSG F7
          </p>
        </div>
      </div>
    </footer>
  );
}
