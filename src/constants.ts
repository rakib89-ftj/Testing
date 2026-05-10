import { WellnessExercise, Quote, AnalysisResult } from './types';

export const EXERCISES: WellnessExercise[] = [
  {
    id: '1',
    title: '4-7-8 Breathing',
    category: 'Breathing',
    duration: '2 min',
    description: 'Inhale for 4s, hold for 7s, exhale for 8s to calm the nervous system.'
  },
  {
    id: '2',
    title: 'Cognitive Reframing',
    category: 'Cognitive',
    duration: '5 min',
    description: 'Identify a negative thought and find three pieces of evidence that contradict it.'
  },
  {
    id: '3',
    title: 'Five Senses Grounding',
    category: 'Mindfulness',
    duration: '3 min',
    description: 'Notice 5 things you see, 4 you touch, 3 you hear, 2 you smell, and 1 you taste.'
  },
  {
    id: '4',
    title: 'Micro-Action',
    category: 'Action',
    duration: '1 min',
    description: 'Complete one small task you have been putting off to build momentum.'
  }
];

export const QUOTES: Quote[] = [
  { text: "Your present circumstances don't determine where you can go; they merely determine where you start.", author: "Nido Qubein" },
  { text: "You don't have to control your thoughts; you just have to stop letting them control you.", author: "Dan Millman" },
  { text: "Healing takes time, and asking for help is a sign of strength, not weakness.", author: "Anonymous" }
];

export const MOCK_ANALYSIS: AnalysisResult = {
  sentiment: { score: -0.4, label: "Slightly Negative" },
  emotions: [
    { label: "Anxiety", confidence: 0.8 },
    { label: "Frustration", confidence: 0.5 },
    { label: "Sadness", confidence: 0.3 }
  ],
  distortions: ["Catastrophizing", "Personalization"],
  riskLevels: [
    { label: "Depression", level: 'low', score: 20 },
    { label: "Stress", level: 'medium', score: 55 },
    { label: "Burnout", level: 'high', score: 78 }
  ],
  crisisPrediction: { detected: false },
  explanation: "The user is expressing significant work-related stress and catastrophic thinking regarding their performance."
};
