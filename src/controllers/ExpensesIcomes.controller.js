const ExpensesIcomes = require("../models/expensesIcomes.model");
const BalanceCapital = require("../models/balanceCapital.model");
const { balanceInterestLogger } = require("../../logger");
const { messages } = require("../utils/messages");
const moment = require("moment");
const expensesIcomesService = require('../services/expensesIcomes.service');

const createExpeseIncome = async (req, res) => {
    var body = req.body;
    //console.log(body)
    expensesIncomeModel = new ExpensesIcomes();
    expensesIncomeModel.date = moment(body.dateIncome).format("YYYY-MM-DD");
    expensesIncomeModel.income = Number(parseFloat(body.income));
    expensesIncomeModel.expenses = Number(parseFloat(body.expenses));
    expensesIncomeModel.note = body.note;
    expensesIncomeModel.type = body.type;
    expensesIncomeModel.id = body.id;
    console.log(expensesIncomeModel)

    let auxInterest = 0;
    let auxCapital = 0;
    let payload;

    try {
        let balanceCapital = await expensesIcomesService.consultBalanceCapital();
        if (balanceCapital[0].balanceCapital == 0 && balanceCapital[0].balanceInterest == 0 && body.expenses > 0) {
            console.log('No se puede crear una salida de dinero por que no hay saldo en caja')
        }
        else {
            if (body.type == 1) {
                if (body.expenses > balanceCapital[0].balanceInterest) {
                    auxInterest = (body.expenses - balanceCapital[0].balanceInterest);
                    if ((auxInterest - balanceCapital[0].balanceCapital)) {
                        auxCapital = (balanceCapital[0].balanceCapital - auxInterest);
                        payload = {
                            balanceCapital: auxCapital,
                            balanceInterest: 0,
                            balanceCapitalAfter: balanceCapital[0].balanceCapital,
                            balanceInterestAfter: balanceCapital[0].balanceInterest
                        }
                    }
                }
                if (body.expenses < balanceCapital[0].balanceInterest) {
                    auxInterest = (balanceCapital[0].balanceInterest - body.expenses);
                    payload = {
                        balanceCapital: balanceCapital[0].balanceCapital,
                        balanceInterest: auxInterest,
                        balanceCapitalAfter: balanceCapital[0].balanceCapital,
                        balanceInterestAfter: balanceCapital[0].balanceInterest
                    }
                }
                if (body.expenses == balanceCapital[0].balanceInterest) {
                    payload = {
                        balanceCapital: balanceCapital[0].balanceCapital,
                        balanceInterest: 0,
                        balanceCapitalAfter: balanceCapital[0].balanceCapital,
                        balanceInterestAfter: balanceCapital[0].balanceInterest
                    }
                }
                if (body.expenses > balanceCapital[0].balanceInterest) {
                    auxInterest = (body.expenses - balanceCapital[0].balanceInterest);
                    if (auxInterest == balanceCapital[0].balanceCapital) {
                        payload = {
                            balanceCapital: 0,
                            balanceInterest: 0,
                            balanceCapitalAfter: balanceCapital[0].balanceCapital,
                            balanceInterestAfter: balanceCapital[0].balanceInterest
                        }
                    }
                }
            }
            if (body.type == 0) {
                payload = {
                    balanceCapital: (balanceCapital[0].balanceCapital + parseFloat(body.income)),
                    balanceInterest: (balanceCapital[0].balanceInterest),
                    balanceCapitalAfter: balanceCapital[0].balanceCapital,
                    balanceInterestAfter: balanceCapital[0].balanceInterest
                }
            }
            try {
                let expensesIncomes = await expensesIcomesService.createExpensesOrIcomes(expensesIncomeModel)
                if (expensesIncomes) {
                    try {
                        let updateCapital = await expensesIcomesService.updateCapital(payload, balanceCapital[0]._id);
                        if (updateCapital) {
                          return  res.status(200).send(messages("OK", updateCapital));
                            //console.log('Respuesta actulizacion balance capital',updateCapital)
                        }
                    } catch (errorUpdateCapital) {
                        console.log('Error al actualizar el capital', errorUpdateCapital);
                      return  res.status(200).send(messages("false", 'Ha ocurrido un error interno al tratar de procesar esta solicitud.'));
                    }
                }
            } catch (errorCreateExpensesIncomes) {
              console.log('Error al creat una entrada o salida de dinero', errorCreateExpensesIncomes);
              return  res.status(200).send(messages("false", 'Ha ocurrido un error interno al tratar de procesar esta solicitud.'));
            }
        }
    } catch (error) {
        console.log('error', error);
    }
}

const lastBalanceInterest = (req, res) => {
    ExpensesIcomes.find({}).sort({ income: '-1' }).exec((err, balanceInterest) => {
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
        if (!listCapital) {
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
    createExpeseIncome,
    lastBalanceInterest,
    createCapital,
    listCapital
}