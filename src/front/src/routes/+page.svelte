<script>
    // Enlace al repositorio del grupo (Requisito d)
    const githubRepo = "https://github.com/gti-sos/SOS2526-28";

    // Array con los datos de los 3 miembros (Requisito e)
    const apis = [
        {
            nombre: "Alberto Jiménez Mateos",
            recurso: "beneficial-ownership-merchant-fleets",
            titulo: "FLOTA MERCANTE POR PAÍS DE BENEFICIARIO EFECTIVO",
            postman: "/beneficial-ownership-merchant-fleets/postman"
        },
        {
            nombre: "Jorge Dayoub Dayoub",
            recurso: "deliberate-violence-against-civilians-events-worldwide",
            titulo: "ACTOS DE VIOLENCIA DELIBERADA CONTRA CIVILES EN TODO EL MUNDO",
            postman: "https://documenter.getpostman.com/view/52833055/2sBXigMZ14"
        },
        {
            nombre: "Muhammad Zhillan Averous",
            recurso: "company-esg-scores-financial-performances",
            titulo: "CONJUNTO DE DATOS SOBRE ESG Y DESEMPEÑO FINANCIERO",
            postman: "https://documenter.getpostman.com/view/52377542/2sBXigMZP8"
        }
    ];
</script>

<div class="container" style="max-width: 1200px; margin: 0 auto; padding: 20px;">
    <h1 style="text-align: center; margin-bottom: 40px; color: #1e293b;">🚀 PANEL DE CONTROL</h1>

    <div class="endpoint-group" style="margin-bottom: 40px;">
        <h3 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">📈 GRÁFICAS Y ANALÍTICAS</h3>
        
        <div style="border: 1px solid #cbd5e1; padding: 25px; border-radius: 8px; background: #f8fafc; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            
            <div style="margin-bottom: 25px; display: flex; justify-content: center;">
                <a href="/analytics" style="text-decoration: none; padding: 15px 30px; background-color: #7b11d6; color: white; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(139, 92, 246, 0.3); width: 100%; max-width: 600px;">
                    🌌 ANALÍTICA CONJUNTA DEL GRUPO
                </a>
            </div>

            <h4 style="margin-top: 0; color: #475569; margin-bottom: 15px; text-align: center;">Analíticas Individuales:</h4>
            <div style="display: flex; gap: 15px; flex-wrap: wrap; justify-content: center;">
                {#each apis as api}
                    <a href="/analytics/{api.recurso}" style="text-decoration: none; padding: 12px 20px; background-color: #4a0487; color: white; border-radius: 5px; font-weight: bold; font-size: 14px; display: inline-flex; align-items: center; justify-content: center; text-align: center; flex: 1; min-width: 250px; box-shadow: 0 4px 6px rgba(168, 85, 247, 0.2);">
                        📈 {api.titulo}
                    </a>
                {/each}
            </div>
        </div>
    </div>

    <div class="endpoint-group">
        <h3 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">📊 APIs y FRONT-ENDS</h3>
        <ul class="api-list" style="list-style-type: none; padding: 0;">
            {#each apis as api}
                <li class="api-item" style="border: 1px solid #cbd5e1; padding: 20px; margin-bottom: 20px; border-radius: 8px; background: #f8fafc; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <span class="api-title" style="display:block; margin-bottom: 5px;">
                        <h3 style="margin: 0; color: #1e293b;">{api.titulo}</h3>
                    </span>
                    <span class="api-title" style="display:block; font-weight: bold; color: #475569;">
                        👤 {api.nombre}
                    </span>
                    
                    <div style="display: flex; gap: 15px; flex-wrap: wrap; margin-top: 20px;">
                        
                        <a href="/{api.recurso}" style="text-decoration: none; padding: 10px 15px; background-color: #3b82f6; color: white; border-radius: 5px; font-weight: bold; font-size: 14px; display: inline-flex; align-items: center; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);">
                            💻 ACCEDER A LOS DATOS
                        </a>
                        
                        <a href="/api/v1/{api.recurso}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; padding: 10px 15px; background-color: #10b981; color: white; border-radius: 5px; font-weight: bold; font-size: 14px; display: inline-flex; align-items: center; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);">
                            ⚙️ API (JSON)
                        </a>
                        
                        {#if api.postman}
                            <a href={api.postman} style="text-decoration: none; padding: 10px 15px; background-color: #ff6c37; color: white; border-radius: 5px; font-weight: bold; font-size: 14px; display: inline-flex; align-items: center; box-shadow: 0 2px 4px rgba(255, 108, 55, 0.3);">
                                📙 DOCUMENTACIÓN
                            </a>
                        {/if}

                        <a href="/analytics/{api.recurso}" style="text-decoration: none; padding: 12px 20px; background-color: #4a0487; color: white; border-radius: 5px; font-weight: bold; font-size: 14px; display: inline-flex; align-items: center; box-shadow: 0 4px 6px rgba(168, 85, 247, 0.2);">
                            📈 VISUALIZACIÓN GRÁFICA
                        </a>

                    </div>
                </li>
            {/each}
        </ul>
    </div>
</div>