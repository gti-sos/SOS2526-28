<script>
    import { onMount } from 'svelte';

    // Todas las variables que cambian la pantalla llevan $state()
    /** @type {any[]} */
    let fleets = $state([]);
    let errorMsg = $state("");
    let successMsg = $state("");

    // Variables para el formulario POST
    let newYear = $state("");
    let newFlag = $state("");
    let newOwner = $state("");
    let newShips = $state("");
    let newTons = $state("");
    let newPercent = $state("");

    // Nuevas Variables para el Buscador GET (Avanzado y por Rangos)
    let searchFlag = $state("");
    let searchOwner = $state("");
    let searchYearMin = $state("");
    let searchYearMax = $state("");
    let searchShipsMin = $state("");
    let searchShipsMax = $state("");
    let searchTonsMin = $state("");
    let searchTonsMax = $state("");
    let searchPercentMin = $state("");
    let searchPercentMax = $state("");

    //const API_URL = "http://localhost:3000/api/v2/beneficial-ownership-merchant-fleets";
    const API_URL = "/api/v2/beneficial-ownership-merchant-fleets";

    // GET (OBTENGO TODOS LOS DATOS)
    async function getFleets() {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                fleets = await response.json();
                errorMsg = "";
            } else {
                errorMsg = "Error al cargar los datos. Código: " + response.status;
            }
        } catch (error) {
            errorMsg = "No se pudo conectar con la API.";
        }
    }

    // BOTÓN (CARGAR DATOS INICIALES)
    async function loadInitialData() {
        try {
            const res = await fetch(API_URL + "/loadInitialData");
            if (res.ok) {
                successMsg = "✅ Datos iniciales cargados con éxito.";
                errorMsg = "";
                getFleets(); // Recarga la tabla automáticamente
            } else {
                errorMsg = "Error al cargar datos iniciales.";
            }
        } catch (error) {
            errorMsg = "Error de conexión.";
        }
        setTimeout(() => successMsg = "", 5000);
    }

    // BOTÓN (BORRAR TODOS LOS DATOS)
    async function deleteAll() {
        if(confirm("¿Estás seguro de que quieres borrar TODOS los datos?")) {
            try {
                const res = await fetch(API_URL, { method: "DELETE" });
                if (res.ok) {
                    successMsg = "✅ Todos los datos han sido borrados.";
                    errorMsg = "";
                    getFleets(); // Recarga la tabla
                } else {
                    errorMsg = "Error al borrar los datos.";
                }
            } catch (error) {
                errorMsg = "Error de conexión.";
            }
            setTimeout(() => successMsg = "", 5000);
        }
    }

    // POST (FORMULARIO QUE CREA UN NUEVO REGISTRO)
    async function createFleet() {
        if (!newYear || !newFlag || !newOwner || !newShips || !newTons || !newPercent) {
            errorMsg = "⚠️ Error (400 Bad Request): Por favor, rellena todos los campos.";
            setTimeout(() => errorMsg = "", 5000);
            return;
        }

        if (!isNaN(Number(newFlag)) || !isNaN(Number(newOwner))) {
            errorMsg = "⚠️ Error (400 Bad Request): Los nombres de los países no pueden ser números.";
            setTimeout(() => errorMsg = "", 5000);
            return;
        }

        if (isNaN(Number(newYear)) || isNaN(Number(newShips)) || isNaN(Number(newTons)) || isNaN(Number(newPercent))) {
            errorMsg = "⚠️ Error (400 Bad Request): El Año, Nº de Naves, Peso y % Total deben ser números válidos.";
            setTimeout(() => errorMsg = "", 5000);
            return;
        }

        const newDato = {
            year: parseInt(newYear),
            flag_of_registration_label: newFlag,
            beneficial_ownership_label: newOwner,
            number_of_ships: parseInt(newShips),
            dead_weight_tons: parseFloat(newTons),
            percentage_of_total_fleet: parseFloat(newPercent)
        };

        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newDato)
            });

            if (res.status === 201) {
                successMsg = "✅ Recurso creado correctamente.";
                errorMsg = "";
                getFleets();
                newYear = ""; newFlag = ""; newOwner = ""; newShips = ""; newTons = ""; newPercent = "";
            } else if (res.status === 409) {
                errorMsg = "⚠️ Error: El recurso ya existe (Conflicto).";
            } else {
                errorMsg = "Error al crear el recurso.";
            }
        } catch (error) {
            errorMsg = "Error de conexión.";
        }
        setTimeout(() => successMsg = "", 5000);
    }

    // DELETE ESPECÍFICO (BOTÓN PARA BORRAR UN RECURSO CONCRETO)
    async function deleteFleet(year, flag, owner) {
        if(confirm(`¿Estás seguro de que quieres borrar el registro de ${flag} en ${year} cuyo país propietario es ${owner}?`)) {
            try {
                const res = await fetch(`${API_URL}/${year}/${flag}/${owner}`, { 
                    method: "DELETE" 
                });
                
                if (res.ok) {
                    successMsg = "✅ Recurso borrado correctamente.";
                    errorMsg = "";
                    getFleets(); 
                } else if (res.status === 404) {
                    errorMsg = "⚠️ Error: El recurso que intentas borrar no existe.";
                } else {
                    errorMsg = "Error al borrar el recurso concreto.";
                }
            } catch (error) {
                errorMsg = "Error de conexión con el servidor.";
            }
            setTimeout(() => successMsg = "", 5000);
        }
    }

    // GET BUSCADOR MULTICAMPO Y POR RANGOS (NUEVA LÓGICA)
    async function searchFleet() {
        try {
            // 1. Mandamos las búsquedas de texto a la API mediante Query Parameters
            let queryParams = [];
            if (searchFlag) queryParams.push(`flag_of_registration_label=${encodeURIComponent(searchFlag)}`);
            if (searchOwner) queryParams.push(`beneficial_ownership_label=${encodeURIComponent(searchOwner)}`);
            
            let url = API_URL;
            if (queryParams.length > 0) {
                url += "?" + queryParams.join("&");
            }

            const res = await fetch(url);
            if (res.ok) {
                let data = await res.json();
                
                // Por si la API devuelve un solo objeto en vez de un array
                if (!Array.isArray(data)) data = [data];

                // 2. Filtramos localmente por los rangos numéricos si el usuario los ha rellenado
                if (searchYearMin !== "") data = data.filter(d => d.year >= Number(searchYearMin));
                if (searchYearMax !== "") data = data.filter(d => d.year <= Number(searchYearMax));
                
                if (searchShipsMin !== "") data = data.filter(d => d.number_of_ships >= Number(searchShipsMin));
                if (searchShipsMax !== "") data = data.filter(d => d.number_of_ships <= Number(searchShipsMax));
                
                if (searchTonsMin !== "") data = data.filter(d => d.dead_weight_tons >= Number(searchTonsMin));
                if (searchTonsMax !== "") data = data.filter(d => d.dead_weight_tons <= Number(searchTonsMax));
                
                if (searchPercentMin !== "") data = data.filter(d => d.percentage_of_total_fleet >= Number(searchPercentMin));
                if (searchPercentMax !== "") data = data.filter(d => d.percentage_of_total_fleet <= Number(searchPercentMax));

                fleets = data; // Actualizamos la tabla
                
                if (fleets.length > 0) {
                    successMsg = "✅ Recurso encontrado.";
                    errorMsg = "";
                } else {
                    errorMsg = "⚠️ No se encontró ningún recurso con esos filtros.";
                    successMsg = "";
                }
            } else {
                errorMsg = "Error al buscar el recurso en la base de datos.";
            }
        } catch (error) {
            errorMsg = "Error de conexión.";
        }
        setTimeout(() => { successMsg = ""; errorMsg = ""; }, 5000);
    }

    // BOTÓN (LIMPIA LA BÚSQUEDA Y VUELVE A VER TODOS)
    function clearSearch() {
        searchFlag = ""; searchOwner = "";
        searchYearMin = ""; searchYearMax = "";
        searchShipsMin = ""; searchShipsMax = "";
        searchTonsMin = ""; searchTonsMax = "";
        searchPercentMin = ""; searchPercentMax = "";
        getFleets(); // Vuelvo a pedir todos los datos limpios
    }

    onMount(() => {
        getFleets();
    });
