import React, { useState } from 'react';
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
			setError(err instanceof Error ? err.message : 'Ошибка при создании клиента');
		}
	};

	const handleUpdate = async (id: string, customer: Customer) => {
		try {
			await onUpdateCustomer(id, customer);
			setEditingCustomer(null);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Ошибка при обновлении клиента');
		}
	};

	const handleDelete = async (id: string) => {
		if (!window.confirm('Вы уверены, что хотите удалить этого клиента?')) {
			return;
		}

		try {
			await onDeleteCustomer(id);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Ошибка при удалении клиента');
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
				<h2>Клиенты</h2>
				<button
					onClick={() => setShowForm(true)}
					className='icon-button primary'
					title='Добавить клиента'>
					<i className='material-icons'>add</i>
				</button>
			</div>

			<div className='customer-list-controls'>
				<div className='search-box'>
					<i className='material-icons'>search</i>
					<input
						type='text'
						placeholder='Поиск по названию компании, городу или контактному лицу'
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
							<th>Компания</th>
							<th>Контактное лицо</th>
							<th>Должность</th>
							<th>Рабочий телефон</th>
							<th>Личный телефон</th>
							<th>Рабочий email</th>
							<th>Личный email</th>
							<th>Действия</th>
						</tr>
					</thead>
					<tbody>
						{filteredCustomers.map((customer) => (
							<tr key={customer.id}>
								<td>{customer.companyName}</td>
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
											title='Редактировать'>
											<i className='material-icons'>edit</i>
										</button>
										<button
											onClick={() => handleDelete(customer.id)}
											className='icon-button danger'
											title='Удалить'>
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
