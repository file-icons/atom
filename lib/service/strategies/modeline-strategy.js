"use strict";

const HeaderStrategy = require("./header-strategy.js");
const IconTables = require("../../icons/icon-tables.js");


class ModelineStrategy extends HeaderStrategy {
	
	constructor(){
		super({
			name: "modelines",
			priority: 6
		});
	}
	
	
	matchIcon(resource){
		const data = this.getFirstLine(resource.data) || null;
		
		if(null === data)
			return null;
		
		// Emacs
		let tokens = data.match(/-\*-(?:(?:(?!mode\s*:)[^:;]+:[^:;]+;)*\s*mode\s*:)?\s*([\w+-]+)\s*(?:;[^:;]+:[^:;]+?)*;?\s*-\*-/i);
		if(tokens && "fundamental" !== tokens[1])
			return IconTables.matchLanguage(tokens[1]) || null;
		
		// Vim
		tokens = data.match(/(?:(?:\s|^)vi(?:m[<=>]?\d+|m)?|[\t ]ex)(?=:(?=\s*set?\s[^\n:]+:)|:(?!\s*set?\s))(?:(?:\s|\s*:\s*)\w*(?:\s*=(?:[^\n\\\s]|\\.)*)?)*[\s:](?:filetype|ft|syntax)\s*=(\w+)(?=\s|:|$)/i);
		if(tokens)
			return IconTables.matchLanguage(tokens[1]) || null;
		
		return null;
	}
}


module.exports = new ModelineStrategy();
