import { useNavigate } from 'react-router-dom';
import type { Customer, Deal } from '../../types/index.js';
import { formatDate, formatMoney, getStatusText } from '../../utils/formatters.js';
import './Home.css';

interface HomeProps {
	customers: Customer[];
	deals: Deal[];
}

export function Home({ customers = [], deals = [] }: HomeProps) {
	const navigate = useNavigate();

	const handleCustomerClick = (customerId: string) => {
		navigate(`/customers/${customerId}`);
	};

	const handleDealClick = (dealId: string) => {
		navigate(`/deals/${dealId}`);
	};

	const getCustomerName = (customerId: string) => {
		const customer = customers.find((c) => c.id === customerId);
		return customer?.companyName || 'Невідомий клієнт';
	};

	if (!Array.isArray(deals) || deals.length === 0) {
		return (
			<div className='home'>
				<h1>Последние сделки</h1>
				<p className='no-data'>Немає доступних угод</p>
			</div>
		);
	}

	const sortedDeals = [...deals].sort((a, b) => {
		const dateA = new Date(a.date);
		const dateB = new Date(b.date);
		return dateB.getTime() - dateA.getTime();
	});

	return (
		<div className='home'>
			<h1>Останні угоди</h1>
			<table>
				<thead>
					<tr>
						<th>Дата</th>
						<th>Клієнт</th>
						<th>Опис угоди</th>
						<th>Сума</th>
						<th>Статус</th>
					</tr>
				</thead>
				<tbody>
					{sortedDeals.map((deal) => (
						<tr key={deal.id}>
							<td>{formatDate(deal.date)}</td>
							<td
								className='clickable'
								onClick={() => handleCustomerClick(deal.customerId)}>
								{getCustomerName(deal.customerId)}
							</td>
							<td
								className='clickable'
								onClick={() => handleDealClick(deal.id)}>
								{deal.description}
							</td>
							<td>{formatMoney(deal.amount)}</td>
							<td>
								<span className={`status status-${deal.status}`}>{getStatusText(deal.status)}</span>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
