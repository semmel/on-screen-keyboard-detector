Changelog
=========

### v2.3
#### iOS
- pinch-zoom factor into account,
- new implementation no longer uses `window.innerHeight` for the layout viewport, but `documentElement.clientHeight` (fixes false `hidden` event when the keyboard is shown, but the page scrolled to the bottom).
- events occur with 0.8 seconds delay

### v2.2.0
- `isSupported()` requires touch enabled screen
- Support for Safari on iPad

### 2.1.0
#### Breaking Change
- Project now published as ES Module,
- Aggregated (dependency-free) source bundles (CommonJS and ESM) are still provided in the `dist` folder.

#### Other Changes
- Updated some development and runtime dependencies


### 2.0.3
- fix(TypeScript): Just list both exported functions in the Typescript definitions, not the JS module used in the `dist` files. 

### 2.0.2
- added `types` field to `package.json` to reference TS definitions

### 2.0.1
- added TypeScript types

Version 2.0.0
-------------
### Breaking
- API consists of two functions `subscribe(callback): unsubscribe` and `isSupported(): Boolean`

### Features
- if just targeting iOS, a separate build is provided in `dist`
