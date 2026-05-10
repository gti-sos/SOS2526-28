<script>
    import { onMount } from 'svelte';
    
    let cargando = $state(true);
    let errorMensaje = $state("");
    let chartContainer;
    
    let añoSeleccionado = $state(2021); 
    const añosDisponibles = [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022];
    
    let misDatosTotales = []; 
    let Highcharts;           

    const diccionarioPaises = {
        "Russian Federation": "Russian Federation",
        "Republic of Korea": "Korea, Rep.",
        "United States": "United States",
        "United Kingdom": "United Kingdom",
        "Netherlands (Kingdom of the)": "Netherlands",
        "Turkiye": "Turkiye",
        "Syrian Arab Republic": "Syrian Arab Republic",
        "China, Hong Kong SAR": "Hong Kong SAR, China",
        "China, Macao SAR": "Macao SAR, China",
        "China, Taiwan Province of": "China",
        "Bahamas": "Bahamas, The", 
        "Chile": "Chile",
        "China": "China",
        "Greece": "Greece",
        "Germany": "Germany",
        "Japan": "Japan",
        "Singapore": "Singapore",
        "Cyprus": "Cyprus",
        "Italy": "Italy",
        "Norway": "Norway",
        "Denmark": "Denmark"
    };

    onMount(async () => {
        try {
            const hc = await import('highcharts');
            Highcharts = hc.default || hc;
            
            //IMPORTACIÓN DEL MÓDULO DE HEATMAP
            const heatmap = await import('highcharts/modules/heatmap');
            if (typeof heatmap.default === 'function') heatmap.default(Highcharts);
            else if (typeof heatmap === 'function') heatmap(Highcharts);
            else if (heatmap.default && typeof heatmap.default.default === 'function') heatmap.default.default(Highcharts);

            console.log("Descargando datos de mi API...");
            const miUrl = '/api/v2/beneficial-ownership-merchant-fleets'; 
            const miRespuesta = await fetch(miUrl);
            
            if (!miRespuesta.ok) throw new Error("Fallo al cargar mi API");
            misDatosTotales = await miRespuesta.json();
            
            await cargarDatosComercio(añoSeleccionado);

        } catch (error) {
            console.error("Error crítico:", error);
            errorMensaje = error.message;
            cargando = false;
        }
    });

    async function cargarDatosComercio(anio) {
        if (!Highcharts) return;
        cargando = true;
        
        try {
            const wbUrl = `https://api.worldbank.org/v2/country/all/indicator/TX.VAL.MRCH.CD.WT?format=json&per_page=300&date=${anio}`;
            const wbRespuesta = await fetch(wbUrl);
            
            if (!wbRespuesta.ok) throw new Error("Fallo en la API del Banco Mundial");
            
            const wbDataBruta = await wbRespuesta.json();
            const wbDatosDelAño = wbDataBruta[1] || []; 
            
            let barcosPorPais = {};
            misDatosTotales.forEach(dato => {
                if (String(dato.year) === String(anio)) {
                    let pais = dato.beneficial_ownership_label;
                    if (pais) barcosPorPais[pais] = (barcosPorPais[pais] || 0) + (Number(dato.number_of_ships) || 0);
                }
            });

            let exportacionesDelAño = {};
            wbDatosDelAño.forEach(wb => {
                if (wb.value !== null && wb.country && wb.country.value) {
                    exportacionesDelAño[wb.country.value] = wb.value;
                }
            });

            let paisesValidos = [];
            Object.keys(barcosPorPais).forEach(paisAPI => {
                let nombreWB = diccionarioPaises[paisAPI] || paisAPI;
                let exportaciones = exportacionesDelAño[nombreWB];
                let barcos = barcosPorPais[paisAPI];

                if (exportaciones !== undefined && exportaciones !== null && barcos > 0) {
                    paisesValidos.push({ nombre: paisAPI, barcos, exportaciones });
                }
            });

            // Variables para el Heatmap
            let categoriasY = []; // Nombres de los países
            let dataHeatmap = []; // Celdas de colores
            
            if (paisesValidos.length > 0) {
                paisesValidos.sort((a, b) => a.nombre.localeCompare(b.nombre));
                
                let maxBarcos = Math.max(...paisesValidos.map(p => p.barcos));
                let maxExportaciones = Math.max(...paisesValidos.map(p => p.exportaciones));

                paisesValidos.forEach((pais, indicePais) => {
                    categoriasY.push(pais.nombre);
                    
                    // Índice del 0 al 100 para determinar la intensidad del color
                    let intensidadBarcos = (pais.barcos / maxBarcos) * 100;
                    let intensidadExportaciones = (pais.exportaciones / maxExportaciones) * 100;

                    // CELDA (Columna Izquierda): Flota Mercante
                    dataHeatmap.push({
                        x: 0, // Posición columna
                        y: indicePais, // Posición fila
                        value: Number(intensidadBarcos.toFixed(1)),
                        datoReal: pais.barcos,
                        tipo: 'barcos'
                    });

                    // CELDA (Columna Derecha): Exportaciones
                    dataHeatmap.push({
                        x: 1, 
                        y: indicePais, 
                        value: Number(intensidadExportaciones.toFixed(1)),
                        datoReal: pais.exportaciones,
                        tipo: 'dinero'
                    });
                });
            }

            // Gráfico de Mapa de Calor
            Highcharts.chart(chartContainer, {
                chart: { 
                    type: 'heatmap', 
                    marginTop: 100,
                    marginBottom: 80,
                    plotBorderWidth: 1,
                    backgroundColor: 'transparent'
                },
                title: { 
                    text: `Matriz de Calor: Capacidad Logística vs Comercial (${anio})`, 
                    style: { fontWeight: 'bold' } 
                },
                subtitle: {
                    text: 'La intensidad del color indica el nivel de liderazgo del país respecto al top mundial'
                },
                xAxis: {
                    categories: ['🚢 Poder Logístico (Nº Flota)', '💰 Poder Comercial (Exportaciones)'],
                    opposite: true, // Títulos de las columnas arriba
                    labels: { style: { fontWeight: 'bold', fontSize: '13px', color: '#1e293b' } }
                },
                yAxis: {
                    categories: categoriasY,
                    title: null,
                    reversed: true, // Orden alfabético vaya de arriba a abajo
                    labels: { style: { fontWeight: 'bold', fontSize: '12px' } }
                },
                colorAxis: {
                    min: 0,
                    max: 100,
                    // Escala de colores
                    stops: [
                        [0, '#f8fafc'],   // Casi blanco (0%)
                        [0.1, '#bae6fd'], 
                        [0.5, '#0ea5e9'], 
                        [1, '#082f49']    // Azul marino (100% - Líder absoluto)
                    ],
                    labels: { format: '{value}%' }
                },
                legend: {
                    align: 'right',
                    layout: 'vertical',
                    margin: 0,
                    verticalAlign: 'top',
                    y: 60,
                    symbolHeight: 280
                },
                tooltip: {
                    useHTML: true,
                    formatter: function () {
                        let nombrePais = this.series.yAxis.categories[this.point.y];
                        let categoria = this.series.xAxis.categories[this.point.x];
                        
                        let valorFormateado = "";
                        if (this.point.tipo === 'dinero') {
                            valorFormateado = "$" + (this.point.datoReal / 1000000000).toFixed(2) + " Billones";
                        } else {
                            valorFormateado = this.point.datoReal + " buques registrados";
                        }

                        return `
                            <div style="padding: 8px; min-width: 200px; text-align: center;">
                                <div style="font-size: 1.2em; font-weight: bold; border-bottom: 2px solid ${this.point.color}; margin-bottom: 8px; padding-bottom: 4px;">
                                    ${nombrePais}
                                </div>
                                <div style="font-size: 0.9em; color: #64748b; margin-bottom: 5px;">
                                    ${categoria}
                                </div>
                                <div style="font-size: 1.2em; font-weight: bold; color: #1e293b; margin-bottom: 8px;">
                                    ${valorFormateado}
                                </div>
                                <div style="font-size: 0.85em; background: #f1f5f9; padding: 4px; border-radius: 4px;">
                                    Puntuación de liderazgo: <b>${this.point.value}%</b>
                                </div>
                            </div>
                        `;
                    }
                },
                series: [{
                    name: 'Matriz de Datos',
                    borderWidth: 1,
                    borderColor: '#ffffff',
                    data: dataHeatmap,
                    dataLabels: {
                        enabled: true,
                        color: '#000000',
                        style: {
                            textOutline: 'none',
                            fontWeight: 'normal'
                        },
                        formatter: function() {
                            return this.point.value  + '%';
                        }
                    }
                }]
            });

        } catch (error) {
            console.error("Error al procesar el gráfico:", error);
            errorMensaje = error.message;
        } finally {
            cargando = false;
        }
    }

    function cambiarAnio() {
        cargarDatosComercio(añoSeleccionado);
    }
