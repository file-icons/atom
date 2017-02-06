"use strict";

const FileSystem     = require.resolve("../filesystem/filesystem.js");
const ArchiveView    = require.resolve("../consumers/archive-view.js");
const FindAndReplace = require.resolve("../consumers/find-and-replace.js");
const FuzzyFinder    = require.resolve("../consumers/fuzzy-finder.js");
const Tabs           = require.resolve("../consumers/tabs.js");
const TreeView       = require.resolve("../consumers/tree-view.js");
const Options        = require.resolve("../options.js");
const Storage        = require.resolve("../storage.js");

const log = [];


module.exports = {
	get options (){ return require(Options)},
	get storage (){ return require(Storage)},
	get paths   (){ return this.fs.paths},
	get fs      (){ return require(FileSystem)},
	get log     (){ return Array.from(log)},
	get print   (){ return require("print")},
	
	// Consumer classes
	get archiveView    (){ return require(ArchiveView)},
	get findAndReplace (){ return require(FindAndReplace)},
	get fuzzyFinder    (){ return require(FuzzyFinder)},
	get tabs           (){ return require(Tabs)},
	get treeView       (){ return require(TreeView)},
	
	
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
