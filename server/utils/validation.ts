import type { Customer, Deal } from '../../src/types/index.js';

export class ValidationException extends Error {
	constructor(public errors: string[]) {
		super('Validation failed');
		this.name = 'ValidationException';
	}
}

export function validateCustomer(customer: Omit<Customer, 'id'>): void {
	console.log('Validating customer:', customer);
	const errors: string[] = [];

	// Проверяем наличие объекта
	if (!customer) {
		throw new ValidationException(['Отсутствуют данные клиента']);
	}

	// Проверяем обязательное поле
	if (!customer.companyName || !customer.companyName.trim()) {
		errors.push('Название компании обязательно для заполнения');
	}

	// Проверяем опциональные поля только если они не пустые
	if (customer.edrpou?.trim() && !/^\d{8}$/.test(customer.edrpou.trim())) {
		errors.push('ЕДРПОУ должен содержать 8 цифр');
	}

	if (customer.inn?.trim() && !/^\d{10}$/.test(customer.inn.trim())) {
		errors.push('ИНН ��олжен содержать 10 цифр');
	}

	if (customer.contactWorkPhone?.trim() && !/^\+380\d{9}$/.test(customer.contactWorkPhone.trim())) {
		errors.push('Рабочий телефон должен быть в формате +380XXXXXXXXX');
	}

	if (customer.contactPersonalPhone?.trim() && !/^\+380\d{9}$/.test(customer.contactPersonalPhone.trim())) {
		errors.push('Личный телефон должен быть в формате +380XXXXXXXXX');
	}

	if (customer.contactWorkEmail?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.contactWorkEmail.trim())) {
		errors.push('Неверный формат рабочего email');
	}

	if (
		customer.contactPersonalEmail?.trim() &&
		!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.contactPersonalEmail.trim())
	) {
		errors.push('Неверный формат личного email');
	}

	console.log('Validation errors:', errors);

	if (errors.length > 0) {
		throw new ValidationException(errors);
	}

	console.log('Validation passed successfully');
}

export function validateDeal(deal: Omit<Deal, 'id'>): void {
	console.log('Validating deal:', deal);
	const errors: string[] = [];

	if (!deal) {
		throw new ValidationException(['Отсутствуют данные сделки']);
	}

	if (!deal.customerId) {
		errors.push('Не указан клиент');
	}

	if (!deal.description?.trim()) {
		errors.push('Не указано описание');
	}

	if (typeof deal.amount !== 'number' || deal.amount < 0) {
		errors.push('Сумма должна быть положительным числом');
	}

	if (typeof deal.costPrice !== 'number' || deal.costPrice < 0) {
		errors.push('Себестоимость должна быть положительным числом');
	}

	if (!deal.date?.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(deal.date)) {
		errors.push('Дата должна быть в формате YYYY-MM-DD');
	}

	if (!deal.status?.trim() || !['new', 'in_progress', 'completed', 'cancelled'].includes(deal.status)) {
		errors.push('Некорректный статус');
	}

	if (typeof deal.hasCommercialProposal !== 'boolean') {
		errors.push('Не указано наличие коммерческого предложения');
	}

	if (typeof deal.isPaid !== 'boolean') {
		errors.push('Не указан статус оплаты');
	}

	if (typeof deal.isDelivered !== 'boolean') {
		errors.push('Не указан статус доставки');
	}

	console.log('Validation errors:', errors);

	if (errors.length > 0) {
		throw new ValidationException(errors);
	}

	console.log('Validation passed successfully');
}
