<script>
    import { onMount } from 'svelte';

    let chartContainer;
    let errorMessage = "";

    onMount(async () => {
        try {
            // 1. OBTENGO LOS DATOS DE LA API
            const res = await fetch('/api/v1/beneficial-ownership-merchant-fleets');
            if (!res.ok) throw new Error("Error al conectar con la API");
            const datosApi = await res.json();

            // 2. CONFIGURACIÓN DE COLORES FIJOS (2014 - 2025)
            const colorPorAño = {
                "2014": "#FF6B6B", // Rojo pastel
                "2015": "#4ECDC4", // Turquesa
                "2016": "#FDCB6E", // Amarillo Mostaza
                "2017": "#6C5CE7", // Morado
                "2018": "#E17055", // Naranja terracota
                "2019": "#0984E3", // Azul claro
                "2020": "#00B894", // Verde esmeralda
                "2021": "#E84393", // Fucsia
                "2022": "#F39C12", // Ámbar oscuro
                "2023": "#8E44AD", // Violeta oscuro
                "2024": "#2980B9", // Azul océano
                "2025": "#27AE60"  // Verde bosque
            };

            // 3. PROCESAMIENTO DE DATOS
            const registrosUnicos = [...new Set(datosApi.map(d => d.flag_of_registration_label))];
            
            const seriesPrincipal = [];
            const diccionarioDrilldown = {}; // Para las series apiladas

            registrosUnicos.forEach(reg => {
                // Filtro los datos solo de este País de Registro
                const datosReg = datosApi.filter(d => d.flag_of_registration_label === reg);
                const total = datosReg.reduce((sum, d) => sum + d.number_of_ships, 0);

                // A) Creo la columna gigante para la pantalla principal
                seriesPrincipal.push({
                    name: reg,
                    y: total,
                    drilldown: reg 
                });

                // Extraigo años y propietarios únicos para alinear el Eje X
                const añosUnicos = [...new Set(datosReg.map(d => d.year.toString()))].sort();
                const propsUnicos = [...new Set(datosReg.map(d => d.beneficial_ownership_label))].sort();

                const seriesDeEsteReg = [];

                // B) Creo una capa (serie) por cada año encontrado
                añosUnicos.forEach(año => {
                    const datosApilados = propsUnicos.map(prop => {
                        const fila = datosReg.find(d => d.year.toString() === año && d.beneficial_ownership_label === prop);
                        return {
                            name: prop, // Mantiene el Eje X fijo
                            y: fila ? fila.number_of_ships : 0, // 0 para que la columna pueda apilarse encima
                            tons: fila ? fila.dead_weight_tons : 0,
                            pct: fila ? fila.percentage_of_total_fleet : 0
                        };
                    });

                    // Añado el año al almacén con su color y su orden de apilar
                    seriesDeEsteReg.push({
                        id: reg,
                        name: `Año ${año}`,
                        data: datosApilados,
                        stacking: 'normal',
                        color: colorPorAño[año] 
                    });
                });

                diccionarioDrilldown[reg] = seriesDeEsteReg;
            });

            // 4. IMPORTACIONES SEGURAS PARA SVELTEKIT
            const HighchartsModule = await import('highcharts');
            const Highcharts = HighchartsModule.default || HighchartsModule;
            const DrilldownModule = await import('highcharts/modules/drilldown');
            const drilldownFunc = DrilldownModule.default || DrilldownModule;
            if (typeof drilldownFunc === 'function') drilldownFunc(Highcharts);

            // 5. INYECCIÓN Y CONFIGURACIÓN DEL LIENZO
            Highcharts.chart(chartContainer, {
                chart: {
                    type: 'column',
                    // EVENTO MANUAL: Evita el bug de Highcharts que borra las series
                    events: {
                        drilldown: function (e) {
                            if (!e.seriesOptions) {
                                const chart = this;
                                const seriesParaApilar = diccionarioDrilldown[e.point.drilldown];
                                
                                if (seriesParaApilar) {
                                    seriesParaApilar.forEach(serie => {
                                        chart.addSingleSeriesAsDrilldown(e.point, serie);
                                    });
                                    chart.applyDrilldown();
                                }
                            }
                        }
                    }
                },
                title: { 
                    text: 'Flota Mercante por país de beneficiario efectivo' 
                },
                subtitle: { 
                    text: 'Haz clic en una columna para ver los países propietarios que han registrado en el país de Registro' 
                },
                xAxis: { 
                    type: 'category' 
                },
                yAxis: { 
                    title: { text: 'Número de barcos registrados' } 
                },
                tooltip: {
                    useHTML: true,
                    headerFormat: '<span style="font-size:13px; font-weight:bold;">{point.key}</span><br/>',
                    pointFormat: 
                        '<span style="color:{series.color}">\u25CF</span> <b>{series.name}</b><br/>' +
                        'Barcos: <b>{point.y}</b><br/>' +
                        'Peso: <b>{point.tons:.2f} tons</b><br/>' +
                        '% Total: <b>{point.pct:.2f}%</b><br/>'
                },
                plotOptions: {
                    column: {
                        borderWidth: 1,
                        borderColor: '#ffffff',
                        dataLabels: {
                            enabled: true,
                            format: '{point.y}',
                            filter: { property: 'y', operator: '>', value: 0 } // Oculta las etiquetas de valor 0
                        }
                    }
                },
                series: [{
                    name: 'Países de Registro',
                    colorByPoint: true, // Da un color distinto a cada país en la primera vista
                    data: seriesPrincipal
                }],
                drilldown: {
                    series: [] // Se inyectan dinámicamente con el evento de arriba
                }
            });

        } catch (e) {
            errorMessage = "Error cargando la gráfica. Revisa la consola.";
            console.error(e);
        }
    });
</script>

<svelte:head>
    <title>Análisis de Flota Mercante</title>
</svelte:head>

<main class="container mt-5">
    <h2 class="text-center mb-4">📊 Visualización gráfica de la flota mercante por país de beneficiario efectivo</h2><br>
    
    {#if errorMessage} 
        <div class="alert alert-danger text-center">{errorMessage}</div> 
    {/if}
    
    <div bind:this={chartContainer} style="width: 100%; height: 600px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);"></div>
    
    <div class="mt-5 mb-5" style="display: flex; justify-content: space-between; width: 100%; padding-top: 20px;">
    <a href="/beneficial-ownership-merchant-fleets" style="text-decoration: none; padding: 12px 25px; background-color: #3b82f6; color: white; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-flex; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.3s ease;">
        ⬅ ACCEDER A LOS DATOS
    </a>
    
    <a href="/analytics/beneficial-ownership-merchant-fleets/map" style="text-decoration: none; padding: 12px 25px; background-color: #3b82f6; color: white; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-flex; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.3s ease;">
        VISUALIZACIÓN GEOSPACIAL ➡
    </a>
</div>
</main>