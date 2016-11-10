"use strict";

const {CompositeDisposable, Emitter} = require("atom");
const FileRegistry = require("../file-registry.js");
const IconDelegate = require("../icon-delegate.js");
const Options      = require("../options.js");


class Tab{
	
	constructor(element, editor){
		this.element = element;
		this.editor  = editor;
		this.path    = editor.getPath();
		this.file    = FileRegistry.get(this.path);
		this.icon    = new IconDelegate(this.file, element.itemTitle);
		this.icon.setVisible(Options.tabPaneIcon);
		
		this.emitter = new Emitter();
		this.disposables = new CompositeDisposable(
			editor.onDidDestroy(_=> this.destroy()),
			Options.onDidChange("tabPaneIcon", show => this.icon.setVisible(show))
		);
	}
	
	
	destroy(){
		if(!this.destroyed){
			this.destroyed = true;
			this.icon.destroy();
			this.emitter.emit("did-destroy");
			this.emitter.dispose();
			this.emitter = null;
			this.disposables.dispose();
			this.disposables.clear();
			this.disposables = null;
			this.editor = null;
			this.element = null;
		}
	}
	
	
	onDidDestroy(fn){
		return this.emitter.on("did-destroy", fn);
	}
}


module.exports = Tab;
