"use strict";

const Options        = require("./options.js");
const UI             = require("./ui.js");
const Consumers      = require("./consumers/all.js");
const FileRegistry   = require("./filesystem/file-registry.js");
const IconService    = require("./service/icon-service.js");


module.exports = {

	activate(){
		Options.init();
		UI.init();
		Consumers.init();
		FileRegistry.init();
		UI.observe();
		IconService.init();
	},
	
	deactivate(){
		Consumers.reset();
		FileRegistry.reset();
		IconService.reset();
		UI.reset();
		Options.reset();
	},

	provideService(){ return IconService; }
};
