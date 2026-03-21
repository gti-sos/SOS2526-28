<script>
    let { children } = $props();
</script>
<div class="app-layout">
    
    <header class="site-header">
        <div class="header-content">
            <h2>👥 SOS GRUPO 28</h2>
            <nav>
                <a href="/" class="nav-btn">🏠 INICIO</a>
                <a href="https://github.com/gti-sos/SOS2526-28" target="_blank" class="nav-btn">📁 REPOSITORIO</a>
                <a href="/about" class="nav-btn">ℹ️ ABOUT</a>
            </nav>
        </div>
    </header>

    <main class="main-content">
        {@render children()}
    </main>

    <footer class="site-footer">
        <p>© 2026 - Sistemas Orientados a Servicios - ETSII</p>
    </footer>

</div>

<style>
    .app-layout {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }

    .site-header {
        background-color: var(--primary-color);
        color: white;
        padding: 15px 30px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .header-content {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .header-content h2 {
        margin: 0;
        font-size: 1.5rem;
        border: none;
        padding: 0;
    }

    nav {
        display: flex;
        gap: 15px;
    }

    .nav-btn {
        background-color: rgba(255, 255, 255, 0.1);
        color: white;
        padding: 8px 16px;
        border-radius: 6px;
        font-weight: 500;
        text-decoration: none;
        transition: background-color 0.2s;
    }

    .nav-btn:hover {
        background-color: rgba(255, 255, 255, 0.25);
        color: white;
        text-decoration: none;
    }

    .main-content {
        flex: 1; /* Esto empuja el footer hacia abajo */
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 40px 20px;
    }

    .site-footer {
        background-color: #0f172a;
        color: #94a3b8;
        text-align: center;
        padding: 20px;
        font-size: 0.9rem;
    }
</style>

<svelte:head>
    <style>
        :root {
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
        a:hover { color: var(--primary-hover); text-decoration: underline; }
    </style>
</svelte:head>