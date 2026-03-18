import { useState, useRef, useEffect, useCallback, lazy, Suspense } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "How to Buy BTC?",
  "What is BTC?",
  "Explain Market Order",
  "How to check balance?",
];

const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastSentAt, setLastSentAt] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    // Rate limit: 2 seconds between messages
    const now = Date.now();
    if (now - lastSentAt < 2000) {
      toast.error("Please wait a moment before sending another message.");
      return;
    }
    setLastSentAt(now);

    const userMsg: ChatMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: { message: trimmed, sessionId },
      });

      if (error) throw error;

      const botResponse = data?.response || "Sorry, something went wrong.";
      setMessages((prev) => [...prev, { role: "assistant", content: botResponse }]);
    } catch (err: any) {
      console.error("Chat error:", err);
      const errorMsg = err?.message?.includes("429")
        ? "Too many requests. Please wait a moment."
        : "Something went wrong. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: errorMsg }]);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, lastSentAt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-50 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
        aria-label="Open AI Assistant"
      >
        <MessageCircle className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 w-[320px] max-h-[480px] bg-card border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-secondary border-b border-border">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Trading Assistant</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-[200px] max-h-[320px]">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground text-center">Hi! I can help you with trading. Try asking:</p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-[10px] px-2.5 py-1.5 rounded-full bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground transition-colors border border-border"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="h-3 w-3 text-primary-foreground" />
              </div>
            )}
            <div
              className={`max-w-[220px] px-3 py-2 rounded-lg text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-secondary text-foreground rounded-bl-sm"
              }`}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="h-3 w-3 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2 justify-start">
            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <Bot className="h-3 w-3 text-primary-foreground" />
            </div>
            <div className="bg-secondary px-3 py-2 rounded-lg rounded-bl-sm">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-2.5 border-t border-border bg-card">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about trading..."
          maxLength={500}
          className="flex-1 bg-secondary text-foreground text-xs rounded-lg px-3 py-2 outline-none border border-border focus:border-primary placeholder:text-muted-foreground"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 transition-opacity"
        >
          {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
        </button>
      </form>
    </div>
  );
};

export default AIChatbot;
