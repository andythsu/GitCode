import { LCProfile } from "./LeetcodeProfile";
import { getFromPageLocalStorage } from "./util";

let lcProfile: LCProfile;

const initLCProfile = async () => {
  const key = "GLOBAL_DATA:value";
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const res = await getFromPageLocalStorage(key, tab.id!);
  if(!res) return;
  lcProfile = new LCProfile(res);
}

const getCodeFromLocalStorage = async () => {
  if(!lcProfile){
    await initLCProfile();
  }
  console.log("lcProfile", lcProfile);
}

const messageHandlers = new Map<string, () => Promise<void>>();
messageHandlers.set("getCodeFromLocalStorage", getCodeFromLocalStorage);

chrome.runtime.onMessage.addListener(async (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void): Promise<void> => {
  if(messageHandlers.has(message)){
    const handler = messageHandlers.get(message)!;
    await handler();
  }
});