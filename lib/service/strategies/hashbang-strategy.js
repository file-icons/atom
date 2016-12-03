"use strict";

const {getFirstLine} = require("../../utils.js");
const IconTables = require("../icon-tables.js");
const Strategy = require("../strategy.js");
const executableIcon = IconTables.matchInterpreter("sh");


class HashbangStrategy extends Strategy {
	
	constructor(){
		super({
			name:         "hashbangs",
			priority:     4,
			matchesFiles: true,
			matchesDirs:  false,
			usesFileData: true
		});
	}
	
	
	matchIcon(resource){
		const pattern = /^#!(?:(?:\s*\S*\/|\s*(?=perl6?))(\S+))(?:(?:\s+\S+=\S*)*\s+(\S+))?/;
		const tokens = null !== resource.data
			? getFirstLine(resource.data).match(pattern)
			: null;
		
		if(!tokens)
			return null;
		
		const name = "env" === tokens[1]
			? tokens[2].split("/").pop()
			: tokens[1];
		
		let result = IconTables.matchInterpreter(name);
		
		// Valid hashbang, unrecognised interpreter
		if(!result){
			const {executable} = resource;
			
			// Stats currently unavailable
			if(null === executable){
				const onStats = resource.onDidLoadStats(stats => {
					onStats.dispose();
					if(resource.executable)
						resource.icon.add(executableIcon, this.priority);
				});
			}
			
			else if(executable)
				result = executableIcon;
		}
		
		return result || null;
	}
}


module.exports = new HashbangStrategy();
