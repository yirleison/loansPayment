const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BalanceCapitalSchema = new Schema({
    balanceCapital: Number,
    balanceInterest: Number,
<<<<<<< HEAD
    balanceCapitalAfter: Number,
    balanceInterestAfter: Number
=======
    historyCapital: Number,
    HistoryInterest: Number
>>>>>>> origin
});

module.exports = mongoose.model('BalanceCapital', BalanceCapitalSchema);