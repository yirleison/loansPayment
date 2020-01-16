const moment = require('moment');
const loanServices = require("../services/loans.service");
const Deposit = require('../models/deposit.model');
const { paymentLogger } = require("../../logger");
const { messages } = require("../utils/messages");
const consola = console.log;
const deposit = new Deposit();

const paymentRegister = async (req, res) => {
    paymentLogger.info({message: "Inicio de funcionabilidad para registrar un deposito"})
    const payload = req.body;

    try {
        let loanService = await loanServices.loanById(payload.idLoan);
        let nextDatePayment = loanServices.dateLoan;
        nextDatePayment = moment()
          .add(1, "month")
          .format("YYYY-MM-DD");
        consola(nextDatePayment);
        consola(payload);
        consola('loanService',loanService);
        deposit.dateDeposit = (payload.dateDeposit) ? deposit.dateDeposit= moment().format("YYYY-MM-DD") : null;
        //deposit.dateDeposit = moment().format("YYYY-MM-DD");
        deposit.valueDeposit = payload.valueDeposit;
        deposit.amount = payload.amount;
        deposit.interest = payload.interest;
        deposit.nextDatePayment = nextDatePayment;
        deposit.balanceLoand = payload.balanceLoand;
        deposit.statusDeposit = payload.payload;
        deposit.statusDeposit = payload.payload;
        deposit.idLoan = loanServices._id;

        paymentLogger.info({ message: "Modelo de deposito creado exitosamente", modelCreate: deposit });
    } catch (error) {
        res.status(500).send({
            status: "false",
            message: "Ha ocurrido un error al tratar de procesar la solicitud"
          });
    }
   


}

module.exports = {
    paymentRegister
}