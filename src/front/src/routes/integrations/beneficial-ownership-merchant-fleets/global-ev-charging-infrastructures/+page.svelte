<script>
    import { onMount } from 'svelte';
    
    // Variables de estado
    let cargando = $state(true);
    let errorMensaje = $state("");
    
    // Contenedores para los 3 gráficos
    let chartContainer1; // Puntos de carga
    let chartContainer2; // Potencia total
    let chartContainer3; // Eficiencia
    
    let evDatosTotales = []; 
    let Highcharts; 

    // Variables de estado para las tablas dinámicas
    let añosTabla = $state([]);
    let paisesTabla = $state([]);
    
    // Matrices para guardar los datos y pintarlos en las tablas
    let matrizCargadores = $state({});
    let matrizPotencia = $state({});
    let matrizEficiencia = $state({});

    onMount(async () => {
        try {
            const hc = await import('highcharts');
            const hcm = await import('highcharts/highcharts-more');
            const hcd = await import('highcharts/modules/dumbbell'); //Porque el lollipop lo utiliza
            const hcl = await import('highcharts/modules/lollipop');
            
            Highcharts = hc.default || hc;

            const inicializarModulo = (modulo) => {
                const initFunc = modulo.default || modulo;
                if (typeof initFunc === 'function') {
                    initFunc(Highcharts);
                }
            };

            inicializarModulo(hcm);
            inicializarModulo(hcd);
            inicializarModulo(hcl);

            // URL del compañero (Solo 1 Uso)
            const evUrl = 'https://sos2526-16.onrender.com/api/v1/global-ev-charging-infrastructures';
            
            const resEv = await fetch(evUrl);

            if (!resEv.ok) throw new Error("Fallo al conectar con la API del Grupo 16");

            evDatosTotales = await resEv.json();

            procesarYDibujar();
            cargando = false;

        } catch (error) {
            console.error("Error cargando gráfica:", error);
            errorMensaje = error.message;
            cargando = false;
        }
    });

    function procesarYDibujar() {
        let añosSet = new Set();
        let paisesSet = new Set();
        let aggEvs = {}; 

        // Recorro los datos
        evDatosTotales.forEach(d => {
            let pais = d.country; 
            let año = parseInt(d.year);

            if (!pais || !año) return;

            añosSet.add(año);
            paisesSet.add(pais);

            if (!aggEvs[pais]) aggEvs[pais] = {};
            if (!aggEvs[pais][año]) aggEvs[pais][año] = { power: 0, chargers: 0 };

            aggEvs[pais][año].power += parseFloat(d.total_power_kw) || 0;
            aggEvs[pais][año].chargers += parseInt(d.charging_point) || 0;
        });

        // Ordeno Años y Países
        añosTabla = Array.from(añosSet).sort((a, b) => a - b);
        paisesTabla = Array.from(paisesSet).sort();

        let tempMatrizCargadores = {};
        let tempMatrizPotencia = {};
        let tempMatrizEficiencia = {};
        
        let seriesCargadores = [];
        let seriesPotencia = [];
        let seriesEficiencia = [];

        // Formateo los datos para los 3 gráficos y 3 tablas
        paisesTabla.forEach(pais => {
            tempMatrizCargadores[pais] = {};
            tempMatrizPotencia[pais] = {};
            tempMatrizEficiencia[pais] = {};
            
            let datosCargadores = [];
            let datosPotencia = [];
            let datosEficiencia = [];

            añosTabla.forEach(año => {
                let d = aggEvs[pais][año];
                
                let valCargadores = d ? d.chargers : null;
                let valPotencia = d ? Number(d.power.toFixed(2)) : null;
                let valEficiencia = (d && d.chargers > 0) ? Number((d.power / d.chargers).toFixed(2)) : null;
                
                tempMatrizCargadores[pais][año] = valCargadores;
                tempMatrizPotencia[pais][año] = valPotencia;
                tempMatrizEficiencia[pais][año] = valEficiencia;

                datosCargadores.push(valCargadores);
                datosPotencia.push(valPotencia);
                datosEficiencia.push(valEficiencia);
            });

            // Series para Highcharts
            seriesCargadores.push({ name: pais, data: datosCargadores });
            seriesPotencia.push({ name: pais, data: datosPotencia });
            seriesEficiencia.push({ name: pais, data: datosEficiencia, marker: { symbol: 'circle' } });
        });

        // Actualizo el estado de las tablas
        matrizCargadores = tempMatrizCargadores;
        matrizPotencia = tempMatrizPotencia;
        matrizEficiencia = tempMatrizEficiencia;

        if (!Highcharts) return;

        // --- GRÁFICO 1: Número de Puntos de Carga ---
        if (chartContainer1) {
            Highcharts.chart(chartContainer1, {
                chart: { type: 'lollipop', backgroundColor: 'transparent', height: 450 },
                title: { text: '1. Total de Puntos de Carga por País', style: { fontWeight: 'bold' } },
                xAxis: { categories: añosTabla, crosshair: true },
                yAxis: { title: { text: 'Nº Puntos de Carga' }, min: 0 },
                tooltip: { shared: true, valueSuffix: ' pts' },
                series: seriesCargadores
            });
        }

        // --- GRÁFICO 2: Potencia Total ---
        if (chartContainer2) {
            Highcharts.chart(chartContainer2, {
                chart: { type: 'lollipop', backgroundColor: 'transparent', height: 450 },
                title: { text: '2. Potencia Total Instalada (kW)', style: { fontWeight: 'bold' } },
                xAxis: { categories: añosTabla, crosshair: true },
                yAxis: { title: { text: 'Potencia Total (kW)' }, min: 0 },
                tooltip: { shared: true, valueSuffix: ' kW' },
                series: seriesPotencia
            });
        }

        // --- GRÁFICO 3: Eficiencia ---
        if (chartContainer3) {
            Highcharts.chart(chartContainer3, {
                chart: { type: 'lollipop', backgroundColor: 'transparent', height: 500 },
                title: { text: '3. Eficiencia: Potencia Media por Cargador', style: { fontWeight: 'bold' } },
                subtitle: { text: '(Total kW / Total Cargadores)' },
                xAxis: { categories: añosTabla, crosshair: true },
                yAxis: { title: { text: 'Potencia Media (kW/Cargador)' }, min: 0 },
                tooltip: { shared: true, valueSuffix: ' kW' },
                series: seriesEficiencia
            });
        }
    }
