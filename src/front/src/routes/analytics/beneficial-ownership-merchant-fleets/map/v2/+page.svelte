<script>
    import { onMount } from 'svelte';

    let mapContainer;
    let errorMessage = "";

    onMount(async () => {
        try {
            // OBTENCIÓN DE DATOS
            const res = await fetch('/api/v2/beneficial-ownership-merchant-fleets');
            if (!res.ok) throw new Error("Error en la API");
            const datosApi = await res.json();

            // DICCIONARIO DE COORDENADAS Y CLAVES (hc-key)
            const paisesInfo = {
                "Antigua and Barbuda": { lat: 17.0608, lon: -61.7964, hcKey: 'ag' },
                "Germany": { lat: 51.1657, lon: 10.4515, hcKey: 'de' },
                "Colombia": { lat: 4.5709, lon: -74.2973, hcKey: 'co' },
                "Greece": { lat: 39.0742, lon: 21.8243, hcKey: 'gr' },
                "Australia": { lat: -25.2744, lon: 133.7751, hcKey: 'au' },
                "Latvia": { lat: 56.8796, lon: 24.6032, hcKey: 'lv' },
                "Iceland": { lat: 64.9631, lon: -19.0208, hcKey: 'is' },
                "Estonia": { lat: 58.5953, lon: 25.0136, hcKey: 'ee' },
                "Cyprus": { lat: 35.1264, lon: 33.4299, hcKey: 'cy' },
                "China, Hong Kong SAR": { lat: 22.3193, lon: 114.1694, hcKey: 'hk' },
                "Denmark": { lat: 56.2639, lon: 9.5018, hcKey: 'dk' },
                "Spain": { lat: 40.4168, lon: -3.7038, hcKey: 'es' },
                "Panama": { lat: 8.5380, lon: -80.7821, hcKey: 'pa' },
                "Liberia": { lat: 6.4281, lon: -9.4295, hcKey: 'lr' },
                "Marshall Islands": { lat: 7.1315, lon: 171.1845, hcKey: 'mh' },
                "Singapore": { lat: 1.3521, lon: 103.8198, hcKey: 'sg' },
                "China": { lat: 35.8617, lon: 104.1954, hcKey: 'cn' },
                "Japan": { lat: 36.2048, lon: 138.2529, hcKey: 'jp' },
                "Republic of Korea": { lat: 35.9078, lon: 127.7669, hcKey: 'kr' },
                "United Kingdom": { lat: 55.3781, lon: -3.4360, hcKey: 'gb' },
                "United States": { lat: 37.0902, lon: -95.7129, hcKey: 'us' },
                "Bahamas": { lat: 25.0343, lon: -77.3963, hcKey: 'bs' },
                "Malta": { lat: 35.9375, lon: 14.3754, hcKey: 'mt' },
                "Bermuda": { lat: 32.3078, lon: -64.7505, hcKey: 'bm' },
                "Norway": { lat: 60.4720, lon: 8.4689, hcKey: 'no' },
                "Italy": { lat: 41.8719, lon: 12.5674, hcKey: 'it' },
                "India": { lat: 20.5937, lon: 78.9629, hcKey: 'in' },
                "France": { lat: 46.2276, lon: 2.2137, hcKey: 'fr' },
                "Netherlands": { lat: 52.1326, lon: 5.2913, hcKey: 'nl' },
                "Russian Federation": { lat: 61.5240, lon: 105.3188, hcKey: 'ru' },
                "Brazil": { lat: -14.2350, lon: -51.9253, hcKey: 'br' }
            };

            const rutas = [];
            const dataPaises = [];
            const puntosMarcadores = [];

            // PROCESAMIENTO DE DATOS
            const historialPorPais = {};

            datosApi.forEach(d => {
                const reg = d.flag_of_registration_label;
                const owner = d.beneficial_ownership_label;

                [reg, owner].forEach(p => {
                    if (!historialPorPais[p]) historialPorPais[p] = [];
                    historialPorPais[p].push(d);
                });

                const origen = paisesInfo[owner];
                const destino = paisesInfo[reg];
                if (origen && destino) {
                    rutas.push({
                        geometry: { type: 'LineString', coordinates: [[origen.lon, origen.lat], [destino.lon, destino.lat]] },
                        className: 'animated-line'
                    });
                }
            });

            // CREACIÓN DEL TOOLTIP DIVIDIDO (Recibe vs Envía)
            for (const nombrePais in historialPorPais) {
                const info = paisesInfo[nombrePais];
                if (info) {
                    // Separo los datos del país en dos categorías
                    const recibe = historialPorPais[nombrePais].filter(r => r.flag_of_registration_label === nombrePais);
                    // Evito duplicados si un país se registra a sí mismo
                    const envia = historialPorPais[nombrePais].filter(r => r.beneficial_ownership_label === nombrePais && r.flag_of_registration_label !== nombrePais);

                    let resumenHTML = `<div style="min-width: 250px; font-family: sans-serif;">
                        <b style="font-size:16px; color: #38bdf8;">${nombrePais}</b>
                        <hr style="border-color: #334155; margin: 8px 0;">`;

                    //  Lo que el país recibe (Bandera)
                    if (recibe.length > 0) {
                        resumenHTML += `<div style="margin-bottom: 10px;">
                            <b style="color: #a7f3d0; font-size: 13px;">📥 Flota Registrada Aquí (Bandera):</b><br>`;
                        recibe.forEach(reg => {
                            resumenHTML += `<span style="font-size: 12px; color: #e2e8f0;">• <b>${reg.year}</b> (de ${reg.beneficial_ownership_label}): ${reg.number_of_ships} barcos</span><br>`;
                        });
                        resumenHTML += `</div>`;
                    }

                    // Lo que el país envía (Dueño)
                    if (envia.length > 0) {
                        resumenHTML += `<div>
                            <b style="color: #fca5a5; font-size: 13px;">📤 Flota Propiedad de este País (Dueño):</b><br>`;
                        envia.forEach(reg => {
                            resumenHTML += `<span style="font-size: 12px; color: #e2e8f0;">• <b>${reg.year}</b> (en ${reg.flag_of_registration_label}): ${reg.number_of_ships} barcos</span><br>`;
                        });
                        resumenHTML += `</div>`;
                    }

                    resumenHTML += `</div>`;

                    dataPaises.push({
                        'hc-key': info.hcKey,
                        name: nombrePais,
                        customTooltip: resumenHTML,
                        value: 1,
                        color: '#38bdf8' 
                    });

                    puntosMarcadores.push({ name: nombrePais, lat: info.lat, lon: info.lon });
                }
            }

            // INICIALIZACIÓN DEL MAPA
            const HighchartsModule = await import('highcharts/highmaps');
            const Highcharts = HighchartsModule.default || HighchartsModule;
            const worldMap = await fetch('https://code.highcharts.com/mapdata/custom/world.topo.json').then(r => r.json());

            Highcharts.mapChart(mapContainer, {
                chart: { 
                    map: worldMap, 
                    backgroundColor: '#0f172a' 
                },
                title: { 
                    text: 'FLOTA MERCANTE POR PAÍS DE BENEFICIARIO EFECTIVO',
                    style: { color: '#f8fafc', fontWeight: 'bold' }
                },
                legend: { enabled: false },
                mapNavigation: { enabled: true },
                
                tooltip: {
                    useHTML: true,
                    backgroundColor: '#1e293b', // Fondo del tooltip oscuro
                    borderColor: '#38bdf8', // Borde del tooltip celeste
                    style: { color: '#ffffff' }, // Texto blanco por defecto
                    formatter: function () {
                        return this.point.customTooltip || `<b style="font-size:14px; color:#38bdf8;">${this.point.name}</b>`;
                    }
                },

                plotOptions: {
                    map: {
                        allAreas: true,
                        nullColor: '#1e293b', 
                        borderColor: '#334155',
                        borderWidth: 0.8
                    }
                },

                series: [
                    {
                        type: 'map',
                        name: 'Países',
                        data: dataPaises,
                        joinBy: 'hc-key',
                        states: { hover: { color: '#7dd3fc' } } 
                    },
                    {
                        type: 'mapline',
                        name: 'Rutas',
                        color: 'rgba(255, 255, 255, 0.4)',
                        lineWidth: 1,
                        data: rutas,
                        enableMouseTracking: false
                    },
                    {
                        type: 'mappoint',
                        name: 'Ubicaciones',
                        color: '#fbbf24',
                        data: puntosMarcadores,
                        dataLabels: {
                            enabled: true,
                            format: '{point.name}',
                            style: { color: '#cbd5e1', fontSize: '10px', textOutline: 'none' }
                        }
                    }
                ]
            });

        } catch (e) {
            errorMessage = "Error al cargar el mapa interactivo.";
            console.error(e);
        }
    });
</script>

<main class="container mt-5">
    {#if errorMessage} <div class="alert alert-danger">{errorMessage}</div> {/if}
    
    <div bind:this={mapContainer} style="width: 100%; height: 750px; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);"></div>
    
    <div class="mt-5 mb-5" style="display: flex; justify-content: space-between; width: 100%; padding-top: 20px;">
        <a href="/beneficial-ownership-merchant-fleets/v2" style="text-decoration: none; padding: 12px 25px; background-color: #3b82f6; color: white; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-flex; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            ⬅ ACCEDER A LOS DATOS (v2)
        </a>
        <a href="/analytics/beneficial-ownership-merchant-fleets/v2" style="text-decoration: none; padding: 12px 25px; background-color: #3b82f6; color: white; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-flex; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            VOLVER A LA GRÁFICA (v2) 📈 ➡
        </a>
    </div>
</main>

<style>
    :global(.animated-line) {
        stroke-dasharray: 5;
        animation: dash 10s linear infinite;
    }
    @keyframes -global-dash {
        from { stroke-dashoffset: 100; }
        to { stroke-dashoffset: 0; }
    }
</style>