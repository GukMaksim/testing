import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Customer, Deal } from '../../types';
import { formatDate, formatMoney, getStatusText } from '../../utils/formatters.js';
import './CustomerDetails.css';

interface CustomerDetailsProps {
	customers: Customer[];
	deals: Deal[];
	onUpdateCustomer: (id: string, customer: Customer) => Promise<void>;
	onDeleteCustomer: (id: string) => Promise<void>;
}

export function CustomerDetails({ customers, deals, onUpdateCustomer, onDeleteCustomer }: CustomerDetailsProps) {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [error, setError] = useState<string | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
		basic: false,
		contact: false,
		stats: false,
	});

	const customer = customers.find((c) => c.id === id);
	const [editedCustomer, setEditedCustomer] = useState<Customer | null>(customer || null);

	if (!customer) {
		return (
			<div className='customer-details'>
				<h1>Клієнта не знайдено</h1>
				<button
					onClick={() => navigate('/customers')}
					className='icon-button back-button'
					title='Повернутися до списку'>
					<i className='material-icons'>arrow_back</i>
				</button>
			</div>
		);
	}

	const customerDeals = deals
		.filter((deal) => deal.customerId === id)
		.filter((deal) => {
			const matchesSearch = searchTerm ? deal.description.toLowerCase().includes(searchTerm.toLowerCase()) : true;
			const matchesStatus = statusFilter === 'all' ? true : deal.status === statusFilter;
			return matchesSearch && matchesStatus;
		})
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

	const totalStats = customerDeals.reduce(
		(acc, deal) => {
			if (deal.status === 'completed') {
				acc.totalAmount += deal.amount;
				acc.totalMargin += deal.margin;
				acc.totalCommission += deal.commission;
				acc.completedDeals += 1;
			}
			return acc;
		},
		{ totalAmount: 0, totalMargin: 0, totalCommission: 0, completedDeals: 0 }
	);

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (!editedCustomer) return;

		const { name, value } = event.target;
		setEditedCustomer({ ...editedCustomer, [name]: value });
	};

	const handleSave = async () => {
		if (!editedCustomer) return;

		try {
			await onUpdateCustomer(editedCustomer.id, editedCustomer);
			setIsEditing(false);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Помилка при обновленні клієнта');
		}
	};

	const handleDelete = async () => {
		if (!window.confirm('Ви впевнені, що хочете видалити цього клієнта?')) {
			return;
		}

		try {
			await onDeleteCustomer(customer.id);
			navigate('/customers');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Помилка при видаленні клієнта');
		}
	};

	const toggleSection = (section: string) => {
		setExpandedSections((prev) => ({
			...prev,
			[section]: !prev[section],
		}));
	};

	return (
		<div className='customer-details'>
			<div className='header-actions'>
				<button
					onClick={() => navigate('/customers')}
					className='icon-button back-button'
					title='Повернутися до списку'>
					<i className='material-icons'>arrow_back</i>
				</button>
				<div className='action-buttons'>
					{!isEditing && (
						<>
							<button
								onClick={() => setIsEditing(true)}
								className='icon-button edit-button'
								title='Редагувати'>
								<i className='material-icons'>edit</i>
							</button>
							<button
								onClick={handleDelete}
								className='icon-button delete-button'
								title='Видалити'>
								<i className='material-icons'>delete</i>
							</button>
						</>
					)}
				</div>
			</div>

			{error && <div className='error-message'>{error}</div>}

			<div className='customer-info'>
				{isEditing && editedCustomer ? (
					<>
						<div className='form-group'>
							<label>Назва компанії:</label>
							<input
								type='text'
								name='companyName'
								value={editedCustomer.companyName}
								onChange={handleInputChange}
							/>
						</div>

						<div className='form-group'>
							<label>ЄДРПОУ:</label>
							<input
								type='text'
								name='edrpou'
								value={editedCustomer.edrpou || ''}
								onChange={handleInputChange}
							/>
						</div>

						<div className='form-group'>
							<label>ІПН:</label>
							<input
								type='text'
								name='inn'
								value={editedCustomer.inn || ''}
								onChange={handleInputChange}
							/>
						</div>

						<div className='form-group'>
							<label>Місто:</label>
							<input
								type='text'
								name='city'
								value={editedCustomer.city || ''}
								onChange={handleInputChange}
							/>
						</div>

						<div className='form-group'>
							<label>Адреса:</label>
							<input
								type='text'
								name='address'
								value={editedCustomer.address || ''}
								onChange={handleInputChange}
							/>
						</div>

						<div className='form-group'>
							<label>Прізвище контакта:</label>
							<input
								type='text'
								name='contactLastName'
								value={editedCustomer.contactLastName || ''}
								onChange={handleInputChange}
							/>
						</div>

						<div className='form-group'>
							<label>Ім&apos;я контакта:</label>
							<input
								type='text'
								name='contactFirstName'
								value={editedCustomer.contactFirstName || ''}
								onChange={handleInputChange}
							/>
						</div>

						<div className='form-group'>
							<label>Посада:</label>
							<input
								type='text'
								name='contactPosition'
								value={editedCustomer.contactPosition || ''}
								onChange={handleInputChange}
							/>
						</div>

						<div className='form-group'>
							<label>Робочий телефон:</label>
							<input
								type='tel'
								name='contactWorkPhone'
								value={editedCustomer.contactWorkPhone || ''}
								onChange={handleInputChange}
							/>
						</div>

						<div className='form-group'>
							<label>Особистий телефон:</label>
							<input
								type='tel'
								name='contactPersonalPhone'
								value={editedCustomer.contactPersonalPhone || ''}
								onChange={handleInputChange}
							/>
						</div>

						<div className='form-group'>
							<label>Робочий email:</label>
							<input
								type='email'
								name='contactWorkEmail'
								value={editedCustomer.contactWorkEmail || ''}
								onChange={handleInputChange}
							/>
						</div>

						<div className='form-group'>
							<label>Особистий email:</label>
							<input
								type='email'
								name='contactPersonalEmail'
								value={editedCustomer.contactPersonalEmail || ''}
								onChange={handleInputChange}
							/>
						</div>

						<div className='form-actions'>
							<button
								onClick={handleSave}
								className='icon-button save-button'
								title='Зберегти'>
								<i className='material-icons'>save</i>
							</button>
							<button
								onClick={() => {
									setIsEditing(false);
									setEditedCustomer(customer);
								}}
								className='icon-button cancel-button'
								title='Скасувати'>
								<i className='material-icons'>close</i>
							</button>
						</div>
					</>
				) : (
					<>
						<h1>{customer.companyName}</h1>

						<div className='info-section'>
							<div
								className='section-header'
								onClick={() => toggleSection('basic')}>
								<h3>Основна інформація</h3>
								<span className={`toggle-icon ${expandedSections.basic ? 'expanded' : ''}`}>expand_more</span>
							</div>
							<div className={`section-content ${expandedSections.basic ? 'expanded' : ''}`}>
								<div className='info-group'>
									<label>ЕДРПОУ:</label>
									<span>{customer.edrpou || 'Не вказано'}</span>
								</div>
								<div className='info-group'>
									<label>ИНН:</label>
									<span>{customer.inn || 'Не вказано'}</span>
								</div>
								<div className='info-group'>
									<label>Город:</label>
									<span>{customer.city || 'Не вказано'}</span>
								</div>
								<div className='info-group'>
									<label>Адреса:</label>
									<span>{customer.address || 'Не вказано'}</span>
								</div>
							</div>
						</div>

						<div className='info-section'>
							<div
								className='section-header'
								onClick={() => toggleSection('contact')}>
								<h3>Контактна інформація</h3>
								<span className={`toggle-icon ${expandedSections.contact ? 'expanded' : ''}`}>expand_more</span>
							</div>
							<div className={`section-content ${expandedSections.contact ? 'expanded' : ''}`}>
								<div className='info-group'>
									<label>Контактна особа:</label>
									<span>
										{customer.contactLastName} {customer.contactFirstName}
									</span>
								</div>
								<div className='info-group'>
									<label>Посада:</label>
									<span>{customer.contactPosition || 'Не указана'}</span>
								</div>
								<div className='info-group'>
									<label>Робочий телефон:</label>
									<span>{customer.contactWorkPhone || 'Не указан'}</span>
								</div>
								<div className='info-group'>
									<label>Особистий телефон:</label>
									<span>{customer.contactPersonalPhone || 'Не указан'}</span>
								</div>
								<div className='info-group'>
									<label>Робочий email:</label>
									<span>{customer.contactWorkEmail || 'Не указан'}</span>
								</div>
								<div className='info-group'>
									<label>Особистий email:</label>
									<span>{customer.contactPersonalEmail || 'Не указан'}</span>
								</div>
							</div>
						</div>

						<div className='info-section'>
							<div
								className='section-header'
								onClick={() => toggleSection('stats')}>
								<h3>Статистика по угодам</h3>
								<span className={`toggle-icon ${expandedSections.stats ? 'expanded' : ''}`}>expand_more</span>
							</div>
							<div className={`section-content ${expandedSections.stats ? 'expanded' : ''}`}>
								<div className='info-group'>
									<label>Всього угод:</label>
									<span>{customerDeals.length}</span>
								</div>
								<div className='info-group'>
									<label>Завершених угод:</label>
									<span>{totalStats.completedDeals}</span>
								</div>
								<div className='info-group'>
									<label>Загальна сума:</label>
									<span className='money'>{formatMoney(totalStats.totalAmount)}</span>
								</div>
								<div className='info-group'>
									<label>Загальна маржа:</label>
									<span className='money'>{formatMoney(totalStats.totalMargin)}</span>
								</div>
								<div className='info-group'>
									<label>Загальна сума комісів:</label>
									<span className='money'>{formatMoney(totalStats.totalCommission)}</span>
								</div>
							</div>
						</div>
					</>
				)}
			</div>

			<div className='deals-section'>
				<h2>Угоди клієнта</h2>

				<div className='deals-controls'>
					<div className='search-box'>
						<i className='material-icons'>search</i>
						<input
							type='text'
							placeholder='Пошук по опису'
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>

					<select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
						className='status-filter'>
						<option value='all'>Всі статуси</option>
						<option value='new'>Нові</option>
						<option value='in_progress'>В роботі</option>
						<option value='completed'>Завершені</option>
						<option value='cancelled'>Скасовані</option>
					</select>
				</div>

				<div className='table-container'>
					<table>
						<thead>
							<tr>
								<th>Дата</th>
								<th>Опис</th>
								<th>Сума</th>
								<th>Маржа</th>
								<th>Коміси</th>
								<th>Статус</th>
								<th>КП</th>
								<th>Оплата</th>
								<th>Доставка</th>
								<th>Проект</th>
							</tr>
						</thead>
						<tbody>
							{customerDeals.map((deal) => (
								<tr key={deal.id}>
									<td>{formatDate(deal.date)}</td>
									<td>
										<Link
											to={`/deals/${deal.id}`}
											className='deal-link'>
											{deal.description}
										</Link>
									</td>
									<td className='money'>{formatMoney(deal.amount)}</td>
									<td className='money'>{formatMoney(deal.margin)}</td>
									<td className='money'>{formatMoney(deal.commission)}</td>
									<td>
										<span className={`status-badge status-${deal.status}`}>{getStatusText(deal.status)}</span>
									</td>
									<td className='center'>
										{deal.hasCommercialProposal && <i className='material-icons'>description</i>}
									</td>
									<td className='center'>{deal.isPaid && <i className='material-icons'>payments</i>}</td>
									<td className='center'>{deal.isDelivered && <i className='material-icons'>local_shipping</i>}</td>
									<td className='center'>{deal.isProject && <i className='material-icons'>engineering</i>}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
