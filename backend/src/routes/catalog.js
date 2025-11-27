import express from 'express';
import { tmdb } from '../apis/tmdb.js';

const router = express.Router();

// Витягує параметри фільтрації з запиту (для фільмів)
const getMovieFilterParams = (req) => {
	const params = {};

	if (req.query.sort_by) {
		params.sort_by = req.query.sort_by;
	}

	if (req.query.with_genres) {
		params.with_genres = req.query.with_genres;
	}

	// Діапазон років для фільмів
	if (req.query.year_gte) {
		params['primary_release_date.gte'] = `${req.query.year_gte}-01-01`;
	}
	if (req.query.year_lte) {
		params['primary_release_date.lte'] = `${req.query.year_lte}-12-31`;
	}

	// Рейтинг
	if (req.query.vote_average_gte) {
		params['vote_average.gte'] = parseFloat(req.query.vote_average_gte);
	}
	if (req.query.vote_average_lte) {
		params['vote_average.lte'] = parseFloat(req.query.vote_average_lte);
	}

	return params;
};

// Витягує параметри фільтрації з запиту (для серіалів)
const getShowFilterParams = (req) => {
	const params = {};

	if (req.query.sort_by) {
		// Для серіалів використовуємо first_air_date замість primary_release_date
		let sortBy = req.query.sort_by;
		if (sortBy.includes('primary_release_date')) {
			sortBy = sortBy.replace('primary_release_date', 'first_air_date');
		}
		params.sort_by = sortBy;
	}

	if (req.query.with_genres) {
		params.with_genres = req.query.with_genres;
	}

	// Діапазон років для серіалів
	if (req.query.year_gte) {
		params['first_air_date.gte'] = `${req.query.year_gte}-01-01`;
	}
	if (req.query.year_lte) {
		params['first_air_date.lte'] = `${req.query.year_lte}-12-31`;
	}

	// Рейтинг
	if (req.query.vote_average_gte) {
		params['vote_average.gte'] = parseFloat(req.query.vote_average_gte);
	}
	if (req.query.vote_average_lte) {
		params['vote_average.lte'] = parseFloat(req.query.vote_average_lte);
	}

	return params;
};

router.get('/genres/movie', async (req, res) => {
	try {
		const language = getLocale(req);
		const genres = await tmdb.getMovieGenres(language);
		res.json(genres);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

router.get('/genres/tv', async (req, res) => {
	try {
		const language = getLocale(req);
		const genres = await tmdb.getTvGenres(language);
		res.json(genres);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

router.get('/movies', async (req, res) => {
	try {
		const language = getLocale(req);
		const page = parseInt(req.query.page) || 1;
		const filters = getMovieFilterParams(req);
		const data = await tmdb.discoverMovies(language, page, filters);
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

router.get('/shows', async (req, res) => {
	try {
		const language = getLocale(req);
		const page = parseInt(req.query.page) || 1;
		const filters = getShowFilterParams(req);
		const data = await tmdb.discoverShows(language, page, filters);
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

router.get('/cartoons', async (req, res) => {
	try {
		const language = getLocale(req);
		const page = parseInt(req.query.page) || 1;
		const movieFilters = getMovieFilterParams(req);
		const showFilters = getShowFilterParams(req);

		const [moviesData, showsData] = await Promise.all([
			tmdb.discoverMovies(language, page, { ...movieFilters, with_genres: '16' }),
			tmdb.discoverShows(language, page, { ...showFilters, with_genres: '16' })
		]);

		const movies = moviesData.results.map((m) => ({ ...m, media_type: 'movie' }));
		const shows = showsData.results.map((s) => ({ ...s, media_type: 'tv' }));

		const combined = [...movies, ...shows].sort((a, b) => b.popularity - a.popularity);

		res.json({
			results: combined,
			page,
			totalPages: Math.min(moviesData.totalPages, showsData.totalPages)
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

router.get('/top', async (req, res) => {
	try {
		const language = getLocale(req);
		const page = parseInt(req.query.page) || 1;
		const data = await tmdb.getTopRatedAll(language, page);
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
