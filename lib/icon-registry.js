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
	
	
	matchFile({path, name}){
		for(const icon of this.fileIcons){
			if(icon.matchPath && icon.match.test(path))
				return icon;
			else if(icon.match.test(name))
				return icon;
		}
		return null;
	}
	
	
	matchDirectory({path, name}){
		for(const icon of this.directoryIcons){
			if(icon.matchPath && icon.match.test(path))
				return icon;
			else if(icon.match.test(name))
				return icon;
		}
		return null;
	}
}


module.exports = new IconRegistry();
