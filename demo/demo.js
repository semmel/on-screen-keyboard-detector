/**
 * on-screen-keyboard-detector: demo.js
 *
 * Created by Matthias Seemann on 5.04.2021.
 */

import { subscribe } from '../src/osk-detector.js';
const onOSKVisibilityChange = subscribe;
const unsubscribe =
	onOSKVisibilityChange(visibilityState => console.log(`OSK ${visibilityState}`));

document.querySelector('#leave-be-button')
.addEventListener('click', unsubscribe);

document.querySelector('#recommence-button')
.addEventListener('click', () => {
	setTimeout(() => {
		onOSKVisibilityChange(visibilityState => console.log(visibilityState));
	}, 2000);
});
