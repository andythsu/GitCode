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

export const uploadToGithub = async (
	uploadCodePayload: MessagePayload.UploadCode
): Promise<void> => {
	const { questionNum, questionTitle, lang, content, titleSlug } = uploadCodePayload.question;
	const { runtime, runtimeFasterThan, memory, memoryLessThan, code } = uploadCodePayload.submission;

	const accessToken: string | null = await getFromLocalStorage('access_token');
	const ghUsername: string | null = await getFromLocalStorage('gh_username');
	const boundRepo: string | null = await getFromLocalStorage('bound_repo');

	if (!accessToken) throw new Error(`Access token not found`);
	if (!ghUsername) throw new Error(`Github username not found`);
	if (!boundRepo) throw new Error(`Bound repo not found`);

	const folder = `${questionNum}-${titleSlug}`;
	const file = `${questionNum}. ${questionTitle}.${lang}`;
	const readme = `README.md`;

	try {
		const upsertSolution = await upsert(
			`${process.env.GITHUB_API_HOST}/repos/${ghUsername}/${boundRepo}/contents/${folder}/${file}`,
			`Runtime: ${runtime} (${runtimeFasterThan}%), Memory: ${memory} (${memoryLessThan}%) - Gitcode`,
			Buffer.from(code, 'utf8').toString('base64'),
			accessToken
		);

		console.log('upsert solution', upsertSolution);

		const upsertReadMe = await upsert(
			`${process.env.GITHUB_API_HOST}/repos/${ghUsername}/${boundRepo}/contents/${folder}/${readme}`,
			'Readme',
			Buffer.from(content, 'utf8').toString('base64'),
			accessToken
		);

		console.log('upsert readme', upsertReadMe);
	} catch (e) {
		console.error(e);
	}
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

const upsert = async (url: string, message: string, content: string, accessToken: string) => {
	const fileExistsRes = await fetch(url, {
		method: 'GET',
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${accessToken}`
		}
	});

	let data: { message: string; content: string; sha?: string } = {
		message: message,
		content: content
	};

	// we need to append file sha if we are updating an existing file in GH
	if (fileExistsRes.status === 200) {
		const repoContent: Github.RepoContent = await fileExistsRes.json();
		data = {
			...data,
			sha: repoContent.sha
		};
	}

	const res = await fetch(url, {
		method: 'PUT',
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${accessToken}`
		},
		body: JSON.stringify(data)
	});

	return res;
};
