import { useErrorBus } from './use-error-bus.js';
import { i18n } from '../main.js';

const API_BASE_URL = 'http://localhost:3000/api';

const mapErrorToKey = (errorCodeOrMessage) => {
	if (!errorCodeOrMessage) return 'errors.default';

	const errorMap = {
		UNSUPPORTED_CONTENT_TYPE: 'errors.unsupportedContentType',
		NO_LIST: 'errors.noList',
		NO_USER: 'errors.noUser',
		NO_LISTS: 'errors.noLists',
		INVALID_USER_ID: 'errors.invalidUserId',
		INVALID_TITLE: 'errors.invalidTitle',
		CORRUPTED: 'errors.corrupted',
		EMAIL_PASSWORD_REQUIRED: 'errors.emailPasswordRequired',
		USER_EXISTS: 'errors.userExists',
		INVALID_PASSWORD: 'errors.invalidPassword',
		USER_AND_TITLE_REQUIRED: 'errors.userAndTitleRequired',
		USER_IS_NOT_ACTIVATED: 'errors.userIsNotActivated',
		INVALID_CONTENT_ID: 'errors.invalidContentId',
		REVIEW_TEXT_REQUIRED: 'errors.reviewTextRequired',
		NO_REVIEW: 'errors.noReview',
		NOT_REVIEW_OWNER: 'errors.notReviewOwner',
		INVALID_RATING_VALUE: 'errors.invalidRatingValue',
		NO_RATING: 'errors.noRating',
		USER_IS_BLOCKED: 'errors.userIsBlocked',
		NOT_ADMIN: 'errors.notAdmin',
		NO_REPORT: 'errors.noReport',
		REPORT_ALREADY_EXISTS: 'errors.reportAlreadyExists',
		REPORT_REASON_REQUIRED: 'errors.reportReasonRequired',
		CANNOT_REPORT_OWN_REVIEW: 'errors.cannotReportOwnReview'
	};

	return errorMap[errorCodeOrMessage] || 'errors.default';
};

export const apiRequest = async (path, options = {}) => {
	const { showError } = useErrorBus();

	const response = await fetch(`${API_BASE_URL}${path}`, {
		headers: {
			'Content-Type': 'application/json',
			...(options.headers || {})
		},
		...options
	});

	let data;
	try {
		data = await response.json();
	} catch {
		data = null;
	}

	if (!response.ok) {
		const errorMessage = data?.error || data?.message;
		const errorKey = errorMessage ? mapErrorToKey(errorMessage) : 'errors.default';
		const localizedMessage = i18n.global.t(errorKey);
		showError(localizedMessage);
		throw new Error(localizedMessage);
	}

	return data;
};
