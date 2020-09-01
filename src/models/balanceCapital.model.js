const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BalanceCapitalSchema = new Schema({
    balanceCapital: Number,
    balanceInterest: Number,
    balanceCapitalAfter: Number,
    balanceInterestAfter: Number
});

module.exports = mongoose.model('BalanceCapital', BalanceCapitalSchema);