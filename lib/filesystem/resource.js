"use strict";

const {basename, resolve, sep} = require("path");
const {CompositeDisposable, Disposable, Emitter} = require("atom");
const {lstat, realpath, statify} = require("../utils/fs.js");
const MappedDisposable = require("../utils/mapped-disposable.js");
const SubmoduleInfo = require("./submodule-info.js");
const IconDelegate = require("../service/icon-delegate.js");
const EntityType = require("./entity-type.js");
const System = require("./system.js");


/**
 * A filesystem resource.
 *
 * @class
 */
class Resource{
	
	/**
	 * Initialise a new resource.
	 *
	 * @param {String}    path - Absolute pathname of resource
	 * @param {fs.Stats} stats - Filesystem stats returned by {@link fs.lstatSync} or {@link statify}.
	 * @param {Boolean} noIcon - Suppress automatic creation of an {@link IconDelegate}.
	 * @constructor
	 */
	constructor(path, stats, noIcon = false){
		path = resolve(path);
		
		this.disposables = new MappedDisposable();
		this.emitter = new Emitter();
		this.path = path;
		this.name = basename(path);
		this.consumeStats(stats);
		
		const repo = this.getRepository();
		if(null !== repo){
			this.repo = repo;
			this.watchRepo();
		}
		
		if(!noIcon)
			this.icon = new IconDelegate(this);
	}

	
	/**
	 * Obliterate resource from memory.
	 *
	 * @emits did-destroy
	 */
	destroy(){
		if(!this.destroyed){
			this.destroyed = true;
			this.unwatchRepo();
			this.emit("did-destroy");
			this.emitter.dispose();
			this.disposables.dispose();
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
	 * Process the contents of an {fs.Stats} instance.
	 *
	 * If given a falsey value, the resource is marked unreadable.
	 *
	 * @param {fs.Stats} stats
	 * @private
	 */
	consumeStats(stats){
		if(stats){
			this.pendingStats = false;
			this.stats = stats;
			this.type = EntityType.ALL & stats.mode;
			
			if(stats.isSymbolicLink())
				this.isSymlink = true;
			
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
	 * Return a handle to the repository this resource belongs to.
	 *
	 * @return {GitRepository}
	 */
	getRepository(){
		const resourcePath = this.realPath || this.path;
		
		// Shouldn't happen, but #493 had other ideas.
		if(!resourcePath) return null;
		
		const projects = atom.project.getPaths();
		const {length} = projects;
		for(let i = 0; i < length; ++i){
			const projectPath = projects[i];
			
			if(!projectPath)
				continue;
			
			if(projectPath === resourcePath || 0 === resourcePath.indexOf(projectPath + sep))
				return atom.project.getRepositories()[i] || null;
		}
		
		return null;
	}
	
	
	/**
	 * Retrieve info for the submodule this resource belongs to.
	 *
	 * If the resource doesn't belong to a submodule, the method returns null.
	 *
	 * @return {SubmoduleInfo|null}
	 */
	getSubmodule(){
		return this.repo
			? SubmoduleInfo.forPath(this.path) || null
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
	 * TODO: Move all realPath-related shite to a dedicated subclass for symlinks.
	 *
	 * @param {String} to
	 * @emits did-change-realpath
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
	
	
	/**
	 * Monitor changes made to the resource's VCS status.
	 */
	watchRepo(){
		const {repo} = this;
		
		if(repo && !this.watchingRepo){
			this.watchingRepo = true;
			this.setVCSStatus(repo.getCachedPathStatus(this.path) || 0);
			this.disposables.set("repo", new CompositeDisposable(
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
			));
		}
	}
	
	
	/**
	 * Stop monitoring the resource's repository for status changes.
	 */
	unwatchRepo(){
		if(this.watchingRepo){
			this.watchingRepo = false;
			this.disposables.dispose("repo");
		}
	}
}

Resource.prototype.destroyed = false;
Resource.prototype.icon = null;
Resource.prototype.isDirectory = false;
Resource.prototype.isFile = false;
Resource.prototype.isSymlink = false;
Resource.prototype.isVirtual = false;
Resource.prototype.pendingRealPath = false;
Resource.prototype.pendingStats = false;
Resource.prototype.realPath = null;
Resource.prototype.repo = null;
Resource.prototype.stats = null;
Resource.prototype.submodule = null;
Resource.prototype.type = 0;
Resource.prototype.unreadable = false;
Resource.prototype.vcsStatus = 0;
Resource.prototype.watchingRepo = false;

module.exports = Resource;
