"use strict";

const path = require("path");

const FileRegistry = require("./lib/file-registry.js");
const IconRegistry = require("./lib/icon-registry.js");
const UI = require("./lib/ui.js");


module.exports = {

	activate(){
		this.defaultIconClass = atom.config.get("file-icons.defaultIconClass");
		this.coloured = atom.config.get("file-icons.coloured");
		
		this.fileRegistry = new FileRegistry();
		this.iconRegistry = IconRegistry;
		this.ui = new UI();
		
		IconRegistry.load([
			require.resolve("./lib/.config.json")
		]);
	},
	
	deactivate(){
		if(this.fileRegistry){
			this.fileRegistry.destroy();
			this.fileRegistry = null;
		}
		
		if(this.ui){
			this.ui.destroy();
			this.ui = null;
		}
		
		IconRegistry.reset();
	},

	provideService(){ return this; },
	
	onWillDeactivate(){},
	
	iconClassForPath(path, context = ""){
		const file = this.fileRegistry.get(path);
		const icon = file.getIcon();
		
		return icon
			? icon.getClass(this.coloured ? ~~this.ui.lightTheme : null)
			: this.defaultIconClass;
	}
};
