// ============================================================
// HDRI ENVIRONMENT + LIGHTING PRESETS
// Free Poly Haven CDN (CC0) + drei built-in presets
// ============================================================

export interface HDRIEnvironment {
  id: string;
  name: string;
  url: string;
  thumb: string;
  category: "studio" | "interior" | "outdoor" | "sunset" | "night";
  source: string;
}

const PH = "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k";
const PH_THUMB = "https://cdn.polyhaven.com/asset_img/primary";

export const HDRI_LIBRARY: HDRIEnvironment[] = [
  {
    id: "studio_small_03",
    name: "Photo Studio",
    url: `${PH}/studio_small_03_1k.hdr`,
    thumb: `${PH_THUMB}/studio_small_03.png?height=180`,
    category: "studio",
    source: "Poly Haven (CC0)",
  },
  {
    id: "brown_photostudio_02",
    name: "Brown Studio",
    url: `${PH}/brown_photostudio_02_1k.hdr`,
    thumb: `${PH_THUMB}/brown_photostudio_02.png?height=180`,
    category: "studio",
    source: "Poly Haven (CC0)",
  },
  {
    id: "venice_sunset",
    name: "Venice Sunset",
    url: `${PH}/venice_sunset_1k.hdr`,
    thumb: `${PH_THUMB}/venice_sunset.png?height=180`,
    category: "sunset",
    source: "Poly Haven (CC0)",
  },
  {
    id: "kloppenheim_06",
    name: "Sunny Plaza",
    url: `${PH}/kloppenheim_06_1k.hdr`,
    thumb: `${PH_THUMB}/kloppenheim_06.png?height=180`,
    category: "outdoor",
    source: "Poly Haven (CC0)",
  },
  {
    id: "city_night",
    name: "City Night",
    url: `${PH}/dikhololo_night_1k.hdr`,
    thumb: `${PH_THUMB}/dikhololo_night.png?height=180`,
    category: "night",
    source: "Poly Haven (CC0)",
  },
  {
    id: "lobby",
    name: "Hotel Lobby",
    url: `${PH}/hotel_room_1k.hdr`,
    thumb: `${PH_THUMB}/hotel_room.png?height=180`,
    category: "interior",
    source: "Poly Haven (CC0)",
  },
];

// Drei built-in presets (no download)
export const DREI_PRESETS = [
  "studio", "sunset", "dawn", "night", "warehouse",
  "forest", "apartment", "city", "park", "lobby",
] as const;
export type DreiPreset = typeof DREI_PRESETS[number];

// Lighting presets — keyed by mood
export interface LightingPreset {
  id: string;
  name: string;
  description: string;
  ambient: number;
  keyIntensity: number;
  keyPosition: [number, number, number];
  fillIntensity: number;
  rimIntensity: number;
  shadows: boolean;
}

export const LIGHTING_PRESETS: LightingPreset[] = [
  {
    id: "studio",
    name: "Studio",
    description: "Balanced 3-point lighting",
    ambient: 0.35, keyIntensity: 0.9, keyPosition: [4, 6, 4],
    fillIntensity: 0.25, rimIntensity: 0.4, shadows: true,
  },
  {
    id: "dramatic",
    name: "Dramatic",
    description: "High-contrast editorial",
    ambient: 0.1, keyIntensity: 1.6, keyPosition: [5, 4, 2],
    fillIntensity: 0.05, rimIntensity: 0.8, shadows: true,
  },
  {
    id: "soft",
    name: "Soft Box",
    description: "Even diffused light",
    ambient: 0.6, keyIntensity: 0.5, keyPosition: [0, 5, 5],
    fillIntensity: 0.5, rimIntensity: 0.2, shadows: false,
  },
  {
    id: "runway",
    name: "Runway",
    description: "Bright top-down",
    ambient: 0.25, keyIntensity: 1.2, keyPosition: [0, 8, 0],
    fillIntensity: 0.3, rimIntensity: 0.6, shadows: true,
  },
  {
    id: "showroom",
    name: "Showroom",
    description: "Warm boutique glow",
    ambient: 0.45, keyIntensity: 0.7, keyPosition: [3, 5, 3],
    fillIntensity: 0.4, rimIntensity: 0.3, shadows: true,
  },
];
