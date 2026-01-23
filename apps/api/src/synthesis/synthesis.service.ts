import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MattersService } from '../matters/matters.service';

export interface ExtractionResult {
  clientName?: string;
  counterparties?: string[];
  dealValue?: {
    amount: number;
    currency: string;
    isEstimated: boolean;
  };
  practiceAreas?: string[];
  keyDates?: { event: string; date: string }[];
  legalNovelty?: string;
}

export interface SynthesisResult {
  description: string;
  keyAchievements: string[];
  legalNovelty: string;
  practiceAreas: string[];
  generatedAt: Date;
  modelUsed: string;
}

export interface ScoreResult {
  submissionScore: number;
  confidenceScore: number;
  factors: {
    dealSize: number;
    complexity: number;
    novelty: number;
    firmProfile: number;
  };
  recommendation: 'highly_recommended' | 'recommended' | 'consider' | 'not_recommended';
}

@Injectable()
export class SynthesisService {
  private readonly logger = new Logger(SynthesisService.name);
  private readonly apiKey: string;
  private readonly model: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly mattersService: MattersService,
  ) {
    this.apiKey = this.configService.get<string>('ANTHROPIC_API_KEY', '');
    this.model = this.configService.get<string>('ANTHROPIC_MODEL', 'claude-sonnet-4-20250514');
  }

  async extractFromDocument(documentContent: string): Promise<ExtractionResult> {
    // This would call the ai-engine package in production
    // For now, return a mock result
    this.logger.log('Extracting data from document');

    if (!this.apiKey) {
      this.logger.warn('No Anthropic API key configured, returning mock data');
      return this.getMockExtractionResult();
    }

    // TODO: Integrate with @lera-ai/ai-engine package
    return this.getMockExtractionResult();
  }

  async generateDescription(
    matterId: string,
    extractedData: ExtractionResult,
  ): Promise<SynthesisResult> {
    this.logger.log(`Generating description for matter ${matterId}`);

    if (!this.apiKey) {
      this.logger.warn('No Anthropic API key configured, returning mock data');
      return this.getMockSynthesisResult();
    }

    // TODO: Integrate with @lera-ai/ai-engine package
    const result = this.getMockSynthesisResult();

    // Update matter with synthesized data
    await this.mattersService.updateSynthesizedData(matterId, result, 85);

    return result;
  }

  async scoreMatter(matterId: string): Promise<ScoreResult> {
    this.logger.log(`Scoring matter ${matterId} for submission potential`);

    const matter = await this.mattersService.findById(matterId);

    // Calculate scores based on matter data
    const factors = {
      dealSize: this.calculateDealSizeScore(matter.dealValue?.amount),
      complexity: this.calculateComplexityScore(matter.counterparties?.length || 0),
      novelty: 70, // Would be determined by AI
      firmProfile: 80, // Based on client and practice area
    };

    const submissionScore = Math.round(
      factors.dealSize * 0.3 +
        factors.complexity * 0.2 +
        factors.novelty * 0.3 +
        factors.firmProfile * 0.2,
    );

    return {
      submissionScore,
      confidenceScore: 85,
      factors,
      recommendation: this.getRecommendation(submissionScore),
    };
  }

  private calculateDealSizeScore(amount?: number): number {
    if (!amount) return 50;
    if (amount >= 1000000000) return 100; // $1B+
    if (amount >= 500000000) return 90; // $500M+
    if (amount >= 100000000) return 80; // $100M+
    if (amount >= 50000000) return 70; // $50M+
    if (amount >= 10000000) return 60; // $10M+
    return 50;
  }

  private calculateComplexityScore(counterpartyCount: number): number {
    if (counterpartyCount >= 5) return 100;
    if (counterpartyCount >= 3) return 80;
    if (counterpartyCount >= 2) return 60;
    return 40;
  }

  private getRecommendation(
    score: number,
  ): 'highly_recommended' | 'recommended' | 'consider' | 'not_recommended' {
    if (score >= 85) return 'highly_recommended';
    if (score >= 70) return 'recommended';
    if (score >= 50) return 'consider';
    return 'not_recommended';
  }

  private getMockExtractionResult(): ExtractionResult {
    return {
      clientName: 'Acme Corporation',
      counterparties: ['Beta Industries', 'Gamma Holdings'],
      dealValue: {
        amount: 150000000,
        currency: 'USD',
        isEstimated: false,
      },
      practiceAreas: ['M&A', 'Corporate Finance', 'Due Diligence'],
      keyDates: [
        { event: 'Signing', date: '2024-01-15' },
        { event: 'Closing', date: '2024-03-01' },
      ],
      legalNovelty: 'Cross-border regulatory approval process',
    };
  }

  private getMockSynthesisResult(): SynthesisResult {
    return {
      description:
        'Advised Acme Corporation on its $150 million acquisition of Beta Industries, a leading provider of industrial automation solutions. The transaction involved complex cross-border regulatory considerations and required coordination with multiple jurisdictions.',
      keyAchievements: [
        'Successfully navigated multi-jurisdictional regulatory approval process',
        'Structured innovative earnout provisions to bridge valuation gap',
        'Completed due diligence across 5 jurisdictions within accelerated timeline',
      ],
      legalNovelty: 'First-of-its-kind regulatory approach for cross-border industrial automation M&A',
      practiceAreas: ['M&A', 'Corporate Finance', 'Regulatory', 'Due Diligence'],
      generatedAt: new Date(),
      modelUsed: this.model,
    };
  }
}
