<slot />

<svelte:head>
    <style>
        /* Variables de color para mantener consistencia */
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

        /* Reseteo básico */
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        /* Tipografía del sistema*/
        body {
            font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: var(--background);
            color: var(--text-main);
            line-height: 1.6;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }

        /* Contenedor principal estilo tarjeta */
        .container {
            background: var(--card-bg);
            max-width: 800px;
            width: 100%;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.05);
        }

        h1 {
            font-size: 1.8rem;
            color: var(--text-main);
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 2px solid var(--border-color);
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .endpoint-group {
            margin-bottom: 35px;
        }

        .endpoint-group:last-child {
            margin-bottom: 0;
        }

        h3 {
            font-size: 1.2rem;
            color: var(--text-main);
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        /* Lista de APIs */
        .api-list {
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .api-item {
            background: var(--bg-color);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 15px 20px;
            transition: all 0.2s ease;
            display: flex;
            flex-direction: column;
            gap: 5px;
        }

        /* Efecto hover en las tarjetas de API */
        .api-item:hover {
            border-color: var(--primary-color);
            transform: translateY(-2px);
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.08);
        }

        .api-title {
            font-weight: 600;
            color: var(--text-main);
        }

        a {
            color: var(--primary-color);
            text-decoration: none;
            font-size: 0.95rem;
            word-break: break-all;
            transition: color 0.2s;
        }

        a:hover {
            color: var(--primary-hover);
            text-decoration: underline;
        }

        /* Botones de información */
        .info-links {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
        }

        .info-link {
            display: inline-flex;
            align-items: center;
            padding: 10px 20px;
            background-color: var(--bg-color);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            font-weight: 500;
            color: var(--text-main);
            transition: all 0.2s ease;
        }

        .info-link:hover {
            background-color: var(--primary-color);
            color: white;
            border-color: var(--primary-color);
            text-decoration: none;
        }

        /* Diseño responsivo para móviles */
        @media (max-width: 600px) {
            .container {
                padding: 25px 20px;
            }
            h1 {
                font-size: 1.5rem;
            }
            .info-links {
                flex-direction: column;
            }
            .info-link {
                width: 100%;
                justify-content: center;
            }
        }
    </style>
</svelte:head>