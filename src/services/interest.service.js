const Interest = require("../models/interest.model");
const { messages } = require("../utils/messages");
const { interestLogger } = require("../../logger");

const createInteresPending = async (idPayment, interestModel) => {
    let interest = new Interest(interestModel);
    interestLogger.info({
        message: "Inicio de funcionabilidad para crear un interes en mora"
      });
    return new Promise((resolve,reject) => {
        interest.save((error, interestSaved) => {
            if (error) {
              res.status(500).send({
                status: "false",
                message: "Ha ocurrido un error al tratar de registrar la solicitud"
              });
            } else {
              if (!interestSaved) {
              reject({error: 'Ha ocurrido un error al tratar de crear el registro para mora de interes'});
              }
              interestLogger.info({
                message: "Interest creado en la base de datos",
                interestSaved: interestSaved
              });
               resolve(interestSaved)
            }
          });
    });
}

const consulInterestPending = async (idPayment) => {
    return new Promise((reject, resolve) => {

    })
}

module.exports = {
    createInteresPending,
    consulInterestPending
}