const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Deposit = Schema ({
    dateDeposit: Date,
    amount: Number,
    interest: Number,
    nextDatePayment: Date,
    balanceLoand: Number,
    statusDeposit: Boolean,
    idLoan: {type: Schema.ObjectId, ref: 'Loan'}
});

module.exports = mongoose.model('Deposit', Deposit);