"use strict";

const {CompositeDisposable} = require("atom");
const Options = require("./options.js");
const UI = require("./ui.js");


class IconDelegate{
	
	constructor(resource, element, ignoreDefaultIcon = false){
		this.disposables = new CompositeDisposable();
		this.resource = resource;
		this.element = element;
		this.classes = resource.lastConsumedClasses || null;
		
		this.disposables.add(
			UI.onMotifChanged(_=> this.refresh()),
			Options.onDidChange("coloured", _=> this.refresh()),
			resource.onDidDestroy(_=> this.destroy()),
			resource.onDidChangeIcon(_=> this.refresh())
		);
		
		ignoreDefaultIcon
			? this.ignoreDefaultIcon = true
			: this.disposables.add(Options.onDidChange("defaultIconClass", _=> this.refresh()));
		
		this.refresh();
	}
	
	
	destroy(){
		if(!this.destroyed){
			this.disposables.dispose();
			this.resource  = null;
			this.element   = null;
			this.classes   = null;
			this.destroyed = true;
		}
	}
	
	
	refresh(){
		
		// Remove previously-applied classes
		if(null !== this.classes){
			this.element.classList.remove(...this.classes);
			this.classes = null;
		}
		
		this.icon = this.resource.getIcon();
		
		if(this.icon){
			this.classes = this.icon.getClass(Options.colourMode, true);
			this.element.classList.add(...this.classes);
		}
		
		else if(!this.ignoreDefaultIcon){
			this.classes = Options.defaultIconClass.split(/\s+/);
			this.element.classList.add(...this.classes);
		}
	}
}


module.exports = IconDelegate;
