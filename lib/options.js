"use strict";

const {CompositeDisposable, Emitter} = require("atom");
const UI = require("./ui.js");


class Options{
	
	init(){
		this.disposables = new CompositeDisposable();
		this.emitter = new Emitter();
		
		const options = [
			"coloured",
			"defaultIconClass",
			"tabPaneIcon"
		];
		
		for(const op of options){
			const name = "file-icons." + op;
			const observer = atom.config.observe(name, value => {
				this[op] = value;
				this.emitter.emit("did-change-" + op, value);
			});
			this.disposables.add(observer);
		}
		
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
	
	
	get colourMode(){
		return this.coloured ? ~~UI.lightTheme : null;
	}
}


module.exports = new Options();
