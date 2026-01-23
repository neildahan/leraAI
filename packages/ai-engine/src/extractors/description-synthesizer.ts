import { ClaudeClient } from '../client.js';
import { SYNTHESIZE_DESCRIPTION } from '../prompts/index.js';
import { ExtractedMatterData, SynthesizedDescription } from '../types.js';

export async function synthesizeDescription(
  client: ClaudeClient,
  matterData: ExtractedMatterData,
  modelUsed: string = 'claude-sonnet-4-20250514',
): Promise<SynthesizedDescription> {
  const prompt = `Generate a directory submission description based on the following matter data:

Client: ${matterData.clientName || 'Not specified'}
Counterparties: ${matterData.counterparties.join(', ') || 'Not specified'}
Deal Value: ${matterData.dealValue ? `${matterData.dealValue.currency} ${matterData.dealValue.amount.toLocaleString()}${matterData.dealValue.isEstimated ? ' (estimated)' : ''}` : 'Not specified'}
Practice Areas: ${matterData.practiceAreas.join(', ') || 'Not specified'}
Legal Novelty: ${matterData.legalNovelty || 'Not specified'}
Key Dates: ${matterData.keyDates.map((d) => `${d.event}: ${d.date}`).join(', ') || 'Not specified'}
Lead Partner: ${matterData.leadPartner || 'Not specified'}
Team: ${matterData.teamMembers.join(', ') || 'Not specified'}`;

  const result = await client.completeJson<Omit<SynthesizedDescription, 'generatedAt' | 'modelUsed' | 'tokensUsed'>>(
    SYNTHESIZE_DESCRIPTION,
    prompt,
  );

  return {
    ...result,
    generatedAt: new Date(),
    modelUsed,
    tokensUsed: 0, // Would be tracked from API response in production
  };
}
