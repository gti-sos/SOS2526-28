import { test, expect } from '@playwright/test';

test.describe.serial('E2E - Deliberate Violence Events', () => {

    const BASE_PAGE = 'http://localhost:3000/deliberate-violence-against-civilians-events-worldwide';

    // =================================================
    // 1. LISTAR RECURSOS (y cargar datos iniciales)
    // =================================================
    test('1. Listar todos los recursos', async ({ page }) => {

        await page.goto(BASE_PAGE);

        await page.getByRole('button', { name: 'Cargar Datos Iniciales' }).click();

        await expect(page.locator('table tbody tr').first()).toBeVisible();

    });

    // =================================================
    // 2. CREAR RECURSO
    // =================================================
    test('2. Crear un recurso', async ({ page }) => {

        await page.goto(BASE_PAGE);

        const inputs = page.locator('.form-input');

        await inputs.nth(0).fill('10'); // día
        await inputs.nth(1).fill('2'); // mes
        await inputs.nth(2).fill('2099'); // año
        await inputs.nth(3).fill('TESTLAND'); // paí
        await inputs.nth(4).fill('TestRegion'); // región
        await inputs.nth(5).fill('TestCity'); // localidad
        await inputs.nth(6).fill('10'); // grado
        await inputs.nth(7).fill('20'); // minuto
        await inputs.nth(8).fill('30'); // segundo
        await inputs.nth(9).fill('N'); // dirección

        await page.getByRole('button', { name: 'Añadir' }).click();

        await expect(page.getByText('Evento creado correctamente')).toBeVisible();

    });

    // =================================================
    // 3. BUSCAR RECURSOS
    // =================================================
    test('3. Buscar recursos usando la API', async ({ page }) => {

        await page.goto(BASE_PAGE);

        const searchInputs = page.locator('.form-input');

        await searchInputs.nth(10).fill('2099'); // año búsqueda
        await searchInputs.nth(11).fill('2'); // mes búsqueda
        await searchInputs.nth(12).fill('10'); // dia búsqueda
        await searchInputs.nth(13).fill('TESTLAND'); // país búsqueda
        await searchInputs.nth(14).fill('TestRegion'); // región búsqueda

        await page.getByRole('button', { name: 'Buscar' }).click();

        await expect(page.locator('table tbody tr')).toHaveCount(1);

    });

    // =================================================
    // 4. EDITAR RECURSO (vista dinámica)
    // =================================================
    test('4. Editar recurso en vista separada', async ({ page }) => {

        await page.goto(BASE_PAGE);

        const row = page.locator('tr', { hasText: 'TESTLAND' });

        await row.getByRole('link', { name: 'Editar' }).click();

        await expect(page).toHaveURL(/TESTLAND\/2099\/2\/10/);

        await page.locator('input').nth(2).fill('EditedRegion');

        await page.getByRole('button', { name: 'Guardar Cambios' }).click();

        await expect(page).toHaveURL(BASE_PAGE);

    });

    // =================================================
    // 5. BORRAR RECURSO CONCRETO
    // =================================================
    test('5. Borrar un recurso concreto', async ({ page }) => {
        await page.goto(BASE_PAGE);

        const row = page.getByTestId('row-2099-TESTLAND');

        page.once('dialog', dialog => dialog.accept());

        await row.getByTestId('delete-single-btn').click();

        await expect(page.getByTestId('alert-message'))
            .toContainText('Evento borrado correctamente');

        await expect(page.getByTestId('row-2099-TESTLAND'))
            .not.toBeVisible();

    });



    // =================================================
    // 6. BORRAR TODOS LOS RECURSOS
    // =================================================
    test('6. Borrar todos los recursos', async ({ page }) => {

        await page.goto(BASE_PAGE);

        page.once('dialog', dialog => dialog.accept());

        await page.getByRole('button', { name: 'Borrar Todos' }).click();

        await expect(page.getByText('No hay datos disponibles en la base de datos.')).toBeVisible();

    });

});