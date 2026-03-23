<script>
    import { page } from '$app/stores';
    import { onMount } from 'svelte';

    // Captura de los datos de la URL
    let year = $page.params.year;
    let flag = $page.params.flag;
    let owner = $page.params.owner;

    // Variables de estado para los datos editables
    let newShips = $state("");
    let newTons = $state("");
    let newPercent = $state("");

    let errorMsg = $state("");
    let successMsg = $state("");

    // Ruta relativa por el proxy
    const API_URL = `/api/v1/beneficial-ownership-merchant-fleets/${year}/${flag}/${owner}`;

    // Al cargar la página, pido los datos actuales de este país
    async function getDato() {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                // Relleno los campos con los datos de la base de datos
                newShips = data.number_of_ships;
                newTons = data.dead_weight_tons;
                newPercent = data.percentage_of_total_fleet;
            } else {
                errorMsg = "Error al cargar los datos del recurso.";
            }
        } catch (error) {
            errorMsg = "Error de conexión con el servidor.";
        }
    }

    // PUT (BOTÓN DE GUARDAR)
    async function updateDato() {
        // Valida que no haya campos vacíos
        if (!newShips || !newTons || !newPercent) {
            errorMsg = "⚠️ Por favor, rellena todos los campos.";
            setTimeout(() => errorMsg = "", 3000);
            return;
        }

        // Valida que sean números
        if (isNaN(Number(newShips)) || isNaN(Number(newTons)) || isNaN(Number(newPercent))) {
            errorMsg = "⚠️ Error (400 Bad Request): Los campos editables deben ser números válidos.";
            setTimeout(() => errorMsg = "", 3000);
            return;
        }

        const updatedDato = {
            year: parseInt(year),
            flag_of_registration_label: flag,
            beneficial_ownership_label: owner,
            number_of_ships: parseInt(newShips),
            dead_weight_tons: parseFloat(newTons),
            percentage_of_total_fleet: parseFloat(newPercent)
        };

        try {
            const res = await fetch(API_URL, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedDato)
            });

            if (res.ok) {
                successMsg = "✅ Recurso actualizado correctamente.";
                errorMsg = "";
                // Redirigir de vuelta a la tabla principal tras 2 segundos
                setTimeout(() => {
                    window.location.href = "/beneficial-ownership-merchant-fleets";
                }, 2000);
            } else if (res.status === 400) {
                errorMsg = "⚠️ Error: Faltan campos o los datos no son válidos.";
            } else if (res.status === 404) {
                errorMsg = "⚠️ Error: El recurso no existe en la base de datos.";
            } else {
                errorMsg = "Error al actualizar el recurso.";
            }
        } catch (error) {
            errorMsg = "Error de conexión.";
        }
    }

    onMount(() => {
        getDato();
    });
</script>

<div class="container" style="max-width: 800px; margin: 0 auto; padding: 20px;">
    <h1>✏️ EDITAR REGISTRO DE FLOTA</h1>
    
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

    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
            <div>
                <label style="font-weight: bold;">Año:</label>
                <input type="text" value={year} disabled style="width: 100%; padding: 8px; background: #e2e8f0; border: 1px solid #cbd5e1; border-radius: 4px;">
            </div>
            <div>
                <label style="font-weight: bold;">País Registro:</label>
                <input type="text" value={flag} disabled style="width: 100%; padding: 8px; background: #e2e8f0; border: 1px solid #cbd5e1; border-radius: 4px;">
            </div>
            <div style="grid-column: span 2;">
                <label style="font-weight: bold;">País Propietario:</label>
                <input type="text" value={owner} disabled style="width: 100%; padding: 8px; background: #e2e8f0; border: 1px solid #cbd5e1; border-radius: 4px;">
            </div>

            <hr style="grid-column: span 2; border: 0; border-top: 1px solid #cbd5e1; margin: 10px 0;">

            <div>
                <label style="font-weight: bold; color: #2563eb;">Nº Naves:</label>
                <input type="number" bind:value={newShips} style="width: 100%; padding: 8px; border: 1px solid #94a3b8; border-radius: 4px;">
            </div>
            <div>
                <label style="font-weight: bold; color: #2563eb;">Peso (tons):</label>
                <input type="number" step="0.01" bind:value={newTons} style="width: 100%; padding: 8px; border: 1px solid #94a3b8; border-radius: 4px;">
            </div>
            <div style="grid-column: span 2;">
                <label style="font-weight: bold; color: #2563eb;">% Total de la flota:</label>
                <input type="number" step="0.001" bind:value={newPercent} style="width: 100%; padding: 8px; border: 1px solid #94a3b8; border-radius: 4px;">
            </div>
        </div>

        <div style="display: flex; justify-content: space-between;">
            <a href="/beneficial-ownership-merchant-fleets" style="text-decoration: none; padding: 10px 20px; background: #64748b; color: white; border-radius: 5px; font-weight: bold; font-size: 16px; display: flex; align-items: center;">
                ⬅️ VOLVER SIN GUARDAR
            </a>
            <button onclick={updateDato} style="padding: 10px 20px; background: #eab308; color: white; border: none; border-radius: 5px; font-weight: bold; font-size: 16px; cursor: pointer; display: flex; align-items: center;">
                💾 GUARDAR CAMBIOS
            </button>
        </div>
    </div>
</div>