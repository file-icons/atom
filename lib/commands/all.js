"use strict";

const {CompositeDisposable, Disposable} = require("atom");
const Options = require("../options.js");
let disposables = null;

const AutoCompiler = require("./auto-compiler.js");
const {clearCache} = require("./clear-cache.js");


module.exports = {
	init(){
		AutoCompiler.init();
		disposables = new CompositeDisposable();
		add("clear-cache",      () => clearCache());
		add("recompile-config", () => AutoCompiler.recompile());
		add("toggle-colours",   () => Options.toggle("coloured"));
	},
	
	reset(){
		AutoCompiler.reset();
		disposables.dispose();
		disposables = null;
	}
};


function add(name, fn){
	const id = `${Options.namespace}:${name}`;
	const cmd = atom.commands.add("atom-workspace", id, fn);
	disposables.add(new Disposable(() => cmd.dispose()));
}
