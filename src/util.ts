import { StorageKey } from "./@types/StorageKey";

export const saveToLocalStorage = (key: StorageKey, val: any): void => {
    chrome.storage.local.set({[key]: val}, () => {
        if(chrome.runtime.lastError){
            throw new Error(chrome.runtime.lastError.message);
        }
        console.log(`key: ${key} saved to local storage`);
    })
}

export const getFromLocalStorage = async (key: StorageKey): Promise<string> => {
    const val = await chrome.storage.local.get(key);
    return val[key] as string;
}

export const removeFromLocalStorage = async (key: StorageKey): Promise<void> => {
    await chrome.storage.local.remove(key);
}

export const uploadToGithub = async (code: string) => {
    const data = JSON.stringify({
        "message": "txt file",
        "content": `${Buffer.from(code, "utf8").toString("base64")}`
    });

    const accessToken: string = (await getFromLocalStorage("access_token"));
    console.log("gh access token", accessToken);

    const config = {
        method: "put",
        url: "https://api.github.com/repos/andythsu/andythsu.github.io/contents/test.txt",
        headers: {
            "Accept": "application/vnd.github+json",
            "Authorization": `Bearer ${accessToken}`,
        },
        data: data
    };

    // const result = await axios(config);
    // console.log(result);
}

export const getFromPageLocalStorage = async (key: string, tabId: number): Promise<string | null> => {
    const res = await chrome.scripting.executeScript({
      target: {
          tabId
      },
      func: (key: string) => {
          const item = localStorage.getItem(key);
          return item;
      },
      args: [key]
    });
    return res[0].result;
}