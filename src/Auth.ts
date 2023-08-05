import axios from "axios";
import { getFromLocalStorage, saveToLocalStorage } from "./util";
class Auth {
    private clientId = "f0931287bb5d9d34de53";
    private clientSecret = "e4443e0ceb8e72e019d86d70624379b42b661c2b";
    private accessToken = "";
    private scopes = ["repo"];
    
    constructor(){
        // init access token
        getFromLocalStorage("access_token").then((data: string) => {
            if(data){
                this.accessToken = data;
            }else{
                console.log("access_token not set in storage");
            }
        });
    }

    authWithGithub(): void {
        chrome.identity.launchWebAuthFlow({
            url: `https://github.com/login/oauth/authorize?scope=${this.scopes.join("%20")}&client_id=${this.clientId}`,
            interactive: true,
        }, (responseUrl?: string) => {
            if (responseUrl) {
                this.setToken(responseUrl);
            }
        });
    }

    async setToken(responseUrl: string): Promise<void> {
        const url = new URL(responseUrl);
        const code = url.searchParams.get("code");
        if(code){
            try {
                const response = await axios.post("https://github.com/login/oauth/access_token", {
                    "client_id": this.clientId,
                    "client_secret": this.clientSecret,
                    "code": code
                }, {
                    headers: {
                        "Accept": "application/json"
                    }
                });
                if(response.status === 200){
                    this.accessToken = response.data.access_token;
                    this.saveAccessToken();
                }else{
                    throw new Error(`response.status is not 200. ${response}`);
                }
            }catch(e){
                console.error(e);
            }
        }
    }

    saveAccessToken(): void {
        saveToLocalStorage("access_token", this.accessToken);
    }

    getAccessToken(): string {
        return this.accessToken;
    }
}

export default Auth;