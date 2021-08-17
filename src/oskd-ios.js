/**
 * on-screen-keyboard-detector: oskd-ios.js
 *
 * Created by Matthias Seemann on 28.04.2020.
 */

import {pipe} from "ramda";
import { resize, scroll } from '@most/dom-event';
import {
	debounce,  map as map_o, mergeArray as merge_all_o, runEffects, skipRepeats,
	tap as tap_o, until} from "@most/core";
import {createAdapter} from "@most/adapter";
import {newDefaultScheduler} from "@most/scheduler";

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
function initWithCallback(callback) {
	if (!isSupported()) {
		console.warn("On-Screen-Keyboard detection not supported on this version of iOS");
		return () => undefined;
	}
	
	const
		[ induceUnsubscribe, userUnsubscription ] = createAdapter(),
		scheduler = newDefaultScheduler(),
		HEURISTIC_VIEWPORT_HEIGHT_CLIENT_HEIGHT_RATIO = 0.85,
		
		isKeyboardShown = pipe(
			() => merge_all_o([
				scroll(visualViewport),
				resize(visualViewport),
				scroll(window)
			]),
			debounce(200),
			map_o(() =>
				visualViewport.height * visualViewport.scale / document.documentElement.clientHeight < HEURISTIC_VIEWPORT_HEIGHT_CLIENT_HEIGHT_RATIO
			),
			skipRepeats,
			map_o(isShown => isShown ? "visible" : "hidden"),
			until(userUnsubscription)
		)();
	
	runEffects(tap_o(callback, isKeyboardShown), scheduler);
	
	return induceUnsubscribe;
}

export {
	initWithCallback as subscribe,
	isSupported
};
