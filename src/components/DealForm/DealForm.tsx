import React, { useState, useEffect } from 'react';
import type { Customer, Deal } from '../../types';
import { calculateMargin, calculateCommission } from '../../utils/formatters.js';
import './DealForm.css';

interface DealFormProps {
	customers: Customer[];
	deal?: Deal;
	onSubmit: (deal: Omit<Deal, 'id'>) => Promise<void>;
	onCancel: () => void;
}

export function DealForm({ customers, deal, onSubmit, onCancel }: DealFormProps) {
	const [error, setError] = useState<string | null>(null);
	const [formData, setFormData] = useState<Omit<Deal, 'id'>>({
		customerId: deal?.customerId || '',
		description: deal?.description || '',
		amount: deal?.amount || 0,
		costPrice: deal?.costPrice || 0,
		date: deal?.date || new Date().toISOString().split('T')[0],
		status: deal?.status || 'new',
		hasCommercialProposal: deal?.hasCommercialProposal || false,
		isPaid: deal?.isPaid || false,
		isDelivered: deal?.isDelivered || false,
		presale: deal?.presale || '',
		isProject: deal?.isProject || false,
		additionalCosts: deal?.additionalCosts || 0,
		margin: deal?.margin || 0,
		commission: deal?.commission || 0,
	});

	useEffect(() => {
		const margin = calculateMargin(formData.amount, formData.costPrice, formData.additionalCosts);
		const commission = calculateCommission(margin, formData.isProject);
		setFormData((prev) => ({
			...prev,
			margin,
			commission,
		}));
	}, [formData.amount, formData.costPrice, formData.additionalCosts, formData.isProject]);

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
		const { name, value, type } = event.target;
		const checked = (event.target as HTMLInputElement).checked;

		setFormData((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value,
		}));
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		try {
			await onSubmit(formData);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Помилка при збереженні угоди');
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className='deal-form'>
			<h2>{deal ? 'Редагувати угоду' : 'Нова угода'}</h2>

			{error && <div className='error-message'>{error}</div>}

			<div className='form-group'>
				<label htmlFor='customerId'>Клієнт:</label>
				<select
					id='customerId'
					name='customerId'
					value={formData.customerId}
					onChange={handleInputChange}
					required>
					<option value=''>Виберіть клієнта</option>
					{customers.map((customer) => (
						<option
							key={customer.id}
							value={customer.id}>
							{customer.companyName}
						</option>
					))}
				</select>
			</div>

			<div className='form-group'>
				<label htmlFor='description'>Опис:</label>
				<textarea
					id='description'
					name='description'
					value={formData.description}
					onChange={handleInputChange}
					required
				/>
			</div>

			<div className='form-row'>
				<div className='form-group'>
					<label htmlFor='amount'>Сума:</label>
					<input
						type='number'
						id='amount'
						name='amount'
						value={formData.amount}
						onChange={handleInputChange}
						min='0'
						step='0.01'
						required
					/>
				</div>

				<div className='form-group'>
					<label htmlFor='costPrice'>Собівартість:</label>
					<input
						type='number'
						id='costPrice'
						name='costPrice'
						value={formData.costPrice}
						onChange={handleInputChange}
						min='0'
						step='0.01'
						required
					/>
				</div>
			</div>

			<div className='form-row'>
				<div className='form-group'>
					<label htmlFor='date'>Дата:</label>
					<input
						type='date'
						id='date'
						name='date'
						value={formData.date}
						onChange={handleInputChange}
						required
					/>
				</div>

				<div className='form-group'>
					<label htmlFor='status'>Статус:</label>
					<select
						id='status'
						name='status'
						value={formData.status}
						onChange={handleInputChange}
						required>
						<option value='new'>Нова</option>
						<option value='in_progress'>В роботі</option>
						<option value='completed'>Завершена</option>
						<option value='cancelled'>Скасована</option>
					</select>
				</div>
			</div>

			<div className='form-row checkboxes'>
				<div className='form-group'>
					<label>
						<input
							type='checkbox'
							name='hasCommercialProposal'
							checked={formData.hasCommercialProposal}
							onChange={handleInputChange}
						/>
						КП
					</label>
				</div>

				<div className='form-group'>
					<label>
						<input
							type='checkbox'
							name='isPaid'
							checked={formData.isPaid}
							onChange={handleInputChange}
						/>
						Оплата
					</label>
				</div>

				<div className='form-group'>
					<label>
						<input
							type='checkbox'
							name='isDelivered'
							checked={formData.isDelivered}
							onChange={handleInputChange}
						/>
						Поставка
					</label>
				</div>

				<div className='form-group'>
					<label>
						<input
							type='checkbox'
							name='isProject'
							checked={formData.isProject}
							onChange={handleInputChange}
						/>
						Проєкт
					</label>
				</div>
			</div>

			<div className='form-row'>
				<div className='form-group'>
					<label htmlFor='additionalCosts'>ДР:</label>
					<input
						type='number'
						id='additionalCosts'
						name='additionalCosts'
						value={formData.additionalCosts}
						onChange={handleInputChange}
						min='0'
						step='0.01'
					/>
				</div>

				<div className='form-group'>
					<label htmlFor='margin'>Маржа:</label>
					<input
						type='number'
						id='margin'
						name='margin'
						value={formData.margin.toFixed(2)}
						readOnly
					/>
				</div>

				<div className='form-group'>
					<label htmlFor='commission'>Коміси:</label>
					<input
						type='number'
						id='commission'
						name='commission'
						value={formData.commission.toFixed(2)}
						readOnly
					/>
				</div>
			</div>

			<div className='form-group'>
				<label htmlFor='presale'>Пресейл:</label>
				<input
					type='text'
					id='presale'
					name='presale'
					value={formData.presale}
					onChange={handleInputChange}
				/>
			</div>

			<div className='form-actions'>
				<button
					type='submit'
					className='icon-button success'
					title='Зберегти'>
					<i className='material-icons'>save</i>
				</button>
				<button
					type='button'
					onClick={onCancel}
					className='icon-button secondary'
					title='Скасувати'>
					<i className='material-icons'>close</i>
				</button>
			</div>
		</form>
	);
}
