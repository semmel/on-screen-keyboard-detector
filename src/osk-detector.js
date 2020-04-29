/**
 * onscreen-keyboard-detector: osk-detector.js
 *
 * Created by Matthias Seemann on 21.03.2020.
 */

import { at, debounce, delay, empty, filter, join, map, merge, mergeArray, multicast, now, runEffects, scan, skipAfter, skipRepeats, snapshot, switchLatest, startWith, tap, until } from '@most/core';
import { newDefaultScheduler } from '@most/scheduler';
import { change, domEvent, focusin, focusout, resize } from '@most/dom-event';
import { createAdapter } from '../node_modules/@most/adapter/dist/index.mjs';
import always from 'ramda/always.js';
import assoc from 'ramda/assoc.js';
import applyTo from 'ramda/applyTo.js';
import compose from 'ramda/compose.js';
import curry from 'ramda/curry.js';
import difference from 'ramda/difference.js';
import equals from 'ramda/equals.js';
import pipe from 'ramda/pipe.js';
import isEmpty from 'ramda/isEmpty.js';
import identical from 'ramda/identical.js';
import keys from 'ramda/keys.js';
import propEq from 'ramda/propEq.js';

import {subscribe as subscribeOnIOS, isSupported as isSupportedOnIOS} from './oskd-ios.js';

const
	isiOS = /iPhone/.test(navigator.userAgent),

	getScreenOrientationType = () =>
		screen.orientation.type.startsWith('portrait') ? 'portrait' : 'landscape',
	
	// rejectCapture :: Stream Boolean -> Stream a -> Stream a
	rejectCapture = curry(compose(join, snapshot((valveValue, event) => valveValue ? empty() : now(event)))),

	isAnyElementActive = () => document.activeElement && (document.activeElement !== document.body);

function isSupported() {
	if (isiOS) {
		return isSupportedOnIOS();
	}
	
	return true;
}

/**
 *
 * @param {function(String)} userCallback
 * @return {function(): void}
 */
// initWithCallback :: (String -> *) -> (... -> undefined)
function initWithCallback(userCallback) {
	if(isiOS) {
		return subscribeOnIOS(userCallback);
	}
	
	const
		INPUT_ELEMENT_FOCUS_JUMP_DELAY = 700,
		SCREEN_ORIENTATION_TO_WINDOW_RESIZE_DELAY = 700,
		RESIZE_QUIET_PERIOD = 500,
		LAYOUT_RESIZE_TO_LAYOUT_HEIGHT_FIX_DELAY =
			Math.max(INPUT_ELEMENT_FOCUS_JUMP_DELAY, SCREEN_ORIENTATION_TO_WINDOW_RESIZE_DELAY) - RESIZE_QUIET_PERIOD + 200,
		
		[ induceUnsubscribe, userUnsubscription ] = createAdapter(),
		scheduler = newDefaultScheduler(),
		
		// assumes initially hidden OSK
		initialLayoutHeight = window.innerHeight,
		// assumes initially hidden OSK
		approximateBrowserToolbarHeight = screen.availHeight - window.innerHeight,
		
		focus =
			merge(focusin(document.documentElement), focusout(document.documentElement)),
		
		documentVisibility =
			applyTo(domEvent('visibilitychange', document))(pipe(
				map(() => document.visibilityState),
				startWith(document.visibilityState)
			)),
		
		isUnfocused =
			applyTo(focus)(pipe(
				map(evt =>
					evt.type === 'focusin' ? now(false) : at(INPUT_ELEMENT_FOCUS_JUMP_DELAY, true)
				),
				switchLatest,
				startWith(!isAnyElementActive()),
				skipRepeats,
				multicast
			)),
		
		layoutHeightOnOSKFreeOrientationChange =
			applyTo(change(screen.orientation))(pipe(
				// The 'change' event hits very early BEFORE window.innerHeight is updated (e.g. on "resize")
				snapshot(
					unfocused => unfocused || (window.innerHeight === initialLayoutHeight),
					isUnfocused
				),
				debounce(SCREEN_ORIENTATION_TO_WINDOW_RESIZE_DELAY),
				map(isOSKFree => ({
					screenOrientation: getScreenOrientationType(),
					height: isOSKFree ? window.innerHeight : screen.availHeight - approximateBrowserToolbarHeight
				}))
			)),
		
		layoutHeightOnUnfocus =
			applyTo(isUnfocused)(pipe(
				filter(identical(true)),
				map(() => ({screenOrientation: getScreenOrientationType(), height: window.innerHeight}))
			)),
		
		// Difficulties: The exact layout height in the perpendicular orientation is only to determine on orientation change,
		// Orientation change can happen:
		// - entirely unfocused,
		// - focused but w/o OSK, or
		// - with OSK.
		// Thus on arriving in the new orientation, until complete unfocus, it is uncertain what the current window.innerHeight value means
		
		// Solution?: Assume initially hidden OSK (even if any input has the "autofocus" attribute),
		// and initialize other dimension with screen.availWidth
		// so there can always be made a decision on the keyboard.
		layoutHeights =
			// Ignores source streams while documentVisibility is 'hidden'
			// sadly visibilitychange comes 1 sec after focusout!
			applyTo(mergeArray([layoutHeightOnUnfocus, layoutHeightOnOSKFreeOrientationChange]))(pipe(
				delay(1000),
				rejectCapture(map(equals("hidden"), documentVisibility)),
				scan(
					(accHeights, {screenOrientation, height}) =>
						assoc(screenOrientation, height, accHeights),
					{
						[getScreenOrientationType()]: window.innerHeight
					}
				),
				skipAfter(compose(isEmpty, difference(['portrait', 'landscape']), keys))
			)),
		
		layoutHeightOnVerticalResize =
			applyTo(resize(window))(pipe(
				debounce(RESIZE_QUIET_PERIOD),
				map(evt => ({ width: evt.target.innerWidth, height: evt.target.innerHeight})),
				scan(
					(prev, size) =>
						({
							...size,
							isJustHeightResize: prev.width === size.width,
							dH: size.height - prev.height
						}),
					{
						width: window.innerWidth,
						height: window.innerHeight,
						isJustHeightResize: false,
						dH: 0
					}
				),
				filter(propEq('isJustHeightResize', true))
			)),
		
		osk =
			applyTo(layoutHeightOnVerticalResize)(pipe(
				delay(LAYOUT_RESIZE_TO_LAYOUT_HEIGHT_FIX_DELAY),
				snapshot(
					(layoutHeightByOrientation, {height, dH}) => {
						const
							nonOSKLayoutHeight = layoutHeightByOrientation[getScreenOrientationType()];
						
						if (!nonOSKLayoutHeight) {
							return (dH > 0.1 * screen.availHeight) ? now("hidden")
								: (dH < -0.1 * screen.availHeight) ? now("visible")
									: empty();
						}
						
						return (height < 0.9 * nonOSKLayoutHeight) && (dH < 0) ? now("visible")
							: (height === nonOSKLayoutHeight) && (dH > 0) ? now("hidden")
							: empty();
					},
					layoutHeights
				),
				join,
				merge(applyTo(isUnfocused)(pipe(
					filter(identical(true)),
					map(always("hidden"))
				))),
				until(userUnsubscription),
				skipRepeats
			));
	
	runEffects(tap(userCallback, osk), scheduler);
	
	return induceUnsubscribe;
}

export {
	initWithCallback as subscribe,
	isSupported
};