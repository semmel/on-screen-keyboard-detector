/**
 * on-screen-keyboard-detector: oskd-ios.js
 *
 * Created by Matthias Seemann on 28.04.2020.
 */

import { map,  runEffects, skipRepeats, tap, until } from '@most/core';
import { newDefaultScheduler } from '@most/scheduler';
import { resize } from '@most/dom-event';
import { createAdapter } from '../node_modules/@most/adapter/dist/index.mjs';
import pipe from 'ramda/pipe.js';

const
	isVisualViewportSupported = "visualViewport" in window;

function isSupported() {
	 return isVisualViewportSupported;
}

/**
 *
 * @param {function(String)} callback
 * @return {function(): void}
 */
// initWithCallback :: (String -> *) -> (... -> undefined)
function subscribe(callback) {
	if (!isSupported()) {
		console.warn("On-Screen-Keyboard detection not supported on this version of iOS");
		return () => undefined;
	}
	
	const
		[ induceUnsubscribe, userUnsubscription ] = createAdapter(),
		scheduler = newDefaultScheduler(),
		
		oskd = pipe(
			map(evt => evt.target.height === window.innerHeight ? 'hidden' : 'visible'),
			skipRepeats,
			until(userUnsubscription),
			tap(callback)
		)(resize(window.visualViewport));
		
		runEffects(oskd, scheduler);
		
		return induceUnsubscribe;
}

export default {
	subscribe,
	isSupported
};