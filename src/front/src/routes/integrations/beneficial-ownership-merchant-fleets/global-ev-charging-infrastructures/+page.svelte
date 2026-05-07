funciona integración carga 2


<script>
    import { onMount } from 'svelte';
    
    // Variables de estado
    let cargando = $state(true);
    let errorMensaje = $state("");
    let chartContainer; 
    
    let misDatosTotales = []; 
    let evDatosTotales = []; 
    let Highcharts; 

    // Variables reactivas para la tabla
    let añosTabla = $state([]);
    let tablaGer = $state({ tons: [], kw: [] });
    let tablaSwi = $state({ tons: [], kw: [] });

    onMount(async () => {
        try {
            // Importación dinámica de Highcharts
            const hc = await import('highcharts');
            const hcm = await import('highcharts/highcharts-more');
            const hcd = await import('highcharts/modules/dumbbell');
            const hcl = await import('highcharts/modules/lollipop');
            
            Highcharts = hc.default || hc;

            // Función segura para inicializar módulos en Vite
            const inicializarModulo = (modulo) => {
                const initFunc = modulo.default || modulo;
                if (typeof initFunc === 'function') {
                    initFunc(Highcharts);
                }
            };

            inicializarModulo(hcm);
            inicializarModulo(hcd);
            inicializarModulo(hcl);

            const miUrl = 'https://sos2526-28.onrender.com/api/v2/beneficial-ownership-merchant-fleets';
            const evUrl = 'https://sos2526-16.onrender.com/api/v1/global-ev-charging-infrastructures';
            
            const [resBarcos, resEv] = await Promise.all([
                fetch(miUrl),
                fetch(evUrl)
            ]);

            if (!resBarcos.ok || !resEv.ok) throw new Error("Fallo al conectar con las APIs");

            misDatosTotales = await resBarcos.json();
            evDatosTotales = await resEv.json();

            procesarYDibujar();
            cargando = false;

        } catch (error) {
            console.error("Error cargando gráfica:", error);
            errorMensaje = error.message;
            cargando = false;
        }
    });

    function procesarYDibujar() {
        let añosSet = new Set();
        let aggFleets = { 'Germany': {}, 'Switzerland': {} };
        let aggEvs = { 'germany': {}, 'switzerland': {} };

        misDatosTotales.forEach(d => {
            let p = d.beneficial_ownership_label;
            if (p === 'Germany' || p === 'Switzerland') {
                let y = parseInt(d.year);
                añosSet.add(y);
                if (!aggFleets[p][y]) aggFleets[p][y] = { tons: 0, ships: 0 };
                aggFleets[p][y].tons += parseFloat(d.dead_weight_tons) || 0;
                aggFleets[p][y].ships += parseInt(d.number_of_ships) || 0;
            }
        });

        evDatosTotales.forEach(d => {
            let p = d.country.toLowerCase();
            if (p === 'germany' || p === 'switzerland') {
                let y = parseInt(d.year);
                añosSet.add(y);
                if (!aggEvs[p][y]) aggEvs[p][y] = { power: 0, chargers: 0 };
                aggEvs[p][y].power += parseFloat(d.total_power_kw) || 0;
                aggEvs[p][y].chargers += parseInt(d.charging_point) || 0;
            }
        });

        let añosArray = Array.from(añosSet).sort((a, b) => a - b);
        añosTabla = añosArray;

        // Cálculo de medias
        const calcMedia = (agg, pais, año, campo1, campo2) => {
            let d = agg[pais][año];
            return d && d[campo2] > 0 ? Number((d[campo1] / d[campo2]).toFixed(2)) : null;
        };

        tablaGer.tons = añosArray.map(y => calcMedia(aggFleets, 'Germany', y, 'tons', 'ships'));
        tablaSwi.tons = añosArray.map(y => calcMedia(aggFleets, 'Switzerland', y, 'tons', 'ships'));
        tablaGer.kw = añosArray.map(y => calcMedia(aggEvs, 'germany', y, 'power', 'chargers'));
        tablaSwi.kw = añosArray.map(y => calcMedia(aggEvs, 'switzerland', y, 'power', 'chargers'));

        if (!chartContainer) return;

        // Gráfico Lollipop en Paneles
        Highcharts.chart(chartContainer, {
            chart: { 
                type: 'lollipop', 
                backgroundColor: 'transparent',
                height: 650 
            },
            title: { text: 'Eficiencia Comparada: Marítima vs EV', style: { fontWeight: 'bold' } },
            xAxis: { categories: añosArray, crosshair: true },
            yAxis: [{
                title: { text: 'Tonelaje Medio (Tons/Barco)', style: { color: '#0f766e' } },
                height: '45%',
                lineWidth: 2,
                min: 0
            }, {
                title: { text: 'Potencia Media (kW/Cargador)', style: { color: '#be123c' } },
                top: '55%',
                height: '45%',
                offset: 0,
                lineWidth: 2,
                min: 0
            }],
            tooltip: {
                shared: true
            },
            series: [
                {
                    name: 'Alemania - Marítimo',
                    yAxis: 0,
                    data: tablaGer.tons,
                    color: '#0f766e',
                    marker: { symbol: 'circle' }
                },
                {
                    name: 'Suiza - Marítimo',
                    yAxis: 0,
                    data: tablaSwi.tons,
                    color: '#14b8a6',
                    marker: { symbol: 'diamond' }
                },
                {
                    name: 'Alemania - Terrestre EV',
                    yAxis: 1,
                    data: tablaGer.kw,
                    color: '#be123c',
                    marker: { symbol: 'circle' }
                },
                {
                    name: 'Suiza - Terrestre EV',
                    yAxis: 1,
                    data: tablaSwi.kw,
                    color: '#f43f5e',
                    marker: { symbol: 'diamond' }
                }
            ]
        });
    }
