import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { DatabaseModule } from '../../database/database.module';
@Module({
  controllers: [EmployeesController],
  providers: [EmployeesService],
  imports: [DatabaseModule],
})
export class EmployeesModule {}
