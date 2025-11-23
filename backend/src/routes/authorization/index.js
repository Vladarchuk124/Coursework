import express from 'express';
import { auth } from '../../service/auth-service.js';

const router = express.Router();

router.post('/register', async (req, res) => {
	try {
		const { name, email, password } = req.body;
		const data = await auth.register(name, email, password);
		res.cookie('refresh_token', data.refresh_token, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body;
		console.log('===', email, password);
		const data = await auth.login(email, password);
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

router.get('/activate/:link', async (req, res) => {
	try {
		const { link } = req.params;
		await auth.activate(link);
		return res.redirect(`${process.env.CLIENT_URL}/popular-movies`);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

export default router;
