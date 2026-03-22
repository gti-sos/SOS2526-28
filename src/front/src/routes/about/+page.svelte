<script>
    // Definimos los datos del equipo para generarlos con Svelte
    const teamMembers = [
        {
            name: "Alberto Jiménez Mateos",
            github: "https://github.com/AlbertoJimenezMateos"
        },
        {
            name: "Jorge Dayoub Dayoub",
            github: "https://github.com/jorgedx2"
        },
        {
            name: "Muhammad Zhillan Averous",
            github: "https://github.com/zaverous"
        }
    ];

    const apiLinks = [
        { name: "API Alberto", url: "/api/v1/beneficial-ownership-merchant-fleets" },
        { name: "API Jorge", url: "/api/v1/deliberate-violence-against-civilians-events-worldwide" },
        { name: "API Zhillan", url: "/api/v1/company-esg-scores-financial-performances" }
    ];
</script>

<svelte:head>
    <title>About - SOS2526-28</title>
</svelte:head>

<div class="container">
    <h1>ℹ️ ABOUT</h1>
    
    <div class="endpoint-group">
        <h3>👥 TEAM</h3>
        <ul class="api-list">
            {#each teamMembers as member}
                <li class="api-item">
                    <span class="api-title">{member.name}</span>
                    <a href={member.github} target="_blank" rel="noopener noreferrer">{member.github}</a>
                </li>
            {/each}
        </ul>
    </div>

    <div class="endpoint-group">
        <h3>📝 PROJECT DESCRIPTION</h3>
        <div class="api-item">
            <p>Our sources of information are a jumble of unrelated data; our intention will be to find a connection between the three data sources.</p>
        </div>
    </div>

    <div class="endpoint-group">
        <h3>🔗 LINKS & APIs</h3>
        <ul class="api-list">
            <li class="api-item">
                <span class="api-title">Repository</span>
                <a href="https://github.com/gti-sos/SOS2526-28" target="_blank" rel="noopener noreferrer">gti-sos/SOS2526-28</a>
            </li>
            <li class="api-item">
                <span class="api-title">Deployment URL</span>
                <a href="https://sos2526-28.onrender.com" target="_blank" rel="noopener noreferrer">https://sos2526-28.onrender.com</a>
            </li>
            
            {#each apiLinks as api}
                <li class="api-item">
                    <span class="api-title">{api.name}</span>
                    <a href={api.url} target="_blank" rel="noopener noreferrer">https://sos2526-28.onrender.com{api.url}</a>
                </li>
            {/each}
        </ul>
    </div>

</div>