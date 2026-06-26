import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Box, Plus, Trash2, Eye, EyeOff, Move3d, RotateCw, Maximize2, ExternalLink, User, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MODEL_CATALOG, type ModelCategory } from "@/types/customize-extended";
import { useSceneAssets } from "@/stores/sceneAssetsStore";
import ReadyPlayerMeModal from "./ReadyPlayerMeModal";

const CATEGORY_TABS: { id: ModelCategory; label: string; icon: string }[] = [
  { id: "avatar", label: "Avatars", icon: "🧍" },
  { id: "accessory", label: "Access.", icon: "👓" },
  { id: "footwear", label: "Shoes", icon: "👞" },
  { id: "decor", label: "Decor", icon: "🪑" },
  { id: "scene", label: "Props", icon: "✨" },
];

export default function ModelLibrary() {
  const { toast } = useToast();
  const {
    loadedModels, selectedUid, transformMode,
    addModel, addCustomModel, removeModel, selectModel, updateModel, setTransformMode,
  } = useSceneAssets();
  const [activeTab, setActiveTab] = useState<ModelCategory>("avatar");
  const [customUrl, setCustomUrl] = useState("");
  const [rpmOpen, setRpmOpen] = useState(false);

  const filtered = MODEL_CATALOG.filter((m) => m.category === activeTab);

  const handleCustomUrl = () => {
    if (!customUrl.match(/\.(glb|gltf)(\?|$)/i)) {
      toast({
        title: "Invalid URL",
        description: "Must end with .glb or .gltf",
        variant: "destructive",
      });
      return;
    }
    addCustomModel(`Custom #${loadedModels.length + 1}`, customUrl);
    setCustomUrl("");
    toast({ title: "Model queued", description: "Loading into scene…" });
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Box className="h-4 w-4 text-primary" /> 3D Model Library
        </CardTitle>
        <p className="text-[10px] text-muted-foreground font-body">
          Free CDN catalog • CC0 / CC-BY licensed
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Category tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ModelCategory)}>
          <TabsList className="grid grid-cols-5 h-auto p-1">
            {CATEGORY_TABS.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="text-[9px] px-1 py-1.5 flex-col gap-0.5">
                <span className="text-sm">{tab.icon}</span>
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {CATEGORY_TABS.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-2">
              <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {filtered.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      addModel(m);
                      toast({ title: `${m.name} added`, description: m.source });
                    }}
                    className="text-left p-2 rounded border border-border hover:border-primary hover:bg-primary/5 transition-all group"
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <Plus className="h-3 w-3 text-primary group-hover:scale-110 transition" />
                      <p className="font-body text-[10px] font-medium truncate">{m.name}</p>
                    </div>
                    <p className="font-body text-[8px] text-muted-foreground truncate">
                      {m.source}
                    </p>
                  </button>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Ready Player Me + custom URL */}
        <div className="space-y-2 pt-2 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-[10px] h-8"
            onClick={() => setRpmOpen(true)}
          >
            <User className="h-3 w-3 mr-1.5" /> Create Custom Avatar (RPM)
          </Button>

          <div className="flex gap-1">
            <Input
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="Paste .glb / .gltf URL"
              className="h-8 text-[10px]"
            />
            <Button size="sm" className="h-8 px-2" onClick={handleCustomUrl}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <a
            href="https://poly.pizza/explore"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-[9px] text-primary hover:underline"
          >
            <ExternalLink className="h-2.5 w-2.5" /> Browse Poly Pizza for more free models
          </a>
        </div>

        {/* Loaded models list */}
        {loadedModels.length > 0 && (
          <div className="pt-3 border-t border-border space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-body text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                In Scene ({loadedModels.length})
              </p>

              {selectedUid && (
                <div className="flex gap-0.5 border border-border rounded overflow-hidden">
                  {[
                    { m: "translate" as const, I: Move3d, t: "Move" },
                    { m: "rotate" as const, I: RotateCw, t: "Rotate" },
                    { m: "scale" as const, I: Maximize2, t: "Scale" },
                  ].map(({ m, I, t }) => (
                    <button
                      key={m}
                      title={t}
                      onClick={() => setTransformMode(m)}
                      className={`p-1 transition ${
                        transformMode === m
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <I className="h-3 w-3" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
              {loadedModels.map((entry) => (
                <div
                  key={entry.uid}
                  onClick={() => selectModel(entry.uid)}
                  className={`flex items-center gap-1.5 p-1.5 rounded border cursor-pointer transition ${
                    selectedUid === entry.uid
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateModel(entry.uid, { visible: !entry.visible });
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {entry.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  </button>
                  <span className="flex-1 text-[10px] font-body truncate">{entry.model.name}</span>
                  <span className="text-[8px] text-muted-foreground">×{entry.scale.toFixed(2)}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeModel(entry.uid);
                    }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            {selectedUid && (
              <p className="text-[9px] text-muted-foreground font-body italic">
                <Sparkles className="h-2.5 w-2.5 inline mr-1" />
                Drag the gizmo in the 3D view to position the selected model.
              </p>
            )}
          </div>
        )}

        <ReadyPlayerMeModal open={rpmOpen} onOpenChange={setRpmOpen} />
      </CardContent>
    </Card>
  );
}
