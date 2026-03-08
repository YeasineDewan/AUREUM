import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { StyleOption, GarmentVisibility, BodyMeasurements } from "@/types/customize";
import { measurementsToMorphTargets } from "@/types/customize";

/* ═══════════════════════════════════════════════
   POSE & SKIN TONE
   ═══════════════════════════════════════════════ */

export type PosePreset = "standing" | "relaxed" | "akimbo" | "walking" | "pockets" | "crossed";

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
  { id: "akimbo",   name: "Akimbo",   icon: "🦸" },
  { id: "walking",  name: "Walking",  icon: "🚶" },
  { id: "pockets",  name: "Pockets",  icon: "🧥" },
  { id: "crossed",  name: "Crossed",  icon: "🤞" },
];

type PoseData = {
  leftArmRot: [number, number, number];
  rightArmRot: [number, number, number];
  leftHandRot: [number, number, number];
  rightHandRot: [number, number, number];
  leftArmPos: [number, number, number];
  rightArmPos: [number, number, number];
  hipTilt: number;
};

function getPoseTransforms(pose: PosePreset): PoseData {
  const v = (x: number, y: number, z: number): [number, number, number] => [x, y, z];
  switch (pose) {
    case "relaxed":
      return {
        leftArmRot: v(0.05, 0, 0.15), rightArmRot: v(0.05, 0, -0.15),
        leftHandRot: v(0.08, 0, 0.15), rightHandRot: v(0.08, 0, -0.15),
        leftArmPos: v(-0.008, -0.008, 0.005), rightArmPos: v(0.008, -0.008, 0.005),
        hipTilt: 0.02,
      };
    case "akimbo":
      return {
        leftArmRot: v(0.2, 0.25, 0.65), rightArmRot: v(0.2, -0.25, -0.65),
        leftHandRot: v(0.35, 0.3, 0.70), rightHandRot: v(0.35, -0.3, -0.70),
        leftArmPos: v(-0.04, 0.02, 0.03), rightArmPos: v(0.04, 0.02, 0.03),
        hipTilt: 0,
      };
    case "walking":
      return {
        leftArmRot: v(0.30, 0.05, 0.10), rightArmRot: v(-0.20, -0.05, -0.10),
        leftHandRot: v(0.32, 0.05, 0.10), rightHandRot: v(-0.18, -0.05, -0.10),
        leftArmPos: v(0, 0.01, 0.025), rightArmPos: v(0, -0.01, -0.015),
        hipTilt: 0.03,
      };
    case "pockets":
      return {
        leftArmRot: v(0.25, 0.18, 0.35), rightArmRot: v(0.25, -0.18, -0.35),
        leftHandRot: v(0.40, 0.25, 0.45), rightHandRot: v(0.40, -0.25, -0.45),
        leftArmPos: v(-0.025, -0.015, 0.04), rightArmPos: v(0.025, -0.015, 0.04),
        hipTilt: 0.015,
      };
    case "crossed":
      return {
        leftArmRot: v(0.50, 0.40, 0.45), rightArmRot: v(0.50, -0.40, -0.45),
        leftHandRot: v(0.60, 0.45, 0.55), rightHandRot: v(0.60, -0.45, -0.55),
        leftArmPos: v(-0.025, 0.05, 0.07), rightArmPos: v(0.025, 0.05, 0.07),
        hipTilt: 0,
      };
    default: // standing
      return {
        leftArmRot: v(0, 0, 0), rightArmRot: v(0, 0, 0),
        leftHandRot: v(0, 0, 0), rightHandRot: v(0, 0, 0),
        leftArmPos: v(0, 0, 0), rightArmPos: v(0, 0, 0),
        hipTilt: 0,
      };
  }
}

/* ═══════════════════════════════════════════════
   GEOMETRY CORE
   ═══════════════════════════════════════════════ */

type Sec = { y: number; rx: number; rz: number; cx?: number; cz?: number };

