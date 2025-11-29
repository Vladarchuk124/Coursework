import express from 'express';
import { admin } from '../service/admin-service.js';
import { reports } from '../service/reports-service.js';
import { ErrorCodes } from '../../enums/error-codes.js';

const router = express.Router();

const clientErrors = new Set([ErrorCodes.NOT_ADMIN, ErrorCodes.NO_USER, ErrorCodes.NO_REVIEW, ErrorCodes.NO_REPORT]);

// Get all reports
router.get('/reports', async (req, res) => {
	try {
		const { admin_id } = req.query;
		await admin.checkAdmin(admin_id).then((result) => {
			if (!result.is_admin) {
				throw new Error(ErrorCodes.NOT_ADMIN);
			}
		});
		const data = await reports.getAll();
		res.json(data);
	} catch (error) {
		const status = clientErrors.has(error.message) ? 403 : 500;
		res.status(status).json({ error: error.message });
	}
});

// Delete a report
router.delete('/reports/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const { admin_id } = req.body;
		await admin.checkAdmin(admin_id).then((result) => {
			if (!result.is_admin) {
				throw new Error(ErrorCodes.NOT_ADMIN);
			}
		});
		await reports.delete(id);
		res.json({ success: true });
	} catch (error) {
		const status = clientErrors.has(error.message) ? 400 : 500;
		res.status(status).json({ error: error.message });
	}
});

// Block user
router.post('/block-user/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const { admin_id } = req.body;
		const data = await admin.blockUser(admin_id, id);
		res.json(data);
	} catch (error) {
		const status = clientErrors.has(error.message) ? 400 : 500;
		res.status(status).json({ error: error.message });
	}
});

// Unblock user
router.post('/unblock-user/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const { admin_id } = req.body;
		const data = await admin.unblockUser(admin_id, id);
		res.json(data);
	} catch (error) {
		const status = clientErrors.has(error.message) ? 400 : 500;
		res.status(status).json({ error: error.message });
	}
});

// Delete review (by admin)
router.delete('/reviews/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const { admin_id } = req.body;
		const data = await admin.deleteReview(admin_id, id);
		res.json(data);
	} catch (error) {
		const status = clientErrors.has(error.message) ? 400 : 500;
		res.status(status).json({ error: error.message });
	}
});

// Check if user is admin
router.get('/check', async (req, res) => {
	try {
		const { user_id } = req.query;
		const data = await admin.checkAdmin(user_id);
		res.json(data);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

export default router;
