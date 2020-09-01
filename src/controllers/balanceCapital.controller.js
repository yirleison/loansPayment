const BalanceCapital = require('../models/balanceCapital.model')
const { balanceCapilalLogger } = require("../../logger");
const balanceCapitalService = require('../services/balanceCapital.service');
const { messages } = require("../utils/messages");

const createBalanceCapital = (req, res) => {
    let body = req.body
    modelBalanceCapita = new BalanceCapital(body)
    modelBalanceCapita.save((err,balanceCapitalSave) => {
        if (err) {
            res.status(500).send({
                status: "false",
                message: "Error al tratar de procesar la solicitud"
            });
        } else {
            if (!balanceCapitalSave) {
                return res.status(400).send({
                    status: "false",
                    message: "Error al tratar de procesar la solicitud"
                });
            } else {
                balanceCapilalLogger.info({
                    message: "listado de balance del capital realizado exitosamente",
                    balanceCapitalSave: balanceCapitalSave
                });
                res.status(200).send(messages("OK", balanceCapitalSave));
            }
        }
    });
}

const listBalanceCapital = (req, res) => {
    BalanceCapital.find({}, (err, balanceCapitalResult) => {
        if (err) {
            res.status(500).send({
                status: "false",
                message: "La consulta a la base de datos no devolvio resultados"
            });
        } else {
            if (!balanceCapitalResult) {
                return res.status(400).send({
                    status: "false",
                    message: "Error al tratar de procesar la solicitud"
                });
            } else {
                balanceCapilalLogger.info({
                    message: "listado de balance del capital realizado exitosamente",
                    balanceCapitalResult: balanceCapitalResult
                });
                res.status(200).send(messages("OK", balanceCapitalResult));
            }
        }
    });
}

const updateBalanceCapital = (req, res) => {
    BalanceCapital.findByIdAndUpdate(req.params.id, req.body, { new: true }, (error, balanceCapitalUpdate) => {
        if (error) {
            res.status(500).send({
                status: "false",
                message: "Error al tratar de procesar la solicitud"
            });
        } else {
            if (!balanceCapitalUpdate) {
                return res.status(400).send({
                    status: "false",
                    message: "Error al tratar de procesar la solicitud"
                });
            } else {
                balanceCapilalLogger.info({
                    message: "listado de balance del capital realizado exitosamente",
                    balanceCapitalUpdate: balanceCapitalUpdate
                });
                res.status(200).send(messages("OK", balanceCapitalUpdate));
            }
        }
    });
}

module.exports = {
    createBalanceCapital,
    listBalanceCapital,
    updateBalanceCapital
};
