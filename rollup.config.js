import { terser } from "rollup-plugin-terser";
import resolve from '@rollup/plugin-node-resolve';

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
		
		resolve()
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
