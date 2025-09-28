// src/expenses/expense.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Req // Import Req to access the raw request object
} from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { JwtAuthGuard } from '../guards/auth-guard';
import type { Request } from 'express'; // Import Request type for better typing

// Use the JwtAuthGuard for all routes in this controller
@UseGuards(JwtAuthGuard)
@Controller('expense')
export class ExpenseController {
    constructor(private readonly expenseService: ExpenseService) {}

    @Post() // Or @Post('/')
    create(@Body() body: CreateExpenseDto, @Req() req: Request) {
        // Get userId from the authenticated user's payload set by JwtAuthGuard
        const userId = req.user.sub;
        return this.expenseService.create(userId, body);
    }

    @Get() // Or @Get('/')
    findAllByUser(@Req() req: Request) {
        // Get userId from the authenticated user's payload
        const userId = req.user.sub;
        return this.expenseService.findAllByUser(userId);

    }

    @Get(':id') // Add a route to get a single expense by its ID
    findOne(@Param('id') id: string, @Req() req: Request) {
        const userId = req.user.sub;
        return this.expenseService.findOneByIdAndUser(id, userId); // New service method
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto, @Req() req: Request) {
        const userId = req.user.sub;
        return this.expenseService.update(id, updateExpenseDto, userId); // Pass userId to service
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Req() req: Request) {
        const userId = req.user.sub;
        return this.expenseService.remove(id, userId); // Pass userId to service
    }
}