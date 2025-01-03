import sqlite3 from 'sqlite3';
import { Customer, Deal } from '../../src/types/index.js';

export interface DatabaseConfig {
	filename: string;
}

export class SQLiteDatabase {
	private db: sqlite3.Database;

	constructor(config: DatabaseConfig) {
		this.db = new sqlite3.Database(config.filename);
	}

	async init(): Promise<void> {
		await this.createTables();
		await this.migrateDatabase();
	}

	private async migrateDatabase(): Promise<void> {
		return new Promise((resolve, reject) => {
			this.db.serialize(() => {
				// Проверяем существование столбцов и добавляем их, если они отсутствуют
				this.db.run(`PRAGMA foreign_keys=off;`);

				// Начинаем транзакцию
				this.db.run('BEGIN TRANSACTION');

				// Получаем информацию о столбцах
				this.db.all('PRAGMA table_info(deals)', (err, columns) => {
					if (err) {
						this.db.run('ROLLBACK');
						reject(err);
						return;
					}

					const columnNames = columns.map((col: any) => col.name);

					// Добавляем отсутствующие столбцы
					const alterTableQueries = [];

					if (!columnNames.includes('isProject')) {
						alterTableQueries.push('ALTER TABLE deals ADD COLUMN isProject BOOLEAN NOT NULL DEFAULT 0');
					}
					if (!columnNames.includes('additionalCosts')) {
						alterTableQueries.push('ALTER TABLE deals ADD COLUMN additionalCosts REAL NOT NULL DEFAULT 0');
					}
					if (!columnNames.includes('margin')) {
						alterTableQueries.push('ALTER TABLE deals ADD COLUMN margin REAL NOT NULL DEFAULT 0');
					}
					if (!columnNames.includes('commission')) {
						alterTableQueries.push('ALTER TABLE deals ADD COLUMN commission REAL NOT NULL DEFAULT 0');
					}

					// Выполняем запросы на изменение таблицы
					alterTableQueries.forEach((query) => {
						this.db.run(query, (err) => {
							if (err) {
								console.error('Error executing query:', query, err);
							}
						});
					});

					// Завершаем транзакцию
					this.db.run('COMMIT', (err) => {
						if (err) {
							console.error('Error committing transaction:', err);
							this.db.run('ROLLBACK');
							reject(err);
						} else {
							this.db.run('PRAGMA foreign_keys=on');
							resolve();
						}
					});
				});
			});
		});
	}

	private createTables(): Promise<void> {
		return new Promise((resolve, reject) => {
			this.db.serialize(() => {
				// Создаем таблицу customers
				this.db.run(`
					CREATE TABLE IF NOT EXISTS customers (
						id INTEGER PRIMARY KEY AUTOINCREMENT,
						companyName TEXT NOT NULL,
						edrpou TEXT,
						inn TEXT,
						city TEXT,
						address TEXT,
						contactLastName TEXT,
						contactFirstName TEXT,
						contactPosition TEXT,
						contactWorkPhone TEXT,
						contactPersonalPhone TEXT,
						contactWorkEmail TEXT,
						contactPersonalEmail TEXT
					)
				`);

				// Создаем таблицу deals
				this.db.run(
					`
					CREATE TABLE IF NOT EXISTS deals (
						id INTEGER PRIMARY KEY AUTOINCREMENT,
						customerId INTEGER NOT NULL,
						description TEXT NOT NULL,
						amount REAL NOT NULL,
						costPrice REAL NOT NULL,
						date TEXT NOT NULL,
						status TEXT NOT NULL,
						hasCommercialProposal BOOLEAN NOT NULL,
						isPaid BOOLEAN NOT NULL,
						isDelivered BOOLEAN NOT NULL,
						presale TEXT,
						isProject BOOLEAN NOT NULL DEFAULT 0,
						additionalCosts REAL NOT NULL DEFAULT 0,
						margin REAL NOT NULL DEFAULT 0,
						commission REAL NOT NULL DEFAULT 0,
						FOREIGN KEY (customerId) REFERENCES customers(id)
					)
				`,
					(err) => {
						if (err) reject(err);
						else resolve();
					}
				);
			});
		});
	}

	// Методы для работы с клиентами
	async createCustomer(customer: Omit<Customer, 'id'>): Promise<Customer> {
		return new Promise((resolve, reject) => {
			const sql = `
				INSERT INTO customers (
					companyName, edrpou, inn, city, address,
					contactLastName, contactFirstName, contactPosition,
					contactWorkPhone, contactPersonalPhone,
					contactWorkEmail, contactPersonalEmail
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			`;
			const params = [
				customer.companyName,
				customer.edrpou,
				customer.inn,
				customer.city,
				customer.address,
				customer.contactLastName,
				customer.contactFirstName,
				customer.contactPosition,
				customer.contactWorkPhone,
				customer.contactPersonalPhone,
				customer.contactWorkEmail,
				customer.contactPersonalEmail,
			];

			this.db.run(sql, params, function (err) {
				if (err) reject(err);
				else resolve({ ...customer, id: this.lastID.toString() });
			});
		});
	}

	async getCustomers(filters: Partial<Customer> = {}): Promise<Customer[]> {
		let sql = 'SELECT * FROM customers WHERE 1=1';
		const params: any[] = [];

		if (filters.city) {
			sql += ' AND city LIKE ?';
			params.push(`%${filters.city}%`);
		}
		if (filters.companyName) {
			sql += ' AND companyName LIKE ?';
			params.push(`%${filters.companyName}%`);
		}

		return new Promise((resolve, reject) => {
			this.db.all(sql, params, (err, rows) => {
				if (err) reject(err);
				else
					resolve(
						rows.map((row) => ({
							...row,
							id: row.id.toString(),
						}))
					);
			});
		});
	}

