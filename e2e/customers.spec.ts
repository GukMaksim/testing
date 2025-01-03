import { test, expect } from '@playwright/test';

test.describe('Сторінка клієнтів', () => {
	test('повинна відображати список клієнтів', async ({ page }) => {
		await page.goto('/customers');

		// Проверяем наличие таблицы клиентов
		const customersTable = await page.getByRole('table');
		await expect(customersTable).toBeVisible();

		// Проверяем заголовки столбцов
		const headers = await page.getByRole('columnheader').allTextContents();
		expect(headers).toContain('Компанія');
		expect(headers).toContain('ЄДРПОУ');
		expect(headers).toContain('Місто');
		expect(headers).toContain('Контактна особа');
	});

	test('повинна дозволяти фільтрувати клієнтів', async ({ page }) => {
		await page.goto('/customers');

		// Вводим текст в поле поиска
		const searchInput = await page.getByPlaceholder('Пошук по назві компанії');
		await searchInput.fill('Test Company');

		// Проверяем, что список отфильтрован
		const rows = await page
			.getByRole('row')
			.filter({ hasText: /Test Company/ })
			.count();
		expect(rows).toBeGreaterThan(0);
	});

	test('повинна дозволяти додавати нового клієнта', async ({ page }) => {
		await page.goto('/customers');

		// Нажимаем кнопку добавления
		await page.getByRole('button', { name: 'Додати клієнта' }).click();

		// Заполняем форму
		await page.getByLabel('Назва компанії').fill('New Test Company');
		await page.getByLabel('ЄДРПОУ').fill('98765432');
		await page.getByLabel('Місто').fill('New Test City');
		await page.getByLabel('Адреса').fill('New Test Address');
		await page.getByLabel('Прізвище контактної особи').fill('New Test');
		await page.getByLabel('Ім\'я').fill('New Test');
		await page.getByLabel('Посада').fill('New Position');
		await page.getByLabel('Робочий телефон').fill('+380501234567');
		await page.getByLabel('Робочий email').fill('newtest@work.com');

		// Сохраняем
		await page.getByRole('button', { name: 'Сохранить' }).click();

		// Проверяем, что новый клиент появился в списке
		const newCustomerRow = await page.getByRole('row').filter({ hasText: /New Test Company/ });
		await expect(newCustomerRow).toBeVisible();
	});

	test('повинна відображати помилки валідації при додаванні клієнта', async ({ page }) => {
		await page.goto('/customers');

		// Нажимаем кнопку добавления
		await page.getByRole('button', { name: 'Добавить клиента' }).click();

		// Пытаемся сохранить пустую форму
		await page.getByRole('button', { name: 'Зберегти' }).click();

		// Проверяем наличие сообщений об ошибках
		const errors = await page.getByText('Обов\'язкове поле').count();
		expect(errors).toBeGreaterThan(0);
	});

	test('повинна дозволяти редагувати клієнта', async ({ page }) => {
		await page.goto('/customers');

		// Находим клиента для редактирования
		const customerRow = await page
			.getByRole('row')
			.filter({ hasText: /Test Company/ })
			.first();
		await customerRow.getByRole('button', { name: 'Редагувати' }).click();

		// Изменяем данные
		await page.getByLabel('Місто').fill('Updated City');

		// Сохраняем изменения
		await page.getByRole('button', { name: 'Зберегти' }).click();

		// Проверяем, что изменения сохранились
		const updatedRow = await page.getByRole('row').filter({ hasText: /Updated City/ });
		await expect(updatedRow).toBeVisible();
	});
});
