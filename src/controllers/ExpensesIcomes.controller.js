const ExpensesIcomes = require("../models/expensesIcomes.model");
const BalanceCapital = require("../models/balanceCapital.model");
const { balanceInterestLogger } = require("../../logger");
const { messages } = require("../utils/messages");
const moment = require("moment");
const expensesIcomesService = require('../services/expensesIcomes.service');

const createBalanceInterest = async (req, res) => {
    var body = req.body;
    console.log(body)
    balanceInteres = new ExpensesIcomes();
    balanceInteres.dateIncome = moment(body.dateIncome).format("YYYY-MM-DD");
    balanceInteres.dateExpense = null;
    balanceInteres.income = Number(parseFloat(body.income));
    balanceInteres.expenses = Number(parseFloat(body.expenses));
    balanceInteres.balanceInterest = Number(parseFloat(body.balanceInterest));
    balanceInteres.note = body.note;
    let auxInterest = 0;
    let auxCapital = 0;
    let payload;

    try {
        let balanceCapital = await expensesIcomesService.consultBalanceCapital();
        console.log(balanceCapital[0]._id)
        if (balanceCapital[0].balanceCapital == 0 && balanceCapital[0].balanceInterest == 0 && body.expenses > 0) {
            console.log('No se puede crear una salida de dinero por que no hay saldo en caja')
        }
        else {
            if (body.expenses) {
                if (body.expenses > balanceCapital[0].balanceInterest) {
                    auxInterest = (body.expenses - balanceCapital[0].balanceInterest);
                    if ((auxInterest - balanceCapital[0].balanceCapital)) {
                        auxCapital = (balanceCapital[0].balanceCapital - auxInterest);
                        payload = {
                            balanceCapital: auxCapital,
                            balanceInterest: 0,
                        }
                    }
                }
                if (body.expenses < balanceCapital[0].balanceInterest) {
                    auxInterest = (balanceCapital[0].balanceInterest - body.expenses);
                    payload = {
                        balanceCapital: balanceCapital[0].balanceCapital,
                        balanceInterest: auxInterest,
                    }
                }
                if (body.expenses == balanceCapital[0].balanceInterest) {
                    payload = {
                        balanceCapital: balanceCapital[0].balanceCapital,
                        balanceInterest: 0,
                    }
                }
                if (body.expenses > balanceCapital[0].balanceInterest) {
                    auxInterest = (body.expenses - balanceCapital[0].balanceInterest);
                    if (auxInterest == balanceCapital[0].balanceCapital) {
                        payload = {
                            balanceCapital: 0,
                            balanceInterest: 0,
                        }
                    }
                }
            }
            //Actualizo la colección de balance capital...
            try {

                let updateCapital = await expensesIcomesService.updateCapital(payload, balanceCapital[0]._id);
                console.log(updateCapital);
            } catch (error) {
                console.log('error', error);
            }
            console.log(auxInterest, auxCapital)
        }
    } catch (error) {
        console.log('error', error);
    }
}

const lastBalanceInterest = (req, res) => {
    BalanceInterest.find({}).sort({ _id: '-1' }).exec((err, balanceInterest) => {
        if (err) {
            res.status(500).send({
                status: "false",
                message: "La consulta a la base de datos no devolvio resultados"
            });
        }
        else {
            if (!balanceInterest) {
                res.status(500).send({
                    status: "false",
                    message: "La consulta a la base de datos no devolvio resultados"
                });
            }
            res.status(200).send(messages("OK", balanceInterest));
        }
    });
}
const createCapital = async (req, res) => {
    let body = req.body;
    let balanceCapitalModel = new BalanceCapital({
        balanceCapital: body.balanceCapital,
        balanceInterest: body.balanceInterest
    });

    try {
        let balanceCapital = await expensesIcomesService.createCapital(balanceCapitalModel);
        if (!balanceCapital) {
            res.status(500).send({
                status: "false",
                message: "Ha ocurrido un error al tratar de registrar la solicitud"
            });
        }
        else {
            res.status(200).send(messages("OK", balanceCapital));
        }
    } catch (error) {
        console.log(error)
    }
}

const listCapital = async (req, res) => {
    try {
        let listCapital = await expensesIcomesService.consultBalanceCapital();
        console.log(listCapital)
        if(!listCapital) {
            res.status(500).send({
                status: "false",
                message: "Ha ocurrido un error al tratar de registrar la solicitud"
            });
        }
        else {
            res.status(200).send(messages("OK", listCapital));
        }
        
    } catch (error) {
        res.status(500).send({
            status: "false",
            message: "Ha ocurrido un error al tratar de registrar la solicitud"
        });
         console.log(error)
    }
}

const createModelBalanceInterest = (dateIncome, dateExpense, income, expenses, balanceInterest, note, payer) => {
    return {
        dateIncome,
        dateExpense,
        income: Number(parseFloat(income)),
        expenses: Number(parseFloat(expenses)),
        balanceInterest,
        note,
        payer
    }
}

module.exports = {
    createBalanceInterest,
    lastBalanceInterest,
    createCapital,
    listCapital
}