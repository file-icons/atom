"use strict";

const IconTables = require("../../icons/icon-tables.js");
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
		let icon = null;
		
		if(resource.isDirectory)
			return icon =
				IconTables.matchPath(resource.path, true) ||
				IconTables.matchName(resource.name, true) ||
				null;
		
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
			
			icon =
				IconTables.matchPath(path) ||
				IconTables.matchName(name) ||
				null;
			
			if(isFiltered && (null === icon || icon.priority < 1))
				icon = IconTables.matchName(resource.name);
			
			return icon || null;
		}
	}
	
	
	filter(path){
		return path
			.replace(/~(?:orig|previous)$/, "")
			.replace(/^([^.]*\.[^.]+)\.(?:inc?|dist|tm?pl|te?mp|ti?dy)$/i, "$1");
	}
}


module.exports = new PathStrategy();
