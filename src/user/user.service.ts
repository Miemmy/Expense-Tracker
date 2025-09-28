// user.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../schema/user.schema';
import { SignupDto } from './dto/signup-dto';
import { LoginDto } from './dto/login-dto';
import {NotFoundException,BadRequestException,InternalServerErrorException} from "@nestjs/common";

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private jwtService: JwtService,
    ) {}

    // SIGN UP
    async signup(signupDto: SignupDto): Promise<User> {
        try {
            const { username, email, password } = signupDto;

            const newUser = new this.userModel({
                username,
                email,
                password, // don’t forget to hash before saving
            });

            return await newUser.save();
        } catch (err) {
            if (err.code === 11000) {
                // Duplicate email error
                throw new BadRequestException(
                    `User with email "${err.keyValue.email}" already exists`,
                );
            }
            // Any other DB error → 500
            throw new InternalServerErrorException('Something went wrong while creating user');
        }
    }


    async findById(id: string): Promise<User> {
        const user = await this.userModel.findById(id);
        if (!user) {
            // 404 error with friendly message
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
//
    // LOGIN
    async login(loginDto: LoginDto): Promise<{ access_token: string }> {
        const { username, password } = loginDto;

        const user = await this.userModel.findOne({ username }).exec();
        if (!user) throw new UnauthorizedException('Invalid credentials');

        // compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new UnauthorizedException('Invalid credentials');

        // issue JWT (expires in 6h)
        const payload = { sub: user._id, username: user.username };
        const token = await this.jwtService.signAsync(payload, { expiresIn: '6h' });

        return { access_token: token };
    }
}