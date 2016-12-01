"use strict";

const fs = require("fs");
const path = require("path");
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
		this.isDataComplete = false;
		this.watchingBuffer = false;
		this.watchingSystem = false;
		
		this.pendingData = false;
		this.pendingStats = false;

		try{
			this.loadRealPath();
			this.watchRepo();
			setImmediate(_=> {
				this.loadData();
				this.loadStats();
			});
		} catch(e){
			this.unreadable = true;
			this.symlink = false;
		}
	}

	
	destroy(){
		if(!this.destroyed){
			this.unwatchBuffer();
			this.unwatchSystem();
			this.unwatchRepo();
			super.destroy();
		}
	}
	
	
	onDidChangeData(fn){
		return this.emitter.on("did-change-data", fn);
	}
	
	onDidChangeRealPath(fn){
		return this.emitter.on("did-change-realpath", fn);
	}
	
	onDidChangeRealFile(fn){
		return this.emitter.on("did-change-realfile", fn);
	}
	
	
	/**
	 * Synchronously load the file's real path.
	 *
	 * @emits did-change-realpath
	 * @private
	 */
	loadRealPath(){
		const from = path.resolve(this.path);
		const to = fs.realpathSync(this.path);
		
		if(to !== from && to !== this.realPath){
			this.realPath = to;
			this.symlink = !!to;
			setImmediate(() => {
				this.emitter.emit("did-change-realpath", {from, to});
			});
		}
		
		else if(null === this.symlink)
			this.symlink = false;
	}
	
	
	/**
	 * Store a reference to a symlink's target.
	 *
	 * @param {File} to
	 * @private
	 */
	setRealFile(to){
		const from = this.realFile;
		
		if(to !== from){
			this.realFile = to;
			this.emitter.emit("did-change-realfile", {from, to});
			
			if(to === null)
				this.setIcon(null);
			
			else{
				this.setIcon(to.getIcon());
				const disposable = new CompositeDisposable(
					this.onDidChangeRealFile(_=> disposable.dispose()),
					to.onDidChangeIcon(_=> this.setIcon(to.getIcon())),
					to.onDidDestroy(_=> disposable.dispose())
				);
			}
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
		System.loadData(this.path, this.symlink).then(result => {
			this.pendingData = false;
			if(!this.isOpenInEditor && !this.isComplete)
				this.setData(...result);
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
		});
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
	 * @private
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
			
			this.emitter.emit("did-change-data", {from, to});
		}
	}
	
	
	/**
	 * Store a reference to a {TextEditor} this file's been opened in.
	 *
	 * @param {TextEditor} editor
	 */
	addEditor(editor){
		if(editor && !this.editors.has(editor)){
			this.isOpenInEditor = true;
			this.editors.set(editor, editor.onDidDestroy(() => {
				this.removeEditor(editor);
			}));
			this.watchBuffer();
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
	 * Monitor the state of the file's underlying text-buffer.
	 *
	 * @private
	 */
	watchBuffer(){
		if(!this.watchingBuffer){
			this.watchingBuffer = true;
			
			for(const [editor] of this.editors){
				this.buffer = editor.buffer;
				break;
			}
			
			this.bufferDisposables = new CompositeDisposable(
				this.buffer.onDidDestroy(_=> this.unwatchBuffer()),
				this.buffer.onDidDelete(_=> this.destroy()),
				this.buffer.onDidReload(_=> this.refreshBuffer()),
				this.buffer.onDidSave(_=> this.refreshBuffer())
			);
			this.refreshBuffer();
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
	 * @private
	 */
	unwatchBuffer(){
		if(this.watchingBuffer){
			this.watchingBuffer = false;
			this.buffer = null;
			this.bufferDisposables.dispose();
			this.bufferDisposables = null;
		}
	}
	
	
	/**
	 * Monitor and respond to filesystem change events.
	 *
	 * TODO: Actually use this once atom/tree-view#966 is merged.
	 *
	 * @private
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
				events.onDidChange(_=> this.reload())
			);
		}
	}
	
	
	/**
	 * Stop monitoring the filesystem for changes.
	 *
	 * @private
	 */
	unwatchSystem(){
		if(this.watchingSystem){
			this.watchingSystem = false;
			this.systemEvents = null;
			this.systemDisposables.dispose();
			this.systemDisposables = null;
		}
	}
	
	
	
	/**
	 * Monitor changes in the file's VCS status.
	 *
	 * @private
	 */
	watchRepo(){
		if(this.repo) return;
		
		let repo = null;
		let index = 0;
		for(const project of atom.project.getPaths()){
			const filePath = this.realPath || this.path;
			if(project === filePath || 0 === filePath.indexOf(project + path.sep)){
				repo = atom.project.getRepositories()[index] || null;
				break;
			}
			++index;
		}
		
		if(repo){
			this.repo = repo;
			
			const repoPath = repo.getWorkingDirectory();
			this.repoDisposables = new CompositeDisposable(
				repo.onDidDestroy(() => this.unwatchRepo()),
				repo.onDidChangeStatuses(() => {
					const path = this.realPath || this.path;
					const code = repo.getCachedPathStatus(path) || 0;
					this.setVCSStatus(code);
				}),
				repo.onDidChangeStatus(changed => {
					if(changed.path === (this.realPath || this.path))
						this.setVCSStatus(changed.pathStatus);
				})
			);
			
			this.setVCSStatus(repo.getCachedPathStatus(path) || 0);
		}
	}
	
	
	/**
	 * Stop monitoring the file's repository for status changes.
	 *
	 * @private
	 */
	unwatchRepo(){
		if(!this.repo) return;
		this.repoDisposables.dispose();
		this.repo = null;
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
		const binary  = /\.(exe|jpe?g|png|gif|bmp|py[co]|woff2?|ttf|ico|webp|zip|[tr]ar|gz|bz2)$/i;
		const {mtime} = this.stats || {};
		
		if(this.isBinary)                   return false; // Previous scan revealed to be binary
		if(this.unreadable)                 return false; // File not readable
		if(this.isOpenInEditor)             return false; // Already open in editor
		if(this.lastScanned > mtime)        return false; // Hasn't changed since last scan
		if(binary.test(this.path))          return false; // Obviously binary
		
		// Too small to hold anything meaningful
		const {size} = this;
		if(size !== null && size < 6)
			return false;
		return true;
	}
}


module.exports = File;
