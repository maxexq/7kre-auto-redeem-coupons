export interface Coupon {
	_id?: string;
	code: string;
	description?: string;
	createdAt: Date;
	isActive: boolean;
}

export interface RedemptionResult {
	code: string;
	status: 'success' | 'expired' | 'already_used' | 'invalid' | 'error' | 'pending' | 'redeeming';
	message: string;
	errorCode?: number;
}

export interface RedeemApiResponse {
	errorCode?: number;
	errorMessage?: string;
	errorCause?: string | null;
	httpStatus?: number;
	// Success response fields
	result?: {
		rewardItems?: Array<{
			itemName: string;
			itemCount: number;
		}>;
	};
}

// Error codes from Netmarble API
export const ERROR_CODES = {
	24004: 'already_used',      // 해당 쿠폰의 교환 횟수를 초과하였습니다 (Exceeded redemption limit)
	24003: 'expired',          // Coupon expired
	24001: 'invalid',          // Invalid coupon code
	24002: 'invalid',          // Invalid coupon
} as const;

export function getStatusFromErrorCode(errorCode?: number): RedemptionResult['status'] {
	if (!errorCode) return 'success';
	return ERROR_CODES[errorCode as keyof typeof ERROR_CODES] || 'error';
}

export function getStatusLabel(status: RedemptionResult['status']): string {
	const labels: Record<RedemptionResult['status'], string> = {
		success: 'สำเร็จ',
		expired: 'หมดอายุ',
		already_used: 'ใช้แล้ว',
		invalid: 'ไม่ถูกต้อง',
		error: 'ผิดพลาด',
		pending: 'รอดำเนินการ',
		redeeming: 'กำลังแลก...'
	};
	return labels[status];
}

export function getStatusColor(status: RedemptionResult['status']): string {
	const colors: Record<RedemptionResult['status'], string> = {
		success: '#4CAF50',
		expired: '#9E9E9E',
		already_used: '#FF9800',
		invalid: '#f44336',
		error: '#f44336',
		pending: '#2196F3',
		redeeming: '#9C27B0'
	};
	return colors[status];
}

