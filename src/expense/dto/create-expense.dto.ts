// src/expenses/dto/create-expense.dto.ts
import { IsNotEmpty, IsNumber, IsString, Min, IsOptional, IsDateString } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  category: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  // optional field
  @IsString()
  @IsOptional()
  description?: string;
}
