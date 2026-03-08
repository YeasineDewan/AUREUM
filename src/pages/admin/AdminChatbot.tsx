import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  MessageCircle, Settings, BookOpen, History, Plus, Save, Trash2,
  ThumbsUp, ThumbsDown, Eye, Sparkles, Clock,
} from "lucide-react";

const KNOWLEDGE_CATEGORIES = ["general", "products", "sizing", "services", "care", "policies", "promotions"];

const AdminChatbot = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ── Config ──
  const { data: configMap = {} } = useQuery({
    queryKey: ["admin-chat-config"],
    queryFn: async () => {
      const { data } = await supabase.from("chat_config").select("key, value");
      const map: Record<string, string> = {};
      (data || []).forEach((r: any) => { map[r.key] = r.value; });
      return map;
    },
  });

  const [editConfig, setEditConfig] = useState<Record<string, string>>({});
  const mergedConfig = { ...configMap, ...editConfig };

  const saveConfig = useMutation({
    mutationFn: async () => {
      for (const [key, value] of Object.entries(editConfig)) {
        await supabase.from("chat_config").update({ value }).eq("key", key);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-chat-config"] });
      setEditConfig({});
      toast({ title: "Configuration saved" });
    },
  });

  // ── Knowledge ──
  const { data: knowledge = [] } = useQuery({
    queryKey: ["admin-chat-knowledge"],
    queryFn: async () => {
      const { data } = await supabase.from("chat_knowledge").select("*").order("category").order("created_at");
      return data || [];
    },
  });

  const [newKnowledge, setNewKnowledge] = useState({ title: "", content: "", category: "general" });
  const [editingKnowledge, setEditingKnowledge] = useState<any>(null);

  const addKnowledge = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("chat_knowledge").insert(newKnowledge);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-chat-knowledge"] });
      setNewKnowledge({ title: "", content: "", category: "general" });
      toast({ title: "Knowledge entry added" });
    },
  });

  const updateKnowledge = useMutation({
    mutationFn: async (item: any) => {
      const { error } = await supabase.from("chat_knowledge")
        .update({ title: item.title, content: item.content, category: item.category, enabled: item.enabled })
        .eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-chat-knowledge"] });
      setEditingKnowledge(null);
      toast({ title: "Knowledge updated" });
    },
  });

  const deleteKnowledge = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("chat_knowledge").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-chat-knowledge"] });
      toast({ title: "Knowledge entry deleted" });
    },
  });

  // ── Conversations ──
  const { data: conversations = [] } = useQuery({
    queryKey: ["admin-chat-conversations"],
    queryFn: async () => {
      const { data } = await supabase
        .from("chat_conversations")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(50);
      return data || [];
    },
  });

  const [viewConvo, setViewConvo] = useState<any>(null);

  const totalConvos = conversations.length;
  const ratedConvos = conversations.filter((c: any) => c.rating !== null);
  const avgRating = ratedConvos.length > 0
    ? (ratedConvos.reduce((s: number, c: any) => s + (c.rating || 0), 0) / ratedConvos.length).toFixed(1)
    : "N/A";
  const positiveRate = ratedConvos.length > 0
    ? Math.round((ratedConvos.filter((c: any) => c.rating >= 4).length / ratedConvos.length) * 100)
    : 0;

  return (
    <AdminLayout title="AI Chatbot" description="Configure, train, and monitor the AI assistant">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Conversations", value: totalConvos, icon: MessageCircle },
          { label: "Knowledge Entries", value: knowledge.length, icon: BookOpen },
          { label: "Avg Rating", value: avgRating, icon: ThumbsUp },
          { label: "Satisfaction", value: `${positiveRate}%`, icon: Sparkles },
        ].map((s) => (
          <Card key={s.label} className="border-border bg-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <s.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-display text-lg text-foreground">{s.value}</p>
                <p className="font-body text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="config" className="space-y-4">
        <TabsList className="bg-secondary grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="config" className="text-xs"><Settings className="h-3.5 w-3.5 mr-1.5" /> Configuration</TabsTrigger>
          <TabsTrigger value="knowledge" className="text-xs"><BookOpen className="h-3.5 w-3.5 mr-1.5" /> Knowledge</TabsTrigger>
          <TabsTrigger value="conversations" className="text-xs"><History className="h-3.5 w-3.5 mr-1.5" /> Conversations</TabsTrigger>
        </TabsList>

        {/* CONFIGURATION */}
        <TabsContent value="config" className="space-y-4">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Settings className="h-4 w-4 text-primary" /> Chat Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Enable/Disable */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-secondary/20">
                <div>
                  <p className="font-body text-sm font-medium">Enable Chat Widget</p>
                  <p className="font-body text-[10px] text-muted-foreground">Show the AI chat on the storefront</p>
                </div>
                <Switch
                  checked={mergedConfig.enabled !== "false"}
                  onCheckedChange={(v) => setEditConfig(p => ({ ...p, enabled: v ? "true" : "false" }))}
                />
              </div>

              <div>
                <label className="font-body text-[10px] tracking-widest uppercase text-muted-foreground mb-1.5 block">Chat Name</label>
                <Input
                  value={mergedConfig.chat_name || ""}
                  onChange={(e) => setEditConfig(p => ({ ...p, chat_name: e.target.value }))}
                  className="bg-secondary border-border"
                />
              </div>

              <div>
                <label className="font-body text-[10px] tracking-widest uppercase text-muted-foreground mb-1.5 block">Subtitle</label>
                <Input
                  value={mergedConfig.chat_subtitle || ""}
                  onChange={(e) => setEditConfig(p => ({ ...p, chat_subtitle: e.target.value }))}
                  className="bg-secondary border-border"
                />
              </div>

              <div>
                <label className="font-body text-[10px] tracking-widest uppercase text-muted-foreground mb-1.5 block">Greeting Message</label>
                <Textarea
                  value={mergedConfig.greeting || ""}
                  onChange={(e) => setEditConfig(p => ({ ...p, greeting: e.target.value }))}
                  className="bg-secondary border-border min-h-[60px]"
                />
              </div>

              <div>
                <label className="font-body text-[10px] tracking-widest uppercase text-muted-foreground mb-1.5 block">
                  System Prompt <span className="text-primary">(AI Personality & Instructions)</span>
                </label>
                <Textarea
                  value={mergedConfig.system_prompt || ""}
                  onChange={(e) => setEditConfig(p => ({ ...p, system_prompt: e.target.value }))}
                  className="bg-secondary border-border min-h-[160px] font-mono text-xs"
                  placeholder="Define the AI's personality, tone, rules, and behavior..."
                />
                <p className="font-body text-[10px] text-muted-foreground mt-1">
                  This defines how the AI responds. Include tone, rules, product focus, and any restrictions.
                </p>
              </div>

              <div>
                <label className="font-body text-[10px] tracking-widest uppercase text-muted-foreground mb-1.5 block">
                  Suggested Questions <span className="text-muted-foreground">(pipe-separated)</span>
                </label>
                <Textarea
                  value={mergedConfig.suggested_questions || ""}
                  onChange={(e) => setEditConfig(p => ({ ...p, suggested_questions: e.target.value }))}
                  className="bg-secondary border-border min-h-[60px] text-xs"
                  placeholder="Question 1|Question 2|Question 3"
                />
              </div>

              <Button
                variant="hero"
                className="w-full text-xs"
                onClick={() => saveConfig.mutate()}
                disabled={Object.keys(editConfig).length === 0 || saveConfig.isPending}
              >
                <Save className="h-3.5 w-3.5 mr-2" />
                {saveConfig.isPending ? "Saving..." : "Save Configuration"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* KNOWLEDGE BASE */}
        <TabsContent value="knowledge" className="space-y-4">
          {/* Add new */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" /> Add Knowledge Entry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Title (e.g. Summer Collection)"
                  value={newKnowledge.title}
                  onChange={(e) => setNewKnowledge(p => ({ ...p, title: e.target.value }))}
                  className="bg-secondary border-border"
                />
                <Select value={newKnowledge.category} onValueChange={(v) => setNewKnowledge(p => ({ ...p, category: v }))}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {KNOWLEDGE_CATEGORIES.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                placeholder="Enter the knowledge content the AI should know about..."
                value={newKnowledge.content}
                onChange={(e) => setNewKnowledge(p => ({ ...p, content: e.target.value }))}
                className="bg-secondary border-border min-h-[100px] text-xs"
              />
              <Button
                variant="heroOutline"
                className="text-xs"
                disabled={!newKnowledge.title || !newKnowledge.content || addKnowledge.isPending}
                onClick={() => addKnowledge.mutate()}
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Entry
              </Button>
            </CardContent>
          </Card>

          {/* List */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">Knowledge Base ({knowledge.length} entries)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {knowledge.map((k: any) => (
                <div key={k.id} className="flex items-start justify-between p-4 rounded-lg border border-border hover:border-primary/20 transition-colors">
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-body text-sm font-medium truncate">{k.title}</p>
                      <Badge variant="outline" className="text-[9px] capitalize shrink-0">{k.category}</Badge>
                      {!k.enabled && <Badge variant="destructive" className="text-[9px] shrink-0">Disabled</Badge>}
                    </div>
                    <p className="font-body text-xs text-muted-foreground line-clamp-2">{k.content}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingKnowledge({ ...k })}>
                          <Settings className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card border-border max-w-lg">
                        <DialogHeader>
                          <DialogTitle className="font-display text-base">Edit Knowledge Entry</DialogTitle>
                        </DialogHeader>
                        {editingKnowledge && (
                          <div className="space-y-3 mt-2">
                            <Input
                              value={editingKnowledge.title}
                              onChange={(e) => setEditingKnowledge((p: any) => ({ ...p, title: e.target.value }))}
                              className="bg-secondary border-border"
                            />
                            <Select
                              value={editingKnowledge.category}
                              onValueChange={(v) => setEditingKnowledge((p: any) => ({ ...p, category: v }))}
                            >
                              <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {KNOWLEDGE_CATEGORIES.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <Textarea
                              value={editingKnowledge.content}
                              onChange={(e) => setEditingKnowledge((p: any) => ({ ...p, content: e.target.value }))}
                              className="bg-secondary border-border min-h-[120px] text-xs"
                            />
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={editingKnowledge.enabled}
                                  onCheckedChange={(v) => setEditingKnowledge((p: any) => ({ ...p, enabled: v }))}
                                />
                                <span className="font-body text-xs text-muted-foreground">Enabled</span>
                              </div>
                              <Button variant="hero" size="sm" className="text-xs" onClick={() => updateKnowledge.mutate(editingKnowledge)}>
                                <Save className="h-3 w-3 mr-1.5" /> Save
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => deleteKnowledge.mutate(k.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONVERSATIONS */}
        <TabsContent value="conversations" className="space-y-4">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base">Recent Conversations ({totalConvos})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {conversations.length === 0 ? (
                <p className="font-body text-sm text-muted-foreground text-center py-8">No conversations yet</p>
              ) : conversations.map((c: any) => {
                const msgs = (c.messages || []) as any[];
                const lastUserMsg = [...msgs].reverse().find((m: any) => m.role === "user");
                return (
                  <div key={c.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/20 transition-colors">
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                        <p className="font-body text-[10px] text-muted-foreground">
                          {new Date(c.updated_at).toLocaleString()} · {msgs.length} messages
                        </p>
                        {c.rating !== null && (
                          c.rating >= 4
                            ? <ThumbsUp className="h-3 w-3 text-primary shrink-0" />
                            : <ThumbsDown className="h-3 w-3 text-destructive shrink-0" />
                        )}
                      </div>
                      <p className="font-body text-xs text-foreground truncate">
                        {lastUserMsg?.content || "No messages"}
                      </p>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewConvo(c)}>
                          <Eye className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card border-border max-w-lg max-h-[70vh]">
                        <DialogHeader>
                          <DialogTitle className="font-display text-base">Conversation Log</DialogTitle>
                        </DialogHeader>
                        {viewConvo && (
                          <div className="space-y-3 overflow-y-auto max-h-[50vh] mt-2">
                            {((viewConvo.messages || []) as any[]).map((m: any, i: number) => (
                              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[85%] px-3 py-2 rounded-sm font-body text-xs leading-relaxed ${
                                  m.role === "user"
                                    ? "bg-primary/20 text-foreground"
                                    : "bg-secondary text-foreground border border-border"
                                }`}>
                                  <p className="text-[9px] text-muted-foreground mb-1 capitalize">{m.role}</p>
                                  {m.content}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminChatbot;
