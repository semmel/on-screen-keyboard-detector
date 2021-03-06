/**
 * on-screen-keyboard-detector: oskd-ios.js
 *
 * Created by Matthias Seemann on 28.04.2020.
 */

const
	isVisualViewportSupported = "visualViewport" in window;

function isSupported() {
	 return isVisualViewportSupported;
}

const skipDuplicates = whenDifferent => {
	var previous = "_one_time_initial_";
	return function (next) {
		if (next !== previous) {
			previous = next;
			whenDifferent(next);
		}
	};
};

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
		nonRepeatingCallback = skipDuplicates(callback),
	
		onResize = evt => {
			const relativeDifferenceBetweenInnerHeightAndViewportHeight =
				(window.innerHeight - evt.target.height) / window.innerHeight;
				
			// account for the predictive text bar, showing on iPad with an external keyboard.
 			nonRepeatingCallback(
				relativeDifferenceBetweenInnerHeightAndViewportHeight > 0.1 ?
					'visible' :
					'hidden'
			);
		};
	
	visualViewport.addEventListener('resize', onResize);
	
	return function(){ visualViewport.removeEventListener('resize', onResize); };
}

export {
	subscribe,
	isSupported
};
