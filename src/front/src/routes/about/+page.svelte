<script>
    // Datos equipo
    const teamMembers = [
        {
            name: "ALBERTO JIMÉNEZ MATEOS",
            github: "https://github.com/AlbertoJimenezMateos"
        },
        {
            name: "JORGE DAYOUB DAYOUB",
            github: "https://github.com/jorgedx2"
        },
        {
            name: "MUHAMMAD ZHILLAN AVEROUS",
            github: "https://github.com/zaverous"
        }
    ];

    const apiLinks = [
        { name: "API ALBERTO  ", // <--(beneficial-ownership-merchant-fleets)
        url: "/api/v1/beneficial-ownership-merchant-fleets",
        fuente: " (FLOTA MERCANTE POR PAÍS DE BENEFICIARIO EFECTIVO)", 
        urlFuente: "https://unctadstat.unctad.org/datacentre/reportInfo/US.FleetBeneficialOwners"},

        { name: "API JORGE  ", // <--(deliberate-violence-against-civilians-events-worldwide)
        url: "/api/v1/deliberate-violence-against-civilians-events-worldwide", 
        fuente: " (GRUPO DE TRABAJO SOBRE INESTABILIDAD POLÍTICA ATROCIDADES EN TODO EL MUNDO)", 
        urlFuente: "https://parusanalytics.com/eventdata/data.dir/atrocities.html"},

        { name: "API ZHILLAN  ", // <--(company-esg-scores-financial-performances)
        url: "/api/v1/company-esg-scores-financial-performances", 
        fuente: " (CONJUNTO DE DATOS SOBRE ESG Y DESEMPEÑO FINANCIERO)", 
        urlFuente: "https://www.kaggle.com/datasets/shriyashjagtap/esg-and-financial-performance-dataset?resource=download&select=company_esg_financial_dataset.csv"}
    ];
</script>

<svelte:head>
    <title>About - SOS2526-28</title>
</svelte:head>

<div class="container" style="max-width: 900px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
    <h1 style="border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">ℹ️ NOSOTROS SOS2526-28</h1>
    
    <div style="background: #e0f2fe; border-left: 5px solid #0ea5e9; padding: 20px; border-radius: 4px; margin-bottom: 30px; margin-top: 20px;">
        <h3 style="margin-top: 0; color: #0369a1;">📝 DESCRIPCIÓN DEL PROYECTO</h3>
        <p style="color: #0c4a6e; font-size: 1.1em; margin-bottom: 0;">
            Nuestras fuentes de información son un revoltijo de datos inconexos; nuestra intención será encontrar una conexión entre las tres fuentes de datos.
        </p>
    </div>

    <div style="margin-bottom: 40px;">
        <h3 style="color: #334155;">👥 EQUIPO</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
            {#each teamMembers as member}
                <div style="border: 1px solid #cbd5e1; padding: 20px; border-radius: 8px; background: #f8fafc; text-align: center;">
                    <h5 style="margin-top: 0; color: #1e293b; font-size: 0.9em;">{member.name}</h5>
                    <a href={member.github} target="_blank" rel="noopener noreferrer" style="text-decoration: none; padding: 8px 15px; background-color: #24292e; color: white; border-radius: 5px; font-weight: bold; font-size: 14px; display: inline-block; margin-top: 10px;">
                        🐙 PERFIL DE GITHUB
                    </a>
                </div>
            {/each}
        </div>
    </div>

    <div style="margin-bottom: 40px;">
        <h3 style="color: #334155;">🔗 ENLACES</h3>
        <div style="display: flex; gap: 15px; flex-wrap: wrap;">
            <a href="https://github.com/gti-sos/SOS2526-28" target="_blank" rel="noopener noreferrer" style="text-decoration: none; padding: 12px 20px; background-color: #333; color: white; border-radius: 5px; font-weight: bold; font-size: 15px; display: inline-flex; align-items: center;">
                📁 REPOSITORIO GITHUB
            </a>
            <a href="https://sos2526-28.onrender.com" target="_blank" rel="noopener noreferrer" style="text-decoration: none; padding: 12px 20px; background-color: #8b5cf6; color: white; border-radius: 5px; font-weight: bold; font-size: 15px; display: inline-flex; align-items: center;">
                🌐 URL DE DESPLIEGUE
            </a>
        </div>
    </div>

    <div>
        <h3 style="color: #334155;">📊 APIs & FUENTES DE DATOS</h3>
        <ul style="list-style-type: none; padding: 0;">
            {#each apiLinks as api}
                <li style="border: 1px solid #cbd5e1; padding: 20px; margin-bottom: 20px; border-radius: 8px; background: #f8fafc;">
                    <h3 style="margin-top: 0; color: #1e293b; font-size: 1.2em;">{api.name}{api.fuente}</h3>
                    <!--
                    <p style="color: #64748b; font-weight: bold; margin-bottom: 15px;">{api.fuente}</p>
                    -->
                    
                    <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                        <a href={api.url} target="_blank" rel="noopener noreferrer" style="text-decoration: none; padding: 10px 15px; background-color: #10b981; color: white; border-radius: 5px; font-weight: bold; font-size: 14px; display: inline-flex; align-items: center;">
                            ⚙️ VER API (JSON)
                        </a>
                        <a href={api.urlFuente} target="_blank" rel="noopener noreferrer" style="text-decoration: none; padding: 10px 15px; background-color: #f97316; color: white; border-radius: 5px; font-weight: bold; font-size: 14px; display: inline-flex; align-items: center;">
                            📈 VER FUENTE DATOS
                        </a>
                    </div>
                </li>
            {/each}
        </ul>
    </div>
</div>