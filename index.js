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

/////////////////////////////////////////////////////////////////////////////////