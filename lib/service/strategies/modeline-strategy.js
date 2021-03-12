"use strict";

const HeaderStrategy = require("./header-strategy.js");
const IconTables = require("../../icons/icon-tables.js");


class ModelineStrategy extends HeaderStrategy {
	
	constructor(){
		super({
			name: "modelines",
			priority: 6,
		});
	}
	
	
	matchIcon(resource){
		const data = this.getFirstLine(resource.data, 2) || null;
		
		if(null === data)
			return null;
		
		// Emacs
		let tokens = data.match(/-\*-(?:[ \t]*(?=[^:;\s]+[ \t]*-\*-)|(?:.*?[ \t;]|(?<=-\*-))[ \t]*mode[ \t]*:[ \t]*)([^:;\s]+)(?=[ \t;]|(?<![-*])-\*-).*?-\*-/i);
		if(tokens && "fundamental" !== tokens[1])
			return IconTables.matchLanguage(tokens[1]) || null;
		
		// Vim
		tokens = data.match(/(?:(?:^|[ \t])(?:vi|Vi(?=m))(?:m[<=>]?[0-9]+|m)?|[ \t]ex)(?=:(?=[ \t]*set?[ \t][^\r\n:]+:)|:(?![ \t]*set?[ \t]))(?:(?:[ \t]*:[ \t]*|[ \t])\w*(?:[ \t]*=(?:[^\\\s]|\\.)*)?)*[ \t:](?:filetype|ft|syntax)[ \t]*=(\w+)(?=$|\s|:)/i);
		if(tokens)
			return IconTables.matchLanguage(tokens[1]) || null;
		
		return null;
	}
}


module.exports = new ModelineStrategy();
