"use strict";

const IconRegistry = require("../icon-registry.js");
const Strategy     = require("./strategy.js");


class PathStrategy extends Strategy {
	
	constructor(){
		super({
			matchesDirectories: true,
			matchesFiles: true
		});
	}
	
	
	matchFile(file){
		const path = file.realPath || file.path;
		const name = file.name;
		
		for(const icon of IconRegistry.fileIcons){
			if(icon.matchPath && icon.match.test(path))
				return icon;
			else if(icon.match.test(name))
				return icon;
		}
		return null;
	}
	
	
	matchDirectory({path, name}){
		for(const icon of IconRegistry.directoryIcons){
			if(icon.matchPath && icon.match.test(path))
				return icon;
			else if(icon.match.test(name))
				return icon;
		}
		return null;
	}
}


module.exports = new PathStrategy();
