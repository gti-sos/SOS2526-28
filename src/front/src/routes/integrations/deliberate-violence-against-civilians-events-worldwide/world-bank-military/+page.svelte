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

            // Contar eventos por país y obtener códigos únicos
            const eventosPorISO = {};
            violenceData.forEach(e => {
                const code = countryFix[e.country] || e.country;
                eventosPorISO[code] = (eventosPorISO[code] || 0) + 1;
            });

            const codigosUnicos = Object.keys(eventosPorISO);
            const codigosStr = codigosUnicos.join(';');

            // 2. World Bank API: Gasto militar (MS.MIL.XPND.CD)
            const wbRes = await fetch(
                `https://api.worldbank.org/v2/country/${codigosStr}/indicator/MS.MIL.XPND.CD?format=json&per_page=100&mrv=1`
            );
            const wbData = await wbRes.json();
            const registros = wbData[1] || [];

            // Agrupar por país (valor más reciente no nulo)
            const gastoPorISO = {};
            registros.forEach(r => {
                if (r.value !== null) {
                    const iso = r.countryiso3code;
                    if (!gastoPorISO[iso]) {
                        gastoPorISO[iso] = {
                            nombre: r.country.value,
                            gasto: r.value,
                            anyo: r.date
                        };
                    }
                }
            });

            // 3. Cruzar
            tableData = codigosUnicos
                .filter(iso => gastoPorISO[iso])
                .map(iso => ({
                    iso,
                    nombre: gastoPorISO[iso].nombre,
                    gasto: gastoPorISO[iso].gasto,
                    anyo: gastoPorISO[iso].anyo,
                    eventos: eventosPorISO[iso]
                }))
                .sort((a, b) => b.gasto - a.gasto);

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

        const pieData = tableData.map(d => ({
            name: d.nombre,
            y: d.gasto,
            eventos: d.eventos
        }));

        // @ts-ignore
        Highcharts.chart('chart-container', {
            chart: {
                type: 'pie',
                margin: [0, 0, 80, 0],
                spacingTop: 0,
                spacingBottom: 0,
                spacingLeft: 0,
                spacingRight: 0
            },
            title: { text: '' },
            tooltip: {
                formatter: function () {
                    const gastoMillones = (this.point.y / 1e6).toFixed(1);
                    return `<b>${this.point.name}</b><br/>
                            Gasto militar: <b>$${gastoMillones}M</b><br/>
                            Porcentaje del total: <b>${this.percentage.toFixed(1)}%</b><br/>
                            Eventos de violencia: <b>${this.point.eventos}</b>`;
                }
            },
            plotOptions: {
                pie: {
                    dataLabels: {
                        enabled: true,
                        distance: 10,
                        formatter: function () {
                            if (this.percentage > 3) {
                                return `<b>${this.point.name}</b><br/>${this.percentage.toFixed(1)}%`;
                            }
                            return null;
                        },
                        style: { fontWeight: 'normal', fontSize: '11px' }
                    },
                    startAngle: -90,
                    endAngle: 90,
                    center: ['50%', '85%'],
                    size: '170%',
                    innerSize: '50%'
                }
            },
            series: [{
                name: 'Gasto Militar',
                colorByPoint: true,
                data: pieData
            }],
            credits: { enabled: false },
            legend: { enabled: false }
        });

        chartInitialized = true;
    }
</script>

<svelte:head>
    <title>Integración: Violence Events + Gasto Militar (World Bank)</title>
    <script src="https://code.highcharts.com/highcharts.js"></script>
</svelte:head>

<div class="integration-container">
    <h1>💥 Eventos de Violencia + ⚔️ Gasto Militar (World Bank)</h1>
    <p class="subtitle">
        Distribución del gasto militar entre los países con eventos de violencia deliberada contra civiles.
    </p>

    <div class="info-api">
        <p><strong>API 1 (propia):</strong> Deliberate Violence Against Civilians Events Worldwide</p>
        <p>
            <strong>API 2 (externa):</strong> World Bank Indicators —
            <code class="svelte-1qlqszf">https://api.worldbank.org/v2/country/&#123;code&#125;/indicator/MS.MIL.XPND.CD?format=json&per_page=100&mrv=1</code>
        </p>
    </div>

    {#if loading}
        <div class="loading-overlay">
            <div class="spinner"></div>
            <p>Consultando World Bank API...</p>
        </div>
    {:else if error}
        <div class="error"><p>❌ Error: {error}</p></div>
    {:else if tableData.length === 0}
        <div class="error" style="background:#fffbeb; color:#d97706;">
            <p>⚠️ No hay datos disponibles. Es posible que el World Bank no tenga datos de gasto militar para estos países.</p>
        </div>
    {:else}
        <div id="chart-container" style="height: 350px; width: 100%; margin-bottom: 2rem;"></div>

        <h2>Detalle por país</h2>
        <table>
            <thead>
                <tr>
                    <th>País</th>
                    <th>Código ISO</th>
                    <th>Gasto Militar (USD)</th>
                    <th>Año del dato</th>
                    <th>Nº Eventos de Violencia</th>
                </tr>
            </thead>
            <tbody>
                {#each tableData as row}
                    <tr>
                        <td>{row.nombre}</td>
                        <td>{row.iso}</td>
                        <td>${(row.gasto / 1e6).toFixed(1)}M</td>
                        <td>{row.anyo}</td>
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
    h1 { color: #7c3aed; text-align: center; margin-bottom: 0.5rem; }
    h2 { margin-top: 2rem; color: #374151; }
    .subtitle { text-align: center; color: #666; margin-bottom: 1rem; }
    .info-api {
        background: #f5f3ff;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        margin-bottom: 1.5rem;
        font-size: 0.85rem;
        border-left: 4px solid #7c3aed;
    }
    code {
        background: #ede9fe;
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
        border-top: 4px solid #7c3aed;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
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
    th {
        background: #f9fafb;
        font-weight: 600;
    }
    tr:hover {
        background: #f5f3ff;
    }
</style>