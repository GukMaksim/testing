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
			setError(err instanceof Error ? err.message : 'Помилка при збереженні клієнта');
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
			<h2>{customer ? 'Редагувати клієнта' : 'Новий клієнт'}</h2>

			{error && <div className='error-message'>{error}</div>}

			<div className='form-group'>
				<label htmlFor='companyName'>Назва компанії:</label>
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
				<label htmlFor='edrpou'>ЄДРПОУ:</label>
				<input
					type='text'
					id='edrpou'
					name='edrpou'
					value={formData.edrpou}
					onChange={handleInputChange}
					pattern='^\d{8}$'
					title='ЄДРПОУ повинен містити 8 цифр'
				/>
			</div>

			<div className='form-group'>
				<label htmlFor='inn'>ІПН:</label>
				<input
					type='text'
					id='inn'
					name='inn'
					value={formData.inn}
					onChange={handleInputChange}
					pattern='^\d{10}$'
					title='ІПН повинен містити 10 цифр'
				/>
			</div>

			<div className='form-group'>
				<label htmlFor='city'>Місто:</label>
				<input
					type='text'
					id='city'
					name='city'
					value={formData.city}
					onChange={handleInputChange}
				/>
			</div>

			<div className='form-group'>
				<label htmlFor='address'>Адреса:</label>
				<input
					type='text'
					id='address'
					name='address'
					value={formData.address}
					onChange={handleInputChange}
				/>
			</div>

			<div className='form-group'>
				<label htmlFor='contactLastName'>Прізвище контактної особи:</label>
				<input
					type='text'
					id='contactLastName'
					name='contactLastName'
					value={formData.contactLastName}
					onChange={handleInputChange}
				/>
			</div>

			<div className='form-group'>
				<label htmlFor='contactFirstName'>Ім&apos;я контактної особи:</label>
				<input
					type='text'
					id='contactFirstName'
					name='contactFirstName'
					value={formData.contactFirstName}
					onChange={handleInputChange}
				/>
			</div>

			<div className='form-group'>
				<label htmlFor='contactPosition'>Посада:</label>
				<input
					type='text'
					id='contactPosition'
					name='contactPosition'
					value={formData.contactPosition}
					onChange={handleInputChange}
				/>
			</div>

			<div className='form-group'>
				<label htmlFor='contactWorkPhone'>Робочий телефон:</label>
				<input
					type='tel'
					id='contactWorkPhone'
					name='contactWorkPhone'
					value={formData.contactWorkPhone}
					onChange={handleInputChange}
					pattern='^\+380\d{9}$'
					title='Телефон повинен бути у форматі +380XXXXXXXXX'
				/>
			</div>

			<div className='form-group'>
				<label htmlFor='contactPersonalPhone'>Особистий телефон:</label>
				<input
					type='tel'
					id='contactPersonalPhone'
					name='contactPersonalPhone'
					value={formData.contactPersonalPhone}
					onChange={handleInputChange}
					pattern='^\+380\d{9}$'
					title='Телефон повинен бути у форматі +380XXXXXXXXX'
				/>
			</div>

			<div className='form-group'>
				<label htmlFor='contactWorkEmail'>Робочий email:</label>
				<input
					type='email'
					id='contactWorkEmail'
					name='contactWorkEmail'
					value={formData.contactWorkEmail}
					onChange={handleInputChange}
				/>
			</div>

			<div className='form-group'>
				<label htmlFor='contactPersonalEmail'>Особистий email:</label>
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
