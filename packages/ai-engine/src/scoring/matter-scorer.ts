import { ClaudeClient } from '../client.js';
import { RANK_POTENTIAL } from '../prompts/index.js';
import { ExtractedMatterData, MatterScore } from '../types.js';

export async function scoreMatter(
  client: ClaudeClient,
  matterData: ExtractedMatterData,
): Promise<MatterScore> {
  const prompt = `Evaluate the following matter for directory submission potential:

Client: ${matterData.clientName || 'Not specified'}
Counterparties: ${matterData.counterparties.join(', ') || 'None specified'}
Deal Value: ${matterData.dealValue ? `${matterData.dealValue.currency} ${matterData.dealValue.amount.toLocaleString()}` : 'Not disclosed'}
Practice Areas: ${matterData.practiceAreas.join(', ') || 'Not specified'}
Legal Novelty: ${matterData.legalNovelty || 'Not specified'}
Number of Key Milestones: ${matterData.keyDates.length}
Team Size: ${matterData.teamMembers.length + (matterData.leadPartner ? 1 : 0)}`;

  return client.completeJson<MatterScore>(RANK_POTENTIAL, prompt);
}

// Fallback scoring without AI (for when API is unavailable)
export function scoreMatterLocal(matterData: ExtractedMatterData): MatterScore {
  const dealSizeScore = calculateDealSizeScore(matterData.dealValue?.amount);
  const complexityScore = calculateComplexityScore(matterData);
  const noveltyScore = matterData.legalNovelty ? 70 : 40;
  const firmProfileScore = matterData.practiceAreas.length >= 2 ? 75 : 50;

  const submissionScore = Math.round(
    dealSizeScore * 0.3 +
    complexityScore * 0.2 +
    noveltyScore * 0.3 +
    firmProfileScore * 0.2,
  );

  return {
    submissionScore,
    confidenceScore: 60, // Lower confidence for local scoring
    factors: {
      dealSize: dealSizeScore,
      complexity: complexityScore,
      novelty: noveltyScore,
      firmProfile: firmProfileScore,
    },
    recommendation: getRecommendation(submissionScore),
    reasoning: 'Scored using local heuristics. Consider AI scoring for more accurate assessment.',
  };
}

function calculateDealSizeScore(amount?: number): number {
  if (!amount) return 40;
  if (amount >= 1_000_000_000) return 100;
  if (amount >= 500_000_000) return 90;
  if (amount >= 100_000_000) return 80;
  if (amount >= 50_000_000) return 70;
  if (amount >= 10_000_000) return 60;
  return 50;
}

function calculateComplexityScore(data: ExtractedMatterData): number {
  let score = 40;
  score += Math.min(data.counterparties.length * 10, 30);
  score += Math.min(data.practiceAreas.length * 5, 15);
  score += Math.min(data.keyDates.length * 3, 15);
  return Math.min(score, 100);
}

function getRecommendation(score: number): MatterScore['recommendation'] {
  if (score >= 85) return 'highly_recommended';
  if (score >= 70) return 'recommended';
  if (score >= 50) return 'consider';
  return 'not_recommended';
}
