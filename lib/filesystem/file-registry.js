"use strict";

const {CompositeDisposable, Disposable, Emitter} = require("atom");
const {lstat} = require("../utils/fs.js");
const Storage = require("../storage.js");
const File = require("./file.js");
const UI = require("../ui.js");


class FileRegistry {
	
	init(){
		this.files = new Map();
		this.inodes = new Map();
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
		this.inodes.clear();
		this.inodes = null;
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
			if(!path)
				throw new TypeError("Registered path cannot be empty");
			
			const stats = lstat(path);
			const inode = stats ? stats.ino : null;
			
			if(inode){
				// Don't reregister files that've moved
				if(stats.nlink < 2 && this.inodes.has(inode)){
					const file = this.inodes.get(inode);
					file.setPath(path);
					return file;
				}
				else Storage.setPathInode(path, inode);
			}
			
			const file = new File(path, stats);
			this.files.set(path, file);
			inode && this.inodes.set(inode, file);
			
			const disposables = new CompositeDisposable(
				file.onDidDestroy(() => disposables.dispose()),
				file.onDidMove(paths => this.fixPath(paths.from, paths.to)),
				file.onDidChangeRealPath(path => this.fixSymlink(file, path.to)),
				new Disposable(() => {
					this.files.delete(path);
					if(inode && file.stats.nlink < 2)
						this.inodes.delete(inode);
				})
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
	
	
	fixSymlink(link, targetPath){
		const target = this.get(targetPath);
		link.icon.master = target.icon;
	}
}


module.exports = new FileRegistry();
