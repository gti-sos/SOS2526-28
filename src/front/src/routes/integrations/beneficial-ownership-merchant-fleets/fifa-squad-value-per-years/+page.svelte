<script>
    import { onMount } from 'svelte';
    
    // Variables de estado
    let cargando = $state(true);
    let errorMensaje = $state("");
    let chartContainer;
    
    // Años dinámicos
    let añosDisponibles = $state([]);
    let añoSeleccionado = $state(); 
    
    let compiDatosTotales = []; 
    let Highcharts; 

    // Variables para la tabla
    let datosTabla = $state([]);

    // Mapa de colores para cada país
    const paletaColores = [
        '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
        '#ec4899', '#06b6d4', '#f97316', '#84cc16', '#64748b',
        '#14b8a6', '#6366f1', '#d946ef', '#eab308', '#f43f5e'
    ];

    onMount(async () => {
        try {
            const hc = await import('highcharts');
            Highcharts = hc.default || hc;
            
            // Módulo Funnel/Pyramid de Highcharts
            const funnel = await import('highcharts/modules/funnel');
            if (typeof funnel.default === 'function') funnel.default(Highcharts);
            else if (typeof funnel === 'function') funnel(Highcharts);

            // URL Api Grupo 26 (mi compañero tiene en su api un limite por defecto de 10, asi que he tenido que cambiar el limite a 100 para tener todos los datos)
            const compiUrl = 'https://sos2526-26.onrender.com/api/v2/fifa-squad-value-per-years?limit=100';
            
            const compiRespuesta = await fetch(compiUrl);

            if (!compiRespuesta.ok) throw new Error("Fallo al cargar la API de mi compañero (Grupo 26)");

            compiDatosTotales = await compiRespuesta.json();

            // Años de forma dinámica
            // Saco solo los años
            const todosLosAños = compiDatosTotales.map(item => Number(item.year));
            
            // Set para quitar duplicados y luego de nuevo a array
            const añosUnicos = [...new Set(todosLosAños)];
            
            // Ordenación de los años de menor a mayor
            añosDisponibles = añosUnicos.sort((a, b) => a - b);
            
            // Selecciono el año 2020 porque es el primero que tiene mas datos
            if (añosDisponibles.length > 0) {
                añoSeleccionado = 2020;
            }

            cargando = false;
            
            // Actualizo la gráfica después de seleccionar el último año
            actualizarGrafica();

        } catch (error) {
            console.error("Error:", error);
            errorMensaje = error.message;
            cargando = false;
        }
    });

    function actualizarGrafica() {
        if (!Highcharts || !añoSeleccionado) return;

        const añoNumerico = Number(añoSeleccionado);

        // Filtro y ordeno los datos de la API 26 (de mayor a menor valor)
        let datosFiltrados = compiDatosTotales
            .filter(item => Number(item.year) === añoNumerico)
            .sort((a, b) => b.total_market_value - a.total_market_value);

        let tempDatosTabla = [];
        let datosPiramide = [];

        // Datos para Highcharts y para la tabla HTML
        if (datosFiltrados.length === 0) {
            datosPiramide = [{ name: 'Sin datos', y: 0, color: '#cccccc' }];
        } else {
            datosFiltrados.forEach((item, index) => {
                const colorAsignado = paletaColores[index % paletaColores.length];
                
                tempDatosTabla.push({
                    pais: item.country,
                    valor: item.total_market_value,
                    plantilla:item.squad_size,
                    valorPlantilla: item.average_market_value,
                    color: colorAsignado
                });

                datosPiramide.push({
                    name: item.country,
                    y: item.total_market_value,
                    color: colorAsignado
                });
            });
        }

        // Actualizo el estado de la tabla
        datosTabla = tempDatosTabla;

        // DIBUJO PIRÁMIDE 
        Highcharts.chart(chartContainer, {
            chart: { 
                type: 'pyramid', 
                backgroundColor: 'transparent'
            },
            title: { 
                text: `Uso de API: Valor de Selecciones FIFA (${añoNumerico})`,
                style: { fontWeight: 'bold' } 
            },
            plotOptions: {
                series: {
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b> ({point.y} M€)',
                        softConnector: true
                    },
                    center: ['50%', '50%'],
                    width: '60%' 
                }
            },
            tooltip: {
                useHTML: true,
                formatter: function() {
                    return `<span style="color:${this.point.color}">\u25CF</span> <b>${this.point.name}</b><br/>Valor Económico: <b>${this.y} M€</b>`;
                }
            },
            series: [
                {
                    name: 'Valor Selección FIFA',
                    data: datosPiramide
                }
            ]
        });
    }
