"use strict";const{CompositeDisposable,Emitter}=require("atom"),{EntityType,normalisePath}=require("atom-fs"),StrategyManager=require("./strategy-manager.js"),IconTables=require("../icons/icon-tables.js"),Options=require("../options.js"),Storage=require("../storage.js");class IconDelegate{constructor(resource){this.resource=resource,this.disposables=new CompositeDisposable,this.emitter=new Emitter,this.icons=[],this.numIcons=0,this.deserialise()}destroy(){this.destroyed||(this.destroyed=true,this.emitter.emit("did-destroy"),this.emitter.dispose(),this.emitter=null,this.disposables.dispose(),this.disposables.clear(),this.disposables=null,this.resource=null,this.icons=null)}onDidDestroy(fn){return this.emitter.on("did-destroy",fn)}onDidChangeIcon(fn){return this.emitter.on("did-change-icon",fn)}onDidChangeMaster(fn){return this.emitter.on("did-change-master",fn)}/**
	 * Instruct {@link IconNode|IconNodes} to reapply their element's CSS classes.
	 *
	 * @param {Icon} from
	 * @param {Icon} to
	 * @emits did-change-icon
	 * @private
	 */emitIconChange(from,to){this.emitter&&this.emitter.emit("did-change-icon",{from,to})}/**
	 * Return the CSS classes for displaying the delegate's icon.
	 *
	 * @return {Array}
	 */getClasses(){const colourMode=Options.colourChangedOnly&&!this.resource.vcsStatus?null:Options.colourMode,icon=this.master?this.master.getCurrentIcon():this.getCurrentIcon();let classes=icon?icon.getClass(colourMode,true):this.getFallbackClasses();const replacement=this.getReplacementClass();return replacement&&(classes?classes[0]=replacement:classes=[replacement]),classes}/**
	 * Return the icon-classes to use when nothing matches.
	 *
	 * @return {String[]}
	 * @private
	 */getFallbackClasses(){const{resource}=this;if(resource.type&EntityType.DIRECTORY)return["icon-file-directory"];if(resource.isBinary)return["icon-file-binary"];else{const classes=Options.defaultIconClass||[];// Avoid referencing original array; return value is subject to modification
return classes.slice(0)}}/**
	 * Return an icon-class to replace the one used by the delegate.
	 *
	 * Used only in very specific circumstances, when the nature of an entity
	 * takes precedence over usual icon-matching strategies. Examples include
	 * symbolic links and submodule folders. Delegates may still apply their
	 * colour classes, hence the reason a fixed value isn't used.
	 *
	 * @private
	 * @return {String} Name of a CSS class, or the empty string if
	 * no class replacement should be made.
	 */getReplacementClass(){const{resource}=this;if(resource.isRepository&&resource.isRoot)return"icon-repo";if(resource.isSymlink){const type=resource.isDirectory?"directory":"file";return"icon-file-symlink-"+type}return resource.isSubmodule?"icon-file-submodule":""}/**
	 * Retrieve the delegate's active icon.
	 *
	 * If no icon is found, an attempt is made to locate it.
	 *
	 * @return {Icon}
	 */getCurrentIcon(){if(this.currentIcon)return this.currentIcon;if(0<this.numIcons)for(let i=this.icons.length-1;0<=i;--i){const icon=this.icons[i];if(icon)return this.setCurrentIcon(icon,i),icon}return StrategyManager.query(this.resource),this.currentIcon||null}/**
	 * Change the currently-active icon.
	 *
	 * @param {Icon} to
	 * @param {Number} priority
	 * @emits did-change-icon
	 */setCurrentIcon(to,priority=null){const from=this.currentIcon;from!==to&&(this.currentIcon=to,null!==priority&&(this.currentPriority=priority),null===to&&~this.resource.type&EntityType.DIRECTORY&&(to=this.getCurrentIcon()),this.serialise(),this.emitIconChange(from,to))}add(icon,priority){null==this.icons[priority]&&++this.numIcons,this.icons[priority]=icon,priority>=this.currentPriority&&this.setCurrentIcon(icon,priority)}remove(icon,priority){this.icons[priority]===icon&&(this.icons[priority]=null,--this.numIcons,this.currentPriority===priority&&this.setCurrentIcon(null,-1))}deserialise(){// HACK: https://github.com/file-icons/atom/issues/568#issuecomment-288983875
if(!this.resource)return;const path=normalisePath(this.resource.path);if(!Storage.hasIcon(path))return;const{isDirectory}=this.resource,icons=isDirectory?IconTables.directoryIcons:IconTables.fileIcons,{priority,index,iconClass}=Storage.getPathIcon(path),icon=icons.byName[index];// Verify cache is accurate
icon&&iconClass===icon.icon?this.add(icon,priority):Storage.deletePathIcon(path),setImmediate(()=>StrategyManager.query(this.resource))}serialise(){if(!Storage.locked){const path=normalisePath(this.resource.path),icon=this.currentIcon;icon?Storage.setPathIcon(path,{priority:this.currentPriority,iconClass:icon.icon,index:icon.index}):Storage.deletePathIcon(path)}}/**
	 * Parent delegate from which to inherit icons and change events.
	 *
	 * NOTE: Assignment is irrevocable. Surrogate instances cannot be
	 * recovered once bound: only reassigned a different master. This
	 * mechanism exists for symlink use only.
	 *
	 * FIXME: This should be a method, not a property. Destructively
	 * redefining a property when writing to it is seriously weird.
	 * 
	 * @param {IconDelegate} input
	 * @emits did-change-master
	 */set master(input){if(null==input||input.master===this)return;const originalIcon=this.currentIcon;let masterDelegate=null,disposable=null;Object.defineProperties(this,{master:{get:()=>masterDelegate,set:to=>{const from=masterDelegate;(to=to||null)!==from&&(masterDelegate=to,disposable&&(disposable.dispose(),disposable=null),to&&to instanceof IconDelegate&&!to.destroyed&&(disposable=new CompositeDisposable(to.onDidDestroy(()=>this.master=null),to.onDidChangeMaster(to=>this.master=to),to.onDidChangeIcon(change=>{const{from,to}=change;this.emitIconChange(from,to)}))),this.emitter&&this.emitter.emit("did-change-master",{from,to}),to=this.currentIcon,this.emitIconChange(originalIcon,to))}}}),this.master=input}}IconDelegate.prototype.destroyed=false,IconDelegate.prototype.currentIcon=null,IconDelegate.prototype.currentPriority=-1,IconDelegate.prototype.master=null,module.exports=IconDelegate;