import { contentTypes } from '../../enums/content-type.js';
import prisma from '../config/prisma-client.js';

export const lists = {
	getListDetails: async (list_id) => {
		const id = Number(list_id);
		const list = await prisma.userList.findUnique({ where: { id } });
		if (!list) {
			throw new Error('No list');
		}
		const listItems = await prisma.listItem.findMany({ where: { list_id: id } });

		return {
			...list,
			items: listItems
		};
	},
	getUserLists: async (user_id) => {
		const id = Number(user_id);
		const user = await prisma.user.findUnique({ where: { id } });
		if (!user) {
			throw new Error('No user');
		}
		const lists = await prisma.userList.findMany({ where: { user_id: id } });
		if (!lists) {
			throw new Error('No lists');
		}
		return lists;
	},
	createUserList: async (user_id, title) => {
		const id = Number(user_id);
		if (!id || Number.isNaN(id)) {
			throw new Error('Invalid user id');
		}
		if (!title || typeof title !== 'string') {
			throw new Error('Invalid title');
		}

		const user = await prisma.user.findUnique({ where: { id } });
		if (!user) {
			throw new Error('No user');
		}

		const list = await prisma.userList.create({
			data: {
				user_id: id,
				title: title.trim()
			}
		});

		return list;
	},
	addItemToList: async (data) => {
		const { list_ids, ...content } = data;
		if (!list_ids || !content) {
			throw new Error('Corrupted');
		}
		content.title ? (content.type = contentTypes.movie) : (content.type = contentTypes.show);
		const contentData = {
			content_id: content.id,
			content_type: content.type,
			poster_path: content.poster_path,
			content_title_en: content.original_title || content.original_name,
			content_title_uk: content.title || content.name
		};

		const res = await prisma.listItem.createMany({
			data: list_ids.map((id) => ({
				list_id: Number(id),
				...contentData
			})),

			skipDuplicates: true
		});

		return res;
	},
	removeItemFromList: async (id) => {
		await prisma.listItem.delete({
			where: { id: Number(id) }
		});
	}
};
