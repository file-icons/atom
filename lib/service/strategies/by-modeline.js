"use strict";

const HeaderStrategy = require("./header-strategy.js");
const IconTables     = require("../icon-service.js");


class ModelineStrategy extends HeaderStrategy {
	
	match(input){
		
		// Emacs
		let match = input.match(/-\*-(?:(?:(?!mode\s*:)[^:;]+:[^:;]+;)*\s*mode\s*:)?\s*([\w+-]+)\s*(?:;[^:;]+:[^:;]+?)*;?\s*-\*-/i);
		if(match && "fundamental" !== match[1])
			return IconTables.matchLanguage(match[1]) || null;
		
		// Vim
		match = input.match(/(?:(?:\s|^)vi(?:m[<=>]?\d+|m)?|[\t ]ex)(?=:(?=\s*set?\s[^\n:]+:)|:(?!\s*set?\s))(?:(?:\s|\s*:\s*)\w*(?:\s*=(?:[^\n\\\s]|\\.)*)?)*[\s:](?:filetype|ft|syntax)\s*=(\w+)(?=\s|:|$)/i);
		if(null != match)
			return IconTables.matchLanguage(match[1]) || null;
		
		return null;
	}
}


module.exports = new ModelineStrategy({
	priority: 5
});
