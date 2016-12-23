"use strict";

const TreeView = require("../lib/consumers/tree-view.js");
const Options = require("../lib/options.js");
const Tabs = require("../lib/consumers/tabs.js");


describe("User-defined filetypes", () => {
	const treeIcon = "name icon ";
	const tabIcon  = "title icon ";
	let files, tabs;
	
	before(() => {
		TreeView.collapse("path");
		TreeView.expand("usertype");
		files = TreeView.ls();
		files.should.not.be.empty;
		files.length.should.be.at.least(5);
		
		return chain([
			open("usertype/test.m"),
			open("usertype/test.mm"),
			open("usertype/test.stTheme"),
			open("usertype/test.t"),
			open("usertype/test.tmMacro")
		]).then(() => {
			tabs = Tabs.ls();
			tabs.should.not.be.empty;
			tabs.length.should.be.at.least(5);
		});
	});
	
	
	describe("When a file matches a user-defined filetype", () => {
		it("displays the icon of the language the type is mapped to", () => {
			files["usertype/test.m"]  .should.have.classes(treeIcon + "objc-icon medium-blue");
			files["usertype/test.mm"] .should.have.classes(treeIcon + "objc-icon medium-blue");
			files["usertype/test.t"]  .should.have.classes(treeIcon + "perl-icon medium-blue");
			tabs["test.m"]            .should.have.classes(tabIcon  + "objc-icon medium-blue");
			tabs["test.mm"]           .should.have.classes(tabIcon  + "objc-icon medium-blue");
			tabs["test.t"]            .should.have.classes(tabIcon  + "perl-icon medium-blue");
			atom.config.set("core.customFileTypes", {
				"source.matlab": ["m"],
				"text.roff":    ["mm"],
				"source.turing": ["t"]
			});
			files["usertype/test.m"]  .should       .have.classes(treeIcon + "matlab-icon medium-yellow");
			files["usertype/test.mm"] .should       .have.classes(treeIcon + "manpage-icon dark-green");
			files["usertype/test.t"]  .should       .have.classes(treeIcon + "turing-icon medium-red");
			tabs["test.m"]            .should       .have.classes(tabIcon  + "matlab-icon medium-yellow");
			tabs["test.mm"]           .should       .have.classes(tabIcon  + "manpage-icon dark-green");
			tabs["test.t"]            .should       .have.classes(tabIcon  + "turing-icon medium-red");
			files["usertype/test.m"]  .should.not   .have.classes("objc-icon medium-blue");
			files["usertype/test.mm"] .should.not   .have.classes("objc-icon medium-blue");
			files["usertype/test.t"]  .should.not   .have.classes("perl-icon medium-blue");
			tabs["test.m"]            .should.not   .have.classes("objc-icon medium-blue");
			tabs["test.mm"]           .should.not   .have.classes("objc-icon medium-blue");
			tabs["test.t"]            .should.not   .have.classes("perl-icon medium-blue");
		});
		
		it("only uses icons with an assigned scope-type", () => {
			files["usertype/test.stTheme"]  .should.have.classes(treeIcon + "sublime-icon  medium-orange");
			files["usertype/test.tmMacro"]  .should.have.classes(treeIcon + "textmate-icon medium-maroon");
			tabs["test.stTheme"]            .should.have.classes(tabIcon  + "sublime-icon  medium-orange");
			tabs["test.tmMacro"]            .should.have.classes(tabIcon  + "textmate-icon medium-maroon");
			atom.config.set("core.customFileTypes", {
				"source.json": ["stTheme"],
				"text.xml": ["tmMacro"]
			});
			files["usertype/test.stTheme"]  .should      .have.classes(treeIcon + "sublime-icon  medium-orange");
			files["usertype/test.tmMacro"]  .should      .have.classes(treeIcon + "textmate-icon medium-maroon");
			tabs["test.stTheme"]            .should      .have.classes(tabIcon  + "sublime-icon  medium-orange");
			tabs["test.tmMacro"]            .should      .have.classes(tabIcon  + "textmate-icon medium-maroon");
			files["usertype/test.stTheme"]  .should.not  .have.classes("database-icon medium-yellow");
			files["usertype/test.tmMacro"]  .should.not  .have.classes("code-icon medium-blue");
			tabs["test.stTheme"]            .should.not  .have.classes("database-icon medium-yellow");
			tabs["test.tmMacro"]            .should.not  .have.classes("code-icon medium-blue");
		});
	});
	
	
	describe("When user-defined filetypes change", () => {
		it("updates icons being displayed", () => {
			atom.config.set("core.customFileTypes", {
				"source.mathematica":  ["m"],
				"source.matlab":      ["mm"],
				"source.terraform":    ["t"],
				"source.js":     ["stTheme"],
				"source.python": ["tmMacro"]
			});
			assertIconClasses(files, [
				["usertype/test.m",       treeIcon + "mathematica-icon  dark-red"],
				["usertype/test.mm",      treeIcon + "matlab-icon       medium-yellow"],
				["usertype/test.t",       treeIcon + "terraform-icon    dark-purple"],
				["usertype/test.stTheme", treeIcon + "js-icon           medium-yellow"],
				["usertype/test.tmMacro", treeIcon + "python-icon       dark-blue"]
			]);
			assertIconClasses(tabs, [
				["test.m",                tabIcon  + "mathematica-icon  dark-red"],
				["test.mm",               tabIcon  + "matlab-icon       medium-yellow"],
				["test.t",                tabIcon  + "terraform-icon    dark-purple"],
				["test.stTheme",          tabIcon  + "js-icon           medium-yellow"],
				["test.tmMacro",          tabIcon  + "python-icon       dark-blue"]
			]);
			atom.config.set("core.customFileTypes", {});
			assertIconClasses(files, [
				["usertype/test.m",       "mathematica-icon  dark-red"],
				["usertype/test.mm",      "matlab-icon       medium-yellow"],
				["usertype/test.t",       "terraform-icon    dark-purple"],
				["usertype/test.stTheme", "js-icon           medium-yellow"],
				["usertype/test.tmMacro", "python-icon       dark-blue"]
			], true);
			assertIconClasses(tabs, [
				["test.m",                "mathematica-icon  dark-red"],
				["test.mm",               "matlab-icon       medium-yellow"],
				["test.t",                "terraform-icon    dark-purple"],
				["test.stTheme",          "js-icon           medium-yellow"],
				["test.tmMacro",          "python-icon       dark-blue"]
			], true);
		});
		
		it("updates icons not being displayed", () => {
			atom.config.set("core.customFileTypes", {
				"source.mathematica": ["m"],
				"source.matlab":     ["mm"],
				"source.terraform":   ["t"],
				"source.js":    ["stTheme"]
			});
			TreeView.collapse("usertype");
			atom.config.set("core.customFileTypes", {
				"source.ruby": ["m"],
				"source.perl": ["mm"],
				"source.twig": ["t"],
				"source.less": ["stTheme"],
				"source.sass": ["tmMacro"]
			});
			TreeView.expand("usertype");
			files = TreeView.ls();
			assertIconClasses(files, [
				["usertype/test.m",          treeIcon + "ruby-icon medium-red"],
				["usertype/test.mm",         treeIcon + "perl-icon medium-blue"],
				["usertype/test.stTheme",    treeIcon + "css3-icon dark-blue"],
				["usertype/test.t",          treeIcon + "twig-icon medium-green"],
				["usertype/test.tmMacro",    treeIcon + "sass-icon dark-pink"]
			]);
			
			TreeView.expand("usertype/symlinks");
			return wait(500);
		});
		
		unlessOnWindows.it("updates the colour of symlinks targeting affected files", () => {
			files = TreeView.ls();
			assertIconClasses(files, [
				["usertype/test.m",          treeIcon + "ruby-icon medium-red"],
				["usertype/test.mm",         treeIcon + "perl-icon medium-blue"],
				["usertype/test.stTheme",    treeIcon + "css3-icon dark-blue"],
				["usertype/test.t",          treeIcon + "twig-icon medium-green"],
				["usertype/test.tmMacro",    treeIcon + "sass-icon dark-pink"],
				["usertype/symlinks/test-1", treeIcon + "icon-file-symlink-file medium-red"],
				["usertype/symlinks/test-2", treeIcon + "icon-file-symlink-file medium-blue"],
				["usertype/symlinks/test-3", treeIcon + "icon-file-symlink-file dark-blue"],
				["usertype/symlinks/test-4", treeIcon + "icon-file-symlink-file medium-green"],
				["usertype/symlinks/test-5", treeIcon + "icon-file-symlink-file dark-pink"]
			]);
			atom.config.set("core.customFileTypes", {
				"source.mathematica":  ["m"],
				"source.matlab":      ["mm"],
				"source.terraform":    ["t"],
				"source.js":     ["stTheme"],
				"source.python": ["tmMacro"]
			});
			assertIconClasses(files, [
				["usertype/test.m",          treeIcon + "mathematica-icon  dark-red"],
				["usertype/test.mm",         treeIcon + "matlab-icon       medium-yellow"],
				["usertype/test.t",          treeIcon + "terraform-icon    dark-purple"],
				["usertype/test.stTheme",    treeIcon + "js-icon           medium-yellow"],
				["usertype/test.tmMacro",    treeIcon + "python-icon       dark-blue"],
				["usertype/symlinks/test-1", treeIcon + "icon-file-symlink-file dark-red"],
				["usertype/symlinks/test-2", treeIcon + "icon-file-symlink-file medium-yellow"],
				["usertype/symlinks/test-3", treeIcon + "icon-file-symlink-file medium-yellow"],
				["usertype/symlinks/test-4", treeIcon + "icon-file-symlink-file dark-purple"],
				["usertype/symlinks/test-5", treeIcon + "icon-file-symlink-file dark-blue"]
			]);
			atom.config.set("core.customFileTypes", {});
			assertIconClasses(files, [
				["usertype/test.m",          treeIcon + "objc-icon medium-blue"],
				["usertype/test.mm",         treeIcon + "objc-icon medium-blue"],
				["usertype/test.t",          treeIcon + "perl-icon medium-blue"],
				["usertype/test.stTheme",    treeIcon + "sublime-icon medium-orange"],
				["usertype/test.tmMacro",    treeIcon + "textmate-icon medium-maroon"],
				["usertype/symlinks/test-1", treeIcon + "icon-file-symlink-file medium-blue"],
				["usertype/symlinks/test-2", treeIcon + "icon-file-symlink-file medium-blue"],
				["usertype/symlinks/test-3", treeIcon + "icon-file-symlink-file medium-orange"],
				["usertype/symlinks/test-4", treeIcon + "icon-file-symlink-file medium-blue"],
				["usertype/symlinks/test-5", treeIcon + "icon-file-symlink-file medium-maroon"]
			]);
		});
	});
	
	
	describe("When the user disables the usertype strategy", () => {
		beforeEach(() => {
			Options.set("usertypes", true);
			atom.config.set("core.customFileTypes", {
				"source.matlab": ["m"],
				"text.roff":    ["mm"],
				"source.turing": ["t"]
			});
			files["usertype/test.m"]       .should.have.classes(treeIcon + "matlab-icon   medium-yellow");
			files["usertype/test.mm"]      .should.have.classes(treeIcon + "manpage-icon  dark-green");
			files["usertype/test.t"]       .should.have.classes(treeIcon + "turing-icon   medium-red");
			files["usertype/test.stTheme"] .should.have.classes(treeIcon + "sublime-icon  medium-orange");
			files["usertype/test.tmMacro"] .should.have.classes(treeIcon + "textmate-icon medium-maroon");
			tabs["test.m"]                 .should.have.classes(tabIcon  + "matlab-icon   medium-yellow");
			tabs["test.mm"]                .should.have.classes(tabIcon  + "manpage-icon  dark-green");
			tabs["test.t"]                 .should.have.classes(tabIcon  + "turing-icon   medium-red");
			tabs["test.stTheme"]           .should.have.classes(tabIcon  + "sublime-icon  medium-orange");
			tabs["test.tmMacro"]           .should.have.classes(tabIcon  + "textmate-icon medium-maroon");
		});
		
		it("restores affected icons", () => {
			Options.set("usertypes", false);
			files["usertype/test.m"]       .should.have.classes(treeIcon + "objc-icon     medium-blue");
			files["usertype/test.mm"]      .should.have.classes(treeIcon + "objc-icon     medium-blue");
			files["usertype/test.t"]       .should.have.classes(treeIcon + "perl-icon     medium-blue");
			files["usertype/test.m"]       .should.not.have.classes(       "matlab-icon   medium-yellow");
			files["usertype/test.mm"]      .should.not.have.classes(       "manpage-icon  dark-green");
			files["usertype/test.t"]       .should.not.have.classes(       "turing-icon   medium-red");
			tabs["test.m"]                 .should.have.classes(tabIcon  + "objc-icon     medium-blue");
			tabs["test.mm"]                .should.have.classes(tabIcon  + "objc-icon     medium-blue");
			tabs["test.t"]                 .should.have.classes(tabIcon  + "perl-icon     medium-blue");
			tabs["test.m"]                 .should.not.have.classes(       "matlab-icon   medium-yellow");
			tabs["test.mm"]                .should.not.have.classes(       "manpage-icon  dark-green");
			tabs["test.t"]                 .should.not.have.classes(       "turing-icon   medium-red");
		});
		
		it("leaves unaffected icons alone", () => {
			Options.set("usertypes", false);
			files["usertype/test.stTheme"] .should.have.classes(treeIcon + "sublime-icon  medium-orange");
			files["usertype/test.tmMacro"] .should.have.classes(treeIcon + "textmate-icon medium-maroon");
			tabs["test.stTheme"]           .should.have.classes(tabIcon  + "sublime-icon  medium-orange");
			tabs["test.tmMacro"]           .should.have.classes(tabIcon  + "textmate-icon medium-maroon");
		});
		
		describe("If usertypes change while the strategy is disabled", () => {
			const classes = [
				["usertype/test.m",       "ruby-icon medium-red"],
				["usertype/test.mm",      "java-icon medium-purple"],
				["usertype/test.stTheme", "css3-icon dark-blue"],
				["usertype/test.t",       "html5-icon medium-orange"],
				["usertype/test.tmMacro", "css3-icon medium-blue"]
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
				assertIconClasses(files, classes, true);
				atom.config.set("core.customFileTypes", types);
				assertIconClasses(files, classes, true);
				atom.config.set("core.customFileTypes", {});
				assertIconClasses(files, classes, true);
				Options.set("usertypes", true);
				assertIconClasses(files, classes, true);
			});
			
			it("shows icons for updated types when re-enabled", () => {
				atom.config.set("core.customFileTypes", types);
				assertIconClasses(files, classes);
				Options.set("usertypes", false);
				assertIconClasses(files, classes, true);
				assertIconClasses(files, [
					["usertype/test.m",       treeIcon + "objc-icon      medium-blue"],
					["usertype/test.mm",      treeIcon + "objc-icon      medium-blue"],
					["usertype/test.t",       treeIcon + "perl-icon      medium-blue"],
					["usertype/test.stTheme", treeIcon + "sublime-icon   medium-orange"],
					["usertype/test.tmMacro", treeIcon + "textmate-icon  medium-maroon"]
				]);
				atom.config.set("core.customFileTypes", {
					"source.mathematica": ["m"],
					"source.matlab":     ["mm"],
					"source.terraform":   ["t"],
					"source.js":    ["stTheme"]
				});
				Options.set("usertypes", true);
				assertIconClasses(files, classes, true);
				assertIconClasses(files, [
					["usertype/test.m",       treeIcon + "mathematica-icon dark-red"],
					["usertype/test.mm",      treeIcon + "matlab-icon      medium-yellow"],
					["usertype/test.t",       treeIcon + "terraform-icon   dark-purple"],
					["usertype/test.stTheme", treeIcon + "js-icon          medium-yellow"],
					["usertype/test.tmMacro", treeIcon + "textmate-icon    medium-maroon"]
				]);
			});
		});
	});
});
