"use strict";

const Atom = require("atom");
const {CompositeDisposable, Emitter} = Atom;
const {basename}   = require("path");
const fs           = require("fs");

const IconRegistry = require("./icon-registry.js");


class File {
	
	constructor(path){
		this.setPath(path);
		this.editors     = new Map();
		this.emitter     = new Emitter();
		this.events      = new Atom.File(path);
		this.disposables = new CompositeDisposable();
		
		this.disposables.add(
			this.events.onDidChange(_=> this.handleChange()),
			this.events.onDidRename(_=> this.handleMove()),
			this.events.onDidDelete(_=> this.destroy()),
			this.events.onWillThrowWatchError(_=> this.destroy())
		);
	}
	
	destroy(){
		if(!this.destroyed){
			this.disposables.dispose();
			this.disposables = null;
			this.destroyed = true;
			this.emitter.emit("did-destroy");
			this.emitter.dispose();
			this.emitter = null;
			this.events = null;
		}
	}
	
	
	getIcon(){
		if(this.icon)
			return this.icon;
		
		else{
			for(const icon of IconRegistry.fileIcons){
				if(icon.match.test(this.name)){
					this.icon = icon;
					return icon;
				}
			}
			return null;
		}
	}
	
	
	setPath(input){
		this.path = input;
		this.name = basename(input);
	}
	
	getPath(){
		return this.realPath || this.path;
	}
	
	
	/**
	 * Link the {TextEditor} instance this file's opened in.
	 *
	 * Used for eliminating excess system calls when changes are detected.
	 *
	 * @param {TextEditor} input
	 */
	linkEditor(input){
		if(input){
			const disposables = new CompositeDisposable();
			disposables.add(input.onDidDestroy(_=> this.unlinkEditor(input)));
			this.editors.set(input, disposables);
			this.hasEditor = true;
		}
	}
	
	
	/**
	 * Sever the file's link with an editor. Called when an editor's closed.
	 *
	 * @param {TextEditor} input
	 */
	unlinkEditor(input){
		if(input){
			const disposables = this.editors.get(input);
			disposables && disposables.dispose();
			this.editors.delete(input);
			this.hasEditor = !!this.editors.size;
		}
	}
	
	
	/**
	 * Return the first editor instance this file's linked with.
	 *
	 * @return {TextEditor}
	 */
	getEditor(){
		if(!this.hasEditor) return null;
		const {value} = this.editors.keys().next();
		return value;
	}
	
	
	/**
	 * Load the file's contents.
	 *
	 * @return {Promise}
	 */
	load(){
		return new Promise(resolve => {
			const editor = this.getEditor();
			
			if(editor){
				this.data        = editor.buffer.getText();
				this.size        = editor.buffer.cachedDiskContents.length;
				this.lastOpened  = editor.lastOpened;
				this.hasFullData = true;
				resolve();
			}
			
			else this
				.loadStats()
				.then(_=> this.loadFromDisk())
				.then(_=> resolve())
		});
	}
	
	
	
	/**
	 * Load the file's stats.
	 *
	 * @return {Promise}
	 */	
	loadStats(){
		return new Promise(resolve => {
			
			if(this.stats)	
				resolve(this.stats);
			
			else{
				fs.stat(this.path, (error, stats) => {
					stats.atime     += stats.atime.getTime();
					stats.birthtime += stats.birthtime.getTime();
					stats.ctime     += stats.ctime.getTime();
					stats.mtime     += stats.mtime.getTime();
					
					this.executable  = !!(0o111 & stats.mode);
					this.symlink     = stats.isSymbolicLink();
					this.stats       = stats;
					this.size        = stats.size;
					
					if(this.symlink)
						resolve(this.loadRealPath())
					
					else resolve();
				});
			}
		});
	}
	
	
	/**
	 * Load the physical path of a symbolic link.
	 *
	 * @return {Promise}
	 */
	loadRealPath(){
		return new Promise((resolve, reject) => {
			fs.realpath(this.path, (error, realPath) => {
				error ? reject(error) : resolve(this.realPath = realPath);
			});
		});
	}
	
	
	
	loadFromDisk(){
		return new Promise(resolve => {
			if(this.shouldBeScanned()){
				const fd     = fs.openSync(this.getPath(), "r");
				const buffer = Buffer.alloc(this.maxScanSize);
				
				fs.read(fd, buffer, 0, this.maxScanSize, null, (error, bytesRead, data) => {
					data = data.toString();
					
					// Strip null-bytes padding short file-chunks
					if(bytesRead < data.length){
						data = data.replace(/\x00+$/, "");
						this.hasFullData = true;
					}
					else this.hasFullData = false;
					
					// Contains null-bytes; probably a binary file.
					if(/\x00/.test(data))
						this.isBinary = true;
					
					this.data = data;
					resolve();
				});
			}
			
			else resolve();
		});
	}
	
	
	/**
	 * Determine whether the file's content should be scanned for headers.
	 *
	 * @return {Boolean}
	 */
	shouldBeScanned(){
		const binary = /\.(exe|jpe?g|png|gif|bmp|py[co]|woff2?|ttf|ico|webp|zip|[tr]ar|gz|bz2)$/i;
		
		if(this.isBinary)                        return false; // Previous scan revealed to be binary
		if(this.hasEditor)                       return false; // Already open in editor
		if(this.size < this.minScanSize)         return false; // Too small to hold anything meaningful
		if(this.lastScanned > this.stats.mtime)  return false; // Hasn't changed since last scan
		if(binary.test(this.getPath()))          return false; // Obviously binary
		return true;
	}
	
	
	
	handleChange(){
		this.load().then(_=> {
			console.log("And the contents are...");
			console.log(this.data);
		});
	}
	
	
	handleMove(){
		const from = this.path;
		const to = this.events.getPath();
		
		if(from !== to){
			this.setPath(to);
			this.emitter.emit("did-move", {from, to});
		}
	}
	
	
	onDidDestroy(fn){
		return this.emitter.on("did-destroy", fn);
	}
	
	onDidMove(fn){
		return this.emitter.on("did-move", fn);
	}
}


File.prototype.minScanSize = 6;
File.prototype.maxScanSize = 80;

module.exports = File;
