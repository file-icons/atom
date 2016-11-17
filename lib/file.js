"use strict";

const Atom = require("atom");
const {CompositeDisposable, Disposable} = Atom;

const {statify} = require("./utils.js");
const Resource = require("./resource.js");
const System = require("./system.js");


class File extends Resource {
	
	constructor(path){
		super(path);
		
		this.editors = new Map();
		this.isOpenInEditor = false;
		this.watchingEvents = false;
		
		this.pendingData = false;
		this.pendingStats = false;
		this.pendingRealPath = false;
		
		setImmediate(_=> {
			this.loadData();
			this.loadStats();
			this.loadRealPath();
		});
	}

	
	destroy(){
		if(!this.destroyed){
			this.unwatch();
			super.destroy();
		}
	}
	
	
	/**
	 * Load the file's content.
	 *
	 * @private
	 */
	loadData(){
		if(this.pendingData || !this.shouldBeScanned())
			return;
		
		this.pendingData = true;
		System.loadData(this.path).then(result => {
			this.pendingData = false;
			
			if(!this.isOpenInEditor){
				const [data, isComplete] = result;
				
				// Contains null-bytes; probably not text
				if(/\x00/.test(data))
					this.isBinary = true;
				
				this.data = data;
				this.isDataComplete = isComplete;
			}
		});
	}
	
	
	/**
	 * Load stats from the filesystem.
	 *
	 * @private
	 */
	loadStats(){
		if(this.pendingStats)
			return;
		
		this.pendingStats = true;
		System.loadStats(this.path).then(result => {
			result = statify(result);
			
			this.pendingStats = false;
			this.stats = result;
			
			if(result.isSymbolicLink())
				this.loadRealPath();
		});
	}
	
	
	/**
	 * Load file's real path, if it's a symbolic link.
	 *
	 * Does nothing if confirmed to be an ordinary file.
	 *
	 * @private
	 */
	loadRealPath(){
		if(this.pendingRealPath || false === this.symlink)
			return;
		
		this.pendingRealPath = true;
		System.loadRealPath(this.path).then(result => {
			this.pendingRealPath = false;
			this.setSymlink(result);
		});
	}
	
	
	/**
	 * Store a reference to a {TextEditor} this file's been opened in.
	 *
	 * @param {TextEditor} editor
	 */
	addEditor(editor){
		if(editor && !this.editors.has(editor)){
			this.data           = editor.buffer.cachedDiskContents || "";
			this.size           = this.data.length;
			this.lastOpened     = editor.lastOpened;
			this.isDataComplete = true;
			this.isOpenInEditor = true;
			
			this.editors.set(editor, editor.onDidDestroy(() => {
				this.removeEditor(editor);
			}));
		}
	}
	
	
	/**
	 * Sever the file's link with an editor.
	 *
	 * @param {TextEditor} editor
	 */
	removeEditor(editor){
		const disposable = this.editors.get(editor);
		if(disposable){
			disposable.dispose();
			this.editors.delete(editor);
			if(!this.editors.size)
				this.isOpenInEditor = false;
		}
	}
	
	
	
	/**
	 * Whether the file's permission bits enable it to be executed.
	 *
	 * If permission bits haven't been determined, the property's value is null.
	 *
	 * @readonly
	 * @return {Boolean|null}
	 */
	get executable(){
		return this.stats
			? !!(0o111 & this.stats.mode)
			: null;
	}
	
	
	/**
	 * Monitor and respond to filesystem change events.
	 *
	 * TODO: Actually use this once atom/tree-view#966 is merged.
	 *
	 * @private
	 */
	watch(){
		if(!this.watchingEvents){
			this.watchingEvents = true;
			const events = new Atom.File(this.path);
			this.events = events;
			this.eventDisposables = new CompositeDisposable(
				this.events.onWillThrowWatchError(_=> this.destroy()),
				this.events.onDidDelete(_=> this.destroy()),
				this.events.onDidRename(_=> this.updatePath(events.getPath())),
				this.events.onDidChange(_=> this.reload())
			);
		}
	}
	
	
	/**
	 * Stop monitoring the filesystem for changes.
	 *
	 * @private
	 */
	unwatch(){
		if(this.watchingEvents){
			this.watchingEvents = false;
			this.events = null;
			this.eventDisposables.dispose();
			this.eventDisposables = null;
		}
	}
	
	
	
	/**
	 * Determine if the file is worth scanning.
	 *
	 * TODO: Move all this to Strategy objects.
	 * 
	 * @return {Boolean}
	 * @private
	 */
	shouldBeScanned(){
		const minScanSize = 6;
		const binary  = /\.(exe|jpe?g|png|gif|bmp|py[co]|woff2?|ttf|ico|webp|zip|[tr]ar|gz|bz2)$/i;
		const {mtime} = this.stats || {};
		
		if(this.isBinary)                   return false; // Previous scan revealed to be binary
		if(this.scanError)                  return false; // File not readable
		if(this.isOpenInEditor)             return false; // Already open in editor
		if(this.size < minScanSize)         return false; // Too small to hold anything meaningful
		if(this.lastScanned > mtime)        return false; // Hasn't changed since last scan
		if(binary.test(this.path))          return false; // Obviously binary
		return true;
	}
}


module.exports = File;
