import express from 'express';
import cors from 'cors';
import { SQLiteDatabase } from './services/database.js';
import { validateCustomer, validateDeal, ValidationException } from './utils/validation.js';
import type { Customer, Deal } from '../src/types/index.js';

export function createApp() {
	const app = express();
	app.use(cors());
	app.use(express.json());

	const db = new SQLiteDatabase({ filename: './crm.db' });

	// Инициализация базы данных
	db.init().catch(console.error);

	// Маршруты для работы с клиентами
	app.get('/api/customers', async (req, res) => {
		try {
			const customers = await db.getCustomers(req.query);
			res.json({ data: customers });
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	});

	app.get('/api/customers/:id', async (req, res) => {
		try {
			const customer = await db.getCustomerById(req.params.id);
			res.json({ data: customer });
		} catch (error) {
			res.status(404).json({ error: error.message });
		}
	});

	app.post('/api/customers', async (req, res) => {
		try {
			console.log('Received customer data:', req.body);

			if (!req.body || typeof req.body !== 'object') {
				console.error('Invalid request body:', req.body);
				return res.status(400).json({ error: 'Некорректные данные запроса' });
			}

			validateCustomer(req.body);
			console.log('Customer data validated successfully');

			const customer = await db.createCustomer(req.body);
			console.log('Customer created successfully:', customer);

			res.status(201).json({ data: customer });
		} catch (error) {
			console.error('Error creating customer:', error);
			if (error instanceof ValidationException) {
				res.status(400).json({ error: error.message });
			} else {
				res.status(500).json({ error: 'Внутренняя ошибка сервера' });
			}
		}
	});

	app.put('/api/customers/:id', async (req, res) => {
		try {
			validateCustomer(req.body);
			const customer = await db.updateCustomer(req.params.id, req.body);
			res.json({ data: customer });
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	});

	app.delete('/api/customers/:id', async (req, res) => {
		try {
			await db.deleteCustomer(req.params.id);
			res.status(204).send();
		} catch (error) {
			res.status(404).json({ error: error.message });
		}
	});

	// Маршруты для работы со сделками
	app.get('/api/deals', async (req, res) => {
		try {
			const deals = await db.getDeals(req.query);
			res.json({ data: deals });
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	});

	app.get('/api/deals/:id', async (req, res) => {
		try {
			const deal = await db.getDealById(req.params.id);
			res.json({ data: deal });
		} catch (error) {
			res.status(404).json({ error: error.message });
		}
	});

	app.post('/api/deals', async (req, res) => {
		try {
			console.log('Received deal data:', req.body);

			if (!req.body || typeof req.body !== 'object') {
				console.error('Invalid request body:', req.body);
				return res.status(400).json({ error: 'Некорректные данные запроса' });
			}

			validateDeal(req.body);
			console.log('Deal data validated successfully');

			const deal = await db.createDeal(req.body);
			console.log('Deal created successfully:', deal);

			res.status(201).json({ data: deal });
		} catch (error) {
			console.error('Error creating deal:', error);
			if (error instanceof ValidationException) {
				res.status(400).json({ error: error.message });
			} else {
				res.status(500).json({ error: 'Внутренняя ошибка сервера' });
			}
		}
	});

	app.put('/api/deals/:id', async (req, res) => {
		try {
			validateDeal(req.body);
			const deal = await db.updateDeal(req.params.id, req.body);
			res.json({ data: deal });
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	});

	app.delete('/api/deals/:id', async (req, res) => {
		try {
			await db.deleteDeal(req.params.id);
			res.status(204).send();
		} catch (error) {
			res.status(404).json({ error: error.message });
		}
	});

	return app;
}
