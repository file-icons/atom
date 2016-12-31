"use strict";

const {basename} = require("path");
const {CompositeDisposable, Disposable, Emitter} = require("atom");
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
		this.isDirectory = !!(type & EntityType.DIRECTORY);
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
			this.symlink = stats.isSymbolicLink();
			if(this.symlink)
				this.type |= EntityType.SYMLINK;
		}
		else{
			this.unreadable = true;
			this.symlink = false;
		}
	}
	
	
	/**
	 * Load the resource's absolute physical pathname.
	 *
	 * @param {Boolean} asap - Load synchronously
	 * @emits did-change-realpath
	 */
	loadRealPath(asap = false){
		if(asap){
			const from = path.resolve(this.path);
			const to = fs.realpathSync(this.path);
			this.pendingRealPath = false;
			if(to !== from && to !== this.realPath){
				this.realPath = to;
				setImmediate(() => this.emit("did-change-realpath", {from, to}));
			}
		}
		
		else{
			if(this.pendingRealPath)
				return;
			
			this.pendingRealPath = true;
			System.loadRealPath(this.path).then(result => {
				this.pendingRealPath = false;
				const from = this.realPath;
				const to = result;
				if(from !== to){
					this.realPath = to;
					this.emit("did-change-realpath", {from, to});
				}
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
		if(asap){
			const stats = fs.lstatSync(this.path);
			this.stats = stats;
			this.symlink = stats.isSymbolicLink();
			this.pendingStats = false;
			this.emit("did-load-stats", stats);
		}
		
		else{
			if(this.pendingStats)
				return;
			
			this.pendingStats = true;
			System.loadStats(this.path).then(result => {
				result = statify(result);
				
				this.pendingStats = false;
				this.stats = result;
				this.emit("did-load-stats", result);
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
Resource.prototype.isVirtual = false;
Resource.prototype.pendingRealPath = false;
Resource.prototype.pendingStats = false;
Resource.prototype.realPath = null;
Resource.prototype.repo = null;
Resource.prototype.stats = null;
Resource.prototype.symlink = null;
Resource.prototype.unreadable = false;
Resource.prototype.vcsStatus = 0;

module.exports = Resource;
