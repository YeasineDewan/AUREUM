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
  faceTint: string;
  lipTint: string;
}

export const SKIN_TONES: SkinTone[] = [
  { id: "fair",   name: "Fair",   hex: "#f5d6c3", faceTint: "#e8c4a8", lipTint: "#d4888a" },
  { id: "light",  name: "Light",  hex: "#d4a986", faceTint: "#c49070", lipTint: "#c47068" },
  { id: "medium", name: "Medium", hex: "#c68642", faceTint: "#a8703a", lipTint: "#a05848" },
  { id: "tan",    name: "Tan",    hex: "#a0724a", faceTint: "#8a5e3a", lipTint: "#8a4a3a" },
  { id: "brown",  name: "Brown",  hex: "#8d5524", faceTint: "#724420", lipTint: "#6a3828" },
  { id: "dark",   name: "Dark",   hex: "#5c3310", faceTint: "#4a280e", lipTint: "#4a2a1a" },
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
    default:
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
   Geometry Helpers
   ───────────────────────────────────────────── */

type Section = { y: number; rx: number; rz: number; cx?: number; cz?: number };

function buildLimbMesh(sections: Section[], radialSegs = 24): THREE.BufferGeometry {
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
  geo.computeVertexNormals();
  return geo;
}

/** Cosine-interpolate between key sections for smooth transitions */
function interpolateSections(sections: Section[], subdivisions = 4): Section[] {
  const result: Section[] = [];
  for (let i = 0; i < sections.length - 1; i++) {
    const a = sections[i];
    const b = sections[i + 1];
    for (let t = 0; t < subdivisions; t++) {
      const f = t / subdivisions;
      const sf = 0.5 - 0.5 * Math.cos(f * Math.PI); // smooth step
      result.push({
        y:  a.y + (b.y - a.y) * sf,
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
   Gender-aware body multipliers
   (Tuned to match reference mannequin proportions)
   ───────────────────────────────────────────── */
export type Gender = "male" | "female";

function getGenderMultipliers(gender: Gender) {
  if (gender === "female") {
    return {
      shoulderW: 0.86,
      chestDepth: 1.15,
      waistNarrow: 0.82,
      hipWide: 1.20,
      armThin: 0.85,
      legThin: 0.90,
      neckThin: 0.82,
      headScale: 0.96,
      bustProtrusion: 0.035,  // forward bust offset
      buttockProtrusion: 0.018,
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
    bustProtrusion: 0,
    buttockProtrusion: 0.005,
  };
}

/* ─────────────────────────────────────────────
   Body part geometry — refined anatomy
   ───────────────────────────────────────────── */

function createHead(g: ReturnType<typeof getGenderMultipliers>) {
  const s = g.headScale;
  const sections = interpolateSections([
    // Crown
    { y: 1.74, rx: 0.006, rz: 0.006 },
    { y: 1.73, rx: 0.06 * s, rz: 0.065 * s },
    { y: 1.715, rx: 0.088 * s, rz: 0.092 * s },
    // Top of head — wider
    { y: 1.70, rx: 0.096 * s, rz: 0.10 * s },
    { y: 1.685, rx: 0.099 * s, rz: 0.104 * s },
    // Forehead
    { y: 1.67, rx: 0.100 * s, rz: 0.106 * s },
    // Brow ridge — slight overhang
    { y: 1.655, rx: 0.101 * s, rz: 0.105 * s, cz: 0.003 },
    { y: 1.645, rx: 0.100 * s, rz: 0.103 * s, cz: 0.004 },
    // Temple — narrower
    { y: 1.63, rx: 0.098 * s, rz: 0.100 * s, cz: 0.003 },
    // Cheekbone — widest part of face
    { y: 1.615, rx: 0.095 * s, rz: 0.094 * s, cz: 0.004 },
    { y: 1.60, rx: 0.092 * s, rz: 0.088 * s, cz: 0.005 },
    // Mid-face — starts narrowing
    { y: 1.585, rx: 0.086 * s, rz: 0.082 * s, cz: 0.005 },
    // Jaw angle
    { y: 1.57, rx: 0.080 * s, rz: 0.076 * s, cz: 0.004 },
    { y: 1.555, rx: 0.072 * s, rz: 0.070 * s, cz: 0.003 },
    // Lower jaw — tapers
    { y: 1.545, rx: 0.062 * s, rz: 0.062 * s, cz: 0.005 },
    { y: 1.535, rx: 0.050 * s, rz: 0.054 * s, cz: 0.008 },
    // Chin — forward protrusion
    { y: 1.525, rx: 0.038 * s, rz: 0.044 * s, cz: 0.012 },
    { y: 1.518, rx: 0.028 * s, rz: 0.035 * s, cz: 0.014 },
    { y: 1.512, rx: 0.018, rz: 0.025, cz: 0.013 },
  ], 4);
  return buildLimbMesh(sections, 36);
}

function createNeck(g: ReturnType<typeof getGenderMultipliers>) {
  const n = g.neckThin;
  const sections = interpolateSections([
    { y: 1.512, rx: 0.030 * n, rz: 0.032 * n },
    { y: 1.50, rx: 0.042 * n, rz: 0.040 * n },
    { y: 1.485, rx: 0.048 * n, rz: 0.046 * n },
    { y: 1.47, rx: 0.052 * n, rz: 0.050 * n },
    // Slight Adam's apple for male
    { y: 1.455, rx: 0.054 * n, rz: 0.052 * n, cz: g.headScale === 1.0 ? 0.004 : 0 },
    { y: 1.44, rx: 0.058 * n, rz: 0.055 * n },
    // Neck base widens into shoulders
    { y: 1.425, rx: 0.065 * n, rz: 0.060 * n },
    { y: 1.41, rx: 0.072 * n, rz: 0.065 * n },
  ], 4);
  return buildLimbMesh(sections, 24);
}

function createTorso(cs: number, ws: number, hs: number, sw: number, g: ReturnType<typeof getGenderMultipliers>) {
  const bp = g.bustProtrusion;
  const bk = g.buttockProtrusion;
  const isFemale = g.shoulderW < 1;

  const sections = interpolateSections([
    // Neck base
    { y: 1.42, rx: 0.065 * g.neckThin, rz: 0.060 * g.neckThin },
    // Trapezius / collar area
    { y: 1.39, rx: 0.12 * g.shoulderW, rz: 0.075 },
    // Shoulder line
    { y: 1.35, rx: 0.215 * sw * g.shoulderW, rz: 0.10 },
    // Below shoulder — deltoid insertion
    { y: 1.31, rx: 0.21 * sw * g.shoulderW, rz: 0.105 },
    // Upper chest — collarbone area
    { y: 1.28, rx: 0.195 * cs * g.shoulderW, rz: 0.112 * cs * g.chestDepth, cz: bp * 0.3 },
    // Mid chest — bust line for female
    { y: 1.24, rx: 0.190 * cs * g.shoulderW, rz: 0.120 * cs * g.chestDepth, cz: bp * 0.8 },
    // Bust apex (most forward for female)
    { y: 1.20, rx: 0.185 * cs * g.shoulderW, rz: 0.125 * cs * g.chestDepth, cz: bp },
    // Under-bust
    { y: 1.16, rx: 0.178 * cs * (isFemale ? 0.92 : 1), rz: 0.115 * cs * g.chestDepth, cz: bp * 0.5 },
    // Ribcage
    { y: 1.12, rx: 0.170 * cs * (isFemale ? 0.90 : 1), rz: 0.108 * cs },
    { y: 1.08, rx: 0.160 * cs * (isFemale ? 0.88 : 1), rz: 0.102 * cs },
    // Waist — narrowest point
    { y: 1.03, rx: 0.145 * ws * g.waistNarrow, rz: 0.092 * ws },
    { y: 0.98, rx: 0.135 * ws * g.waistNarrow, rz: 0.088 * ws },
    // Navel area
    { y: 0.94, rx: 0.140 * ws * g.waistNarrow, rz: 0.090 * ws, cz: -bk * 0.2 },
    // Low belly — starts widening to hips
    { y: 0.90, rx: 0.155 * hs * g.hipWide, rz: 0.098 * hs, cz: -bk * 0.4 },
    // Hip bone
    { y: 0.86, rx: 0.175 * hs * g.hipWide, rz: 0.110 * hs, cz: -bk * 0.6 },
    // Widest hip
    { y: 0.82, rx: 0.195 * hs * g.hipWide, rz: 0.125 * hs, cz: -bk * 0.8 },
    // Upper buttock
    { y: 0.78, rx: 0.200 * hs * g.hipWide, rz: 0.130 * hs, cz: -bk },
    // Mid buttock — fullest
    { y: 0.74, rx: 0.198 * hs * g.hipWide, rz: 0.128 * hs, cz: -bk * 0.9 },
    // Lower buttock
    { y: 0.70, rx: 0.190 * hs * g.hipWide, rz: 0.120 * hs, cz: -bk * 0.5 },
    // Groin / upper thigh transition
    { y: 0.66, rx: 0.170 * g.hipWide, rz: 0.108, cz: -bk * 0.2 },
    { y: 0.62, rx: 0.155 * g.hipWide, rz: 0.098 },
  ], 5);
  return buildLimbMesh(sections, 40);
}

function createLeg(side: -1 | 1, hs: number, g: ReturnType<typeof getGenderMultipliers>) {
  const hipOff = side * 0.092 * g.hipWide;
  const t = g.legThin;
  const sections = interpolateSections([
    // Upper thigh — connects to torso
    { y: 0.66, rx: 0.090 * hs * t, rz: 0.095 * hs * t, cx: hipOff * 0.95 },
    { y: 0.62, rx: 0.086 * t, rz: 0.090 * t, cx: hipOff * 0.90 },
    // Mid thigh
    { y: 0.56, rx: 0.080 * t, rz: 0.082 * t, cx: hipOff * 0.80 },
    { y: 0.50, rx: 0.074 * t, rz: 0.076 * t, cx: hipOff * 0.72 },
    // Lower thigh — tapers toward knee
    { y: 0.44, rx: 0.066 * t, rz: 0.068 * t, cx: hipOff * 0.65 },
    // Knee — slightly wider front-to-back
    { y: 0.39, rx: 0.054 * t, rz: 0.058 * t, cx: hipOff * 0.60 },
    { y: 0.37, rx: 0.050 * t, rz: 0.056 * t, cx: hipOff * 0.58 },
    { y: 0.35, rx: 0.048 * t, rz: 0.055 * t, cx: hipOff * 0.57 },
    // Upper calf — muscular bulge
    { y: 0.32, rx: 0.052 * t, rz: 0.054 * t, cx: hipOff * 0.55, cz: -0.006 },
    { y: 0.29, rx: 0.054 * t, rz: 0.052 * t, cx: hipOff * 0.53, cz: -0.008 },
    // Mid calf
    { y: 0.25, rx: 0.050 * t, rz: 0.048 * t, cx: hipOff * 0.50, cz: -0.005 },
    // Lower calf — tapers
    { y: 0.20, rx: 0.043 * t, rz: 0.040 * t, cx: hipOff * 0.48 },
    { y: 0.15, rx: 0.036 * t, rz: 0.034 * t, cx: hipOff * 0.47 },
    // Ankle — narrowest
    { y: 0.10, rx: 0.030 * t, rz: 0.028 * t, cx: hipOff * 0.47 },
    { y: 0.07, rx: 0.028, rz: 0.026, cx: hipOff * 0.47 },
    // Ankle bone bumps
    { y: 0.05, rx: 0.030, rz: 0.027, cx: hipOff * 0.47 },
    { y: 0.03, rx: 0.032, rz: 0.030, cx: hipOff * 0.47 },
  ], 4);
  return buildLimbMesh(sections, 22);
}

function createFoot(side: -1 | 1, g: ReturnType<typeof getGenderMultipliers>) {
  const cx = side * 0.092 * g.hipWide * 0.47;
  const sections = interpolateSections([
    // Ankle connection
    { y: 0.035, rx: 0.032, rz: 0.030, cx },
    { y: 0.025, rx: 0.034, rz: 0.040, cx, cz: 0.008 },
    // Heel
    { y: 0.015, rx: 0.036, rz: 0.052, cx, cz: 0.015 },
    // Arch area
    { y: 0.008, rx: 0.038, rz: 0.060, cx, cz: 0.022 },
    // Ball of foot — widest
    { y: 0.003, rx: 0.040, rz: 0.068, cx, cz: 0.028 },
    // Toe area
    { y: 0.0, rx: 0.038, rz: 0.065, cx, cz: 0.035 },
    { y: -0.005, rx: 0.034, rz: 0.058, cx, cz: 0.040 },
    { y: -0.010, rx: 0.025, rz: 0.045, cx, cz: 0.042 },
    { y: -0.015, rx: 0.015, rz: 0.030, cx, cz: 0.044 },
    { y: -0.018, rx: 0.008, rz: 0.018, cx, cz: 0.044 },
  ], 3);
  return buildLimbMesh(sections, 16);
}

function createArm(side: -1 | 1, sw: number, _armScale: number, g: ReturnType<typeof getGenderMultipliers>) {
  const shoulderX = side * 0.225 * sw * g.shoulderW;
  const a = g.armThin;
  const sections = interpolateSections([
    // Shoulder cap (deltoid)
    { y: 1.34, rx: 0.055 * a, rz: 0.052 * a, cx: shoulderX },
    { y: 1.30, rx: 0.054 * a, rz: 0.050 * a, cx: shoulderX * 1.02 },
    // Upper arm (bicep)
    { y: 1.25, rx: 0.050 * a, rz: 0.048 * a, cx: shoulderX * 1.03 },
    { y: 1.19, rx: 0.048 * a, rz: 0.046 * a, cx: shoulderX * 1.04 },
    // Mid upper arm
    { y: 1.13, rx: 0.044 * a, rz: 0.042 * a, cx: shoulderX * 1.04 },
    // Elbow area — slightly wider/flatter
    { y: 1.06, rx: 0.040 * a, rz: 0.038 * a, cx: shoulderX * 1.04 },
    { y: 1.02, rx: 0.036 * a, rz: 0.035 * a, cx: shoulderX * 1.03 },
    { y: 0.98, rx: 0.035 * a, rz: 0.034 * a, cx: shoulderX * 1.03 },
    // Forearm — slight bulge
    { y: 0.93, rx: 0.037 * a, rz: 0.035 * a, cx: shoulderX * 1.02 },
    { y: 0.88, rx: 0.035 * a, rz: 0.033 * a, cx: shoulderX * 1.01 },
    // Lower forearm — tapers
    { y: 0.82, rx: 0.031 * a, rz: 0.029 * a, cx: shoulderX },
    { y: 0.76, rx: 0.027 * a, rz: 0.025 * a, cx: shoulderX * 0.98 },
    // Wrist
    { y: 0.70, rx: 0.023 * a, rz: 0.019 * a, cx: shoulderX * 0.96 },
    { y: 0.66, rx: 0.022 * a, rz: 0.017 * a, cx: shoulderX * 0.95 },
  ], 4);
  return buildLimbMesh(sections, 18);
}

/* ─────────────────────────────────────────────
   Detailed Hands — Palm + 5 Fingers
   ───────────────────────────────────────────── */

function createPalm(side: -1 | 1, sw: number, g: ReturnType<typeof getGenderMultipliers>) {
  const sx = side * 0.225 * sw * g.shoulderW * 0.95;
  const a = g.armThin;
  const sections = interpolateSections([
    { y: 0.66, rx: 0.022 * a, rz: 0.015 * a, cx: sx },
    { y: 0.645, rx: 0.028 * a, rz: 0.012 * a, cx: sx },
    { y: 0.625, rx: 0.032 * a, rz: 0.013 * a, cx: sx * 0.99 },
    { y: 0.605, rx: 0.033 * a, rz: 0.013 * a, cx: sx * 0.98 },
    { y: 0.590, rx: 0.031 * a, rz: 0.012 * a, cx: sx * 0.97 },
    { y: 0.580, rx: 0.028 * a, rz: 0.010 * a, cx: sx * 0.96 },
  ], 3);
  return buildLimbMesh(sections, 14);
}

interface FingerDef {
  offsetX: number;
  offsetZ: number;
  length: number;
  baseR: number;
  tipR: number;
  segments: number;
}

function createFinger(
  side: -1 | 1, sw: number, g: ReturnType<typeof getGenderMultipliers>,
  finger: FingerDef, startY: number
): THREE.BufferGeometry {
  const sx = side * 0.225 * sw * g.shoulderW * 0.95;
  const a = g.armThin;
  const cx = sx + side * finger.offsetX * a;
  const cz = finger.offsetZ;
  const sections: Section[] = [];

  for (let i = 0; i <= finger.segments; i++) {
    const t = i / finger.segments;
    const y = startY - t * finger.length;
    const knuckle1 = 1 + 0.15 * Math.exp(-Math.pow((t - 0.25) * 6, 2));
    const knuckle2 = 1 + 0.10 * Math.exp(-Math.pow((t - 0.55) * 6, 2));
    const r = THREE.MathUtils.lerp(finger.baseR, finger.tipR, t) * a * knuckle1 * knuckle2;
    sections.push({ y, rx: r, rz: r * 0.85, cx, cz });
  }

  return buildLimbMesh(interpolateSections(sections, 2), 10);
}

function createThumb(side: -1 | 1, sw: number, g: ReturnType<typeof getGenderMultipliers>): THREE.BufferGeometry {
  const sx = side * 0.225 * sw * g.shoulderW * 0.95;
  const a = g.armThin;
  const baseX = sx + side * 0.030 * a;
  const sections = interpolateSections([
    { y: 0.645, rx: 0.010 * a, rz: 0.009 * a, cx: baseX, cz: 0.008 },
    { y: 0.635, rx: 0.011 * a, rz: 0.010 * a, cx: baseX + side * 0.006, cz: 0.012 },
    { y: 0.620, rx: 0.010 * a, rz: 0.009 * a, cx: baseX + side * 0.012, cz: 0.015 },
    { y: 0.605, rx: 0.009 * a, rz: 0.008 * a, cx: baseX + side * 0.016, cz: 0.016 },
    { y: 0.590, rx: 0.008 * a, rz: 0.007 * a, cx: baseX + side * 0.018, cz: 0.015 },
    { y: 0.580, rx: 0.005 * a, rz: 0.005 * a, cx: baseX + side * 0.019, cz: 0.013 },
  ], 2);
  return buildLimbMesh(sections, 10);
}

/* ─────────────────────────────────────────────
   Facial Features — Clean mannequin style
   ───────────────────────────────────────────── */

function FacialFeatures({ gender, skinTone }: { gender: Gender; skinTone: SkinTone }) {
  const g = getGenderMultipliers(gender);
  const s = g.headScale;
  const isFemale = gender === "female";
  const faceColor = skinTone.faceTint;
  const lipColor = skinTone.lipTint;

  return (
    <group>
      {/* ── EYES ── */}
      {([-1, 1] as const).map((side) => (
        <group key={`eye-${side}`}>
          {/* Eye socket — subtle depression */}
          <mesh position={[side * 0.033 * s, 1.635, 0.082]} rotation={[0.05, 0, 0]} scale={[1.3, 0.8, 0.6]}>
            <sphereGeometry args={[0.015 * s, 14, 10]} />
            <meshPhysicalMaterial color={faceColor} roughness={0.7} transparent opacity={0.25} />
          </mesh>
          {/* Eyeball */}
          <mesh position={[side * 0.033 * s, 1.637, 0.088]}>
            <sphereGeometry args={[0.012 * s, 16, 16]} />
            <meshPhysicalMaterial color="#f5efe8" roughness={0.06} metalness={0} clearcoat={0.8} />
          </mesh>
          {/* Iris */}
          <mesh position={[side * 0.033 * s, 1.637, 0.098]}>
            <sphereGeometry args={[0.006 * s, 14, 14]} />
            <meshPhysicalMaterial color={isFemale ? "#5a3a28" : "#3a2a1a"} roughness={0.10} clearcoat={0.5} />
          </mesh>
          {/* Pupil */}
          <mesh position={[side * 0.033 * s, 1.637, 0.101]}>
            <sphereGeometry args={[0.003 * s, 10, 10]} />
            <meshPhysicalMaterial color="#060606" roughness={0.02} />
          </mesh>
          {/* Upper eyelid */}
          <mesh position={[side * 0.033 * s, 1.645, 0.091]} rotation={[0.4, 0, 0]} scale={[1.5, 0.35, 0.6]}>
            <sphereGeometry args={[0.011 * s, 12, 8]} />
            <meshPhysicalMaterial color={faceColor} roughness={0.45} />
          </mesh>
          {/* Lower eyelid */}
          <mesh position={[side * 0.033 * s, 1.630, 0.091]} rotation={[-0.3, 0, 0]} scale={[1.3, 0.25, 0.5]}>
            <sphereGeometry args={[0.011 * s, 12, 8]} />
            <meshPhysicalMaterial color={faceColor} roughness={0.45} />
          </mesh>
          {/* Eyebrow — subtle ridge */}
          <mesh position={[side * 0.033 * s, 1.654, 0.092]} rotation={[0.15, 0, side * -0.06]} scale={[1, 1, 0.5]}>
            <boxGeometry args={[(isFemale ? 0.026 : 0.030) * s, isFemale ? 0.003 : 0.005, 0.008]} />
            <meshPhysicalMaterial color={faceColor} roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* ── NOSE ── */}
      <group>
        {/* Bridge */}
        <mesh position={[0, 1.620, 0.094]} rotation={[0.08, 0, 0]}>
          <boxGeometry args={[0.009 * s, 0.030, 0.011]} />
          <meshPhysicalMaterial color={faceColor} roughness={0.45} clearcoat={0.08} />
        </mesh>
        {/* Tip — rounded */}
        <mesh position={[0, 1.600, 0.102]}>
          <sphereGeometry args={[isFemale ? 0.009 : 0.012, 12, 12]} />
          <meshPhysicalMaterial color={faceColor} roughness={0.40} clearcoat={0.10} />
        </mesh>
        {/* Nostrils */}
        {([-1, 1] as const).map((side) => (
          <mesh key={`nostril-${side}`} position={[side * 0.007 * s, 1.597, 0.098]}>
            <sphereGeometry args={[0.004 * s, 8, 8]} />
            <meshPhysicalMaterial color={faceColor} roughness={0.55} />
          </mesh>
        ))}
      </group>

      {/* ── MOUTH ── */}
      <group>
        {/* Upper lip */}
        <mesh position={[0, 1.577, 0.092]} scale={[1.6, 0.5, 0.5]}>
          <sphereGeometry args={[isFemale ? 0.010 : 0.009, 14, 10]} />
          <meshPhysicalMaterial color={lipColor} roughness={0.28} clearcoat={isFemale ? 0.35 : 0.15} />
        </mesh>
        {/* Lower lip */}
        <mesh position={[0, 1.571, 0.091]} scale={[1.5, 0.6, 0.5]}>
          <sphereGeometry args={[isFemale ? 0.011 : 0.009, 14, 10]} />
          <meshPhysicalMaterial color={lipColor} roughness={0.26} clearcoat={isFemale ? 0.40 : 0.20} />
        </mesh>
        {/* Lip line */}
        <mesh position={[0, 1.574, 0.095]} scale={[1.8, 0.06, 0.25]}>
          <boxGeometry args={[0.009 * s, 0.001, 0.003]} />
          <meshPhysicalMaterial color={faceColor} roughness={0.5} />
        </mesh>
      </group>

      {/* ── EARS ── */}
      {([-1, 1] as const).map((side) => (
        <group key={`ear-${side}`}>
          {/* Main ear shell */}
          <mesh position={[side * 0.100 * s, 1.62, -0.012]} rotation={[0, side * 0.25, 0]} scale={[0.55, 1.0, 0.45]}>
            <sphereGeometry args={[0.022 * s, 14, 14]} />
            <meshPhysicalMaterial color={faceColor} roughness={0.48} />
          </mesh>
          {/* Ear lobe */}
          <mesh position={[side * 0.100 * s, 1.603, -0.010]} scale={[0.45, 0.45, 0.35]}>
            <sphereGeometry args={[0.012 * s, 10, 10]} />
            <meshPhysicalMaterial color={faceColor} roughness={0.48} />
          </mesh>
          {/* Inner ear cavity */}
          <mesh position={[side * 0.096 * s, 1.618, -0.007]} rotation={[0, side * 0.35, 0]} scale={[0.35, 0.65, 0.25]}>
            <sphereGeometry args={[0.014 * s, 10, 10]} />
            <meshPhysicalMaterial color={faceColor} roughness={0.60} />
          </mesh>
        </group>
      ))}

      {/* ── SUBTLE COLLARBONE (mannequin aesthetic) ── */}
      {([-1, 1] as const).map((side) => (
        <mesh key={`clavicle-${side}`} position={[side * 0.07, 1.395, 0.06]} rotation={[0.1, 0, side * -0.25]} scale={[1, 0.3, 0.4]}>
          <capsuleGeometry args={[0.006, 0.08, 6, 12]} />
          <meshPhysicalMaterial color={skinTone.hex} roughness={0.50} transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

/* ─────────────────────────────────────────────
   Hand component
   ───────────────────────────────────────────── */
function HandMesh({ side, sw, g, material }: { side: -1 | 1; sw: number; g: ReturnType<typeof getGenderMultipliers>; material: THREE.Material }) {
  const fingerDefs: FingerDef[] = [
    { offsetX: -0.012, offsetZ: 0.004, length: 0.054, baseR: 0.006, tipR: 0.004, segments: 8 },
    { offsetX: -0.003, offsetZ: 0.005, length: 0.060, baseR: 0.006, tipR: 0.004, segments: 8 },
    { offsetX: 0.006, offsetZ: 0.004, length: 0.054, baseR: 0.0058, tipR: 0.0038, segments: 8 },
    { offsetX: 0.014, offsetZ: 0.002, length: 0.044, baseR: 0.005, tipR: 0.0032, segments: 7 },
  ];

  const palmGeo = useMemo(() => createPalm(side, sw, g), [side, sw, g]);
  const thumbGeo = useMemo(() => createThumb(side, sw, g), [side, sw, g]);
  const fingerGeos = useMemo(
    () => fingerDefs.map((f) => createFinger(side, sw, g, f, 0.580)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    { y: 1.41, rx: 0.070 + o, rz: 0.065 + o },
    { y: 1.36, rx: 0.225 * sw * g.shoulderW + o, rz: 0.11 + o },
    { y: 1.30, rx: 0.22 * sw * g.shoulderW + o, rz: 0.115 + o },
    { y: 1.25, rx: 0.205 * cs * g.shoulderW + o, rz: 0.125 * cs * g.chestDepth + o },
    { y: 1.20, rx: 0.200 * cs * g.shoulderW + o, rz: 0.135 * cs * g.chestDepth + o },
    { y: 1.14, rx: 0.190 * cs + o, rz: 0.125 * cs * g.chestDepth + o },
    { y: 1.08, rx: 0.175 * cs + o, rz: 0.115 * cs + o },
    { y: 1.02, rx: 0.160 * ws * g.waistNarrow + o, rz: 0.105 * ws + o },
    { y: 0.96, rx: 0.148 * ws * g.waistNarrow + o, rz: 0.098 * ws + o },
    { y: 0.90, rx: 0.165 * hs * g.hipWide + o, rz: 0.110 * hs + o },
    { y: 0.84, rx: 0.185 * hs * g.hipWide + o, rz: 0.125 * hs + o },
    { y: 0.78, rx: 0.210 * hs * g.hipWide + o, rz: 0.140 * hs + o },
    { y: 0.72, rx: 0.205 * hs * g.hipWide + o, rz: 0.135 * hs + o },
    { y: 0.66, rx: 0.180 * g.hipWide + o, rz: 0.115 + o },
  ], 4);
  return buildLimbMesh(sections, 40);
}

function createTrouserLeg(side: -1 | 1, hs: number, g: ReturnType<typeof getGenderMultipliers>) {
  const o = 0.006;
  const hipOff = side * 0.092 * g.hipWide;
  const t = g.legThin;
  const sections = interpolateSections([
    { y: 0.68, rx: 0.094 * hs * t + o, rz: 0.098 * hs * t + o, cx: hipOff * 0.92 },
    { y: 0.62, rx: 0.090 * t + o, rz: 0.094 * t + o, cx: hipOff * 0.88 },
    { y: 0.54, rx: 0.082 * t + o, rz: 0.084 * t + o, cx: hipOff * 0.78 },
    { y: 0.46, rx: 0.072 * t + o, rz: 0.074 * t + o, cx: hipOff * 0.68 },
    { y: 0.38, rx: 0.058 * t + o, rz: 0.062 * t + o, cx: hipOff * 0.60 },
    { y: 0.32, rx: 0.057 * t + o, rz: 0.058 * t + o, cx: hipOff * 0.55 },
    { y: 0.25, rx: 0.054 * t + o, rz: 0.052 * t + o, cx: hipOff * 0.50 },
    { y: 0.18, rx: 0.048 * t + o, rz: 0.046 * t + o, cx: hipOff * 0.48 },
    { y: 0.10, rx: 0.038 * t + o, rz: 0.036 * t + o, cx: hipOff * 0.47 },
    { y: 0.06, rx: 0.035 + o, rz: 0.034 + o, cx: hipOff * 0.47 },
  ], 4);
  return buildLimbMesh(sections, 22);
}

function createSleeve(side: -1 | 1, sw: number, g: ReturnType<typeof getGenderMultipliers>) {
  const o = 0.010;
  const sx = side * 0.225 * sw * g.shoulderW;
  const a = g.armThin;
  const sections = interpolateSections([
    { y: 1.35, rx: 0.058 * a + o, rz: 0.055 * a + o, cx: sx },
    { y: 1.29, rx: 0.056 * a + o, rz: 0.053 * a + o, cx: sx * 1.02 },
    { y: 1.22, rx: 0.053 * a + o, rz: 0.050 * a + o, cx: sx * 1.03 },
    { y: 1.14, rx: 0.050 * a + o, rz: 0.048 * a + o, cx: sx * 1.04 },
    { y: 1.06, rx: 0.044 * a + o, rz: 0.042 * a + o, cx: sx * 1.04 },
    { y: 0.98, rx: 0.040 * a + o, rz: 0.038 * a + o, cx: sx * 1.03 },
    { y: 0.92, rx: 0.041 * a + o, rz: 0.039 * a + o, cx: sx * 1.02 },
    { y: 0.85, rx: 0.038 * a + o, rz: 0.036 * a + o, cx: sx * 1.01 },
    { y: 0.78, rx: 0.033 * a + o, rz: 0.031 * a + o, cx: sx },
    { y: 0.70, rx: 0.028 * a + o, rz: 0.024 * a + o, cx: sx * 0.97 },
  ], 4);
  return buildLimbMesh(sections, 18);
}

function createShoeGeo(side: -1 | 1, g: ReturnType<typeof getGenderMultipliers>) {
  const cx = side * 0.092 * g.hipWide * 0.47;
  const sections = interpolateSections([
    { y: 0.07, rx: 0.035, rz: 0.035, cx },
    { y: 0.05, rx: 0.038, rz: 0.048, cx, cz: 0.005 },
    { y: 0.03, rx: 0.042, rz: 0.063, cx, cz: 0.015 },
    { y: 0.015, rx: 0.044, rz: 0.075, cx, cz: 0.025 },
    { y: 0.0, rx: 0.043, rz: 0.082, cx, cz: 0.032 },
    { y: -0.012, rx: 0.040, rz: 0.076, cx, cz: 0.038 },
    { y: -0.022, rx: 0.025, rz: 0.055, cx, cz: 0.038 },
  ], 3);
  return buildLimbMesh(sections, 18);
}

/* ─────────────────────────────────────────────
   Female Bust Mesh — anatomical hemispheres
   ───────────────────────────────────────────── */

function BustMesh({ cs, g, material }: { cs: number; g: ReturnType<typeof getGenderMultipliers>; material: THREE.Material }) {
  if (g.bustProtrusion <= 0) return null;
  const bustSize = 0.045 * cs * g.chestDepth;
  return (
    <>
      {([-1, 1] as const).map((side) => (
        <mesh
          key={`bust-${side}`}
          position={[side * 0.065 * g.shoulderW, 1.22, 0.10 + g.bustProtrusion * 0.5]}
          rotation={[0.25, side * 0.05, 0]}
          scale={[1.0, 0.85, 0.9]}
        >
          <sphereGeometry args={[bustSize, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <primitive object={material} attach="material" />
        </mesh>
      ))}
    </>
  );
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

  const LERP_SPEED = 5;

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

  // ── Materials — smooth matte mannequin finish ──
  const skinMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: skinTone.hex,
    roughness: 0.42,
    metalness: 0.0,
    clearcoat: 0.15,
    clearcoatRoughness: 0.5,
    sheen: 0.25,
    sheenColor: new THREE.Color(skinTone.hex).offsetHSL(0, -0.05, 0.08),
    sheenRoughness: 0.35,
    envMapIntensity: 0.6,
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
      <BustMesh cs={cs} g={g} material={skinMat} />
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
        <mesh position={[0, 1.415, 0]} material={shirtMat}>
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
          <group ref={leftSleeveRef}>
            <mesh geometry={leftSleeveGeo} material={suitMat} castShadow />
          </group>
          <group ref={rightSleeveRef}>
            <mesh geometry={rightSleeveGeo} material={suitMat} castShadow />
          </group>
        </>
      )}

      {/* ── SHIRT (no jacket) ── */}
      {!garments.jacket && garments.shirt && (
        <>
          <mesh geometry={jacketGeo} material={shirtMat} castShadow />
          <group ref={leftSleeveAltRef}>
            <mesh geometry={leftSleeveGeo} material={shirtMat} castShadow />
          </group>
          <group ref={rightSleeveAltRef}>
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
            <cylinderGeometry args={[0.148 * ws * g.waistNarrow, 0.145 * ws * g.waistNarrow, 0.018, 32]} />
          </mesh>
          <mesh position={[0, 0.86, 0.148 * ws * g.waistNarrow]}>
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
