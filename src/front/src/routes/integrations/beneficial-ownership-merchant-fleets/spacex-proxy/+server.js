import { json } from '@sveltejs/kit';

export async function GET() {
    try {
        const respuesta = await fetch('https://api.spacexdata.com/v4/ships');
        
        if (!respuesta.ok) {
            throw new Error('Error al conectar con SpaceX API');
        }

        const datos = await respuesta.json();
        
        return json(datos);
        
    } catch (error) {
        console.error("Error en proxy:", error);
        return json({ error: "Fallo en el proxy de conexión" }, { status: 500 });
    }
}