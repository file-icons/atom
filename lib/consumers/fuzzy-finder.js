"use strict";

const {CompositeDisposable, Disposable, Emitter} = require("atom");
const FileRegistry = require("../filesystem/file-registry.js");
const IconNode = require("../service/icon-node.js");
const {punch} = require("../utils/general.js");


/**
 * Patches fuzzy-finder package to enable correct icon updates.
 * @class
 */
class FuzzyFinder{
	
	/** Register handlers to monkey-patch `fuzzy-finder` package. */
	init(){
		this.active      = false;
		this.lists       = new Map();
		this.listsByType = new Map();
		this.emitter     = new Emitter();
		this.timeouts    = new WeakMap();
		this.iconNodes   = new Set();
		
		setImmediate(() => this.checkPackage());
		this.disposables = new CompositeDisposable(
			atom.packages.onDidActivatePackage(_=> this.checkPackage()),
			atom.packages.onDidDeactivatePackage(_=> this.checkPackage()),
			atom.packages.onDidActivateInitialPackages(_=> this.checkPackage()),
			this.onListOpened(args => this.trackList(args))
		);
	}
	
	
	/** Free up memory when deactivating package. */
	reset(){
		this.resetNodes();
		this.lists.clear();
		this.lists = null;
		this.listsByType.clear();
		this.listsByType = null;
		this.currentList = null;
		this.currentType = null;
		this.disposables.dispose();
		this.disposables = null;
		this.iconNodes = null;
		this.timeouts = null;
		this.emitter.dispose();
		this.emitter = null;
		this.package = null;
		this.active = false;
	}
	
	
	/**
	 * Wipe all {IconNode} instances the {FuzzyFinder} has generated.
	 *
	 * @see {@link #refresh}
	 * @private
	 */
	resetNodes(){
		this.iconNodes.forEach(node => node.destroy());
		this.iconNodes.clear();
	}
	
	
	/**
	 * Dispatch the handler when a finder-list is attached to the workspace.
	 *
	 * @listens list-opened
	 * @param {Function} fn
	 * @return {Disposable}
	 */
	onListOpened(fn){
		return this.emitter.on("list-opened", fn);
	}
	
	
	/**
	 * Dispatch the handler when a list's contents have been updated.
	 *
	 * NOTE: For the `fuzzy-finder` package, updating means replacing
	 * the contents outright, irrespective of what's actually different.
	 *
	 * @listens list-refreshed
	 * @param {Function} fn
	 * @return {Disposable}
	 */
	onListRefreshed(fn){
		return this.emitter.on("list-refreshed", fn);
	}
	
	
	/**
	 * Respond to changes in the targeted package's activation status.
	 *
	 * When triggered the first time, several classes belonging to the
	 * fuzzy-finder package are monkey-patched to emit important events.
	 * These emissions are needed to hook {IconNode} instances to the DOM,
	 * keeping list-icons updated with async {Strategy} matches.
	 *
	 * @emits list-opened
	 * @private
	 */
	checkPackage(){
		const fuzzPackage = atom.packages.activePackages["fuzzy-finder"];
		
		if(fuzzPackage && !this.active){
			this.active = true;
			this.package = fuzzPackage.mainModule;
			
			for(const type of ["Project", "Buffer", "GitStatus"])
				this.punch(this.package, `create${type}View`, fn => {
					const view = fn();
					this.emitter.emit("list-opened", {view, type});
					return view;
				});
		}
		
		else if(!fuzzPackage && this.active){
			this.active = false;
			this.package = null;
			this.punchedMethods.dispose();
		}
	}
	
	
	/**
	 * Helper function to track methods as they're patched.
	 *
	 * Patched methods are restored when the package is deactivated.
	 *
	 * @param {Object} object
	 * @param {String} method
	 * @param {Function} fn
	 * @private
	 */
	punch(object, method, fn){
		if(!this.punchedMethods){
			this.punchedMethods = new CompositeDisposable(
				new Disposable(_=> this.punchedMethods = null)
			);
			this.disposables.add(this.punchedMethods);
		}
		
		const [originalMethod] = punch(object, method, fn);
		this.punchedMethods.add(new Disposable(_=> {
			object[method] = originalMethod;
		}));
	}
	
	
	/**
	 * Register a list-view as it's being attached to the DOM.
	 *
	 * @param {Object} args - Values provided by {@link #checkPackage}:
	 * @param {ListType} args.type - Type of list that was created
	 * @param {SelectListView} args.view - The patched finder-list
	 * @augments {@link FuzzyFinderView#viewForItem|viewForItem}
	 * @private
	 */
	trackList(args){
		const {view, type} = args;
		
		if(!this.lists.has(view)){
			this.punch(view, "viewForItem", oldFn => {
				this.refresh(view);
				return oldFn();
			});
			
			const disposables = new CompositeDisposable();
			this.lists.set(view, disposables);
			
			// IDEA: A `MirrorMap` might be nice.
			this.listsByType.set(type, view);
			this.listsByType.set(view, type);
		}
		
		if(view !== this.currentList){
			this.currentList = view;
			this.currentType = type;
		}
	}
	
	
	/**
	 * Reconstruct the document tree of the given list-view.
	 *
	 * @param {SelectListView} list
	 * @emits list-refreshed
	 * @private
	 */
	refresh(list){
		if(this.timeouts.get(list))
			return;
		
		this.timeouts.set(list, setTimeout(_=> {
			this.timeouts.delete(list);
			this.resetNodes();
			
			const paths = {};
			list.items.map(item => {
				const {filePath, projectRelativePath} = item;
				paths[projectRelativePath] = filePath;
			});
			
			const items = Array.from(list.list[0].children);
			for(const item of items){
				const pathEl = item.querySelector(".primary-line.file");
				const path = paths[pathEl.dataset.path];
				const file = FileRegistry.get(path);
				this.iconNodes.add(new IconNode(file, pathEl));
			}
			this.emitter.emit("list-refreshed", items);
		}, 20));
	}
	
	
	
