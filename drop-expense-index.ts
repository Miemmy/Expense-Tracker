import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Expense } from './src/schema/expense.schema';

async function dropExpenseIndex() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const expenseModel = app.get(getModelToken(Expense.name));

  console.log('--- Dropping index for Expense collection ---');

  try {
    console.log('\n📌 Current indexes on \'expenses\' collection:');
    const indexes = await expenseModel.collection.indexes();
    console.log(indexes);
  } catch (error) {
    console.error('⚠️  Could not fetch indexes:', error.message);
    await app.close();
    return;
  }

  try {
    console.log('\nAttempting to drop index: \'id_1\'...');
    await expenseModel.collection.dropIndex('id_1');
    console.log('✅ Successfully dropped index: \'id_1\'');
  } catch (error) {
    console.error('\n⚠️ Error dropping index \'id_1\':', error.message);
    console.log('(This may not be an issue if the index did not exist in the first place)');
  }

  try {
    console.log('\n📌 Indexes on \'expenses\' collection after operation:');
    const updatedIndexes = await expenseModel.collection.indexes();
    console.log(updatedIndexes);
  } catch (error) {
    console.error('⚠️  Could not fetch updated indexes:', error.message);
  }

  await app.close();
  console.log('\n--- Script finished ---');
}

dropExpenseIndex();