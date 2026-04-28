import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from 'src/common/decorators/public.decorator';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';
import { ErrorResonseDto } from 'src/common/dto/error-respose.dto';

@Public()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiCreatedResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({ type: ErrorResonseDto })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiOkResponse({ type: [UserResponseDto] })
  @ApiBadRequestResponse({ type: ErrorResonseDto })
  @ApiQuery({
    name: 'email',
    type: String,
    required: false,
    description: 'Email do usuario para filtrar a lista',
  })
  @Get()
  findAll(@Query('email') email?: string) {
    return this.usersService.findAll(email);
  }

  @ApiOkResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({ type: ErrorResonseDto })
  @ApiParam({
    name: 'id',
    description: 'ID do usuario a ser buscado',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @ApiOkResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({ type: ErrorResonseDto })
  @ApiParam({
    name: 'id',
    description: 'ID do usuario a ser atualizado',
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @ApiOkResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({ type: ErrorResonseDto })
  @ApiParam({
    name: 'id',
    description: 'ID do usuario a ser removido',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
