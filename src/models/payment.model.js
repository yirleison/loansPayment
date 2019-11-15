var mongoose = require('mongoose');
var Schema = mongoose.Schema;

paymentSchema = new Schema ({
    fechaPago: Date,
    valor: Number,
    proximaFecha: Number,
    descripcion: String
});

module.exports = mongoose.model('Payment', paymentSchema);