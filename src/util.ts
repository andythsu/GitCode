import axios from 'axios';
import { StorageKey } from './@types/StorageKey';

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

export const uploadToGithub = async (code: string): Promise<Response> => {
	const data = JSON.stringify({
		message: 'txt file',
		content: `${Buffer.from(code, 'utf8').toString('base64')}`
	});
	const accessToken: string | null = await getFromLocalStorage('access_token');
	if (!accessToken) throw new Error(`Access token not found`);

	console.log('gh access token', accessToken);
	const res = await fetch(
		'https://api.github.com/repos/andythsu/andythsu.github.io/contents/test.txt',
		{
			method: 'PUT',
			headers: {
				Accept: 'application/vnd.github+json',
				Authorization: `Bearer ${accessToken}`
			},
			body: data
		}
	);
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
