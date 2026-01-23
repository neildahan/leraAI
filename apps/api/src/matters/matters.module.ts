import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MattersService } from './matters.service';
import { MattersController } from './matters.controller';
import { Matter, MatterSchema } from './schemas/matter.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Matter.name, schema: MatterSchema }])],
  controllers: [MattersController],
  providers: [MattersService],
  exports: [MattersService],
})
export class MattersModule {}
