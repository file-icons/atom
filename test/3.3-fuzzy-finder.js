"use strict";

const {assertIconClasses, resetOptions, setTheme} = require("./utils");
const FuzzyFinder = require("./utils/fuzzy-finder.js");
const Options     = require("../lib/options.js");

describe("Fuzzy-finder", () => {
	beforeEach(() => resetOptions());
	
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
	
	before("Running sanity checks", async () => {
		expect(atom.packages.isPackageActive("fuzzy-finder")).to.be.true;
		const {mainModule} = atom.packages.activePackages["fuzzy-finder"];
		const projectList = mainModule.createProjectView();
		
		expect(projectList).to.exist;
		projectList.should.have.property("selectListView");
		projectList.selectListView.should.respondTo("didChangeQuery");
		expect(projectList.selectListView.refs).to.exist.and.have.property("queryEditor");
		
		await FuzzyFinder.open();
		expect(projectList.panel).to.exist;
		expect(projectList.panel.isVisible()).to.be.true;
		await FuzzyFinder.close();
		expect(projectList.panel).to.exist;
		expect(projectList.panel.isVisible()).to.be.false;
		await FuzzyFinder.open();
		
		const inputField = projectList.selectListView.refs.queryEditor;
		inputField.setText("e");
		inputField.getText().should.equal("e");
		inputField.setText("");
		inputField.getText().should.equal("");
		
		await FuzzyFinder.filter("e");
		inputField.getText().should.equal("e");
		
		const filteredEntries = FuzzyFinder.entries;
		filteredEntries.should.have.lengthOf.at.least(1);
		await FuzzyFinder.filter("");
		FuzzyFinder.entries.should.have.lengthOf.at.least(1).and.not.eql(filteredEntries);
	});
	
	when("the file-finder is opened", () => {
		when("showing the first set of results", () => {
			it("displays an icon beside each search result", () =>
				assertIconClasses(FuzzyFinder.entries, iconClasses));
			
			it("displays file-icons in colour", () =>
				assertIconClasses(FuzzyFinder.entries, colourClasses));
			
			it("displays monochrome icons if coloured icons are disabled", () => {
				Options.set("coloured", false);
				assertIconClasses(FuzzyFinder.entries, colourClasses, true);
				assertIconClasses(FuzzyFinder.entries, iconClasses);
				
				Options.set("coloured", true);
				assertIconClasses(FuzzyFinder.entries, colourClasses);
				assertIconClasses(FuzzyFinder.entries, iconClasses);
			});
			
			it('limits colour to modified files if "Colour changed only" is enabled', () => {
				const changedClasses = "primary-line file icon perl-icon";
				
				Options.set("colourChangedOnly", true);
				assertIconClasses(FuzzyFinder.entries, colourClasses, true);
				assertIconClasses(FuzzyFinder.entries, iconClasses);
				FuzzyFinder.entries["status-modified.pl"].should.have.classes(changedClasses + " medium-blue");
				FuzzyFinder.entries["status-new.pl"].     should.have.classes(changedClasses + " medium-blue");
				
				Options.set("coloured", false);
				assertIconClasses(FuzzyFinder.entries, colourClasses, true);
				assertIconClasses(FuzzyFinder.entries, iconClasses);
				FuzzyFinder.entries["status-modified.pl"].should.have.classes(changedClasses).and.not.have.class("medium-blue");
				FuzzyFinder.entries["status-new.pl"].     should.have.classes(changedClasses).and.not.have.class("medium-blue");
				
				Options.set("coloured", true);
				assertIconClasses(FuzzyFinder.entries, colourClasses, true);
				assertIconClasses(FuzzyFinder.entries, iconClasses);
				FuzzyFinder.entries["status-modified.pl"].should.have.classes(changedClasses + " medium-blue");
				FuzzyFinder.entries["status-new.pl"].     should.have.classes(changedClasses + " medium-blue");
			});
			
			it("uses the correct colour for motif-sensitive icons", async () => {
				Options.set("colourChangedOnly", false);
				let {entries} = FuzzyFinder;
				entries[".bowerrc"].should.have.class("medium-yellow");
				entries[".bowerrc"].should.not.have.class("medium-orange");
				entries["la.tex"].should.have.class("medium-blue");
				entries["la.tex"].should.not.have.class("dark-blue");
				await setTheme("atom-light");
				entries = FuzzyFinder.entries;
				entries[".bowerrc"].should.have.class("medium-orange");
				entries[".bowerrc"].should.not.have.class("medium-yellow");
				entries["la.tex"].should.have.class("dark-blue");
				entries["la.tex"].should.not.have.class("medium-blue");
			});
			
			describe("If package settings are changed while open", () => {
				before(() => setTheme("atom-dark"));
				
				it("updates icons if the setting is related", () => {
					assertIconClasses(FuzzyFinder.entries, colourClasses);
					Options.set("coloured", false);
					assertIconClasses(FuzzyFinder.entries, colourClasses, true);
					Options.set("coloured", true);
					assertIconClasses(FuzzyFinder.entries, colourClasses);
				});
				
				it("does nothing if setting isn't related", () => {
					for(let i = 0; i < 4; ++i){
						Options.toggle("tabPaneIcon");
						assertIconClasses(FuzzyFinder.entries, iconClasses);
						assertIconClasses(FuzzyFinder.entries, colourClasses);
					}
				});
			});
		});
		
		when("filtering results", () => {
			it("displays an icon beside each result", async () => {
				Options.set("defaultIconClass", "default-icon");
				const base = "primary-line file icon ";
				await FuzzyFinder.filter("m");
				assertIconClasses(FuzzyFinder.entries, [
					[".gitmodules",           base + "git-icon medium-red"],
					["markdown.md",           base + "markdown-icon medium-blue"],
					["README.md",             base + "book-icon medium-blue"],
					["image.gif",             base + "image-icon medium-yellow"],
					["subfolder/almighty.c",  base + "c-icon medium-blue"],
					["subfolder/markup.html", base + "html5-icon medium-orange"]
				]);
				await FuzzyFinder.filter("t");
				assertIconClasses(FuzzyFinder.entries, [
					["text.txt",              base + "icon-file-text medium-blue"],
					["la.tex",                base + "tex-icon medium-blue"],
					["subfolder/script.js",   base + "js-icon medium-yellow"],
					["data.json",             base + "database-icon medium-yellow"],
					[".gitignore",            base + "git-icon medium-red"],
					[".default-gear",         base + "gear-icon"],
					[".default-config",       base + "config-icon"]
				]);
				await FuzzyFinder.filter("k");
				assertIconClasses(FuzzyFinder.entries, [
					["package.json",          base + "npm-icon", "medium-red"],
					["blank.file",            base + "default-icon"]
				]);
			});
			
			it("displays monochrome icons if colours are disabled", async () => {
				Options.set("coloured", false);
				await FuzzyFinder.filter("m");
				assertIconClasses(FuzzyFinder.entries, [
					[".gitmodules",           "medium-red"],
					["markdown.md",           "medium-blue"],
					["README.md",             "medium-blue"],
					["image.gif",             "medium-yellow"],
					["subfolder/almighty.c",  "medium-blue"],
					["subfolder/markup.html", "medium-orange"]
				], true);
				await FuzzyFinder.filter("t");
				assertIconClasses(FuzzyFinder.entries, [
					["text.txt",              "medium-blue"],
					["la.tex",                "medium-blue"],
					["subfolder/script.js",   "medium-yellow"],
					["data.json",             "medium-yellow"],
					[".gitignore",            "medium-red"]
				], true);
			});
			
			it("uses the default icon-class if no icons match", async () => {
				Options.set("defaultIconClass", "foo-bar");
				Options.set("coloured", true);
				await FuzzyFinder.filter("blank");
				const blank = FuzzyFinder.entries["blank.file"];
				expect(blank).to.exist;
				blank.should.have.classes("foo-bar").and.not.have.class("default-icon");
				Options.set("defaultIconClass", "default-icon");
				blank.should.have.class("default-icon").and.not.have.class("foo-bar");
			});
		});
	});
});
