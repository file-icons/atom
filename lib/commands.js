"use strict";

const MappedDisposable = require("./utils/mapped-disposable.js");
const Options = require("./options.js");
const Storage = require("./storage.js");


class Commands {
	
	/**
	 * Initialise and register the package's commands.
	 */
	init(){
		this.disposables = new MappedDisposable();
		
		this.add("clear-cache",    () => this.clearCache());
		this.add("toggle-colours", () => Options.toggle("coloured"));
		this.add("show-outlines",  () => Options.toggle("showOutlines"));
	}
	
	
	/**
	 * Unregister commands when deactivating package.
	 */
	reset(){
		this.disposables.dispose();
		this.disposables = null;
	}
	
	
	/**
	 * Clear the contents of the session's cache.
	 *
	 * @see {@link Storage#reset}
	 */
	clearCache(){
		if(Storage.locked){
			const detail = "This shouldn't have happened. Please restart Atom.";
			atom.notifications.addError("Storage locked", {detail});
			return;
		}
		
		const {size} = Storage;
		Storage.reset();
		
		const plural = size === 1 ? "" : "s";
		const message = `Cleared ${size} path${plural} from icon cache.`;
		atom.notifications.addInfo(message, {dismissable: true});
	}
	
	
	/**
	 * Register a package command.
	 *
	 * @param {String} name
	 * @param {Function} fn
	 * @private
	 */
	add(name, fn){
		if(this.disposables.has(name))
			return;
		
		const id = `${Options.namespace}:${name}`;
		const cmd = atom.commands.add("atom-workspace", id, fn);
		this.disposables.set(name, cmd);
	}
}


module.exports = new Commands();
