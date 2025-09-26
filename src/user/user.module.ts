import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import{ MongooseModule } from '@nestjs/mongoose';
import {User,UserSchema} from "../schema/user.schema";
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        JwtModule.register({
            secret: process.env.ACCESS_TOKEN||'superSecretKey',
            signOptions: { expiresIn: '6h' },
        }),
    ],
    providers: [UserService],
    controllers: [UserController],
    exports: [UserService],
})
export class UserModule {}
