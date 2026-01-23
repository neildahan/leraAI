import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LawyersController } from './lawyers.controller';
import { LawyersService } from './lawyers.service';
import { Lawyer, LawyerSchema } from './schemas/lawyer.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lawyer.name, schema: LawyerSchema },
    ]),
  ],
  controllers: [LawyersController],
  providers: [LawyersService],
  exports: [LawyersService],
})
export class LawyersModule {}
