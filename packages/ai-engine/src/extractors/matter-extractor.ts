import { ClaudeClient } from '../client.js';
import { EXTRACT_MATTER_DATA } from '../prompts/index.js';
import { ExtractedMatterData } from '../types.js';

export async function extractMatterData(
  client: ClaudeClient,
  documentContent: string,
): Promise<ExtractedMatterData> {
  const result = await client.completeJson<ExtractedMatterData>(
    EXTRACT_MATTER_DATA,
    `Please analyze the following document and extract the matter data:\n\n${documentContent}`,
  );

  // Ensure required arrays exist
  return {
    ...result,
    counterparties: result.counterparties || [],
    practiceAreas: result.practiceAreas || [],
    keyDates: result.keyDates || [],
    teamMembers: result.teamMembers || [],
  };
}
