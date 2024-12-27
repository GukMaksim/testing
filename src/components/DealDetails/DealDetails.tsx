import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Customer, Deal } from '../../types';
import './DealDetails.css';

interface DealDetailsProps {
	deals: Deal[];
	customers: Customer[];
	onUpdateDeal: (id: string, deal: Deal) => Promise<void>;
	onDeleteDeal: (id: string) => Promise<void>;
}

export function DealDetails({ deals, customers, onUpdateDeal, onDeleteDeal }: DealDetailsProps) {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [error, setError] = useState<string | null>(null);
	const [isEditing, setIsEditing] = useState(false);

	const deal = deals.find((d) => d.id === id);
	const customer = customers.find((c) => deal && c.id === deal.customerId);

	const [editedDeal, setEditedDeal] = useState<Deal | null>(deal || null);

	if (!deal) {
		return (
			<div className='deal-details'>
				<h1>Сделка не найдена</h1>
				<button
					onClick={() => navigate('/deals')}
					className='icon-button back-button'
					title='Вернуться к списку'>
					<i className='material-icons'>arrow_back</i>
				</button>
			</div>
		);
	}

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, field: keyof Deal) => {
		if (!editedDeal) return;

		const value =
			event.target.type === 'checkbox'
				? (event.target as HTMLInputElement).checked
				: event.target.type === 'number'
				? parseFloat(event.target.value) || 0
				: event.target.value;

		setEditedDeal({ ...editedDeal, [field]: value });
	};

	const handleSave = async () => {
		if (!editedDeal) return;

		try {
			await onUpdateDeal(editedDeal.id, editedDeal);
			setIsEditing(false);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Ошибка при обновлении сделки');
		}
	};

	const handleDelete = async () => {
		if (!window.confirm('Вы уверены, что хотите удалить эту сделку?')) {
			return;
		}

		try {
			await onDeleteDeal(deal.id);
			navigate('/deals');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Ошибка при удалении сделки');
		}
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

	return (
		<div className='deal-details'>
			<div className='header-actions'>
				<button
					onClick={() => navigate('/deals')}
					className='icon-button back-button'
					title='Вернуться к списку'>
					<i className='material-icons'>arrow_back</i>
				</button>
				<div className='action-buttons'>
					{!isEditing && (
						<>
							<button
								onClick={() => setIsEditing(true)}
								className='icon-button edit-button'
								title='Редактировать'>
								<i className='material-icons'>edit</i>
							</button>
							<button
								onClick={handleDelete}
								className='icon-button delete-button'
								title='Удалить'>
								<i className='material-icons'>delete</i>
							</button>
						</>
					)}
				</div>
			</div>

			{error && <div className='error-message'>{error}</div>}

			<div className='deal-info'>
				{isEditing && editedDeal ? (
					<>
						<div className='form-group'>
							<label>Дата:</label>
							<input
								type='date'
								value={editedDeal.date}
								onChange={(e) => handleInputChange(e, 'date')}
							/>
						</div>

						<div className='form-group'>
							<label>Клиент:</label>
							<select
								value={editedDeal.customerId}
								onChange={(e) => handleInputChange(e, 'customerId')}>
								<option value=''>Выберите клиента</option>
								{customers.map((c) => (
									<option
										key={c.id}
										value={c.id}>
										{c.companyName}
									</option>
								))}
							</select>
						</div>

						<div className='form-group'>
							<label>Описание:</label>
							<input
								type='text'
								value={editedDeal.description}
								onChange={(e) => handleInputChange(e, 'description')}
							/>
						</div>

						<div className='form-group'>
							<label>Сумма:</label>
							<input
								type='number'
								value={editedDeal.amount}
								onChange={(e) => handleInputChange(e, 'amount')}
							/>
						</div>

						<div className='form-group'>
							<label>Себестоимость:</label>
							<input
								type='number'
								value={editedDeal.costPrice}
								onChange={(e) => handleInputChange(e, 'costPrice')}
							/>
						</div>

						<div className='form-group'>
							<label>Коммерческое предложение:</label>
							<input
								type='checkbox'
								checked={editedDeal.hasCommercialProposal}
								onChange={(e) => handleInputChange(e, 'hasCommercialProposal')}
							/>
						</div>

						<div className='form-group'>
							<label>Оплачено:</label>
							<input
								type='checkbox'
								checked={editedDeal.isPaid}
								onChange={(e) => handleInputChange(e, 'isPaid')}
							/>
						</div>

						<div className='form-group'>
							<label>Доставлено:</label>
							<input
								type='checkbox'
								checked={editedDeal.isDelivered}
								onChange={(e) => handleInputChange(e, 'isDelivered')}
							/>
						</div>

						<div className='form-group'>
							<label>Пресейл:</label>
							<input
								type='text'
								value={editedDeal.presale}
								onChange={(e) => handleInputChange(e, 'presale')}
							/>
						</div>

						<div className='form-group'>
							<label>Статус:</label>
							<select
								value={editedDeal.status}
								onChange={(e) => handleInputChange(e, 'status')}>
								<option value='new'>Новая</option>
								<option value='in_progress'>В работе</option>
								<option value='completed'>Завершена</option>
								<option value='cancelled'>Отменена</option>
							</select>
						</div>

						<div className='form-actions'>
							<button
								onClick={handleSave}
								className='icon-button save-button'
								title='Сохранить'>
								<i className='material-icons'>save</i>
							</button>
							<button
								onClick={() => {
									setIsEditing(false);
									setEditedDeal(deal);
								}}
								className='icon-button cancel-button'
								title='Отмена'>
								<i className='material-icons'>close</i>
							</button>
						</div>
					</>
				) : (
					<>
						<h1>Сделка #{deal.id}</h1>
						<div className='info-group'>
							<label>Дата:</label>
							<span>{formatDate(deal.date)}</span>
						</div>

						<div className='info-group'>
							<label>Клиент:</label>
							<span>{customer?.companyName || 'Неизвестный клиент'}</span>
						</div>

						<div className='info-group'>
							<label>Описание:</label>
							<span>{deal.description}</span>
						</div>

						<div className='info-group'>
							<label>Сумма:</label>
							<span>{formatMoney(deal.amount)}</span>
						</div>

						<div className='info-group'>
							<label>Себестоимость:</label>
							<span>{formatMoney(deal.costPrice)}</span>
						</div>

						<div className='info-group'>
							<label>Коммерческое предложение:</label>
							<span>{deal.hasCommercialProposal ? 'Да' : 'Нет'}</span>
						</div>

						<div className='info-group'>
							<label>Оплачено:</label>
							<span>{deal.isPaid ? 'Да' : 'Нет'}</span>
						</div>

						<div className='info-group'>
							<label>Доставлено:</label>
							<span>{deal.isDelivered ? 'Да' : 'Нет'}</span>
						</div>

						<div className='info-group'>
							<label>Пресейл:</label>
							<span>{deal.presale || 'Не указан'}</span>
						</div>

						<div className='info-group'>
							<label>Статус:</label>
							<span className={`status status-${deal.status}`}>{getStatusText(deal.status)}</span>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
