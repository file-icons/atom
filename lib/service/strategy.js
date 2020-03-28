"use strict";function _createForOfIteratorHelperLoose(o){var i=0;if("undefined"==typeof Symbol||null==o[Symbol.iterator]){if(Array.isArray(o)||(o=_unsupportedIterableToArray(o)))return function(){return i>=o.length?{done:true}:{done:false,value:o[i++]}};throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}return i=o[Symbol.iterator](),i.next.bind(i)}function _unsupportedIterableToArray(o,minLen){if(o){if("string"==typeof o)return _arrayLikeToArray(o,minLen);var n=Object.prototype.toString.call(o).slice(8,-1);return"Object"===n&&o.constructor&&(n=o.constructor.name),"Map"===n||"Set"===n?Array.from(n):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?_arrayLikeToArray(o,minLen):void 0}}function _arrayLikeToArray(arr,len){(null==len||len>arr.length)&&(len=arr.length);for(var i=0,arr2=Array(len);i<len;i++)arr2[i]=arr[i];return arr2}const{CompositeDisposable}=require("atom"),{FileSystem}=require("atom-fs"),IconService=require("./icon-service.js");/**
 * Discrete method for determining a {@link Resource}'s icon.
 *
 * @abstract
 * @class
 */class Strategy{/**
	 * Configure what the strategy does and how it matches icons.
	 *
	 * @constructor
	 * @param {Object}  opts                      - An object defining the strategy's behaviour.
	 * @param {String}  [opts.name=""]            - Name used when serialising matched icons.
	 * @param {Number}  [opts.priority=0]         - Determines precedence over other strategies.
	 * @param {Boolean} [opts.ignoreVirtual=true] - Skip non-existent or simulated entities.
	 * @param {Boolean} [opts.matchesFiles=true]  - Should the strategy check {@link File} objects?
	 * @param {Boolean} [opts.matchesDirs=false]  - Should the strategy check directories?
	 * @param {Boolean} [opts.noSetting=false]    - Always keep the strategy active.
	 */constructor(opts={}){const{name="",priority=0,ignoreVirtual=true,matchesFiles=true,matchesDirs=false,noSetting=false}=opts;/**
		 * @property {Boolean} enabled - Activation status, governed by package settings.
		 */ /**
		 * @property {Map} resources - A mapping of {@link Resource} ⇒ {@link Icon} matches.
		 * Resources the strategy hasn't matched are assigned `null`. The value itself is `null`
		 * if the strategy has been deactivated.
		 */ /**
		 * @property {Map} resourceEvents - A map of {@link Resource} ⇒ {@link CompositeDisposables}.
		 * Used for storing subscriptions that should only be registered once per resource. Disposed
		 * and nulled when disabling strategy.
		 */this.name=name||"",this.priority=+priority||0,this.ignoreVirtual=!!ignoreVirtual,this.matchesFiles=!!matchesFiles,this.matchesDirs=!!matchesDirs,this.noSetting=!!noSetting,this.enabled=null,this.resources=null,this.resourceEvents=null}/**
	 * Activate the strategy.
	 *
	 * @return {Boolean} False if already enabled.
	 */enable(){return!this.enabled&&(this.resources=new Map,this.enabled=true,this.resourceEvents=new Map,IconService.isReady&&this.checkAll(),true)}/**
	 * Deactivate the strategy.
	 *
	 * @return {Boolean} False if already disabled.
	 */disable(){if(!this.enabled)return false;this.resourceEvents.forEach(disposable=>disposable.dispose());for(var _step,_iterator=_createForOfIteratorHelperLoose(this.resources);!(_step=_iterator()).done;){const[resource]=_step.value;resource.icon&&this.deleteIcon(resource)}return this.resourceEvents.clear(),this.resourceEvents=null,this.resources.clear(),this.resources=null,this.enabled=false,true}/**
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
	 */check(resource,useExisting=true){if(this.ignoreVirtual&&resource.isVirtual)return false;if(useExisting&&this.resources.get(resource))return false;else{this.registerResource(resource);const icon=this.matchIcon(resource);return icon?this.addIcon(resource,icon):this.deleteIcon(resource)}}/**
	 * Evaluate every currently registered resource.
	 *
	 * @param {Boolean} useExisting - Discard existing matches
	 */checkAll(useExisting=true){for(var _step2,_iterator2=_createForOfIteratorHelperLoose(FileSystem.paths);!(_step2=_iterator2()).done;){const[,resource]=_step2.value;resource.isDirectory&&!this.matchesDirs||this.check(resource,useExisting)}}/**
	 * Add an icon to the resource's {@link IconDelegate}.
	 *
	 * @param {Resource} resource
	 * @param {Icon} icon
	 * @return {Boolean} Always returns `true`.
	 */addIcon(resource,icon){return this.resources.set(resource,icon),resource.icon.add(icon,this.priority),true}/**
	 * Remove an icon from a resource's {@link IconDelegate}.
	 *
	 * @param {Resource} resource
	 * @return {Boolean} Always returns `false`.
	 */deleteIcon(resource){const icon=this.resources.get(resource);return icon&&resource.icon.remove(icon,this.priority),this.resources.set(resource,null),false}/**
	 * Retrieve an {@link Icon} for a resource.
	 *
	 * This method does nothing by default: it exists as an extension point
	 * for subclasses. If no match is found, the method must return `null`.
	 *
	 * @param {Resource} resource
	 * @return {Icon}
	 * @abstract
	 */matchIcon(){return null}/**
	 * Attach subscriptions to a newly-discovered resource.
	 *
	 * Subclasses should extend this to monitor resource behaviour.
	 *
	 * @param {Resource} resource
	 * @return {Boolean} False if the resource was already registered
	 */registerResource(resource){if(this.resourceEvents.has(resource))return false;const disposables=new CompositeDisposable,onDestroyed=resource.onDidDestroy(()=>{this.resourceEvents.get(resource).dispose(),this.resourceEvents.delete(resource),this.resources.delete(resource),disposables.dispose()});return disposables.add(onDestroyed),this.resourceEvents.set(resource,disposables),true}}module.exports=Strategy;