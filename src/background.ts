import { LCProfile } from "./LeetcodeProfile";
import { getFromPageLocalStorage } from "./util";

const initLCProfile = async (): Promise<LCProfile | null> => {
  const key = "GLOBAL_DATA:value";
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const res = await getFromPageLocalStorage(key, tab.id!);
  if(!res) return null;
  return new LCProfile(res);
}

const getCodeFromLocalStorage = async (lcProfile: LCProfile) => {
  console.log("lcProfile", lcProfile);
}

const messageHandlers = new Map<string, (lcProfile: LCProfile) => Promise<void>>();
messageHandlers.set("getCodeFromLocalStorage", getCodeFromLocalStorage);

(async () => {
  const lcProfile: LCProfile | null = await initLCProfile();
  if(!lcProfile) {
    console.error("lc profile cannot be initialized");
    return;
  }
  chrome.runtime.onMessage.addListener(async (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void): Promise<void> => {
    if(messageHandlers.has(message)){
      const handler = messageHandlers.get(message)!;
      await handler(lcProfile);
    }
  });
})()

