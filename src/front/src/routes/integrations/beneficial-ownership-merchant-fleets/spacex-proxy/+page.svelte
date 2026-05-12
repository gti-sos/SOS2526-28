<script>
    import { onMount } from 'svelte';
    
    // Variables de estado
    let cargando = $state(true);
    let errorMensaje = $state("");
    let chartContainer; 
    
    let spacexDatosTotales = []; 
    let Highcharts; 

    // Variable para la tabla
    let datosTabla = $state([]);

    // Diccionarios para traducir 
    const diccionarioTipos = {
        "Tug": "Remolcador",
        "Cargo": "Carguero",
        "Barge": "Plataforma (Barcaza)",
        "High Speed Craft": "Embarcación Rápida",
        "Ship": "Barco",
        "Desconocido": "Desconocido"
    };

    const diccionarioPuertos = {
        "Port of Los Angeles": "Puerto de Los Ángeles",
        "Port Canaveral": "Puerto Cañaveral",
        "Fort Lauderdale": "Fuerte Lauderdale",
        "Desconocido": "Desconocido"
    };

    onMount(async () => {
        try {
            // Importación Highcharts y de Sankey
            const hc = await import('highcharts');
            const hcs = await import('highcharts/modules/sankey');
            
            Highcharts = hc.default || hc;
            if (typeof hcs.default === 'function') hcs.default(Highcharts);
            else if (typeof hcs === 'function') hcs(Highcharts);

            // Llamada al proxy
            //const miProxyUrl = 'http://localhost:3000/api/spacex/v4/ships'; //Lo tengo para mis pruebas en local
            const miProxyUrl = '/api/spacex/v4/ships';
            
            const resSpacex = await fetch(miProxyUrl);

            if (!resSpacex.ok) throw new Error("Fallo al conectar con el proxy propio");

            spacexDatosTotales = await resSpacex.json();

            procesarYDibujar();
            cargando = false;

        } catch (error) {
            console.error("Error cargando gráfica:", error);
            errorMensaje = error.message;
            cargando = false;
        }
    });

    function procesarYDibujar() {
        if (!Highcharts || spacexDatosTotales.length === 0) return;

        let enlaces = {};
        let tempDatosTabla = [];

        spacexDatosTotales.forEach(nave => {
            let tipoOriginal = nave.type || 'Desconocido';
            let puertoOriginal = nave.home_port || 'Desconocido';
            let añoConstruccion = nave.year_built || 'Año desconocido';

            let tipoTraducido = diccionarioTipos[tipoOriginal] || tipoOriginal;
            let puertoTraducido = diccionarioPuertos[puertoOriginal] || puertoOriginal;

            // Datos para la tabla 
            tempDatosTabla.push({
                nombre: nave.name,
                año: nave.year_built || '-',
                masa: nave.mass_kg || '-',
                tipo: tipoTraducido,
                puerto: puertoTraducido,
                activa: nave.active ? '✅ Sí' : '❌ No'
            });

            // Sankey de 3 niveles
            // Del puerto al tipo de barco
            let clave1 = `${puertoTraducido}|${tipoTraducido}`;
            enlaces[clave1] = (enlaces[clave1] || 0) + 1;

            // Del tipo de barco al año de fabricación
            let clave2 = `${tipoTraducido}|${añoConstruccion}`;
            enlaces[clave2] = (enlaces[clave2] || 0) + 1;
        });

        datosTabla = tempDatosTabla.sort((a, b) => a.puerto.localeCompare(b.puerto));

        // Los datos formateados para Highcharts
        let datosSankey = Object.keys(enlaces).map(clave => {
            let [from, to] = clave.split('|');
            return {
                from: from,
                to: to,
                weight: enlaces[clave]
            };
        }).sort((a,b) => {
            return a.to.localeCompare(b.to);
        });

        // Dibujo del gráfico
        Highcharts.chart(chartContainer, {
            chart:{
                height: 750
            },
            tittle:{
                text: 'Flujo de Naves SpaceX: Puertos a Tipos de Embarcación'
            },
            series: [{
                keys: ['from', 'to', 'weight'],
                data: datosSankey,
                type: 'sankey',
                name: 'Distribución de la flota'
            }]
        });
    }

