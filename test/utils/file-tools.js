"use strict";

const fs     = require("fs");
const tmp    = require("tmp");
const path   = require("path");
const tmpDir = tmp.dirSync();

module.exports = {
	tmpDir,
	
	save(editor, filename){
		filename = path.join(tmpDir.name, filename);
		editor.saveAs(filename);
	},
	
	move(from, to){
		from = path.join(tmpDir.name, from);
		to   = path.join(tmpDir.name, to);
		fs.renameSync(from, to);
	}
};
