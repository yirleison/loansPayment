'use strict'

let jwt = require('jwt-simple');
let moment = require('moment');



// Función para generar el token con clave seceta....
 exports.createToken = function(user) {
	let payload = {
		sub: user._id,
		name: user.fullName,
		email: user.email,
		role: user.role,
		image: user.image,
		iat: moment().unix(),
		exp: moment().add(5, 'minutes').unix
	};

	return jwt.encode(payload, process.env.SECRET_KEY);
 };