import { useCallback } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

// GLTFExporter implementation for scene export
export function useSceneExporter() {
  const { scene } = useThree();

  const exportAsGLB = useCallback(async () => {
    // Dynamically import GLTFExporter from three examples
    const { GLTFExporter } = await import("three/examples/jsm/exporters/GLTFExporter.js");
    const exporter = new GLTFExporter();

    return new Promise<Blob>((resolve, reject) => {
      exporter.parse(
        scene,
        (result) => {
          if (result instanceof ArrayBuffer) {
            resolve(new Blob([result], { type: "model/gltf-binary" }));
          } else {
            const json = JSON.stringify(result, null, 2);
            resolve(new Blob([json], { type: "application/json" }));
          }
        },
        reject,
        { binary: true }
      );
    });
  }, [scene]);

  const exportAsOBJ = useCallback(async () => {
    const { OBJExporter } = await import("three/examples/jsm/exporters/OBJExporter.js");
    const exporter = new OBJExporter();
    const result = exporter.parse(scene);
    return new Blob([result], { type: "text/plain" });
  }, [scene]);

  return { exportAsGLB, exportAsOBJ };
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
