const Interest = require("../models/interest.model");
const { messages } = require("../utils/messages");
const { interestLogger } = require("../../logger");
const moment = require("moment");


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
                    {$match : {'state': true}},
                    {$group: {_id: null,totalValue: { $sum: "$interestPending" }}},
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
    } else if(req.headers.sum == '2') {
        Interest.find({state: false}, (error, interest) => {
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
    console.log(req.params.id )
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

const interestUpdateById = (req, res) => {
    interestLogger.info({
        message: "Inicio de funcionabilidad para actualizar un Interest"
    });
    Interest.findByIdAndUpdate(req.params.id, req.body, {new: true},(error, interestUpdate) => {
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
                res.status(200).send(messages("OK", interestUpdate));
            }
        }
    });
}

module.exports = {
    createInterest,
    listInterest,
    interestById,
    interestUpdateById,
    listInterestByIdPayment
}
