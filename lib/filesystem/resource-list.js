"use strict";

const {findBasePath} = require("../utils/general.js");
const Resource       = require("./resource.js");
const {sep}          = require("path");

function PathList(){}
PathList.prototype = new Proxy([], {
	get(target, key, receiver){
		if(key in target)
			return Reflect.get(target, key, receiver);
		const base = findBasePath([...receiver.map(p => p.path)]) + sep;
		return receiver.find(value => {
			const {path} = value;
			return path === key || path.replace(base, "") === key.replace(/^\.\//, "");
		});
	}
});


/**
 * Basic container for holding a collection of {@link Resource} objects.
 *
 * @extends {Array}
 * @class
 */
class ResourceList extends PathList {
	
	/**
	 * Initialise a new list of resources.
	 *
	 * @param {...Resource} args
	 * @throws {TypeError} Arguments must be {Resource} instances.
	 * @constructor
	 */
	constructor(...args){
		super();
		this.push(...this.filterInput(args));
	}
	
	
	/**
	 * Append resources to the list.
	 *
	 * @param {...Resource} args
	 * @return {Number} Updated list length
	 */
	push(...args){
		return super.push(...this.filterInput(args));
	}
	
	
	/**
	 * Prepend resources to the list.
	 *
	 * @param {...Resource} args
	 * @return {Number} Updated list length
	 */
	unshift(...args){
		return super.unshift(...this.filterInput(args));
	}
	
	
	
	/**
	 * Return a copy of an iterable with duplicate elements removed.
	 *
	 * Each element is validated with {@link ResourceList.assertResource};
	 * an exception is thrown if an invalid type is encountered.
	 *
	 * @param {Iterable} list
	 * @return {Array}
	 * @throws {TypeError}
	 */
	filterInput(list){
		return list.map(item => {
			if(!item) return null;
			ResourceList.assertResource(item);
			return ~this.indexOf(item) ? null : item;
		}).filter(Boolean);
	}
	
	
	/**
	 * Return an array of {@link File|Files} or file-like resources.
	 *
	 * @return {Array}
	 */
	get files(){
		return this.filter(resource => !resource.isDirectory);
	}
	
	
	/**
	 * Return an array of directory-like resources.
	 *
	 * @return {Array}
	 */
	get directories(){
		return this.filter(resource => resource.isDirectory);
	}
	
	
	/**
	 * Raise an exception if the argument is not a {Resource} instance.
	 *
	 * @param {Mixed} input
	 * @throws {TypeError}
	 * @static
	 */
	static assertResource(input){
		const isResource = input instanceof Resource;
		if(!isResource){
			const {format} = require("util");
			const message = format("Object is not a Resource instance: %j", input);
			throw new TypeError(message);
		}
	}
}


module.exports = ResourceList;
