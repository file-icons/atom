"use strict";

const {basename} = require("path");
const {CompositeDisposable, Disposable, Emitter} = require("atom");
const {lstat, realpath, statify} = require("../utils/fs.js");
const EntityType = require("./entity-type.js");
const System = require("./system.js");


/**
 * Anything representing a system resource with an {@link Icon}.
 *
 * @class
 */
class Resource{
	
	/**
	 * Initialise a new resource.
	 *
	 * @param {String} path
	 * @param {EntityType} [type]
	 * @constructor
	 */
	constructor(path, type){
		if(!type)
			throw new TypeError("Resources must declare an EntityType");
		
		this.disposables = new CompositeDisposable();
		this.emitter = new Emitter();
		this.type = type;
		this.path = path;
		this.name = basename(path);
		
		if(type & EntityType.DIRECTORY)
			this.isDirectory = true;
	}

	
	/**
	 * Obliterate resource from memory.
	 *
	 * @emits did-destroy
	 */
	destroy(){
		if(!this.destroyed){
			this.destroyed = true;
			this.emit("did-destroy");
			this.emitter.dispose();
			this.disposables.dispose();
			this.disposables.clear();
			this.disposables = null;
			this.emitter = null;
			
			if(this.icon){
				this.icon.destroy();
				this.icon = null;
			}
		}
	}
	

	/* Event subscription */
	onDidDestroy         (fn){ return this.subscribe("did-destroy",           fn)}
	onDidMove            (fn){ return this.subscribe("did-move",              fn)}
	onDidChangeVCSStatus (fn){ return this.subscribe("did-change-vcs-status", fn)}
	onDidLoadStats       (fn){ return this.subscribe("did-load-stats",        fn)}
	onDidChangeRealPath  (fn){ return this.subscribe("did-change-realpath",   fn)}


	/**
	 * Return the resource's path when stringified.
	 *
	 * @return {String}
	 */
	toString(){
		return this.path || "";
	}
	
	
	/**
	 * Subscribe to an event, avoiding breakage if emitter is absent.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Disposable}
	 */
	subscribe(event, fn){
		return this.emitter
			? this.emitter.on(event, fn)
			: new Disposable();
	}
	
	
	/**
	 * Dispatch an event, avoiding breakage if emitter is absent.
	 *
	 * @param {String} event
	 * @param {Mixed} value
	 */
	emit(event, value){
		if(this.emitter)
			this.emitter.emit(event, value);
	}
	
	
	/**
	 * Process the contents of an fs.Stats instance.
	 *
	 * If given a falsey value, the resource is marked unreadable.
	 *
	 * @param {fs.Stats} stats
	 * @private
	 */
	consumeStats(stats){
		if(stats){
			this.stats = stats;
			this.pendingStats = false;
			if(this.isSymlink = stats.isSymbolicLink()){
				this.isSymlink = true;
				this.type |= EntityType.SYMLINK;
			}
			this.emit("did-load-stats", stats);
		}
		else this.unreadable = true;
	}
	
	
	/**
	 * Load the resource's absolute physical pathname.
	 *
	 * @param {Boolean} asap - Load synchronously
	 * @emits did-change-realpath
	 */
	loadRealPath(asap = false){
		if(asap)
			this.setRealPath(realpath(this.path));
		
		else{
			if(this.pendingRealPath)
				return;
			
			this.pendingRealPath = true;
			System.loadRealPath(this.path).then(result => {
				this.setRealPath(result);
			});
		}
	}
	
	
	/**
	 * Load stats from the filesystem.
	 *
	 * @param {Boolean} asap - Load synchronously
	 * @emits did-load-stats
	 */
	loadStats(asap = false){
		if(asap)
			this.consumeStats(lstat(this.path));
		
		else{
			if(this.pendingStats)
				return;
			
			this.pendingStats = true;
			System.loadStats(this.path).then(result => {
				this.consumeStats(statify(result));
			});
		}
	}
	
	
	/**
	 * Whether the resource's permission bits enable it to be executed.
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
	 * Modify the resource's location.
	 *
	 * @param {String} to
	 * @throws {TypeError} Path cannot be empty
	 * @emits did-move
	 */
	setPath(to){
		if(!to) throw new TypeError("Cannot assign empty path");
		const from = this.path;
		
		if(from !== to){
			this.path = to;
			this.name = basename(to);
			this.emit("did-move", {from, to});
		}
	}
	
	
	/**
	 * Modify a symlinked resource's destination.
	 *
	 * @param {String} to
	 * @emits 
	 */
	setRealPath(to){
		this.pendingRealPath = false;
		const from = this.realPath;
		
		if(to !== from && to !== this.realPath){
			this.realPath = to;
			setImmediate(() => this.emit("did-change-realpath", {from, to}));
		}
	}
	
	
	/**
	 * Modify the VCS status code of this resource.
	 *
	 * @param {Number} to
	 * @emits did-change-vcs-status
	 */
	setVCSStatus(to){
		const from = this.vcsStatus;
		
		if(from !== to){
			this.vcsStatus = to;
			this.emit("did-change-vcs-status", {from, to});
		}
	}
}

Resource.prototype.destroyed = false;
Resource.prototype.icon = null;
Resource.prototype.isDirectory = false;
Resource.prototype.isSymlink = false;
Resource.prototype.isVirtual = false;
Resource.prototype.pendingRealPath = false;
Resource.prototype.pendingStats = false;
Resource.prototype.realPath = null;
Resource.prototype.repo = null;
Resource.prototype.stats = null;
Resource.prototype.unreadable = false;
Resource.prototype.vcsStatus = 0;

module.exports = Resource;
