import { Grid, Paper, styled } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
// import config from '../../config/config.js';
import { LC } from '../@types/Leetcode';
import { getFromLocalStorage, saveToLocalStorage } from '../util';

type StatsProps = {
	lcProfile: LC.Profile | undefined;
};

const Item = styled(Paper)(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
	...theme.typography.body2,
	padding: theme.spacing(1),
	textAlign: 'center',
	color: theme.palette.text.secondary
}));

export const Stats = ({ lcProfile }: StatsProps) => {
	const [easy, setEasy] = useState(0);
	const [medium, setMedium] = useState(0);
	const [hard, setHard] = useState(0);
	const [lcUsername, setLcUsername] = useState('');

	useEffect(() => {
		getFromLocalStorage('numOfEasyQuestions').then((data) => {
			if (data) setEasy(parseInt(data));
		});
		getFromLocalStorage('numOfMediumQuestions').then((data) => {
			if (data) setMedium(parseInt(data));
		});
		getFromLocalStorage('numOfHardQuestions').then((data) => {
			if (data) setHard(parseInt(data));
		});
		getFromLocalStorage('lc_username').then((data) => {
			if (data) setLcUsername(data);
		});
	});

	useEffect(() => {
		if (!lcProfile) return;
		saveToLocalStorage('lc_username', lcProfile.userStatus.username);
		const query = {
			operationName: 'getUserProfile',
			query: process.env.LC_QUERIES_GET_USER_INFO,
			variables: {
				username: lcProfile.userStatus.username
			}
		};
		axios
			.post(process.env.LC_API_HOST, query, {
				headers: {
					'Content-Type': 'application/json'
				}
			})
			.then((res) => {
				const data = res.data as LC.UserStats;
				const numOfEasyQuestions = data.data.matchedUser.submitStats.acSubmissionNum[1].count;
				const numOfMediumQuestions = data.data.matchedUser.submitStats.acSubmissionNum[2].count;
				const numOfHardQuestions = data.data.matchedUser.submitStats.acSubmissionNum[3].count;
				setEasy(numOfEasyQuestions);
				setMedium(numOfMediumQuestions);
				setHard(numOfHardQuestions);
				saveToLocalStorage('numOfEasyQuestions', numOfEasyQuestions);
				saveToLocalStorage('numOfMediumQuestions', numOfMediumQuestions);
				saveToLocalStorage('numOfHardQuestions', numOfHardQuestions);
			});
	}, [lcProfile]);

	return (
		<>
			<p style={{ fontSize: '16px' }}>Currently logged in as {lcUsername} on Leetcode.</p>
			<p style={{ fontSize: '14px' }}>You have solved:</p>
			<Grid container spacing={2}>
				<Grid item xs={4}>
					<Item>
						<span style={{ color: 'green' }}>Easy</span>: {easy}
					</Item>
				</Grid>
				<Grid item xs={4}>
					<Item>
						<span style={{ color: 'orange' }}>Medium</span>: {medium}
					</Item>
				</Grid>
				<Grid item xs={4}>
					<Item>
						<span style={{ color: 'red' }}>Hard</span>: {hard}
					</Item>
				</Grid>
			</Grid>
		</>
	);
};
