<script>
    import { onMount } from 'svelte';
    
    // Variables de estado 
    let cargando = $state(true);
    let errorMensaje = $state("");
    let chartContainer;
    
    // Estado para controlar el año seleccionado y los datos descargados
    let añoSeleccionado = $state(2022); 
    const añosDisponibles = [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
    
    let misDatosTotales = []; // Mi API
    let wbDatosTotales = [];  // Todo el Banco Mundial
    let Highcharts;           // Guardo la librería aquí para usarla al cambiar de año

    const mapaBancoMundial = {
        "Korea, Rep.": "Republic of Korea",
        "Hong Kong SAR, China": "China, Hong Kong SAR",
        "Macao SAR, China": "China, Macao SAR",
        "Egypt, Arab Rep.": "Egypt",
        "Russian Federation": "Russian Federation", 
        "Turkiye": "Turkiye",
        "Slovak Republic": "Slovakia",
        "United States": "United States",
        "United Kingdom": "United Kingdom",
        "Bahamas, The": "Bahamas",
        "Syrian Arab Republic": "Syrian Arab Republic"
    };

    onMount(async () => {
        try {
            const hc = await import('highcharts');
            Highcharts = hc.default || hc;
            
            const ht = await import('highcharts/modules/heatmap');
            const tm = await import('highcharts/modules/treemap');
            
            if (typeof ht.default === 'function') ht.default(Highcharts);
            else if (typeof ht === 'function') ht(Highcharts);
            else if (ht.default && typeof ht.default.default === 'function') ht.default.default(Highcharts);

            if (typeof tm.default === 'function') tm.default(Highcharts);
            else if (typeof tm === 'function') tm(Highcharts);
            else if (tm.default && typeof tm.default.default === 'function') tm.default.default(Highcharts);

            console.log("Descargando historial completo de datos...");
            const miUrl = '/api/v2/beneficial-ownership-merchant-fleets'; 
            
            // Descargo TODOS los años de golpe (2014:2025) y pido hasta 5000 resultados para que no se corte
            const wbUrl = 'https://api.worldbank.org/v2/country/all/indicator/NY.GDP.MKTP.CD?format=json&per_page=5000&date=2014:2025';
            
            const [miRespuesta, wbRespuesta] = await Promise.all([
                fetch(miUrl),
                fetch(wbUrl)
            ]);

            if (!miRespuesta.ok) throw new Error("Fallo al cargar tu API");
            if (!wbRespuesta.ok) throw new Error("Fallo al cargar la API del Banco Mundial");

            misDatosTotales = await miRespuesta.json();
            const wbDataBruta = await wbRespuesta.json();
            wbDatosTotales = wbDataBruta[1] || []; // Array con los datos de todos los años

            cargando = false;
            
            // Pinto la gráfica por primera vez (2022)
            actualizarGrafica();

        } catch (error) {
            console.error("Error en la integración:", error);
            errorMensaje = error.message;
            cargando = false;
        }
    });

    // Se ejecuta al arrancar y cada vez que el usuario cambia el año
    function actualizarGrafica() {
        if (!Highcharts) return;

        // Filtro el Banco Mundial por el año seleccionado
        let pibPaises = {};
        wbDatosTotales.forEach(item => {
            // Compruebo que el dato no sea nulo y coincide con el año elegido
            if (item.value !== null && item.country && item.country.value && item.date === String(añoSeleccionado)) {
                let paisWB = item.country.value;
                let paisTraducido = mapaBancoMundial[paisWB] || paisWB;
                pibPaises[paisTraducido] = item.value; 
            }
        });

        // Filtro los barcos por el año seleccionado
        let acumuladorBarcos = {};
        misDatosTotales.forEach(dato => {
            if (Number(dato.year) === añoSeleccionado) {
                let pais = dato.beneficial_ownership_label;
                if (!acumuladorBarcos[pais]) acumuladorBarcos[pais] = 0;
                acumuladorBarcos[pais] += (Number(dato.number_of_ships) || 0);
            }
        });

        // Mezclo los datos
        let dataTreemap = [];
        Object.keys(acumuladorBarcos).forEach(pais => {
            if (pibPaises[pais]) {
                dataTreemap.push({
                    name: pais,
                    value: pibPaises[pais],         // tamaño = PIB
                    colorValue: acumuladorBarcos[pais] // color = Nº de Barcos
                });
            }
        });

        // Por si no hay datos
        if (dataTreemap.length === 0) {
            dataTreemap.push({ name: `Sin datos suficientes para ${añoSeleccionado}`, value: 1, colorValue: 0 });
        }

        // 4. Dibujo la Gráfica
        Highcharts.chart(chartContainer, {
            chart: { backgroundColor: 'transparent', animation: true },
            title: { 
                text: `Potencia Económica vs Flota Mercante (${añoSeleccionado})`, 
                style: { fontWeight: 'bold' } 
            },
            subtitle: { text: 'Tamaño del bloque = PIB | Color = Nº de Barcos' },
            colorAxis: {
                min: 0,
                stops: [
                    [0, '#e0f2fe'],    
                    [0.1, '#7dd3fc'],  
                    [0.3, '#0ea5e9'],  
                    [0.6, '#1d4ed8'],  
                    [1, '#0f172a']     
                ],
                labels: { format: '{value} barcos', style: { fontWeight: 'bold' } }
            },
            legend: {
                enabled: true, layout: 'horizontal', align: 'center', verticalAlign: 'bottom', symbolWidth: 400, 
                title: { text: 'Volumen de Flota Mercante (Nº de buques)', style: { fontWeight: 'normal', color: '#475569' } }
            },
            tooltip: {
                useHTML: true,
                pointFormatter: function () {
                    if (this.name.startsWith("Sin datos")) return `<b>${this.name}</b>`;
                    const pibMilMillones = (this.value / 1000000000).toFixed(2);
                    return `
                        <div style="padding: 5px; min-width: 200px;">
                            <span style="font-size: 1.2em; font-weight: bold; color: ${this.color}">${this.name}</span><br/><br/>
                            <strong>💰 PIB (${añoSeleccionado}):</strong><br/> $${pibMilMillones} Mil Millones<br/><br/>
                            <strong>🚢 Flota (${añoSeleccionado}):</strong><br/> ${this.colorValue} buques
                        </div>
                    `;
                }
            },
            series: [{
                type: 'treemap',
                layoutAlgorithm: 'squarified',
                data: dataTreemap,
                animation: { duration: 800 }, // Transición suave al cambiar de año
                dataLabels: {
                    enabled: true,
                    style: { textOutline: '1px contrast', fontWeight: 'bold' },
                    color: '#ffffff'
                }
            }]
        });
    }
</script>

<div class="container" style="max-width: 1000px; margin: 40px auto; padding: 20px;">
    

    <h2 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
        🌍 Integración (Externa 3): Poder comercial (PIB)
    </h2><br>

    <p style="color: #475569; line-height: 1.6; font-size: 1.05rem; margin-bottom: 20px;">
        <strong>Tipo de visualización:</strong> Mapa de Árbol Interactivo (Treemap)
    </p>

    <p style="color: #475569; line-height: 1.6; font-size: 1.05rem; margin-bottom: 20px;">
        <strong>Descripción de la integración:</strong> La api usada es pública y se ha obtenido de World Bank Open Data. Muestra la economía y la flota de distintos países en un año concreto, que se puede seleccionar en el menú inferior. En la visualización, el tamaño de los cuadrados representa la riqueza del país, mientras que la intensidad del color azul indica la cantidad de barcos mercantes que posee para el mismo año.
    </p>

    <!-- Panel de Controles Interactivo -->
    <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 20px; border-radius: 8px; margin-bottom: 20px; display: flex; align-items: center; gap: 15px;">
        <label for="selector-año" style="font-weight: bold; color: #1e293b; font-size: 1.1rem;">
            📅 Filtrar por Año:
        </label>
        
        <!-- Cuando cambia el valor, llama automáticamente a actualizarGrafica() -->
        <select 
            id="selector-año" 
            bind:value={añoSeleccionado} 
            onchange={actualizarGrafica}
            disabled={cargando}
            style="padding: 10px; font-size: 1.1rem; border-radius: 5px; border: 1px solid #94a3b8; outline: none; cursor: pointer; min-width: 150px;"
        >
            {#each añosDisponibles as anio}
                <option value={anio}>{anio}</option>
            {/each}
        </select>
        
        {#if cargando}
            <span style="color: #0ea5e9; font-weight: bold;">Cargando histórico mundial...</span>
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
        
        <a href="https://data.worldbank.org/indicator/NY.GDP.MKTP.CD" target="_blank" style="text-decoration: none; padding: 12px 25px; background-color: #3b82f6; color: white; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-flex; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.3s ease;">
            VER THE WORLD BANK ➡
        </a>
    </div>

</div>