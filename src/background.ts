import { Message } from './@types/Message';
import { MessagePayload } from './@types/Payload';
import { uploadToGithub } from './repo-util';

const uploadCode = async (
	payload: string,
	sendResponse: (response?: any) => void
): Promise<void> => {
	try {
		const uploadCodePayload = JSON.parse(payload) as MessagePayload.UploadCode;
		await uploadToGithub(uploadCodePayload);
		sendResponse(
			JSON.stringify({
				message: 'Gitcode: Successfully uploaded to Github',
				type: 'success'
			})
		);
	} catch (e) {
		console.error(e);
		sendResponse(
			JSON.stringify({
				message: 'Gitcode: Failed to upload to Github',
				type: 'error'
			})
		);
	}
};

const messageHandlers = new Map<
	string,
	(payload: string, sendResponse: (response?: any) => void) => Promise<void>
>();
messageHandlers.set(
	'uploadCode',
	async (payload: string, sendResponse: (response?: any) => void) => {
		await uploadCode(payload, sendResponse);
	}
);

chrome.runtime.onMessage.addListener(
	(
		message: Message,
		sender: chrome.runtime.MessageSender,
		sendResponse: (response?: any) => void
	) => {
		const { type, payload } = message;
		if (messageHandlers.has(type)) {
			const handler = messageHandlers.get(type)!;
			handler(payload, sendResponse);
		}
		return true;
	}
);
