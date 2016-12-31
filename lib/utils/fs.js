"use strict";

const {nerf} = require("./general.js");
const fs = require("fs");

module.exports = {

	// Generate non-breaking fs functions
	lstat:     nerf(fs.lstatSync),
	realpath:  nerf(fs.realpathSync),


	/**
	 * Generate an instance of fs.Stats from an object.
	 *
	 * Instances of fs.Stats are returned unmodified.
	 *
	 * @param {Object} input
	 * @return {Stats}
	 */
	statify(input){
		if(!input) return null;
		
		if("function" === typeof input.isSymbolicLink)
			return input;
		
		const output = Object.create(fs.Stats.prototype);
		for(const key in input){
			const value = input[key];
			
			switch(key){
				case "atime":
				case "ctime":
				case "mtime":
				case "birthtime":
					output[key] = !(value instanceof Date)
						? new Date(value)
						: value;
					break;
				default:
					output[key] = value;
			}
		}
		
		return output;
	},


	/**
	 * Synchronously read a number of bytes from a file.
	 *
	 * @param {String} path   - Path to read from
	 * @param {Number} length - Maximum number of bytes to read
	 * @param {Number} offset - Offset to begin reading from
	 * @return {Array} An array of two values: the loaded data-string, and a
	 * boolean indicating if the file was small enough to be fully loaded.
	 */
	sampleFile(path, length, offset = 0){
		if(!path || length < 1)
			return [null, false];
		
		let data = Buffer.alloc(length);
		const fd = fs.openSync(path, "r");
		const bytesRead = fs.readSync(fd, data, 0, length, offset);
		
		let isComplete = false;
		
		data = data.toString();
		if(bytesRead < data.length){
			isComplete = true;
			data = data.substring(0, bytesRead);
		}
		
		return [data, isComplete];
	}
};
