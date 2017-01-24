"use strict";

class ConsumerManager{
	
	/**
	 * Load consumer-patch classes for packages which need them.
	 *
	 * @constructor
	 */
	constructor(){
		// Listed in order of activation
		const packageNames = [
			"nuclide",
			"tree-view",
			"tabs",
			"fuzzy-finder",
			"find-and-replace",
			"archive-view"
		];
		
		this.consumers = [];
		for(const name of packageNames)
			if(this.needsPatch(name)){
				this.consumers.push(require(`./${name}.js`));
			}
	}
	
	
	/**
	 * Determine if a package still needs monkey-patching.
	 *
	 * @param {String} packageName
	 * @return {Boolean}
	 * @private
	 */
	needsPatch(packageName){
		if(atom.inSpecMode())
			return true;
		
		const pkg =
			atom.packages.activePackages[packageName] ||
			atom.packages.loadedPackages[packageName];
		
		// No package data? Load consumer anyway; the package might be installed later
		if(!pkg || !pkg.metadata) return true;
		
		const services = pkg.metadata.consumedServices;
		
		// For Nuclide, anything is better than nothing. Take whatever we can get.
		if("nuclide" === packageName && services && services["atom.file-icons"])
			return false;
		
		return !(services && services["file-icons.element-icons"]);
	}
	
	
	/** Initialise all consumer classes. */
	init(){
		for(const consumer of this.consumers){
			consumer.init();
		}
	}
	
	
	/**
	 * Reset consumer classes when deactivating.
	 *
	 * NOTE: Currently, this is a one-way op. There's no way of "repatching" classes
	 * once File-Icons has been deactivated and reactivated in the same session.
	 */
	reset(){
		for(const consumer of this.consumers.slice().reverse()){
			consumer.reset();
		}
	}
};


module.exports = new ConsumerManager();
