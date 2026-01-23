import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Template, TemplateDocument, TemplateType, TemplateField } from './schemas/template.schema';
import { Export, ExportDocument, ExportStatus } from './schemas/export.schema';
import { MattersService } from '../matters/matters.service';

@Injectable()
export class TemplatesService {
  private readonly logger = new Logger(TemplatesService.name);

  constructor(
    @InjectModel(Template.name) private readonly templateModel: Model<TemplateDocument>,
    @InjectModel(Export.name) private readonly exportModel: Model<ExportDocument>,
    private readonly mattersService: MattersService,
  ) {
    // Seed default templates on startup
    this.seedDefaultTemplates();
  }

  private async seedDefaultTemplates(): Promise<void> {
    const existingCount = await this.templateModel.countDocuments();
    if (existingCount > 0) return;

    const defaultTemplates = [
      {
        name: "Dun's 100 Submission",
        type: TemplateType.DUNS_100,
        description: "Template for Dun's 100 legal directory submission",
        outputFormat: 'docx',
        version: '2024',
        fields: this.getDuns100Fields(),
      },
      {
        name: 'Chambers Submission',
        type: TemplateType.CHAMBERS,
        description: 'Template for Chambers and Partners submission',
        outputFormat: 'xlsx',
        version: '2024',
        fields: this.getChambersFields(),
      },
    ];

    await this.templateModel.insertMany(defaultTemplates);
    this.logger.log('Seeded default templates');
  }

  private getDuns100Fields(): TemplateField[] {
    return [
      { name: 'firmName', label: 'Firm Name', type: 'text', required: true, maxLength: 200 },
      { name: 'practiceArea', label: 'Practice Area', type: 'select', required: true, options: ['M&A', 'Corporate', 'Litigation', 'Banking & Finance', 'Real Estate', 'IP', 'Employment'] },
      { name: 'matterTitle', label: 'Matter Title', type: 'text', required: true, maxLength: 500, mappedFrom: 'title' },
      { name: 'clientName', label: 'Client Name', type: 'text', required: true, maxLength: 200, mappedFrom: 'clientName' },
      { name: 'counterparties', label: 'Counterparties', type: 'textarea', required: false, mappedFrom: 'counterparties' },
      { name: 'dealValue', label: 'Deal Value', type: 'text', required: false, mappedFrom: 'dealValue.amount' },
      { name: 'description', label: 'Matter Description', type: 'textarea', required: true, maxLength: 2000, mappedFrom: 'synthesizedData.description' },
      { name: 'keyAchievements', label: 'Key Achievements', type: 'textarea', required: false, mappedFrom: 'synthesizedData.keyAchievements' },
      { name: 'leadPartnerName', label: 'Lead Partner', type: 'text', required: true },
      { name: 'teamMembers', label: 'Team Members', type: 'textarea', required: false },
      { name: 'completionDate', label: 'Completion Date', type: 'date', required: true },
    ];
  }

  private getChambersFields(): TemplateField[] {
    return [
      { name: 'submittingFirm', label: 'Submitting Firm', type: 'text', required: true },
      { name: 'practiceGroup', label: 'Practice Group', type: 'select', required: true, options: ['Corporate/M&A', 'Banking & Finance', 'Capital Markets', 'Dispute Resolution', 'Real Estate', 'Tax'] },
      { name: 'matterName', label: 'Matter Name', type: 'text', required: true, mappedFrom: 'title' },
      { name: 'client', label: 'Client', type: 'text', required: true, mappedFrom: 'clientName' },
      { name: 'matterValue', label: 'Matter Value (USD)', type: 'number', required: false, mappedFrom: 'dealValue.amount' },
      { name: 'synopsis', label: 'Synopsis', type: 'textarea', required: true, maxLength: 3000, mappedFrom: 'synthesizedData.description' },
      { name: 'significance', label: 'Significance', type: 'textarea', required: true, maxLength: 1000, mappedFrom: 'synthesizedData.legalNovelty' },
      { name: 'keyPartner', label: 'Key Partner', type: 'text', required: true },
      { name: 'otherLawyers', label: 'Other Key Lawyers', type: 'textarea', required: false },
      { name: 'jurisdictions', label: 'Jurisdictions', type: 'text', required: true },
      { name: 'dateCompleted', label: 'Date Completed', type: 'date', required: true },
    ];
  }

  async findAll(): Promise<TemplateDocument[]> {
    return this.templateModel.find({ isActive: true }).sort({ name: 1 }).exec();
  }

  async findById(id: string): Promise<TemplateDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Template not found');
    }

    const template = await this.templateModel.findById(id).exec();
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    return template;
  }

  async getTemplateFields(id: string): Promise<TemplateField[]> {
    const template = await this.findById(id);
    return template.fields;
  }

  async generateExport(
    templateId: string,
    matterId: string,
    userId: string,
    fieldOverrides?: Record<string, any>,
  ): Promise<ExportDocument> {
    const template = await this.findById(templateId);
    const matter = await this.mattersService.findById(matterId);

    // Map matter data to template fields
    const fieldValues: Record<string, any> = {};
    for (const field of template.fields) {
      if (fieldOverrides?.[field.name] !== undefined) {
        fieldValues[field.name] = fieldOverrides[field.name];
      } else if (field.mappedFrom) {
        fieldValues[field.name] = this.getNestedValue(matter, field.mappedFrom);
      }
    }

    // Create export record
    const exportRecord = await this.exportModel.create({
      templateId: new Types.ObjectId(templateId),
      matterId: new Types.ObjectId(matterId),
      createdBy: new Types.ObjectId(userId),
      status: ExportStatus.PROCESSING,
      fieldValues,
      fileName: `${matter.title}_${template.name}_${Date.now()}.${template.outputFormat}`,
    });

    // Simulate document generation (would use @lera-ai/templates package in production)
    setTimeout(async () => {
      await this.exportModel.updateOne(
        { _id: exportRecord._id },
        {
          status: ExportStatus.COMPLETED,
          completedAt: new Date(),
          fileSize: 45000,
          fileUrl: `/exports/${exportRecord._id}/file`,
        },
      );

      // Mark matter as exported
      await this.mattersService.updateStatus(matterId, 'exported' as any);
    }, 2000);

    return exportRecord;
  }

  async getExport(id: string): Promise<ExportDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Export not found');
    }

    const exportRecord = await this.exportModel
      .findById(id)
      .populate('templateId', 'name type outputFormat')
      .populate('matterId', 'title clientName')
      .populate('createdBy', 'email firstName lastName')
      .exec();

    if (!exportRecord) {
      throw new NotFoundException('Export not found');
    }
    return exportRecord;
  }

  async getUserExports(userId: string, limit = 20): Promise<ExportDocument[]> {
    return this.exportModel
      .find({ createdBy: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('templateId', 'name type')
      .populate('matterId', 'title')
      .exec();
  }

  async markDownloaded(id: string): Promise<void> {
    await this.exportModel.updateOne(
      { _id: id },
      { downloadedAt: new Date() },
    );
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      if (Array.isArray(current)) {
        return current.join(', ');
      }
      return current?.[key];
    }, obj);
  }
}
