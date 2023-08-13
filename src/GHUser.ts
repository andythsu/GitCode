import axios, { AxiosRequestConfig } from 'axios';
import { Github } from './@types/Github';
import { saveToLocalStorage } from './util';

export class GHUser {
	private accessToken: string = '';
	private username: string = '';
	init(accessToken: string): void {
		this.accessToken = accessToken;
		const reqConfig: AxiosRequestConfig = {
			headers: {
				Authorization: `Bearer ${this.accessToken}`
			}
		};
		axios.get(`${process.env.GITHUB_API_HOST}/user`, reqConfig).then((response) => {
			const data = response.data as Github.User;
			this.username = data.login;
			saveToLocalStorage('gh_username', this.username);
		});
	}

	getUsername(): string {
		return this.username;
	}

	getAccessToken(): string {
		return this.accessToken;
	}
}
