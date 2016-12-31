"use strict";

const {join, sep}  = require("path");
const {CompositeDisposable, Disposable, Emitter} = require("atom");
const {punch}      = require("../utils/general.js");
const FileSystem   = require("../filesystem/filesystem.js");
const IconNode     = require("../service/icon-node.js");


/**
 * Abstract base class to monkey-patch a consumer package.
 *
 * @class
 * @abstract
 */
class Consumer{
	
	constructor(name){
		if(!(this.name = name))
			throw new TypeError("Consumer subclasses must specify a package name");
	}
	
	
	/** Register handlers to monkey-patch target package. */
	init(){
		this.active    = false;
		this.package   = null;
		this.iconNodes = new Set();
		this.emitter   = new Emitter();
		
		setImmediate(() => this.updateStatus());
		this.disposables = new CompositeDisposable(
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
			this.emitter = null;
		}
		
		if(this.disposables){
			this.disposables.dispose();
			this.disposables = null;
		}
		
		this.resetNodes();
		this.active = false;
		this.package = null;
		this.iconNodes = null;
		this.packagePath = null;
		this.packageModule = null;
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
		if(!this.punchedMethods){
			this.punchedMethods = new CompositeDisposable(
				new Disposable(() => this.punchedMethods = null)
			);
			this.disposables.add(this.punchedMethods);
		}
		
		const [originalMethod] = punch(object, method, fn);
		this.punchedMethods.add(new Disposable(() => {
			object[method] = originalMethod;
		}));
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
			if(this.punchedMethods){
				this.punchedMethods.dispose();
				this.punchedMethods = null;
			}
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
}


module.exports = Consumer;
