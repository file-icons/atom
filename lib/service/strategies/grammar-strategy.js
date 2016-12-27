"use strict";

const {CompositeDisposable, Disposable} = require("atom");
const IconTables = require("../../icons/icon-tables.js");
const Strategy = require("../strategy.js");


class GrammarStrategy extends Strategy {
	
	constructor(){
		super({
			name:         "grammar",
			priority:     7,
			matchesFiles: true,
			matchesDirs:  false
		});
	}
	
	
	registerResource(resource){
		if(super.registerResource(resource)){
			const disposables = this.resourceEvents.get(resource);
			const watcher = new CompositeDisposable();
			
			watcher.add(
				new Disposable(_=> disposables.remove(watcher)),
				resource.onDidDetachEditor(editor => watcher.dispose()),
				resource.observeEditors(editor => {
					watcher.add(editor.observeGrammar(_=> {
						const icon = this.matchIcon(resource);
						icon
							? this.addIcon(resource, icon)
							: this.deleteIcon(resource);
					}));
				})
			);
			
			disposables.add(watcher);
		}
	}
	
	
	matchIcon(resource){
		const editor = resource.getEditor();
		
		if(editor){
			const scopeName = atom.textEditors.getGrammarOverride(editor);
			const grammar = atom.grammars.grammarForScopeName(scopeName);
			return grammar
				? IconTables.matchScope(grammar.scopeName)
				: null;
		}
		
		else return null;
	}
}


module.exports = new GrammarStrategy();
