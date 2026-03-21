import { aa as ensure_array_like, c as escape_html, ab as attr, ac as stringify } from './index-DFyZMuqB.js';

function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const apis = [
      {
        nombre: "Alberto Jiménez Mateos",
        recurso: "beneficial-ownership-merchant-fleets",
        titulo: "BENEFICIAL OWNERSHIP MERCHANT FLEETS",
        postman: "URL_DE_TU_POSTMAN"
        // <-- Sustituye esto
      },
      {
        nombre: "Jorge Dayoub Dayoub",
        recurso: "deliberate-violence-against-civilians-events-worldwide",
        titulo: "DELIBERATE VIOLENCE AGAINST CIVILIANS EVENTS WORLDWIDE",
        postman: "URL_DEL_POSTMAN_DE_JORGE"
        // <-- Sustituye esto
      },
      {
        nombre: "Muhammad Zhillan Averous",
        recurso: "company-esg-scores-financial-performances",
        titulo: "COMPANY ESG SCORES FINANCIAL PERFORMANCES",
        postman: "URL_DEL_POSTMAN_DE_MUHAMMAD"
        // <-- Sustituye esto
      }
    ];
    $$renderer2.push(`<div class="container"><h1>🚀 PANEL DE CONTROL</h1> <div class="endpoint-group"><h3>📊 APIs y FRONT-ENDS</h3> <ul class="api-list"><!--[-->`);
    const each_array = ensure_array_like(apis);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let api = each_array[$$index];
      $$renderer2.push(`<li class="api-item"><span class="api-title"><h3>${escape_html(api.titulo)}</h3></span> <span class="api-title">DESARROLLADO POR: ${escape_html(api.nombre)}</span> <span class="api-title">RECURSO: ${escape_html(api.recurso)}</span> <br/> <span class="api-title">FRONT-END (SVELTE)</span> <a${attr("href", `/${stringify(api.recurso)}`)}>Ir a la aplicación de ${escape_html(api.nombre.split(" ")[0])}</a> <br/> <span class="api-title">API (RENDER)</span> <a${attr("href", `/api/v1/${stringify(api.recurso)}`)} target="_blank" rel="noopener noreferrer">/api/v1/${escape_html(api.recurso)}</a> <br/> <span class="api-title">DOCUMENTACIÓN POSTMAN</span> <a${attr("href", api.postman)} target="_blank" rel="noopener noreferrer">Ver documentación en Postman</a></li>`);
    }
    $$renderer2.push(`<!--]--></ul></div></div>`);
  });
}

export { _page as default };
//# sourceMappingURL=_page.svelte-EqCus7q8.js.map
