export interface TemplateField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea';
  required: boolean;
  maxLength?: number;
  options?: string[];
  mappedFrom?: string;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  type: 'duns_100' | 'chambers' | 'legal_500' | 'custom';
  description: string;
  outputFormat: 'docx' | 'xlsx' | 'pdf';
  version: string;
  fields: TemplateField[];
}

export interface MatterData {
  title: string;
  clientName?: string;
  counterparties?: string[];
  dealValue?: {
    amount: number;
    currency: string;
  };
  synthesizedData?: {
    description: string;
    keyAchievements: string[];
    legalNovelty: string;
    practiceAreas: string[];
  };
  leadPartner?: string;
  teamMembers?: string[];
}

export interface GenerationOptions {
  matterData: MatterData;
  fieldOverrides?: Record<string, unknown>;
  outputPath?: string;
}

export interface GenerationResult {
  success: boolean;
  buffer?: Buffer;
  fileName: string;
  mimeType: string;
  errors?: string[];
}

export interface ValidationResult {
  valid: boolean;
  missingFields: string[];
  invalidFields: Array<{ field: string; reason: string }>;
}
