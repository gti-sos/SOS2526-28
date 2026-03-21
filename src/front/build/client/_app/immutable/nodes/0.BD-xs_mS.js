import"../chunks/DsnmJJEf.js";import{d as c,n as h,s as f,c as i,r as n,af as m}from"../chunks/Ao8hT-MN.js";import{a as l,f as d}from"../chunks/N_yu8ttR.js";import{B as b}from"../chunks/CLsQXN_c.js";import{h as v}from"../chunks/DYsoKMlX.js";function x(r,t,...a){var o=new b(r);c(()=>{const e=t()??null;o.ensure(e,e&&(s=>e(s,...a)))},h)}var g=d(`<style>:root {
            --primary-color: #1e293b;
            --primary-hover: #1d4ed8;
            --bg-color: #f8fafc;
            --card-bg: #ffffff;
            --text-main: #1e293b;
            --text-muted: #64748b;
            --border-color: #e2e8f0;
            --background: #9eb8f1;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: system-ui, -apple-system, sans-serif;
            background-color: var(--background);
            color: var(--text-main);
            line-height: 1.6;
            /* Hemos quitado el flexbox de aquí para que el header ocupe todo el ancho */
        }

        /* ... (resto de tus estilos de tarjetas) ... */
        .container {
            background: var(--card-bg);
            max-width: 800px;
            width: 100%;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }

        h1 { font-size: 1.8rem; margin-bottom: 30px; padding-bottom: 15px; border-bottom: 2px solid var(--border-color); }
        h3 { font-size: 1.2rem; margin-bottom: 15px; }
        .endpoint-group { margin-bottom: 35px; }
        .api-list { list-style: none; display: flex; flex-direction: column; gap: 12px; }
        .api-item { background: var(--bg-color); border: 1px solid var(--border-color); border-radius: 8px; padding: 15px 20px; transition: all 0.2s ease; display: flex; flex-direction: column; gap: 5px; }
        .api-item:hover { border-color: var(--primary-color); transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.08); }
        .api-title { font-weight: 600; }
        a { color: var(--primary-color); text-decoration: none; word-break: break-all; transition: color 0.2s; }
        a:hover { color: var(--primary-hover); text-decoration: underline; }</style>`),y=d('<div class="app-layout svelte-12qhfyh"><header class="site-header svelte-12qhfyh"><div class="header-content svelte-12qhfyh"><h2 class="svelte-12qhfyh">👥 SOS GRUPO 28</h2> <nav class="svelte-12qhfyh"><a href="/" class="nav-btn svelte-12qhfyh">🏠 INICIO</a> <a href="https://github.com/gti-sos/SOS2526-28" target="_blank" class="nav-btn svelte-12qhfyh">📁 REPOSITORIO</a> <a href="/about" class="nav-btn svelte-12qhfyh">ℹ️ ABOUT</a></nav></div></header> <main class="main-content svelte-12qhfyh"><!></main> <footer class="site-footer svelte-12qhfyh"><p>© 2026 - Sistemas Orientados a Servicios - ETSII</p></footer></div>');function w(r,t){var a=y();v("12qhfyh",s=>{var p=g();l(s,p)});var o=f(i(a),2),e=i(o);x(e,()=>t.children),n(o),m(2),n(a),l(r,a)}export{w as component};
