"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  Shield,
  MapPin,
  LogOut,
  Flame,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { PsgShield } from "@/components/ui/PsgShield";

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const adminLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/partidos", label: "Partidos & Actas", icon: CalendarCheck },
    { href: "/admin/jugadores", label: "Plantilla", icon: Users },
    { href: "/admin/rivales", label: "Rivales", icon: Shield },
    { href: "/admin/campos", label: "Campos", icon: MapPin },
  ];

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Handled
    }
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/90 backdrop-blur-xl">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        {/* Brand & CM Badge */}
        <div className="flex items-center gap-3.5 min-w-0">
          <Link href="/admin" className="flex items-center gap-3 focus-ring rounded-xl p-1">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-accent-cyan/40 bg-surface-elevated p-1 shadow-glow-subtle">
              <PsgShield size="sm" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-2xl font-black tracking-wider text-primary">
                  PSG
                </span>
                <span className="rounded border border-accent-cyan/30 bg-accent-cyan/15 px-2 py-0.5 font-display text-[11px] font-black tracking-widest text-accent-cyan">
                  BACKOFFICE
                </span>
              </div>
              <span className="flex items-center gap-1 font-display text-[10px] font-bold uppercase tracking-widest text-success">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />{" "}
                Modo Community Manager
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1.5 rounded-xl border border-white/10 bg-surface p-1.5 md:flex">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3.5 py-2 font-display text-xs font-bold uppercase tracking-wider transition-all focus-ring",
                  isActive
                    ? "border border-accent-cyan/40 bg-surface-elevated text-primary shadow-glow-subtle"
                    : "text-secondary hover:bg-white/5 hover:text-primary"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <Link
            href="/"
            target="_blank"
            className="hidden items-center gap-1.5 rounded-xl border border-white/10 bg-surface-elevated/40 px-3.5 py-2 font-display text-xs font-bold uppercase tracking-wider text-secondary transition-colors hover:border-accent-cyan hover:text-primary sm:flex focus-ring"
          >
            <ExternalLink className="h-3.5 w-3.5 text-accent-cyan" />
            <span>Ver Web</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-xl border border-danger/30 bg-danger/10 px-3.5 py-2 font-display text-xs font-bold uppercase tracking-wider text-danger transition-colors hover:bg-danger/20 hover:text-primary focus-ring"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Salir</span>
          </button>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-xl border border-white/10 bg-surface p-2.5 text-secondary hover:text-primary md:hidden focus-ring"
          >
            {mobileOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="space-y-1 border-t border-white/10 bg-background/95 px-4 py-3 backdrop-blur-2xl md:hidden">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 font-display text-sm font-bold uppercase tracking-wider transition-colors focus-ring",
                  isActive
                    ? "border border-accent-cyan/40 bg-surface-elevated text-primary shadow-glow-subtle"
                    : "text-secondary hover:bg-white/5 hover:text-primary"
                )}
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}
          <div className="border-t border-white/10 pt-2">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 rounded-lg px-4 py-3 font-display text-sm font-bold uppercase text-secondary hover:text-primary"
            >
              <ExternalLink className="h-4 w-4 text-accent-cyan" />
              <span>Abrir Web Pública</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
