export interface ExtractedMatterData {
  clientName?: string;
  counterparties: string[];
  dealValue?: {
    amount: number;
    currency: string;
    isEstimated: boolean;
  };
  practiceAreas: string[];
  keyDates: Array<{ event: string; date: string }>;
  legalNovelty?: string;
  leadPartner?: string;
  teamMembers: string[];
}

export interface SynthesizedDescription {
  description: string;
  keyAchievements: string[];
  legalNovelty: string;
  practiceAreas: string[];
  generatedAt: Date;
  modelUsed: string;
  tokensUsed: number;
}

export interface MatterScore {
  submissionScore: number;
  confidenceScore: number;
  factors: {
    dealSize: number;
    complexity: number;
    novelty: number;
    firmProfile: number;
  };
  recommendation: 'highly_recommended' | 'recommended' | 'consider' | 'not_recommended';
  reasoning: string;
}

export interface ClaudeClientOptions {
  apiKey: string;
  model?: string;
  maxTokens?: number;
}

export interface StreamCallbacks {
  onToken?: (token: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

// Directory-specific types

export interface ChambersHighlight {
  matterHighlight: string;
  keyPoints: string[];
  technicalComplexity: string;
  clientImpact: string;
  marketSignificance: string;
  recommendedBand: string;
}

export interface Legal500Highlight {
  workHighlight: string;
  significance: string;
  innovation: string;
  clientRelationship: string;
  outcome: string;
  recommendedTier: string;
}

export interface Duns100Highlight {
  matterDescription: string;
  israeliMarketRelevance: string;
  dealSignificance: string;
  crossBorderElement: string;
  sectorImpact: string;
  recommendedRating: string;
}

export interface FirmOverview {
  overview: string;
  strengths: string[];
  marketPosition: string;
  differentiators: string;
  keyAchievements: string[];
  clientProfile: string;
}

export interface DepartmentOverview {
  overview: string;
  scope: string;
  notableMatters: string[];
  teamHighlights: string;
  specializations: string[];
  marketLeadership: string;
}

export interface LawyerProfile {
  profile: string;
  expertise: string[];
  highlightMatters: string[];
  leadershipRoles: string[];
  distinguishingFactors: string;
  recommendedCategory: string;
}

export interface RefereeTalkingPoints {
  keyTalkingPoints: string[];
  specificExamples: string[];
  serviceHighlights: string[];
  challengesOvercome: string;
  suggestedPhrases: string[];
}
