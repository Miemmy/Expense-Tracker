// user.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from '../schema/user.schema';
import { SignupDto } from './dto/signup-dto';
import { LoginDto } from './dto/login-dto';
import { NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class UserService {
    private readonly saltRounds = 10; // Define salt rounds for bcrypt

    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private jwtService: JwtService,
    ) {}

    // Helper method to generate JWT
    private async generateJwtToken(user: UserDocument): Promise<{ access_token: string }> {
        const payload = {
            sub: user._id,
            username: user.username,
            email: user.email, // Include email for consistency with JwtPayload interface
        };
        const token = await this.jwtService.signAsync(payload, { expiresIn: '6h' });
        return { access_token: token };
    }

    // SIGN UP
    async signup(signupDto: SignupDto): Promise<{ access_token: string }> { // Change return type
        try {
            const { username, email, password } = signupDto;

            // 1. Hash the password before saving (FIX)
            const hashedPassword = await bcrypt.hash(password, this.saltRounds);

            const newUser = new this.userModel({
                username,
                email,
                password: hashedPassword, // Use the hashed password
            });

            const savedUser = await newUser.save();

            // 2. Generate and return a JWT upon successful signup (IMPROVEMENT)
            return this.generateJwtToken(savedUser);

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

    async findById(id: string): Promise<UserDocument> {
        const user = await this.userModel.findById(id);
        if (!user) {
            // 404 error with friendly message
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    // LOGIN
    async login(loginDto: LoginDto): Promise<{ access_token: string }> {
        const { username, password } = loginDto;

        const user = await this.userModel.findOne({ username }).exec();
        if (!user) throw new UnauthorizedException('Invalid credentials');

        // compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new UnauthorizedException('Invalid credentials');

        // issue JWT (expires in 6h)
        // 3. Include email in the JWT payload for consistency (FIX)
        return this.generateJwtToken(user);
    }
}