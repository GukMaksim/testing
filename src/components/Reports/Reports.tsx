import React, { useState, useMemo } from 'react';
import type { Customer, Deal } from '../../types';
import { formatMoney } from '../../utils/formatters.js';
import './Reports.css';

interface ReportsProps {
	deals: Deal[];
	customers: Customer[];
}

interface PeriodStats {
	totalAmount: number;
	totalMargin: number;
	totalCommission: number;
	dealsCount: number;
	completedDealsCount: number;
	customerStats: Map<string, { amount: number; dealsCount: number }>;
}

export function Reports({ deals, customers }: ReportsProps) {
	const [startDate, setStartDate] = useState(
		new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]
	);
	const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

	const stats = useMemo(() => {
		const filteredDeals = deals.filter((deal) => {
			const dealDate = new Date(deal.date);
			return dealDate >= new Date(startDate) && dealDate <= new Date(endDate) && deal.status === 'completed';
		});

		const result: PeriodStats = {
			totalAmount: 0,
			totalMargin: 0,
			totalCommission: 0,
			dealsCount: filteredDeals.length,
			completedDealsCount: filteredDeals.filter((d) => d.status === 'completed').length,
			customerStats: new Map(),
		};

		filteredDeals.forEach((deal) => {
			result.totalAmount += deal.amount;
			result.totalMargin += deal.margin;
			result.totalCommission += deal.commission;

			const customerStats = result.customerStats.get(deal.customerId) || { amount: 0, dealsCount: 0 };
			customerStats.amount += deal.amount;
			customerStats.dealsCount += 1;
			result.customerStats.set(deal.customerId, customerStats);
		});

		return result;
	}, [deals, startDate, endDate]);

	const monthlyStats = useMemo(() => {
		const months = new Map<string, PeriodStats>();

		deals
			.filter((deal) => deal.status === 'completed')
			.forEach((deal) => {
				const monthKey = deal.date.substring(0, 7); // YYYY-MM
				const monthStats = months.get(monthKey) || {
					totalAmount: 0,
					totalMargin: 0,
					totalCommission: 0,
					dealsCount: 0,
					completedDealsCount: 0,
					customerStats: new Map(),
				};

				monthStats.totalAmount += deal.amount;
				monthStats.totalMargin += deal.margin;
				monthStats.totalCommission += deal.commission;
				monthStats.dealsCount += 1;
				monthStats.completedDealsCount += 1;

				months.set(monthKey, monthStats);
			});

		return new Map([...months.entries()].sort());
	}, [deals]);

	const getCustomerName = (customerId: string) => {
		const customer = customers.find((c) => c.id === customerId);
		return customer?.companyName || 'Невідомий клієнт';
	};

	return (
		<div className='reports'>
			<h1>Звіти</h1>

			<div className='period-selector'>
				<div className='form-group'>
					<label>Початок періоду:</label>
					<input
						type='date'
						value={startDate}
						onChange={(e) => setStartDate(e.target.value)}
					/>
				</div>
				<div className='form-group'>
					<label>Кінець періоду:</label>
					<input
						type='date'
						value={endDate}
						onChange={(e) => setEndDate(e.target.value)}
					/>
				</div>
			</div>

			<div className='stats-grid'>
				<div className='stat-card'>
					<h3>Загальна статистика</h3>
					<div className='stat-row'>
						<span>Всього угод:</span>
						<span>{stats.dealsCount}</span>
					</div>
					<div className='stat-row'>
						<span>Завершених угод:</span>
						<span>{stats.completedDealsCount}</span>
					</div>
					<div className='stat-row'>
						<span>Загальна сума:</span>
						<span className='money'>{formatMoney(stats.totalAmount)}</span>
					</div>
					<div className='stat-row'>
						<span>Загальна маржа:</span>
						<span className='money'>{formatMoney(stats.totalMargin)}</span>
					</div>
					<div className='stat-row'>
						<span>Загальна сума комісів:</span>
						<span className='money'>{formatMoney(stats.totalCommission)}</span>
					</div>
				</div>

				<div className='stat-card'>
					<h3>Статистика по клієнтах</h3>
					<table>
						<thead>
							<tr>
								<th>Клієнт</th>
								<th className='center'>Кількість угод</th>
								<th className='center'>Сума</th>
							</tr>
						</thead>
						<tbody>
							{Array.from(stats.customerStats.entries()).map(([customerId, stats]) => (
								<tr key={customerId}>
									<td>{getCustomerName(customerId)}</td>
									<td className='center'>{stats.dealsCount}</td>
									<td className='money'>{formatMoney(stats.amount)}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			<div className='monthly-stats'>
				<h3>Статистика по місяцям</h3>
				<table>
					<thead>
						<tr>
							<th>Місяць</th>
							<th className='center'>Кількість угод</th>
							<th className='center'>Сума</th>
							<th className='center'>Маржа</th>
							<th className='center'>Комісія</th>
						</tr>
					</thead>
					<tbody>
						{Array.from(monthlyStats.entries()).map(([month, stats]) => (
							<tr key={month}>
								<td>{new Date(month + '-01').toLocaleDateString('uk-UA', { year: 'numeric', month: 'long' })}</td>
								<td className='center'>{stats.dealsCount}</td>
								<td className='center'>{formatMoney(stats.totalAmount)}</td>
								<td className='center'>{formatMoney(stats.totalMargin)}</td>
								<td className='center'>{formatMoney(stats.totalCommission)}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
