import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { JournalEditor } from './journal-editor';
import { useForm } from "react-hook-form";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AiJournalAssistant() {
  const form = useForm();
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: "Welcome to your AI journaling assistant! I'm here to help you reflect on your thoughts and feelings.\n\nYou can share what's on your mind, and I'll provide thoughtful responses and journaling prompts to help you explore deeper insights.\n\nWhat would you like to discuss today?"
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedPrompt, setSuggestedPrompt] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [displayedContent, setDisplayedContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, displayedContent]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && !isTyping) {
        setIsTyping(true);
        setDisplayedContent('');
        let i = 0;
        const typeInterval = setInterval(() => {
          setDisplayedContent(lastMessage.content.slice(0, i + 1));
          i++;
          if (i >= lastMessage.content.length) {
            clearInterval(typeInterval);
            setIsTyping(false);
          }
        }, 20);
        return () => clearInterval(typeInterval);
      }
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user' as const, content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
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
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);

      if (data.message.toLowerCase().includes('prompt:')) {
        setSuggestedPrompt(data.message);
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
    const paragraphs = content.split('\n\n');
    return paragraphs.map((paragraph, idx) => {
      if (paragraph.toLowerCase().includes('prompt:')) {
        const [label, ...promptContent] = paragraph.split(':');
        return (
          <div key={idx} className="bg-primary/10 p-4 rounded-lg my-4">
            <div className="font-semibold text-primary">{label}:</div>
            <div>{promptContent.join(':')}</div>
          </div>
        );
      }
      return <p key={idx} className="mb-4">{paragraph}</p>;
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              {idx === messages.length - 1 && message.role === 'assistant'
                ? formatMessage(displayedContent)
                : formatMessage(message.content)}
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

      <div className="border-t p-4">
        {suggestedPrompt && !showEditor && (
          <Button
            onClick={() => {
              const lastMessage = messages[messages.length - 1].content;
              const promptMatch = lastMessage.match(/Prompt:\s*(.*?)(?:\n|$)/);
              const title = promptMatch ? promptMatch[1].trim() : lastMessage.split('\n')[0];
              setShowEditor(true);
              form.setValue('title', title);
            }}
            className="w-full mb-4"
            variant="secondary"
          >
            Start Journaling with This Prompt
          </Button>
        )}
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
          >
            Send
          </Button>
        </div>
      </div>

      {showEditor && (
        <JournalEditor
          onClose={() => {
            setShowEditor(false);
            setSuggestedPrompt(null);
          }}
          initialCategory="reflection"
        />
      )}
    </div>
  );
}