</script>

<div class="container" style="max-width: 1100px; margin: 40px auto; padding: 20px;">
    
    <h2 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
        🎓 Uso SOS (Grupo 26): FIFA Valores de los equipos nacionales
    </h2>

    <p style="color: #475569; line-height: 1.6; font-size: 1.05rem; margin-bottom: 20px;">
        En este <strong>uso</strong> de la API, se utiliza un <strong>gráfico de Pirámide (Pyramid Chart)</strong> de Highcharts. Se visualiza únicamente el valor económico de las selecciones, ordenados de menor(punta) a mayor(base), así como su muestra a través de una tabla HTML dinámica.
    </p>

    <!-- Panel de Control -->
    <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 20px; border-radius: 8px; margin-bottom: 20px; display: flex; align-items: center; gap: 15px;">
        <label for="selector-año" style="font-weight: bold; color: #1e293b; font-size: 1.1rem;">
            📅 Filtrar por Año:
        </label>
        
        <select 
            id="selector-año" 
            bind:value={añoSeleccionado} 
            onchange={actualizarGrafica}
            disabled={cargando || añosDisponibles.length === 0}
            style="padding: 10px; font-size: 1.1rem; border-radius: 5px; border: 1px solid #94a3b8; outline: none; cursor: pointer; min-width: 150px;"
        >
            {#each añosDisponibles as anio}
                <option value={anio}>{anio}</option>
            {/each}
        </select>
        
        {#if cargando}
            <span style="color: #0ea5e9; font-weight: bold;">Cargando datos de la API del Grupo 26...</span>
        {/if}
    </div>

    {#if errorMensaje}
        <div style="background-color: #fee2e2; border: 1px solid #ef4444; color: #b91c1c; padding: 15px; border-radius: 8px;">
            <strong>❌ Error de conexión:</strong> {errorMensaje}
        </div>
    {/if}

    <!-- GRÁFICO (PIRÁMIDE SIMPLE) -->
    <div style="position: relative; border: 1px solid #cbd5e1; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); padding: 15px; background-color: white; margin-bottom: 30px;">
        <div bind:this={chartContainer} style="width: 100%; height: 500px;"></div>
    </div>

    <!-- TABLA DE DATOS -->
    {#if datosTabla.length > 0}
        <div style="overflow-x: auto; margin-bottom: 30px; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <table style="width: 100%; border-collapse: collapse; text-align: center;">
                <thead style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                    <tr>
                        <th style="padding: 12px; color: #1e293b; font-weight: bold; width: 50px;">Color</th>
                        <th style="padding: 12px; color: #1e293b; font-weight: bold;">País</th>
                        <th style="padding: 12px; color: #1e293b; font-weight: bold;">Plantilla</th>
                        <th style="padding: 12px; color: #1e293b; font-weight: bold;">Valor Selección</th>
                        <th style="padding: 12px; color: #1e293b; font-weight: bold;">Valor medio plantilla</th>
                    </tr>
                </thead>
                <tbody>
                    {#each datosTabla as fila, i}
                        <tr style="border-bottom: 1px solid #e2e8f0;">
                            <td style="padding: 12px;">
                                <div style="width: 20px; height: 20px; border-radius: 50%; background-color: {fila.color}; border: 1px solid #cbd5e1;"></div>
                            </td>
                            <td style="padding: 12px; font-weight: bold; color: #334155;">{fila.pais}</td>
                            <td style="padding: 12px;">{fila.plantilla} jugadores</td>
                            <td style="padding: 12px;">{fila.valor} M€</td>
                            <td style="padding: 12px;">{fila.valorPlantilla} M€</td>
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

        <a href="https://sos2526-26.onrender.com/front-rfr" target="_blank" style="text-decoration: none; padding: 12px 25px; background-color: #3b82f6; color: white; border-radius: 5px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            DATOS GRUPO 26 ➡
        </a>
    </div>

</div>