const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// valueIntertest: Number,
const User = Schema ({
    name: String,
    fullName: String,
    documentType: String,
    documentNumber: String,
    accountType: String,
    accountNumber: String,
    email: String,
    password: String
});

module.exports = mongoose.model('User', User);