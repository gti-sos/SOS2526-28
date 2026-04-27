<script>
    import { onMount } from 'svelte';

    const API_URL = '/api/v1/company-esg-scores-financial-performances';

    let chartContainer;
    let errorMessage = '';

    onMount(async () => {
        try {
            let res = await fetch(API_URL);
            if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);

            let datos = await res.json();

            if (datos.length === 0) {
                await fetch(`${API_URL}/loadInitialData`);
                res = await fetch(API_URL);
                datos = await res.json();
            }

            if (datos.length === 0) {
                throw new Error('No hay datos disponibles en la API.');
            }

            // Agrupar por empresa (company_id + company_name): calcular media de esg_overall y revenue
            const mapaEmpresas = {};
            datos.forEach(d => {
                const clave = `${d.company_id}_${d.company_name}`;
                if (!mapaEmpresas[clave]) {
                    mapaEmpresas[clave] = {
                        company_name: d.company_name,
                        industry: d.industry,
                        region: d.region,
                        esg_total: 0,
                        revenue_total: 0,
                        count: 0
                    };
                }
                mapaEmpresas[clave].esg_total += d.esg_overall || 0;
                mapaEmpresas[clave].revenue_total += d.revenue || 0;
                mapaEmpresas[clave].count += 1;
            });

            const puntos = Object.values(mapaEmpresas).map(e => ({
                x: parseFloat((e.esg_total / e.count).toFixed(2)),
                y: parseFloat((e.revenue_total / e.count).toFixed(2)),
                name: e.company_name,
                industry: e.industry,
                region: e.region
            }));

            // Agrupar puntos por industria para crear series diferenciadas
            const seriesPorIndustria = {};
            puntos.forEach(p => {
                const ind = p.industry || 'Sin industria';
                if (!seriesPorIndustria[ind]) {
                    seriesPorIndustria[ind] = [];
                }
                seriesPorIndustria[ind].push(p);
            });

            const series = Object.entries(seriesPorIndustria).map(([industria, pts]) => ({
                name: industria,
                data: pts
            }));

            const HighchartsModule = await import('highcharts');
            const Highcharts = HighchartsModule.default || HighchartsModule;

            Highcharts.chart(chartContainer, {
                chart: {
                    type: 'scatter',
                    zoomType: 'xy',
                    backgroundColor: '#f8fafc'
                },
                title: {
                    text: 'Puntuación ESG vs. Ingresos por Empresa',
                    style: { fontWeight: 'bold', fontSize: '18px' }
                },
                subtitle: {
                    text: 'Media histórica por empresa (haz clic y arrastra para hacer zoom)'
                },
                xAxis: {
                    title: { text: 'Puntuación ESG Global (Media)' },
                    gridLineWidth: 1,
                    startOnTick: true,
                    endOnTick: true,
                    showLastLabel: true
                },
                yAxis: {
                    title: { text: 'Ingresos (M$, Media)' }
                },
                legend: {
                    enabled: true,
                    title: { text: 'Industria' }
                },
                tooltip: {
                    useHTML: true,
                    formatter: function () {
                        return `<b>${this.point.name}</b><br/>
                                Industria: ${this.point.industry}<br/>
                                Región: ${this.point.region}<br/>
                                ESG Global: <b>${this.x} pts</b><br/>
                                Ingresos: <b>${this.y.toFixed(2)} M$</b>`;
                    }
                },
                plotOptions: {
                    scatter: {
                        marker: {
                            radius: 6,
                            states: {
                                hover: { enabled: true, lineColor: 'rgb(100,100,100)' }
                            }
                        },
                        states: {
                            hover: { marker: { enabled: false } }
                        }
                    }
                },
                series: series
            });

        } catch (e) {
            console.error(e);
            errorMessage = 'Error al cargar los datos: ' + e.message;
        }
    });
</script>

<svelte:head>
    <title>ESG vs. Rendimiento Financiero</title>
</svelte:head>

<main class="container mt-5">
    <h2 class="text-center mb-2">📈 Análisis: Puntuación ESG vs. Ingresos Empresariales</h2>
    <p class="text-center text-muted mb-4">Relación entre el índice de sostenibilidad y el rendimiento financiero de las empresas</p>

    {#if errorMessage}
        <div class="alert alert-danger text-center" role="alert">
            ❌ {errorMessage}
            <br />
            <button class="btn btn-sm btn-outline-danger mt-2" on:click={() => location.reload()}>
                Reintentar
            </button>
        </div>
    {/if}

    <div
        bind:this={chartContainer}
        style="width: 100%; height: 600px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);"
    ></div>

    <div class="mt-4" style="background: #f1f5f9; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
        <p style="margin: 0; color: #475569; font-size: 14px;">
            <b>💡 Cómo leer esta gráfica:</b>
            Cada punto representa una empresa. El eje horizontal muestra su puntuación ESG media (sostenibilidad),
            y el eje vertical sus ingresos medios en millones de dólares. Los colores distinguen las distintas industrias.
        </p>
    </div>

    <div class="mt-4 mb-5" style="display: flex; justify-content: space-between; align-items: center;">
        <a
            href="/analytics"
            style="text-decoration: none; padding: 12px 25px; background-color: #3b82f6; color: white;
                   border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-flex;
                   align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
        >
            ⬅ Volver a Analytics
        </a>

        <a
            href="/company-esg-scores-financial-performances"
            style="text-decoration: none; padding: 12px 25px; background-color: #64748b; color: white;
                   border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-flex;
                   align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
        >
            Ver datos crudos ➡
        </a>
    </div>
</main>
