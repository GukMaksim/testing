import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Customer, Deal } from '../../types';
import { formatDate, formatMoney, getStatusText } from '../../utils/formatters.js';
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
	isProject: boolean;
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
		isProject: false,
	});

	const handleSubmit = async (deal: Omit<Deal, 'id'>) => {
		try {
			await onAddDeal(deal);
			setShowForm(false);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Помилка при створенні угоди');
		}
	};

	const getCustomerName = (customerId: string) => {
		const customer = customers.find((c) => c.id === customerId);
		return customer ? customer.companyName : 'Невідомий клієнт';
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
					(!filters.isDelivered || deal.isDelivered) &&
					(!filters.isProject || deal.isProject);

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
				<h2>Угоди</h2>
				<button
					onClick={() => setShowForm(true)}
					className='icon-button primary'
					title='Додати угоду'>
					<i className='material-icons'>add</i>
				</button>
			</div>

			<div className='deal-list-controls'>
				<div className='search-box'>
					<i className='material-icons'>search</i>
					<input
						type='text'
						placeholder='Пошук по клієнту або опису'
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

				<div className='filter-buttons'>
					<button
						className={`filter-button ${filters.hasCommercialProposal ? 'active' : ''}`}
						onClick={() => handleFilterChange('hasCommercialProposal')}
						title='Фільтр по КП'>
						<i className='material-icons'>description</i>
					</button>
					<button
						className={`filter-button ${filters.isPaid ? 'active' : ''}`}
						onClick={() => handleFilterChange('isPaid')}
						title='Фільтр по оплаті'>
						<i className='material-icons'>payments</i>
					</button>
					<button
						className={`filter-button ${filters.isDelivered ? 'active' : ''}`}
						onClick={() => handleFilterChange('isDelivered')}
						title='Фільтр по поставці'>
						<i className='material-icons'>local_shipping</i>
					</button>
					<button
						className={`filter-button ${filters.isProject ? 'active' : ''}`}
						onClick={() => handleFilterChange('isProject')}
						title='Фільтр по проєктам'>
						<i className='material-icons'>engineering</i>
					</button>
				</div>
			</div>

			{error && <div className='error-message'>{error}</div>}

			<div className='table-container'>
				<table>
					<thead>
						<tr>
							<th className='center'>Дата</th>
							<th className='center'>Клієнт</th>
							<th className='center'>Опис</th>
							<th className='center'>Сума</th>
							<th className='center'>Собівартість</th>
							<th className='center'>ДР</th>
							<th className='center'>Маржа</th>
							<th className='center'>Коміси</th>
							<th className='center'>Статус</th>
							<th className='center'>КП</th>
							<th className='center'>Оплата</th>
							<th className='center'>Поставка</th>
							<th className='center'>Проєкт</th>
						</tr>
					</thead>
					<tbody>
						{filteredDeals.map((deal) => (
							<tr key={deal.id}>
								<td>{formatDate(deal.date)}</td>
								<td>{getCustomerName(deal.customerId)}</td>
								<td>
									<Link
										to={`/deals/${deal.id}`}
										className='deal-link'>
										{deal.description}
									</Link>
								</td>
								<td className='amount'>{formatMoney(deal.amount)}</td>
								<td className='cost'>{formatMoney(deal.costPrice)}</td>
								<td className='cost'>{formatMoney(deal.additionalCosts)}</td>
								<td className='amount'>{formatMoney(deal.margin)}</td>
								<td className='amount'>{formatMoney(deal.commission)}</td>
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
	);
}
