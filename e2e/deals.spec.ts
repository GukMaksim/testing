import { test, expect } from '@playwright/test';

test.describe('Страница сделок', () => {
	test('должна отображать список сделок', async ({ page }) => {
		await page.goto('/deals');

		// Проверяем наличие таблицы сделок
		const dealsTable = await page.getByRole('table');
		await expect(dealsTable).toBeVisible();

		// Проверяем заголовки столбцов
		const headers = await page.getByRole('columnheader').allTextContents();
		expect(headers).toContain('Дата');
		expect(headers).toContain('Клиент');
		expect(headers).toContain('Описание');
		expect(headers).toContain('Сумма');
		expect(headers).toContain('Себестоимость');
		expect(headers).toContain('КП');
		expect(headers).toContain('Оплата');
		expect(headers).toContain('Доставка');
		expect(headers).toContain('Пресейл');
		expect(headers).toContain('Статус');
	});

	test('должна позволять фильтровать сделки', async ({ page }) => {
		await page.goto('/deals');

		// Вводим текст в поле поиска
		const searchInput = await page.getByPlaceholder('Поиск по описанию');
		await searchInput.fill('Test Deal');

		// Проверяем, что список отфильтрован
		const rows = await page
			.getByRole('row')
			.filter({ hasText: /Test Deal/ })
			.count();
		expect(rows).toBeGreaterThan(0);
	});

	test('должна позволять добавлять новую сделку', async ({ page }) => {
		await page.goto('/deals');

		// Нажимаем кнопку добавления
		await page.getByRole('button', { name: 'Добавить сделку' }).click();

		// Заполняем форму
		await page.getByLabel('Клиент').selectOption({ label: 'Test Company' });
		await page.getByLabel('Описание').fill('New Test Deal');
		await page.getByLabel('Сумма').fill('2000');
		await page.getByLabel('Себестоимость').fill('1500');
		await page.getByLabel('Дата').fill('2024-01-01');
		await page.getByLabel('Статус').selectOption('new');
		await page.getByLabel('КП').check();
		await page.getByLabel('Оплата').check();
		await page.getByLabel('Доставка').check();
		await page.getByLabel('Пресейл').fill('New Test Presale');

		// Сохраняем
		await page.getByRole('button', { name: 'Сохранить' }).click();

		// Проверяем, что новая сделка появилась в списке
		const newDealRow = await page.getByRole('row').filter({ hasText: /New Test Deal/ });
		await expect(newDealRow).toBeVisible();
	});

	test('должна отображать ошибки валидации при добавлении сделки', async ({ page }) => {
		await page.goto('/deals');

		// Нажимаем кнопку добавления
		await page.getByRole('button', { name: 'Добавить сделку' }).click();

		// Пытаемся сохранить пустую форму
		await page.getByRole('button', { name: 'Сохранить' }).click();

		// Проверяем наличие сообщений об ошибках
		const errors = await page.getByText('Обязательное поле').count();
		expect(errors).toBeGreaterThan(0);
	});

	test('должна позволять редактировать сделку', async ({ page }) => {
		await page.goto('/deals');

		// Находим сделку для редактирования
		const dealRow = await page
			.getByRole('row')
			.filter({ hasText: /Test Deal/ })
			.first();
		await dealRow.getByRole('button', { name: 'Редактировать' }).click();

		// Изменяем данные
		await page.getByLabel('Сумма').fill('3000');
		await page.getByLabel('Статус').selectOption('completed');

		// Сохраняем изменения
		await page.getByRole('button', { name: 'Сохранить' }).click();

		// Проверяем, что изменения сохранились
		const updatedRow = await page.getByRole('row').filter({ hasText: /3000/ });
		await expect(updatedRow).toBeVisible();
	});

	test('должна корректно работать с пагинацией', async ({ page }) => {
		await page.goto('/deals');

		// Проверяем наличие элементов пагинации
		const pagination = await page.getByRole('navigation');
		await expect(pagination).toBeVisible();

		// Переходим на следующую страницу
		await page.getByRole('button', { name: 'Следующая' }).click();

		// Проверяем, что URL обновился
		await expect(page).toHaveURL(/.*page=2/);

		// Проверяем, что данные обновились
		const dealsTable = await page.getByRole('table');
		await expect(dealsTable).toBeVisible();
	});
});
