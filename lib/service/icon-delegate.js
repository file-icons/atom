"use strict";

const {CompositeDisposable, Disposable, Emitter} = require("atom");
const StrategyManager = require("./strategy-manager.js");
const Options = require("../options.js");


class IconDelegate{
	
	constructor(resource){
		this.resource    = resource;
		this.disposables = new CompositeDisposable();
		this.emitter     = new Emitter();
		this.icons       = [];
		this.numIcons    = 0;
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
			this.icons = null;
		}
	}
	
	
	onDidDestroy(fn){
		return this.emitter.on("did-destroy", fn);
	}
	
	onDidChangeIcon(fn){
		return this.emitter.on("did-change-icon", fn);
	}
	
	emitIconChange(from, to){
		this.emitter.emit("did-change-icon", {from, to});
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
		
		const icon = this.getCurrentIcon();
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
	 * Retrieve the delegate's active icon.
	 *
	 * @return {Icon}
	 */
	getCurrentIcon(){
		if(this.currentIcon)
			return this.currentIcon;
		
		else if(this.numIcons > 0){
			for(let i = this.icons.length - 1; i >= 0; --i){
				const icon = this.icons[i];
				if(icon){
					this.currentPriority = i;
					this.currentIcon = icon;
					this.emitIconChange(null, icon);
					return icon;
				}
			}
		}
		
		else{
			StrategyManager.query(this.resource);
			return this.currentIcon || null;
		}
	}
	
	
	/**
	 * Change the currently-active icon.
	 *
	 * @param {Icon} to
	 * @emits did-change-icon
	 */
	setCurrentIcon(to){
		const from = this.currentIcon;
		
		if(from !== to){
			this.currentIcon = to;
			
			if(null === to && !this.resource.isDirectory)
				to = this.getCurrentIcon();
			
			this.emitIconChange(from, to);
		}
	}
	
	
	add(icon, priority){
		if(null == this.icons[priority])
			++this.numIcons;
		
		this.icons[priority] = icon;
		
		if(priority >= this.currentPriority){
			this.currentPriority = priority;
			this.setCurrentIcon(icon);
		}
	}
	
	
	remove(icon, priority){
		if(priority && this.icons[priority] === icon){
			this.icons[priority] = null;
			--this.numIcons;
			
			if(this.currentPriority === priority){
				this.currentPriority = -1;
				this.setCurrentIcon(null);
			}
		}
	}
}


IconDelegate.prototype.destroyed = false;
IconDelegate.prototype.currentIcon = null;
IconDelegate.prototype.currentPriority = -1;

module.exports = IconDelegate;
