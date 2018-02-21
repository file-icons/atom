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
	
	
	// HACK: See https://github.com/file-icons/atom/issues/704#issuecomment-367167526
	// TODO: Delete this once the minimum required Atom version is bumped past 1.24.0
	enable(){
		switch(atom.getVersion().replace(/^v/i, "").toLowerCase()){
			case "1.24.0":
			case "1.25.0-beta0":
				if(!atom.inSpecMode())
					return false;
		}
		return super.enable();
	}
	
	
	registerResource(resource){
		if(super.registerResource(resource)){
			const disposables = this.resourceEvents.get(resource);
			const watcher = new CompositeDisposable();
			
			watcher.add(
				new Disposable(() => disposables.remove(watcher)),
				resource.onDidDetachEditor(() => watcher.dispose()),
				resource.observeEditors(editor => {
					watcher.add(editor.observeGrammar(() => {
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
