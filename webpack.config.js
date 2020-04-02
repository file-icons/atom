// @ts-check

"use strict";

const EntryFile = "./lib/main.js";
const OutDirectory = "dist";
const JSOutFile = "main.js";

/** ******************************************************************************/

const path = require("path");

/** @type {import('webpack').Configuration}*/
const config = {
	target: "node", // Atom packages run in a Node.js-context, https://webpack.js.org/configuration/node/

	entry: EntryFile, // The entry point of this package, https://webpack.js.org/configuration/entry-context/

	output: {
		// The bundle is stored in the OutDirectory folder (check package.json), https://webpack.js.org/configuration/output/
		path: path.resolve(__dirname, OutDirectory),
		filename: JSOutFile,
		libraryTarget: "commonjs2",
		devtoolModuleFilenameTemplate: "../[resource-path]",
	},
	devtool: "source-map",
	externals: [{
		// https://webpack.js.org/configuration/externals/
		atom: "atom",
		electron: "electron",
		"atom-fs": "atom-fs"
	},
	/\.\/\.icondb\.js/,
	],
	resolve: {
		// Support reading JavaScript and Less files
		extensions: [".js", ".less"],
	},
	module: {
		rules: [
			{
				// All source files with a `.less` extension will be handled by `less-loader`
				test: /\.less$/,
				use: [
					{
						loader: "less-loader", // Compiles Less to CSS
					},
				],
			},
		],
	},
};
module.exports = config;
