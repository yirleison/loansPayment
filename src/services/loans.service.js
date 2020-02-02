const Loan = require("../models/loan.model");
const { messages } = require("../utils/messages");
const { loanLogger } = require("../../logger");

const loanById  = async (id) => {
  loanLogger.info({
    message: "Inicio de funcionabilidad para el servicio listar prestamo por ID"
  });

  return new Promise((resolve, reject) => {
    Loan.findOne({ _id: id }, (error, loan) => {
        if (error) {
            reject(false);
        } else {
          if (!loan) {
            reject(false);
          } else {
            resolve(loan)
          }
        }
      });
  })
};

const loanUpdate = (idLoan, payload) => {
  loanLogger.info({
    message: "Inicio de funcionabilidad para el servicio actualizar prestamo por ID"
  });
  return new Promise((resolve, reject) => {
    Loan.findByIdAndUpdate(idLoan,payload, (error, loanUpdate) => {
      if (error) {
        reject(error);
      } else {
        if (!loanUpdate) {
         reject(error);
        } else {
          loanLogger.info({
            message: "Prestamo actualizado exitosamente"
          });
          resolve(loanUpdate)
        }
      }
    });
  })
}

module.exports = {
  loanById,
  loanUpdate
};
