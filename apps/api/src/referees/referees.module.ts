import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RefereesController } from './referees.controller';
import { RefereesService } from './referees.service';
import { Referee, RefereeSchema } from './schemas/referee.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Referee.name, schema: RefereeSchema },
    ]),
  ],
  controllers: [RefereesController],
  providers: [RefereesService],
  exports: [RefereesService],
})
export class RefereesModule {}
