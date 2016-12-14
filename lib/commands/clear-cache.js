"use strict";

const Storage = require("../storage.js");


module.exports = {
	
	/**
	 * Clear the contents of the session's cache.
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
};
