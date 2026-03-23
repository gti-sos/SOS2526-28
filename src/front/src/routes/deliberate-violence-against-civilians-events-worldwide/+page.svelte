<script>
	import { onMount } from 'svelte';

	/** @type {any[]} */
	let events = $state([]);
	let errorMsg = $state('');
	let successMsg = $state('');

	// Variables del formulario (solo lo que se pide al usuario)
	let newStartDay = $state('');
	let newStartMonth = $state('');
	let newStartYear = $state('');
	let newCountry = $state('');
	let newRegion = $state('');
	let newLocality = $state('');
	let newDegree = $state('');
	let newMinute = $state('');
	let newSecond = $state('');
	let newDirection = $state('');

	// API
	const API_URL = '/api/v1/deliberate-violence-against-civilians-events-worldwide';

	// GET: Obtener todos los eventos
	async function getEvents() {
		try {
			const res = await fetch(API_URL);
			if (res.ok) {
				events = await res.json();
				errorMsg = '';
			} else {
				errorMsg = 'Error al cargar los datos. Código: ' + res.status;
			}
		} catch (error) {
			errorMsg = 'No se pudo conectar con la API.';
		}
	}

	// BOTÓN: Cargar datos iniciales
	async function loadInitialData() {
		try {
			const res = await fetch(API_URL + '/loadInitialData');
			if (res.ok) {
				successMsg = '✅ Datos iniciales cargados con éxito.';
				errorMsg = '';
				getEvents();
			} else {
				errorMsg = 'Error al cargar datos iniciales.';
			}
		} catch (error) {
			errorMsg = 'Error de conexión.';
		}
		setTimeout(() => (successMsg = ''), 3000);
	}

	// BOTÓN: Borrar todos los datos
	async function deleteAll() {
		if (!confirm('¿Estás seguro de que quieres borrar TODOS los datos?')) return;

		try {
			const res = await fetch(API_URL, { method: 'DELETE' });
			if (res.ok) {
				successMsg = '✅ Todos los datos han sido borrados.';
				errorMsg = '';
				getEvents();
			} else {
				errorMsg = 'Error al borrar los datos.';
			}
		} catch (error) {
			errorMsg = 'Error de conexión.';
		}
		setTimeout(() => (successMsg = ''), 3000);
	}

	// FORMULARIO: Crear nuevo evento
	async function createEvent() {
		if (
			!newStartDay ||
			!newStartMonth ||
			!newStartYear ||
			!newCountry ||
			!newRegion ||
			!newLocality ||
			!newDegree ||
			!newMinute ||
			!newSecond ||
			!newDirection
		) {
			errorMsg = '⚠️ Por favor, rellena todos los campos.';
			setTimeout(() => (errorMsg = ''), 3000);
			return;
		}

		const newEvent = {
			event_type: "Incident",
			campaign_identifier: "",
			event_reporting: "Eyewitness Account",
			start_day: parseInt(newStartDay),
			start_month: parseInt(newStartMonth),
			start_year: parseInt(newStartYear),
			end_day: 99,
			end_month: 99,
			end_year: 9999,
			country: newCountry,
			region: newRegion,
			district: "",
			locality: newLocality,
			degree: parseInt(newDegree),
			minute: parseInt(newMinute),
			second: parseInt(newSecond),
			direction: newDirection
		};

		try {
			const res = await fetch(API_URL, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newEvent)
			});

			if (res.status === 201) {
				successMsg = '✅ Evento creado correctamente.';
				errorMsg = '';
				getEvents();

				// Limpiar formulario
				newStartDay = '';
				newStartMonth = '';
				newStartYear = '';
				newCountry = '';
				newRegion = '';
				newLocality = '';
				newDegree = '';
				newMinute = '';
				newSecond = '';
				newDirection = '';
			} else if (res.status === 409) {
				errorMsg = '⚠️ Error: El recurso ya existe (Conflicto).';
			} else {
				errorMsg = 'Error al crear el recurso.';
			}
		} catch (error) {
			errorMsg = 'Error de conexión.';
		}
		setTimeout(() => (successMsg = ''), 3000);
	}

	// BORRAR un evento concreto
	async function deleteEvent(e) {
		if (!confirm('¿Seguro que quieres borrar este evento?')) return;

		const url = `${API_URL}/${e.country}/${e.start_year}/${e.start_month}/${e.start_day}`;

		try {
			const res = await fetch(url, { method: 'DELETE' });
			if (res.ok) {
				successMsg = 'Evento borrado correctamente';
				errorMsg = '';
				getEvents();
			} else {
				errorMsg = 'Error al borrar el evento';
			}
		} catch (error) {
			errorMsg = 'Error de conexión';
		}

		setTimeout(() => (successMsg = ''), 3000);
	}

	onMount(() => {
		getEvents();
	});
