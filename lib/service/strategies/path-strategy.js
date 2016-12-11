"use strict";

const IconTables = require("../icon-tables.js");
const Strategy = require("../strategy.js");


class PathStrategy extends Strategy {

	constructor(){
		super({
			priority:      1,
			matchesFiles:  true,
			matchesDirs:   true,
			noSetting:     true,
			ignoreVirtual: false
		});
	}
	
	
	registerResource(resource){
		if(super.registerResource(resource)){
			const disposables = this.resourceEvents.get(resource);
			disposables.add(resource.onDidMove(paths => this.check(resource, false)));
			this.resourceEvents.set(resource, disposables);
			return true;
		}
		else return false;
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
			let name = resource.name;
			let path = resource.realPath || resource.path;
			
			let isFiltered = false;
			const filtered = this.filter(name) || name;
			if(filtered !== name){
				isFiltered = true;
				name = filtered;
				path = this.filter(path);
			}
			
			for(const icon of IconTables.fileIcons)
				if(icon.matchPath && icon.match.test(path)
				|| icon.match.test(name)
				|| isFiltered && icon.match.test(resource.name))
					return icon;
			
			return null;
		}
	}
	
	
	filter(path){
		return path
			.replace(/~(?:orig|previous)$/, "")
			.replace(/\.(?:inc?|dist|tm?pl)$/i, "");
	}
}


module.exports = new PathStrategy();
