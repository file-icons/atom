"use strict";

const {assertIconClasses, open, resetOptions, setTheme, wait} = require("./utils");
const ArchiveView = require("./utils/archive-view.js");
const Options     = require("../lib/options.js");


describe("Archive-view", () => {
	const base = "file icon ";
	
	before(() => resetOptions());
	
	when("a zip-file is opened", () => {
		it("shows icons for each of its contents", async () => {
			await open("zipped-1.zip");
			await wait(500);
		});
		
		when("a file is displayed", () => {
			const classes = [
				["zipped/.artx/.keep",          base + "git-icon",       "medium-red"],
				["zipped/.atom/.keep",          base + "git-icon",       "medium-red"],
				["zipped/.atom/.eslintignore",  base + "eslint-icon",    "medium-purple"],
				["zipped/.eslintrc.yaml",       base + "eslint-icon",    "light-purple"],
				["zipped/.npmignore",           base + "npm-icon",       "medium-red"],
				["zipped/.travis.yml",          base + "travis-icon",    "medium-red"],
				["zipped/chai.js",              base + "chai-icon",      "medium-red"],
				["zipped/docs.roff",            base + "manpage-icon",   "dark-green"],
				["zipped/file.ico",             base + "image-icon",     "medium-blue"],
				["zipped/karma.conf.js",        base + "karma-icon",     "medium-cyan"],
				["zipped/markup.md",            base + "markdown-icon",  "medium-blue"],
				["zipped/mocha.js",             base + "mocha-icon",     "medium-maroon"],
				["zipped/script.coffee",        base + "coffee-icon",    "medium-maroon"],
				["zipped/script.js",            base + "js-icon",        "medium-yellow"],
				["zipped/text.txt",             base + "icon-file-text", "medium-blue"],
				["zipped/z.foobarz",            base + "default-icon"]
			];
			
			it("shows an icon next to its filename", () =>
				assertIconClasses(ArchiveView.entries, classes));
			
			it("tests path-sensitive rules", () =>
				assertIconClasses(ArchiveView.entries, (classes.push(
					["zipped/.git/HEAD",        base + "database-icon", "medium-red"],
					["zipped/apache2/magic",    base + "apache-icon",   "medium-purple"],
					["zipped/apache2/psionics", base + "default-icon"]
				) && classes)));
			
			when("colours are disabled", () =>
				it("shows an uncoloured icon", () => {
					const iconClasses   = classes.map(args => args.slice(0,2));
					const colourClasses = classes.map(a => a[2] ? [a[0], a[2]] : null).filter(Boolean);
					Options.set("coloured", false);
					assertIconClasses(ArchiveView.entries, iconClasses);
					assertIconClasses(ArchiveView.entries, colourClasses, true);
					Options.set("coloured", true);
					assertIconClasses(ArchiveView.entries, iconClasses);
					assertIconClasses(ArchiveView.entries, colourClasses);
				}));
			
			when("an entry's type isn't recognised", () =>
				it("uses the default icon-class setting", () => {
					const entry1 = ArchiveView.entries["zipped/a.bazquxx"];
					const entry2 = ArchiveView.entries["zipped/z.foobarz"];
					
					entry1.should.have.classes(base + "default-icon");
					entry2.should.have.classes(base + "default-icon");
					entry1.should.not.have.class("foo-bar");
					entry2.should.not.have.class("foo-bar");
					
					Options.set("defaultIconClass", "foo-bar");
					entry1.should.have.classes(base + "foo-bar");
					entry2.should.have.classes(base + "foo-bar");
					entry2.should.not.have.class("default-icon");
					entry1.should.not.have.class("default-icon");
					
					Options.set("defaultIconClass", "default-icon");
					entry1.should.have.classes(base + "default-icon");
					entry2.should.have.classes(base + "default-icon");
					entry1.should.not.have.class("foo-bar");
					entry2.should.not.have.class("foo-bar");
				}));
		});
		
		when("a directory is listed", () => {
			const base = "directory icon ";
			
			it("shows an icon next to its name", () =>
				assertIconClasses(ArchiveView.entries, [
					["zipped/apache2",          base + "icon-file-directory"],
					["zipped/bower_components", base + "bower-icon   medium-yellow"],
					["zipped/Dropbox",          base + "dropbox-icon medium-blue"],
					["zipped/node_modules",     base + "node-icon    medium-green"],
					["zipped/.artx",            base + "arttext-icon dark-purple"],
					["zipped/.atom",            base + "atom-icon    dark-green"],
					["zipped/.git",             base + "git-icon     medium-red"],
					["zipped/.meteor",          base + "meteor-icon  dark-orange"],
					["zipped/.vagrant",         base + "vagrant-icon medium-cyan"],
					["zipped/.bundle",          base + "package-icon"],
					["zipped/.framework",       base + "dylib-icon"],
					["zipped/.github",          base + "github-icon"],
					["zipped/.svn",             base + "svn-icon"],
					["zipped/.tmBundle",        base + "textmate-icon"],
					["zipped/.xcodeproj",       base + "appstore-icon"]
				]));
			
			when("colours are disabled", () =>
				it("shows an uncoloured icon", () => {
					const colourClasses = [
						["zipped/bower_components", "medium-yellow"],
						["zipped/Dropbox",          "medium-blue"],
						["zipped/node_modules",     "medium-green"],
						["zipped/.artx",            "dark-purple"],
						["zipped/.atom",            "dark-green"],
						["zipped/.git",             "medium-red"],
						["zipped/.meteor",          "dark-orange"],
						["zipped/.vagrant",         "medium-cyan"]
					];
					const iconClasses = [
						["zipped/bower_components", base + "bower-icon"],
						["zipped/Dropbox",          base + "dropbox-icon"],
						["zipped/node_modules",     base + "node-icon"],
						["zipped/.artx",            base + "arttext-icon"],
						["zipped/.atom",            base + "atom-icon"],
						["zipped/.git",             base + "git-icon"],
						["zipped/.meteor",          base + "meteor-icon"],
						["zipped/.vagrant",         base + "vagrant-icon"]
					];
					Options.set("coloured", false);
					assertIconClasses(ArchiveView.entries, colourClasses, true);
					assertIconClasses(ArchiveView.entries, iconClasses);
					Options.set("coloured", true);
					assertIconClasses(ArchiveView.entries, colourClasses);
					assertIconClasses(ArchiveView.entries, iconClasses);
				}));
		});
		
		when("the icon has thin details", () =>
			when("using a light-coloured theme", () => {
				it("has a darker colour", async () => {
					ArchiveView.entries["zipped/chai.js"].should.have.classes(base + "chai-icon medium-red");
					ArchiveView.entries["zipped/chai.js"].should.not.have.class("dark-red");
					ArchiveView.entries["zipped/script.js"].should.have.classes(base + "js-icon medium-yellow");
					ArchiveView.entries["zipped/script.js"].should.not.have.class("dark-yellow");
					await setTheme("atom-light");
					ArchiveView.entries["zipped/chai.js"].should.have.classes(base + "chai-icon dark-red");
					ArchiveView.entries["zipped/chai.js"].should.not.have.class("medium-red");
					ArchiveView.entries["zipped/script.js"].should.have.classes(base + "js-icon dark-yellow");
					ArchiveView.entries["zipped/script.js"].should.not.have.class("medium-yellow");
				});
			
				it("shows a different colour if the icon is Bower", async () => {
					const birds = ["zipped/.bowerrc", "zipped/bower_components", "zipped/bower_components/bower.json"];
					for(const bird of birds){
						ArchiveView.entries[bird].should.have.classes("bower-icon medium-orange");
						ArchiveView.entries[bird].should.not.have.class("medium-yellow");
					}
					await setTheme("atom-dark");
					for(const bird of birds){
						ArchiveView.entries[bird].should.have.classes("bower-icon medium-yellow");
						ArchiveView.entries[bird].should.not.have.class("medium-orange");
					}
				});
			}));
	});
});
