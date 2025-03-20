import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { JournalEditor } from './journal-editor';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useForm } from "react-hook-form";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isPrompt?: boolean;
}

export function AiJournalAssistant() {
  const isMobile = useIsMobile();
  const form = useForm();
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: "Welcome to your AI journaling assistant! I'm here to help you reflect on your thoughts and feelings.\n\nYou can share what's on your mind, and I'll provide thoughtful responses and journaling prompts to help you explore deeper insights.",
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [displayedContent, setDisplayedContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, displayedContent]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        setIsTyping(true);
        setDisplayedContent('');
        let i = 0;
        const typeInterval = setInterval(() => {
          if (i <= lastMessage.content.length) {
            setDisplayedContent(lastMessage.content.slice(0, i));
            i++;
          } else {
            clearInterval(typeInterval);
            setIsTyping(false);
          }
        }, 20);
        return () => clearInterval(typeInterval);
      }
    }
  }, [messages]);

  const handleStartJournaling = (prompt: string) => {
    setShowEditor(true);
    form.setValue('prompt', prompt);
    form.setValue('content', '');
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user' as const, content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setMessageCount(messageCount + 1);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) throw new Error('Failed to get AI response');

      const data = await response.json();
      const parts = data.message.split('\n\nPrompt:');

      // Add the response message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: parts[0].trim(),
      }]);

      // Add the prompt as a separate message
      if (parts[1]) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: parts[1].trim(),
          isPrompt: true,
        }]);
      }

    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessage = (content: string) => {
    return content.split('\n').map((paragraph, idx) => (
      <p key={idx} className="mb-4">{paragraph}</p>
    ));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] lg:h-[calc(100vh-8rem)] max-w-full relative">
      <div className="absolute top-0 left-0 right-0 bottom-[50px] overflow-y-auto px-1 sm:px-2 py-1 space-y-1">
        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-1.5 sm:p-2 break-words ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : message.isPrompt
                  ? 'bg-secondary'
                  : 'bg-muted'
              }`}
            >
              <div className="space-y-1 text-sm sm:text-base">
                {idx === messages.length - 1 && message.role === 'assistant'
                  ? formatMessage(displayedContent)
                  : formatMessage(message.content)}
                {message.isPrompt && (
                  <Button
                    onClick={() => handleStartJournaling(message.content)}
                    className="w-full"
                    variant="default"
                    size="sm"
                  >
                    Start New Entry Using This Prompt
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-foreground/50 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-foreground/50 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-foreground/50 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 border-t bg-background p-1">
        <div className="flex gap-1">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 min-h-[40px] max-h-[80px] rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="px-3 sm:px-4 h-auto"
          >
            Send
          </Button>
        </div>
      </div>

      {showEditor && (
        <JournalEditor
          onClose={() => {
            setShowEditor(false);
          }}
          initialCategory="reflection"
        />
      )}
    </div>
  );
}