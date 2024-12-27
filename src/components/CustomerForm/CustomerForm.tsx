import React, { useState } from 'react';
import type { Customer } from '../../types';
import './CustomerForm.css';

interface CustomerFormProps {
	customer?: Customer;
	onSubmit: (customer: Omit<Customer, 'id'>) => Promise<void>;
	onCancel: () => void;
}

export function CustomerForm({ customer, onSubmit, onCancel }: CustomerFormProps) {
	const [formData, setFormData] = useState<Omit<Customer, 'id'>>(
		customer || {
			companyName: '',
			edrpou: '',
			inn: '',
			city: '',
			address: '',
			contactLastName: '',
			contactFirstName: '',
			contactPosition: '',
			contactWorkPhone: '',
			contactPersonalPhone: '',
			contactWorkEmail: '',
			contactPersonalEmail: '',
		}
	);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		try {
			const cleanedData = Object.fromEntries(
				Object.entries(formData)
					.map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
					.filter(([_, value]) => value !== '')
			) as Omit<Customer, 'id'>;

			await onSubmit(cleanedData);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Ошибка при сохранении клиента');
		}
	};

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	return (
		<form
			onSubmit={handleSubmit}
			className='customer-form'>
			<h2>{customer ? 'Редактировать клиента' : 'Новый клиент'}</h2>

			{error && <div className='error-message'>{error}</div>}

			<div className='form-group'>
				<label htmlFor='companyName'>Название компании:</label>
				<input
					type='text'
					id='companyName'
					name='companyName'
					value={formData.companyName}
					onChange={handleInputChange}
					required
				/>
			</div>

			<div className='form-group'>
				<label htmlFor='edrpou'>ЕДРПОУ:</label>
				<input
					type='text'
					id='edrpou'
					name='edrpou'
					value={formData.edrpou}
					onChange={handleInputChange}
					pattern='^\d{8}$'
					title='ЕДРПОУ должен содержать 8 цифр'
				/>
			</div>

			<div className='form-group'>
				<label htmlFor='inn'>ИНН:</label>
				<input
					type='text'
					id='inn'
					name='inn'
					value={formData.inn}
					onChange={handleInputChange}
					pattern='^\d{10}$'
					title='ИНН должен содержать 10 цифр'
				/>
			</div>

			<div className='form-group'>
				<label htmlFor='city'>Город:</label>
				<input
					type='text'
					id='city'
					name='city'
					value={formData.city}
					onChange={handleInputChange}
				/>
			</div>

			<div className='form-group'>
				<label htmlFor='address'>Адрес:</label>
				<input
					type='text'
					id='address'
					name='address'
					value={formData.address}
					onChange={handleInputChange}
				/>
			</div>

			<div className='form-group'>
				<label htmlFor='contactLastName'>Фамилия контактного лица:</label>
				<input
					type='text'
					id='contactLastName'
					name='contactLastName'
					value={formData.contactLastName}
					onChange={handleInputChange}
				/>
			</div>

			<div className='form-group'>
				<label htmlFor='contactFirstName'>Имя контактного лица:</label>
				<input
					type='text'
					id='contactFirstName'
					name='contactFirstName'
					value={formData.contactFirstName}
					onChange={handleInputChange}
				/>
			</div>

			<div className='form-group'>
				<label htmlFor='contactPosition'>Должность:</label>
				<input
					type='text'
					id='contactPosition'
					name='contactPosition'
					value={formData.contactPosition}
					onChange={handleInputChange}
				/>
			</div>

			<div className='form-group'>
				<label htmlFor='contactWorkPhone'>Рабочий телефон:</label>
				<input
					type='tel'
					id='contactWorkPhone'
					name='contactWorkPhone'
					value={formData.contactWorkPhone}
					onChange={handleInputChange}
					pattern='^\+380\d{9}$'
					title='Телефон должен быть в формате +380XXXXXXXXX'
				/>
			</div>

			<div className='form-group'>
				<label htmlFor='contactPersonalPhone'>Личный телефон:</label>
				<input
					type='tel'
					id='contactPersonalPhone'
					name='contactPersonalPhone'
					value={formData.contactPersonalPhone}
					onChange={handleInputChange}
					pattern='^\+380\d{9}$'
					title='Телефон должен быть в формате +380XXXXXXXXX'
				/>
			</div>

			<div className='form-group'>
				<label htmlFor='contactWorkEmail'>Рабочий email:</label>
				<input
					type='email'
					id='contactWorkEmail'
					name='contactWorkEmail'
					value={formData.contactWorkEmail}
					onChange={handleInputChange}
				/>
			</div>

			<div className='form-group'>
				<label htmlFor='contactPersonalEmail'>Личный email:</label>
				<input
					type='email'
					id='contactPersonalEmail'
					name='contactPersonalEmail'
					value={formData.contactPersonalEmail}
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
