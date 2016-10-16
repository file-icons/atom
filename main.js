"use strict";

const FileRegistry = require("./lib/file-registry.js");


module.exports = {

	activate(){
		this.fileRegistry = new FileRegistry();
	},
	
	deactivate(){
		if(this.fileRegistry){
			this.fileRegistry.destroy();
			this.fileRegistry = null;
		}
	},

	provideService(){ return this; },
	
	onWillDeactivate(){},
	
	iconClassForPath(path, context = ""){
		const file = this.fileRegistry.get(path);
		return "icon-file-text";
	}
};
