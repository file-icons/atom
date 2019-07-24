"use strict";

module.exports = {
	bail: !AtomMocha.isCI,
	require: ["chai/register-should"],
	slow: 9999,
	specPattern: /[\\\/]\d+-\w+\.js$/,
	
	afterStart(){
		this.bail && AtomMocha.runner.on("fail", () => {
			const {remote} = require("electron");
			if(remote.getCurrentWebContents().isDevToolsOpened())
				debugger;
		});
	},
};
