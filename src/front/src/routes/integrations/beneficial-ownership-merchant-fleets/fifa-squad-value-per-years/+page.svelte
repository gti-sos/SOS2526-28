<script>
    import { onMount } from 'svelte';
    
    // Variables de estado
    let cargando = $state(true);
    let errorMensaje = $state("");
    let chartContainer;
    
    const añosDisponibles = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
    let añoSeleccionado = $state(2023); 
    
    let misDatosTotales = []; 
    let compiDatosTotales = []; 
    let Highcharts; 

    // Variables para la tabla
    let categorias = $state([]);
    let serieFifaReal = $state([]);
    let serieBarcosReal = $state([]);
    let coloresPaises = $state([]);

    // Mapa de colores para asignar a cada país de forma única
    const paletaColores = [
        '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
        '#ec4899', '#06b6d4', '#f97316', '#84cc16', '#64748b',
        '#14b8a6', '#6366f1', '#d946ef', '#eab308', '#f43f5e'
    ];

    const mapaPaises = {
        "United Kingdom": "England",
        "United States": "USA"
    };

    onMount(async () => {
        try {
            const hc = await import('highcharts');
            Highcharts = hc.default || hc;
            
            // Módulo Funnel/Pyramid de Highcharts
            const funnel = await import('highcharts/modules/funnel');
            if (typeof funnel.default === 'function') funnel.default(Highcharts);
            else if (typeof funnel === 'function') funnel(Highcharts);

            const miUrl = 'https://sos2526-28.onrender.com/api/v2/beneficial-ownership-merchant-fleets'; 
            const compiUrl = 'https://sos2526-26.onrender.com/api/v2/fifa-squad-value-per-years';
            
            const [miRespuesta, compiRespuesta] = await Promise.all([
                fetch(miUrl),
                fetch(compiUrl)
            ]);

            if (!miRespuesta.ok) throw new Error("Fallo al cargar tu API de Flotas");
            if (!compiRespuesta.ok) throw new Error("Fallo al cargar la API del compañero");

            misDatosTotales = await miRespuesta.json();
            compiDatosTotales = await compiRespuesta.json();

            cargando = false;
            actualizarGrafica();

        } catch (error) {
            console.error("Error:", error);
            errorMensaje = error.message;
            cargando = false;
        }
    });

    function actualizarGrafica() {
        if (!Highcharts) return;

        const añoNumerico = Number(añoSeleccionado);

        // 1.Obtención datos FIFA
        let valorPaisesFifa = {};
        compiDatosTotales.forEach(item => {
            if (Number(item.year) === añoNumerico) {
                valorPaisesFifa[item.country] = item.total_market_value; 
            }
        });

        // 2.Extraer datos Barcos
        let acumuladorBarcos = {};
        misDatosTotales.forEach(dato => {
            if (Number(dato.year) === añoNumerico) {
                let paisBruto = dato.beneficial_ownership_label;
                let paisTraducido = mapaPaises[paisBruto] || paisBruto; 
                
                if (!acumuladorBarcos[paisTraducido]) acumuladorBarcos[paisTraducido] = 0;
                acumuladorBarcos[paisTraducido] += (Number(dato.number_of_ships) || 0);
            }
        });

        // 3.Cruzar datos 
        let tempCategorias = [];
        let tempFifaReal = [];
        let tempBarcosReal = [];
        let tempColores = [];

        //Genero los datos cruzados asignando el mismo color por índice
        let colorIndex = 0;
        Object.keys(valorPaisesFifa).forEach(pais => {
            if (acumuladorBarcos[pais] !== undefined) {
                tempCategorias.push(pais);
                tempFifaReal.push(valorPaisesFifa[pais]);    
                tempBarcosReal.push(acumuladorBarcos[pais]); 
                tempColores.push(paletaColores[colorIndex % paletaColores.length]);
                colorIndex++;
            }
        });

        if (tempCategorias.length === 0) {
            tempCategorias = [`Sin datos`];
            tempFifaReal = [0];
            tempBarcosReal = [0];
            tempColores = ['#cccccc'];
        }

        // Actualizo las variables de la tabla HTML
        categorias = tempCategorias;
        serieFifaReal = tempFifaReal;
        serieBarcosReal = tempBarcosReal;
        coloresPaises = tempColores;

        // Formateo los datos para el Pyramid Chart: { name, y, color }
        let datosPiramideFifa = [];
        let datosPiramideBarcos = [];

        for (let i = 0; i < categorias.length; i++) {
            datosPiramideFifa.push({
                name: categorias[i],
                y: tempFifaReal[i],
                color: tempColores[i] // El mismo color en ambas
            });
            
            datosPiramideBarcos.push({
                name: categorias[i],
                y: tempBarcosReal[i],
                color: tempColores[i] // El mismo color en ambas
            });
        }

        // 4. DIBUJAR DOBLE PIRÁMIDE
        Highcharts.chart(chartContainer, {
            chart: { 
                type: 'pyramid', 
                backgroundColor: 'transparent'
            },
            title: { 
                text: `Doble Pirámide: Valor FIFA vs Flota Mercante (${añoNumerico})`,
                style: { fontWeight: 'bold' } 
            },
            plotOptions: {
                series: {
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b> ({point.y})',
                        softConnector: true
                    },
                    center: ['50%', '50%'],
                    width: '80%'
                }
            },
            tooltip: {
                useHTML: true,
                formatter: function() {
                    let unidad = this.series.name.includes('FIFA') ? 'M€' : 'buques';
                    return `<span style="color:${this.point.color}">\u25CF</span> <b>${this.point.name}</b><br/>${this.series.name}: <b>${this.y} ${unidad}</b>`;
                }
            },
            series: [
                {
                    name: 'Valor Selección FIFA',
                    data: datosPiramideFifa,
                    center: ['25%', '50%'], //Pirámide Izquierda
                    width: '40%'
                }, 
                {
                    name: 'Flota Mercante',
                    data: datosPiramideBarcos,
                    center: ['75%', '50%'], //Pirámide Derecha
                    width: '40%'
                }
            ]
        });
    }
