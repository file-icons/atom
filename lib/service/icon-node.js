"use strict";

const {CompositeDisposable, Disposable} = require("atom");
const {isString} = require("../utils/general.js");
const FileSystem = require("../filesystem/filesystem.js");
const Options = require("../options.js");
const UI = require("../ui.js");

const iconsByElement = new WeakMap();


class IconNode{
	
	constructor(resource, element){
		const delegate = resource.icon;
		
		this.disposables = new CompositeDisposable();
		this.resource = resource;
		this.element = element;
		this.visible = true;
		this.classes = null;
		this.appliedClasses = null;
		iconsByElement.set(element, this);
		
		this.disposables.add(
			UI.onMotifChanged(_=> this.refresh()),
			Options.onDidChange("coloured", _=> this.refresh()),
			Options.onDidChange("colourChangedOnly", _=> this.refresh()),
			delegate.onDidChangeIcon(_=> this.refresh()),
			resource.onDidDestroy(_=> this.destroy()),
			resource.onDidChangeVCSStatus(_=> {
				if(Options.colourChangedOnly)
					this.refresh();
			})
		);
		
		if(!resource.isDirectory)
			this.disposables.add(
				Options.onDidChange("defaultIconClass", _=> this.refresh())
			);
		
		else if(delegate.getCurrentIcon())
			this.element.classList.remove("icon-file-directory");
		
		this.refresh();
	}
	
	
	destroy(){
		if(!this.destroyed){
			this.disposables.dispose();
			iconsByElement.delete(this.element);
			this.resource  = null;
			this.element   = null;
			this.destroyed = true;
		}
	}
	
	
	refresh(){
		if(!this.visible){
			this.removeClasses();
			this.classes = null;
		}
		else{
			const classes = this.resource.icon.getClasses();
			if(this.classesDiffer(classes, this.classes)){
				this.removeClasses();
				this.classes = classes;
				this.addClasses();
			}
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
	 * Apply the current icon-classes to the instance's element.
	 *
	 * @private
	 */
	addClasses(){
		if(!this.visible) return;
		
		if(this.classes){
			this.appliedClasses = this.classes;
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
	
	
	
	/**
	 * Create and apply an {IconNode} to a DOM element the `File-Icons`
	 * package has no control over. This method is invoked by the service's
	 * `addIconToElement` method, which ensures icon elements created by
	 * consumers continue to display accurate icons even when matches change.
	 *
	 * @public
	 * @static
	 *
	 * @param {HTMLElement} element - DOM element receiving the icon-classes.
	 * @param {String}         path - Absolute filesystem path
	 *
	 * @returns {Disposable}
	 *    A Disposable that destroys the {IconNode} when disposed of. Authors
	 *    are encouraged to do so once the element is no longer needed.
	 */
	static forElement(element, path){
		if(!element) return null;
		const icon = iconsByElement.get(element);
		
		if(icon && !icon.destroyed)
			return icon;
		
		else{
			if(!path)
				throw new TypeError("Cannot create icon-node for empty path");
			
			const rsrc = FileSystem.get(path);
			const node = new IconNode(rsrc, element);
			
			return new Disposable(() => node.destroy());
		}
	}
}


module.exports = IconNode;
