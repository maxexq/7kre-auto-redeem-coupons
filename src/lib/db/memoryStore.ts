import type { Coupon } from '$lib/types';

// In-memory storage for development/fallback
const coupons: Map<string, Coupon> = new Map();

// Default coupon codes
const DEFAULT_COUPONS = [
	'DANCINGPOOKI',
	'BRANZEBRANSEL',
	'GRACEOFCHAOS',
	'7S7E7V7E7N7',
	'SENAHAJASENA',
	'HAPPYNEWYEAR2026',
	'CHAOSESSENCE',
	'100MILLIONHEARTS',
	'77EVENT77',
	'KEYKEYKEY',
	'POOKIFIVEKINDS',
	'LETSGO7K',
	'GOLDENKINGPEPE',
	'DELLONSVSKRIS',
	'TARGETWISH',
	'HALFGOODHALFEVIL',
	'OBLIVION',
	'SENASTARCRYSTAL',
	'SENA77MEMORY',
	'SUNWUKONGNO1'
];

// Initialize with default coupons
let initialized = false;

export function initializeMemoryStore(): void {
	if (initialized) return;
	
	DEFAULT_COUPONS.forEach(code => {
		coupons.set(code, {
			code,
			description: '',
			createdAt: new Date(),
			isActive: true
		});
	});
	
	initialized = true;
}

export function getAllCoupons(): Coupon[] {
	initializeMemoryStore();
	return Array.from(coupons.values()).filter(c => c.isActive);
}

export function addCoupon(code: string, description: string = ''): Coupon | null {
	initializeMemoryStore();
	const normalizedCode = code.toUpperCase().trim();
	
	if (coupons.has(normalizedCode)) {
		return null;
	}
	
	const coupon: Coupon = {
		code: normalizedCode,
		description,
		createdAt: new Date(),
		isActive: true
	};
	
	coupons.set(normalizedCode, coupon);
	return coupon;
}

export function removeCoupon(code: string): boolean {
	initializeMemoryStore();
	const normalizedCode = code.toUpperCase().trim();
	const coupon = coupons.get(normalizedCode);
	
	if (!coupon) return false;
	
	coupon.isActive = false;
	return true;
}

export function seedDefaultCoupons(): { added: string[]; skipped: string[] } {
	const results = { added: [] as string[], skipped: [] as string[] };
	
	DEFAULT_COUPONS.forEach(code => {
		if (coupons.has(code) && coupons.get(code)?.isActive) {
			results.skipped.push(code);
		} else {
			coupons.set(code, {
				code,
				description: '',
				createdAt: new Date(),
				isActive: true
			});
			results.added.push(code);
		}
	});
	
	initialized = true;
	return results;
}

