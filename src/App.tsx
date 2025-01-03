import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { CustomerList } from './components/CustomerList/CustomerList.tsx';
import { CustomerDetails } from './components/CustomerDetails/CustomerDetails.tsx';
import { DealList } from './components/DealList/DealList.tsx';
import { DealDetails } from './components/DealDetails/DealDetails.tsx';
import { Reports } from './components/Reports/Reports.tsx';
import { Home } from './components/Home/Home.tsx';
import { api } from './services/api.ts';
import type { Customer, Deal } from './types/index.ts';
import './styles/App.css';

export function App() {
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [deals, setDeals] = useState<Deal[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		try {
			setIsLoading(true);
			setError(null);
			const [customersData, dealsData] = await Promise.all([api.getCustomers(), api.getDeals()]);
			setCustomers(customersData || []);
			setDeals(dealsData || []);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Помилка при завантаженні даних');
		} finally {
			setIsLoading(false);
		}
	};

	const addCustomer = async (customer: Omit<Customer, 'id'>) => {
		try {
			setError(null);
			await api.addCustomer(customer);
			await loadData();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Помилка при додаванні клієнта');
			throw err;
		}
	};

	const updateCustomer = async (id: string, customer: Customer) => {
		try {
			setError(null);
			await api.updateCustomer(customer);
			await loadData();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Помилка при оновленні клієнта');
			throw err;
		}
	};

	const deleteCustomer = async (id: string) => {
		try {
			setError(null);
			await api.deleteCustomer(id);
			await loadData();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Помилка при видаленні клієнта');
			throw err;
		}
	};

	const addDeal = async (deal: Omit<Deal, 'id'>) => {
		try {
			setError(null);
			await api.addDeal(deal);
			await loadData();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Помилка при додаванні угоди');
			throw err;
		}
	};

	const updateDeal = async (id: string, deal: Deal) => {
		try {
			setError(null);
			await api.updateDeal(deal);
			await loadData();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Помилка при оновленні угоди');
			throw err;
		}
	};

	const deleteDeal = async (id: string) => {
		try {
			setError(null);
			await api.deleteDeal(id);
			await loadData();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Помилка при видаленні угоди');
			throw err;
		}
	};

	if (isLoading) {
		return (
			<div className='loading'>
				<p>Завантаження даних...</p>
			</div>
		);
	}

	return (
		<Router>
			<div className='app'>
				<header className='header'>
					<h1>MiX CRM</h1>
					<nav>
						<Link to='/'>Головна</Link>
						<Link to='/customers'>Клієнти</Link>
						<Link to='/deals'>Угоди</Link>
						<Link to='/reports'>Звіти</Link>
					</nav>
				</header>

				<main className='main'>
					{error && <div className='error-message'>{error}</div>}

					<Routes>
						<Route
							path='/'
							element={
								<Home
									customers={customers}
									deals={deals}
								/>
							}
						/>
						<Route
							path='/customers'
							element={
								<CustomerList
									customers={customers}
									onAddCustomer={addCustomer}
									onUpdateCustomer={updateCustomer}
									onDeleteCustomer={deleteCustomer}
								/>
							}
						/>
						<Route
							path='/customers/:id'
							element={
								<CustomerDetails
									customers={customers}
									deals={deals}
									onUpdateCustomer={updateCustomer}
									onDeleteCustomer={deleteCustomer}
								/>
							}
						/>
						<Route
							path='/deals'
							element={
								<DealList
									deals={deals}
									customers={customers}
									onAddDeal={addDeal}
									onUpdateDeal={updateDeal}
									onDeleteDeal={deleteDeal}
								/>
							}
						/>
						<Route
							path='/deals/:id'
							element={
								<DealDetails
									deals={deals}
									customers={customers}
									onUpdateDeal={updateDeal}
									onDeleteDeal={deleteDeal}
								/>
							}
						/>
						<Route
							path='/reports'
							element={
								<Reports
									deals={deals}
									customers={customers}
								/>
							}
						/>
					</Routes>
				</main>
			</div>
		</Router>
	);
}
