import { Customer, Deal, ApiResponse } from '../types';

const API_URL = 'http://localhost:3001/api';

const handleResponse = async <T>(response: Response): Promise<T> => {
	if (!response.ok) {
		const errorData = await response.json().catch(() => ({ message: 'Неизвестная ошибка' }));
		throw new Error(errorData.error || errorData.message || 'Произошла ошибка при выполнении запроса');
	}

	// Для статуса 204 (No Content) возвращаем undefined
	if (response.status === 204) {
		return undefined as T;
	}

	const json = await response.json().catch(() => ({ data: null }));
	if (!json.data && response.status !== 204) {
		throw new Error('Получены некорректные данные от сервера');
	}
	return json.data;
};

export const api = {
	// Customers
	async getCustomers(): Promise<Customer[]> {
		const response = await fetch(`${API_URL}/customers`);
		return handleResponse<Customer[]>(response);
	},

	async addCustomer(customer: Omit<Customer, 'id'>): Promise<Customer> {
		const response = await fetch(`${API_URL}/customers`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(customer),
		});
		return handleResponse<Customer>(response);
	},

	async updateCustomer(customer: Customer): Promise<Customer> {
		const response = await fetch(`${API_URL}/customers/${customer.id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(customer),
		});
		return handleResponse<Customer>(response);
	},

	async deleteCustomer(customerId: string): Promise<void> {
		const response = await fetch(`${API_URL}/customers/${customerId}`, {
			method: 'DELETE',
		});
		return handleResponse<void>(response);
	},

	// Deals
	async getDeals(): Promise<Deal[]> {
		const response = await fetch(`${API_URL}/deals`);
		return handleResponse<Deal[]>(response);
	},

	async addDeal(deal: Omit<Deal, 'id'>): Promise<Deal> {
		const response = await fetch(`${API_URL}/deals`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(deal),
		});
		return handleResponse<Deal>(response);
	},

	async updateDeal(deal: Deal): Promise<Deal> {
		const response = await fetch(`${API_URL}/deals/${deal.id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(deal),
		});
		return handleResponse<Deal>(response);
	},

	async deleteDeal(dealId: string): Promise<void> {
		const response = await fetch(`${API_URL}/deals/${dealId}`, {
			method: 'DELETE',
		});
		return handleResponse<void>(response);
	},
};
