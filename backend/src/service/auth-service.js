import '../config/env.js';
import { mailer } from './mail-service.js';
import { token } from './token-service.js';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/prisma-client.js';
import bcrypt from 'bcrypt';

export const auth = {
	register: async (name, email, password) => {
		if (!email || !password) {
			throw new Error('Email and password are required');
		}
		const existingUser = await prisma.user.findUnique({
			where: { email }
		});
		if (existingUser) {
			throw new Error('User with this email already exists');
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
		await mailer.sendActivationMail(email, `http://localhost:3000/api/auth/activate/${activation_link}`);
		const tokens = token.generateToken({ ...user });
		await token.saveToken(user.id, tokens.refresh_token);
		return {
			...tokens,
			id: user.id,
			email: user.email,
			name: user.name,
			is_activated: user.is_activated
		};
	},

	login: async (email, password) => {
		if (!email || !password) {
			throw new Error('Email and password are required');
		}
		const user = await prisma.user.findUnique({
			where: { email }
		});
		if (!user) {
			throw new Error(`No user`);
		}
		const isValidPassword = await bcrypt.compare(password, user.password);
		if (!isValidPassword) {
			throw new Error('Invalid password');
		}
		const tokens = token.generateToken({ ...user });
		await token.saveToken(user.id, tokens.refresh_token);
		return {
			...tokens,
			id: user.id,
			email: user.email,
			name: user.name,
			is_activated: user.is_activated
		};
	},

	activate: async (activation_link) => {
		const user = await prisma.user.findFirst({ where: { activation_link } });
		if (!user) {
			throw new Error();
		}
		await prisma.user.update({
			where: { id: user.id },
			data: { is_activated: true }
		});
	}
};
