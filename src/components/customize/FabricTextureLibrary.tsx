import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, Check } from "lucide-react";
import { FABRIC_TEXTURES } from "@/types/customize-extended";
import { useSceneAssets } from "@/stores/sceneAssetsStore";

export default function FabricTextureLibrary() {
  const { activeTexture, setTexture } = useSceneAssets();

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" /> PBR Fabric Library
        </CardTitle>
        <p className="text-[10px] text-muted-foreground font-body">
          {FABRIC_TEXTURES.length} CC0 textures from ambientCG
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-1.5">
          {FABRIC_TEXTURES.map((t) => {
            const active = activeTexture?.id === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTexture(active ? null : t)}
                title={t.name}
                className={`relative aspect-square rounded overflow-hidden border-2 transition-all ${
                  active ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-muted-foreground"
                }`}
              >
                <img
                  src={t.thumb}
                  alt={t.name}
                  loading="lazy"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.background = "#333";
                  }}
                />
                {active && (
                  <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {activeTexture && (
          <div className="mt-2 p-2 rounded bg-secondary/50 border border-border">
            <p className="text-[10px] font-body font-medium">{activeTexture.name}</p>
            <p className="text-[9px] font-body text-muted-foreground capitalize">
              {activeTexture.category} • {activeTexture.license} • {activeTexture.source}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
