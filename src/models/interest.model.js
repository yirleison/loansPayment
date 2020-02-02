const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InterestSchema = new Schema({
    dayPayment: Date,
    interestPending: Number,
    state: Boolean,
    idPayment: { type: Schema.ObjectId, ref: 'Payment' }
});

module.exports = mongoose.model('Interest', InterestSchema);