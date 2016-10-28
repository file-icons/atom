"use strict";

const {CompositeDisposable} = require("atom");
const File = require("./file.js");


class FileRegistry {
	
	init(){
		this.files = new Set();
		this.filesByPath = {};
		
		this.atomDisposables   = new CompositeDisposable();
		this.fileDisposables   = new WeakMap();
		
		this.atomDisposables.add(
			atom.workspace.observeTextEditors(editor => {
				const path = editor.buffer.getPath();
				
				// Blank editor
				if(!path){
					const cd = new CompositeDisposable();
					
					cd.add(
						editor.onDidDestroy(_=> cd.dispose()),
						editor.onDidChangePath(file => {
							cd.dispose();
							this.get(file).linkEditor(editor);
						})
					);
				}
				
				// Existing file
				else this.get(path).linkEditor(editor);
			})
		);
	}
	
	reset(){
		this.files.forEach(file => this.remove(file));
		this.fileDisposables = null;
		this.filesByPath = {};
		this.atomDisposables.dispose();
		this.atomDisposables = null;
	}
	
	
	add(path){
		const file = new File(path);
		
		const disposables = new CompositeDisposable();
		disposables.add(
			file.onDidDestroy(  _=> this.remove(file)),
			file.onDidMove(paths => this.updatePath(file, paths))
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


	updatePath(file, {from, to}){
		this.filesByPath[from] = null;
		this.filesByPath[to] = file;
	}
}


module.exports = new FileRegistry();
