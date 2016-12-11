"use strict";

const {sep} = require("path");

let locked = false;
let data = {
	icons: {}
};


/**
 * Cache for session-specific data.
 *
 * @class
 */
class Storage{
	
	/**
	 * Initialise session storage.
	 *
	 * @param {Object} state - Data serialised from last session
	 */
	init(state = {}){
		if(state.icons)
			data.icons = state.icons;
		this.purgeIrrelevantPaths();
	}
	
	
	/**
	 * Delete all cached data.
	 */
	reset(){
		if(!locked){
			data.icons = {};
			atom.project.serialize();
		}
	}
	
	
	/**
	 * Block all future changes to cached data.
	 *
	 * Called when deactivating package or closing the project window.
	 * Stops strategies losing cached data when they're deinitialised.
	 *
	 * @see {@link Strategy#disable}
	 */
	lock(){
		if(locked) return;
		Object.freeze(data.icons);
		Object.freeze(data);
		locked = true;
	}
	
	
	/**
	 * Retrieve the relevant project enclosing a path.
	 *
	 * @param {String} path
	 * @return {Directory}
	 */
	getProjectFolder(path){
		const {rootDirectories} = atom.project;
		for(const root of rootDirectories)
			if(path === root.path || 0 === path.indexOf(root.path + sep))
				return root;
		return null;
	}
	
	
	/**
	 * Uncache paths which don't reside in project directories.
	 */
	purgeIrrelevantPaths(){
		if(locked) return;
		for(const path in data.icons)
			if(null === this.getProjectFolder(path))
				delete data.icons[path];
	}
	
	
	/**
	 * Serialisable hash which holds all cached data.
	 *
	 * @property {Object}
	 * @readonly
	 */
	get data(){
		return data;
	}
	
	
	/**
	 * Whether the cache has been locked from modification.
	 *
	 * @property {Boolean}
	 * @readonly
	 */
	get locked(){
		return locked;
	}
}


module.exports = new Storage();
