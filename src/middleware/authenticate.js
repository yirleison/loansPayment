'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');

exports.ensuerAuth = function(req, res, next) {

	if(!req.headers.authorization) {
		return res.status(403).send({message: 'La peticion no tiene la cabecera de autenticacion'});
	}

	else {
		//Con replace quito las posibles comillas que me puedan llegar en el string token..
		var token = req.headers.authorization.replace(/['"]+/g, '');
		
		try {
			var payload = jwt.decode(token, process.env.SECRET_KEY);
			
			if(payload.exp <= moment().unix()) {
				return res.status(401).send({message: 'El token ha expirado'});
			}
		}

		catch(ex) {
			//console.log(ex);
			return res.status(404).send({message: 'Token no valido'});
		}

		req.user = payload;
	}
	// con next me salgo de la función...
	next();
};