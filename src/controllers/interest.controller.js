const Interest = require("../models/interest.model");
const { messages } = require("../utils/messages");
const { interestLogger } = require("../../logger");
const BalanceCapital = require("../models/balanceCapital.model");
const ExpensesIcomes = require("../models/expensesIcomes.model");

//Services
const interestServices = require('../services/interest.service');
const expensesIcomesService = require('../services/expensesIcomes.service');
const balanceCapitalService = require('../services/balanceCapital.service');
const moment = require("moment");

let modelIcomeExpense;
let balanceCapital

const createInterest = (req, res) => {
    interestLogger.info({
        message: "Inicio de funcionabilidad para crear un interes en mora"
    });
    let payload = req.body;

    let interestModel = new Interest({
        dayPayment: payload.dayPayment = moment(payload.dayPayment).format("YYYY-MM-DD"),
        interestPending: payload.interestPending,
        state: payload.state,
        idPayment: payload.idPayment,
    });
    interestModel.save((error, interestSaved) => {
        if (error) {
            res.status(500).send({
                status: "false",
                message: "Ha ocurrido un error al tratar de registrar la solicitud"
            });
        } else {
            if (!interestSaved) {
                reject(error);
            }
            interestLogger.info({
                message: "Interest creado en la base de datos",
                interestSaved: interestSaved
            });
            res.status(200).send(messages('OK', interestSaved));
        }
    });
}

const listInterest = (req, res) => {
    interestLogger.info({
        message: "Inicio de funcionabilidad para listar Interest"
    });
    if (req.headers.sum == '1') {
        Interest.aggregate(
            [
                { $match: { 'state': true } },
                { $group: { _id: null, totalValue: { $sum: "$interestPending" } } },
            ]
        ).exec((error, interest) => {

            if (error) {
                res.status(500).send({
                    status: "false",
                    message: "La consulta a la base de datos no devolvio resultados"
                });
            } else {
                interestLogger.info({
                    message: "lista de Interest Realizada de manera exitosa", interest
                });
                res.status(200).send(messages("OK", interest));
            }
        });
    } else if (req.headers.sum == '2') {
        Interest.find({ state: false }, (error, interest) => {
            if (error) {
                res.status(500).send({
                    status: "false",
                    message: "La consulta a la base de datos no devolvio resultados"
                });
            } else {
                if (!interest) {
                    res.status(400).send({
                        status: "false",
                        message: "Error al tratar de procesar la solicitud"
                    });
                } else {
                    interestLogger.info({
                        message: "lista de Interest Realizada de manera exitosa", interest
                    });
                    res.status(200).send(messages("OK", interest));
                }
            }
        });
    }
    else {
        Interest.find({}, (error, interest) => {
            if (error) {
                res.status(500).send({
                    status: "false",
                    message: "La consulta a la base de datos no devolvio resultados"
                });
            } else {
                if (!interest) {
                    res.status(400).send({
                        status: "false",
                        message: "Error al tratar de procesar la solicitud"
                    });
                } else {
                    interestLogger.info({
                        message: "lista de Interest Realizada de manera exitosa", interest
                    });
                    res.status(200).send(messages("OK", interest));
                }
            }
        });
    }
}

const listInterestByIdPayment = (req, res) => {
    interestLogger.info({
        message: "Inicio de funcionabilidad para Interest pago por ID prestamo"
    });
    console.log(req.params.id)
    Interest.find({ idPayment: req.params.id }, (error, interest) => {
        if (error) {
            res.status(500).send({
                status: "false",
                message: "La consulta a la base de datos no devolvio resultados"
            });
        } else {
            if (!interest) {
                res.status(400).send({
                    status: "false",
                    message: "Error al tratar de procesar la solicitud"
                });
            } else {
                interestLogger.info({
                    message: "listar Interest por ID realizado exitosamente"
                });
                res.status(200).send(messages("OK", interest));
            }
        }
    });
}

const interestById = (req, res) => {
    interestLogger.info({
        message: "Inicio de funcionabilidad para Interest pago por ID"
    });
    Interest.findById({ _id: req.params.id }, (error, interest) => {
        if (error) {
            res.status(500).send({
                status: "false",
                message: "La consulta a la base de datos no devolvio resultados"
            });
        } else {
            if (!interest) {
                res.status(400).send({
                    status: "false",
                    message: "Error al tratar de procesar la solicitud"
                });
            } else {
                interestLogger.info({
                    message: "listar Interest por ID realizado exitosamente"
                });
                res.status(200).send(messages("OK", interest));
            }
        }
    });
}

