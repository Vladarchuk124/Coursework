import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testNewLogic() {
	console.log('=== Testing New Recommendations Logic ===\n');

	// Отримаємо поточні рейтинги
	const ratings = await prisma.rating.findMany({
		orderBy: { user_id: 'asc' }
	});

	console.log('Current ratings in DB:');
	ratings.forEach((r) => {
		console.log(`  User ${r.user_id}: ${r.content_type}:${r.content_id} = ${r.value}`);
	});

	console.log('\n--- Testing recommendations for all users ---\n');

	const users = [5, 6, 7];

	for (const userId of users) {
		console.log(`\n=== User ${userId} ===`);

		// Отримаємо рейтинги користувача
		const userRatings = ratings.filter((r) => r.user_id === userId);
		console.log(`User has rated ${userRatings.length} items:`);
		userRatings.forEach((r) => {
			console.log(`  - ${r.content_type}:${r.content_id} = ${r.value}`);
		});

		try {
			const response = await fetch('http://localhost:3000/api/recommendations', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId, limit: 20 })
			});

			const data = await response.json();
			console.log(`\nRecommendations: ${data.length} items`);

			if (data.length > 0) {
				data.forEach((rec, idx) => {
					console.log(`  ${idx + 1}. ${rec.content_type}:${rec.content_id}`);
				});

				// Перевіряємо чи є оцінені елементи у рекомендаціях (їх НЕ повинно бути)
				const ratedKeys = new Set(userRatings.map((r) => `${r.content_type}:${r.content_id}`));
				const recommendedKeys = data.map((d) => `${d.content_type}:${d.content_id}`);
				const conflicts = recommendedKeys.filter((k) => ratedKeys.has(k));

				if (conflicts.length > 0) {
					console.log('\n⚠️  WARNING: Found rated items in recommendations:', conflicts);
				} else {
					console.log('\n✅ OK: No rated items in recommendations');
				}
			}
		} catch (error) {
			console.error('Error:', error.message);
		}
	}

	await prisma.$disconnect();
}

testNewLogic().catch(console.error);
