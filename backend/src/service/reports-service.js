import prisma from '../config/prisma-client.js';
import { ErrorCodes } from '../../enums/error-codes.js';
import { contentTypes } from '../../enums/content-type.js';

const ensureUserExists = async (user_id) => {
	const id = Number(user_id);
	if (!id || Number.isNaN(id)) {
		throw new Error(ErrorCodes.NO_USER);
	}

	const user = await prisma.user.findUnique({ where: { id } });
	if (!user) {
		throw new Error(ErrorCodes.NO_USER);
	}

	return user;
};

const validateContent = (content_id, content_type) => {
	const id = Number(content_id);
	if (!id || Number.isNaN(id)) {
		throw new Error(ErrorCodes.INVALID_CONTENT_ID);
	}

	if (![contentTypes.movie, contentTypes.show].includes(content_type)) {
		throw new Error(ErrorCodes.UNSUPPORTED_CONTENT_TYPE);
	}

	return { id, type: content_type };
};

export const reports = {
	create: async ({ reporter_id, review_id, reason, content_id, content_type }) => {
		const reporter = await ensureUserExists(reporter_id);
		const { id: contentId, type } = validateContent(content_id, content_type);

		if (!reason || typeof reason !== 'string' || !reason.trim()) {
			throw new Error(ErrorCodes.REPORT_REASON_REQUIRED);
		}

		const reviewId = Number(review_id);
		if (!reviewId || Number.isNaN(reviewId)) {
			throw new Error(ErrorCodes.NO_REVIEW);
		}

		const review = await prisma.review.findUnique({
			where: { id: reviewId },
			include: { user: true }
		});

		if (!review) {
			throw new Error(ErrorCodes.NO_REVIEW);
		}

		if (review.user_id === reporter.id) {
			throw new Error(ErrorCodes.CANNOT_REPORT_OWN_REVIEW);
		}

		const existingReport = await prisma.report.findUnique({
			where: {
				reporter_id_review_id: {
					reporter_id: reporter.id,
					review_id: reviewId
				}
			}
		});

		if (existingReport) {
			throw new Error(ErrorCodes.REPORT_ALREADY_EXISTS);
		}

		return prisma.report.create({
			data: {
				reporter_id: reporter.id,
				reported_user_id: review.user_id,
				review_id: reviewId,
				reason: reason.trim(),
				content_id: contentId,
				content_type: type
			}
		});
	},

	getAll: async () => {
		const dbReports = await prisma.report.findMany({
			include: {
				reporter: { select: { id: true, name: true, email: true } },
				reported_user: { select: { id: true, name: true, email: true, is_blocked: true } },
				review: { select: { id: true, body: true, created_at: true } }
			},
			orderBy: { created_at: 'desc' }
		});

		return dbReports.map((report) => ({
			id: report.id,
			reporter: {
				id: report.reporter.id,
				name: report.reporter.name || report.reporter.email
			},
			reported_user: {
				id: report.reported_user.id,
				name: report.reported_user.name || report.reported_user.email,
				is_blocked: report.reported_user.is_blocked
			},
			review: {
				id: report.review.id,
				body: report.review.body,
				created_at: report.review.created_at
			},
			reason: report.reason,
			content_id: report.content_id,
			content_type: report.content_type,
			created_at: report.created_at
		}));
	},

	delete: async (report_id) => {
		const id = Number(report_id);
		if (!id || Number.isNaN(id)) {
			throw new Error(ErrorCodes.NO_REPORT);
		}

		const report = await prisma.report.findUnique({ where: { id } });
		if (!report) {
			throw new Error(ErrorCodes.NO_REPORT);
		}

		await prisma.report.delete({ where: { id } });
	}
};

