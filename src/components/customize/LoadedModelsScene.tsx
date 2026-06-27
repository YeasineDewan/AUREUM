import { Suspense, useRef, useEffect } from "react";
import { useGLTF, TransformControls, Html, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { useSceneAssets, type LoadedSceneModel } from "@/stores/sceneAssetsStore";
import { useAnimationStore } from "@/stores/animationStore";

function GLTFModel({ entry }: { entry: LoadedSceneModel }) {
  const groupRef = useRef<THREE.Group>(null);
  const { selectedUid, selectModel, updateModel, transformMode } = useSceneAssets();
  const { activeClipId, targetUid, playing } = useAnimationStore();
  const isSelected = selectedUid === entry.uid;

  let scene: THREE.Group | null = null;
  let animations: THREE.AnimationClip[] = [];
  try {
    const gltf = useGLTF(entry.model.url);
    scene = gltf.scene.clone();
    animations = gltf.animations || [];
  } catch {
    return null;
  }

  const { actions, names } = useAnimations(animations, groupRef);

  // Drive animation when this is the targeted model
  useEffect(() => {
    if (targetUid !== entry.uid || !activeClipId || names.length === 0) {
      Object.values(actions).forEach((a) => a?.stop());
      return;
    }
    // Match by clip id token or fallback to first available
    const match = names.find((n) => n.toLowerCase().includes(activeClipId)) ?? names[0];
    const action = actions[match];
    if (!action) return;
    action.reset().fadeIn(0.3).play();
    action.paused = !playing;
    return () => {
      action.fadeOut(0.2);
    };
  }, [actions, names, activeClipId, targetUid, entry.uid, playing]);

  const handleObjectChange = () => {
    if (!groupRef.current) return;
    const o = groupRef.current;
    updateModel(entry.uid, {
      position: [o.position.x, o.position.y, o.position.z],
      rotation: [o.rotation.x, o.rotation.y, o.rotation.z],
      scale: o.scale.x,
    });
  };

  if (!entry.visible || !scene) return null;

  const content = (
    <group
      ref={groupRef}
      position={entry.position}
      rotation={entry.rotation}
      scale={entry.scale}
      onClick={(e) => {
        e.stopPropagation();
        selectModel(entry.uid);
      }}
    >
      <primitive object={scene} />
    </group>
  );

  if (isSelected) {
    return (
      <TransformControls mode={transformMode} onObjectChange={handleObjectChange} size={0.6}>
        {content}
      </TransformControls>
    );
  }
  return content;
}

function ModelErrorBoundary({ entry }: { entry: LoadedSceneModel }) {
  return (
    <Suspense
      fallback={
        <Html position={entry.position} center>
          <div className="text-[10px] text-primary bg-background/80 px-2 py-1 rounded">
            Loading {entry.model.name}…
          </div>
        </Html>
      }
    >
      <GLTFModel entry={entry} />
    </Suspense>
  );
}

export default function LoadedModelsScene() {
  const loadedModels = useSceneAssets((s) => s.loadedModels);
  return (
    <>
      {loadedModels.map((entry) => (
        <ModelErrorBoundary key={entry.uid} entry={entry} />
      ))}
    </>
  );
}

useGLTF.preload("https://threejs.org/examples/models/gltf/Duck/glTF-Binary/Duck.glb");
