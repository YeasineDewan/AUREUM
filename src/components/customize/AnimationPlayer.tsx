import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, Square } from "lucide-react";
import { ANIMATION_LIBRARY } from "@/types/customize-extended";
import { useSceneAssets } from "@/stores/sceneAssetsStore";
import { useAnimationStore } from "@/stores/animationStore";

/**
 * Plays GLB animation clips on the currently selected rigged model.
 * The selected model is replaced in-scene with an animated GLB swap
 * (since most rigged Mixamo/three.js demo GLBs ship with embedded clips).
 */
export default function AnimationPlayer() {
  const { selectedUid, loadedModels } = useSceneAssets();
  const { activeClipId, playing, setClip, togglePlay, stop } = useAnimationStore();

  const selected = loadedModels.find((m) => m.uid === selectedUid);

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Play className="h-4 w-4 text-primary" /> Animation Clips
        </CardTitle>
        <p className="text-[10px] text-muted-foreground font-body">
          {selected ? `Target: ${selected.model.name}` : "Select a rigged model first"}
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
          {ANIMATION_LIBRARY.map((clip) => (
            <button
              key={clip.id}
              disabled={!selected}
              onClick={() => setClip(clip.id, selectedUid)}
              className={`w-full text-left p-2 rounded border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                activeClipId === clip.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-muted-foreground"
              }`}
            >
              <p className="font-body text-[11px] font-medium">{clip.name}</p>
              <p className="font-body text-[9px] text-muted-foreground">{clip.description}</p>
            </button>
          ))}
        </div>

        {activeClipId && (
          <div className="flex gap-1.5 pt-2 border-t border-border">
            <button
              onClick={togglePlay}
              className="flex-1 py-1.5 rounded bg-primary text-primary-foreground text-[10px] font-body flex items-center justify-center gap-1 hover:bg-primary/90"
            >
              {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              {playing ? "Pause" : "Play"}
            </button>
            <button
              onClick={stop}
              className="px-3 py-1.5 rounded border border-border text-[10px] font-body flex items-center gap-1 hover:bg-secondary"
            >
              <Square className="h-3 w-3" /> Stop
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
