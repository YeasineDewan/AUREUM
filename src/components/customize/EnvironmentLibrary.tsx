import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Sun } from "lucide-react";
import { HDRI_LIBRARY, DREI_PRESETS, LIGHTING_PRESETS } from "@/types/customize-environments";
import { useSceneEnvironment } from "@/stores/sceneEnvironmentStore";

export default function EnvironmentLibrary() {
  const {
    hdriUrl, dreiPreset, lightingId,
    setHdri, setDreiPreset, setLighting,
  } = useSceneEnvironment();

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" /> Environment & Lighting
        </CardTitle>
        <p className="text-[10px] text-muted-foreground font-body">
          HDRI from Poly Haven (CC0) • Drei presets
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Tabs defaultValue="hdri">
          <TabsList className="grid grid-cols-3 h-auto">
            <TabsTrigger value="hdri" className="text-[10px]">HDRI</TabsTrigger>
            <TabsTrigger value="preset" className="text-[10px]">Preset</TabsTrigger>
            <TabsTrigger value="lights" className="text-[10px]">Lights</TabsTrigger>
          </TabsList>

          <TabsContent value="hdri" className="mt-2">
            <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {HDRI_LIBRARY.map((env) => (
                <button
                  key={env.id}
                  onClick={() => setHdri(env.url)}
                  className={`text-left rounded border overflow-hidden transition-all ${
                    hdriUrl === env.url
                      ? "border-primary ring-1 ring-primary/40"
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <img
                    src={env.thumb}
                    alt={env.name}
                    loading="lazy"
                    className="w-full h-12 object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                  <div className="p-1.5">
                    <p className="font-body text-[10px] font-medium truncate">{env.name}</p>
                    <p className="font-body text-[8px] text-muted-foreground capitalize">{env.category}</p>
                  </div>
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="preset" className="mt-2">
            <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {DREI_PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => setDreiPreset(p)}
                  className={`p-2 rounded border text-center transition-all ${
                    dreiPreset === p && !hdriUrl
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <p className="font-body text-[10px] font-medium capitalize">{p}</p>
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="lights" className="mt-2">
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {LIGHTING_PRESETS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLighting(l.id)}
                  className={`w-full text-left p-2 rounded border transition-all flex items-start gap-2 ${
                    lightingId === l.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <Sun className={`h-3.5 w-3.5 mt-0.5 ${lightingId === l.id ? "text-primary" : "text-muted-foreground"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-[11px] font-medium">{l.name}</p>
                    <p className="font-body text-[9px] text-muted-foreground truncate">{l.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
