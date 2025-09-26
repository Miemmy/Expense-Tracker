import { Module } from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';

import { UserModule } from './user/user.module';
import { ExpenseModule } from './expense/expense.module';


@Module({
  imports: [MongooseModule.forRoot('mongodb+srv://jemimauzor_db_user:0Z0R6NZ6KPfP3tny@nes101cluster.qzdhvgb.mongodb.net/expenseDB?retryWrites=true&w=majority&appName=nes101cluster'),
      UserModule,
      ExpenseModule,]
})
export class AppModule {}
