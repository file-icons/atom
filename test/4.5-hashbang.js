"use strict";

const {assertIconClasses, open, replaceText, setup, wait} = require("./utils");
const FuzzyFinder = require("./utils/fuzzy-finder.js");
const TreeView    = require("./utils/tree-view.js");
const Tabs        = require("./utils/tabs.js");
const Options     = require("../lib/options.js");


describe("Interpreter directives", () => {
	const base = "name icon ";
	
	before(async () => {
		await setup("4.5-hashbang", {
			symlinks: [
				["astral1", "test-1"],
				["node",    "test-2"],
				["perl",    "test-3"],
				["crystal", "test-4"],
				["ruby",    "test-5"],
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
				["unknown1",           0o755],
			]
		});
		
		TreeView.refresh();
		TreeView.entries.should.not.be.empty;
		TreeView.entries.should.have.lengthOf.at.least(23);
		assertIconClasses(TreeView.entries, defaults);
		await wait(1500);
	});
	
	after(() => {
		FuzzyFinder.close();
		Tabs.closeAll();
	});
	
	beforeEach(() => TreeView.refresh());
	
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
		it("displays the icon if pattern is valid", async () => {
			TreeView.expand("symlinks");
			await wait(500);
			assertIconClasses(TreeView.entries, shebangedIcons);
			assertIconClasses(TreeView.entries, [
				["symlinks/test-1", "icon-file-symlink-file medium-purple"],
				["symlinks/test-2", "icon-file-symlink-file medium-yellow"],
				["symlinks/test-3", "icon-file-symlink-file medium-blue"],
				["symlinks/test-4", "icon-file-symlink-file medium-cyan"],
				["symlinks/test-5", "icon-file-symlink-file medium-red"]
			]);
		});
		
		it("does nothing if the pattern is invalid", () => {
			assertIconClasses(TreeView.entries, [
				["nada",  base + "default-icon"],
				["nada2", base + "default-icon"],
				["nada3", base + "default-icon"],
				["nada4", base + "default-icon"]
			]);
		});
		
		it("identifies hashbangs in files containing multibyte characters", () => {
			assertIconClasses(TreeView.entries, [
				["astral1",  base + "emacs-icon    medium-purple"],
				["astral2",  base + "terminal-icon medium-purple"]
			]);
		});
	});


	when("the hashbang is valid but matches nothing", () => {
		it("shows the terminal-icon if the file is executable", () => {
			TreeView.entries["unknown1"].should.have.classes(base + "terminal-icon medium-purple");
		});
		
		it("uses no icon if the file is not executable", () => {
			TreeView.entries["unknown2"].should.have.classes(base + "default-icon");
			TreeView.entries["unknown2"].should.not.have.classes("terminal-icon medium-purple");
		});
	});
	
	
	when("the file's hashbang is modified", () => {
		let editor, checkpoint, crystal, crystalLink;
		
		const relink = async (delay = 100) => {
			await wait(delay);
			TreeView.refresh();
			crystal     = TreeView.entries["crystal"];
			crystalLink = TreeView.entries["symlinks/test-4"];
		};
		
		beforeEach(async () => {
			editor = await open("crystal");
			checkpoint = editor.createCheckpoint();
			await relink(10);
			crystal.should.have.classes("crystal-icon medium-cyan");
			crystalLink.should.have.classes("medium-cyan");
		});
		
		afterEach(async () => {
			editor = await open("crystal");
			if(editor){
				editor.revertToCheckpoint(checkpoint);
				await editor.save();
				atom.commands.dispatch(editor.editorElement, "core:close");
			}
		});
		
		
		when("the new hashbang is valid", () => {
			it("updates its icon", async () => {
				await replaceText(/crystal$/m, "ruby");
				await relink();
				crystal.should.have.classes("ruby-icon medium-red");
				crystalLink.should.have.classes("medium-red");
				await replaceText(/ruby$/m, "mruby");
				await relink();
				crystal.should.have.class("mruby-icon").and.not.have.class("ruby-icon");
				crystalLink.should.have.classes("medium-red");
			});
		});
		
		
		when("a valid hashbang is invalidated by an edit", () => {
			it("removes the icon that was being displayed", async () => {
				crystal.should.have.classes("crystal-icon medium-cyan");
				await replaceText(/^/m, "A".repeat(20));
				await relink(300);
				crystal.should.have.classes("default-icon");
				await replaceText(/^A+/, "#!");
				await relink();
				crystal.should.have.classes("crystal-icon medium-cyan");
			});
		});
	});
	
	
	when("the Fuzzy-Finder lists files which contain hashbangs", () => {
		it("updates its icons to show the interpreter icons", async () => {
			await FuzzyFinder.filter(".tho");
			FuzzyFinder.entries["subdir/erlang.tho"]  .should.have.classes("default-icon");
			FuzzyFinder.entries["subdir/haskell.tho"] .should.have.classes("default-icon");
			await wait(300);
			FuzzyFinder.entries["subdir/erlang.tho"]  .should.not  .have.classes("default-icon");
			FuzzyFinder.entries["subdir/haskell.tho"] .should.not  .have.classes("default-icon");
			FuzzyFinder.entries["subdir/erlang.tho"]  .should      .have.classes("erlang-icon medium-red");
			FuzzyFinder.entries["subdir/haskell.tho"] .should      .have.classes("haskell-icon medium-purple");
		});
		
		it("shares what it finds with the Tree-View", () => {
			FuzzyFinder.close();
			TreeView.expand("subdir");
			TreeView.refresh();
			TreeView.entries["subdir/erlang.tho"].should.have.classes("erlang-icon medium-red");
			TreeView.entries["subdir/haskell.tho"].should.have.classes("haskell-icon medium-purple");
		});
	});
	
	
	when("the strategy is disabled", async () => {
		it("removes every icon that matched a hashbang", async () => {
			Options.set("hashbangs", false);
			assertIconClasses(FuzzyFinder.entries, defaults);
			await FuzzyFinder.filter(".tho");
			FuzzyFinder.entries["subdir/erlang.tho"]   .should.have.classes("default-icon");
			FuzzyFinder.entries["subdir/haskell.tho"]  .should.have.classes("default-icon");
			FuzzyFinder.entries["subdir/erlang.tho"]   .should.not.have.classes("erlang-icon medium-red");
			FuzzyFinder.entries["subdir/haskell.tho"]  .should.not.have.classes("haskell-icon medium-purple");
		});
		
		when("the strategy is re-enabled", () => {
			it("shows the icons again", async () => {
				Options.set("hashbangs", true);
				await wait(100);
				TreeView.refresh();
				assertIconClasses(TreeView.entries, shebangedIcons);
				await FuzzyFinder.filter(".tho");
				FuzzyFinder.entries["subdir/erlang.tho"]   .should.have.classes("erlang-icon medium-red");
				FuzzyFinder.entries["subdir/haskell.tho"]  .should.have.classes("haskell-icon medium-purple");
				FuzzyFinder.entries["subdir/erlang.tho"]   .should.not.have.classes("default-icon");
				FuzzyFinder.entries["subdir/haskell.tho"]  .should.not.have.classes("default-icon");
			});
		});
	});
});
