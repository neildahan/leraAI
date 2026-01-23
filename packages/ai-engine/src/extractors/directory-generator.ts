import { ClaudeClient } from '../client.js';
import {
  CHAMBERS_SUBMISSION_PROMPT,
  LEGAL_500_SUBMISSION_PROMPT,
  DUNS_100_SUBMISSION_PROMPT,
  FIRM_OVERVIEW_PROMPT,
  DEPARTMENT_OVERVIEW_PROMPT,
  LAWYER_PROFILE_PROMPT,
  REFEREE_TALKING_POINTS_PROMPT,
} from '../prompts/index.js';
import {
  ExtractedMatterData,
  ChambersHighlight,
  Legal500Highlight,
  Duns100Highlight,
  FirmOverview,
  DepartmentOverview,
  LawyerProfile,
  RefereeTalkingPoints,
} from '../types.js';

export type DirectoryType = 'chambers' | 'legal_500' | 'duns_100';

// Generate matter highlight for Chambers
export async function generateChambersHighlight(
  client: ClaudeClient,
  matterData: ExtractedMatterData,
  additionalContext?: string,
): Promise<ChambersHighlight> {
  const prompt = formatMatterDataForPrompt(matterData, additionalContext);
  return client.completeJson<ChambersHighlight>(CHAMBERS_SUBMISSION_PROMPT, prompt);
}

// Generate matter highlight for Legal 500
export async function generateLegal500Highlight(
  client: ClaudeClient,
  matterData: ExtractedMatterData,
  additionalContext?: string,
): Promise<Legal500Highlight> {
  const prompt = formatMatterDataForPrompt(matterData, additionalContext);
  return client.completeJson<Legal500Highlight>(LEGAL_500_SUBMISSION_PROMPT, prompt);
}

// Generate matter highlight for Dun's 100
export async function generateDuns100Highlight(
  client: ClaudeClient,
  matterData: ExtractedMatterData,
  additionalContext?: string,
): Promise<Duns100Highlight> {
  const prompt = formatMatterDataForPrompt(matterData, additionalContext);
  return client.completeJson<Duns100Highlight>(DUNS_100_SUBMISSION_PROMPT, prompt);
}

// Generate highlight for any directory
export async function generateDirectoryHighlight(
  client: ClaudeClient,
  directoryType: DirectoryType,
  matterData: ExtractedMatterData,
  additionalContext?: string,
): Promise<ChambersHighlight | Legal500Highlight | Duns100Highlight> {
  switch (directoryType) {
    case 'chambers':
      return generateChambersHighlight(client, matterData, additionalContext);
    case 'legal_500':
      return generateLegal500Highlight(client, matterData, additionalContext);
    case 'duns_100':
      return generateDuns100Highlight(client, matterData, additionalContext);
    default:
      throw new Error(`Unknown directory type: ${directoryType}`);
  }
}

// Generate firm overview
export async function generateFirmOverview(
  client: ClaudeClient,
  firmInfo: {
    name: string;
    practiceAreas: string[];
    keyMatters: ExtractedMatterData[];
    lawyerCount?: number;
    officeLocations?: string[];
    achievements?: string[];
  },
): Promise<FirmOverview> {
  const prompt = `
Firm Name: ${firmInfo.name}
Practice Areas: ${firmInfo.practiceAreas.join(', ')}
${firmInfo.lawyerCount ? `Number of Lawyers: ${firmInfo.lawyerCount}` : ''}
${firmInfo.officeLocations ? `Offices: ${firmInfo.officeLocations.join(', ')}` : ''}
${firmInfo.achievements ? `Recent Achievements: ${firmInfo.achievements.join('; ')}` : ''}

Key Matters Summary:
${firmInfo.keyMatters.map((m, i) => `${i + 1}. ${formatMatterSummary(m)}`).join('\n')}
`;

  return client.completeJson<FirmOverview>(FIRM_OVERVIEW_PROMPT, prompt);
}

