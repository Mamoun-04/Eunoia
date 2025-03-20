
import type { Request, Response } from "express";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function handleChat(req: Request, res: Response) {
  try {
    const { messages } = req.body;

    if (!openai.apiKey) {
      return res.status(500).json({ 
        error: "OpenAI API key is not configured",
        content: "I apologize, but I'm not properly configured at the moment. Please contact support."
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a thoughtful journaling assistant that helps users reflect on their thoughts and feelings. Provide empathetic responses and suggest relevant journaling prompts based on the conversation. Keep responses concise and focused. When appropriate, end your response with a journaling prompt prefixed with 'Prompt: '. For example, if a user expresses feeling down, you might end with 'Prompt: Write about a time when you overcame a similar challenge...'"
        },
        ...messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content
        }))
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const messageContent = completion.choices[0]?.message?.content;
    if (!messageContent) {
      return res.status(500).json({ 
        error: "Invalid response from OpenAI API",
        content: "I'm having trouble formulating a response. Could you try rephrasing your message?"
      });
    }

    // Extract prompt if present
    const promptMatch = messageContent.match(/Prompt: (.*?)($|\n)/);
    const prompt = promptMatch ? promptMatch[1] : null;

    res.json({
      content: messageContent.replace(/Prompt: .*?($|\n)/, '').trim(),
      prompt: prompt
    });
  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({ 
      error: error.message,
      content: "I apologize, but I'm having trouble connecting to my knowledge base. Please try again in a moment."
    });
  }
}
