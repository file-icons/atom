"use strict";

const path = require("path");

const FileRegistry = require("./lib/file-registry.js");
const IconRegistry = require("./lib/icon-registry.js");
const UI = require("./lib/ui.js");


module.exports = {

	activate(){
		this.defaultIconClass = atom.config.get("file-icons.defaultIconClass");
		this.coloured = atom.config.get("file-icons.coloured");
		
		FileRegistry.init();
		IconRegistry.init();
		UI.init();
		
		IconRegistry.load([
			require.resolve("./lib/.config.json")
		]);
	},
	
	deactivate(){
		FileRegistry.reset();
		IconRegistry.reset();
		UI.reset();
	},

	provideService(){ return this; },

	iconClassForPath(path, context = ""){
		const file = FileRegistry.get(path);
		const icon = file.getIcon();
		
		return icon
			? icon.getClass(this.coloured ? ~~this.ui.lightTheme : null)
			: this.defaultIconClass;
	}
};
