import React, { useEffect, useRef, useState } from 'react';
import { getFromLocalStorage, removeFromLocalStorage, saveToLocalStorage } from '../util';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

const onLogOut = async () => {
	await removeFromLocalStorage('access_token');
};

const getBoundRepository = async () => {
	return await getFromLocalStorage('bound_repo');
};

const onBindRepo = (inputRef: React.RefObject<HTMLInputElement>) => {
	const val = inputRef.current?.value;
	saveToLocalStorage('bound_repo', val);
};

const onRemoveRepo = async () => {
	await removeFromLocalStorage('bound_repo');
};

export const Welcome = () => {
	const [repo, setRepo] = useState<string>('');
	const inputRef = useRef<HTMLInputElement>(null);

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
					<Button variant="outlined" color="error" onClick={onRemoveRepo}>
						Remove it
					</Button>
				</>
			)}
			{repo == '' && (
				<>
					<p> name of the repo you want to bind to</p>
					<TextField inputRef={inputRef} label="Name" />
					<button onClick={() => onBindRepo(inputRef)}>bind</button>
				</>
			)}
			<button onClick={() => onLogOut()}>log out</button>
		</>
	);
};
