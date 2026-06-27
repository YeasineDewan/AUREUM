import { Environment } from "@react-three/drei";
import { useSceneEnvironment } from "@/stores/sceneEnvironmentStore";
import { LIGHTING_PRESETS } from "@/types/customize-environments";

/**
 * Wraps the dynamic Environment + lighting from the store.
 * Place inside <Canvas>.
 */
export default function SceneEnvironment() {
  const { hdriUrl, dreiPreset, lightingId } = useSceneEnvironment();
  const lp = LIGHTING_PRESETS.find((l) => l.id === lightingId) ?? LIGHTING_PRESETS[0];

  return (
    <>
      <ambientLight intensity={lp.ambient} />
      <directionalLight
        position={lp.keyPosition}
        intensity={lp.keyIntensity}
        castShadow={lp.shadows}
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-3, 4, -2]} intensity={lp.fillIntensity} />
      <spotLight position={[0, 5, 3]} angle={0.3} penumbra={0.8} intensity={lp.rimIntensity} />
      {hdriUrl ? (
        <Environment files={hdriUrl} background={false} />
      ) : (
        <Environment preset={dreiPreset} background={false} />
      )}
    </>
  );
}
