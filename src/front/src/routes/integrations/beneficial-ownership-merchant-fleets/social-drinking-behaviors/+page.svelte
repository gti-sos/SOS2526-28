<script>
    import { onMount } from 'svelte';
    import Highcharts from 'highcharts';
    
    // Variables de estado
    let cargando = $state(true);
    let errorMensaje = $state("");
    let chartContainer;
    
    const mapaPaises = {
        "Russian Federation": "Russia",
        "Republic of Korea": "South Korea",
        "Netherlands (Kingdom of the)": "Netherlands",
        "Turkiye": "Turkey"
    };

    onMount(async () => {
        try {
            const miUrl = '/api/v2/beneficial-ownership-merchant-fleets'; 
            const suUrl = 'https://sos2526-25.onrender.com/api/v2/social-drinking-behaviors';
            
            const [miRespuesta, suRespuesta] = await Promise.all([
                fetch(miUrl),
                fetch(suUrl)
            ]);

            if (!miRespuesta.ok) throw new Error("Fallo al cargar tu API");
            if (!suRespuesta.ok) throw new Error("Fallo al cargar la API de Comportamiento de Consumo");

            const misDatos = await miRespuesta.json();
            const susDatos = await suRespuesta.json();

            // Procesamiento de mis datos
            let acumuladorBarcos = {};
            misDatos.forEach(dato => {
                let paisOriginal = dato.beneficial_ownership_label;
                let paisLimpio = mapaPaises[paisOriginal] || paisOriginal;
                
                if (!acumuladorBarcos[paisLimpio]) acumuladorBarcos[paisLimpio] = 0;
                acumuladorBarcos[paisLimpio] += (Number(dato.number_of_ships) || 0);
            });

            // Procesamiento datos: Consumo social de alcohol (Suma separada por tipo de bebida)
            let acumuladorBebidas = {};
            let contadorAlcohol = {};
            susDatos.forEach(dato => {
                let pais = dato.country;
                if (!acumuladorBebidas[pais]) {
                    acumuladorBebidas[pais] = { cerveza: 0, vino: 0, licores: 0 };
                    contadorAlcohol[pais] = 0;
                }
                acumuladorBebidas[pais].cerveza += (Number(dato.beer_share) || 0);
                acumuladorBebidas[pais].vino += (Number(dato.wine_share) || 0);
                acumuladorBebidas[pais].licores += (Number(dato.spirit_share) || 0);
                contadorAlcohol[pais]++;
            });

            // Integración de datos (solo países comunes)
            let paisesComunes = Object.keys(acumuladorBarcos).filter(pais => acumuladorBebidas[pais]);
            paisesComunes.sort();

            // Preparación arrays para Highcharts
            let categorias = [];
            let dataBarcos = [];
            let dataCerveza = [];
            let dataVino = [];
            let dataLicores = [];

            paisesComunes.forEach(pais => {
                categorias.push(pais);
                dataBarcos.push(acumuladorBarcos[pais]);
                
                let conteo = contadorAlcohol[pais];
                // Promedios por tipo de bebida
                dataCerveza.push(Number((acumuladorBebidas[pais].cerveza / conteo).toFixed(2)));
                dataVino.push(Number((acumuladorBebidas[pais].vino / conteo).toFixed(2)));
                dataLicores.push(Number((acumuladorBebidas[pais].licores / conteo).toFixed(2)));
            });

            // Dibujo de la gráfica
            if (chartContainer) {
                 Highcharts.chart(chartContainer, {
                    chart: { 
                        type: 'bar', 
                        backgroundColor: 'transparent' 
                    },
                    title: { 
                        text: 'Flota Mercante vs Consumo Social de Alcohol', 
                        style: { fontWeight: 'bold' } 
                    },
                    subtitle: { 
                        text: 'Detalle de consumo por tipo de bebida frente a la flota nacional' 
                    },
                    xAxis: { 
                        categories: categorias, 
                        crosshair: true,
                        title: { text: null } 
                    },
                    yAxis: [
                        { // Eje 0: Alcohol
                            title: { text: 'Consumo de Alcohol (L/año)', style: { color: '#64748b', fontWeight: 'bold' } },
                            labels: { format: '{value} L', style: { color: '#64748b' } }
                        }, 
                        { // Eje 1: Barcos
                            title: { text: 'Número de Barcos', style: { color: '#0ea5e9', fontWeight: 'bold' } },
                            labels: { format: '{value}', style: { color: '#0ea5e9' } },
                            opposite: true
                        }
                    ],
                    // Permite apilamiento normal
                    plotOptions: {
                        series: {
                            stacking: 'normal',
                            pointPadding: 0.05,
                            groupPadding: 0.1
                        }
                    },
                    tooltip: { 
                        shared: true,
                        headerFormat: '<span style="font-size: 14px; font-weight: bold;">{point.key}</span><br/>'
                    },
                    legend: { layout: 'horizontal', align: 'center', verticalAlign: 'bottom' },
                    series: [
                        { 
                            name: 'Cerveza', 
                            yAxis: 0, 
                            data: dataCerveza, 
                            color: '#f59e0b', // Naranja
                            stack: 'alcohol', // Se agrupa en la barra de alcohol
                            tooltip: { valueSuffix: ' Litros' } 
                        }, 
                        { 
                            name: 'Vino', 
                            yAxis: 0, 
                            data: dataVino, 
                            color: '#9f1239', // Vino
                            stack: 'alcohol', // Se agrupa en la barra de alcohol
                            tooltip: { valueSuffix: ' Litros' } 
                        },
                        { 
                            name: 'Licores', 
                            yAxis: 0, 
                            data: dataLicores, 
                            color: '#8b5cf6', // Morado
                            stack: 'alcohol', // Se agrupa en la barra de alcohol
                            tooltip: { valueSuffix: ' Litros' } 
                        },
                        { 
                            name: 'Flota Mercante', 
                            yAxis: 1, 
                            data: dataBarcos, 
                            color: '#0ea5e9', // Azul marino
                            stack: 'barcos', // Se agrupa en su propia barra separada
                            tooltip: { valueSuffix: ' buques' } 
                        }
                    ]
                });
            }

            cargando = false;

        } catch (error) {
            console.error("Error en la integración:", error);
            errorMensaje = error.message;
            cargando = false;
        }
    });
