<script>
    import { onMount } from 'svelte';
    
    // Las variables que cambian deben llevar $state() 
    let cargando = $state(true);
    let errorMensaje = $state("");
    
    let categorias = $state([]);
    let dataMisBarcos = $state([]);
    let dataSuGasto = $state([]);

    const mapaRegiones = {
        "Singapore": "Asia", "Switzerland": "Europe", "Greenland": "North America", 
        "Bangladesh": "Asia", "Poland": "Europe", "Canada": "North America",
        "Estonia": "Europe", "Iceland": "Europe", "Germany": "Europe", 
        "Syrian Arab Republic": "Asia", "Spain": "Europe", "Greece": "Europe",
        "Cyprus": "Europe", "United Arab Emirates": "Asia", "Denmark": "Europe", 
        "Lithuania": "Europe", "China": "Asia", "China, Hong Kong SAR": "Asia", 
        "Indonesia": "Asia", "United Kingdom": "Europe", "Russian Federation": "Europe",
        "Latvia": "Europe", "Turkiye": "Europe", "Ukraine": "Europe", 
        "Bahamas": "North America", "Republic of Korea": "Asia", "Norway": "Europe",
        "Belgium": "Europe", "France": "Europe", "Italy": "Europe", 
        "China, Taiwan Province of": "Asia", "Australia": "Oceania", 
        "Finland": "Europe", "Ireland": "Europe", "Albania": "Europe", 
        "Portugal": "Europe", "Philippines": "Asia", 
        "Netherlands (Kingdom of the)": "Europe", "China, Macao SAR": "Asia"
    };

    onMount(async () => {
        try {
            console.log("Iniciando peticiones de red...");
            const miUrl = 'https://sos2526-28.onrender.com/api/v2/beneficial-ownership-merchant-fleets';
            const suUrl = 'https://sos2526-23.onrender.com/api/v2/global-ads-performance';
            
            const [miRespuesta, suRespuesta] = await Promise.all([
                fetch(miUrl),
                fetch(suUrl)
            ]);

            if (!miRespuesta.ok) throw new Error("Tu API falló con código " + miRespuesta.status);
            if (!suRespuesta.ok) throw new Error("La API 23 falló con código " + suRespuesta.status);

            const misDatos = await miRespuesta.json();
            const susDatos = await suRespuesta.json();

            let acumuladorBarcos = { "Oceania": 0, "North America": 0, "Asia": 0, "Europe": 0, "Resto del mundo": 0 };
            let acumuladorGasto = { "Oceania": 0, "North America": 0, "Asia": 0, "Europe": 0, "Resto del mundo": 0 };

            misDatos.forEach(dato => {
                let region = mapaRegiones[dato.beneficial_ownership_label] || "Resto del mundo";
                acumuladorBarcos[region] += (Number(dato.number_of_ships) || 0);
            });

            susDatos.forEach(dato => {
                let region = dato.region || "Resto del mundo";
                if (!acumuladorGasto.hasOwnProperty(region)) region = "Resto del mundo";
                acumuladorGasto[region] += (Number(dato.ad_spend) || 0);
            });

            // Las variables $state
            categorias = Object.keys(acumuladorBarcos);
            dataMisBarcos = categorias.map(reg => acumuladorBarcos[reg]);
            dataSuGasto = categorias.map(reg => Math.round(acumuladorGasto[reg])); 

            console.log("Procesado listo. Quitamos el loading...");
            cargando = false;

        } catch (error) {
            console.error("Error en la petición:", error);
            errorMensaje = error.message;
            cargando = false;
        }
    });

    function renderizarHighcharts(node) {
        import('highcharts').then(modulo => {
            const Highcharts = modulo.default || modulo;
            
            Highcharts.chart(node, {
    chart: { 
        zoomType: 'xy', 
        backgroundColor: 'transparent' 
    },
    title: { 
        text: 'Relación entre Flota Mercante y Rendimiento de anuncios globales', 
        style: { fontWeight: 'bold' } 
    },
    subtitle: { 
        text: 'Comparativa agrupada por regiones (Área vs Dispersión)' 
    },
    xAxis: [{ 
        categories: categorias, 
        crosshair: true, 
        title: { text: 'Regiones' } 
    }],
    yAxis: [
        { // Eje Y (Izquierda) - Gasto en Anuncios
            labels: { format: '${value}', style: { color: '#f59e0b' } }, 
            title: { text: 'Gasto en Anuncios (USD)', style: { color: '#f59e0b', fontWeight: 'bold' } } 
        }, 
        { // Eje Y (Derecha) - Número de Barcos
            title: { text: 'Número de Barcos', style: { color: '#3b82f6', fontWeight: 'bold' } }, 
            labels: { format: '{value} buques', style: { color: '#3b82f6' } }, 
            opposite: true  //Para que salga a la derecha 
        }
    ],
    tooltip: {
    shared: true,
    // Título del cuadro con el nombre de la región
    headerFormat: '<span style="font-size: 14px; font-weight: bold;">{point.key}</span><br/>',
    // Formato a los valores, ocultando la 'x'
    pointFormat: '<span style="color:{series.color}">\u25CF</span> {series.name}: <b>{point.y}</b><br/>'
},
    legend: { layout: 'horizontal', align: 'center', verticalAlign: 'bottom' },
    
    series: [
        { 
            name: 'Gasto Publicitario (Ads)', 
            type: 'area',  // TIPO ÁREA (Muestra el volumen de dinero)
            yAxis: 0, 
            data: dataSuGasto, 
            color: 'rgba(245, 158, 11, 0.6)', 
            tooltip: { valuePrefix: '$' } 
        }, 
        { 
            name: 'Flota Mercante (Barcos)', 
            type: 'scatter', // TIPO SCATTER (Puntos de dispersión flotantes)
            yAxis: 1, 
            data: dataMisBarcos, 
            color: '#1d4ed8', 
            marker: { 
                symbol: 'diamond', 
                radius: 8 
            },
            tooltip: { valueSuffix: ' buques' } 
        }
    ]
});
        }).catch(err => {
            console.error("Error cargando Highcharts:", err);
            errorMensaje = "Error al cargar la librería de gráficas.";
        });
        return { destroy() {} };
    }
