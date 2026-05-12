<script>
    import { onMount } from 'svelte';

    let chartContainer;
    let errorMessage = "";

    onMount(async () => {
        try {
            // LLAMADA A LAS 3 APIS SIMULTÁNEAMENTE
            const [res1, res2, res3] = await Promise.all([
                fetch('/api/v2/beneficial-ownership-merchant-fleets'),
                fetch('/api/v1/deliberate-violence-against-civilians-events-worldwide'),
                fetch('/api/v1/company-esg-scores-financial-performances')
            ]);

            if (!res1.ok || !res2.ok || !res3.ok) throw new Error("Fallo en la conexión de las APIs");

            const datosFlota = await res1.json();
            const datosViolencia = await res2.json();
            const datosESG = await res3.json();

            // DICCIONARIOS TRADUCTORES
            
            // De nombre completo a código de 3 letras (Para cruzar con Violencia)
            const mapaCodigosPais = {
                "Afghanistan": "AFG", "Burundi": "BDI", "Burkina Faso": "BFA", 
                "Cameroon": "CMR", "Democratic Republic of the Congo": "COD", 
                "El Salvador": "ELS", "Ethiopia": "ETH", "Colombia": "COL",
                "Germany": "DEU", "Spain": "ESP", "Greece": "GRC", "Brazil": "BRA",
                "China": "CHN", "Japan": "JPN", "United States": "USA", "Australia": "AUS",
                "Antigua and Barbuda": "ATG", "Bahamas": "BHS","Bangladesh": "BGD",
                "Belgium": "BEL","Canada": "CAN","Chile": "CHL","China, Hong Kong SAR": "HKG",
                "China, Macao SAR": "MAC","China, Taiwan Province of": "TWN","Cyprus": "CYP",
                "Denmark": "DNK","Estonia": "EST","Finland": "FIN","France": "FRA",
                "Greenland": "GRL","Guadeloupe": "GLP","Iceland": "ISL","India": "IND",
                "Indonesia": "IDN","Ireland": "IRL","Italy": "ITA","Latvia": "LVA",
                "Liberia": "LBR","Lithuania": "LTU","Malta": "MLT","Marshall Islands": "MHL",
                "Netherlands (Kingdom of the)": "NLD","Norway": "NOR","Panama": "PAN",
                "Philippines": "PHL","Poland": "POL","Portugal": "PRT","Republic of Korea": "KOR",
                "Russian Federation": "RUS","Singapore": "SGP","Switzerland": "CHE",
                "Syrian Arab Republic": "SYR","Turkiye": "TUR","Ukraine": "UKR",
                "United Arab Emirates": "ARE","United Kingdom": "GBR"
            };

            // De nombre completo a región de ESG (Latin America, Europe, etc)
            const mapaRegiones = {
                "Colombia": "Latin America", "Brazil": "Latin America", "El Salvador": "Latin America",
                "Germany": "Europe", "Spain": "Europe", "Greece": "Europe", "Denmark": "Europe",
                "China": "Asia", "Japan": "Asia", "Afghanistan": "Asia",
                "United States": "North America","Cameroon": "Africa", "Burundi": "Africa", 
                "Ethiopia": "Africa","Australia": "Oceania","Antigua and Barbuda": "Latin America",
                "Bahamas": "Latin America","Bangladesh": "Asia","Belgium": "Europe",
                "Canada": "North America","Chile": "Latin America","China, Hong Kong SAR": "Asia",
                "China, Macao SAR": "Asia","China, Taiwan Province of": "Asia","Cyprus": "Europe",
                "Estonia": "Europe","Finland": "Europe","France": "Europe","Greenland": "North America",
                "Guadeloupe": "Latin America","Iceland": "Europe","India": "Asia","Indonesia": "Asia",
                "Ireland": "Europe","Italy": "Europe","Latvia": "Europe","Liberia": "Africa",
                "Lithuania": "Europe","Malta": "Europe","Marshall Islands": "Oceania",
                "Netherlands (Kingdom of the)": "Europe","Norway": "Europe","Panama": "Latin America",
                "Philippines": "Asia","Poland": "Europe","Portugal": "Europe","Republic of Korea": "Asia",
                "Russian Federation": "Europe","Singapore": "Asia","Switzerland": "Europe",
                "Syrian Arab Republic": "Asia","Turkiye": "Europe","Ukraine": "Europe",
                "United Arab Emirates": "Asia","United Kingdom": "Europe"
            };

            // PROCESAMIENTO DE DATOS: Mezcla de las 3 APIs
            // Sacamos los países propietarios de la base de datos de la flota Mercante
            const paisesPropietarios = [...new Set(datosFlota.map(d => d.beneficial_ownership_label))];
            const burbujas = [];

            paisesPropietarios.forEach(pais => {
                // Datos flota (Tamaño Z = Nº Barcos)
                const totalBarcos = datosFlota
                    .filter(d => d.beneficial_ownership_label === pais)
                    .reduce((sum, d) => sum + d.number_of_ships, 0);

                // Datos violencia (Eje Y = Nº de Eventos)
                // Buscamos por "AFG" en vez de "Afghanistan"
                const codigoIso = mapaCodigosPais[pais];
                let totalViolencia = 0;
                if (codigoIso) {
                    totalViolencia = datosViolencia.filter(d => d.country === codigoIso).length;
                }

                // Datos ESG (Eje X = Puntuación esg_overall de la Región)
                const regionDelPais = mapaRegiones[pais] || "Global";
                const empresasDeLaRegion = datosESG.filter(d => d.region === regionDelPais);
                
                let mediaESG = 50; // Valor por defecto
                if (empresasDeLaRegion.length > 0) {
                    const sumaESG = empresasDeLaRegion.reduce((sum, d) => sum + (d.esg_overall || 0), 0);
                    mediaESG = parseFloat((sumaESG / empresasDeLaRegion.length).toFixed(2));
                }

                // Solo añadimos la burbuja si el país tiene barcos registrados
                if (totalBarcos > 0) {
                    burbujas.push({
                        name: pais,
                        x: mediaESG,        // Eje X: esg_overall
                        y: totalViolencia,  // Eje Y: Eventos de Violencia
                        z: totalBarcos,     // Tamaño Z: numero de barcos
                        region: regionDelPais
                    });
                }
            });

            // CONFIGURACIÓN DE HIGHCHARTS BUBBLE
            const HighchartsModule = await import('highcharts');
            const Highcharts = HighchartsModule.default || HighchartsModule;
            const HighchartsMore = await import('highcharts/highcharts-more');
            const moreFunc = HighchartsMore.default || HighchartsMore;
            if (typeof moreFunc === 'function') moreFunc(Highcharts);

            Highcharts.chart(chartContainer, {
                chart: {
                    type: 'bubble',
                    plotBorderWidth: 1,
                    zoomType: 'xy',
                    backgroundColor: '#f8fafc'
                },
                title: {
                    text: 'Análisis Geoestratégico Global (Flota, ESG y Violencia)',
                    style: { fontWeight: 'bold' }
                },
                subtitle: {
                    text: 'Poder Logístico (Burbuja) vs Estabilidad (Eje Y) vs Ética Corporativa (Eje X)'
                },
                xAxis: {
                    title: { text: 'Puntuación Media ESG Overall (Región)' },
                    gridLineWidth: 1,
                    plotLines: [{
                        color: '#94a3b8',
                        dashStyle: 'dot',
                        width: 2,
                        value: 50,
                        label: { text: 'Límite Ético Medio', rotation: 0, y: 15 }
                    }]
                },
                yAxis: {
                    title: { text: 'Total Eventos de Violencia (País)' },
                    startOnTick: false,
                    endOnTick: false
                },
                tooltip: {
                    useHTML: true,
                    headerFormat: '<table>',
                    pointFormat: '<tr><th colspan="2" style="font-size: 14px; text-align:center; color:#3b82f6;"><h3>{point.name}</h3></th></tr>' +
                        '<tr><th>Región Finanzas:</th><td>{point.region}</td></tr>' +
                        '<tr><th>Nº Total Barcos:</th><td><b>{point.z}</b> naves</td></tr>' +
                        '<tr><th>Eventos Violencia:</th><td><b>{point.y}</b> incidentes</td></tr>' +
                        '<tr><th>Nota ESG Overall:</th><td><b>{point.x}</b> pts</td></tr>',
                    footerFormat: '</table>',
                    followPointer: true
                },
                plotOptions: {
                    bubble: {
                        minSize: 10,
                        maxSize: 80,
                        dataLabels: {
                            enabled: true,
                            format: '{point.name}',
                            style: { textOutline: '2px white', color: '#1e293b' }
                        }
                    }
                },
                series: [{
                    name: 'Países Propietarios',
                    data: burbujas,
                    color: 'rgba(59, 130, 246, 0.5)',
                    marker: {
                        fillColor: {
                            radialGradient: { cx: 0.4, cy: 0.3, r: 0.7 },
                            stops: [
                                [0, 'rgba(255,255,255,0.5)'],
                                [1, 'rgba(59, 130, 246, 0.7)']
                            ]
                        }
                    }
                }]
            });

        } catch (error) {
            errorMessage = "Error al cargar la gráfica conjunta. Detalles: " + error.message;
            console.error(error);
        }
    });
</script>

<div class="container mt-5">
    <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        
        {#if errorMessage}
            <div class="alert alert-danger">{errorMessage}</div>
        {/if}

        <div bind:this={chartContainer} style="width: 100%; height: 650px;"></div>
        
        <div class="mt-4" style="background: #f1f5f9; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <p style="margin: 0; color: #475569; font-size: 14px;">
                <b>💡 Cómo leer esta gráfica (Integración de 3 APIs):</b> 
                El tamaño de la burbuja representa el total de naves (<b>Flotas Mercantes</b>). 
                La posición vertical indica la inestabilidad del país (<b>Eventos de Violencia</b>). 
                La posición horizontal refleja el índice de sostenibilidad de las empresas en su región (<b>Puntuación ESG Overall</b>).
            </p>
        </div>
    </div>
    <br>
    <div class="mt-5 mb-5" style="display: flex; justify-content: center; width: 100%;">
    <a href="/" style="text-decoration: none; padding: 12px 25px; background-color: #3b82f6; color: white; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-flex; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.3s ease;">
        ⬅ VOLVER AL PANEL DE CONTROL
    </a>
</div>
</div>