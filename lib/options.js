"use strict";

const {CompositeDisposable, Emitter} = require("atom");
const UI = require("./ui.js");


class Options{
	
	init(){
		this.disposables = new CompositeDisposable();
		this.emitter = new Emitter();
		
		this.registerOption("coloured");
		this.registerOption("onChanges", "colourChangedOnly");
		this.registerOption("defaultIconClass", null, value => value.split(/\s+/));
		this.registerOption("tabPaneIcon");
		this.registerOption("strategies.grammar");
		this.registerOption("strategies.hashbangs");
		this.registerOption("strategies.modelines");
		this.registerOption("strategies.customTypes");
		this.registerOption("strategies.linguist");
		
		this.registerCommands();
		this.disposables.add(
			atom.config.observe("file-icons.coloured", enabled => {
				document.body.classList.toggle("file-icons-colourless", !enabled);
			})
		);
	}
	
	
	reset(){
		this.disposables.dispose();
		this.disposables = null;
		this.emitter.emit("did-destroy");
		this.emitter.dispose();
		this.emitter = null;
	}
	
	
	registerOption(configName, propertyName = null, filter = null){
		propertyName = propertyName || configName.replace(/^\w+\./, "");
		const name = `file-icons.${configName}`;
		const observer = atom.config.observe(name, value => {
			if(filter) value = filter(value);
			this[propertyName] = value;
			this.emitter.emit("did-change-" + propertyName, value);
		});
		this.disposables.add(observer);
	}
	
	
	registerCommands(){
		const target = "atom-workspace";
		
		this.disposables.add(
			atom.commands.add(target, "file-icons:toggle-colours", _=> {
				const name = "file-icons.coloured";
				atom.config.set(name, !(atom.config.get(name)));
			}),
			
			atom.commands.add(target, "file-icons:debug-outlines", _=> {
				document.body.classList.toggle("file-icons-debug-outlines");
			})
		);
	}
	
	
	onDidChange(setting, fn){
		return this.emitter.on(`did-change-${setting}`, fn);
	}
	
	
	observe(setting, fn){
		const handler = this.onDidChange(setting, fn);
		this.emitter.emit(`did-change-${setting}`, this[setting]);
		return handler;
	}
	
	
	get colourMode(){
		return this.coloured ? ~~UI.lightTheme : null;
	}
}


module.exports = new Options();
