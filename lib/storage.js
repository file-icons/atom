"use strict";

const {sep}    = require("path");
const AtomFS   = require("atom-fs");
const LRUCache = require("lru-cache");

const isWin    = "\\" === sep;
const MAX_SIZE = 10000;
const version  = 0x005;
let locked     = false;
let data       = null;


/**
 * Cache for session-specific data.
 *
 * @class
 */
class Storage{

	/**
	 * Initialise session storage.
	 *
	 * @param {Object} state - Data serialized from last session
	 */
	init(state){
		locked = false;
		data = this.deserialize(state);

		this.clean();
	}


	/**
	 * Returns a serializable version of the data.
	 */
	serialize() {
		if (!data) {
			return null;
		}
		return {
			paths: data.paths.dump(),
			version,
		};
	}


	/**
	 * Deserializes the result of a previous serialize() call.
	 */
	deserialize(state) {
		if (!state || state.version !== version) {
			return this.createBlankCache();
		}
		const paths = new LRUCache({max: MAX_SIZE});
		paths.load(state.paths);
		return {paths, version};
	}


	/**
	 * Purge cache of invalid or irrelevant data.
	 */
	clean(){
		data.paths.forEach((value, path) => {
			if(!this.hasData(path) || !this.isProjectRelated(path))
				this.deletePath(path);
		});
	}


	/**
	 * Create a blank cache to store session data.
	 *
	 * @return {Object}
	 */
	createBlankCache(){
		return {
			paths: new LRUCache({max: MAX_SIZE}),
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
		for(const root of atom.project.rootDirectories){
			const projectPath = root.path;

			if(path === projectPath || 0 === path.indexOf(projectPath + sep))
				return true;

			if(isWin){
				const fixedPath = AtomFS.normalisePath(projectPath);
				if(path === fixedPath || 0 === path.indexOf(fixedPath + "/"))
					return true;
			}
		}
		return false;
	}


	/**
	 * Use path entries when iterating.
	 *
	 * @return {Iterator}
	 */
	[Symbol.iterator](){
		const pathData = data.paths;
		const pathKeys = pathData.keys();
		const pathValues = pathData.values();
		const {length} = pathKeys;
		let index = 0;

		return {
			next(){
				if(index >= length)
					return { done: true };
				else{
					const path  = pathKeys[index];
					const value = [path, pathValues[index]];
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

		const value = {
			icon: null,
			inode: null
		};
		data.paths.set(path, value);
		return value;
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
		const entry = data.paths.get(path);
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
		const entry = data.paths.get(path) || null;
		return !!(entry && (entry.icon || entry.inode));
	}


	/**
	 * Determine if icon-related data exists for a given path.
	 *
	 * @param {String} path
	 * @return {Boolean}
	 */
	hasIcon(path){
		const entry = data.paths.get(path);
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
		data.paths.del(path);
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
			const plural = 1 === size ? "" : "s";
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
		return data.paths.length;
	}
}


module.exports = new Storage();
