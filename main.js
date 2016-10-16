"use strict";

const FileRegistry = require("./lib/file-registry.js");
const UI = require("./lib/ui.js");


module.exports = {

	activate(){
		this.fileRegistry = new FileRegistry();
		this.ui = new UI();
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
