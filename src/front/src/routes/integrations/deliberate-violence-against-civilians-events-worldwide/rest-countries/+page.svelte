<script>
    import { onMount } from 'svelte';

    let loading = $state(true);
    let error = $state(null);
    let tableData = $state([]);
    let chartInitialized = false;

    const countryFix = { "ELS": "SLV" };

    onMount(() => {
        fetchData();
    });

    async function fetchData() {
        try {
            loading = true;

            // 1. Tus datos: violence events
            const violenceRes = await fetch('/api/v1/deliberate-violence-against-civilians-events-worldwide');
            const violenceData = await violenceRes.json();

            // Obtener códigos ISO únicos
            const codigosUnicos = [...new Set(
                violenceData.map(e => countryFix[e.country] || e.country)
            )];

            // 2. Para cada código, llamar a REST Countries
            const resultados = await Promise.all(
                codigosUnicos.map(async (code) => {
                    try {
                        const res = await fetch(`https://restcountries.com/v3.1/alpha/${code}`);
                        if (!res.ok) return null;
                        const data = await res.json();
                        const pais = data[0];
                        return {
                            iso: code,
                            nombre: pais.translations?.spa?.common || pais.name.common,
                            poblacion: pais.population,
                            region: pais.region,
                            subregion: pais.subregion || '—',
                            bandera: pais.flags?.emoji || '',
                            capital: pais.capital?.[0] || '—',
                            eventos: violenceData.filter(e =>
                                (countryFix[e.country] || e.country) === code
                            ).length
                        };
                    } catch {
                        return null;
                    }
                })
            );

            tableData = resultados
                .filter(r => r !== null)
                .sort((a, b) => b.eventos - a.eventos);

            loading = false;
            setTimeout(() => initChart(), 300);

        } catch (e) {
            console.error('Error:', e);
            error = e.message;
            loading = false;
        }
    }

    function initChart() {
        if (tableData.length === 0 || chartInitialized) return;

        const nombres = tableData.map(d => `${d.bandera} ${d.nombre}`);
        const poblaciones = tableData.map(d => d.poblacion);
        const eventos = tableData.map(d => d.eventos);

        // @ts-ignore
        Highcharts.chart('chart-container', {
            chart: { type: 'bar' },
            title: { text: '' },
            xAxis: {
                categories: nombres,
                title: { text: 'País' }
            },
            yAxis: [
                {
                    title: { text: 'Población' },
                    labels: { style: { color: '#1d4ed8' } }
                },
                {
                    title: { text: 'Nº Eventos de Violencia' },
                    opposite: true,
                    labels: { style: { color: '#dc2626' } }
                }
            ],
            colors: ['#1d4ed8', '#dc2626'],
            series: [
                {
                    name: 'Población',
                    data: poblaciones,
                    yAxis: 0
                },
                {
                    name: 'Nº Eventos de Violencia',
                    data: eventos,
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
    <title>Integración: Violence Events + REST Countries</title>
    <script src="https://code.highcharts.com/highcharts.js"></script>
</svelte:head>

<div class="integration-container">
    <h1>💥 Eventos de Violencia + 🌍 Datos de Países</h1>
    <p class="subtitle">
        Información demográfica y geográfica de los países con eventos de violencia deliberada contra civiles.
    </p>

    <div class="info-api">
        <p><strong>API 1 (propia):</strong> Deliberate Violence Against Civilians Events Worldwide</p>
        <p><strong>API 2 (externa):</strong> REST Countries — <code class="svelte-1qlqszf">restcountries.com/v3.1/alpha/&#123;code&#125;</code></p>
    </div>

    {#if loading}
        <div class="loading-overlay">
            <div class="spinner"></div>
            <p>Consultando REST Countries...</p>
        </div>
    {:else if error}
        <div class="error"><p>❌ Error: {error}</p></div>
    {:else if tableData.length === 0}
        <div class="error" style="background:#fffbeb; color:#d97706;">
            <p>⚠️ No hay datos disponibles.</p>
        </div>
    {:else}
        <div id="chart-container" style="height: 450px; width: 100%; margin-bottom: 2rem;"></div>

        <h2>Detalle por país</h2>
        <table>
            <thead>
                <tr>
                    <th>País</th>
                    <th>Región</th>
                    <th>Subregión</th>
                    <th>Capital</th>
                    <th>Población</th>
                    <th>Nº Eventos</th>
                </tr>
            </thead>
            <tbody>
                {#each tableData as row}
                    <tr>
                        <td>{row.bandera} {row.nombre}</td>
                        <td>{row.region}</td>
                        <td>{row.subregion}</td>
                        <td>{row.capital}</td>
                        <td>{row.poblacion.toLocaleString('es-ES')}</td>
                        <td>{row.eventos}</td>
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
    h1 { color: #1d4ed8; text-align: center; margin-bottom: 0.5rem; }
    h2 { margin-top: 2rem; color: #374151; }
    .subtitle { text-align: center; color: #666; margin-bottom: 1rem; }
    .info-api {
        background: #eff6ff;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        margin-bottom: 1.5rem;
        font-size: 0.85rem;
        border-left: 4px solid #1d4ed8;
    }
    code {
        background: #dbeafe;
        padding: 0.1rem 0.3rem;
        border-radius: 4px;
        font-size: 0.8rem;
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
        border-top: 4px solid #1d4ed8;
        border-radius: 50%;
        width: 50px; height: 50px;
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
    }
    @keyframes spin { 0%{ transform: rotate(0deg); } 100%{ transform: rotate(360deg); } }
    .error {
        text-align: center; padding: 2rem;
        color: #dc2626; background: #fee2e2; border-radius: 8px;
    }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { border: 1px solid #e5e7eb; padding: 0.6rem 1rem; text-align: center; }
    th { background: #f9fafb; font-weight: 600; }
    tr:hover { background: #eff6ff; }
</style>