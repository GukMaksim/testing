import { Customer, Deal } from '../../src/types';

export interface DatabaseConfig {
	filename: string;
}

export interface ApiError {
	message: string;
	status: number;
	details?: unknown;
}

export interface ApiResponse<T> {
	data?: T;
	error?: ApiError;
}

export interface CustomerFilters {
	city?: string;
	companyName?: string;
}

export interface DealFilters {
	customerId?: string;
	status?: string;
	startDate?: string;
	endDate?: string;
}

export interface DatabaseService {
	init(): Promise<void>;
	getCustomers(filters?: CustomerFilters): Promise<Customer[]>;
	getCustomerById(id: string): Promise<Customer>;
	createCustomer(customer: Omit<Customer, 'id'>): Promise<Customer>;
	updateCustomer(id: string, customer: Customer): Promise<Customer>;
	deleteCustomer(id: string): Promise<void>;
	getDeals(filters?: DealFilters): Promise<Deal[]>;
	getDealById(id: string): Promise<Deal>;
	createDeal(deal: Omit<Deal, 'id'>): Promise<Deal>;
	updateDeal(id: string, deal: Deal): Promise<Deal>;
	deleteDeal(id: string): Promise<void>;
}

export interface ValidationError {
	field: string;
	message: string;
}

export class ValidationException extends Error {
	public errors: ValidationError[];
	public status: number;

	constructor(errors: ValidationError[]) {
		super('Validation failed');
		this.errors = errors;
		this.status = 400;
	}
}
