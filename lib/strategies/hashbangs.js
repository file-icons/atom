"use strict";

const HeaderStrategy = require("./header-strategy.js");
const IconRegistry = require("../icon-registry.js");


class Hashbangs extends HeaderStrategy {
	
	init(){
		super.init();
		this.executableIcon = IconRegistry.matchInterpreter("sh");
	}
	
	
	examine(file){
		const icon = super.examine(file);
		
		// Valid hashbang, unrecognised interpreter
		if(null === icon){
			const {executable} = file;
			
			// Stats currently unavailable
			if(null === executable){
				const onStats = file.onDidLoadStats(stats => {
					onStats.dispose();
					if(file.executable)
						file.setIcon(this.executableIcon);
				});
			}
			
			else if(executable)
				file.setIcon(this.executableIcon);
		}
	}
	
	
	match(input){
		const result = input.match(/^#!(?:(?:\s*\S*\/|\s*(?=perl6?))(\S+))(?:(?:\s+\S+=\S*)*\s+(\S+))?/);
		if(!result) return false;
		
		const name = "env" === result[1]
			? result[2].split("/").pop()
			: result[1];
		
		return IconRegistry.matchInterpreter(name) || null;
	}
}


module.exports = new Hashbangs();
