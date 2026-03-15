// api-MZA.js
import Datastore from "nedb";

const BASE_API_URL = "/api/v1/company-esg-scores-financial-performances";

export default function (app) {

    const db = new Datastore({
        filename: "./data/mza.db",
        autoload: true
    });

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

    const campos = [
        'company_id', 'company_name', 'industry', 'region', 'year',
        'revenue', 'profit_margin', 'market_cap', 'growth_rate', 'esg_overall',
        'esg_environmental', 'esg_social', 'esg_governance', 'carbon_emission',
        'water_usage', 'energy_consumption'
    ];

    // Helper to remove _id from NeDB documents
    function quitarID(datos) {
        if (Array.isArray(datos)) {
            return datos.map(d => {
                const { _id, ...rest } = d;
                return rest;
            });
        }
        const { _id, ...rest } = datos;
        return rest;
    }

    // Helper to validate the exact structure of the request body
    function estructuraValida(obj) {
        const claves = Object.keys(obj);
        return campos.every(c => claves.includes(c)) &&
               claves.length === campos.length;
    }

    // FIX #3: /docs redirect — Req 13
    // TODO: Replace the URL below with your real Postman documentation URL
    // after you publish your collection (e.g. https://documenter.getpostman.com/view/XXXXXXXX/YYYY)
    app.get(`${BASE_API_URL}/docs`, (req, res) => {
        res.redirect("https://documenter.getpostman.com/view/YOUR_POSTMAN_DOCS_URL");
    });

    // CARGA INICIAL
    app.get(`${BASE_API_URL}/loadInitialData`, (req, res) => {
        db.count({}, (err, count) => {
            if (err) {
                return res.sendStatus(500);
            }
            if (count === 0) {
                db.insert(datosIniciales, (err, newDocs) => {
                    if (err) {
                        return res.sendStatus(500);
                    }
                    res.status(201).json(quitarID(newDocs));
                });
            } else {
                db.find({}, (err, docs) => {
                    if (err) {
                        return res.sendStatus(500);
                    }
                    res.status(200).json(quitarID(docs));
                });
            }
        });
    });

    // OPERACIONES SOBRE LA COLECCIÓN

    // GET: Obtener lista con búsqueda y paginación
    app.get(BASE_API_URL, (req, res) => {
        let query = {};
        const { from, to, limit, offset, ...filters } = req.query;

        const fromYear = from ? parseInt(from) : null;
        const toYear = to ? parseInt(to) : null;

        if (fromYear || toYear) {
            query.year = {};
            if (fromYear) query.year.$gte = fromYear;
            if (toYear) query.year.$lte = toYear;
        }

        const numericFields = ['company_id', 'year', 'revenue', 'profit_margin', 'market_cap', 'growth_rate', 'esg_overall', 'esg_environmental', 'esg_social', 'esg_governance', 'carbon_emission', 'water_usage', 'energy_consumption'];

        Object.keys(filters).forEach(key => {
            if (campos.includes(key)) {
                if (numericFields.includes(key)) {
                    query[key] = parseFloat(filters[key]);
                } else {
                    query[key] = new RegExp(filters[key], "i");
                }
            }
        });

        db.find(query)
          .skip(parseInt(offset) || 0)
          .limit(parseInt(limit) || 0)
          .exec((err, docs) => {
            if (err) {
                return res.sendStatus(500);
            }
            res.status(200).json(quitarID(docs));
        });
    });

    // POST: Crear un nuevo recurso
    app.post(BASE_API_URL, (req, res) => {
        const nuevoDato = req.body;

        if (!estructuraValida(nuevoDato)) {
            return res.sendStatus(400);
        }

        db.findOne({ company_id: nuevoDato.company_id, year: nuevoDato.year }, (err, doc) => {
            if (err) {
                return res.sendStatus(500);
            }
            if (doc) {
                return res.sendStatus(409);
            }
            db.insert(nuevoDato, (err, newDoc) => {
                if (err) {
                    return res.sendStatus(500);
                }
                res.status(201).json(quitarID(newDoc));
            });
        });
    });

    // PUT: Actualizar la colección completa (No permitido)
    app.put(BASE_API_URL, (req, res) => {
        res.sendStatus(405);
    });

    // DELETE: Borrar la colección completa
    app.delete(BASE_API_URL, (req, res) => {
        db.remove({}, { multi: true }, (err, numRemoved) => {
            if (err) {
                return res.sendStatus(500);
            }
            res.sendStatus(200);
        });
    });

    // OPERACIONES SOBRE UN RECURSO CONCRETO
    // FIX #1: Composite key changed from /:region/:year to /:company_id/:year — Req 7

    // GET: Obtener un recurso concreto
    app.get(`${BASE_API_URL}/:company_id/:year`, (req, res) => {
        const company_id = parseInt(req.params.company_id);
        const year = parseInt(req.params.year);

        db.findOne({ company_id: company_id, year: year }, (err, doc) => {
            if (err) {
                return res.sendStatus(500);
            }
            if (doc) {
                res.status(200).json(quitarID(doc));
            } else {
                res.sendStatus(404);
            }
        });
    });

    // POST: Crear un recurso concreto (No permitido)
    app.post(`${BASE_API_URL}/:company_id/:year`, (req, res) => {
        res.sendStatus(405);
    });

    // PUT: Actualizar un recurso concreto
    app.put(`${BASE_API_URL}/:company_id/:year`, (req, res) => {
        const company_id = parseInt(req.params.company_id);
        const year = parseInt(req.params.year);
        const cuerpo = req.body;

        if (!estructuraValida(cuerpo)) {
            return res.sendStatus(400);
        }

        if (cuerpo.company_id !== company_id || cuerpo.year !== year) {
            return res.sendStatus(400);
        }

        db.update({ company_id: company_id, year: year }, cuerpo, {}, (err, numReplaced) => {
            if (err) {
                return res.sendStatus(500);
            }
            if (numReplaced > 0) {
                res.sendStatus(200);
            } else {
                res.sendStatus(404);
            }
        });
    });

    // DELETE: Borrar un recurso concreto
    app.delete(`${BASE_API_URL}/:company_id/:year`, (req, res) => {
        const company_id = parseInt(req.params.company_id);
        const year = parseInt(req.params.year);

        db.remove({ company_id: company_id, year: year }, {}, (err, numRemoved) => {
            if (err) {
                return res.sendStatus(500);
            }
            if (numRemoved > 0) {
                res.sendStatus(200);
            } else {
                res.sendStatus(404);
            }
        });
    });
}