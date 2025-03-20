
import type { Request, Response } from "express";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function handleChat(req: Request, res: Response) {
  try {
    const { messages } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a thoughtful journaling assistant that helps users reflect on their thoughts and feelings. Provide empathetic responses and suggest relevant journaling prompts based on the conversation. Keep responses concise and focused."
        },
        ...messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content
        }))
      ]
    });

    const response = completion.choices[0].message.content;
    
    // Extract or generate a prompt from the response
    const promptMatch = response.match(/Prompt: (.*?)($|\n)/);
    const prompt = promptMatch ? promptMatch[1] : null;

    res.json({
      content: response,
      prompt: prompt
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Failed to process chat message" });
  }
}
