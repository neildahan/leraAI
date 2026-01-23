import { Module } from '@nestjs/common';
import { ImanageService } from './imanage.service';
import { ImanageController } from './imanage.controller';

@Module({
  controllers: [ImanageController],
  providers: [ImanageService],
  exports: [ImanageService],
})
export class ImanageModule {}