</script>

<div class="container" style="max-width: 1100px;">
	<h1>⚠️ Deliberate Violence Against Civilians Events Worldwide</h1>

	{#if errorMsg}
		<div style="color:#b91c1c; margin-bottom:15px; background:#fee2e2; padding:10px; border-radius:6px; font-weight:bold;">
			{errorMsg}
		</div>
	{/if}
	{#if successMsg}
		<div style="color:#15803d; margin-bottom:15px; background:#dcfce7; padding:10px; border-radius:6px; font-weight:bold;">
			{successMsg}
		</div>
	{/if}

	<div class="endpoint-group" style="background: var(--bg-color); padding:20px; border-radius:8px; border:1px solid var(--border-color);">
		<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
			<h3>➕ Añadir Nuevo Evento</h3>
			<div>
				<button on:click={loadInitialData} class="action-btn load-btn">Cargar Datos Iniciales</button>
				<button on:click={deleteAll} class="action-btn delete-btn">Borrar Todos</button>
			</div>
		</div>

		<div style="display:grid; grid-template-columns: repeat(5,1fr); gap:10px;">
			<input type="number" bind:value={newStartDay} placeholder="Día" class="form-input"/>
			<input type="number" bind:value={newStartMonth} placeholder="Mes" class="form-input"/>
			<input type="number" bind:value={newStartYear} placeholder="Año" class="form-input"/>
			<input bind:value={newCountry} placeholder="País" class="form-input"/>
			<input bind:value={newRegion} placeholder="Región" class="form-input"/>
			<input bind:value={newLocality} placeholder="Localidad" class="form-input"/>
			<input type="number" bind:value={newDegree} placeholder="Grados" class="form-input"/>
			<input type="number" bind:value={newMinute} placeholder="Minutos" class="form-input"/>
			<input type="number" bind:value={newSecond} placeholder="Segundos" class="form-input"/>
			<input bind:value={newDirection} placeholder="Dirección" class="form-input"/>
			<button on:click={createEvent} class="action-btn create-btn">Añadir</button>
		</div>
	</div>

	<div class="endpoint-group">
		<h3>📊 Listado de Eventos</h3>
		<div style="overflow-x:auto;">
			<table style="width:100%; text-align:left; border-collapse:collapse; margin-top:15px;">
				<thead>
					<tr style="background-color: var(--primary-color); color:white;">
						<th style="padding:12px;">País</th>
						<th style="padding:12px;">Fecha</th>
						<th style="padding:12px;">Localidad</th>
						<th style="padding:12px;">Tipo de evento</th>
						<th style="padding:12px;"></th>
					</tr>
				</thead>
				<tbody>
					{#if events.length === 0}
						<tr>
							<td colspan="5" style="text-align:center; padding:20px;">No hay datos disponibles en la base de datos.</td>
						</tr>
					{:else}
						{#each events as e}
							<tr style="border-bottom:1px solid var(--border-color);">
								<td style="padding:12px;">{e.country}</td>
								<td style="padding:12px;">{e.start_day}/{e.start_month}/{e.start_year}</td>
								<td style="padding:12px;">{e.locality}</td>
								<td style="padding:12px;">{e.event_type}</td>
								<td style="padding:12px;">
									<button class="action-btn delete-btn" on:click={() => deleteEvent(e)}>Borrar</button>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>

<style>
	.action-btn { padding:8px 15px; border:none; border-radius:5px; cursor:pointer; font-weight:bold; color:white; transition: opacity 0.2s;}
	.action-btn:hover { opacity:0.8; }
	.load-btn { background-color:#2563eb; }
	.delete-btn { background-color:#dc2626; }
	.create-btn { background-color:#16a34a; }
	.form-input { padding:8px; border:1px solid #ccc; border-radius:4px; width:100%; }
</style>