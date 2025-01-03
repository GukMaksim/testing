import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Customer } from '../../types';
import { CustomerForm } from '../CustomerForm/CustomerForm';
import './CustomerList.css';

interface CustomerListProps {
	customers: Customer[];
	onAddCustomer: (customer: Omit<Customer, 'id'>) => Promise<void>;
	onUpdateCustomer: (id: string, customer: Customer) => Promise<void>;
	onDeleteCustomer: (id: string) => Promise<void>;
}

export function CustomerList({ customers, onAddCustomer, onUpdateCustomer, onDeleteCustomer }: CustomerListProps) {
	const [showForm, setShowForm] = useState(false);
	const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState('');

	const handleSubmit = async (customer: Omit<Customer, 'id'>) => {
		try {
			await onAddCustomer(customer);
			setShowForm(false);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Помилка при створенні клієнта');
		}
	};

	const handleUpdate = async (id: string, customer: Customer) => {
		try {
			await onUpdateCustomer(id, customer);
			setEditingCustomer(null);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Помилка при оновленні клієнта');
		}
	};

	const handleDelete = async (id: string) => {
		if (!window.confirm('Ви впевнені, що хочете видалити цього клієнта?')) {
			return;
		}

		try {
			await onDeleteCustomer(id);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Помилка при видаленні клієнта');
		}
	};

	const filteredCustomers = customers.filter(
		(customer) =>
			customer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			customer.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			customer.contactLastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			customer.contactFirstName?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	if (showForm || editingCustomer) {
		return (
			<CustomerForm
				customer={editingCustomer}
				onSubmit={editingCustomer ? (customer) => handleUpdate(editingCustomer.id, customer as Customer) : handleSubmit}
				onCancel={() => {
					setShowForm(false);
					setEditingCustomer(null);
				}}
			/>
		);
	}

	return (
		<div className='customer-list'>
			<div className='customer-list-header'>
				<h2>Клієнти</h2>
				<button
					onClick={() => setShowForm(true)}
					className='icon-button primary'
					title='Додати клієнта'>
					<i className='material-icons'>add</i>
				</button>
			</div>

			<div className='customer-list-controls'>
				<div className='search-box'>
					<i className='material-icons'>search</i>
					<input
						type='text'
						placeholder='Пошук по назві компанії, місту або контактній особі'
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
			</div>

			{error && <div className='error-message'>{error}</div>}

			<div className='table-container'>
				<table>
					<thead>
						<tr>
							<th>Компанія</th>
							<th>Контактна особа</th>
							<th>Посада</th>
							<th>Робочий телефон</th>
							<th>Особистий телефон</th>
							<th>Робочий email</th>
							<th>Особистий email</th>
							<th>Дії</th>
						</tr>
					</thead>
					<tbody>
						{filteredCustomers.map((customer) => (
							<tr key={customer.id}>
								<td>
									<Link
										to={`/customers/${customer.id}`}
										className='customer-link'>
										{customer.companyName}
									</Link>
								</td>
								<td>
									{customer.contactLastName} {customer.contactFirstName}
								</td>
								<td>{customer.contactPosition}</td>
								<td>{customer.contactWorkPhone}</td>
								<td>{customer.contactPersonalPhone}</td>
								<td>{customer.contactWorkEmail}</td>
								<td>{customer.contactPersonalEmail}</td>
								<td>
									<div className='action-buttons'>
										<button
											onClick={() => setEditingCustomer(customer)}
											className='icon-button warning'
											title='Редагувати'>
											<i className='material-icons'>edit</i>
										</button>
										<button
											onClick={() => handleDelete(customer.id)}
											className='icon-button danger'
											title='Видалити'>
											<i className='material-icons'>delete</i>
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
