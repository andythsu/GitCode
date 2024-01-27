import { Github } from './@types/Github';
import { StorageKey } from './@types/StorageKey';
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

export const isNewVersion = (): boolean => {
	const scripts = document.scripts;
	for (const script of scripts) {
		if (script.id === '__NEXT_DATA__') {
			return true;
		}
	}
	return false;
};
