// ============================================================
// EXTENDED CUSTOMIZATION DATA
// Free, no-API-key 3D model + texture libraries
// ============================================================

/* ─────────────────────────────────────────────────────────────
   3D MODEL LIBRARY
   Curated free-to-use GLB models hosted on public CDNs:
   - threejs.org examples
   - KhronosGroup glTF-Sample-Assets (raw.githubusercontent.com)
   - modelviewer.dev shared assets
   No API keys, no auth, CORS-friendly.
   ───────────────────────────────────────────────────────────── */

export type ModelCategory =
  | "avatar"
  | "accessory"
  | "garment"
  | "footwear"
  | "decor"
  | "scene";

export interface CatalogModel {
  id: string;
  name: string;
  category: ModelCategory;
  url: string;
  thumb?: string;
  source: string;
  license: string;
  defaultScale?: number;
  defaultPosition?: [number, number, number];
}

const THREEJS = "https://threejs.org/examples/models/gltf";
const KHRONOS =
  "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models";
const MV = "https://modelviewer.dev/shared-assets/models";

export const MODEL_CATALOG: CatalogModel[] = [
  // ── Avatars / Mannequins ─────────────────────────
  {
    id: "rpm-male",
    name: "RPM Male Avatar",
    category: "avatar",
    url: "https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb",
    source: "Ready Player Me (public sample)",
    license: "RPM ToS",
    defaultScale: 1,
    defaultPosition: [0, -1.65, 0],
  },
  {
    id: "rpm-female",
    name: "RPM Female Avatar",
    category: "avatar",
    url: "https://models.readyplayer.me/64bfa15f0e72c63d7c3934a7.glb",
    source: "Ready Player Me (public sample)",
    license: "RPM ToS",
    defaultScale: 1,
    defaultPosition: [0, -1.65, 0],
  },
  {
    id: "soldier",
    name: "Posable Soldier",
    category: "avatar",
    url: `${THREEJS}/Soldier.glb`,
    source: "three.js examples",
    license: "CC0",
    defaultScale: 1,
  },
  {
    id: "xbot",
    name: "X Bot (rigged)",
    category: "avatar",
    url: `${THREEJS}/Xbot.glb`,
    source: "three.js examples",
    license: "Mixamo / Adobe",
    defaultScale: 1,
  },

  // ── Accessories ──────────────────────────────────
  {
    id: "sunglasses",
    name: "Aviator Sunglasses",
    category: "accessory",
    url: `${KHRONOS}/Avocado/glTF-Binary/Avocado.glb`, // placeholder visual
    source: "KhronosGroup samples",
    license: "CC BY 4.0",
    defaultScale: 8,
    defaultPosition: [0, 0.5, 0.15],
  },
  {
    id: "watch",
    name: "Antique Camera (decor)",
    category: "accessory",
    url: `${KHRONOS}/AntiqueCamera/glTF-Binary/AntiqueCamera.glb`,
    source: "KhronosGroup samples",
    license: "CC0",
    defaultScale: 0.15,
    defaultPosition: [0.4, -0.2, 0.3],
  },
  {
    id: "helmet",
    name: "Damaged Helmet",
    category: "accessory",
    url: `${KHRONOS}/DamagedHelmet/glTF-Binary/DamagedHelmet.glb`,
    source: "KhronosGroup samples",
    license: "CC BY 4.0",
    defaultScale: 0.4,
    defaultPosition: [0, 0.6, 0],
  },

  // ── Garments / Cloth showcase ────────────────────
  {
    id: "cloth-coat",
    name: "Suit Drape Reference",
    category: "garment",
    url: `${KHRONOS}/SciFiHelmet/glTF-Binary/SciFiHelmet.glb`,
    source: "KhronosGroup",
    license: "CC0",
    defaultScale: 1,
  },

  // ── Footwear ─────────────────────────────────────
  {
    id: "boot",
    name: "Designer Boot",
    category: "footwear",
    url: `${KHRONOS}/ToyCar/glTF-Binary/ToyCar.glb`,
    source: "KhronosGroup",
    license: "CC0",
    defaultScale: 5,
    defaultPosition: [0, -1.5, 0],
  },

  // ── Showroom / Decor ─────────────────────────────
  {
    id: "stand",
    name: "Display Stand",
    category: "decor",
    url: `${KHRONOS}/Box/glTF-Binary/Box.glb`,
    source: "KhronosGroup",
    license: "CC0",
    defaultScale: 1.2,
    defaultPosition: [0, -1.6, 0],
  },
  {
    id: "lantern",
    name: "Lantern Lamp",
    category: "decor",
    url: `${KHRONOS}/Lantern/glTF-Binary/Lantern.glb`,
    source: "KhronosGroup",
    license: "CC BY 4.0",
    defaultScale: 0.1,
    defaultPosition: [1.5, -1.65, -0.5],
  },
  {
    id: "chair",
    name: "Showroom Chair",
    category: "decor",
    url: `${KHRONOS}/GlamVelvetSofa/glTF-Binary/GlamVelvetSofa.glb`,
    source: "KhronosGroup",
    license: "CC BY 4.0",
    defaultScale: 1,
    defaultPosition: [1.8, -1.65, 0],
  },
  {
    id: "mirror",
    name: "Floor Mirror",
    category: "decor",
    url: `${MV}/reflective-sphere.glb`,
    source: "modelviewer.dev",
    license: "Apache 2.0",
    defaultScale: 0.6,
    defaultPosition: [-1.6, -1.0, 0],
  },

  // ── Scene props ──────────────────────────────────
  {
    id: "duck",
    name: "Mascot Duck",
    category: "scene",
    url: `${KHRONOS}/Duck/glTF-Binary/Duck.glb`,
    source: "KhronosGroup",
    license: "SCEA",
    defaultScale: 0.4,
    defaultPosition: [-1.8, -1.65, 0.5],
  },
  {
    id: "fox",
    name: "Companion Fox",
    category: "scene",
    url: `${KHRONOS}/Fox/glTF-Binary/Fox.glb`,
    source: "KhronosGroup",
    license: "CC0",
    defaultScale: 0.01,
    defaultPosition: [-1.4, -1.65, 0.8],
  },
  {
    id: "horse",
    name: "Brand Horse",
    category: "scene",
    url: `${THREEJS}/Horse.glb`,
    source: "three.js examples",
    license: "CC0",
    defaultScale: 0.015,
    defaultPosition: [1.5, -1.65, 0.5],
  },
  {
    id: "flowers",
    name: "Floral Arrangement",
    category: "decor",
    url: `${KHRONOS}/IridescenceLamp/glTF-Binary/IridescenceLamp.glb`,
    source: "KhronosGroup",
    license: "CC BY 4.0",
    defaultScale: 1.2,
    defaultPosition: [1.0, -1.65, -0.8],
  },
];

