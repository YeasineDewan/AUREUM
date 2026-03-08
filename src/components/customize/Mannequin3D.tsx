import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { StyleOption, GarmentVisibility, BodyMeasurements } from "@/types/customize";
import { measurementsToMorphTargets } from "@/types/customize";

/* ─────────────────────────────────────────────
   Pose & Skin Tone types
   ───────────────────────────────────────────── */

export type PosePreset = "standing" | "relaxed" | "akimbo";

export interface SkinTone {
  id: string;
  name: string;
  hex: string;
  faceTint: string;   // slightly darker for facial shadows
  lipTint: string;
}

export const SKIN_TONES: SkinTone[] = [
  { id: "fair",     name: "Fair",       hex: "#f5d6c3", faceTint: "#e8c4a8", lipTint: "#d4888a" },
  { id: "light",    name: "Light",      hex: "#d4a986", faceTint: "#c49070", lipTint: "#c47068" },
  { id: "medium",   name: "Medium",     hex: "#c68642", faceTint: "#a8703a", lipTint: "#a05848" },
  { id: "tan",      name: "Tan",        hex: "#a0724a", faceTint: "#8a5e3a", lipTint: "#8a4a3a" },
  { id: "brown",    name: "Brown",      hex: "#8d5524", faceTint: "#724420", lipTint: "#6a3828" },
  { id: "dark",     name: "Dark",       hex: "#5c3310", faceTint: "#4a280e", lipTint: "#4a2a1a" },
];

export const POSE_PRESETS: { id: PosePreset; name: string; icon: string }[] = [
  { id: "standing", name: "Standing", icon: "🧍" },
  { id: "relaxed",  name: "Relaxed",  icon: "😌" },
  { id: "akimbo",   name: "Arms Akimbo", icon: "🦸" },
];

function getPoseTransforms(pose: PosePreset) {
  switch (pose) {
    case "relaxed":
      return {
        leftArmRot:  [0, 0, 0.12] as [number, number, number],
        rightArmRot: [0, 0, -0.12] as [number, number, number],
        leftHandRot: [0, 0, 0.12] as [number, number, number],
        rightHandRot:[0, 0, -0.12] as [number, number, number],
        leftArmPos:  [-0.01, -0.01, 0] as [number, number, number],
        rightArmPos: [0.01, -0.01, 0] as [number, number, number],
        hipTilt: 0.02,
      };
    case "akimbo":
      return {
        leftArmRot:  [0.15, 0.2, 0.55] as [number, number, number],
        rightArmRot: [0.15, -0.2, -0.55] as [number, number, number],
        leftHandRot: [0.3, 0.3, 0.6] as [number, number, number],
        rightHandRot:[0.3, -0.3, -0.6] as [number, number, number],
        leftArmPos:  [-0.03, 0.02, 0.02] as [number, number, number],
        rightArmPos: [0.03, 0.02, 0.02] as [number, number, number],
        hipTilt: 0,
      };
    default: // standing
      return {
        leftArmRot:  [0, 0, 0] as [number, number, number],
        rightArmRot: [0, 0, 0] as [number, number, number],
        leftHandRot: [0, 0, 0] as [number, number, number],
        rightHandRot:[0, 0, 0] as [number, number, number],
        leftArmPos:  [0, 0, 0] as [number, number, number],
        rightArmPos: [0, 0, 0] as [number, number, number],
        hipTilt: 0,
      };
  }
}

/* ─────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────── */

type Section = { y: number; rx: number; rz: number; cx?: number; cz?: number };

