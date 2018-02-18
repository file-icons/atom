"use strict";

const {setup}     = require("./utils");
const TreeView    = require("./utils/tree-view.js");
const Tabs        = require("./utils/tabs.js");
const Options     = require("../lib/options.js");


describe("User-assigned grammars", () => {
	const base = "name icon ";
	
	before(async () => {
		await setup("4.7-grammar");
		Tabs.closeAll();
		await atom.packages.activatePackage("status-bar");
		await atom.packages.activatePackage("grammar-selector");
		await atom.packages.activatePackage("language-python");
		await atom.packages.activatePackage("language-gfm");
		await atom.packages.activatePackage("language-xml");
		await atom.packages.activatePackage("language-html");
		await atom.packages.activatePackage("language-coffee-script");
		await open("markup.md");
		await open("markup.html");
		TreeView.refresh();
		TreeView.entries.should.not.be.empty;
		TreeView.entries.should.have.lengthOf.at.least(2);
	});
	
	
	when("a user overrides the grammar of a file", () => {
		it("updates the icon to match", async () => {
			TreeView.entries["markup.html"].should.have.classes(base + "html5-icon medium-orange");
			TreeView.entries["markup.md"].should.have.classes(base + "markdown-icon medium-blue");
			await setLanguage("source.coffee");
			TreeView.entries["markup.html"].should.not.have.classes("html5-icon medium-orange");
			TreeView.entries["markup.html"].should.have.classes(base + "coffee-icon medium-maroon");
			await open("markup.md");
			await setLanguage("source.python");
			TreeView.entries["markup.md"].should.have.classes(base + "python-icon dark-blue");
			TreeView.entries["markup.md"].should.not.have.classes("markdown-icon medium-blue");
		});
	});
	
	
	when("a user assigns a grammar for a very generic language", () => {
		it("restores the file's original icon", async () => {
			TreeView.entries["markup.md"].should.have.classes(base + "python-icon dark-blue");
			await setLanguage("text.xml");
			TreeView.entries["markup.md"].should.have.classes(base + "markdown-icon medium-blue");
			const editor = atom.workspace.getActiveTextEditor();
			editor.getGrammar().scopeName.should.equal("text.xml");
		});
	});
	
	
	when("the strategy is disabled", () => {
		it("clears all icons it assigned", () => {
			TreeView.entries["markup.html"].should.have.classes(base + "coffee-icon medium-maroon");
			Options.set("grammar", false);
			TreeView.entries["markup.html"].should.have.classes(base + "html5-icon medium-orange");
		});
		
		when("the strategy is re-enabled", () => {
			it("restores the grammar-assigned icons", () => {
				TreeView.entries["markup.html"].should.have.classes(base + "html5-icon medium-orange");
				Options.set("grammar", true);
				TreeView.entries["markup.html"].should.have.classes(base + "coffee-icon medium-maroon");
			});
		});
	});
	
	
	function setLanguage(scope){
		const editorView = atom.views.getView(atom.workspace.getActiveTextEditor());
		atom.commands.dispatch(editorView, "grammar-selector:show");
		
		return new Promise((resolve, reject) => {
			const intervalID = setInterval(() => {
				try{
					const panels = atom.workspace.getModalPanels();
					if(!panels.length) return;
					const selector = panels.find(panel => {
						const element = panel.item.element || panel.item;
						return element.classList.contains("grammar-selector");
					});
					if(selector){
						clearInterval(intervalID);
						resolve(selector.item);
					}
				} catch(error){
					clearInterval(intervalID);
					reject(error);
				}
			}, 100);
		}).then(grammarList => {
			const grammar = atom.grammars.grammarsByScopeName[scope];
			grammarList.props
				? grammarList.props.didConfirmSelection(grammar)
				: grammarList.confirmed(grammar);
			return Promise.resolve(grammar);
		});
	}
});
