const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// valueIntertest: Number,
const User = Schema ({
    fullName: String,
    documentType: String,
    documentNumber: String,
    accountType: String,
    accountNumber: String,
    bank: String,
    phone: String,
    email: String,
    password: String,
    photo: String,
    status: String
});

module.exports = mongoose.model('User', User);