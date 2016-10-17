"use strict";

const Icon = require("./icon.js");


class IconRegistry{
	
	constructor(){
		this.reset();
	}
	
	reset(){
		this.directoryIcons = [];
		this.fileIcons      = [];
	}
	
	load(paths){
		for(const path of paths){
			if(!path) continue;
			
			const [dirIcons, fileIcons] = require(path);
			this.directoryIcons.push(...Icon.deserialise(dirIcons));
			this.fileIcons.push(...Icon.deserialise(fileIcons));
		}
	}
}


module.exports = new IconRegistry();
