import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDatabase } from '$lib/db/mongodb';
import { getAllCoupons, addCoupon, removeCoupon } from '$lib/db/memoryStore';
import type { Coupon } from '$lib/types';

// GET - Retrieve all coupons
export const GET: RequestHandler = async () => {
	try {
		const db = await getDatabase();
		
		if (db) {
			// Use MongoDB
			const coupons = await db
				.collection<Coupon>('coupons')
				.find({ isActive: true })
				.sort({ createdAt: -1 })
				.toArray();
			return json({ success: true, coupons, source: 'mongodb' });
		} else {
			// Fallback to memory store
			const coupons = getAllCoupons();
			return json({ success: true, coupons, source: 'memory' });
		}
	} catch (error) {
		console.error('Error fetching coupons:', error);
		// Fallback to memory store on error
		const coupons = getAllCoupons();
		return json({ success: true, coupons, source: 'memory' });
	}
};

// POST - Add a single coupon
export const POST: RequestHandler = async ({ request }) => {
	try {
		const { code, description } = await request.json();

		if (!code || typeof code !== 'string') {
			return json({ success: false, error: 'Coupon code is required' }, { status: 400 });
		}

		const db = await getDatabase();
		
		if (db) {
			const collection = db.collection<Coupon>('coupons');
			const existing = await collection.findOne({ code: code.toUpperCase() });
			if (existing) {
				return json({ success: false, error: 'Coupon already exists' }, { status: 409 });
			}

			const coupon: Coupon = {
				code: code.toUpperCase(),
				description: description || '',
				createdAt: new Date(),
				isActive: true
			};

			await collection.insertOne(coupon);
			return json({ success: true, coupon });
		} else {
			const coupon = addCoupon(code, description || '');
			if (!coupon) {
				return json({ success: false, error: 'Coupon already exists' }, { status: 409 });
			}
			return json({ success: true, coupon });
		}
	} catch (error) {
		console.error('Error adding coupon:', error);
		return json({ success: false, error: 'Failed to add coupon' }, { status: 500 });
	}
};

// DELETE - Remove a coupon (soft delete)
export const DELETE: RequestHandler = async ({ request }) => {
	try {
		const { code } = await request.json();

		if (!code) {
			return json({ success: false, error: 'Coupon code is required' }, { status: 400 });
		}

		const db = await getDatabase();
		
		if (db) {
			const result = await db
				.collection<Coupon>('coupons')
				.updateOne({ code: code.toUpperCase() }, { $set: { isActive: false } });

			if (result.matchedCount === 0) {
				return json({ success: false, error: 'Coupon not found' }, { status: 404 });
			}
		} else {
			const removed = removeCoupon(code);
			if (!removed) {
				return json({ success: false, error: 'Coupon not found' }, { status: 404 });
			}
		}

		return json({ success: true, message: 'Coupon removed' });
	} catch (error) {
		console.error('Error removing coupon:', error);
		return json({ success: false, error: 'Failed to remove coupon' }, { status: 500 });
	}
};
