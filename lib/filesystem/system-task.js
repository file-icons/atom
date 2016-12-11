"use strict";

const fs = require("fs");

module.exports = function(jobs){
	for(const job of jobs)
		exec(...job);
};


const OP_OPEN = 0b000;
const OP_DATA = 0b001;
const OP_STAT = 0b010;
const OP_REAL = 0b100;

module.exports.op = {
	open: OP_OPEN,
	data: OP_DATA,
	stat: OP_STAT,
	real: OP_REAL,
	[OP_OPEN]: {id: "open", name: "Open"},
	[OP_DATA]: {id: "data", name: "Data"},
	[OP_STAT]: {id: "stat", name: "Stats"},
	[OP_REAL]: {id: "real", name: "Realpath"}
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
	let op = OP_OPEN;
	
	try{
		fd = fs.openSync(path, "r");
		
		if(OP_DATA & ops){
			op = OP_DATA;
			const results = meta.readLink
				? [fs.readlinkSync(path), true]
				: meta.limit
					? read(fd, meta.limit)
					: [fs.readFileSync(path, "utf8"), true];
			emit("op:done", op, path, results);
		}
		
		let stats = null;
		if(OP_STAT & ops){
			op = OP_STAT;
			stats = fs.lstatSync(path);
			emit("op:done", op, path, stats);
		}
		
		if(OP_REAL & ops){
			op = OP_REAL;
			const result = fs.realpathSync(path);
			emit("op:done", op, path, result);
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
