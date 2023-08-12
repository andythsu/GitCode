export namespace LC {
	interface Profile {
		userStatus: UserStatus;
	}
	interface UserStatus {
		username: string;
		activeSessionId: number;
	}
}