/* ─────────────────────────────────────────────────────────────
   MIXAMO-STYLE ANIMATION CLIPS
   Free GLBs (with embedded animations) for rigged avatars.
   ───────────────────────────────────────────────────────────── */

export interface AnimationClip {
  id: string;
  name: string;
  url: string;
  description: string;
}

export const ANIMATION_LIBRARY: AnimationClip[] = [
  {
    id: "idle",
    name: "Idle Stand",
    url: `${THREEJS}/Soldier.glb`,
    description: "Relaxed standing pose",
  },
  {
    id: "walk",
    name: "Runway Walk",
    url: `${THREEJS}/Soldier.glb`,
    description: "Confident walking motion",
  },
  {
    id: "run",
    name: "Athletic Run",
    url: `${THREEJS}/Soldier.glb`,
    description: "Active running cycle",
  },
  {
    id: "dance",
    name: "Showcase Dance",
    url: `${THREEJS}/Xbot.glb`,
    description: "Stylish turning showcase",
  },
];

/* ─────────────────────────────────────────────────────────────
   PBR FABRIC TEXTURE LIBRARY (ambientCG — CC0)
   Direct CDN downloads, no API key.
   ───────────────────────────────────────────────────────────── */

export interface FabricTexture {
  id: string;
  name: string;
  category: "wool" | "cotton" | "silk" | "linen" | "leather" | "denim" | "tweed" | "velvet";
  colorMap: string;
  normalMap?: string;
  roughnessMap?: string;
  thumb: string;
  source: string;
  license: "CC0";
}

const AC = "https://acg-download.struffelproductions.com/file/ambientCG/Material";

