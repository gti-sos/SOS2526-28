<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let country = $page.params.country;
	let year = $page.params.year;
	let month = $page.params.month;
	let day = $page.params.day;

	let loading = $state(true);
	let errorMsg = $state('');
	let successMsg = $state('');

	let formData = $state({
		region: '',
		locality: '',
		degree: '',
		minute: '',
		second: '',
		direction: ''
	});

	const API_URL = '/api/v1/deliberate-violence-against-civilians-events-worldwide';

	onMount(async () => {
		try {
			const res = await fetch(`${API_URL}/${country}/${year}/${month}/${day}`);

			if (!res.ok) {
				errorMsg = "No se pudo encontrar el evento.";
				return;
			}

			const data = await res.json();
			formData = { ...data };

		} catch (err) {
			errorMsg = "Error de conexión con la API.";
		} finally {
			loading = false;
		}
	});

	async function saveChanges() {

		loading = true;

		const updatedEvent = {
			event_type: "Incident",
			campaign_identifier: "",
			event_reporting: "Eyewitness Account",
			start_day: parseInt(day),
			start_month: parseInt(month),
			start_year: parseInt(year),
			end_day: 99,
			end_month: 99,
			end_year: 9999,
			country: country,
			region: formData.region,
			district: "",
			locality: formData.locality,
			degree: parseInt(formData.degree),
			minute: parseInt(formData.minute),
			second: parseInt(formData.second),
			direction: formData.direction
		};

		try {

			const res = await fetch(`${API_URL}/${country}/${year}/${month}/${day}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(updatedEvent)
			});

			if (!res.ok) {
				errorMsg = "Error al actualizar el evento.";
				loading = false;
				return;
			}

			successMsg = "✅ Cambios guardados correctamente.";

			setTimeout(() => {
				goto('/deliberate-violence-against-civilians-events-worldwide');
			}, 1500);

		} catch (err) {
			errorMsg = "Error de conexión.";
		}

		loading = false;
	}
</script>

<div class="container" style="max-width:800px;">

	<button class="action-btn load-btn" on:click={() => goto('/deliberate-violence-against-civilians-events-worldwide')}>
	⬅ Volver a la lista
	</button>

	<h1>✏️ Editar Evento</h1>

	{#if errorMsg}
		<div class="error-box">{errorMsg}</div>
	{/if}

	{#if successMsg}
		<div class="success-box">{successMsg}</div>
	{/if}

	{#if loading}

		<p>Cargando datos...</p>

	{:else}

	<div class="edit-grid">

		<div>
			<label>País</label>
			<input value={country} disabled>
		</div>

		<div>
			<label>Fecha</label>
			<input value={`${day}/${month}/${year}`} disabled>
		</div>

		<div>
			<label>Región</label>
			<input bind:value={formData.region}>
		</div>

		<div>
			<label>Localidad</label>
			<input bind:value={formData.locality}>
		</div>

		<div>
			<label>Grados</label>
			<input type="number" bind:value={formData.degree}>
		</div>

		<div>
			<label>Minutos</label>
			<input type="number" bind:value={formData.minute}>
		</div>

		<div>
			<label>Segundos</label>
			<input type="number" bind:value={formData.second}>
		</div>

		<div>
			<label>Dirección</label>
			<input bind:value={formData.direction}>
		</div>

	</div>

	<div style="margin-top:20px;">
		<button class="action-btn create-btn" on:click={saveChanges}>
			Guardar Cambios
		</button>
	</div>

	{/if}

</div>

<style>

.container{
	margin:auto;
	background:white;
	padding:25px;
	border-radius:10px;
	box-shadow:0 5px 15px rgba(0,0,0,0.1);
}

.edit-grid{
	display:grid;
	grid-template-columns:1fr 1fr;
	gap:12px;
	margin-top:20px;
}

label{
	font-weight:bold;
	display:block;
	margin-bottom:4px;
}

input{
	padding:8px;
	border:1px solid #ccc;
	border-radius:4px;
	width:100%;
}

input:disabled{
	background:#f3f4f6;
}

.action-btn{
	padding:8px 15px;
	border:none;
	border-radius:5px;
	cursor:pointer;
	font-weight:bold;
	color:white;
	transition:opacity 0.2s;
}

.action-btn:hover{
	opacity:0.85;
}

.load-btn{
	background:#2563eb;
}

.create-btn{
	background:#16a34a;
}

.error-box{
	color:#b91c1c;
	background:#fee2e2;
	padding:10px;
	border-radius:6px;
	margin:15px 0;
	font-weight:bold;
}

.success-box{
	color:#15803d;
	background:#dcfce7;
	padding:10px;
	border-radius:6px;
	margin:15px 0;
	font-weight:bold;
}

</style>