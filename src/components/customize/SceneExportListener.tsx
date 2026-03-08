import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { downloadBlob } from "./SceneExporter";

/**
 * Place inside <Canvas> — listens for "export-model" custom events
 * and exports the entire Three.js scene.
 */
export default function SceneExportListener() {
  const { scene } = useThree();

  useEffect(() => {
    const handler = async (e: Event) => {
      const format = (e as CustomEvent).detail?.format || "glb";
      try {
        if (format === "glb") {
          const { GLTFExporter } = await import("three/examples/jsm/exporters/GLTFExporter.js");
          const exporter = new GLTFExporter();
          exporter.parse(
            scene,
            (result) => {
              const blob = result instanceof ArrayBuffer
                ? new Blob([result], { type: "model/gltf-binary" })
                : new Blob([JSON.stringify(result)], { type: "application/json" });
              downloadBlob(blob, "custom-model.glb");
            },
            (err) => console.error("GLB export error:", err),
            { binary: true }
          );
        } else {
          const { OBJExporter } = await import("three/examples/jsm/exporters/OBJExporter.js");
          const exporter = new OBJExporter();
          const result = exporter.parse(scene);
          downloadBlob(new Blob([result], { type: "text/plain" }), "custom-model.obj");
        }
      } catch (err) {
        console.error("Export failed:", err);
      }
    };

    window.addEventListener("export-model", handler);
    return () => window.removeEventListener("export-model", handler);
  }, [scene]);

  return null;
}
