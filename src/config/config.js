 
//====================================
//Puerto
//===================================
process.env.PORT = process.env.PORT || 3000;


//====================================
//Entorno
//===================================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//====================================
//Vencimient token
//===================================
/***********************************
 *60 segundos                      *
 *60 minutos                       *
 *34 horas                         *
 *64 dias                          *
 ***********************************/
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

//===================================
//Secret key
//===================================
process.env.SECRET_KEY = process.env.SECRET_KEY || 'calve_secreta_curso';

//===================================
//Base de datos
//===================================

let urlDB;

 if (process.env.NODE_ENV === 'dev') {
     urlDB = 'mongodb://localhost:27017/loanPayment';
     //urlDB = 'mongodb://172.17.0.1:27017/loanPayment';
 }
 else {
    urlDB = process.env.MONGO_URI;
 }

process.env.URLDB = urlDB;

//===================================