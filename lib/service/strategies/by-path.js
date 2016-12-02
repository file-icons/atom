"use strict";

const IconTables = require("../icon-tables.js");
const Strategy   = require("./strategy.js");


class PathStrategy extends Strategy {
	
	matchFile(file){
		const path = file.realPath || file.path;
		const name = file.name;
		
		for(const icon of IconTables.fileIcons){
			if(icon.matchPath && icon.match.test(path))
				return icon;
			else if(icon.match.test(name))
				return icon;
		}
		return null;
	}
	
	
	matchDirectory({path, name}){
		for(const icon of IconTables.directoryIcons){
			if(icon.matchPath && icon.match.test(path))
				return icon;
			else if(icon.match.test(name))
				return icon;
		}
		return null;
	}
}


module.exports = new PathStrategy({
	priority: 0,
	matchesFiles: true,
	matchesDirs: true
});
