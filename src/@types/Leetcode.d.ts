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
	type QuestionOfDay = {
		data: {
			activeDailyCodingChallengeQuestion: {
				date: string;
				link: string;
				question: {
					acRate: number;
					difficulty: string;
					freqBar: number;
					frontendQuestionId: number;
					hasSolution: boolean;
					hasVideoSolution: boolean;
					isFavor: boolean;
					paidOnly: boolean;
					title: string;
					titleSlug: string;
					topicTags: Array<{
						id: string;
						name: string;
						slug: string;
					}>;
				};
			};
		};
	};
}
