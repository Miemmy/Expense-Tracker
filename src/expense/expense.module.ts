import { Module } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { ExpenseController } from './expense.controller';
import {Expense,ExpenseSchema} from "../schema/expense.schema";
import {MongooseModule} from "@nestjs/mongoose";

@Module({
    imports: [MongooseModule.forFeature([{name:Expense.name,schema:ExpenseSchema}])],
  controllers: [ExpenseController],
  providers: [ExpenseService],
})
export class ExpenseModule {}
