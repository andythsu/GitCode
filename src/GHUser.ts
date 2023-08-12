import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import config from '../config.json';
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
		axios.get(`${config.GithubAPI.host}/user`, reqConfig).then((response) => {
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
