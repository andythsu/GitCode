import config from '../config.json';
import { Message } from './@types/Message';
import { MessagePayload } from './@types/Payload';

const getElementByQuerySelectorWithTimeout = (query: string): Promise<NodeListOf<Element>> => {
    return new Promise((resolve, reject) => {
        let count = 0;
        const EXPIRY_IN_MS = config.FIND_ELEMENT_EXPIRY_IN_MS;
        const ALLOWED_RETRIES = config.FIND_ELEMENT_ALLOWED_RETRIES;
        const timer = setInterval(() => {
            const elem = document.querySelectorAll(query);
            if(elem.length > 0) {
                clearTimeout(timer);
                resolve(elem);
            }else if(count > ALLOWED_RETRIES){
                clearTimeout(timer);
                reject(new Error(`${query} was not loaded in ${(EXPIRY_IN_MS * ALLOWED_RETRIES) / 1000} seconds.`));
            }
            count++;
          }, EXPIRY_IN_MS);
    });
}

const getElementByClassNameWithTimeout = (query: string): Promise<HTMLCollectionOf<Element>> => {
    return new Promise((resolve, reject) => {
        let count = 0;
        const EXPIRY_IN_MS = config.FIND_ELEMENT_EXPIRY_IN_MS;
        const ALLOWED_RETRIES = config.FIND_ELEMENT_ALLOWED_RETRIES;
        const timer = setInterval(() => {
            const elem = document.getElementsByClassName(query);
            if(elem.length > 0){
                clearTimeout(timer);
                resolve(elem);
            }else if (count > ALLOWED_RETRIES){
                clearTimeout(timer);
                reject(new Error(`${query} was not loaded in ${(EXPIRY_IN_MS * ALLOWED_RETRIES) / 1000} seconds.`));
            }
            count++;
        }, EXPIRY_IN_MS);
    });
}

/**
 * gets the code from UI.
 * @deprecated Marking this deprecated since we can get the code from localStroage
 * @returns Promise<string>
 */
const getCodeFromUI = (): Promise<string> => {
    const codeEditor: Element = document.getElementsByClassName("CodeMirror-code")[0];
    const codeLines: HTMLCollectionOf<HTMLPreElement> = codeEditor.getElementsByTagName("pre");
    let code: string = "";
    for(let i=0; i<codeLines.length; i++){
        code += codeLines[i].innerText;
        code += "\n";
    }
    return Promise.resolve(code);
}

const getQuestionNum = async (): Promise<number> => {
    const questionTitle = (await getElementByQuerySelectorWithTimeout(`[data-cy="question-title"]`))[0] as HTMLDivElement;
    const innterText = questionTitle.innerText;
    const questionNumStr = innterText.split(".")[0];
    return parseInt(questionNumStr);
}

const uploadCode = async (): Promise<void> => {
    const questionNum = await getQuestionNum();
    const payload: string = JSON.stringify({ questionNum } as MessagePayload.UploadCode);
    await chrome.runtime.sendMessage<Message, any>({type: 'uploadCode', payload});
}

(async () => {
    try {
        const submitBtn = (await getElementByQuerySelectorWithTimeout(`[data-cy="submit-code-btn"]`))[0];
        submitBtn.addEventListener("click", async () => {
            try {
                const successTag: HTMLCollectionOf<Element> = (await getElementByClassNameWithTimeout("marked_as_success"));
                if(!successTag[0]) throw new Error(`successTag[0] is not found. SuccessTag: ${successTag}`);
                await uploadCode();
            }catch(e){
                console.error(e); 
            }
        });
    }catch(e){
        console.error(e);
    }
})();