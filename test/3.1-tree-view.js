"use strict";

const TreeView = require("../lib/consumers/tree-view.js");
const Options = require("../lib/options.js");


describe("Tree-view", () => {
	let projectRoot;
	let entriesList;
	let entries;
	const ls = () => (entries = TreeView.ls());
	
	before(() => {
		resetOptions();
		const treeView = atom.workspace.getLeftPanels()[0].getItem();
		expect(treeView).to.exist.and.equal(TreeView.element);
		projectRoot = treeView[0].querySelector(".project-root");
		entriesList = projectRoot.lastElementChild;
		ls();
	});
	
	afterEach(() => {
		ls();
		TreeView.select(null);
	});
	
	const allColouredFiles = [
		["subfolder/almighty.c",  "medium-blue"],
		["subfolder/fad.jsx",     "medium-blue"],
		["subfolder/markup.html", "medium-orange"],
		["subfolder/script.js",   "medium-yellow"],
		[".gitignore",            "medium-red"],
		["data.json",             "medium-yellow"],
		["image.gif",             "medium-yellow"],
		["markdown.md",           "medium-blue"],
		["package.json",          "medium-red"],
		["README.md",             "medium-blue"],
		["text.txt",              "medium-blue"]
	];
	
	
	when("a file entry is displayed", () => {
		when("it matches an icon", () => {
			it("shows the icon next to its name", () => {
				assertIconClasses(entries, [
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
				
				TreeView.expand("subfolder");
				assertIconClasses(ls(), [
					["subfolder/almighty.c",  "name icon c-icon"],
					["subfolder/fad.jsx",     "jsx-icon"],
					["subfolder/markup.html", "html5-icon"],
					["subfolder/script.js",   "js-icon"]
				]);
			});
			
			it("removes the built-in icon class", () => {
				assertIconClasses(entries, [
					[".default-config", "icon-file-text"],
					["data.json",       "icon-file-text"],
					["la.tex",          "icon-file-text"],
					["markdown.md",     "icon-file-text"]
				], true);
			});
			
			when("coloured icons are enabled", () =>
				it("shows a coloured icon", () => {
					assertIconClasses(ls(), [
						[".gitignore",   "medium-red"],
						["data.json",    "medium-yellow"],
						["image.gif",    "medium-yellow"],
						["markdown.md",  "medium-blue"],
						["package.json", "medium-red"],
						["README.md",    "medium-blue"],
						["text.txt",     "medium-blue"]
					]);
				}));
			
			when("coloured icons are disabled", () =>
				it("shows an uncoloured icon", () => {
					Options.set("coloured", false);
					assertIconClasses(entries, [
						...allColouredFiles,
						["la.tex",   "medium-blue dark-blue"],
						[".bowerrc", "medium-orange medium-yellow"]
					], true);
				}));
			
			when("coloured icons are enabled later", () =>
				it("shows all existing icons in colour", () => {
					Options.set("coloured", true);
					assertIconClasses(entries, [
						...allColouredFiles,
						["la.tex",   "medium-blue"],
						[".bowerrc", "medium-yellow"]
					]);
				}));
			
			when("in a Git repository", () =>
				when(`the "Only colour when changed" setting is enabled`, () => {
					describe("If the file is unmodified", () =>
						it("doesn't show a coloured icon", () => {
							assertIconClasses(entries, allColouredFiles);
							Options.set("colourChangedOnly", true);
							assertIconClasses(entries, allColouredFiles, true);
							Options.set("coloured", false);
							assertIconClasses(entries, allColouredFiles, true);
							Options.set("coloured", true);
							assertIconClasses(entries, allColouredFiles, true);
						}));
					
					describe("If the file is modified", () =>
						it("shows a coloured icon", () => {
							Options.set("coloured", true);
							entries["status-modified.pl"].should.have.class("medium-blue");
							entries["status-new.pl"].should.have.class("medium-blue");
							Options.set("coloured", false);
							entries["status-modified.pl"].should.not.have.class("medium-blue");
							entries["status-new.pl"].should.not.have.class("medium-blue");
							Options.set("coloured", true);
							entries["status-modified.pl"].should.have.class("medium-blue");
							entries["status-new.pl"].should.have.class("medium-blue");
						}));
				}));
			
			when("in a light-coloured theme", () => {
				before(() => Options.set("colourChangedOnly", false));
				when("the icon has thin details", () =>
					it("shows darker colours", () => {
						entries["la.tex"].should.have.class("medium-blue");
						entries["la.tex"].should.not.have.class("dark-blue");
						return setTheme("atom-light").then(_=> {
							entries["la.tex"].should.have.class("dark-blue");
							entries["la.tex"].should.not.have.class("medium-blue");
						});
					}));
				
				when("the icon is Bower", () =>
					it("shows a different colour", () => {
						entries[".bowerrc"].should.have.class("medium-orange");
						entries[".bowerrc"].should.not.have.class("medium-yellow");
						return setTheme("atom-dark").then(_=> {
							entries[".bowerrc"].should.have.class("medium-yellow");
							entries[".bowerrc"].should.not.have.class("medium-orange");
						});
					}));
			});
		});
		
		when("it doesn't match an icon", () => {
			beforeEach(() => {
				Options.set("defaultIconClass", undefined);
				Options.get("defaultIconClass").should.equal("default-icon");
			});
			
			it("applies the default icon-class", () =>
				entries["blank.file"].should.have.class("default-icon"));
			
			it("removes the built-in icon-class", () =>
				entries["blank.file"].should.not.have.class("icon-file-text"));
			
			when("the default icon-class changes", () => {
				it("removes the old class and applies the new one", () => {
					entries["blank.file"].should.have.class("default-icon");
					Options.set("defaultIconClass", "icon-file-text");
					entries["blank.file"].should.have.class("icon-file-text");
					entries["blank.file"].should.not.have.class("default-icon");
				});
			});
			
			when("the default icon-class contains whitespace", () => {
				it("splits it into multiple classes", () => {
					Options.set("defaultIconClass",         "icon-file-text    medium-red");
					Options.defaultIconClass.should.eql(   ["icon-file-text", "medium-red"]);
					entries["blank.file"].should.have.classes("icon-file-text    medium-red");
					Options.set("defaultIconClass",         "icon-file-text    dark-red    light-yellow");
					Options.defaultIconClass.should.eql(   ["icon-file-text", "dark-red", "light-yellow"]);
					entries["blank.file"].should.have.classes("icon-file-text    dark-red    light-yellow");
				});
			});
		});
	});
	
	
	when("a directory entry is displayed", () => {
		when("it matches an icon", () => {
			it("shows the icon next to its name", () => {
				assertIconClasses(entries, [
					["Dropbox",      "dropbox-icon medium-blue"],
					["node_modules", "node-icon medium-green"]
				]);
			});
			
			it("removes the built-in icon class", () => {
				assertIconClasses(entries, [
					["Dropbox",      "icon-file-directory"],
					["node_modules", "icon-file-directory"]
				], true);
			});
		});
		
		when("it doesn't match an icon", () =>
			it("shows the built-in icon-class", () =>
				entries["subfolder"].should.have.class("name icon icon-file-directory")));
		
		when("it contains a submodule", () => {
			it("shows the default icon for submodules", () => {
				TreeView.expand(".bundle");
				assertIconClasses(ls(), [
					[".bundle/node_modules",    "name icon icon-file-submodule"],
					[".bundle/submodule-1",     "name icon icon-file-submodule"],
					[".bundle/submodule-2",     "name icon icon-file-submodule"],
					[".bundle/syntax.tmbundle", "name icon icon-file-submodule"]
				]);
			});
			
			it("doesn't show icons that match its name", () => {
				entries[".bundle/node_modules"].should.not.have.classes("node-icon");
				entries[".bundle/syntax.tmbundle"].should.not.have.class("textmate-icon");
			});
		});
	});


	unlessOnWindows.describe("When a symbolic link is displayed", () => {
		before(() => {
			Options.set("defaultIconClass", "default-icon");
			TreeView.expand("symlinks");
		});
		
		it("shows a shortcut icon", () => {
			assertIconClasses(ls(), [
				["symlinks/dat.a",        "name icon icon-file-symlink-file"],
				["symlinks/late.x",       "name icon icon-file-symlink-file"],
				["symlinks/empty.file",   "name icon icon-file-symlink-file"],
				["symlinks/node_modules", "name icon icon-file-symlink-directory"],
				["symlinks/Dropbox",      "name icon icon-file-symlink-directory"]
			]);
			
			assertIconClasses(ls(), [
				["symlinks/dat.a",        "binary-icon"],
				["symlinks/empty.file",   "default-icon"],
				["symlinks/node_modules", "node-icon"],
				["symlinks/Dropbox",      "dropbox-icon"]
			], true);
		});
		
		it("uses the colour of its target's icon", () => {
			assertIconClasses(ls(), [
				["symlinks/Dropbox",      "medium-blue"],
				["symlinks/node_modules", "medium-green"]
			]);
			Options.set("defaultIconClass", "icon-file-code medium-green");
			Options.defaultIconClass.should.eql(["icon-file-code", "medium-green"]);
			entries["symlinks/empty.file"].should.have.class("icon-file-symlink-file medium-green");
			entries["symlinks/empty.file"].should.not.have.class("icon-file-code");
		});
	});
});