const interestUpdateById = async (req, res) => {
    let payload = req.body
    interestLogger.info({
        message: "Inicio de funcionabilidad para actualizar un Interest"
    });
    Interest.findByIdAndUpdate(req.params.id, req.body, { new: true }, async (error, interestUpdate) => {
        if (error) {
            res.status(500).send({
                status: "false",
                message: "La consulta a la base de datos no devolvio resultados"
            });
        } else {
            if (!interestUpdate) {
                res.status(400).send({
                    status: "false",
                    message: "Error al tratar de procesar la solicitud"
                });
            } else {
                interestLogger.info({
                    message: "Interest actualizado exitosamente"
                });
                if (!interestUpdate.status) {
                    try {
                          balanceCapital = await expensesIcomesService.consultBalanceCapital();
                        balanceCapital = balanceCapital[0];                      
                        if (balanceCapital) {                          
                            modelIcomeExpense = createModelIcomeExpense(moment(payload.dayPayment).format("YYYY-MM-DD"), null, payload.interestPending, 0, 'Recaudos de Intereses pendientes', 3, interestUpdate._id.toString());
                            let expensesIcomesServiceResponse = await expensesIcomesService.createExpensesOrIcomes(modelIcomeExpense);
                            if (expensesIcomesServiceResponse) {
                                let modelCBalanceCapital = {
                                    balanceCapital: balanceCapital.balanceCapital,
                                    balanceInterest: (balanceCapital.balanceInterest + payload.interestPending),
                                    balanceCapitalAfter: balanceCapital.balanceCapital,
                                    balanceInterestAfter: balanceCapital.balanceInterest,
                                }
                                try {
                                    let updateBalanceCapital = await balanceCapitalService.updateCapital(modelCBalanceCapital,balanceCapital._id);
                                    if(updateBalanceCapital){
                                        res.status(200).send(messages("OK", interestUpdate));
                                    }
                                    else {
                                        console.log('falta retornar el error de update balance capital')
                                    }
                                } catch (error) {
                                    console.log('Error tratando de actualizar el balance capital ---->', error)
                                }
                            }
                        }
                        else {
                            console.log('falta retornar el error de balance capital')
                        }
                    } catch (error) {
                        console.log('Error tratando de listar el balance capital -->', error)
                    }
                }
                else {

                }
               
            }
        }
    });
}

const updateInteresById = (req, res) => {
    interestLogger.info({
        message: "Inicio de funcionabilidad para actualizar un interest por ID"
    });
    Interest.findByIdAndUpdate(_id, req.body, (error, interestUpdate) => {
        if (error) {
            res.status(500).send({
                status: "false",
                message: "La consulta a la base de datos no devolvio resultados"
            });
        } else {
            if (!interestUpdate) {
                res.status(400).send({
                    status: "false",
                    message: "Error al tratar de procesar la solicitud"
                });
            } else {
                interestLogger.info({
                    message: "interest actualizado exitosamente"
                });
                res.status(200).send(messages("OK", interestUpdate));
            }
        }
    });
}

const deleteInterest = (req, res) => {
    interestLogger.info({
        message: "Inicio de funcionabilidad para eliminar un interest por ID"
    });
    Interest.findByIdAndRemove(_id, (error, interestDelete) => {
        if (error) {
            res.status(500).send({
                status: "false",
                message: "La consulta a la base de datos no devolvio resultados"
            });
        } else {
            if (!interestDelete) {
                res.status(400).send({
                    status: "false",
                    message: "Error al tratar de procesar la solicitud"
                });
            } else {
                interestLogger.info({
                    message: "interest eliminado exitosamente"
                });
                res.status(200).send(messages("OK", interestDelete));
            }
        }
    });
}

const createModelIcomeExpense = (dateIncome, dateExpense, income, expenses, note, type, id) => {
    return {
        dateIncome,
        dateExpense,
        income: Number(parseFloat(income).toFixed(2)),
        expenses: Number(parseFloat(expenses).toFixed(2)),
        type,
        id,
        note
    }
}

module.exports = {
    createInterest,
    listInterest,
    interestById,
    interestUpdateById,
    listInterestByIdPayment,
    updateInteresById,
    deleteInterest
}
