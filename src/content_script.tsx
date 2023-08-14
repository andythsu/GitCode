import axios from 'axios';
import { Message } from './@types/Message';
import { MessagePayload } from './@types/Payload';
import { LC } from './@types/Leetcode';

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
		questionNum: parseInt(question.questionId),
		questionTitle: question.title,
		lang: lang.name,
		runtime: runtimeDisplay,
		runtimeFasterThan: runtimePercentile.toFixed(2),
		memory: memoryDisplay,
		memoryLessThan: memoryPercentile.toFixed(2),
		code
	} as MessagePayload.UploadCode);
	await chrome.runtime.sendMessage<Message, any>({ type: 'uploadCode', payload });
};

(async () => {
	try {
		const submitBtn = (
			await getElementByQuerySelectorWithTimeout(`[data-cy="submit-code-btn"]`)
		)[0];
		submitBtn.addEventListener('click', async () => {
			try {
				const successTag: HTMLCollectionOf<Element> = await getElementByClassNameWithTimeout(
					'marked_as_success'
				);
				if (!successTag[0])
					throw new Error(`successTag[0] is not found. SuccessTag: ${successTag}`);

				const detailsElem = successTag[0].parentElement?.getElementsByTagName('a')[0];
				if (!detailsElem) return;
				const submissionLink = detailsElem.href;
				const slashIndexes = [...submissionLink.matchAll(/\//g)];
				const submissionId = detailsElem.href.substring(
					slashIndexes[slashIndexes.length - 2].index! + 1,
					slashIndexes[slashIndexes.length - 1].index!
				);
				const submissionDetailsQuery = {
					query: process.env.LC_QUERIES_GET_SUBMISSION_DETAILS,
					variables: {
						submissionId
					},
					operationName: 'submissionDetails'
				};

				const res = await fetch(process.env.LC_API_HOST, {
					method: 'POST',
					body: JSON.stringify(submissionDetailsQuery),
					headers: {
						cookie: document.cookie,
						'content-type': 'application/json'
					}
				});

				const submissionDetails: LC.SubmissionDetails = await res.json();

				await uploadCode(submissionDetails);
			} catch (e) {
				console.error(e);
			}
		});
	} catch (e) {
		console.error(e);
	}
})();
