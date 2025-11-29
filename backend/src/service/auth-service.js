import '../config/env.js';
import { mailer } from './mail-service.js';
import { token } from './token-service.js';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/prisma-client.js';
import bcrypt from 'bcrypt';
import { ErrorCodes } from '../../enums/error-codes.js';

const createDefaultUserLists = async (user_id) => {
	const defaultTitles = ['Favorites', 'Watched', 'Watchlist'];

	await prisma.userList.createMany({
		data: defaultTitles.map((title) => ({
			user_id,
			title
		}))
	});
};

export const auth = {
	getUserById: async (user_id) => {
		const user = await prisma.user.findUnique({
			where: { id: Number(user_id) }
		});
		if (!user) {
			throw new Error(ErrorCodes.NO_USER);
		}
		const tokens = token.generateToken({ ...user, is_activated: true });
		await token.saveToken(user.id, tokens.refresh_token);
		return {
			...tokens,
			id: user.id,
			email: user.email,
			name: user.name,
			is_activated: true,
			is_admin: user.is_admin
		};
	},
	register: async (name, email, password) => {
		if (!email || !password) {
			throw new Error(ErrorCodes.EMAIL_PASSWORD_REQUIRED);
		}
		const existingUser = await prisma.user.findUnique({
			where: { email }
		});
		if (existingUser) {
			throw new Error(ErrorCodes.USER_EXISTS);
		}
		const hashPassword = await bcrypt.hash(password, 3);
		const activation_link = uuidv4();
		const user = await prisma.user.create({
			data: {
				name,
				email,
				password: hashPassword,
				activation_link
			}
		});
		await createDefaultUserLists(user.id);
		await mailer.sendActivationMail(email, `http://localhost:3000/api/auth/activate/${activation_link}`);
		const tokens = token.generateToken({ ...user });
		await token.saveToken(user.id, tokens.refresh_token);
		return {
			...tokens,
			id: user.id,
			email: user.email,
			name: user.name,
			is_activated: user.is_activated,
			is_admin: user.is_admin
		};
	},

	login: async (email, password) => {
		if (!email || !password) {
			throw new Error(ErrorCodes.EMAIL_PASSWORD_REQUIRED);
		}
		const user = await prisma.user.findUnique({
			where: { email }
		});
		if (!user) {
			throw new Error(ErrorCodes.NO_USER);
		}
		const isValidPassword = await bcrypt.compare(password, user.password);
		if (!isValidPassword) {
			throw new Error(ErrorCodes.INVALID_PASSWORD);
		}
		if (!user.is_activated) {
			throw new Error(ErrorCodes.USER_IS_NOT_ACTIVATED);
		}
		if (user.is_blocked) {
			throw new Error(ErrorCodes.USER_IS_BLOCKED);
		}
		const tokens = token.generateToken({ ...user });
		await token.saveToken(user.id, tokens.refresh_token);
		return {
			...tokens,
			id: user.id,
			email: user.email,
			name: user.name,
			is_activated: user.is_activated,
			is_admin: user.is_admin
		};
	},

	activate: async (activation_link) => {
		const user = await prisma.user.findFirst({ where: { activation_link } });
		if (!user) {
			throw new Error(ErrorCodes.NO_USER);
		}
		const updatedUser = await prisma.user.update({
			where: { id: user.id },
			data: { is_activated: true }
		});
		return updatedUser.id;
	}
};
