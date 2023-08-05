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