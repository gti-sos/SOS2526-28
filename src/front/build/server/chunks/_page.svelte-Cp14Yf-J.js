import { ab as attr, aa as ensure_array_like, c as escape_html } from './index-DFyZMuqB.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let fleets = [];
    let newYear = "";
    let newFlag = "";
    let newOwner = "";
    let newShips = "";
    let newTons = "";
    let newPercent = "";
    $$renderer2.push(`<div class="container" style="max-width: 1100px;"><h1>🚢 Beneficial Ownership Merchant Fleets</h1> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="endpoint-group" style="background: var(--bg-color); padding: 20px; border-radius: 8px; border: 1px solid var(--border-color);"><div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;"><h3>➕ Añadir Nuevo Registro</h3> <div><button class="action-btn load-btn svelte-l2jke4">Cargar Datos Iniciales</button> <button class="action-btn delete-btn svelte-l2jke4">Borrar Todos</button></div></div> <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;"><input type="number"${attr("value", newYear)} placeholder="Año" class="form-input svelte-l2jke4"/> <input type="text"${attr("value", newFlag)} placeholder="País Registro" class="form-input svelte-l2jke4"/> <input type="text"${attr("value", newOwner)} placeholder="País Propietario" class="form-input svelte-l2jke4"/> <input type="number"${attr("value", newShips)} placeholder="Nº Naves" class="form-input svelte-l2jke4"/> <input type="number" step="0.01"${attr("value", newTons)} placeholder="Peso (tons)" class="form-input svelte-l2jke4"/> <input type="number" step="0.001"${attr("value", newPercent)} placeholder="% Total" class="form-input svelte-l2jke4"/> <button class="action-btn create-btn svelte-l2jke4">Añadir</button></div></div> <div class="endpoint-group"><h3>📊 Listado de Flotas Registradas</h3> <div style="overflow-x: auto;"><table style="width: 100%; text-align: left; border-collapse: collapse; margin-top: 15px;"><thead><tr style="background-color: var(--primary-color); color: white;"><th style="padding: 12px; border-radius: 8px 0 0 0;">Año</th><th style="padding: 12px;">País de Registro</th><th style="padding: 12px;">País Propietario</th><th style="padding: 12px;">Nº Naves</th><th style="padding: 12px;">Peso (tons)</th><th style="padding: 12px; border-radius: 0 8px 0 0;">% Total</th></tr></thead><tbody>`);
    if (fleets.length === 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<tr><td colspan="6" style="text-align: center; padding: 20px;">No hay datos disponibles en la base de datos.</td></tr>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(fleets);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let fleet = each_array[$$index];
        $$renderer2.push(`<tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 12px;">${escape_html(fleet.year)}</td><td style="padding: 12px;">${escape_html(fleet.flag_of_registration_label)}</td><td style="padding: 12px;">${escape_html(fleet.beneficial_ownership_label)}</td><td style="padding: 12px; font-weight: bold;">${escape_html(fleet.number_of_ships)}</td><td style="padding: 12px;">${escape_html(fleet.dead_weight_tons)}</td><td style="padding: 12px;">${escape_html(fleet.percentage_of_total_fleet)}%</td></tr>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></tbody></table></div></div></div>`);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte-Cp14Yf-J.js.map
