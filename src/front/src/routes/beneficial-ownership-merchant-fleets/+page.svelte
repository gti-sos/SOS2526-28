<script>
    import { onMount } from 'svelte';

    // MAGIA DE SVELTE 5: Todas las variables que cambian la pantalla llevan $state()
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

    //const API_URL = "http://localhost:3000/api/v1/beneficial-ownership-merchant-fleets";
    const API_URL = "/api/v1/beneficial-ownership-merchant-fleets";

    // GET: Obtener datos
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

    // BOTÓN: Cargar datos iniciales
    async function loadInitialData() {
        try {
            const res = await fetch(API_URL + "/loadInitialData");
            if (res.ok) {
                successMsg = "✅ Datos iniciales cargados con éxito.";
                errorMsg = "";
                getFleets(); // Recargar la tabla automáticamente
            } else {
                errorMsg = "Error al cargar datos iniciales.";
            }
        } catch (error) {
            errorMsg = "Error de conexión.";
        }
        setTimeout(() => successMsg = "", 3000); // El mensaje desaparece a los 3 seg
    }

    // BOTÓN: Borrar todos los datos
    async function deleteAll() {
        if(confirm("¿Estás seguro de que quieres borrar TODOS los datos?")) {
            try {
                const res = await fetch(API_URL, { method: "DELETE" });
                if (res.ok) {
                    successMsg = "✅ Todos los datos han sido borrados.";
                    errorMsg = "";
                    getFleets(); // Recargar la tabla
                } else {
                    errorMsg = "Error al borrar los datos.";
                }
            } catch (error) {
                errorMsg = "Error de conexión.";
            }
            setTimeout(() => successMsg = "", 3000);
        }
    }

    // FORMULARIO: Crear un nuevo registro (POST)
    async function createFleet() {
        // Validar que no haya campos vacíos
        if (!newYear || !newFlag || !newOwner || !newShips || !newTons || !newPercent) {
            errorMsg = "⚠️ Por favor, rellena todos los campos.";
            setTimeout(() => errorMsg = "", 3000);
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
                getFleets(); // Recargar tabla
                
                // Limpiar formulario
                newYear = ""; newFlag = ""; newOwner = ""; newShips = ""; newTons = ""; newPercent = "";
            } else if (res.status === 409) {
                errorMsg = "⚠️ Error: El recurso ya existe (Conflicto).";
            } else {
                errorMsg = "Error al crear el recurso.";
            }
        } catch (error) {
            errorMsg = "Error de conexión.";
        }
        setTimeout(() => successMsg = "", 3000);
    }

    onMount(() => {
        getFleets();
    });
</script>

<div class="container" style="max-width: 1100px;"> 
    <h1>🚢 Beneficial Ownership Merchant Fleets</h1>

    {#if errorMsg}
        <div style="color: #b91c1c; margin-bottom: 15px; background: #fee2e2; padding: 10px; border-radius: 6px; font-weight: bold;">
            {errorMsg}
        </div>
    {/if}
    {#if successMsg}
        <div style="color: #15803d; margin-bottom: 15px; background: #dcfce7; padding: 10px; border-radius: 6px; font-weight: bold;">
            {successMsg}
        </div>
    {/if}

    <div class="endpoint-group" style="background: var(--bg-color); padding: 20px; border-radius: 8px; border: 1px solid var(--border-color);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3>➕ Añadir Nuevo Registro</h3>
            <div>
                <button on:click={loadInitialData} class="action-btn load-btn">Cargar Datos Iniciales</button>
                <button on:click={deleteAll} class="action-btn delete-btn">Borrar Todos</button>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
            <input type="number" bind:value={newYear} placeholder="Año" class="form-input">
            <input type="text" bind:value={newFlag} placeholder="País Registro" class="form-input">
            <input type="text" bind:value={newOwner} placeholder="País Propietario" class="form-input">
            <input type="number" bind:value={newShips} placeholder="Nº Naves" class="form-input">
            <input type="number" step="0.01" bind:value={newTons} placeholder="Peso (tons)" class="form-input">
            <input type="number" step="0.001" bind:value={newPercent} placeholder="% Total" class="form-input">
            <button on:click={createFleet} class="action-btn create-btn">Añadir</button>
        </div>
    </div>

    <div class="endpoint-group">
        <h3>📊 Listado de Flotas Registradas</h3>
        
        <div style="overflow-x: auto;">
            <table style="width: 100%; text-align: left; border-collapse: collapse; margin-top: 15px;">
                <thead>
                    <tr style="background-color: var(--primary-color); color: white;">
                        <th style="padding: 12px; border-radius: 8px 0 0 0;">Año</th>
                        <th style="padding: 12px;">País de Registro</th>
                        <th style="padding: 12px;">País Propietario</th>
                        <th style="padding: 12px;">Nº Naves</th>
                        <th style="padding: 12px;">Peso (tons)</th>
                        <th style="padding: 12px; border-radius: 0 8px 0 0;">% Total</th>
                    </tr>
                </thead>
                <tbody>
                    {#if fleets.length === 0}
                        <tr>
                            <td colspan="6" style="text-align: center; padding: 20px;">No hay datos disponibles en la base de datos.</td>
                        </tr>
                    {:else}
                        {#each fleets as fleet}
                            <tr style="border-bottom: 1px solid var(--border-color);">
                                <td style="padding: 12px;">{fleet.year}</td>
                                <td style="padding: 12px;">{fleet.flag_of_registration_label}</td>
                                <td style="padding: 12px;">{fleet.beneficial_ownership_label}</td>
                                <td style="padding: 12px; font-weight: bold;">{fleet.number_of_ships}</td>
                                <td style="padding: 12px;">{fleet.dead_weight_tons}</td>
                                <td style="padding: 12px;">{fleet.percentage_of_total_fleet}%</td>
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
    }
</style>