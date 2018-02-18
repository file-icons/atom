"use strict";

const {wait} = require("alhadis.utils");

// Hash of list-views constructed by FuzzyFinder package
const listProp = {enumerable: true, value: null, writable: true};
const lists = Object.create(null, {
	project:   listProp,
	buffer:    listProp,
	gitStatus: listProp,
	current: {
		configurable: false,
		enumerable: false,
		get(){
			for(const name in this){
				const list = getMain()[name + "View"];
				if(list && list.panel && list.panel.isVisible())
					return list;
			}
			return null;
		}
	},
	get: {
		configurable: false,
		enumerable: false,
		value: function(name){
			if(null === this[name]){
				const Name = name[0].toUpperCase() + name.substr(1);
				this[name] = getMain()[`create${ Name }View`]();
			}
			return this[name];
		}
	},
});

let entries = [];
module.exports = {
	get entries()       { return entries; },
	get currentList()   { return lists.current; },
	get bufferView()    { return lists.get("buffer"); },
	get gitStatusView() { return lists.get("gitStatus"); },
	get projectView()   { return lists.get("project"); },
	
	async refresh(){
		entries = new FuzzyFinderList();
		await(150);
	},
	
	async filter(string){
		const {queryEditor} = lists.current.selectListView.refs;
		queryEditor.insertText(string);
		await wait(10);
		this.refresh();
	},
	
	close(name){
		const view = lists.get(normalise(name));
		if(view.panel && view.panel.isVisible())
			return view.toggle();
	},
	
	open(name){
		const view = lists.get(normalise(name));
		if(!(view.panel && view.panel.isVisible()))
			return view.toggle();
	},
};

class FuzzyFinderList extends Array {
	constructor(){
		super();
		const list = lists.current.element;
		for(const item of list.querySelectorAll(".list-group > li")){
			const value = item.querySelector(".primary-line");
			this.push(value);
			const path = value.dataset.path.replace(/\\/g, "/");
			Object.defineProperty(this, path, {value});
		}
	}
}

function getMain(){
	return atom.packages.activePackages["fuzzy-finder"].mainModule;
}

function normalise(name){
	name = name.replace(/-?(view|list|finder)$/i, "");
	switch(name){
		case "project":
		case "buffer":
		case "gitStatus":
			return name;
		default:
			throw new ReferenceError(`Unknown view type: ${name}`);
	}
}
