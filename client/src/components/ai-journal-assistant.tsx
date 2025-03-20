import { useState } from "react";
import { motion } from "framer-motion";
import { User, Bot } from "lucide-react";

interface Message {
  type: "user" | "assistant";
  content: string;
}

export function AIJournalAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { type: "user" as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // TODO: Implement API call
    const assistantMessage = { type: "assistant" as const, content: "Response" };
    setMessages((prev) => [...prev, assistantMessage]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-2xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto space-y-4">
        {messages.map((message, index) => (
          <div key={index} className="flex flex-col gap-4">
            {message.type === "user" ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-end"
              >
                <div className="bg-primary text-primary-foreground p-4 rounded-2xl max-w-[80%]">
                  <div className="flex gap-2">
                    <User className="h-5 w-5" />
                    <div className="font-medium">You</div>
                  </div>
                  <div className="mt-2">{message.content}</div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-muted p-4 rounded-2xl max-w-[80%]">
                  <div className="flex gap-2">
                    <Bot className="h-5 w-5" />
                    <div className="font-medium">Assistant</div>
                  </div>
                  <div className="mt-2">{message.content}</div>
                </div>
              </motion.div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="w-full p-4 rounded-lg bg-muted"
        />
      </form>
    </div>
  );
}