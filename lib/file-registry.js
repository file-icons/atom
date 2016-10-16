"use strict";

const {CompositeDisposable} = require("atom");
const File = require("./file.js");


class FileRegistry {
	
	constructor(){
		this.disposables = new CompositeDisposable();
		this.filesByPath = {};
		this.files = new Set();
	}
	
	destroy(){
		this.files.forEach(file => file.destroy());
		this.disposables.dispose();
		this.filesByPath = {};
	}
	
	
	get(path){
		let file = this.filesByPath[path];
		if(file)
			return file;
		
		file = new File(path);
		this.files.add(file);
		this.filesByPath[path] = file;
		return file;
	}
}


module.exports = FileRegistry;
