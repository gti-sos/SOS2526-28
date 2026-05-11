<script>
    import { onMount } from 'svelte';

    let loading = $state(true);
    let error = $state(null);
    let chartData = $state({ puntos: [], categorias: [] });
    let tableData = $state([]);

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

            await fetch('https://sos2526-26.onrender.com/api/v2/countries-idh-per-years/loadInitialData')
                .catch(() => {});

            const violenceRes = await fetch('/api/v1/deliberate-violence-against-civilians-events-worldwide?limit=1000');
            const violenceData = await violenceRes.json();

            const eventosPorPais = {};
            violenceData.forEach(event => {
                const code = event.country;
                eventosPorPais[code] = (eventosPorPais[code] || 0) + 1;
            });

            const idhRes = await fetch('https://sos2526-26.onrender.com/api/v2/countries-idh-per-years/');
            const idhData = await idhRes.json();

            const idhPorPais = {};
            idhData.forEach(item => {
                const pais = item.country.toLowerCase();
                if (!idhPorPais[pais]) idhPorPais[pais] = { valores: [], total: 0, count: 0 };
                idhPorPais[pais].valores.push(item.hdi_value);
                idhPorPais[pais].total += item.hdi_value;
                idhPorPais[pais].count += 1;
            });

            const puntos = [];
            const filas = [];
            const categorias = [];

            Object.entries(eventosPorPais).forEach(([code, eventos]) => {
                const nombrePais = mapaCodigoPais[code];
                if (nombrePais && idhPorPais[nombrePais]) {
                    const vals = idhPorPais[nombrePais].valores;
                    const minIDH = parseFloat(Math.min(...vals).toFixed(3));
                    const maxIDH = parseFloat(Math.max(...vals).toFixed(3));
                    const mediaIDH = parseFloat((idhPorPais[nombrePais].total / idhPorPais[nombrePais].count).toFixed(3));

                    categorias.push(nombrePais);
                    puntos.push({ low: minIDH, high: maxIDH, name: nombrePais, eventos, mediaIDH });
                    filas.push({ pais: nombrePais, eventos, minIDH, maxIDH, mediaIDH });
                }
            });

            // Añadir países del IDH sin eventos de violencia
            Object.entries(idhPorPais).forEach(([pais, datos]) => {
                const yaEsta = filas.find(f => f.pais === pais);
                if (!yaEsta) {
                    const vals = datos.valores;
                    const minIDH = parseFloat(Math.min(...vals).toFixed(3));
                    const maxIDH = parseFloat(Math.max(...vals).toFixed(3));
                    const mediaIDH = parseFloat((datos.total / datos.count).toFixed(3));

                    categorias.push(pais);
                    puntos.push({ low: minIDH, high: maxIDH, name: pais, eventos: 0, mediaIDH });
                    filas.push({ pais, eventos: 0, minIDH, maxIDH, mediaIDH });
                }
            });

            chartData = { puntos, categorias };
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
        if (chartData.puntos.length === 0) return;

        // @ts-ignore
        Highcharts.chart('chart-container', {
            chart: { type: 'columnrange', inverted: true },
            title: { text: '' },
            xAxis: {
                categories: chartData.categorias,
                title: { text: 'País' }
            },
            yAxis: {
                title: { text: 'Rango IDH histórico (mín - máx)' },
                min: 0,
                max: 1
            },
            tooltip: {
                formatter: function() {
                    return `<b>${this.point.name}</b><br/>
                            IDH mínimo: <b>${this.point.low}</b><br/>
                            IDH máximo: <b>${this.point.high}</b><br/>
                            IDH medio: <b>${this.point.mediaIDH}</b><br/>
                            Eventos de violencia: <b>${this.point.eventos}</b>`;
                }
            },
            plotOptions: {
                columnrange: {
                    colorByPoint: true,
                    dataLabels: {
                        enabled: true,
                        formatter: function() { return this.y.toFixed(2); }
                    }
                }
            },
            series: [{
                name: 'Rango IDH',
                data: chartData.puntos
            }],
            credits: { enabled: false },
            legend: { enabled: false }
        });
    }
</script>

<svelte:head>
    <title>Integración: Violence Events + IDH por País</title>
    <script src="https://code.highcharts.com/highcharts.js"></script>
    <script src="https://code.highcharts.com/highcharts-more.js"></script>
</svelte:head>

<div class="integration-container">
    <h1>💥 Violencia contra Civiles vs 🌍 Índice de Desarrollo Humano</h1>
    <p class="subtitle">
        Rango histórico del IDH por país y su número de eventos de violencia contra civiles.
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
                    <th>IDH Mínimo</th>
                    <th>IDH Medio</th>
                    <th>IDH Máximo</th>
                </tr>
            </thead>
            <tbody>
                {#each tableData as row}
                    <tr>
                        <td>{row.pais}</td>
                        <td>{row.eventos}</td>
                        <td>{row.minIDH}</td>
                        <td>{row.mediaIDH}</td>
                        <td>{row.maxIDH}</td>
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