const mongoose = require('mongoose');
const { interestLogger } = require('../../logger');
const Schema = mongoose.Schema;

const ExpensesIcomesSchema = new Schema({
    date: Date,
    income: Number,
    expenses: Number,
    note: String,
    type: Number,
    id:String 
});

module.exports = mongoose.model('ExpensesIcomes', ExpensesIcomesSchema);