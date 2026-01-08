import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDatabase } from '$lib/db/mongodb';
import { addCoupon } from '$lib/db/memoryStore';
import type { Coupon } from '$lib/types';

// POST - Add multiple coupons at once
export const POST: RequestHandler = async ({ request }) => {
	try {
		const { codes } = await request.json();

		if (!Array.isArray(codes) || codes.length === 0) {
			return json({ success: false, error: 'Array of coupon codes is required' }, { status: 400 });
		}

		const db = await getDatabase();
		
		const results = {
			added: [] as string[],
			skipped: [] as string[],
			errors: [] as string[]
		};

		if (db) {
			const collection = db.collection<Coupon>('coupons');

			for (const code of codes) {
				if (!code || typeof code !== 'string') {
					results.errors.push(`Invalid code: ${code}`);
					continue;
				}

				const normalizedCode = code.toUpperCase().trim();
				const existing = await collection.findOne({ code: normalizedCode });
				if (existing) {
					results.skipped.push(normalizedCode);
					continue;
				}

				const coupon: Coupon = {
					code: normalizedCode,
					description: '',
					createdAt: new Date(),
					isActive: true
				};

				await collection.insertOne(coupon);
				results.added.push(normalizedCode);
			}
		} else {
			for (const code of codes) {
				if (!code || typeof code !== 'string') {
					results.errors.push(`Invalid code: ${code}`);
					continue;
				}

				const coupon = addCoupon(code);
				if (coupon) {
					results.added.push(coupon.code);
				} else {
					results.skipped.push(code.toUpperCase());
				}
			}
		}

		return json({
			success: true,
			results,
			message: `Added: ${results.added.length}, Skipped: ${results.skipped.length}, Errors: ${results.errors.length}`
		});
	} catch (error) {
		console.error('Error bulk adding coupons:', error);
		return json({ success: false, error: 'Failed to bulk add coupons' }, { status: 500 });
	}
};