</script>

<div class="container" style="max-width: 1100px; margin: 40px auto; padding: 20px;">
    
    <h2 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
        Integración Externa: FIFA Squad Values API (Grupo 26)
    </h2>

    <p style="color: #475569; line-height: 1.6; font-size: 1.05rem; margin-bottom: 20px;">
        Esta integración utiliza un <strong>Doble Gráfico de Pirámide (Pyramid Chart)</strong>. A la izquierda visualizamos el valor económico de las selecciones y a la derecha el volumen de la flota mercante. El color de cada país es idéntico en ambas pirámides para comparar rápidamente la jerarquía.
    </p>

    <!-- Panel de Controles Interactivo -->
    <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 20px; border-radius: 8px; margin-bottom: 20px; display: flex; align-items: center; gap: 15px;">
        <label for="selector-año" style="font-weight: bold; color: #1e293b; font-size: 1.1rem;">
            📅 Filtrar por Año:
        </label>
        
        <select 
            id="selector-año" 
            bind:value={añoSeleccionado} 
            onchange={actualizarGrafica}
            disabled={cargando}
            style="padding: 10px; font-size: 1.1rem; border-radius: 5px; border: 1px solid #94a3b8; outline: none; cursor: pointer; min-width: 150px;"
        >
            {#each añosDisponibles as anio}
                <option value={anio}>{anio}</option>
            {/each}
        </select>
        
        {#if cargando}
            <span style="color: #0ea5e9; font-weight: bold;">Cruzando datos de ambas APIs...</span>
        {/if}
    </div>

    {#if errorMensaje}
        <div style="background-color: #fee2e2; border: 1px solid #ef4444; color: #b91c1c; padding: 15px; border-radius: 8px;">
            <strong>❌ Error de integración:</strong> {errorMensaje}
        </div>
    {/if}

    <!-- CONTENEDOR DEL GRÁFICO (DOBLE PIRÁMIDE) -->
    <div style="position: relative; border: 1px solid #cbd5e1; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); padding: 15px; background-color: white; margin-bottom: 30px;">
        <div bind:this={chartContainer} style="width: 100%; height: 500px;"></div>
    </div>

    <!-- TABLA DE DATOS CRUZADOS CON INDICADOR DE COLOR -->
    {#if categorias.length > 0 && !categorias[0].startsWith('Sin datos')}
        <div style="overflow-x: auto; margin-bottom: 30px; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                    <tr>
                        <th style="padding: 12px; color: #1e293b; font-weight: bold; width: 50px;">Color</th>
                        <th style="padding: 12px; color: #1e293b; font-weight: bold;">País</th>
                        <th style="padding: 12px; color: #1e293b; font-weight: bold;">Valor Selección (FIFA)</th>
                        <th style="padding: 12px; color: #1e293b; font-weight: bold;">Nº Naves Registradas</th>
                    </tr>
                </thead>
                <tbody>
                    {#each categorias as pais, i}
                        <tr style="border-bottom: 1px solid #e2e8f0; background-color: {i % 2 === 0 ? 'white' : '#f8fafc'};">
                            <td style="padding: 12px;">
                                <div style="width: 20px; height: 20px; border-radius: 50%; background-color: {coloresPaises[i]}; border: 1px solid #cbd5e1;"></div>
                            </td>
                            <td style="padding: 12px; font-weight: bold; color: #334155;">{pais}</td>
                            <td style="padding: 12px;">{serieFifaReal[i]} M€</td>
                            <td style="padding: 12px;">{serieBarcosReal[i]} Buques</td>
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
        
        <a href="https://sos2526-26.onrender.com/api/v2/fifa-squad-value-per-years" target="_blank" style="text-decoration: none; padding: 12px 25px; background-color: #3b82f6; color: white; border-radius: 5px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            API GRUPO 26 ➡
        </a>
    </div>

</div>