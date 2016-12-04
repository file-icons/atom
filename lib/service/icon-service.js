"use strict";

const {CompositeDisposable, Disposable} = require("atom");
const StrategyManager = require("./strategy-manager.js");
const FileRegistry = require("../filesystem/file-registry.js");
const IconTables = require("./icon-tables.js");


class IconService{
	
	init(paths){
		this.disposables = new CompositeDisposable();
		IconTables.init([
			require.resolve("./.config.json")
		]);
		StrategyManager.init([
			require("./strategies/hashbang-strategy.js"),
			require("./strategies/modeline-strategy.js"),
			require("./strategies/path-strategy.js")
		]);
		this.isReady = true;
	}
	
	
	reset(){
		this.disposables.dispose();
		this.disposables.clear();
		this.disposables = null;
		
		StrategyManager.reset();
		IconTables.reset();
		this.isReady = false;
	}
	
	
	iconClassForPath(path, context = ""){
		const file = FileRegistry.get(path);
		return file.icon.getClasses() || null;
	}
}

IconService.prototype.isReady = false;

module.exports = new IconService();


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
