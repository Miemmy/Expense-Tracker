// src/expenses/expenses.service.ts
import { Injectable ,NotFoundException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Expense, ExpenseDocument } from '../schema/expense.schema';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpenseService {
    constructor(
        @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
    ) {}// we inject our expense model and save it as a private property of this class of type Expense documentg

    // Create new expense
    async create(userId: string, createExpenseDto: CreateExpenseDto): Promise<Expense> {
        const expense = new this.expenseModel({
            ...createExpenseDto,//destructure the incoming data so that we can use it to create our new expense
            user: new Types.ObjectId(userId), // link expense to the user
        });
        return expense.save();
    }

    // Get all expenses for a user, plus total
    async findAllByUser(userId: string): Promise<{ expenses: Expense[]; total: number }> {
        const expenses = await this.expenseModel.find({ user: userId }).exec();//.exec() is for type safety
        let total=0;
        for (const expense of expenses) {
            total+=expense.amount
        }

        return { expenses, total };
    }

    // Delete one expense by ID
    async remove(expenseId: string): Promise<Expense | null> {
        return this.expenseModel.findByIdAndDelete(expenseId).exec();
    }

    //Update by id
    async update(expenseId: string, updateExpenseDto: UpdateExpenseDto): Promise<Expense | null> {
        const updatedExpense = await this.expenseModel.findByIdAndUpdate(
            expenseId,
            { $set: updateExpenseDto },
            { new: true } // Return the updated document
        ).exec();

        if (!updatedExpense) {
            throw new NotFoundException(`Expense with ID "${expenseId}" not found.`);
        }
        return updatedExpense


    }

}
