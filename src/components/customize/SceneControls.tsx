import { Move, RotateCw, Maximize2, Trash2, Eye, EyeOff, Layers } from "lucide-react";
import { useSceneAssets } from "@/stores/sceneAssetsStore";

export default function SceneControls() {
  const {
    loadedModels, selectedUid, transformMode,
    selectModel, setTransformMode, removeModel, updateModel, clear,
  } = useSceneAssets();

  if (loadedModels.length === 0) return null;

  const modes: { id: "translate" | "rotate" | "scale"; icon: typeof Move; label: string }[] = [
    { id: "translate", icon: Move, label: "Move" },
    { id: "rotate", icon: RotateCw, label: "Rotate" },
    { id: "scale", icon: Maximize2, label: "Scale" },
  ];

  return (
    <div className="absolute top-3 left-3 bg-background/85 backdrop-blur-sm border border-border rounded-md p-2 max-w-[220px] space-y-2">
      {/* Transform mode toggle */}
      <div className="flex gap-1">
        {modes.map((m) => {
          const Icon = m.icon;
          const active = transformMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setTransformMode(m.id)}
              title={m.label}
              className={`p-1.5 rounded border text-[10px] flex items-center gap-1 transition-colors ${
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground hover:text-foreground border-border"
              }`}
            >
              <Icon className="h-3 w-3" />
            </button>
          );
        })}
        <button
          onClick={clear}
          title="Clear all"
          className="ml-auto p-1.5 rounded border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {/* Loaded models list */}
      <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-thin">
        <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-muted-foreground font-body">
          <Layers className="h-2.5 w-2.5" /> Scene ({loadedModels.length})
        </div>
        {loadedModels.map((m) => {
          const active = selectedUid === m.uid;
          return (
            <div
              key={m.uid}
              className={`flex items-center gap-1 rounded px-1.5 py-1 text-[10px] font-body cursor-pointer ${
                active ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:bg-secondary"
              }`}
              onClick={() => selectModel(m.uid)}
            >
              <span className="flex-1 truncate">{m.model.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); updateModel(m.uid, { visible: !m.visible }); }}
                className="hover:text-primary"
                title={m.visible ? "Hide" : "Show"}
              >
                {m.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); removeModel(m.uid); }}
                className="hover:text-destructive"
                title="Remove"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
