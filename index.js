//IMPORTACIONES
import apiAJM from "./api-AJM.js";
import express from 'express';
import cool from 'cool-ascii-faces';
import path from 'path'; // <-- Cambiado de require a import
import { fileURLToPath } from 'url'; // <-- Necesario para fabricar __dirname

//Módulos ES para poder usar __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

//Para utilizar los archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, 'public')));

app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about', 'index.html'));
    console.log("New request to /about");
});


//Ruta dinámica /cool
app.get('/cool', (req, res) => {
    console.log("Requested /cool route");
    res.send(`<html><body><h1>Faces:</h1><p>${cool()}</p></body></html>`);
});

//NUESTRAS APIs
apiAJM(app);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});



//AJM   /////////////////////////////////////////////////////////

const datos_ajm = [
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

app.get("/samples/AJM", (req, res) => {
    const paisBuscado = "Antigua and Barbuda";
    const datosFiltrados = datos_ajm.filter(fila => fila.flag_of_registration_label === paisBuscado);
    
    const sumaBarcos = datosFiltrados
        .map(fila => fila.number_of_ships)
        .reduce((acc, curr) => acc + curr, 0);

    let mediaBarcos = datosFiltrados.length > 0 ? (sumaBarcos / datosFiltrados.length) : 0;

    // Enviamos el mismo resultado que salía en tu consola
    res.send(`La media de 'number_of_ships' para '${paisBuscado}' es: ${mediaBarcos}`);
    console.log("Acceso a /samples/AJM - Algoritmo replicado correctamente");
});


//MZA   /////////////////////////////////////////////////////////

const datos_mza = [
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

app.get("/samples/MZA", (req, res) => {
    const regionObjetivo = "Latin America";
    const valoresEsgOverall = datos_mza.filter(d => d.region === regionObjetivo)
                                .map(d => d.esg_overall);
    const sumaTotal = valoresEsgOverall.reduce((acc, val) => acc + val, 0);
    const media = valoresEsgOverall.length > 0 ? sumaTotal / valoresEsgOverall.length : 0;

    res.send(`La media de 'esg_overall' para la región ${regionObjetivo} es: ${media.toFixed(2)}`);
    console.log("Acceso a /samples/MZA - Algoritmo replicado correctamente");
});

/////////////////////////////////////////////////////////////////////////////////