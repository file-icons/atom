"use strict";

const Options        = require("./lib/options.js");
const FileRegistry   = require("./lib/file-registry.js");
const IconRegistry   = require("./lib/icon-registry.js");
const UI             = require("./lib/ui.js");

const TreeView       = require("./lib/consumers/tree-view.js");
const Tabs           = require("./lib/consumers/tabs.js");
const FuzzyFinder    = require("./lib/consumers/fuzzy-finder.js");
const FindAndReplace = require("./lib/consumers/find-and-replace.js");
const ArchiveView    = require("./lib/consumers/archive-view.js");


module.exports = {

	activate(){
		Options.init();
		UI.init();
		TreeView.init();
		Tabs.init();
		FuzzyFinder.init();
		FindAndReplace.init();
		ArchiveView.init();
		FileRegistry.init();
		IconRegistry.init();
		UI.observe();
		
		IconRegistry.load([
			require.resolve("./lib/.config.json")
		]);
	},
	
	deactivate(){
		TreeView.reset();
		Tabs.reset();
		ArchiveView.reset();
		FindAndReplace.reset();
		FuzzyFinder.reset();
		FileRegistry.reset();
		IconRegistry.reset();
		UI.reset();
		Options.reset();
	},

	provideService(){ return this; },

	iconClassForPath(path, context = ""){
		return FileRegistry.get(path).consumeIconClass();
	}
};
