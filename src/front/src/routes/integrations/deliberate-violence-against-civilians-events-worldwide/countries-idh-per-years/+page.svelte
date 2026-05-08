<script>
    import { onMount } from 'svelte';

    let loading = $state(true);
    let error = $state(null);
    let scatterData = $state([]);
    let tableData = $state([]);

    // Mapa de códigos de país (tu API) a nombres (API compañero)
    const mapaCodigoPais = {
        "AFG": "afghanistan",
        "BDI": "burundi",
        "BFA": "burkina faso",
        "CMR": "cameroon",
        "COD": "congo",
        "ELS": "el salvador",
        "ETH": "ethiopia",
        "IND": "india",
        "NGA": "nigeria",
        "SDN": "sudan",
        "SSD": "south sudan"
    };

    onMount(() => {
        fetchData();
    });

    async function fetchData() {
        try {
            loading = true;

            // 1. Tus datos: violence events
            const violenceRes = await fetch('/api/v1/deliberate-violence-against-civilians-events-worldwide?limit=1000');
            const violenceData = await violenceRes.json();

            // Contar eventos por país
            const eventosPorPais = {};
            violenceData.forEach(event => {
                const code = event.country;
                eventosPorPais[code] = (eventosPorPais[code] || 0) + 1;
            });

            // 2. API del compañero: IDH por país
            const idhRes = await fetch('https://sos2526-26.onrender.com/api/v2/countries-idh-per-years/');
            const idhData = await idhRes.json();

            // Calcular IDH medio por país
            const idhPorPais = {};
            idhData.forEach(item => {
                const pais = item.country.toLowerCase();
                if (!idhPorPais[pais]) idhPorPais[pais] = { total: 0, count: 0 };
                idhPorPais[pais].total += item.hdi_value;
                idhPorPais[pais].count += 1;
            });

            // 3. Cruzar por país usando el mapa de códigos
            const puntos = [];
            const filas = [];

            Object.entries(eventosPorPais).forEach(([code, eventos]) => {
                const nombrePais = mapaCodigoPais[code];
                if (nombrePais && idhPorPais[nombrePais]) {
                    const idhMedio = parseFloat(
                        (idhPorPais[nombrePais].total / idhPorPais[nombrePais].count).toFixed(3)
                    );
                    puntos.push({ x: eventos, y: idhMedio, name: nombrePais });
                    filas.push({ pais: nombrePais, eventos, idhMedio });
                }
            });

            // Si hay pocos cruces, añadir todos los países del IDH con 0 eventos
            Object.entries(idhPorPais).forEach(([pais, datos]) => {
                const yaEsta = filas.find(f => f.pais === pais);
                if (!yaEsta) {
                    const idhMedio = parseFloat((datos.total / datos.count).toFixed(3));
                    puntos.push({ x: 0, y: idhMedio, name: pais });
                    filas.push({ pais, eventos: 0, idhMedio });
                }
            });

            scatterData = puntos;
            tableData = filas.sort((a, b) => b.eventos - a.eventos);

            loading = false;
            setTimeout(() => initChart(), 300);

        } catch (e) {
            console.error('Error:', e);
            error = e.message;
            loading = false;
        }
    }

    function initChart() {
        if (scatterData.length === 0) return;

        // @ts-ignore
        Highcharts.chart('chart-container', {
            chart: { type: 'scatter', zoomType: 'xy' },
            title: { text: '' },
            xAxis: {
                title: { text: 'Nº Eventos de Violencia contra Civiles' },
                gridLineWidth: 1
            },
            yAxis: {
                title: { text: 'IDH Medio' },
                min: 0,
                max: 1
            },
            tooltip: {
                formatter: function() {
                    return `<b>${this.point.name}</b><br/>
                            Eventos: <b>${this.x}</b><br/>
                            IDH medio: <b>${this.y}</b>`;
                }
            },
            series: [{
                name: 'Países',
                color: '#dc2626',
                data: scatterData,
                marker: { radius: 8 }
            }],
            credits: { enabled: false },
            legend: { enabled: false }
        });
    }
</script>

<svelte:head>
    <title>Integración: Violence Events + IDH por País</title>
    <script src="https://code.highcharts.com/highcharts.js"></script>
</svelte:head>

<div class="integration-container">
    <h1>💥 Violencia contra Civiles vs 🌍 Índice de Desarrollo Humano</h1>
    <p class="subtitle">
        ¿Los países con más eventos de violencia tienen menor IDH? Comparativa por país.
    </p>

    <div class="info-api">
        <p><strong>API 1 (propia):</strong> Deliberate Violence Against Civilians Events Worldwide — eventos por país</p>
        <p><strong>API 2 (compañero SOS-28):</strong> Countries IDH per Years — IDH medio por país</p>
    </div>

    {#if loading}
        <div class="loading-overlay">
            <div class="spinner"></div>
            <p>Cargando datos...</p>
        </div>
    {:else if error}
        <div class="error"><p>❌ Error: {error}</p></div>
    {:else}
        <div id="chart-container" style="height: 500px; width: 100%;"></div>

        <h2>Datos por país</h2>
        <table>
            <thead>
                <tr>
                    <th>País</th>
                    <th>Nº Eventos de Violencia</th>
                    <th>IDH Medio</th>
                </tr>
            </thead>
            <tbody>
                {#each tableData as row}
                    <tr>
                        <td>{row.pais}</td>
                        <td>{row.eventos}</td>
                        <td>{row.idhMedio}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {/if}
</div>

<style>
    .integration-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
        background: white;
        border-radius: 16px;
        box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
        position: relative;
        min-height: 600px;
    }
    h1 { color: #dc2626; text-align: center; margin-bottom: 0.5rem; }
    h2 { margin-top: 2rem; color: #374151; }
    .subtitle { text-align: center; color: #666; margin-bottom: 1rem; }
    .info-api {
        background: #fef2f2;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        margin-bottom: 1.5rem;
        font-size: 0.85rem;
        border-left: 4px solid #dc2626;
    }
    .loading-overlay {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 4rem;
    }
    .spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #dc2626;
        border-radius: 50%;
        width: 50px; height: 50px;
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
    }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .error {
        text-align: center; padding: 2rem;
        color: #dc2626; background: #fee2e2; border-radius: 8px;
    }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { border: 1px solid #e5e7eb; padding: 0.6rem 1rem; text-align: center; }
    th { background: #f9fafb; font-weight: 600; }
    tr:hover { background: #fef2f2; }
</style>