// api-AJM.js
const BASE_API_URL = "/api/v1/beneficial-ownership-merchant-fleets";

export default function (app) {
    let datos_ajm = []; 

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

    
    // CARGA INICIAL    ////////////////////////////////////////////////////////////////////
    
    app.get(`${BASE_API_URL}/loadInitialData`, (req, res) => {
        if (datos_ajm.length === 0) {
            datos_ajm = [...datosIniciales];
            res.status(201).json(datos_ajm); // 201 Created
        } else {
            res.status(200).json(datos_ajm); // 200 OK
        }
    });


    // OPERACIONES SOBRE LA COLECCIÓN   ///////////////////////////////////////////////////

    // GET: Obtengo lista (200 OK)
    app.get(BASE_API_URL, (req, res) => {
        res.status(200).json(datos_ajm);
    });

    // POST: Creo un nuevo recurso (201 Created, 400 Bad Request, 409 Conflict)
    app.post(BASE_API_URL, (req, res) => {
        const nuevoDato = req.body;
        // Valido que vengan todos los campos
        if (!nuevoDato.year || !nuevoDato.flag_of_registration_label || !nuevoDato.beneficial_ownership_label || !nuevoDato.dead_weight_tons || !nuevoDato.percentage_of_total_fleet || !nuevoDato.number_of_ships) {
            return res.status(400).send("Bad Request: Faltan campos obligatorios");
        }
        // Valido que no exista (uso país de registro y propietario como identificador para ese año)
        const existe = datos_ajm.find(d => d.year === nuevoDato.year && d.flag_of_registration_label === nuevoDato.flag_of_registration_label && d.beneficial_ownership_label === nuevoDato.beneficial_ownership_label);
        if (existe) {
            return res.status(409).send("Conflict: El recurso ya existe.");
        }
        datos_ajm.push(nuevoDato);
        res.status(201).send("Created: Recurso creado correctamente.");
    });

    // PUT: Intento actualizar la lista completa (405 Method Not Allowed)
    app.put(BASE_API_URL, (req, res) => {
        res.status(405).send("Method Not Allowed: No se puede actualizar la colección completa");
    });

    // DELETE: Borro la lista completa (200 OK)
    app.delete(BASE_API_URL, (req, res) => {
        datos_ajm = [];
        res.status(200).send("OK: Lista de recursos borrada");
    });


    // OPERACIONES SOBRE UN RECURSO CONCRETO (/pais/año)    //////////////////////////////////////////////

    // GET: Obtengo un recurso concreto (200 OK, 404 Not Found)
    app.get(`${BASE_API_URL}/:flag/:year`, (req, res) => {
        const flag = req.params.flag;
        const year = parseInt(req.params.year);
        
        // Filtro todos los registros de ese país y año
        const resultados = datos_ajm.filter(d => d.flag_of_registration_label === flag && d.year === year);
        if (resultados.length > 0) {
            res.status(200).json(resultados);
        } else {
            res.status(404).send("Not Found: Recurso no encontrado");
        }
    });

    // POST: Intento crear un recurso concreto (405 Method Not Allowed)
    app.post(`${BASE_API_URL}/:flag/:year`, (req, res) => {
        res.status(405).send("Method Not Allowed: No se puede hacer POST a un recurso concreto");
    });

    // PUT: Actualizo un recurso concreto (200 OK, 400 Bad Request, 404 Not Found)
    app.put(`${BASE_API_URL}/:flag/:year`, (req, res) => {
        const flag = req.params.flag;
        const year = parseInt(req.params.year);
        const cuerpo = req.body;

        // Compruebo que los datos de la URL coinciden con los del cuerpo (400 Bad Request)
        if (cuerpo.flag_of_registration_label !== flag || cuerpo.year !== year) {
            return res.status(400).send("Bad Request: Los identificadores de la URL no coinciden con los del cuerpo");
        }

        // Busco el índice del recurso (asumo que actualizamos el primero que coincida por país, año y ownership)
        const index = datos_ajm.findIndex(d => d.flag_of_registration_label === flag && d.year === year && d.beneficial_ownership_label === cuerpo.beneficial_ownership_label);
        
        if (index !== -1) {
            datos_ajm[index] = cuerpo;
            res.status(200).send("OK: Recurso actualizado");
        } else {
            res.status(404).send("Not Found: Recurso a actualizar no encontrado");
        }
    });

    // DELETE: Borro un recurso concreto (200 OK, 404 Not Found)
    app.delete(`${BASE_API_URL}/:flag/:year`, (req, res) => {
        const flag = req.params.flag;
        const year = parseInt(req.params.year);

        const longitudInicial = datos_ajm.length;
        datos_ajm = datos_ajm.filter(d => !(d.flag_of_registration_label === flag && d.year === year));

        if (datos_ajm.length < longitudInicial) {
            res.status(200).send("OK: Recurso(s) borrado(s)");
        } else {
            res.status(404).send("Not Found: Recurso a borrar no encontrado");
        }
    });
}