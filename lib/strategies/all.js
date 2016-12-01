"use strict";

const Hashbangs = require("./hashbangs.js");
const Modelines = require("./modelines.js");


module.exports = {
	
	init(){
		Hashbangs.init();
		Modelines.init();
	},
	
	
	reset(){
		Hashbangs.reset();
		Modelines.reset();
	}
};
