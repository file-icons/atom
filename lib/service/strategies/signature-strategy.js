"use strict";

const HeaderStrategy = require("./header-strategy.js");
const IconTables = require("../../icons/icon-tables.js");
const Options = require("../../options.js");


class SignatureStrategy extends HeaderStrategy {
	
	constructor(){
		super({
			name:         "signature",
			priority:     0,
			minScanSize:  1,
			ignoreBinary: false,
			noSetting:    true
		});
	}
	
	
	/**
	 * Avoid scanning if header-recognition is disabled.
	 *
	 * @param {Resource} file
	 * @return {Boolean}
	 */
	needToScan(file){
		return (Options.hashbangs || Options.modelines)
			? super.needToScan(file)
			: false;
	}
	
	
	matchIcon(resource){
		const {data} = resource;
		return data
			? IconTables.matchSignature(data)
			: null;
	}
}


module.exports = new SignatureStrategy();
