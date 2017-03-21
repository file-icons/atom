"use strict";

const TreeView = require("../lib/consumers/tree-view.js");
const Options  = require("../lib/options.js");
const Tabs     = require("../lib/consumers/tabs.js");


describe("User-defined filetypes", () => {
	let files, tabs;
	
	before("Extracting fixtures", function(){
		this.timeout(0);
		return chain([
			() => setup("4.2-usertype", {
				symlinks: [
					["test.m",       "test-1"],
					["test.mm",      "test-2"],
					["test.stTheme", "test-3"],
					["test.t",       "test-4"],
					["test.tmMacro", "test-5"]
				]
			}),
			() => open("test.m"),
			() => open("test.mm"),
			() => open("test.stTheme"),
			() => open("test.t"),
			() => open("test.tmMacro"),
			() => {
				files = TreeView.ls();
				tabs  = Tabs.ls();
				files.should.not.be.empty;
				tabs .should.not.be.empty;
				files.length.should.be.at.least(5);
				tabs .length.should.be.at.least(5);
			}
		])
	});
	
	const treeIcon = "name icon ";
	const tabIcon  = "title icon ";
	
	when("a file matches a user-defined filetype", () => {
		it("displays the icon of the language the type is mapped to", () => {
			files["test.m"]  .should.have.classes(treeIcon + "objc-icon medium-blue");
			files["test.mm"] .should.have.classes(treeIcon + "objc-icon medium-blue");
			files["test.t"]  .should.have.classes(treeIcon + "test-perl-icon medium-blue");
			tabs["test.m"]   .should.have.classes(tabIcon  + "objc-icon medium-blue");
			tabs["test.mm"]  .should.have.classes(tabIcon  + "objc-icon medium-blue");
			tabs["test.t"]   .should.have.classes(tabIcon  + "test-perl-icon medium-blue");
			atom.config.set("core.customFileTypes", {
				"source.matlab": ["m"],
				"text.roff":    ["mm"],
				"source.turing": ["t"]
			});
			files["test.m"]  .should       .have.classes(treeIcon + "matlab-icon medium-yellow");
			files["test.mm"] .should       .have.classes(treeIcon + "manpage-icon dark-green");
			files["test.t"]  .should       .have.classes(treeIcon + "turing-icon medium-red");
			tabs["test.m"]   .should       .have.classes(tabIcon  + "matlab-icon medium-yellow");
			tabs["test.mm"]  .should       .have.classes(tabIcon  + "manpage-icon dark-green");
			tabs["test.t"]   .should       .have.classes(tabIcon  + "turing-icon medium-red");
			files["test.m"]  .should.not   .have.classes("objc-icon medium-blue");
			files["test.mm"] .should.not   .have.classes("objc-icon medium-blue");
			files["test.t"]  .should.not   .have.classes("perl-icon medium-blue");
			tabs["test.m"]   .should.not   .have.classes("objc-icon medium-blue");
			tabs["test.mm"]  .should.not   .have.classes("objc-icon medium-blue");
			tabs["test.t"]   .should.not   .have.classes("perl-icon medium-blue");
		});
		
		it("only uses icons with an assigned scope-type", () => {
			files["test.stTheme"]  .should.have.classes(treeIcon + "sublime-icon  medium-orange");
			files["test.tmMacro"]  .should.have.classes(treeIcon + "textmate-icon medium-maroon");
			tabs["test.stTheme"]   .should.have.classes(tabIcon  + "sublime-icon  medium-orange");
			tabs["test.tmMacro"]   .should.have.classes(tabIcon  + "textmate-icon medium-maroon");
			atom.config.set("core.customFileTypes", {
				"source.json": ["stTheme"],
				"text.xml": ["tmMacro"]
			});
			files["test.stTheme"]  .should      .have.classes(treeIcon + "sublime-icon  medium-orange");
			files["test.tmMacro"]  .should      .have.classes(treeIcon + "textmate-icon medium-maroon");
			tabs["test.stTheme"]   .should      .have.classes(tabIcon  + "sublime-icon  medium-orange");
			tabs["test.tmMacro"]   .should      .have.classes(tabIcon  + "textmate-icon medium-maroon");
			files["test.stTheme"]  .should.not  .have.classes("database-icon medium-yellow");
			files["test.tmMacro"]  .should.not  .have.classes("code-icon medium-blue");
			tabs["test.stTheme"]   .should.not  .have.classes("database-icon medium-yellow");
			tabs["test.tmMacro"]   .should.not  .have.classes("code-icon medium-blue");
		});
	});
	
	
	when("user-defined filetypes change", () => {
		it("updates icons being displayed", () => {
			atom.config.set("core.customFileTypes", {
				"source.mathematica":  ["m"],
				"source.matlab":      ["mm"],
				"source.terraform":    ["t"],
				"source.js":     ["stTheme"],
				"source.python": ["tmMacro"]
			});
			assertIconClasses(files, [
				["test.m",       treeIcon + "mathematica-icon  dark-red"],
				["test.mm",      treeIcon + "matlab-icon       medium-yellow"],
				["test.t",       treeIcon + "terraform-icon    dark-purple"],
				["test.stTheme", treeIcon + "js-icon           medium-yellow"],
				["test.tmMacro", treeIcon + "python-icon       dark-blue"]
			]);
			assertIconClasses(tabs, [
				["test.m",       tabIcon  + "mathematica-icon  dark-red"],
				["test.mm",      tabIcon  + "matlab-icon       medium-yellow"],
				["test.t",       tabIcon  + "terraform-icon    dark-purple"],
				["test.stTheme", tabIcon  + "js-icon           medium-yellow"],
				["test.tmMacro", tabIcon  + "python-icon       dark-blue"]
			]);
			atom.config.set("core.customFileTypes", {});
			assertIconClasses(files, [
				["test.m",       "mathematica-icon  dark-red"],
				["test.mm",      "matlab-icon       medium-yellow"],
				["test.t",       "terraform-icon    dark-purple"],
				["test.stTheme", "js-icon           medium-yellow"],
				["test.tmMacro", "python-icon       dark-blue"]
			], true);
			assertIconClasses(tabs, [
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
			files = TreeView.ls();
			assertIconClasses(files, [
				["test.m",          treeIcon + "ruby-icon medium-red"],
				["test.mm",         treeIcon + "perl-icon medium-blue"],
				["test.stTheme",    treeIcon + "css3-icon dark-blue"],
				["test.t",          treeIcon + "twig-icon medium-green"],
				["test.tmMacro",    treeIcon + "sass-icon dark-pink"]
			]);
		});
		
		unlessOnWindows.it("updates the colour of symlinks targeting affected files", () => {
			TreeView.expand("symlinks");
			return wait(500).then(() => {
				files = TreeView.ls();
				assertIconClasses(files, [
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
				assertIconClasses(files, [
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
				assertIconClasses(files, [
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
	});
	
	
	when("the user disables the usertype strategy", () => {
		beforeEach(() => {
			Options.set("usertypes", true);
			atom.config.set("core.customFileTypes", {
				"source.matlab": ["m"],
				"text.roff":    ["mm"],
				"source.turing": ["t"]
			});
			files["test.m"]       .should.have.classes(treeIcon + "matlab-icon   medium-yellow");
			files["test.mm"]      .should.have.classes(treeIcon + "manpage-icon  dark-green");
			files["test.t"]       .should.have.classes(treeIcon + "turing-icon   medium-red");
			files["test.stTheme"] .should.have.classes(treeIcon + "sublime-icon  medium-orange");
			files["test.tmMacro"] .should.have.classes(treeIcon + "textmate-icon medium-maroon");
			tabs["test.m"]        .should.have.classes(tabIcon  + "matlab-icon   medium-yellow");
			tabs["test.mm"]       .should.have.classes(tabIcon  + "manpage-icon  dark-green");
			tabs["test.t"]        .should.have.classes(tabIcon  + "turing-icon   medium-red");
			tabs["test.stTheme"]  .should.have.classes(tabIcon  + "sublime-icon  medium-orange");
			tabs["test.tmMacro"]  .should.have.classes(tabIcon  + "textmate-icon medium-maroon");
		});
		
		it("restores affected icons", () => {
			Options.set("usertypes", false);
			files["test.m"]       .should.have.classes(treeIcon + "objc-icon     medium-blue");
			files["test.mm"]      .should.have.classes(treeIcon + "objc-icon     medium-blue");
			files["test.t"]       .should.have.classes(treeIcon + "test-perl-icon medium-blue");
			files["test.m"]       .should.not.have.classes(       "matlab-icon   medium-yellow");
			files["test.mm"]      .should.not.have.classes(       "manpage-icon  dark-green");
			files["test.t"]       .should.not.have.classes(       "turing-icon   medium-red");
			tabs["test.m"]        .should.have.classes(tabIcon  + "objc-icon     medium-blue");
			tabs["test.mm"]       .should.have.classes(tabIcon  + "objc-icon     medium-blue");
			tabs["test.t"]        .should.have.classes(tabIcon  + "test-perl-icon medium-blue");
			tabs["test.m"]        .should.not.have.classes(       "matlab-icon   medium-yellow");
			tabs["test.mm"]       .should.not.have.classes(       "manpage-icon  dark-green");
			tabs["test.t"]        .should.not.have.classes(       "turing-icon   medium-red");
		});
		
		it("leaves unaffected icons alone", () => {
			Options.set("usertypes", false);
			files["test.stTheme"] .should.have.classes(treeIcon + "sublime-icon  medium-orange");
			files["test.tmMacro"] .should.have.classes(treeIcon + "textmate-icon medium-maroon");
			tabs["test.stTheme"]  .should.have.classes(tabIcon  + "sublime-icon  medium-orange");
			tabs["test.tmMacro"]  .should.have.classes(tabIcon  + "textmate-icon medium-maroon");
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
				assertIconClasses(files, classes, true);
				assertIconClasses(files, [
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
