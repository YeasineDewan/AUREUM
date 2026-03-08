import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { StyleOption, GarmentVisibility, BodyMeasurements } from "@/types/customize";
import { measurementsToMorphTargets } from "@/types/customize";

function useFabricTexture(fabricId: string) {
  return useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, size, size);

    if (fabricId === "wool") {
      for (let y = 0; y < size; y += 3) {
        for (let x = 0; x < size; x += 3) {
          const v = 120 + Math.random() * 16;
          ctx.fillStyle = `rgb(${v},${v},${v})`;
          ctx.fillRect(x, y, 2, 2);
        }
        if (y % 6 === 0) {
          ctx.strokeStyle = `rgba(100,100,100,0.3)`;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(size, y + size * 0.5);
          ctx.stroke();
        }
      }
    } else if (fabricId === "linen") {
      for (let y = 0; y < size; y += 4) {
        const v = 118 + Math.random() * 20;
        ctx.strokeStyle = `rgb(${v},${v},${v})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(size, y + (Math.random() - 0.5) * 2);
        ctx.stroke();
      }
      for (let x = 0; x < size; x += 5) {
        const v = 118 + Math.random() * 20;
        ctx.strokeStyle = `rgb(${v},${v},${v})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + (Math.random() - 0.5) * 2, size);
        ctx.stroke();
      }
    } else if (fabricId === "cotton") {
      for (let y = 0; y < size; y += 2) {
        for (let x = 0; x < size; x += 2) {
          const v = 125 + Math.random() * 8;
          ctx.fillStyle = `rgb(${v},${v},${v})`;
          ctx.fillRect(x, y, 2, 2);
        }
      }
    } else {
      for (let y = 0; y < size; y += 1) {
        for (let x = 0; x < size; x += 1) {
          const v = 126 + Math.random() * 4;
          ctx.fillStyle = `rgb(${v},${v},${v})`;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 8);
    return tex;
  }, [fabricId]);
}

interface MannequinProps {
  color: string;
  fabricId: string;
  fabricProps: { roughness: number; metalness: number; bumpScale: number };
  styleConfig: StyleOption;
  garments: GarmentVisibility;
  bodyMeasurements: BodyMeasurements | null;
}

