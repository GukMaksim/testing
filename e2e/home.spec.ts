import { test, expect } from '@playwright/test';

test.describe('Главная страница', () => {
	test('должна отображать список последних сделок', async ({ page }) => {
		await page.goto('/');

		// Проверяем наличие таблицы сделок
		const dealsTable = await page.getByRole('table');
		await expect(dealsTable).toBeVisible();

		// Проверяем заголовки столбцов
		const headers = await page.getByRole('columnheader').allTextContents();
		expect(headers).toContain('Дата');
		expect(headers).toContain('Клиент');
		expect(headers).toContain('Описание');
		expect(headers).toContain('Сумма');
		expect(headers).toContain('Статус');
	});

	test('должна позволять переходить к информации о клиенте', async ({ page }) => {
		await page.goto('/');

		// Кликаем по имени клиента в первой строке
		const firstCustomerLink = await page
			.getByRole('cell')
			.filter({ hasText: /Test Company/ })
			.first();
		await firstCustomerLink.click();

		// Проверяем, что URL изменился на страницу клиента
		await expect(page).toHaveURL(/.*\/customers\/\d+/);

		// Проверяем, что отображается информация о клиенте
		const customerInfo = await page.getByRole('heading', { name: /Test Company/ });
		await expect(customerInfo).toBeVisible();
	});

	test('должна позволять переходить к информации о сделке', async ({ page }) => {
		await page.goto('/');

		// Кликаем по описанию сделки в первой строке
		const firstDealLink = await page
			.getByRole('cell')
			.filter({ hasText: /Test Deal/ })
			.first();
		await firstDealLink.click();

		// Проверяем, что URL изменился на страницу сделки
		await expect(page).toHaveURL(/.*\/deals\/\d+/);

		// Проверяем, что отображается информация о сделке
		const dealInfo = await page.getByRole('heading', { name: /Test Deal/ });
		await expect(dealInfo).toBeVisible();
	});
});
