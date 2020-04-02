import { terser } from "rollup-plugin-terser";
import includePaths from 'rollup-plugin-includepaths';

const
	packageConfig = require('./package.json'),
	bannerText = `/* @license
	On-screen keyboard detector (OSKD) v.${packageConfig.version}
	(c) 2020-${new Date().getFullYear()} Matthias Seemann
	OSKD may be freely distributed under the MIT license.
*/`;

const
	config = {
		input: "src/osk-detector.js",
		output: [
			{
				file: "dist/oskd.mjs",
				format: "esm",
				preferConst: true,
				banner: bannerText
			},
			{
				file: "dist/oskd.min.mjs",
				format: "esm",
				banner: bannerText
			},
			{
				file: "dist/oskd.js",
				format: "umd",
				name: "OSKD",
				exports: 'named',
				banner: bannerText
			},
			{
				file: "dist/oskd.min.js",
				format: "umd",
				exports: 'named',
				name: "OSKD",
				banner: bannerText
			}
		],
		plugins: [
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
					"ramda/always.js": "./node_modules/ramda/es/always.js",
					"ramda/assoc.js": "./node_modules/ramda/es/assoc.js",
					"ramda/applyTo.js": "./node_modules/ramda/es/applyTo.js",
					"ramda/compose.js": "./node_modules/ramda/es/compose.js",
					"ramda/curry.js": "./node_modules/ramda/es/curry.js",
					"ramda/difference.js": "./node_modules/ramda/es/difference.js",
					"ramda/equals.js": "./node_modules/ramda/es/equals.js",
					"ramda/pipe.js": "./node_modules/ramda/es/pipe.js",
					"ramda/isEmpty.js": "./node_modules/ramda/es/isEmpty.js",
					"ramda/identical.js": "./node_modules/ramda/es/identical.js",
					"ramda/keys.js": "./node_modules/ramda/es/keys.js",
					"ramda/propEq.js": "./node_modules/ramda/es/propEq.js"
				},
				extensions: ['.js', '.mjs']
			})
		]
	};

export default config;