// Generate department overview
export async function generateDepartmentOverview(
  client: ClaudeClient,
  departmentInfo: {
    name: string;
    practiceArea: string;
    teamSize: number;
    keyLawyers: { name: string; title: string }[];
    keyMatters: ExtractedMatterData[];
  },
): Promise<DepartmentOverview> {
  const prompt = `
Department: ${departmentInfo.name}
Practice Area: ${departmentInfo.practiceArea}
Team Size: ${departmentInfo.teamSize} lawyers

Key Team Members:
${departmentInfo.keyLawyers.map(l => `- ${l.name}, ${l.title}`).join('\n')}

Key Matters Summary:
${departmentInfo.keyMatters.map((m, i) => `${i + 1}. ${formatMatterSummary(m)}`).join('\n')}
`;

  return client.completeJson<DepartmentOverview>(DEPARTMENT_OVERVIEW_PROMPT, prompt);
}

// Generate lawyer profile
export async function generateLawyerProfile(
  client: ClaudeClient,
  lawyerInfo: {
    name: string;
    title: string;
    practiceAreas: string[];
    admissionYear?: number;
    education?: string[];
    previousRankings?: { directory: string; year: number; ranking: string }[];
    keyMatters: ExtractedMatterData[];
  },
): Promise<LawyerProfile> {
  const prompt = `
Lawyer: ${lawyerInfo.name}
Title: ${lawyerInfo.title}
Practice Areas: ${lawyerInfo.practiceAreas.join(', ')}
${lawyerInfo.admissionYear ? `Years of Experience: ${new Date().getFullYear() - lawyerInfo.admissionYear}` : ''}
${lawyerInfo.education ? `Education: ${lawyerInfo.education.join('; ')}` : ''}
${lawyerInfo.previousRankings?.length ? `Previous Rankings: ${lawyerInfo.previousRankings.map(r => `${r.directory} ${r.year}: ${r.ranking}`).join('; ')}` : ''}

Key Matters Led:
${lawyerInfo.keyMatters.map((m, i) => `${i + 1}. ${formatMatterSummary(m)}`).join('\n')}
`;

  return client.completeJson<LawyerProfile>(LAWYER_PROFILE_PROMPT, prompt);
}

// Generate referee talking points
export async function generateRefereeTalkingPoints(
  client: ClaudeClient,
  refereeContext: {
    refereeName: string;
    company: string;
    matterTitle: string;
    matterData: ExtractedMatterData;
    relationshipType: string;
  },
): Promise<RefereeTalkingPoints> {
  const prompt = `
Referee: ${refereeContext.refereeName}
Company: ${refereeContext.company}
Relationship: ${refereeContext.relationshipType}
Matter: ${refereeContext.matterTitle}

Matter Details:
${formatMatterDataForPrompt(refereeContext.matterData)}
`;

  return client.completeJson<RefereeTalkingPoints>(REFEREE_TALKING_POINTS_PROMPT, prompt);
}

// Helper functions
function formatMatterDataForPrompt(data: ExtractedMatterData, additionalContext?: string): string {
  let prompt = `
Matter Information:
- Client: ${data.clientName || 'Confidential'}
- Counterparties: ${data.counterparties?.join(', ') || 'N/A'}
- Deal Value: ${data.dealValue ? `${data.dealValue.currency} ${data.dealValue.amount.toLocaleString()}${data.dealValue.isEstimated ? ' (estimated)' : ''}` : 'N/A'}
- Practice Areas: ${data.practiceAreas?.join(', ') || 'N/A'}
- Legal Novelty: ${data.legalNovelty || 'N/A'}
- Lead Partner: ${data.leadPartner || 'N/A'}
- Team Members: ${data.teamMembers?.join(', ') || 'N/A'}
`;

  if (data.keyDates?.length) {
    prompt += `\nKey Dates:\n${data.keyDates.map(d => `- ${d.event}: ${d.date}`).join('\n')}`;
  }

  if (additionalContext) {
    prompt += `\n\nAdditional Context:\n${additionalContext}`;
  }

  return prompt;
}

function formatMatterSummary(data: ExtractedMatterData): string {
  const parts = [];
  if (data.clientName) parts.push(`Client: ${data.clientName}`);
  if (data.dealValue) {
    parts.push(`Value: ${data.dealValue.currency} ${data.dealValue.amount.toLocaleString()}`);
  }
  if (data.practiceAreas?.length) {
    parts.push(`Areas: ${data.practiceAreas.slice(0, 2).join(', ')}`);
  }
  if (data.legalNovelty) {
    parts.push(`Novelty: ${data.legalNovelty.substring(0, 50)}...`);
  }
  return parts.join(' | ');
}
