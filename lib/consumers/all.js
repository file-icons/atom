"use strict";

const Consumer = require("./consumer.js");

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
			if(atom.inSpecMode() || Consumer.needsPatch(name))
				this.consumers.push(require(`./${name}.js`));
	}
	
	
	/** Initialise all consumer classes. */
	init(){
		for(const consumer of this.consumers)
			consumer.init();
	}
	
	
	/**
	 * Reset consumer classes when deactivating.
	 *
	 * NOTE: Currently, this is a one-way op. There's no way of "repatching" classes
	 * once File-Icons has been deactivated and reactivated in the same session.
	 */
	reset(){
		for(const consumer of this.consumers.slice().reverse())
			consumer.reset();
	}
};


module.exports = new ConsumerManager();