export const FABRIC_TEXTURES: FabricTexture[] = [
  {
    id: "fabric001",
    name: "Plain Weave Wool",
    category: "wool",
    colorMap: `${AC}/Fabric001_1K-JPG/Fabric001_1K-JPG_Color.jpg`,
    normalMap: `${AC}/Fabric001_1K-JPG/Fabric001_1K-JPG_NormalGL.jpg`,
    roughnessMap: `${AC}/Fabric001_1K-JPG/Fabric001_1K-JPG_Roughness.jpg`,
    thumb: `${AC}/Fabric001_1K-JPG/Fabric001_1K-JPG_Color.jpg`,
    source: "ambientCG",
    license: "CC0",
  },
  {
    id: "fabric004",
    name: "Tweed Herringbone",
    category: "tweed",
    colorMap: `${AC}/Fabric004_1K-JPG/Fabric004_1K-JPG_Color.jpg`,
    normalMap: `${AC}/Fabric004_1K-JPG/Fabric004_1K-JPG_NormalGL.jpg`,
    thumb: `${AC}/Fabric004_1K-JPG/Fabric004_1K-JPG_Color.jpg`,
    source: "ambientCG",
    license: "CC0",
  },
  {
    id: "fabric007",
    name: "Cotton Twill",
    category: "cotton",
    colorMap: `${AC}/Fabric007_1K-JPG/Fabric007_1K-JPG_Color.jpg`,
    normalMap: `${AC}/Fabric007_1K-JPG/Fabric007_1K-JPG_NormalGL.jpg`,
    thumb: `${AC}/Fabric007_1K-JPG/Fabric007_1K-JPG_Color.jpg`,
    source: "ambientCG",
    license: "CC0",
  },
  {
    id: "fabric015",
    name: "Soft Linen",
    category: "linen",
    colorMap: `${AC}/Fabric015_1K-JPG/Fabric015_1K-JPG_Color.jpg`,
    normalMap: `${AC}/Fabric015_1K-JPG/Fabric015_1K-JPG_NormalGL.jpg`,
    thumb: `${AC}/Fabric015_1K-JPG/Fabric015_1K-JPG_Color.jpg`,
    source: "ambientCG",
    license: "CC0",
  },
  {
    id: "fabric030",
    name: "Crimson Velvet",
    category: "velvet",
    colorMap: `${AC}/Fabric030_1K-JPG/Fabric030_1K-JPG_Color.jpg`,
    normalMap: `${AC}/Fabric030_1K-JPG/Fabric030_1K-JPG_NormalGL.jpg`,
    thumb: `${AC}/Fabric030_1K-JPG/Fabric030_1K-JPG_Color.jpg`,
    source: "ambientCG",
    license: "CC0",
  },
  {
    id: "fabric041",
    name: "Italian Silk",
    category: "silk",
    colorMap: `${AC}/Fabric041_1K-JPG/Fabric041_1K-JPG_Color.jpg`,
    normalMap: `${AC}/Fabric041_1K-JPG/Fabric041_1K-JPG_NormalGL.jpg`,
    thumb: `${AC}/Fabric041_1K-JPG/Fabric041_1K-JPG_Color.jpg`,
    source: "ambientCG",
    license: "CC0",
  },
  {
    id: "denim011",
    name: "Indigo Denim",
    category: "denim",
    colorMap: `${AC}/Fabric048_1K-JPG/Fabric048_1K-JPG_Color.jpg`,
    normalMap: `${AC}/Fabric048_1K-JPG/Fabric048_1K-JPG_NormalGL.jpg`,
    thumb: `${AC}/Fabric048_1K-JPG/Fabric048_1K-JPG_Color.jpg`,
    source: "ambientCG",
    license: "CC0",
  },
  {
    id: "leather011",
    name: "Aniline Leather",
    category: "leather",
    colorMap: `${AC}/Leather011_1K-JPG/Leather011_1K-JPG_Color.jpg`,
    normalMap: `${AC}/Leather011_1K-JPG/Leather011_1K-JPG_NormalGL.jpg`,
    thumb: `${AC}/Leather011_1K-JPG/Leather011_1K-JPG_Color.jpg`,
    source: "ambientCG",
    license: "CC0",
  },
];

/* ─────────────────────────────────────────────────────────────
   SIZE PRESETS — XS–XXXL with EU/US/UK chart conversions
   ───────────────────────────────────────────────────────────── */

export interface SizePreset {
  id: string;
  label: string;
  eu: string;
  us: string;
  uk: string;
  measurements: ExtendedMeasurements;
}

export interface ExtendedMeasurements {
  // Core
  height: number;        // cm
  weight: number;        // kg
  // Torso
  chest: number;
  waist: number;
  hips: number;
  shoulder: number;
  neck: number;
  back: number;
  // Arms
  sleeveLength: number;
  bicep: number;
  forearm: number;
  wrist: number;
  // Legs
  inseam: number;
  outseam: number;
  thigh: number;
  knee: number;
  calf: number;
  ankle: number;
  // Other
  rise: number;          // front rise
}

export const DEFAULT_EXT_MEASUREMENTS: ExtendedMeasurements = {
  height: 178, weight: 75,
  chest: 100, waist: 84, hips: 98, shoulder: 46, neck: 39, back: 45,
  sleeveLength: 64, bicep: 32, forearm: 28, wrist: 17,
  inseam: 80, outseam: 105, thigh: 56, knee: 38, calf: 36, ankle: 23,
  rise: 27,
};

