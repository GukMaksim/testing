import { test, expect } from '@playwright/test';

test.describe('Страница клиентов', () => {
	test('должна отображать список клиентов', async ({ page }) => {
		await page.goto('/customers');

		// Проверяем наличие таблицы клиентов
		const customersTable = await page.getByRole('table');
		await expect(customersTable).toBeVisible();

		// Проверяем заголовки столбцов
		const headers = await page.getByRole('columnheader').allTextContents();
		expect(headers).toContain('Компания');
		expect(headers).toContain('ЕДРПОУ');
		expect(headers).toContain('Город');
		expect(headers).toContain('Контактное лицо');
	});

	test('должна позволять фильтровать клиентов', async ({ page }) => {
		await page.goto('/customers');

		// Вводим текст в поле поиска
		const searchInput = await page.getByPlaceholder('Поиск по названию компании');
		await searchInput.fill('Test Company');

		// Проверяем, что список отфильтрован
		const rows = await page
			.getByRole('row')
			.filter({ hasText: /Test Company/ })
			.count();
		expect(rows).toBeGreaterThan(0);
	});

	test('должна позволять добавлять нового клиента', async ({ page }) => {
		await page.goto('/customers');

		// Нажимаем кнопку добавления
		await page.getByRole('button', { name: 'Добавить клиента' }).click();

		// Заполняем форму
		await page.getByLabel('Название компании').fill('New Test Company');
		await page.getByLabel('ЕДРПОУ').fill('98765432');
		await page.getByLabel('Город').fill('New Test City');
		await page.getByLabel('Адрес').fill('New Test Address');
		await page.getByLabel('Фамилия').fill('New Test');
		await page.getByLabel('Имя').fill('New Test');
		await page.getByLabel('Должность').fill('New Position');
		await page.getByLabel('Рабочий телефон').fill('+380501234567');
		await page.getByLabel('Рабочий email').fill('newtest@work.com');

		// Сохраняем
		await page.getByRole('button', { name: 'Сохранить' }).click();

		// Проверяем, что новый клиент появился в списке
		const newCustomerRow = await page.getByRole('row').filter({ hasText: /New Test Company/ });
		await expect(newCustomerRow).toBeVisible();
	});

	test('должна отображать ошибки валидации при добавлении клиента', async ({ page }) => {
		await page.goto('/customers');

		// Нажимаем кнопку добавления
		await page.getByRole('button', { name: 'Добавить клиента' }).click();

		// Пытаемся сохранить пустую форму
		await page.getByRole('button', { name: 'Сохранить' }).click();

		// Проверяем наличие сообщений об ошибках
		const errors = await page.getByText('Обязательное поле').count();
		expect(errors).toBeGreaterThan(0);
	});

	test('должна позволять редактировать клиента', async ({ page }) => {
		await page.goto('/customers');

		// Находим клиента для редактирования
		const customerRow = await page
			.getByRole('row')
			.filter({ hasText: /Test Company/ })
			.first();
		await customerRow.getByRole('button', { name: 'Редактировать' }).click();

		// Изменяем данные
		await page.getByLabel('Город').fill('Updated City');

		// Сохраняем изменения
		await page.getByRole('button', { name: 'Сохранить' }).click();

		// Проверяем, что изменения сохранились
		const updatedRow = await page.getByRole('row').filter({ hasText: /Updated City/ });
		await expect(updatedRow).toBeVisible();
	});
});
