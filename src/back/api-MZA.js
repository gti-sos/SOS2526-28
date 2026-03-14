// api-MZA.js
const BASE_API_URL = "/api/v1/company-esg-scores-financial-performances";

export default function (app) {
    let datos_mza = []; 

    const datosIniciales = [
        { company_id: 1, company_name: "Company_1", industry: "Retail", region: "Latin America", year: 2015, revenue: 459.2, profit_margin: 6.0, market_cap: 337.5, growth_rate: null, esg_overall: 57.0, esg_environmental: 60.7, esg_social: 33.5, esg_governance: 76.8, carbon_emission: 35577.4, water_usage: 17788.7, energy_consumption: 71154.7 },
        { company_id: 1, company_name: "Company_1", industry: "Retail", region: "Latin America", year: 2016, revenue: 473.8, profit_margin: 4.6, market_cap: 366.6, growth_rate: 3.2, esg_overall: 56.7, esg_environmental: 58.9, esg_social: 32.8, esg_governance: 78.5, carbon_emission: 37314.7, water_usage: 18657.4, energy_consumption: 74629.4 },
        { company_id: 1, company_name: "Company_1", industry: "Retail", region: "Latin America", year: 2017, revenue: 564.9, profit_margin: 5.2, market_cap: 313.4, growth_rate: 19.2, esg_overall: 56.5, esg_environmental: 57.6, esg_social: 34.0, esg_governance: 77.8, carbon_emission: 45006.4, water_usage: 22503.2, energy_consumption: 90012.9 },
        { company_id: 1, company_name: "Company_1", industry: "Retail", region: "Latin America", year: 2018, revenue: 558.4, profit_margin: 4.3, market_cap: 283.0, growth_rate: -1.1, esg_overall: 58.0, esg_environmental: 62.3, esg_social: 33.4, esg_governance: 78.3, carbon_emission: 42650.1, water_usage: 21325.1, energy_consumption: 85300.2 },
        { company_id: 1, company_name: "Company_1", industry: "Retail", region: "Latin America", year: 2019, revenue: 554.5, profit_margin: 4.9, market_cap: 538.1, growth_rate: -0.7, esg_overall: 56.6, esg_environmental: 63.7, esg_social: 30.0, esg_governance: 76.1, carbon_emission: 41799.4, water_usage: 20899.7, energy_consumption: 83598.8 },
        { company_id: 1, company_name: "Company_1", industry: "Retail", region: "Latin America", year: 2020, revenue: 567.5, profit_margin: 6.0, market_cap: 384.1, growth_rate: 2.3, esg_overall: 55.7, esg_environmental: 65.1, esg_social: 28.5, esg_governance: 73.5, carbon_emission: 42245.4, water_usage: 21122.7, energy_consumption: 84490.9 },
        { company_id: 1, company_name: "Company_1", industry: "Retail", region: "Latin America", year: 2021, revenue: 604.2, profit_margin: 5.2, market_cap: 479.3, growth_rate: 6.5, esg_overall: 55.6, esg_environmental: 66.8, esg_social: 25.5, esg_governance: 74.6, carbon_emission: 44263.8, water_usage: 22131.9, energy_consumption: 88527.7 },
        { company_id: 1, company_name: "Company_1", industry: "Retail", region: "Latin America", year: 2022, revenue: 593.2, profit_margin: 4.2, market_cap: 248.4, growth_rate: -1.8, esg_overall: 57.7, esg_environmental: 69.0, esg_social: 27.1, esg_governance: 76.9, carbon_emission: 42536.3, water_usage: 21268.2, energy_consumption: 85072.6 },
        { company_id: 1, company_name: "Company_1", industry: "Retail", region: "Latin America", year: 2023, revenue: 636.7, profit_margin: 5.3, market_cap: 373.9, growth_rate: 7.3, esg_overall: 57.8, esg_environmental: 68.3, esg_social: 27.0, esg_governance: 78.1, carbon_emission: 45956.3, water_usage: 22978.2, energy_consumption: 91912.6 },
        { company_id: 1, company_name: "Company_1", industry: "Retail", region: "Latin America", year: 2024, revenue: 687.0, profit_margin: 4.6, market_cap: 460.1, growth_rate: 7.9, esg_overall: 58.5, esg_environmental: 68.9, esg_social: 29.9, esg_governance: 76.8, carbon_emission: 49289.1, water_usage: 24644.5, energy_consumption: 98578.1 }
    ];

    
    // CARGA INICIAL    ////////////////////////////////////////////////////////////////////
    
    app.get(`${BASE_API_URL}/loadInitialData`, (req, res) => {
        if (datos_mza.length === 0) {
            datos_mza = [...datosIniciales];
            res.status(201).json(datos_mza); // 201 Created
        } else {
            res.status(200).json(datos_mza); // 200 OK
        }
    });


    // OPERACIONES SOBRE LA COLECCIÓN   ///////////////////////////////////////////////////

    // GET: Obtengo lista (200 OK)
    // Búsqueda y paginación
    app.get(BASE_API_URL, (req, res) => {
        let query = req.query;
        let filteredData = [...datos_mza];

        const fromYear = query.from ? parseInt(query.from) : null;
        const toYear = query.to ? parseInt(query.to) : null;

        // Elimino 'from' y 'to' de la query para que no interfieran con la búsqueda por campos
        delete query.from;
        delete query.to;

        // Búsqueda por campos
        for (const key in query) {
            // Campos numéricos para comparación exacta
            const numericFields = ['company_id', 'year', 'revenue', 'profit_margin', 'market_cap', 'growth_rate', 'esg_overall', 'esg_environmental', 'esg_social', 'esg_governance', 'carbon_emission', 'water_usage', 'energy_consumption'];
            if (numericFields.includes(key)) {
                filteredData = filteredData.filter(d => d[key] == query[key]);
            } else {
                // Búsqueda insensible a mayúsculas para campos de texto
                filteredData = filteredData.filter(d => d[key] && d[key].toLowerCase().includes(query[key].toLowerCase()));
            }
        }

        // Búsqueda por rango de años
        if (fromYear) {
            filteredData = filteredData.filter(d => d.year >= fromYear);
        }
        if (toYear) {
            filteredData = filteredData.filter(d => d.year <= toYear);
        }

        // Si no hay resultados, se devuelve un array vacío [] y código 200
        res.status(200).json(filteredData);
    });

    // POST: Creo un nuevo recurso (201 Created, 400 Bad Request, 409 Conflict)
    app.post(BASE_API_URL, (req, res) => {
        const nuevoDato = req.body;
        // Valido que vengan todos los campos (excepto growth_rate que puede ser null)
        const camposObligatorios = [
            'company_id', 'company_name', 'industry', 'region', 'year', 
            'revenue', 'profit_margin', 'market_cap', 'esg_overall', 'esg_environmental', 
            'esg_social', 'esg_governance', 'carbon_emission', 'water_usage', 'energy_consumption'
        ];
        const camposFaltantes = camposObligatorios.filter(campo => !nuevoDato.hasOwnProperty(campo));

        if (camposFaltantes.length > 0) {
            return res.status(400).send(`Bad Request: Faltan campos obligatorios: ${camposFaltantes.join(', ')}`);
        }
        // Valido que no exista (uso company_id y year como identificador único)
        const existe = datos_mza.find(d => d.company_id === nuevoDato.company_id && d.year === nuevoDato.year);
        if (existe) {
            return res.status(409).send("Conflict: El recurso ya existe.");
        }
        datos_mza.push(nuevoDato);
        res.status(201).send("Created: Recurso creado correctamente.");
    });

    // PUT: Intento actualizar la lista completa (405 Method Not Allowed)
    app.put(BASE_API_URL, (req, res) => {
        res.status(405).send("Method Not Allowed: No se puede actualizar la colección completa");
    });

    // DELETE: Borro la lista completa (200 OK)
    app.delete(BASE_API_URL, (req, res) => {
        datos_mza = [];
        res.status(200).send("OK: Lista de recursos borrada");
    });


    // OPERACIONES SOBRE UN RECURSO CONCRETO (/region/año)    //////////////////////////////////////////////

    // GET: Obtengo un recurso concreto (200 OK, 404 Not Found)
    app.get(`${BASE_API_URL}/:region/:year`, (req, res) => {
        const region = req.params.region;
        const year = parseInt(req.params.year);
        
        // Busco un único registro para esa región y año
        const resultado = datos_mza.find(d => d.region === region && d.year === year);
        
        if (resultado) {
            res.status(200).json(resultado); // Devuelve un único objeto
        } else {
            res.status(404).send("Not Found: Recurso no encontrado");
        }
    });

    // POST: Intento crear un recurso concreto (405 Method Not Allowed)
    app.post(`${BASE_API_URL}/:region/:year`, (req, res) => {
        res.status(405).send("Method Not Allowed: No se puede hacer POST a un recurso concreto");
    });

    // PUT: Actualizo un recurso concreto (200 OK, 400 Bad Request, 404 Not Found)
    app.put(`${BASE_API_URL}/:region/:year`, (req, res) => {
        const region = req.params.region;
        const year = parseInt(req.params.year);
        const cuerpo = req.body;

        // Compruebo que los datos de la URL coinciden con los del cuerpo (400 Bad Request)
        if (cuerpo.region !== region || cuerpo.year !== year) {
            return res.status(400).send("Bad Request: Los identificadores de la URL no coinciden con los del cuerpo");
        }

        // Busco el índice del recurso (asumo que actualizamos por company_id, que es único para un año)
        const index = datos_mza.findIndex(d => d.region === region && d.year === year && d.company_id === cuerpo.company_id);
        
        if (index !== -1) {
            datos_mza[index] = cuerpo;
            res.status(200).send("OK: Recurso actualizado");
        } else {
            res.status(404).send("Not Found: Recurso a actualizar no encontrado");
        }
    });

    // DELETE: Borro un recurso concreto (200 OK, 404 Not Found)
    app.delete(`${BASE_API_URL}/:region/:year`, (req, res) => {
        const region = req.params.region;
        const year = parseInt(req.params.year);

        const longitudInicial = datos_mza.length;
        datos_mza = datos_mza.filter(d => !(d.region === region && d.year === year));

        if (datos_mza.length < longitudInicial) {
            res.status(200).send("OK: Recurso(s) borrado(s)");
        } else {
            res.status(404).send("Not Found: Recurso a borrar no encontrado");
        }
    });
}