import {Prop,Schema,SchemaFactory} from '@nestjs/mongoose';
import {HydratedDocument, Types} from "mongoose";
import {User} from "./user.schema";

export type ExpenseDocument = HydratedDocument<Expense>;

@Schema({})
export class Expense{

    @Prop({ required: true })
    category: string;

    @Prop({ required:true })
    amount: number;

    @Prop({ required: true })
    date: Date;

    @Prop()
    description: string;

    @Prop({type:Types.ObjectId, ref:User.name, required:true})
    user: Types.ObjectId;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);