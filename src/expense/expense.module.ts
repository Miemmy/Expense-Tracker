import { Module } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { ExpenseController } from './expense.controller';
import { Expense, ExpenseSchema } from '../schema/expense.schema';
import { MongooseModule } from '@nestjs/mongoose';


import { UserModule } from '../user/user.module'; // Import your UserModule which exports JwtModule and UserService

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Expense.name, schema: ExpenseSchema }]),
        UserModule, // Import UserModule which exports JwtModule (configured)

    ],
    controllers: [ExpenseController],
    providers: [ExpenseService], // JwtAuthGuard is implicitly resolved by @UseGuards
    exports: [ExpenseService], // Export ExpenseService if other modules need to use it
})
export class ExpenseModule {}