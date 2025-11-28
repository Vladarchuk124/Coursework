import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function countUniqueItems() {
	console.log('=== Counting unique items in database ===\n');

	const ratings = await prisma.rating.findMany();

	const uniqueItems = new Set();

	ratings.forEach((r) => {
		uniqueItems.add(`${r.content_type}:${r.content_id}`);
	});

	console.log('Total ratings:', ratings.length);
	console.log('Unique items:', uniqueItems.size);

	console.log('\nUnique items list:');
	[...uniqueItems].sort().forEach((item, idx) => {
		console.log(`  ${idx + 1}. ${item}`);
	});

	console.log('\n--- User ratings summary ---');
	const userRatings = new Map();

	ratings.forEach((r) => {
		if (!userRatings.has(r.user_id)) {
			userRatings.set(r.user_id, new Set());
		}
		userRatings.get(r.user_id).add(`${r.content_type}:${r.content_id}`);
	});

	for (const [userId, items] of userRatings.entries()) {
		const available = uniqueItems.size - items.size;
		console.log(`User ${userId}: rated ${items.size} items, available for recommendations: ${available}`);
	}

	await prisma.$disconnect();
}

countUniqueItems().catch(console.error);
