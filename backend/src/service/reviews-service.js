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

	return id;
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

const validateText = (text) => {
	if (!text || typeof text !== 'string' || !text.trim()) {
		throw new Error(ErrorCodes.REVIEW_TEXT_REQUIRED);
	}
	return text.trim();
};

const getReviewById = async (review_id) => {
	const id = Number(review_id);
	if (!id || Number.isNaN(id)) {
		throw new Error(ErrorCodes.NO_REVIEW);
	}

	const review = await prisma.review.findUnique({ where: { id } });
	if (!review) {
		throw new Error(ErrorCodes.NO_REVIEW);
	}

	return review;
};

const mapReviewResponse = (review, currentUserId) => ({
	id: review.id,
	user_id: review.user_id,
	user_name: review.user.name || review.user.email,
	body: review.body,
	created_at: review.created_at,
	is_owner: currentUserId === review.user_id
});

export const reviews = {
	getByContent: async ({ content_id, content_type, user_id }) => {
		const { id: contentId, type } = validateContent(content_id, content_type);
		const currentUserId = user_id ? Number(user_id) : null;

		const dbReviews = await prisma.review.findMany({
			where: { content_id: contentId, content_type: type },
			include: { user: { select: { id: true, name: true, email: true } } },
			orderBy: { created_at: 'desc' }
		});

		return {
			reviews: dbReviews.map((review) => mapReviewResponse(review, currentUserId))
		};
	},

	create: async (data) => {
		const user_id = await ensureUserExists(data.user_id);
		const { id: content_id, type: content_type } = validateContent(data.content_id, data.content_type);
		const text = validateText(data.text);

		return prisma.review.create({
			data: { user_id, content_id, content_type, body: text }
		});
	},

	delete: async (review_id, user_id) => {
		const review = await getReviewById(review_id);
		const requester = await ensureUserExists(user_id);

		if (review.user_id !== requester) {
			throw new Error(ErrorCodes.NOT_REVIEW_OWNER);
		}

		await prisma.review.delete({ where: { id: review.id } });
	}
};
