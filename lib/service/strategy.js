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
	}
	
	
	/**
	 * Activate the strategy.
	 */
	enable(){
		if(this.enabled) return;
		this.resources = new Map();
		this.enabled = true;
		
		if(IconService.isReady)
			for(const [_, file] of FileRegistry.files)
				this.check(file);
	}
	
	
	/**
	 * Deactivate the strategy.
	 */
	disable(){
		if(!this.enabled) return;
		
		this.resources.forEach((icon, resource) => {
			resource.icon && resource.icon.remove(icon, this.priority);
		});
		
		this.resources.clear();
		this.resources = null;
		this.enabled = false;
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
		if(this.resources.has(resource))
			return false;
		
		if(this.usesFileData)
			this.trackDataChanges(resource);
		
		this.resources.set(resource, null);
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
	 * @return {CompositeDisposable}
	 */
	trackDataChanges(resource, handler = null){
		handler = handler || (change => {
			const from = getFirstLine(change.from);
			const to   = getFirstLine(change.to);
			
			if(from !== to)
				this.check(resource, false);
		});
		
		const disposables = new CompositeDisposable(
			resource.onDidDestroy(() => disposables.dispose()),
			resource.onDidChangeData(handler)
		);
		
		return disposables;
	}
}


module.exports = Strategy;