export default function Mannequin({
  color,
  fabricId,
  fabricProps,
  styleConfig,
  garments,
  bodyMeasurements,
}: MannequinProps) {
  const group = useRef<THREE.Group>(null);
  const bumpMap = useFabricTexture(fabricId);

  // Morph targets from measurements
  const morph = useMemo(() => {
    if (!bodyMeasurements) return { heightScale: 1, chestScale: 1, waistScale: 1, hipScale: 1, shoulderScale: 1, legScale: 1, armScale: 1 };
    return measurementsToMorphTargets(bodyMeasurements);
  }, [bodyMeasurements]);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.12;
    }
  });

  const suitMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(color),
        roughness: fabricProps.roughness,
        metalness: fabricProps.metalness,
        bumpMap,
        bumpScale: fabricProps.bumpScale,
        clearcoat: fabricId === "wool" ? 0.05 : 0,
        clearcoatRoughness: 0.9,
        sheen: fabricId === "cashmere" ? 0.4 : fabricId === "wool" ? 0.15 : 0,
        sheenColor: new THREE.Color(color).offsetHSL(0, -0.1, 0.15),
        sheenRoughness: 0.6,
      }),
    [color, fabricProps, bumpMap, fabricId]
  );

  const trouserMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(color).offsetHSL(0, 0, -0.03),
        roughness: fabricProps.roughness + 0.02,
        metalness: fabricProps.metalness,
        bumpMap,
        bumpScale: fabricProps.bumpScale * 0.8,
      }),
    [color, fabricProps, bumpMap]
  );

  const skinMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#c9956b", roughness: 0.65, metalness: 0, clearcoat: 0.08, clearcoatRoughness: 0.7 }), []);
  const shirtMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#f0ebe3", roughness: 0.8, metalness: 0 }), []);
  const shoeMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#1a1410", roughness: 0.25, metalness: 0.08, clearcoat: 0.3, clearcoatRoughness: 0.4 }), []);
  const buttonMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#6b5d4f", roughness: 0.4, metalness: 0.15, clearcoat: 0.2 }), []);
  const vestMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: new THREE.Color(color).offsetHSL(0, 0.05, 0.05), roughness: fabricProps.roughness - 0.05, metalness: fabricProps.metalness + 0.02, bumpMap, bumpScale: fabricProps.bumpScale * 0.6 }), [color, fabricProps, bumpMap]);
  const tieMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#5c1a2a", roughness: 0.4, metalness: 0.05 }), []);

  const sw = styleConfig.shoulderMult * morph.shoulderScale;
  const lw = styleConfig.lapelMult;
  const cs = morph.chestScale;
  const ws = morph.waistScale;
  const hs = morph.hipScale;
  const heightS = morph.heightScale;
  const legS = morph.legScale;
  const armS = morph.armScale;

  const torsoPoints = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    pts.push(new THREE.Vector2(0.22 * ws, 0));
    pts.push(new THREE.Vector2(0.24 * ws, 0.15));
    pts.push(new THREE.Vector2(0.23 * cs, 0.35));
    pts.push(new THREE.Vector2(0.22 * cs, 0.5));
    pts.push(new THREE.Vector2(0.25 * sw, 0.58));
    pts.push(new THREE.Vector2(0.28 * sw, 0.62));
    pts.push(new THREE.Vector2(0.27 * sw, 0.65));
    pts.push(new THREE.Vector2(0.14, 0.68));
    return pts;
  }, [sw, cs, ws]);

  const legPoints = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    pts.push(new THREE.Vector2(0.08, 0));
    pts.push(new THREE.Vector2(0.1, 0.15));
    pts.push(new THREE.Vector2(0.115, 0.35));
    pts.push(new THREE.Vector2(0.12, 0.5));
    pts.push(new THREE.Vector2(0.115, 0.55));
    return pts;
  }, []);

  const armPoints = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    pts.push(new THREE.Vector2(0.06, 0));
    pts.push(new THREE.Vector2(0.075, 0.1));
    pts.push(new THREE.Vector2(0.08, 0.25));
    pts.push(new THREE.Vector2(0.075, 0.4));
    pts.push(new THREE.Vector2(0.065, 0.55));
    pts.push(new THREE.Vector2(0.06, 0.6 * armS));
    return pts;
  }, [armS]);

  const yBase = -1.6 * heightS;

  return (
    <group ref={group} position={[0, yBase, 0]} scale={[1, heightS, 1]}>
      {/* HEAD */}
      <mesh position={[0, 3.35, 0]} material={skinMat} castShadow>
        <sphereGeometry args={[0.22, 48, 48]} />
      </mesh>
      <mesh position={[0, 3.18, 0.04]} material={skinMat}>
        <sphereGeometry args={[0.17, 32, 32]} />
      </mesh>
      <mesh position={[0, 3.48, -0.02]}>
        <sphereGeometry args={[0.21, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshPhysicalMaterial color="#1a1410" roughness={0.9} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.22, 3.32, 0]} material={skinMat}>
          <sphereGeometry args={[0.05, 16, 16]} />
        </mesh>
      ))}

      {/* NECK */}
      <mesh position={[0, 3.0, 0]} material={skinMat}>
        <cylinderGeometry args={[0.08, 0.1, 0.2, 24]} />
      </mesh>

      {/* SHIRT COLLAR */}
      {garments.shirt && (
        <mesh position={[0, 2.92, 0]} material={shirtMat}>
          <cylinderGeometry args={[0.12, 0.15, 0.08, 24]} />
        </mesh>
      )}

      {/* TIE */}
      {garments.tie && (
        <group>
          {/* Tie knot */}
          <mesh position={[0, 2.85, 0.14]} material={tieMat}>
            <boxGeometry args={[0.04, 0.04, 0.03]} />
          </mesh>
          {/* Tie body */}
          <mesh position={[0, 2.5, 0.22]} material={tieMat}>
            <boxGeometry args={[0.05, 0.65, 0.01]} />
          </mesh>
          {/* Tie point */}
          <mesh position={[0, 2.15, 0.22]} rotation={[0, 0, Math.PI / 4]} material={tieMat}>
            <boxGeometry args={[0.035, 0.035, 0.01]} />
          </mesh>
        </group>
      )}

      {/* TORSO */}
      {garments.jacket ? (
        <mesh position={[0, 2.2, 0]} material={suitMat} castShadow>
          <latheGeometry args={[torsoPoints, 48]} />
        </mesh>
      ) : garments.shirt ? (
        <mesh position={[0, 2.2, 0]} material={shirtMat} castShadow>
          <latheGeometry args={[torsoPoints, 48]} />
        </mesh>
      ) : (
        <mesh position={[0, 2.2, 0]} material={skinMat} castShadow>
          <latheGeometry args={[torsoPoints, 48]} />
        </mesh>
      )}

      {/* VEST */}
      {garments.vest && (
        <mesh position={[0, 2.35, 0.01]} material={vestMat} castShadow>
          <boxGeometry args={[0.42 * cs, 0.5, 0.22 * cs]} />
        </mesh>
      )}

      {/* LAPELS */}
      {garments.jacket &&
        [-1, 1].map((side) => (
          <group key={`lapel-${side}`}>
            <mesh
              position={[side * 0.08 * lw, 2.65, 0.23]}
              rotation={[0.1, side * 0.2, side * 0.15]}
              material={suitMat}
              castShadow
            >
              <boxGeometry args={[0.1 * lw, 0.45, 0.015]} />
            </mesh>
            <mesh
              position={[side * 0.12 * lw, 2.65, 0.235]}
              rotation={[0.1, side * 0.2, side * 0.15]}
            >
              <boxGeometry args={[0.01, 0.42, 0.018]} />
              <meshPhysicalMaterial color={color} roughness={0.6} metalness={0.05} />
            </mesh>
          </group>
        ))}

      {/* POCKET WELT */}
      {garments.jacket && (
        <mesh position={[-0.12, 2.52, 0.24]} rotation={[0, 0, 0.02]} material={suitMat}>
          <boxGeometry args={[0.12, 0.008, 0.018]} />
        </mesh>
      )}

      {/* FRONT PLACKET */}
      {garments.jacket && (
        <mesh position={[0, 2.35, 0.24]}>
          <boxGeometry args={[0.025, 0.65, 0.012]} />
          <meshPhysicalMaterial color={color} roughness={fabricProps.roughness - 0.05} />
        </mesh>
      )}

      {/* BUTTONS */}
      {garments.jacket &&
        styleConfig.buttonCount > 0 &&
        Array.from({ length: Math.min(styleConfig.buttonCount, 3) }).map((_, i) => {
          const isDouble = styleConfig.id === "doublebreasted";
          const yBtn = 2.45 - i * 0.18;
          return (
            <group key={`btn-${i}`}>
              <mesh position={[isDouble ? -0.04 : 0, yBtn, 0.255]} material={buttonMat} castShadow>
                <cylinderGeometry args={[0.018, 0.018, 0.008, 24]} />
              </mesh>
              {isDouble && (
                <mesh position={[0.04, yBtn, 0.255]} material={buttonMat} castShadow>
                  <cylinderGeometry args={[0.018, 0.018, 0.008, 24]} />
                </mesh>
              )}
            </group>
          );
        })}

      {/* ARMS */}
      {[-1, 1].map((side) => (
        <group key={`arm-${side}`}>
          <mesh
            position={[side * 0.32 * sw, 2.42, 0]}
            rotation={[0, 0, side * 0.08]}
            material={garments.jacket ? suitMat : garments.shirt ? shirtMat : skinMat}
            castShadow
          >
            <latheGeometry args={[armPoints, 24]} />
          </mesh>
          {garments.jacket && (
            <>
              <mesh position={[side * 0.36 * sw, 1.82, 0]} material={suitMat}>
                <cylinderGeometry args={[0.065, 0.06, 0.05, 24]} />
              </mesh>
              {[0, 1].map((bi) => (
                <mesh key={bi} position={[side * (0.36 * sw - side * 0.06), 1.82 + bi * 0.03, 0.04]} material={buttonMat}>
                  <cylinderGeometry args={[0.01, 0.01, 0.005, 12]} />
                </mesh>
              ))}
            </>
          )}
          <mesh position={[side * 0.37 * sw, 1.72, 0]} material={skinMat}>
            <sphereGeometry args={[0.055, 24, 24]} />
          </mesh>
          <mesh position={[side * 0.37 * sw, 1.66, 0.01]} material={skinMat}>
            <boxGeometry args={[0.07, 0.06, 0.03]} />
          </mesh>
        </group>
      ))}

      {/* BELT */}
      {garments.belt && (
        <>
          <mesh position={[0, 1.88, 0]}>
            <cylinderGeometry args={[0.24 * ws, 0.23 * ws, 0.04, 32]} />
            <meshPhysicalMaterial color="#1a1410" roughness={0.35} metalness={0.1} clearcoat={0.2} />
          </mesh>
          <mesh position={[0, 1.88, 0.24 * ws]}>
            <boxGeometry args={[0.04, 0.035, 0.008]} />
            <meshPhysicalMaterial color="#b8a88a" roughness={0.2} metalness={0.7} />
          </mesh>
        </>
      )}

      {/* HIPS / TROUSER TOP */}
      {garments.trousers ? (
        <mesh position={[0, 1.7, 0]} material={trouserMat} castShadow>
          <cylinderGeometry args={[0.22 * hs, 0.2 * hs, 0.3, 32]} />
        </mesh>
      ) : (
        <mesh position={[0, 1.7, 0]} material={skinMat} castShadow>
          <cylinderGeometry args={[0.22 * hs, 0.2 * hs, 0.3, 32]} />
        </mesh>
      )}

      {/* LEGS */}
      {[-1, 1].map((side) => (
        <group key={`leg-${side}`}>
          <mesh position={[side * 0.1, 1.25 * legS, 0]} material={garments.trousers ? trouserMat : skinMat} castShadow>
            <latheGeometry args={[legPoints, 24]} />
          </mesh>
          {garments.trousers && (
            <>
              <mesh position={[side * 0.1, 1.1, 0.1]}>
                <boxGeometry args={[0.003, 0.8 * legS, 0.003]} />
                <meshPhysicalMaterial color={color} roughness={0.5} metalness={0.02} />
              </mesh>
              <mesh position={[side * 0.1, 0.72, 0]} material={trouserMat}>
                <cylinderGeometry args={[0.09, 0.088, 0.04, 24]} />
              </mesh>
            </>
          )}

          {/* SHOES */}
          {garments.shoes && (
            <group position={[side * 0.1, 0.62, 0.04]}>
              <mesh material={shoeMat} castShadow>
                <boxGeometry args={[0.11, 0.08, 0.22]} />
              </mesh>
              <mesh position={[0, -0.01, 0.1]} material={shoeMat}>
                <sphereGeometry args={[0.06, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
              </mesh>
              <mesh position={[0, -0.04, 0]}>
                <boxGeometry args={[0.12, 0.02, 0.24]} />
                <meshPhysicalMaterial color="#0d0d0d" roughness={0.9} />
              </mesh>
              <mesh position={[0, -0.04, -0.09]}>
                <boxGeometry args={[0.1, 0.03, 0.05]} />
                <meshPhysicalMaterial color="#0d0d0d" roughness={0.85} />
              </mesh>
            </group>
          )}
        </group>
      ))}

      {/* JACKET BACK VENT */}
      {garments.jacket && (
        <mesh position={[0, 2.05, -0.23]}>
          <boxGeometry args={[0.003, 0.35, 0.01]} />
          <meshPhysicalMaterial color={color} roughness={0.6} />
        </mesh>
      )}
    </group>
  );
}
