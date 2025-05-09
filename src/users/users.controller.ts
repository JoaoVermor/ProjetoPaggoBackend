import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() body: { email: string; name?: string; password: string }) {
    // Em produção, faça hash da senha!
    return this.usersService.createUser(body);
  }

  @Get('find')
  async findByEmail(@Query('email') email: string) {
    return this.usersService.findByEmail(email);
  }
}
