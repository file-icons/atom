"use strict";

/**
 * Filesystem entity type.
 *
 * Values correspond to the bitmasks used by `fs.constants`.
 *
 * @enum {Number}
 * @readonly
 */
const EntityType = {
	ALL:              0xF000,
	BLOCK_DEVICE:     0x6000,
	CHARACTER_DEVICE: 0x2000,
	DIRECTORY:        0x4000,
	DOOR:             0xD000,
	FIFO:             0x1000,
	FILE:             0x8000,
	SOCKET:           0xC000,
	SYMLINK:          0xA000
};

/**
 * Return an EntityType constant using its English name.
 *
 * @param {String} input
 * @return {EntityType}
 */
EntityType.fromString = function(input){
	input = (input + "")
		.replace(/\W+/g, "")
		.toLowerCase();
	
	switch(input){
		default:                  return null;
		case "all": case "any":   return EntityType.ALL;
		case "blockdevice":       return EntityType.BLOCK_DEVICE;
		case "characterdevice":   return EntityType.CHARACTER_DEVICE;
		case "directory":         return EntityType.DIRECTORY;
		case "door":              return EntityType.DOOR;
		case "file":              return EntityType.FILE;
		case "socket":            return EntityType.SOCKET;
		
		case "pipe":
		case "fifo":
		case "namedpipe":
			return EntityType.FIFO;
		
		case "symlink":
		case "link":
		case "symboliclink":
			return EntityType.SYMLINK;
	}
};

module.exports = EntityType;
