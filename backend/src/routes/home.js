import express from 'express';
import { tmdb } from '../apis/tmdb.js';

const router = express.Router();

const getLocale = (req) => {
	const locale = req.query.locale || 'uk';
	return locale === 'uk' ? 'uk-UA' : 'en-US';
};

router.get('/trending', async (req, res) => {
	try {
		const language = getLocale(req);
		const timeWindow = req.query.time || 'week';
		const data = await tmdb.getTrending('all', timeWindow, language);
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

router.get('/now-playing', async (req, res) => {
	try {
		const language = getLocale(req);
		const data = await tmdb.getNowPlayingMovies(language);
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

router.get('/upcoming', async (req, res) => {
	try {
		const language = getLocale(req);
		const data = await tmdb.getUpcomingMovies(language);
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

router.get('/top-rated', async (req, res) => {
	try {
		const language = getLocale(req);
		const data = await tmdb.getTopRatedAll(language);
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

router.get('/on-the-air', async (req, res) => {
	try {
		const language = getLocale(req);
		const data = await tmdb.getOnTheAirShows(language);
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

router.get('/popular-shows', async (req, res) => {
	try {
		const language = getLocale(req);
		const data = await tmdb.getPopularShows(language);
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

export default router;


