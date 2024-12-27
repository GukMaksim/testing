import { SQLiteDatabase } from '../services/database';
import { Customer, Deal } from '../../src/types';
import fs from 'fs';

describe('SQLite Database', () => {
	const TEST_DB = './test.db';
	let db: SQLiteDatabase;

	const testCustomer: Omit<Customer, 'id'> = {
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

	const testDeal: Omit<Deal, 'id'> = {
		customerId: '', // Will be set after customer creation
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

	beforeAll(async () => {
		db = new SQLiteDatabase({ filename: TEST_DB });
		await db.init();
	});

	afterAll(() => {
		if (fs.existsSync(TEST_DB)) {
			fs.unlinkSync(TEST_DB);
		}
	});

	describe('Customer Operations', () => {
		let customerId: string;

		test('should create customer', async () => {
			const customer = await db.createCustomer(testCustomer);
			customerId = customer.id;
			expect(customer).toMatchObject(testCustomer);
			expect(customer.id).toBeDefined();
		});

		test('should get customer by id', async () => {
			const customer = await db.getCustomerById(customerId);
			expect(customer).toMatchObject(testCustomer);
		});

		test('should get customers with filters', async () => {
			const customers = await db.getCustomers({ city: 'Test City' });
			expect(customers).toHaveLength(1);
			expect(customers[0]).toMatchObject(testCustomer);
		});

		test('should update customer', async () => {
			const updatedCustomer = {
				...testCustomer,
				id: customerId,
				companyName: 'Updated Company',
			};
			await db.updateCustomer(customerId, updatedCustomer);
			const customer = await db.getCustomerById(customerId);
			expect(customer.companyName).toBe('Updated Company');
		});

		test('should delete customer', async () => {
			await db.deleteCustomer(customerId);
			await expect(db.getCustomerById(customerId)).rejects.toThrow('Customer not found');
		});
	});

	describe('Deal Operations', () => {
		let customerId: string;
		let dealId: string;

		beforeAll(async () => {
			const customer = await db.createCustomer(testCustomer);
			customerId = customer.id;
			testDeal.customerId = customerId;
		});

		test('should create deal', async () => {
			const deal = await db.createDeal(testDeal);
			dealId = deal.id;
			expect(deal).toMatchObject(testDeal);
			expect(deal.id).toBeDefined();
		});

		test('should get deal by id', async () => {
			const deal = await db.getDealById(dealId);
			expect(deal).toMatchObject(testDeal);
		});

		test('should get deals with filters', async () => {
			const deals = await db.getDeals({ customerId, status: 'new' });
			expect(deals).toHaveLength(1);
			expect(deals[0]).toMatchObject(testDeal);
		});

		test('should update deal', async () => {
			const updatedDeal = {
				...testDeal,
				id: dealId,
				amount: 2000,
			};
			await db.updateDeal(dealId, updatedDeal);
			const deal = await db.getDealById(dealId);
			expect(deal.amount).toBe(2000);
		});

		test('should delete deal', async () => {
			await db.deleteDeal(dealId);
			await expect(db.getDealById(dealId)).rejects.toThrow('Deal not found');
		});

		afterAll(async () => {
			await db.deleteCustomer(customerId);
		});
	});
});
