<script>
    // Enlace al repositorio del grupo (Requisito d)
    const githubRepo = "https://github.com/gti-sos/SOS2526-28";

    // Array con los datos de los 3 miembros (Requisito e)
    // Svelte usará esto para generar el HTML automáticamente
    const apis = [
        {
            nombre: "Alberto Jiménez Mateos",
            recurso: "beneficial-ownership-merchant-fleets",
            titulo: "BENEFICIAL OWNERSHIP MERCHANT FLEETS",
            postman: "#"
        },
        {
            nombre: "Jorge Dayoub Dayoub",
            recurso: "deliberate-violence-against-civilians-events-worldwide",
            titulo: "DELIBERATE VIOLENCE AGAINST CIVILIANS EVENTS WORLDWIDE",
            postman: "URL_DEL_POSTMAN_DE_JORGE" // <-- Sustituye esto
        },
        {
            nombre: "Muhammad Zhillan Averous",
            recurso: "company-esg-scores-financial-performances",
            titulo: "COMPANY ESG SCORES FINANCIAL PERFORMANCES",
            postman: "URL_DEL_POSTMAN_DE_MUHAMMAD" // <-- Sustituye esto
        }
    ];
</script>

<div class="container">
    <h1>🚀 PANEL DE CONTROL</h1>

    <div class="endpoint-group">
        <h3>📊 APIs y FRONT-ENDS</h3>
        <ul class="api-list" style="list-style-type: none; padding: 0;">
            {#each apis as api}
                <li class="api-item" style="border: 1px solid #cbd5e1; padding: 20px; margin-bottom: 20px; border-radius: 8px; background: #f8fafc;">
                    <span class="api-title" style="display:block; margin-bottom: 5px;">
                        <h3 style="margin: 0; color: #1e293b;">{api.titulo}</h3>
                    </span>
                    <span class="api-title" style="display:block; font-weight: bold; color: #475569;">
                        {api.nombre}
                    </span>
                    
                    <div style="display: flex; gap: 15px; flex-wrap: wrap; margin-top: 15px;">
                        
                        <a href="/{api.recurso}" style="text-decoration: none; padding: 10px 15px; background-color: #3b82f6; color: white; border-radius: 5px; font-weight: bold; font-size: 14px; display: inline-flex; align-items: center;">
                            💻 FRONT-END (Svelte)
                        </a>
                        
                        <a href="/api/v1/{api.recurso}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; padding: 10px 15px; background-color: #10b981; color: white; border-radius: 5px; font-weight: bold; font-size: 14px; display: inline-flex; align-items: center;">
                            ⚙️ API (JSON)
                        </a>
                        
                        {#if api.postman}
                            <a href={api.postman} style="text-decoration: none; padding: 10px 15px; background-color: #ff6c37; color: white; border-radius: 5px; font-weight: bold; font-size: 14px; display: inline-flex; align-items: center;">
                                📙 POSTMAN
                            </a>
                        {/if}

                    </div>
                </li>
            {/each}
        </ul>
    </div>
</div>