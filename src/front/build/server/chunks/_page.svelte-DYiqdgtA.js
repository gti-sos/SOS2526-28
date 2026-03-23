import { a4 as attr, a3 as ensure_array_like, m as escape_html } from './server-Bl9qdiYN.js';

//#region src/routes/deliberate-violence-against-civilians-events-worldwide/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** @type {any[]} */
		let events = [];
		let newStartDay = "";
		let newStartMonth = "";
		let newStartYear = "";
		let newCountry = "";
		let newRegion = "";
		let newLocality = "";
		let newDegree = "";
		let newMinute = "";
		let newSecond = "";
		let newDirection = "";
		$$renderer.push(`<div class="container" style="max-width: 1100px;"><h1>⚠️ Violence Against Civilians Events</h1> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="endpoint-group" style="background: var(--bg-color); padding:20px; border-radius:8px; border:1px solid var(--border-color);"><div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;"><h3>➕ Añadir Nuevo Evento</h3> <div><button class="action-btn load-btn svelte-1jt4ear">Cargar Datos Iniciales</button> <button class="action-btn delete-btn svelte-1jt4ear">Borrar Todos</button></div></div> <div style="display:grid; grid-template-columns: repeat(5,1fr); gap:10px;"><input type="number"${attr("value", newStartDay)} placeholder="Día" class="form-input svelte-1jt4ear"/> <input type="number"${attr("value", newStartMonth)} placeholder="Mes" class="form-input svelte-1jt4ear"/> <input type="number"${attr("value", newStartYear)} placeholder="Año" class="form-input svelte-1jt4ear"/> <input${attr("value", newCountry)} placeholder="País" class="form-input svelte-1jt4ear"/> <input${attr("value", newRegion)} placeholder="Región" class="form-input svelte-1jt4ear"/> <input${attr("value", newLocality)} placeholder="Localidad" class="form-input svelte-1jt4ear"/> <input type="number"${attr("value", newDegree)} placeholder="Grados" class="form-input svelte-1jt4ear"/> <input type="number"${attr("value", newMinute)} placeholder="Minutos" class="form-input svelte-1jt4ear"/> <input type="number"${attr("value", newSecond)} placeholder="Segundos" class="form-input svelte-1jt4ear"/> <input${attr("value", newDirection)} placeholder="Dirección" class="form-input svelte-1jt4ear"/> <button class="action-btn create-btn svelte-1jt4ear">Añadir</button></div></div> <div class="endpoint-group"><h3>📊 Listado de Eventos</h3> <div style="overflow-x:auto;"><table style="width:100%; text-align:left; border-collapse:collapse; margin-top:15px;"><thead><tr style="background-color: var(--primary-color); color:white;"><th style="padding:12px;">País</th><th style="padding:12px;">Fecha</th><th style="padding:12px;">Localidad</th><th style="padding:12px;">Tipo de evento</th><th style="padding:12px;"></th></tr></thead><tbody>`);
		if (events.length === 0) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<tr><td colspan="5" style="text-align:center; padding:20px;">No hay datos disponibles en la base de datos.</td></tr>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--[-->`);
			const each_array = ensure_array_like(events);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let e = each_array[$$index];
				$$renderer.push(`<tr style="border-bottom:1px solid var(--border-color);"><td style="padding:12px;">${escape_html(e.country)}</td><td style="padding:12px;">${escape_html(e.start_day)}/${escape_html(e.start_month)}/${escape_html(e.start_year)}</td><td style="padding:12px;">${escape_html(e.locality)}</td><td style="padding:12px;">${escape_html(e.event_type)}</td><td style="padding:12px;"><button class="action-btn delete-btn svelte-1jt4ear">Borrar</button></td></tr>`);
			}
			$$renderer.push(`<!--]-->`);
		}
		$$renderer.push(`<!--]--></tbody></table></div></div></div>`);
	});
}

export { _page as default };
//# sourceMappingURL=_page.svelte-DYiqdgtA.js.map
