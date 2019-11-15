const Loan = require('../models/loan.model');
const Deposit = require('../models/deposit.model');
const moment = require('moment');
const { loanLogger } = require('../../logger');
const consola = console.log;

const loan = new Loan();

const createLoand = (req, res) => {
    let body = req.body;
    body.dateLoan = moment().format('YYYY-MM-DD');
    let dateLoan = body.dateLoan;
    let nextDatePayment = dateLoan;

    nextDatePayment = moment().add(1, 'month').format('YYYY-MM-DD');
    loan.dateLoan = dateLoan;
    loan.amount = parseFloat(body.amount);
    loan.rateInterest = body.rateInterest;
    loan.valueIntertest = parseFloat(body.valueIntertest);
    loan.statusLoan = false;
    loan.idUser = body.idUser;

    loanLogger.info({ message: 'Modelo creado exitosamente', modelCreate: loan });

    let session = user.startSession();
    session.startSession();

    loan.save(function (error, loanSave) {

        if (error) {
            res.status(500).send({
                status: 'false',
                message: 'Ha ocurrido un error al tratar de registrar la solicitud'
            });
        }
        else {
            if (!loanSave) {
                res.status(400).send({
                    status: 'false',
                    message: 'Error al tratar de procesar la solicitud'
                })
            }

            //Aqui mandamos a crear la primera cuota de pago del cliente
            res.status(200).send({
                status: 'Ok',
                loanSave
            });
        }
    });
}

module.exports = {
    createLoand
}