"use strict";

const fs = require("fs");

module.exports = function(jobs){
	for(const job of jobs)
		exec(...job);
};


const OP_DATA = 0b001;
const OP_STAT = 0b010;
const OP_REAL = 0b100;

module.exports.op = {
	data: OP_DATA,
	stat: OP_STAT,
	realpath: OP_REAL,
	[OP_DATA]: "data",
	[OP_STAT]: "stat",
	[OP_REAL]: "realpath"
};


/**
 * Synchronously execute filesystem operations for a path.
 *
 * @param {String} path - Path to the resource
 * @param {Number} ops  - A bitmask of OP_* constants
 * @param {Object} meta - Metadata attached to request
 * @private
 */
function exec(path, ops, meta = {}){
	let fd = null;
	let op = 0;
	
	try{
		fd = fs.openSync(path, "r");
		
		if(OP_DATA & ops){
			op = OP_DATA;
			const results = read(fd, meta.limit);
			emit("op:done", OP_DATA, path, results);
		}
		
		let stats = null;
		if(OP_STAT & ops){
			op = OP_STAT;
			stats = fs.lstatSync(path);
			emit("op:done", OP_STAT, path, stats);
		}
		
		if(OP_REAL & ops){
			op = OP_REAL;
			const unneeded = stats && !stats.isSymbolicLink();
			const realPath = unneeded ? null : readlink(path);
			emit("op:done", OP_REAL, path, realPath);
		}
	}
	
	catch(error){
		emit("op:error", op, path, error);
	}
	
	finally{
		fd && fs.closeSync(fd);
	}
}


/**
 * Synchronously scan a file's content.
 *
 * @param {Number} fd - File descriptor
 * @param {Number} limit - Bytes to read
 * @return {Array}
 * @private
 */
function read(fd, limit = 80){
	let data = Buffer.alloc(limit);
	const bytesRead = fs.readSync(fd, data, 0, limit);
	data = data.toString();
	
	let isComplete = false;
	
	// File's small enough to have been completely loaded
	if(bytesRead < data.length){
		isComplete = true;
		
		// Strip null-bytes padding short file-chunks
		data = data.replace(/\x00+$/, "");
	}
	
	return [data, isComplete];
}


/**
 * Call fs.readlinkSync on a path, silencing any errors.
 *
 * @param {String} path
 * @return {String|null}
 * @private
 */
function readlink(path){
	let result = null;
	try{
		result = fs.readlinkSync(path);
	}
	finally{
		return result;
	}
}
