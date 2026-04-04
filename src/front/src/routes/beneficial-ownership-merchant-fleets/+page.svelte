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

    // Variables para el Buscador GET
    let searchYear = $state("");
    let searchFlag = $state("");
    let searchOwner = $state("");

    //const API_URL = "http://localhost:3000/api/v1/beneficial-ownership-merchant-fleets";
    const API_URL = "/api/v1/beneficial-ownership-merchant-fleets";

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
        setTimeout(() => successMsg = "", 5000); // El mensaje desaparece a los 5 seg
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
        // Valida que no haya campos vacíos
        if (!newYear || !newFlag || !newOwner || !newShips || !newTons || !newPercent) {
            errorMsg = "⚠️ Error (400 Bad Request): Por favor, rellena todos los campos.";
            setTimeout(() => errorMsg = "", 5000);
            return;
        }

        // Valida que los países no sean números puros
        if (!isNaN(Number(newFlag)) || !isNaN(Number(newOwner))) {
            errorMsg = "⚠️ Error (400 Bad Request): Los nombres de los países no pueden ser números.";
            setTimeout(() => errorMsg = "", 5000);
            return;
        }

        // Valida que los campos numéricos sean realmente números
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
                getFleets(); // Recarga la tabla
                
                // Limpia el formulario
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
    /**
     * @param {number|string} year
     * @param {string} flag
     * @param {string} owner
     */
    async function deleteFleet(year, flag, owner) {
        if(confirm(`¿Estás seguro de que quieres borrar el registro de ${flag} en ${year} cuyo país propietario es ${owner}?`)) {
            try {
                // Monta la URL exacta con las claves primarias
                const res = await fetch(`${API_URL}/${year}/${flag}/${owner}`, { 
                    method: "DELETE" 
                });
                
                if (res.ok) {
                    successMsg = "✅ Recurso borrado correctamente.";
                    errorMsg = "";
                    getFleets(); // Recarga la tabla para que desaparezca
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

    // GET RECURSO CONCRETO (BUSCADOR)
    async function searchFleet() {
        if (!searchYear || !searchFlag || !searchOwner) {
            errorMsg = "⚠️ Introduce Año, País de Registro y País Propietario para buscar.";
            setTimeout(() => errorMsg = "", 5000);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/${searchYear}/${searchFlag}/${searchOwner}`);
            if (res.ok) {
                const data = await res.json();
                // IMPORTANTE: Meto el objeto entre corchetes [data] para convertirlo en un array de 1 elemento y que la tabla no se rompa
                fleets = [data]; 
                successMsg = "✅ Recurso encontrado.";
                errorMsg = "";
            } else if (res.status === 404) {
                fleets = []; // Vacia la tabla porque no hay nada
                errorMsg = "⚠️ No se encontró ningún recurso con esos datos.";
            } else {
                errorMsg = "Error al buscar el recurso.";
            }
        } catch (error) {
            errorMsg = "Error de conexión.";
        }
        setTimeout(() => successMsg = "", 5000);
    }

    // BOTÓN (LIMPIA LA BÚSQUEDA Y VUELVE A VER TODOS)
    function clearSearch() {
        searchYear = "";
        searchFlag = "";
        searchOwner = "";
        getFleets(); // Vuelvo a pedir todos los datos al backend
    }

    onMount(() => {
        getFleets();
    });
</script>

<div class="container" style="max-width: 1100px;">

    <h1 data-testid="main-title">🚢 FLOTA MERCANTE POR PAÍS DE BENEFICIARIO EFECTIVO</h1>

    {#if errorMsg || successMsg}
        <div data-testid="alert-message" style="padding: 15px; border-radius: 8px; margin-bottom: 20px; font-weight: bold; font-size: 1.1em; text-align: center; border: 2px solid; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); transition: all 0.3s ease;
            {errorMsg ? 'background-color: #fee2e2; color: #991b1b; border-color: #f87171;' : 'background-color: #dcfce7; color: #166534; border-color: #4ade80;'}">
            
            {#if errorMsg}
                {errorMsg}
            {/if}
            
            {#if successMsg}
                {successMsg}
            {/if}
            
        </div>
    {/if}
    <div class="endpoint-group" style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0; color: #1e293b;">📙 DOCUMENTACIÓN DE POSTMAN</h3>
        <a href="/beneficial-ownership-merchant-fleets/postman" style="text-decoration: none; padding: 8px 15px; background-color: #ff6c37; color: white; border-radius: 5px; font-weight: bold; display: inline-flex; align-items: center;">
            📙 DOCUMENTACIÓN
        </a>
    </div>

    <div class="endpoint-group" style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0; color: #1e293b;">⚙️ GESTIÓN DE LA BASE DE DATOS</h3>
        <div style="display: flex; gap: 10px;">
            <button data-testid="load-data-btn" onclick={loadInitialData} style="padding: 8px 15px; background-color: #2563eb; color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center;">
                📥 CARGAR DATOS INICIALES
            </button>
            <button data-testid="delete-all-btn" onclick={deleteAll} style="padding: 8px 15px; background-color: #dc2626; color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center;">
                🗑️ BORRAR TODOS
            </button>
        </div>
    </div>

    <div class="endpoint-group" style="background: var(--bg-color); padding: 20px; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 20px;">
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3 style="margin: 0; color: #1e293b;">➕ AÑADIR NUEVO REGISTRO</h3>
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
        <h3 style="margin-top: 0; color: #1e293b;">🔍 BUSCAR RECURSO CONCRETO</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
            <input data-testid="search-year" type="number" bind:value={searchYear} placeholder="Año a buscar" class="form-input">
            <input data-testid="search-flag" type="text" bind:value={searchFlag} placeholder="País Registro" class="form-input">
            <input data-testid="search-owner" type="text" bind:value={searchOwner} placeholder="País Propietario" class="form-input">
            <button data-testid="search-btn" onclick={searchFleet} class="action-btn" style="background-color: #8b5cf6;">🔍 BUSCAR</button>
            <button data-testid="clear-search-btn" onclick={clearSearch} class="action-btn" style="background-color: #64748b;padding: 8px 5px;">🔄 LIMPIAR / VER TODOS</button>
        </div>
    </div>

    <div class="endpoint-group">
        <h3>📊 LISTADO DE FLOTAS REGISTRADAS</h3>
        
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
                                No hay datos disponibles en la base de datos.
                            </td>
                        </tr>
                    {:else}
                        {#each fleets as fleet}
                            <tr data-testid={`row-${fleet.year}-${fleet.flag_of_registration_label}`} style="border-bottom: 1px solid var(--border-color);">
                                <td style="padding: 12px;">{fleet.year}</td>
                                <td style="padding: 12px;">{fleet.flag_of_registration_label}</td>
                                <td style="padding: 12px;">{fleet.beneficial_ownership_label}</td>
                                <td style="padding: 12px; font-weight: bold;">{fleet.number_of_ships}</td>
                                <td style="padding: 12px;">{fleet.dead_weight_tons}</td>
                                <td style="padding: 12px;">{fleet.percentage_of_total_fleet}%</td>
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