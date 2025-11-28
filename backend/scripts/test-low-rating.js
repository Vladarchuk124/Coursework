async function testLowRating() {
	console.log('=== Testing User 8 with low rating ===\n');

	const userId = 8;

	try {
		const response = await fetch('http://localhost:3000/api/recommendations', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ userId, limit: 20 })
		});

		const data = await response.json();
		console.log(`User ${userId} recommendations: ${data.length} items\n`);

		data.forEach((rec, idx) => {
			console.log(`  ${idx + 1}. ${rec.content_type}:${rec.content_id}`);
		});

		// Перевіряємо чи є show:1396 (низька оцінка) у рекомендаціях
		const hasLowRatedShow = data.some((d) => d.content_type === 'show' && d.content_id === 1396);

		if (hasLowRatedShow) {
			console.log('\n❌ ERROR: show:1396 (rated with 3) is in recommendations!');
		} else {
			console.log('\n✅ OK: show:1396 (rated with 3) is NOT in recommendations');
		}

		// Перевіряємо інші оцінені елементи
		const ratedItems = ['show:1622', 'show:153312', 'movie:1242898'];

		const conflicts = data.filter((d) => ratedItems.includes(`${d.content_type}:${d.content_id}`));

		if (conflicts.length > 0) {
			console.log(
				'❌ Found other rated items:',
				conflicts.map((c) => `${c.content_type}:${c.content_id}`)
			);
		} else {
			console.log('✅ No other rated items in recommendations');
		}
	} catch (error) {
		console.error('Error:', error.message);
	}
}

testLowRating();
