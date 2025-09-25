// src/expenses/dto/create-expense.dto.ts
import { IsNotEmpty, IsNumber, IsString, Min, IsOptional } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  amount: number;

  // optional field
  @IsString()
  @IsOptional()
  note?: string;
}

