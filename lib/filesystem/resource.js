"use strict";

const {basename}   = require("path");
const {CompositeDisposable, Emitter} = require("atom");


/**
 * Anything representing a system resource with an {@link Icon}.
 *
 * Resources need not point to physical or accessible entities.
 * Filesystem interaction should be handled using subclasses.
 */
class Resource{
	
	constructor(path){
		this.disposables = new CompositeDisposable();
		this.emitter = new Emitter();
		this.path = path;
		this.name = basename(path);
	}


	destroy(){
		if(!this.destroyed){
			this.destroyed = true;
			this.emit("did-destroy");
			this.emitter.dispose();
			this.disposables.dispose();
			this.disposables.clear();
			this.disposables = null;
			this.emitter = null;
		}
	}
	

	onDidDestroy(fn){
		return this.emitter.on("did-destroy", fn);
	}
	
	onDidMove(fn){
		return this.emitter.on("did-move", fn);
	}
	
	onDidChangeVCSStatus(fn){
		return this.emitter.on("did-change-vcs-status", fn);
	}
	

	toString(){
		return this.path;
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

Resource.prototype.repo = null;
Resource.prototype.icon = null;
Resource.prototype.isVirtual = false;
Resource.prototype.isDirectory = false;
Resource.prototype.destroyed = false;
Resource.prototype.symlink = null;
Resource.prototype.vcsStatus = 0;

module.exports = Resource;
