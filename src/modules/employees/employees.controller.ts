import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Ip,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { Prisma } from '@prisma/client';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { MyLoggerService } from 'src/my-logger/my-logger.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Public } from 'src/common/decorators/public.decorator';
import {
  ApiOkResponse,
  ApiTags,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiFoundResponse,
} from '@nestjs/swagger';
import { EmployeeDto } from './dto/employee-response.dto';
import { ErrorResonseDto } from 'src/common/dto/error-respose.dto';
// @SkipThrottle()
// @Public()
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}
  private readonly logger = new MyLoggerService(EmployeesController.name);

  @ApiCreatedResponse({ type: EmployeeDto })
  @ApiBadRequestResponse({
    type: ErrorResonseDto,
  })
  @Post()
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }
  @SkipThrottle({ default: false })
  @Public()
  @ApiOkResponse({ type: [EmployeeDto] })
  @ApiBadRequestResponse({ type: ErrorResonseDto })
  @Get()
  findAll(
    @Ip() ip: string,
    @Query('role') role: 'INTERN' | 'ENGINEER' | 'ADMIN',
  ) {
    this.logger.log(
      `IP ${ip} is trying to access all employees with role ${role}`,
      EmployeesController.name,
    );
    return this.employeesService.findAll(role);
  }
  @Throttle({ short: { ttl: 1000, limit: 1 } })
  @ApiOkResponse({ type: EmployeeDto })
  @ApiBadRequestResponse({ type: ErrorResonseDto })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(+id);
  }

  @ApiOkResponse({ type: EmployeeDto })
  @ApiBadRequestResponse({ type: ErrorResonseDto })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(+id, updateEmployeeDto);
  }

  @ApiOkResponse({ type: EmployeeDto })
  @ApiBadRequestResponse({ type: ErrorResonseDto })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeesService.remove(+id);
  }
}
