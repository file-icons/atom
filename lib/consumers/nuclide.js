"use strict";

const IconTables = require("../icons/icon-tables.js");
const Consumer = require("./consumer.js");
const Options = require("../options.js");


class Nuclide extends Consumer {
	
	constructor(){
		super("nuclide");
	}
	
	
	/**
	 * Give Nuclide a static (undynamic) icon-class.
	 *
	 * @param {String} fileName
	 * @return {String}
	 */
	serveClass(fileName){
		let iconClass = "icon-file-text";
		try{
			const icon = IconTables.matchName(fileName) || {icon: iconClass};
			iconClass = icon.getClass(Options.colourMode);
		} finally{ return iconClass; }
	}
	
	
	/**
	 * Replace the function exported by Nuclide's `file-type-class.js`.
	 *
	 * Don't try this at home. Or anywhere.
	 */
	preempt(){
		const {lstatSync} = require("fs");
		const {join} = require("path");
		const pkgFile = "file-type-class.js";
		const oldFile = join(this.packagePath, "pkg", "commons-atom", pkgFile);
		lstatSync(oldFile); // Throw an error if file doesn't exist
		
		const newFile = join(__dirname, `nuclide-${pkgFile}`);
		require(newFile).setHandler(name => this.serveClass(name));
		!(oldFile in require.cache)
			? require.cache[oldFile] = Object.assign({}, require.cache[newFile])
			: atom.notifications.addInfo("Please restart Atom for Nuclide to show file-icons");
	}
}

module.exports = new Nuclide();
