"use strict";

const IconTables = require("../../icons/icon-tables.js");
const HeaderStrategy = require("./header-strategy.js");
const {taggedIcons} = IconTables;


class HashbangStrategy extends HeaderStrategy {
	
	constructor(){
		super({
			name: "hashbangs",
			priority: 5,
		});
	}
	
	
	getRemapping(icon){
		switch(icon){
			case taggedIcons.coffee:   return taggedIcons.coffeeTest;
			case taggedIcons.go:       return taggedIcons.goTest;
			case taggedIcons.haskell:  return taggedIcons.haskellTest;
			case taggedIcons.js:       return taggedIcons.jsTest;
			case taggedIcons.perl:     return taggedIcons.perlTest;
			case taggedIcons.python:   return taggedIcons.pythonTest;
			case taggedIcons.ruby:     return taggedIcons.rubyTest;
			case taggedIcons.rust:     return taggedIcons.rustTest;
			case taggedIcons.sh:       return taggedIcons.genericTest;
			case taggedIcons.ts:       return taggedIcons.tsTest;
		}
		return null;
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
		const remap = this.getRemapping(result);
		if(null !== remap && remap.match.test(resource.name))
			return remap;
		
		// Valid hashbang, unrecognised interpreter
		if(!result){
			const {executable} = resource;
			
			// Stats currently unavailable
			if(null === executable){
				const onStats = resource.onDidLoadStats(() => {
					onStats.dispose();
					if(resource.executable)
						resource.icon.add(taggedIcons.executable, this.priority);
				});
			}
			
			else if(executable)
				result = taggedIcons.executable;
		}
		
		return result || null;
	}
}


module.exports = new HashbangStrategy();
