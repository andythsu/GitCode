export namespace LC {
	type Profile = {
		userStatus: UserStatus;
	};
	type UserStatus = {
		username: string;
		activeSessionId: number;
	};
	type UserStats = {
		data: {
			matchedUser: {
				submitStats: {
					acSubmissionNum: Array<{
						difficulty: string;
						count: number;
						submissions: number;
					}>;
				};
			};
		};
	};
}
