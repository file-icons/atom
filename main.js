"use strict";

const path = require("path");

const FileRegistry = require("./lib/file-registry.js");
const IconRegistry = require("./lib/icon-registry.js");
const UI = require("./lib/ui.js");


module.exports = {

	activate(){
		this.fileRegistry = new FileRegistry();
		this.iconRegistry = new IconRegistry();
		this.ui = new UI();
		
		this.iconRegistry.load([
			require.resolve("./lib/.config.json")
		]);
	},
	
	deactivate(){
		if(this.fileRegistry){
			this.fileRegistry.destroy();
			this.fileRegistry = null;
		}
		
		if(this.iconRegistry){
			this.iconRegistry.destroy();
			this.iconRegistry = null;
		}
		
		if(this.ui){
			this.ui.destroy();
			this.ui = null;
		}
	},

	provideService(){ return this; },
	
	onWillDeactivate(){},
	
	iconClassForPath(path, context = ""){
		const file = this.fileRegistry.get(path);
		if(/package\.json$/.test(path))
			return "npm-icon";
		return "js-icon";
	}
};
