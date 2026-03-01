const express = require('express');
const cool = require('cool-ascii-faces');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

//Para servir los archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, 'public')));

//Ruta dinámica /cool
app.get('/cool', (req, res) => {
    console.log("Requested /cool route");
    res.send(`<html><body><h1>Faces:</h1><p>${cool()}</p></body></html>`);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});