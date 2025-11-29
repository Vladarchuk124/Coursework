import express from 'express';
import { reports } from '../service/reports-service.js';
import { ErrorCodes } from '../../enums/error-codes.js';

const router = express.Router();

const clientErrors = new Set([
	ErrorCodes.NO_USER,
	ErrorCodes.INVALID_CONTENT_ID,
	ErrorCodes.UNSUPPORTED_CONTENT_TYPE,
	ErrorCodes.NO_REVIEW,
	ErrorCodes.REPORT_ALREADY_EXISTS,
	ErrorCodes.REPORT_REASON_REQUIRED,
	ErrorCodes.CANNOT_REPORT_OWN_REVIEW
]);

router.post('/', async (req, res) => {
	try {
		const data = await reports.create(req.body);
		res.status(201).json(data);
	} catch (error) {
		const status = clientErrors.has(error.message) ? 400 : 500;
		res.status(status).json({ error: error.message });
	}
});

export default router;

