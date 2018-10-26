//declaracion y definicion de modulos a utilizar
const http = require('http'),
    fs = require('fs'),
    url = require('url'),
    {
        parse
    } = require('querystring');

mimeTypes = {
    "html": "text/html",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "js": "text/javascript",
    "css": "text/css"
};

//creacion del servidor
http.createServer((req, res) => {
    //Control code.
    var pathname = url.parse(req.url).pathname;

    if (pathname == "/") {
        pathname = "../index.html";
    }

    //peticion de la pag principal
    if (pathname == "../index.html") {
        fs.readFile(pathname, (err, data) => {
            if (err) {
                console.log(err);
                // HTTP Status: 404 : NOT FOUND
                // En caso no haberse encontrado el archivo
                res.writeHead(404, {
                    'Content-Type': 'text/html'
                }); return res.end("404 Not Found");
            }
            // Pagina encontrada
            // HTTP Status: 200 : OK

            res.writeHead(200, {
                'Content-Type': mimeTypes[pathname.split('.').pop()] || 'text/html'
            });

            // Escribe el contenido de data en el body de la respuesta.
            res.write(data.toString());

            // Envia la respuesta 
            return res.end();
        });
    }

    //peticion de la hoja CSS
    if (pathname.split(".")[1] == "css") {
        fs.readFile(".." + pathname, (err, data) => {

            if (err) {
                console.log(err);
                res.writeHead(404, {
                    'Content-Type': 'text/html'
                }); return res.end("404 Not Found");
            }

            res.writeHead(200, {
                'Content-Type': mimeTypes[pathname.split('.').pop()] || 'text/css'
            });

            // Escribe el contenido de data en el body de la respuesta.
            res.write(data.toString());

            // Envia la respuesta 
            return res.end();
        });
    }

    //peticion POST a traves del formulario
    if (req.method === 'POST' && pathname == "/cv") {
        collectRequestData(req, (err, result) => {

            if (err) {
                res.writeHead(400, {
                    'content-type': 'text/html'
                });
                return res.end('Bad Request');
            }

            fs.readFile("../templates/plantilla.html", function (err, data) {
                if (err) {
                    console.log(err);
                    // HTTP Status: 404 : NOT FOUND
                    // Content Type: text/plain
                    res.writeHead(404, {
                        'Content-Type': 'text/html'
                    });
                    return res.end("404 Not Found");
                }

                res.writeHead(200, {
                    'Content-Type': mimeTypes[pathname.split('.').pop()] || 'text/html'
                });

                //Variables de control. 

                let parsedData = data.toString().replace('${dui}', result.dui)
                    .replace("${lastname}", result.lastname)
                    .replace("${firstname}", result.firstname)
                    .replace("${gender}", result.gender)
                    .replace("${civilStatus}", result.civilStatus)
                    .replace("${birth}", result.birth)
                    .replace("${exp}", result.exp)
                    .replace("${tel}", result.tel)
                    .replace("${std}", result.std);

                res.write(parsedData);
                return res.end();
            });

        });
    }
}).listen(8081);

//funcion recolectora
function collectRequestData(request, callback) {

    const FORM_URLENCODED = 'application/x-www-form-urlencoded';
    if (request.headers['content-type'] === FORM_URLENCODED) {
        let body = '';
        // Evento de acumulacion de data. 
        request.on('data', chunk => {
            body += chunk.toString();
        });
        // Data completamente recibida 
        request.on('end', () => {
            callback(null, parse(body));
        });
    } else {
        callback({
            msg: `The content-type don't is equals to ${FORM_URLENCODED}`
        });
    }

}

//PREGUNTAS
/*
¿Cuál es la principal función del módulo HTTP?
    Protocolo que nos permite realizar peticion de datos y recursos 

¿Cuál es la principal función del módulo FileSystem?
    Organiza los datos y mantenerlos despues que se haya terminado el programa

¿Qué es un MIME type?
    texto que tiene diferentes tipos de archivos donde los archivos se especifican en mimeTypes

¿Qué contienen las variables "req" y "res" en la creación del servidor?
    -req contiene el request (PETICION) del usuario
    -res contiene el response (RESPUESTA) del servidor

¿La instrucción .listen(number) puede fallar? Justifique.
    Si, porque puede que se le mande un puerto diferente al cual deberia de escuchar o al cual se le ha seteado escuchar

¿Por qué es útil la función "collectRequestData(...)"?
    Es donde esta contenida la informacion que se le da al usuario como respuesta

¿Para qué, además de conocer la dirección de la petición, es útil la variable "pathname"?
    redirecta al usuario justo a la parte que se desea ver
    por ejemplo en facebook.com/profile
    se recarga justo el perfil de facebook del usuario

¿Qué contine el parametro "data"?}
    Contiene la informacion del documento al cual se le llama

¿Cuál es la diferencia entre brindar una respuesta HTML y brindar una CSS?
    cambia el diseño en pantalla y se le puede dar estilo a la respuesta, no solo texto

¿Qué contiene la variable "result"?
    La informacion que el usuario lleno en el formulario

¿Por qué con la variable "data" se debe aplicarse el metodo toString()? Justifique.
    Para que el contenido de la informacion del documento sea legible


PREGUNTAS COMPLEMENTARIAS
¿Hay diferencia al quitar el control de peticiones para hojas CSS? Si sucedió algo distinto justifique por qué.
    El diseño de la respuesta que recibe el usuario de parte del servidor

¿Se puede inciar el servidor (node main.js) en cualquier sitio del proyecto? Cualquier respuesta justifique.
    No, ya que devuelve error con el modulo y el servidor no inicia
    EN CONSOLA (buscando fuera de app)
    *******************************
    module.js:549
    throw err;
    ^

    Error: Cannot find module '/home/estudiante/Escritorio/labo9/Laboratorio_09_00161417/Laboratorio09_NodeJS/main.js'
        at Function.Module._resolveFilename (module.js:547:15)
        at Function.Module._load (module.js:474:25)
        at Function.Module.runMain (module.js:693:10)
        at startup (bootstrap_node.js:188:16)
        at bootstrap_node.js:609:3
    ********************************

Con sus palabras, ¿Por qué es importante aprender Node.js sin el uso de frameworks a pesar que estos facilitan el manejo de API's?
    Porque el proceso es entendible e interactuamos con todo lo que pasa con el servidor
    y alcanzamos a comprender su funcionalidad
*/