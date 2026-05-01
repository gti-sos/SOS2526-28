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
const BASE_API_URL_V2 = "/api/v2/beneficial-ownership-merchant-fleets";

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


    //  VERSIÓN API V2    ///////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////

    app.get(`${BASE_API_URL_V2}/docs`, (req, res) => {
        res.redirect("https://documenter.getpostman.com/view/52406665/2sBXigLsxq");
    });

    // Inicializo la base de datos
    const dbV2 = new Datastore({ filename: './data/beneficial-ownership-merchant-fleets-v2.db', autoload: true });

    const datosInicialesV2 = [
    { year: 2014, flag_of_registration_label: "Antigua and Barbuda", beneficial_ownership_label: "Australia", dead_weight_tons: 12.6, percentage_of_total_fleet: 9.796, number_of_ships: 1 },
    { year: 2014, flag_of_registration_label: "Antigua and Barbuda", beneficial_ownership_label: "China, Hong Kong SAR", dead_weight_tons: 79.56, percentage_of_total_fleet: 61.472, number_of_ships: 8 },
    { year: 2014, flag_of_registration_label: "Antigua and Barbuda", beneficial_ownership_label: "Colombia", dead_weight_tons: 3.6, percentage_of_total_fleet: 2.781, number_of_ships: 1 },
    { year: 2014, flag_of_registration_label: "Antigua and Barbuda", beneficial_ownership_label: "Cyprus", dead_weight_tons: 16.278, percentage_of_total_fleet: 12.576, number_of_ships: 2 },
    { year: 2014, flag_of_registration_label: "Antigua and Barbuda", beneficial_ownership_label: "Denmark", dead_weight_tons: 35.395, percentage_of_total_fleet: 27.345, number_of_ships: 4 },
    { year: 2014, flag_of_registration_label: "Antigua and Barbuda", beneficial_ownership_label: "Estonia", dead_weight_tons: 27.789, percentage_of_total_fleet: 21.469, number_of_ships: 7 },
    { year: 2014, flag_of_registration_label: "Antigua and Barbuda", beneficial_ownership_label: "Germany", dead_weight_tons: 12232.14, percentage_of_total_fleet: 9450.155, number_of_ships: 1056 },
    { year: 2014, flag_of_registration_label: "Antigua and Barbuda", beneficial_ownership_label: "Greece", dead_weight_tons: 7.496, percentage_of_total_fleet: 5.791, number_of_ships: 2 },
    { year: 2014, flag_of_registration_label: "Antigua and Barbuda", beneficial_ownership_label: "Iceland", dead_weight_tons: 58.93, percentage_of_total_fleet: 45.53, number_of_ships: 7 },
    { year: 2014, flag_of_registration_label: "Antigua and Barbuda", beneficial_ownership_label: "Latvia", dead_weight_tons: 36.465, percentage_of_total_fleet: 28.172, number_of_ships: 10 },
    { year: 2014, flag_of_registration_label: "Antigua and Barbuda", beneficial_ownership_label: "Ukraine", dead_weight_tons: 27.027, percentage_of_total_fleet: 0.2088, number_of_ships: 4 },
    { year: 2014, flag_of_registration_label: "Norway", beneficial_ownership_label: "Denmark", dead_weight_tons: 145.624, percentage_of_total_fleet: 0.71264, number_of_ships: 12 },
    { year: 2015, flag_of_registration_label: "China, Hong Kong SAR", beneficial_ownership_label: "Bangladesh", dead_weight_tons: 45.09, percentage_of_total_fleet: 0.02999, number_of_ships: 1 },
    { year: 2015, flag_of_registration_label: "Cyprus", beneficial_ownership_label: "Singapore", dead_weight_tons: 190.201, percentage_of_total_fleet: 0.57468, number_of_ships: 24 },
    { year: 2015, flag_of_registration_label: "Denmark", beneficial_ownership_label: "Greenland", dead_weight_tons: 39.379, percentage_of_total_fleet: 0.23986, number_of_ships: 6 },
    { year: 2015, flag_of_registration_label: "Singapore", beneficial_ownership_label: "Cyprus", dead_weight_tons: 194.902, percentage_of_total_fleet: 0.16623, number_of_ships: 10 },
    { year: 2016, flag_of_registration_label: "Antigua and Barbuda", beneficial_ownership_label: "Germany", dead_weight_tons: 10465.162, percentage_of_total_fleet: 0.0, number_of_ships: 896 },
    { year: 2016, flag_of_registration_label: "Antigua and Barbuda", beneficial_ownership_label: "Lithuania", dead_weight_tons: 24.557, percentage_of_total_fleet: 0.21911, number_of_ships: 7 },
    { year: 2016, flag_of_registration_label: "Antigua and Barbuda", beneficial_ownership_label: "Poland", dead_weight_tons: 5.467, percentage_of_total_fleet: 0.04878, number_of_ships: 2 },
    { year: 2016, flag_of_registration_label: "Bahamas", beneficial_ownership_label: "Denmark", dead_weight_tons: 729.62, percentage_of_total_fleet: 0.91407, number_of_ships: 30 },
    { year: 2016, flag_of_registration_label: "Cyprus", beneficial_ownership_label: "Finland", dead_weight_tons: 4.0, percentage_of_total_fleet: 0.01206, number_of_ships: 1 },
    { year: 2016, flag_of_registration_label: "Greece", beneficial_ownership_label: "Belgium", dead_weight_tons: 4025.311, percentage_of_total_fleet: 54.913, number_of_ships: 22 },
    { year: 2016, flag_of_registration_label: "Liberia", beneficial_ownership_label: "Germany", dead_weight_tons: 54038.237, percentage_of_total_fleet: 0.0, number_of_ships: 1013 },
    { year: 2016, flag_of_registration_label: "Marshall Islands", beneficial_ownership_label: "Germany", dead_weight_tons: 10161.574, percentage_of_total_fleet: 512.643, number_of_ships: 202 },
    { year: 2017, flag_of_registration_label: "China, Hong Kong SAR", beneficial_ownership_label: "Netherlands (Kingdom of the)", dead_weight_tons: 3.989, percentage_of_total_fleet: 0.0023, number_of_ships: 1 },
    { year: 2017, flag_of_registration_label: "China, Hong Kong SAR", beneficial_ownership_label: "Portugal", dead_weight_tons: 170.259, percentage_of_total_fleet: 0.09814, number_of_ships: 3 },
    { year: 2017, flag_of_registration_label: "China, Hong Kong SAR", beneficial_ownership_label: "United Arab Emirates", dead_weight_tons: 987.381, percentage_of_total_fleet: 0.56912, number_of_ships: 18 },
    { year: 2017, flag_of_registration_label: "Cyprus", beneficial_ownership_label: "Estonia", dead_weight_tons: 37.7, percentage_of_total_fleet: 0.11147, number_of_ships: 5 },
    { year: 2017, flag_of_registration_label: "Cyprus", beneficial_ownership_label: "Lithuania", dead_weight_tons: 1.723, percentage_of_total_fleet: 0.00509, number_of_ships: 1 },
    { year: 2017, flag_of_registration_label: "Denmark", beneficial_ownership_label: "Denmark", dead_weight_tons: 16355.247, percentage_of_total_fleet: 950.585, number_of_ships: 387 },
    { year: 2017, flag_of_registration_label: "Greece", beneficial_ownership_label: "Syrian Arab Republic", dead_weight_tons: 3.171, percentage_of_total_fleet: 0.00441, number_of_ships: 1 },
    { year: 2017, flag_of_registration_label: "Italy", beneficial_ownership_label: "China, Hong Kong SAR", dead_weight_tons: 107.233, percentage_of_total_fleet: 0.68009, number_of_ships: 2 },
    { year: 2017, flag_of_registration_label: "Marshall Islands", beneficial_ownership_label: "Australia", dead_weight_tons: 66.934, percentage_of_total_fleet: 0.03094, number_of_ships: 10 },
    { year: 2017, flag_of_registration_label: "Marshall Islands", beneficial_ownership_label: "China, Hong Kong SAR", dead_weight_tons: 1941.78, percentage_of_total_fleet: 0.89754, number_of_ships: 31 },
    { year: 2017, flag_of_registration_label: "Republic of Korea", beneficial_ownership_label: "Estonia", dead_weight_tons: 6.522, percentage_of_total_fleet: 0.04471, number_of_ships: 1 },
    { year: 2017, flag_of_registration_label: "United States", beneficial_ownership_label: "Denmark", dead_weight_tons: 135.109, percentage_of_total_fleet: 118.566, number_of_ships: 2 },
    { year: 2018, flag_of_registration_label: "Bahamas", beneficial_ownership_label: "China, Hong Kong SAR", dead_weight_tons: 75.766, percentage_of_total_fleet: 0.09854, number_of_ships: 11 },
    { year: 2018, flag_of_registration_label: "China, Hong Kong SAR", beneficial_ownership_label: "Singapore", dead_weight_tons: 4932.592, percentage_of_total_fleet: 270.365, number_of_ships: 109 },
    { year: 2018, flag_of_registration_label: "Indonesia", beneficial_ownership_label: "Greece", dead_weight_tons: 42.462, percentage_of_total_fleet: 0.19738, number_of_ships: 2 },
    { year: 2018, flag_of_registration_label: "Norway", beneficial_ownership_label: "Cyprus", dead_weight_tons: 5.55, percentage_of_total_fleet: 0.02579, number_of_ships: 1 },
    { year: 2018, flag_of_registration_label: "Norway", beneficial_ownership_label: "Iceland", dead_weight_tons: 11.19, percentage_of_total_fleet: 0.052, number_of_ships: 4 },
    { year: 2019, flag_of_registration_label: "China, Hong Kong SAR", beneficial_ownership_label: "Chile", dead_weight_tons: 102.436, percentage_of_total_fleet: 0.05154, number_of_ships: 2 },
    { year: 2019, flag_of_registration_label: "Cyprus", beneficial_ownership_label: "Bahamas", dead_weight_tons: 17.5, percentage_of_total_fleet: 0.05068, number_of_ships: 1 },
    { year: 2019, flag_of_registration_label: "Denmark", beneficial_ownership_label: "Norway", dead_weight_tons: 60.586, percentage_of_total_fleet: 0.26966, number_of_ships: 7 },
    { year: 2019, flag_of_registration_label: "Greece", beneficial_ownership_label: "Turkiye", dead_weight_tons: 2.09, percentage_of_total_fleet: 0.00302, number_of_ships: 1 },
    { year: 2019, flag_of_registration_label: "Liberia", beneficial_ownership_label: "China, Hong Kong SAR", dead_weight_tons: 6245.765, percentage_of_total_fleet: 256.113, number_of_ships: 48 },
    { year: 2019, flag_of_registration_label: "Marshall Islands", beneficial_ownership_label: "Denmark", dead_weight_tons: 2288.501, percentage_of_total_fleet: 0.93145, number_of_ships: 54 },
    { year: 2019, flag_of_registration_label: "Singapore", beneficial_ownership_label: "China, Hong Kong SAR", dead_weight_tons: 3614.907, percentage_of_total_fleet: 280.233, number_of_ships: 47 },
    { year: 2019, flag_of_registration_label: "Singapore", beneficial_ownership_label: "Greece", dead_weight_tons: 2087.009, percentage_of_total_fleet: 161.788, number_of_ships: 30 },
    { year: 2020, flag_of_registration_label: "Cyprus", beneficial_ownership_label: "China", dead_weight_tons: 93.772, percentage_of_total_fleet: 0.2717, number_of_ships: 3 },
    { year: 2020, flag_of_registration_label: "Cyprus", beneficial_ownership_label: "Philippines", dead_weight_tons: 2.03, percentage_of_total_fleet: 0.00588, number_of_ships: 1 },
    { year: 2020, flag_of_registration_label: "Greece", beneficial_ownership_label: "Belgium", dead_weight_tons: 3126.24, percentage_of_total_fleet: 453.991, number_of_ships: 17 },
    { year: 2020, flag_of_registration_label: "Greece", beneficial_ownership_label: "Greece", dead_weight_tons: 60777.869, percentage_of_total_fleet: 0.0, number_of_ships: 681 },
    { year: 2020, flag_of_registration_label: "India", beneficial_ownership_label: "China, Hong Kong SAR", dead_weight_tons: 32.528, percentage_of_total_fleet: 0.18867, number_of_ships: 2 },
    { year: 2020, flag_of_registration_label: "Marshall Islands", beneficial_ownership_label: "Denmark", dead_weight_tons: 2888.494, percentage_of_total_fleet: 110.235, number_of_ships: 64 },
    { year: 2020, flag_of_registration_label: "United Kingdom", beneficial_ownership_label: "Denmark", dead_weight_tons: 1226.89, percentage_of_total_fleet: 34.313, number_of_ships: 44 },
    { year: 2021, flag_of_registration_label: "Cyprus", beneficial_ownership_label: "Denmark", dead_weight_tons: 106.5, percentage_of_total_fleet: 0.31346, number_of_ships: 3 },
    { year: 2021, flag_of_registration_label: "Cyprus", beneficial_ownership_label: "Ireland", dead_weight_tons: 84.306, percentage_of_total_fleet: 0.24814, number_of_ships: 9 },
    { year: 2021, flag_of_registration_label: "Cyprus", beneficial_ownership_label: "Russian Federation", dead_weight_tons: 1588.033, percentage_of_total_fleet: 467.409, number_of_ships: 29 },
    { year: 2021, flag_of_registration_label: "India", beneficial_ownership_label: "Denmark", dead_weight_tons: 1.68, percentage_of_total_fleet: 0.00996, number_of_ships: 1 },
    { year: 2021, flag_of_registration_label: "Liberia", beneficial_ownership_label: "Germany", dead_weight_tons: 32158.43, percentage_of_total_fleet: 0.0, number_of_ships: 566 },
    { year: 2021, flag_of_registration_label: "Malta", beneficial_ownership_label: "China, Hong Kong SAR", dead_weight_tons: 890.37, percentage_of_total_fleet: 0.76885, number_of_ships: 9 },
    { year: 2021, flag_of_registration_label: "Norway", beneficial_ownership_label: "Cyprus", dead_weight_tons: 10.75, percentage_of_total_fleet: 0.045, number_of_ships: 2 },
    { year: 2021, flag_of_registration_label: "Panama", beneficial_ownership_label: "Australia", dead_weight_tons: 157.619, percentage_of_total_fleet: 0.04582, number_of_ships: 7 },
    { year: 2021, flag_of_registration_label: "Panama", beneficial_ownership_label: "Estonia", dead_weight_tons: 10.128, percentage_of_total_fleet: 0.00294, number_of_ships: 2 },
    { year: 2021, flag_of_registration_label: "Portugal", beneficial_ownership_label: "Cyprus", dead_weight_tons: 51.388, percentage_of_total_fleet: 0.22521, number_of_ships: 6 },
    { year: 2022, flag_of_registration_label: "China, Hong Kong SAR", beneficial_ownership_label: "China, Taiwan Province of", dead_weight_tons: 4490.562, percentage_of_total_fleet: 215.895, number_of_ships: 61 },
    { year: 2022, flag_of_registration_label: "China, Hong Kong SAR", beneficial_ownership_label: "Denmark", dead_weight_tons: 3203.325, percentage_of_total_fleet: 154.008, number_of_ships: 51 },
    { year: 2022, flag_of_registration_label: "China, Hong Kong SAR", beneficial_ownership_label: "Indonesia", dead_weight_tons: 6.688, percentage_of_total_fleet: 0.00322, number_of_ships: 1 },
    { year: 2022, flag_of_registration_label: "China, Hong Kong SAR", beneficial_ownership_label: "Republic of Korea", dead_weight_tons: 975.086, percentage_of_total_fleet: 0.4688, number_of_ships: 12 },
    { year: 2022, flag_of_registration_label: "Cyprus", beneficial_ownership_label: "China, Macao SAR", dead_weight_tons: 51.238, percentage_of_total_fleet: 0.15319, number_of_ships: 1 },
    { year: 2022, flag_of_registration_label: "Cyprus", beneficial_ownership_label: "Finland", dead_weight_tons: 49.621, percentage_of_total_fleet: 0.14835, number_of_ships: 6 },
    { year: 2022, flag_of_registration_label: "Cyprus", beneficial_ownership_label: "Singapore", dead_weight_tons: 265.326, percentage_of_total_fleet: 0.79324, number_of_ships: 11 },
    { year: 2022, flag_of_registration_label: "Denmark", beneficial_ownership_label: "Poland", dead_weight_tons: 2.5, percentage_of_total_fleet: 0.0096, number_of_ships: 1 },
    { year: 2022, flag_of_registration_label: "Denmark", beneficial_ownership_label: "Singapore", dead_weight_tons: 383.756, percentage_of_total_fleet: 147.293, number_of_ships: 17 },
    { year: 2022, flag_of_registration_label: "Greece", beneficial_ownership_label: "Albania", dead_weight_tons: 3.05, percentage_of_total_fleet: 0.00496, number_of_ships: 1 },
    { year: 2023, flag_of_registration_label: "China", beneficial_ownership_label: "Australia", dead_weight_tons: 2.0, percentage_of_total_fleet: 0.00152, number_of_ships: 1 },
    { year: 2023, flag_of_registration_label: "China, Hong Kong SAR", beneficial_ownership_label: "Switzerland", dead_weight_tons: 282.368, percentage_of_total_fleet: 0.14108, number_of_ships: 2 },
    { year: 2023, flag_of_registration_label: "China, Hong Kong SAR", beneficial_ownership_label: "United Kingdom", dead_weight_tons: 49.984, percentage_of_total_fleet: 0.02497, number_of_ships: 3 },
    { year: 2023, flag_of_registration_label: "Cyprus", beneficial_ownership_label: "Bahamas", dead_weight_tons: 17.5, percentage_of_total_fleet: 0.0554, number_of_ships: 1 },
    { year: 2023, flag_of_registration_label: "Cyprus", beneficial_ownership_label: "Belgium", dead_weight_tons: 35.38, percentage_of_total_fleet: 0.11201, number_of_ships: 2 },
    { year: 2023, flag_of_registration_label: "Cyprus", beneficial_ownership_label: "Italy", dead_weight_tons: 13.457, percentage_of_total_fleet: 0.0426, number_of_ships: 3 },
    { year: 2023, flag_of_registration_label: "Cyprus", beneficial_ownership_label: "Poland", dead_weight_tons: 399.018, percentage_of_total_fleet: 126.328, number_of_ships: 29 },
    { year: 2023, flag_of_registration_label: "Cyprus", beneficial_ownership_label: "Turkiye", dead_weight_tons: 8.603, percentage_of_total_fleet: 0.02724, number_of_ships: 2 },
    { year: 2023, flag_of_registration_label: "Denmark", beneficial_ownership_label: "United Kingdom", dead_weight_tons: 746.01, percentage_of_total_fleet: 294.491, number_of_ships: 20 },
    { year: 2023, flag_of_registration_label: "Marshall Islands", beneficial_ownership_label: "Germany", dead_weight_tons: 3413.753, percentage_of_total_fleet: 113.855, number_of_ships: 58 },
    { year: 2023, flag_of_registration_label: "Singapore", beneficial_ownership_label: "Greece", dead_weight_tons: 1135.008, percentage_of_total_fleet: 0.84317, number_of_ships: 18 },
    { year: 2024, flag_of_registration_label: "China, Hong Kong SAR", beneficial_ownership_label: "Canada", dead_weight_tons: 919.094, percentage_of_total_fleet: 0.45901, number_of_ships: 7 },
    { year: 2024, flag_of_registration_label: "Cyprus", beneficial_ownership_label: "France", dead_weight_tons: 136.831, percentage_of_total_fleet: 0.44631, number_of_ships: 5 },
    { year: 2024, flag_of_registration_label: "Cyprus", beneficial_ownership_label: "Spain", dead_weight_tons: 338.597, percentage_of_total_fleet: 110.441, number_of_ships: 30 },
    { year: 2024, flag_of_registration_label: "Cyprus", beneficial_ownership_label: "Switzerland", dead_weight_tons: 188.428, percentage_of_total_fleet: 0.6146, number_of_ships: 10 },
    { year: 2024, flag_of_registration_label: "Denmark", beneficial_ownership_label: "China", dead_weight_tons: 2017.903, percentage_of_total_fleet: 80.802, number_of_ships: 25 },
    { year: 2024, flag_of_registration_label: "Denmark", beneficial_ownership_label: "Guadeloupe", dead_weight_tons: 4.059, percentage_of_total_fleet: 0.01625, number_of_ships: 1 },
    { year: 2024, flag_of_registration_label: "Marshall Islands", beneficial_ownership_label: "Greece", dead_weight_tons: 90092.747, percentage_of_total_fleet: 0.0, number_of_ships: 1172 },
    { year: 2025, flag_of_registration_label: "Denmark", beneficial_ownership_label: "Greenland", dead_weight_tons: 49.128, percentage_of_total_fleet: 0.19203, number_of_ships: 8 },
    { year: 2025, flag_of_registration_label: "Denmark", beneficial_ownership_label: "Singapore", dead_weight_tons: 296.247, percentage_of_total_fleet: 115.794, number_of_ships: 10 },
    { year: 2025, flag_of_registration_label: "Liberia", beneficial_ownership_label: "Colombia", dead_weight_tons: 4.9, percentage_of_total_fleet: 0.00116, number_of_ships: 1 },
    { year: 2025, flag_of_registration_label: "Marshall Islands", beneficial_ownership_label: "Germany", dead_weight_tons: 2168.53, percentage_of_total_fleet: 0.70997, number_of_ships: 47 },
    { year: 2025, flag_of_registration_label: "Panama", beneficial_ownership_label: "Greece", dead_weight_tons: 22005.094, percentage_of_total_fleet: 593.536, number_of_ships: 415 },
    { year: 2025, flag_of_registration_label: "Portugal", beneficial_ownership_label: "Latvia", dead_weight_tons: 11.895, percentage_of_total_fleet: 0.03313, number_of_ships: 3 }
    ];


    // AUTO-CARGA VERSIÓN ESTABLE   /////////////////////////////////
    dbV2.find({}, (err, docs) => {
        if (err) {
            console.error("Error comprobando la BD de V2 en el arranque:", err);
        } else if (docs.length === 0) {
            console.log("BD de V2 vacía. Autocargando datos iniciales...");
            dbV2.insert(datosInicialesV2, (err, newDocs) => {
                if (err) {
                    console.error("Error insertando datos automáticos en V2:", err);
                } else {
                    console.log(`V2 lista. Insertados ${newDocs.length} registros automáticamente.`);
                }
            });
        }
    });


    // CARGA INICIAL V2 ////////////////////////////////////////////////////////////////////
    app.get(`${BASE_API_URL_V2}/loadInitialData`, (req, res) => {
        dbV2.find({}, (err, docs) => {
            if (err) {
                console.log("Fallo en dbV2.find:", err);
                return res.status(500).send("ERROR REAL EN FIND: " + err.message); // ERROR A POSTMAN
            } 
            
            if (docs.length === 0) {
                dbV2.insert(datosInicialesV2, (err, newDocs) => {
                    if (err) {
                        console.log("Fallo en dbV2.insert:", err);
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
    app.get(BASE_API_URL_V2, (req, res) => {
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
        dbV2.find(query).skip(offset).limit(limit).exec((err, docs) => {
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
    app.post(BASE_API_URL_V2, (req, res) => {
        const nuevoDato = req.body;

        // Valído que vengan todos los campos (Tarea 12)
        if (!nuevoDato.year || !nuevoDato.flag_of_registration_label || !nuevoDato.beneficial_ownership_label || !nuevoDato.dead_weight_tons || !nuevoDato.percentage_of_total_fleet || !nuevoDato.number_of_ships) {
            return res.status(400).send("Bad Request: Faltan campos obligatorios");
        }

        // Valído que no exista en la base de datos
        dbV2.find({ year: nuevoDato.year, flag_of_registration_label: nuevoDato.flag_of_registration_label, beneficial_ownership_label: nuevoDato.beneficial_ownership_label }, (err, docs) => {
            if (err) {
                return res.status(500).send("Error interno del servidor");
            }
            if (docs.length > 0) {
                return res.status(409).send("Conflict: El recurso ya existe.");
            } else {
                dbV2.insert(nuevoDato, (err, newDoc) => {
                    if (err) {
                        return res.status(500).send("Error interno del servidor");
                    }
                    res.status(201).send("Created: Recurso creado correctamente.");
                });
            }
        });
    });

    // PUT: Intento actualizar la lista completa (405 Method Not Allowed)
    app.put(BASE_API_URL_V2, (req, res) => {
        res.status(405).send("Method Not Allowed: No se puede actualizar la colección completa");
    });

    // DELETE: Borro la lista completa (200 OK)
    app.delete(BASE_API_URL_V2, (req, res) => {
        dbV2.remove({}, { multi: true }, (err, numRemoved) => {
            if (err) {
                res.status(500).send("Error interno del servidor");
            } else {
                res.status(200).send("OK: Lista de recursos borrada");
            }
        });
    });


    // OPERACIONES SOBRE UN RECURSO CONCRETO (/pais/año)    //////////////////////////////////////////////
    // GET: Obtengo un recurso concreto (200 OK, 404 Not Found)
    app.get(`${BASE_API_URL_V2}/:year/:flag/:owner`, (req, res) => {
        const year = parseInt(req.params.year);
        const flag = req.params.flag;
        const owner = req.params.owner;

        dbV2.find({ year: year, flag_of_registration_label: flag, beneficial_ownership_label: owner }, (err, docs) => {
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
    app.post(`${BASE_API_URL_V2}/:year/:flag/:owner`, (req, res) => {
        res.status(405).send("Method Not Allowed: No se puede hacer POST a un recurso concreto");
    });

    // PUT: Actualizo un recurso concreto
    app.put(`${BASE_API_URL_V2}/:year/:flag/:owner`, (req, res) => {
        const year = parseInt(req.params.year);
        const flag = req.params.flag;
        const owner = req.params.owner;
        const cuerpo = req.body;

        // Compruebo que las TRES variables coinciden con las del cuerpo
        if (cuerpo.year !== year || cuerpo.flag_of_registration_label !== flag || cuerpo.beneficial_ownership_label !== owner) {
            return res.status(400).send("Bad Request: Los identificadores de la URL no coinciden con los del cuerpo");
        }

        dbV2.update({ year: year, flag_of_registration_label: flag, beneficial_ownership_label: owner }, cuerpo, {}, (err, numReplaced) => {
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
    app.delete(`${BASE_API_URL_V2}/:year/:flag/:owner`, (req, res) => {
        const year = parseInt(req.params.year);
        const flag = req.params.flag;
        const owner = req.params.owner;

        dbV2.remove({ year: year, flag_of_registration_label: flag, beneficial_ownership_label: owner }, { multi: true }, (err, numRemoved) => {
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