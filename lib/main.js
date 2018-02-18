"use strict";

const Storage        = require("./storage.js");
const Options        = require("./options.js");
const UI             = require("./ui.js");
const AutoCompiler   = require("./icons/auto-compiler.js");
const IconService    = require("./service/icon-service.js");


module.exports = {

	activate(state){
		Storage.init(state);
		Options.init();
		UI.init();
		UI.observe();
		AutoCompiler.init();
		IconService.init();
		require("./debug.js");
	},
	
	deactivate(){
		Storage.lock();
		IconService.reset();
		AutoCompiler.reset();
		UI.reset();
		Options.reset();
	},

	serialize(){ return Storage.data; },

	provideService(){ return IconService.addIconToElement; },
	
	suppressFOUC(){ return IconService.suppressFOUC(); }
};
