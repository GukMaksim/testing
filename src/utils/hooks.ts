import { useMemo } from 'react';
import type { Customer, Deal } from '../types/index.js';

export function useCustomerFinder(customers: Customer[] = []) {
	return useMemo(() => {
		if (!Array.isArray(customers)) return () => null;

		const customerMap = new Map<string, Customer>();
		customers.forEach((customer) => {
			customerMap.set(customer.id, customer);
		});

		return (id: string) => customerMap.get(id);
	}, [customers]);
}

export function useSortedDeals(deals: Deal[] = []) {
	return useMemo(() => {
		if (!Array.isArray(deals)) return [];

		return [...deals].sort((a, b) => {
			const dateA = new Date(a.date);
			const dateB = new Date(b.date);
			return dateB.getTime() - dateA.getTime();
		});
	}, [deals]);
}
