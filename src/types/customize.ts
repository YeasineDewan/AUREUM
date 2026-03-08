export interface BodyMeasurements {
  height: number;
  chest: number;
  waist: number;
  hips: number;
  shoulders: number;
  sleeveLength: number;
  inseam: number;
  neck: number;
  armLength: number;
  thigh: number;
  bodyType: "slim" | "athletic" | "average" | "broad" | "heavy";
  confidence: number;
  notes: string;
}

export interface FabricOption {
  id: string;
  name: string;
  color: string;
  roughness: number;
  metalness: number;
  bumpScale: number;
  price: number;
}

export interface ColorOption {
  id: string;
  name: string;
  hex: string;
  premium: number;
}

export interface StyleOption {
  id: string;
  name: string;
  shoulderMult: number;
  lapelMult: number;
  buttonCount: number;
  price: number;
}

export interface GarmentVisibility {
  jacket: boolean;
  shirt: boolean;
  trousers: boolean;
  belt: boolean;
  shoes: boolean;
  tie: boolean;
  vest: boolean;
}

export const FABRICS: FabricOption[] = [
  { id: "wool", name: "Italian Wool", color: "#2c2c2c", roughness: 0.85, metalness: 0.02, bumpScale: 0.015, price: 450 },
  { id: "linen", name: "Belgian Linen", color: "#c8b99a", roughness: 0.95, metalness: 0.0, bumpScale: 0.025, price: 320 },
  { id: "cotton", name: "Egyptian Cotton", color: "#f5f0e8", roughness: 0.9, metalness: 0.0, bumpScale: 0.01, price: 280 },
  { id: "cashmere", name: "Cashmere Blend", color: "#4a3f35", roughness: 0.75, metalness: 0.03, bumpScale: 0.008, price: 680 },
];

export const COLORS: ColorOption[] = [
  { id: "charcoal", name: "Charcoal", hex: "#2c2c2c", premium: 0 },
  { id: "navy", name: "Navy", hex: "#1a2744", premium: 0 },
  { id: "burgundy", name: "Burgundy", hex: "#5c1a2a", premium: 25 },
  { id: "camel", name: "Camel", hex: "#c4a265", premium: 35 },
  { id: "slate", name: "Slate Grey", hex: "#6b7280", premium: 0 },
  { id: "cream", name: "Ivory", hex: "#f5f0e8", premium: 15 },
];

export const STYLES: StyleOption[] = [
  { id: "classic", name: "Classic", shoulderMult: 1.0, lapelMult: 1.0, buttonCount: 2, price: 0 },
  { id: "slim", name: "Slim Modern", shoulderMult: 0.92, lapelMult: 0.8, buttonCount: 2, price: 50 },
  { id: "doublebreasted", name: "Double Breasted", shoulderMult: 1.06, lapelMult: 1.3, buttonCount: 4, price: 120 },
  { id: "deconstructed", name: "Deconstructed", shoulderMult: 0.96, lapelMult: 0.6, buttonCount: 0, price: 80 },
];

export const BASE_TAILORING = 150;

export const DEFAULT_GARMENT_VISIBILITY: GarmentVisibility = {
  jacket: true,
  shirt: true,
  trousers: true,
  belt: true,
  shoes: true,
  tie: false,
  vest: false,
};

// Convert measurements to 3D scale multipliers
// Amplification factor makes small differences visually obvious
const AMP = 2.5; // amplifies deviation from baseline by 2.5×

function amplify(raw: number): number {
  // raw is ratio around 1.0 — amplify the delta
  return 1 + (raw - 1) * AMP;
}

export function measurementsToMorphTargets(m: BodyMeasurements) {
  // Normalize around "average" male proportions: 5'10", 40" chest, 34" waist
  const heightScale = amplify(m.height / 70);
  const chestScale = amplify(m.chest / 40);
  const waistScale = amplify(m.waist / 34);
  const hipScale = amplify(m.hips / 38);
  const shoulderScale = amplify(m.shoulders / 18);
  const legScale = amplify(m.inseam / 32);
  const armScale = amplify(m.sleeveLength / 25);

  return {
    heightScale,
    chestScale,
    waistScale,
    hipScale,
    shoulderScale,
    legScale,
    armScale,
  };
}
