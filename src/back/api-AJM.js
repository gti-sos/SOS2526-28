// api-AJM.js
import util from 'util';

// PARCHE PARA NEDB EN VERSIONES MODERNAS DE NODE
util.isDate = util.types.isDate;
util.isRegExp = util.types.isRegExp;
util.isArray = Array.isArray;

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Datastore = require('nedb');

const BASE_API_URL = "/api/v1/beneficial-ownership-merchant-fleets";

export default function (app) {
    // Redirección a la documentación de Postman 
    app.get(`${BASE_API_URL}/docs`, (req, res) => {
        res.redirect("https://documenter.getpostman.com/view/52406665/2sBXigLsxq");
    });

    // Inicializo la base de datos
    const db = new Datastore({ filename: './data/ajm.db', autoload: true });

    const datosIniciales = [
        { year: 2014, flag_of_registration_label: "Antigua and Barbuda", beneficial_ownership_label: "Australia", dead_weight_tons: 12.6, percentage_of_total_fleet: 9.796, number_of_ships: 1 },
        { year: 2014, flag_of_registration_label: "Antigua and Barbuda", beneficial_ownership_label: "China, Hong Kong SAR", dead_weight_tons: 79.56, percentage_of_total_fleet: 61.472, number_of_ships: 8 },
        { year: 2014, flag_of_registration_label: "Antigua and Barbuda", beneficial_ownership_label: "Colombia", dead_weight_tons: 3.6, percentage_of_total_fleet: 2.781, number_of_ships: 1 },
        { year: 2014, flag_of_registration_label: "Antigua and Barbuda", beneficial_ownership_label: "Cyprus", dead_weight_tons: 16.278, percentage_of_total_fleet: 12.576, number_of_ships: 2 },
        { year: 2014, flag_of_registration_label: "Antigua and Barbuda", beneficial_ownership_label: "Denmark", dead_weight_tons: 35.395, percentage_of_total_fleet: 27.345, number_of_ships: 4 },
        { year: 2014, flag_of_registration_label: "Antigua and Barbuda", beneficial_ownership_label: "Estonia", dead_weight_tons: 27.789, percentage_of_total_fleet: 21.469, number_of_ships: 7 },
        { year: 2014, flag_of_registration_label: "Antigua and Barbuda", beneficial_ownership_label: "Germany", dead_weight_tons: 12232.14, percentage_of_total_fleet: 9450.155, number_of_ships: 1056 },
        { year: 2014, flag_of_registration_label: "Antigua and Barbuda", beneficial_ownership_label: "Greece", dead_weight_tons: 7.496, percentage_of_total_fleet: 5.791, number_of_ships: 2 },
        { year: 2014, flag_of_registration_label: "Antigua and Barbuda", beneficial_ownership_label: "Iceland", dead_weight_tons: 58.93, percentage_of_total_fleet: 45.53, number_of_ships: 7 },
        { year: 2014, flag_of_registration_label: "Antigua and Barbuda", beneficial_ownership_label: "Latvia", dead_weight_tons: 36.465, percentage_of_total_fleet: 28.172, number_of_ships: 10 }
    ];

    // CARGA INICIAL ////////////////////////////////////////////////////////////////////
    app.get(`${BASE_API_URL}/loadInitialData`, (req, res) => {
        db.find({}, (err, docs) => {
            if (err) {
                console.log("Fallo en db.find:", err);
                return res.status(500).send("ERROR REAL EN FIND: " + err.message); // ERROR A POSTMAN
            } 
            
            if (docs.length === 0) {
                db.insert(datosIniciales, (err, newDocs) => {
                    if (err) {
                        console.log("Fallo en db.insert:", err);
                        return res.status(500).send("ERROR REAL EN INSERT: " + err.message); // ERROR A POSTMAN
                    } 
                    
                    const datosSinId = newDocs.map(doc => {
                        delete doc._id;
                        return doc;
                    });
                    res.status(201).json(datosSinId); 
                });
            } else {
                const datosSinId = docs.map(doc => {
                    delete doc._id;
                    return doc;
                });
                res.status(200).json(datosSinId); 
            }
        });
    });

    // OPERACIONES SOBRE LA COLECCIÓN   ///////////////////////////////////////////////////

    // GET: Obtengo lista (200 OK)  GET: Obtengo lista con BÚSQUEDAS y PAGINACIÓN
    app.get(BASE_API_URL, (req, res) => {
        // Obtengo todos los parámetros de la URL (?year=2014&limit=5...)
        const query = req.query;

        // Extraigo la paginación (limit y offset)
        const limit = query.limit ? parseInt(query.limit) : 0; // Si no hay limit, es 0 (da todos)
        const offset = query.offset ? parseInt(query.offset) : 0; // Si no hay offset, es 0 (no salta ninguno)

        // Los borro de la query para que NeDB no intente buscar un barco que se llame "limit"
        delete query.limit;
        delete query.offset;

        // Convierto a número los campos numéricos (porque por la URL llegan como texto)
        if (query.year) query.year = parseInt(query.year);
        if (query.dead_weight_tons) query.dead_weight_tons = parseFloat(query.dead_weight_tons);
        if (query.percentage_of_total_fleet) query.percentage_of_total_fleet = parseFloat(query.percentage_of_total_fleet);
        if (query.number_of_ships) query.number_of_ships = parseInt(query.number_of_ships);

        // Hago la búsqueda en NeDB aplicando el filtro, el salto y el límite
        db.find(query).skip(offset).limit(limit).exec((err, docs) => {
            if (err) {
                return res.status(500).send("Error interno del servidor");
            } else {
                const datosSinId = docs.map(doc => {
                    delete doc._id;
                    return doc;
                });
                res.status(200).json(datosSinId);
            }
        });
    });
    

    // POST: Creo un nuevo recurso (201 Created, 400 Bad Request, 409 Conflict)
    app.post(BASE_API_URL, (req, res) => {
        const nuevoDato = req.body;

        // Valído que vengan todos los campos (Tarea 12)
        if (!nuevoDato.year || !nuevoDato.flag_of_registration_label || !nuevoDato.beneficial_ownership_label || !nuevoDato.dead_weight_tons || !nuevoDato.percentage_of_total_fleet || !nuevoDato.number_of_ships) {
            return res.status(400).send("Bad Request: Faltan campos obligatorios");
        }

        // Valído que no exista en la base de datos
        db.find({ year: nuevoDato.year, flag_of_registration_label: nuevoDato.flag_of_registration_label, beneficial_ownership_label: nuevoDato.beneficial_ownership_label }, (err, docs) => {
            if (err) {
                return res.status(500).send("Error interno del servidor");
            }
            if (docs.length > 0) {
                return res.status(409).send("Conflict: El recurso ya existe.");
            } else {
                db.insert(nuevoDato, (err, newDoc) => {
                    if (err) {
                        return res.status(500).send("Error interno del servidor");
                    }
                    res.status(201).send("Created: Recurso creado correctamente.");
                });
            }
        });
    });

    // PUT: Intento actualizar la lista completa (405 Method Not Allowed)
    app.put(BASE_API_URL, (req, res) => {
        res.status(405).send("Method Not Allowed: No se puede actualizar la colección completa");
    });

    // DELETE: Borro la lista completa (200 OK)
    app.delete(BASE_API_URL, (req, res) => {
        db.remove({}, { multi: true }, (err, numRemoved) => {
            if (err) {
                res.status(500).send("Error interno del servidor");
            } else {
                res.status(200).send("OK: Lista de recursos borrada");
            }
        });
    });


    // OPERACIONES SOBRE UN RECURSO CONCRETO (/pais/año)    //////////////////////////////////////////////
    // GET: Obtengo un recurso concreto (200 OK, 404 Not Found)
    app.get(`${BASE_API_URL}/:year/:flag/:owner`, (req, res) => {
        const year = parseInt(req.params.year);
        const flag = req.params.flag;
        const owner = req.params.owner;

        db.find({ year: year, flag_of_registration_label: flag, beneficial_ownership_label: owner }, (err, docs) => {
            if (err) {
                return res.status(500).send("Error interno del servidor");
            }
            if (docs.length > 0) {
                const datosSinId = docs.map(doc => {
                    delete doc._id;
                    return doc;
                });
                res.status(200).json(datosSinId[0]);
            } else {
                res.status(404).send("Not Found: Recurso no encontrado");
            }
        });
    });

    // POST: Intento crear un recurso concreto (405 Method Not Allowed)
    app.post(`${BASE_API_URL}/:year/:flag/:owner`, (req, res) => {
        res.status(405).send("Method Not Allowed: No se puede hacer POST a un recurso concreto");
    });

    // PUT: Actualizo un recurso concreto
    app.put(`${BASE_API_URL}/:year/:flag/:owner`, (req, res) => {
        const year = parseInt(req.params.year);
        const flag = req.params.flag;
        const owner = req.params.owner;
        const cuerpo = req.body;

        // Compruebo que las TRES variables coinciden con las del cuerpo
        if (cuerpo.year !== year || cuerpo.flag_of_registration_label !== flag || cuerpo.beneficial_ownership_label !== owner) {
            return res.status(400).send("Bad Request: Los identificadores de la URL no coinciden con los del cuerpo");
        }

        db.update({ year: year, flag_of_registration_label: flag, beneficial_ownership_label: owner }, cuerpo, {}, (err, numReplaced) => {
            if (err) {
                return res.status(500).send("Error interno del servidor");
            }
            if (numReplaced > 0) {
                res.status(200).send("OK: Recurso actualizado");
            } else {
                res.status(404).send("Not Found: Recurso a actualizar no encontrado");
            }
        });
    });

    // DELETE: Borro un recurso concreto
    app.delete(`${BASE_API_URL}/:year/:flag/:owner`, (req, res) => {
        const year = parseInt(req.params.year);
        const flag = req.params.flag;
        const owner = req.params.owner;

        db.remove({ year: year, flag_of_registration_label: flag, beneficial_ownership_label: owner }, { multi: true }, (err, numRemoved) => {
            if (err) {
                return res.status(500).send("Error interno del servidor");
            }
            if (numRemoved > 0) {
                res.status(200).send("OK: Recurso borrado");
            } else {
                res.status(404).send("Not Found: Recurso no encontrado");
            }
        });
    });
}