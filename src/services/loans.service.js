const Loan = require("../models/loan.model");
const Payment = require("../models/Payment.model");
const { messages } = require("../utils/messages");
const { loanLogger } = require("../../logger");
const { paymentById, paymenUpdateById } = require("./payment.service");
const { paymentByIdLoan } = require("../controllers/payment.controller");
const { compareSync } = require("bcrypt");

const loanById = async (id) => {
  loanLogger.info({
    message: "Inicio de funcionabilidad para el servicio listar prestamo por ID"
  });

  return new Promise((resolve, reject) => {
    Loan.findOne({ _id: id }).populate({ path: 'idUser' }).exec((error, loan) => {
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

const loanByIdUser = async (id) => {
  let idUser = id.toString().trim()
  loanLogger.info({
    message: "Inicio de funcionabilidad para el servicio listar prestamo por ID"
  });
  return new Promise((resolve, reject) => {
    let y
    Loan.find({ idUser: idUser }, (error, loans) => {
      if (error) {
        console.error(error)
        reject(error);
        return;
      } else {
        resolve(loans);
      }
    })
  })
};

const loanUpdate = (idLoan, payload) => {
  loanLogger.info({
    message: "Inicio de funcionabilidad para el servicio actualizar prestamo por ID"
  });
  return new Promise((resolve, reject) => {
    Loan.findByIdAndUpdate(idLoan, payload, (error, loanUpdate) => {
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

const updateLoanError = (idLoan) => {
  paymentByIdLoanResponse = paymentByIdLoan(idLoan)
  loanLogger.info({
    message: "Inicio funcionalidad para solucionar error en el valor del prestamo"
  })
  if (paymentByIdLoanResponse) {
    if (paymentByIdLoanResponse[0].length > 1) {
      loanLogger.info({
        message: "hay mas de un pago ya realizado, comuniquese con el ADMINISTRADOR"
      })

    }/*if(paymentByIdLoanResponse[0].length==1){
        

      }*/
  }

}

module.exports = {
  loanById,
  loanUpdate,
  loanByIdUser
};
