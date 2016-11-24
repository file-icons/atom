"use strict";

const {CompositeDisposable} = require("atom");
const Options = require("./options.js");
const UI = require("./ui.js");


class IconDelegate{
	
	constructor(resource, element){
		this.disposables = new CompositeDisposable();
		this.resource = resource;
		this.element = element;
		this.visible = true;
		this.iconClasses = null;
		this.appliedClasses = resource.iconClass || null;
		
		this.disposables.add(
			UI.onMotifChanged(_=> this.refresh()),
			Options.onDidChange("coloured", _=> this.refresh()),
			Options.onDidChange("colourChangedOnly", _=> this.refresh()),
			resource.onDidDestroy(_=> this.destroy()),
			resource.onDidChangeIcon(_=> this.refresh()),
			resource.onDidChangeVCSStatus(_=> {
				if(Options.colourChangedOnly)
					this.refresh();
			})
		);
		
		if(!resource.isDirectory)
			this.disposables.add(
				Options.onDidChange("defaultIconClass", _=> this.refresh())
			);
		
		else if(resource.getIcon())
			this.element.classList.remove("icon-file-directory");
		
		this.refresh();
	}
	
	
	destroy(){
		if(!this.destroyed){
			this.disposables.dispose();
			this.resource  = null;
			this.element   = null;
			this.destroyed = true;
		}
	}
	
	
	refresh(){
		const classes = this.resource.getIconClasses();
		if(this.classesDiffer(classes, this.iconClasses)){
			this.removeClasses();
			this.iconClasses = classes;
			this.addClasses();
		}
	}
	
	
	setVisible(input){
		input = !!input;
		if(input !== this.visible){
			this.visible = input;
			this.refresh();
		}
	}
	
	
	/**
	 * Add the file's current iconClass to the delegate's element.
	 *
	 * @private
	 */
	addClasses(){
		if(!this.visible) return;
		
		if(this.iconClasses){
			this.appliedClasses = this.iconClasses;
			this.element.classList.add(...this.appliedClasses);
		}
	}
	
	
	/**
	 * Remove previously-applied classes.
	 *
	 * @private
	 */
	removeClasses(){
		if(null !== this.appliedClasses){
			this.element.classList.remove(...this.appliedClasses);
			this.appliedClasses = null;
		}
	}
	
	
	/**
	 * Determine if two icon-class lists differ.
	 *
	 * @param {Array} a
	 * @param {Array} b
	 * @return {Boolean}
	 * @private
	 */
	classesDiffer(a, b){
		return (a && b)
			? !(a[0] === b[0] && a[1] === b[1])
			: true;
	}
}


module.exports = IconDelegate;
