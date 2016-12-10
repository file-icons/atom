"use strict";

const Strategy = require("../strategy.js");


/**
 * Abstract base-class for any strategy that matches file-data.
 *
 * @abstract
 * @class
 */
class HeaderStrategy extends Strategy {
	
	/**
	 * Configure a new HeaderStrategy subclass.
	 *
	 * @constructor
	 * @param {Object}  opts                     - An object defining the strategy's behaviour.
	 * @param {String}  [opts.name=""]           - Name used when serialising matched icons.
	 * @param {Number}  [opts.priority=0]        - Determines precedence over other strategies.
	 * @param {Boolean} [opts.ignoreBinary=true] - Avoid scanning non-textual/binary files
	 * @param {Number}  [opts.minScanSize=6]     - Minimum filesize that deems a file worth scanning.
	 * @param {Number}  [opts.maxScanSize=80]    - Maximum number of bytes to read from each file.
	 */
	constructor(opts = {}){
		const {
			name           = "",
			priority       = 0,
			ignoreBinary   = true,
			minScanSize    = 6,
			maxScanSize    = 80,
			noSetting      = false
		} = opts;
		
		super({
			name,
			priority,
			noSetting,
			matchesFiles: true,
			matchesDirs:  false
		});
		
		this.ignoreBinary = !!ignoreBinary;
		this.minScanSize  = +minScanSize;
		this.maxScanSize  = +maxScanSize;
	}
	
	
	check(resource, useExisting = true){
		if(this.needToScan(resource))
			resource.loadData(false, this.maxScanSize);
		return super.check(resource, useExisting);
	}
	
	
	/**
	 * Add handler to rerun strategy when files are modified.
	 *
	 * @param {Resource} resource - Resource to monitor
	 * @return {Boolean} False if the resource was already registered
	 * @override
	 */
	registerResource(resource){
		if(super.registerResource(resource)){
			const disposables = this.resourceEvents.get(resource);
			
			disposables.add(resource.onDidChangeData(change => {
				const from = this.getFirstLine(change.from);
				const to   = this.getFirstLine(change.to);
				if(from !== to)
					this.check(resource, false);
			}));
			
			return true;
		}
		
		else return false;
	}
	
	
	/**
	 * Extract the first line from a block of text.
	 *
	 * @param {String} input
	 * @return {String}
	 */
	getFirstLine(input){
		return input ? input.split(/\r?\n/).shift() : "";
	}
	
	
	/**
	 * Determine if a resource's data should be scanned.
	 *
	 * @param {Resource} file
	 * @return {Boolean}
	 */
	needToScan(file){
		return null === file.data
			&& (this.ignoreBinary || !this.isBinary(file))
			&& !file.unreadable
			&& !file.isVirtual
			&& file.size >= this.minScanSize;
	}
	
	
	/**
	 * Determine if a resource's data looks to be non-textual/binary.
	 *
	 * @param {Resource} resource
	 * @return {Boolean}
	 */
	isBinary(resource){
		const binaryTypes = /\.(?:exe|jpe?g|png|gif|bmp|py[co]|woff2?|ttf|ico|webp|zip|[tr]ar|gz|bz2)$/i;
		return resource.binary || binaryTypes.test(resource.name);
	}
}


module.exports = HeaderStrategy;
