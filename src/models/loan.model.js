const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Loan = Schema ({
    dateLoan: Date,
    amount: Number,
    rateInterest: Number,
    valueIntertest: Number,
    statusLoan: Boolean,
    idUser: String,
});

module.exports = mongoose.model('Loan', Loan);
