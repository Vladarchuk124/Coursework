import express from 'express';
import { reviews } from '../service/reviews-service.js';
import { ErrorCodes } from '../../enums/error-codes.js';

const router = express.Router();

const clientErrors = new Set([
	ErrorCodes.UNSUPPORTED_CONTENT_TYPE,
	ErrorCodes.INVALID_CONTENT_ID,
	ErrorCodes.REVIEW_TEXT_REQUIRED,
	ErrorCodes.NO_USER,
	ErrorCodes.NO_REVIEW,
	ErrorCodes.NOT_REVIEW_OWNER
]);

router.get('/', async (req, res) => {
	try {
		const { content_id, content_type, user_id } = req.query;
		const data = await reviews.getByContent({ content_id, content_type, user_id });
		res.json(data);
	} catch (error) {
		const status = clientErrors.has(error.message) ? 400 : 500;
		res.status(status).json({ error: error.message });
	}
});

router.post('/', async (req, res) => {
	try {
		const data = await reviews.create(req.body);
		res.status(201).json(data);
	} catch (error) {
		const status = clientErrors.has(error.message) ? 400 : 500;
		res.status(status).json({ error: error.message });
	}
});

router.delete('/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const { user_id } = req.body;
		await reviews.delete(id, user_id);
		res.json({ success: true });
	} catch (error) {
		const status = clientErrors.has(error.message) ? 400 : 500;
		res.status(status).json({ error: error.message });
	}
});

export default router;
