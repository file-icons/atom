"use strict";

const {CompositeDisposable} = require("atom");
const {normalisePath} = require("alhadis.utils");
const Consumer = require("./consumer.js");


/**
 * Patches the `fuzzy-finder` package to report important DOM changes.
 * @class
 */
class FuzzyFinder extends Consumer{
	
	constructor(){
		super("fuzzy-finder");
	}
	
	
	/** Register handlers to monkey-patch `fuzzy-finder` package. */
	init(){
		super.init();
		this.lists       = new Map();
		this.listsByType = new Map();
		this.timeouts    = new WeakMap();
		this.disposables.add(
			this.onListOpened(args => this.trackList(args))
		);
	}
	
	
	/** Free up memory when deactivating package. */
	reset(){
		super.reset();
		this.lists.clear();
		this.lists = null;
		this.listsByType.clear();
		this.listsByType = null;
		this.currentList = null;
		this.currentType = null;
		this.timeouts = null;
	}
	
	
	/**
	 * Dispatch the handler when a finder-list is attached to the workspace.
	 *
	 * @listens list-opened
	 * @param {Function} fn
	 * @return {Disposable}
	 */
	onListOpened(fn){
		return this.subscribe("list-opened", fn);
	}
	
	
	/**
	 * Dispatch the handler when a list's contents have been updated.
	 *
	 * NOTE: For the `fuzzy-finder` package, "updating" means replacing
	 * the contents outright, irrespective of what's actually different.
	 *
	 * @listens list-refreshed
	 * @param {Function} fn
	 * @return {Disposable}
	 */
	onListRefreshed(fn){
		return this.subscribe("list-refreshed", fn);
	}
	

	/**
	 * Patch every method that generates a list-view.
	 *
	 * When triggered the first time, several classes belonging to the
	 * fuzzy-finder package are monkey-patched to emit important events.
	 * These emissions are needed to hook {IconNode} instances to the DOM,
	 * keeping list-icons updated with async {Strategy} matches.
	 *
	 * @emits list-opened
	 * @private
	 */
	activate(){
		const types = ["Project", "Buffer", "GitStatus"];
		
		for(const type of types){
			this.punch(this.package.mainModule, `create${type}View`, fn => {
				const view = fn();
				this.emit("list-opened", {view, type});
				return view;
			});
		}
	}
	
	
	/**
	 * Register a list-view as it's being attached to the DOM.
	 *
	 * @param {Object} args - Values provided by {@link #list-opened} handler:
	 * @param {ListType} args.type - Type of list that was created
	 * @param {SelectListView} args.view - The patched finder-list
	 * @augments {@link FuzzyFinderView#viewForItem|viewForItem}
	 * @private
	 */
	trackList(args){
		const {view, type} = args;
		
		if(null === this.jQueryRemoved)
			this.jQueryRemoved = !!(view.selectListView && !view.viewForItem);
		
		if(!this.lists.has(view)){
			const target = this.jQueryRemoved
				? [view.selectListView.props, "elementForItem"]
				: [view, "viewForItem"];
			this.punch(...target, oldFn => {
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
		
		if(null !== this.maxItems)
			this.jQueryRemoved
				? view.selectListView.props.maxResults = this.maxItems
				: view.setMaxItems(this.maxItems);
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
		
		this.timeouts.set(list, setTimeout(() => {
			this.timeouts.delete(list);
			this.resetNodes();
			
			const paths = {};
			list.items.map(item => {
				const filePath = normalisePath(item.filePath);
				const projPath = normalisePath(item.projectRelativePath);
				paths[projPath] = filePath;
			});
			
			const element = this.jQueryRemoved
				? list.element.querySelector("ol.list-group")
				: list.list[0];
			const items = Array.from(element.children);
			for(const item of items){
				const iconElement = item.querySelector(".primary-line.file");
				const path = normalisePath(iconElement.dataset.path);
				this.trackEntry(paths[path], iconElement)
			}
			this.emit("list-refreshed", items);
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
	 * @return {Promise} Resolves with updated entry elements.
	 */
	filter(query, type = null){
		const list = (null === type)
			? this.currentList
			: this.getList(type);
		
		if(!list)
			return Promise.reject(new Error("No list selected"));
		
		return new Promise(resolve => {
			const doOnce = this.onListRefreshed(results => {
				doOnce.dispose();
				resolve(results);
			});
			this.open(type);
			const field = this.jQueryRemoved
				? list.selectListView.refs.queryEditor
				: list.filterEditorView.getModel();
			field.setText(query);
			this.jQueryRemoved
				? list.selectListView.didChangeQuery()
				: list.populateList();
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
		const bounds = (list[0] || list.element).getBoundingClientRect();
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


/**
 * Maximum number of items to display for any list.
 * @property {Number} maxItems
 */
FuzzyFinder.prototype.maxItems = null;


module.exports = new FuzzyFinder();
