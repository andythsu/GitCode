import { GHUser } from './GHUser';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

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
