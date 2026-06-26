import { useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useSceneAssets } from "@/stores/sceneAssetsStore";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

/**
 * Ready Player Me: free embeddable avatar creator.
 * Returns a hosted GLB URL via postMessage — no API key needed.
 * Docs: https://docs.readyplayer.me/ready-player-me/integration-guides/web/integration-with-iframe
 */
export default function ReadyPlayerMeModal({ open, onOpenChange }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { addCustomModel } = useSceneAssets();
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;

    const handler = (e: MessageEvent) => {
      // RPM sends string events like "v1.avatar.exported"
      const data = typeof e.data === "string" ? e.data : (e.data?.eventName ?? "");
      if (typeof data === "string" && data.includes("readyplayerme")) {
        try {
          const json = JSON.parse(data);
          if (json.eventName === "v1.avatar.exported" && json.data?.url) {
            addCustomModel("My RPM Avatar", json.data.url);
            toast({ title: "Avatar loaded", description: "Added to scene" });
            onOpenChange(false);
          }
        } catch {
          /* ignore non-JSON */
        }
      } else if (e.data?.eventName === "v1.avatar.exported" && e.data?.data?.url) {
        addCustomModel("My RPM Avatar", e.data.data.url);
        toast({ title: "Avatar loaded", description: "Added to scene" });
        onOpenChange(false);
      }
    };

    window.addEventListener("message", handler);

    // Tell iframe to subscribe once loaded
    const sub = () => {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ target: "readyplayerme", type: "subscribe", eventName: "v1.**" }),
        "*"
      );
    };
    const id = setTimeout(sub, 1500);

    return () => {
      window.removeEventListener("message", handler);
      clearTimeout(id);
    };
  }, [open, addCustomModel, onOpenChange, toast]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-2 border-b border-border">
          <DialogTitle className="text-base font-display">Create Your 3D Avatar</DialogTitle>
          <DialogDescription className="text-xs">
            Powered by Ready Player Me — free, no signup needed. Your finished avatar loads automatically into the scene.
          </DialogDescription>
        </DialogHeader>
        {open && (
          <iframe
            ref={iframeRef}
            src="https://demo.readyplayer.me/avatar?frameApi&clearCache"
            className="w-full flex-1 border-0"
            style={{ height: "calc(80vh - 80px)" }}
            allow="camera *; microphone *; clipboard-write"
            title="Ready Player Me Avatar Creator"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
