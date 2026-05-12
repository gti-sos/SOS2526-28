<script>
    // Array con los datos de los miembros y sus integraciones
    const integrantes = [
        {
            nombre: "Alberto Jiménez Mateos",
            titulo: "FLOTA MERCANTE POR PAÍS DE BENEFICIARIO EFECTIVO",
            integraciones: [
                { nombre: "🛡️ Uso con Proxy (Externa 1): SpaceX", url: "/integrations/beneficial-ownership-merchant-fleets/spacex-proxy", color: "#3b82f6" },
                { nombre: "🌍 Integración (Externa 2): Exportaciones", url: "/integrations/beneficial-ownership-merchant-fleets/exports", color: "#0ea5e9" },
                { nombre: "🌍 Integración (Externa 3): Poder comercial", url: "/integrations/beneficial-ownership-merchant-fleets/global-bank-pib", color: "#10b981" },
                { nombre: "🎓 Uso SOS (Grupo 16): Infraestructuras globales de carga de vehículos eléctricos", url: "/integrations/beneficial-ownership-merchant-fleets/global-ev-charging-infrastructures", color: "#059669" },
                { nombre: "🎓 Uso SOS (Grupo 26): FIFA Valores de los equipos nacionales", url: "/integrations/beneficial-ownership-merchant-fleets/fifa-squad-value-per-years", color: "#65a30d" },
                { nombre: "🎓 Integración SOS (Grupo 23): Rendimiento de anuncios globales", url: "/integrations/beneficial-ownership-merchant-fleets/global-ads-performance", color: "#f59e0b" },
                { nombre: "🎓 Integración SOS (Grupo 25): Consumo social de alcohol", url: "/integrations/beneficial-ownership-merchant-fleets/social-drinking-behaviors", color: "#ea580c" }
            ]
        },
        {
            nombre: "Jorge Dayoub Dayoub",
            titulo: "ACTOS DE VIOLENCIA DELIBERADA CONTRA CIVILES EN TODO EL MUNDO",
            integraciones: [
                { nombre: "🛡️ Integración Externa (Vía Proxy Propio) HungerMap", url: "/integrations/deliberate-violence-against-civilians-events-worldwide/hungermap", color: "#f59e0b" },
                { nombre: "🌍 Integración Externa 2: Informacion demográfica", url: "/integrations/deliberate-violence-against-civilians-events-worldwide/rest-countries", color: "#3b82f6" },
                { nombre: "🌍 Integración Externa 3: Gasto Militar Global", url: "/integrations/deliberate-violence-against-civilians-events-worldwide/world-bank-military", color: "#0ea5e9" },
                { nombre: "🎓 Integración SOS (Grupo 13): Estadistica de conflictos", url: "/integrations/deliberate-violence-against-civilians-events-worldwide/conflict-stats", color: "#10b981" },
                { nombre: "🎓 Integración SOS (Grupo 26): Índice de Desarrollo Humano", url: "/integrations/deliberate-violence-against-civilians-events-worldwide/countries-idh-per-years", color: "#059669" }
            ]
        },
        {
            nombre: "Muhammad Zhillan Averous",
            titulo: "CONJUNTO DE DATOS SOBRE ESG Y DESEMPEÑO FINANCIERO",
            integraciones: [
                { nombre: "🛡️ Integración Externa (Vía Proxy Propio)", url: "/integrations/zhillan/proxy", color: "#f59e0b" },
                { nombre: "🌍 Integración Externa 2", url: "/integrations/zhillan/externa-2", color: "#3b82f6" },
                { nombre: "🌍 Integración Externa 3", url: "/integrations/zhillan/externa-3", color: "#0ea5e9" },
                { nombre: "🎓 Integración SOS (Grupo 12): age-specific-fertility-rates", url: "/integrations/zhillan/sos-1", color: "#10b981" },
                { nombre: "🎓 Integración SOS (Grupo 14): active-satellites", url: "/integrations/zhillan/sos-2", color: "#059669" },
                { nombre: "🎓 Integración SOS (Grupo 21): aids-deaths-stats", url: "/integrations/zhillan/sos-2", color: "#65a30d" },
                { nombre: "🎓 Integración SOS (Grupo 23): daily-global-stock-market-indicators", url: "/integrations/zhillan/sos-2", color: "#ea580c" },
                { nombre: "🎓 Integración SOS (Grupo 29): citys-stats", url: "/integrations/zhillan/sos-2", color: "#d97706" }
            ],
            hasMasIntegraciones: true
        }
    ];
</script>

<div class="container" style="max-width: 1200px; margin: 0 auto; padding: 20px;">
    
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; flex-wrap: wrap; gap: 15px;">
        <h1 style="margin: 0; color: #1e293b;">🔗 INTEGRACIONES Y USOS (RESTful / JSON)</h1>
        <a href="/" style="text-decoration: none; padding: 10px 20px; background-color: #475569; color: white; border-radius: 5px; font-weight: bold; font-size: 14px; box-shadow: 0 2px 4px rgba(71, 85, 105, 0.3);">
            ⬅️ VOLVER AL INICIO
        </a>
    </div>

    <!-- Tarjetas para las integraciones o usos de cada uno -->
    <div class="endpoint-group">
        <ul style="list-style-type: none; padding: 0;">
            
            {#each integrantes as integrante}
                <li style="border: 1px solid #cbd5e1; padding: 25px; margin-bottom: 25px; border-radius: 8px; background: #f8fafc; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    
                    <!-- cada tarjeta -->
                    <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px;">
                        <h3 style="margin: 0 0 5px 0; color: #1e293b; font-size: 1.2rem;">{integrante.titulo}</h3>
                        <span style="display:block; font-weight: bold; color: #475569; font-size: 1rem;">
                            👤 {integrante.nombre}
                        </span>
                    </div>
                    
                    <!-- Lista de Integraciones -->
                    <h4 style="margin-top: 0; color: #64748b; margin-bottom: 15px;">Lista de integraciones operativas:</h4>

                    <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px;">
                        {#if integrante.integraciones.length > 0}
                            {#each integrante.integraciones as integracion}
                                <!-- Fila de cada integración con space-between -->
                                <li style="display: flex; justify-content: space-between; align-items: center; background: white; padding: 12px 20px; border: 1px solid #e2e8f0; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
                                    
                                    <span style="font-weight: 600; color: #334155; font-size: 15px;">
                                        {integracion.nombre}
                                    </span>
                                    
                                    <a href="{integracion.url}" style="text-decoration: none; padding: 8px 20px; background-color: {integracion.color}; color: white; border-radius: 5px; font-weight: bold; font-size: 13px; display: inline-flex; align-items: center; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                                        ACCEDER ➡️
                                    </a>
                                </li>
                            {/each}
                        {:else}
                            <span style="color: #94a3b8; font-style: italic;">Aún no hay integraciones publicadas...</span>
                        {/if}
                    </ul>
                    
                </li>
            {/each}
            
        </ul>
    </div>
</div>