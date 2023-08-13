import { Github } from './@types/Github';
import { StorageKey } from './@types/StorageKey';
import config from '../config.json';
import { MessagePayload } from './@types/Payload';

export const saveToLocalStorage = (key: StorageKey, val: any): void => {
	chrome.storage.local.set({ [key]: val }, () => {
		if (chrome.runtime.lastError) {
			throw new Error(chrome.runtime.lastError.message);
		}
		console.log(`key: ${key} saved to local storage`);
	});
};

export const getFromLocalStorage = async (key: StorageKey): Promise<string | null> => {
	const val = await chrome.storage.local.get(key);
	if (!val[key]) return null;
	return val[key] as string;
};

export const removeFromLocalStorage = async (key: StorageKey): Promise<void> => {
	await chrome.storage.local.remove(key);
};

export const uploadToGithub = async (
	code: string,
	uploadCodePayload: MessagePayload.UploadCode
): Promise<Response> => {
	const { questionNum, questionTitle, lang, runtime, runtimeFasterThan, memory, memoryLessThan } =
		uploadCodePayload;

	const accessToken: string | null = await getFromLocalStorage('access_token');
	const ghUsername: string | null = await getFromLocalStorage('gh_username');
	const boundRepo: string | null = await getFromLocalStorage('bound_repo');

	if (!accessToken) throw new Error(`Access token not found`);
	if (!ghUsername) throw new Error(`Github username not found`);
	if (!boundRepo) throw new Error(`Bound repo not found`);

	const path = `${questionNum}.${questionTitle}.${lang}`;

	// check if file exists already. If we are updating the file, we need SHA of the file
	const fileExistsRes = await fetch(
		`${config.GithubAPI.host}/repos/${ghUsername}/${boundRepo}/contents/${path}`,
		{
			method: 'GET',
			headers: {
				Accept: 'application/vnd.github+json',
				Authorization: `Bearer ${accessToken}`
			}
		}
	);

	let data: { message: string; content: string; sha?: string } = {
		message: `Runtime: ${runtime} (${runtimeFasterThan}), Memory: ${memory} (${memoryLessThan}) - Gitcode`,
		content: `${Buffer.from(code, 'utf8').toString('base64')}`
	};

	if (fileExistsRes.status === 200) {
		const content: Github.RepoContent = await fileExistsRes.json();
		data = {
			...data,
			sha: content.sha
		};
	}

	const res = await fetch(
		`${config.GithubAPI.host}/repos/${ghUsername}/${boundRepo}/contents/${path}`,
		{
			method: 'PUT',
			headers: {
				Accept: 'application/vnd.github+json',
				Authorization: `Bearer ${accessToken}`
			},
			body: JSON.stringify(data)
		}
	);

	console.log('code', code);
	console.log('payload', uploadCodePayload);

	return res;
};

export const getFromPageLocalStorage = async (
	key: string,
	tabId: number
): Promise<string | null> => {
	const res = await chrome.scripting.executeScript({
		target: {
			tabId
		},
		func: (key: string) => {
			const item = localStorage.getItem(key);
			return item;
		},
		args: [key]
	});
	return res[0].result;
};