	async getCustomerById(id: string): Promise<Customer> {
		return new Promise((resolve, reject) => {
			this.db.get('SELECT * FROM customers WHERE id = ?', [id], (err, row) => {
				if (err) reject(err);
				else if (!row) reject(new Error('Customer not found'));
				else
					resolve({
						...row,
						id: row.id.toString(),
					});
			});
		});
	}

	async updateCustomer(id: string, customer: Customer): Promise<Customer> {
		const sql = `
			UPDATE customers SET
				companyName = ?, edrpou = ?, inn = ?, city = ?, address = ?,
				contactLastName = ?, contactFirstName = ?, contactPosition = ?,
				contactWorkPhone = ?, contactPersonalPhone = ?,
				contactWorkEmail = ?, contactPersonalEmail = ?
			WHERE id = ?
		`;
		const params = [
			customer.companyName,
			customer.edrpou,
			customer.inn,
			customer.city,
			customer.address,
			customer.contactLastName,
			customer.contactFirstName,
			customer.contactPosition,
			customer.contactWorkPhone,
			customer.contactPersonalPhone,
			customer.contactWorkEmail,
			customer.contactPersonalEmail,
			id,
		];

		return new Promise((resolve, reject) => {
			this.db.run(sql, params, (err) => {
				if (err) reject(err);
				else resolve({ ...customer, id });
			});
		});
	}

	async deleteCustomer(id: string): Promise<void> {
		return new Promise((resolve, reject) => {
			this.db.run('DELETE FROM customers WHERE id = ?', [id], (err) => {
				if (err) reject(err);
				else resolve();
			});
		});
	}

	// Методы для работы со сделками
	async createDeal(deal: Omit<Deal, 'id'>): Promise<Deal> {
		return new Promise((resolve, reject) => {
			const sql = `
				INSERT INTO deals (
					customerId, description, amount, costPrice, date,
					status, hasCommercialProposal, isPaid, isDelivered, presale,
					isProject, additionalCosts, margin, commission
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			`;
			const params = [
				deal.customerId,
				deal.description,
				deal.amount,
				deal.costPrice,
				deal.date,
				deal.status,
				deal.hasCommercialProposal ? 1 : 0,
				deal.isPaid ? 1 : 0,
				deal.isDelivered ? 1 : 0,
				deal.presale,
				deal.isProject ? 1 : 0,
				deal.additionalCosts,
				deal.margin,
				deal.commission,
			];

			this.db.run(sql, params, function (err) {
				if (err) reject(err);
				else resolve({ ...deal, id: this.lastID.toString() });
			});
		});
	}

	async getDeals(filters: Partial<Deal> = {}): Promise<Deal[]> {
		let sql = 'SELECT * FROM deals WHERE 1=1';
		const params: any[] = [];

		if (filters.customerId) {
			sql += ' AND customerId = ?';
			params.push(filters.customerId);
		}
		if (filters.status) {
			sql += ' AND status = ?';
			params.push(filters.status);
		}

		sql += ' ORDER BY date DESC';

		return new Promise((resolve, reject) => {
			this.db.all(sql, params, (err, rows) => {
				if (err) reject(err);
				else
					resolve(
						rows.map((row) => ({
							...row,
							id: row.id.toString(),
							customerId: row.customerId.toString(),
							hasCommercialProposal: !!row.hasCommercialProposal,
							isPaid: !!row.isPaid,
							isDelivered: !!row.isDelivered,
							isProject: !!row.isProject,
						}))
					);
			});
		});
	}

	async getDealById(id: string): Promise<Deal> {
		return new Promise((resolve, reject) => {
			this.db.get('SELECT * FROM deals WHERE id = ?', [id], (err, row) => {
				if (err) reject(err);
				else if (!row) reject(new Error('Deal not found'));
				else
					resolve({
						...row,
						id: row.id.toString(),
						customerId: row.customerId.toString(),
						hasCommercialProposal: !!row.hasCommercialProposal,
						isPaid: !!row.isPaid,
						isDelivered: !!row.isDelivered,
					});
			});
		});
	}

	async updateDeal(id: string, deal: Deal): Promise<Deal> {
		const sql = `
			UPDATE deals SET
				customerId = ?, description = ?, amount = ?, costPrice = ?,
				date = ?, status = ?, hasCommercialProposal = ?, isPaid = ?,
				isDelivered = ?, presale = ?, isProject = ?, additionalCosts = ?,
				margin = ?, commission = ?
			WHERE id = ?
		`;
		const params = [
			deal.customerId,
			deal.description,
			deal.amount,
			deal.costPrice,
			deal.date,
			deal.status,
			deal.hasCommercialProposal ? 1 : 0,
			deal.isPaid ? 1 : 0,
			deal.isDelivered ? 1 : 0,
			deal.presale,
			deal.isProject ? 1 : 0,
			deal.additionalCosts,
			deal.margin,
			deal.commission,
			id,
		];

		return new Promise((resolve, reject) => {
			this.db.run(sql, params, (err) => {
				if (err) reject(err);
				else resolve({ ...deal, id });
			});
		});
	}

	async deleteDeal(id: string): Promise<void> {
		return new Promise((resolve, reject) => {
			this.db.run('DELETE FROM deals WHERE id = ?', [id], (err) => {
				if (err) reject(err);
				else resolve();
			});
		});
	}
}
