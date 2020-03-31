const
	{Builder, Button, By, Capabilities, Condition, Key, until} = require('selenium-webdriver'),
	chrome = require('selenium-webdriver/chrome'),
	assert = require('chai').assert,
	child_process = require('child_process'),
	util = require('util'),
	
	exec = util.promisify(child_process.exec),
	testServerUrl = process.env.TEST_SERVER,
	targetBrowserName = process.env.SELENIUM_BROWSER.toLowerCase(),
	// Android keycodes see https://developer.android.com/reference/android/view/KeyEvent#KEYCODE_APP_SWITCH
	KEYCODE_BACK = 4,
	KEYCODE_APPSWITCH = 187,
	KEYCODE_HOME = 3,
	
	iosDeviceCapabilities = new Capabilities(),
	later = dt => new Promise(resolve => setTimeout(resolve, dt)),
	sendAndroidKey = keyCode => exec(`adb shell input keyevent ${keyCode}`);

iosDeviceCapabilities.set('platformName', 'ios');

describe("osk detector", function () {
	let driver, emailInput, numberInput, timeInput;
	
	this.timeout(20000);
	this.slow(15000);
	
	beforeEach(() =>
		new Builder()
		.forBrowser(targetBrowserName)
		.setSafariOptions(iosDeviceCapabilities)
		.setChromeOptions(
			new chrome.Options().androidChrome()
			.addArguments(
				'allow-insecure-localhost',
				`unsafely-treat-insecure-origin-as-secure=${testServerUrl}`
			)
		)
		.build()
		.then(theDriver => {driver = theDriver;})
		.then(() => driver.get(`${testServerUrl}/test/testbed.html`))
		.then(() => Promise.all([
			driver.findElement(By.css("input[type=email]")),
			driver.findElement(By.css("input[type=number]")),
			driver.findElement(By.css("input[type=time]"))
		]))
		.then(elements => {
			[emailInput, numberInput, timeInput] = elements;
		})
	);
	
	afterEach(() => driver.quit());
	
	it("'visible' should be published on focusing and text input", function() {
		return driver.executeScript(() => window.oskdEvents)
		.then(events => {
			assert.deepStrictEqual(events, [], 'initially no osk event is recorded');
		})
		.then(() => emailInput.click())
		.then(() => emailInput.sendKeys("my@email", Key.ENTER))
		.then(() => driver.sleep(1000))
		.then(() => driver.executeScript(() => window.oskdEvents))
		.then(events => {
			assert.deepStrictEqual(events, ['visible']);
		});
	});
	
	it("detects osk disappearance on Android back button", function() {
		if (targetBrowserName === "safari") {
			this.skip();
		}
		
		return driver.executeScript(() => window.oskdEvents)
		.then(events => {
			assert.deepStrictEqual(events, [], 'initially no osk event is recorded');
		})
		.then(() => emailInput.click())
		.then(() => driver.sleep(1000))
		.then(() => sendAndroidKey(KEYCODE_BACK))
		.then(() => driver.sleep(1000))
		.then(() => driver.executeScript(() => window.oskdEvents))
		.then(events => {
			assert.deepStrictEqual(events, ['visible', 'hidden']);
		})
		.then(() => numberInput.click())
		.then(() => driver.sleep(1500))
		.then(() => driver.executeScript(() => window.oskdEvents))
		.then(events => {
			assert.deepStrictEqual(events, ['visible', 'hidden', 'visible'], "detects number type input keyboard");
		})
		.then(() => driver.sleep(1000))
		.then(() => emailInput.click())
		.then(() => driver.sleep(1500))
		.then(() => driver.executeScript(() => window.oskdEvents))
		.then(events => {
			assert.strictEqual(events[events.length - 1], 'visible', "remain visible switching osk inputs");
		});
	});
});