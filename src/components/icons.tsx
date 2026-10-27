import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = (p: P) => ({
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...p,
});

export const HeartIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M19.5 12.6 12 20l-7.5-7.4A5 5 0 1 1 12 6.3a5 5 0 1 1 7.5 6.3Z" />
  </svg>
);
export const SproutIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 20v-8" />
    <path d="M12 12c0-4 3-7 8-7 0 4-3 7-8 7Z" />
    <path d="M12 14c0-3-2.5-5-6-5 0 3 2.5 5 6 5Z" />
    <path d="M5 20h14" />
  </svg>
);
export const SchoolIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="m4 10 8-5 8 5-8 5-8-5Z" />
    <path d="M6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />
    <path d="M20 10v6" />
  </svg>
);
export const HomeIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="m3 11 9-8 9 8" />
    <path d="M5 9.5V21h14V9.5" />
    <path d="M10 21v-6h4v6" />
  </svg>
);
export const MedicalIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" strokeWidth="2.4" />
    <rect x="3" y="3" width="18" height="18" rx="4" />
  </svg>
);
export const MealIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 11h16a8 8 0 0 0-16 0Z" />
    <path d="M2 15h20" />
    <path d="M8 21h8" />
    <path d="M12 3c-.8.9-.8 1.6 0 2.5" />
  </svg>
);
export const ShieldIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3 5 6v5c0 5 3 8.4 7 10 4-1.6 7-5 7-10V6l-7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);
export const CheckIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="m4.5 12.5 5 5 10-11" />
  </svg>
);
export const ArrowRightIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 12h16m-6-6 6 6-6 6" />
  </svg>
);
export const ShareIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="18" cy="6" r="2.5" />
    <circle cx="18" cy="18" r="2.5" />
    <path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6" />
  </svg>
);
export const CopyIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" transform="translate(2 2)" />
  </svg>
);
export const WhatsAppIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3Z" />
    <path d="M9 8.5c0 4 2.5 6.5 6.5 6.5l.9-1.8-2.2-1.2-1 .9c-1.2-.5-2-1.3-2.5-2.5l.9-1-1.2-2.2L9 8.5Z" />
  </svg>
);
export const MenuIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);
export const XIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);
export const LockIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);
export const PhoneIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
  </svg>
);
export const MailIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);
export const PinIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 21s-7-5.8-7-11a7 7 0 1 1 14 0c0 5.2-7 11-7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);
export const BankIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="m3 9 9-5 9 5" />
    <path d="M5 9v9M10 9v9M14 9v9M19 9v9" />
    <path d="M3 20h18" />
  </svg>
);
export const CardIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="6" width="18" height="13" rx="2" />
    <path d="M3 10h18M7 15h4" />
  </svg>
);
export const DownloadIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 4v11m0 0-4-4m4 4 4-4" />
    <path d="M4 19h16" />
  </svg>
);
export const EyeIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" />
    <circle cx="12" cy="12" r="2.8" />
  </svg>
);
export const ClockIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </svg>
);
export const SearchIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);
export const UsersIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="9" cy="8.5" r="3.5" />
    <path d="M3 20c.5-3.5 3-5.5 6-5.5s5.5 2 6 5.5" />
    <path d="M16 5.5a3.5 3.5 0 0 1 0 6.6M17.5 14.7c2 .7 3.2 2.5 3.5 5.3" />
  </svg>
);
export const GlobeIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
  </svg>
);
export const Logo = ({ className = "h-10 w-10" }: { className?: string }) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
    <circle cx="24" cy="24" r="22" fill="var(--color-forest-800)" />
    <circle cx="24" cy="24" r="22" fill="none" stroke="var(--color-gold-400)" strokeWidth="2" />
    <path
      d="M24 33.5 15.5 25a5.6 5.6 0 0 1 8.5-7.2A5.6 5.6 0 0 1 32.5 25L24 33.5Z"
      fill="var(--color-gold-400)"
    />
    <path
      d="M24 30c0-3.4 2.4-6 6.4-6 0 3.4-2.4 6-6.4 6Z"
      fill="var(--color-forest-950)"
      opacity="0.55"
    />
  </svg>
);
