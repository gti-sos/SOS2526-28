<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';

    const company_id = $page.params.company_id;
    const year = $page.params.year;
    const API_URL = "/api/v1/company-esg-scores-financial-performances";

    let cargando = $state(true);
    let errorMsg = $state("");
    let successMsg = $state("");

    let f_company_name = $state("");
    let f_industry = $state("");
    let f_region = $state("");
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

    onMount(async () => {
        try {
            const res = await fetch(`${API_URL}/${company_id}/${year}`);
            if (res.ok) {
                const r = await res.json();
                f_company_name = r.company_name ?? "";
                f_industry = r.industry ?? "";
                f_region = r.region ?? "";
                f_revenue = r.revenue ?? "";
                f_profit_margin = r.profit_margin ?? "";
                f_market_cap = r.market_cap ?? "";
                f_growth_rate = r.growth_rate ?? "";
                f_esg_environmental = r.esg_environmental ?? "";
                f_esg_social = r.esg_social ?? "";
                f_esg_governance = r.esg_governance ?? "";
                f_carbon_emission = r.carbon_emission ?? "";
                f_water_usage = r.water_usage ?? "";
                f_energy_consumption = r.energy_consumption ?? "";
            } else if (res.status === 404) {
                mostrarError(`⚠️ No se encontró el registro de la empresa ID ${company_id} del año ${year}.`);
            } else {
                mostrarError(`⚠️ Error al cargar el registro. Código: ${res.status}.`);
            }
        } catch {
            mostrarError("⚠️ No se pudo conectar con el servidor. Comprueba tu conexión e inténtalo de nuevo.");
        } finally {
            cargando = false;
        }
    });

    async function guardarCambios() {
        const camposObligatorios = [f_company_name, f_industry, f_region, f_revenue,
            f_profit_margin, f_market_cap, f_esg_environmental,
            f_esg_social, f_esg_governance, f_carbon_emission,
            f_water_usage, f_energy_consumption];

        if (camposObligatorios.some(v => v === "" || v === null || v === undefined)) {
            mostrarError("⚠️ Por favor, rellena todos los campos obligatorios.");
            return;
        }

        const env = parseFloat(f_esg_environmental);
        const soc = parseFloat(f_esg_social);
        const gov = parseFloat(f_esg_governance);

        const actualizado = {
            company_id: parseInt(company_id),
            company_name: f_company_name,
            industry: f_industry,
            region: f_region,
            year: parseInt(year),
            revenue: parseFloat(f_revenue),
            profit_margin: parseFloat(f_profit_margin),
            market_cap: parseFloat(f_market_cap),
            growth_rate: f_growth_rate !== "" && f_growth_rate !== null ? parseFloat(f_growth_rate) : null,
            esg_overall: parseFloat(((env + soc + gov) / 3).toFixed(2)),
            esg_environmental: env,
            esg_social: soc,
            esg_governance: gov,
            carbon_emission: parseFloat(f_carbon_emission),
            water_usage: parseFloat(f_water_usage),
            energy_consumption: parseFloat(f_energy_consumption)
        };

        try {
            const res = await fetch(`${API_URL}/${company_id}/${year}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(actualizado)
            });

            if (res.ok) {
                successMsg = `✅ Registro de empresa ID ${company_id} (año ${year}) actualizado correctamente.`;
                errorMsg = "";
                setTimeout(() => goto("/company-esg-scores-financial-performances"), 1500);
            } else {
                let detalle = "";
                try { detalle = await res.text(); } catch { /* sin cuerpo */ }
                const info = detalle ? ` — Detalle: "${detalle}"` : "";
                if (res.status === 400) {
                    mostrarError(`⚠️ Datos no válidos (400)${info}. Comprueba que todos los campos son correctos y que los tipos de dato coinciden.`);
                } else if (res.status === 404) {
                    mostrarError(`⚠️ Registro no encontrado (404). Empresa ID ${company_id}, año ${year}${info}.`);
                } else {
                    mostrarError(`⚠️ Error del servidor (${res.status})${info}. Por favor, inténtalo de nuevo.`);
                }
            }
        } catch {
            mostrarError("⚠️ No se pudo conectar con el servidor. Comprueba tu conexión e inténtalo de nuevo.");
        }
    }
</script>

<div class="container">
    <div class="page-header">
        <a href="/company-esg-scores-financial-performances" class="back-link">← Volver al listado</a>
        <h1>✏️ Editar Registro ESG</h1>
        <p class="subtitle">Empresa ID <strong>{company_id}</strong> — Año <strong>{year}</strong></p>
    </div>

    {#if errorMsg}
        <div class="msg msg-error">{errorMsg}</div>
    {/if}
    {#if successMsg}
        <div class="msg msg-success">{successMsg}</div>
    {/if}

    {#if cargando}
        <div class="msg msg-info">⏳ Cargando datos del registro...</div>
    {:else if !errorMsg || successMsg}
        <div class="card">
            <div class="form-grid">
                <!-- Claves primarias (solo lectura) -->
                <div class="form-field">
                    <label>ID Empresa <span class="readonly-badge">solo lectura</span></label>
                    <input type="number" value={company_id} disabled class="form-input readonly">
                </div>
                <div class="form-field">
                    <label>Año <span class="readonly-badge">solo lectura</span></label>
                    <input type="number" value={year} disabled class="form-input readonly">
                </div>

                <!-- Campos editables -->
                <div class="form-field">
                    <label>Nombre Empresa *</label>
                    <input type="text" bind:value={f_company_name} class="form-input">
                </div>
                <div class="form-field">
                    <label>Industria *</label>
                    <input type="text" bind:value={f_industry} class="form-input">
                </div>
                <div class="form-field">
                    <label>Región *</label>
                    <input type="text" bind:value={f_region} class="form-input">
                </div>
                <div class="form-field">
                    <label>Ingresos (millones $) *</label>
                    <input type="number" step="0.1" bind:value={f_revenue} class="form-input">
                </div>
                <div class="form-field">
                    <label>Margen de Beneficio (%) *</label>
                    <input type="number" step="0.1" bind:value={f_profit_margin} class="form-input">
                </div>
                <div class="form-field">
                    <label>Capitalización de Mercado *</label>
                    <input type="number" step="0.1" bind:value={f_market_cap} class="form-input">
                </div>
                <div class="form-field">
                    <label>Tasa de Crecimiento (%)</label>
                    <input type="number" step="0.1" bind:value={f_growth_rate} placeholder="Opcional" class="form-input">
                </div>
                <div class="form-field">
                    <label>ESG Ambiental *</label>
                    <input type="number" step="0.1" bind:value={f_esg_environmental} class="form-input">
                </div>
                <div class="form-field">
                    <label>ESG Social *</label>
                    <input type="number" step="0.1" bind:value={f_esg_social} class="form-input">
                </div>
                <div class="form-field">
                    <label>ESG Gobernanza *</label>
                    <input type="number" step="0.1" bind:value={f_esg_governance} class="form-input">
                </div>
                <div class="form-field">
                    <label>Emisiones de CO₂ *</label>
                    <input type="number" step="0.1" bind:value={f_carbon_emission} class="form-input">
                </div>
                <div class="form-field">
                    <label>Consumo de Agua *</label>
                    <input type="number" step="0.1" bind:value={f_water_usage} class="form-input">
                </div>
                <div class="form-field">
                    <label>Consumo de Energía *</label>
                    <input type="number" step="0.1" bind:value={f_energy_consumption} class="form-input">
                </div>
            </div>

            <div class="form-actions">
                <a href="/company-esg-scores-financial-performances" class="btn btn-secondary">Cancelar</a>
                <button on:click={guardarCambios} class="btn btn-primary">💾 Guardar cambios</button>
            </div>
        </div>
    {/if}
</div>

<style>
    .container {
        max-width: 960px;
        margin: 0 auto;
        padding: 24px 16px;
    }

    .page-header {
        margin-bottom: 24px;
    }

    .back-link {
        display: inline-block;
        color: #2563eb;
        text-decoration: none;
        font-size: 0.9rem;
        margin-bottom: 10px;
    }
    .back-link:hover { text-decoration: underline; }

    h1 { margin: 0 0 4px 0; }

    .subtitle {
        color: #64748b;
        margin: 0;
        font-size: 0.95rem;
    }

    .msg {
        padding: 12px 16px;
        border-radius: 8px;
        font-weight: 600;
        margin-bottom: 16px;
    }
    .msg-error   { background: #fee2e2; color: #b91c1c; }
    .msg-success { background: #dcfce7; color: #15803d; }
    .msg-info    { background: #dbeafe; color: #1e40af; }

    .card {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 24px;
    }

    .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 14px;
        margin-bottom: 24px;
    }

    .form-field {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .form-field label {
        font-size: 0.8rem;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .readonly-badge {
        font-size: 0.68rem;
        background: #e2e8f0;
        color: #64748b;
        padding: 1px 5px;
        border-radius: 4px;
        text-transform: lowercase;
        letter-spacing: 0;
        font-weight: 500;
    }

    .form-input {
        padding: 8px 10px;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        font-size: 0.9rem;
        width: 100%;
        box-sizing: border-box;
    }

    .form-input:focus {
        outline: none;
        border-color: #2563eb;
        box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
    }

    .form-input.readonly {
        background: #f1f5f9;
        color: #64748b;
        cursor: not-allowed;
    }

    .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        border-top: 1px solid #e2e8f0;
        padding-top: 18px;
    }

    .btn {
        padding: 9px 20px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        font-size: 0.9rem;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        transition: opacity 0.2s;
    }
    .btn:hover { opacity: 0.82; }

    .btn-primary   { background: #16a34a; color: white; }
    .btn-secondary { background: #e2e8f0; color: #1e293b; }
</style>
