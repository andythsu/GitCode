import { Message } from './@types/Message';
import { MessagePayload } from './@types/Payload';
import { LCProfile } from './LCProfile';
import { getFromPageLocalStorage, uploadToGithub } from './util';

let lcProfile: LCProfile;

const initLCProfile = async (): Promise<LCProfile> => {
	const key = 'GLOBAL_DATA:value';
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	const res = await getFromPageLocalStorage(key, tab.id!);
	if (!res) throw new Error(`could not init lc profile`);
	return new LCProfile(res);
};

const checkLCProfile = async (
	payload: string,
	next: (payload: string) => Promise<void>
): Promise<void> => {
	if (!lcProfile) {
		try {
			lcProfile = await initLCProfile();
		} catch (e) {
			console.error(e);
			throw e;
		}
	}
	await next(payload);
};

const getRawCodeFromLocalStroage = async (questionNum: number): Promise<string> => {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	const globalLang = JSON.parse((await getFromPageLocalStorage('global_lang', tab.id!))!);
	const sessionId = lcProfile.getUserStatus().activeSessionId;
	return (await getFromPageLocalStorage(`${questionNum}_${sessionId}_${globalLang}`, tab.id!))!;
};

const uploadCode = async (payload: string): Promise<void> => {
	const { questionNum, questionTitle } = JSON.parse(payload) as MessagePayload.UploadCode;
	const rawCode = await getRawCodeFromLocalStroage(questionNum);
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	const globalLang = JSON.parse((await getFromPageLocalStorage('global_lang', tab.id!))!);
	const res = await uploadToGithub(JSON.parse(rawCode), questionNum, questionTitle, globalLang);
	console.log('upload to github result', res);
};

const messageHandlers = new Map<string, (payload: string) => Promise<void>>();
messageHandlers.set('uploadCode', async (payload: string) => {
	await checkLCProfile(payload, uploadCode);
});

chrome.runtime.onMessage.addListener(
	async (
		message: Message,
		sender: chrome.runtime.MessageSender,
		sendResponse: (response?: any) => void
	): Promise<void> => {
		const { type, payload } = message;
		if (messageHandlers.has(type)) {
			const handler = messageHandlers.get(type)!;
			await handler(payload);
		}
	}
);
