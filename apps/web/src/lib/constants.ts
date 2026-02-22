// Practice area keys - used as values stored in database
// Labels are fetched from i18n translations
export const PRACTICE_AREA_KEYS = [
  'cooperative_associations',
  'environmental',
  'insurance',
  'national_insurance',
  'blockchain_crypto',
  'banking_finance',
  'legal_collection_enforcement',
  'mediation',
  'family_inheritance_mediation',
  'internet_law',
  'family_inheritance_law',
  'tort_law',
  'sports_law',
  'employment_law',
  'military_security_law',
  'immigration_citizenship',
  'hitech',
  'urban_renewal',
  'franchising',
  'insolvency',
  'commercial_litigation',
  'private_clients_trusts_wealth',
  'defamation',
  'mergers_acquisitions',
  'project_finance_energy_infrastructure',
  'municipal_taxation',
  'taxes',
  'hospitality',
  'nonprofits',
  'international_trade',
  'administrative_law',
  'criminal_law',
  'real_estate',
  'cyber',
  'white_collar',
  'ip_patent_prosecution',
  'ip_litigation',
  'ip_commercial',
  'investment_funds',
  'regulation',
  'local_authorities',
  'medical_malpractice',
  'capital_markets',
  'class_actions',
  'transportation',
  'competition_antitrust',
  'planning_construction',
  'media_communications',
] as const;

export type PracticeAreaKey = typeof PRACTICE_AREA_KEYS[number];

// Currency codes - these don't need translation
export const CURRENCIES = ['USD', 'EUR', 'GBP', 'ILS', 'CHF', 'JPY'] as const;

export type CurrencyCode = typeof CURRENCIES[number];

// Directory keys
export const DIRECTORY_KEYS = ['chambers', 'legal_500', 'duns_100'] as const;

export type DirectoryKey = typeof DIRECTORY_KEYS[number];

// Helper function to get practice areas with translations
export function getPracticeAreaOptions(t: (key: string) => string) {
  return PRACTICE_AREA_KEYS.map((key) => ({
    value: key,
    label: t(`practiceAreas.${key}`),
  }));
}

// Helper function to get directory options with translations
export function getDirectoryOptions(t: (key: string) => string) {
  return DIRECTORY_KEYS.map((key) => ({
    value: key,
    label: t(`directories.${key}.name`),
    description: t(`directories.${key}.description`),
  }));
}
