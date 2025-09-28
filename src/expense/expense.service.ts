// src/expenses/expenses.service.ts
import { Injectable ,NotFoundException, BadRequestException, ForbiddenException} from '@nestjs/common';
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

    //validate objectId strings coming from authgaurd
    private validateObjectId(id: string,entityName: string): Types.ObjectId {
        if (!Types.ObjectId.isValid(id)){
            throw new BadRequestException('Invalid ID');
        }
        return new Types.ObjectId(id);

    }

    // Create new expense
    async create(userId: string, createExpenseDto: CreateExpenseDto): Promise<Expense> {
        const expense = new this.expenseModel({
            ...createExpenseDto,//destructure the incoming data so that we can use it to create our new expense
            user: this.validateObjectId(userId, 'user'), // links expense to the user
        });
        return expense.save();
    }

    // Get all expenses for a user, plus total
    async findAllByUser(userId: string): Promise<{ expenses: Expense[]; total: number }> {
        const userObjectId = this.validateObjectId(userId, 'user');
        const expenses = await this.expenseModel.find({ user: userObjectId }).exec();//.exec() is for type safety
        let total=0;
        for (const expense of expenses) {
            total+=expense.amount
        }

        return { expenses, total };
    }

    // Delete one expense by ID
    async remove(expenseId: string,userId
    :string):Promise<string  | null> {
        const expenseObjectId = this.validateObjectId(expenseId, 'expense');
        const userObjectId = this.validateObjectId(userId, 'user');
        const deletedExpense=await this.expenseModel.findByIdAndDelete(expenseObjectId).exec();

        //now to handle possible errors
        if (!deletedExpense){
            //checking for authorization errors
            const randomExpense:ExpenseDocument|null =await this.expenseModel.findById(expenseObjectId).exec();
            if (randomExpense?.user.toString()!==userObjectId.toString()){
                throw new ForbiddenException('You are not authorized to delete this expense');}

            //if not authorization error then it is a not found error
            throw new NotFoundException(`Expense with ID "${expenseId}" not found.`);
        }
        return ("Expense deleted successfully")

    }

    //Update by id
    async update(expenseId: string, updateExpenseDto: UpdateExpenseDto, userId: string): Promise<Expense | null> {
        const expenseObjectId = this.validateObjectId(expenseId, 'expense');
        const userObjectId = this.validateObjectId(userId, 'user');

        const updatedExpense = await this.expenseModel.findOneAndUpdate(
            { _id: expenseObjectId, user: userObjectId }, // Find by ID and user
            { $set: updateExpenseDto },
            { new: true } // Return the updated document
        ).exec();

        if (!updatedExpense) {
            // Distinguish between not found and not authorized
            const genericExpense = await this.expenseModel.findById(expenseObjectId).exec();
            if (genericExpense && genericExpense.user.toString() !== userObjectId.toString()) {
                throw new ForbiddenException(`You are not authorized to update this expense.`);
            }
            throw new NotFoundException(`Expense with ID "${expenseId}" not found for this user.`);
        }
        return updatedExpense;



}
//getOne by id
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
