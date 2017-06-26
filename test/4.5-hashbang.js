"use strict";

const FuzzyFinder = require("../lib/consumers/fuzzy-finder.js");
const TreeView    = require("../lib/consumers/tree-view.js");
const Tabs        = require("../lib/consumers/tabs.js");
const Options     = require("../lib/options.js");


describe("Interpreter directives", () => {
	const base = "name icon ";
	let files;
	
	before(() => chain([
		() => setup("4.5-hashbang", {
			symlinks: [
				["astral1", "test-1"],
				["node",    "test-2"],
				["perl",    "test-3"],
				["crystal", "test-4"],
				["ruby",    "test-5"]
			],
			chmod: [
				["astral1",            0o755],
				["astral2",            0o755],
				["crystal",            0o755],
				["lambda.scm",         0o755],
				["nada4",              0o755],
				["node",               0o755],
				["not-python.py",      0o755],
				["perl",               0o755],
				["python",             0o755],
				["python2",            0o755],
				["rscript",            0o755],
				["ruby",               0o755],
				["ruby2",              0o755],
				["ruby3",              0o755],
				["sbcl",               0o755],
				["shell",              0o755],
				["shell.d",            0o755],
				["shell2",             0o755],
				["subdir/erlang.tho",  0o755],
				["subdir/haskell.tho", 0o755],
				["unknown1",           0o755]
			]
		}),
		() => {
			files = TreeView.ls();
			files.should.not.be.empty;
			files.length.should.be.at.least(23);
			assertIconClasses(files, defaults);
			return wait(1500);
		}
	]));
	
	after(() => {
		FuzzyFinder.close("file-finder");
		Tabs.closeAll();
	});
	
	beforeEach(() => files = TreeView.ls());
	
	const defaults = [
		["astral1",        "default-icon"],
		["astral2",        "default-icon"],
		["crystal",        "default-icon"],
		["lambda.scm",     "scheme-icon medium-red"],
		["nada",           "default-icon"],
		["nada2",          "default-icon"],
		["nada3",          "default-icon"],
		["nada4",          "default-icon"],
		["node",           "default-icon"],
		["not-python.py",  "python-icon dark-blue"],
		["perl",           "default-icon"],
		["python",         "default-icon"],
		["python2",        "default-icon"],
		["rscript",        "default-icon"],
		["ruby",           "default-icon"],
		["ruby2",          "default-icon"],
		["ruby3",          "default-icon"],
		["sbcl",           "default-icon"],
		["shell",          "default-icon"],
		["shell.d",        "dlang-icon medium-red"],
		["shell2",         "default-icon"],
		["unknown1",       "default-icon"],
		["unknown2",       "default-icon"]
	];
	
	const shebangedIcons = [
		["crystal",        base + "crystal-icon  medium-cyan"],
		["lambda.scm",     base + "cl-icon       medium-orange"],
		["node",           base + "js-icon       medium-yellow"],
		["not-python.py",  base + "perl-icon     medium-blue"],
		["perl",           base + "perl-icon     medium-blue"],
		["python",         base + "python-icon   dark-blue"],
		["python2",        base + "python-icon   dark-blue"],
		["rscript",        base + "r-icon        medium-blue"],
		["ruby",           base + "ruby-icon     medium-red"],
		["ruby2",          base + "ruby-icon     medium-red"],
		["ruby3",          base + "ruby-icon     medium-red"],
		["sbcl",           base + "cl-icon       medium-orange"],
		["shell",          base + "terminal-icon medium-purple"],
		["shell.d",        base + "terminal-icon medium-purple"],
		["shell2",         base + "terminal-icon medium-purple"]
	];
	
	
	when("a file contains a hashbang pattern", () => {
		it("displays the icon if pattern is valid", () => {
			assertIconClasses(files, shebangedIcons);
			unlessOnWindows(() => assertIconClasses(files, [
				["symlinks/test-1", "icon-file-symlink-file medium-purple"],
				["symlinks/test-2", "icon-file-symlink-file medium-yellow"],
				["symlinks/test-3", "icon-file-symlink-file medium-blue"],
				["symlinks/test-4", "icon-file-symlink-file medium-cyan"],
				["symlinks/test-5", "icon-file-symlink-file medium-red"]
			]));
		});
		
		it("does nothing if the pattern is invalid", () => {
			assertIconClasses(files, [
				["nada",  base + "default-icon"],
				["nada2", base + "default-icon"],
				["nada3", base + "default-icon"],
				["nada4", base + "default-icon"]
			]);
		});
		
		it("identifies hashbangs in files containing multibyte characters", () => {
			assertIconClasses(files, [
				["astral1",  base + "emacs-icon    medium-purple"],
				["astral2",  base + "terminal-icon medium-purple"]
			]);
		});
	});


	unlessOnWindows.describe("When the hashbang is valid but matches nothing", () => {
		it("shows the terminal-icon if the file is executable", () => {
			files["unknown1"].should.have.classes(base + "terminal-icon medium-purple");
		});
		
		it("uses no icon if the file is not executable", () => {
			files["unknown2"].should.have.classes(base + "default-icon");
			files["unknown2"].should.not.have.classes("terminal-icon medium-purple");
		});
	});
	
	
	when("the file's hashbang is modified", () => {
		let editor, checkpoint, crystal, crystalLink;
		
		beforeEach(() => {
			return open("crystal").then(ed => {
				editor      = ed;
				checkpoint  = editor.createCheckpoint();
				crystal     = files["crystal"];
				crystalLink = files["symlinks/test-4"];
				crystal.should.have.classes("crystal-icon medium-cyan");
				unlessOnWindows(_=> crystalLink.should.have.classes("medium-cyan"));
			});
		});
		
		afterEach(() => open("crystal").then(ed => {
			if(editor){
				editor.revertToCheckpoint(checkpoint);
				(editor.save() || Promise.resolve()).then(() =>
					atom.commands.dispatch(ed.editorElement, "core:close"));
			}
		}));
		
		
		when("the new hashbang is valid", () => {
			it("updates its icon", () => {
				replaceText(/crystal$/m, "ruby");
				return wait(100)
					.then(() => crystal.should.have.classes("ruby-icon medium-red"))
					.then(() => unlessOnWindows(_=> crystalLink.should.have.classes("medium-red")))
					.then(() => replaceText(/ruby$/m, "mruby"))
					.then(() => wait(100))
					.then(() => crystal.should.have.class("mruby-icon").and.not.have.class("ruby-icon"))
					.then(() => unlessOnWindows(_=> crystalLink.should.have.classes("medium-red")));
			});
		});
		
		
		when("a valid hashbang is invalidated by an edit", () => {
			it("removes the icon that was being displayed", () => {
				crystal.should.have.classes("crystal-icon medium-cyan");
				replaceText(/^/m, "A".repeat(20));
				return wait(300)
					.then(() => crystal.should.have.classes("default-icon"))
					.then(() => replaceText(/^A+/, "#!"))
					.then(() => wait(100))
					.then(() => crystal.should.have.classes("crystal-icon medium-cyan"));
			});
		});
	});
	
	
	when("the Fuzzy-Finder lists files which contain hashbangs", () => {
		it("updates its icons to show the interpreter icons", () => {
			let items;
			return FuzzyFinder
				.open("file-finder")
				.filter(".tho", "file-finder")
				.then(() => {
					items = FuzzyFinder.ls();
					items["subdir/erlang.tho"]  .should.have.classes("default-icon");
					items["subdir/haskell.tho"] .should.have.classes("default-icon");
					return wait(300);
				}).then(() => {
					items = FuzzyFinder.ls();
					items["subdir/erlang.tho"]  .should.not  .have.classes("default-icon");
					items["subdir/haskell.tho"] .should.not  .have.classes("default-icon");
					items["subdir/erlang.tho"]  .should      .have.classes("erlang-icon medium-red");
					items["subdir/haskell.tho"] .should      .have.classes("haskell-icon medium-purple");
				});
		});
		
		it("shares what it finds with the Tree-View", () => {
			FuzzyFinder.close("file-finder");
			TreeView.expand("subdir");
			files = TreeView.ls();
			files["subdir/erlang.tho"].should.have.classes("erlang-icon medium-red");
			files["subdir/haskell.tho"].should.have.classes("haskell-icon medium-purple");
		});
	});
	
	
	when("the strategy is disabled", () => {
		let items;
		
		it("removes every icon that matched a hashbang", () => {
			Options.set("hashbangs", false);
			assertIconClasses(files, defaults);
			FuzzyFinder.open("file-finder");
			return FuzzyFinder.filter(".tho").then(() => {
				items = FuzzyFinder.ls();
				items["subdir/erlang.tho"]   .should.have.classes("default-icon");
				items["subdir/haskell.tho"]  .should.have.classes("default-icon");
				items["subdir/erlang.tho"]   .should.not.have.classes("erlang-icon medium-red");
				items["subdir/haskell.tho"]  .should.not.have.classes("haskell-icon medium-purple");
			});
		});
		
		when("the strategy is re-enabled", () => {
			it("shows the icons again", () => {
				Options.set("hashbangs", true);
				return wait(100).then(() => {
					files = TreeView.ls();
					assertIconClasses(files, shebangedIcons);
					FuzzyFinder.open("file-finder");
					return FuzzyFinder.filter(".tho").then(_=> {
						items = FuzzyFinder.ls();
						items["subdir/erlang.tho"]   .should.have.classes("erlang-icon medium-red");
						items["subdir/haskell.tho"]  .should.have.classes("haskell-icon medium-purple");
						items["subdir/erlang.tho"]   .should.not.have.classes("default-icon");
						items["subdir/haskell.tho"]  .should.not.have.classes("default-icon");
					});
				});
			});
		});
	});
});
