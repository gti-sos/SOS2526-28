import { h as head, aa as ensure_array_like, c as escape_html, ab as attr } from './index-DFyZMuqB.js';

function _page($$renderer) {
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
    {
      name: "API Alberto",
      url: "/api/v1/beneficial-ownership-merchant-fleets"
    },
    {
      name: "API Jorge",
      url: "/api/v1/deliberate-violence-against-civilians-events-worldwide"
    },
    {
      name: "API Zhillan",
      url: "/api/v1/company-esg-scores-financial-performances"
    }
  ];
  head("cwls5q", $$renderer, ($$renderer2) => {
    $$renderer2.title(($$renderer3) => {
      $$renderer3.push(`<title>About - SOS2526-28</title>`);
    });
  });
  $$renderer.push(`<div class="container"><h1>ℹ️ ABOUT</h1> <div class="endpoint-group"><h3>👥 TEAM</h3> <ul class="api-list"><!--[-->`);
  const each_array = ensure_array_like(teamMembers);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let member = each_array[$$index];
    $$renderer.push(`<li class="api-item"><span class="api-title">${escape_html(member.name)}</span> <a${attr("href", member.github)} target="_blank" rel="noopener noreferrer">${escape_html(member.github)}</a></li>`);
  }
  $$renderer.push(`<!--]--></ul></div> <div class="endpoint-group"><h3>📝 PROJECT DESCRIPTION</h3> <div class="api-item"><p>Our sources of information are a jumble of unrelated data; our intention will be to find a connection between the three data sources.</p></div></div> <div class="endpoint-group"><h3>🔗 LINKS &amp; APIs</h3> <ul class="api-list"><li class="api-item"><span class="api-title">Repository</span> <a href="https://github.com/gti-sos/SOS2526-28" target="_blank" rel="noopener noreferrer">gti-sos/SOS2526-28</a></li> <li class="api-item"><span class="api-title">Deployment URL</span> <a href="https://sos2526-28.onrender.com" target="_blank" rel="noopener noreferrer">https://sos2526-28.onrender.com</a></li> <!--[-->`);
  const each_array_1 = ensure_array_like(apiLinks);
  for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
    let api = each_array_1[$$index_1];
    $$renderer.push(`<li class="api-item"><span class="api-title">${escape_html(api.name)}</span> <a${attr("href", api.url)} target="_blank" rel="noopener noreferrer">https://sos2526-28.onrender.com${escape_html(api.url)}</a></li>`);
  }
  $$renderer.push(`<!--]--></ul></div></div>`);
}

export { _page as default };
//# sourceMappingURL=_page.svelte-0Ta2nSlb.js.map
