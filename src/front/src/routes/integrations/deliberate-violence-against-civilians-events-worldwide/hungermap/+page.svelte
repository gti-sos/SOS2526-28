
<script>
    import { onMount } from 'svelte';

    let loading = $state(true);
    let error = $state(null);
    let tableData = $state([]);

    const paisesInteres = [
        { code: "AFG", nombre: "Afghanistan" },
        { code: "BDI", nombre: "Burundi" },
        { code: "BFA", nombre: "Burkina Faso" },
        { code: "CMR", nombre: "Camerún" },
        { code: "COD", nombre: "Congo" },
        { code: "SLV", nombre: "El Salvador", apiCode: "ELS" },
        { code: "ETH", nombre: "Ethiopia" }
    ];

    onMount(() => {
        fetchData();
    });

    async function fetchData() {
        try {
            loading = true;

            // 1. Tu API: eventos de violencia por país
            const violenceRes = await fetch('/api/v1/deliberate-violence-against-civilians-events-worldwide?limit=1000');
            const violenceData = await violenceRes.json();

            const eventosPorPais = {};
            violenceData.forEach(event => {
                eventosPorPais[event.country] = (eventosPorPais[event.country] || 0) + 1;
            });

            // 2. HungerMap a través del proxy: inflación alimentaria por país
            const inflacionPorPais = {};
            await Promise.all(paisesInteres.map(async ({ code }) => {
                try {
                    const res = await fetch(`/proxy/hungermap/country/${code}`);
                    if (!res.ok) { inflacionPorPais[code] = null; return; }
                    const data = await res.json();

                    const foodData = data?.inflationGraphs?.food?.data;
                    const headlineData = data?.inflationGraphs?.headline?.data;
                    const dataToUse = (foodData && foodData.length > 0) ? foodData :
                                      (headlineData && headlineData.length > 0) ? headlineData : null;

                    if (dataToUse) {
                        const media = dataToUse.reduce((sum, d) => sum + d.y, 0) / dataToUse.length;
                        inflacionPorPais[code] = parseFloat(media.toFixed(2));
                    } else {
                        inflacionPorPais[code] = null;
                    }
                } catch {
                    inflacionPorPais[code] = null;
                }
            }));

            // 3. Cruzar datos
            const filas = [];
            const seriesData = [];

            paisesInteres.forEach(({ code, nombre, apiCode }) => {
                const violenceCode = apiCode || code;
                const eventos = eventosPorPais[violenceCode] || 0;
                const inflacion = inflacionPorPais[code];

                filas.push({ pais: nombre, eventos, inflacion });

                if (inflacion !== null && inflacion !== undefined) {
                    seriesData.push({
                        name: nombre,
                        y: eventos,
                        z: inflacion < 0 ? 1 : inflacion,
                        eventos,
                        inflacion
                    });
                }
            });

            tableData = filas.sort((a, b) => b.eventos - a.eventos);

            loading = false;
            setTimeout(() => initChart(seriesData), 300);

        } catch (e) {
            console.error('Error:', e);
            error = e.message;
            loading = false;
        }
    }

    function initChart(seriesData) {
        if (seriesData.length === 0) return;

        // @ts-ignore
        Highcharts.chart('chart-container', {
            chart: { type: 'variablepie' },
            title: { text: '' },
            tooltip: {
                formatter: function () {
                    return `<b>${this.point.name}</b><br/>
                            Eventos de violencia: <b>${this.point.eventos}</b><br/>
                            Inflación alimentaria media: <b>${this.point.inflacion.toFixed(2)}%</b>`;
                }
            },
            plotOptions: {
                variablepie: {
                    dataLabels: {
                        enabled: true,
                        formatter: function () {
                            return `<b>${this.point.name}</b>`;
                        }
                    }
                }
            },
            series: [{
                name: 'Países',
                data: seriesData
            }],
            credits: { enabled: false }
        });
    }
</script>

<svelte:head>
    <title>Violencia contra Civiles vs Inflación Alimentaria</title>
    <script src="https://code.highcharts.com/highcharts.js"></script>
    <script src="https://code.highcharts.com/modules/variable-pie.js"></script>
</svelte:head>

<div class="integration-container">
    <h1>💥 Violencia contra Civiles vs 🍽️ Inflación Alimentaria</h1>
    <p class="subtitle">
        El ángulo de cada sector representa los eventos de violencia y el radio la inflación media de alimentos según WFP HungerMap.
    </p>

    <div class="info-api">
        <p><strong>API 1 (propia):</strong> Deliberate Violence Against Civilians Events Worldwide — eventos por país</p>
        <p><strong>API 2 (WFP HungerMap via Proxy):</strong> HungerMap API — inflación alimentaria media por país</p>
    </div>

    {#if loading}
        <div class="loading-overlay">
            <div class="spinner"></div>
            <p>Cargando datos...</p>
        </div>
    {:else if error}
        <div class="error"><p>❌ Error: {error}</p></div>
    {:else if tableData.length === 0}
        <div class="error"><p>⚠️ No se encontraron datos cruzados.</p></div>
    {:else}
        <div id="chart-container" style="height: 500px; width: 100%;"></div>

        <h2>Datos por país</h2>
        <table>
            <thead>
                <tr>
                    <th>País</th>
                    <th>Nº Eventos de Violencia</th>
                    <th>Inflación Alimentaria Media (%)</th>
                </tr>
            </thead>
            <tbody>
                {#each tableData as row}
                    <tr>
                        <td>{row.pais}</td>
                        <td>{row.eventos}</td>
                        <td>{row.inflacion !== null && row.inflacion !== undefined ? row.inflacion.toFixed(2) + '%' : 'Sin datos'}</td>
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