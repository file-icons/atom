"use strict";

const Consumers      = require("./lib/consumers/all.js");
const Options        = require("./lib/options.js");
const FileRegistry   = require("./lib/file-registry.js");
const IconRegistry   = require("./lib/icon-registry.js");
const Strategies     = require("./lib/strategies/all.js");
const UI             = require("./lib/ui.js");


module.exports = {

	activate(){
		Options.init();
		UI.init();
		Consumers.init();
		FileRegistry.init();
		IconRegistry.init();
		UI.observe();
		
		IconRegistry.load([
			require.resolve("./lib/.config.json")
		]);
		
		Strategies.init();
	},
	
	deactivate(){
		Strategies.reset();
		Consumers.reset();
		FileRegistry.reset();
		IconRegistry.reset();
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
