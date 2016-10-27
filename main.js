"use strict";

const path = require("path");

const FileRegistry = require("./lib/file-registry.js");
const IconRegistry = require("./lib/icon-registry.js");
const UI = require("./lib/ui.js");


module.exports = {

	activate(){
		this.defaultIconClass = atom.config.get("file-icons.defaultIconClass");
		this.coloured = atom.config.get("file-icons.coloured");
		this.ui = new UI();
		
		FileRegistry.init();
		IconRegistry.init();
		
		IconRegistry.load([
			require.resolve("./lib/.config.json")
		]);
	},
	
	deactivate(){
		if(this.ui){
			this.ui.destroy();
			this.ui = null;
		}
		
		FileRegistry.reset();
		IconRegistry.reset();
	},

	provideService(){ return this; },
	
	onWillDeactivate(){},
	
	iconClassForPath(path, context = ""){
		const file = FileRegistry.get(path);
		const icon = file.getIcon();
		
		return icon
			? icon.getClass(this.coloured ? ~~this.ui.lightTheme : null)
			: this.defaultIconClass;
	}
};
