//IMPORTACIONES
import apiAJM from "./api-AJM.js";
import apiMZA from "./api-MZA.js";
import apiJDD from "./api-JDD.js";
import express from 'express';

//PROXYs
import proxySpaceX from "./AJM-proxy/server-spacex.js";

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


//NUESTRAS APIs
apiAJM(app);
apiMZA(app);
apiJDD(app);

//NUESTROS PROXYs
proxySpaceX(app);

app.use('/api', (req, res) => {
    res.status(404).send("Not Found");
});

app.use(handler);   //Obligatoriamente detrás de las API

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});