</script>



<div class="container" style="max-width: 1100px; margin: 40px auto; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    
    <h2 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
        🛡️ Uso con Proxy (Externa 1): Barcos SpaceX
    </h2><br>

    <p style="color: #475569; line-height: 1.6; font-size: 1.05rem; margin-bottom: 20px;">
        <strong>Tipo de visualización:</strong> Diagrama de Flujo (Sankey Diagram)
    </p>
    <p style="color: #475569; line-height: 1.6; font-size: 1.05rem; margin-bottom: 20px;">
        <strong>Descripción del uso:</strong> La api usada es pública y hecha por aficionados a las misiones espaciales. Esta api recoge los datos de SpaceX para mostrar cómo se organiza la flota naval que emplean en sus misiones para recoger los restos de los aterrizajes en el mar. El gráfico traza de forma visual el camino que une el puerto base de cada barco con su tipo de embarcación y su año de fabricación. Toda la información se ha traducido al español para facilitar la lectura.
    </p><br>


    {#if cargando}
        <div style="padding: 20px; background-color: #f0f9ff; color: #0284c7; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            ⏳ Conectando con el Proxy y recuperando datos de SpaceX...
        </div>
    {/if}

    {#if errorMensaje}
        <div style="background-color: #fee2e2; border: 1px solid #ef4444; color: #b91c1c; padding: 15px; border-radius: 8px;">
            <strong>❌ Error:</strong> {errorMensaje}
        </div>
    {/if}

    <!-- SANKEY -->
    <div style="background: white; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; margin-bottom: 30px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
        <div bind:this={chartContainer}></div>
    </div>

    <!-- TABLA DE DATOS -->
    {#if datosTabla.length > 0}
        <h3 style="color: #334155; margin-bottom: 20px; border-left: 4px solid #3b82f6; padding-left: 10px;">
            Inventario de la Flota
        </h3>
        <div style="overflow-x: auto; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
            <table style="width: 100%; border-collapse: collapse; background: white; text-align: left;">
                <thead>
                    <tr style="background-color: #f8fafc; border-bottom: 2px solid #cbd5e1;">
                        <th style="padding: 15px; color: #1e293b;">Nombre de la Nave</th>
                        <th style="padding: 15px; color: #1e293b;">Año fabricación</th>
                        <th style="padding: 15px; color: #1e293b;">Masa(kg)</th>
                        <th style="padding: 15px; color: #1e293b;">Puerto Base</th>
                        <th style="padding: 15px; color: #1e293b;">Tipo de Embarcación</th>
                        <th style="padding: 15px; color: #1e293b;">¿En Activo?</th>
                    </tr>
                </thead>
                <tbody>
                    {#each datosTabla as nave, i}
                        <tr style="border-bottom: 1px solid #e2e8f0; background-color: {i % 2 === 0 ? 'white' : '#f8fafc'}; transition: background 0.2s;">
                            <td style="padding: 12px; font-weight: bold; color: #0f766e;">{nave.nombre}</td>
                            <td style="padding: 12px;">{nave.año}</td>
                            <td style="padding: 12px;">{nave.masa}</td>
                            <td style="padding: 12px;">{nave.puerto}</td>
                            <td style="padding: 12px;">{nave.tipo}</td>
                            <td style="padding: 12px;">{nave.activa}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}

    <div class="mt-5 mb-5" style="display: flex; justify-content: space-between; width: 100%; padding-top: 20px;">
        <a href="/integrations" style="text-decoration: none; padding: 12px 25px; background-color: #3b82f6; color: white; border-radius: 5px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            ⬅ VOLVER A INTEGRACIONES
        </a>
        <a href="https://github.com/r-spacex/SpaceX-API" target="_blank" style="text-decoration: none; padding: 12px 25px; background-color: #3b82f6; color: white; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-flex; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.3s ease;">
            VER GITHUB SpaceX REST API ➡
        </a>
    </div>
</div>

<style>
    tr:hover { background-color: #eff6ff !important; }
</style>