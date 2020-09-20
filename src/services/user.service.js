const { userLogger } = require("../../logger");
const User = require("../models/user.model");
const { log } = require("winston");

const getUserById = (id) => {
  userLogger.info({
    message: "Inicio de funcionabilidad para listar usuario por ID",
  });
  return new Promise((resolve, reject) => {
    User.findOne({ _id: id }, (error, user) => {
        if (error) {
         return reject(error)
        } else {
          if (!user) {
            return reject(error)
          } else {
            return resolve(user)
          }
        }
      });
  });
};

module.exports = {
    getUserById,
};
