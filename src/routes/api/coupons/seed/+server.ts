import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDatabase } from '$lib/db/mongodb';
import { seedDefaultCoupons } from '$lib/db/memoryStore';
import type { Coupon } from '$lib/types';

// Default coupon codes to seed
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

// POST - Seed default coupons
export const POST: RequestHandler = async () => {
	try {
		const db = await getDatabase();
		
		if (db) {
			const collection = db.collection<Coupon>('coupons');

			const results = {
				added: [] as string[],
				skipped: [] as string[]
			};

			for (const code of DEFAULT_COUPONS) {
				const existing = await collection.findOne({ code });
				if (existing) {
					results.skipped.push(code);
					continue;
				}

				const coupon: Coupon = {
					code,
					description: '',
					createdAt: new Date(),
					isActive: true
				};

				await collection.insertOne(coupon);
				results.added.push(code);
			}

			return json({
				success: true,
				results,
				source: 'mongodb',
				message: `Seeded ${results.added.length} coupons, ${results.skipped.length} already existed`
			});
		} else {
			const results = seedDefaultCoupons();
			return json({
				success: true,
				results,
				source: 'memory',
				message: `Seeded ${results.added.length} coupons, ${results.skipped.length} already existed`
			});
		}
	} catch (error) {
		console.error('Error seeding coupons:', error);
		// Fallback to memory store
		const results = seedDefaultCoupons();
		return json({
			success: true,
			results,
			source: 'memory',
			message: `Seeded ${results.added.length} coupons (fallback)`
		});
	}
};
