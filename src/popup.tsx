import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import Auth from "./Auth";
import { Welcome } from "./Welcome";
import { getFromPageLocalStorage } from "./util";

const auth = new Auth();

type PopupProps = {
	auth: Auth;
}

const Popup = ({auth}: PopupProps) => {
	useEffect(() => {
		const fn = async () => {
			const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
			const res = await getFromPageLocalStorage('GLOBAL_DATA:value', tab.id!);
			console.log(res);
		};
		fn().catch(e => console.log);
	}, [])
	const accessToken = auth.getAccessToken();
	return (
		<>
		{
			accessToken
			? <Welcome></Welcome>
			: <button onClick={() => auth.authWithGithub()}>Authenticate with Github</button>
		}
		</>
		);
};
	
const root = createRoot(document.getElementById("root")!);
	
root.render(
	<React.StrictMode>
		<Popup auth={auth}/>
	</React.StrictMode>
);