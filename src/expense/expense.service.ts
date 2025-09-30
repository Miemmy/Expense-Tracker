// src/expenses/expenses.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Expense, ExpenseDocument } from '../schema/expense.schema';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpenseService {
    constructor(
        @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
    ) {}// we inject our expense model and save it as a private property of this class of type Expense document

    private validateObjectId(id: string, entityName: string): Types.ObjectId {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ID');
        }
        return new Types.ObjectId(id);
    }

    async create(userId: string, createExpenseDto: CreateExpenseDto): Promise<Expense> {
        const expense = new this.expenseModel({
            ...createExpenseDto,
            date: new Date(createExpenseDto.date), // Convert date string to Date object
            user: this.validateObjectId(userId, 'user'),
        });
        return expense.save();
    }

    async findAllByUser(userId: string): Promise<{ expenses: Expense[]; total: number }> {
        const userObjectId = this.validateObjectId(userId, 'user');
        const expenses = await this.expenseModel.find({ user: userObjectId }).exec();
        let total = 0;
        for (const expense of expenses) {
            total += expense.amount;
        }
        return { expenses, total };
    }

    async remove(expenseId: string, userId: string): Promise<string | null> {
        const expenseObjectId = this.validateObjectId(expenseId, 'expense');
        const userObjectId = this.validateObjectId(userId, 'user');
        const deletedExpense = await this.expenseModel.findOneAndDelete({
            _id: expenseObjectId,
            user: userObjectId,
        }).exec();
        if (!deletedExpense) {
            throw new NotFoundException(`Expense with ID "${expenseId}" not found or you are not authorized to delete it.`);
        }
        return "Expense deleted successfully";
    }

    async update(expenseId: string, updateExpenseDto: UpdateExpenseDto, userId: string): Promise<Expense | null> {
        const expenseObjectId = this.validateObjectId(expenseId, 'expense');
        const userObjectId = this.validateObjectId(userId, 'user');

        const updatePayload: any = { ...updateExpenseDto };
        if (updateExpenseDto.date) {
            updatePayload.date = new Date(updateExpenseDto.date); // Convert date string to Date object
        }

        const updatedExpense = await this.expenseModel.findOneAndUpdate(
            { _id: expenseObjectId, user: userObjectId },
            { $set: updatePayload },
            { new: true }
        ).exec();

        if (!updatedExpense) {
            const genericExpense = await this.expenseModel.findById(expenseObjectId).exec();
            if (genericExpense && genericExpense.user.toString() !== userObjectId.toString()) {
                throw new ForbiddenException(`You are not authorized to update this expense.`);
            }
            throw new NotFoundException(`Expense with ID "${expenseId}" not found for this user.`);
        }
        return updatedExpense;
    }

    async findOneByIdAndUser(expenseId: string, userId: string): Promise<Expense> {
        const expenseObjectId = this.validateObjectId(expenseId, 'expense');
        const userObjectId = this.validateObjectId(userId, 'user');
        const expense = await this.expenseModel.findOne({
            _id: expenseObjectId,
            user: userObjectId,
        }).exec();
        if (!expense) {
            throw new NotFoundException(`Expense with ID "${expenseId}" not found for this user.`);
        }
        return expense;
    }
}
