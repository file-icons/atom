"use strict";function _createForOfIteratorHelperLoose(o){var i=0;if("undefined"==typeof Symbol||null==o[Symbol.iterator]){if(Array.isArray(o)||(o=_unsupportedIterableToArray(o)))return function(){return i>=o.length?{done:true}:{done:false,value:o[i++]}};throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}return i=o[Symbol.iterator](),i.next.bind(i)}function _unsupportedIterableToArray(o,minLen){if(o){if("string"==typeof o)return _arrayLikeToArray(o,minLen);var n=Object.prototype.toString.call(o).slice(8,-1);return"Object"===n&&o.constructor&&(n=o.constructor.name),"Map"===n||"Set"===n?Array.from(n):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?_arrayLikeToArray(o,minLen):void 0}}function _arrayLikeToArray(arr,len){(null==len||len>arr.length)&&(len=arr.length);for(var i=0,arr2=Array(len);i<len;i++)arr2[i]=arr[i];return arr2}const{sep}=require("path"),AtomFS=require("atom-fs"),LRUCache=require("lru-cache"),isWin="\\"===sep,MAX_SIZE=1e4,version=5;let locked=false,data=null;/**
 * Cache for session-specific data.
 *
 * @class
 */class Storage{/**
	 * Initialise session storage.
	 *
	 * @param {Object} state - Data serialised from last session
	 */init(state){locked=false,data=this.deserialise(state),this.clean()}/**
	 * Serialise data intended to persist between sessions.
	 */serialise(){return data?{paths:data.paths.dump(),version}:null}/**
	 * Deserialise the result of a previous {@link Storage#serialise} call.
	 */deserialise(state){if(!state||state.version!==version)return this.createBlankCache();const paths=new LRUCache({max:MAX_SIZE});return paths.load(state.paths),{paths,version}}/**
	 * Purge cache of invalid or irrelevant data.
	 */clean(){data.paths.forEach((value,path)=>{this.hasData(path)&&this.isProjectRelated(path)||this.deletePath(path)})}/**
	 * Create a blank cache to store session data.
	 *
	 * @return {Object}
	 */createBlankCache(){return{paths:new LRUCache({max:MAX_SIZE}),version}}/**
	 * Determine if a currently-open project encloses a path.
	 *
	 * @param {String} path
	 * @return {Boolean}
	 */isProjectRelated(path){for(var _step,_iterator=_createForOfIteratorHelperLoose(atom.project.rootDirectories);!(_step=_iterator()).done;){const root=_step.value,projectPath=root.path;if(path===projectPath||0===path.indexOf(projectPath+sep))return true;if(isWin){const fixedPath=AtomFS.normalisePath(projectPath);if(path===fixedPath||0===path.indexOf(fixedPath+"/"))return true}}return false}/**
	 * Use path entries when iterating.
	 *
	 * @return {Iterator}
	 */[Symbol.iterator](){const pathData=data.paths,pathKeys=pathData.keys(),pathValues=pathData.values(),{length}=pathKeys;let index=0;return{next(){if(index>=length)return{done:true};else{const path=pathKeys[index],value=[path,pathValues[index]];return++index,{value}}}}}/**
	 * Create a blank entry for an unlisted path.
	 *
	 * Any existing data is blindly overwritten. Use {@link #getPathEntry}
	 * or {@link #deletePathEntry} to add/delete path-related data.
	 *
	 * @param {String} path
	 * @return {Object}
	 * @private
	 */addPath(path){if(!locked){const value={icon:null,inode:null};return data.paths.set(path,value),value}}/**
	 * Retrieve the data cached for a path.
	 *
	 * A new entry is created if one doesn't exist.
	 *
	 * @param {String} path
	 * @return {Object}
	 */getPathEntry(path){const entry=data.paths.get(path);return entry?entry:locked?null:this.addPath(path)}/**
	 * Retrieve the icon data cached for a path.
	 *
	 * @param {String} path
	 * @return {Object}
	 */getPathIcon(path){const{icon}=this.getPathEntry(path);return icon?{priority:icon[0],index:icon[1],iconClass:icon[2]}:null}/**
	 * Determine if stored data exists for a given path.
	 *
	 * @param {String} path
	 * @return {Boolean}
	 */hasData(path){const entry=data.paths.get(path)||null;return!!(entry&&(entry.icon||entry.inode))}/**
	 * Determine if icon-related data exists for a given path.
	 *
	 * @param {String} path
	 * @return {Boolean}
	 */hasIcon(path){const entry=data.paths.get(path);return!!(entry&&entry.icon)}/**
	 * Store icon-related data for a path.
	 *
	 * @param {String} path
	 * @param {Object} iconData
	 * @param {Number} iconData.priority
	 * @param {Number} iconData.index
	 * @param {Array}  iconData.iconClass
	 */setPathIcon(path,iconData){iconData&&(this.getPathEntry(path).icon=[iconData.priority,iconData.index,iconData.iconClass])}/**
	 * Store the inode of a filesystem path.
	 *
	 * @param {String} path
	 * @param {Number} inode
	 */setPathInode(path,inode){if(!inode||locked)return;let entry=this.getPathEntry(path);// We're holding stale data. Shoot it.
entry.inode&&entry.inode!==inode&&(this.deletePath(path),entry=this.addPath(path)),entry.inode=inode}/**
	 * Delete any data being stored for a path.
	 *
	 * @param {String} path
	 */deletePath(path){data.paths.del(path)}/**
	 * Delete a path's cached icon.
	 *
	 * @param {String} path
	 */deletePathIcon(path){delete this.getPathEntry(path).icon}/**
	 * Block further changes to cached data.
	 *
	 * Stops strategies losing cached data when deactivating
	 * the package, or when closing the project window.
	 */lock(){locked=true}/**
	 * Wipe all cached data.
	 *
	 * Handler for a user-command. Not used internally.
	 * @public
	 */reset(){if(this.locked){return void atom.notifications.addError("Storage locked",{detail:"This shouldn't have happened. Please restart Atom."})}else{const{size}=this;data=this.createBlankCache(),atom.project.serialize();const plural=1===size?"":"s";atom.notifications.addInfo(`Cleared ${size} path${plural} from icon cache.`,{dismissable:true})}}/**
	 * Pointer to the hash which holds all cached data.
	 *
	 * @property {Object}
	 * @readonly
	 */get data(){return data}/**
	 * Whether the cache has been locked from modification.
	 *
	 * @property {Boolean}
	 * @readonly
	 */get locked(){return locked}/**
	 * Number of paths currently cached.
	 *
	 * @property {Number}
	 * @readonly
	 */get size(){return data.paths.length}}module.exports=new Storage;