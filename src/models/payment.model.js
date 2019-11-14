const mongoose = require('mongoose');

paymentSchema = mongoose.Schema ({
    fechaPago: Date,
    valor: Number,
    proximaFecha: Number,
    descripcion: String
});

module.exports = mongoose.model('Payment', paymentSchema);