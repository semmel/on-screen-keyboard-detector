Changelog
=========

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