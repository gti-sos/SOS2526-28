<script>
    import { onMount } from 'svelte';

    let loading = $state(true);
    let error = $state(null);
    let combinedData = $state([]);
    let chartInitialized = false;

    onMount(() => {
        fetchCombinedData();
    });

    async function fetchCombinedData() {
        try {
            loading = true;

            // 1. Obtener tus datos: violence events agrupados por año
            const violenceRes = await fetch('/api/v1/deliberate-violence-against-civilians-events-worldwide');
            const violenceData = await violenceRes.json();

            const eventsByYear = {};
            violenceData.forEach(event => {
                const year = event.start_year;
                if (year) {
                    eventsByYear[year] = (eventsByYear[year] || 0) + 1;
                }
            });

            // 2. Obtener datos del compañero: conflict-stats (grupo 13)
            const conflictRes = await fetch('https://sos2526-13.onrender.com/api/v2/conflict-stats');
            const conflictData = await conflictRes.json();

            const intensityByYear = {};
            conflictData.forEach(item => {
                const year = item.year;
                if (year) {
                    if (!intensityByYear[year]) {
                        intensityByYear[year] = { total: 0, count: 0 };
                    }
                    intensityByYear[year].total += item.intensity_level || 0;
                    intensityByYear[year].count += 1;
                }
            });

            // 3. Unión de todos los años de ambas APIs
            const allYears = Array.from(
                new Set([...Object.keys(eventsByYear), ...Object.keys(intensityByYear)])
            ).map(Number).sort((a, b) => a - b);

            combinedData = allYears.map(year => ({
                year: year.toString(),
                events: eventsByYear[year] || 0,
                avgIntensity: intensityByYear[year]
                    ? parseFloat((intensityByYear[year].total / intensityByYear[year].count).toFixed(2))
                    : 0
            }));

            loading = false;

            setTimeout(() => {
                initChart();
            }, 300);

        } catch (e) {
            console.error('Error:', e);
            error = e.message;
            loading = false;
        }
    }

    function initChart() {
    if (combinedData.length === 0 || chartInitialized) return;

    const container = document.querySelector('#chart-container');
    if (!container) return;

    const categories = combinedData.map(d => d.year);
    const eventsData = combinedData.map(d => d.events);
    const intensityData = combinedData.map(d => d.avgIntensity);

    // @ts-ignore
    Highcharts.chart('chart-container', {
        chart: { type: 'column' },
        title: { text: '' },
        xAxis: {
            categories: categories,
            title: { text: 'Año' }
        },
        yAxis: [
            {
                title: { text: 'Nº Eventos de Violencia' },
                labels: { style: { color: '#dc2626' } }
            },
            {
                title: { text: 'Intensidad Media' },
                opposite: true,
                min: 0,
                max: 3,
                labels: { style: { color: '#1d4ed8' } }
            }
        ],
        colors: ['#dc2626', '#1d4ed8'],
        series: [
            {
                name: 'Nº Eventos de Violencia',
                data: eventsData,
                yAxis: 0
            },
            {
                name: 'Intensidad Media de Conflictos',
                data: intensityData,
                yAxis: 1
            }
        ],
        tooltip: { shared: true },
        legend: { enabled: true },
        credits: { enabled: false }
    });

    chartInitialized = true;
}
</script>

<svelte:head>
    <title>Integración: Violence Events + Conflict Stats</title>
    <script src="https://code.highcharts.com/highcharts.js"></script>
</svelte:head>

<div class="integration-container">
    <h1>💥 Eventos de Violencia vs 📊 Intensidad de Conflictos</h1>
    <p class="subtitle">
        Comparativa anual: incidentes de violencia deliberada contra civiles e intensidad de conflictos armados globales
    </p>

    <div class="info-api">
        <p><strong>API 1 (propia):</strong> Deliberate Violence Against Civilians Events Worldwide — agrupado por año</p>
        <p><strong>API 2 (compañero SOS-13):</strong> Conflict Stats — intensidad media por año</p>
    </div>

    {#if loading}
        <div class="loading-overlay">
            <div class="spinner"></div>
            <p>Cargando y cruzando datos...</p>
        </div>
    {:else if error}
        <div class="error">
            <p>❌ Error: {error}</p>
        </div>
    {:else if combinedData.length === 0}
        <div class="error" style="background: #fffbeb; color: #d97706;">
            <p>⚠️ No hay datos disponibles.</p>
        </div>
    {:else}
        <div id="chart-container" style="height: 550px; width: 100%;"></div>

        <h2>Datos combinados</h2>
        <table>
            <thead>
                <tr>
                    <th>Año</th>
                    <th>Nº Eventos de Violencia</th>
                    <th>Intensidad Media de Conflictos</th>
                </tr>
            </thead>
            <tbody>
                {#each combinedData as row}
                    <tr>
                        <td>{row.year}</td>
                        <td>{row.events}</td>
                        <td>{row.avgIntensity || '—'}</td>
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
        width: 50px;
        height: 50px;
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
    }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .error {
        text-align: center;
        padding: 2rem;
        color: #dc2626;
        background: #fee2e2;
        border-radius: 8px;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
    }
    th, td {
        border: 1px solid #e5e7eb;
        padding: 0.6rem 1rem;
        text-align: center;
    }
    th { background: #f9fafb; font-weight: 600; }
    tr:hover { background: #fef2f2; }
</style>