"use strict";

const Icon = require("./icon.js");


class IconRegistry{
	
	init(){
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
	
	
	matchLanguage(name){
		for(const icon of this.fileIcons)
			if(icon.lang && icon.lang.test(name))
				return icon;
		return null;
	}
	
	
	matchScope(name){
		for(const icon of this.fileIcons)
			if(icon.scope && icon.scope.test(name))
				return icon;
		return null;
	}
	
	
	matchInterpreter(name){
		for(const icon of this.fileIcons)
			if(icon.interpreter && icon.interpreter.test(name))
				return icon;
		return null;
	}
}


module.exports = new IconRegistry();
