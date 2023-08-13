import { Grid, Paper, styled } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import config from '../../config.json';
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
	});

	useEffect(() => {
		if (!lcProfile) return;
		const query = {
			operationName: 'getUserProfile',
			query: config.LeetcodeAPI.queries.getUserInfo,
			variables: {
				username: lcProfile.userStatus.username
			}
		};
		axios
			.post(config.LeetcodeAPI.graphql, query, {
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
			<p style={{ fontSize: '16px' }}>On Leetcode, you have solved:</p>
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