</script>

<div class="container" style="max-width: 1200px; margin: 40px auto; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    
    <h2 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
        🎓 Uso SOS (Grupo 16): Infraestructuras globales de carga de vehículos eléctricos
    </h2><br>

    <p style="color: #475569; line-height: 1.6; font-size: 1.05rem; margin-bottom: 20px;">
        <strong>Tipo de visualización:</strong> Gráficos de Piruleta (Lollipop Charts)
    </p>
    <p style="color: #475569; line-height: 1.6; font-size: 1.05rem; margin-bottom: 20px;">
        <strong>Descripción del uso:</strong> La api usada pertenece a un compañero del grupo 16, consiste en un conjunto de datos sobre las infraestructuras de carga para vehículos. La utilizo para generar tres gráficos que facilitan la comprensión sobre cómo han evolucionado las infraestructuras de estos países (1º gráfico), qué potencia han suministrado ese año (2º gráfico) y si realmente son eficientes en esos años (KW totales / puntos de carga). También he complementado la información, añadiendo tres tablas al final que recogen estos datos.
    </p>

    {#if cargando}
        <div style="padding: 20px; background-color: #f0f9ff; color: #0284c7; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            ⏳ Construyendo las visualizaciones...
        </div>
    {/if}

    {#if errorMensaje}
        <div style="background-color: #fee2e2; border: 1px solid #ef4444; color: #b91c1c; padding: 15px; border-radius: 8px;">
            <strong>❌ Error:</strong> {errorMensaje}
        </div>
    {/if}

    <!--ZONA DE GRÁFICOS-->
    <div style="display: flex; flex-direction: column; gap: 40px; margin-bottom: 40px;">
        <div style="background: white; border: 1px solid #cbd5e1; border-radius: 12px; padding: 15px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <div bind:this={chartContainer1}></div>
        </div>
        
        <div style="background: white; border: 1px solid #cbd5e1; border-radius: 12px; padding: 15px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <div bind:this={chartContainer2}></div>
        </div>
        
        <div style="background: white; border: 1px solid #cbd5e1; border-radius: 12px; padding: 15px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <div bind:this={chartContainer3}></div>
        </div>
    </div>

    <!--TABLAS-->
    <h3 style="color: #334155; margin-bottom: 20px; border-left: 4px solid #3b82f6; padding-left: 10px;">Tabla de datos</h3>
    
    {#if añosTabla.length > 0}
        
        <!-- Tabla 1: Puntos de carga -->
        <h4 style="color: #475569; margin-top: 30px;">1. PUNTOS DE CARGA TOTALES</h4>
        <div style="overflow-x: auto; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 30px;">
            <table style="width: 100%; border-collapse: collapse; background: white; white-space: nowrap;">
                <thead>
                    <tr style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                        <th style="padding: 12px; border-right: 2px solid #cbd5e1; text-align: center;">Año</th>
                        {#each paisesTabla as pais}
                            <th style="padding: 10px; border-right: 1px solid #e2e8f0; text-align: center;">{pais}</th>
                        {/each}
                    </tr>
                </thead>
                <tbody>
                    {#each añosTabla as año, i}
                        <tr style="border-bottom: 1px solid #e2e8f0; background-color: {i % 2 === 0 ? 'white' : '#f8fafc'};">
                            <td style="padding: 10px; font-weight: bold; text-align: center; border-right: 2px solid #cbd5e1;">{año}</td>
                            {#each paisesTabla as pais}
                                <td style="padding: 10px; text-align: center; border-right: 1px solid #e2e8f0;">
                                    {matrizCargadores[pais][año] !== null ? matrizCargadores[pais][año] : '-'}
                                </td>
                            {/each}
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        <!-- Tabla 2: Potencia total-->
        <h4 style="color: #475569;">2. POTENCIA TOTAL INSTALADA (kW)</h4>
        <div style="overflow-x: auto; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 30px;">
            <table style="width: 100%; border-collapse: collapse; background: white; white-space: nowrap;">
                <thead>
                    <tr style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                        <th style="padding: 12px; border-right: 2px solid #cbd5e1; text-align: center;">Año</th>
                        {#each paisesTabla as pais}
                            <th style="padding: 10px; border-right: 1px solid #e2e8f0; text-align: center;">{pais}</th>
                        {/each}
                    </tr>
                </thead>
                <tbody>
                    {#each añosTabla as año, i}
                        <tr style="border-bottom: 1px solid #e2e8f0; background-color: {i % 2 === 0 ? 'white' : '#f8fafc'};">
                            <td style="padding: 10px; font-weight: bold; text-align: center; border-right: 2px solid #cbd5e1;">{año}</td>
                            {#each paisesTabla as pais}
                                <td style="padding: 10px; text-align: center; border-right: 1px solid #e2e8f0;">
                                    {matrizPotencia[pais][año] !== null ? matrizPotencia[pais][año] : '-'}
                                </td>
                            {/each}
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        <!-- Tabla 3: Eficiencia -->
        <h4 style="color: #475569;">3. EFICIENCIA: POTENCIA MEDIA (kW / Cargador)</h4>
        <div style="overflow-x: auto; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 30px;">
            <table style="width: 100%; border-collapse: collapse; background: white; white-space: nowrap;">
                <thead>
                    <tr style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                        <th style="padding: 12px; border-right: 2px solid #cbd5e1; text-align: center;">Año</th>
                        {#each paisesTabla as pais}
                            <th style="padding: 10px; border-right: 1px solid #e2e8f0; text-align: center;">{pais}</th>
                        {/each}
                    </tr>
                </thead>
                <tbody>
                    {#each añosTabla as año, i}
                        <tr style="border-bottom: 1px solid #e2e8f0; background-color: {i % 2 === 0 ? 'white' : '#f8fafc'};">
                            <td style="padding: 10px; font-weight: bold; text-align: center; border-right: 2px solid #cbd5e1;">{año}</td>
                            {#each paisesTabla as pais}
                                <td style="padding: 10px; text-align: center; border-right: 1px solid #e2e8f0;">
                                    {matrizEficiencia[pais][año] !== null ? matrizEficiencia[pais][año] : '-'}
                                </td>
                            {/each}
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
        
        <a href="https://sos2526-16.onrender.com/global-ev-charging-infrastructures" target="_blank" style="text-decoration: none; padding: 12px 25px; background-color: #3b82f6; color: white; border-radius: 5px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            VER DATOS G16 ➡
        </a>
    </div>
</div>

<style>
    tr:hover { background-color: #eff6ff !important; }
</style>