export const formatDate = (date: string): string => {
	return new Date(date).toLocaleDateString('ru-RU');
};

export const formatMoney = (amount: number): string => {
	return new Intl.NumberFormat('ru-RU', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amount);
};

export const getStatusText = (status: string): string => {
	const statusMap: Record<string, string> = {
		new: 'Нова',
		in_progress: 'В роботі',
		completed: 'Завершена',
		cancelled: 'Скасована',
	};
	return statusMap[status] || status;
};

export const calculateMargin = (amount: number, costPrice: number, additionalCosts: number): number => {
	return (amount - costPrice) * 0.629 - additionalCosts;
};

export const calculateCommission = (margin: number, isProject: boolean): number => {
	if (isProject || margin > 10000) {
		return margin * 0.16;
	} else if (margin > 5000) {
		return margin * 0.13;
	} else if (margin > 2500) {
		return margin * 0.1;
	} else {
		return margin * 0.05;
	}
};
