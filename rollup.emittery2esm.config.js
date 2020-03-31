import commonjs from '@rollup/plugin-commonjs';

export default {
	input: "node_modules/emittery/index.js",
	output: {
		format: "esm",
		file: "demo/emittery.mjs"
	},
	plugins: [commonjs()]
};
