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

const validateRatingValue = (value) => {
	const rating = Number(value);
	if (!rating || Number.isNaN(rating) || rating < 1 || rating > 10) {
		throw new Error(ErrorCodes.INVALID_RATING_VALUE);
	}
	return rating;
};

export const ratings = {
	getByContent: async ({ content_id, content_type, user_id }) => {
		const { id: contentId, type } = validateContent(content_id, content_type);
		const currentUserId = user_id ? Number(user_id) : null;

		const allRatings = await prisma.rating.findMany({
			where: { content_id: contentId, content_type: type }
		});

		const count = allRatings.length;
		const average = count > 0 ? allRatings.reduce((sum, r) => sum + r.value, 0) / count : 0;

		let userRating = null;
		if (currentUserId) {
			const found = allRatings.find((r) => r.user_id === currentUserId);
			userRating = found ? found.value : null;
		}

		return {
			average: Math.round(average * 10) / 10,
			count,
			userRating
		};
	},

	setRating: async (data) => {
		const user_id = await ensureUserExists(data.user_id);
		const { id: content_id, type: content_type } = validateContent(data.content_id, data.content_type);
		const value = validateRatingValue(data.value);

		const rating = await prisma.rating.upsert({
			where: {
				user_id_content_id_content_type: { user_id, content_id, content_type }
			},
			update: { value },
			create: { user_id, content_id, content_type, value }
		});

		return rating;
	},

	deleteRating: async (data) => {
		const user_id = await ensureUserExists(data.user_id);
		const { id: content_id, type: content_type } = validateContent(data.content_id, data.content_type);

		const existing = await prisma.rating.findUnique({
			where: {
				user_id_content_id_content_type: { user_id, content_id, content_type }
			}
		});

		if (!existing) {
			throw new Error(ErrorCodes.NO_RATING);
		}

		await prisma.rating.delete({
			where: { id: existing.id }
		});
	}
};
