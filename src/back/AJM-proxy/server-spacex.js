import request from 'request';

export default function proxySpaceX(app) {
    // La ruta base que usarás desde Svelte
    const paths = '/api/spacex';
    // La API real a la que le vamos a robar los datos
    const apiServerHost = 'https://api.spacexdata.com';

    app.use(paths, function(req, res) {
        // req.url será la parte final (ej: "/v4/ships")
        const url = apiServerHost + req.url;
        console.log('Proxy de SpaceX redireccionando a: ' + url);
        
        // El pipe que tú querías usar
        req.pipe(request(url)).pipe(res);
    });
}