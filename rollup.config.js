import { terser } from "rollup-plugin-terser";
import includePaths from 'rollup-plugin-includepaths';
var importAlias = require('rollup-plugin-import-alias');

const
	packageConfig = require('./package.json'),
	bannerText = `/* @license
	On-screen keyboard detector (OSKD) v.${packageConfig.version}
	(c) 2020-${new Date().getFullYear()} Matthias Seemann
	OSKD may be freely distributed under the MIT license.
*/`,
	
	output = name => [
		{
			file: `dist/${name}.mjs`,
			format: "esm",
			preferConst: true,
			banner: bannerText
		},
		{
			file: `dist/${name}.min.mjs`,
			format: "esm",
			banner: bannerText
		},
		{
			file: `dist/${name}.js`,
			format: "umd",
			name: "OSKD",
			exports: 'named',
			banner: bannerText
		},
		{
			file: `dist/${name}.min.js`,
			format: "umd",
			exports: 'named',
			name: "OSKD",
			banner: bannerText
		}],
	
	plugins = [
		terser({
			include: [/^.+\.min\.m?js$/],
			output: {
				comments: function (node, comment) {
					var text = comment.value;
					var type = comment.type;
					if (type === 'comment2') {
						// multiline comment
						return /@license/i.test(text);
					}
				}
			}
		}),
		
		includePaths({
			include: {
				"@most/core": './node_modules/@most/core/dist/index.es.js',
				"@most/scheduler": "./node_modules/@most/scheduler/dist/index.es.js",
				"@most/prelude": "./node_modules/@most/prelude/dist/index.es.js",
				"@most/disposable": "./node_modules/@most/disposable/dist/index.es.js",
				"@most/dom-event": "./node_modules/@most/dom-event/dist/index.es.js",
				"ramda": "./node_modules/ramda/es/index.js"
			},
			extensions: []
		}),
		importAlias({
			Paths: {
				"@most/adapter": "./node_modules/@most/adapter/dist/index.mjs"
			},
			Extensions: ['js', 'mjs']
		}),
	];

const
	config = [
		{
			input: "src/osk-detector.js",
			output: output("oskd"),
			plugins
		},
		{
			input: "src/oskd-ios.js",
			output: output("oskd-ios"),
			plugins
		}
	];

export default config;