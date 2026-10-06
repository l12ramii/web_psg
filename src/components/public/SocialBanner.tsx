import React from "react";
import Link from "next/link";
import { ExternalLink, Radio, Sparkles, Video, Camera } from "lucide-react";
import { SOCIAL_LINKS_LIST, SocialLink } from "@/lib/constants";
import { SocialIcon } from "@/components/ui/SocialIcons";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function SocialBanner() {
  return (
    <section className="container mx-auto px-4">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-surface to-background p-6 inner-light sm:p-10 md:p-12">
        {/* Background glow effects */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-accent-cyan/10 blur-[100px]" />
        <div className="pointer-events-none absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-[#9146FF]/10 blur-[100px]" />

        {/* Tiger Claw Watermark */}
        <svg
          viewBox="0 0 100 100"
          fill="currentColor"
          className="pointer-events-none absolute -right-6 -top-6 h-48 w-48 text-accent-cyan opacity-5 md:h-64 md:w-64"
        >
          <path d="M20 5 C 32 35, 38 65, 12 95 C 26 70, 42 35, 28 5 Z" />
          <path d="M50 2 C 62 35, 68 70, 42 98 C 56 75, 72 38, 58 2 Z" />
          <path d="M80 12 C 92 40, 96 72, 74 96 C 86 75, 100 45, 88 12 Z" />
        </svg>

        {/* Section Header */}
        <div className="relative z-10 mb-10 text-center sm:text-left sm:flex sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-3.5 py-1 font-display text-xs font-bold uppercase tracking-widest text-accent-cyan shadow-glow-subtle">
              <Radio className="h-3.5 w-3.5 animate-pulse text-accent-cyan" />
              <span>Canales Oficiales & Multimedia</span>
            </div>
            <h2 className="font-display text-3xl font-black uppercase tracking-tight text-primary sm:text-4xl md:text-5xl">
              Vive el PSG F7 en <span className="text-glow-subtle text-accent-cyan">Redes</span>
            </h2>
            <p className="mt-2 text-sm text-secondary sm:text-base">
              Sigue el día a día del club: transmisiones en vivo de cada jornada, resúmenes con los mejores goles, fotos exclusivas y análisis del vestuario.
            </p>
          </div>
          <div className="mt-4 hidden sm:block">
            <span className="font-display text-xs font-bold uppercase tracking-widest text-secondary">
              #ForzaPSG · #F7Deportes
            </span>
          </div>
        </div>

        {/* Social Cards Grid */}
        <div className="relative z-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {SOCIAL_LINKS_LIST.map((social) => {
            const getIconBadge = () => {
              if (social.id === "instagram") return <Camera className="h-3.5 w-3.5 text-[#E1306C]" />;
              if (social.id === "twitch") return <Radio className="h-3.5 w-3.5 text-[#9146FF]" />;
              return <Video className="h-3.5 w-3.5 text-[#FF0000]" />;
            };

            const getPlatformTheme = () => {
              if (social.id === "instagram") {
                return {
                  cardBorder: "hover:border-[#E1306C]/50 hover:shadow-[0_0_30px_-5px_rgba(225,48,108,0.2)]",
                  iconContainer: "border-[#E1306C]/40 bg-[#E1306C]/10 text-[#E1306C]",
                  badgeBg: "bg-[#E1306C]/15 border-[#E1306C]/30 text-[#E1306C]",
                  btnHover: "hover:bg-[#E1306C] hover:border-[#E1306C] hover:text-white",
                };
              }
              if (social.id === "twitch") {
                return {
                  cardBorder: "hover:border-[#9146FF]/50 hover:shadow-[0_0_30px_-5px_rgba(145,70,255,0.25)]",
                  iconContainer: "border-[#9146FF]/40 bg-[#9146FF]/10 text-[#9146FF]",
                  badgeBg: "bg-[#9146FF]/15 border-[#9146FF]/30 text-[#9146FF]",
                  btnHover: "hover:bg-[#9146FF] hover:border-[#9146FF] hover:text-white",
                };
              }
              return {
                cardBorder: "hover:border-[#FF0000]/50 hover:shadow-[0_0_30px_-5px_rgba(255,0,0,0.2)]",
                iconContainer: "border-[#FF0000]/40 bg-[#FF0000]/10 text-[#FF0000]",
                badgeBg: "bg-[#FF0000]/15 border-[#FF0000]/30 text-[#FF0000]",
                btnHover: "hover:bg-[#FF0000] hover:border-[#FF0000] hover:text-white",
              };
            };

            const theme = getPlatformTheme();

            return (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative flex flex-col justify-between rounded-xl border border-white/10 bg-surface-elevated/70 p-6 transition-all duration-200 hover:-translate-y-1.5 focus-ring ${theme.cardBorder}`}
              >
                <div>
                  {/* Top bar with Icon & Badge */}
                  <div className="flex items-center justify-between gap-2 pb-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl border p-2.5 transition-transform duration-200 group-hover:scale-110 ${theme.iconContainer}`}
                    >
                      <SocialIcon network={social.id} size={24} />
                    </div>
                    <div
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-display text-[11px] font-bold uppercase tracking-wider ${theme.badgeBg}`}
                    >
                      {getIconBadge()}
                      <span>{social.badge}</span>
                    </div>
                  </div>

                  {/* Title & Handle */}
                  <div className="space-y-1">
                    <h3 className="font-display text-xl font-bold tracking-wide text-primary transition-colors">
                      {social.name}
                    </h3>
                    <p className="font-display text-xs font-semibold text-accent-cyan">
                      {social.handle}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="mt-3 text-xs leading-relaxed text-secondary">
                    {social.description}
                  </p>
                </div>

                {/* CTA Action Button */}
                <div className="mt-6 pt-4 border-t border-white/5">
                  <div
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-surface px-4 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-primary transition-all duration-200 group-hover:shadow-glow-subtle ${theme.btnHover}`}
                  >
                    <span>{social.ctaText}</span>
                    <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
