import { Question } from './Question';
import { SubmissionStats } from './SubmissionStats';

export namespace MessagePayload {
	type UploadCode = SubmissionStats & Question;
}
