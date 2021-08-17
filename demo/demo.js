/**
 * on-screen-keyboard-detector: demo.js
 *
 * Created by Matthias Seemann on 5.04.2021.
 */

import { subscribe, isSupported } from '../src/osk-detector.js';

if (isSupported()) {
	const onOSKVisibilityChange = subscribe;
	const unsubscribe =
		onOSKVisibilityChange(visibilityState => {
			console.log(`OSK ${visibilityState}`);
			document.documentElement.style.setProperty(
				"background-color",
				visibilityState === "visible" ? "lightblue" : "inherit"
			);
		});
	
	document.querySelector('#leave-be-button')
	.addEventListener('click', unsubscribe);
	
	document.querySelector('#recommence-button')
	.addEventListener('click', () => {
		setTimeout(() => {
			onOSKVisibilityChange(visibilityState => console.log(visibilityState));
		}, 2000);
	});
}
else {
	alert("On-screen-keyboard detection is not supported on this Desktop Browser.");
}
