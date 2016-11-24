"use strict";

const {basename}   = require("path");
const {CompositeDisposable, Emitter} = require("atom");
const IconRegistry = require("./icon-registry.js");
const Options      = require("./options.js");


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
	
	onDidChangeIcon(fn){
		return this.emitter.on("did-change-icon", fn);
	}
	
	onDidChangeVCSStatus(fn){
		return this.emitter.on("did-change-vcs-status", fn);
	}
	

	toString(){
		return this.path;
	}


	/**
	 * Retrieve the resource's icon.
	 *
	 * @return {Icon}
	 */
	getIcon(){
		if(this.icon)
			return this.icon;
		
		else{
			const args = {
				path: this.realPath || this.path,
				name: this.name
			};
			
			const icon = this.isDirectory
				? IconRegistry.matchDirectory(args)
				: IconRegistry.matchFile(args);
			
			this.setIcon(icon);
			return this.icon;
		}
	}
	
	
	/**
	 * Return the CSS classes to display this resource's {@link Icon}.
	 *
	 * @return {Array}
	 */
	getIconClasses(){
		let {colourMode} = Options;
		if(Options.colourChangedOnly && !this.vcsStatus)
			colourMode = null;
		
		const icon = this.getIcon();
		const iconClasses = icon
			? icon.getClass(colourMode, true)
			: this.isDirectory ? null : Options.defaultIconClass;
		
		if(this.symlink)
			iconClasses[0] = "icon-file-symlink-" + (this.isDirectory ? "directory" : "file");
		
		/**
		 * HACK: `iconClasses` is only stored because we have no control over when
		 * the service consumes icons, and IconNodes need to know which classes to
		 * remove when delegates change.
		 */
		this.iconClasses = iconClasses;
		
		return this.iconClasses;
	}
	
	
	/**
	 * Change the resource's icon.
	 *
	 * @param {Icon} to
	 * @emits did-change-icon
	 */
	setIcon(to){
		const from = this.icon;
		
		if(from !== to){
			this.icon = to;
			if(null === to) to = this.getIcon();
			this.emitter.emit("did-change-icon", {from, to});
		}
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

Resource.prototype.icon = null;
Resource.prototype.repo = null;
Resource.prototype.isDirectory = false;
Resource.prototype.destroyed = false;
Resource.prototype.realPath = null;
Resource.prototype.symlink = null;
Resource.prototype.vcsStatus = 0;

module.exports = Resource;
