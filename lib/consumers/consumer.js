"use strict";

const {join, sep}  = require("path");
const {CompositeDisposable, Disposable, Emitter} = require("atom");
const {MappedDisposable, punch} = require("alhadis.utils");
const {FileSystem} = require("atom-fs");
const IconNode     = require("../service/icon-node.js");


/**
 * Abstract base class to monkey-patch a consumer package.
 *
 * @class
 * @abstract
 */
class Consumer{
	
	/**
	 * Determine if a package still needs monkey-patching.
	 *
	 * @param {String} packageName
	 * @return {Boolean}
	 * @private
	 */
	static needsPatch(packageName){
		const pkg =
			atom.packages.activePackages[packageName] ||
			atom.packages.loadedPackages[packageName];
		
		// No package data? Load consumer anyway; the package might be installed later
		if(!pkg || !pkg.metadata) return true;
		
		const services = pkg.metadata.consumedServices;
		
		// For Nuclide, anything is better than nothing. Take whatever we can get.
		if("nuclide" === packageName && services && services["atom.file-icons"])
			return false;
		
		return !(services && services["file-icons.element-icons"]);
	}
	
	
	/**
	 * Initialise a new {Consumer} object; should be subclassed.
	 * 
	 * @param {String} name - Name of targeted package
	 * @constructor
	 */
	constructor(name){
		if(!(this.name = name))
			throw new TypeError("Consumer subclasses must specify a package name");
		
		this.disposables = new MappedDisposable();
		this.iconNodes   = new Set();
		this.emitter     = new Emitter();
		
		if(atom.inSpecMode() && !Consumer.needsPatch(name))
			this.isPhony = true;
		
		const pkg = atom.packages.loadedPackages[name];
		if(pkg){
			this.package     = pkg;
			this.packagePath = pkg.path;
			this.packageMeta = pkg.metadata;
			
			if(this.isPhony) return;
			if(this.packagePath)
				try{ this.preempt(); }
				catch(error){
					const name = this.packagePath.replace(/(?:^|[-_])(\w)/g, s => s.toUpperCase());
					console.error("FILE-ICONS: Error patching " + name, error);
				}
		}
	}
	
	
	/** Register handlers to monkey-patch target package. */
	init(){
		this.active    = false;
		this.package   = null;
		
		setImmediate(() => this.updateStatus());
		this.disposables.add(
			atom.packages.onDidActivatePackage(() => this.updateStatus()),
			atom.packages.onDidDeactivatePackage(() => this.updateStatus()),
			atom.packages.onDidActivateInitialPackages(() => this.updateStatus())
		);
	}
	
	
	/**
	 * Free up memory when deactivating package.
	 *
	 * @emits did-destroy
	 * @private
	 */
	reset(){
		if(this.emitter){
			this.emitter.emit("did-destroy");
			this.emitter.dispose();
		}
		
		if(this.disposables){
			this.disposables.dispose();
			this.disposables.clear();
		}
		
		this.resetNodes();
		this.active = false;
		this.package = null;
		this.packagePath = null;
		this.packageModule = null;

		this.disposables = new MappedDisposable();
		this.iconNodes   = new Set();
		this.emitter     = new Emitter();
	}
	
	
	/**
	 * Wipe all {IconNode} instances the {Consumer} has generated.
	 *
	 * @private
	 */
	resetNodes(){
		this.iconNodes.forEach(node => node.destroy());
		this.iconNodes.clear();
	}
	
	
	/**
	 * Helper function to track methods as they're patched.
	 *
	 * Patched methods are restored when the package is deactivated.
	 *
	 * @param {Object} object
	 * @param {String} method
	 * @param {Function} fn
	 * @private
	 */
	punch(object, method, fn){
		if(this.isPhony) return;
		const key = "punched-methods";
		if(!this.disposables.has(key))
			this.disposables.add(key, new Disposable(() => this.disposables.dispose(key)));
		
		const [originalMethod] = punch(object, method, fn);
		this.disposables.add(key, new Disposable(() => object[method] = originalMethod));
	}
	
	
	/**
	 * Helper function to punch the instances of a package class.
	 *
	 * @param {String} classPath - Path relative to package root
	 * @param {Object} methods - Hash of named functions to override
	 * @see {@link #punch}
	 * @private
	 */
	punchClass(classPath, methods){
		if(this.isPhony) return;
		const viewClass = this.loadPackageFile(classPath);
		
		for(const name in methods){
			const handler = methods[name];
			this.punch(viewClass.prototype, name, function(oldFn, args){
				const result = oldFn();
				handler(this, ...args);
				return result;
			});
		}
	}
	
	
	/**
	 * Register an entry the consumer uses to represent a filesystem resource.
	 *
	 * @param {String} path - Absolute pathname; need not exist physically
	 * @param {HTMLElement} iconElement - DOM element receiving icon classes
	 * @return {IconNode}
	 */
	trackEntry(path, iconElement, type = FileSystem.FILE){
		if(this.isPhony)
			return IconNode.forElement(iconElement, path);
		const file = FileSystem.get(path, type);
		const icon = new IconNode(file, iconElement);
		this.iconNodes.add(icon);
		return icon;
	}
	
	
	/**
	 * Respond to changes in the targeted package's activation status.
	 *
	 * @return {Boolean}
	 * @private
	 */
	updateStatus(){
		const pkg = atom.packages.activePackages[this.name];
		
		if(pkg && !this.active){
			this.active        = true;
			this.package       = pkg;
			this.packagePath   = pkg.path;
			this.packageModule = pkg.mainModule;
			this.activate();
			return true;
		}
		
		else if(!pkg && this.active){
			this.active        = false;
			this.package       = null;
			this.packagePath   = null;
			this.packageModule = null;
			this.resetNodes();
			this.deactivate();
			return false;
		}
	}
	
	
	/**
	 * Import a file used by the consumer package.
	 *
	 * @param {String} path - Include path relative to package root
	 * @return {Mixed} Whatever the target file exports
	 */
	loadPackageFile(path){
		const chunks = path.replace(/^\.\//, "").split(/[\/\\]+/).filter(Boolean);
		const reqPath = join(this.package.path, ...chunks);
		return require(reqPath);
	}
	
	
	/**
	 * Subscribe to an event, avoiding breakage if emitter is absent.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Disposable}
	 */
	subscribe(event, fn){
		return this.emitter
			? this.emitter.on(event, fn)
			: new Disposable();
	}
	
	
	/**
	 * Dispatch an event, avoiding breakage if emitter is absent.
	 *
	 * @param {String} event
	 * @param {Mixed} value
	 */
	emit(event, value){
		if(this.emitter)
			this.emitter.emit(event, value);
	}


	/**
	 * Execute necessary logic before target package has activated.
	 *
	 * Extension point for subclasses; this method is a noop by default.
	 * @abstract
	 * @private
	 */
	preempt(){
		
	}
	
	
	/**
	 * Execute the necessary logic when target package is activated.
	 *
	 * This method exists solely as an extension point for subclasses.
	 * @abstract
	 * @private
	 */
	activate(){
		
	}
	
	
	/**
	 * Execute any necessary logic after the target package is deactivated.
	 *
	 * Extension point for subclasses; this method does nothing on its own.
	 * @abstract
	 * @private
	 */
	deactivate(){
		
	}
}


Consumer.prototype.isPhony = false;
Consumer.prototype.jQueryRemoved = null;
module.exports = Consumer;
