import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { LoginDto } from './dto/login-dto';
import { SignupDto } from './dto/signup-dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

    @Post('/signup')
    async create(@Body() body:SignupDto){
      return this.userService.signup(body);
    }

    @Post('login')
    async login(@Body() body:LoginDto){
      return this.userService.login(body)
    }

}
