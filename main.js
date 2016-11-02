"use strict";

const Options      = require("./lib/options.js");
const FileRegistry = require("./lib/file-registry.js");
const IconRegistry = require("./lib/icon-registry.js");
const UI           = require("./lib/ui.js");

const TreeView     = require("./lib/consumers/tree-view.js");


module.exports = {

	activate(){
		Options.init();
		UI.init();
		TreeView.init();
		FileRegistry.init();
		IconRegistry.init();
		UI.observe();
		
		IconRegistry.load([
			require.resolve("./lib/.config.json")
		]);
	},
	
	deactivate(){
		FileRegistry.reset();
		IconRegistry.reset();
		TreeView.reset();
		UI.reset();
		Options.reset();
	},

	provideService(){ return this; },

	iconClassForPath(path, context = ""){
		return FileRegistry.get(path).consumeIconClass();
	}
};
