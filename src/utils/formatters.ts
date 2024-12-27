export const formatDate = (date: string): string => {
	return new Date(date).toLocaleDateString();
};

export const formatMoney = (amount: number): string => {
	return `${amount.toLocaleString()} грн.`;
};

export const getStatusText = (status: string): string => {
	switch (status) {
		case 'new':
			return 'Новая';
		case 'in-progress':
			return 'В работе';
		case 'completed':
			return 'Завершена';
		default:
			return status;
	}
};
