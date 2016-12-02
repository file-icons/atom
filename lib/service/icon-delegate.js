"use strict";

const {CompositeDisposable, Emitter} = require("atom");
const Strategies = require("./strategies/strategy-manager.js");
const Options    = require("../options.js");


class IconDelegate{
	
	constructor(resource){
		this.disposables = new CompositeDisposable();
		this.emitter     = new Emitter();
		this.resource    = resource;
	}
	
	
	destroy(){
		if(!this.destroyed){
			this.destroyed = true;
			this.emitter.emit("did-destroy");
			this.emitter.dispose();
			this.emitter = null;
			this.disposables.dispose();
			this.disposables.clear();
			this.disposables = null;
			this.resource = null;
		}
	}
	
	
	onDidDestroy(fn){
		return this.emitter.on("did-destroy", fn);
	}
	
	onDidChangeIcon(fn){
		return this.emitter.on("did-change-icon", fn);
	}
	
	
	/**
	 * Retrieve the delegate's current icon.
	 *
	 * @return {Icon}
	 */
	getIcon(){
		if(this.icon)
			return this.icon;
		
		else{
			const icon = Strategies.match(this.resource);
			return this.icon = icon;
		}
	}
	
	
	/**
	 * Return the CSS classes for displaying the delegate's icon.
	 *
	 * @return {Array}
	 */
	getClasses(){
		const {resource} = this;
		const isDir = resource.isDirectory;
		
		let {colourMode} = Options;
		if(Options.colourChangedOnly && !resource.vcsStatus)
			colourMode = null;
		
		const icon = this.getIcon();
		const classes = icon
			? icon.getClass(colourMode, true)
			: isDir ? null : Options.defaultIconClass;
		
		if(resource.symlink)
			classes[0] = "icon-file-symlink-" + (isDir ? "directory" : "file");
		
		/**
		 * HACK: `appliedClasses` is only stored because we have no control over
		 * when the service consumes icons, and IconNodes need to know which classes
		 * to remove when delegates change.
		 */
		this.appliedClasses = classes;
		
		return classes;
	}
	
	
	/**
	 * Change the currently-active icon.
	 *
	 * @param {Icon} to
	 * @emits did-change-icon
	 */
	setIcon(to){
		const from = this.icon;
		
		if(from !== to){
			this.icon = to;
			
			if(null === to && !this.resource.isDirectory)
				to = this.getIcon();
			
			this.emitter.emit("did-change-icon", {from, to});
		}
	}
}


IconDelegate.prototype.icon = null;
IconDelegate.prototype.destroyed = false;

module.exports = IconDelegate;
