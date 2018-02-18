"use strict";

const Options = require.resolve("./options.js");
const Storage = require.resolve("./storage.js");

const log = [];


module.exports = {
	get options (){ return require(Options)},
	get storage (){ return require(Storage)},
	get paths   (){ return this.fs.paths},
	get fs      (){ return require("atom-fs")},
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
	 * @example inc("lib/debug") === this
	 * @param {String} file
	 * @return {Object}
	 */
	inc(file){
		const {join} = require("path");
		const {path} = atom.packages.loadedPackages["file-icons"];
		return require(join(path, ...file.split(/[\\/]+/g)));
	},
	
	
	/**
	 * Wrapper for {@link FileSystem.grep} optimised for console inspection.
	 * 
	 * @param {String|RegExp} name
	 * @return {Resource|Resource[]}
	 */
	grep(name){
		const results = global.AtomFS.grep(name);
		switch(results.length){
			case 0:  return null;
			case 1:  return results[0];
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
