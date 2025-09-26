import { Module } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { ExpenseController } from './expense.controller';
import {Expense,ExpenseSchema} from "../schema/expense.schema";
import {MongooseModule} from "@nestjs/mongoose";
import {JwtModule} from "@nestjs/jwt";
import {JwtAuthGuard} from "../guards/auth-guard";

@Module({
    imports: [MongooseModule.forFeature([{name:Expense.name,schema:ExpenseSchema}]),
    JwtModule],
  controllers: [ExpenseController],
  providers: [ExpenseService,JwtAuthGuard],
    exports: [ExpenseService,JwtModule]
})
export class ExpenseModule {}
