import { Question } from './Question';
import { Submission } from './Submission';

export namespace MessagePayload {
	type UploadCode = {
		submission: Submission;
		question: Question;
	};
}
