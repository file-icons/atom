"use strict";

const {basename}   = require("path");
const {Emitter}    = require("atom");
const IconRegistry = require("./icon-registry.js");
const Options      = require("./options.js");


/**
 * Anything representing a system resource with an {@link Icon}.
 *
 * TODO: Have ArchiveEntry and TreeDirectory subclass this.
 */
class Resource{
	
	constructor(path){
		this.emitter = new Emitter();
		this.path = path;
		this.name = basename(path);
	}


	destroy(){
		if(!this.destroyed){
			this.destroyed = true;
			this.emitter.emit("did-destroy");
			this.emitter.dispose();
			this.emitter = null;
		}
	}
	

	onDidDestroy(fn){
		return this.emitter.on("did-destroy", fn);
	}
	
	onDidMove(fn){
		return this.emitter.on("did-move", fn);
	}
	
	onDidChangeIcon(fn){
		return this.emitter.on("did-change-icon", fn);
	}
	

	toString(){
		return this.path;
	}


	/**
	 * Retrieve the resource's icon.
	 * 
	 * TODO: Do something about the fact this only returns icons
	 * for files, and has to be overridden for directories.
	 *
	 * @return {Icon}
	 */
	getIcon(){
		if(this.icon)
			return this.icon;
		
		else{
			const realPath = this.symlinkTarget
				? this.followSymlink().path
				: this.path;
			
			// TODO: Hook this to a Strategy API
			this.icon = IconRegistry.matchFile({
				path: realPath,
				name: this.name
			});
			
			return this.icon;
		}
	}
	
	
	getIconClass(){
		const icon = this.getIcon();
		this.iconClass = icon
			? icon.getClass(Options.colourMode, true)
			: [Options.defaultIconClass];
		return this.iconClass;
	}
	
	
	/**
	 * Modify the resource's location.
	 *
	 * @param {String} to
	 * @emits did-move
	 */
	updatePath(to){
		const from = this.path;
		
		if(from !== to){
			this.path = to;
			this.name = basename(to);
			this.emitter.emit("did-move", {from, to});
		}
	}
	
	
	/**
	 * Set whether a resource is a symbolic link.
	 *
	 * This operation is irreversible: the type of a filesystem
	 * node can't change after it's been created.
	 *
	 * @param {String|Boolean}
	 */
	setSymlink(target){
		if(null !== this.symlink)
			return;
		
		if(target){
			this.symlink = true;
			this.symlinkTarget = target;
		}
		else{
			this.symlink = false;
			if(this.symlinkTarget)
				this.symlinkTarget = null;
		}
		
		// Make property read-only
		Object.defineProperty(this, "symlink", {
			configurable: false,
			writable: false
		});
	}
	
	
	/**
	 * Follow a symbolic link to its destination.
	 *
	 * If the calling instance isn't a symbolic link, or if the destination
	 * couldn't be reached for any reason, the method returns null.
	 * 
	 * @param {WeakSet} links - Internal-use: track callers to detect loops
	 * @return {File}
	 */
	followSymlink(links = null){
		const target = this.symlinkTarget;
		
		// First call: Bail if not a valid symlink (or no path to go by)
		if(null === links || this === target){
			if(!this.symlink || !target)
				return null;
			links = new WeakSet();
		}
		
		// Recursed call
		else{
			// Return caller if it's not a symbolic link
			if(!this.symlink)
				return this;
			
			// Symlink with unknown target, or previously-scanned link
			if(!target || links.has(this))
				return null;
		}
		
		links.add(this);
		return target.followSymlink(links);
	}
}

Resource.prototype.destroyed = false;
Resource.prototype.symlink = null;
Resource.prototype.symlinkTarget = null;

module.exports = Resource;
