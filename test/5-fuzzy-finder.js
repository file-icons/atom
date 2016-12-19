"use strict";

const FuzzyFinder = require("../lib/consumers/fuzzy-finder.js");
const Options     = require("../lib/options.js");

const {
	chain,
	wait
} = require("../lib/utils/general.js");

const {
	activate,
	assertIconClasses,
	dispatch,
	open,
	setup,
	setTheme,
	waitForEvent
} = require("./utils/atom-specs.js");


describe("Fuzzy-finder", () => {
	let workspace;
	let files;
	let list;
	
	setup("Activate packages", (done, fail) => {
		workspace = atom.views.getView(atom.workspace);
		open("fixtures/project");
		
		chain([
			atom.workspace.open("markdown.md"),
			atom.themes.activateThemes(),
			activate("file-icons", "fuzzy-finder"),
			setTheme("atom-dark")
		]).then(() => {
			Options.set("coloured", true);
			attachToDOM(workspace);
			done();
		}).catch(error => fail(error));
	});
	
	
	const iconClasses = [
		[".default-config", "primary-line file icon config-icon"],
		[".default-gear",   "primary-line file icon gear-icon"],
		[".bowerrc",        "primary-line file icon bower-icon"],
		[".gitignore",      "primary-line file icon git-icon"],
		["README.md",       "primary-line file icon book-icon"],
		["data.json",       "primary-line file icon database-icon"],
		["image.gif",       "primary-line file icon image-icon"],
		["la.tex",          "primary-line file icon tex-icon"],
		["markdown.md",     "primary-line file icon markdown-icon"]
	];
	const colourClasses = [
		[".bowerrc",        "medium-yellow"],
		[".gitignore",      "medium-red"],
		["README.md",       "medium-blue"],
		["data.json",       "medium-yellow"],
		["image.gif",       "medium-yellow"],
		["la.tex",          "medium-blue"],
		["markdown.md",     "medium-blue"]
	];
	
	
	describe("When the file-finder is opened", () => {
		describe("When showing the first set of results", () => {
			it("displays an icon beside each search result", () => {
				const selector = ".fuzzy-finder.select-list";
				list = workspace.querySelector(selector);
				expect(list).not.to.exist;
				
				FuzzyFinder.open("file-finder");
				list = workspace.querySelector(selector);
				expect(list).to.exist;
				const panel = atom.workspace.panelForItem(list.spacePenView);
				expect(panel).to.exist;
				
				return waitForEvent(FuzzyFinder, "list-refreshed").then(() => {
					files = ls();
					files.should.have.length.of.at.least(1);
					assertIconClasses(files, iconClasses);
				});
			});
			
			it("displays file-icons in colour", () => {
				Options.get("coloured").should.be.true;
				assertIconClasses(files, colourClasses);
			});
			
			it("displays monochrome icons if coloured icons are disabled", () => {
				Options.get("coloured").should.be.true;
				Options.set("coloured", false);
				assertIconClasses(files, colourClasses, true);
				assertIconClasses(files, iconClasses);
				
				Options.set("coloured", true);
				assertIconClasses(files, colourClasses);
				assertIconClasses(files, iconClasses);
			});
			
			it("uses the correct colour for motif-sensitive icons", () => {
				files[".bowerrc"].should.have.class("medium-yellow");
				files[".bowerrc"].should.not.have.class("medium-orange");
				files["la.tex"].should.have.class("medium-blue");
				files["la.tex"].should.not.have.class("dark-blue");
				
				return setTheme("atom-light").then(() => {
					files[".bowerrc"].should.have.class("medium-orange");
					files[".bowerrc"].should.not.have.class("medium-yellow");
					files["la.tex"].should.have.class("dark-blue");
					files["la.tex"].should.not.have.class("medium-blue");
				});
			});
			
			describe("If package settings are changed while open", () => {
				it("updates icons if the setting is related", () => {
					assertIconClasses(files, colourClasses);
					Options.set("coloured", false);
					assertIconClasses(files, colourClasses, true);
					Options.set("coloured", true);
					assertIconClasses(files, colourClasses);
				});
				
				it("does nothing if setting isn't related", () => {
					for(let i = 0; i < 4; ++i){
						Options.toggle("tabPaneIcon");
						assertIconClasses(files, iconClasses);
						assertIconClasses(files, colourClasses);
					}
				});
			});
		});
		
		describe("When filtering results", () => {
			
			// Avoid confusing errors or timeouts: check everything works first
			before("Assert accurate reporting", () => {
				const list = FuzzyFinder.getList("Project");
				expect(list).to.exist.and.respondTo("populateList");
				
				const filterView = list.filterEditorView;
				expect(filterView).to.exist.and.respondTo("getModel");
				
				const editor = filterView.getModel();
				expect(editor).to.exist.and.respondTo("setText");
				
				const nodes = Array.from(FuzzyFinder.iconNodes);
				nodes.should.not.be.empty;
				nodes[0].should.not.have.property("destroyed");
				nodes[0].should.have.property("resource");
				expect(nodes[0].resource).to.be.ok;
				
				editor.setText("e");
				editor.getText().should.equal("e");
				editor.setText("");
				editor.getText().should.equal("");
				list.populateList();
				
				return wait(100).then(() => {
					nodes[0].should.have.property("destroyed");
					nodes[0].destroyed.should.be.true;
				});
			});
			
			it("displays an icon beside each result", () => {
				Options.set("defaultIconClass", undefined);
				const base = "primary-line file icon ";
				return chain([
					() => FuzzyFinder.filter("m").then(() => assertIconClasses(ls(), [
						["node_modules/.keep",    base + "git-icon medium-red"],
						["markdown.md",           base + "markdown-icon medium-blue"],
						["README.md",             base + "book-icon medium-blue"],
						["image.gif",             base + "image-icon medium-yellow"],
						["subfolder/almighty.c",  base + "c-icon medium-blue"],
						["subfolder/markup.html", base + "html5-icon medium-orange"]
					])),
					
					() => FuzzyFinder.filter("t").then(() => assertIconClasses(ls(), [
						["text.txt",              base + "icon-file-text medium-blue"],
						["la.tex",                base + "tex-icon medium-blue"],
						["subfolder/script.js",   base + "js-icon medium-yellow"],
						["data.json",             base + "database-icon medium-yellow"],
						[".gitignore",            base + "git-icon medium-red"],
						[".default-gear",         base + "gear-icon"],
						[".default-config",       base + "config-icon"]
					])),
					
					() => FuzzyFinder.filter("k").then(() => assertIconClasses(ls(), [
						["package.json",          base + "npm-icon", "medium-red"],
						["blank.file",            base + "default-icon"]
					]))
				]);
			});
			
			it("displays monochrome icons if colours are disabled", () => {
				Options.set("coloured", false);
				return chain([
					() => FuzzyFinder.filter("m").then(() => assertIconClasses(ls(), [
						["node_modules/.keep",    "medium-red"],
						["markdown.md",           "medium-blue"],
						["README.md",             "medium-blue"],
						["image.gif",             "medium-yellow"],
						["subfolder/almighty.c",  "medium-blue"],
						["subfolder/markup.html", "medium-orange"]
					], true)),
					
					() => FuzzyFinder.filter("t").then(() => assertIconClasses(ls(), [
						["text.txt",              "medium-blue"],
						["la.tex",                "medium-blue"],
						["subfolder/script.js",   "medium-yellow"],
						["data.json",             "medium-yellow"],
						[".gitignore",            "medium-red"]
					], true))
				]);
			});
			
			it("uses the default icon-class if no icons match", () => {
				Options.set("defaultIconClass", "foo-bar");
				Options.set("coloured", true);
				return FuzzyFinder.filter("blank").then(() => {
					const blank = ls()["blank.file"];
					expect(blank).to.exist;
					blank.should.have.classes("foo-bar");
					blank.should.not.have.class("default-icon");
					Options.set("defaultIconClass", undefined);
					blank.should.have.class("default-icon");
					blank.should.not.have.class("foo-bar");
				});
			});
		});
	});
	
	
	function ls(){
		const result = [];
		const items = list.querySelectorAll(".list-group > li");
		for(const item of items){
			const value = item.querySelector(".primary-line");
			result.push(value);
			const {path} = value.dataset;
			Object.defineProperty(result, path, {value});
		}
		return result;
	}
});
