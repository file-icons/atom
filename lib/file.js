"use strict";

const Atom = require("atom");
const {CompositeDisposable, Emitter} = Atom;
const {basename}   = require("path");
const fs           = require("fs");

const IconRegistry = require("./icon-registry.js");
const Options      = require("./options.js");
const UI           = require("./ui.js");


class File {
	
	constructor(path){
		this.setPath(path);
		this.editors     = new Map();
		this.emitter     = new Emitter();
		this.events      = new Atom.File(path);
		this.disposables = new CompositeDisposable();
		
		this.disposables.add(
			this.events.onDidChange(_=> this.load()),
			this.events.onDidRename(_=> this.syncPath()),
			this.events.onDidDelete(_=> this.destroy()),
			this.events.onWillThrowWatchError(_=> this.destroy())
		);
		
		setImmediate(_=> this.requestScan());
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
	
	
	onDidDestroy(fn){
		return this.emitter.on("did-destroy", fn);
	}
	
	onDidMove(fn){
		return this.emitter.on("did-move", fn);
	}
	
	onScanRequest(fn){
		return this.emitter.on("did-request-scan", fn);
	}
	
	onScanCancel(fn){
		return this.emitter.on("did-cancel-scan", fn);
	}
	
	
	toString(){
		return this.getPath();
	}
	
	
	getPath(){
		return this.realPath || this.path;
	}
	
	
	setPath(input){
		this.path = input;
		this.name = basename(input);
	}
	

	/**
	 * Sync the instance's path with the filesystem.
	 *
	 * @private
	 */
	syncPath(){
		const from = this.path;
		const to = this.events.getPath();
		
		if(from !== to){
			this.setPath(to);
			this.emitter.emit("did-move", {from, to});
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
	 * Store filesystem data on the File instance.
	 *
	 * @param {Object} stats - An object returned by fs.stat
	 */
	assignStats(stats){
		stats.atime     += stats.atime.getTime();
		stats.birthtime += stats.birthtime.getTime();
		stats.ctime     += stats.ctime.getTime();
		stats.mtime     += stats.mtime.getTime();
		
		this.executable  = !!(0o111 & stats.mode);
		this.symlink     = stats.isSymbolicLink();
		this.stats       = stats;
		this.size        = stats.size;
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
			
			else this.loadStats().then(_=> {
				if(this.shouldBeScanned())
					this.requestScan();
			});
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
					this.assignStats(stats);
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
	
	
	
	/**
	 * Determine whether the file's content should be scanned for headers.
	 *
	 * @return {Boolean}
	 */
	shouldBeScanned(){
		const binary  = /\.(exe|jpe?g|png|gif|bmp|py[co]|woff2?|ttf|ico|webp|zip|[tr]ar|gz|bz2)$/i;
		const {mtime} = this.stats || {};
		
		if(this.isBinary)                   return false; // Previous scan revealed to be binary
		if(this.hasEditor)                  return false; // Already open in editor
		if(this.size < this.minScanSize)    return false; // Too small to hold anything meaningful
		if(this.lastScanned > mtime)        return false; // Hasn't changed since last scan
		if(binary.test(this.getPath()))     return false; // Obviously binary
		return true;
	}
	
	
	requestScan(){
		this.awaitingScan = true;
		this.emitter.emit("did-request-scan");
	}
	
	cancelScan(){
		this.awaitingScan = false;
		this.emitter.emit("did-cancel-scan");
	}
	
	
	/**
	 * Process the results of a successful file scan.
	 *
	 * @param {Object} result
	 */
	receiveScan(result){
		this.awaitingScan = false;
		
		if(!this.hasEditor){
			const {data, hasFullData, isBinary} = result;
			
			this.data = data;
			this.hasFullData = hasFullData;
			if(isBinary != null)
				this.isBinary = isBinary;
			
			this.lastScanned = Date.now();
		}
	}
}


// TODO: Add as class properties when supported natively.
File.prototype.minScanSize  = 6;
File.prototype.maxScanSize  = 80;
File.prototype.awaitingScan = false;

module.exports = File;
