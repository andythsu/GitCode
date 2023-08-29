import { Message } from './@types/Message';
import { MessagePayload } from './@types/Payload';
import { LC } from './@types/Leetcode';
import { fetchLC } from './fetch-util';
import { cuteToast } from './CuteAlert';
import { isNewVersion } from './util';

const getElementByQuerySelectorWithTimeout = (query: string): Promise<NodeListOf<Element>> => {
	return new Promise((resolve, reject) => {
		let count = 0;
		const EXPIRY_IN_MS = parseInt(process.env.FIND_ELEMENT_EXPIRY_IN_MS);
		const ALLOWED_RETRIES = parseInt(process.env.FIND_ELEMENT_ALLOWED_RETRIES);
		const timer = setInterval(() => {
			const elem = document.querySelectorAll(query);
			if (elem.length > 0) {
				clearTimeout(timer);
				resolve(elem);
			} else if (count > ALLOWED_RETRIES) {
				clearTimeout(timer);
				reject(
					new Error(
						`${query} was not loaded in ${(EXPIRY_IN_MS * ALLOWED_RETRIES) / 1000} seconds.`
					)
				);
			}
			count++;
		}, EXPIRY_IN_MS);
	});
};

const getElementByClassNameWithTimeout = (query: string): Promise<HTMLCollectionOf<Element>> => {
	return new Promise((resolve, reject) => {
		let count = 0;
		const EXPIRY_IN_MS = parseInt(process.env.FIND_ELEMENT_EXPIRY_IN_MS);
		const ALLOWED_RETRIES = parseInt(process.env.FIND_ELEMENT_ALLOWED_RETRIES);
		const timer = setInterval(() => {
			const elem = document.getElementsByClassName(query);
			if (elem.length > 0) {
				clearTimeout(timer);
				resolve(elem);
			} else if (count > ALLOWED_RETRIES) {
				clearTimeout(timer);
				reject(
					new Error(
						`${query} was not loaded in ${(EXPIRY_IN_MS * ALLOWED_RETRIES) / 1000} seconds.`
					)
				);
			}
			count++;
		}, EXPIRY_IN_MS);
	});
};

const uploadCode = async (submissionDetails: LC.SubmissionDetails): Promise<void> => {
	const {
		lang,
		question,
		memoryDisplay,
		memoryPercentile,
		runtimeDisplay,
		runtimePercentile,
		code
	} = submissionDetails.data.submissionDetails;
	const payload: string = JSON.stringify({
		submission: {
			runtime: runtimeDisplay,
			runtimeFasterThan: runtimePercentile.toFixed(2),
			memory: memoryDisplay,
			memoryLessThan: memoryPercentile.toFixed(2),
			code
		},
		question: {
			questionNum: parseInt(question.questionId),
			questionTitle: question.title,
			lang: lang.name,
			content: question.content,
			titleSlug: question.titleSlug
		}
	} as MessagePayload.UploadCode);
	const result: string = await chrome.runtime.sendMessage<Message, any>({
		type: 'uploadCode',
		payload
	});
	console.log(result);
	const { type, message } = JSON.parse(result) as UploadCodeResult;
	cuteToast({
		type,
		message
	});
};

type UploadCodeResult = {
	type: string;
	message: string;
};

chrome.runtime.onMessage.addListener(
	async (
		message: Message,
		sender: chrome.runtime.MessageSender,
		sendResponse: (response?: any) => void
	): Promise<void> => {
		const { type, payload } = message;
		if (type === 'uploadCodeResult') {
			const { type, message } = JSON.parse(payload) as UploadCodeResult;
			cuteToast({
				type,
				message
			});
		}
	}
);

const pullSuccessTag = (
	isNewLc: boolean
): Promise<HTMLCollectionOf<Element> | NodeListOf<Element>> => {
	return new Promise((resolve, reject) => {
		const timer = setInterval(async () => {
			let successTag: HTMLCollectionOf<Element> | NodeListOf<Element>;
			if (isNewLc) {
				successTag = document.querySelectorAll(`[data-e2e-locator="submission-result"]`);
			} else {
				successTag = document.getElementsByClassName('marked_as_success');
			}
			if (successTag.length > 0) {
				clearTimeout(timer);
				resolve(successTag);
			}
		}, 1000);
	});
};

(async () => {
	const isNewLc = isNewVersion();
	try {
		const successTag = await pullSuccessTag(isNewLc);
		if (!successTag[0]) throw new Error(`successTag[0] is not found. SuccessTag: ${successTag}`);

		let submissionId: string;

		if (isNewLc) {
			const postSolutionButton =
				successTag[0].parentElement?.parentElement?.getElementsByTagName('a')[1];
			if (!postSolutionButton) return;
			const link = postSolutionButton.href;
			const searchParams = new URL(link).searchParams;
			submissionId = searchParams.get('submissionId')!;
		} else {
			const detailsElem = successTag[0].parentElement?.getElementsByTagName('a')[0];
			if (!detailsElem) return;
			const submissionLink = detailsElem.href;
			const slashIndexes = [...submissionLink.matchAll(/\//g)];
			submissionId = detailsElem.href.substring(
				slashIndexes[slashIndexes.length - 2].index! + 1,
				slashIndexes[slashIndexes.length - 1].index!
			);
		}

		console.log('submissionId', submissionId);

		const submissionDetailsQuery = {
			query: process.env.LC_QUERIES_GET_SUBMISSION_DETAILS,
			variables: {
				submissionId
			},
			operationName: 'submissionDetails'
		};

		const submissionDetails: LC.SubmissionDetails = await fetchLC(submissionDetailsQuery);

		await uploadCode(submissionDetails);
	} catch (e) {
		console.error(e);
	}
})();