	/**
	 * Initialise and/or open the named list.
	 *
	 * @param {ListType} type
	 * @return {FuzzyFinder}
	 */
	open(type){
		this.toggle(type, true);
		return this;
	}
	
	
	/**
	 * Close the named list if it's open.
	 *
	 * @param {ListType} type
	 * @return {FuzzyFinder}
	 */
	close(type){
		this.toggle(type, false);
		return this;
	}
	
	
	/**
	 * Toggle the visibility of a finder-list.
	 *
	 * @param {ListType}   type - Type of list. See {@link #normaliseType}.
	 * @param {Boolean} [state] - Use truthy value to force state of list.
	 * @return {FuzzyFinder} Returns calling instance for chaining.
	 */
	toggle(type, state = null){
		let command = "";
		switch(this.normaliseType(type)){
			case "Project":   command = "toggle-file-finder";       break;
			case "Buffer":    command = "toggle-buffer-finder";     break;
			case "GitStatus": command = "toggle-git-status-finder"; break;
			default: return this;
		}
		
		if(null !== state){
			const list = this.getList(type);
			if(!!state === this.getVisible(list))
				return this;
		}
		
		command = `fuzzy-finder:${command}`;
		const workspace = atom.views.getView(atom.workspace);
		atom.commands.dispatch(workspace, command);
		return this;
	}
	
	
	/**
	 * Filter the contents of the currently-open list.
	 *
	 * @param {String}    query - Text to filter results by.
	 * @param {ListType} [type] - Specify another list to filter.
	 * @return {Promise} Resolves an updated entry elements.
	 */
	filter(query, type = null){
		const list = (null === type)
			? this.currentList
			: this.getList(type);
		
		if(!list)
			return Promise.reject("No list selected");
		
		return new Promise(resolve => {
			const doOnce = this.onListRefreshed(results => {
				doOnce.dispose();
				resolve(results);
			});
			this.open(type);
			const field = list.filterEditorView.getModel();
			field.setText(query);
			list.populateList();
		});
	}
	
	
	/**
	 * Retrieve the finder-list which displays search results.
	 *
	 * Returns `null` if the list hasn't yet been initialised.
	 *
	 * @param {ListType} type
	 * @throws {TypeError} If passed unrecognised type
	 * @return {SelectListView|null}
	 */
	getList(type){
		if(type = this.normaliseType(type))
			return this.listsByType.get(type) || null;
		else
			throw new TypeError(`Unrecognised type: ${type}`);
	}
	
	
	/**
	 * Whether the list is attached to the DOM and visible.
	 *
	 * @param {SelectListView} list
	 * @return {Boolean}
	 */
	getVisible(list){
		if(!list) return false;
		const bounds = list[0].getBoundingClientRect();
		return (bounds.width > 0 && bounds.height > 0);
	}
	
	
	/**
	 * Normalise a {@link ListType|list-type identifier} from possible variations.
	 *
	 * @param   {String} type
	 * @example normaliseType("file-finder") === "Project";
	 * @example     normaliseType("project") === "Project";
	 * @return  {ListType}
	 */
	normaliseType(type){
		type = (type + "")
			.toLowerCase()
			.replace(/-+|(?:view|finder|list)$/g, "");
		
		switch(type){
			case "project":
			case "file":
				return ListType.PROJECT;
			
			case "buffer":
			case "textbuffer":
				return ListType.BUFFER;
			
			case "git":
			case "gitstatus":
				return ListType.GITSTATUS;
			
			default:
				return ListType.NONE;
		}
	}
}


/**
 * Identifier for a {SelectListView} created by the `fuzzy-finder` package.
 * @enum {String} - ListType
 * @readonly
 */
const ListType = {
	PROJECT:    "Project",
	BUFFER:     "Buffer",
	GIT_STATUS: "GitStatus",
	NONE:       null
};


/**
 * The currently-displayed list, or list previously shown.
 * Elements may not necessarily still be attached to the workspace.
 * @property {SelectListView} currentList
 */
FuzzyFinder.prototype.currentList = null;


/**
 * Type identifier of the current list.
 *
 * @see {@link #normaliseType}
 * @property {ListType} currentType
 */
FuzzyFinder.prototype.currentType = null;



module.exports = new FuzzyFinder();
