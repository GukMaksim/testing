export interface Customer {
	id: string;
	companyName: string;
	edrpou?: string;
	inn?: string;
	city?: string;
	address?: string;
	contactLastName?: string;
	contactFirstName?: string;
	contactPosition?: string;
	contactWorkPhone?: string;
	contactPersonalPhone?: string;
	contactWorkEmail?: string;
	contactPersonalEmail?: string;
}

export interface Deal {
	id: string;
	customerId: string;
	description: string;
	amount: number;
	costPrice: number;
	date: string;
	status: 'new' | 'in_progress' | 'completed' | 'cancelled';
	hasCommercialProposal: boolean;
	isPaid: boolean;
	isDelivered: boolean;
	presale?: string;
}

export interface ApiResponse<T> {
	data?: T;
	error?: string;
}
