import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ExternalLink, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSceneAssets } from "@/stores/sceneAssetsStore";

interface SketchfabModel {
  uid: string;
  name: string;
  thumbnails: { images: { url: string; width: number }[] };
  viewerUrl: string;
  isDownloadable: boolean;
  user: { displayName: string };
  license?: { label: string };
}

/**
 * Sketchfab free-search.
 * Public search endpoint (no key needed for browsing).
 * Direct GLB download requires OAuth, so we link out and let users
 * paste the downloaded GLB URL via the ModelLibrary's custom-URL input.
 */
export default function SketchfabSearch() {
  const [q, setQ] = useState("suit mannequin");
  const [results, setResults] = useState<SketchfabModel[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { addCustomModel } = useSceneAssets();

  const search = async () => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const url = `https://api.sketchfab.com/v3/search?type=models&downloadable=true&q=${encodeURIComponent(q)}&count=12`;
      const r = await fetch(url);
      const data = await r.json();
      setResults(data.results || []);
    } catch (err) {
      toast({ title: "Search failed", description: String(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Search className="h-4 w-4 text-primary" /> Sketchfab (Free Downloadable)
        </CardTitle>
        <p className="text-[10px] text-muted-foreground font-body">
          Search 100k+ free CC-licensed models
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex gap-1">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="e.g. suit, mannequin, shoes"
            className="h-8 text-[10px]"
          />
          <Button size="sm" className="h-8 px-2" onClick={search} disabled={loading}>
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="grid grid-cols-2 gap-1.5 max-h-64 overflow-y-auto pr-1">
            {results.map((m) => {
              const thumb = m.thumbnails?.images?.find((i) => i.width < 400)?.url ?? m.thumbnails?.images?.[0]?.url;
              return (
                <div key={m.uid} className="rounded border border-border overflow-hidden">
                  {thumb && (
                    <img src={thumb} alt={m.name} loading="lazy" className="w-full h-16 object-cover" />
                  )}
                  <div className="p-1.5 space-y-1">
                    <p className="font-body text-[10px] font-medium truncate" title={m.name}>{m.name}</p>
                    <p className="font-body text-[8px] text-muted-foreground truncate">
                      {m.user.displayName} • {m.license?.label ?? "CC"}
                    </p>
                    <div className="flex gap-1">
                      <a
                        href={m.viewerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 text-[9px] py-1 rounded bg-secondary text-center hover:bg-secondary/80 flex items-center justify-center gap-0.5"
                      >
                        <ExternalLink className="h-2.5 w-2.5" /> Open
                      </a>
                      <button
                        title="Paste downloaded GLB URL into Model Library after exporting from Sketchfab"
                        onClick={() => {
                          window.open(`${m.viewerUrl}`, "_blank");
                          toast({
                            title: "Download from Sketchfab",
                            description: "Sign in there, download GLB, then paste the URL into the Model Library.",
                          });
                        }}
                        className="flex-1 text-[9px] py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-0.5"
                      >
                        <Plus className="h-2.5 w-2.5" /> Get
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <a
          href="https://sketchfab.com/features/free-3d-models"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-[9px] text-primary hover:underline"
        >
          <ExternalLink className="h-2.5 w-2.5" /> Browse Sketchfab free models
        </a>
      </CardContent>
    </Card>
  );
}
