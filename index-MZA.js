// Inicializa un array con los datos de ejemplo
const datos = [
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

// Valor del campo de información geográfica a buscar
const regionObjetivo = "Latin America";

// Filtramos los datos por la región objetivo y extraemos los valores de 'esg_overall'
const valoresEsgOverall = datos.filter(d => d.region === regionObjetivo)
                            .map(d => d.esg_overall);

// Calculamos la suma total (reduce)
const sumaTotal = valoresEsgOverall.reduce((acc, val) => acc + val, 0);

// Calculamos la media
const media = valoresEsgOverall.length > 0 ? sumaTotal / valoresEsgOverall.length : 0;

// Mostrar el resultado
console.log(`La media de 'esg_overall' para la región ${regionObjetivo} es: ${media.toFixed(2)}`);