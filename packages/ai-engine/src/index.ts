export { ClaudeClient } from './client.js';
export { extractMatterData } from './extractors/matter-extractor.js';
export { synthesizeDescription } from './extractors/description-synthesizer.js';
export { scoreMatter } from './scoring/matter-scorer.js';
export {
  generateChambersHighlight,
  generateLegal500Highlight,
  generateDuns100Highlight,
  generateDirectoryHighlight,
  generateFirmOverview,
  generateDepartmentOverview,
  generateLawyerProfile,
  generateRefereeTalkingPoints,
} from './extractors/directory-generator.js';
export * from './prompts/index.js';
export * from './types.js';
