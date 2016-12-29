"use strict";

const FuzzyFinder = require("../lib/consumers/fuzzy-finder.js");
const TreeView    = require("../lib/consumers/tree-view.js");
const Tabs        = require("../lib/consumers/tabs.js");
const Options     = require("../lib/options.js");


describe("User-assigned grammars", () => {
	const base = "name icon ";
	let files;
	
	before(() => chain([
		() => setup("4.7-grammar"),
		() => Tabs.closeAll(),
		() => atom.packages.activatePackage("status-bar"),
		() => atom.packages.activatePackage("grammar-selector"),
		() => atom.packages.activatePackage("language-python"),
		() => atom.packages.activatePackage("language-gfm"),
		() => atom.packages.activatePackage("language-xml"),
		() => atom.packages.activatePackage("language-html"),
		() => atom.packages.activatePackage("language-coffee-script"),
		() => open("markup.md"),
		() => open("markup.html"),
		() => {
			files = TreeView.ls();
			files.should.not.be.empty;
			files.length.should.be.at.least(2);
		}
	]));
	
	
	when("a user overrides the grammar of a file", () => {
		it("updates the icon to match", () => {
			files["markup.html"].should.have.classes(base + "html5-icon medium-orange");
			files["markup.md"].should.have.classes(base + "markdown-icon medium-blue");
			
			return setLanguage("source.coffee")
				.then(() => {
					files["markup.html"].should.not.have.classes("html5-icon medium-orange");
					files["markup.html"].should.have.classes(base + "coffee-icon medium-maroon");
				})
				.then(() => open("markup.md"))
				.then(() => setLanguage("source.python"))
				.then(() => {
					files["markup.md"].should.have.classes(base + "python-icon dark-blue");
					files["markup.md"].should.not.have.classes("markdown-icon medium-blue");
				});
		});
	});
	
	
	when("a user assigns a grammar for a very generic language", () => {
		it("restores the file's original icon", () => {
			files["markup.md"].should.have.classes(base + "python-icon dark-blue");
			setLanguage("text.xml")
				.then(() => {
					files["markup.md"].should.have.classes(base + "markdown-icon medium-blue");
					const editor = atom.workspace.getActiveTextEditor();
					editor.getGrammar().scopeName.should.equal("text.xml");
				});
		});
	});
	
	
	when("the strategy is disabled", () => {
		it("clears all icons it assigned", () => {
			files["markup.html"].should.have.classes(base + "coffee-icon medium-maroon");
			Options.set("grammar", false);
			files["markup.html"].should.have.classes(base + "html5-icon medium-orange");
		});
		
		when("the strategy is re-enabled", () => {
			it("restores the grammar-assigned icons", () => {
				files["markup.html"].should.have.classes(base + "html5-icon medium-orange");
				Options.set("grammar", true);
				files["markup.html"].should.have.classes(base + "coffee-icon medium-maroon");
			});
		});
	});
	
	
	function setLanguage(scope){
		const editorView = atom.views.getView(atom.workspace.getActiveTextEditor());
		atom.commands.dispatch(editorView, "grammar-selector:show");
		
		return new Promise(resolve => {
			const intervalID = setInterval(() => {
				const panels = atom.workspace.getModalPanels();
				if(!panels.length) return;
				const selector = panels.find(panel => {
					const element = panel.item[0] || panel.item.element;
					return element.classList.contains("grammar-selector");
				});
				if(selector){
					clearInterval(intervalID);
					resolve(selector.item);
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
