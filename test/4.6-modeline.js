"use strict";

const {assertIconClasses, open, replaceText, revert, setup, wait} = require("./utils");
const FuzzyFinder = require("./utils/fuzzy-finder.js");
const TreeView    = require("./utils/tree-view.js");
const Tabs        = require("./utils/tabs.js");
const Options     = require("../lib/options.js");


describe("Modelines", () => {
	const base = "name icon ";
	
	before(async () => {
		await setup("4.6-modeline", {
			symlinks: [
				["mode-coffee.pl", "test-1"],
				["mode-php.inc",   "test-2"],
				["mode-ruby",      "test-3"],
				["mode-c++",       "test-4"],
				["mode-js",        "test-5"]
			]
		});
		TreeView.refresh();
		TreeView.entries.should.not.be.empty;
		TreeView.entries.should.have.lengthOf.at.least(22);
		await wait(1500);
	});
	
	after(() => {
		FuzzyFinder.close();
		Tabs.closeAll();
	});
	
	
	const defaults = [
		["mode-c++",       "default-icon"],
		["mode-c++1",      "default-icon"],
		["mode-c++2",      "default-icon"],
		["mode-c++3",      "default-icon"],
		["mode-c++4",      "default-icon"],
		["mode-c++5",      "default-icon"],
		["mode-c++6",      "default-icon"],
		["mode-c++7",      "default-icon"],
		["mode-c++8",      "default-icon"],
		["mode-c++9",      "default-icon"],
		["mode-java",      "default-icon"],
		["mode-js",        "default-icon"],
		["mode-coffee.pl", "perl-icon medium-blue"],
		["mode-php.inc",   "clojure-icon medium-green"],
		["mode-ruby",      "default-icon"],
		["mode-ruby1",     "default-icon"],
		["mode-ruby2",     "default-icon"],
		["mode-ruby3",     "default-icon"],
		["mode-ruby4",     "default-icon"],
		["mode-ruby5",     "default-icon"],
		["mode-ruby6",     "default-icon"],
		["mode-ruby7",     "default-icon"],
		["mode-ruby8",     "default-icon"],
		["mode-ruby9",     "default-icon"]
	];
	
	
	when("encountering files containing modelines", () => {
		const fn = async () => {
			for(let i = 0; i < 10; ++i){
				const cpp  = `mode-c++${ i || ""}`;
				const ruby = `mode-ruby${i || ""}`;
				expect(TreeView.entries[cpp],  `Node ${cpp}`).to.have.classes(base  + "cpp-icon  medium-blue");
				expect(TreeView.entries[ruby], `Node ${ruby}`).to.have.classes(base + "ruby-icon medium-red");
			}
			TreeView.entries["mode-js"].should.have.classes(base        + "js-icon     medium-yellow");
			TreeView.entries["mode-java"].should.have.classes(base      + "java-icon   medium-purple");
			TreeView.entries["mode-coffee.pl"].should.have.classes(base + "coffee-icon medium-maroon");
			TreeView.entries["mode-php.inc"].should.have.classes(base   + "php-icon    dark-blue");
			TreeView.expand("symlinks");
			await wait(500);
			assertIconClasses(TreeView.entries, [
				["symlinks/test-1", "icon-file-symlink-file medium-maroon"],
				["symlinks/test-2", "icon-file-symlink-file dark-blue"],
				["symlinks/test-3", "icon-file-symlink-file medium-red"],
				["symlinks/test-4", "icon-file-symlink-file medium-blue"],
				["symlinks/test-5", "icon-file-symlink-file medium-yellow"]
			]);
		};
		
		it("displays icons of modelines which match languages", () => fn());
		it("shows nothing for modelines which don't match", () => {
			for(let i = 1; i <= 5; ++i){
				const entry = TreeView.entries["nah-" + i];
				entry.should.have.classes(base + "default-icon");
			}
		});
		
		it("retains icons it matches for quicker display", () => {
			TreeView.collapse();
			TreeView.expand();
			TreeView.refresh();
			return fn();
		});
	});
	
	
	when("a file's modeline changes", () => {
		it("updates its icon to match", async () => {
			await open("mode-java");
			await replaceText(/Java/, "Python");
			TreeView.refresh();
			TreeView.entries["mode-java"].should.have.classes("python-icon dark-blue");
			await revert();
			TreeView.refresh();
			TreeView.entries["mode-java"].should.have.classes("java-icon medium-purple");
		});
	});
	
	
	when("the Fuzzy-Finder lists results which contain modelines", () => {
		it("updates icons as files are scanned", async () => {
			await FuzzyFinder.filter("abc12");
			FuzzyFinder.entries["subdir/abc123"].should.have.classes("default-icon");
			FuzzyFinder.entries["subdir/abc124"].should.have.classes("default-icon");
			FuzzyFinder.entries["subdir/abc125"].should.have.classes("default-icon");
			FuzzyFinder.entries["subdir/abc126"].should.have.classes("default-icon");
			await wait(500);
			FuzzyFinder.entries["subdir/abc123"].should.have.classes("emacs-icon medium-purple");
			FuzzyFinder.entries["subdir/abc124"].should.have.classes("apl-icon dark-cyan");
			FuzzyFinder.entries["subdir/abc125"].should.have.classes("manpage-icon dark-green");
			FuzzyFinder.entries["subdir/abc126"].should.have.classes("vim-icon medium-green");
			FuzzyFinder.entries["subdir/abc123"].should.not.have.classes("default-icon");
			FuzzyFinder.entries["subdir/abc124"].should.not.have.classes("default-icon");
			FuzzyFinder.entries["subdir/abc125"].should.not.have.classes("default-icon");
			FuzzyFinder.entries["subdir/abc126"].should.not.have.classes("default-icon");
		});
	});
	
	
	when("the strategy is disabled", () => {
		it("removes any icons assigned by modeline", () => {
			Options.set("modelines", false);
			assertIconClasses(TreeView.entries, defaults);
			for(let i = 0; i < 10; ++i){
				TreeView.entries[`mode-c++${ i || ""}`].should.not.have.classes("cpp-icon medium-blue");
				TreeView.entries[`mode-ruby${i || ""}`].should.not.have.classes("ruby-icon medium-red");
			}
			TreeView.entries["mode-js"].should.not.have.classes("js-icon medium-yellow");
			TreeView.entries["mode-java"].should.not.have.classes("java-icon medium-purple");
			TreeView.entries["mode-coffee.pl"].should.not.have.classes("coffee-icon medium-maroon");
			TreeView.entries["mode-php.inc"].should.not.have.classes("php-icon dark-blue");
			FuzzyFinder.entries["subdir/abc123"].should.have.classes("default-icon");
			FuzzyFinder.entries["subdir/abc124"].should.have.classes("default-icon");
			FuzzyFinder.entries["subdir/abc125"].should.have.classes("default-icon");
			FuzzyFinder.entries["subdir/abc126"].should.have.classes("default-icon");
			FuzzyFinder.entries["subdir/abc123"].should.not.have.classes("emacs-icon medium-purple");
			FuzzyFinder.entries["subdir/abc124"].should.not.have.classes("apl-icon dark-cyan");
			FuzzyFinder.entries["subdir/abc125"].should.not.have.classes("manpage-icon dark-green");
			FuzzyFinder.entries["subdir/abc126"].should.not.have.classes("vim-icon medium-green");
		});
		
		when("the strategy is re-enabled", () => {
			it("shows the icons again", () => {
				Options.set("modelines", true);
				for(let i = 0; i < 10; ++i){
					TreeView.entries[`mode-c++${ i || ""}`].should.have.classes(base + "cpp-icon  medium-blue");
					TreeView.entries[`mode-ruby${i || ""}`].should.have.classes(base + "ruby-icon medium-red");
				}
				TreeView.entries["mode-js"].should.have.classes(base        + "js-icon medium-yellow");
				TreeView.entries["mode-java"].should.have.classes(base      + "java-icon medium-purple");
				TreeView.entries["mode-coffee.pl"].should.have.classes(base + "coffee-icon medium-maroon");
				TreeView.entries["mode-php.inc"].should.have.classes(base   + "php-icon dark-blue");
				FuzzyFinder.entries["subdir/abc123"].should.have.classes("emacs-icon medium-purple");
				FuzzyFinder.entries["subdir/abc124"].should.have.classes("apl-icon dark-cyan");
				FuzzyFinder.entries["subdir/abc125"].should.have.classes("manpage-icon dark-green");
				FuzzyFinder.entries["subdir/abc126"].should.have.classes("vim-icon medium-green");
				FuzzyFinder.entries["subdir/abc123"].should.not.have.classes("default-icon");
				FuzzyFinder.entries["subdir/abc124"].should.not.have.classes("default-icon");
				FuzzyFinder.entries["subdir/abc125"].should.not.have.classes("default-icon");
				FuzzyFinder.entries["subdir/abc126"].should.not.have.classes("default-icon");
			});
		});
	});
});
