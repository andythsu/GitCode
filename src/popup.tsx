import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Auth from './Auth';
import { Welcome } from './Components/Welcome';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './popup.css';
import { GHUser } from './GHUser';
import { Button } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import { removeFromLocalStorage } from './util';

type PopupProps = {
	auth: Auth;
	ghUser: GHUser;
};

const authWithGithub = async (
	auth: Auth,
	setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>
): Promise<void> => {
	await auth.authWithGithub();
	setLoggedIn(true);
};

const onLogOut = async (
	setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>
): Promise<void> => {
	await removeFromLocalStorage('access_token');
	setLoggedIn(false);
};

const Popup = ({ auth, ghUser }: PopupProps) => {
	const [loggedIn, setLoggedIn] = useState(false);
	useEffect(() => {
		auth.getAccessToken().then((accessToken) => {
			if (accessToken) {
				setLoggedIn(true);
				ghUser.init(accessToken);
			}
		});
	}, []);

	return (
		<>
			{loggedIn ? (
				<Welcome ghUser={ghUser} onLogOut={async () => await onLogOut(setLoggedIn)}></Welcome>
			) : (
				<Button
					variant="contained"
					startIcon={<GitHubIcon />}
					onClick={() => authWithGithub(auth, setLoggedIn)}
				>
					Authenticate with Github
				</Button>
			)}
		</>
	);
};

const root = createRoot(document.getElementById('root')!);

const auth = new Auth();
const ghUser = new GHUser();

root.render(
	<React.StrictMode>
		<Popup auth={auth} ghUser={ghUser} />
	</React.StrictMode>
);
