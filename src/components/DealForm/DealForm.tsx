import React, { useState } from 'react';
import type { Customer, Deal } from '../../types';
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
	});

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
			setError(err instanceof Error ? err.message : 'Ошибка при сохранении сделки');
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className='deal-form'>
			<h2>{deal ? 'Редактировать сделку' : 'Новая сделка'}</h2>

			{error && <div className='error-message'>{error}</div>}

			<div className='form-group'>
				<label htmlFor='customerId'>Клиент:</label>
				<select
					id='customerId'
					name='customerId'
					value={formData.customerId}
					onChange={handleInputChange}
					required>
					<option value=''>Выберите клиента</option>
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
				<label htmlFor='description'>Описание:</label>
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
					<label htmlFor='amount'>Сумма:</label>
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
					<label htmlFor='costPrice'>Себестоимость:</label>
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
						<option value='new'>Новая</option>
						<option value='in_progress'>В работе</option>
						<option value='completed'>Завершена</option>
						<option value='cancelled'>Отменена</option>
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
						Коммерческое предложение
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
						Оплачено
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
						Доставлено
					</label>
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
					title='Сохранить'>
					<i className='material-icons'>save</i>
				</button>
				<button
					type='button'
					onClick={onCancel}
					className='icon-button secondary'
					title='Отмена'>
					<i className='material-icons'>close</i>
				</button>
			</div>
		</form>
	);
}
