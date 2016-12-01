"use strict";

const {CompositeDisposable, Disposable, Emitter} = require("atom");
const File = require("./file.js");
const UI = require("./ui.js");


class FileRegistry {
	
	init(){
		this.files = new Map();
		this.emitter = new Emitter();
		this.disposables = new CompositeDisposable(
			UI.onOpenFile(editor => this.get(editor.getPath()).addEditor(editor)),
			UI.onSaveNewFile(args => this.get(args.file).addEditor(args.editor))
		);
	}
	
	
	reset(){
		this.disposables.dispose();
		this.emitter.dispose();
		this.files.forEach(file => file.destroy());
		this.files = null;
		this.emitter = null;
		this.disposables = null;
	}
	
	
	observe(fn){
		const output = this.emitter.on("did-register", fn);
		this.files.forEach(file => this.emitter.emit("did-register", file));
		return output;
	}
	
	
	get(path){
		const file = this.files.get(path);
		
		if(file)
			return file;
		
		else{
			const file = new File(path);
			this.files.set(path, file);
			
			const disposables = new CompositeDisposable(
				file.onDidDestroy(() => disposables.dispose()),
				file.onDidMove(paths => this.fixPath(paths.from, path.to)),
				file.onDidChangeRealPath(path => this.makeSymlink(file, path.to)),
				new Disposable(() => this.files.delete(path))
			);
			
			this.emitter.emit("did-register", file);
			return file;
		}
	}


	fixPath(oldPath, newPath){
		const file = this.files.get(oldPath);
		this.files.delete(oldPath);
		this.files.set(newPath, file);
	}
	
	
	makeSymlink(link, targetPath){
		const target = this.get(targetPath);
		link.setRealFile(target);
	}
}


module.exports = new FileRegistry();
