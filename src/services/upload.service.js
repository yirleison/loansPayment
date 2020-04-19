const fileUpload = require('express-fileupload');
var express = require('express');
var app = express();
const path = require('path')

var moment = require('moment');

app.use(fileUpload());
module.exports.uploapFile = (req, res) => {

    let tipo = req.query.tipo;
    let tipos_validos = ['productos', 'usuario'];

    if (tipos_validos.indexOf(tipo) < 0) {

        return res.status(400).send(
            {
                ok: false,
                err: {
                    message: `Los tipos permitidos son ${tipos_validos.join(', ')}`
                }

            });
    }

    if (!req.files) {
        return res.status(400).send(
            {
                ok: false,
                err: {
                    message: 'No se seleccionado ningún archivo'
                }

            });
    }

    let archivo = req.files.archivo;
    //console.log(req.files)
    //valido la extensión del archivo...
    let ext_file = ['png', 'jpg', 'jpge', 'mpge', 'mpg', 'gif'];

    let ext_type = archivo.name.split('.')[1];

    if (ext_file.indexOf(ext_type) < 0) {

        return res.status(400).send(
            {
                ok: false,
                err: {
                    message: `formato de archivo ${archivo.name} no valido, extensiones permitidas son ${ext_file.join(', ')}`
                }

            });
    }
    else {
        //Use the mv() method to place the file somewhere on your server
        //cambiar el nombre al archivo
        let date = new Date();
        var d = new Date();
        var m = moment(d).format("YYYY-MM-DD-h:mm:ss");

        let fecha_archivo = m.toString();
        fecha_archivo = fecha_archivo.split('-').slice(0, 3).join('_ ');
        let nombre_archivo = fecha_archivo +'_'+ date.getMilliseconds()
       // console.log(path.dirname.toString())
        archivo.mv(`uploads\\${tipo}\\${nombre_archivo}.${ext_type}`, function (err) {
            if (err)
                return res.status(500).send(
                    {
                        ok: false,
                        err: {
                            message: 'No se pudo subir el archivo archivo',
                            err
                        }

                    });

            res.json({
                ok: true,
                message: `Se ha subido el archivo satisfactoriamente`,
                nameImagen: nombre_archivo+'.'+ext_type
            })
        });
    }
}