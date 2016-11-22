"use strict";

const Options        = require("./lib/options.js");
const FileRegistry   = require("./lib/file-registry.js");
const IconRegistry   = require("./lib/icon-registry.js");
const VCS            = require("./lib/vcs.js");
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
		VCS.init();
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
		VCS.reset();
		UI.reset();
		Options.reset();
	},

	provideService(){ return this; },

	iconClassForPath(path, context = ""){
		return FileRegistry.get(path).getIconClasses();
	}
};



/**
 * Noop to suppress breakage at runtime.
 *
 * TODO: Delete once these PRs have all been publicly shipped -
 *
 *    atom/tree-view#967
 *    atom/tabs/#392
 *    atom/find-and-replace#802
 *    atom/fuzzy-finder#262
 *    atom/archive-view#40
 *
 * TODO: Don't forget to crank the minimum required Atom version, too.
 */
module.exports.onWillDeactivate = function(){
	const {Disposable} = require("atom");
	return new Disposable();
};
