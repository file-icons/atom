"use strict";

const {sep} = require("path");

const version = 0x001;
let locked = false;
let data = null;


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
	init(state){
		locked = false;
		data = state && state.version === version
			? state
			: this.createBlankCache();
		
		this.clean();
	}
	
	
	/**
	 * Purge cache of invalid or irrelevant data.
	 */
	clean(){
		for(const path in data.paths)
			if(!this.hasData(path) || !this.isProjectRelated(path))
				this.deletePath(path);
	}
	
	
	/**
	 * Create a blank cache to store session data.
	 *
	 * @return {Object}
	 */
	createBlankCache(){
		return {
			paths: {},
			version
		};
	}
	
	
	/**
	 * Determine if a currently-open project encloses a path.
	 *
	 * @param {String} path
	 * @return {Boolean}
	 */
	isProjectRelated(path){
		const {rootDirectories} = atom.project;
		for(const root of rootDirectories)
			if(path === root.path || 0 === path.indexOf(root.path + sep))
				return true;
		return false;
	}
	
	
	/**
	 * Use path entries when iterating.
	 *
	 * @return {Iterator}
	 */
	[Symbol.iterator](){
		const pathData = this.data.paths;
		const pathKeys = Object.keys(pathData);
		const {length} = pathKeys;
		let index = 0;
		
		return {
			next(){
				if(index >= length)
					return { done: true };
				else{
					const path  = pathKeys[index];
					const value = [path, pathData[path]];
					++index;
					return { value };
				}
			}
		};
	}
	
	
	/**
	 * Create a blank entry for an unlisted path.
	 *
	 * Any existing data is blindly overwritten. Use {@link #getPathEntry}
	 * or {@link #deletePathEntry} to add/delete path-related data.
	 *
	 * @param {String} path
	 * @return {Object}
	 * @private
	 */
	addPath(path){
		if(locked) return;
		
		return data.paths[path] = {
			icon: null,
			inode: null
		};
	}
	
	
	/**
	 * Retrieve the data cached for a path.
	 *
	 * A new entry is created if one doesn't exist.
	 *
	 * @param {String} path
	 * @return {Object}
	 */
	getPathEntry(path){
		const entry = data.paths[path];
		if(entry) return entry;
		
		return locked
			? null
			: this.addPath(path);
	}
	
	
	/**
	 * Retrieve the icon data cached for a path.
	 *
	 * @param {String} path
	 * @return {Object}
	 */
	getPathIcon(path){
		const {icon} = this.getPathEntry(path);
		if(!icon) return null;
		
		return {
			priority:  icon[0],
			index:     icon[1],
			iconClass: icon[2]
		};
	}
	
	
	/**
	 * Determine if stored data exists for a given path.
	 *
	 * @param {String} path
	 * @return {Boolean}
	 */
	hasData(path){
		const entry = data.paths[path] || null;
		return !!(entry && (entry.icon || entry.inode));
	}
	
	
	/**
	 * Determine if icon-related data exists for a given path.
	 *
	 * @param {String} path
	 * @return {Boolean}
	 */
	hasIcon(path){
		const entry = data.paths[path];
		return !!(entry && entry.icon);
	}
	
	
	/**
	 * Store icon-related data for a path.
	 *
	 * @param {String} path
	 * @param {Object} iconData
	 * @param {Number} iconData.priority
	 * @param {Number} iconData.index
	 * @param {Array}  iconData.iconClass
	 */
	setPathIcon(path, iconData){
		if(!iconData) return;
		this.getPathEntry(path).icon = [
			iconData.priority,
			iconData.index,
			iconData.iconClass
		];
	}
	
	
	/**
	 * Store the inode of a filesystem path.
	 *
	 * @param {String} path
	 * @param {Number} inode
	 */
	setPathInode(path, inode){
		if(!inode || locked) return;
		let entry = this.getPathEntry(path);
		
		// We're holding stale data. Shoot it.
		if(entry.inode && entry.inode !== inode){
			this.deletePath(path);
			entry = this.addPath(path);
		}
		
		entry.inode = inode;
	}
	
	
	/**
	 * Delete any data being stored for a path.
	 *
	 * @param {String} path
	 */
	deletePath(path){
		delete data.paths[path];
	}
	
	
	/**
	 * Delete a path's cached icon.
	 *
	 * @param {String} path
	 */
	deletePathIcon(path){
		delete this.getPathEntry(path).icon;
	}
	
	
	/**
	 * Block further changes to cached data.
	 *
	 * Stops strategies losing cached data when deactivating
	 * the package, or when closing the project window.
	 */
	lock(){
		locked = true;
	}
	
	
	/**
	 * Wipe all cached data.
	 *
	 * Handler for a user-command. Not used internally.
	 * @public
	 */
	reset(){
		if(this.locked){
			const detail = "This shouldn't have happened. Please restart Atom.";
			atom.notifications.addError("Storage locked", {detail});
			return;
		}
		
		else{
			const {size} = this;
			data = this.createBlankCache();
			atom.project.serialize();
			const plural = size === 1 ? "" : "s";
			const message = `Cleared ${size} path${plural} from icon cache.`;
			atom.notifications.addInfo(message, {dismissable: true});
		}
	}
	
	
	/**
	 * Pointer to the hash which holds all cached data.
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
	
	
	/**
	 * Number of paths currently cached.
	 *
	 * @property {Number}
	 * @readonly
	 */
	get size(){
		return Object.keys(data.paths).length;
	}
}


module.exports = new Storage();
