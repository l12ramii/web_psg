import React from "react";
import { cn } from "@/lib/utils";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

export function InstagramIcon({ size = 20, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function TwitchIcon({ size = 20, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path d="M2.149 0l-1.612 4.119v16.036h5.331v3.845h3.853l3.845-3.845h4.819l5.615-5.615v-14.544h-21.851zm19.702 13.435l-3.211 3.21h-4.819l-3.208 3.21v-3.21h-4.281v-14.543h15.519v11.333zm-4.281-7.489h-2.14v6.417h2.14v-6.417zm-5.349 0h-2.14v6.417h2.14v-6.417z" />
    </svg>
  );
}

export function YoutubeIcon({ size = 20, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export function SocialIcon({
  network,
  size = 20,
  className,
  ...props
}: IconProps & { network: "instagram" | "twitch" | "youtube" }) {
  switch (network) {
    case "instagram":
      return <InstagramIcon size={size} className={className} {...props} />;
    case "twitch":
      return <TwitchIcon size={size} className={className} {...props} />;
    case "youtube":
      return <YoutubeIcon size={size} className={className} {...props} />;
    default:
      return null;
  }
}