function buildMesh(sections: Sec[], segs = 24): THREE.BufferGeometry {
  const pos: number[] = [], nrm: number[] = [], uv: number[] = [], idx: number[] = [];
  const R = sections.length;
  for (let i = 0; i < R; i++) {
    const s = sections[i], ox = s.cx ?? 0, oz = s.cz ?? 0, v = i / (R - 1);
    for (let j = 0; j <= segs; j++) {
      const u = j / segs, th = u * Math.PI * 2;
      pos.push(ox + Math.cos(th) * s.rx, s.y, oz + Math.sin(th) * s.rz);
      uv.push(u, v);
      nrm.push(Math.cos(th), 0, Math.sin(th));
    }
  }
  for (let i = 0; i < R - 1; i++) {
    for (let j = 0; j < segs; j++) {
      const a = i * (segs + 1) + j, b = a + segs + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nrm, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function lerp(sections: Sec[], sub = 4): Sec[] {
  const out: Sec[] = [];
  for (let i = 0; i < sections.length - 1; i++) {
    const a = sections[i], b = sections[i + 1];
    for (let t = 0; t < sub; t++) {
      const f = t / sub, s = 0.5 - 0.5 * Math.cos(f * Math.PI);
      out.push({
        y: a.y + (b.y - a.y) * s, rx: a.rx + (b.rx - a.rx) * s, rz: a.rz + (b.rz - a.rz) * s,
        cx: (a.cx ?? 0) + ((b.cx ?? 0) - (a.cx ?? 0)) * s,
        cz: (a.cz ?? 0) + ((b.cz ?? 0) - (a.cz ?? 0)) * s,
      });
    }
  }
  out.push(sections[sections.length - 1]);
  return out;
}

/* ═══════════════════════════════════════════════
   FABRIC TEXTURE
   ═══════════════════════════════════════════════ */

function useFabricTexture(fabricId: string) {
  return useMemo(() => {
    const s = 512, c = document.createElement("canvas");
    c.width = s; c.height = s;
    const x = c.getContext("2d")!;
    x.fillStyle = "#808080"; x.fillRect(0, 0, s, s);
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
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(10, 10);
    return tex;
  }, [fabricId]);
}

/* ═══════════════════════════════════════════════
   GENDER MULTIPLIERS
   ═══════════════════════════════════════════════ */

export type Gender = "male" | "female";

function getGM(gender: Gender) {
  if (gender === "female") return {
    sw: 0.86, cd: 1.15, wn: 0.82, hw: 1.20, at: 0.85, lt: 0.90, nt: 0.82,
    hs: 0.96, bust: 0.035, butt: 0.018,
  };
  return {
    sw: 1.0, cd: 1.0, wn: 1.0, hw: 1.0, at: 1.0, lt: 1.0, nt: 1.0,
    hs: 1.0, bust: 0, butt: 0.005,
  };
}

type GM = ReturnType<typeof getGM>;

/* ═══════════════════════════════════════════════
   BODY PARTS
   ═══════════════════════════════════════════════ */

function mkHead(g: GM) {
  const s = g.hs;
  return buildMesh(lerp([
    { y: 1.74, rx: 0.006, rz: 0.006 },
    { y: 1.73, rx: 0.06 * s, rz: 0.065 * s },
    { y: 1.715, rx: 0.088 * s, rz: 0.092 * s },
    { y: 1.70, rx: 0.096 * s, rz: 0.10 * s },
    { y: 1.685, rx: 0.099 * s, rz: 0.104 * s },
    { y: 1.67, rx: 0.100 * s, rz: 0.106 * s },
    { y: 1.655, rx: 0.101 * s, rz: 0.105 * s, cz: 0.003 },
    { y: 1.645, rx: 0.100 * s, rz: 0.103 * s, cz: 0.004 },
    { y: 1.63, rx: 0.098 * s, rz: 0.100 * s, cz: 0.003 },
    { y: 1.615, rx: 0.095 * s, rz: 0.094 * s, cz: 0.004 },
    { y: 1.60, rx: 0.092 * s, rz: 0.088 * s, cz: 0.005 },
    { y: 1.585, rx: 0.086 * s, rz: 0.082 * s, cz: 0.005 },
    { y: 1.57, rx: 0.080 * s, rz: 0.076 * s, cz: 0.004 },
    { y: 1.555, rx: 0.072 * s, rz: 0.070 * s, cz: 0.003 },
    { y: 1.545, rx: 0.062 * s, rz: 0.062 * s, cz: 0.005 },
    { y: 1.535, rx: 0.050 * s, rz: 0.054 * s, cz: 0.008 },
    { y: 1.525, rx: 0.038 * s, rz: 0.044 * s, cz: 0.012 },
    { y: 1.518, rx: 0.028 * s, rz: 0.035 * s, cz: 0.014 },
    { y: 1.512, rx: 0.018, rz: 0.025, cz: 0.013 },
  ], 4), 36);
}

function mkNeck(g: GM) {
  const n = g.nt;
  return buildMesh(lerp([
    { y: 1.512, rx: 0.030 * n, rz: 0.032 * n },
    { y: 1.50, rx: 0.042 * n, rz: 0.040 * n },
    { y: 1.485, rx: 0.048 * n, rz: 0.046 * n },
    { y: 1.47, rx: 0.052 * n, rz: 0.050 * n },
    { y: 1.455, rx: 0.054 * n, rz: 0.052 * n, cz: g.hs === 1.0 ? 0.004 : 0 },
    { y: 1.44, rx: 0.058 * n, rz: 0.055 * n },
    { y: 1.425, rx: 0.065 * n, rz: 0.060 * n },
    { y: 1.41, rx: 0.072 * n, rz: 0.065 * n },
  ], 4), 24);
}

function mkTorso(cs: number, ws: number, hs: number, sw: number, g: GM) {
  const bp = g.bust, bk = g.butt, fem = g.sw < 1;
  return buildMesh(lerp([
    { y: 1.42, rx: 0.065 * g.nt, rz: 0.060 * g.nt },
    { y: 1.39, rx: 0.12 * g.sw, rz: 0.075 },
    { y: 1.35, rx: 0.215 * sw * g.sw, rz: 0.10 },
    { y: 1.31, rx: 0.21 * sw * g.sw, rz: 0.105 },
    { y: 1.28, rx: 0.195 * cs * g.sw, rz: 0.112 * cs * g.cd, cz: bp * 0.3 },
    { y: 1.24, rx: 0.190 * cs * g.sw, rz: 0.120 * cs * g.cd, cz: bp * 0.8 },
    { y: 1.20, rx: 0.185 * cs * g.sw, rz: 0.125 * cs * g.cd, cz: bp },
    { y: 1.16, rx: 0.178 * cs * (fem ? 0.92 : 1), rz: 0.115 * cs * g.cd, cz: bp * 0.5 },
    { y: 1.12, rx: 0.170 * cs * (fem ? 0.90 : 1), rz: 0.108 * cs },
    { y: 1.08, rx: 0.160 * cs * (fem ? 0.88 : 1), rz: 0.102 * cs },
    { y: 1.03, rx: 0.145 * ws * g.wn, rz: 0.092 * ws },
    { y: 0.98, rx: 0.135 * ws * g.wn, rz: 0.088 * ws },
    { y: 0.94, rx: 0.140 * ws * g.wn, rz: 0.090 * ws, cz: -bk * 0.2 },
    { y: 0.90, rx: 0.155 * hs * g.hw, rz: 0.098 * hs, cz: -bk * 0.4 },
    { y: 0.86, rx: 0.175 * hs * g.hw, rz: 0.110 * hs, cz: -bk * 0.6 },
    { y: 0.82, rx: 0.195 * hs * g.hw, rz: 0.125 * hs, cz: -bk * 0.8 },
    { y: 0.78, rx: 0.200 * hs * g.hw, rz: 0.130 * hs, cz: -bk },
    { y: 0.74, rx: 0.198 * hs * g.hw, rz: 0.128 * hs, cz: -bk * 0.9 },
    { y: 0.70, rx: 0.190 * hs * g.hw, rz: 0.120 * hs, cz: -bk * 0.5 },
    { y: 0.66, rx: 0.170 * g.hw, rz: 0.108, cz: -bk * 0.2 },
    { y: 0.62, rx: 0.155 * g.hw, rz: 0.098 },
  ], 5), 40);
}

function mkLeg(side: -1 | 1, hs: number, g: GM) {
  const h = side * 0.092 * g.hw, t = g.lt;
  return buildMesh(lerp([
    { y: 0.66, rx: 0.090 * hs * t, rz: 0.095 * hs * t, cx: h * 0.95 },
    { y: 0.62, rx: 0.086 * t, rz: 0.090 * t, cx: h * 0.90 },
    { y: 0.56, rx: 0.080 * t, rz: 0.082 * t, cx: h * 0.80 },
    { y: 0.50, rx: 0.074 * t, rz: 0.076 * t, cx: h * 0.72 },
    { y: 0.44, rx: 0.066 * t, rz: 0.068 * t, cx: h * 0.65 },
    { y: 0.39, rx: 0.054 * t, rz: 0.058 * t, cx: h * 0.60 },
    { y: 0.37, rx: 0.050 * t, rz: 0.056 * t, cx: h * 0.58 },
    { y: 0.35, rx: 0.048 * t, rz: 0.055 * t, cx: h * 0.57 },
    { y: 0.32, rx: 0.052 * t, rz: 0.054 * t, cx: h * 0.55, cz: -0.006 },
    { y: 0.29, rx: 0.054 * t, rz: 0.052 * t, cx: h * 0.53, cz: -0.008 },
    { y: 0.25, rx: 0.050 * t, rz: 0.048 * t, cx: h * 0.50, cz: -0.005 },
    { y: 0.20, rx: 0.043 * t, rz: 0.040 * t, cx: h * 0.48 },
    { y: 0.15, rx: 0.036 * t, rz: 0.034 * t, cx: h * 0.47 },
    { y: 0.10, rx: 0.030 * t, rz: 0.028 * t, cx: h * 0.47 },
    { y: 0.07, rx: 0.028, rz: 0.026, cx: h * 0.47 },
    { y: 0.05, rx: 0.030, rz: 0.027, cx: h * 0.47 },
    { y: 0.03, rx: 0.032, rz: 0.030, cx: h * 0.47 },
  ], 4), 22);
}

function mkFoot(side: -1 | 1, g: GM) {
  const cx = side * 0.092 * g.hw * 0.47;
  return buildMesh(lerp([
    { y: 0.035, rx: 0.032, rz: 0.030, cx },
    { y: 0.025, rx: 0.034, rz: 0.040, cx, cz: 0.008 },
    { y: 0.015, rx: 0.036, rz: 0.052, cx, cz: 0.015 },
    { y: 0.008, rx: 0.038, rz: 0.060, cx, cz: 0.022 },
    { y: 0.003, rx: 0.040, rz: 0.068, cx, cz: 0.028 },
    { y: 0.0, rx: 0.038, rz: 0.065, cx, cz: 0.035 },
    { y: -0.005, rx: 0.034, rz: 0.058, cx, cz: 0.040 },
    { y: -0.010, rx: 0.025, rz: 0.045, cx, cz: 0.042 },
    { y: -0.015, rx: 0.015, rz: 0.030, cx, cz: 0.044 },
    { y: -0.018, rx: 0.008, rz: 0.018, cx, cz: 0.044 },
  ], 3), 16);
}

function mkArm(side: -1 | 1, sw: number, g: GM) {
  const sx = side * 0.225 * sw * g.sw, a = g.at;
  return buildMesh(lerp([
    { y: 1.34, rx: 0.055 * a, rz: 0.052 * a, cx: sx },
    { y: 1.30, rx: 0.054 * a, rz: 0.050 * a, cx: sx * 1.02 },
    { y: 1.25, rx: 0.050 * a, rz: 0.048 * a, cx: sx * 1.03 },
    { y: 1.19, rx: 0.048 * a, rz: 0.046 * a, cx: sx * 1.04 },
    { y: 1.13, rx: 0.044 * a, rz: 0.042 * a, cx: sx * 1.04 },
    { y: 1.06, rx: 0.040 * a, rz: 0.038 * a, cx: sx * 1.04 },
    { y: 1.02, rx: 0.036 * a, rz: 0.035 * a, cx: sx * 1.03 },
    { y: 0.98, rx: 0.035 * a, rz: 0.034 * a, cx: sx * 1.03 },
    { y: 0.93, rx: 0.037 * a, rz: 0.035 * a, cx: sx * 1.02 },
    { y: 0.88, rx: 0.035 * a, rz: 0.033 * a, cx: sx * 1.01 },
    { y: 0.82, rx: 0.031 * a, rz: 0.029 * a, cx: sx },
    { y: 0.76, rx: 0.027 * a, rz: 0.025 * a, cx: sx * 0.98 },
    { y: 0.70, rx: 0.023 * a, rz: 0.019 * a, cx: sx * 0.96 },
    { y: 0.66, rx: 0.022 * a, rz: 0.017 * a, cx: sx * 0.95 },
  ], 4), 18);
}

/* ═══════════════════════════════════════════════
   NATURALLY CURVED HANDS
   Fingers curl slightly inward with natural resting curvature
   ═══════════════════════════════════════════════ */

function mkPalm(side: -1 | 1, sw: number, g: GM) {
  const sx = side * 0.225 * sw * g.sw * 0.95, a = g.at;
  return buildMesh(lerp([
    { y: 0.66, rx: 0.022 * a, rz: 0.014 * a, cx: sx },
    { y: 0.648, rx: 0.027 * a, rz: 0.012 * a, cx: sx },
    { y: 0.632, rx: 0.031 * a, rz: 0.013 * a, cx: sx * 0.99 },
    { y: 0.615, rx: 0.032 * a, rz: 0.013 * a, cx: sx * 0.98, cz: 0.003 },
    { y: 0.600, rx: 0.030 * a, rz: 0.012 * a, cx: sx * 0.97, cz: 0.005 },
    { y: 0.590, rx: 0.027 * a, rz: 0.010 * a, cx: sx * 0.96, cz: 0.006 },
  ], 3), 14);
}

/** Create a finger with natural inward curvature — NOT straight */
function mkCurvedFinger(
  side: -1 | 1, sw: number, g: GM,
  offsetX: number, length: number, baseR: number, tipR: number, curvature: number
): THREE.BufferGeometry {
  const sx = side * 0.225 * sw * g.sw * 0.95, a = g.at;
  const cx0 = sx + side * offsetX * a;
  const segs = 10;
  const sections: Sec[] = [];

  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    // Natural downward + forward curl
    const curveForward = curvature * Math.pow(t, 1.8) * length * 2.5;
    const curveDown = length * t;
    const y = 0.590 - curveDown;
    const cz = 0.006 + curveForward;

    // Knuckle bulges at 25% and 55%
    const k1 = 1 + 0.18 * Math.exp(-Math.pow((t - 0.25) * 5, 2));
    const k2 = 1 + 0.12 * Math.exp(-Math.pow((t - 0.55) * 5, 2));
    const r = THREE.MathUtils.lerp(baseR, tipR, t) * a * k1 * k2;

    // Slight lateral splay
    const splay = side * t * 0.002 * (offsetX > 0 ? 1 : -1);

    sections.push({ y, rx: r, rz: r * 0.82, cx: cx0 + splay, cz });
  }
  return buildMesh(lerp(sections, 2), 10);
}

function mkThumb(side: -1 | 1, sw: number, g: GM): THREE.BufferGeometry {
  const sx = side * 0.225 * sw * g.sw * 0.95, a = g.at;
  const bx = sx + side * 0.030 * a;
  // Thumb naturally curves outward and forward
  return buildMesh(lerp([
    { y: 0.648, rx: 0.010 * a, rz: 0.009 * a, cx: bx, cz: 0.010 },
    { y: 0.638, rx: 0.011 * a, rz: 0.010 * a, cx: bx + side * 0.008, cz: 0.015 },
    { y: 0.625, rx: 0.010 * a, rz: 0.009 * a, cx: bx + side * 0.014, cz: 0.020 },
    { y: 0.612, rx: 0.009 * a, rz: 0.008 * a, cx: bx + side * 0.018, cz: 0.023 },
    { y: 0.600, rx: 0.008 * a, rz: 0.007 * a, cx: bx + side * 0.020, cz: 0.024 },
    { y: 0.592, rx: 0.006 * a, rz: 0.005 * a, cx: bx + side * 0.021, cz: 0.023 },
  ], 2), 10);
}

function HandMesh({ side, sw, g, material }: { side: -1 | 1; sw: number; g: GM; material: THREE.Material }) {
  const palmGeo = useMemo(() => mkPalm(side, sw, g), [side, sw, g]);
  const thumbGeo = useMemo(() => mkThumb(side, sw, g), [side, sw, g]);

  // Each finger: offsetX, length, baseR, tipR, curvature (0=straight, 1=very curled)
  const fingers = useMemo(() => [
    mkCurvedFinger(side, sw, g, -0.013, 0.052, 0.0058, 0.0038, 0.25), // Index
    mkCurvedFinger(side, sw, g, -0.004, 0.058, 0.0060, 0.0038, 0.22), // Middle
    mkCurvedFinger(side, sw, g, 0.005,  0.052, 0.0056, 0.0036, 0.28), // Ring
    mkCurvedFinger(side, sw, g, 0.013,  0.042, 0.0048, 0.0030, 0.32), // Pinky (most curled)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [side, sw, g]);

  return (
    <group>
      <mesh geometry={palmGeo} material={material} castShadow />
      <mesh geometry={thumbGeo} material={material} castShadow />
      {fingers.map((geo, i) => <mesh key={i} geometry={geo} material={material} castShadow />)}
    </group>
  );
}

/* ═══════════════════════════════════════════════
   FACIAL FEATURES — Minimal mannequin style
   ═══════════════════════════════════════════════ */

function Face({ gender, skinTone }: { gender: Gender; skinTone: SkinTone }) {
  const g = getGM(gender);
  const s = g.hs, fem = gender === "female";
  const fc = skinTone.faceTint, lc = skinTone.lipTint;

  return (
    <group>
      {/* Eyes */}
      {([-1, 1] as const).map((sd) => (
        <group key={`eye${sd}`}>
          <mesh position={[sd * 0.033 * s, 1.637, 0.088]}>
            <sphereGeometry args={[0.012 * s, 16, 16]} />
            <meshPhysicalMaterial color="#f5efe8" roughness={0.06} clearcoat={0.8} />
          </mesh>
          <mesh position={[sd * 0.033 * s, 1.637, 0.098]}>
            <sphereGeometry args={[0.006 * s, 14, 14]} />
            <meshPhysicalMaterial color={fem ? "#5a3a28" : "#3a2a1a"} roughness={0.10} clearcoat={0.5} />
          </mesh>
          <mesh position={[sd * 0.033 * s, 1.637, 0.101]}>
            <sphereGeometry args={[0.003 * s, 10, 10]} />
            <meshPhysicalMaterial color="#060606" roughness={0.02} />
          </mesh>
          <mesh position={[sd * 0.033 * s, 1.645, 0.091]} rotation={[0.4, 0, 0]} scale={[1.5, 0.35, 0.6]}>
            <sphereGeometry args={[0.011 * s, 12, 8]} />
            <meshPhysicalMaterial color={fc} roughness={0.45} />
          </mesh>
          <mesh position={[sd * 0.033 * s, 1.630, 0.091]} rotation={[-0.3, 0, 0]} scale={[1.3, 0.25, 0.5]}>
            <sphereGeometry args={[0.011 * s, 12, 8]} />
            <meshPhysicalMaterial color={fc} roughness={0.45} />
          </mesh>
          <mesh position={[sd * 0.033 * s, 1.654, 0.092]} rotation={[0.15, 0, sd * -0.06]} scale={[1, 1, 0.5]}>
            <boxGeometry args={[(fem ? 0.026 : 0.030) * s, fem ? 0.003 : 0.005, 0.008]} />
            <meshPhysicalMaterial color={fc} roughness={0.6} />
          </mesh>
        </group>
      ))}
      {/* Nose */}
      <mesh position={[0, 1.620, 0.094]} rotation={[0.08, 0, 0]}>
        <boxGeometry args={[0.009 * s, 0.030, 0.011]} />
        <meshPhysicalMaterial color={fc} roughness={0.45} clearcoat={0.08} />
      </mesh>
      <mesh position={[0, 1.600, 0.102]}>
        <sphereGeometry args={[fem ? 0.009 : 0.012, 12, 12]} />
        <meshPhysicalMaterial color={fc} roughness={0.40} clearcoat={0.10} />
      </mesh>
      {([-1, 1] as const).map((sd) => (
        <mesh key={`nos${sd}`} position={[sd * 0.007 * s, 1.597, 0.098]}>
          <sphereGeometry args={[0.004 * s, 8, 8]} />
          <meshPhysicalMaterial color={fc} roughness={0.55} />
        </mesh>
      ))}
      {/* Lips */}
      <mesh position={[0, 1.577, 0.092]} scale={[1.6, 0.5, 0.5]}>
        <sphereGeometry args={[fem ? 0.010 : 0.009, 14, 10]} />
        <meshPhysicalMaterial color={lc} roughness={0.28} clearcoat={fem ? 0.35 : 0.15} />
      </mesh>
      <mesh position={[0, 1.571, 0.091]} scale={[1.5, 0.6, 0.5]}>
        <sphereGeometry args={[fem ? 0.011 : 0.009, 14, 10]} />
        <meshPhysicalMaterial color={lc} roughness={0.26} clearcoat={fem ? 0.40 : 0.20} />
      </mesh>
      {/* Ears */}
      {([-1, 1] as const).map((sd) => (
        <group key={`ear${sd}`}>
          <mesh position={[sd * 0.100 * s, 1.62, -0.012]} rotation={[0, sd * 0.25, 0]} scale={[0.55, 1.0, 0.45]}>
            <sphereGeometry args={[0.022 * s, 14, 14]} />
            <meshPhysicalMaterial color={fc} roughness={0.48} />
          </mesh>
          <mesh position={[sd * 0.100 * s, 1.603, -0.010]} scale={[0.45, 0.45, 0.35]}>
            <sphereGeometry args={[0.012 * s, 10, 10]} />
            <meshPhysicalMaterial color={fc} roughness={0.48} />
          </mesh>
        </group>
      ))}
      {/* Collarbones */}
      {([-1, 1] as const).map((sd) => (
        <mesh key={`clav${sd}`} position={[sd * 0.07, 1.395, 0.06]} rotation={[0.1, 0, sd * -0.25]} scale={[1, 0.3, 0.4]}>
          <capsuleGeometry args={[0.006, 0.08, 6, 12]} />
          <meshPhysicalMaterial color={skinTone.hex} roughness={0.50} transparent opacity={0.35} />
        </mesh>
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════════
   BUST (female)
   ═══════════════════════════════════════════════ */

function Bust({ cs, g, material }: { cs: number; g: GM; material: THREE.Material }) {
  if (g.bust <= 0) return null;
  const size = 0.045 * cs * g.cd;
  return (
    <>
      {([-1, 1] as const).map((sd) => (
        <mesh key={sd} position={[sd * 0.065 * g.sw, 1.22, 0.10 + g.bust * 0.5]}
          rotation={[0.25, sd * 0.05, 0]} scale={[1.0, 0.85, 0.9]}>
          <sphereGeometry args={[size, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <primitive object={material} attach="material" />
        </mesh>
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════════
   GARMENT BUILDERS
   ═══════════════════════════════════════════════ */

function mkJacket(cs: number, ws: number, hs: number, sw: number, g: GM) {
  const o = 0.016;
  return buildMesh(lerp([
    { y: 1.41, rx: 0.070 + o, rz: 0.065 + o },
    { y: 1.36, rx: 0.225 * sw * g.sw + o, rz: 0.11 + o },
    { y: 1.30, rx: 0.22 * sw * g.sw + o, rz: 0.115 + o },
    { y: 1.25, rx: 0.205 * cs * g.sw + o, rz: 0.125 * cs * g.cd + o },
    { y: 1.20, rx: 0.200 * cs * g.sw + o, rz: 0.135 * cs * g.cd + o },
    { y: 1.14, rx: 0.190 * cs + o, rz: 0.125 * cs * g.cd + o },
    { y: 1.08, rx: 0.175 * cs + o, rz: 0.115 * cs + o },
    { y: 1.02, rx: 0.160 * ws * g.wn + o, rz: 0.105 * ws + o },
    { y: 0.96, rx: 0.148 * ws * g.wn + o, rz: 0.098 * ws + o },
    { y: 0.90, rx: 0.165 * hs * g.hw + o, rz: 0.110 * hs + o },
    { y: 0.84, rx: 0.185 * hs * g.hw + o, rz: 0.125 * hs + o },
    { y: 0.78, rx: 0.210 * hs * g.hw + o, rz: 0.140 * hs + o },
    { y: 0.72, rx: 0.205 * hs * g.hw + o, rz: 0.135 * hs + o },
    { y: 0.66, rx: 0.180 * g.hw + o, rz: 0.115 + o },
  ], 4), 40);
}

function mkTrouser(side: -1 | 1, hs: number, g: GM) {
  const o = 0.006, h = side * 0.092 * g.hw, t = g.lt;
  return buildMesh(lerp([
    { y: 0.68, rx: 0.094 * hs * t + o, rz: 0.098 * hs * t + o, cx: h * 0.92 },
    { y: 0.62, rx: 0.090 * t + o, rz: 0.094 * t + o, cx: h * 0.88 },
    { y: 0.54, rx: 0.082 * t + o, rz: 0.084 * t + o, cx: h * 0.78 },
    { y: 0.46, rx: 0.072 * t + o, rz: 0.074 * t + o, cx: h * 0.68 },
    { y: 0.38, rx: 0.058 * t + o, rz: 0.062 * t + o, cx: h * 0.60 },
    { y: 0.32, rx: 0.057 * t + o, rz: 0.058 * t + o, cx: h * 0.55 },
    { y: 0.25, rx: 0.054 * t + o, rz: 0.052 * t + o, cx: h * 0.50 },
    { y: 0.18, rx: 0.048 * t + o, rz: 0.046 * t + o, cx: h * 0.48 },
    { y: 0.10, rx: 0.038 * t + o, rz: 0.036 * t + o, cx: h * 0.47 },
    { y: 0.06, rx: 0.035 + o, rz: 0.034 + o, cx: h * 0.47 },
  ], 4), 22);
}

function mkSleeve(side: -1 | 1, sw: number, g: GM) {
  const o = 0.010, sx = side * 0.225 * sw * g.sw, a = g.at;
  return buildMesh(lerp([
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
  ], 4), 18);
}

function mkShoe(side: -1 | 1, g: GM) {
  const cx = side * 0.092 * g.hw * 0.47;
  return buildMesh(lerp([
    { y: 0.07, rx: 0.035, rz: 0.035, cx },
    { y: 0.05, rx: 0.038, rz: 0.048, cx, cz: 0.005 },
    { y: 0.03, rx: 0.042, rz: 0.063, cx, cz: 0.015 },
    { y: 0.015, rx: 0.044, rz: 0.075, cx, cz: 0.025 },
    { y: 0.0, rx: 0.043, rz: 0.082, cx, cz: 0.032 },
    { y: -0.012, rx: 0.040, rz: 0.076, cx, cz: 0.038 },
    { y: -0.022, rx: 0.025, rz: 0.055, cx, cz: 0.038 },
  ], 3), 18);
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */

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
  color, fabricId, fabricProps, styleConfig, garments, bodyMeasurements,
  gender = "male", skinTone = SKIN_TONES[1], pose = "standing",
}: MannequinProps) {
  const group = useRef<THREE.Group>(null);
  const bumpMap = useFabricTexture(fabricId);
  const g = useMemo(() => getGM(gender), [gender]);

  const morph = useMemo(() => {
    if (!bodyMeasurements) return { heightScale: 1, chestScale: 1, waistScale: 1, hipScale: 1, shoulderScale: 1, legScale: 1, armScale: 1 };
    const m = measurementsToMorphTargets(bodyMeasurements);
    console.log("[Mannequin3D] morph targets:", m, "from measurements:", bodyMeasurements);
    return m;
  }, [bodyMeasurements]);

  // Animated pose
  const target = useMemo(() => getPoseTransforms(pose), [pose]);
  const laRef = useRef<THREE.Group>(null), raRef = useRef<THREE.Group>(null);
  const lhRef = useRef<THREE.Group>(null), rhRef = useRef<THREE.Group>(null);
  const lsRef = useRef<THREE.Group>(null), rsRef = useRef<THREE.Group>(null);
  const lsaRef = useRef<THREE.Group>(null), rsaRef = useRef<THREE.Group>(null);

  useFrame((state, dt) => {
    if (group.current) group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.04;
    const t = 1 - Math.exp(-5 * dt);
    const L = (ref: React.RefObject<THREE.Group | null>, p: [number, number, number], r: [number, number, number]) => {
      if (!ref.current) return;
      ref.current.position.lerp(new THREE.Vector3(...p), t);
      ref.current.rotation.x += (r[0] - ref.current.rotation.x) * t;
      ref.current.rotation.y += (r[1] - ref.current.rotation.y) * t;
      ref.current.rotation.z += (r[2] - ref.current.rotation.z) * t;
    };
    L(laRef, target.leftArmPos, target.leftArmRot);
    L(raRef, target.rightArmPos, target.rightArmRot);
    L(lhRef, target.leftArmPos, target.leftHandRot);
    L(rhRef, target.rightArmPos, target.rightHandRot);
    L(lsRef, target.leftArmPos, target.leftArmRot);
    L(rsRef, target.rightArmPos, target.rightArmRot);
    L(lsaRef, target.leftArmPos, target.leftArmRot);
    L(rsaRef, target.rightArmPos, target.rightArmRot);
  });

  // Materials
  const skinMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: skinTone.hex, roughness: 0.42, metalness: 0,
    clearcoat: 0.15, clearcoatRoughness: 0.5,
    sheen: 0.25, sheenColor: new THREE.Color(skinTone.hex).offsetHSL(0, -0.05, 0.08),
    sheenRoughness: 0.35, envMapIntensity: 0.6,
  }), [skinTone]);

  const suitMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color), roughness: fabricProps.roughness, metalness: fabricProps.metalness,
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

  const shirtMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#f0ebe3", roughness: 0.75, envMapIntensity: 0.3 }), []);
  const shoeMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#1a1410", roughness: 0.22, metalness: 0.10, clearcoat: 0.35, envMapIntensity: 0.8 }), []);
  const buttonMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#6b5d4f", roughness: 0.35, metalness: 0.18, clearcoat: 0.25 }), []);
  const vestMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color).offsetHSL(0, 0.05, 0.05),
    roughness: fabricProps.roughness - 0.05, metalness: fabricProps.metalness + 0.02,
    bumpMap, bumpScale: fabricProps.bumpScale * 0.6,
  }), [color, fabricProps, bumpMap]);
  const tieMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#5c1a2a", roughness: 0.38, sheen: 0.3, sheenColor: new THREE.Color("#8a2040") }), []);
  const beltMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#1a1410", roughness: 0.30, metalness: 0.12, clearcoat: 0.25 }), []);

  const sw = styleConfig.shoulderMult * morph.shoulderScale;
  const cs = morph.chestScale, ws = morph.waistScale, hs = morph.hipScale;

  // Geometries
  const headG = useMemo(() => mkHead(g), [g]);
  const neckG = useMemo(() => mkNeck(g), [g]);
  const torsoG = useMemo(() => mkTorso(cs, ws, hs, sw, g), [cs, ws, hs, sw, g]);
  const lLegG = useMemo(() => mkLeg(-1, hs, g), [hs, g]);
  const rLegG = useMemo(() => mkLeg(1, hs, g), [hs, g]);
  const lFootG = useMemo(() => mkFoot(-1, g), [g]);
  const rFootG = useMemo(() => mkFoot(1, g), [g]);
  const lArmG = useMemo(() => mkArm(-1, sw, g), [sw, g]);
  const rArmG = useMemo(() => mkArm(1, sw, g), [sw, g]);

  const jacketG = useMemo(() => mkJacket(cs, ws, hs, sw, g), [cs, ws, hs, sw, g]);
  const lTrG = useMemo(() => mkTrouser(-1, hs, g), [hs, g]);
  const rTrG = useMemo(() => mkTrouser(1, hs, g), [hs, g]);
  const lSlG = useMemo(() => mkSleeve(-1, sw, g), [sw, g]);
  const rSlG = useMemo(() => mkSleeve(1, sw, g), [sw, g]);
  const lShG = useMemo(() => mkShoe(-1, g), [g]);
  const rShG = useMemo(() => mkShoe(1, g), [g]);

  const sc = morph.heightScale;

  return (
    <group ref={group} scale={[sc, sc, sc]} position={[0, -0.85 * sc, 0]}>
      {/* Body */}
      <mesh geometry={headG} material={skinMat} castShadow />
      <mesh geometry={neckG} material={skinMat} castShadow />
      <mesh geometry={torsoG} material={skinMat} castShadow receiveShadow />
      <Bust cs={cs} g={g} material={skinMat} />
      <mesh geometry={lLegG} material={skinMat} castShadow />
      <mesh geometry={rLegG} material={skinMat} castShadow />
      <mesh geometry={lFootG} material={skinMat} />
      <mesh geometry={rFootG} material={skinMat} />

      {/* Arms (animated) */}
      <group ref={laRef}><mesh geometry={lArmG} material={skinMat} castShadow /></group>
      <group ref={raRef}><mesh geometry={rArmG} material={skinMat} castShadow /></group>

      {/* Hands (animated) — natural curved fingers */}
      <group ref={lhRef}><HandMesh side={-1} sw={sw} g={g} material={skinMat} /></group>
      <group ref={rhRef}><HandMesh side={1} sw={sw} g={g} material={skinMat} /></group>

      {/* Face */}
      <Face gender={gender} skinTone={skinTone} />

      {/* Shirt collar */}
      {garments.shirt && (
        <mesh position={[0, 1.415, 0]} material={shirtMat}>
          <cylinderGeometry args={[0.062 * g.nt, 0.068 * g.nt, 0.02, 28]} />
        </mesh>
      )}

      {/* Tie */}
      {garments.tie && (
        <group>
          <mesh position={[0, 1.40, 0.06]} material={tieMat}><boxGeometry args={[0.025, 0.02, 0.012]} /></mesh>
          <mesh position={[0, 1.15, 0.075]} material={tieMat}><boxGeometry args={[0.032, 0.46, 0.006]} /></mesh>
          <mesh position={[0, 0.92, 0.075]} rotation={[0, 0, Math.PI / 4]} material={tieMat}><boxGeometry args={[0.025, 0.025, 0.006]} /></mesh>
        </group>
      )}

      {/* Jacket */}
      {garments.jacket && (
        <>
          <mesh geometry={jacketG} material={suitMat} castShadow />
          {([-1, 1] as const).map((sd) => (
            <mesh key={`lap${sd}`} position={[sd * 0.045 * styleConfig.lapelMult, 1.30, 0.12]}
              rotation={[0.06, sd * 0.15, sd * 0.1]} material={suitMat} castShadow>
              <boxGeometry args={[0.06 * styleConfig.lapelMult, 0.15, 0.008]} />
            </mesh>
          ))}
          <mesh position={[-0.065, 1.06, 0.115]} material={suitMat}><boxGeometry args={[0.06, 0.004, 0.008]} /></mesh>
          <group ref={lsRef}><mesh geometry={lSlG} material={suitMat} castShadow /></group>
          <group ref={rsRef}><mesh geometry={rSlG} material={suitMat} castShadow /></group>
        </>
      )}

      {/* Shirt (no jacket) */}
      {!garments.jacket && garments.shirt && (
        <>
          <mesh geometry={jacketG} material={shirtMat} castShadow />
          <group ref={lsaRef}><mesh geometry={lSlG} material={shirtMat} castShadow /></group>
          <group ref={rsaRef}><mesh geometry={rSlG} material={shirtMat} castShadow /></group>
        </>
      )}

      {/* Vest */}
      {garments.vest && (
        <mesh position={[0, 1.10, 0]} material={vestMat} castShadow>
          <cylinderGeometry args={[0.16 * ws * g.wn, 0.18 * cs * g.sw, 0.30, 28]} />
        </mesh>
      )}

      {/* Buttons */}
      {garments.jacket && styleConfig.buttonCount > 0 &&
        Array.from({ length: Math.min(styleConfig.buttonCount, 3) }).map((_, i) => {
          const dbl = styleConfig.id === "doublebreasted", yB = 1.18 - i * 0.08;
          return (
            <group key={i}>
              <mesh position={[dbl ? -0.025 : 0, yB, 0.13]} material={buttonMat} castShadow>
                <cylinderGeometry args={[0.008, 0.008, 0.004, 14]} />
              </mesh>
              {dbl && <mesh position={[0.025, yB, 0.13]} material={buttonMat} castShadow><cylinderGeometry args={[0.008, 0.008, 0.004, 14]} /></mesh>}
            </group>
          );
        })
      }

      {/* Belt */}
      {garments.belt && (
        <>
          <mesh position={[0, 0.86, 0]} material={beltMat}>
            <cylinderGeometry args={[0.148 * ws * g.wn, 0.145 * ws * g.wn, 0.018, 32]} />
          </mesh>
          <mesh position={[0, 0.86, 0.148 * ws * g.wn]}>
            <boxGeometry args={[0.022, 0.016, 0.004]} />
            <meshPhysicalMaterial color="#b8a88a" roughness={0.18} metalness={0.75} />
          </mesh>
        </>
      )}

      {/* Trousers */}
      {garments.trousers && (
        <>
          <mesh geometry={lTrG} material={trouserMat} castShadow />
          <mesh geometry={rTrG} material={trouserMat} castShadow />
        </>
      )}

      {/* Shoes */}
      {garments.shoes && (
        <>
          <mesh geometry={lShG} material={shoeMat} castShadow />
          <mesh geometry={rShG} material={shoeMat} castShadow />
        </>
      )}
    </group>
  );
}
