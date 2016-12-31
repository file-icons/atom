"use strict";

const {CompositeDisposable, Disposable, Emitter} = require("atom");
const StrategyManager = require("./strategy-manager.js");
const IconTables = require("../icons/icon-tables.js");
const Options = require("../options.js");
const Storage = require("../storage.js");


class IconDelegate{
	
	constructor(resource){
		this.resource    = resource;
		this.disposables = new CompositeDisposable();
		this.emitter     = new Emitter();
		this.icons       = [];
		this.numIcons    = 0;
		this.deserialise();
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
	
	onDidChangeMaster(fn){
		return this.emitter.on("did-change-master", fn);
	}
	
	emitIconChange(from, to){
		if(this.emitter)
			this.emitter.emit("did-change-icon", {from, to});
	}
	
	
	/**
	 * Return the CSS classes for displaying the delegate's icon.
	 *
	 * @return {Array}
	 */
	getClasses(){
		const {resource} = this;
		
		let {colourMode} = Options;
		if(Options.colourChangedOnly && !resource.vcsStatus)
			colourMode = null;
		
		const icon = this.master
			? this.master.getCurrentIcon()
			: this.getCurrentIcon();
		let classes = icon
			? icon.getClass(colourMode, true)
			: this.getFallbackClasses();
		
		if(resource.isSymlink){
			const type = resource.isDirectory ? "directory" : "file";
			const linkClass = "icon-file-symlink-" + type;
			classes
				? classes[0] = linkClass
				: classes = [linkClass];
		}
		
		else if(resource.isSubmodule){
			const moduleClass = "icon-file-submodule";
			classes
				? classes[0] = moduleClass
				: classes = [moduleClass];
		}
		
		return classes;
	}
	
	
	/**
	 * Return the delegate's default CSS classes.
	 *
	 * @return {Array}
	 */
	getFallbackClasses(){
		const {resource} = this;
		
		// Show default directory icons
		if(resource.isDirectory)
			return resource.isRepo
				? ["icon-repo"]
				: ["icon-file-directory"];
		
		if(resource.isBinary)
			return ["icon-file-binary"];
		
		return [...Options.defaultIconClass];
	}
	
	
	/**
	 * Retrieve the delegate's active icon.
	 *
	 * If no icon is found, an attempt is made to locate it.
	 *
	 * @return {Icon}
	 */
	getCurrentIcon(){
		if(this.currentIcon)
			return this.currentIcon;
		
		else{
			if(this.numIcons > 0)
				for(let i = this.icons.length - 1; i >= 0; --i){
					const icon = this.icons[i];
					
					if(icon){
						this.setCurrentIcon(icon, i);
						return icon;
					}
				}
			
			StrategyManager.query(this.resource);
			return this.currentIcon || null;
		}
	}
	
	
	/**
	 * Change the currently-active icon.
	 *
	 * @param {Icon} to
	 * @param {Number} priority
	 * @emits did-change-icon
	 */
	setCurrentIcon(to, priority = null){
		const from = this.currentIcon;
		
		if(from !== to){
			this.currentIcon = to;
			
			if(null !== priority)
				this.currentPriority = priority;
			
			if(null === to && !this.resource.isDirectory)
				to = this.getCurrentIcon();
			
			this.serialise();
			this.emitIconChange(from, to);
		}
	}
	
	
	add(icon, priority){
		if(null == this.icons[priority])
			++this.numIcons;
		
		this.icons[priority] = icon;
		
		if(priority >= this.currentPriority)
			this.setCurrentIcon(icon, priority);
	}
	
	
	remove(icon, priority){
		if(this.icons[priority] === icon){
			this.icons[priority] = null;
			--this.numIcons;
			
			if(this.currentPriority === priority)
				this.setCurrentIcon(null, -1);
		}
	}
	
	
	deserialise(){
		const {path, isDirectory} = this.resource;
		
		if(!Storage.hasIcon(path))
			return;
		
		const icons = isDirectory
			? IconTables.directoryIcons
			: IconTables.fileIcons;
		
		const {priority, index, iconClass} = Storage.getPathIcon(path);
		const icon = icons.byName[index];
		
		// Verify cache is accurate
		(icon && iconClass === icon.icon)
			? this.add(icon, priority)
			: Storage.deletePathIcon(path);
		
		setImmediate(_=> StrategyManager.query(this.resource));
	}
	
	
	serialise(){
		if(!Storage.locked){
			const {path} = this.resource;
			const icon = this.currentIcon;
			
			if(icon)
				Storage.setPathIcon(path, {
					priority:  this.currentPriority,
					iconClass: icon.icon,
					index:     icon.index
				});
			
			else
				Storage.deletePathIcon(path);
		}
	}
	
	
	
	
	/**
	 * Parent delegate from which to inherit icons and change events.
	 *
	 * NOTE: Assignment is irrevocable. Surrogate instances cannot be
	 * recovered once bound: only reassigned a different master. This
	 * mechanism exists for symlink use only.
	 *
	 * @param {IconDelegate} input
	 * @emits did-change-master
	 */
	set master(input){
		if(null == input || input.master === this)
			return;
		
		const originalIcon = this.currentIcon;
		let currentIcon    = originalIcon;
		let masterDelegate = null;
		let disposable     = null;
		
		Object.defineProperties(this, {
			master: {
				get: () => masterDelegate,
				set: to => {
					const from = masterDelegate;
					if((to = to || null) !== from){
						masterDelegate = to;
						
						if(disposable){
							disposable.dispose();
							disposable = null;
						}
						
						if(to)
							disposable = new CompositeDisposable(
								to.onDidDestroy(_=> this.master = null),
								to.onDidChangeMaster(to => this.master = to),
								to.onDidChangeIcon(change => {
									const {from, to} = change;
									this.emitIconChange(from, to);
								})
							);
						
						if(this.emitter)
							this.emitter.emit("did-change-master", {from, to});
						
						to = this.currentIcon;
						this.emitIconChange(currentIcon, to);
					}
				}
			}
		});
		
		this.master = input;
	}
}


IconDelegate.prototype.destroyed = false;
IconDelegate.prototype.currentIcon = null;
IconDelegate.prototype.currentPriority = -1;
IconDelegate.prototype.master = null;

module.exports = IconDelegate;
