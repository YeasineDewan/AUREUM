import { useState, useRef, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, X, Send, Sparkles, ThumbsUp, ThumbsDown, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

const AIChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rated, setRated] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionId = useMemo(() => `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, []);

  // Fetch config from DB
  const { data: configMap } = useQuery({
    queryKey: ["chat-config"],
    queryFn: async () => {
      const { data } = await supabase.from("chat_config").select("key, value");
      const map: Record<string, string> = {};
      (data || []).forEach((r: any) => { map[r.key] = r.value; });
      return map;
    },
    staleTime: 60000,
  });

  const chatEnabled = configMap?.enabled !== "false";
  const greeting = configMap?.greeting || "Welcome! How can I help you today?";
  const chatName = configMap?.chat_name || "AI Assistant";
  const chatSubtitle = configMap?.chat_subtitle || "AI-powered";
  const suggestedQuestions = (configMap?.suggested_questions || "").split("|").filter(Boolean);

  // Initialize greeting
  useEffect(() => {
    if (greeting && messages.length === 0) {
      setMessages([{ role: "assistant", content: greeting }]);
    }
  }, [greeting]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;
    const userMsg: Msg = { role: "user", content: msg };
    const allMsgs = [...messages, userMsg];
    setMessages(allMsgs);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: allMsgs.map(m => ({ role: m.role, content: m.content })),
          sessionId,
        }),
      });

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to connect");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && prev.length > allMsgs.length) {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {}
        }
      }
    } catch (e: any) {
      setMessages(prev => [...prev, { role: "assistant", content: `I apologize, I'm temporarily unavailable. ${e.message || ""}` }]);
    }
    setIsLoading(false);
  };

  const rateChat = async (rating: number) => {
    setRated(true);
    await supabase
      .from("chat_conversations")
      .update({ rating })
      .eq("session_id", sessionId);
  };

  const resetChat = () => {
    setMessages([{ role: "assistant", content: greeting }]);
    setRated(false);
  };

  if (!chatEnabled) return null;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
          open ? "bg-secondary border border-border" : "bg-primary text-primary-foreground glow-gold"
        }`}
        aria-label="Toggle chat"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[400px] max-h-[560px] bg-card border border-border rounded-sm shadow-2xl flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border bg-secondary/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-display text-sm">{chatName}</p>
                <p className="font-body text-[10px] text-muted-foreground">{chatSubtitle}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={resetChat} title="New conversation">
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[280px]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-sm font-body text-xs leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground border border-border"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <div className="bg-secondary border border-border px-3.5 py-2.5 rounded-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggested questions */}
          {messages.length <= 1 && suggestedQuestions.length > 0 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => send(q)}
                  className="px-2.5 py-1.5 bg-secondary border border-border rounded-sm font-body text-[10px] text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Rating */}
          {messages.length > 3 && !rated && !isLoading && (
            <div className="px-4 pb-2 flex items-center justify-center gap-2">
              <span className="font-body text-[10px] text-muted-foreground">Helpful?</span>
              <button onClick={() => rateChat(5)} className="p-1 hover:text-primary transition-colors text-muted-foreground">
                <ThumbsUp className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => rateChat(1)} className="p-1 hover:text-destructive transition-colors text-muted-foreground">
                <ThumbsDown className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-border bg-secondary/30">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask about styling, fabrics, sizing..."
                className="flex-1 bg-secondary border border-border rounded-sm px-3 py-2 font-body text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
              />
              <Button
                variant="hero"
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={() => send()}
                disabled={isLoading || !input.trim()}
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
            {/* Social media links */}
            <div className="flex items-center justify-center gap-3 mt-2 pt-2 border-t border-border/50">
              <span className="font-body text-[9px] text-muted-foreground">Continue on:</span>
              <a
                href="https://wa.me/8801234567890?text=Hi%2C%20I%20need%20help%20with%20styling"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-1 rounded-sm bg-[hsl(142,70%,40%)]/10 hover:bg-[hsl(142,70%,40%)]/20 transition-colors"
                title="Chat on WhatsApp"
              >
                <svg className="h-3 w-3 text-[hsl(142,70%,40%)]" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                <span className="font-body text-[9px] text-[hsl(142,70%,40%)]">WhatsApp</span>
              </a>
              <a
                href="https://m.me/yourbrandpage"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-1 rounded-sm bg-[hsl(221,70%,55%)]/10 hover:bg-[hsl(221,70%,55%)]/20 transition-colors"
                title="Chat on Messenger"
              >
                <svg className="h-3 w-3 text-[hsl(221,70%,55%)]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.301 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8.2l3.131 3.259L19.752 8.2l-6.561 6.763z"/></svg>
                <span className="font-body text-[9px] text-[hsl(221,70%,55%)]">Messenger</span>
              </a>
              <a
                href="https://instagram.com/yourbrand"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-1 rounded-sm bg-[hsl(330,70%,55%)]/10 hover:bg-[hsl(330,70%,55%)]/20 transition-colors"
                title="Follow on Instagram"
              >
                <svg className="h-3 w-3 text-[hsl(330,70%,55%)]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                <span className="font-body text-[9px] text-[hsl(330,70%,55%)]">Instagram</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatWidget;
