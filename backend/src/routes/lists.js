import express from 'express';
import { lists } from '../service/lists-service.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const data = await lists.getListDetails(id);
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

router.get('/user-lists/:id', async (req, res) => {
	try {
		const { id: user_id } = req.params;
		const data = await lists.getUserLists(user_id);
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

router.post('/create', async (req, res) => {
	try {
		const { user_id, title } = req.body;
		if (!user_id || !title) {
			return res.status(400).json({ error: 'USER_AND_TITLE_REQUIRED' });
		}

		const data = await lists.createUserList(user_id, title);
		res.status(201).json(data);
	} catch (error) {
		const status = error.message === 'NO_USER' ? 404 : 500;
		res.status(status).json({ error: error.message });
	}
});

router.post('/add-to-list', async (req, res) => {
	try {
		const data = req.body;
		const results = await lists.addItemToList(data);
		res.json(results);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

router.delete('/remove-from-list', async (req, res) => {
	try {
		const { id } = req.query;
		const data = await lists.removeItemFromList(id);
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

export default router;
