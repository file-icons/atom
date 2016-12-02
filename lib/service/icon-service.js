"use strict";

const {CompositeDisposable, Disposable} = require("atom");
const Strategies   = require("./strategies/strategy-manager.js");
const FileRegistry = require("../filesystem/file-registry.js");
const IconDelegate = require("./icon-delegate.js");
const IconTables   = require("./icon-tables.js");


class IconService{
	
	init(paths){
		this.disposables = new CompositeDisposable();
		this.delegates = new Map();
		IconTables.init([
			require.resolve("./.config.json")
		]);
		this.ready = true;
		Strategies.init({
			hashbangs: require("./strategies/by-hashbang.js"),
			modelines: require("./strategies/by-modeline.js"),
			pathname:  require("./strategies/by-path.js")
		});
	}
	
	
	reset(){
		this.disposables.dispose();
		this.disposables.clear();
		this.disposables = null;
		this.delegates.clear();
		
		Strategies.reset();
		IconTables.reset();
	}
	
	
	iconClassForPath(path, context = ""){
		const file = FileRegistry.get(path);
		const icon = this.getDelegate(file);
		return icon.getClasses();
	}
	
	
	/**
	 * Create or retrieve the {@link IconDelegate} to represent this resource.
	 *
	 * @param {Resource} resource
	 * @return {IconDelegate}
	 */
	getDelegate(resource){
		let icon = this.delegates.get(resource);
		
		if(!icon){
			icon = new IconDelegate(resource);
			this.delegates.set(resource, icon);
		}
		
		return icon;
	}
}

IconService.prototype.ready = false;

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