</script>

<div class="container" style="max-width: 1000px; margin: 40px auto; padding: 20px;">

    <h2 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
        🌍 Integración (Externa 2): Exportaciones
    </h2>

    <p style="color: #475569; line-height: 1.6; font-size: 1.05rem; margin-bottom: 20px;">
        Este <strong>Mapa de Calor (Heatmap)</strong> compara a los principales países de manera equitativa, asignando una celda fija a cada variable. La intensidad del color (del blanco al azul oscuro) indica el peso relativo de ese país en el mercado mundial. Esto permite comparar gigantes logísticos con economías emergentes sin que ningún dato quede oculto por la escala gráfica.
    </p>

    <!-- Panel de Control -->
    <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 20px; border-radius: 8px; margin-bottom: 20px; display: flex; align-items: center; gap: 15px;">
        <label for="selector-año" style="font-weight: bold; color: #1e293b; font-size: 1.1rem;">
            📅 Año seleccionado:
        </label>
        
        <select 
            id="selector-año" 
            bind:value={añoSeleccionado} 
            onchange={cambiarAnio}
            disabled={cargando}
            style="padding: 10px; font-size: 1.1rem; border-radius: 5px; border: 1px solid #94a3b8; outline: none; cursor: pointer; min-width: 150px;"
        >
            {#each añosDisponibles as anio}
                <option value={anio}>{anio}</option>
            {/each}
        </select>
        
        {#if cargando}
            <span style="color: #0ea5e9; font-weight: bold;">Auditando datos...</span>
        {/if}
    </div>

    {#if errorMensaje}
        <div style="background-color: #fee2e2; border: 1px solid #ef4444; color: #b91c1c; padding: 15px; border-radius: 8px;">
            <strong>❌ Error de integración:</strong> {errorMensaje}
        </div>
    {/if}

    <div style="position: relative; border: 1px solid #cbd5e1; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); padding: 15px; background-color: white;">
        <div bind:this={chartContainer} style="width: 100%; height: 700px;"></div>
    </div>

    <div class="mt-5 mb-5" style="display: flex; justify-content: space-between; width: 100%; padding-top: 20px;">
        <a href="/integrations" style="text-decoration: none; padding: 12px 25px; background-color: #3b82f6; color: white; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-flex; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.3s ease;">
            ⬅ VOLVER A INTEGRACIONES
        </a>
        
        <a href="/beneficial-ownership-merchant-fleets/v2" style="text-decoration: none; padding: 12px 25px; background-color: #3b82f6; color: white; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-flex; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.3s ease;">
            DATOS FLOTA MERCANTE (v2)
        </a>
        
        <a href="https://api.worldbank.org/v2/country/all/indicator/TX.VAL.MRCH.CD.WT?format=json" target="_blank" style="text-decoration: none; padding: 12px 25px; background-color: #3b82f6; color: white; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-flex; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.3s ease;">
            WORLD BANK OPEN DATA ➡
        </a>
    </div>
</div>