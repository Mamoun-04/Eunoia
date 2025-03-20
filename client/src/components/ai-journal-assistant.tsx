
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";

interface Message {
  type: "user" | "assistant";
  content: string;
  prompt?: string;
}

export function AIJournalAssistant() {
  const [messages, setMessages] = useState<Message[]>([{
    type: "assistant",
    content: "Hello! I'm your AI journaling assistant. I can help you reflect on your thoughts, explore your feelings, or brainstorm writing ideas. What would you like to discuss today?"
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { type: "user" as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: messages.concat(userMessage).map(msg => ({
            role: msg.type === "user" ? "user" : "assistant",
            content: msg.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || !data.content) {
        throw new Error('Invalid response: Missing content');
      }

      setMessages(prev => [...prev, {
        type: "assistant",
        content: data.content,
        prompt: data.prompt
      }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        type: "assistant",
        content: "I apologize, but I'm having trouble responding right now. Please try again in a moment."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const [, setLocation] = useLocation();
  
  const startNewEntry = (prompt: string) => {
    setLocation(`/?prompt=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, i) => (
          <div
            key={i}
            className={cn(
              "flex",
              message.type === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2 animate-slide-in",
                message.type === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              <p className="text-sm">{message.content}</p>
              {message.prompt && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-2"
                  onClick={() => startNewEntry(message.prompt!)}
                >
                  Start Entry with This Prompt
                </Button>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl px-4 py-2">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 rounded-lg bg-muted"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}
