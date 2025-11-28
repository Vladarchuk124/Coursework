import express from 'express';
import { auth } from '../service/auth-service.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const data = await auth.getUserById(id);
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

export default router;
