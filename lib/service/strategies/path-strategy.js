"use strict";

const IconTables = require("../icon-tables.js");
const Strategy = require("../strategy.js");


class PathStrategy extends Strategy {

	constructor(){
		super({
			priority:     0,
			matchesFiles: true,
			matchesDirs:  true
		});
	}
	
	
	matchIcon(resource){
		if(resource.isDirectory){
			const {path, name} = resource;
			
			for(const icon of IconTables.directoryIcons)
				if((icon.matchPath && icon.match.test(path)) || icon.match.test(name))
					return icon;
			
			return null;
		}
		
		else{
			const {name} = resource;
			const path = resource.realPath || resource.path;
			
			for(const icon of IconTables.fileIcons)
				if((icon.matchPath && icon.match.test(path)) || icon.match.test(name))
					return icon;
			
			return null;
		}
	}
}


module.exports = new PathStrategy();
