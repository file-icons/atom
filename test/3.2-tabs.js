"use strict";

const Options = require("../lib/options.js");
const Tabs = require("./utils/tabs.js");


describe("Tabs", () => {
	const {
		assertIconClasses,
		move,
		open,
		resetOptions,
		resolvePath,
		rm,
		setTheme,
		wait,
	} = require("./utils");
	
	before(async () => {
		resetOptions();
		const [result] = await Promise.all([
			open("package.json"),
			open("markdown.md"),
			open("la.tex"),
			open("README.md"),
			open(".bowerrc")
		]);
		
		const tab = Tabs.getTab(result);
		expect(tab).to.exist;
		expect(tab.itemTitle).to.exist;
		Tabs.refresh();
	});
	
	
	when("a tab is opened", () => {
		it("displays an icon next to its title", () => {
			Tabs.list["markdown.md"].should.have.classes("title icon markdown-icon");
			Tabs.list["package.json"].should.have.classes("title icon npm-icon");
			Tabs.list["README.md"].should.have.classes("title icon book-icon");
		});
		
		it("displays the icon in colour", () => {
			Tabs.list["markdown.md"].should.have.class("medium-blue");
			Tabs.list["package.json"].should.have.class("medium-red");
			Tabs.list["README.md"].should.have.class("medium-blue");
		});
	});
	
	when("displayed in a light-coloured theme", async () => {
		it("darkens the colour of thin icons to improve contrast", async () => {
			Tabs.list["la.tex"].should.have.classes("title icon medium-blue");
			Tabs.list["la.tex"].should.not.have.class("dark-blue");
			await setTheme("atom-light");
			Tabs.list["la.tex"].should.have.classes("title icon dark-blue");
			Tabs.list["la.tex"].should.not.have.class("medium-blue");
		});
		
		it("uses different colours for Bower icons", async () => {
			Tabs.list[".bowerrc"].should.have.classes("title icon medium-orange");
			Tabs.list[".bowerrc"].should.not.have.class("medium-yellow");
			await setTheme("atom-dark");
			Tabs.list[".bowerrc"].should.have.classes("title icon medium-yellow");
			Tabs.list[".bowerrc"].should.not.have.class("medium-orange");
		});
	});
	
	when("coloured icons are disabled", () => {
		it("fills icons with the theme's default text-colour", () => {
			atom.config.get("file-icons.coloured").should.be.true;
			Tabs.list["markdown.md"]  .should.have.classes("title icon markdown-icon medium-blue");
			Tabs.list["package.json"] .should.have.classes("title icon npm-icon medium-red");
			Tabs.list["README.md"]    .should.have.classes("title icon book-icon medium-blue");
			
			Options.set("coloured", false);
			atom.config.get("file-icons.coloured").should.be.false;
			Tabs.list["markdown.md"]  .should.not.have.class("medium-blue");
			Tabs.list["package.json"] .should.not.have.class("medium-red");
			Tabs.list["README.md"]    .should.not.have.class("medium-blue");
			Tabs.list["markdown.md"]  .should.have.classes("title icon markdown-icon");
			Tabs.list["package.json"] .should.have.classes("title icon npm-icon");
			Tabs.list["README.md"]    .should.have.classes("title icon book-icon");
			
			Options.set("coloured", true);
			Tabs.list["markdown.md"]  .should.have.classes("title icon markdown-icon medium-blue");
			Tabs.list["package.json"] .should.have.classes("title icon npm-icon medium-red");
			Tabs.list["README.md"]    .should.have.classes("title icon book-icon medium-blue");
		});
	});
	
	when("a built-in view is opened", () => {
		it("doesn't change its tab's icon", async () => {
			await atom.packages.activatePackage("settings-view");
			await atom.workspace.open("atom://config");
			const workspace = atom.views.getView(atom.workspace);
			const tab = workspace.querySelector("li.tab[data-type=SettingsView]");
			for(let i = 0; i < 2; ++i){
				tab.itemTitle.should.have.property("className", "title icon icon-tools");
				Options.toggle("coloured");
			}
			atom.workspace.closeActivePaneItemOrEmptyPaneOrWindow();
		});
	});

	when("tab-icons are disabled", () => {
		const classes = "markdown-icon medium-blue";
		
		it("doesn't show an icon", () => {
			atom.config.get("file-icons.tabPaneIcon").should.be.true;
			atom.config.get("file-icons.coloured").should.be.true;
			
			Tabs.list["markdown.md"].should.have.classes(classes, "title icon");
			Options.set("tabPaneIcon", false);
			atom.config.get("file-icons.tabPaneIcon").should.be.false;
			Tabs.list["markdown.md"].should.not.have.classes(classes);
			
			Options.set("tabPaneIcon", true);
			Tabs.list["markdown.md"].should.have.classes(classes, "title icon");
		});
		
		when("colour settings change while disabled", () => {
			it("still doesn't show anything", () => {
				Options.set("tabPaneIcon", false);
				Tabs.list["markdown.md"].should.not.have.classes(classes);
				
				Options.set("coloured", false);
				atom.config.get("file-icons.coloured").should.be.false;
				Tabs.list["markdown.md"].should.not.have.classes(classes);
				
				Options.set("coloured", true);
				Tabs.list["markdown.md"].should.not.have.classes(classes);
				Options.set("tabPaneIcon", true);
				Tabs.list["markdown.md"].should.have.classes(classes);
			});
		});
		
		when("a tab is opened while disabled", () =>
			it("doesn't display an icon", async () => {
				const classes = "bower-icon medium-yellow";
				Tabs.list[".bowerrc"].should.have.classes(classes);
				Options.set("tabPaneIcon", false);
				Tabs.list[".bowerrc"].should.not.have.classes(classes);
				
				atom.workspace.destroyActivePaneItem();
				Tabs.refresh();
				expect(Tabs.list[".bowerrc"]).not.to.exist;
				
				const workspace = atom.views.getView(atom.workspace);
				atom.commands.dispatch(workspace, "pane:reopen-closed-item");
				await wait(100);
				Tabs.refresh();
				
				expect(Tabs.list[".bowerrc"]).to.exist;
				Tabs.list[".bowerrc"].should.not.have.classes(classes);
				Options.set("tabPaneIcon", true);
				Tabs.list[".bowerrc"].should.have.classes(classes);
			}));
		
		when("tab-icons are re-enabled", () => {
			it("displays icons using correct, up-to-date settings", () => {
				Tabs.list["markdown.md"].should.have.classes("title icon medium-blue");
				Options.set("coloured", false);
				Tabs.list["markdown.md"].should.not.have.class("medium-blue");
				
				Options.set("tabPaneIcon", false);
				Options.set("coloured", true);
				Tabs.list["markdown.md"].should.not.have.class("medium-blue");
				
				Options.set("tabPaneIcon", true);
				Tabs.list["markdown.md"].should.have.classes(classes, "title icon");
			});
		});
	});
	
	
	when("opening a blank editor", () => {
		let editor, pane, tabBar, tabEl, name;
		
		after(() => rm(name));
		
		it("shows a tab without an icon", () => {
			[tabBar] = atom.packages.activePackages["tabs"].mainModule.tabBarViews;
			tabBar.should.exist;
			tabBar.getTabs().should.have.lengthOf(5);
			
			Tabs.refresh();
			Tabs.list.should.have.lengthOf.at.least(3);
			
			pane = atom.workspace.getActivePane();
			editor = atom.workspace.buildTextEditor({autoHeight: false});
			pane.addItem(editor);
			
			Tabs.refresh();
			tabBar.getTabs().should.have.lengthOf(6);
		});
		
		when("the file is saved to disk", () => {
			it("adds an icon to its tab", async () => {
				const tab = Tabs.getTab(editor);
				tabEl = tab.itemTitle;
				tabEl.should.have.property("className", "title");
				
				name = "file.js";
				editor.saveAs(resolvePath(name));
				await wait(400);
				tabEl.should.have.classes("title icon js-icon medium-yellow");
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
			it("changes its icon if it matches a different format", async () => {
				tabEl.should.have.classes("title icon js-icon medium-yellow");
				move("file.js", name = "file.pl");
				await wait(400);
				tabEl.should.have.classes("title icon perl-icon medium-blue");
				Options.set("coloured", false);
				tabEl.should.have.class("perl-icon");
				// FIXME: tabEl.should.not.have.class("medium-blue");
			});
		});
	});
	
	when("in a Git repository", () =>
		when('the "Only colour when changed" setting is enabled', () => {
			before(async () => {
				await open("status-modified.pl");
				await open("status-new.pl");
				Options.set("coloured", true);
				Options.set("colourChangedOnly", true);
				Tabs.refresh();
			});
			
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
					assertIconClasses(Tabs.list, tabIcons);
					assertIconClasses(Tabs.list, tabColours, true);
					Options.set("coloured", false);
					assertIconClasses(Tabs.list, tabIcons);
					assertIconClasses(Tabs.list, tabColours, true);
					Options.set("coloured", true);
					assertIconClasses(Tabs.list, tabIcons);
					assertIconClasses(Tabs.list, tabColours, true);
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
					assertIconClasses(Tabs.list, tabIcons);
					assertIconClasses(Tabs.list, tabColours);
					Options.set("coloured", false);
					assertIconClasses(Tabs.list, tabIcons);
					assertIconClasses(Tabs.list, tabColours, true);
					Options.set("coloured", true);
					assertIconClasses(Tabs.list, tabIcons);
					assertIconClasses(Tabs.list, tabColours);
				}));
		}));
});
