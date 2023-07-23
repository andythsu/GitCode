export const saveToLocalStorage = (key: string, val: any): void => {
    chrome.storage.local.set({[key]: val}, () => {
        if(chrome.runtime.lastError){
            throw new Error(chrome.runtime.lastError.message);
        }
        console.log(`key: ${key} saved to local storage`);
    })
}

export const getFromLocalStorage = async (key: string) => {
    return await chrome.storage.local.get(key);
}