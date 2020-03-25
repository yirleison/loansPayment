const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ExpensesIcomesSchema = new Schema({
    dateIncome: Date,
    dateExpense: Date,
    income: Number,
    expenses: Number,
    note: String
});

module.exports = mongoose.model('ExpensesIcomes', ExpensesIcomesSchema);