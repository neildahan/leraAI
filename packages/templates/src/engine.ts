import {
  TemplateDefinition,
  GenerationOptions,
  GenerationResult,
  ValidationResult,
  MatterData,
} from './types.js';
import { Duns100Template } from './duns100/template.js';
import { ChambersTemplate } from './chambers/template.js';
import { Legal500Template } from './legal500/template.js';
import {
  RefereeSpreadsheetTemplate,
  ChambersRefereeTemplate,
  Legal500RefereeTemplate,
} from './referees/template.js';
import { DocxGenerator } from './generators/docx.js';
import { XlsxGenerator } from './generators/xlsx.js';

export class TemplateEngine {
  private templates: Map<string, TemplateDefinition> = new Map();

  constructor() {
    this.registerDefaultTemplates();
  }

  private registerDefaultTemplates(): void {
    // Matter submission templates
    this.registerTemplate(Duns100Template);
    this.registerTemplate(ChambersTemplate);
    this.registerTemplate(Legal500Template);
    // Referee templates
    this.registerTemplate(RefereeSpreadsheetTemplate);
    this.registerTemplate(ChambersRefereeTemplate);
    this.registerTemplate(Legal500RefereeTemplate);
  }

  registerTemplate(template: TemplateDefinition): void {
    this.templates.set(template.id, template);
  }

  getTemplate(id: string): TemplateDefinition | undefined {
    return this.templates.get(id);
  }

  listTemplates(): TemplateDefinition[] {
    return Array.from(this.templates.values());
  }

  validateData(templateId: string, data: MatterData): ValidationResult {
    const template = this.templates.get(templateId);
    if (!template) {
      return {
        valid: false,
        missingFields: [],
        invalidFields: [{ field: 'template', reason: 'Template not found' }],
      };
    }

    const missingFields: string[] = [];
    const invalidFields: Array<{ field: string; reason: string }> = [];

    for (const field of template.fields) {
      const value = this.getFieldValue(data, field.mappedFrom || field.name);

      if (field.required && (value === undefined || value === null || value === '')) {
        missingFields.push(field.name);
        continue;
      }

      if (value && field.maxLength && typeof value === 'string' && value.length > field.maxLength) {
        invalidFields.push({
          field: field.name,
          reason: `Exceeds maximum length of ${field.maxLength}`,
        });
      }
    }

    return {
      valid: missingFields.length === 0 && invalidFields.length === 0,
      missingFields,
      invalidFields,
    };
  }

  async generate(templateId: string, options: GenerationOptions): Promise<GenerationResult> {
    const template = this.templates.get(templateId);
    if (!template) {
      return {
        success: false,
        fileName: '',
        mimeType: '',
        errors: ['Template not found'],
      };
    }

    const validation = this.validateData(templateId, options.matterData);
    if (!validation.valid) {
      return {
        success: false,
        fileName: '',
        mimeType: '',
        errors: [
          ...validation.missingFields.map((f) => `Missing required field: ${f}`),
          ...validation.invalidFields.map((f) => `${f.field}: ${f.reason}`),
        ],
      };
    }

    // Map data to template fields
    const fieldValues = this.mapDataToFields(template, options.matterData, options.fieldOverrides);

    // Generate document based on format
    const fileName = this.generateFileName(template, options.matterData);

    try {
      let buffer: Buffer;
      let mimeType: string;

      switch (template.outputFormat) {
        case 'docx':
          buffer = await DocxGenerator.generate(template, fieldValues);
          mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          break;
        case 'xlsx':
          buffer = await XlsxGenerator.generate(template, fieldValues);
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        default:
          return {
            success: false,
            fileName: '',
            mimeType: '',
            errors: [`Unsupported format: ${template.outputFormat}`],
          };
      }

      return {
        success: true,
        buffer,
        fileName,
        mimeType,
      };
    } catch (error) {
      return {
        success: false,
        fileName: '',
        mimeType: '',
        errors: [error instanceof Error ? error.message : 'Generation failed'],
      };
    }
  }

  private mapDataToFields(
    template: TemplateDefinition,
    data: MatterData,
    overrides?: Record<string, unknown>,
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const field of template.fields) {
      if (overrides?.[field.name] !== undefined) {
        result[field.name] = overrides[field.name];
      } else if (field.mappedFrom) {
        result[field.name] = this.getFieldValue(data, field.mappedFrom);
      }
    }

    return result;
  }

  private getFieldValue(data: unknown, path: string): unknown {
    const parts = path.split('.');
    let current: unknown = data;

    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      if (typeof current !== 'object') return undefined;
      current = (current as Record<string, unknown>)[part];
    }

    if (Array.isArray(current)) {
      return current.join(', ');
    }

    return current;
  }

  private generateFileName(template: TemplateDefinition, data: MatterData): string {
    const safeName = (data.title || 'matter').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
    const timestamp = Date.now();
    return `${safeName}_${template.type}_${timestamp}.${template.outputFormat}`;
  }
}
