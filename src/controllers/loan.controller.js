const LoandtSchema = require('../models/loan.model');
const moment = require('moment');
const consola = console.log;

const createLoand = (req, res) => {
    consola('Entro a createLoand')
    let body = req.body;
    let dateLoan = moment().format(body.dateLoan);
    let nextDatePayment = dateLoan;
    nextDatePayment = moment().add(1, 'month').format('DD-MM-YYYY');
    consola(nextDatePayment);

    const loanModel = new LoandtSchema({
        dateLoan: moment().format(body.dateLoan),
        amount: parseFloat(body.amount),
        rateInterest: body.rateInterest,
        valueIntertest: body.valueIntertest,
        nextDatePayment: nextDatePayment,
        statusLoan: false,
        idUser: body.idUser
    });

    loanModel.save((error, loanSave)=>{
        if(error){
            res.status(500).send({
                status: 'false',
                message: 'Ha ocurrido un error al tratar de registrar la solicitud'
            });
        }
        else {
            if(!loanSave) {
                res.status(400).send({
                    status: 'false',
                    message: 'Error al tratar de procesar la solicitud'
                })
            }
            res.status(500).send({
                status: 'Ok',
               loanSave
            });
        }
    })

}

module.exports = {
    createLoand
}