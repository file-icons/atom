"use strict";

const Storage        = require("./storage.js");
const Options        = require("./options.js");
const UI             = require("./ui.js");
const Consumers      = require("./consumers/all.js");
const AutoCompiler   = require("./icons/auto-compiler.js");
const FileRegistry   = require("./filesystem/file-registry.js");
const IconService    = require("./service/icon-service.js");


module.exports = {

	activate(state){
		Storage.init(state);
		Options.init();
		UI.init();
		FileRegistry.init();
		Consumers.init();
		UI.observe();
		AutoCompiler.init();
		IconService.init();
	},
	
	deactivate(){
		Storage.lock();
		Consumers.reset();
		FileRegistry.reset();
		IconService.reset();
		AutoCompiler.reset();
		UI.reset();
		Options.reset();
	},

	serialize(){ return Storage.data; },

	provideService(){ return IconService; }
};
