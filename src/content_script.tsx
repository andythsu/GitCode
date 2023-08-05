import axios from 'axios';
import config from '../config.json';
import { getFromLocalStorage } from './util';

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

const getCodeFromEditor = (codeEditor: Element): string => {
    const codeLines: HTMLCollectionOf<HTMLPreElement> = codeEditor.getElementsByTagName("pre");
    let code: string = "";
    for(let i=0; i<codeLines.length; i++){
        code += codeLines[i].innerText;
        code += "\n";
    }
    return code;
}

const uploadToGithub = async (code: string) => {
    const data = JSON.stringify({
        "message": "txt file",
        "content": `${Buffer.from(code, "utf8").toString("base64")}`
    });

    const accessToken: string = (await getFromLocalStorage("access_token"));
    console.log("gh access token", accessToken);

    const config = {
        method: "put",
        url: "https://api.github.com/repos/andythsu/andythsu.github.io/contents/test.txt",
        headers: {
            "Accept": "application/vnd.github+json",
            "Authorization": `Bearer ${accessToken}`,
        },
        data: data
    };

    // const result = await axios(config);
    // console.log(result);
}

(async () => {
    try {
        const submitBtn = (await getElementByQuerySelectorWithTimeout(`[data-cy="submit-code-btn"]`))[0];
        submitBtn.addEventListener("click", async () => {
            try {
                const successTag: HTMLCollectionOf<Element> = (await getElementByClassNameWithTimeout("marked_as_success"));
                if(!successTag[0]) throw new Error(`successTag[0] is not found. SuccessTag: ${successTag}`);
                const codeEditor: Element = document.getElementsByClassName("CodeMirror-code")[0];
                const code = getCodeFromEditor(codeEditor);
                await uploadToGithub(code);
            }catch(e){
                console.error(e); 
            }
        });
    }catch(e){
        console.error(e);
    }
})();