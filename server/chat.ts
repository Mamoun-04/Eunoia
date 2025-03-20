import type { Request, Response } from "express";
import OpenAI from "openai";

const openai = new OpenAI();

export async function handleChat(req: Request, res: Response) {
  try {
    const { messages } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "system",
        content: "You are a helpful assistant."
      }, ...messages]
    });

    const reply = completion.choices[0]?.message?.content;

    if (!reply) {
      throw new Error("No response from AI");
    }

    res.json({ content: reply });
  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({ 
      content: "Sorry, I'm having trouble responding. Please try again."
    });
  }
}