export interface WellnessExercise {
  id: string;
  title: string;
  category: 'Mindfulness' | 'Cognitive' | 'Breathing' | 'Action';
  duration: string;
  description: string;
}

export interface Quote {
  text: string;
  author: string;
}

export interface AnalysisResult {
  sentiment: {
    score: number; // -1 to 1
    label: string;
  };
  emotions: {
    label: string;
    confidence: number;
  }[];
  distortions: string[];
  riskLevels: {
    label: string;
    level: 'low' | 'medium' | 'high' | 'critical';
    score: number;
  }[];
  crisisPrediction: {
    detected: boolean;
    reason?: string;
  };
  explanation: string;
}

export interface JournalEntry {
  id: string;
  content: string;
  timestamp: string;
  analysis?: AnalysisResult;
  feedback?: boolean;
}

export interface Therapist {
  id: string;
  name: string;
  specialties: string[];
  matchScore: number;
  avatar: string;
}
