"use strict";

const FuzzyFinder = require("../lib/consumers/fuzzy-finder.js");
const TreeView    = require("../lib/consumers/tree-view.js");
const Tabs        = require("../lib/consumers/tabs.js");
const Options     = require("../lib/options.js");


describe("Modelines", () => {
	const base = "name icon ";
	let files;
	
	before(() => chain([
		() => setup("4.6-modeline", {
			symlinks: [
				["mode-coffee.pl", "test-1"],
				["mode-php.inc",   "test-2"],
				["mode-ruby",      "test-3"],
				["mode-c++",       "test-4"],
				["mode-js",        "test-5"]
			]
		}),
		() => {
			files = TreeView.ls();
			files.should.not.be.empty;
			files.length.should.be.at.least(22);
			return wait(1500);
		}
	]));
	
	after(() => {
		FuzzyFinder.close("file-finder");
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
		const fn = () => {
			for(let i = 0; i < 10; ++i){
				const cpp  = `mode-c++${ i || ""}`;
				const ruby = `mode-ruby${i || ""}`;
				expect(files[cpp],  `Node ${cpp}`).to.have.classes(base  + "cpp-icon  medium-blue");
				expect(files[ruby], `Node ${ruby}`).to.have.classes(base + "ruby-icon medium-red");
			}
			files["mode-js"].should.have.classes(base        + "js-icon     medium-yellow");
			files["mode-java"].should.have.classes(base      + "java-icon   medium-purple");
			files["mode-coffee.pl"].should.have.classes(base + "coffee-icon medium-maroon");
			files["mode-php.inc"].should.have.classes(base   + "php-icon    dark-blue");
			unlessOnWindows(() => assertIconClasses(files, [
				["symlinks/test-1", "icon-file-symlink-file medium-maroon"],
				["symlinks/test-2", "icon-file-symlink-file dark-blue"],
				["symlinks/test-3", "icon-file-symlink-file medium-red"],
				["symlinks/test-4", "icon-file-symlink-file medium-blue"],
				["symlinks/test-5", "icon-file-symlink-file medium-yellow"]
			]));
		};
		
		it("displays icons of modelines which match languages", () => fn());
		it("shows nothing for modelines which don't match", () => {
			for(let i = 1; i <= 5; ++i)
				files["nah-"+i].should.have.classes(base + "default-icon");
		});
		
		it("retains icons it matches for quicker display", () => {
			TreeView.collapse();
			TreeView.expand();
			files = TreeView.ls();
			fn();
		});
	});
	
	
	when("a file's modeline changes", () => {
		it("updates its icon to match", () => {
			return open("mode-java")
				.then(ed => replaceText(/Java/, "Python"))
				.then(() => {
					files = TreeView.ls();
					files["mode-java"].should.have.classes("python-icon dark-blue");
				})
				.then(() => revert())
				.then(() => {
					files = TreeView.ls();
					files["mode-java"].should.have.classes("java-icon medium-purple");
				});
		});
	});
	
	
	when("the Fuzzy-Finder lists results which contain modelines", () => {
		it("updates icons as files are scanned", () => {
			let items;
			return FuzzyFinder
				.open("file-finder")
				.filter("abc12", "file-finder")
				.then(() => {
					items = FuzzyFinder.ls();
					items["subdir/abc123"].should.have.classes("default-icon");
					items["subdir/abc124"].should.have.classes("default-icon");
					items["subdir/abc125"].should.have.classes("default-icon");
					items["subdir/abc126"].should.have.classes("default-icon");
				})
				.then(() => wait(300))
				.then(() => {
					items = FuzzyFinder.ls();
					items["subdir/abc123"].should.have.classes("emacs-icon   medium-purple");
					items["subdir/abc124"].should.have.classes("apl-icon     dark-cyan");
					items["subdir/abc125"].should.have.classes("manpage-icon dark-green");
					items["subdir/abc126"].should.have.classes("vim-icon     medium-green");
					items["subdir/abc123"].should.not.have.classes("default-icon");
					items["subdir/abc124"].should.not.have.classes("default-icon");
					items["subdir/abc125"].should.not.have.classes("default-icon");
					items["subdir/abc126"].should.not.have.classes("default-icon");
				});
		});
	});
	
	
	when("the strategy is disabled", () => {
		it("removes any icons assigned by modeline", () => {
			Options.set("modelines", false);
			assertIconClasses(files, defaults);
			for(let i = 0; i < 10; ++i){
				files[`mode-c++${ i || ""}`].should.not.have.classes("cpp-icon  medium-blue");
				files[`mode-ruby${i || ""}`].should.not.have.classes("ruby-icon medium-red");
			}
			files["mode-js"].should.not.have.classes("js-icon medium-yellow");
			files["mode-java"].should.not.have.classes("java-icon medium-purple");
			files["mode-coffee.pl"].should.not.have.classes("coffee-icon medium-maroon");
			files["mode-php.inc"].should.not.have.classes("php-icon dark-blue");
			
			const items = FuzzyFinder.ls();
			items["subdir/abc123"].should.have.classes("default-icon");
			items["subdir/abc124"].should.have.classes("default-icon");
			items["subdir/abc125"].should.have.classes("default-icon");
			items["subdir/abc126"].should.have.classes("default-icon");
			items["subdir/abc123"].should.not.have.classes("emacs-icon   medium-purple");
			items["subdir/abc124"].should.not.have.classes("apl-icon     dark-cyan");
			items["subdir/abc125"].should.not.have.classes("manpage-icon dark-green");
			items["subdir/abc126"].should.not.have.classes("vim-icon     medium-green");
		});
		
		when("the strategy is re-enabled", () => {
			it("shows the icons again", () => {
				Options.set("modelines", true);
				for(let i = 0; i < 10; ++i){
					files[`mode-c++${ i || ""}`].should.have.classes(base + "cpp-icon  medium-blue");
					files[`mode-ruby${i || ""}`].should.have.classes(base + "ruby-icon medium-red");
				}
				files["mode-js"].should.have.classes(base        + "js-icon     medium-yellow");
				files["mode-java"].should.have.classes(base      + "java-icon   medium-purple");
				files["mode-coffee.pl"].should.have.classes(base + "coffee-icon medium-maroon");
				files["mode-php.inc"].should.have.classes(base   + "php-icon    dark-blue");
				
				const items = FuzzyFinder.ls();
				items["subdir/abc123"].should.have.classes("emacs-icon   medium-purple");
				items["subdir/abc124"].should.have.classes("apl-icon     dark-cyan");
				items["subdir/abc125"].should.have.classes("manpage-icon dark-green");
				items["subdir/abc126"].should.have.classes("vim-icon     medium-green");
				items["subdir/abc123"].should.not.have.classes("default-icon");
				items["subdir/abc124"].should.not.have.classes("default-icon");
				items["subdir/abc125"].should.not.have.classes("default-icon");
				items["subdir/abc126"].should.not.have.classes("default-icon");
			});
		});
	});
});
