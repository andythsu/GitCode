export namespace Leetcode {
    interface Profile {
        userStatus: UserStatus;
    }
    interface UserStatus {
        username: string,
        activeSessionId: number
    }
}