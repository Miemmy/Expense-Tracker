import {Prop,Schema,SchemaFactory} from '@nestjs/mongoose';
import {HydratedDocument} from "mongoose";
import {User} from "./user.schema";
import {Types} from "mongoose"

export type ExpenseDocument = HydratedDocument<Expense>;

@Schema({})
export class Expense{
    @Prop({required: true, unique: true})
    id: number;

    @Prop({ required: true })
    description: string;

    @Prop({required:true})
    amount: number;


    @Prop({ type: Date, default: Date.now })
    date: Date;

    @Prop()
    note: string;

    @Prop({type:Types.ObjectId, ref:User.name, required:true})
    user: Types.ObjectId;

}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);