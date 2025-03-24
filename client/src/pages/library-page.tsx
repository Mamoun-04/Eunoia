import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Entry } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { GuidedLesson } from "@/components/guided-lesson";
import { useState } from "react";
import {
  LogOut,
  Settings,
  CalendarDays,
  PenSquare,
  BookOpen,
  Search,
  Home,
  Filter,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SAMPLE_LESSONS = [
  {
    id: "lesson-1",
    title: "Inner Wisdom Reflection Practice",
    topic: "Wisdom",
    description:
      "Reflect on the wisdom that comes from introspection and life experiences.",
    questions: [
      {
        id: "lesson-1-q1",
        type: "text",
        prompt:
          "Share a moment today when you felt guided by your inner wisdom.",
      },
      {
        id: "lesson-1-q2",
        type: "text",
        prompt:
          "What lessons have you learned from past mistakes that shape your decisions today?",
      },
      {
        id: "lesson-1-q3",
        type: "text",
        prompt:
          "Describe a piece of advice you received that turned out to be deeply meaningful.",
      },
      {
        id: "lesson-1-q4",
        type: "text",
        prompt:
          "How do you distinguish between your inner voice and external influences?",
      },
      {
        id: "lesson-1-q5",
        type: "text",
        prompt:
          "Write about a time when trusting your instincts led to personal growth.",
      },
    ],
  },
  {
    id: "lesson-2",
    title: "Cultivating Gratitude",
    topic: "Gratitude",
    description: "Deepen your awareness of blessings in your life.",
    questions: [
      {
        id: "lesson-2-q1",
        type: "text",
        prompt: "List three small things you’re grateful for today.",
      },
      {
        id: "lesson-2-q2",
        type: "text",
        prompt: "Who is someone you appreciate deeply, and why?",
      },
      {
        id: "lesson-2-q3",
        type: "text",
        prompt: "How does practicing gratitude change your perspective?",
      },
      {
        id: "lesson-2-q4",
        type: "text",
        prompt:
          "What challenge has helped you grow that you’re now thankful for?",
      },
      {
        id: "lesson-2-q5",
        type: "text",
        prompt: "What’s something beautiful you noticed today?",
      },
    ],
  },
  {
    id: "lesson-3",
    title: "The Power of Forgiveness",
    topic: "Forgiveness",
    description:
      "Explore your capacity to forgive and release emotional burdens.",
    questions: [
      {
        id: "lesson-3-q1",
        type: "text",
        prompt: "Is there someone you’re holding resentment toward?",
      },
      {
        id: "lesson-3-q2",
        type: "text",
        prompt: "What would it feel like to truly let go?",
      },
      {
        id: "lesson-3-q3",
        type: "text",
        prompt: "Have you forgiven yourself for past mistakes? Why or why not?",
      },
    ],
  },
  {
    id: "lesson-4",
    title: "Mindful Presence Practice",
    topic: "Mindfulness",
    description:
      "Practice being fully present in your thoughts, feelings, and surroundings.",
    questions: [
      {
        id: "lesson-4-q1",
        type: "text",
        prompt: "Describe how your body feels at this very moment.",
      },
      {
        id: "lesson-4-q2",
        type: "text",
        prompt: "What are three sounds you can hear right now?",
      },
      {
        id: "lesson-4-q3",
        type: "text",
        prompt: "Recall a moment today when you felt truly present.",
      },
      {
        id: "lesson-4-q4",
        type: "text",
        prompt: "How do distractions affect your peace of mind?",
      },
      {
        id: "lesson-4-q5",
        type: "text",
        prompt: "What helps you return to the present moment?",
      },
    ],
  },
  {
    id: "lesson-5",
    title: "Exploring Identity",
    topic: "Self-Awareness",
    description: "Delve into who you are and how your experiences shape you.",
    questions: [
      {
        id: "lesson-5-q1",
        type: "text",
        prompt: "How would you describe yourself to a stranger?",
      },
      {
        id: "lesson-5-q2",
        type: "text",
        prompt: "Which labels do you identify with most and why?",
      },
      {
        id: "lesson-5-q3",
        type: "text",
        prompt: "What parts of your identity have changed over time?",
      },
    ],
  },
  {
    id: "lesson-6",
    title: "Navigating Uncertainty",
    topic: "Trust",
    description:
      "Reflect on how you approach uncertainty and faith in the unseen.",
    questions: [
      {
        id: "lesson-6-q1",
        type: "text",
        prompt: "How do you typically react to uncertainty?",
      },
      {
        id: "lesson-6-q2",
        type: "text",
        prompt:
          "Recall a time when trusting the process led to a good outcome.",
      },
      {
        id: "lesson-6-q3",
        type: "text",
        prompt: "What would it look like to fully surrender control?",
      },
      {
        id: "lesson-6-q4",
        type: "text",
        prompt: "What helps you build trust in yourself or something greater?",
      },
    ],
  },
  {
    id: "lesson-7",
    title: "Healing Through Writing",
    topic: "Emotional Healing",
    description: "Use your words to process pain and move toward healing.",
    questions: [
      {
        id: "lesson-7-q1",
        type: "text",
        prompt: "Write a letter to someone who hurt you—but don’t send it.",
      },
      {
        id: "lesson-7-q2",
        type: "text",
        prompt: "What emotion have you been avoiding lately?",
      },
      {
        id: "lesson-7-q3",
        type: "text",
        prompt:
          "Describe a moment that broke you—and what you learned from it.",
      },
      {
        id: "lesson-7-q4",
        type: "text",
        prompt: "What does healing feel like to you?",
      },
      {
        id: "lesson-7-q5",
        type: "text",
        prompt: "Who or what gives you the strength to keep going?",
      },
    ],
  },
  {
    id: "lesson-8",
    title: "Acts of Compassion",
    topic: "Compassion",
    description: "Develop your ability to see and serve others with empathy.",
    questions: [
      {
        id: "lesson-8-q1",
        type: "text",
        prompt: "Describe a time when someone showed you unexpected kindness.",
      },
      {
        id: "lesson-8-q2",
        type: "text",
        prompt: "What’s one compassionate act you can do this week?",
      },
      {
        id: "lesson-8-q3",
        type: "text",
        prompt: "How do you treat yourself when you’re struggling?",
      },
    ],
  },
  {
    id: "lesson-9",
    title: "Purpose and Direction",
    topic: "Purpose",
    description:
      "Reflect on the deeper meaning behind your actions and dreams.",
    questions: [
      {
        id: "lesson-9-q1",
        type: "text",
        prompt: "What drives you to get out of bed in the morning?",
      },
      {
        id: "lesson-9-q2",
        type: "text",
        prompt: "What legacy would you like to leave behind?",
      },
      {
        id: "lesson-9-q3",
        type: "text",
        prompt: "How do your daily actions align with your long-term goals?",
      },
      {
        id: "lesson-9-q4",
        type: "text",
        prompt: "Describe your dream life in five years.",
      },
      {
        id: "lesson-9-q5",
        type: "text",
        prompt:
          "What’s one thing you could start doing today to live more purposefully?",
      },
    ],
  },
  {
    id: "lesson-10",
    title: "Surrender and Serenity",
    topic: "Letting Go",
    description: "Let go of what you can’t control and embrace inner peace.",
    questions: [
      {
        id: "lesson-10-q1",
        type: "text",
        prompt: "What’s something you’ve been trying to control, but can’t?",
      },
      {
        id: "lesson-10-q2",
        type: "text",
        prompt: "How would it feel to truly let it go?",
      },
      {
        id: "lesson-10-q3",
        type: "text",
        prompt:
          "What’s a sign that you're holding on too tightly to something?",
      },
    ],
  },
  {
    id: "lesson-11",
    title: "Finding Joy in Simplicity",
    topic: "Joy",
    description: "Discover happiness in the ordinary moments of life.",
    questions: [
      {
        id: "lesson-11-q1",
        type: "text",
        prompt: "What simple activity brings you unexpected joy?",
      },
      {
        id: "lesson-11-q2",
        type: "text",
        prompt: "When did you last laugh wholeheartedly and why?",
      },
      {
        id: "lesson-11-q3",
        type: "text",
        prompt: "How can you create more joyful moments in your day?",
      },
    ],
  },
  {
    id: "lesson-12",
    title: "Resilience in the Face of Difficulty",
    topic: "Resilience",
    description: "Reflect on how you've grown stronger through challenges.",
    questions: [
      {
        id: "lesson-12-q1",
        type: "text",
        prompt: "What’s a hardship that shaped who you are?",
      },
      {
        id: "lesson-12-q2",
        type: "text",
        prompt: "How do you define resilience in your own life?",
      },
      {
        id: "lesson-12-q3",
        type: "text",
        prompt: "What coping strategies have helped you persevere?",
      },
      {
        id: "lesson-12-q4",
        type: "text",
        prompt: "Who is someone whose resilience inspires you?",
      },
    ],
  },
  {
    id: "lesson-13",
    title: "Moments of Awe",
    topic: "Wonder",
    description: "Reconnect with the beauty and mystery of existence.",
    questions: [
      {
        id: "lesson-13-q1",
        type: "text",
        prompt: "Describe a moment when you felt awe-struck.",
      },
      {
        id: "lesson-13-q2",
        type: "text",
        prompt: "What in nature makes you feel small in a good way?",
      },
      {
        id: "lesson-13-q3",
        type: "text",
        prompt: "How can you invite more wonder into your life?",
      },
    ],
  },
  {
    id: "lesson-14",
    title: "Strengthening Faith",
    topic: "Faith",
    description: "Explore your beliefs and the comfort they offer.",
    questions: [
      {
        id: "lesson-14-q1",
        type: "text",
        prompt: "What role does faith play in your daily life?",
      },
      {
        id: "lesson-14-q2",
        type: "text",
        prompt:
          "Describe a time your faith helped you through something difficult.",
      },
      {
        id: "lesson-14-q3",
        type: "text",
        prompt: "How do you nourish and grow your faith?",
      },
    ],
  },
  {
    id: "lesson-15",
    title: "Living with Integrity",
    topic: "Integrity",
    description: "Reflect on your values and how they shape your choices.",
    questions: [
      {
        id: "lesson-15-q1",
        type: "text",
        prompt: "What are your core values?",
      },
      {
        id: "lesson-15-q2",
        type: "text",
        prompt: "Describe a decision you made that reflects your integrity.",
      },
      {
        id: "lesson-15-q3",
        type: "text",
        prompt: "When have you struggled to live by your values, and why?",
      },
    ],
  },
  {
    id: "lesson-16",
    title: "The Gift of Solitude",
    topic: "Solitude",
    description: "Discover the benefits of spending intentional time alone.",
    questions: [
      {
        id: "lesson-16-q1",
        type: "text",
        prompt: "How do you feel when you're alone?",
      },
      {
        id: "lesson-16-q2",
        type: "text",
        prompt: "What insights have come to you in solitude?",
      },
      {
        id: "lesson-16-q3",
        type: "text",
        prompt: "How can you create more meaningful alone time?",
      },
    ],
  },
  {
    id: "lesson-17",
    title: "Cultivating Patience",
    topic: "Patience",
    description: "Examine your relationship with waiting and endurance.",
    questions: [
      {
        id: "lesson-17-q1",
        type: "text",
        prompt: "What tests your patience most often?",
      },
      {
        id: "lesson-17-q2",
        type: "text",
        prompt: "Describe a time when patience paid off.",
      },
      {
        id: "lesson-17-q3",
        type: "text",
        prompt: "What practices help you stay calm when frustrated?",
      },
    ],
  },
  {
    id: "lesson-18",
    title: "Vision for the Future",
    topic: "Vision",
    description: "Imagine the future you want to build.",
    questions: [
      {
        id: "lesson-18-q1",
        type: "text",
        prompt: "What does your ideal life look like in 10 years?",
      },
      {
        id: "lesson-18-q2",
        type: "text",
        prompt: "What steps can you take now to move closer to it?",
      },
      {
        id: "lesson-18-q3",
        type: "text",
        prompt: "Who can support your vision and how?",
      },
    ],
  },
  {
    id: "lesson-19",
    title: "Grieving with Grace",
    topic: "Grief",
    description: "Honor your loss and the healing process.",
    questions: [
      {
        id: "lesson-19-q1",
        type: "text",
        prompt: "What or who are you grieving?",
      },
      {
        id: "lesson-19-q2",
        type: "text",
        prompt: "How have you changed because of this grief?",
      },
      {
        id: "lesson-19-q3",
        type: "text",
        prompt: "What rituals or practices help you process grief?",
      },
    ],
  },
  {
    id: "lesson-20",
    title: "Embracing Change",
    topic: "Change",
    description: "Explore your feelings around transitions and transformation.",
    questions: [
      {
        id: "lesson-20-q1",
        type: "text",
        prompt: "Describe a big change you’ve experienced recently.",
      },
      {
        id: "lesson-20-q2",
        type: "text",
        prompt: "What emotions come up when you think of change?",
      },
      {
        id: "lesson-20-q3",
        type: "text",
        prompt: "What changes are you currently resisting and why?",
      },
    ],
  },
  {
    id: "lesson-21",
    title: "Listening Deeply",
    topic: "Connection",
    description:
      "Reflect on your ability to listen to others and yourself with presence.",
    questions: [
      {
        id: "lesson-21-q1",
        type: "text",
        prompt: "When was the last time you felt truly heard?",
      },
      {
        id: "lesson-21-q2",
        type: "text",
        prompt: "How can you become a better listener?",
      },
      {
        id: "lesson-21-q3",
        type: "text",
        prompt: "What do you need to hear from yourself right now?",
      },
    ],
  },
  {
    id: "lesson-22",
    title: "Acts of Service",
    topic: "Kindness",
    description: "Explore the joy and meaning behind serving others.",
    questions: [
      {
        id: "lesson-22-q1",
        type: "text",
        prompt:
          "Describe a time when you helped someone and it deeply impacted them.",
      },
      {
        id: "lesson-22-q2",
        type: "text",
        prompt: "What’s one small way you can serve someone this week?",
      },
      {
        id: "lesson-22-q3",
        type: "text",
        prompt: "How does helping others affect your own well-being?",
      },
    ],
  },
  {
    id: "lesson-23",
    title: "Letting Go of Perfection",
    topic: "Self-Compassion",
    description: "Challenge your need for perfection and embrace being enough.",
    questions: [
      {
        id: "lesson-23-q1",
        type: "text",
        prompt: "What area of your life do you hold unrealistic standards in?",
      },
      {
        id: "lesson-23-q2",
        type: "text",
        prompt: "How would your life improve if you let go of perfection?",
      },
      {
        id: "lesson-23-q3",
        type: "text",
        prompt: "When have your imperfections taught you something important?",
      },
    ],
  },
  {
    id: "lesson-24",
    title: "Nurturing Hope",
    topic: "Hope",
    description: "Hold onto optimism even in the face of uncertainty.",
    questions: [
      {
        id: "lesson-24-q1",
        type: "text",
        prompt: "What gives you hope when things feel dark?",
      },
      {
        id: "lesson-24-q2",
        type: "text",
        prompt: "Describe a time when things worked out unexpectedly well.",
      },
      {
        id: "lesson-24-q3",
        type: "text",
        prompt: "How can you cultivate more hope in your life?",
      },
    ],
  },
  {
    id: "lesson-25",
    title: "Trusting the Timing",
    topic: "Patience",
    description: "Explore how to find peace with divine or natural timing.",
    questions: [
      {
        id: "lesson-25-q1",
        type: "text",
        prompt: "When have you struggled with waiting, and what did you learn?",
      },
      {
        id: "lesson-25-q2",
        type: "text",
        prompt:
          "What outcome eventually came to you when you least expected it?",
      },
      {
        id: "lesson-25-q3",
        type: "text",
        prompt: "What helps you trust that things will unfold in due time?",
      },
    ],
  },
  {
    id: "lesson-26",
    title: "Your Inner Child",
    topic: "Healing",
    description:
      "Revisit the child within you and offer them what they needed.",
    questions: [
      {
        id: "lesson-26-q1",
        type: "text",
        prompt: "What were you like as a child?",
      },
      {
        id: "lesson-26-q2",
        type: "text",
        prompt: "What did you most need to hear growing up?",
      },
      {
        id: "lesson-26-q3",
        type: "text",
        prompt: "How can you nurture your inner child today?",
      },
    ],
  },
  {
    id: "lesson-27",
    title: "Owning Your Story",
    topic: "Authenticity",
    description: "Embrace your full story and live without shame.",
    questions: [
      {
        id: "lesson-27-q1",
        type: "text",
        prompt: "What parts of your story have you struggled to accept?",
      },
      {
        id: "lesson-27-q2",
        type: "text",
        prompt: "How has your past shaped your strength?",
      },
      {
        id: "lesson-27-q3",
        type: "text",
        prompt: "What would living fully and authentically look like for you?",
      },
    ],
  },
  {
    id: "lesson-28",
    title: "Courage to Speak",
    topic: "Courage",
    description: "Reflect on your voice, truth, and power to speak up.",
    questions: [
      {
        id: "lesson-28-q1",
        type: "text",
        prompt: "When have you spoken up for yourself or someone else?",
      },
      {
        id: "lesson-28-q2",
        type: "text",
        prompt: "What keeps you from speaking your truth?",
      },
      {
        id: "lesson-28-q3",
        type: "text",
        prompt: "How can you use your voice with wisdom and courage?",
      },
    ],
  },
  {
    id: "lesson-29",
    title: "Balancing Being and Doing",
    topic: "Balance",
    description: "Find harmony between action and rest.",
    questions: [
      {
        id: "lesson-29-q1",
        type: "text",
        prompt: "Are you more of a doer or a be-er? Why?",
      },
      {
        id: "lesson-29-q2",
        type: "text",
        prompt: "When was the last time you fully rested without guilt?",
      },
      {
        id: "lesson-29-q3",
        type: "text",
        prompt: "How can you integrate more balance into your days?",
      },
    ],
  },
  {
    id: "lesson-30",
    title: "Awakening Curiosity",
    topic: "Curiosity",
    description: "Celebrate your innate desire to learn and grow.",
    questions: [
      {
        id: "lesson-30-q1",
        type: "text",
        prompt: "What are you deeply curious about right now?",
      },
      {
        id: "lesson-30-q2",
        type: "text",
        prompt: "What’s something new you’d love to explore?",
      },
      {
        id: "lesson-30-q3",
        type: "text",
        prompt: "When did curiosity last lead you to something beautiful?",
      },
    ],
  },
  {
    id: "lesson-31",
    title: "Gratitude in Difficulty",
    topic: "Gratitude",
    description: "Find reasons to be thankful even in tough times.",
    questions: [
      {
        id: "lesson-31-q1",
        type: "text",
        prompt: "What challenge are you currently facing?",
      },
      {
        id: "lesson-31-q2",
        type: "text",
        prompt: "What hidden blessings exist in this challenge?",
      },
      {
        id: "lesson-31-q3",
        type: "text",
        prompt: "How can gratitude help you get through it?",
      },
    ],
  },
  {
    id: "lesson-32",
    title: "Mindful Mornings",
    topic: "Mindfulness",
    description: "Begin your day with intention and clarity.",
    questions: [
      {
        id: "lesson-32-q1",
        type: "text",
        prompt: "What’s one thing you’re looking forward to today?",
      },
      {
        id: "lesson-32-q2",
        type: "text",
        prompt: "How can you approach today with mindfulness?",
      },
      {
        id: "lesson-32-q3",
        type: "text",
        prompt: "What intention would you like to carry with you?",
      },
    ],
  },
  {
    id: "lesson-33",
    title: "Evening Reflection",
    topic: "Reflection",
    description: "Wind down and process your day with awareness.",
    questions: [
      { id: "lesson-33-q1", type: "text", prompt: "What went well today?" },
      {
        id: "lesson-33-q2",
        type: "text",
        prompt: "What challenged you today?",
      },
      {
        id: "lesson-33-q3",
        type: "text",
        prompt: "What would you like to carry into tomorrow?",
      },
    ],
  },
  {
    id: "lesson-34",
    title: "Emotional Check-In",
    topic: "Emotions",
    description: "Gain awareness of your inner emotional world.",
    questions: [
      {
        id: "lesson-34-q1",
        type: "text",
        prompt: "What emotion is most present for you right now?",
      },
      {
        id: "lesson-34-q2",
        type: "text",
        prompt: "How is this emotion affecting your thoughts or behavior?",
      },
      {
        id: "lesson-34-q3",
        type: "text",
        prompt: "What does this emotion need from you?",
      },
    ],
  },
  {
    id: "lesson-35",
    title: "Setting Boundaries",
    topic: "Self-Respect",
    description: "Define your limits and protect your peace.",
    questions: [
      {
        id: "lesson-35-q1",
        type: "text",
        prompt: "What boundary do you need to set right now?",
      },
      {
        id: "lesson-35-q2",
        type: "text",
        prompt: "What makes it hard for you to set boundaries?",
      },
      {
        id: "lesson-35-q3",
        type: "text",
        prompt: "How can you lovingly enforce this boundary?",
      },
    ],
  },
  {
    id: "lesson-36",
    title: "Power of Stillness",
    topic: "Stillness",
    description: "Discover what silence and pause reveal to you.",
    questions: [
      {
        id: "lesson-36-q1",
        type: "text",
        prompt: "When was the last time you were truly still?",
      },
      {
        id: "lesson-36-q2",
        type: "text",
        prompt: "What did that stillness teach you?",
      },
      {
        id: "lesson-36-q3",
        type: "text",
        prompt: "How can you make more room for stillness in your life?",
      },
    ],
  },
  {
    id: "lesson-37",
    title: "Cleansing Your Space",
    topic: "Environment",
    description: "Reflect on the spaces you occupy and how they affect you.",
    questions: [
      {
        id: "lesson-37-q1",
        type: "text",
        prompt: "How does your current space make you feel?",
      },
      {
        id: "lesson-37-q2",
        type: "text",
        prompt: "What could you remove or add to bring more peace?",
      },
      {
        id: "lesson-37-q3",
        type: "text",
        prompt: "How do your surroundings reflect your state of mind?",
      },
    ],
  },
  {
    id: "lesson-38",
    title: "Learning from Mistakes",
    topic: "Growth",
    description: "Turn failures into meaningful stepping stones.",
    questions: [
      {
        id: "lesson-38-q1",
        type: "text",
        prompt: "What mistake have you recently made?",
      },
      {
        id: "lesson-38-q2",
        type: "text",
        prompt: "What did you learn from it?",
      },
      {
        id: "lesson-38-q3",
        type: "text",
        prompt: "How can you show yourself compassion around this experience?",
      },
    ],
  },
  {
    id: "lesson-39",
    title: "Exploring Creativity",
    topic: "Creativity",
    description: "Reconnect with your creative spirit.",
    questions: [
      {
        id: "lesson-39-q1",
        type: "text",
        prompt: "What creative activity brings you joy?",
      },
      {
        id: "lesson-39-q2",
        type: "text",
        prompt: "What holds you back from expressing yourself creatively?",
      },
      {
        id: "lesson-39-q3",
        type: "text",
        prompt: "How can you make space for more creativity in your life?",
      },
    ],
  },
  {
    id: "lesson-40",
    title: "Redefining Success",
    topic: "Purpose",
    description: "Reflect on what truly matters in your definition of success.",
    questions: [
      {
        id: "lesson-40-q1",
        type: "text",
        prompt: "What does success mean to you today?",
      },
      {
        id: "lesson-40-q2",
        type: "text",
        prompt: "What version of success no longer serves you?",
      },
      {
        id: "lesson-40-q3",
        type: "text",
        prompt: "What values guide your pursuit of success now?",
      },
    ],
  },
  {
    id: "lesson-41",
    title: "Embodying Humility",
    topic: "Humility",
    description: "Reflect on staying grounded and aware of your limits.",
    questions: [
      {
        id: "lesson-41-q1",
        type: "text",
        prompt: "When was the last time you admitted you were wrong?",
      },
      {
        id: "lesson-41-q2",
        type: "text",
        prompt: "How does humility benefit your relationships?",
      },
      {
        id: "lesson-41-q3",
        type: "text",
        prompt: "What keeps you humble in your life today?",
      },
    ],
  },
  {
    id: "lesson-42",
    title: "Sacred Silence",
    topic: "Silence",
    description:
      "Honor the space between words and discover peace in quiet moments.",
    questions: [
      {
        id: "lesson-42-q1",
        type: "text",
        prompt: "How do you feel about silence?",
      },
      {
        id: "lesson-42-q2",
        type: "text",
        prompt: "What insights have come from moments of silence?",
      },
      {
        id: "lesson-42-q3",
        type: "text",
        prompt: "Where in your life do you need more silence?",
      },
    ],
  },
  {
    id: "lesson-43",
    title: "Honoring Commitments",
    topic: "Responsibility",
    description: "Reflect on promises and the value of follow-through.",
    questions: [
      {
        id: "lesson-43-q1",
        type: "text",
        prompt: "What commitment do you feel most proud of keeping?",
      },
      {
        id: "lesson-43-q2",
        type: "text",
        prompt: "Where have you struggled to stay committed and why?",
      },
      {
        id: "lesson-43-q3",
        type: "text",
        prompt: "What helps you honor your responsibilities?",
      },
    ],
  },
  {
    id: "lesson-44",
    title: "Facing Fear",
    topic: "Fear",
    description: "Explore your fears and how to grow through them.",
    questions: [
      {
        id: "lesson-44-q1",
        type: "text",
        prompt: "What fear is holding you back right now?",
      },
      {
        id: "lesson-44-q2",
        type: "text",
        prompt: "How has fear protected or served you in the past?",
      },
      {
        id: "lesson-44-q3",
        type: "text",
        prompt: "What would courage look like in facing this fear?",
      },
    ],
  },
  {
    id: "lesson-45",
    title: "Rooted in Compassion",
    topic: "Compassion",
    description: "Deepen your capacity for empathy and kindness.",
    questions: [
      {
        id: "lesson-45-q1",
        type: "text",
        prompt: "When have you shown compassion to someone in pain?",
      },
      {
        id: "lesson-45-q2",
        type: "text",
        prompt: "What’s the difference between sympathy and compassion?",
      },
      {
        id: "lesson-45-q3",
        type: "text",
        prompt: "How can you be more compassionate to yourself today?",
      },
    ],
  },
  {
    id: "lesson-46",
    title: "Living Intentionally",
    topic: "Intentionality",
    description: "Bring mindfulness and meaning to your daily actions.",
    questions: [
      {
        id: "lesson-46-q1",
        type: "text",
        prompt: "What intention did you start your day with?",
      },
      {
        id: "lesson-46-q2",
        type: "text",
        prompt: "What does it mean to live intentionally to you?",
      },
      {
        id: "lesson-46-q3",
        type: "text",
        prompt: "What area of your life needs more intentionality?",
      },
    ],
  },
  {
    id: "lesson-47",
    title: "Moments of Mercy",
    topic: "Mercy",
    description:
      "Reflect on experiences of being forgiven or offering forgiveness.",
    questions: [
      {
        id: "lesson-47-q1",
        type: "text",
        prompt: "When have you been shown mercy unexpectedly?",
      },
      {
        id: "lesson-47-q2",
        type: "text",
        prompt: "How did it change your view of the person or situation?",
      },
      {
        id: "lesson-47-q3",
        type: "text",
        prompt: "Who might need your mercy today?",
      },
    ],
  },
  {
    id: "lesson-48",
    title: "Bound by Integrity",
    topic: "Character",
    description: "Explore the role of personal ethics and alignment.",
    questions: [
      {
        id: "lesson-48-q1",
        type: "text",
        prompt: "What’s a recent choice that reflected your character?",
      },
      {
        id: "lesson-48-q2",
        type: "text",
        prompt:
          "How do you know when you're out of alignment with your values?",
      },
      {
        id: "lesson-48-q3",
        type: "text",
        prompt: "What helps you course-correct and realign?",
      },
    ],
  },
  {
    id: "lesson-49",
    title: "Simplicity as Strength",
    topic: "Simplicity",
    description: "Appreciate the quiet power of living simply.",
    questions: [
      {
        id: "lesson-49-q1",
        type: "text",
        prompt:
          "Where in your life are things more complicated than they need to be?",
      },
      {
        id: "lesson-49-q2",
        type: "text",
        prompt: "What would simplifying that area look like?",
      },
      {
        id: "lesson-49-q3",
        type: "text",
        prompt: "How does simplicity feel in your body and mind?",
      },
    ],
  },
  {
    id: "lesson-50",
    title: "Trusting Yourself",
    topic: "Self-Trust",
    description: "Build confidence in your own choices and intuition.",
    questions: [
      {
        id: "lesson-50-q1",
        type: "text",
        prompt: "What decision have you recently doubted?",
      },
      {
        id: "lesson-50-q2",
        type: "text",
        prompt: "What evidence do you have that you can trust yourself?",
      },
      {
        id: "lesson-50-q3",
        type: "text",
        prompt: "What would self-trust look like in action today?",
      },
    ],
  },
  {
    id: "lesson-51",
    title: "The Value of Time",
    topic: "Time",
    description: "Reflect on how you use your time and what truly matters.",
    questions: [
      {
        id: "lesson-51-q1",
        type: "text",
        prompt: "How do you usually spend your free time?",
      },
      {
        id: "lesson-51-q2",
        type: "text",
        prompt: "What time-wasters could you let go of?",
      },
      {
        id: "lesson-51-q3",
        type: "text",
        prompt: "What’s one thing you want to make more time for?",
      },
    ],
  },
  {
    id: "lesson-52",
    title: "Receiving Love",
    topic: "Love",
    description: "Explore your openness to receiving love and care.",
    questions: [
      {
        id: "lesson-52-q1",
        type: "text",
        prompt: "What makes you feel most loved?",
      },
      {
        id: "lesson-52-q2",
        type: "text",
        prompt: "Do you find it easy or hard to accept love? Why?",
      },
      {
        id: "lesson-52-q3",
        type: "text",
        prompt: "What would help you open to love more fully?",
      },
    ],
  },
  {
    id: "lesson-53",
    title: "Letting Go of Comparison",
    topic: "Self-Worth",
    description:
      "Find confidence in your own path and stop measuring against others.",
    questions: [
      {
        id: "lesson-53-q1",
        type: "text",
        prompt: "Who do you often compare yourself to and why?",
      },
      {
        id: "lesson-53-q2",
        type: "text",
        prompt: "What makes your path unique and valuable?",
      },
      {
        id: "lesson-53-q3",
        type: "text",
        prompt: "How would life feel without comparison?",
      },
    ],
  },
  {
    id: "lesson-54",
    title: "Living in Alignment",
    topic: "Alignment",
    description: "Ensure your actions, values, and dreams are in sync.",
    questions: [
      {
        id: "lesson-54-q1",
        type: "text",
        prompt: "What value do you hold most dear?",
      },
      {
        id: "lesson-54-q2",
        type: "text",
        prompt: "Are your current actions aligned with that value?",
      },
      {
        id: "lesson-54-q3",
        type: "text",
        prompt: "What change would bring more alignment to your life?",
      },
    ],
  },
  {
    id: "lesson-55",
    title: "Gracious Receiving",
    topic: "Receiving",
    description:
      "Practice receiving help, love, and blessings with humility and joy.",
    questions: [
      {
        id: "lesson-55-q1",
        type: "text",
        prompt: "When did someone offer you help that was hard to accept?",
      },
      {
        id: "lesson-55-q2",
        type: "text",
        prompt: "What belief do you have about receiving from others?",
      },
      {
        id: "lesson-55-q3",
        type: "text",
        prompt: "How can you receive with more grace and gratitude?",
      },
    ],
  },
  {
    id: "lesson-56",
    title: "Embracing Uniqueness",
    topic: "Individuality",
    description: "Celebrate what makes you different and powerful.",
    questions: [
      {
        id: "lesson-56-q1",
        type: "text",
        prompt: "What is something unique about you that you love?",
      },
      {
        id: "lesson-56-q2",
        type: "text",
        prompt: "When have you tried to fit in instead of stand out?",
      },
      {
        id: "lesson-56-q3",
        type: "text",
        prompt: "How can you better embrace your individuality?",
      },
    ],
  },
  {
    id: "lesson-57",
    title: "Learning to Pause",
    topic: "Pause",
    description: "Develop the habit of stopping before reacting or deciding.",
    questions: [
      {
        id: "lesson-57-q1",
        type: "text",
        prompt: "When did a pause help you make a better choice?",
      },
      {
        id: "lesson-57-q2",
        type: "text",
        prompt: "What makes it hard for you to pause sometimes?",
      },
      {
        id: "lesson-57-q3",
        type: "text",
        prompt: "What situations could benefit from more pause and reflection?",
      },
    ],
  },
  {
    id: "lesson-58",
    title: "Celebrating Small Wins",
    topic: "Motivation",
    description: "Acknowledge progress and build momentum.",
    questions: [
      {
        id: "lesson-58-q1",
        type: "text",
        prompt: "What’s a small win you had today?",
      },
      {
        id: "lesson-58-q2",
        type: "text",
        prompt: "How do you usually celebrate your progress?",
      },
      {
        id: "lesson-58-q3",
        type: "text",
        prompt: "What helps you stay motivated during long journeys?",
      },
    ],
  },
  {
    id: "lesson-59",
    title: "Saying No with Love",
    topic: "Boundaries",
    description: "Learn to say no without guilt, for your well-being.",
    questions: [
      {
        id: "lesson-59-q1",
        type: "text",
        prompt: "When was the last time you said yes when you meant no?",
      },
      {
        id: "lesson-59-q2",
        type: "text",
        prompt: "Why is it hard for you to say no sometimes?",
      },
      {
        id: "lesson-59-q3",
        type: "text",
        prompt: "How can you say no kindly and firmly?",
      },
    ],
  },
  {
    id: "lesson-60",
    title: "The Strength of Gentleness",
    topic: "Gentleness",
    description: "Understand the quiet strength in being gentle.",
    questions: [
      {
        id: "lesson-60-q1",
        type: "text",
        prompt: "How do you usually respond to conflict or stress?",
      },
      {
        id: "lesson-60-q2",
        type: "text",
        prompt: "When has a gentle approach helped you more than force?",
      },
      {
        id: "lesson-60-q3",
        type: "text",
        prompt: "How can you bring more gentleness into your tone and actions?",
      },
    ],
  },
  {
    id: "lesson-61",
    title: "The Beauty of Consistency",
    topic: "Discipline",
    description: "Explore how small consistent actions shape your growth.",
    questions: [
      {
        id: "lesson-61-q1",
        type: "text",
        prompt: "What’s one habit you've stuck to recently?",
      },
      {
        id: "lesson-61-q2",
        type: "text",
        prompt: "What has consistency taught you about yourself?",
      },
      {
        id: "lesson-61-q3",
        type: "text",
        prompt: "Where do you want to become more consistent?",
      },
    ],
  },
  {
    id: "lesson-62",
    title: "Gratitude for the Body",
    topic: "Body Awareness",
    description:
      "Honor and appreciate your physical self as it carries you through life.",
    questions: [
      {
        id: "lesson-62-q1",
        type: "text",
        prompt: "What’s something your body allowed you to do today?",
      },
      {
        id: "lesson-62-q2",
        type: "text",
        prompt: "What part of your body are you most thankful for and why?",
      },
      {
        id: "lesson-62-q3",
        type: "text",
        prompt: "How can you care for your body more gently and intentionally?",
      },
    ],
  },
  {
    id: "lesson-63",
    title: "Redefining Productivity",
    topic: "Self-Worth",
    description:
      "Disconnect your worth from output and embrace meaningful progress.",
    questions: [
      {
        id: "lesson-63-q1",
        type: "text",
        prompt: "How do you define productivity in your life?",
      },
      {
        id: "lesson-63-q2",
        type: "text",
        prompt: "Have you ever felt unworthy when not being 'productive'?",
      },
      {
        id: "lesson-63-q3",
        type: "text",
        prompt:
          "What would it look like to measure success by presence instead of output?",
      },
    ],
  },
  {
    id: "lesson-64",
    title: "Being Present with Others",
    topic: "Relationships",
    description: "Reflect on the gift of presence in relationships.",
    questions: [
      {
        id: "lesson-64-q1",
        type: "text",
        prompt: "Who in your life needs more of your presence?",
      },
      {
        id: "lesson-64-q2",
        type: "text",
        prompt: "When have you felt deeply seen by someone?",
      },
      {
        id: "lesson-64-q3",
        type: "text",
        prompt: "How can you offer more presence in your interactions?",
      },
    ],
  },
  {
    id: "lesson-65",
    title: "Creating Sacred Space",
    topic: "Spirituality",
    description:
      "Invite stillness, reflection, or worship into your physical surroundings.",
    questions: [
      {
        id: "lesson-65-q1",
        type: "text",
        prompt: "Where do you feel most spiritually connected?",
      },
      {
        id: "lesson-65-q2",
        type: "text",
        prompt: "What objects or rituals make a space feel sacred to you?",
      },
      {
        id: "lesson-65-q3",
        type: "text",
        prompt:
          "How can you intentionally create space for spiritual practice?",
      },
    ],
  },
  {
    id: "lesson-66",
    title: "Reflecting on Role Models",
    topic: "Inspiration",
    description: "Learn from those who embody values you admire.",
    questions: [
      {
        id: "lesson-66-q1",
        type: "text",
        prompt: "Who inspires you deeply and why?",
      },
      {
        id: "lesson-66-q2",
        type: "text",
        prompt: "What specific qualities do they model for you?",
      },
      {
        id: "lesson-66-q3",
        type: "text",
        prompt: "How can you embody those qualities in your own way?",
      },
    ],
  },
  {
    id: "lesson-67",
    title: "The Power of Surrender",
    topic: "Trust",
    description: "Let go of control and find peace in surrender.",
    questions: [
      {
        id: "lesson-67-q1",
        type: "text",
        prompt: "What is something you’ve been trying to control lately?",
      },
      {
        id: "lesson-67-q2",
        type: "text",
        prompt: "What would it feel like to fully surrender that?",
      },
      {
        id: "lesson-67-q3",
        type: "text",
        prompt: "What helps you trust in outcomes beyond your control?",
      },
    ],
  },
  {
    id: "lesson-68",
    title: "Listening to Intuition",
    topic: "Self-Knowledge",
    description: "Trust the inner voice that knows what you need.",
    questions: [
      {
        id: "lesson-68-q1",
        type: "text",
        prompt: "When did your intuition lead you to something good?",
      },
      {
        id: "lesson-68-q2",
        type: "text",
        prompt: "What does intuition feel like in your body?",
      },
      {
        id: "lesson-68-q3",
        type: "text",
        prompt: "What decision do you need to trust yourself on right now?",
      },
    ],
  },
  {
    id: "lesson-69",
    title: "Being a Light for Others",
    topic: "Service",
    description:
      "Explore the impact of your words, actions, and presence on others.",
    questions: [
      {
        id: "lesson-69-q1",
        type: "text",
        prompt: "Who looks up to you, even if they don’t say it?",
      },
      {
        id: "lesson-69-q2",
        type: "text",
        prompt: "How have you positively impacted someone’s life before?",
      },
      {
        id: "lesson-69-q3",
        type: "text",
        prompt: "What kind of light do you want to shine into the world?",
      },
    ],
  },
  {
    id: "lesson-70",
    title: "Letting the Heart Speak",
    topic: "Emotional Honesty",
    description: "Connect with your emotional truth and express it with care.",
    questions: [
      {
        id: "lesson-70-q1",
        type: "text",
        prompt: "What’s something you’ve been holding in emotionally?",
      },
      {
        id: "lesson-70-q2",
        type: "text",
        prompt: "What would it feel like to let it out, gently and honestly?",
      },
      {
        id: "lesson-70-q3",
        type: "text",
        prompt: "How can you become more emotionally honest with others?",
      },
    ],
  },
  {
    id: "lesson-71",
    title: "Reconnecting with Nature",
    topic: "Nature",
    description:
      "Find healing, wonder, and peace through connection with the natural world.",
    questions: [
      {
        id: "lesson-71-q1",
        type: "text",
        prompt: "What’s your favorite memory in nature?",
      },
      {
        id: "lesson-71-q2",
        type: "text",
        prompt: "How does being in nature affect your mood or mindset?",
      },
      {
        id: "lesson-71-q3",
        type: "text",
        prompt: "How can you spend more intentional time outdoors this week?",
      },
    ],
  },
  {
    id: "lesson-72",
    title: "Living Your Values",
    topic: "Character",
    description:
      "Identify your values and examine how they influence your choices.",
    questions: [
      {
        id: "lesson-72-q1",
        type: "text",
        prompt: "What are three values you try to live by daily?",
      },
      {
        id: "lesson-72-q2",
        type: "text",
        prompt: "How do your values show up in your relationships or work?",
      },
      {
        id: "lesson-72-q3",
        type: "text",
        prompt: "What’s one area you want to live your values more fully?",
      },
    ],
  },
  {
    id: "lesson-73",
    title: "Freedom in Forgiveness",
    topic: "Forgiveness",
    description:
      "Let go of burdens that no longer serve you and invite peace in.",
    questions: [
      {
        id: "lesson-73-q1",
        type: "text",
        prompt: "Who have you struggled to forgive and why?",
      },
      {
        id: "lesson-73-q2",
        type: "text",
        prompt: "What is forgiveness teaching you about love or healing?",
      },
      {
        id: "lesson-73-q3",
        type: "text",
        prompt: "How would your life feel lighter with forgiveness?",
      },
    ],
  },
  {
    id: "lesson-74",
    title: "The Joy of Learning",
    topic: "Growth",
    description: "Celebrate the lifelong journey of learning and curiosity.",
    questions: [
      {
        id: "lesson-74-q1",
        type: "text",
        prompt: "What’s something new you learned recently?",
      },
      {
        id: "lesson-74-q2",
        type: "text",
        prompt: "What subject or skill excites you to explore more?",
      },
      {
        id: "lesson-74-q3",
        type: "text",
        prompt: "How has learning shaped your identity over time?",
      },
    ],
  },
  {
    id: "lesson-75",
    title: "Cultivating Contentment",
    topic: "Contentment",
    description: "Be at peace with what you have and who you are.",
    questions: [
      {
        id: "lesson-75-q1",
        type: "text",
        prompt: "What does contentment mean to you?",
      },
      {
        id: "lesson-75-q2",
        type: "text",
        prompt:
          "What area of your life do you already feel deeply satisfied with?",
      },
      {
        id: "lesson-75-q3",
        type: "text",
        prompt: "How can you practice more gratitude and acceptance?",
      },
    ],
  },
  {
    id: "lesson-76",
    title: "The Strength in Vulnerability",
    topic: "Vulnerability",
    description: "Explore the courage and connection that come from openness.",
    questions: [
      {
        id: "lesson-76-q1",
        type: "text",
        prompt:
          "What part of your story feels hard to share but healing to express?",
      },
      {
        id: "lesson-76-q2",
        type: "text",
        prompt: "When has someone’s vulnerability inspired you?",
      },
      {
        id: "lesson-76-q3",
        type: "text",
        prompt: "How can you be more open with those you trust?",
      },
    ],
  },
  {
    id: "lesson-77",
    title: "The Power of Reflection",
    topic: "Reflection",
    description:
      "Understand yourself more deeply by reviewing your experiences.",
    questions: [
      {
        id: "lesson-77-q1",
        type: "text",
        prompt: "What recent experience offered an important lesson?",
      },
      {
        id: "lesson-77-q2",
        type: "text",
        prompt: "How do you make time for reflection in your life?",
      },
      {
        id: "lesson-77-q3",
        type: "text",
        prompt: "What reflection are you avoiding that might offer clarity?",
      },
    ],
  },
  {
    id: "lesson-78",
    title: "Letting Go of Control",
    topic: "Surrender",
    description: "Recognize what is not yours to carry and release it.",
    questions: [
      {
        id: "lesson-78-q1",
        type: "text",
        prompt: "What are you currently trying to control?",
      },
      {
        id: "lesson-78-q2",
        type: "text",
        prompt: "How does holding on make you feel?",
      },
      {
        id: "lesson-78-q3",
        type: "text",
        prompt: "What would letting go look like in action?",
      },
    ],
  },
  {
    id: "lesson-79",
    title: "Meaningful Connections",
    topic: "Relationships",
    description: "Prioritize depth, presence, and honesty in your connections.",
    questions: [
      {
        id: "lesson-79-q1",
        type: "text",
        prompt: "Who in your life makes you feel truly known?",
      },
      {
        id: "lesson-79-q2",
        type: "text",
        prompt: "What do you most value in your close relationships?",
      },
      {
        id: "lesson-79-q3",
        type: "text",
        prompt: "What can you do to deepen a current relationship?",
      },
    ],
  },
  {
    id: "lesson-80",
    title: "Living with Purpose",
    topic: "Purpose",
    description: "Align your actions with what truly matters to you.",
    questions: [
      {
        id: "lesson-80-q1",
        type: "text",
        prompt: "What makes you feel most alive and fulfilled?",
      },
      {
        id: "lesson-80-q2",
        type: "text",
        prompt: "What causes or missions resonate with your soul?",
      },
      {
        id: "lesson-80-q3",
        type: "text",
        prompt:
          "What’s one small step you can take toward a more purposeful life?",
      },
    ],
  },
  {
    id: "lesson-81",
    title: "The Weight of Expectations",
    topic: "Freedom",
    description:
      "Explore how others’ expectations shape your choices and how to reclaim your path.",
    questions: [
      {
        id: "lesson-81-q1",
        type: "text",
        prompt: "What expectations do others place on you?",
      },
      {
        id: "lesson-81-q2",
        type: "text",
        prompt: "Which expectations truly align with your values?",
      },
      {
        id: "lesson-81-q3",
        type: "text",
        prompt: "How can you let go of the pressure to meet them all?",
      },
    ],
  },
  {
    id: "lesson-82",
    title: "Gratitude for the Journey",
    topic: "Gratitude",
    description: "Appreciate the path that led you to who you are now.",
    questions: [
      {
        id: "lesson-82-q1",
        type: "text",
        prompt: "What’s a past season of your life you’re thankful for?",
      },
      {
        id: "lesson-82-q2",
        type: "text",
        prompt: "What difficult experience are you now grateful for?",
      },
      {
        id: "lesson-82-q3",
        type: "text",
        prompt: "What lessons has your journey taught you?",
      },
    ],
  },
  {
    id: "lesson-83",
    title: "Holding Space for Others",
    topic: "Compassion",
    description: "Offer presence and support to those who need it most.",
    questions: [
      {
        id: "lesson-83-q1",
        type: "text",
        prompt: "Who in your life needs to be heard right now?",
      },
      {
        id: "lesson-83-q2",
        type: "text",
        prompt: "What does it mean to ‘hold space’ for someone?",
      },
      {
        id: "lesson-83-q3",
        type: "text",
        prompt: "How can you offer nonjudgmental presence this week?",
      },
    ],
  },
  {
    id: "lesson-84",
    title: "Welcoming Discomfort",
    topic: "Growth",
    description: "Step into discomfort as a catalyst for transformation.",
    questions: [
      {
        id: "lesson-84-q1",
        type: "text",
        prompt: "What discomfort are you currently avoiding?",
      },
      {
        id: "lesson-84-q2",
        type: "text",
        prompt: "What might that discomfort be trying to teach you?",
      },
      {
        id: "lesson-84-q3",
        type: "text",
        prompt: "What support would help you face it with courage?",
      },
    ],
  },
  {
    id: "lesson-85",
    title: "Embracing New Beginnings",
    topic: "Change",
    description: "Honor the excitement and vulnerability of starting anew.",
    questions: [
      {
        id: "lesson-85-q1",
        type: "text",
        prompt: "What new beginning are you experiencing or craving?",
      },
      {
        id: "lesson-85-q2",
        type: "text",
        prompt: "What makes it hard to fully embrace a new chapter?",
      },
      {
        id: "lesson-85-q3",
        type: "text",
        prompt: "What helps you transition with grace and hope?",
      },
    ],
  },
  {
    id: "lesson-86",
    title: "Tending to the Heart",
    topic: "Emotional Health",
    description: "Nourish your emotional well-being with care and honesty.",
    questions: [
      {
        id: "lesson-86-q1",
        type: "text",
        prompt: "What emotion has been asking for your attention?",
      },
      {
        id: "lesson-86-q2",
        type: "text",
        prompt: "How do you typically respond to emotional discomfort?",
      },
      {
        id: "lesson-86-q3",
        type: "text",
        prompt: "What does your heart need most today?",
      },
    ],
  },
  {
    id: "lesson-87",
    title: "Making Peace with the Past",
    topic: "Healing",
    description: "Release regrets and find closure through reflection.",
    questions: [
      {
        id: "lesson-87-q1",
        type: "text",
        prompt: "What part of your past do you still struggle with?",
      },
      {
        id: "lesson-87-q2",
        type: "text",
        prompt: "What forgiveness or closure might help you move forward?",
      },
      {
        id: "lesson-87-q3",
        type: "text",
        prompt: "What do you want to carry from the past with love?",
      },
    ],
  },
  {
    id: "lesson-88",
    title: "Showing Up Fully",
    topic: "Presence",
    description:
      "Commit to being fully present with life and those around you.",
    questions: [
      {
        id: "lesson-88-q1",
        type: "text",
        prompt: "When do you feel most present and alive?",
      },
      {
        id: "lesson-88-q2",
        type: "text",
        prompt: "What distractions pull you out of the moment?",
      },
      {
        id: "lesson-88-q3",
        type: "text",
        prompt: "How can you return to presence more often today?",
      },
    ],
  },
  {
    id: "lesson-89",
    title: "Letting Yourself Be Loved",
    topic: "Love",
    description:
      "Explore the experience of receiving love without fear or resistance.",
    questions: [
      {
        id: "lesson-89-q1",
        type: "text",
        prompt: "What’s one way you’ve blocked love from reaching you?",
      },
      {
        id: "lesson-89-q2",
        type: "text",
        prompt: "What fear comes up when you feel deeply seen or cared for?",
      },
      {
        id: "lesson-89-q3",
        type: "text",
        prompt: "How can you soften into being loved more fully?",
      },
    ],
  },
  {
    id: "lesson-90",
    title: "Slowing Down",
    topic: "Pace",
    description: "Move with intention rather than urgency.",
    questions: [
      {
        id: "lesson-90-q1",
        type: "text",
        prompt: "What makes you rush through life or your day?",
      },
      {
        id: "lesson-90-q2",
        type: "text",
        prompt: "What would slowing down give you more of?",
      },
      {
        id: "lesson-90-q3",
        type: "text",
        prompt: "What is one thing you can do slowly and mindfully today?",
      },
    ],
  },
  {
    id: "lesson-91",
    title: "The Practice of Appreciation",
    topic: "Gratitude",
    description: "Deepen your ability to notice and appreciate what is good.",
    questions: [
      {
        id: "lesson-91-q1",
        type: "text",
        prompt: "Who or what brought you joy today?",
      },
      {
        id: "lesson-91-q2",
        type: "text",
        prompt: "What small thing have you taken for granted recently?",
      },
      {
        id: "lesson-91-q3",
        type: "text",
        prompt: "How can you show appreciation more often?",
      },
    ],
  },
  {
    id: "lesson-92",
    title: "Courage in the Unknown",
    topic: "Courage",
    description: "Step bravely into uncertainty and trust your strength.",
    questions: [
      {
        id: "lesson-92-q1",
        type: "text",
        prompt: "What unknown are you currently facing?",
      },
      {
        id: "lesson-92-q2",
        type: "text",
        prompt: "What would courage look like right now?",
      },
      {
        id: "lesson-92-q3",
        type: "text",
        prompt: "What can you learn by moving forward despite fear?",
      },
    ],
  },
  {
    id: "lesson-93",
    title: "The Art of Listening to Yourself",
    topic: "Self-Awareness",
    description: "Tune into your inner voice and align with your needs.",
    questions: [
      {
        id: "lesson-93-q1",
        type: "text",
        prompt: "What is your inner voice saying today?",
      },
      {
        id: "lesson-93-q2",
        type: "text",
        prompt: "What need have you been ignoring?",
      },
      {
        id: "lesson-93-q3",
        type: "text",
        prompt: "How can you honor your feelings and instincts?",
      },
    ],
  },
  {
    id: "lesson-94",
    title: "Reclaiming Your Energy",
    topic: "Self-Care",
    description: "Identify where your energy goes and how to restore it.",
    questions: [
      {
        id: "lesson-94-q1",
        type: "text",
        prompt: "What drains your energy most right now?",
      },
      {
        id: "lesson-94-q2",
        type: "text",
        prompt: "What helps you recharge fully?",
      },
      {
        id: "lesson-94-q3",
        type: "text",
        prompt: "Where do you need to redirect your energy this week?",
      },
    ],
  },
  {
    id: "lesson-95",
    title: "Building Trust in Relationships",
    topic: "Relationships",
    description: "Reflect on what makes trust strong and lasting.",
    questions: [
      {
        id: "lesson-95-q1",
        type: "text",
        prompt: "Who do you trust deeply and why?",
      },
      {
        id: "lesson-95-q2",
        type: "text",
        prompt: "What breaks trust in your experience?",
      },
      {
        id: "lesson-95-q3",
        type: "text",
        prompt: "How can you strengthen trust in your key relationships?",
      },
    ],
  },
  {
    id: "lesson-96",
    title: "Peace in the Present Moment",
    topic: "Mindfulness",
    description: "Anchor yourself in the now and discover serenity.",
    questions: [
      {
        id: "lesson-96-q1",
        type: "text",
        prompt: "What are three things you can feel or hear right now?",
      },
      {
        id: "lesson-96-q2",
        type: "text",
        prompt: "What thoughts are pulling you away from the present?",
      },
      {
        id: "lesson-96-q3",
        type: "text",
        prompt: "What helps you return to the now?",
      },
    ],
  },
  {
    id: "lesson-97",
    title: "Letting Go of Guilt",
    topic: "Healing",
    description: "Release guilt and open to self-forgiveness and growth.",
    questions: [
      {
        id: "lesson-97-q1",
        type: "text",
        prompt: "What guilt are you carrying right now?",
      },
      {
        id: "lesson-97-q2",
        type: "text",
        prompt: "Is this guilt helping or harming your growth?",
      },
      {
        id: "lesson-97-q3",
        type: "text",
        prompt: "What would it feel like to fully forgive yourself?",
      },
    ],
  },
  {
    id: "lesson-98",
    title: "The Beauty of Simplicity",
    topic: "Simplicity",
    description: "Clear the clutter to focus on what matters most.",
    questions: [
      {
        id: "lesson-98-q1",
        type: "text",
        prompt: "What area of your life feels overly complicated?",
      },
      {
        id: "lesson-98-q2",
        type: "text",
        prompt: "What would simplifying that area look like?",
      },
      {
        id: "lesson-98-q3",
        type: "text",
        prompt: "How does simplicity make you feel emotionally and mentally?",
      },
    ],
  },
  {
    id: "lesson-99",
    title: "The Gift of Rest",
    topic: "Rest",
    description: "Honor rest as a form of nourishment and wisdom.",
    questions: [
      {
        id: "lesson-99-q1",
        type: "text",
        prompt: "What is your relationship with rest right now?",
      },
      {
        id: "lesson-99-q2",
        type: "text",
        prompt: "What kind of rest does your body or soul crave?",
      },
      {
        id: "lesson-99-q3",
        type: "text",
        prompt: "How can you make more time and space for rest this week?",
      },
    ],
  },
  {
    id: "lesson-100",
    title: "You’ve Come So Far",
    topic: "Celebration",
    description: "Celebrate your growth and honor your continued journey.",
    questions: [
      {
        id: "lesson-100-q1",
        type: "text",
        prompt: "What have you accomplished or overcome recently?",
      },
      {
        id: "lesson-100-q2",
        type: "text",
        prompt: "What strengths helped you get here?",
      },
      {
        id: "lesson-100-q3",
        type: "text",
        prompt: "How can you honor and celebrate your growth today?",
      },
    ],
  },
];

export default function LibraryPage() {
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const { logoutMutation } = useAuth();
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  //Removed lengthFilter state

  // Get today's featured lesson
  const featuredLessonIndex = Math.floor(new Date().setHours(0,0,0,0) / 86400000) % SAMPLE_LESSONS.length;
  const featuredLesson = SAMPLE_LESSONS[featuredLessonIndex];
  
  // Get remaining lessons and shuffle them
  const remainingLessons = SAMPLE_LESSONS.filter((_, i) => i !== featuredLessonIndex)
    .sort(() => Math.random() - 0.5);
    
  const filteredLessons = [...remainingLessons].filter((lesson) => {
    const searchTerm = searchQuery.toLowerCase();
    const titleMatch = lesson.title.toLowerCase().includes(searchTerm);
    const topicMatch = lesson.topic.toLowerCase().includes(searchTerm);
    //Removed lengthMatch condition
    return titleMatch || topicMatch;
  });

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Entries", href: "/entries", icon: PenSquare },
    { name: "Library", href: "/library", icon: BookOpen },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const handleLessonComplete = (answers: Record<string, any>) => {
    const entry = {
      title: selectedLesson.title,
      content: Object.entries(answers)
        .map(([key, value]) => {
          const question = selectedLesson.questions.find(
            (q: any) => q.id === key,
          );
          return `${question.prompt}\n${value}`;
        })
        .join("\n\n"),
      mood: "neutral",
      category: selectedLesson.topic,
    };

    console.log("New entry:", entry);
    setSelectedLesson(null);
  };

  return (
    <div className="flex min-h-screen bg-background pb-16 lg:pb-0">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col gap-4 w-64 p-4 border-r">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold px-4">Eunoia</h1>
          <p className="text-sm text-muted-foreground px-4">Your Insights</p>
        </div>

        <nav className="flex flex-col gap-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-2 ${
                    isActive
                      ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                      : ""
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </nav>

        <Button
          variant="ghost"
          className="mt-auto w-full justify-start gap-2"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 lg:p-8">
        <div className="container mx-auto">
          {!selectedLesson ? (
            <>
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Guided Journaling</h1>
                <p className="text-muted-foreground">
                  {/* Featured Lesson */}
  <div className="mb-8">
    <h2 className="text-2xl font-semibold mb-4">Today's Featured Lesson</h2>
    <div className="bg-white/5 backdrop-blur border border-white/20 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-semibold">
          {SAMPLE_LESSONS[Math.floor(new Date().setHours(0,0,0,0) / 86400000) % SAMPLE_LESSONS.length].title}
        </h3>
      </div>
      <p className="text-muted-foreground mb-4">
        {SAMPLE_LESSONS[Math.floor(new Date().setHours(0,0,0,0) / 86400000) % SAMPLE_LESSONS.length].description}
      </p>
      <Button variant="outline" asChild>
        <Link href={`/lesson/${SAMPLE_LESSONS[Math.floor(new Date().setHours(0,0,0,0) / 86400000) % SAMPLE_LESSONS.length].id}`}>
          Start Reflection
        </Link>
      </Button>
    </div>
  </div>

  <h2 className="text-2xl font-semibold mb-4">All Lessons</h2>
  Choose a lesson below to begin your reflection journey
                </p>
                <div className="flex gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by topic or title..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  {/*Removed DropdownMenu*/}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLessons.map((lesson) => (
                  <Card
                    key={lesson.id}
                    className="p-6 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => setSelectedLesson(lesson)}
                  >
                    <Sparkles className="h-8 w-8 mb-4 text-primary" />
                    <h3 className="text-xl font-semibold mb-2">
                      {lesson.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {lesson.description}
                    </p>
                    <div className="text-sm text-primary">
                      {lesson.questions.length} prompts •{" "}
                      {lesson.questions.length * 2} min
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="max-w-2xl mx-auto">
              <Button
                variant="ghost"
                onClick={() => setSelectedLesson(null)}
                className="mb-4"
              >
                ← Back to Lessons
              </Button>
              <GuidedLesson
                {...selectedLesson}
                onComplete={handleLessonComplete}
                onClose={() => setSelectedLesson(null)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background lg:hidden">
        <nav className="flex justify-around p-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`flex flex-col items-center gap-1 h-auto py-2 ${
                    isActive
                      ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                      : ""
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-xs">{item.name}</span>
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
