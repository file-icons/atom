"use strict";

const {assertIconClasses, open, setup, wait} = require("./utils");
const Options  = require("../lib/options.js");
const TreeView = require("./utils/tree-view.js");
const Tabs     = require("./utils/tabs.js");


describe("User-defined filetypes", () => {
	before("Extracting fixtures", async function(){
		this.timeout(0);
		await setup("4.2-usertype", {
			symlinks: [
				["test.m",       "test-1"],
				["test.mm",      "test-2"],
				["test.stTheme", "test-3"],
				["test.t",       "test-4"],
				["test.tmMacro", "test-5"]
			]
		});
		await open("test.m");
		await open("test.mm");
		await open("test.stTheme");
		await open("test.t");
		await open("test.tmMacro");
		TreeView.refresh();
		TreeView.entries.should.not.be.empty;
		TreeView.entries.should.have.lengthOf.at.least(5);
		Tabs.refresh();
		Tabs.list.should.not.be.empty;
		Tabs.list.should.have.lengthOf.at.least(5);
	});
	
	const treeIcon = "name icon ";
	const tabIcon  = "title icon ";
	
	when("a file matches a user-defined filetype", () => {
		it("displays the icon of the language the type is mapped to", () => {
			TreeView.entries["test.m"]  .should.have.classes(treeIcon + "objc-icon medium-blue");
			TreeView.entries["test.mm"] .should.have.classes(treeIcon + "objc-icon medium-blue");
			TreeView.entries["test.t"]  .should.have.classes(treeIcon + "test-perl-icon medium-blue");
			Tabs.list["test.m"]         .should.have.classes(tabIcon  + "objc-icon medium-blue");
			Tabs.list["test.mm"]        .should.have.classes(tabIcon  + "objc-icon medium-blue");
			Tabs.list["test.t"]         .should.have.classes(tabIcon  + "test-perl-icon medium-blue");
			atom.config.set("core.customFileTypes", {
				"source.matlab": ["m"],
				"text.roff":    ["mm"],
				"source.turing": ["t"],
			});
			TreeView.entries["test.m"]  .should.have.classes(treeIcon + "matlab-icon medium-yellow");
			TreeView.entries["test.mm"] .should.have.classes(treeIcon + "manpage-icon dark-green");
			TreeView.entries["test.t"]  .should.have.classes(treeIcon + "turing-icon medium-red");
			Tabs.list["test.m"]         .should.have.classes(tabIcon  + "matlab-icon medium-yellow");
			Tabs.list["test.mm"]        .should.have.classes(tabIcon  + "manpage-icon dark-green");
			Tabs.list["test.t"]         .should.have.classes(tabIcon  + "turing-icon medium-red");
			TreeView.entries["test.m"]  .should.not.have.classes("objc-icon medium-blue");
			TreeView.entries["test.mm"] .should.not.have.classes("objc-icon medium-blue");
			TreeView.entries["test.t"]  .should.not.have.classes("perl-icon medium-blue");
			Tabs.list["test.m"]         .should.not.have.classes("objc-icon medium-blue");
			Tabs.list["test.mm"]        .should.not.have.classes("objc-icon medium-blue");
			Tabs.list["test.t"]         .should.not.have.classes("perl-icon medium-blue");
		});
		
		it("only uses icons with an assigned scope-type", () => {
			TreeView.entries["test.stTheme"]  .should.have.classes(treeIcon + "sublime-icon  medium-orange");
			TreeView.entries["test.tmMacro"]  .should.have.classes(treeIcon + "textmate-icon medium-maroon");
			Tabs.list["test.stTheme"]         .should.have.classes(tabIcon  + "sublime-icon  medium-orange");
			Tabs.list["test.tmMacro"]         .should.have.classes(tabIcon  + "textmate-icon medium-maroon");
			atom.config.set("core.customFileTypes", {
				"source.json": ["stTheme"],
				"text.xml": ["tmMacro"],
			});
			TreeView.entries["test.stTheme"]  .should.have.classes(treeIcon + "sublime-icon  medium-orange");
			TreeView.entries["test.tmMacro"]  .should.have.classes(treeIcon + "textmate-icon medium-maroon");
			Tabs.list["test.stTheme"]         .should.have.classes(tabIcon  + "sublime-icon  medium-orange");
			Tabs.list["test.tmMacro"]         .should.have.classes(tabIcon  + "textmate-icon medium-maroon");
			TreeView.entries["test.stTheme"]  .should.not.have.classes("database-icon medium-yellow");
			TreeView.entries["test.tmMacro"]  .should.not.have.classes("code-icon medium-blue");
			Tabs.list["test.stTheme"]         .should.not.have.classes("database-icon medium-yellow");
			Tabs.list["test.tmMacro"]         .should.not.have.classes("code-icon medium-blue");
		});
	});
	
	
	when("user-defined filetypes change", () => {
		it("updates icons being displayed", () => {
			atom.config.set("core.customFileTypes", {
				"source.mathematica":  ["m"],
				"source.matlab":      ["mm"],
				"source.terraform":    ["t"],
				"source.js":     ["stTheme"],
				"source.python": ["tmMacro"],
			});
			assertIconClasses(TreeView.entries, [
				["test.m",       treeIcon + "mathematica-icon  dark-red"],
				["test.mm",      treeIcon + "matlab-icon       medium-yellow"],
				["test.t",       treeIcon + "terraform-icon    dark-purple"],
				["test.stTheme", treeIcon + "js-icon           medium-yellow"],
				["test.tmMacro", treeIcon + "python-icon       dark-blue"]
			]);
			assertIconClasses(Tabs.list, [
				["test.m",       tabIcon  + "mathematica-icon  dark-red"],
				["test.mm",      tabIcon  + "matlab-icon       medium-yellow"],
				["test.t",       tabIcon  + "terraform-icon    dark-purple"],
				["test.stTheme", tabIcon  + "js-icon           medium-yellow"],
				["test.tmMacro", tabIcon  + "python-icon       dark-blue"]
			]);
			atom.config.set("core.customFileTypes", {});
			assertIconClasses(TreeView.entries, [
				["test.m",       "mathematica-icon  dark-red"],
				["test.mm",      "matlab-icon       medium-yellow"],
				["test.t",       "terraform-icon    dark-purple"],
				["test.stTheme", "js-icon           medium-yellow"],
				["test.tmMacro", "python-icon       dark-blue"]
			], true);
			assertIconClasses(Tabs.list, [
				["test.m",       "mathematica-icon  dark-red"],
				["test.mm",      "matlab-icon       medium-yellow"],
				["test.t",       "terraform-icon    dark-purple"],
				["test.stTheme", "js-icon           medium-yellow"],
				["test.tmMacro", "python-icon       dark-blue"]
			], true);
		});
		
		it("updates icons not being displayed", () => {
			atom.config.set("core.customFileTypes", {
				"source.mathematica": ["m"],
				"source.matlab":     ["mm"],
				"source.terraform":   ["t"],
				"source.js":    ["stTheme"]
			});
			TreeView.collapse();
			atom.config.set("core.customFileTypes", {
				"source.ruby": ["m"],
				"source.perl": ["mm"],
				"source.twig": ["t"],
				"source.less": ["stTheme"],
				"source.sass": ["tmMacro"]
			});
			TreeView.expand();
			TreeView.refresh();
			assertIconClasses(TreeView.entries, [
				["test.m",          treeIcon + "ruby-icon medium-red"],
				["test.mm",         treeIcon + "perl-icon medium-blue"],
				["test.stTheme",    treeIcon + "css3-icon dark-blue"],
				["test.t",          treeIcon + "twig-icon medium-green"],
				["test.tmMacro",    treeIcon + "sass-icon dark-pink"]
			]);
		});
		
		it("updates the colour of symlinks targeting affected files", async () => {
			TreeView.expand("symlinks");
			await wait(500);
			TreeView.refresh();
			assertIconClasses(TreeView.entries, [
				["test.m",          treeIcon + "ruby-icon medium-red"],
				["test.mm",         treeIcon + "perl-icon medium-blue"],
				["test.stTheme",    treeIcon + "css3-icon dark-blue"],
				["test.t",          treeIcon + "twig-icon medium-green"],
				["test.tmMacro",    treeIcon + "sass-icon dark-pink"],
				["symlinks/test-1", treeIcon + "icon-file-symlink-file medium-red"],
				["symlinks/test-2", treeIcon + "icon-file-symlink-file medium-blue"],
				["symlinks/test-3", treeIcon + "icon-file-symlink-file dark-blue"],
				["symlinks/test-4", treeIcon + "icon-file-symlink-file medium-green"],
				["symlinks/test-5", treeIcon + "icon-file-symlink-file dark-pink"]
			]);
			atom.config.set("core.customFileTypes", {
				"source.mathematica":  ["m"],
				"source.matlab":      ["mm"],
				"source.terraform":    ["t"],
				"source.js":     ["stTheme"],
				"source.python": ["tmMacro"]
			});
			assertIconClasses(TreeView.entries, [
				["test.m",          treeIcon + "mathematica-icon  dark-red"],
				["test.mm",         treeIcon + "matlab-icon       medium-yellow"],
				["test.t",          treeIcon + "terraform-icon    dark-purple"],
				["test.stTheme",    treeIcon + "js-icon           medium-yellow"],
				["test.tmMacro",    treeIcon + "python-icon       dark-blue"],
				["symlinks/test-1", treeIcon + "icon-file-symlink-file dark-red"],
				["symlinks/test-2", treeIcon + "icon-file-symlink-file medium-yellow"],
				["symlinks/test-3", treeIcon + "icon-file-symlink-file medium-yellow"],
				["symlinks/test-4", treeIcon + "icon-file-symlink-file dark-purple"],
				["symlinks/test-5", treeIcon + "icon-file-symlink-file dark-blue"]
			]);
			atom.config.set("core.customFileTypes", {});
			assertIconClasses(TreeView.entries, [
				["test.m",          treeIcon + "objc-icon medium-blue"],
				["test.mm",         treeIcon + "objc-icon medium-blue"],
				["test.t",          treeIcon + "test-perl-icon medium-blue"],
				["test.stTheme",    treeIcon + "sublime-icon medium-orange"],
				["test.tmMacro",    treeIcon + "textmate-icon medium-maroon"],
				["symlinks/test-1", treeIcon + "icon-file-symlink-file medium-blue"],
				["symlinks/test-2", treeIcon + "icon-file-symlink-file medium-blue"],
				["symlinks/test-3", treeIcon + "icon-file-symlink-file medium-orange"],
				["symlinks/test-4", treeIcon + "icon-file-symlink-file medium-blue"],
				["symlinks/test-5", treeIcon + "icon-file-symlink-file medium-maroon"]
			]);
		});
	});
	
	
	when("the user disables the usertype strategy", () => {
		beforeEach(() => {
			Options.set("usertypes", true);
			atom.config.set("core.customFileTypes", {
				"source.matlab": ["m"],
				"text.roff":    ["mm"],
				"source.turing": ["t"]
			});
			TreeView.entries["test.m"]       .should.have.classes(treeIcon + "matlab-icon   medium-yellow");
			TreeView.entries["test.mm"]      .should.have.classes(treeIcon + "manpage-icon  dark-green");
			TreeView.entries["test.t"]       .should.have.classes(treeIcon + "turing-icon   medium-red");
			TreeView.entries["test.stTheme"] .should.have.classes(treeIcon + "sublime-icon  medium-orange");
			TreeView.entries["test.tmMacro"] .should.have.classes(treeIcon + "textmate-icon medium-maroon");
			Tabs.list["test.m"]              .should.have.classes(tabIcon  + "matlab-icon   medium-yellow");
			Tabs.list["test.mm"]             .should.have.classes(tabIcon  + "manpage-icon  dark-green");
			Tabs.list["test.t"]              .should.have.classes(tabIcon  + "turing-icon   medium-red");
			Tabs.list["test.stTheme"]        .should.have.classes(tabIcon  + "sublime-icon  medium-orange");
			Tabs.list["test.tmMacro"]        .should.have.classes(tabIcon  + "textmate-icon medium-maroon");
		});
		
		it("restores affected icons", () => {
			Options.set("usertypes", false);
			TreeView.entries["test.m"]       .should.have.classes(treeIcon + "objc-icon     medium-blue");
			TreeView.entries["test.mm"]      .should.have.classes(treeIcon + "objc-icon     medium-blue");
			TreeView.entries["test.t"]       .should.have.classes(treeIcon + "test-perl-icon medium-blue");
			TreeView.entries["test.m"]       .should.not.have.classes(       "matlab-icon   medium-yellow");
			TreeView.entries["test.mm"]      .should.not.have.classes(       "manpage-icon  dark-green");
			TreeView.entries["test.t"]       .should.not.have.classes(       "turing-icon   medium-red");
			Tabs.list["test.m"]              .should.have.classes(tabIcon  + "objc-icon     medium-blue");
			Tabs.list["test.mm"]             .should.have.classes(tabIcon  + "objc-icon     medium-blue");
			Tabs.list["test.t"]              .should.have.classes(tabIcon  + "test-perl-icon medium-blue");
			Tabs.list["test.m"]              .should.not.have.classes(       "matlab-icon   medium-yellow");
			Tabs.list["test.mm"]             .should.not.have.classes(       "manpage-icon  dark-green");
			Tabs.list["test.t"]              .should.not.have.classes(       "turing-icon   medium-red");
		});
		
		it("leaves unaffected icons alone", () => {
			Options.set("usertypes", false);
			TreeView.entries["test.stTheme"] .should.have.classes(treeIcon + "sublime-icon  medium-orange");
			TreeView.entries["test.tmMacro"] .should.have.classes(treeIcon + "textmate-icon medium-maroon");
			Tabs.list["test.stTheme"]        .should.have.classes(tabIcon  + "sublime-icon  medium-orange");
			Tabs.list["test.tmMacro"]        .should.have.classes(tabIcon  + "textmate-icon medium-maroon");
		});
		
		describe("If usertypes change while the strategy is disabled", () => {
			const classes = [
				["test.m",       "ruby-icon medium-red"],
				["test.mm",      "java-icon medium-purple"],
				["test.stTheme", "css3-icon dark-blue"],
				["test.t",       "html5-icon medium-orange"],
				["test.tmMacro", "css3-icon medium-blue"]
			];
			const types = {
				"source.ruby": ["m"],
				"source.java": ["mm"],
				"text.html.basic": ["t"],
				"source.less": ["stTheme"],
				"source.css": ["tmMacro"]
			};
			
			it("does nothing", () => {
				Options.set("usertypes", false);
				assertIconClasses(TreeView.entries, classes, true);
				atom.config.set("core.customFileTypes", types);
				assertIconClasses(TreeView.entries, classes, true);
				atom.config.set("core.customFileTypes", {});
				assertIconClasses(TreeView.entries, classes, true);
				Options.set("usertypes", true);
				assertIconClasses(TreeView.entries, classes, true);
			});
			
			it("shows icons for updated types when re-enabled", () => {
				atom.config.set("core.customFileTypes", types);
				assertIconClasses(TreeView.entries, classes);
				Options.set("usertypes", false);
				assertIconClasses(TreeView.entries, classes, true);
				assertIconClasses(TreeView.entries, [
					["test.m",       treeIcon + "objc-icon      medium-blue"],
					["test.mm",      treeIcon + "objc-icon      medium-blue"],
					["test.t",       treeIcon + "test-perl-icon medium-blue"],
					["test.stTheme", treeIcon + "sublime-icon   medium-orange"],
					["test.tmMacro", treeIcon + "textmate-icon  medium-maroon"]
				]);
				atom.config.set("core.customFileTypes", {
					"source.mathematica": ["m"],
					"source.matlab":     ["mm"],
					"source.terraform":   ["t"],
					"source.js":    ["stTheme"]
				});
				Options.set("usertypes", true);
				assertIconClasses(TreeView.entries, classes, true);
				assertIconClasses(TreeView.entries, [
					["test.m",       treeIcon + "mathematica-icon dark-red"],
					["test.mm",      treeIcon + "matlab-icon      medium-yellow"],
					["test.t",       treeIcon + "terraform-icon   dark-purple"],
					["test.stTheme", treeIcon + "js-icon          medium-yellow"],
					["test.tmMacro", treeIcon + "textmate-icon    medium-maroon"]
				]);
			});
		});
	});
});
