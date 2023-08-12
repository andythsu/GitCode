import React, { useEffect, useRef, useState } from 'react';
import { getFromLocalStorage, removeFromLocalStorage, saveToLocalStorage } from '../util';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { GHUser } from '../GHUser';
import { createRepo, repoExists } from '../repo-util';

type WelcomeProps = {
	ghUser: GHUser;
	onLogOut: () => void;
};

const getBoundRepository = async () => {
	return await getFromLocalStorage('bound_repo');
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
	const bindRepoInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		getBoundRepository()
			.then((repo: string | null) => {
				if (repo) {
					setRepo(repo);
				}
			})
			.catch(console.error);
	}, []);

	return (
		<>
			<div>Welcome</div>
			{repo != '' && (
				<>
					<p>Currently bound repo: {repo}</p>
					<Button variant="outlined" color="error" onClick={() => onRemoveRepo(setRepo)}>
						Remove it
					</Button>
				</>
			)}
			{repo == '' && (
				<>
					<p>Name of the repo you want to bind to</p>
					<TextField inputRef={bindRepoInputRef} label="Name" />
					<button onClick={async () => await onBindRepo(bindRepoInputRef, ghUser, setRepo)}>
						bind
					</button>
				</>
			)}
			<button onClick={() => onLogOut()}>log out</button>
		</>
	);
};
