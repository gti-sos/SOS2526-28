//IMPORTACIONES
import apiAJM from "./api-AJM.js";
import apiMZA from "./api-MZA.js";
import apiJDD from "./api-JDD.js";
import hungermapProxy from './proxy-hungermap.js';
import express from 'express';

import cors from 'cors';
import {handler} from '../front/build/handler.js';

import path, { dirname } from 'path'; // <-- Cambiado de require a import
import { fileURLToPath } from 'url'; // <-- Necesario para fabricar __dirname

const port = process.env.PORT || 3000;

//Módulos ES para poder usar __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

app.use(cors());




//Para utilizar los archivos estáticos desde la carpeta "public"
//const frontPath = path.join(__dirname, '../front');
//const publicPath = path.join(__dirname, '../../public');

//app.use(express.static(frontPath));
//app.use(express.static(publicPath));

// Rutas para el Front-end
//app.get("/", (req, res) => {
  //  res.sendFile(path.join(frontPath, 'index.html'));
    //console.log("New request to /");
//});

//Para el about
//app.get("/about", (req, res) => {
  //  res.sendFile(path.join(publicPath, 'about', 'index.html'));
    //console.log("New request to /about");
//});


//NUESTRAS APIs
apiAJM(app);
apiMZA(app);
apiJDD(app);
app.use('/proxy/hungermap', hungermapProxy);

app.use('/api', (req, res) => {
    res.status(404).send("Not Found");
});

app.use(handler);   //Obligatoriamente detrás de las API

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});





