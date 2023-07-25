import config from './config.json';

const getElementByQuerySelector = (query: string): Promise<NodeListOf<Element>> => {
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

const getElementByClassName = (query: string): Promise<HTMLCollectionOf<Element>> => {
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

(async () => {
    try {
        const submitBtn = (await getElementByQuerySelector(`[data-cy="submit-code-btn"]`))[0];
        submitBtn.addEventListener("click", async () => {
            try {
                const successTag = (await getElementByClassName("marked_as_success"))[0];
                console.log(successTag);
            }catch(e){
                console.error(e); 
            }
        });
    }catch(e){
        console.error(e);
    }
})();


// window.addEventListener("load", (event) => {
//     const submitBtn = document.querySelectorAll('[data-cy="submit-code-btn"]')[0];

//     submitBtn.addEventListener('click', () => {
//         console.log("sss");
    
//     });    
// });