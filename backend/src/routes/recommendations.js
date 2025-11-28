import express from 'express';
import { recommendations } from '../service/recommendations-service.js';

const router = express.Router();

router.post('/', async (req, res) => {
	try {
		const { userId, ...options } = req.body;
		if (!userId) {
			return res.status(400).json({ error: 'User ID is required' });
		}
		const numericUserId = Number(userId);
		if (isNaN(numericUserId)) {
			return res.status(400).json({ error: 'Invalid User ID' });
		}
		const data = await recommendations.getRecommendationsForUser(numericUserId, options);
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

export default router;
