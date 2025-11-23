import jwt from 'jsonwebtoken';
import prisma from '../config/prisma-client.js';

export const token = {
	generateToken: (payload) => {
		const access_token = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '30m' });
		const refresh_token = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
		return {
			access_token,
			refresh_token
		};
	},
	saveToken: async (user_id, refresh_token) => {
		const tokenData = await prisma.token.findFirst({
			where: { user_id }
		});
		if (tokenData) {
			const updatedToken = await prisma.token.update({
				where: { id: tokenData.id },
				data: {
					refresh_token
				}
			});
			return updatedToken;
		}
		const token = await prisma.token.create({
			data: {
				user_id,
				refresh_token
			}
		});
		return token;
	}
};
