import prisma from '../config/prisma-client.js';
import * as math from 'mathjs';
import { tmdb } from '../apis/tmdb.js';

const LIKE_THRESHOLD = 7;
const ONLY_RECOMMEND_FROM_SIMILAR_TASTE = true;
const NORMALIZE_ON_POPULARITY = true;

function itemKey(content_id, content_type) {
	return `${content_type}::${content_id}`;
}

async function fetchRatingsFromDb(options = {}) {
	const { contentType } = options;

	const where = contentType ? { content_type: contentType } : {};

	const ratings = await prisma.rating.findMany({
		where,
		select: {
			user_id: true,
			content_id: true,
			content_type: true,
			value: true
		},
		orderBy: {
			user_id: 'asc'
		}
	});

	const usersSet = new Set();
	const itemsMap = new Map();
	const ratingsRows = new Map();
	const allRatedByUser = new Map();

	for (const r of ratings) {
		usersSet.add(r.user_id);
		const key = itemKey(r.content_id, r.content_type);
		if (!itemsMap.has(key)) itemsMap.set(key, { content_id: r.content_id, content_type: r.content_type, key });

		const bin = Number.isFinite(r.value) && r.value >= LIKE_THRESHOLD ? 1 : 0;
		if (!ratingsRows.has(r.user_id)) ratingsRows.set(r.user_id, new Map());
		ratingsRows.get(r.user_id).set(key, bin);

		if (!allRatedByUser.has(r.user_id)) allRatedByUser.set(r.user_id, new Set());
		allRatedByUser.get(r.user_id).add(key);
	}

	const users = Array.from(usersSet);
	const items = Array.from(itemsMap.values());

	return { users, items, ratingsRows, allRatedByUser };
}

function buildRatingMatrix(users, items, ratingsRows) {
	const nUsers = users.length;
	const nItems = items.length;

	if (nUsers === 0 || nItems === 0) {
		return {
			ratingsMatrix: null,
			userIndexById: new Map(),
			itemIndexByKey: new Map(),
			itemIndexToObj: items
		};
	}

	const mat = math.zeros(nUsers, nItems);

	const userIndexById = new Map();
	users.forEach((u, i) => userIndexById.set(u, i));

	const itemIndexByKey = new Map();
	items.forEach((it, j) => itemIndexByKey.set(it.key, j));

	for (let i = 0; i < users.length; i++) {
		const uid = users[i];
		const rowMap = ratingsRows.get(uid);
		if (!rowMap) continue;
		for (const [key, val] of rowMap.entries()) {
			const j = itemIndexByKey.get(key);
			if (j === undefined) continue;
			if (val === 1) mat.set([i, j], 1);
		}
	}

	return { ratingsMatrix: mat, userIndexById, itemIndexByKey, itemIndexToObj: items };
}

function createCoMatrixFromRatings(ratingsMatrix) {
	if (!ratingsMatrix) {
		return null;
	}

	const nUsers = ratingsMatrix.size()[0];
	const nItems = ratingsMatrix.size()[1];

	if (nUsers === 0 || nItems === 0) {
		return null;
	}

	const coMatrix = math.zeros(nItems, nItems);
	const normalizer = math.identity(nItems);

	for (let u = 0; u < nUsers; u++) {
		const liked = [];
		for (let i = 0; i < nItems; i++) {
			if (ratingsMatrix.get([u, i]) === 1) liked.push(i);
		}
		for (let a = 0; a < liked.length; a++) {
			for (let b = a + 1; b < liked.length; b++) {
				const i = liked[a],
					j = liked[b];
				coMatrix.set([i, j], coMatrix.get([i, j]) + 1);
				coMatrix.set([j, i], coMatrix.get([j, i]) + 1);
			}
		}
		if (NORMALIZE_ON_POPULARITY) {
			for (let i = 0; i < nItems; i++) {
				for (let j = i + 1; j < nItems; j++) {
					if (ratingsMatrix.get([u, i]) === 1 || ratingsMatrix.get([u, j]) === 1) {
						normalizer.set([i, j], normalizer.get([i, j]) + 1);
						normalizer.set([j, i], normalizer.get([j, i]) + 1);
					}
				}
			}
		}
	}

	return NORMALIZE_ON_POPULARITY ? math.dotDivide(coMatrix, normalizer) : coMatrix;
}

function getPopularItems(users, items, ratingsMatrix, limit = 100, excludeItemKeys = new Set()) {
	const nItems = items.length;
	const nUsers = users.length;

	if (nItems === 0 || nUsers === 0) {
		return [];
	}

	const pop = [];
	for (let j = 0; j < nItems; j++) {
		if (excludeItemKeys.has(items[j].key)) {
			continue;
		}

		let s = 0;
		for (let i = 0; i < nUsers; i++) s += ratingsMatrix.get([i, j]);
		pop.push({ idx: j, score: s });
	}
	pop.sort((a, b) => b.score - a.score);
	return pop.map((p) => p.idx).slice(0, limit);
}

