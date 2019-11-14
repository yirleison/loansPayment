const mongoose = require('mongoose');
const Schema = mongoose.Schema;

loandtSchema = new Schema ({
    dateLoan: Date,
    amount: Number,
    rateInterest: Number,
    valueIntertest: Number,
    nextDatePayment: String,
    statusLoan: Boolean,
    idUser: String
});

module.exports = mongoose.model('Loand', loandtSchema);