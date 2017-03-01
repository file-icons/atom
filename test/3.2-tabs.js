"use strict";

const Options = require("../lib/options.js");
const Tabs = require("../lib/consumers/tabs.js");


describe("Tabs", () => {
	let tabs;
	
	before(() => {
		resetOptions();
		return Promise.all([
			open("package.json"),
			open("markdown.md"),
			open("la.tex"),
			open("README.md"),
			open(".bowerrc")
		]).then(results => {
			const tab = Tabs.tabForEditor(results.shift());
			expect(tab).to.exist;
			expect(tab.itemTitle).to.exist;
			tabs = Tabs.ls();
		});
	});
	
	
	when("a tab is opened", () => {
		it("displays an icon next to its title", () => {
			tabs["markdown.md"].should.have.classes("title icon markdown-icon");
			tabs["package.json"].should.have.classes("title icon npm-icon");
			tabs["README.md"].should.have.classes("title icon book-icon");
		});
		
		it("displays the icon in colour", () => {
			tabs["markdown.md"].should.have.class("medium-blue");
			tabs["package.json"].should.have.class("medium-red");
			tabs["README.md"].should.have.class("medium-blue");
		});
	});
	
	when("displayed in a light-coloured theme", () => {
		it("darkens the colour of thin icons to improve contrast", () => {
			tabs["la.tex"].should.have.classes("title icon medium-blue");
			tabs["la.tex"].should.not.have.class("dark-blue");
			
			return setTheme("atom-light").then(_=> {
				tabs["la.tex"].should.have.classes("title icon dark-blue");
				tabs["la.tex"].should.not.have.class("medium-blue");
			});
		});
		
		it("uses different colours for Bower icons", () => {
			tabs[".bowerrc"].should.have.classes("title icon medium-orange");
			tabs[".bowerrc"].should.not.have.class("medium-yellow");
			
			return setTheme("atom-dark").then(_=> {
				tabs[".bowerrc"].should.have.classes("title icon medium-yellow");
				tabs[".bowerrc"].should.not.have.class("medium-orange");
			});
		});
	});
	
	when("coloured icons are disabled", () => {
		it("fills icons with the theme's default text-colour", () => {
			atom.config.get("file-icons.coloured").should.be.true;
			tabs["markdown.md"]  .should.have.classes("title icon markdown-icon medium-blue");
			tabs["package.json"] .should.have.classes("title icon npm-icon medium-red");
			tabs["README.md"]    .should.have.classes("title icon book-icon medium-blue");
			
			Options.set("coloured", false);
			atom.config.get("file-icons.coloured").should.be.false;
			tabs["markdown.md"]  .should.not.have.class("medium-blue");
			tabs["package.json"] .should.not.have.class("medium-red");
			tabs["README.md"]    .should.not.have.class("medium-blue");
			tabs["markdown.md"]  .should.have.classes("title icon markdown-icon");
			tabs["package.json"] .should.have.classes("title icon npm-icon");
			tabs["README.md"]    .should.have.classes("title icon book-icon");
			
			Options.set("coloured", true);
			tabs["markdown.md"]  .should.have.classes("title icon markdown-icon medium-blue");
			tabs["package.json"] .should.have.classes("title icon npm-icon medium-red");
			tabs["README.md"]    .should.have.classes("title icon book-icon medium-blue");
		});
	});
	
	when("a built-in view is opened", () => {
		it("doesn't change its tab's icon", () => {
			return atom.packages.activatePackage("settings-view").then(() => {
				const view = atom.workspace.openSync("atom://config");
				const tab = workspace.querySelector("li.tab[data-type=SettingsView]");
				for(let i = 0; i < 2; ++i){
					tab.itemTitle.should.have.property("className", "title icon icon-tools");
					Options.toggle("coloured");
				}
				atom.workspace.closeActivePaneItemOrEmptyPaneOrWindow();
			});
		});
	});

	when("tab-icons are disabled", () => {
		const classes = "markdown-icon medium-blue";
		
		it("doesn't show an icon", () => {
			atom.config.get("file-icons.tabPaneIcon").should.be.true;
			atom.config.get("file-icons.coloured").should.be.true;
			
			tabs["markdown.md"].should.have.classes(classes, "title icon");
			Options.set("tabPaneIcon", false);
			atom.config.get("file-icons.tabPaneIcon").should.be.false;
			tabs["markdown.md"].should.not.have.classes(classes);
			
			Options.set("tabPaneIcon", true);
			tabs["markdown.md"].should.have.classes(classes, "title icon");
		});
		
		when("colour settings change while disabled", () => {
			it("still doesn't show anything", () => {
				Options.set("tabPaneIcon", false);
				tabs["markdown.md"].should.not.have.classes(classes);
				
				Options.set("coloured", false);
				atom.config.get("file-icons.coloured").should.be.false;
				tabs["markdown.md"].should.not.have.classes(classes);
				
				Options.set("coloured", true);
				tabs["markdown.md"].should.not.have.classes(classes);
				Options.set("tabPaneIcon", true);
				tabs["markdown.md"].should.have.classes(classes);
			});
		});
		
		when("a tab is opened while disabled", () =>
			it("doesn't display an icon", () => {
				const classes = "bower-icon medium-yellow";
				tabs[".bowerrc"].should.have.classes(classes);
				Options.set("tabPaneIcon", false);
				tabs[".bowerrc"].should.not.have.classes(classes);
				
				atom.workspace.destroyActivePaneItem();
				tabs = Tabs.ls();
				expect(tabs[".bowerrc"]).not.to.exist;
				
				atom.commands.dispatch(atom.views.getView(atom.workspace), "pane:reopen-closed-item");
				return wait(100).then(() => {
					tabs = Tabs.ls();
					expect(tabs[".bowerrc"]).to.exist;
					tabs[".bowerrc"].should.not.have.classes(classes);
					Options.set("tabPaneIcon", true);
					tabs[".bowerrc"].should.have.classes(classes);
				});
			}));
		
		when("tab-icons are re-enabled", () => {
			it("displays icons using correct, up-to-date settings", () => {
				tabs["markdown.md"].should.have.classes("title icon medium-blue");
				Options.set("coloured", false);
				tabs["markdown.md"].should.not.have.class("medium-blue");
				
				Options.set("tabPaneIcon", false);
				Options.set("coloured", true);
				tabs["markdown.md"].should.not.have.class("medium-blue");
				
				Options.set("tabPaneIcon", true);
				tabs["markdown.md"].should.have.classes(classes, "title icon");
			});
		});
	});
	
	
	when("opening a blank editor", () => {
		let editor, pane, tabBar, tabEl, name;
		let trackedTabCount = 0;
		
		after(() => rm(name));
		
		it("shows a tab without an icon", () => {
			tabBar = Tabs.packageModule.tabBarViews[0];
			tabBar.should.exist;
			tabBar.getTabs().should.have.lengthOf(5);
			
			trackedTabCount = Tabs.length;
			trackedTabCount.should.be.at.least(3);
			
			pane = atom.workspace.getActivePane();
			editor = atom.workspace.buildTextEditor({autoHeight: false});
			pane.addItem(editor);
			
			Tabs.should.have.lengthOf(trackedTabCount);
			tabBar.getTabs().should.have.lengthOf(6);
		});
		
		when("the file is saved to disk", () => {
			it("adds an icon to its tab", () => {
				const tab = Tabs.tabForEditor(editor);
				Tabs.should.have.lengthOf(trackedTabCount);
				Tabs.tabsByElement.has(tab).should.be.false;
				tabEl = tab.itemTitle;
				tabEl.should.have.property("className", "title");
				
				name = "file.js";
				editor.saveAs(resolvePath(name));
				return wait(400).then(() => {
					tabEl.should.have.classes("title icon js-icon medium-yellow");
					Tabs.should.have.lengthOf(trackedTabCount + 1);
					Tabs.tabsByElement.has(tab).should.be.true;
				});
			});
			
			when("settings change after saving the file", () => {
				it("keeps its icon updated", () => {
					tabEl.should.have.classes("title icon js-icon medium-yellow");
					Options.set("coloured", false);
					tabEl.should.have.classes("title icon js-icon");
					tabEl.should.not.have.class("medium-yellow");
					Options.set("coloured", true);
					tabEl.should.have.classes("title icon js-icon medium-yellow");
					
					Options.set("tabPaneIcon", false);
					tabEl.should.not.have.classes("js-icon", "medium-yellow");
					Options.set("tabPaneIcon", true);
					tabEl.should.have.classes("js-icon", "medium-yellow");
				});
			});
		});
		
		when("the file's extension changes", () => {
			it("changes its icon if it matches a different format", () => {
				tabEl.should.have.classes("title icon js-icon medium-yellow");
				move("file.js", name = "file.pl");
				return wait(400).then(() => {
					tabEl.should.have.classes("title icon perl-icon medium-blue");
					Options.set("coloured", false);
					tabEl.should.have.class("perl-icon");
					tabEl.should.not.have.class("medium-blue");
				});
			});
		});
	});
	
	when("in a Git repository", () =>
		when(`the "Only colour when changed" setting is enabled`, () => {
			before(() => chain([
				() => open("status-modified.pl"),
				() => open("status-new.pl"),
				() => {
					Options.set("coloured", true);
					Options.set("colourChangedOnly", true);
					tabs = Tabs.ls();
				}
			]));
			
			after(() => {
				Options.set("coloured", true);
				Options.set("colourChangedOnly", false);
			});
			
			
			describe("If the file is unmodified", () =>
				it("doesn't show a coloured icon", () => {
					const tabIcons = [
						["la.tex",        "title icon tex-icon"],
						["markdown.md",   "title icon markdown-icon"],
						["package.json",  "title icon npm-icon"],
						["README.md",     "title icon book-icon"],
						[".bowerrc",      "title icon bower-icon"]
					];
					const tabColours = [
						["la.tex",        "medium-blue"],
						["markdown.md",   "medium-blue"],
						["package.json",  "medium-red"],
						["README.md",     "medium-blue"],
						[".bowerrc",      "medium-yellow"]
					];
					assertIconClasses(tabs, tabIcons);
					assertIconClasses(tabs, tabColours, true);
					Options.set("coloured", false);
					assertIconClasses(tabs, tabIcons);
					assertIconClasses(tabs, tabColours, true);
					Options.set("coloured", true);
					assertIconClasses(tabs, tabIcons);
					assertIconClasses(tabs, tabColours, true);
				}));
			
			describe("If the file is modified", () =>
				it("shows a coloured icon", () => {
					const tabIcons = [
						["status-modified.pl", "title icon perl-icon"],
						["status-new.pl",      "title icon perl-icon"]
					];
					const tabColours = [
						["status-modified.pl", "medium-blue"],
						["status-new.pl",      "medium-blue"]
					];
					assertIconClasses(tabs, tabIcons);
					assertIconClasses(tabs, tabColours);
					Options.set("coloured", false);
					assertIconClasses(tabs, tabIcons);
					assertIconClasses(tabs, tabColours, true);
					Options.set("coloured", true);
					assertIconClasses(tabs, tabIcons);
					assertIconClasses(tabs, tabColours);
				}));
		}));
});
