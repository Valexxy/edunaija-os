/**
 * Deterministic Procedural Scholar Avatar Engine
 * 
 * Generates vibrant, distinct Nigerian scholar avatars in pure SVG
 * based on user name or ID hash.
 * 
 * Benefits:
 * - 0 KB external image assets or HTTP requests
 * - 0 S3 or Supabase Storage cost
 * - 100% deterministic (same student always gets the exact same avatar)
 * - Ultra-fast sub-millisecond client rendering
 */

const NIGERIAN_SCHOLAR_PALETTES = [
  { bg1: "#0F766E", bg2: "#14B8A6", text: "#FFFFFF", ring: "#2DD4BF" }, // Emerald / Teal (Science)
  { bg1: "#1E40AF", bg2: "#3B82F6", text: "#FFFFFF", ring: "#60A5FA" }, // Royal Blue (Olympiad)
  { bg1: "#7E22CE", bg2: "#A855F7", text: "#FFFFFF", ring: "#C084FC" }, // Amethyst (Arts & Jurists)
  { bg1: "#C2410C", bg2: "#FB923C", text: "#FFFFFF", ring: "#FDBA74" }, // Bronze / Terracotta (Culture)
  { bg1: "#B45309", bg2: "#F59E0B", text: "#FFFFFF", ring: "#FCD34D" }, // Gold / Amber (Championship)
  { bg1: "#065F46", bg2: "#10B981", text: "#FFFFFF", ring: "#34D399" }, // Deep Forest (Agriculture)
  { bg1: "#3730A3", bg2: "#6366F1", text: "#FFFFFF", ring: "#818CF8" }, // Indigo / Tech (Computing)
  { bg1: "#831843", bg2: "#EC4899", text: "#FFFFFF", ring: "#F472B6" }, // Crimson Rose (Literature)
];

/**
 * Computes a simple deterministic 32-bit integer hash from string
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Extracts 2-letter uppercase initials from name
 */
export function getInitials(name: string): string {
  if (!name) return "NG";
  const clean = name.replace(/[^a-zA-Z\s]/g, "").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "SC";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export interface ScholarAvatarConfig {
  name: string;
  size?: number;
  showBadge?: boolean;
}

/**
 * Generates an SVG Data URI string that can be used directly as an <img src="..." />
 */
export function getScholarAvatarDataUri(name: string, size: number = 44): string {
  const hash = hashString(name);
  const palette = NIGERIAN_SCHOLAR_PALETTES[hash % NIGERIAN_SCHOLAR_PALETTES.length];
  const initials = getInitials(name);
  const gradId = `grad_${hash % 1000}`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">
    <defs>
      <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${palette.bg1}" />
        <stop offset="100%" stop-color="${palette.bg2}" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#${gradId})" stroke="${palette.ring}" stroke-width="3" />
    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1.5" stroke-dasharray="4 2" />
    <text x="50" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="800" fill="${palette.text}" text-anchor="middle" letter-spacing="1">
      ${initials}
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
