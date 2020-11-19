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
const interestService = require("../services/interest.service");
const paymentService = require("../services/payment.service");

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

    let nameUser
    
    try {
        let consultPayment = await paymentService.paymentById(payload.idPayment)
        if(consultPayment){
            let { fullName } = consultPayment.idLoan.idUser
            nameUser = fullName
        }
        
    } catch (errorConsultPayment) {
        console.log('Error tratando de consultar el nombre del usuario por medio del pago ---> ', errorConsultPayment)
    }
    
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
                try {
                    balanceCapital = await expensesIcomesService.consultBalanceCapital();
                    balanceCapital = balanceCapital[0];             
                } catch (errorBalanceCapital) {
                    console.log('Error tratando de consultar el balance capital ----> ', errorBalanceCapital)
                }

                if (interestUpdate.state) {
                    try {                       
                        if (balanceCapital) {                          
                            modelIcomeExpense = createModelIcomeExpense(moment(payload.dayPayment).format("YYYY-MM-DD"), null, payload.interestPending, 0, `Recaudos de Intereses pendientes del cliente ${nameUser}`, 3, interestUpdate._id.toString());
                            let expensesIcomesServiceResponse = await expensesIcomesService.createExpensesOrIcomes(modelIcomeExpense);
                            if (expensesIcomesServiceResponse) {
                                let sumBalanceInterest = 0
                                let amoutRequest = parseFloat(payload.interestPending )
                                let amoutUpdate = parseFloat(balanceCapital.balanceInterest)
                                sumBalanceInterest = amoutUpdate + amoutRequest     
                                let modelCBalanceCapital = {
                                    balanceCapital: balanceCapital.balanceCapital,
                                    balanceInterest: sumBalanceInterest,
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
                    console.log('Eentro funcion para eliminar un expenses icomes y actualizar el balance capital')
                    try {
                        //let expensesIcomesDelete = await expensesIcomesService.deleteExpensesOrIcomes(payload.idPayment.toString())
                        let interestPending = await interestService.consulInterestPendingByIdPayment(payload.idPayment)
                        if(interestPending){
                           try {
                            let consulExpenesIcomes = await expensesIcomesService.consultExpensesOrIcomes(interestPending[0]._id)
                            if(consulExpenesIcomes){
                                try {
                                    let expensesIcomesDelete = await expensesIcomesService.deleteExpensesOrIcomes(consulExpenesIcomes[0]._id)
                                    if(expensesIcomesDelete){
                                        try {
                                            let modelCBalanceCapital = {
                                                balanceCapital: balanceCapital.balanceCapital,
                                                balanceInterest: balanceCapital.balanceInterest - interestPending[0].interestPending,
                                                balanceCapitalAfter: balanceCapital.balanceCapital,
                                                balanceInterestAfter:balanceCapital.balanceInterest - interestPending[0].interestPending,
                                            }
                                            let updateBalanceCapital = await balanceCapitalService.updateCapital(modelCBalanceCapital,balanceCapital._id);
                                            if(updateBalanceCapital){
                                                res.status(200).send(messages("OK", interestUpdate));
                                            }
                                            
                                        } catch (errorUpdateBalanceCapital) {
                                            console.log('Error tratando de actualizar el balance capital ---->', errorUpdateBalanceCapital)
                                        }
                                    }
                                } catch (errorExpensesIcomes) {
                                    console.log('Error tratando eliminar el expensesIcomes ---->', errorExpensesIcomes)
                                }
                               
                            }
                           } catch (errorExpensesIcomes) {
                            console.log('Error tratando de consultar el expenses icomes ---->', errorExpensesIcomes)
                           }
                           
                        }
                    } catch (errorInterestPending) {
                        console.log('Error tratando de consultar el interes pendiente ---->', errorInterestPending)
                    }

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

const deleteInterest = async (req, res) => {
    interestLogger.info({
        message: "Inicio de funcionabilidad para eliminar un interest por ID"
    });
    // Consultar el interes pendiente --- si el estado es false se puede eliminar de lo contrario no...
    try {
        let interestPending = await interestService.consulInterestPendingByIdPayment(req.params.id)
        console.log('interestPending ---------------> ',interestPending[0])
        if(interestPending[0].state){
            res.status(200).send(messages("false", 'No se ha podido eliminar este interes pendiente.'));
        }else {
            Interest.findByIdAndRemove(interestPending[0]._id, (error, interestDelete) => {
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
                        console.log('entro ---------------> 2')
                        interestLogger.info({
                            message: "interest eliminado exitosamente"
                        });
                        res.status(200).send(messages("OK", interestDelete));
                    }
                }
            });
        }
    } catch (errorInterestPending) {
        console.log('Error tratando de consultar el interes pendiente ---->', errorInterestPending)
    }
}

const interestByIdUser = (req, res) => {
    console.log(req.params.id)
}

const createModelIcomeExpense = (dateIncome, dateExpense, income, expenses, note, type, id) => {
    return {
        dateIncome,
        dateExpense,
        income: parseFloat(income).toFixed(2),
        expenses: parseFloat(expenses).toFixed(2),
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
    deleteInterest,
    interestByIdUser
}
