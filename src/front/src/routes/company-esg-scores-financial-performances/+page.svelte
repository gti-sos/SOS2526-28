<script>
    import { onMount } from 'svelte';

    const API_URL = "/api/v1/company-esg-scores-financial-performances";

    let registros = $state([]);
    let errorMsg = $state("");
    let successMsg = $state("");

    // Campos del formulario de creación
    let f_company_id = $state("");
    let f_company_name = $state("");
    let f_industry = $state("");
    let f_region = $state("");
    let f_year = $state("");
    let f_revenue = $state("");
    let f_profit_margin = $state("");
    let f_market_cap = $state("");
    let f_growth_rate = $state("");
    let f_esg_environmental = $state("");
    let f_esg_social = $state("");
    let f_esg_governance = $state("");
    let f_carbon_emission = $state("");
    let f_water_usage = $state("");
    let f_energy_consumption = $state("");

    function mostrarError(msg) {
        errorMsg = msg;
        successMsg = "";
        setTimeout(() => { errorMsg = ""; }, 5000);
    }

    function mostrarExito(msg) {
        successMsg = msg;
        errorMsg = "";
        setTimeout(() => { successMsg = ""; }, 4000);
    }

    function mensajeDeError(status, company_id = "", year = "") {
        if (status === 400) return "⚠️ Los datos introducidos no son válidos. Comprueba que todos los campos están rellenos y son correctos.";
        if (status === 409) return `⚠️ Ya existe un registro para la empresa con ID ${company_id} en el año ${year}. No se puede crear un duplicado.`;
        if (status === 404) return `⚠️ No se encontró ningún registro para la empresa con ID ${company_id} en el año ${year}.`;
        if (status === 405) return "⚠️ Esta operación no está permitida sobre este recurso.";
        return `⚠️ Error del servidor (código ${status}). Por favor, inténtalo de nuevo.`;
    }

    async function cargarRegistros() {
        try {
            const res = await fetch(API_URL);
            if (res.ok) {
                registros = await res.json();
                errorMsg = "";
            } else {
                mostrarError("Error al obtener los registros. Código: " + res.status);
            }
        } catch {
            mostrarError("No se pudo conectar con el servidor.");
        }
    }

    async function cargarDatosIniciales() {
        try {
            const res = await fetch(API_URL + "/loadInitialData");
            if (res.ok) {
                mostrarExito("✅ Datos iniciales cargados correctamente.");
                cargarRegistros();
            } else {
                mostrarError("Error al cargar los datos iniciales.");
            }
        } catch {
            mostrarError("No se pudo conectar con el servidor.");
        }
    }

    async function eliminarTodos() {
        if (!confirm("¿Estás seguro de que quieres eliminar TODOS los registros? Esta acción no se puede deshacer.")) return;
        try {
            const res = await fetch(API_URL, { method: "DELETE" });
            if (res.ok) {
                mostrarExito("✅ Todos los registros han sido eliminados.");
                cargarRegistros();
            } else {
                mostrarError("Error al eliminar los registros.");
            }
        } catch {
            mostrarError("No se pudo conectar con el servidor.");
        }
    }

    async function crearRegistro() {
        const camposObligatorios = [f_company_id, f_company_name, f_industry, f_region, f_year,
            f_revenue, f_profit_margin, f_market_cap,
            f_esg_environmental, f_esg_social, f_esg_governance,
            f_carbon_emission, f_water_usage, f_energy_consumption];

        if (camposObligatorios.some(v => v === "" || v === null || v === undefined)) {
            mostrarError("⚠️ Por favor, rellena todos los campos obligatorios (marcados con *).");
            return;
        }

        const nuevo = {
            company_id: parseInt(f_company_id),
            company_name: f_company_name,
            industry: f_industry,
            region: f_region,
            year: parseInt(f_year),
            revenue: parseFloat(f_revenue),
            profit_margin: parseFloat(f_profit_margin),
            market_cap: parseFloat(f_market_cap),
            growth_rate: f_growth_rate !== "" ? parseFloat(f_growth_rate) : null,
            esg_environmental: parseFloat(f_esg_environmental),
            esg_social: parseFloat(f_esg_social),
            esg_governance: parseFloat(f_esg_governance),
            carbon_emission: parseFloat(f_carbon_emission),
            water_usage: parseFloat(f_water_usage),
            energy_consumption: parseFloat(f_energy_consumption)
        };

        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(nuevo)
            });

            if (res.status === 201) {
                mostrarExito(`✅ Registro creado: empresa "${f_company_name}" (ID ${f_company_id}), año ${f_year}.`);
                limpiarFormulario();
                cargarRegistros();
            } else {
                mostrarError(mensajeDeError(res.status, f_company_id, f_year));
            }
        } catch {
            mostrarError("No se pudo conectar con el servidor.");
        }
    }

    // (editar eliminado — el backend calcula esg_overall automáticamente)

    async function eliminarRegistro(company_id, year) {
        if (!confirm(`¿Confirmas que quieres eliminar el registro de la empresa ID ${company_id} del año ${year}?`)) return;
        try {
            const res = await fetch(`${API_URL}/${company_id}/${year}`, { method: "DELETE" });
            if (res.ok) {
                mostrarExito(`✅ Registro de empresa ID ${company_id} del año ${year} eliminado.`);
                cargarRegistros();
            } else {
                mostrarError(mensajeDeError(res.status, company_id, year));
            }
        } catch {
            mostrarError("No se pudo conectar con el servidor.");
        }
    }

    function limpiarFormulario() {
        f_company_id = ""; f_company_name = ""; f_industry = ""; f_region = "";
        f_year = ""; f_revenue = ""; f_profit_margin = ""; f_market_cap = "";
        f_growth_rate = ""; f_esg_environmental = "";
        f_esg_social = ""; f_esg_governance = ""; f_carbon_emission = "";
        f_water_usage = ""; f_energy_consumption = "";
    }

    // Campos de búsqueda
    let s_company_name = $state("");
    let s_industry = $state("");
    let s_region = $state("");
    let s_from = $state("");
    let s_to = $state("");
    let noResultados = $state(false);

    async function buscar() {
        const params = new URLSearchParams();
        if (s_company_name.trim()) params.set("company_name", s_company_name.trim());
        if (s_industry.trim())     params.set("industry", s_industry.trim());
        if (s_region.trim())       params.set("region", s_region.trim());
        if (s_from !== "")         params.set("from", s_from);
        if (s_to !== "")           params.set("to", s_to);

        const url = params.toString() ? `${API_URL}?${params}` : API_URL;

        try {
            const res = await fetch(url);
            if (res.status === 404) {
                registros = [];
                noResultados = true;
                errorMsg = "";
                return;
            }
            if (res.ok) {
                const datos = await res.json();
                registros = datos;
                noResultados = datos.length === 0;
                errorMsg = "";
            } else {
                mostrarError(`⚠️ Error al realizar la búsqueda. Código: ${res.status}.`);
            }
        } catch {
            mostrarError("⚠️ No se pudo conectar con el servidor. Comprueba tu conexión e inténtalo de nuevo.");
        }
    }

    function limpiarBusqueda() {
        s_company_name = ""; s_industry = ""; s_region = "";
        s_from = ""; s_to = "";
        noResultados = false;
        cargarRegistros();
    }

    onMount(() => {
        cargarRegistros();
    });
