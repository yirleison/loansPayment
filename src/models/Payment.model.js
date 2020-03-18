const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Payment = Schema ({
    dateDeposit: String,
    amount: Number,
    interest: Number,
    nextDatePayment: String,
    balanceLoand: Number,
    statusDeposit: Boolean,
    idLoan: {type: Schema.ObjectId, ref: 'Loan'}
});

module.exports = mongoose.model('Payment', Payment);