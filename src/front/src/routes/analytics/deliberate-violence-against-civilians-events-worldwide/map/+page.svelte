<script>
	import { onMount } from 'svelte';

	let loading = true;
	let error = null;

	const API_URL = '/api/v1/deliberate-violence-against-civilians-events-worldwide';

	onMount(() => {
		initMap();
	});

	async function initMap() {
		try {
			// 1. Cargar datos
			let res = await fetch(`${API_URL}?limit=200`);
			let data = await res.json();

			if (data.length === 0) {
				await fetch(API_URL + '/loadInitialData');
				res = await fetch(`${API_URL}?limit=200`);
				data = await res.json();
			}

			// 2. Agrupar por país
			const countryStats = {};

			data.forEach((e) => {
				if (e.country) {
					countryStats[e.country] = (countryStats[e.country] || 0) + 1;
				}
			});

			// 3. Formato para Highcharts
			//ELS es El Salvador, pero el código ISO es SLV. Hago este arreglo rápido para que se vea bien en el mapa
            const countryFix = {
				ELS: 'SLV'
			};

			const mapData = Object.entries(countryStats).map(([code, value]) => ({
				code: countryFix[code] || code,
				value
			}));

			// 4. Importar Highcharts Maps
			const Highcharts = await import('highcharts');
			await import('highcharts/modules/map');

			const HC = Highcharts.default;

			// 5. Cargar mapa mundo
			const topology = await fetch(
				'https://code.highcharts.com/mapdata/custom/world.topo.json'
			).then((r) => r.json());

			// 6. Crear mapa
			HC.mapChart('container', {
				chart: {
					map: topology
				},

				title: {
					text: '🌍 Eventos de violencia por país'
				},

				mapNavigation: {
					enabled: true
				},

				colorAxis: {
					min: 0
				},

				series: [
					{
						name: 'Eventos',
						data: mapData,
						joinBy: ['iso-a3', 'code'],
						states: {
							hover: {
								color: '#a4edba'
							}
						},
						dataLabels: {
							enabled: true,
							format: '{point.code}'
						}
					}
				]
			});

			loading = false;
		} catch (e) {
			console.error(e);
			error = e.message;
			loading = false;
		}
	}
</script>

<div class="analytics-container">
	<h1>🗺️ Mapa de violencia contra civiles</h1>

	<div id="container"></div>

	{#if error}
		<p>❌ {error}</p>
	{/if}
</div>

<style>
	#container {
		height: 600px;
	}

	.analytics-container {
		max-width: 1000px;
		margin: auto;
		padding: 2rem;
		background: white;
		border-radius: 12px;
	}
</style>
