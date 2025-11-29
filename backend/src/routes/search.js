import express from 'express';
import { tmdb } from '../apis/tmdb.js';

const router = express.Router();

const getLocale = (req) => {
	const locale = req.query.locale || 'uk';
	return locale === 'uk' ? 'uk-UA' : 'en-US';
};

router.get('/', async (req, res) => {
	try {
		const query = req.query?.query;
		const language = getLocale(req);
		const data = await tmdb.searchContent(query, language);
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

export default router;