</script>

<div class="container" style="max-width: 1300px;">
    <h1>🌿 Puntuaciones ESG y Rendimiento Financiero de Empresas</h1>

    {#if errorMsg}
        <div class="msg msg-error">{errorMsg}</div>
    {/if}
    {#if successMsg}
        <div class="msg msg-success">{successMsg}</div>
    {/if}

    <!-- SECCIÓN: AÑADIR REGISTRO -->
    <div class="endpoint-group">
        <div class="section-header">
            <h3>➕ Añadir Nuevo Registro</h3>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
                <button on:click={cargarDatosIniciales} class="action-btn load-btn">📂 Cargar Datos Iniciales</button>
                <button on:click={eliminarTodos} class="action-btn delete-btn">🗑️ Eliminar Todos</button>
            </div>
        </div>

        <div class="form-grid">
            <div class="form-field">
                <label>ID Empresa *</label>
                <input type="number" bind:value={f_company_id} placeholder="Ej: 1" class="form-input">
            </div>
            <div class="form-field">
                <label>Nombre Empresa *</label>
                <input type="text" bind:value={f_company_name} placeholder="Ej: Company_1" class="form-input">
            </div>
            <div class="form-field">
                <label>Industria *</label>
                <input type="text" bind:value={f_industry} placeholder="Ej: Retail" class="form-input">
            </div>
            <div class="form-field">
                <label>Región *</label>
                <input type="text" bind:value={f_region} placeholder="Ej: Latin America" class="form-input">
            </div>
            <div class="form-field">
                <label>Año *</label>
                <input type="number" bind:value={f_year} placeholder="Ej: 2024" class="form-input">
            </div>
            <div class="form-field">
                <label>Ingresos (millones $) *</label>
                <input type="number" step="0.1" bind:value={f_revenue} placeholder="Ej: 459.2" class="form-input">
            </div>
            <div class="form-field">
                <label>Margen de Beneficio (%) *</label>
                <input type="number" step="0.1" bind:value={f_profit_margin} placeholder="Ej: 6.0" class="form-input">
            </div>
            <div class="form-field">
                <label>Capitalización de Mercado *</label>
                <input type="number" step="0.1" bind:value={f_market_cap} placeholder="Ej: 337.5" class="form-input">
            </div>
            <div class="form-field">
                <label>Tasa de Crecimiento (%)</label>
                <input type="number" step="0.1" bind:value={f_growth_rate} placeholder="Ej: 3.2 (opcional)" class="form-input">
            </div>
            <div class="form-field">
                <label>ESG Ambiental *</label>
                <input type="number" step="0.1" bind:value={f_esg_environmental} placeholder="Ej: 60.7" class="form-input">
            </div>
            <div class="form-field">
                <label>ESG Social *</label>
                <input type="number" step="0.1" bind:value={f_esg_social} placeholder="Ej: 33.5" class="form-input">
            </div>
            <div class="form-field">
                <label>ESG Gobernanza *</label>
                <input type="number" step="0.1" bind:value={f_esg_governance} placeholder="Ej: 76.8" class="form-input">
            </div>
            <div class="form-field">
                <label>Emisiones de CO₂ *</label>
                <input type="number" step="0.1" bind:value={f_carbon_emission} placeholder="Ej: 35577.4" class="form-input">
            </div>
            <div class="form-field">
                <label>Consumo de Agua *</label>
                <input type="number" step="0.1" bind:value={f_water_usage} placeholder="Ej: 17788.7" class="form-input">
            </div>
            <div class="form-field">
                <label>Consumo de Energía *</label>
                <input type="number" step="0.1" bind:value={f_energy_consumption} placeholder="Ej: 71154.7" class="form-input">
            </div>
        </div>
        <div style="margin-top:15px; text-align:right;">
            <button on:click={crearRegistro} class="action-btn create-btn">➕ Añadir Registro</button>
        </div>
    </div>

    <!-- SECCIÓN: BÚSQUEDA -->
    <div class="endpoint-group">
        <div class="section-header">
            <h3>🔍 Buscar Registros</h3>
        </div>
        <div class="form-grid">
            <div class="form-field">
                <label>Nombre Empresa</label>
                <input type="text" bind:value={s_company_name} placeholder="Ej: Company_1" class="form-input">
            </div>
            <div class="form-field">
                <label>Industria</label>
                <input type="text" bind:value={s_industry} placeholder="Ej: Retail" class="form-input">
            </div>
            <div class="form-field">
                <label>Región</label>
                <input type="text" bind:value={s_region} placeholder="Ej: Europe" class="form-input">
            </div>
            <div class="form-field">
                <label>Año desde</label>
                <input type="number" bind:value={s_from} placeholder="Ej: 2020" class="form-input">
            </div>
            <div class="form-field">
                <label>Año hasta</label>
                <input type="number" bind:value={s_to} placeholder="Ej: 2024" class="form-input">
            </div>
        </div>
        <div style="margin-top:15px; display:flex; gap:10px; justify-content:flex-end;">
            <button on:click={limpiarBusqueda} class="action-btn load-btn">🧹 Limpiar búsqueda</button>
            <button on:click={buscar} class="action-btn search-btn">🔍 Buscar</button>
        </div>
    </div>

    <!-- SECCIÓN: TABLA DE REGISTROS -->
    <div class="endpoint-group">
        <div class="section-header">
            <h3>📊 Registros en la Base de Datos</h3>
            <button on:click={cargarRegistros} class="action-btn load-btn" style="font-size:0.85rem;">🔄 Actualizar lista</button>
        </div>

        <div style="overflow-x:auto;">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Empresa</th>
                        <th>Industria</th>
                        <th>Región</th>
                        <th>Año</th>
                        <th>Ingresos (M$)</th>
                        <th>Margen (%)</th>
                        <th>ESG General</th>
                        <th>ESG Amb.</th>
                        <th>ESG Soc.</th>
                        <th>ESG Gov.</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {#if registros.length === 0}
                        <tr>
                            <td colspan="11" style="text-align:center; padding:25px; color:var(--text-muted);">
                                {#if noResultados}
                                    No se encontraron resultados para los filtros aplicados.
                                {:else}
                                    No hay registros disponibles. Pulsa "Cargar Datos Iniciales" para empezar.
                                {/if}
                            </td>
                        </tr>
                    {:else}
                        {#each registros as r}
                            <tr>
                                <td>{r.company_name}</td>
                                <td>{r.industry}</td>
                                <td>{r.region}</td>
                                <td>{r.year}</td>
                                <td>{r.revenue}</td>
                                <td>{r.profit_margin}%</td>
                                <td>{r.esg_overall}</td>
                                <td>{r.esg_environmental}</td>
                                <td>{r.esg_social}</td>
                                <td>{r.esg_governance}</td>
                                <td class="actions-cell">
                                    <a href="/company-esg-scores-financial-performances/{r.company_id}/{r.year}" class="action-btn edit-btn">✏️ Editar</a>
                                    <button on:click={() => eliminarRegistro(r.company_id, r.year)} class="action-btn delete-btn">🗑️ Eliminar</button>
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
    .msg {
        padding: 12px 16px;
        border-radius: 8px;
        margin-bottom: 16px;
        font-weight: 600;
    }
    .msg-error { background: #fee2e2; color: #b91c1c; }
    .msg-success { background: #dcfce7; color: #15803d; }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        flex-wrap: wrap;
        gap: 10px;
    }

    .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 12px;
    }

    .form-field {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .form-field label {
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.03em;
    }

    .form-input {
        padding: 8px 10px;
        border: 1px solid var(--border-color);
        border-radius: 6px;
        font-size: 0.9rem;
        width: 100%;
    }

    .form-input:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(30, 41, 59, 0.1);
    }

    .endpoint-group {
        background: var(--bg-color);
        border: 1px solid var(--border-color);
        border-radius: 10px;
        padding: 20px;
        margin-bottom: 24px;
    }

    .data-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.88rem;
    }

    .data-table thead tr {
        background-color: var(--primary-color);
        color: white;
    }

    .data-table th {
        padding: 11px 12px;
        text-align: left;
        white-space: nowrap;
    }

    .data-table td {
        padding: 10px 12px;
        border-bottom: 1px solid var(--border-color);
    }

    .data-table tbody tr:hover {
        background-color: #f1f5f9;
    }

    .actions-cell {
        display: flex;
        gap: 6px;
        flex-wrap: nowrap;
    }

    .action-btn {
        padding: 7px 13px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        font-size: 0.82rem;
        transition: opacity 0.2s;
        color: white;
        white-space: nowrap;
    }
    .action-btn:hover { opacity: 0.82; }

    .load-btn { background-color: #2563eb; }
    .search-btn { background-color: #0f766e; }
    .delete-btn { background-color: #dc2626; }
    .create-btn { background-color: #16a34a; padding: 9px 20px; font-size: 0.9rem; }
    .edit-btn { background-color: #d97706; text-decoration: none; display: inline-flex; align-items: center; }
</style>
