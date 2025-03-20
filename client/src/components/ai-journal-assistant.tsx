
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, PenSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { JournalEditor } from "./journal-editor";

interface Message {
  role: "user" | "assistant";
  content: string;
  prompt?: string;
}

export function AIJournalAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your journaling assistant. How are you feeling today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const newMessages = [
      ...messages,
      { role: "user", content },
    ];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      
      const data = await response.json();
      setMessages([...newMessages, {
        role: "assistant",
        content: data.content,
        prompt: data.prompt,
      }]);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <Card className="flex-1 p-4 mb-4 bg-background/50 backdrop-blur">
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="space-y-4 p-4">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground ml-4"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    {message.prompt && (
                      <Button
                        variant="secondary"
                        className="mt-2"
                        onClick={() => setSelectedPrompt(message.prompt)}
                      >
                        <PenSquare className="h-4 w-4 mr-2" />
                        Start Writing
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-muted p-4 rounded-2xl">
                    <div className="flex gap-2">
                      <span className="animate-bounce">•</span>
                      <span className="animate-bounce delay-100">•</span>
                      <span className="animate-bounce delay-200">•</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </Card>

      <div className="flex gap-2 p-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage(input)}
          placeholder="Type your message..."
          className="flex-1 bg-background/50 backdrop-blur rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <Button onClick={() => sendMessage(input)} disabled={isLoading}>
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {selectedPrompt && (
        <JournalEditor
          onClose={() => setSelectedPrompt(null)}
          initialPrompt={selectedPrompt}
        />
      )}
    </div>
  );
}
