import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const clientId = "f0931287bb5d9d34de53";
const clientSecret = "e4443e0ceb8e72e019d86d70624379b42b661c2b";

function authWithGithub(setAccessCode: React.Dispatch<React.SetStateAction<string | undefined>>) {
  chrome.identity.launchWebAuthFlow({
    url: `https://github.com/login/oauth/authorize?client_id=${clientId}`,
    interactive: true,
  }, (responseUrl?: string) => {
    if (responseUrl) {
      parseAccessCode(setAccessCode, responseUrl);
    }
  });
}

function parseAccessCode(setAccessCode: React.Dispatch<React.SetStateAction<string | undefined>>, responseUrl: string) {
  const url = new URL(responseUrl);
  const code = url.searchParams.get("code");
  if (code) {
    setAccessCode(code);
  }
}


const Popup = () => {
  const [count, setCount] = useState(0);
  const [currentURL, setCurrentURL] = useState<string>();
  const [accessCode, setAccessCode] = useState<string>();;

  useEffect(() => {
    chrome.action.setBadgeText({ text: count.toString() });
  }, [count]);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      setCurrentURL(tabs[0].url);
    });
  }, []);

  useEffect(() => {
    chrome.runtime.sendMessage(`accessCode: ${accessCode}`);    
  }, [accessCode]);

  return (
    <>
      <button onClick={() => authWithGithub(setAccessCode)}>Authenticate with Github</button>
    </>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
