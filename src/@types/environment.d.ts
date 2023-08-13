declare global {
	namespace NodeJS {
		interface ProcessEnv {
			FIND_ELEMENT_ALLOWED_RETRIES: string;
			FIND_ELEMENT_EXPIRY_IN_MS: string;
			GITHUB_API_HOST: string;
			GITHUB_AUTH_REDIRECT_URL: string;
			GITHUB_AUTH_CLIENT_ID: string;
			GITHUB_AUTH_CLIENT_SECRET: string;
			LC_API_HOST: string;
			LC_QUERIES_GET_USER_INFO: string;
			LC_QUERIES_GET_QUESTION_OF_DAY: string;
		}
	}
}

export {};
