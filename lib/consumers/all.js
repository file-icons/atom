"use strict";

const TreeView       = require("./tree-view.js");
const Tabs           = require("./tabs.js");
const FuzzyFinder    = require("./fuzzy-finder.js");
const FindAndReplace = require("./find-and-replace.js");
const ArchiveView    = require("./archive-view.js");


module.exports = {
	
	init(){
		TreeView.init();
		Tabs.init();
		FuzzyFinder.init();
		FindAndReplace.init();
		ArchiveView.init();
	},
	
	reset(){
		TreeView.reset();
		Tabs.reset();
		ArchiveView.reset();
		FindAndReplace.reset();
		FuzzyFinder.reset();
	}
};