</script>

<div class="container" style="max-width: 1100px;">

    <h1 data-testid="main-title">🚢 FLOTA MERCANTE POR PAÍS DE BENEFICIARIO EFECTIVO (v2)</h1>

    {#if errorMsg || successMsg}
        <div data-testid="alert-message" style="padding: 15px; border-radius: 8px; margin-bottom: 20px; font-weight: bold; font-size: 1.1em; text-align: center; border: 2px solid; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); transition: all 0.3s ease;
            {errorMsg ? 'background-color: #fee2e2; color: #991b1b; border-color: #f87171;' : 'background-color: #dcfce7; color: #166534; border-color: #4ade80;'}">
            
            {#if errorMsg}{errorMsg}{/if}
            {#if successMsg}{successMsg}{/if}
            
        </div>
    {/if}

    <div class="endpoint-group" style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0; color: #1e293b;">📈 VISUALIZACIÓN GRÁFICA (v2)</h3>
        <div>
            <a href="/analytics/beneficial-ownership-merchant-fleets/v2" style="text-decoration: none; padding: 8px 15px; background-color: #4a0487; color: white; border-radius: 5px; font-weight: bold; font-size: 14px; display: inline-flex; align-items: center; box-shadow: 0 4px 6px rgba(168, 85, 247, 0.2);">
            📈 GRÁFICA (v2)
        </a>
        <a href="/analytics/beneficial-ownership-merchant-fleets/map/v2" style="text-decoration: none; padding: 8px 15px; background-color: #4a0487; color: white; border-radius: 5px; font-weight: bold; font-size: 14px; display: inline-flex; align-items: center; box-shadow: 0 4px 6px rgba(168, 85, 247, 0.2);">
            🌏 VISUALIZACIÓN GEOSPACIAL (v2)
        </a>
        </div>
    </div>

    <div class="endpoint-group" style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0; color: #1e293b;">🔗 INTEGRACIONES Y USO DE APIs</h3>
        <a href="/integrations" style="text-decoration: none; padding: 8px 15px; background-color: #f59e0b; color: white; border-radius: 5px; font-weight: bold; font-size: 14px; display: inline-flex; align-items: center;">
            🔌 INTEGRACIONES 
        </a>
    </div>

    <div class="endpoint-group" style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0; color: #1e293b;">📙 DOCUMENTACIÓN DE POSTMAN</h3>
        <a href="/beneficial-ownership-merchant-fleets/postman" style="text-decoration: none; padding: 8px 15px; background-color: #ff6c37; color: white; border-radius: 5px; font-weight: bold; font-size: 14px; display: inline-flex; align-items: center;">
            📙 DOCUMENTACIÓN 
        </a>
    </div>

    <div class="endpoint-group" style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
    
    <!-- PRIMERA LÍNEA: Título a la izquierda y botones a la derecha -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h3 style="margin: 0; color: #1e293b;">⚙️ GESTIÓN DE LA BASE DE DATOS (v2)</h3>
        
        <div style="display: flex; gap: 10px;">
            <button data-testid="load-data-btn" onclick={loadInitialData} style="padding: 8px 15px; background-color: #2563eb; color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center;">
                📥 CARGAR DATOS INICIALES
            </button>
            <button data-testid="delete-all-btn" onclick={deleteAll} style="padding: 8px 15px; background-color: #dc2626; color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center;">
                🗑️ BORRAR TODOS
            </button>
        </div>
    </div>

    <!-- SEGUNDA LÍNEA: Mensaje de aviso -->
    <h4 style="margin: 0; color: #475569; font-weight: normal;">
        <strong>IMPORTANTE:</strong> Esta base de datos es estable, por lo que desde el inicio del servidor, los datos van a estar cargados.
    </h4>
    
</div>

    <div class="endpoint-group" style="background: var(--bg-color); padding: 20px; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 20px;">
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3 style="margin: 0; color: #1e293b;">➕ AÑADIR NUEVO RECURSO (v2)</h3>
            <button data-testid="create-btn" onclick={createFleet} class="action-btn create-btn" style="padding: 8px 15px; background-color: #16a34a; color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center;">
                ➕ AÑADIR
            </button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
            <input data-testid="create-year" type="number" bind:value={newYear} placeholder="Año" class="form-input">
            <input data-testid="create-flag" type="text" bind:value={newFlag} placeholder="País Registro" class="form-input">
            <input data-testid="create-owner" type="text" bind:value={newOwner} placeholder="País Propietario" class="form-input">
            <input data-testid="create-ships" type="number" bind:value={newShips} placeholder="Nº Naves" class="form-input">
            <input data-testid="create-tons" type="number" step="0.01" bind:value={newTons} placeholder="Peso (tons)" class="form-input">
            <input data-testid="create-percent" type="number" step="0.001" bind:value={newPercent} placeholder="% Total" class="form-input">
        </div>
        
    </div>

    <div class="endpoint-group" style="background: var(--bg-color); padding: 20px; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 20px;">
        <h3 style="margin-top: 0; color: #1e293b; margin-bottom: 15px;">🔍 BUSCADOR</h3>
        <h4 style="margin-top: 0; color: #1e293b; margin-bottom: 15px;">Si necesita buscar un determinado año/ nº naves / peso / %total, debe marcar ambas casillas con el valor deseado.</h4>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
            <div>
                <label style="font-weight: bold; font-size: 12px; color: #475569;">País Registro</label>
                <input data-testid="search-flag" type="text" bind:value={searchFlag} placeholder="Ej: Antigua and Barbuda" class="form-input" style="margin-top: 5px;">
            </div>
            <div>
                <label style="font-weight: bold; font-size: 12px; color: #475569;">País Propietario</label>
                <input data-testid="search-owner" type="text" bind:value={searchOwner} placeholder="Ej: Germany" class="form-input" style="margin-top: 5px;">
            </div>
            
            <div>
                <label style="font-weight: bold; font-size: 12px; color: #475569;">Año (Rango)</label>
                <div style="display: flex; gap: 5px; margin-top: 5px;">
                    <input data-testid="search-year" type="number" bind:value={searchYearMin} placeholder="Mín" class="form-input">
                    <input type="number" bind:value={searchYearMax} placeholder="Máx" class="form-input">
                </div>
            </div>

            <div>
                <label style="font-weight: bold; font-size: 12px; color: #475569;">Nº Naves (Rango)</label>
                <div style="display: flex; gap: 5px; margin-top: 5px;">
                    <input type="number" bind:value={searchShipsMin} placeholder="Mín" class="form-input">
                    <input type="number" bind:value={searchShipsMax} placeholder="Máx" class="form-input">
                </div>
            </div>

            <div>
                <label style="font-weight: bold; font-size: 12px; color: #475569;">Peso/Tons (Rango)</label>
                <div style="display: flex; gap: 5px; margin-top: 5px;">
                    <input type="number" bind:value={searchTonsMin} placeholder="Mín" class="form-input">
                    <input type="number" bind:value={searchTonsMax} placeholder="Máx" class="form-input">
                </div>
            </div>

            <div>
                <label style="font-weight: bold; font-size: 12px; color: #475569;">% Total (Rango)</label>
                <div style="display: flex; gap: 5px; margin-top: 5px;">
                    <input type="number" bind:value={searchPercentMin} placeholder="Mín" class="form-input">
                    <input type="number" bind:value={searchPercentMax} placeholder="Máx" class="form-input">
                </div>
            </div>
        </div>

        <div style="display: flex; gap: 10px; justify-content: right;">
            <button data-testid="search-btn" onclick={searchFleet} class="action-btn" style="background-color: #8b5cf6; padding: 10px 30px; font-size: 15px;">🔍 APLICAR FILTROS</button>
            <button data-testid="clear-search-btn" onclick={clearSearch} class="action-btn" style="background-color: #64748b; padding: 10px 30px; font-size: 15px;">🔄 LIMPIAR</button>
        </div>
    </div>

    <div class="endpoint-group">
        <h3>📊 LISTADO DE FLOTAS REGISTRADAS (v2)</h3>
        
        <div style="overflow-x: auto;">
            <table data-testid="data-table" style="width: 100%; text-align: left; border-collapse: collapse; margin-top: 15px;">
                <thead>
                    <tr style="background-color: var(--primary-color); color: white; text-align: center;">
                        <th style="padding: 12px; border-radius: 8px 0 0 0;">Año</th>
                        <th style="padding: 12px;">País de Registro</th>
                        <th style="padding: 12px;">País Propietario</th>
                        <th style="padding: 12px;">Nº Naves</th>
                        <th style="padding: 12px;">Peso (tons)</th>
                        <th style="padding: 12px;">% Total</th>
                        <th style="padding: 12px; border-radius: 0 8px 0 0;">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {#if fleets.length === 0}
                        <tr data-testid="empty-row">
                            <td colspan="7" style="text-align: center; padding: 20px; font-weight: bold; color: #64748b;">
                                No hay datos disponibles.
                            </td>
                        </tr>
                    {:else}
                        {#each fleets as fleet}
                            <tr data-testid={`row-${fleet.year}-${fleet.flag_of_registration_label}`} style="border-bottom: 1px solid var(--border-color);">
                                <td style="padding: 12px; text-align: center;">{fleet.year}</td>
                                <td style="padding: 12px;">{fleet.flag_of_registration_label}</td>
                                <td style="padding: 12px;">{fleet.beneficial_ownership_label}</td>
                                <td style="padding: 12px; font-weight: bold; text-align: center;">{fleet.number_of_ships}</td>
                                <td style="padding: 12px; text-align: center;">{fleet.dead_weight_tons}</td>
                                <td style="padding: 12px; text-align: center;">{fleet.percentage_of_total_fleet}%</td>
                                <td style="padding: 12px; text-align: center; white-space: nowrap;">
                                    <a data-testid="edit-btn" href="/beneficial-ownership-merchant-fleets/{fleet.year}/{fleet.flag_of_registration_label}/{fleet.beneficial_ownership_label}" class="action-btn" style="background-color: #eab308; padding: 5px 10px; font-size: 0.9em; text-decoration: none; color: white; margin-right: 5px; display: inline-flex; align-items: center;">
                                        ✏️ EDITAR
                                    </a>
                                    <button data-testid="delete-single-btn" onclick={() => deleteFleet(fleet.year, fleet.flag_of_registration_label, fleet.beneficial_ownership_label)} class="action-btn delete-btn" style="padding: 5px 10px; font-size: 0.9em; display: inline-flex; align-items: center;">
                                        🗑️ BORRAR
                                    </button>
                                </td>
                            </tr>
                        {/each}
                    {/if}
                </tbody>
            </table>
        </div>
    </div>
</div>

<style>
    .action-btn {
        padding: 8px 15px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
        transition: opacity 0.2s;
        color: white;
    }
    .action-btn:hover { opacity: 0.8; }
    .load-btn { background-color: #2563eb; }
    .delete-btn { background-color: #dc2626; }
    .create-btn { background-color: #16a34a; }
    
    .form-input {
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        width: 100%;
        box-sizing: border-box; /* Asegura que el input no se desborde */
    }
</style>