"use strict";

const FileSystem = require.resolve("../filesystem/filesystem.js");
const Storage = require.resolve("../storage.js");
const log = [];


module.exports = {
	get storage (){ return require(Storage)},
	get fs      (){ return require(FileSystem)},
	get log     (){ return Array.from(log)},
	
	
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
	 * Find the first {Resource} that matches a path-string.
	 * 
	 * @param {String|RegExp} name
	 * @return {Resource|Resource[]}
	 */
	grep(name){
		const {isRegExp} = require("../utils/general.js");
		const FileSystem = require("../filesystem/filesystem.js");
		const pattern = isRegExp(name) ? name : new RegExp(name + "$", "i");
		for(const [path, resource] of FileSystem.paths)
			if(name.test(path)) return file;
		return null;
	}
};


Object.freeze(module.exports);
Object.defineProperty(global, "_FileIcons", {
	value: module.exports,
	enumerable:   true,
	configurable: false,
	writable:     false,
});