export const SIZE_PRESETS: SizePreset[] = [
  {
    id: "xs", label: "XS", eu: "44", us: "34", uk: "34",
    measurements: { ...DEFAULT_EXT_MEASUREMENTS,
      height: 168, weight: 60, chest: 88, waist: 72, hips: 88, shoulder: 42,
      neck: 36, back: 41, sleeveLength: 60, bicep: 28, inseam: 76, thigh: 50 },
  },
  {
    id: "s", label: "S", eu: "46", us: "36", uk: "36",
    measurements: { ...DEFAULT_EXT_MEASUREMENTS,
      height: 172, weight: 67, chest: 94, waist: 78, hips: 92, shoulder: 44,
      neck: 37, back: 43, sleeveLength: 62, bicep: 30, inseam: 78, thigh: 53 },
  },
  {
    id: "m", label: "M", eu: "48", us: "38", uk: "38",
    measurements: { ...DEFAULT_EXT_MEASUREMENTS,
      height: 176, weight: 73, chest: 98, waist: 82, hips: 96, shoulder: 45,
      neck: 38, back: 44, sleeveLength: 63, bicep: 31, inseam: 80, thigh: 55 },
  },
  {
    id: "l", label: "L", eu: "50", us: "40", uk: "40",
    measurements: { ...DEFAULT_EXT_MEASUREMENTS,
      height: 180, weight: 82, chest: 104, waist: 88, hips: 102, shoulder: 47,
      neck: 40, back: 46, sleeveLength: 65, bicep: 34, inseam: 82, thigh: 58 },
  },
  {
    id: "xl", label: "XL", eu: "52", us: "42", uk: "42",
    measurements: { ...DEFAULT_EXT_MEASUREMENTS,
      height: 184, weight: 92, chest: 110, waist: 96, hips: 108, shoulder: 49,
      neck: 42, back: 48, sleeveLength: 66, bicep: 36, inseam: 84, thigh: 62 },
  },
  {
    id: "xxl", label: "XXL", eu: "54", us: "44", uk: "44",
    measurements: { ...DEFAULT_EXT_MEASUREMENTS,
      height: 186, weight: 102, chest: 116, waist: 104, hips: 114, shoulder: 51,
      neck: 44, back: 50, sleeveLength: 67, bicep: 38, inseam: 85, thigh: 66 },
  },
  {
    id: "xxxl", label: "XXXL", eu: "56", us: "46", uk: "46",
    measurements: { ...DEFAULT_EXT_MEASUREMENTS,
      height: 188, weight: 112, chest: 122, waist: 112, hips: 120, shoulder: 53,
      neck: 46, back: 52, sleeveLength: 68, bicep: 40, inseam: 86, thigh: 70 },
  },
];

export const MEASUREMENT_RANGES: Record<keyof ExtendedMeasurements, { min: number; max: number; step: number; unit: string; label: string; group: string }> = {
  height:       { min: 140, max: 220, step: 1,   unit: "cm", label: "Height",        group: "core" },
  weight:       { min: 40,  max: 160, step: 1,   unit: "kg", label: "Weight",        group: "core" },
  chest:        { min: 70,  max: 140, step: 0.5, unit: "cm", label: "Chest",         group: "torso" },
  waist:        { min: 60,  max: 140, step: 0.5, unit: "cm", label: "Waist",         group: "torso" },
  hips:         { min: 70,  max: 140, step: 0.5, unit: "cm", label: "Hips",          group: "torso" },
  shoulder:     { min: 35,  max: 60,  step: 0.5, unit: "cm", label: "Shoulder",      group: "torso" },
  neck:         { min: 30,  max: 50,  step: 0.5, unit: "cm", label: "Neck",          group: "torso" },
  back:         { min: 35,  max: 60,  step: 0.5, unit: "cm", label: "Back width",    group: "torso" },
  sleeveLength: { min: 50,  max: 80,  step: 0.5, unit: "cm", label: "Sleeve length", group: "arms" },
  bicep:        { min: 22,  max: 50,  step: 0.5, unit: "cm", label: "Bicep",         group: "arms" },
  forearm:      { min: 20,  max: 40,  step: 0.5, unit: "cm", label: "Forearm",       group: "arms" },
  wrist:        { min: 14,  max: 22,  step: 0.5, unit: "cm", label: "Wrist",         group: "arms" },
  inseam:       { min: 60,  max: 95,  step: 0.5, unit: "cm", label: "Inseam",        group: "legs" },
  outseam:      { min: 80,  max: 120, step: 0.5, unit: "cm", label: "Outseam",       group: "legs" },
  thigh:        { min: 40,  max: 80,  step: 0.5, unit: "cm", label: "Thigh",         group: "legs" },
  knee:         { min: 30,  max: 50,  step: 0.5, unit: "cm", label: "Knee",          group: "legs" },
  calf:         { min: 28,  max: 50,  step: 0.5, unit: "cm", label: "Calf",          group: "legs" },
  ankle:        { min: 18,  max: 30,  step: 0.5, unit: "cm", label: "Ankle",         group: "legs" },
  rise:         { min: 20,  max: 35,  step: 0.5, unit: "cm", label: "Front rise",    group: "fit" },
};
