"use strict";

const {assertIconClasses, resetOptions, setTheme, wait} = require("./utils");
const FindAndReplace  = require("./utils/find-and-replace.js");
const Options         = require("../lib/options.js");


describe("Find-and-replace", () => {
	beforeEach(async () =>
		FindAndReplace.activation);

	before(() => {
		resetOptions();
		FindAndReplace.activate();
	});
	
	after(() => {
		Options.set("coloured", true);
		Options.set("colourChangedOnly", false);
		const workspace = atom.views.getView(atom.workspace);
		workspace.style.height = null;
		const {projectFindPanel} = FindAndReplace.main;
		if(projectFindPanel.visible)
			atom.commands.dispatch(workspace, "project-find:toggle");
	});
	
	when("opening the project-find view", () => {
		const classes = [
			[".default-config",       "config-icon"],
			[".default-gear",         "gear-icon"],
			["blank.file",            "default-icon"],
			[".bowerrc",              "bower-icon",     "medium-yellow"],
			["data.json",             "database-icon",  "medium-yellow"],
			["la.tex",                "tex-icon",       "medium-blue"],
			["markdown.md",           "markdown-icon",  "medium-blue"],
			["package.json",          "npm-icon",       "medium-red"],
			["README.md",             "book-icon",      "medium-blue"],
			["text.txt",              "icon-file-text", "medium-blue"],
			["subfolder/almighty.c",  "c-icon",         "medium-blue"],
			["subfolder/fad.jsx",     "jsx-icon",       "medium-blue"],
			["subfolder/markup.html", "html5-icon",     "medium-orange"],
			["subfolder/script.js",   "js-icon",        "medium-yellow"]
		];
		
		const colours = classes.map(strings => {
			const name = strings[0];
			const colour = strings[2];
			return colour ? [name, colour] : null;
		}).filter(Boolean);
		
		it("displays an icon beside each result", async () => {
			await FindAndReplace.search(/^ABC$/);
			assertIconClasses(FindAndReplace.entries, classes);
		});
		
		it("displays uncoloured icons if coloured icons are disabled", async () => {
			await FindAndReplace.search(/^AB/);
			assertIconClasses(FindAndReplace.entries, classes);
			assertIconClasses(FindAndReplace.entries, colours);
			Options.set("coloured", false);
			assertIconClasses(FindAndReplace.entries, colours, true);
		});
		
		when("in a Git repository", () => {
			when('the "Only colour when changed" setting is enabled', () => {
				before(() => Options.set("coloured", true));
				
				describe("If the file is unmodified", () =>
					it("doesn't show a coloured icon", () => {
						assertIconClasses(FindAndReplace.entries, colours);
						Options.set("colourChangedOnly", true);
						assertIconClasses(FindAndReplace.entries, colours, true);
						Options.set("coloured", false);
						assertIconClasses(FindAndReplace.entries, colours, true);
						Options.set("coloured", true);
						assertIconClasses(FindAndReplace.entries, colours, true);
					}));
				
				describe("If the file is modified", () =>
					it("shows a coloured icon", () => {
						FindAndReplace.entries["status-modified.pl"].should.have.class("medium-blue");
						FindAndReplace.entries["status-new.pl"].should.have.class("medium-blue");
						Options.set("coloured", false);
						FindAndReplace.entries["status-modified.pl"].should.not.have.class("medium-blue");
						FindAndReplace.entries["status-new.pl"].should.not.have.class("medium-blue");
						Options.set("coloured", true);
						FindAndReplace.entries["status-modified.pl"].should.have.class("medium-blue");
						FindAndReplace.entries["status-new.pl"].should.have.class("medium-blue");
					}));
			});
		});
		
		when("the user has a light-coloured theme", () => {
			it("uses darker colours for thin-edged icons", async () => {
				Options.set("colourChangedOnly", false);
				Options.set("coloured", true);
				await FindAndReplace.search(/ABCD?/i);
				FindAndReplace.entries["la.tex"].should.have.classes("tex-icon medium-blue");
				FindAndReplace.entries["la.tex"].should.not.have.class("dark-blue");
				FindAndReplace.entries["subfolder/script.js"].should.have.classes("js-icon medium-yellow");
				FindAndReplace.entries["subfolder/script.js"].should.not.have.class("dark-yellow");
				await setTheme("atom-light");
				FindAndReplace.entries["la.tex"].should.have.classes("tex-icon dark-blue");
				FindAndReplace.entries["la.tex"].should.not.have.class("medium-blue");
				FindAndReplace.entries["subfolder/script.js"].should.have.classes("js-icon dark-yellow");
				FindAndReplace.entries["subfolder/script.js"].should.not.have.class("medium-yellow");
			});
			
			it("uses no colours if colours are disabled", async () => {
				await FindAndReplace.search("23");
				Options.get("coloured").should.be.true;
				await wait(100);
				FindAndReplace.entries["la.tex"].should.have.classes("tex-icon dark-blue");
				FindAndReplace.entries["la.tex"].should.not.have.class("medium-blue");
				FindAndReplace.entries["subfolder/script.js"].should.have.classes("js-icon dark-yellow");
				FindAndReplace.entries["subfolder/script.js"].should.not.have.class("medium-yellow");
				Options.set("coloured", false);
				FindAndReplace.entries["la.tex"].should.have.class("tex-icon");
				FindAndReplace.entries["la.tex"].should.not.have.classes("dark-blue medium-blue");
				FindAndReplace.entries["subfolder/script.js"].should.have.class("js-icon");
				FindAndReplace.entries["subfolder/script.js"].should.not.have.class("medium-yellow dark-yellow");
				Options.set("coloured", true);
				FindAndReplace.entries["la.tex"].should.have.classes("tex-icon dark-blue");
				FindAndReplace.entries["subfolder/script.js"].should.have.classes("js-icon dark-yellow");
			});
			
			it("uses different colours for Bower icons", async () => {
				await FindAndReplace.search("123");
				FindAndReplace.entries[".bowerrc"].should.have.classes("bower-icon medium-orange");
				FindAndReplace.entries[".bowerrc"].should.not.have.class("medium-yellow");
				await setTheme("atom-dark");
				FindAndReplace.entries[".bowerrc"].should.have.classes("bower-icon medium-yellow");
				FindAndReplace.entries[".bowerrc"].should.not.have.class("medium-orange");
			});
		});
		
		when("package settings change", () => {
			it("displays monochrome icons if colours are disabled", async () => {
				await FindAndReplace.search(/ABC/);
				classes.forEach(([name, ...classes]) => {
					const [icon, colour] = classes;
					if(!colour) return;
					
					Options.set("coloured", false);
					FindAndReplace.entries[name].should.have.class(icon);
					FindAndReplace.entries[name].should.not.have.class(colour);
					
					Options.set("coloured", true);
					FindAndReplace.entries[name].should.have.class(colour);
				});
			});
			
			it("updates icons when changing the default-icon class", async () => {
				await FindAndReplace.search("Blank");
				FindAndReplace.entries["blank.file"].should.have.class("default-icon");
				
				Options.set("defaultIconClass", "foo-bar");
				FindAndReplace.entries["blank.file"].should.have.class("foo-bar");
				FindAndReplace.entries["blank.file"].should.not.have.class("default-icon");
				
				Options.set("defaultIconClass", "bar-food");
				FindAndReplace.entries["blank.file"].should.have.class("bar-food");
				FindAndReplace.entries["blank.file"].should.not.have.classes("foo-bar default-icon");
				
				Options.set("defaultIconClass", "default-icon");
				FindAndReplace.entries["blank.file"].should.not.have.classes("foo-bar bar-food");
				FindAndReplace.entries["blank.file"].should.have.class("default-icon");
			});
			
			it('limits colour to modified files if "Colour changed only" is set', async () => {
				await FindAndReplace.search(/ABC/);
				
				Options.set("coloured", true);
				assertIconClasses(FindAndReplace.entries, colours);
				FindAndReplace.entries["status-modified.pl"].should.have.class("medium-blue");
				FindAndReplace.entries["status-new.pl"].should.have.class("medium-blue");
				
				Options.set("colourChangedOnly", true);
				assertIconClasses(FindAndReplace.entries, colours, true);
				FindAndReplace.entries["status-modified.pl"].should.have.class("medium-blue");
				FindAndReplace.entries["status-new.pl"].should.have.class("medium-blue");
				
				Options.set("coloured", false);
				assertIconClasses(FindAndReplace.entries, colours, true);
				FindAndReplace.entries["status-modified.pl"].should.not.have.class("medium-blue");
				FindAndReplace.entries["status-new.pl"].should.not.have.class("medium-blue");
				
				Options.set("coloured", true);
				assertIconClasses(FindAndReplace.entries, colours, true);
				FindAndReplace.entries["status-modified.pl"].should.have.class("medium-blue");
				FindAndReplace.entries["status-new.pl"].should.have.class("medium-blue");
			});
		});
	});
});
