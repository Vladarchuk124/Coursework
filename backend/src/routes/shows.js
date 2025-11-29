import express from 'express';
import { tmdb } from '../apis/tmdb.js';

const router = express.Router();

router.get('/popular', async (req, res) => {
	try {
		const language = getLocale(req);
		const page = parseInt(req.query.page) || 1;
		const data = await tmdb.getPopularShows(language, page);
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

router.get('/top-rated', async (req, res) => {
	try {
		const language = getLocale(req);
		const page = parseInt(req.query.page) || 1;
		const data = await tmdb.getTopRatedShows(language, page);
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

router.get('/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const language = getLocale(req);
		const data = await tmdb.getShowById(id, language);
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

router.get('/:id/credits', async (req, res) => {
	try {
		const { id } = req.params;
		const language = getLocale(req);
		const data = await tmdb.getShowCredits(id, language);
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

const getLocale = (req) => {
	const locale = req.query.locale || 'uk';
	const language = locale === 'uk' ? 'uk-UA' : 'en-US';
	return language;
};

export default router;
