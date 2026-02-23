// Array con los 10 datos de ejemplo de la ficha
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

// Valor del campo de información geográfica a buscar
const paisBuscado = "AFG";

// Uso filter() para obtener el subconjunto de filas de ese país
const datosFiltrados = datos.filter(fila => fila.country === paisBuscado);

// Uso map() para extraer el campo numérico 'degree' y reduce() para sumar sus valores
const sumaDegrees = datosFiltrados
    .map(fila => fila.degree)
    .reduce((acumulador, valorActual) => acumulador + valorActual, 0);

// Cálculo de la media
let mediaDegrees = 0;
if (datosFiltrados.length > 0) {
    mediaDegrees = sumaDegrees / datosFiltrados.length;
}

// Resultado por consola
console.log(`La media de 'degree' para '${paisBuscado}' es: ${mediaDegrees}`);