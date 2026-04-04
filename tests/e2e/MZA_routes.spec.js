import { test, expect } from '@playwright/test';

// URL base de la aplicación en local
const app = 'http://localhost:3000';

// Datos del registro de prueba
// Clave primaria: (company_id=9999, year=1900) — poco probable que exista en datos reales
const TEST = {
    company_id:        '9999',
    company_name:      'TestCorp_MZA_E2E',
    industry:          'Testing',
    industry_edited:   'Software',
    region:            'Europe',
    year:              '1900',
    revenue:           '500',
    profit_margin:     '12.5',
    market_cap:        '1000',
    esg_environmental: '70',
    esg_social:        '65',
    esg_governance:    '80',
    carbon_emission:   '10000',
    water_usage:       '5000',
    energy_consumption:'20000',
};

const ROUTE = '/company-esg-scores-financial-performances';

// Los tests se ejecutan en orden (son dependientes entre sí)
test.describe.configure({ mode: 'serial' });

test.describe('MZA — company-esg-scores-financial-performances', () => {

    // ─────────────────────────────────────────────────────────────
    // TEST 1: La página principal carga correctamente
    // ─────────────────────────────────────────────────────────────
    test('1. La página principal carga correctamente', async ({ page }) => {
        await page.goto(app + ROUTE);

        // Encabezado principal visible
        await expect(page.getByRole('heading', { name: /Puntuaciones ESG/i })).toBeVisible();

        // Las tres secciones están presentes
        await expect(page.getByText('Añadir Nuevo Registro')).toBeVisible();
        await expect(page.getByText('Buscar Registros')).toBeVisible();
        await expect(page.getByText('Registros en la Base de Datos')).toBeVisible();

        // Cargar datos iniciales para tener registros disponibles en los tests siguientes
        page.once('dialog', dialog => dialog.accept());
        await page.getByRole('button', { name: /Cargar Datos Iniciales/i }).click();

        // Esperar a que la tabla se rellene
        await expect(page.locator('table tbody tr').first()).toBeVisible();
    });

    // ─────────────────────────────────────────────────────────────
    // TEST 2: Crear un nuevo registro usando el formulario
    // ─────────────────────────────────────────────────────────────
    test('2. Se puede crear un nuevo registro', async ({ page }) => {
        await page.goto(app + ROUTE);

        // Sección de creación = primer .endpoint-group
        const createSection = page.locator('.endpoint-group').nth(0);

        await createSection.locator('input[placeholder="Ej: 1"]').fill(TEST.company_id);
        await createSection.locator('input[placeholder="Ej: Company_1"]').fill(TEST.company_name);
        await createSection.locator('input[placeholder="Ej: Retail"]').fill(TEST.industry);
        await createSection.locator('input[placeholder="Ej: Latin America"]').fill(TEST.region);
        await createSection.locator('input[placeholder="Ej: 2024"]').fill(TEST.year);
        await createSection.locator('input[placeholder="Ej: 459.2"]').fill(TEST.revenue);
        await createSection.locator('input[placeholder="Ej: 6.0"]').fill(TEST.profit_margin);
        await createSection.locator('input[placeholder="Ej: 337.5"]').fill(TEST.market_cap);
        await createSection.locator('input[placeholder="Ej: 60.7"]').fill(TEST.esg_environmental);
        await createSection.locator('input[placeholder="Ej: 33.5"]').fill(TEST.esg_social);
        await createSection.locator('input[placeholder="Ej: 76.8"]').fill(TEST.esg_governance);
        await createSection.locator('input[placeholder="Ej: 35577.4"]').fill(TEST.carbon_emission);
        await createSection.locator('input[placeholder="Ej: 17788.7"]').fill(TEST.water_usage);
        await createSection.locator('input[placeholder="Ej: 71154.7"]').fill(TEST.energy_consumption);

        // Hacer clic en "Añadir Registro"
        await createSection.getByRole('button', { name: /Añadir Registro/i }).click();

        // Mensaje de éxito visible
        await expect(page.locator('.msg-success')).toBeVisible();
        await expect(page.locator('.msg-success')).toContainText(TEST.company_name);

        // El registro aparece en la tabla
        await expect(page.locator('table tbody').getByText(TEST.company_name)).toBeVisible();
    });

    // ─────────────────────────────────────────────────────────────
    // TEST 3: Buscar un registro usando los filtros
    // ─────────────────────────────────────────────────────────────
    test('3. Se puede buscar un registro por nombre de empresa', async ({ page }) => {
        await page.goto(app + ROUTE);

        // Sección de búsqueda = segundo .endpoint-group
        const searchSection = page.locator('.endpoint-group').nth(1);

        // Escribir nombre de la empresa en el campo de búsqueda
        await searchSection.locator('input[placeholder="Ej: Company_1"]').fill(TEST.company_name);

        // Hacer clic en "Buscar"
        await searchSection.getByRole('button', { name: /Buscar/i }).click();

        // La tabla muestra el registro creado
        await expect(page.locator('table tbody').getByText(TEST.company_name)).toBeVisible();

        // La tabla solo tiene una fila (búsqueda exacta)
        await expect(page.locator('table tbody tr')).toHaveCount(1);

        // "Limpiar búsqueda" restaura todos los registros
        await searchSection.getByRole('button', { name: /Limpiar búsqueda/i }).click();
        await expect(page.locator('table tbody tr').first()).toBeVisible();
        const totalRows = await page.locator('table tbody tr').count();
        expect(totalRows).toBeGreaterThan(1);
    });

    // ─────────────────────────────────────────────────────────────
    // TEST 4: Editar un registro existente
    // ─────────────────────────────────────────────────────────────
    test('4. Se puede editar un registro y guardar los cambios', async ({ page }) => {
        await page.goto(app + ROUTE);

        // Buscar el registro de prueba para localizarlo fácilmente en la tabla
        const searchSection = page.locator('.endpoint-group').nth(1);
        await searchSection.locator('input[placeholder="Ej: Company_1"]').fill(TEST.company_name);
        await searchSection.getByRole('button', { name: /Buscar/i }).click();
        await expect(page.locator('table tbody').getByText(TEST.company_name)).toBeVisible();

        // Hacer clic en "Editar" de esa fila
        await page.locator('table tbody tr').first().getByRole('link', { name: /Editar/i }).click();

        // Verificar que estamos en la página de edición
        await expect(page.getByRole('heading', { name: /Editar Registro/i })).toBeVisible();

        // Cambiar el campo Industria
        const industriaField = page.locator('.form-field', {
            has: page.locator('label', { hasText: 'Industria' }),
        }).locator('input');
        await industriaField.fill(TEST.industry_edited);

        // Guardar cambios
        await page.getByRole('button', { name: /Guardar cambios/i }).click();

        // Mensaje de éxito visible
        await expect(page.locator('.msg-success')).toBeVisible();
        await expect(page.locator('.msg-success')).toContainText(/actualizado correctamente/i);

        // Redirige automáticamente al listado en ~1.5s
        await page.waitForURL(`**${ROUTE}`, { timeout: 5000 });
        await expect(page.getByRole('heading', { name: /Puntuaciones ESG/i })).toBeVisible();

        // El valor actualizado aparece en la tabla
        await expect(page.locator('table tbody').getByText(TEST.industry_edited)).toBeVisible();
    });

    // ─────────────────────────────────────────────────────────────
    // TEST 5: Eliminar un registro de la tabla
    // ─────────────────────────────────────────────────────────────
    test('5. Se puede eliminar un registro de la tabla', async ({ page }) => {
        await page.goto(app + ROUTE);

        // Buscar el registro de prueba
        const searchSection = page.locator('.endpoint-group').nth(1);
        await searchSection.locator('input[placeholder="Ej: Company_1"]').fill(TEST.company_name);
        await searchSection.getByRole('button', { name: /Buscar/i }).click();

        const testRow = page.locator('table tbody tr').first();
        await expect(testRow.getByText(TEST.company_name)).toBeVisible();

        // Aceptar el diálogo de confirmación antes de hacer clic
        page.once('dialog', dialog => dialog.accept());

        // Hacer clic en "Eliminar" de esa fila
        await testRow.getByRole('button', { name: /Eliminar/i }).click();

        // Mensaje de éxito visible
        await expect(page.locator('.msg-success')).toBeVisible();

        // El registro ya no aparece en la tabla
        await expect(page.locator('table tbody').getByText(TEST.company_name)).not.toBeVisible();
    });

});
