const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// valueIntertest: Number,
const Loan = Schema ({
    dateLoan: Date,
    amount: Number,
    rateInterest: Number,
    statusLoan: Boolean,
    finishedDatePayment: Date,
    idUser: String,
});

module.exports = mongoose.model('Loan', Loan);
