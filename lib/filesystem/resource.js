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
			this.emitter.emit("did-destroy");
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
	 * Modify the resource's location.
	 *
	 * @param {String} to
	 * @emits did-move
	 */
	setPath(to){
		const from = this.path;
		
		if(from !== to){
			this.path = to;
			this.name = basename(to);
			this.emitter.emit("did-move", {from, to});
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
			this.emitter.emit("did-change-vcs-status", {from, to});
		}
	}
}

Resource.prototype.repo = null;
Resource.prototype.icon = null;
Resource.prototype.isDirectory = false;
Resource.prototype.destroyed = false;
Resource.prototype.realPath = null;
Resource.prototype.symlink = null;
Resource.prototype.vcsStatus = 0;

module.exports = Resource;
