import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getStatusFromErrorCode, type RedeemApiResponse, type RedemptionResult } from '$lib/types';

const NETMARBLE_API = 'https://coupon.netmarble.com/api/coupon/reward';
const GAME_CODE = 'tskgb';
const LANG_CODE = 'TH_TH';

// POST - Redeem a single coupon
export const POST: RequestHandler = async ({ request }) => {
	try {
		const { pid, couponCode } = await request.json();

		if (!pid || typeof pid !== 'string') {
			return json({ 
				success: false, 
				error: 'PID is required',
				result: {
					code: couponCode,
					status: 'error',
					message: 'PID is required'
				} as RedemptionResult
			}, { status: 400 });
		}

		if (!couponCode || typeof couponCode !== 'string') {
			return json({ 
				success: false, 
				error: 'Coupon code is required',
				result: {
					code: couponCode,
					status: 'error',
					message: 'Coupon code is required'
				} as RedemptionResult
			}, { status: 400 });
		}

		// Call Netmarble API
		const url = `${NETMARBLE_API}?gameCode=${GAME_CODE}&couponCode=${encodeURIComponent(couponCode)}&langCd=${LANG_CODE}&pid=${encodeURIComponent(pid)}`;
		
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Accept': 'application/json',
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
			}
		});

		const data: RedeemApiResponse = await response.json();

		// Determine status based on response
		const status = getStatusFromErrorCode(data.errorCode);
		
		const result: RedemptionResult = {
			code: couponCode,
			status,
			message: data.errorMessage || (status === 'success' ? 'แลกคูปองสำเร็จ!' : 'เกิดข้อผิดพลาด'),
			errorCode: data.errorCode
		};

		return json({
			success: status === 'success',
			result,
			rawResponse: data
		});

	} catch (error) {
		console.error('Error redeeming coupon:', error);
		return json({ 
			success: false, 
			error: 'Failed to redeem coupon',
			result: {
				code: '',
				status: 'error',
				message: 'การเชื่อมต่อล้มเหลว'
			} as RedemptionResult
		}, { status: 500 });
	}
};

