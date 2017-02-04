"use strict";

const FileSystem = require.resolve("../filesystem/filesystem.js");
const Storage = require.resolve("../storage.js");
const log = [];


module.exports = {
	get storage (){ return require(Storage)},
	get paths   (){ return this.fs.paths},
	get fs      (){ return require(FileSystem)},
	get log     (){ return Array.from(log)},
	get print   (){ return require("print")},
	
	
	/**
	 * Record and timestamp a hash of data.
	 * @param {Object} input
	 */
	logInfo(input){
		Object.defineProperty(input, "timestamp", {
			value: new Date(),
			writable: false,
			enumerable: false
		});
		log.push(input);
	},
	
	
	/**
	 * Include a file relative to package's base directory.
	 * 
	 * @example inc("lib/consumers/tree-view")
	 * @param {String} file
	 * @return {Object}
	 */
	inc(file){
		const {join} = require("path");
		const {path} = atom.packages.loadedPackages["file-icons"];
		return require(join(path, ...file.split(/[\\\/]+/g)));
	},
	
	
	/**
	 * Wrapper for {@link FileSystem.grep} optimised for console inspection.
	 * 
	 * @param {String|RegExp} name
	 * @return {Resource|Resource[]}
	 */
	grep(name){
		const results = require(FileSystem).grep(name);
		switch(results.length){
			case 0:  return null;       break;
			case 1:  return results[0]; break;
			default: return results;
		}
	},
};


Object.freeze(module.exports);
Object.defineProperty(global, "_FileIcons", {
	value: module.exports,
	enumerable:   true,
	configurable: false,
	writable:     false,
});
