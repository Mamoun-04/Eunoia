import { useAuth } from "@/hooks/use-auth";
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
} from "lucide-react";
import { Link, useLocation } from "wouter";

const SAMPLE_LESSONS = [
  {
    id: "gratitude",
    title: "Daily Gratitude Practice",
    topic: "Gratitude",
    description: "Reflect on the blessings in your life and cultivate thankfulness.",
    questions: [
      {
        id: "grateful-moment",
        type: "text",
        prompt: "What is one specific moment from today that you're grateful for?"
      },
      {
        id: "gratitude-level",
        type: "slider",
        prompt: "How grateful do you feel right now?"
      },
      {
        id: "gratitude-impact",
        type: "multipleChoice",
        prompt: "How has gratitude impacted your day?",
        options: [
          "It's transformed my perspective",
          "I feel more content",
          "I notice small blessings more",
          "I'm still learning to be grateful"
        ]
      }
    ]
  },
  {
    id: "mindfulness",
    title: "Present Moment Awareness",
    topic: "Mindfulness",
    description: "Connect with the present moment and find peace in stillness.",
    questions: [
      {
        id: "current-feelings",
        type: "text",
        prompt: "What sensations and emotions are you experiencing right now?"
      },
      {
        id: "presence-level",
        type: "slider",
        prompt: "How present do you feel in this moment?"
      },
      {
        id: "mindfulness-practice",
        type: "multipleChoice",
        prompt: "What helps you stay present?",
        options: [
          "Breathing exercises",
          "Physical sensations",
          "Observing thoughts",
          "Connection with nature"
        ]
      }
    ]
  },
  // Additional 100 meaningful lessons
  {
    id: "lesson-1",
    title: "Trust in God Reflection Practice",
    topic: "Trust in God",
    description: "Engage with the theme of Trust in God through deep, thoughtful prompts designed to guide your inner growth.",
    questions: [
      {
        id: "trust-text-1",
        type: "text",
        prompt: "Describe a recent experience where you deeply relied on your faith during challenging times."
      },
      {
        id: "trust-slider-1",
        type: "slider",
        prompt: "On a scale of 1-10, how strongly did you feel supported by your faith today?"
      },
      {
        id: "trust-mc-1",
        type: "multipleChoice",
        prompt: "Which moment best reflects your trust in God today?",
        options: [
          "A quiet moment of prayer",
          "Overcoming a difficult obstacle",
          "Receiving unexpected help",
          "A renewed sense of inner peace"
        ]
      }
    ]
  },
  {
    id: "lesson-2",
    title: "Forgiveness Reflection Practice",
    topic: "Forgiveness",
    description: "Reflect on forgiveness and learn to let go of grudges to embrace peace.",
    questions: [
      {
        id: "forgiveness-text-2",
        type: "text",
        prompt: "Write about a time today when you chose to forgive someone or yourself."
      },
      {
        id: "forgiveness-slider-2",
        type: "slider",
        prompt: "On a scale of 1-10, how heavy do you feel the burden of unforgiveness today?"
      },
      {
        id: "forgiveness-mc-2",
        type: "multipleChoice",
        prompt: "Which action best represents the act of forgiveness for you today?",
        options: [
          "Letting go of a minor hurt",
          "Apologizing sincerely",
          "Choosing to move on",
          "Offering compassion"
        ]
      }
    ]
  },
  {
    id: "lesson-3",
    title: "Patience and Persistence Reflection Practice",
    topic: "Patience",
    description: "Explore the value of patience in everyday challenges and learn how persistence can lead to growth.",
    questions: [
      {
        id: "patience-text-3",
        type: "text",
        prompt: "Recall a moment today where practicing patience made a difference."
      },
      {
        id: "patience-slider-3",
        type: "slider",
        prompt: "Rate your level of patience throughout your day (1-10)."
      },
      {
        id: "patience-mc-3",
        type: "multipleChoice",
        prompt: "Which of these best describes your approach to handling delays or obstacles?",
        options: [
          "Remaining calm and composed",
          "Learning from the experience",
          "Feeling a bit stressed but managing",
          "Struggling to maintain patience"
        ]
      }
    ]
  },
  {
    id: "lesson-4",
    title: "Compassion and Empathy Reflection Practice",
    topic: "Compassion",
    description: "Reflect on moments of compassion, both given and received, to deepen your understanding of empathy.",
    questions: [
      {
        id: "compassion-text-4",
        type: "text",
        prompt: "Share a recent experience where you felt a deep sense of compassion."
      },
      {
        id: "compassion-slider-4",
        type: "slider",
        prompt: "How strongly did you feel empathy in that moment? (1-10)"
      },
      {
        id: "compassion-mc-4",
        type: "multipleChoice",
        prompt: "Which action best represents compassion for you today?",
        options: [
          "Listening without judgment",
          "Offering a helping hand",
          "Expressing understanding",
          "Supporting someone in need"
        ]
      }
    ]
  },
  {
    id: "lesson-5",
    title: "Self-Awareness and Growth Reflection Practice",
    topic: "Self-Awareness",
    description: "Dive deep into your inner self to explore thoughts, behaviors, and emotions that shape who you are.",
    questions: [
      {
        id: "self-awareness-text-5",
        type: "text",
        prompt: "Reflect on a moment today where you became acutely aware of your emotions or actions."
      },
      {
        id: "self-awareness-slider-5",
        type: "slider",
        prompt: "On a scale of 1-10, how in tune were you with your inner self today?"
      },
      {
        id: "self-awareness-mc-5",
        type: "multipleChoice",
        prompt: "Which of the following best describes your journey of self-awareness today?",
        options: [
          "Discovering new insights about myself",
          "Reflecting on past behaviors",
          "Feeling uncertain but curious",
          "Gaining clarity on my emotions"
        ]
      }
    ]
  },
  {
    id: "lesson-6",
    title: "Intentional Living Reflection Practice",
    topic: "Intentional Living",
    description: "Examine how your actions align with your values and intentions, and learn to live deliberately.",
    questions: [
      {
        id: "intentional-text-6",
        type: "text",
        prompt: "Describe a decision you made today that was driven by intention rather than impulse."
      },
      {
        id: "intentional-slider-6",
        type: "slider",
        prompt: "How deliberate were your choices today on a scale from 1-10?"
      },
      {
        id: "intentional-mc-6",
        type: "multipleChoice",
        prompt: "Which best captures your approach to intentional living today?",
        options: [
          "Every action felt purposeful",
          "I tried to be deliberate in key moments",
          "Some decisions were more mindful than others",
          "I mostly acted on impulse"
        ]
      }
    ]
  },
  {
    id: "lesson-7",
    title: "Contentment Reflection Practice",
    topic: "Contentment",
    description: "Reflect on moments of satisfaction and acceptance, celebrating the peace found in contentment.",
    questions: [
      {
        id: "contentment-text-7",
        type: "text",
        prompt: "What is one thing that brought you a sense of contentment today?"
      },
      {
        id: "contentment-slider-7",
        type: "slider",
        prompt: "On a scale of 1-10, how content did you feel overall today?"
      },
      {
        id: "contentment-mc-7",
        type: "multipleChoice",
        prompt: "Which statement best represents your feeling of contentment today?",
        options: [
          "I felt complete and at peace",
          "I experienced moments of satisfaction",
          "I was searching for more fulfillment",
          "I felt a sense of longing"
        ]
      }
    ]
  },
  {
    id: "lesson-8",
    title: "Spiritual Growth Reflection Practice",
    topic: "Spiritual Growth",
    description: "Reflect on your spiritual journey and the ways in which you have grown and evolved.",
    questions: [
      {
        id: "spiritual-text-8",
        type: "text",
        prompt: "How have you experienced spiritual growth in your life recently?"
      },
      {
        id: "spiritual-slider-8",
        type: "slider",
        prompt: "Rate your sense of spiritual growth today on a scale of 1-10."
      },
      {
        id: "spiritual-mc-8",
        type: "multipleChoice",
        prompt: "Which aspect of your spiritual journey stood out most today?",
        options: [
          "Deep personal insight",
          "Connection with a higher power",
          "Learning through challenges",
          "Moments of quiet reflection"
        ]
      }
    ]
  },
  {
    id: "lesson-9",
    title: "Purpose and Direction Reflection Practice",
    topic: "Purpose",
    description: "Contemplate your life's purpose and the direction you're heading towards in your journey.",
    questions: [
      {
        id: "purpose-text-9",
        type: "text",
        prompt: "What was one moment today that made you feel aligned with your life's purpose?"
      },
      {
        id: "purpose-slider-9",
        type: "slider",
        prompt: "On a scale from 1-10, how clear was your sense of purpose today?"
      },
      {
        id: "purpose-mc-9",
        type: "multipleChoice",
        prompt: "Which of these best reflects your pursuit of purpose today?",
        options: [
          "I took definitive steps towards my goals",
          "I reflected deeply on my passions",
          "I felt inspired but uncertain",
          "I am still searching for direction"
        ]
      }
    ]
  },
  {
    id: "lesson-10",
    title: "Letting Go Reflection Practice",
    topic: "Letting Go",
    description: "Explore the theme of letting go of past hurts, expectations, and attachments.",
    questions: [
      {
        id: "lettinggo-text-10",
        type: "text",
        prompt: "Write about something you decided to let go of today."
      },
      {
        id: "lettinggo-slider-10",
        type: "slider",
        prompt: "Rate the emotional weight of what you released today (1-10)."
      },
      {
        id: "lettinggo-mc-10",
        type: "multipleChoice",
        prompt: "Which action best symbolizes letting go for you today?",
        options: [
          "Releasing negative thoughts",
          "Forgiving someone or yourself",
          "Making a conscious decision to move on",
          "Embracing change"
        ]
      }
    ]
  },
  {
    id: "lesson-11",
    title: "Mercy Reflection Practice",
    topic: "Mercy",
    description: "Reflect on the concept of mercy—both giving and receiving it—and how it influences your relationships.",
    questions: [
      {
        id: "mercy-text-11",
        type: "text",
        prompt: "Describe a moment today where you felt or expressed mercy."
      },
      {
        id: "mercy-slider-11",
        type: "slider",
        prompt: "On a scale from 1-10, how merciful did you feel?"
      },
      {
        id: "mercy-mc-11",
        type: "multipleChoice",
        prompt: "Which of the following best represents mercy in your experience today?",
        options: [
          "Offering forgiveness",
          "Showing compassion",
          "Understanding without judgment",
          "Extending kindness"
        ]
      }
    ]
  },
  {
    id: "lesson-12",
    title: "Discipline Reflection Practice",
    topic: "Discipline",
    description: "Consider how self-discipline shapes your actions and choices, leading to personal growth.",
    questions: [
      {
        id: "discipline-text-12",
        type: "text",
        prompt: "Reflect on a moment today when you practiced self-discipline."
      },
      {
        id: "discipline-slider-12",
        type: "slider",
        prompt: "On a scale from 1-10, how disciplined did you feel today?"
      },
      {
        id: "discipline-mc-12",
        type: "multipleChoice",
        prompt: "Which of these best captures your approach to discipline today?",
        options: [
          "Staying focused on my goals",
          "Making conscious, healthy choices",
          "Struggling but persisting",
          "Needing more structure"
        ]
      }
    ]
  },
  {
    id: "lesson-13",
    title: "Hope and Resilience Reflection Practice",
    topic: "Hope",
    description: "Reflect on how hope fuels your resilience and helps you navigate life's challenges.",
    questions: [
      {
        id: "hope-text-13",
        type: "text",
        prompt: "Share a moment today when hope helped you overcome a challenge."
      },
      {
        id: "hope-slider-13",
        type: "slider",
        prompt: "Rate your level of hopefulness today on a scale of 1-10."
      },
      {
        id: "hope-mc-13",
        type: "multipleChoice",
        prompt: "Which option best describes how hope influenced your actions today?",
        options: [
          "I felt empowered and optimistic",
          "I relied on hope to keep going",
          "I had moments of doubt, but hope prevailed",
          "I struggled to find hope"
        ]
      }
    ]
  },
  {
    id: "lesson-14",
    title: "Sincerity Reflection Practice",
    topic: "Sincerity",
    description: "Explore your authenticity and the ways in which sincerity plays a role in your interactions.",
    questions: [
      {
        id: "sincerity-text-14",
        type: "text",
        prompt: "Reflect on a situation today where being sincere made a difference."
      },
      {
        id: "sincerity-slider-14",
        type: "slider",
        prompt: "On a scale of 1-10, how genuine did you feel in your interactions today?"
      },
      {
        id: "sincerity-mc-14",
        type: "multipleChoice",
        prompt: "Which statement best reflects your sense of sincerity today?",
        options: [
          "I was completely open and honest",
          "I tried to be sincere despite challenges",
          "I held back a bit but remained genuine",
          "I struggled with authenticity"
        ]
      }
    ]
  },
  {
    id: "lesson-15",
    title: "Tawakkul Reflection Practice",
    topic: "Tawakkul",
    description: "Reflect on your trust and reliance on a higher power, letting go of the need to control every outcome.",
    questions: [
      {
        id: "tawakkul-text-15",
        type: "text",
        prompt: "Describe a moment today where you surrendered control and trusted the process."
      },
      {
        id: "tawakkul-slider-15",
        type: "slider",
        prompt: "On a scale of 1-10, how much did you rely on divine guidance today?"
      },
      {
        id: "tawakkul-mc-15",
        type: "multipleChoice",
        prompt: "Which of the following best describes your experience of tawakkul today?",
        options: [
          "I felt completely at peace with uncertainty",
          "I leaned into my faith during challenges",
          "I had moments of doubt but mostly trusted the process",
          "I struggled to let go of control"
        ]
      }
    ]
  },
  {
    id: "lesson-16",
    title: "Empathy Reflection Practice",
    topic: "Empathy",
    description: "Reflect on your ability to understand and share the feelings of others.",
    questions: [
      {
        id: "empathy-text-16",
        type: "text",
        prompt: "Share an experience today where you deeply connected with someone else's feelings."
      },
      {
        id: "empathy-slider-16",
        type: "slider",
        prompt: "How strongly did you feel empathy today on a scale of 1-10?"
      },
      {
        id: "empathy-mc-16",
        type: "multipleChoice",
        prompt: "Which option best reflects your experience of empathy today?",
        options: [
          "I felt a strong connection and understanding",
          "I empathized but kept some distance",
          "I observed and learned from others' emotions",
          "I struggled to connect emotionally"
        ]
      }
    ]
  },
  {
    id: "lesson-17",
    title: "Reflection and Insight Practice",
    topic: "Reflection",
    description: "Dive into a reflective practice that encourages deep insight into your daily experiences.",
    questions: [
      {
        id: "reflection-text-17",
        type: "text",
        prompt: "What moment today prompted deep reflection about your personal growth?"
      },
      {
        id: "reflection-slider-17",
        type: "slider",
        prompt: "On a scale of 1-10, how profound was your reflection today?"
      },
      {
        id: "reflection-mc-17",
        type: "multipleChoice",
        prompt: "Which of these best describes your reflective process today?",
        options: [
          "I connected dots and gained clarity",
          "I explored my emotions deeply",
          "I had fleeting moments of insight",
          "I struggled to find depth in reflection"
        ]
      }
    ]
  },
  {
    id: "lesson-18",
    title: "Renewal Reflection Practice",
    topic: "Renewal",
    description: "Reflect on the idea of renewal, personal rejuvenation, and the start of new beginnings.",
    questions: [
      {
        id: "renewal-text-18",
        type: "text",
        prompt: "Write about a recent experience that felt like a fresh start or a renewal of energy."
      },
      {
        id: "renewal-slider-18",
        type: "slider",
        prompt: "Rate your sense of renewal today on a scale of 1-10."
      },
      {
        id: "renewal-mc-18",
        type: "multipleChoice",
        prompt: "Which statement best captures your feeling of renewal today?",
        options: [
          "I feel rejuvenated and ready for new challenges",
          "I experienced moments of refreshment",
          "I felt a subtle but positive change",
          "I am still in need of renewal"
        ]
      }
    ]
  },
  {
    id: "lesson-19",
    title: "Balance Reflection Practice",
    topic: "Balance",
    description: "Reflect on how you maintain equilibrium in your life and manage competing priorities.",
    questions: [
      {
        id: "balance-text-19",
        type: "text",
        prompt: "Describe a moment today where you found balance amidst chaos."
      },
      {
        id: "balance-slider-19",
        type: "slider",
        prompt: "On a scale of 1-10, how balanced did you feel today?"
      },
      {
        id: "balance-mc-19",
        type: "multipleChoice",
        prompt: "Which option best describes your experience of balance today?",
        options: [
          "I felt centered and calm",
          "I managed my time well",
          "I struggled with too many demands",
          "I am working towards more balance"
        ]
      }
    ]
  },
  {
    id: "lesson-20",
    title: "Honesty Reflection Practice",
    topic: "Honesty",
    description: "Reflect on moments of truthfulness and the importance of honesty in your daily life.",
    questions: [
      {
        id: "honesty-text-20",
        type: "text",
        prompt: "Recall a moment today when being honest, even if difficult, made a difference."
      },
      {
        id: "honesty-slider-20",
        type: "slider",
        prompt: "On a scale of 1-10, how honest did you feel in your interactions today?"
      },
      {
        id: "honesty-mc-20",
        type: "multipleChoice",
        prompt: "Which best represents your experience with honesty today?",
        options: [
          "I was fully transparent",
          "I struggled but managed to be truthful",
          "I held back in some situations",
          "I wish I had been more honest"
        ]
      }
    ]
  },
  {
    id: "lesson-21",
    title: "Boundaries Reflection Practice",
    topic: "Boundaries",
    description: "Reflect on your personal boundaries and how maintaining them has shaped your interactions today.",
    questions: [
      {
        id: "boundaries-text-21",
        type: "text",
        prompt: "Describe a situation today where setting a boundary was important for your well-being."
      },
      {
        id: "boundaries-slider-21",
        type: "slider",
        prompt: "Rate your confidence in setting boundaries today on a scale of 1-10."
      },
      {
        id: "boundaries-mc-21",
        type: "multipleChoice",
        prompt: "Which action best represents your approach to boundaries today?",
        options: [
          "Clearly communicated my needs",
          "Held firm in challenging situations",
          "Felt uncertain about my limits",
          "Struggled to assert myself"
        ]
      }
    ]
  },
  {
    id: "lesson-22",
    title: "Time Management Reflection Practice",
    topic: "Time Management",
    description: "Reflect on how you managed your time today and identify opportunities for improved balance.",
    questions: [
      {
        id: "time-text-22",
        type: "text",
        prompt: "What strategy did you use today to manage your time effectively?"
      },
      {
        id: "time-slider-22",
        type: "slider",
        prompt: "On a scale of 1-10, how effective was your time management today?"
      },
      {
        id: "time-mc-22",
        type: "multipleChoice",
        prompt: "Which of these best describes your approach to time management?",
        options: [
          "I planned my day thoroughly",
          "I adapted to changes seamlessly",
          "I felt rushed and unorganized",
          "I struggled to find time for myself"
        ]
      }
    ]
  },
  {
    id: "lesson-23",
    title: "Service and Generosity Reflection Practice",
    topic: "Service",
    description: "Reflect on acts of service and generosity, and how giving impacts your day.",
    questions: [
      {
        id: "service-text-23",
        type: "text",
        prompt: "Share a moment today where you extended a helping hand to someone in need."
      },
      {
        id: "service-slider-23",
        type: "slider",
        prompt: "Rate your sense of generosity today on a scale of 1-10."
      },
      {
        id: "service-mc-23",
        type: "multipleChoice",
        prompt: "Which action best represents service for you today?",
        options: [
          "Offering assistance willingly",
          "Taking time to listen",
          "Supporting without expecting anything in return",
          "Feeling fulfilled by giving"
        ]
      }
    ]
  },
  {
    id: "lesson-24",
    title: "Resilience Reflection Practice",
    topic: "Resilience",
    description: "Reflect on your ability to bounce back from setbacks and face challenges head-on.",
    questions: [
      {
        id: "resilience-text-24",
        type: "text",
        prompt: "Describe a challenging situation today and how you overcame it."
      },
      {
        id: "resilience-slider-24",
        type: "slider",
        prompt: "On a scale of 1-10, how resilient did you feel in the face of adversity?"
      },
      {
        id: "resilience-mc-24",
        type: "multipleChoice",
        prompt: "Which of the following best describes your resilience today?",
        options: [
          "I bounced back quickly",
          "I learned valuable lessons from setbacks",
          "I felt overwhelmed but persevered",
          "I struggled to recover"
        ]
      }
    ]
  },
  {
    id: "lesson-25",
    title: "Self-Compassion Reflection Practice",
    topic: "Self-Compassion",
    description: "Reflect on the importance of being kind to yourself and treating yourself with compassion.",
    questions: [
      {
        id: "selfcompassion-text-25",
        type: "text",
        prompt: "Write about a moment today when you practiced self-compassion."
      },
      {
        id: "selfcompassion-slider-25",
        type: "slider",
        prompt: "On a scale of 1-10, how compassionate were you towards yourself today?"
      },
      {
        id: "selfcompassion-mc-25",
        type: "multipleChoice",
        prompt: "Which of these actions best represents self-compassion for you today?",
        options: [
          "Taking time to care for myself",
          "Forgiving my mistakes",
          "Giving myself credit for my efforts",
          "Struggling to be kind to myself"
        ]
      }
    ]
  },
  {
    id: "lesson-26",
    title: "Mindfulness in Action Reflection Practice",
    topic: "Mindfulness",
    description: "Extend your mindfulness practice into everyday actions and reflect on the impact.",
    questions: [
      {
        id: "mindfulness-action-text-26",
        type: "text",
        prompt: "Describe an action you took today that was a deliberate act of mindfulness."
      },
      {
        id: "mindfulness-action-slider-26",
        type: "slider",
        prompt: "On a scale of 1-10, how intentional was your mindful action?"
      },
      {
        id: "mindfulness-action-mc-26",
        type: "multipleChoice",
        prompt: "Which best reflects your experience of mindful action today?",
        options: [
          "I felt fully present in my actions",
          "I was somewhat aware of my choices",
          "I acted out of habit with little mindfulness",
          "I need to focus more on being present"
        ]
      }
    ]
  },
  {
    id: "lesson-27",
    title: "Clarity and Vision Reflection Practice",
    topic: "Vision",
    description: "Reflect on your personal vision and the clarity with which you see your future.",
    questions: [
      {
        id: "vision-text-27",
        type: "text",
        prompt: "What is one clear vision or goal that inspired you today?"
      },
      {
        id: "vision-slider-27",
        type: "slider",
        prompt: "Rate the clarity of your vision today on a scale of 1-10."
      },
      {
        id: "vision-mc-27",
        type: "multipleChoice",
        prompt: "Which statement best captures your vision today?",
        options: [
          "I have a clear and defined goal",
          "My vision is emerging slowly",
          "I have multiple ideas but no focus",
          "I am still exploring my purpose"
        ]
      }
    ]
  },
  {
    id: "lesson-28",
    title: "Inner Peace Reflection Practice",
    topic: "Inner Peace",
    description: "Reflect on moments where you experienced inner calm and a sense of serenity.",
    questions: [
      {
        id: "innerpeace-text-28",
        type: "text",
        prompt: "Describe a moment today when you felt a deep sense of inner peace."
      },
      {
        id: "innerpeace-slider-28",
        type: "slider",
        prompt: "On a scale of 1-10, how peaceful did you feel overall today?"
      },
      {
        id: "innerpeace-mc-28",
        type: "multipleChoice",
        prompt: "Which best reflects your experience of inner peace today?",
        options: [
          "I was calm and centered",
          "I found peace in small moments",
          "I struggled to maintain calm",
          "I am seeking more serenity"
        ]
      }
    ]
  },
  {
    id: "lesson-29",
    title: "Courage and Bravery Reflection Practice",
    topic: "Courage",
    description: "Reflect on the courage it takes to face fears and overcome challenges.",
    questions: [
      {
        id: "courage-text-29",
        type: "text",
        prompt: "Share a moment today when you acted courageously, even if it was small."
      },
      {
        id: "courage-slider-29",
        type: "slider",
        prompt: "On a scale of 1-10, how brave did you feel today?"
      },
      {
        id: "courage-mc-29",
        type: "multipleChoice",
        prompt: "Which option best describes your courageous act today?",
        options: [
          "Facing a difficult task head-on",
          "Speaking up for myself or others",
          "Taking a risk despite fear",
          "Overcoming a personal limitation"
        ]
      }
    ]
  },
  {
    id: "lesson-30",
    title: "Self-Care Reflection Practice",
    topic: "Self-Care",
    description: "Reflect on the ways you nurtured and cared for yourself today.",
    questions: [
      {
        id: "selfcare-text-30",
        type: "text",
        prompt: "What self-care activity made a positive impact on your day?"
      },
      {
        id: "selfcare-slider-30",
        type: "slider",
        prompt: "Rate your overall sense of well-being today on a scale of 1-10."
      },
      {
        id: "selfcare-mc-30",
        type: "multipleChoice",
        prompt: "Which action best represents your commitment to self-care today?",
        options: [
          "Taking time to rest and recharge",
          "Setting aside moments for relaxation",
          "Engaging in a favorite hobby",
          "Neglecting self-care due to busyness"
        ]
      }
    ]
  },
  {
    id: "lesson-31",
    title: "Joy and Celebration Reflection Practice",
    topic: "Joy",
    description: "Reflect on the moments of joy and celebration that brightened your day.",
    questions: [
      {
        id: "joy-text-31",
        type: "text",
        prompt: "What moment today filled you with genuine joy?"
      },
      {
        id: "joy-slider-31",
        type: "slider",
        prompt: "On a scale of 1-10, how joyful did you feel overall?"
      },
      {
        id: "joy-mc-31",
        type: "multipleChoice",
        prompt: "Which of these best represents how you experienced joy today?",
        options: [
          "I laughed heartily",
          "I shared a special moment with someone",
          "I found beauty in the everyday",
          "I felt a quiet, enduring joy"
        ]
      }
    ]
  },
  {
    id: "lesson-32",
    title: "Gratitude Expansion Reflection Practice",
    topic: "Gratitude",
    description: "Build on your gratitude practice by reflecting on deeper layers of thankfulness.",
    questions: [
      {
        id: "gratitude-expansion-text-32",
        type: "text",
        prompt: "How did expanding your gratitude change your perspective today?"
      },
      {
        id: "gratitude-expansion-slider-32",
        type: "slider",
        prompt: "On a scale of 1-10, how transformative was your gratitude practice today?"
      },
      {
        id: "gratitude-expansion-mc-32",
        type: "multipleChoice",
        prompt: "Which of these statements best describes your experience with gratitude today?",
        options: [
          "I discovered new blessings",
          "I felt my gratitude deepen",
          "I realized the impact of small moments",
          "I struggled to expand my gratitude"
        ]
      }
    ]
  },
  {
    id: "lesson-33",
    title: "Mindfulness Deep Dive Reflection Practice",
    topic: "Mindfulness",
    description: "Go beyond the surface to deeply explore your mindfulness and presence.",
    questions: [
      {
        id: "mindfulness-deep-text-33",
        type: "text",
        prompt: "Describe an instance today where you felt truly immersed in the present moment."
      },
      {
        id: "mindfulness-deep-slider-33",
        type: "slider",
        prompt: "On a scale of 1-10, how deeply did you experience mindfulness today?"
      },
      {
        id: "mindfulness-deep-mc-33",
        type: "multipleChoice",
        prompt: "Which of the following best describes your deep mindfulness experience today?",
        options: [
          "I was completely absorbed in the moment",
          "I had brief moments of deep presence",
          "I struggled to maintain deep focus",
          "I am working towards a deeper practice"
        ]
      }
    ]
  },
  {
    id: "lesson-34",
    title: "Compassionate Self-Reflection Practice",
    topic: "Compassion",
    description: "Reflect on your capacity for compassion, both towards yourself and others, in deeper ways.",
    questions: [
      {
        id: "compassionate-text-34",
        type: "text",
        prompt: "Share a moment today when you extended compassion towards yourself."
      },
      {
        id: "compassionate-slider-34",
        type: "slider",
        prompt: "On a scale of 1-10, how compassionate were you towards yourself today?"
      },
      {
        id: "compassionate-mc-34",
        type: "multipleChoice",
        prompt: "Which best describes your act of self-compassion today?",
        options: [
          "I treated myself with kindness",
          "I forgave my own mistakes",
          "I acknowledged my struggles gently",
          "I found it challenging to be compassionate"
        ]
      }
    ]
  },
  {
    id: "lesson-35",
    title: "Optimism and Positive Thinking Reflection Practice",
    topic: "Optimism",
    description: "Reflect on your ability to maintain a positive outlook and find optimism in everyday situations.",
    questions: [
      {
        id: "optimism-text-35",
        type: "text",
        prompt: "What positive thought or moment helped you stay optimistic today?"
      },
      {
        id: "optimism-slider-35",
        type: "slider",
        prompt: "On a scale of 1-10, how optimistic did you feel overall today?"
      },
      {
        id: "optimism-mc-35",
        type: "multipleChoice",
        prompt: "Which option best reflects your experience of optimism today?",
        options: [
          "I maintained a bright outlook",
          "I found hope in small victories",
          "I had moments of doubt but recovered",
          "I struggled to see the positive side"
        ]
      }
    ]
  },
  {
    id: "lesson-36",
    title: "Mindful Movement Reflection Practice",
    topic: "Mindfulness",
    description: "Reflect on the integration of physical movement and mindfulness to nurture your well-being.",
    questions: [
      {
        id: "mindful-movement-text-36",
        type: "text",
        prompt: "Describe a mindful movement or exercise that grounded you today."
      },
      {
        id: "mindful-movement-slider-36",
        type: "slider",
        prompt: "On a scale of 1-10, how connected did you feel to your body during this activity?"
      },
      {
        id: "mindful-movement-mc-36",
        type: "multipleChoice",
        prompt: "Which of these best describes your experience with mindful movement today?",
        options: [
          "I felt fully in tune with my body",
          "I was moderately aware of my movements",
          "I struggled to maintain mindfulness during activity",
          "I am looking to improve my body awareness"
        ]
      }
    ]
  },
  {
    id: "lesson-37",
    title: "Inner Strength Reflection Practice",
    topic: "Strength",
    description: "Reflect on the inner strength that helps you overcome challenges and face adversity.",
    questions: [
      {
        id: "innerstrength-text-37",
        type: "text",
        prompt: "Share an experience today where you tapped into your inner strength."
      },
      {
        id: "innerstrength-slider-37",
        type: "slider",
        prompt: "On a scale of 1-10, how strong did you feel in your core today?"
      },
      {
        id: "innerstrength-mc-37",
        type: "multipleChoice",
        prompt: "Which best represents your inner strength today?",
        options: [
          "I felt resilient in adversity",
          "I maintained determination",
          "I struggled but kept pushing forward",
          "I am working on building my strength"
        ]
      }
    ]
  },
  {
    id: "lesson-38",
    title: "Creativity and Expression Reflection Practice",
    topic: "Creativity",
    description: "Reflect on your creative expressions and how they help you process emotions and ideas.",
    questions: [
      {
        id: "creativity-text-38",
        type: "text",
        prompt: "What creative activity or idea sparked your interest today?"
      },
      {
        id: "creativity-slider-38",
        type: "slider",
        prompt: "On a scale of 1-10, how inspired did you feel creatively today?"
      },
      {
        id: "creativity-mc-38",
        type: "multipleChoice",
        prompt: "Which option best describes your creative expression today?",
        options: [
          "I felt deeply inspired",
          "I expressed my creativity in small ways",
          "I struggled to find creative energy",
          "I am eager to explore my creative side further"
        ]
      }
    ]
  },
  {
    id: "lesson-39",
    title: "Mind-Body Connection Reflection Practice",
    topic: "Mind-Body",
    description: "Reflect on the connection between your mind and body, and how they support your well-being.",
    questions: [
      {
        id: "mindbody-text-39",
        type: "text",
        prompt: "Describe a moment today where you felt a strong connection between your mind and body."
      },
      {
        id: "mindbody-slider-39",
        type: "slider",
        prompt: "On a scale of 1-10, how connected did you feel today?"
      },
      {
        id: "mindbody-mc-39",
        type: "multipleChoice",
        prompt: "Which of these options best captures your mind-body experience today?",
        options: [
          "I felt harmoniously connected",
          "I sensed a mild connection",
          "I struggled to feel in sync",
          "I am working to strengthen this connection"
        ]
      }
    ]
  },
  {
    id: "lesson-40",
    title: "Gratitude in Relationships Reflection Practice",
    topic: "Gratitude",
    description: "Reflect on how gratitude enhances your relationships and interactions with others.",
    questions: [
      {
        id: "gratitude-rel-text-40",
        type: "text",
        prompt: "Share a moment today where expressing gratitude improved a relationship."
      },
      {
        id: "gratitude-rel-slider-40",
        type: "slider",
        prompt: "On a scale of 1-10, how meaningful was that moment for you?"
      },
      {
        id: "gratitude-rel-mc-40",
        type: "multipleChoice",
        prompt: "Which of these best describes your experience of gratitude in relationships today?",
        options: [
          "I felt deeply connected through gratitude",
          "I acknowledged small gestures of kindness",
          "I am still learning to express gratitude in relationships",
          "I struggled to see its impact"
        ]
      }
    ]
  },
  {
    id: "lesson-41",
    title: "Mindfulness and Stress Reduction Reflection Practice",
    topic: "Mindfulness",
    description: "Reflect on how mindfulness practices helped you manage stress and find calm.",
    questions: [
      {
        id: "stress-text-41",
        type: "text",
        prompt: "Describe a stressful moment today and how you managed it mindfully."
      },
      {
        id: "stress-slider-41",
        type: "slider",
        prompt: "On a scale of 1-10, how effectively did you manage your stress today?"
      },
      {
        id: "stress-mc-41",
        type: "multipleChoice",
        prompt: "Which of these approaches best helped you reduce stress today?",
        options: [
          "Mindful breathing or meditation",
          "Taking a short break",
          "Reframing my thoughts",
          "Seeking support"
        ]
      }
    ]
  },
  {
    id: "lesson-42",
    title: "Inner Joy Reflection Practice",
    topic: "Joy",
    description: "Reflect on the inner joy that comes from embracing life and its experiences.",
    questions: [
      {
        id: "innerjoy-text-42",
        type: "text",
        prompt: "What small moment of inner joy did you experience today?"
      },
      {
        id: "innerjoy-slider-42",
        type: "slider",
        prompt: "On a scale of 1-10, how joyful did you feel inside today?"
      },
      {
        id: "innerjoy-mc-42",
        type: "multipleChoice",
        prompt: "Which of these best captures your inner joy today?",
        options: [
          "I felt a warm glow of happiness",
          "I smiled often despite challenges",
          "I found joy in small moments",
          "I am seeking more inner fulfillment"
        ]
      }
    ]
  },
  {
    id: "lesson-43",
    title: "Resilience Through Adversity Reflection Practice",
    topic: "Resilience",
    description: "Reflect on how you find strength and resilience in the face of adversity.",
    questions: [
      {
        id: "resilience-adversity-text-43",
        type: "text",
        prompt: "Write about a difficult moment today and how you found the strength to overcome it."
      },
      {
        id: "resilience-adversity-slider-43",
        type: "slider",
        prompt: "On a scale of 1-10, how strong was your resilience during that time?"
      },
      {
        id: "resilience-adversity-mc-43",
        type: "multipleChoice",
        prompt: "Which option best describes your approach to handling adversity today?",
        options: [
          "I leaned on my inner strength",
          "I sought support and guidance",
          "I faced challenges with a positive mindset",
          "I struggled to overcome the obstacles"
        ]
      }
    ]
  },
  {
    id: "lesson-44",
    title: "Self-Reflection and Insight Expansion Practice",
    topic: "Reflection",
    description: "Deepen your self-reflection to gain greater insight into your emotions and behaviors.",
    questions: [
      {
        id: "selfinsight-text-44",
        type: "text",
        prompt: "Describe an experience today that led to a profound insight about yourself."
      },
      {
        id: "selfinsight-slider-44",
        type: "slider",
        prompt: "On a scale of 1-10, how significant was the insight you gained?"
      },
      {
        id: "selfinsight-mc-44",
        type: "multipleChoice",
        prompt: "Which statement best captures your self-reflection today?",
        options: [
          "I gained a clear understanding of my patterns",
          "I realized new aspects of my personality",
          "I had fleeting moments of self-awareness",
          "I am still trying to understand my emotions"
        ]
      }
    ]
  },
  {
    id: "lesson-45",
    title: "Purposeful Action Reflection Practice",
    topic: "Purpose",
    description: "Reflect on actions taken with a sense of purpose and the impact they had on your day.",
    questions: [
      {
        id: "purposefulaction-text-45",
        type: "text",
        prompt: "Share an action you took today that was driven by a strong sense of purpose."
      },
      {
        id: "purposefulaction-slider-45",
        type: "slider",
        prompt: "Rate your sense of purposeful action on a scale of 1-10."
      },
      {
        id: "purposefulaction-mc-45",
        type: "multipleChoice",
        prompt: "Which option best describes how purposeful you felt today?",
        options: [
          "Every action felt intentional",
          "I had moments of clarity and purpose",
          "I acted on impulse sometimes",
          "I am seeking a clearer direction"
        ]
      }
    ]
  },
  {
    id: "lesson-46",
    title: "Gratitude for Challenges Reflection Practice",
    topic: "Gratitude",
    description: "Reflect on how challenges can offer unexpected lessons and gratitude.",
    questions: [
      {
        id: "gratitudechallenges-text-46",
        type: "text",
        prompt: "Describe a challenging situation today and the lesson it brought."
      },
      {
        id: "gratitudechallenges-slider-46",
        type: "slider",
        prompt: "On a scale of 1-10, how grateful were you for the lessons learned from the challenge?"
      },
      {
        id: "gratitudechallenges-mc-46",
        type: "multipleChoice",
        prompt: "Which statement best reflects your gratitude towards challenges today?",
        options: [
          "I embraced the lesson wholeheartedly",
          "I learned something valuable despite the difficulty",
          "I found it hard to see the positive side",
          "I am working to appreciate challenges more"
        ]
      }
    ]
  },
  {
    id: "lesson-47",
    title: "Inner Wisdom Reflection Practice",
    topic: "Wisdom",
    description: "Reflect on the wisdom that comes from introspection and life experiences.",
    questions: [
      {
        id: "innerwisdom-text-47",
        type: "text",
        prompt: "Share a moment today when you felt guided by your inner wisdom."
      },
      {
        id: "innerwisdom-slider-47",
        type: "slider",
        prompt: "On a scale of 1-10, how much did you trust your inner wisdom today?"
      },
      {
        id: "innerwisdom-mc-47",
        type: "multipleChoice",
        prompt: "Which option best captures your connection to inner wisdom today?",
        options: [
          "I felt deeply guided",
          "I relied on past experiences",
          "I was uncertain but listened inwardly",
          "I am still seeking clarity"
        ]
      }
    ]
  },
  {
    id: "lesson-48",
    title: "Mindful Reflection on Relationships Practice",
    topic: "Relationships",
    description: "Reflect on the quality and depth of your relationships and the role of mindfulness within them.",
    questions: [
      {
        id: "relationships-text-48",
        type: "text",
        prompt: "Describe an interaction today where mindfulness enhanced your relationship."
      },
      {
        id: "relationships-slider-48",
        type: "slider",
        prompt: "On a scale of 1-10, how meaningful was the interaction?"
      },
      {
        id: "relationships-mc-48",
        type: "multipleChoice",
        prompt: "Which option best represents the quality of your relationship interaction today?",
        options: [
          "I connected deeply with others",
          "I appreciated small gestures of kindness",
          "I struggled to be fully present",
          "I am working to improve my relationships"
        ]
      }
    ]
  },
  {
    id: "lesson-49",
    title: "Mindful Consumption Reflection Practice",
    topic: "Mindfulness",
    description: "Reflect on how your consumption habits (media, food, etc.) affect your state of mind.",
    questions: [
      {
        id: "consumption-text-49",
        type: "text",
        prompt: "What mindful choices did you make today regarding what you consumed?"
      },
      {
        id: "consumption-slider-49",
        type: "slider",
        prompt: "On a scale of 1-10, how mindful were your consumption choices today?"
      },
      {
        id: "consumption-mc-49",
        type: "multipleChoice",
        prompt: "Which option best reflects your approach to mindful consumption?",
        options: [
          "I chose wisely and with intention",
          "I balanced indulgence with mindfulness",
          "I struggled with overconsumption",
          "I am learning to be more mindful"
        ]
      }
    ]
  },
  {
    id: "lesson-50",
    title: "Spiritual Connection Reflection Practice",
    topic: "Spiritual Growth",
    description: "Reflect on moments where you felt a deep connection to your spirituality or higher power.",
    questions: [
      {
        id: "spiritualconnection-text-50",
        type: "text",
        prompt: "Describe a moment today when you felt deeply connected to your spiritual beliefs."
      },
      {
        id: "spiritualconnection-slider-50",
        type: "slider",
        prompt: "On a scale of 1-10, how profound was your spiritual connection today?"
      },
      {
        id: "spiritualconnection-mc-50",
        type: "multipleChoice",
        prompt: "Which statement best reflects your spiritual connection today?",
        options: [
          "I felt a clear presence of something greater",
          "I experienced subtle spiritual insights",
          "I struggled to connect spiritually",
          "I am seeking to deepen my spiritual bond"
        ]
      }
    ]
  },
export default function LibraryPage() {
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const { logoutMutation } = useAuth();
  const [location] = useLocation();

  const navigation = [
    { name: "Today", href: "/", icon: CalendarDays },
    { name: "Entries", href: "/entries", icon: PenSquare },
    { name: "Library", href: "/library", icon: BookOpen },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const handleLessonComplete = (answers: Record<string, any>) => {
    const entry = {
      title: selectedLesson.title,
      content: Object.entries(answers)
        .map(([key, value]) => {
          const question = selectedLesson.questions.find((q: any) => q.id === key);
          return `${question.prompt}\n${value}`;
        })
        .join('\n\n'),
      mood: "neutral",
      category: selectedLesson.topic
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
                  Choose a lesson below to begin your reflection journey
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SAMPLE_LESSONS.map((lesson) => (
                  <Card
                    key={lesson.id}
                    className="p-6 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => setSelectedLesson(lesson)}
                  >
                    <Sparkles className="h-8 w-8 mb-4 text-primary" />
                    <h3 className="text-xl font-semibold mb-2">{lesson.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{lesson.description}</p>
                    <div className="text-sm text-primary">{lesson.questions.length} prompts • 5 min</div>
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