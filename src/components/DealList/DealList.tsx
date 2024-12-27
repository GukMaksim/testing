import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Customer, Deal } from '../../types';
import { DealForm } from '../DealForm/DealForm';
import './DealList.css';

interface DealListProps {
	deals: Deal[];
	customers: Customer[];
	onAddDeal: (deal: Omit<Deal, 'id'>) => Promise<void>;
}

interface Filters {
	hasCommercialProposal: boolean;
	isPaid: boolean;
	isDelivered: boolean;
}

export function DealList({ deals, customers, onAddDeal }: DealListProps) {
	const [showForm, setShowForm] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [filters, setFilters] = useState<Filters>({
		hasCommercialProposal: false,
		isPaid: false,
		isDelivered: false,
	});

	const handleSubmit = async (deal: Omit<Deal, 'id'>) => {
		try {
			await onAddDeal(deal);
			setShowForm(false);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Ошибка при создании сделки');
		}
	};

	const getCustomerName = (customerId: string) => {
		const customer = customers.find((c) => c.id === customerId);
		return customer ? customer.companyName : 'Неизвестный клиент';
	};

	const handleFilterChange = (filterName: keyof Filters) => {
		setFilters((prev) => ({
			...prev,
			[filterName]: !prev[filterName],
		}));
	};

	const filteredDeals = Array.isArray(deals)
		? deals.filter((deal) => {
				const searchLower = searchTerm.toLowerCase();
				const matchesSearch =
					searchTerm === '' ||
					deal.description.toLowerCase().includes(searchLower) ||
					getCustomerName(deal.customerId).toLowerCase().includes(searchLower);

				const matchesStatus = statusFilter === 'all' || deal.status === statusFilter;

				const matchesFilters =
					(!filters.hasCommercialProposal || deal.hasCommercialProposal) &&
					(!filters.isPaid || deal.isPaid) &&
					(!filters.isDelivered || deal.isDelivered);

				return matchesSearch && matchesStatus && matchesFilters;
		  })
		: [];

	if (showForm) {
		return (
			<DealForm
				customers={customers}
				onSubmit={handleSubmit}
				onCancel={() => setShowForm(false)}
			/>
		);
	}

	return (
		<div className='deal-list'>
			<div className='deal-list-header'>
				<h2>Сделки</h2>
				<button
					onClick={() => setShowForm(true)}
					className='icon-button primary'
					title='Добавить сделку'>
					<i className='material-icons'>add</i>
				</button>
			</div>

			<div className='deal-list-controls'>
				<div className='search-box'>
					<i className='material-icons'>search</i>
					<input
						type='text'
						placeholder='Поиск по клиенту или описанию'
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>

				<select
					value={statusFilter}
					onChange={(e) => setStatusFilter(e.target.value)}
					className='status-filter'>
					<option value='all'>Все статусы</option>
					<option value='new'>Новые</option>
					<option value='in_progress'>В работе</option>
					<option value='completed'>Завершенные</option>
					<option value='cancelled'>Отмененные</option>
				</select>

				<div className='filter-buttons'>
					<button
						className={`filter-button ${filters.hasCommercialProposal ? 'active' : ''}`}
						onClick={() => handleFilterChange('hasCommercialProposal')}
						title='Фильтр по КП'>
						<i className='material-icons'>description</i>
					</button>
					<button
						className={`filter-button ${filters.isPaid ? 'active' : ''}`}
						onClick={() => handleFilterChange('isPaid')}
						title='Фильтр по оплате'>
						<i className='material-icons'>payments</i>
					</button>
					<button
						className={`filter-button ${filters.isDelivered ? 'active' : ''}`}
						onClick={() => handleFilterChange('isDelivered')}
						title='Фильтр по доставке'>
						<i className='material-icons'>local_shipping</i>
					</button>
				</div>
			</div>

			{error && <div className='error-message'>{error}</div>}

			<div className='table-container'>
				<table>
					<thead>
						<tr>
							<th>Дата</th>
							<th>Клиент</th>
							<th>Описание</th>
							<th>Сумма</th>
							<th>Себестоимость</th>
							<th>Статус</th>
							<th>КП</th>
							<th>Оплата</th>
							<th>Доставка</th>
						</tr>
					</thead>
					<tbody>
						{filteredDeals.map((deal) => (
							<tr key={deal.id}>
								<td>{new Date(deal.date).toLocaleDateString()}</td>
								<td>{getCustomerName(deal.customerId)}</td>
								<td>
									<Link
										to={`/deals/${deal.id}`}
										className='deal-link'>
										{deal.description}
									</Link>
								</td>
								<td className='amount'>{deal.amount.toLocaleString()} ₴</td>
								<td className='cost'>{deal.costPrice.toLocaleString()} ₴</td>
								<td>
									<span className={`status-badge status-${deal.status}`}>
										{deal.status === 'new' && 'Новая'}
										{deal.status === 'in_progress' && 'В работе'}
										{deal.status === 'completed' && 'Завершена'}
										{deal.status === 'cancelled' && 'Отменена'}
									</span>
								</td>
								<td className='center'>
									{deal.hasCommercialProposal && <i className='material-icons'>description</i>}
								</td>
								<td className='center'>{deal.isPaid && <i className='material-icons'>payments</i>}</td>
								<td className='center'>{deal.isDelivered && <i className='material-icons'>local_shipping</i>}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
