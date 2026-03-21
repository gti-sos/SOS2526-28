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
            postman: "URL_DE_TU_POSTMAN" // <-- Sustituye esto
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
        <ul class="api-list">
            {#each apis as api}
                <li class="api-item">
                    <span class="api-title"><h3>{api.titulo}</h3></span>
                    <span class="api-title">DESARROLLADO POR: {api.nombre}</span>
                    <span class="api-title">RECURSO: {api.recurso}</span>
                    <br>
                    <span class="api-title">FRONT-END (SVELTE)</span>
                    <a href="/{api.recurso}">Ir a la aplicación de {api.nombre.split(' ')[0]}</a>
                    <br>
                    <span class="api-title">API (RENDER)</span>
                    <a href="/api/v1/{api.recurso}" target="_blank" rel="noopener noreferrer">/api/v1/{api.recurso}</a>
                    <br>
                    <span class="api-title">DOCUMENTACIÓN POSTMAN</span>
                    <a href={api.postman} target="_blank" rel="noopener noreferrer">Ver documentación en Postman</a>
                </li>
            {/each}
        </ul>
    </div>
</div>