import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Customer, Deal } from '../../types';
import {
	formatDate,
	formatMoney,
	getStatusText,
	calculateMargin,
	calculateCommission,
} from '../../utils/formatters.js';
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

	useEffect(() => {
		if (editedDeal) {
			const margin = calculateMargin(editedDeal.amount, editedDeal.costPrice, editedDeal.additionalCosts);
			const commission = calculateCommission(margin, editedDeal.isProject);
			setEditedDeal((prev) => ({
				...prev!,
				margin,
				commission,
			}));
		}
	}, [editedDeal?.amount, editedDeal?.costPrice, editedDeal?.additionalCosts, editedDeal?.isProject]);

	if (!deal) {
		return (
			<div className='deal-details'>
				<h1>Угода не знайдена</h1>
				<button
					onClick={() => navigate('/deals')}
					className='icon-button back-button'
					title='Повернутись до списку'>
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
			setError(err instanceof Error ? err.message : 'Помилка при оновленні угоди');
		}
	};

	const handleDelete = async () => {
		if (!window.confirm('Ви впевнені, що хочете видалити цю угоду?')) {
			return;
		}

		try {
			await onDeleteDeal(deal.id);
			navigate('/deals');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Помилка при видаленні угоди');
		}
	};

	return (
		<div className='deal-details'>
			<div className='header-actions'>
				<button
					onClick={() => navigate('/deals')}
					className='icon-button back-button'
					title='Повернутись до списку'>
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
								<option value=''>Виберіть клієнта</option>
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
							<label>Опис:</label>
							<input
								type='text'
								value={editedDeal.description}
								onChange={(e) => handleInputChange(e, 'description')}
							/>
						</div>

						<div className='form-group'>
							<label>Сума:</label>
							<input
								type='number'
								value={editedDeal.amount}
								onChange={(e) => handleInputChange(e, 'amount')}
							/>
						</div>

						<div className='form-group'>
							<label>Собівартість:</label>
							<input
								type='number'
								value={editedDeal.costPrice}
								onChange={(e) => handleInputChange(e, 'costPrice')}
							/>
						</div>

						<div className='form-group'>
							<label>ДР:</label>
							<input
								type='number'
								value={editedDeal.additionalCosts}
								onChange={(e) => handleInputChange(e, 'additionalCosts')}
							/>
						</div>

						<div className='form-group'>
							<label>Маржа:</label>
							<input
								type='number'
								value={editedDeal.margin.toFixed(2)}
								readOnly
							/>
						</div>

						<div className='form-group'>
							<label>Коміси:</label>
							<input
								type='number'
								value={editedDeal.commission.toFixed(2)}
								readOnly
							/>
						</div>

						<div className='form-group'>
							<label>КП:</label>
							<input
								type='checkbox'
								checked={editedDeal.hasCommercialProposal}
								onChange={(e) => handleInputChange(e, 'hasCommercialProposal')}
							/>
						</div>

						<div className='form-group'>
							<label>Оплата:</label>
							<input
								type='checkbox'
								checked={editedDeal.isPaid}
								onChange={(e) => handleInputChange(e, 'isPaid')}
							/>
						</div>

						<div className='form-group'>
							<label>Поставка:</label>
							<input
								type='checkbox'
								checked={editedDeal.isDelivered}
								onChange={(e) => handleInputChange(e, 'isDelivered')}
							/>
						</div>

						<div className='form-group'>
							<label>Проєкт:</label>
							<input
								type='checkbox'
								checked={editedDeal.isProject}
								onChange={(e) => handleInputChange(e, 'isProject')}
							/>
						</div>

						<div className='form-group'>
							<label>Пресейл:</label>
							<input
								type='text'
								value={editedDeal.presale || ''}
								onChange={(e) => handleInputChange(e, 'presale')}
							/>
						</div>

						<div className='form-group'>
							<label>Статус:</label>
							<select
								value={editedDeal.status}
								onChange={(e) => handleInputChange(e, 'status')}>
								<option value='new'>Нова</option>
								<option value='in_progress'>В роботі</option>
								<option value='completed'>Завершена</option>
								<option value='cancelled'>Скасована</option>
							</select>
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
									setEditedDeal(deal);
								}}
								className='icon-button cancel-button'
								title='Скасувати'>
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
							<label>Клієнт:</label>
							<span>{customer?.companyName || 'Невідомий клієнт'}</span>
						</div>

						<div className='info-group'>
							<label>Опис:</label>
							<span>{deal.description}</span>
						</div>

						<div className='info-group'>
							<label>Сума:</label>
							<span className='money'>{formatMoney(deal.amount)}</span>
						</div>

						<div className='info-group'>
							<label>Собівартість:</label>
							<span className='money'>{formatMoney(deal.costPrice)}</span>
						</div>

						<div className='info-group'>
							<label>ДР:</label>
							<span className='money'>{formatMoney(deal.additionalCosts)}</span>
						</div>

						<div className='info-group'>
							<label>Маржа:</label>
							<span className='money'>{formatMoney(deal.margin)}</span>
						</div>

						<div className='info-group'>
							<label>Коміси:</label>
							<span className='money'>{formatMoney(deal.commission)}</span>
						</div>

						<div className='info-group'>
							<label>КП:</label>
							<span>{deal.hasCommercialProposal ? 'Так' : 'Ні'}</span>
						</div>

						<div className='info-group'>
							<label>Оплата:</label>
							<span>{deal.isPaid ? 'Так' : 'Ні'}</span>
						</div>

						<div className='info-group'>
							<label>Поставка:</label>
							<span>{deal.isDelivered ? 'Так' : 'Ні'}</span>
						</div>

						<div className='info-group'>
							<label>Проєкт:</label>
							<span>{deal.isProject ? 'Так' : 'Ні'}</span>
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
