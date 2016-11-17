"use strict";

const {CompositeDisposable, Disposable} = require("atom");
const File = require("./file.js");
const UI = require("./ui.js");


class FileRegistry {
	
	init(){
		this.files = new Map();
		this.disposables = new CompositeDisposable(
			UI.onOpenFile(editor => this.get(editor.getPath()).addEditor(editor)),
			UI.onSaveNewFile(args => this.get(args.file).addEditor(args.editor))
		);
	}
	
	
	reset(){
		this.disposables.dispose();
		this.files.forEach(file => file.destroy());
		this.files = null;
		this.disposables = null;
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
				new Disposable(() => this.files.delete(path))
			);
			
			return file;
		}
	}


	fixPath(oldPath, newPath){
		const file = this.files.get(oldPath);
		this.files.delete(oldPath);
		this.files.set(newPath, file);
	}
}


module.exports = new FileRegistry();
