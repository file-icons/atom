"use strict";

const IconTables = require("../../icons/icon-tables.js");
const HeaderStrategy = require("./header-strategy.js");
const {executableIcon} = IconTables;


class HashbangStrategy extends HeaderStrategy {
	
	constructor(){
		super({
			name: "hashbangs",
			priority: 5,
		});
		
		if(global.Test_ENV) {
			// HACK: Ad-hoc fix for tests with hashbangs (#812)
			this.testIcons = new Map([
				["coffee", ".test.coffee"],
				["go", ".test.go"],
				["haskell", ".test.hs"],
				["js", ".test.js"],
				["perl", ".t"],
				["python", ".test.py"],
				["ruby", ".test.rb"],
				["rust", ".test.rs"],
				["sh", "/t/1a.sh"],
				["ts", ".test.ts"],
			].map(([name, ext]) => [
				IconTables.matchLanguage(name),
				"/" === ext[0]
					? IconTables.matchPath(ext)
					: IconTables.matchName(ext),
			]));
		}
	}
	
	
	matchIcon(resource){
		const pattern = /^#!(?:(?:\s*\S*\/|\s*(?=perl6?))(\S+))(?:(?:\s+\S+=\S*)*\s+(\S+))?/;
		const tokens = null !== resource.data
			? this.getFirstLine(resource.data).match(pattern)
			: null;
		
		if(!tokens)
			return null;
		
		const name = "env" === tokens[1]
			? (tokens[2] || "").split("/").pop()
			:  tokens[1];
		
		// TypeScript source which compiles an executable Node file (#606)
		if("node" === name && /\.tsx?$/i.test(resource.name))
			return null;
		
		let result = IconTables.matchInterpreter(name);
		
		// HACK: Remap icons of test-files containing hashbangs (#812)
		if(result && this.testIcons.has(result)){
			const icon = this.testIcons.get(result);
			if(icon.match.test(icon.matchPath ? resource.path : resource.name))
				return icon;
		}
		
		// Valid hashbang, unrecognised interpreter
		if(!result){
			const {executable} = resource;
			
			// Stats currently unavailable
			if(null === executable){
				const onStats = resource.onDidLoadStats(() => {
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
