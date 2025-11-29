import express from 'express';
import { tmdb } from '../apis/tmdb.js';

const router = express.Router();

const getLocale = (req) => {
	const locale = req.query.locale || 'uk';
	return locale === 'uk' ? 'uk-UA' : 'en-US';
};

router.get('/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const language = getLocale(req);
		const actor = await tmdb.getActorById(id, language);
		res.json(actor);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

router.get('/:id/credits', async (req, res) => {
	try {
		const { id } = req.params;
		const language = getLocale(req);
		const credits = await tmdb.getActorCredits(id, language);
		res.json(credits);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

export default router;
