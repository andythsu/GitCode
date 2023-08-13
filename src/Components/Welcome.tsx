import React, { useEffect, useRef, useState } from 'react';
import {
	getFromLocalStorage,
	getFromPageLocalStorage,
	removeFromLocalStorage,
	saveToLocalStorage
} from '../util';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { GHUser } from '../GHUser';
import { createRepo, repoExists } from '../repo-util';
import { Typography, styled } from '@mui/material';
import { Stats } from './Stats';
import { LC } from '../@types/Leetcode';

type WelcomeProps = {
	ghUser: GHUser;
	onLogOut: () => void;
};

// const CssTextField = styled(TextField)({
// 	'& label.Mui-focused': {
// 		color: '#A0AAB4'
// 	},
// 	'& .MuiInput-underline:after': {
// 		borderBottomColor: '#B2BAC2'
// 	},
// 	'& .MuiOutlinedInput-root': {
// 		'& fieldset': {
// 			borderColor: '#E0E3E7'
// 		},
// 		'&:hover fieldset': {
// 			borderColor: '#B2BAC2'
// 		},
// 		'&.Mui-focused fieldset': {
// 			borderColor: '#6F7E8C'
// 		}
// 	}
// });

const getBoundRepository = async () => {
	return await getFromLocalStorage('bound_repo');
};

const getGhUsername = async () => {
	return await getFromLocalStorage('gh_username');
};

const onBindRepo = async (
	inputRef: React.RefObject<HTMLInputElement>,
	ghUser: GHUser,
	setRepo: React.Dispatch<React.SetStateAction<string>>
) => {
	const val = inputRef.current?.value;
	if (!val) return;
	try {
		const repoExistsRes = await repoExists(val, ghUser);
		if (!repoExistsRes) {
			await createRepo(val, ghUser);
		}
		saveToLocalStorage('bound_repo', val);
		setRepo(val);
	} catch (e) {
		console.error(e);
	}
};

const onRemoveRepo = async (setRepo: React.Dispatch<React.SetStateAction<string>>) => {
	await removeFromLocalStorage('bound_repo');
	setRepo('');
};

export const Welcome = ({ ghUser, onLogOut }: WelcomeProps) => {
	const [repo, setRepo] = useState<string>('');
	const [ghUsername, setGhUsername] = useState<string>('');
	const [lcProfile, setLcProfile] = useState<LC.Profile>();
	const bindRepoInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		getBoundRepository()
			.then((repo: string | null) => {
				if (repo) {
					setRepo(repo);
				}
			})
			.catch(console.error);
		getGhUsername()
			.then((username: string | null) => {
				if (username) {
					setGhUsername(username);
				}
			})
			.catch(console.error);

		const getLcProfileFromPage = async (): Promise<string | null> => {
			const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
			const lcProfile: string | null = await getFromPageLocalStorage('GLOBAL_DATA:value', tab.id!);
			if (lcProfile) {
				saveToLocalStorage('lc_profile', lcProfile);
			}
			return lcProfile;
		};

		getLcProfileFromPage()
			.then((profile) => {
				if (profile) {
					setLcProfile(JSON.parse(profile) as LC.Profile);
				} else {
					// try extension's local storage if current page doesn't have lc_profile
					getFromLocalStorage('lc_profile')
						.then((profile) => {
							if (profile) {
								setLcProfile(JSON.parse(profile) as LC.Profile);
							}
						})
						.catch(console.error);
				}
			})
			.catch(console.error);
	}, []);

	return (
		<>
			<Typography variant="h5">Welcome!</Typography>
			{repo != '' && (
				<>
					<Typography variant="subtitle1">
						Currently bound repo: {ghUsername == '' ? repo : `${ghUsername}/${repo}`}
					</Typography>
					<Button variant="outlined" color="error" onClick={() => onRemoveRepo(setRepo)}>
						Re-bind repo
					</Button>
				</>
			)}
			{repo == '' && (
				<>
					<Typography variant="subtitle2">Name of the repo you want to bind to</Typography>
					<TextField size="small" inputRef={bindRepoInputRef} label="Name" />
					<Button onClick={async () => await onBindRepo(bindRepoInputRef, ghUser, setRepo)}>
						bind
					</Button>
				</>
			)}
			{lcProfile && <Stats lcProfile={lcProfile} />}
			<hr style={{ marginTop: '20px' }} />
			<Button color="error" onClick={() => onLogOut()}>
				Log out
			</Button>
		</>
	);
};