function getRecommendationsFromCoMatrixForUser(
	userId,
	users,
	items,
	ratingsMatrix,
	userIndexById,
	coMatrix,
	userRatedItemKeys = new Set()
) {
	const nItems = items.length;
	const nUsers = users.length;

	if (nItems === 0 || nUsers === 0 || !ratingsMatrix) {
		return [];
	}

	const uIndex = userIndexById.get(userId);

	if (uIndex === undefined) {
		return getPopularItems(users, items, ratingsMatrix, 100, userRatedItemKeys);
	}

	const ratedItems = [];
	for (let j = 0; j < nItems; j++) {
		if (ratingsMatrix.get([uIndex, j]) === 1) ratedItems.push(j);
	}
	const numRatedItems = ratedItems.length;

	if (numRatedItems === 0 || !coMatrix) {
		return getPopularItems(users, items, ratingsMatrix, 100, userRatedItemKeys);
	}

	const similarities = math.zeros(numRatedItems, nItems);
	for (let r = 0; r < numRatedItems; r++) {
		const ratedItemIndex = ratedItems[r];
		for (let item = 0; item < nItems; item++) {
			similarities.set([r, item], coMatrix.get([ratedItemIndex, item]) + similarities.get([r, item]));
		}
	}

	let recommendations = math.zeros(nItems);
	for (let y = 0; y < numRatedItems; y++) {
		for (let x = 0; x < nItems; x++) {
			recommendations.set([x], recommendations.get([x]) + similarities.get([y, x]));
		}
	}
	recommendations = math.dotDivide(recommendations, numRatedItems);

	const recArray = recommendations.toArray();
	let recSorted = recArray.slice().sort((a, b) => b - a);

	if (ONLY_RECOMMEND_FROM_SIMILAR_TASTE) {
		recSorted = recSorted.filter((v) => v !== 0);
	}

	const recOrder = [];
	const recCopy = recArray.slice();
	for (let s = 0; s < recSorted.length; s++) {
		const score = recSorted[s];
		const idx = recCopy.indexOf(score);
		if (idx !== -1) {
			recCopy[idx] = null;
			recOrder.push(idx);
		}
	}

	const filtered = recOrder.filter((idx) => {
		const itemKey = items[idx].key;
		return !userRatedItemKeys.has(itemKey);
	});

	return filtered;
}

async function getTrendingFromTMDB(limit, excludeKeys = new Set()) {
	try {
		const trending = await tmdb.getTrending('all', 'week', 'en-US');

		if (!trending.results || trending.results.length === 0) {
			return [];
		}

		const filtered = trending.results
			.map((item) => ({
				content_id: item.id,
				content_type: item.media_type === 'movie' ? 'movie' : 'show',
				key: `${item.media_type === 'movie' ? 'movie' : 'show'}::${item.id}`
			}))
			.filter((item) => !excludeKeys.has(item.key))
			.slice(0, limit);

		return filtered;
	} catch (error) {
		console.error('[Recommendations] Error fetching trending from TMDB:', error.message);
		return [];
	}
}

export const recommendations = {
	getRecommendationsForUser: async (userId, options = {}) => {
		const { limit = 20 } = options;

		const snapshot = await fetchRatingsFromDb({ contentType: options.contentType });

		if (snapshot.users.length === 0 || snapshot.items.length === 0) {
			return [];
		}

		const userRatedItemKeys = snapshot.allRatedByUser.get(userId) || new Set();

		const { ratingsMatrix, userIndexById, itemIndexToObj } = buildRatingMatrix(
			snapshot.users,
			snapshot.items,
			snapshot.ratingsRows
		);

		if (!ratingsMatrix) {
			return [];
		}

		const coMatrix = createCoMatrixFromRatings(ratingsMatrix);

		const personalizedIndices = getRecommendationsFromCoMatrixForUser(
			userId,
			snapshot.users,
			snapshot.items,
			ratingsMatrix,
			userIndexById,
			coMatrix,
			userRatedItemKeys
		);

		let finalIndices = personalizedIndices.slice(0, limit);
		if (finalIndices.length < limit) {
			const alreadyIncluded = new Set(finalIndices.map((idx) => itemIndexToObj[idx].key));
			const excludeKeys = new Set([...userRatedItemKeys, ...alreadyIncluded]);

			const popularIndices = getPopularItems(
				snapshot.users,
				snapshot.items,
				ratingsMatrix,
				limit - finalIndices.length,
				excludeKeys
			);

			finalIndices = [...finalIndices, ...popularIndices];
		}

		let result = finalIndices.map((idx, rank) => ({
			content_id: itemIndexToObj[idx].content_id,
			content_type: itemIndexToObj[idx].content_type,
			score_rank: rank + 1
		}));

		if (result.length < limit) {
			const includedKeys = new Set([...userRatedItemKeys, ...result.map((r) => `${r.content_type}::${r.content_id}`)]);

			const tmdbItems = await getTrendingFromTMDB(limit - result.length, includedKeys);

			const currentRank = result.length;
			tmdbItems.forEach((item, idx) => {
				result.push({
					content_id: item.content_id,
					content_type: item.content_type,
					score_rank: currentRank + idx + 1
				});
			});
		}

		return result;
	}
};