</script>

<div class="container" style="max-width: 1000px; margin: 40px auto; padding: 20px;">

    <h2 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
        🎓 Integración SOS (Grupo 25): Consumo social de alcohol
    </h2><br>

    <p style="color: #475569; line-height: 1.6; font-size: 1.05rem; margin-bottom: 20px;">
        <strong>Tipo de visualización:</strong> Stacked bar con doble eje x
    </p>

    <p style="color: #475569; line-height: 1.6; font-size: 1.05rem; margin-bottom: 20px;">
        <strong>Descripción de la integración:</strong> La api usada pertenece a un compañero del grupo 25, consiste en un conjunto de datos que representan el consumo promedio per cápita de alcohol. En la representación se muestran dos barras horizontales por cada país. La primera barra detalla el consumo medio de alcohol (cerveza, vino y licores) por habitante. La segunda barra representa la cantidad total de barcos mercantes que posee ese mismo país.
    </p>

    {#if errorMensaje}
        <div style="background-color: #fee2e2; border: 1px solid #ef4444; color: #b91c1c; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <strong>❌ Error de integración:</strong> {errorMensaje}
        </div>
    {/if}

    <div style="position: relative; margin-top: 30px; border: 1px solid #cbd5e1; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); padding: 15px; background-color: white;">
        
        {#if cargando}
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.9); display: flex; align-items: center; justify-content: center; z-index: 10; font-size: 1.2rem; color: #64748b;">
                ⏳ Conectando con las APIs y apilando datos...
            </div>
        {/if}

        <div bind:this={chartContainer} style="width: 100%; height: 900px;"></div>
    </div>

    <div class="mt-5 mb-5" style="display: flex; justify-content: space-between; width: 100%; padding-top: 20px;">
        <a href="/integrations" style="text-decoration: none; padding: 12px 25px; background-color: #3b82f6; color: white; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-flex; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.3s ease;">
            ⬅ VOLVER A INTEGRACIONES
        </a>
        
        <a href="/beneficial-ownership-merchant-fleets/v2" style="text-decoration: none; padding: 12px 25px; background-color: #3b82f6; color: white; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-flex; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.3s ease;">
            DATOS FLOTA MERCANTE (v2)
        </a>
        
        <a href="https://sos2526-25.onrender.com/social-drinking-behaviors" target="_blank" style="text-decoration: none; padding: 12px 25px; background-color: #3b82f6; color: white; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-flex; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.3s ease;">
            VER DATOS G25 ➡
        </a>
    </div>

</div>