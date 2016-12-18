"use strict";

const Options = require("../lib/options.js");

const {
	chain,
	wait
} = require("../lib/utils/general.js");

const {
	activate,
	assertIconClasses,
	open,
	setTheme,
	setup
} = require("./utils/atom-specs.js");

const {
	ls,
	expand,
	select
} = require("./utils/tree-tools.js");


describe("Tree-view", () => {
	let workspace;
	let treeView;
	let files;
	
	setup("Activate packages", (done, fail) => {
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
			files = ls();
			done();
		}).catch(error => fail(error));
	});
	
	afterEach(() => {
		files = ls();
		select(null);
	});
	
	
	describe("Icon assignment", () => {
		it("displays an icon beside each filename", () => {
			assertIconClasses(files, [
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
			assertIconClasses(files, [
				["node_modules", "node-icon"],
				["Dropbox",      "dropbox-icon"],
				["subfolder",    "icon-file-directory"],
				["symlinks",     "icon-file-directory"]
			]);
		});
		
		it("removes the default file-icon class", () => {
			for(const name of [".default-config", "data.json", "la.tex", "markdown.md"])
				files[name].should.not.have.class("icon-file-text");
		});
		
		it("retains the default directory-icon class", () => {
			const defaults = "name icon icon-file-directory";
			assertIconClasses(files, [
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
		beforeEach(() => {
			const themes = atom.themes.getActiveThemeNames();
			themes.should.include("atom-dark-ui").and.not.include("atom-light-ui");
		});
		
		it("displays file-icons in colour", () => {
			assertIconClasses(files, [
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
			assertIconClasses(files, [
				["Dropbox",               "medium-blue"],
				["node_modules",          "medium-green"],
				["symlinks/Dropbox",      "medium-blue"],
				["symlinks/node_modules", "medium-green"]
			]);
		});
		
		it("uses darker colours for thin icons in light themes", () => {
			files["la.tex"].should.have.class("medium-blue");
			files["la.tex"].should.not.have.class("dark-blue");
			
			return setTheme("atom-light").then(_=> {
				files["la.tex"].should.have.class("dark-blue");
				files["la.tex"].should.not.have.class("medium-blue");
			});
		});
		
		it("uses different colours for Bower icons in light themes", () => {
			files[".bowerrc"].should.have.class("medium-yellow");
			files[".bowerrc"].should.not.have.class("medium-orange");
			
			return setTheme("atom-light").then(_=> {
				files[".bowerrc"].should.have.class("medium-orange");
				files[".bowerrc"].should.not.have.class("medium-yellow");
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
			
			assertIconClasses(files, [
				...allColouredFiles,
				["la.tex",   "medium-blue dark-blue"],
				[".bowerrc", "medium-orange medium-yellow"]
			], true);
		});
		
		it("displays coloured icons after re-enabling coloured icons", () => {
			atom.config.get("file-icons.coloured").should.be.false;
			atom.commands.dispatch(workspace, "file-icons:toggle-colours");
			atom.config.get("file-icons.coloured").should.be.true;
			
			assertIconClasses(files, [
				...allColouredFiles,
				["la.tex",   "medium-blue"],
				[".bowerrc", "medium-yellow"]
			]);
		});
	});
	
	
	describe("Default file-icon", () => {
		const setting = "file-icons.defaultIconClass";
		
		beforeEach(() => {
			atom.config.set(setting, undefined);
			atom.config.get(setting).should.equal("default-icon");
		});
		
		it("uses a default icon-class for unrecognised filetypes", () => {
			files["blank.file"].should.have.class("default-icon");
		});
		
		it("allows users to set their own default icon-class", () => {
			files["blank.file"].should.have.class("default-icon");
			Options.set("defaultIconClass", "icon-file-text");
			files["blank.file"].should.have.class("icon-file-text");
			files["blank.file"].should.not.have.class("default-icon");
		});
		
		it("allows users to set multiple default icon-classes", () => {
			Options.set("defaultIconClass",         "icon-file-text    medium-red");
			Options.defaultIconClass.should.eql(   ["icon-file-text", "medium-red"]);
			files["blank.file"].should.have.classes("icon-file-text    medium-red");
			
			Options.set("defaultIconClass",         "icon-file-text    dark-red    light-yellow");
			Options.defaultIconClass.should.eql(   ["icon-file-text", "dark-red", "light-yellow"]);
			files["blank.file"].should.have.classes("icon-file-text    dark-red    light-yellow");
		});
		
		unlessOnWindows(() => {
			it("drops the first default-class to avoid overwriting symlink icons", () => {
				atom.config.get(setting).should.equal("default-icon");
				files["symlinks/empty.file"].should.have.class("icon-file-symlink-file");
				files["symlinks/empty.file"].should.not.have.class("default-icon");
				
				Options.set("defaultIconClass", "icon-file-code medium-green");
				Options.defaultIconClass.should.eql(["icon-file-code", "medium-green"]);
				files["symlinks/empty.file"].should.have.class("icon-file-symlink-file");
				files["symlinks/empty.file"].should.not.have.class("icon-file-code");
			});
			
			it("assigns remaining classes for colours", () => {
				Options.set("defaultIconClass",       "icon-file-code    medium-green    sharpen-edges");
				Options.defaultIconClass.should.eql( ["icon-file-code", "medium-green", "sharpen-edges"]);
				files["symlinks/empty.file"].should.have.classes("icon-file-symlink-file");
				files["symlinks/empty.file"].should.not.have.classes("icon-file-code");
				files["symlinks/empty.file"].should.have.classes("medium-green sharpen-edges");
			});
		})
	});
});
