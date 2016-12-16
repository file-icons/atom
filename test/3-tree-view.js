"use strict";

Chai.should();

const {
	chain,
	isRegExp,
	wait
} = require("../lib/utils/general.js");

const {activate, open, setTheme, setup} = require("./utils/atom-specs.js");
const {assertIconClasses, ls, expand} = require("./utils/tree-tools.js");


describe("Tree-view", () => {
	let workspace;
	let treeView;
	
	setup("Activate packages", new Promise((done, fail) => {
		workspace = atom.views.getView(atom.workspace);
		open("fixtures/project");
		
		chain(
			atom.themes.activateThemes(),
			activate("file-icons", "tree-view"),
			setTheme("atom-dark")
		).then(() => {
			treeView = atom.workspace.getLeftPanels()[0].getItem()[0];
			expect(treeView).to.exist.and.be.an.instanceof(HTMLElement);
			ls.element = treeView;
			attachToDOM(workspace);
			done();
		}).catch(error => fail(error));
	}));
	
	
	describe("Icon assignment", () => {
		it("displays an icon beside each filename", () => {
			assertIconClasses(ls(), [
				[".default-config", "name icon"],
				[".default-gear",   "gear-icon"],
				[".gitignore",      "git-icon"],
				["data.json",       "database-icon"],
				["image.gif",       "image-icon"],
				["markdown.md",     "markdown-icon"],
				["package.json",    "npm-icon"],
				["README.md",       "book-icon"],
				["text.txt",        "icon-file-text"]
			]);
		});
		
		it("displays an icon beside each directory", () => {
			assertIconClasses(ls(), [
				["node_modules", "node-icon"],
				["Dropbox",      "dropbox-icon"],
				["subfolder",    "icon-file-directory"],
				["symlinks",     "icon-file-directory"]
			]);
		});
		
		it("removes the default file-icon class", () => {
			const files = ls();
			for(const name of [".default-config", "data.json", "la.tex", "markdown.md"])
				files[name].should.not.have.class("icon-file-text");
		});
		
		it("retains the default directory-icon class", () => {
			const defaults = "name icon icon-file-directory";
			assertIconClasses(ls(), [
				[".",         defaults],
				["subfolder", defaults],
				["symlinks",  defaults]
			]);
		});
		
		it("shows icons for files in subdirectories", () => {
			expand("subfolder");
			assertIconClasses(ls(), [
				["subfolder/almighty.c",  "name icon c-icon"],
				["subfolder/fad.jsx",     "jsx-icon"],
				["subfolder/markup.html", "html5-icon"],
				["subfolder/script.js",   "js-icon"]
			]);
		});
		
		unlessOnWindows.it("always uses a symlink icon to indicate symbolic links", () => {
			expand("symlinks");
			assertIconClasses(ls(), [
				["symlinks/dat.a",        "icon-file-symlink-file"],
				["symlinks/late.x",       "icon-file-symlink-file"],
				["symlinks/Dropbox",      "icon-file-symlink-directory"],
				["symlinks/node_modules", "icon-file-symlink-directory"]
			]);
		});
	});

	
	describe("Colour assignment", () => {
		it("displays file-icons in colour", () => {
			assertIconClasses(ls(), [
				[".gitignore",   "medium-red"],
				["data.json",    "medium-yellow"],
				["image.gif",    "medium-yellow"],
				["markdown.md",  "medium-blue"],
				["package.json", "medium-red"],
				["README.md",    "medium-blue"],
				["text.txt",     "medium-blue"]
			]);
		});
		
		it("displays directory-icons in colour", () => {
			assertIconClasses(ls(), [
				["Dropbox",               "medium-blue"],
				["node_modules",          "medium-green"],
				["symlinks/Dropbox",      "medium-blue"],
				["symlinks/node_modules", "medium-green"]
			]);
		});
		
		it("uses darker colours for thin icons in light themes", () => {
			const files = ls();
			files["la.tex"].should.have.class("medium-blue");
			files["la.tex"].should.not.have.class("dark-blue");
			
			return setTheme("atom-light").then(_=> {
				files["la.tex"].should.have.class("dark-blue");
				files["la.tex"].should.not.have.class("medium-blue");
			});
		});
		
		it("uses different colours for Bower icons in light themes", () => {
			const files = ls();
			atom.themes.getActiveThemeNames().should.include("atom-light-ui");
			files[".bowerrc"].should.have.class("medium-orange");
			files[".bowerrc"].should.not.have.class("medium-yellow");
			
			return setTheme("atom-dark").then(_=> {
				files[".bowerrc"].should.have.class("medium-yellow");
				files[".bowerrc"].should.not.have.class("medium-orange");
			});
		});
		
		const allColouredFiles = [
			["Dropbox",               "medium-blue"],
			["node_modules",          "medium-green"],
			["subfolder/almighty.c",  "medium-blue"],
			["subfolder/fad.jsx",     "medium-blue"],
			["subfolder/markup.html", "medium-orange"],
			["subfolder/script.js",   "medium-yellow"],
			["symlinks/Dropbox",      "medium-blue"],
			["symlinks/node_modules", "medium-green"],
			[".gitignore",            "medium-red"],
			["data.json",             "medium-yellow"],
			["image.gif",             "medium-yellow"],
			["markdown.md",           "medium-blue"],
			["package.json",          "medium-red"],
			["README.md",             "medium-blue"],
			["text.txt",              "medium-blue"]
		];
		
		it("displays monochrome icons if coloured icons are disabled", () => {
			atom.config.get("file-icons.coloured").should.be.true;
			atom.commands.dispatch(workspace, "file-icons:toggle-colours");
			atom.config.get("file-icons.coloured").should.be.false;
			
			assertIconClasses(ls(), [
				...allColouredFiles,
				["la.tex",   "medium-blue dark-blue"],
				[".bowerrc", "medium-orange medium-yellow"]
			], true);
		});
		
		it("displays coloured icons after re-enabling coloured icons", () => {
			atom.config.get("file-icons.coloured").should.be.false;
			atom.commands.dispatch(workspace, "file-icons:toggle-colours");
			atom.config.get("file-icons.coloured").should.be.true;
			
			assertIconClasses(ls(), [
				...allColouredFiles,
				["la.tex",   "medium-blue"],
				[".bowerrc", "medium-yellow"]
			]);
		});
	});
});
