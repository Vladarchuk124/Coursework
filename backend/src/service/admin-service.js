import prisma from '../config/prisma-client.js';
import { ErrorCodes } from '../../enums/error-codes.js';

const ensureAdmin = async (admin_id) => {
	const id = Number(admin_id);
	if (!id || Number.isNaN(id)) {
		throw new Error(ErrorCodes.NOT_ADMIN);
	}

	const user = await prisma.user.findUnique({ where: { id } });
	if (!user || !user.is_admin) {
		throw new Error(ErrorCodes.NOT_ADMIN);
	}

	return user;
};

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

export const admin = {
	blockUser: async (admin_id, user_id) => {
		await ensureAdmin(admin_id);
		const user = await ensureUserExists(user_id);

		await prisma.user.update({
			where: { id: user.id },
			data: { is_blocked: true }
		});

		// Also delete all tokens for this user so they get logged out
		await prisma.token.deleteMany({
			where: { user_id: user.id }
		});

		return { success: true };
	},

	unblockUser: async (admin_id, user_id) => {
		await ensureAdmin(admin_id);
		const user = await ensureUserExists(user_id);

		await prisma.user.update({
			where: { id: user.id },
			data: { is_blocked: false }
		});

		return { success: true };
	},

	deleteReview: async (admin_id, review_id) => {
		await ensureAdmin(admin_id);

		const id = Number(review_id);
		if (!id || Number.isNaN(id)) {
			throw new Error(ErrorCodes.NO_REVIEW);
		}

		const review = await prisma.review.findUnique({ where: { id } });
		if (!review) {
			throw new Error(ErrorCodes.NO_REVIEW);
		}

		await prisma.review.delete({ where: { id } });

		return { success: true };
	},

	checkAdmin: async (user_id) => {
		const id = Number(user_id);
		if (!id || Number.isNaN(id)) {
			return { is_admin: false };
		}

		const user = await prisma.user.findUnique({ where: { id } });
		return { is_admin: user?.is_admin || false };
	}
};

