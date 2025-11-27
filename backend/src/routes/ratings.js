import express from 'express';
import { ratings } from '../service/ratings-service.js';
import { ErrorCodes } from '../../enums/error-codes.js';

const router = express.Router();

const clientErrors = new Set([
	ErrorCodes.UNSUPPORTED_CONTENT_TYPE,
	ErrorCodes.INVALID_CONTENT_ID,
	ErrorCodes.NO_USER,
	ErrorCodes.INVALID_RATING_VALUE,
	ErrorCodes.NO_RATING
]);

router.get('/', async (req, res) => {
	try {
		const { content_id, content_type, user_id } = req.query;
		const data = await ratings.getByContent({ content_id, content_type, user_id });
		res.json(data);
	} catch (error) {
		const status = clientErrors.has(error.message) ? 400 : 500;
		res.status(status).json({ error: error.message });
	}
});

router.post('/', async (req, res) => {
	try {
		const data = await ratings.setRating(req.body);
		res.status(201).json(data);
	} catch (error) {
		const status = clientErrors.has(error.message) ? 400 : 500;
		res.status(status).json({ error: error.message });
	}
});

router.delete('/', async (req, res) => {
	try {
		await ratings.deleteRating(req.body);
		res.json({ success: true });
	} catch (error) {
		const status = clientErrors.has(error.message) ? 400 : 500;
		res.status(status).json({ error: error.message });
	}
});

export default router;
