import { Leetcode } from "./@types/Leetcode";

export class LCProfile {
	private profile: Leetcode.Profile;
	constructor(rawJSON: string){
		this.profile = JSON.parse(rawJSON);
	}
	
	getUserStatus(): Leetcode.UserStatus {
		return this.profile.userStatus;
	}
}