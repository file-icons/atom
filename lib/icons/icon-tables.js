"use strict";

const Icon = require("./icon.js");


/**
 * Interface providing access to the package's databases.
 *
 * @property {Array} directoryIcons - Icons to match directory-type resources.
 * @property {Array} fileIcons - Icons to match file resources.
 * @class
 */
class IconTables{
	
	constructor(){
		const data = require("./.icondb.js");
		this.directoryIcons = this.read(data[0]);
		this.fileIcons      = this.read(data[1]);
	}
	
	
	/**
	 * Populate icon-lists from a compiled data table.
	 *
	 * @param {Array} table
	 * @return {Object}
	 * @private
	 */
	read(table){
		let [icons, indexes] = table;
		icons = icons.map((i, offset) => new Icon(offset, ...i));
		
		// Dereference Icon instances from their stored offset
		indexes = indexes.map(index => index.map(offset => icons[offset]));
		
		const [
			byInterpreter,
			byLanguage,
			byPath,
			byScope,
			bySignature
		] = indexes;
		
		return {
			byName: icons,
			byInterpreter,
			byLanguage,
			byPath,
			byScope,
			bySignature
		};
	}
	
	
	/**
	 * Match an icon using a resource's basename.
	 *
	 * @param {String} name - Name of filesystem entity
	 * @param {Boolean} [directory=false] - Match folders instead of files
	 * @return {Icon}
	 */
	matchName(name, directory = false){
		const icons = directory ? this.directoryIcons : this.fileIcons;
		for(const icon of icons.byName)
			if(icon.match.test(name))
				return icon;
		return null;
	}
	
	
	/**
	 * Match an icon using a resource's system path.
	 *
	 * @param {String} path - Full pathname to check
	 * @param {Boolean} [directory=false] - Match folders instead of files
	 * @return {Icon}
	 */
	matchPath(path, directory = false){
		const icons = directory ? this.directoryIcons : this.fileIcons;
		for(const icon of icons.byPath)
			if(icon.match.test(path))
				return icon;
		return null;
	}
	
	
	/**
	 * Match an icon using the human-readable form of its related language.
	 *
	 * Typically used for matching modelines and Linguist-language attributes.
	 *
	 * @example IconTables.matchLanguage("JavaScript")
	 * @param {String} name - Name/alias of language
	 * @return {Icon}
	 */
	matchLanguage(name){
		for(const icon of this.fileIcons.byLanguage)
			if(icon.lang.test(name))
				return icon;
		return null;
	}
	
	
	/**
	 * Match an icon using the grammar-scope assigned to it.
	 *
	 * @example IconTables.matchScope("source.js")
	 * @param {String} name
	 * @return {Icon}
	 */
	matchScope(name){
		for(const icon of this.fileIcons.byScope)
			if(icon.scope.test(name))
				return icon;
		return null;
	}
	
	
	/**
	 * Match an icon using the name of an interpreter which executes its language.
	 *
	 * Used for matching interpreter directives (a.k.a., "hashbangs").
	 *
	 * @example IconTables.matchInterpreter("bash")
	 * @param {String} name
	 * @return {Icon}
	 */
	matchInterpreter(name){
		for(const icon of this.fileIcons.byInterpreter)
			if(icon.interpreter.test(name))
				return icon;
		return null;
	}
	
	
	/**
	 * Match an icon using a resource's file signature.
	 *
	 * @example IconTables.matchSignature("\x1F\x8B")
	 * @param {String} data
	 * @return {Icon}
	 */
	matchSignature(data){
		for(const icon of this.fileIcons.bySignature)
			if(icon.signature.test(data))
				return icon;
		return null;
	}
}


module.exports = new IconTables();
