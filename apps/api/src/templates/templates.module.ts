import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TemplatesService } from './templates.service';
import { TemplatesController, ExportsController } from './templates.controller';
import { Template, TemplateSchema } from './schemas/template.schema';
import { Export, ExportSchema } from './schemas/export.schema';
import { MattersModule } from '../matters/matters.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Template.name, schema: TemplateSchema },
      { name: Export.name, schema: ExportSchema },
    ]),
    MattersModule,
  ],
  controllers: [TemplatesController, ExportsController],
  providers: [TemplatesService],
  exports: [TemplatesService],
})
export class TemplatesModule {}
