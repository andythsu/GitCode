import { LC } from './@types/Leetcode';

export class LCProfile {
	private profile: LC.Profile;
	constructor(rawJSON: string) {
		this.profile = JSON.parse(rawJSON);
	}

	getUserStatus(): LC.UserStatus {
		return this.profile.userStatus;
	}
}
