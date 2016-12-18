"use strict";

const tmp     = require("tmp");
const path    = require("path");
const Options = require("../lib/options.js");
const Tabs    = require("../lib/consumers/tabs.js");

const {
	chain,
	wait
} = require("../lib/utils/general.js");

const {
	activate,
	open,
	setTheme,
	setup
} = require("./utils/atom-specs.js");


describe("Tabs", () => {
	let workspace;
	let tabs;
	
	setup("Activate packages", (done, fail) => {
		workspace = atom.views.getView(atom.workspace);
		open("fixtures/project");
		
		chain(
			atom.workspace.open(".bowerrc"),
			atom.workspace.open("la.tex"),
			atom.workspace.open("markdown.md"),
			atom.themes.activateThemes(),
			activate("file-icons", "tabs"),
			setTheme("atom-dark")
		).then(results => {
			attachToDOM(workspace);
			const tab = Tabs.tabForEditor(results.shift());
			expect(tab).to.exist;
			expect(tab.itemTitle).to.exist;
			tabs = ls();
			done();
		}).catch(error => fail(error));
	});
	
	
	describe("Icon classes", () => {
		it("displays an icon in a file's tab", () => {
			tabs["markdown.md"].should.have.classes("title icon markdown-icon medium-blue");
		});
		
		it("uses darker colours for thin icons in light themes", () => {
			tabs["la.tex"].should.have.class("medium-blue");
			tabs["la.tex"].should.not.have.class("dark-blue");
			
			return setTheme("atom-light").then(_=> {
				tabs["la.tex"].should.have.class("dark-blue");
				tabs["la.tex"].should.not.have.class("medium-blue");
			});
		});
		
		it("uses different colours for Bower icons in light themes", () => {
			tabs[".bowerrc"].should.have.class("medium-yellow");
			tabs[".bowerrc"].should.not.have.class("medium-orange");
			
			return setTheme("atom-light").then(_=> {
				tabs[".bowerrc"].should.have.class("medium-orange");
				tabs[".bowerrc"].should.not.have.class("medium-yellow");
			});
		});
		
		it("displays monochrome icons if coloured icons are disabled", () => {
			atom.config.get("file-icons.coloured").should.be.true;
			tabs["markdown.md"].should.have.class("medium-blue");
			
			Options.set("coloured", false);
			atom.config.get("file-icons.coloured").should.be.false;
			tabs["markdown.md"].should.not.have.class("medium-blue");
			
			Options.set("coloured", true);
			tabs["markdown.md"].should.have.class("medium-blue");
		});
		
		it("doesn't change the icons of built-in views", () => {
			return activate("settings-view").then(() => {
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


	describe("Disabling icons", () => {
		const classes = "markdown-icon medium-blue";
		
		it("doesn't show icon if tab-icons are disabled", () => {
			atom.config.get("file-icons.tabPaneIcon").should.be.true;
			atom.config.get("file-icons.coloured").should.be.true;
			
			tabs["markdown.md"].should.have.classes(classes);
			Options.set("tabPaneIcon", false);
			atom.config.get("file-icons.tabPaneIcon").should.be.false;
			tabs["markdown.md"].should.not.have.classes(classes);
			
			Options.set("tabPaneIcon", true);
			tabs["markdown.md"].should.have.classes(classes);
		});
		
		it("doesn't show icon if tab-icons are disabled and colour-setting changes", () => {
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
		
		it("uses the current colour-setting when re-enabling icons", () => {
			tabs["markdown.md"].should.have.class("medium-blue");
			Options.set("coloured", false);
			tabs["markdown.md"].should.not.have.class("medium-blue");
			
			Options.set("tabPaneIcon", false);
			Options.set("coloured", true);
			tabs["markdown.md"].should.not.have.class("medium-blue");
			
			Options.set("tabPaneIcon", true);
			tabs["markdown.md"].should.have.classes(classes);
		});
	});
	
	
	describe("New files", () => {
		let editor, pane, tabBar, tabEl;
		
		it("displays no icon when opening a blank editor", () => {
			tabBar = Tabs.package.tabBarViews[0];
			tabBar.should.exist;
			tabBar.children.should.have.lengthOf(3);
			Tabs.should.have.lengthOf(3);
			
			pane = atom.workspace.getActivePane();
			editor = atom.workspace.buildTextEditor({autoHeight: false});
			pane.addItem(editor);
			
			Tabs.should.have.lengthOf(3);
			tabBar.children.should.have.lengthOf(4);
		});
		
		it("displays an icon after saving a new file", () => {
			const tab = Tabs.tabForEditor(editor);
			Tabs.should.have.lengthOf(3);
			Tabs.tabsByElement.has(tab).should.be.false;
			tabEl = tab.itemTitle;
			tabEl.should.have.property("className", "title");
			
			const dir = tmp.dirSync();
			editor.saveAs(path.join(dir.name, "file.js"));
			return wait(20).then(() => {
				tabEl.should.have.classes("js-icon", "medium-yellow");
				Tabs.should.have.lengthOf(4);
				Tabs.tabsByElement.has(tab).should.be.true;
			});
		});
		
		it("updates the icon after saving when settings change", () => {
			tabEl.should.have.class("medium-yellow");
			Options.set("coloured", false);
			tabEl.should.not.have.class("medium-yellow");
			Options.set("coloured", true);
			tabEl.should.have.class("medium-yellow");
			
			Options.set("tabPaneIcon", false);
			tabEl.should.not.have.classes("js-icon", "medium-yellow");
			Options.set("tabPaneIcon", true);
			tabEl.should.have.classes("js-icon", "medium-yellow");
		});
	});
	
	
	function ls(){
		const tabs = [];
		for(const paneItem of atom.workspace.getPaneItems()){
			const name = paneItem.getFileName();
			const tab = Tabs.tabForEditor(paneItem);
			tabs.push(tab);
			Object.defineProperty(tabs, name, {value: tab.itemTitle});
		}
		return tabs;
	}
});
