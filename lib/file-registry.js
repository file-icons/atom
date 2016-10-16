"use strict";

const {CompositeDisposable} = require("atom");
const File = require("./file.js");


class FileRegistry {
	
	constructor(){
		this.files = new Set();
		this.filesByPath = {};
		this.fileDisposables = new WeakMap();
	}
	
	destroy(){
		this.files.forEach(file => this.remove(file));
		this.fileDisposables = null;
		this.filesByPath = {};
	}
	
	
	add(path){
		const file = new File(path);
		
		const disposables = new CompositeDisposable();
		disposables.add(
			file.onDidDestroy(_=> this.remove(file)),
			file.onDidMove(_=> this.updatePath(file))
		);
		
		this.files.add(file);
		this.filesByPath[path] = file;		
		this.fileDisposables.set(file, disposables);
		return file;
	}
	
	
	get(path){
		const file = this.filesByPath[path];
		return file || this.add(path);
	}
	
	
	remove(file){
		const fd = this.fileDisposables.get(file);
		
		if(fd){
			fd.dispose();
			this.fileDisposables.delete(file);
		}
		
		file.destroy();
		this.filesByPath[file.path] = null;
		this.files.delete(file);
	}
}


module.exports = FileRegistry;
