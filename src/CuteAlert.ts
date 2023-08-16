export const cuteToast = (toastConfig: { type: string; message: string }): Promise<void> => {
	const { type, message } = toastConfig;
	return new Promise((resolve) => {
		const existingToast = document.querySelector('.toast-container');

		if (existingToast) {
			existingToast.remove();
		}

		const body = document.querySelector('body');

		const scripts = document.getElementsByTagName('script');

		let src = '';

		for (let script of scripts) {
			if (script.src.includes('cute-alert.js')) {
				src = script.src.substring(0, script.src.lastIndexOf('/'));
			}
		}

		const svgSrc = chrome.runtime.getURL(`/cute_alert/${type}.svg`);
		const template = `
    <div class="toast-container ${type}-bg">
      <div>
        <div class="toast-frame">
          <img class="toast-img" src="${svgSrc}" />
          <span class="toast-message">${message}</span>
          <div class="toast-close">X</div>
        </div>
        <div class="toast-timer ${type}-timer" style="animation: timer ${parseInt(
			process.env.CUTE_TOAST_TIMER
		)}ms linear;"/>
      </div>
    </div>
    `;

		body!.insertAdjacentHTML('afterend', template);

		const toastContainer = document.querySelector('.toast-container')!;

		setTimeout(() => {
			toastContainer.remove();
			resolve();
		}, parseInt(process.env.CUTE_TOAST_TIMER));

		const toastClose = document.querySelector('.toast-close')!;

		toastClose.addEventListener('click', () => {
			toastContainer.remove();
			resolve();
		});
	});
};
