"use strict";

const fs = require("fs");
const path = require("path");
const Atom = require("atom");
const {CompositeDisposable, Disposable} = Atom;

const {sampleFile} = require("../utils/fs.js");
const Resource = require("./resource.js");
const System = require("./system.js");


class File extends Resource {
	
	constructor(path, stats){
		super(path, stats);
		this.editors = new Map();
		this.buffer = null;
	}

	
	destroy(){
		if(!this.destroyed){
			this.unwatchBuffer();
			this.unwatchSystem();
			super.destroy();
		}
	}
	
	
	/* Event subscription */
	onDidChangeData     (fn){ return this.subscribe("did-change-data",     fn)}
	onDidChangeOnDisk   (fn){ return this.subscribe("did-change-on-disk",  fn)}
	onDidAttachBuffer   (fn){ return this.subscribe("did-attach-buffer",   fn)}
	onDidAttachEditor   (fn){ return this.subscribe("did-attach-editor",   fn)}
	onDidDetachBuffer   (fn){ return this.subscribe("did-detach-buffer",   fn)}
	onDidDetachEditor   (fn){ return this.subscribe("did-detach-editor",   fn)}
	
	
	/**
	 * Run a callback for each current and future editor that opens this file.
	 *
	 * @param {Function} callback
	 * @return {Disposable}
	 */
	observeEditors(callback){
		for(const [editor] of this.editors)
			callback(editor);
		return this.subscribe("did-attach-editor", callback);
	}
	
	
	/**
	 * Load the file's content.
	 *
	 * @param {Boolean} asap - Read file synchronously
	 * @param {Number} limit - Maximum number of bytes to read
	 * @see {@link File#setData}
	 */
	loadData(asap = false, limit = null){
		if(asap){
			const full = null === limit;
			const data = full
				? fs.readFileSync(this.path, "utf8")
				: sampleFile(this.path, limit)[0];
			this.pendingData = false;
			this.setData(data, full);
		}
		
		else{
			if(this.pendingData)
				return;
			
			this.pendingData = true;
			System.loadData(this.path, limit, this.isSymlink).then(result => {
				this.pendingData = false;
				if(!this.isOpenInEditor)
					this.setData(...result);
			});
		}
	}
	
	
	/**
	 * Filesize in bytes.
	 *
	 * The property's value is null if no filesystem data is available.
	 *
	 * @readonly
	 * @return {Number|null}
	 */
	get size(){
		return this.isDataComplete
			? this.data.length
			: this.stats ? this.stats.size : null;
	}
	
	
	
	/**
	 * Update the file's content string.
	 *
	 * @param {String} to
	 * @param {Boolean} isComplete
	 * @emits did-change-data
	 */
	setData(to, isComplete = false){
		const from = this.data;
		const canReplace = isComplete || !this.isDataComplete;
		
		if(to !== from && canReplace){
			this.data = to;
			this.isDataComplete = isComplete;
			
			// Contains null-bytes; probably not text
			if(/\x00/.test(to))
				this.isBinary = true;
			
			this.emit("did-change-data", {from, to});
		}
	}
	
	
	/**
	 * Store a reference to an editor that's opened this file.
	 *
	 * @param {TextEditor} editor
	 * @emits did-attach-editor
	 */
	addEditor(editor){
		if(editor && !this.editors.has(editor)){
			this.isOpenInEditor = true;
			this.editors.set(editor, editor.onDidDestroy(() => {
				this.removeEditor(editor);
			}));
			this.watchBuffer();
			this.emit("did-attach-editor", editor);
		}
	}
	
	
	/**
	 * Sever the file's link with an editor.
	 *
	 * @param {TextEditor} editor
	 * @emits did-detach-editor
	 */
	removeEditor(editor){
		const disposable = this.editors.get(editor);
		if(disposable){
			disposable.dispose();
			this.editors.delete(editor);
			this.emit("did-detach-editor", editor);
			if(!this.editors.size)
				this.isOpenInEditor = false;
		}
	}
	
	
	/**
	 * Retrieve the first editor assigned to the file.
	 *
	 * @return {TextEditor}
	 */
	getEditor(){
		if(!this.isOpenInEditor)
			return null;
		for(const [editor] of this.editors)
			return editor;
		return null;
	}
	
	
	/**
	 * Monitor the state of the file's underlying text-buffer.
	 *
	 * @emits did-attach-buffer
	 */
	watchBuffer(){
		if(!this.watchingBuffer){
			this.watchingBuffer = true;
			this.buffer = this.getEditor().buffer;
			
			this.bufferDisposables = new CompositeDisposable(
				this.buffer.onDidChangePath(to => this.setPath(to)),
				this.buffer.onDidDestroy(_=> this.unwatchBuffer()),
				this.buffer.onDidDelete(_=> this.destroy()),
				this.buffer.onDidReload(_=> this.refreshBuffer()),
				this.buffer.onDidSave(_=> this.refreshBuffer())
			);
			this.refreshBuffer();
			this.emit("did-attach-buffer", this.buffer);
		}
	}
	
	
	/**
	 * Perform a refresh of the buffer's content.
	 *
	 * @private
	 */
	refreshBuffer(){
		const data = this.buffer.cachedDiskContents;
		null === data
			? this.setData(this.buffer.lines.join("\n"))
			: this.setData(data, true);
	}
	
	
	/**
	 * Stop monitoring the file's text-buffer for changes.
	 *
	 * @emits did-detach-buffer
	 */
	unwatchBuffer(){
		if(this.watchingBuffer){
			this.watchingBuffer = false;
			this.buffer = null;
			this.bufferDisposables.dispose();
			this.bufferDisposables = null;
			this.emit("did-detach-buffer");
		}
	}
	
	
	/**
	 * Monitor and respond to filesystem events.
	 *
	 * TODO: Actually use this once atom/tree-view#966 is merged.
	 */
	watchSystem(){
		if(!this.watchingSystem){
			this.watchingSystem = true;
			const events = new Atom.File(this.path);
			this.systemEvents = events;
			this.systemDisposables = new CompositeDisposable(
				events.onWillThrowWatchError(_=> this.destroy()),
				events.onDidDelete(_=> this.destroy()),
				events.onDidRename(_=> this.setPath(events.getPath())),
				events.onDidChange(_=> this.emit("did-change-on-disk"))
			);
		}
	}
	
	
	/**
	 * Stop monitoring the filesystem for changes.
	 */
	unwatchSystem(){
		if(this.watchingSystem){
			this.watchingSystem = false;
			this.systemEvents = null;
			this.systemDisposables.dispose();
			this.systemDisposables = null;
		}
	}
}

File.prototype.data = null;
File.prototype.isFile = true;
File.prototype.isDataComplete = false;
File.prototype.isOpenInEditor = false;
File.prototype.pendingData = false;
File.prototype.watchingBuffer = false;
File.prototype.watchingSystem = false;

module.exports = File;