</script>

<div class="container" style="max-width: 1100px; margin: 40px auto; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    
    <h2 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
        Integración SOS: Eficiencia Marítima vs EV (G16)
    </h2>

    {#if cargando}
        <div style="padding: 20px; background-color: #f0f9ff; color: #0284c7; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            ⏳ Sincronizando datos de flotas y cargadores...
        </div>
    {/if}

    {#if errorMensaje}
        <div style="background-color: #fee2e2; border: 1px solid #ef4444; color: #b91c1c; padding: 15px; border-radius: 8px;">
            <strong>❌ Error:</strong> {errorMensaje}
        </div>
    {/if}

    <div style="background: white; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; margin-bottom: 30px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
        <div bind:this={chartContainer}></div>
    </div>

    {#if añosTabla.length > 0}
        <div style="overflow-x: auto; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
            <table style="width: 100%; border-collapse: collapse; background: white;">
                <thead>
                    <tr style="background-color: #f8fafc; border-bottom: 2px solid #cbd5e1;">
                        <th style="padding: 15px; border-right: 1px solid #e2e8f0;" rowspan="2">Año</th>
                        <th style="padding: 15px; color: #0f766e; border-bottom: 1px solid #e2e8f0;" colspan="2">Eficiencia Marítima (T/B)</th>
                        <th style="padding: 15px; color: #be123c; border-bottom: 1px solid #e2e8f0;" colspan="2">Eficiencia EV (kW/C)</th>
                    </tr>
                    <tr style="background-color: #f8fafc;">
                        <th style="padding: 10px; border-right: 1px solid #e2e8f0;">Alemania</th>
                        <th style="padding: 10px; border-right: 1px solid #e2e8f0;">Suiza</th>
                        <th style="padding: 10px; border-right: 1px solid #e2e8f0;">Alemania</th>
                        <th style="padding: 10px;">Suiza</th>
                    </tr>
                </thead>
                <tbody>
                    {#each añosTabla as año, i}
                        <tr style="border-bottom: 1px solid #e2e8f0; background-color: {i % 2 === 0 ? 'white' : '#f8fafc'}; transition: background 0.2s;">
                            <td style="padding: 12px; font-weight: bold; text-align: center; border-right: 1px solid #e2e8f0;">{año}</td>
                            <td style="padding: 12px; text-align: center; border-right: 1px solid #e2e8f0;">{tablaGer.tons[i] || '-'}</td>
                            <td style="padding: 12px; text-align: center; border-right: 1px solid #e2e8f0;">{tablaSwi.tons[i] || '-'}</td>
                            <td style="padding: 12px; text-align: center; border-right: 1px solid #e2e8f0;">{tablaGer.kw[i] || '-'}</td>
                            <td style="padding: 12px; text-align: center;">{tablaSwi.kw[i] || '-'}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}


    <div class="mt-5 mb-5" style="display: flex; justify-content: space-between; width: 100%; padding-top: 20px;">
        <a href="/integrations" style="text-decoration: none; padding: 12px 25px; background-color: #3b82f6; color: white; border-radius: 5px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            ⬅ VOLVER A INTEGRACIONES
        </a>

        <a href="/beneficial-ownership-merchant-fleets/v2" style="text-decoration: none; padding: 12px 25px; background-color: #3b82f6; color: white; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-flex; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.3s ease;">
            DATOS FLOTA MERCANTE (v2)
        </a>
        
        <a href="https://sos2526-16.onrender.com/global-ev-charging-infrastructures" target="_blank" style="text-decoration: none; padding: 12px 25px; background-color: #3b82f6; color: white; border-radius: 5px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            API GRUPO 16 ➡
        </a>
    </div>
</div>

<style>
    tr:hover { background-color: #eff6ff !important; }
</style>