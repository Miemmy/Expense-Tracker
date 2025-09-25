import { Module } from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import { ExpenseController } from './expense/expense.controller';
import { ExpenseService } from './expense/expense.service';

@Module({
  imports: [MongooseModule.forRoot('mongodb+srv://jemimauzor_db_user:0Z0R6NZ6KPfP3tny@nes101cluster.qzdhvgb.mongodb.net/expenseDB?retryWrites=true&w=majority&appName=nes101cluster')],
  controllers: [ExpenseController],
  providers: [ExpenseService],
})
export class AppModule {}
