"use strict";

const {CompositeDisposable, Disposable} = require("atom");
const {getFirstLine} = require("../utils.js");
const FileRegistry = require("../filesystem/file-registry.js");
const IconService = require("./icon-service.js");


/**
 * Discrete method for determining a {@link Resource}'s icon.
 *
 * @abstract
 * @class
 */
class Strategy{
	
	/**
	 * Configure what the strategy does and how it matches icons.
	 *
	 * @constructor
	 * @param {Object}  opts                      - An object defining the strategy's behaviour.
	 * @param {String}  [opts.name=""]            - Name used when serialising matched icons.
	 * @param {Number}  [opts.priority=0]         - Determines precedence over other strategies.
	 * @param {Boolean} [opts.matchesFiles=true]  - Should the strategy check {@link File} objects?
	 * @param {Boolean} [opts.matchesDirs=false]  - Should the strategy check directories?
	 * @param {Boolean} [opts.usesFileData=false] - Indicates the strategy uses file content for determining
	 *                                              matches. See {@link Strategy#trackDataChanges}.
	 */
	constructor(opts = {}){
		const {
			name          = "",
			priority      = 0,
			matchesFiles  = true,
			matchesDirs   = false,
			usesFileData  = false
		} = opts;
		
		this.name         = name || "";
		this.priority     = +priority || 0;
		this.matchesFiles = !!matchesFiles;
		this.matchesDirs  = !!matchesDirs;
		this.usesFileData = !!usesFileData;

		/**
		 * @property {Boolean} enabled - Activation status, governed by package settings.
		 */
		this.enabled = null;
		
		/**
		 * @property {Map} resources - A mapping of {@link Resource} ⇒ {@link Icon} matches.
		 * Resources the strategy hasn't matched are assigned `null`. The value itself is `null`
		 * if the strategy has been deactivated.
		 */
		this.resources = null;
		
		/**
		 * @property {Map} resourceEvents - A map of {@link Resource} ⇒ {@link CompositeDisposables}.
		 * Used for storing subscriptions that should only be registered once per resource. Disposed
		 * and nulled when disabling strategy.
		 */
		this.resourceEvents = null;
	}
	
	
	/**
	 * Activate the strategy.
	 *
	 * @return {Boolean} False if already enabled.
	 */
	enable(){
		if(this.enabled)
			return false;
		
		this.resources = new Map();
		this.enabled = true;
		this.resourceEvents = new Map();
		
		if(IconService.isReady)
			this.checkAll();
		
		return true;
	}
	
	
	/**
	 * Deactivate the strategy.
	 *
	 * @return {Boolean} False if already disabled.
	 */
	disable(){
		if(!this.enabled)
			return false;
		
		this.resourceEvents.forEach(disposable => disposable.dispose());
		
		this.resources.forEach((icon, resource) => {
			resource.icon && resource.icon.remove(icon, this.priority);
		});
		
		this.resourceEvents.clear();
		this.resourceEvents = null;
		this.resources.clear();
		this.resources = null;
		this.enabled = false;
		
		return true;
	}
	
	
	/**
	 * Evaluate a resource to determine if an icon matches.
	 *
	 * The method is executed within a loop by the {@link StrategyManager}.
	 * Returning a truthy value indicates a match was made and remaining
	 * strategies need not be consulted.
	 *
	 * Actual icon assignment/removal is handled by the {@link addIcon} and
	 * {@link deleteIcon} methods, respectively. Subclasses should override
	 * {@link matchIcon} to determine what icon is matched for a resource.
	 *
	 * @param {Resource} resource
	 * @param {Boolean} useExisting - If false, will ignore the last match
	 * @return {Boolean}
	 */
	check(resource, useExisting = true){
		if(useExisting && this.resources.get(resource))
			return false;
		
		else{
			this.registerResource(resource);
			const icon = this.matchIcon(resource);
			return icon
				? this.addIcon(resource, icon)
				: this.deleteIcon(resource);
		}
	}
	
	
	/**
	 * Evaluate every currently registered resource.
	 *
	 * @param {Boolean} useExisting - Discard existing matches
	 */
	checkAll(useExisting = true){
		for(const [_, file] of FileRegistry.files)
			this.check(file, useExisting);
	}
	
	
	/**
	 * Add an icon to the resource's {@link IconDelegate}.
	 *
	 * @param {Resource} resource
	 * @param {Icon} icon
	 * @return {Boolean} Always returns `true`.
	 */
	addIcon(resource, icon){
		this.resources.set(resource, icon);
		resource.icon.add(icon, this.priority);
		return true;
	}
	
	
	/**
	 * Remove an icon from a resource's {@link IconDelegate}.
	 *
	 * @param {Resource} resource
	 * @return {Boolean} Always returns `false`.
	 */
	deleteIcon(resource){
		const icon = this.resources.get(resource);
		if(icon)
			resource.icon.remove(icon, this.priority);
		this.resources.set(resource, null);
		return false;
	}
	
	
	/**
	 * Retrieve an {@link Icon} for a resource.
	 *
	 * This method does nothing by default: it exists as an extension point
	 * for subclasses. If no match is found, the method must return `null`.
	 *
	 * @param {Resource} resource
	 * @return {Icon}
	 * @abstract
	 */
	matchIcon(resource){
		return null;
	}
	
	
	/**
	 * Attach subscriptions to a newly-discovered resource.
	 *
	 * Subclasses should extend this if they need to monitor resource
	 * behaviour. Note that setting `usesFileData` will automatically
	 * attach listeners to respond to file modifications.
	 *
	 * @see {@link trackDataChanges}
	 * @param {Resource} resource
	 * @return {Boolean} False if the resource was already registered
	 */
	registerResource(resource){
		if(this.resourceEvents.has(resource))
			return false;
		
		const onDestroyed = resource.onDidDestroy(() => disposables.dispose());
		const disposables = new CompositeDisposable(onDestroyed);
		this.resourceEvents.set(resource, disposables);
		
		if(this.usesFileData)
			disposables.add(this.trackDataChanges(resource));
		
		return true;
	}
	
	
	/**
	 * Register a handler to rerun the strategy when the resource is modified.
	 *
	 * This method is automatically called by {@link registerResource} if
	 * the strategy has enabled `usesFileData`.
	 *
	 * @param {Resource} resource - Resource to monitor
	 * @param {Function} handler - Custom handler to replace the default
	 * @return {Disposable} The disposable returned by resource.onDidChangeData
	 */
	trackDataChanges(resource, handler = null){
		handler = handler || (change => {
			const from = getFirstLine(change.from);
			const to   = getFirstLine(change.to);
			
			if(from !== to)
				this.check(resource, false);
		});
		
		return resource.onDidChangeData(handler);
	}
}


module.exports = Strategy;
