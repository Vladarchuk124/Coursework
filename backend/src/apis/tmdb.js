import axios from 'axios';
import '../config/env.js';

const tmdbApi = axios.create({
	baseURL: process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3',
	params: {
		api_key: process.env.TMDB_API_KEY
	}
});

const contentFilter = (results, minVotes = 100) => {
	return results
		.filter((item) => item.poster_path)
		.filter((item) => item.overview)
		.filter((item) => item.vote_count > minVotes)
		.filter((item) => item.popularity > 2)
		.sort((a, b) => b.popularity - a.popularity);
};

const ANIMATION_GENRE_ID = 16;

const discoverBaseParams = {
	include_adult: false,
	include_video: false,
	'vote_count.gte': 50,
	sort_by: 'popularity.desc'
};

export const tmdb = {
	getPopularMovies: async (language = 'en-US', page = 1) => {
		const res = await tmdbApi.get('/movie/popular', { params: { language, page } });
		const movies = contentFilter(res.data.results);
		return { results: movies, page: res.data.page, totalPages: res.data.total_pages };
	},

	getTopRatedMovies: async (language = 'en-US', page = 1) => {
		const res = await tmdbApi.get('/movie/top_rated', { params: { language, page } });
		const movies = contentFilter(res.data.results, 500);
		return { results: movies, page: res.data.page, totalPages: res.data.total_pages };
	},

	getNowPlayingMovies: async (language = 'en-US', page = 1) => {
		const res = await tmdbApi.get('/movie/now_playing', { params: { language, page } });
		const movies = contentFilter(res.data.results, 50);
		return { results: movies, page: res.data.page, totalPages: res.data.total_pages };
	},

	getUpcomingMovies: async (language = 'en-US', page = 1) => {
		const res = await tmdbApi.get('/movie/upcoming', { params: { language, page } });
		const results = contentFilter(res.data.results);
		return {
			results: results,
			page: res.data.page,
			totalPages: res.data.total_pages
		};
	},

	getTrending: async (mediaType = 'all', timeWindow = 'week', language = 'en-US') => {
		const res = await tmdbApi.get(`/trending/${mediaType}/${timeWindow}`, { params: { language } });
		const results = contentFilter(res.data.results);
		return { results };
	},

	discoverMovies: async (language = 'en-US', page = 1, options = {}) => {
		const res = await tmdbApi.get('/discover/movie', {
			params: {
				language,
				page,
				...discoverBaseParams,
				...options
			}
		});
		return { results: res.data.results, page: res.data.page, totalPages: res.data.total_pages };
	},

	getMovieById: async (id, language = 'en-US') => {
		const res = await tmdbApi.get(`/movie/${id}`, { params: { language } });
		return res.data;
	},

	getPopularShows: async (language = 'en-US', page = 1) => {
		const res = await tmdbApi.get('/tv/popular', { params: { language, page } });
		const shows = contentFilter(res.data.results, 50);
		return { results: shows, page: res.data.page, totalPages: res.data.total_pages };
	},

	getTopRatedShows: async (language = 'en-US', page = 1) => {
		const res = await tmdbApi.get('/tv/top_rated', { params: { language, page } });
		const shows = contentFilter(res.data.results, 200);
		return { results: shows, page: res.data.page, totalPages: res.data.total_pages };
	},

	getOnTheAirShows: async (language = 'en-US', page = 1) => {
		const res = await tmdbApi.get('/tv/on_the_air', { params: { language, page } });
		const shows = contentFilter(res.data.results, 100);
		return { results: shows, page: res.data.page, totalPages: res.data.total_pages };
	},

	discoverShows: async (language = 'en-US', page = 1, options = {}) => {
		const res = await tmdbApi.get('/discover/tv', {
			params: {
				language,
				page,
				...discoverBaseParams,
				...options
			}
		});
		return { results: res.data.results, page: res.data.page, totalPages: res.data.total_pages };
	},

	getShowById: async (id, language = 'en-US') => {
		const res = await tmdbApi.get(`/tv/${id}`, { params: { language } });
		return res.data;
	},

	getAnimatedMovies: async (language = 'en-US', page = 1) => {
		const res = await tmdbApi.get('/discover/movie', {
			params: {
				language,
				page,
				...discoverBaseParams,
				with_genres: ANIMATION_GENRE_ID
			}
		});
		return { results: res.data.results, page: res.data.page, totalPages: res.data.total_pages };
	},

	getAnimatedShows: async (language = 'en-US', page = 1) => {
		const res = await tmdbApi.get('/discover/tv', {
			params: {
				language,
				page,
				...discoverBaseParams,
				'vote_count.gte': 30,
				with_genres: ANIMATION_GENRE_ID
			}
		});
		return { results: res.data.results, page: res.data.page, totalPages: res.data.total_pages };
	},

	getTopRatedAll: async (language = 'en-US', page = 1) => {
		const baseTopParams = {
			...discoverBaseParams,
			'vote_average.gte': 7,
			sort_by: 'vote_average.desc'
		};

		const [moviesRes, showsRes] = await Promise.all([
			tmdbApi.get('/discover/movie', {
				params: { language, page, ...baseTopParams, 'vote_count.gte': 500 }
			}),
			tmdbApi.get('/discover/tv', {
				params: { language, page, ...baseTopParams, 'vote_count.gte': 200 }
			})
		]);

		const movies = moviesRes.data.results.map((m) => ({ ...m, media_type: 'movie' }));
		const shows = showsRes.data.results.map((s) => ({ ...s, media_type: 'tv' }));

		const combined = [...movies, ...shows].sort((a, b) => b.vote_average - a.vote_average);
		return { results: combined, page, totalPages: Math.min(moviesRes.data.total_pages, showsRes.data.total_pages) };
	},

	getMovieGenres: async (language = 'en-US') => {
		const res = await tmdbApi.get('/genre/movie/list', { params: { language } });
		return res.data.genres;
	},

	getTvGenres: async (language = 'en-US') => {
		const res = await tmdbApi.get('/genre/tv/list', { params: { language } });
		return res.data.genres;
	},

	searchContent: async (query, language = 'en-US') => {
		if (!query || query.trim().length === 0) {
			return [];
		}

		let [movieRes, tvRes] = await Promise.all([
			tmdbApi.get('/search/movie', { params: { query, language } }),
			tmdbApi.get('/search/tv', { params: { query, language } })
		]);

		movieRes = contentFilter(movieRes.data.results);
		tvRes = contentFilter(tvRes.data.results);

		const movies = movieRes.slice(0, 5) || [];
		const tvs = tvRes.slice(0, 5) || [];
		const combined = [...movies, ...tvs].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)).slice(0, 10);

		return combined;
	}
};
