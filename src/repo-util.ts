import { Github } from './@types/Github';
import { GHUser } from './GHUser';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { getFromLocalStorage } from './util';
import { MessagePayload } from './@types/Payload';

export const repoExists = async (repoName: string, ghUser: GHUser) => {
	const ghUsername = ghUser.getUsername();
	const reqConfig: AxiosRequestConfig = {
		headers: {
			Authorization: `Bearer ${ghUser.getAccessToken()}`,
			Accept: 'application/vnd.github+json'
		}
	};
	try {
		const result = await axios.get(
			`${process.env.GITHUB_API_HOST}/repos/${ghUsername}/${repoName}`,
			reqConfig
		);
		return result.status === 200;
	} catch (e) {
		if (e instanceof AxiosError) {
			if ((e as AxiosError).response?.status === 404) {
				return false;
			}
		}
		throw e;
	}
};

export const createRepo = async (repoName: string, ghUser: GHUser): Promise<void> => {
	const reqConfig: AxiosRequestConfig = {
		headers: {
			Authorization: `Bearer ${ghUser.getAccessToken()}`,
			Accept: 'application/vnd.github+json'
		}
	};
	const reqData = {
		name: repoName
	};
	await axios.post(`${process.env.GITHUB_API_HOST}/user/repos`, reqData, reqConfig);
};

const langToExtMap: Record<string, string> = {
	python3: 'py',
	java: 'java'
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
	const file = `${questionNum}. ${questionTitle}.${langToExtMap[lang] || lang}`;
	const readme = `README.md`;

	try {
		const upsertReadMe = await upsert(
			`${process.env.GITHUB_API_HOST}/repos/${ghUsername}/${boundRepo}/contents/${folder}/${readme}`,
			'Readme',
			Buffer.from(content, 'utf8').toString('base64'),
			accessToken
		);

		console.log('upsert readme', upsertReadMe);

		const upsertSolution = await upsert(
			`${process.env.GITHUB_API_HOST}/repos/${ghUsername}/${boundRepo}/contents/${folder}/${file}`,
			`Runtime: ${runtime} (${runtimeFasterThan}%), Memory: ${memory} (${memoryLessThan}%) - Gitcode`,
			Buffer.from(code, 'utf8').toString('base64'),
			accessToken
		);

		console.log('upsert solution', upsertSolution);
	} catch (e) {
		throw e;
	}
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
