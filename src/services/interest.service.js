const Interest = require("../models/interest.model");
const { messages } = require("../utils/messages");
const { interestLogger } = require("../../logger");

const createInteresPending = async (interestModel) => {
  let interest = new Interest(interestModel);
  interestLogger.info({
    message: "Inicio de funcionabilidad para crear un interes en mora"
  });
  return new Promise((resolve, reject) => {
    interest.save((error, interestSaved) => {
      if (error) {
        res.status(500).send({
          status: "false",
          message: "Ha ocurrido un error al tratar de registrar la solicitud"
        });
      } else {
        if (!interestSaved) {
          reject({ error: 'Ha ocurrido un error al tratar de crear el registro para mora de interes' });
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

const consulInterestPending = async (id) => {
  interestLogger.info({
    message: "Funcionabilidad para listar un Interests por ID"
  });
  return new Promise((reject, resolve) => {
    Interest.findOne({ _id: id }, (error, interest) => {
      if (error) {
        reject(false);
      } else {
        if (!interest) {
          reject(false);
        } else {
          interestLogger.info({
            message: "Interests por ID listado exitosamente",
            interestSaved: interest
          });
          resolve(interest);
        }
      }
    });
  })
}

const consulInterestPendingByIdPayment = async (idPayment) => {
  interestLogger.info({
    message: "Funcionabilidad para listar un Interests por ID de pago" + idPayment
  });
  return new Promise((resolve,reject) => {
    Interest.find({idPayment: idPayment}, (error, interest) => {
      if (error) {
        reject(false);
      } else {
        if (!interest) {
          reject(false);
        } else {
          interestLogger.info({
            message: "Interests por ID listado exitosamente",
            interest: interest
          });
          resolve(interest);
        }
      }
    });
  })
}

const interestUpdateById = (id, payload) => {
  interestLogger.info({
    message: "Inicio de funcionabilidad para actualizar un Interest"
  });
  return new Promise((resolve, reject) => {
    Interest.findByIdAndUpdate(id, payload, (error, interestUpdate) => {
      if (error) {
        reject(error);
      } else {
        if (!interestUpdate) {
          reject(error);
        }
        interestLogger.info({
          message: "Interest actualizado en la base de datos",
          interestUpdate: interestUpdate
        });
        resolve(interestUpdate);
      }
    });
  });
}

const listInterestPending = () => {
  interestLogger.info({
    message: "Funcionabilidad para listar todos los intereses"
  });
  return new Promise((resolve,reject) => {
    Interest.find({}, (error, interest) => {
      if (error) {
        reject(false);
      } else {
        if (!interest) {
          reject(false);
        } else {
          interestLogger.info({
            message: "Consulta lista de interes exitosamente",
            interest: interest
          });
          resolve(interest);
        }
      }
    });
  })
}

module.exports = {
  createInteresPending,
  consulInterestPending,
  interestUpdateById,
  consulInterestPendingByIdPayment,
  listInterestPending
}