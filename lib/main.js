"use strict";

const FileIcons = {
	get storage (){ return require("./storage.js"); },
	get options (){ return require("./options.js"); },
	get ui      (){ return require("./ui.js");      },
	get service (){ return require("./service/icon-service.js");},

	activate(state){
		global._FileIcons = this;
		this.storage.init(state);
		this.options.init();
		this.ui.init();
		this.ui.observe();
		this.service.init();
	},

	deactivate(){
		this.storage.lock();
		this.service.reset();
		this.ui.reset();
		this.options.reset();
		delete global._FileIcons;
	},

	serialize(){
		return this.storage.serialize();
	},

	provideService(){
		return this.service.addIconToElement;
	},

	suppressFOUC(){
		return this.service.suppressFOUC();
	},
};

module.exports = FileIcons;
