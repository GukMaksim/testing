import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { SQLiteDatabase } from '../services/database';
import { Customer, Deal } from '../../src/types';
import fs from 'fs';

describe('API Integration Tests', () => {
	const TEST_DB = './test-api.db';
	let app: express.Application;
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
		app = express();
		app.use(cors());
		app.use(express.json());

		db = new SQLiteDatabase({ filename: TEST_DB });
		await db.init();

		// Регистрируем маршруты
		app.get('/api/customers', async (req, res) => {
			const filters = {
				city: req.query.city as string,
				companyName: req.query.companyName as string,
			};
			const customers = await db.getCustomers(filters);
			res.json({ data: customers });
		});

		app.post('/api/customers', async (req, res) => {
			const customer = await db.createCustomer(req.body);
			res.status(201).json({ data: customer });
		});

		app.get('/api/deals', async (req, res) => {
			const filters = {
				customerId: req.query.customerId as string,
				status: req.query.status as string,
				startDate: req.query.startDate as string,
				endDate: req.query.endDate as string,
			};
			const deals = await db.getDeals(filters);
			res.json({ data: deals });
		});

		app.post('/api/deals', async (req, res) => {
			const deal = await db.createDeal(req.body);
			res.status(201).json({ data: deal });
		});
	});

	afterAll(() => {
		if (fs.existsSync(TEST_DB)) {
			fs.unlinkSync(TEST_DB);
		}
	});

	describe('Customer API', () => {
		let customerId: string;

		test('should create customer', async () => {
			const response = await request(app).post('/api/customers').send(testCustomer).expect(201);

			expect(response.body.data).toMatchObject(testCustomer);
			customerId = response.body.data.id;
		});

		test('should get customers', async () => {
			const response = await request(app).get('/api/customers').expect(200);

			expect(response.body.data).toHaveLength(1);
			expect(response.body.data[0]).toMatchObject(testCustomer);
		});

		test('should filter customers by city', async () => {
			const response = await request(app).get('/api/customers').query({ city: 'Test City' }).expect(200);

			expect(response.body.data).toHaveLength(1);
			expect(response.body.data[0]).toMatchObject(testCustomer);
		});

		test('should return empty array for non-matching filter', async () => {
			const response = await request(app).get('/api/customers').query({ city: 'Non-existent City' }).expect(200);

			expect(response.body.data).toHaveLength(0);
		});
	});

	describe('Deal API', () => {
		let customerId: string;
		let dealId: string;

		beforeAll(async () => {
			const customer = await db.createCustomer(testCustomer);
			customerId = customer.id;
			testDeal.customerId = customerId;
		});

		test('should create deal', async () => {
			const response = await request(app).post('/api/deals').send(testDeal).expect(201);

			expect(response.body.data).toMatchObject(testDeal);
			dealId = response.body.data.id;
		});

		test('should get deals', async () => {
			const response = await request(app).get('/api/deals').expect(200);

			expect(response.body.data).toHaveLength(1);
			expect(response.body.data[0]).toMatchObject(testDeal);
		});

		test('should filter deals by customer', async () => {
			const response = await request(app).get('/api/deals').query({ customerId }).expect(200);

			expect(response.body.data).toHaveLength(1);
			expect(response.body.data[0]).toMatchObject(testDeal);
		});

		test('should filter deals by status', async () => {
			const response = await request(app).get('/api/deals').query({ status: 'new' }).expect(200);

			expect(response.body.data).toHaveLength(1);
			expect(response.body.data[0]).toMatchObject(testDeal);
		});

		test('should return empty array for non-matching filter', async () => {
			const response = await request(app).get('/api/deals').query({ status: 'completed' }).expect(200);

			expect(response.body.data).toHaveLength(0);
		});

		afterAll(async () => {
			await db.deleteCustomer(customerId);
		});
	});
});
