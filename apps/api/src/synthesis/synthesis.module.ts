import { Module } from '@nestjs/common';
import { SynthesisService } from './synthesis.service';
import { SynthesisController } from './synthesis.controller';
import { MattersModule } from '../matters/matters.module';

@Module({
  imports: [MattersModule],
  controllers: [SynthesisController],
  providers: [SynthesisService],
  exports: [SynthesisService],
})
export class SynthesisModule {}
