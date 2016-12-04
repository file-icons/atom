"use strict";

const Storage        = require("./storage.js");
const Options        = require("./options.js");
const UI             = require("./ui.js");
const Consumers      = require("./consumers/all.js");
const FileRegistry   = require("./filesystem/file-registry.js");
const IconService    = require("./service/icon-service.js");


module.exports = {

	activate(state){
		Storage.init(state);
		Options.init();
		UI.init();
		Consumers.init();
		FileRegistry.init();
		UI.observe();
		IconService.init();
	},
	
	deactivate(){
		Storage.freeze();
		Consumers.reset();
		FileRegistry.reset();
		IconService.reset();
		UI.reset();
		Options.reset();
	},

	serialize(){ return Storage.data; },

	provideService(){ return IconService; }
};
