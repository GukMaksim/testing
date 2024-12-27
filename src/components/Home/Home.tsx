import { useNavigate } from 'react-router-dom';
import type { Customer, Deal } from '../../types/index.js';
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

	const formatDate = (date: string) => {
		return new Date(date).toLocaleDateString('ru-RU');
	};

	const formatMoney = (amount: number) => {
		return new Intl.NumberFormat('ru-RU', {
			style: 'currency',
			currency: 'UAH',
		}).format(amount);
	};

	const getStatusText = (status: string) => {
		const statusMap: Record<string, string> = {
			new: 'Новая',
			in_progress: 'В работе',
			completed: 'Завершена',
			cancelled: 'Отменена',
		};
		return statusMap[status] || status;
	};

	const getCustomerName = (customerId: string) => {
		const customer = customers.find((c) => c.id === customerId);
		return customer?.companyName || 'Неизвестный клиент';
	};

	if (!Array.isArray(deals) || deals.length === 0) {
		return (
			<div className='home'>
				<h1>Последние сделки</h1>
				<p className='no-data'>Нет доступных сделок</p>
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
			<h1>Последние сделки</h1>
			<table>
				<thead>
					<tr>
						<th>Дата</th>
						<th>Клиент</th>
						<th>Описание</th>
						<th>Сумма</th>
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