function buildLimbMesh(sections: Section[], radialSegs = 24, smooth = true): THREE.BufferGeometry {
  const verts: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const rows = sections.length;
  for (let i = 0; i < rows; i++) {
    const s = sections[i];
    const cx = s.cx ?? 0;
    const cz = s.cz ?? 0;
    const v = i / (rows - 1);
    for (let j = 0; j <= radialSegs; j++) {
      const u = j / radialSegs;
      const theta = u * Math.PI * 2;
      const x = cx + Math.cos(theta) * s.rx;
      const z = cz + Math.sin(theta) * s.rz;
      verts.push(x, s.y, z);
      uvs.push(u, v);
      normals.push(Math.cos(theta), 0, Math.sin(theta));
    }
  }
  for (let i = 0; i < rows - 1; i++) {
    for (let j = 0; j < radialSegs; j++) {
      const a = i * (radialSegs + 1) + j;
      const b = a + radialSegs + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  if (smooth) geo.computeVertexNormals();
  return geo;
}

function interpolateSections(sections: Section[], subdivisions = 3) {
  const result: Section[] = [];
  for (let i = 0; i < sections.length - 1; i++) {
    const a = sections[i];
    const b = sections[i + 1];
    for (let t = 0; t < subdivisions; t++) {
      const f = t / subdivisions;
      const sf = 0.5 - 0.5 * Math.cos(f * Math.PI);
      result.push({
        y: a.y + (b.y - a.y) * sf,
        rx: a.rx + (b.rx - a.rx) * sf,
        rz: a.rz + (b.rz - a.rz) * sf,
        cx: (a.cx ?? 0) + ((b.cx ?? 0) - (a.cx ?? 0)) * sf,
        cz: (a.cz ?? 0) + ((b.cz ?? 0) - (a.cz ?? 0)) * sf,
      });
    }
  }
  result.push(sections[sections.length - 1]);
  return result;
}

/* ─────────────────────────────────────────────
   Fabric texture
   ───────────────────────────────────────────── */
function useFabricTexture(fabricId: string) {
  return useMemo(() => {
    const s = 512;
    const c = document.createElement("canvas");
    c.width = s; c.height = s;
    const x = c.getContext("2d")!;
    x.fillStyle = "#808080";
    x.fillRect(0, 0, s, s);
    if (fabricId.includes("wool") || fabricId === "tweed") {
      for (let y = 0; y < s; y += 2) for (let i = 0; i < s; i += 2) { const v = 120 + Math.random() * 16; x.fillStyle = `rgb(${v},${v},${v})`; x.fillRect(i, y, 2, 2); }
    } else if (fabricId.includes("linen")) {
      for (let y = 0; y < s; y += 3) { const v = 118 + Math.random() * 18; x.strokeStyle = `rgb(${v},${v},${v})`; x.lineWidth = 1; x.beginPath(); x.moveTo(0, y); x.lineTo(s, y); x.stroke(); }
    } else if (fabricId === "silk-blend") {
      for (let y = 0; y < s; y++) { const v = 128 + Math.sin(y * 0.08) * 5; x.strokeStyle = `rgb(${v},${v},${v})`; x.lineWidth = 0.4; x.beginPath(); x.moveTo(0, y); x.lineTo(s, y); x.stroke(); }
    } else {
      for (let y = 0; y < s; y += 2) for (let i = 0; i < s; i += 2) { const v = 125 + Math.random() * 8; x.fillStyle = `rgb(${v},${v},${v})`; x.fillRect(i, y, 2, 2); }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(10, 10);
    return tex;
  }, [fabricId]);
}

/* ─────────────────────────────────────────────
   Gender-aware body proportions
   ───────────────────────────────────────────── */
export type Gender = "male" | "female";

function getGenderMultipliers(gender: Gender) {
  if (gender === "female") {
    return {
      shoulderW: 0.88,   // narrower shoulders
      chestDepth: 1.12,  // bust
      waistNarrow: 0.88, // narrower waist
      hipWide: 1.15,     // wider hips
      armThin: 0.88,
      legThin: 0.92,
      neckThin: 0.85,
      headScale: 0.95,
    };
  }
  return {
    shoulderW: 1.0,
    chestDepth: 1.0,
    waistNarrow: 1.0,
    hipWide: 1.0,
    armThin: 1.0,
    legThin: 1.0,
    neckThin: 1.0,
    headScale: 1.0,
  };
}

/* ─────────────────────────────────────────────
   Body part geometry builders
   ───────────────────────────────────────────── */

function createTorso(cs: number, ws: number, hs: number, sw: number, g: ReturnType<typeof getGenderMultipliers>) {
  const sections = interpolateSections([
    { y: 1.42, rx: 0.06 * g.neckThin, rz: 0.055 * g.neckThin },
    { y: 1.38, rx: 0.10 * g.shoulderW, rz: 0.07 },
    { y: 1.32, rx: 0.21 * sw * g.shoulderW, rz: 0.11 },
    { y: 1.25, rx: 0.19 * cs * g.shoulderW, rz: 0.115 * cs * g.chestDepth },
    { y: 1.18, rx: 0.185 * cs * g.shoulderW, rz: 0.12 * cs * g.chestDepth },
    { y: 1.10, rx: 0.17 * cs, rz: 0.11 * cs * g.chestDepth },
    { y: 1.02, rx: 0.155 * ws * g.waistNarrow, rz: 0.10 * ws },
    { y: 0.94, rx: 0.135 * ws * g.waistNarrow, rz: 0.09 * ws },
    { y: 0.88, rx: 0.145 * hs * g.hipWide, rz: 0.095 * hs },
    { y: 0.82, rx: 0.17 * hs * g.hipWide, rz: 0.11 * hs },
    { y: 0.76, rx: 0.19 * hs * g.hipWide, rz: 0.12 * hs },
    { y: 0.70, rx: 0.185 * hs * g.hipWide, rz: 0.115 * hs },
    { y: 0.64, rx: 0.16 * g.hipWide, rz: 0.10 },
  ], 4);
  return buildLimbMesh(sections, 36);
}

function createHead(g: ReturnType<typeof getGenderMultipliers>) {
  const s = g.headScale;
  const sections = interpolateSections([
    { y: 1.72, rx: 0.005, rz: 0.005 },
    { y: 1.71, rx: 0.08 * s, rz: 0.085 * s },
    { y: 1.68, rx: 0.095 * s, rz: 0.10 * s },
    { y: 1.65, rx: 0.098 * s, rz: 0.105 * s },
    // Brow ridge
    { y: 1.625, rx: 0.099 * s, rz: 0.103 * s },
    { y: 1.62, rx: 0.097 * s, rz: 0.10 * s },
    // Temple
    { y: 1.605, rx: 0.096 * s, rz: 0.098 * s },
    // Cheekbone
    { y: 1.59, rx: 0.092 * s, rz: 0.09 * s },
    // Mid-face
    { y: 1.575, rx: 0.086 * s, rz: 0.085 * s },
    // Jaw angle
    { y: 1.555, rx: 0.078 * s, rz: 0.078 * s },
    { y: 1.54, rx: 0.068 * s, rz: 0.070 * s },
    // Chin
    { y: 1.525, rx: 0.050 * s, rz: 0.055 * s, cz: 0.008 },
    { y: 1.515, rx: 0.035 * s, rz: 0.040 * s, cz: 0.012 },
    { y: 1.505, rx: 0.020, rz: 0.025, cz: 0.015 },
  ], 4);
  return buildLimbMesh(sections, 32);
}

function createNeck(g: ReturnType<typeof getGenderMultipliers>) {
  const n = g.neckThin;
  const sections = interpolateSections([
    { y: 1.505, rx: 0.035 * n, rz: 0.035 * n },
    { y: 1.49, rx: 0.045 * n, rz: 0.042 * n },
    { y: 1.47, rx: 0.05 * n, rz: 0.048 * n },
    { y: 1.45, rx: 0.055 * n, rz: 0.052 * n },
    { y: 1.43, rx: 0.06 * n, rz: 0.055 * n },
  ], 3);
  return buildLimbMesh(sections, 20);
}

function createLeg(side: -1 | 1, hs: number, g: ReturnType<typeof getGenderMultipliers>) {
  const hipOffset = side * 0.085 * g.hipWide;
  const t = g.legThin;
  const sections = interpolateSections([
    { y: 0.68, rx: 0.085 * hs * t, rz: 0.09 * hs * t, cx: hipOffset },
    { y: 0.64, rx: 0.082 * t, rz: 0.085 * t, cx: hipOffset },
    { y: 0.58, rx: 0.078 * t, rz: 0.08 * t, cx: hipOffset * 0.9 },
    { y: 0.52, rx: 0.072 * t, rz: 0.074 * t, cx: hipOffset * 0.8 },
    { y: 0.46, rx: 0.065 * t, rz: 0.067 * t, cx: hipOffset * 0.7 },
    { y: 0.40, rx: 0.055 * t, rz: 0.058 * t, cx: hipOffset * 0.65 },
    { y: 0.36, rx: 0.050 * t, rz: 0.055 * t, cx: hipOffset * 0.6 },
    { y: 0.34, rx: 0.048 * t, rz: 0.053 * t, cx: hipOffset * 0.6 },
    { y: 0.31, rx: 0.050 * t, rz: 0.052 * t, cx: hipOffset * 0.6 },
    { y: 0.27, rx: 0.052 * t, rz: 0.050 * t, cx: hipOffset * 0.55 },
    { y: 0.22, rx: 0.048 * t, rz: 0.046 * t, cx: hipOffset * 0.5 },
    { y: 0.16, rx: 0.040 * t, rz: 0.038 * t, cx: hipOffset * 0.5 },
    { y: 0.10, rx: 0.034 * t, rz: 0.032 * t, cx: hipOffset * 0.5 },
    { y: 0.06, rx: 0.030, rz: 0.028, cx: hipOffset * 0.5 },
    { y: 0.04, rx: 0.028, rz: 0.026, cx: hipOffset * 0.5 },
    { y: 0.02, rx: 0.032, rz: 0.030, cx: hipOffset * 0.5 },
  ], 3);
  return buildLimbMesh(sections, 20);
}

function createFoot(side: -1 | 1, g: ReturnType<typeof getGenderMultipliers>) {
  const cx = side * 0.085 * g.hipWide * 0.5;
  const sections = interpolateSections([
    { y: 0.025, rx: 0.032, rz: 0.030, cx },
    { y: 0.015, rx: 0.035, rz: 0.045, cx, cz: 0.01 },
    { y: 0.005, rx: 0.038, rz: 0.06, cx, cz: 0.02 },
    { y: 0.0, rx: 0.037, rz: 0.065, cx, cz: 0.025 },
    { y: -0.008, rx: 0.030, rz: 0.055, cx, cz: 0.03 },
    { y: -0.015, rx: 0.015, rz: 0.04, cx, cz: 0.035 },
  ], 3);
  return buildLimbMesh(sections, 16);
}

function createArm(side: -1 | 1, sw: number, armScale: number, g: ReturnType<typeof getGenderMultipliers>) {
  const shoulderX = side * 0.22 * sw * g.shoulderW;
  const a = g.armThin;
  const sections = interpolateSections([
    { y: 1.33, rx: 0.052 * a, rz: 0.048 * a, cx: shoulderX },
    { y: 1.28, rx: 0.050 * a, rz: 0.046 * a, cx: shoulderX * 1.02 },
    { y: 1.22, rx: 0.045 * a, rz: 0.042 * a, cx: shoulderX * 1.03 },
    { y: 1.14, rx: 0.042 * a, rz: 0.040 * a, cx: shoulderX * 1.04 },
    { y: 1.06, rx: 0.038 * a, rz: 0.036 * a, cx: shoulderX * 1.04 },
    { y: 0.98, rx: 0.033 * a, rz: 0.032 * a, cx: shoulderX * 1.03 },
    { y: 0.94, rx: 0.031 * a, rz: 0.030 * a, cx: shoulderX * 1.02 },
    { y: 0.88, rx: 0.034 * a, rz: 0.032 * a, cx: shoulderX * 1.01 },
    { y: 0.80, rx: 0.030 * a, rz: 0.028 * a, cx: shoulderX },
    { y: 0.72, rx: 0.026 * a, rz: 0.024 * a, cx: shoulderX * 0.98 },
    // Wrist
    { y: 0.66, rx: 0.022 * a, rz: 0.018 * a, cx: shoulderX * 0.96 },
  ], 3);
  return buildLimbMesh(sections, 16);
}

/* ─────────────────────────────────────────────
   Detailed Hand with Individual Fingers
   ───────────────────────────────────────────── */

function createPalm(side: -1 | 1, sw: number, g: ReturnType<typeof getGenderMultipliers>) {
  const sx = side * 0.22 * sw * g.shoulderW * 0.96;
  const a = g.armThin;
  const sections = interpolateSections([
    // Wrist connection
    { y: 0.66, rx: 0.022 * a, rz: 0.015 * a, cx: sx },
    // Palm base (wider)
    { y: 0.635, rx: 0.030 * a, rz: 0.012 * a, cx: sx },
    // Palm middle (widest)
    { y: 0.61, rx: 0.033 * a, rz: 0.013 * a, cx: sx * 0.98 },
    // Knuckle line
    { y: 0.585, rx: 0.032 * a, rz: 0.012 * a, cx: sx * 0.97 },
    // Finger base
    { y: 0.575, rx: 0.028 * a, rz: 0.010 * a, cx: sx * 0.96 },
  ], 3);
  return buildLimbMesh(sections, 14);
}

interface FingerDef {
  offsetX: number; // lateral offset from palm center
  offsetZ: number; // front/back offset
  length: number;  // total finger length
  baseR: number;   // radius at base
  tipR: number;    // radius at tip
  segments: number; // section count
}

function createFinger(
  side: -1 | 1,
  sw: number,
  g: ReturnType<typeof getGenderMultipliers>,
  finger: FingerDef,
  startY: number
): THREE.BufferGeometry {
  const sx = side * 0.22 * sw * g.shoulderW * 0.96;
  const a = g.armThin;
  const cx = sx + side * finger.offsetX * a;
  const cz = finger.offsetZ;
  const numSections = finger.segments;
  const sections: Section[] = [];

  for (let i = 0; i <= numSections; i++) {
    const t = i / numSections;
    const y = startY - t * finger.length;
    // Slight bulge at knuckles (t=0.3 and t=0.6)
    const knuckle1 = 1 + 0.12 * Math.exp(-Math.pow((t - 0.3) * 6, 2));
    const knuckle2 = 1 + 0.08 * Math.exp(-Math.pow((t - 0.6) * 6, 2));
    const r = THREE.MathUtils.lerp(finger.baseR, finger.tipR, t) * a * knuckle1 * knuckle2;
    sections.push({ y, rx: r, rz: r * 0.85, cx, cz });
  }

  return buildLimbMesh(interpolateSections(sections, 2), 10);
}

// Thumb is special — rotated and shorter
function createThumb(side: -1 | 1, sw: number, g: ReturnType<typeof getGenderMultipliers>): THREE.BufferGeometry {
  const sx = side * 0.22 * sw * g.shoulderW * 0.96;
  const a = g.armThin;
  // Thumb starts from side of palm, angled outward
  const baseX = sx + side * 0.032 * a;
  const sections = interpolateSections([
    { y: 0.64, rx: 0.010 * a, rz: 0.009 * a, cx: baseX, cz: 0.008 },
    { y: 0.63, rx: 0.011 * a, rz: 0.010 * a, cx: baseX + side * 0.006, cz: 0.012 },
    { y: 0.615, rx: 0.010 * a, rz: 0.009 * a, cx: baseX + side * 0.012, cz: 0.015 },
    { y: 0.60, rx: 0.009 * a, rz: 0.008 * a, cx: baseX + side * 0.016, cz: 0.016 },
    { y: 0.585, rx: 0.008 * a, rz: 0.007 * a, cx: baseX + side * 0.018, cz: 0.015 },
    { y: 0.575, rx: 0.005 * a, rz: 0.005 * a, cx: baseX + side * 0.019, cz: 0.013 },
  ], 2);
  return buildLimbMesh(sections, 10);
}

/* ─────────────────────────────────────────────
   Facial features (detailed)
   ───────────────────────────────────────────── */

function FacialFeatures({ gender, skinTone }: { gender: Gender; skinTone: SkinTone }) {
  const g = getGenderMultipliers(gender);
  const s = g.headScale;
  const isFemale = gender === "female";
  const faceColor = skinTone.faceTint;
  const lipColor = skinTone.lipTint;

  // Eyebrow shape
  const browThickness = isFemale ? 0.003 : 0.005;
  const browWidth = isFemale ? 0.028 : 0.032;
  const browY = 1.635;

  return (
    <group>
      {/* ── EYES (detailed) ── */}
      {([-1, 1] as const).map((side) => (
        <group key={`eye-${side}`}>
          {/* Eye socket shadow */}
          <mesh position={[side * 0.032 * s, 1.625 * s / s, -0.002]} rotation={[0.1, 0, 0]}>
            <sphereGeometry args={[0.018 * s, 12, 12]} />
            <meshPhysicalMaterial color={faceColor} roughness={0.8} transparent opacity={0.3} />
          </mesh>
          {/* Eyeball */}
          <mesh position={[side * 0.032 * s, 1.628, 0.082]}>
            <sphereGeometry args={[0.013 * s, 14, 14]} />
            <meshPhysicalMaterial color="#f2ebe3" roughness={0.08} metalness={0} clearcoat={0.6} />
          </mesh>
          {/* Iris */}
          <mesh position={[side * 0.032 * s, 1.628, 0.092]}>
            <sphereGeometry args={[0.007 * s, 12, 12]} />
            <meshPhysicalMaterial color={isFemale ? "#5a3a28" : "#3a2a1a"} roughness={0.12} metalness={0.05} clearcoat={0.4} />
          </mesh>
          {/* Pupil */}
          <mesh position={[side * 0.032 * s, 1.628, 0.096]}>
            <sphereGeometry args={[0.003 * s, 8, 8]} />
            <meshPhysicalMaterial color="#0a0a0a" roughness={0.05} />
          </mesh>
          {/* Upper eyelid */}
          <mesh position={[side * 0.032 * s, 1.636, 0.086]} rotation={[0.35, 0, 0]} scale={[1.4, 0.4, 0.6]}>
            <sphereGeometry args={[0.012 * s, 10, 6]} />
            <meshPhysicalMaterial color={faceColor} roughness={0.5} />
          </mesh>
          {/* Lower eyelid */}
          <mesh position={[side * 0.032 * s, 1.620, 0.086]} rotation={[-0.25, 0, 0]} scale={[1.3, 0.3, 0.5]}>
            <sphereGeometry args={[0.012 * s, 10, 6]} />
            <meshPhysicalMaterial color={faceColor} roughness={0.5} />
          </mesh>
          {/* Eyebrow */}
          <mesh position={[side * 0.032 * s, browY, 0.088]} rotation={[0.2, 0, side * -0.08]} scale={[1, 1, 0.5]}>
            <boxGeometry args={[browWidth * s, browThickness, 0.008]} />
            <meshPhysicalMaterial color="#1a1410" roughness={0.9} />
          </mesh>
          {/* Eyelashes (female) */}
          {isFemale && (
            <mesh position={[side * 0.032 * s, 1.636, 0.094]} rotation={[0.5, 0, side * 0.05]} scale={[1.2, 0.15, 0.3]}>
              <boxGeometry args={[0.018 * s, 0.003, 0.004]} />
              <meshPhysicalMaterial color="#1a1008" roughness={0.9} />
            </mesh>
          )}
        </group>
      ))}

      {/* ── NOSE (detailed) ── */}
      <group>
        {/* Nose bridge */}
        <mesh position={[0, 1.605, 0.088]} rotation={[0.1, 0, 0]}>
          <boxGeometry args={[0.010 * s, 0.035, 0.012]} />
          <meshPhysicalMaterial color={faceColor} roughness={0.5} clearcoat={0.1} />
        </mesh>
        {/* Nose tip */}
        <mesh position={[0, 1.585, 0.098]} rotation={[0.15, 0, 0]}>
          <sphereGeometry args={[isFemale ? 0.010 : 0.013, 10, 10]} />
          <meshPhysicalMaterial color={faceColor} roughness={0.45} clearcoat={0.12} />
        </mesh>
        {/* Nostrils */}
        {([-1, 1] as const).map((side) => (
          <mesh key={`nostril-${side}`} position={[side * 0.008 * s, 1.582, 0.092]}>
            <sphereGeometry args={[0.005 * s, 8, 8]} />
            <meshPhysicalMaterial color={faceColor} roughness={0.6} />
          </mesh>
        ))}
      </group>

      {/* ── MOUTH (detailed) ── */}
      <group>
        {/* Upper lip */}
        <mesh position={[0, 1.567, 0.088]} scale={[1.8, 0.6, 0.6]}>
          <sphereGeometry args={[isFemale ? 0.011 : 0.010, 12, 8]} />
          <meshPhysicalMaterial color={lipColor} roughness={0.32} clearcoat={isFemale ? 0.4 : 0.2} />
        </mesh>
        {/* Cupid's bow (upper lip shape) */}
        <mesh position={[0, 1.570, 0.091]} scale={[1, 0.3, 0.3]}>
          <sphereGeometry args={[0.006 * s, 8, 6]} />
          <meshPhysicalMaterial color={lipColor} roughness={0.3} />
        </mesh>
        {/* Lower lip */}
        <mesh position={[0, 1.561, 0.087]} scale={[1.6, 0.7, 0.6]}>
          <sphereGeometry args={[isFemale ? 0.012 : 0.010, 12, 8]} />
          <meshPhysicalMaterial color={lipColor} roughness={0.3} clearcoat={isFemale ? 0.45 : 0.25} />
        </mesh>
        {/* Lip line / separation */}
        <mesh position={[0, 1.564, 0.091]} scale={[2, 0.08, 0.3]}>
          <boxGeometry args={[0.010 * s, 0.001, 0.004]} />
          <meshPhysicalMaterial color={faceColor} roughness={0.5} />
        </mesh>
      </group>

      {/* ── EARS (detailed) ── */}
      {([-1, 1] as const).map((side) => (
        <group key={`ear-${side}`}>
          {/* Main ear */}
          <mesh position={[side * 0.098 * s, 1.60, -0.01]} rotation={[0, side * 0.3, 0]} scale={[0.6, 1, 0.5]}>
            <sphereGeometry args={[0.022 * s, 12, 12]} />
            <meshPhysicalMaterial color={faceColor} roughness={0.5} />
          </mesh>
          {/* Ear lobe */}
          <mesh position={[side * 0.098 * s, 1.585, -0.008]} scale={[0.5, 0.5, 0.4]}>
            <sphereGeometry args={[0.012 * s, 8, 8]} />
            <meshPhysicalMaterial color={faceColor} roughness={0.5} />
          </mesh>
          {/* Inner ear detail */}
          <mesh position={[side * 0.094 * s, 1.602, -0.005]} rotation={[0, side * 0.4, 0]} scale={[0.4, 0.7, 0.3]}>
            <sphereGeometry args={[0.014 * s, 8, 8]} />
            <meshPhysicalMaterial color={faceColor} roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* ── HAIR ── */}
      <group>
        {/* Hair cap */}
        <mesh position={[0, 1.70, -0.005]}>
          <sphereGeometry args={[0.102 * s, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshPhysicalMaterial color={isFemale ? "#2a1a10" : "#1a1410"} roughness={0.85} metalness={0} />
        </mesh>
        {/* Side hair */}
        {([-1, 1] as const).map((side) => (
          <mesh key={`sidhair-${side}`} position={[side * 0.085 * s, 1.64, -0.025]} scale={[0.6, 1.2, 0.8]}>
            <sphereGeometry args={[0.04 * s, 12, 12]} />
            <meshPhysicalMaterial color={isFemale ? "#2a1a10" : "#1a1410"} roughness={0.85} />
          </mesh>
        ))}
        {/* Back hair */}
        <mesh position={[0, 1.62, -0.08]} scale={[1, 1.2, 0.6]}>
          <sphereGeometry args={[0.09 * s, 16, 12]} />
          <meshPhysicalMaterial color={isFemale ? "#2a1a10" : "#1a1410"} roughness={0.85} />
        </mesh>
        {/* Female long hair */}
        {isFemale && (
          <>
            <mesh position={[0, 1.50, -0.06]} scale={[1.1, 1.8, 0.5]}>
              <sphereGeometry args={[0.08, 16, 12]} />
              <meshPhysicalMaterial color="#2a1a10" roughness={0.85} />
            </mesh>
            {([-1, 1] as const).map((side) => (
              <mesh key={`longhair-${side}`} position={[side * 0.06, 1.42, -0.04]} scale={[0.5, 2.0, 0.4]}>
                <sphereGeometry args={[0.06, 12, 10]} />
                <meshPhysicalMaterial color="#2a1a10" roughness={0.85} />
              </mesh>
            ))}
          </>
        )}
      </group>
    </group>
  );
}

/* ─────────────────────────────────────────────
   Hand component (palm + 5 individual fingers)
   ───────────────────────────────────────────── */
function HandMesh({ side, sw, g, material }: { side: -1 | 1; sw: number; g: ReturnType<typeof getGenderMultipliers>; material: THREE.Material }) {
  const a = g.armThin;
  const fingerDefs: FingerDef[] = [
    // Index
    { offsetX: -0.012, offsetZ: 0.004, length: 0.055, baseR: 0.006, tipR: 0.004, segments: 8 },
    // Middle (longest)
    { offsetX: -0.003, offsetZ: 0.005, length: 0.060, baseR: 0.006, tipR: 0.004, segments: 8 },
    // Ring
    { offsetX: 0.006, offsetZ: 0.004, length: 0.054, baseR: 0.0058, tipR: 0.0038, segments: 8 },
    // Pinky
    { offsetX: 0.014, offsetZ: 0.002, length: 0.044, baseR: 0.005, tipR: 0.0032, segments: 7 },
  ];

  const palmGeo = useMemo(() => createPalm(side, sw, g), [side, sw, g]);
  const thumbGeo = useMemo(() => createThumb(side, sw, g), [side, sw, g]);
  const fingerGeos = useMemo(
    () => fingerDefs.map((f) => createFinger(side, sw, g, f, 0.575)),
    [side, sw, g]
  );

  return (
    <group>
      <mesh geometry={palmGeo} material={material} castShadow />
      <mesh geometry={thumbGeo} material={material} castShadow />
      {fingerGeos.map((geo, i) => (
        <mesh key={i} geometry={geo} material={material} castShadow />
      ))}
    </group>
  );
}

/* ─────────────────────────────────────────────
   Garment geometry builders
   ───────────────────────────────────────────── */

function createJacketTorso(cs: number, ws: number, hs: number, sw: number, g: ReturnType<typeof getGenderMultipliers>) {
  const o = 0.016;
  const sections = interpolateSections([
    { y: 1.40, rx: 0.065 + o, rz: 0.06 + o },
    { y: 1.34, rx: 0.22 * sw * g.shoulderW + o, rz: 0.12 + o },
    { y: 1.26, rx: 0.20 * cs * g.shoulderW + o, rz: 0.125 * cs * g.chestDepth + o },
    { y: 1.18, rx: 0.195 * cs * g.shoulderW + o, rz: 0.13 * cs * g.chestDepth + o },
    { y: 1.10, rx: 0.18 * cs + o, rz: 0.12 * cs * g.chestDepth + o },
    { y: 1.02, rx: 0.165 * ws * g.waistNarrow + o, rz: 0.11 * ws + o },
    { y: 0.94, rx: 0.145 * ws * g.waistNarrow + o, rz: 0.10 * ws + o },
    { y: 0.88, rx: 0.155 * hs * g.hipWide + o, rz: 0.105 * hs + o },
    { y: 0.82, rx: 0.18 * hs * g.hipWide + o, rz: 0.12 * hs + o },
    { y: 0.76, rx: 0.20 * hs * g.hipWide + o, rz: 0.13 * hs + o },
    { y: 0.70, rx: 0.195 * hs * g.hipWide + o, rz: 0.125 * hs + o },
    { y: 0.65, rx: 0.17 * g.hipWide + o, rz: 0.11 + o },
  ], 4);
  return buildLimbMesh(sections, 36);
}

function createTrouserLeg(side: -1 | 1, hs: number, g: ReturnType<typeof getGenderMultipliers>) {
  const o = 0.006;
  const hipOff = side * 0.085 * g.hipWide;
  const t = g.legThin;
  const sections = interpolateSections([
    { y: 0.70, rx: 0.09 * hs * t + o, rz: 0.095 * hs * t + o, cx: hipOff },
    { y: 0.64, rx: 0.086 * t + o, rz: 0.089 * t + o, cx: hipOff },
    { y: 0.56, rx: 0.080 * t + o, rz: 0.082 * t + o, cx: hipOff * 0.85 },
    { y: 0.48, rx: 0.070 * t + o, rz: 0.072 * t + o, cx: hipOff * 0.72 },
    { y: 0.40, rx: 0.060 * t + o, rz: 0.063 * t + o, cx: hipOff * 0.65 },
    { y: 0.34, rx: 0.054 * t + o, rz: 0.058 * t + o, cx: hipOff * 0.6 },
    { y: 0.28, rx: 0.056 * t + o, rz: 0.054 * t + o, cx: hipOff * 0.55 },
    { y: 0.20, rx: 0.050 * t + o, rz: 0.048 * t + o, cx: hipOff * 0.5 },
    { y: 0.12, rx: 0.042 * t + o, rz: 0.040 * t + o, cx: hipOff * 0.5 },
    { y: 0.06, rx: 0.036 + o, rz: 0.034 + o, cx: hipOff * 0.5 },
  ], 3);
  return buildLimbMesh(sections, 20);
}

function createSleeve(side: -1 | 1, sw: number, g: ReturnType<typeof getGenderMultipliers>) {
  const o = 0.010;
  const sx = side * 0.22 * sw * g.shoulderW;
  const a = g.armThin;
  const sections = interpolateSections([
    { y: 1.34, rx: 0.056 * a + o, rz: 0.052 * a + o, cx: sx },
    { y: 1.28, rx: 0.054 * a + o, rz: 0.050 * a + o, cx: sx * 1.02 },
    { y: 1.20, rx: 0.049 * a + o, rz: 0.046 * a + o, cx: sx * 1.03 },
    { y: 1.12, rx: 0.046 * a + o, rz: 0.044 * a + o, cx: sx * 1.04 },
    { y: 1.04, rx: 0.042 * a + o, rz: 0.040 * a + o, cx: sx * 1.04 },
    { y: 0.96, rx: 0.037 * a + o, rz: 0.036 * a + o, cx: sx * 1.03 },
    { y: 0.90, rx: 0.038 * a + o, rz: 0.036 * a + o, cx: sx * 1.01 },
    { y: 0.82, rx: 0.034 * a + o, rz: 0.032 * a + o, cx: sx },
    { y: 0.74, rx: 0.030 * a + o, rz: 0.028 * a + o, cx: sx * 0.98 },
    { y: 0.68, rx: 0.026 * a + o, rz: 0.022 * a + o, cx: sx * 0.96 },
  ], 3);
  return buildLimbMesh(sections, 16);
}

function createShoeGeo(side: -1 | 1, g: ReturnType<typeof getGenderMultipliers>) {
  const cx = side * 0.085 * g.hipWide * 0.5;
  const sections = interpolateSections([
    { y: 0.06, rx: 0.035, rz: 0.035, cx },
    { y: 0.04, rx: 0.038, rz: 0.050, cx, cz: 0.005 },
    { y: 0.025, rx: 0.042, rz: 0.065, cx, cz: 0.015 },
    { y: 0.012, rx: 0.044, rz: 0.075, cx, cz: 0.025 },
    { y: 0.0, rx: 0.043, rz: 0.080, cx, cz: 0.03 },
    { y: -0.012, rx: 0.040, rz: 0.075, cx, cz: 0.035 },
    { y: -0.022, rx: 0.025, rz: 0.055, cx, cz: 0.035 },
  ], 3);
  return buildLimbMesh(sections, 16);
}

/* ─────────────────────────────────────────────
   Main component
   ───────────────────────────────────────────── */

interface MannequinProps {
  color: string;
  fabricId: string;
  fabricProps: { roughness: number; metalness: number; bumpScale: number };
  styleConfig: StyleOption;
  garments: GarmentVisibility;
  bodyMeasurements: BodyMeasurements | null;
  gender?: Gender;
  skinTone?: SkinTone;
  pose?: PosePreset;
}

export default function Mannequin3D({
  color, fabricId, fabricProps, styleConfig, garments, bodyMeasurements, gender = "male",
  skinTone = SKIN_TONES[1], pose = "standing",
}: MannequinProps) {
  const group = useRef<THREE.Group>(null);
  const bumpMap = useFabricTexture(fabricId);
  const g = useMemo(() => getGenderMultipliers(gender), [gender]);

  const morph = useMemo(() => {
    if (!bodyMeasurements) return { heightScale: 1, chestScale: 1, waistScale: 1, hipScale: 1, shoulderScale: 1, legScale: 1, armScale: 1 };
    return measurementsToMorphTargets(bodyMeasurements);
  }, [bodyMeasurements]);

  // ── Animated pose refs ──
  const targetPose = useMemo(() => getPoseTransforms(pose), [pose]);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftHandRef = useRef<THREE.Group>(null);
  const rightHandRef = useRef<THREE.Group>(null);
  const leftSleeveRef = useRef<THREE.Group>(null);
  const rightSleeveRef = useRef<THREE.Group>(null);
  const leftSleeveAltRef = useRef<THREE.Group>(null);
  const rightSleeveAltRef = useRef<THREE.Group>(null);

  const LERP_SPEED = 5; // higher = faster transition

  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.04;
    }
    const t = 1 - Math.exp(-LERP_SPEED * delta);
    const lerpGroup = (ref: React.RefObject<THREE.Group | null>, targetPos: [number, number, number], targetRot: [number, number, number]) => {
      if (!ref.current) return;
      ref.current.position.lerp(new THREE.Vector3(...targetPos), t);
      ref.current.rotation.x += (targetRot[0] - ref.current.rotation.x) * t;
      ref.current.rotation.y += (targetRot[1] - ref.current.rotation.y) * t;
      ref.current.rotation.z += (targetRot[2] - ref.current.rotation.z) * t;
    };
    lerpGroup(leftArmRef, targetPose.leftArmPos, targetPose.leftArmRot);
    lerpGroup(rightArmRef, targetPose.rightArmPos, targetPose.rightArmRot);
    lerpGroup(leftHandRef, targetPose.leftArmPos, targetPose.leftHandRot);
    lerpGroup(rightHandRef, targetPose.rightArmPos, targetPose.rightHandRot);
    lerpGroup(leftSleeveRef, targetPose.leftArmPos, targetPose.leftArmRot);
    lerpGroup(rightSleeveRef, targetPose.rightArmPos, targetPose.rightArmRot);
    lerpGroup(leftSleeveAltRef, targetPose.leftArmPos, targetPose.leftArmRot);
    lerpGroup(rightSleeveAltRef, targetPose.rightArmPos, targetPose.rightArmRot);
  });

  // ── Materials ──
  const skinMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: skinTone.hex, roughness: 0.5, metalness: 0.0,
    clearcoat: 0.12, clearcoatRoughness: 0.6,
    sheen: 0.2, sheenColor: new THREE.Color(skinTone.hex).offsetHSL(0, -0.05, 0.1), sheenRoughness: 0.4,
    envMapIntensity: 0.5,
  }), [skinTone]);

  const suitMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    roughness: fabricProps.roughness, metalness: fabricProps.metalness,
    bumpMap, bumpScale: fabricProps.bumpScale,
    clearcoat: fabricId === "silk-blend" ? 0.15 : 0.03, clearcoatRoughness: 0.85,
    sheen: fabricId === "velvet" ? 0.6 : fabricId === "cashmere" ? 0.4 : 0.1,
    sheenColor: new THREE.Color(color).offsetHSL(0, -0.1, 0.15), sheenRoughness: 0.55,
    envMapIntensity: 0.4,
  }), [color, fabricProps, bumpMap, fabricId]);

  const trouserMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color).offsetHSL(0, 0, -0.03),
    roughness: fabricProps.roughness + 0.02, metalness: fabricProps.metalness,
    bumpMap, bumpScale: fabricProps.bumpScale * 0.8, envMapIntensity: 0.35,
  }), [color, fabricProps, bumpMap]);

  const shirtMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#f0ebe3", roughness: 0.75, metalness: 0, envMapIntensity: 0.3 }), []);
  const shoeMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#1a1410", roughness: 0.22, metalness: 0.10, clearcoat: 0.35, clearcoatRoughness: 0.35, envMapIntensity: 0.8 }), []);
  const buttonMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#6b5d4f", roughness: 0.35, metalness: 0.18, clearcoat: 0.25 }), []);
  const vestMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color).offsetHSL(0, 0.05, 0.05),
    roughness: fabricProps.roughness - 0.05, metalness: fabricProps.metalness + 0.02, bumpMap, bumpScale: fabricProps.bumpScale * 0.6,
  }), [color, fabricProps, bumpMap]);
  const tieMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#5c1a2a", roughness: 0.38, metalness: 0.05, sheen: 0.3, sheenColor: new THREE.Color("#8a2040"), sheenRoughness: 0.4 }), []);
  const beltMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#1a1410", roughness: 0.30, metalness: 0.12, clearcoat: 0.25 }), []);

  const sw = styleConfig.shoulderMult * morph.shoulderScale;
  const cs = morph.chestScale;
  const ws = morph.waistScale;
  const hs = morph.hipScale;
  const armS = morph.armScale;

  // ── Body Geometries ──
  const headGeo = useMemo(() => createHead(g), [g]);
  const neckGeo = useMemo(() => createNeck(g), [g]);
  const torsoGeo = useMemo(() => createTorso(cs, ws, hs, sw, g), [cs, ws, hs, sw, g]);
  const leftLegGeo = useMemo(() => createLeg(-1, hs, g), [hs, g]);
  const rightLegGeo = useMemo(() => createLeg(1, hs, g), [hs, g]);
  const leftFootGeo = useMemo(() => createFoot(-1, g), [g]);
  const rightFootGeo = useMemo(() => createFoot(1, g), [g]);
  const leftArmGeo = useMemo(() => createArm(-1, sw, armS, g), [sw, armS, g]);
  const rightArmGeo = useMemo(() => createArm(1, sw, armS, g), [sw, armS, g]);

  // ── Garment Geometries ──
  const jacketGeo = useMemo(() => createJacketTorso(cs, ws, hs, sw, g), [cs, ws, hs, sw, g]);
  const leftTrouserGeo = useMemo(() => createTrouserLeg(-1, hs, g), [hs, g]);
  const rightTrouserGeo = useMemo(() => createTrouserLeg(1, hs, g), [hs, g]);
  const leftSleeveGeo = useMemo(() => createSleeve(-1, sw, g), [sw, g]);
  const rightSleeveGeo = useMemo(() => createSleeve(1, sw, g), [sw, g]);
  const leftShoeGeo = useMemo(() => createShoeGeo(-1, g), [g]);
  const rightShoeGeo = useMemo(() => createShoeGeo(1, g), [g]);

  const scale = morph.heightScale;

  return (
    <group ref={group} scale={[scale, scale, scale]} position={[0, -0.85 * scale, 0]}>
      {/* ── BODY ── */}
      <mesh geometry={headGeo} material={skinMat} castShadow />
      <mesh geometry={neckGeo} material={skinMat} castShadow />
      <mesh geometry={torsoGeo} material={skinMat} castShadow receiveShadow />
      <mesh geometry={leftLegGeo} material={skinMat} castShadow />
      <mesh geometry={rightLegGeo} material={skinMat} castShadow />
      <mesh geometry={leftFootGeo} material={skinMat} />
      <mesh geometry={rightFootGeo} material={skinMat} />

      {/* ── ARMS with animated pose ── */}
      <group ref={leftArmRef}>
        <mesh geometry={leftArmGeo} material={skinMat} castShadow />
      </group>
      <group ref={rightArmRef}>
        <mesh geometry={rightArmGeo} material={skinMat} castShadow />
      </group>

      {/* ── HANDS with animated pose ── */}
      <group ref={leftHandRef}>
        <HandMesh side={-1} sw={sw} g={g} material={skinMat} />
      </group>
      <group ref={rightHandRef}>
        <HandMesh side={1} sw={sw} g={g} material={skinMat} />
      </group>

      {/* ── FACIAL FEATURES ── */}
      <FacialFeatures gender={gender} skinTone={skinTone} />

      {/* ── SHIRT COLLAR ── */}
      {garments.shirt && (
        <mesh position={[0, 1.41, 0]} material={shirtMat}>
          <cylinderGeometry args={[0.062 * g.neckThin, 0.068 * g.neckThin, 0.02, 28]} />
        </mesh>
      )}

      {/* ── TIE ── */}
      {garments.tie && (
        <group>
          <mesh position={[0, 1.40, 0.06]} material={tieMat}>
            <boxGeometry args={[0.025, 0.02, 0.012]} />
          </mesh>
          <mesh position={[0, 1.15, 0.075]} material={tieMat}>
            <boxGeometry args={[0.032, 0.46, 0.006]} />
          </mesh>
          <mesh position={[0, 0.92, 0.075]} rotation={[0, 0, Math.PI / 4]} material={tieMat}>
            <boxGeometry args={[0.025, 0.025, 0.006]} />
          </mesh>
        </group>
      )}

      {/* ── JACKET ── */}
      {garments.jacket && (
        <>
          <mesh geometry={jacketGeo} material={suitMat} castShadow />
          {([-1, 1] as const).map((side) => (
            <mesh key={`lapel${side}`}
              position={[side * 0.045 * styleConfig.lapelMult, 1.30, 0.12]}
              rotation={[0.06, side * 0.15, side * 0.1]}
              material={suitMat} castShadow
            >
              <boxGeometry args={[0.06 * styleConfig.lapelMult, 0.15, 0.008]} />
            </mesh>
          ))}
          <mesh position={[-0.065, 1.06, 0.115]} material={suitMat}>
            <boxGeometry args={[0.06, 0.004, 0.008]} />
          </mesh>
          <group position={poseT.leftArmPos} rotation={poseT.leftArmRot}>
            <mesh geometry={leftSleeveGeo} material={suitMat} castShadow />
          </group>
          <group position={poseT.rightArmPos} rotation={poseT.rightArmRot}>
            <mesh geometry={rightSleeveGeo} material={suitMat} castShadow />
          </group>
        </>
      )}

      {/* ── SHIRT (no jacket) ── */}
      {!garments.jacket && garments.shirt && (
        <>
          <mesh geometry={jacketGeo} material={shirtMat} castShadow />
          <group position={poseT.leftArmPos} rotation={poseT.leftArmRot}>
            <mesh geometry={leftSleeveGeo} material={shirtMat} castShadow />
          </group>
          <group position={poseT.rightArmPos} rotation={poseT.rightArmRot}>
            <mesh geometry={rightSleeveGeo} material={shirtMat} castShadow />
          </group>
        </>
      )}

      {/* ── VEST ── */}
      {garments.vest && (
        <mesh position={[0, 1.10, 0]} material={vestMat} castShadow>
          <cylinderGeometry args={[0.16 * ws * g.waistNarrow, 0.18 * cs * g.shoulderW, 0.30, 28]} />
        </mesh>
      )}

      {/* ── BUTTONS ── */}
      {garments.jacket && styleConfig.buttonCount > 0 &&
        Array.from({ length: Math.min(styleConfig.buttonCount, 3) }).map((_, i) => {
          const isDouble = styleConfig.id === "doublebreasted";
          const yBtn = 1.18 - i * 0.08;
          return (
            <group key={`btn${i}`}>
              <mesh position={[isDouble ? -0.025 : 0, yBtn, 0.13]} material={buttonMat} castShadow>
                <cylinderGeometry args={[0.008, 0.008, 0.004, 14]} />
              </mesh>
              {isDouble && (
                <mesh position={[0.025, yBtn, 0.13]} material={buttonMat} castShadow>
                  <cylinderGeometry args={[0.008, 0.008, 0.004, 14]} />
                </mesh>
              )}
            </group>
          );
        })
      }

      {/* ── BELT ── */}
      {garments.belt && (
        <>
          <mesh position={[0, 0.86, 0]} material={beltMat}>
            <cylinderGeometry args={[0.145 * ws * g.waistNarrow, 0.142 * ws * g.waistNarrow, 0.018, 32]} />
          </mesh>
          <mesh position={[0, 0.86, 0.145 * ws * g.waistNarrow]}>
            <boxGeometry args={[0.022, 0.016, 0.004]} />
            <meshPhysicalMaterial color="#b8a88a" roughness={0.18} metalness={0.75} />
          </mesh>
        </>
      )}

      {/* ── TROUSERS ── */}
      {garments.trousers && (
        <>
          <mesh geometry={leftTrouserGeo} material={trouserMat} castShadow />
          <mesh geometry={rightTrouserGeo} material={trouserMat} castShadow />
        </>
      )}

      {/* ── SHOES ── */}
      {garments.shoes && (
        <>
          <mesh geometry={leftShoeGeo} material={shoeMat} castShadow />
          <mesh geometry={rightShoeGeo} material={shoeMat} castShadow />
        </>
      )}
    </group>
  );
}
