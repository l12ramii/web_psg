"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  Users,
  Calendar,
  Lock,
  Menu,
  X,
  Flame,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PsgShield } from "@/components/ui";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Inicio", icon: Shield },
    { href: "/plantilla", label: "Plantilla", icon: Users },
    { href: "/partidos", label: "Calendario & Resultados", icon: Calendar },
    { href: "/estadisticas", label: "Estadísticas", icon: Trophy },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl">
      {/* Top micro-bar */}
      <div className="hidden w-full border-b border-white/5 bg-surface/50 px-4 py-1 font-display text-[11px] uppercase tracking-widest text-secondary sm:block">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
            <span>Temporada Regular 2026/27 · PSG Fútbol 7 Oficial</span>
          </div>
          <div className="flex items-center gap-4 font-bold text-accent-cyan">
            <span className="flex items-center gap-1">
              <Flame className="h-3 w-3 text-accent-cyan" /> Resurgimiento y Garra
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        {/* Brand / Logo */}
        <Link href="/" className="group flex items-center gap-3.5 focus-ring rounded-xl">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-accent-cyan/40 bg-surface-elevated p-1 shadow-glow-subtle transition-all duration-200 group-hover:scale-105 group-hover:border-accent-cyan">
            <PsgShield size="sm" priority />
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-2xl font-black tracking-wider text-primary transition-colors group-hover:text-accent-cyan">
                PSG
              </span>
              <span className="rounded border border-accent-cyan/30 bg-accent-cyan/15 px-1.5 py-0.5 font-display text-xs font-black tracking-widest text-accent-cyan">
                F7
              </span>
            </div>
            <span className="font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-secondary">
              Club Oficial
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 rounded-xl border border-white/10 bg-surface p-1.5 backdrop-blur-md md:flex">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative flex items-center gap-2 rounded-lg px-4 py-2 font-display text-xs font-bold uppercase tracking-wider transition-all duration-200 focus-ring",
                  isActive
                    ? "border border-accent-cyan/40 bg-surface-elevated text-primary shadow-glow-subtle"
                    : "text-secondary hover:bg-surface-elevated/60 hover:text-primary"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    isActive ? "text-accent-cyan" : "text-muted"
                  )}
                />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA: Backoffice CM */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-surface-elevated px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-primary transition-all duration-200 hover:-translate-y-1 hover:border-accent-cyan/50 hover:text-accent-cyan hover:shadow-glow-subtle focus-ring"
          >
            <Lock className="h-3.5 w-3.5 text-accent-cyan" />
            <span className="hidden sm:inline">Panel CM</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl border border-white/10 bg-surface p-2.5 text-secondary hover:text-primary focus-ring md:hidden"
            aria-label="Menú principal"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="animate-in slide-in-from-top-4 space-y-2 border-t border-white/10 bg-surface/95 px-4 pb-6 pt-3 backdrop-blur-2xl duration-200 md:hidden">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 font-display text-sm font-bold uppercase tracking-wider transition-colors",
                  isActive
                    ? "border border-accent-cyan/40 bg-surface-elevated text-primary shadow-glow-subtle"
                    : "text-secondary hover:bg-surface-elevated/60 hover:text-primary"
                )}
              >
                <Icon className="h-5 w-5 text-accent-cyan" />
                {link.label}
              </Link>
            );
          })}
          <div className="border-t border-white/10 pt-3">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-accent-cyan/40 bg-accent-cyan/15 py-3 font-display text-xs font-bold uppercase tracking-wider text-accent-cyan"
            >
              <Lock className="h-4 w-4" /> Acceso al Panel de Administración
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
