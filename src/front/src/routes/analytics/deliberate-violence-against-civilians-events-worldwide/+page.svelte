<script>
	import { onMount } from 'svelte';

	let error = null;
	let chart = null;

	const API_URL = '/api/v1/deliberate-violence-against-civilians-events-worldwide';

	onMount(() => {
		initChart();
	});

	async function initChart() {
		try {
			// Cargar datos
			let res = await fetch(`${API_URL}?limit=200`);

			if (!res.ok) {
				throw new Error(`Error al cargar datos: ${res.status}`);
			}

			let data = await res.json();

			// Si no hay datos → cargar iniciales
			if (data.length === 0) {
				await fetch(API_URL + '/loadInitialData');
				res = await fetch(`${API_URL}?limit=200`);
				data = await res.json();
			}

			if (data.length === 0) {
				throw new Error('No hay datos disponibles');
			}

			console.log('Eventos cargados:', data.length);

			// ============================
			// AGRUPAR POR PAÍS
			// ============================

			const countryStats = {};

			data.forEach(e => {
				const country = e.country;

				if (country) {
					if (!countryStats[country]) {
						countryStats[country] = 0;
					}

					countryStats[country] += 1;
				}
			});

			// ============================
			// TOP 10 + OTROS
			// ============================

			let topCountries = Object.entries(countryStats)
				.sort((a, b) => b[1] - a[1])
				.slice(0, 10);

			let others = 0;

			Object.entries(countryStats).forEach(([country, count]) => {
				const inTop = topCountries.some(([c]) => c === country);
				if (!inTop) others += count;
			});

			if (others > 0) {
				topCountries.push(['Otros', others]);
			}

			// ============================
			// FORMATO PARA HIGHCHARTS
			// ============================

			const pieData = topCountries.map(([country, count]) => ({
				name: country,
				y: count
			}));

			// ============================
			// IMPORTAR HIGHCHARTS
			// ============================

			const Highcharts = await import('highcharts');
			const HC = Highcharts.default;

			if (chart) chart.destroy();

			// ============================
			// CREAR GRÁFICO PIE
			// ============================

			chart = HC.chart('container', {
				chart: {
					type: 'pie', // ✅ NO ES LINE
					height: 550
				},
				title: {
					text: '🌍 Eventos de Violencia por País'
				},
				subtitle: {
					text: 'Top 10 países con más eventos'
				},
				tooltip: {
					pointFormat:
						'<b>{point.name}</b><br/>' +
						'Eventos: {point.y}<br/>' +
						'Porcentaje: {point.percentage:.1f}%'
				},
				plotOptions: {
					pie: {
						allowPointSelect: true,
						cursor: 'pointer',
						dataLabels: {
							enabled: true,
							format: '<b>{point.name}</b>: {point.percentage:.1f}%'
						},
						showInLegend: true
					}
				},
				series: [
					{
						name: 'Eventos',
						data: pieData
					}
				]
			});

			
		} catch (e) {
			console.error(e);
			error = e.message;
			
		}
	}
</script>

<div class="analytics-container">
	<h1>📊 Analytics: Violencia contra civiles</h1>
	<p class="subtitle">Distribución de eventos por país</p>

	<div id="container"></div>

	{#if error}
		<div class="error">
			<p>❌ {error}</p>
			<button on:click={() => location.reload()}>Reintentar</button>
		</div>
	{/if}

	<a href="/analytics/deliberate-violence-against-civilians-events-worldwide/map" style="text-decoration: none; padding: 12px 25px; background-color: #3b82f6; color: white; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-flex; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.3s ease;">VISUALIZACIÓN GEOSPACIAL</a>
</div>

<style>
	.analytics-container {
		max-width: 1000px;
		margin: auto;
		padding: 2rem;
		background: white;
		border-radius: 12px;
	}

	h1 {
		text-align: center;
	}

	.subtitle {
		text-align: center;
		color: #666;
		margin-bottom: 20px;
	}

	#container {
		height: 550px;
	}

	.error {
		background: #fee2e2;
		padding: 10px;
		border-radius: 6px;
		text-align: center;
		color: red;
	}

	.info {
		margin-top: 20px;
		background: #f3f4f6;
		padding: 15px;
		border-radius: 8px;
	}
</style>