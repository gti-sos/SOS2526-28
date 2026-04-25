import { test, expect } from '@playwright/test';

//const BASE_URL = 'http://localhost:3000/beneficial-ownership-merchant-fleets';
const BASE_URL = 'http://localhost:5173/beneficial-ownership-merchant-fleets';

// MODO SERIAL
test.describe.configure({ mode: 'serial' });

test.describe('E2E TESTS: Beneficial Ownership Merchant Fleets', () => {

    test.beforeEach(async ({ page }) => {
        page.on('dialog', dialog => dialog.accept());
        await page.goto(BASE_URL);
        await expect(page.getByTestId('main-title')).toBeVisible();
        // Espero a que la red se pare y Svelte conecte los botones
        await page.waitForLoadState('networkidle');
    });

    test('1. DELETE (TODOS):Limpiar la BD', async ({ page }) => {
        await page.getByTestId('delete-all-btn').click();
        await expect(page.getByTestId('empty-row')).toBeVisible();
    });

    test('2. CARGA INICIAL: Cargar datos iniciales', async ({ page }) => {
        await page.getByTestId('load-data-btn').click();
        await expect(page.getByTestId('alert-message')).toContainText('Datos iniciales cargados con éxito');
    });

    test('3. GET (TODOS): Listar recursos', async ({ page }) => {
        const rows = page.locator('tbody tr');
        await expect(rows).not.toHaveCount(0);
        await expect(page.getByTestId('empty-row')).not.toBeVisible();
    });

    test('4. POST (RECURSO):Crear un recurso', async ({ page }) => {
        await page.getByTestId('create-year').fill('2050');
        await page.getByTestId('create-flag').fill('PaisTest');
        await page.getByTestId('create-owner').fill('PropTest');
        await page.getByTestId('create-ships').fill('150');
        await page.getByTestId('create-tons').fill('2000.5');
        await page.getByTestId('create-percent').fill('5.5');
        
        await page.getByTestId('create-btn').click();

        await expect(page.getByTestId('alert-message')).toContainText('Recurso creado correctamente');
        // Uso el ID dinámico de la fila que he creado para verificar que existe en la tabla
        await expect(page.getByTestId('row-2050-PaisTest')).toBeVisible();
    });

    test('5. GET (RECURSO):Buscar recurso concreto', async ({ page }) => {
        await page.getByTestId('search-year').fill('2050');
        await page.getByTestId('search-flag').fill('PaisTest');
        await page.getByTestId('search-owner').fill('PropTest');
        
        await page.getByTestId('search-btn').click();
        
        await expect(page.getByTestId('alert-message')).toContainText('Recurso encontrado');
        await expect(page.locator('tbody tr')).toHaveCount(1);
        await expect(page.getByTestId('row-2050-PaisTest')).toBeVisible();
    });

    test('6. PUT (RECURSO): Editar un recurso concreto', async ({ page }) => {
        // Busco la fila exacta y hago clic en su botón de editar
        const row = page.getByTestId('row-2050-PaisTest');
        await row.getByTestId('edit-btn').click();
        
        await expect(page).toHaveURL(/.*\/2050\/PaisTest\/PropTest/);
    });

    test('7. DELETE (RECURSO): Borrar recurso concreto', async ({ page }) => {
        const row = page.getByTestId('row-2050-PaisTest');
        await row.getByTestId('delete-single-btn').click();

        await expect(page.getByTestId('alert-message')).toContainText('Recurso borrado correctamente');
        // Compruebo que esa fila en concreto ya no existe en la vista
        await expect(page.getByTestId('row-2050-PaisTest')).not.toBeVisible();
    });
});