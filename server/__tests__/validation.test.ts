import { validateCustomer, validateDeal } from '../utils/validation';
import { ValidationException } from '../types';
import { Customer, Deal } from '../../src/types';

describe('Customer Validation', () => {
	const validCustomer: Omit<Customer, 'id'> = {
		companyName: 'Test Company',
		edrpou: '12345678',
		inn: '1234567890',
		city: 'Test City',
		address: 'Test Address',
		contactLastName: 'Test',
		contactFirstName: 'Test',
		contactPosition: 'Test Position',
		contactWorkPhone: '+380501234567',
		contactPersonalPhone: '+380671234567',
		contactWorkEmail: 'test@work.com',
		contactPersonalEmail: 'test@personal.com',
	};

	test('should validate correct customer data', () => {
		expect(() => validateCustomer(validCustomer)).not.toThrow();
	});

	test('should validate customer without optional fields', () => {
		const customerWithoutOptional = { ...validCustomer };
		delete customerWithoutOptional.inn;
		delete customerWithoutOptional.contactPersonalPhone;
		delete customerWithoutOptional.contactPersonalEmail;

		expect(() => validateCustomer(customerWithoutOptional)).not.toThrow();
	});

	test('should throw on empty company name', () => {
		const customer = { ...validCustomer, companyName: '' };
		expect(() => validateCustomer(customer)).toThrow(ValidationException);
	});

	test('should throw on invalid EDRPOU', () => {
		const customer = { ...validCustomer, edrpou: '123' };
		expect(() => validateCustomer(customer)).toThrow(ValidationException);
	});

	test('should throw on invalid INN', () => {
		const customer = { ...validCustomer, inn: '123' };
		expect(() => validateCustomer(customer)).toThrow(ValidationException);
	});

	test('should throw on invalid work phone', () => {
		const customer = { ...validCustomer, contactWorkPhone: '123' };
		expect(() => validateCustomer(customer)).toThrow(ValidationException);
	});

	test('should throw on invalid work email', () => {
		const customer = { ...validCustomer, contactWorkEmail: 'invalid-email' };
		expect(() => validateCustomer(customer)).toThrow(ValidationException);
	});
});

describe('Deal Validation', () => {
	const validDeal: Omit<Deal, 'id'> = {
		customerId: '123',
		description: 'Test Deal',
		amount: 1000,
		costPrice: 800,
		date: '2023-01-01',
		status: 'new',
		hasCommercialProposal: false,
		isPaid: false,
		isDelivered: false,
		presale: 'Test Presale',
	};

	test('should validate correct deal data', () => {
		expect(() => validateDeal(validDeal)).not.toThrow();
	});

	test('should throw on empty customer ID', () => {
		const deal = { ...validDeal, customerId: '' };
		expect(() => validateDeal(deal)).toThrow(ValidationException);
	});

	test('should throw on empty description', () => {
		const deal = { ...validDeal, description: '' };
		expect(() => validateDeal(deal)).toThrow(ValidationException);
	});

	test('should throw on negative amount', () => {
		const deal = { ...validDeal, amount: -100 };
		expect(() => validateDeal(deal)).toThrow(ValidationException);
	});

	test('should throw on negative cost price', () => {
		const deal = { ...validDeal, costPrice: -100 };
		expect(() => validateDeal(deal)).toThrow(ValidationException);
	});

	test('should throw on invalid date', () => {
		const deal = { ...validDeal, date: 'invalid-date' };
		expect(() => validateDeal(deal)).toThrow(ValidationException);
	});

	test('should throw on invalid status', () => {
		const deal = { ...validDeal, status: 'invalid-status' };
		expect(() => validateDeal(deal)).toThrow(ValidationException);
	});
});
