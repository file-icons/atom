"use strict";

const {CompositeDisposable, Disposable} = require("atom");


/**
 * Map-based equivalent of a {@link CompositeDisposable}.
 *
 * @class
 */
class MappedDisposable {
	
	/**
	 * Create a new instance, optionally with a list of keys and disposables.
	 *
	 * @example new MappedDisposable([ [key1, disp1], [key2, disp2] ]);
	 * @param {*} [iterable]
	 * @constructor
	 */
	constructor(iterable = null){
		this.disposables = new Map();
		
		if(null !== iterable)
			for(let [key, value] of iterable){
				if(!(value instanceof CompositeDisposable))
					value = new CompositeDisposable(value);
				this.disposables.set(key, value);
			}
	}
	

	/**
	 * Delete keys and dispose of their values.
	 *
	 * If passed no arguments, the method disposes of everything, rendering the
	 * MappedDisposable instance completely inert. Future method calls do nothing.
	 *
	 * @param {...} [keys] - Keys to dispose
	 */
	dispose(...keys){
		if(this.disposed)
			return;
		
		// If objects were provided, target the disposables specifically
		if(keys.length){
			for(const key of keys){
				const disposable = this.disposables.get(key);
				if(key && "function" === typeof key.dispose)
					key.dispose();
				if(disposable){
					disposable.dispose();
					this.disposables.delete(key);
				}
			}
		}
		
		// Otherwise, dispose the MappedDisposable itself
		else{
			this.disposed = true;
			this.disposables.forEach((value, key) => {
				value.dispose();
				if(key && "function" === typeof key.dispose)
					key.dispose();
			});
			this.disposables.clear();
			this.disposables = null;
		}
	}
	
	
	/**
	 * Key one or more disposables to an object.
	 *
	 * @param {*} key
	 * @param {...} disposables
	 */
	add(key, ...disposables){
		if(this.disposed)
			return;
		
		const keyDisposables = this.disposables.get(key);
		keyDisposables
			? keyDisposables.add(...disposables)
			: this.disposables.set(key, new CompositeDisposable(...disposables));
	}


	/**
	 * Remove a disposable from an object's disposables list.
	 *
	 * If no disposables are passed, the object itself is removed from the
	 * MappedDisposable. Any disposables keyed to it are not disposed of.
	 *
	 * @param {*} key
	 * @param {...} [disposables]
	 */
	remove(key, ...disposables){
		if(this.disposed)
			return;
		
		const disposable = this.disposables.get(key);
		if(disposable){
			
			// Remove specific disposables if any were provided
			if(disposables.length){
				for(const unwantedDisposable of disposables)
					disposable.remove(unwantedDisposable);
			}
			
			// Otherwise, remove the keyed object itself
			else this.disposables.delete(key);
		}
	}
	
	
	/**
	 * Alias of {@link MappedDisposable#remove}, included for parity with {@link Map} objects.
	 *
	 * @param {*} key
	 * @param {...} [disposables]
	 * @see {@link MappedDisposable#remove}
	 */
	delete(key, ...disposables){
		this.remove(key, ...disposables);
	}
	
	
	/**
	 * Clear the contents of the MappedDisposable.
	 *
	 * Disposables keyed to objects are not disposed of.
	 */
	clear(){
		if(this.disposed)
			return;
		this.disposables.clear();
	}


	/**
	 * Number of entries (key/disposable pairs) stored in the instance.
	 *
	 * @readonly
	 * @return {Number}
	 */
	get size(){
		return this.disposed
			? 0
			: this.disposables.size;
	}	
	
	
	/**
	 * Determine if an entry with the given key exists in the MappedDisposable.
	 *
	 * @param {*} key
	 * @return {Boolean}
	 */
	has(key){
		return this.disposed
			? false
			: this.disposables.has(key);
	}
	
	
	/**
	 * Retrieve the disposables list keyed to an object.
	 *
	 * If the MappedDisposable has been disposed, the method returns `undefined`.
	 *
	 * @param {*} key
	 * @return {CompositeDisposable}
	 */
	get(key){
		return this.disposed
			? undefined
			: this.disposables.get(key);
	}
	
	
	/**
	 * Replace the disposable that's keyed to an object.
	 *
	 * A TypeError is thrown if the object lacks a `dispose` method.
	 *
	 * @param {*} key
	 * @param {Disposable} value
	 */
	set(key, value){
		if(this.disposed)
			return;
		
		if(!Disposable.isDisposable(value))
			throw new TypeError("Value must have a .dispose() method");
		
		this.disposables.set(key, value);
	}
}


MappedDisposable.prototype.disposed = false;

module.exports = MappedDisposable;