</script>

<div class="container" style="max-width: 1000px; margin: 40px auto; padding: 20px;">

    <h2 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
        🎓 Integración SOS (Grupo 23): Rendimiento de anuncios globales
    </h2><br>

    <p style="color: #475569; line-height: 1.6; font-size: 1.05rem; margin-bottom: 20px;">
        Esta gráfica interactiva explora la relación entre la distribución geográfica de las flotas mercantes (según el país del propietario beneficiario) y el volumen de inversión en publicidad digital por región. Al cruzar estos datos, buscamos identificar si existe una correlación entre las potencias que dominan el transporte marítimo mundial y aquellas que lideran el gasto en marketing digital a nivel global.
    </p>

    {#if cargando}
        <div style="text-align: center; padding: 50px; color: #64748b; font-size: 1.2rem;">
            ⏳ Conectando con las APIs y cruzando datos...
        </div>
    {:else if errorMensaje}
        <div style="background-color: #fee2e2; border: 1px solid #ef4444; color: #b91c1c; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <strong>❌ Error de integración:</strong> {errorMensaje}
        </div>
    {:else}
        <div style="margin-top: 30px; border: 1px solid #cbd5e1; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); padding: 15px; background-color: white;">
            <div use:renderizarHighcharts style="width: 100%; height: 500px;"></div>
        </div>
    {/if}

    
    <div class="mt-5 mb-5" style="display: flex; justify-content: space-between; width: 100%; padding-top: 20px;">
        <a href="/integrations" style="text-decoration: none; padding: 12px 25px; background-color: #3b82f6; color: white; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-flex; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.3s ease;">
            ⬅ VOLVER A INTEGRACIONES
        </a>
        
        <a href="/beneficial-ownership-merchant-fleets/v2" style="text-decoration: none; padding: 12px 25px; background-color: #3b82f6; color: white; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-flex; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.3s ease;">
            DATOS FLOTA MERCANTE (v2)
        </a>
        
        <a href="https://sos2526-23.onrender.com/global-ads-performance/v2" target="_blank" style="text-decoration: none; padding: 12px 25px; background-color: #3b82f6; color: white; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-flex; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.3s ease;">
            DATOS G23 RENDIMIENTO ➡
        </a>
    </div>

</div>