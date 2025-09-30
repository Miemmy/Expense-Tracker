import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config'; import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module'; // Import your UserModule
import { ExpenseModule } from './expense/expense.module'; // Import your ExpenseModule

@Module({
    imports: [
        // 1. Configure ConfigModule globally
        ConfigModule.forRoot({
            isGlobal: true, // makes the ConfigService available throughout the application
            envFilePath: '.env', // Path to your environment file
        }),
         
         ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'public'),
         }),
        // This connects to MongoDB using the DATABASE_URL from my .env
        MongooseModule.forRootAsync({
            imports: [ConfigModule], // Required to inject ConfigService
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get<string>('MONGO_URI'),
            }),
            inject: [ConfigService],
        }),
        // Import your feature modules
        UserModule,
        ExpenseModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
