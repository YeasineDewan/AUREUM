import { useSceneExporter, downloadBlob } from "./SceneExporter";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ExportButton() {
  const { exportAsGLB, exportAsOBJ } = useSceneExporter();
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async (format: "glb" | "obj") => {
    setExporting(true);
    try {
      const blob = format === "glb" ? await exportAsGLB() : await exportAsOBJ();
      downloadBlob(blob, `custom-model.${format}`);
      toast({ title: "Model exported", description: `Downloaded as .${format}` });
    } catch (e) {
      toast({ title: "Export failed", description: "Could not export the 3D model", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  return (
    <group>
      {/* This renders in Three.js canvas - we use Html for buttons */}
      <mesh visible={false} />
    </group>
  );
}

// Standalone HTML overlay export buttons (used outside canvas)
export function ExportControls() {
  const [exporting, setExporting] = useState(false);

  return (
    <div className="flex gap-2">
      <Button
        variant="heroOutline"
        size="sm"
        className="text-xs flex-1"
        disabled={exporting}
        onClick={async () => {
          // We dispatch a custom event to communicate with the canvas
          window.dispatchEvent(new CustomEvent("export-model", { detail: { format: "glb" } }));
        }}
      >
        {exporting ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Download className="h-3.5 w-3.5 mr-1.5" />}
        Export .GLB
      </Button>
      <Button
        variant="heroOutline"
        size="sm"
        className="text-xs flex-1"
        disabled={exporting}
        onClick={() => {
          window.dispatchEvent(new CustomEvent("export-model", { detail: { format: "obj" } }));
        }}
      >
        <Download className="h-3.5 w-3.5 mr-1.5" /> Export .OBJ
      </Button>
    </div>
  );
}
