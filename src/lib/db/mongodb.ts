import { MongoClient, type Db } from 'mongodb';
import { env } from '$env/dynamic/private';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToDatabase(): Promise<Db | null> {
	if (db) return db;

	const MONGODB_URI = env.MONGODB_URI;
	const MONGODB_DB = env.MONGODB_DB;

	if (!MONGODB_URI) {
		console.warn('MONGODB_URI not set - using in-memory storage');
		return null;
	}

	try {
		client = new MongoClient(MONGODB_URI);
		await client.connect();
		db = client.db(MONGODB_DB || '7kre-coupons');
		return db;
	} catch (error) {
		console.error('Failed to connect to MongoDB:', error);
		return null;
	}
}

export async function getDatabase(): Promise<Db | null> {
	return connectToDatabase();
}

export function isConnected(): boolean {
	return db !== null;
}

