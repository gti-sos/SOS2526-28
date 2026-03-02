// api-JDD.js
const BASE_API_URL = "/api/v1/deliberate-violence-against-civilians-events-worldwide";

export default function (app) {
    let datos_jdd = []; 

    const datos = [
    { event_type: "Incident", campaign_identifier: "", event_reporting: "Eyewitness Account", start_day: 6, start_month: 1, start_year: 2016, end_day: 99, end_month: 99, end_year: 9999, country: "AFG", region: "Jowzjan", district: "Mangajek", locality: "Chahar Shanghoy village", degree: 36, minute: 56, second: 3, direction: "N" },
    { event_type: "Incident", campaign_identifier: "", event_reporting: "Eyewitness Account", start_day: 17, start_month: 1, start_year: 2016, end_day: 99, end_month: 99, end_year: 9999, country: "AFG", region: "Nangarhar", district: "", locality: "Jalalabad", degree: 34, minute: 26, second: 3, direction: "N" },
    { event_type: "Incident", campaign_identifier: "", event_reporting: "Eyewitness Account", start_day: 20, start_month: 1, start_year: 2016, end_day: 99, end_month: 99, end_year: 9999, country: "AFG", region: "", district: "", locality: "Kabul", degree: 34, minute: 32, second: 0, direction: "N" },
    { event_type: "Incident", campaign_identifier: "", event_reporting: "Eyewitness Account", start_day: 3, start_month: 1, start_year: 2016, end_day: 99, end_month: 99, end_year: 9999, country: "BDI", region: "Bujumbura Mairie", district: "Musaga", locality: "", degree: 3, minute: 24, second: 43, direction: "S" },
    { event_type: "Incident", campaign_identifier: "", event_reporting: "Eyewitness Account", start_day: 15, start_month: 1, start_year: 2016, end_day: 99, end_month: 99, end_year: 9999, country: "BFA", region: "", district: "", locality: "Ouagadougou", degree: 12, minute: 21, second: 26, direction: "N" },
    { event_type: "Incident", campaign_identifier: "", event_reporting: "Eyewitness Account", start_day: 13, start_month: 1, start_year: 2016, end_day: 99, end_month: 99, end_year: 9999, country: "CMR", region: "Far North", district: "Kolofata", locality: "Kouyape", degree: 11, minute: 1, second: 15, direction: "N" },
    { event_type: "Incident", campaign_identifier: "", event_reporting: "Eyewitness Account", start_day: 25, start_month: 1, start_year: 2016, end_day: 99, end_month: 99, end_year: 9999, country: "CMR", region: "Far North", district: "", locality: "Bodo", degree: 12, minute: 21, second: 35, direction: "N" },
    { event_type: "Incident", campaign_identifier: "", event_reporting: "Eyewitness Account", start_day: 7, start_month: 1, start_year: 2016, end_day: 99, end_month: 99, end_year: 9999, country: "COD", region: "Nord Kivu", district: "", locality: "Miriki", degree: 0, minute: 42, second: 43, direction: "S" },
    { event_type: "Incident", campaign_identifier: "", event_reporting: "Eyewitness Account", start_day: 1, start_month: 1, start_year: 2016, end_day: 99, end_month: 99, end_year: 9999, country: "ELS", region: "", district: "", locality: "Los Cerritos", degree: 13, minute: 46, second: 55, direction: "N" },
    { event_type: "Incident", campaign_identifier: "", event_reporting: "Eyewitness Account", start_day: 28, start_month: 1, start_year: 2016, end_day: 99, end_month: 99, end_year: 9999, country: "ETH", region: "Gambela Regional State", district: "", locality: "", degree: 7, minute: 50, second: 0, direction: "N" }
];

    // ==============================
    // CARGA INICIAL
    // ==============================

    app.get(`${BASE_API_URL}/loadInitialData`, (req, res) => {

        if (datos_jdd.length === 0) {
            datos_jdd = [...datosIniciales];
            res.status(201).json(datos_jdd);
        } else {
            res.status(200).json(datos_jdd);
        }
    });


    // ==============================
    // GET COLECCIÓN + FILTROS
    // ==============================

    app.get(BASE_API_URL, (req, res) => {

        let resultados = datos_jdd;

        if (req.query.country) {
            resultados = resultados.filter(d => d.country === req.query.country);
        }

        if (req.query.start_year) {
            resultados = resultados.filter(d => 
                d.start_year === parseInt(req.query.start_year)
            );
        }

        if (req.query.from) {
            resultados = resultados.filter(d => 
                d.start_year >= parseInt(req.query.from)
            );
        }

        if (req.query.to) {
            resultados = resultados.filter(d => 
                d.start_year <= parseInt(req.query.to)
            );
        }

        // SIEMPRE devuelve ARRAY (aunque vacío)
        res.status(200).json(resultados);
    });


    // ==============================
    // GET RECURSO CONCRETO (OBJECT)
    // ==============================

    app.get(`${BASE_API_URL}/:country/:year/:month/:day`, (req, res) => {

        const country = req.params.country;
        const year = parseInt(req.params.year);
        const month = parseInt(req.params.month);
        const day = parseInt(req.params.day);

        const recurso = datos_jdd.find(d =>
            d.country === country &&
            d.start_year === year &&
            d.start_month === month &&
            d.start_day === day
        );

        if (recurso) {
            res.status(200).json(recurso);
        } else {
            res.status(404).send("Not Found");
        }
    });


    // ==============================
    // POST COLECCIÓN
    // ==============================

    app.post(BASE_API_URL, (req, res) => {

        const nuevo = req.body;

        if (!nuevo.country || 
            !nuevo.start_year || 
            !nuevo.start_month || 
            !nuevo.start_day) {
            return res.status(400).send("Bad Request");
        }

        const existe = datos_jdd.find(d =>
            d.country === nuevo.country &&
            d.start_year === nuevo.start_year &&
            d.start_month === nuevo.start_month &&
            d.start_day === nuevo.start_day
        );

        if (existe) {
            return res.status(409).send("Conflict");
        }

        datos_jdd.push(nuevo);
        res.status(201).send();
    });


    // ==============================
    // PUT COLECCIÓN (NO PERMITIDO)
    // ==============================

    app.put(BASE_API_URL, (req, res) => {
        res.status(405).send();
    });


    // ==============================
    // DELETE COLECCIÓN
    // ==============================

    app.delete(BASE_API_URL, (req, res) => {
        datos_jdd = [];
        res.status(200).send();
    });


    // ==============================
    // PUT RECURSO CONCRETO
    // ==============================

    app.put(`${BASE_API_URL}/:country/:year/:month/:day`, (req, res) => {

        const country = req.params.country;
        const year = parseInt(req.params.year);
        const month = parseInt(req.params.month);
        const day = parseInt(req.params.day);

        const cuerpo = req.body;

        if (
            cuerpo.country !== country ||
            cuerpo.start_year !== year ||
            cuerpo.start_month !== month ||
            cuerpo.start_day !== day
        ) {
            return res.status(400).send("Bad Request");
        }

        const index = datos_jdd.findIndex(d =>
            d.country === country &&
            d.start_year === year &&
            d.start_month === month &&
            d.start_day === day
        );

        if (index !== -1) {
            datos_jdd[index] = cuerpo;
            res.status(200).send();
        } else {
            res.status(404).send("Not Found");
        }
    });


    // ==============================
    // DELETE RECURSO CONCRETO
    // ==============================

    app.delete(`${BASE_API_URL}/:country/:year/:month/:day`, (req, res) => {

        const country = req.params.country;
        const year = parseInt(req.params.year);
        const month = parseInt(req.params.month);
        const day = parseInt(req.params.day);

        const longitudInicial = datos_jdd.length;

        datos_jdd = datos_jdd.filter(d =>
            !(d.country === country &&
              d.start_year === year &&
              d.start_month === month &&
              d.start_day === day)
        );

        if (datos_jdd.length < longitudInicial) {
            res.status(200).send();
        } else {
            res.status(404).send("Not Found");
        }
    });


}