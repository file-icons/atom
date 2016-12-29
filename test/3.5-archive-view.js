"use strict";

const ArchiveView = require("../lib/consumers/archive-view.js");
const Options     = require("../lib/options.js");


describe("Archive-view", () => {
	const base = "file icon ";
	let archiveTree = null;
	let entries = [];
	
	before("Resetting options", () => {
		Options.set("coloured", true);
		Options.set("defaultIconClass", "default-icon");
	});
	
	
	when("a zip-file is opened", () => {
		it("shows icons for each of its contents", () => {
			ArchiveView.entries.size.should.equal(0);
			return open("zipped-1.zip")
				.then(() => wait(500))
				.then(() => {
					ArchiveView.entries.size.should.not.equal(0);
					archiveTree = workspace.querySelector(".archive-tree");
					entries = ls();
					entries.should.not.be.empty;
				});
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
				["zipped/docs.roff",            base + "manpage-icon",   "dark-maroon"],
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
				assertIconClasses(entries, classes));
			
			it("tests path-sensitive rules", () =>
				assertIconClasses(entries, (classes.push(
					["zipped/.git/HEAD",        base + "database-icon", "medium-red"],
					["zipped/apache2/magic",    base + "apache-icon",   "medium-purple"],
					["zipped/apache2/psionics", base + "default-icon"]
				) && classes)));
			
			when("colours are disabled", () =>
				it("shows an uncoloured icon", () => {
					const iconClasses   = classes.map(args => args.slice(0,2));
					const colourClasses = classes.map(a => a[2] ? [a[0], a[2]] : null).filter(Boolean);
					Options.set("coloured", false);
					assertIconClasses(entries, iconClasses);
					assertIconClasses(entries, colourClasses, true);
					Options.set("coloured", true);
					assertIconClasses(entries, iconClasses);
					assertIconClasses(entries, colourClasses);
				}));
			
			when("an entry's type isn't recognised", () =>
				it("uses the default icon-class setting", () => {
					const entry1 = entries["zipped/a.bazquxx"];
					const entry2 = entries["zipped/z.foobarz"];
					
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
				assertIconClasses(entries, [
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
					assertIconClasses(entries, colourClasses, true);
					assertIconClasses(entries, iconClasses);
					Options.set("coloured", true);
					assertIconClasses(entries, colourClasses);
					assertIconClasses(entries, iconClasses);
				}));
		});
		
		when("the icon has thin details", () =>
			when("using a light-coloured theme", () => {
				it("has a darker colour", () => {
					entries["zipped/chai.js"].should.have.classes(base + "chai-icon medium-red");
					entries["zipped/chai.js"].should.not.have.class("dark-red");
					entries["zipped/script.js"].should.have.classes(base + "js-icon medium-yellow");
					entries["zipped/script.js"].should.not.have.class("dark-yellow");
					return setTheme("atom-light").then(() => {
						entries["zipped/chai.js"].should.have.classes(base + "chai-icon dark-red");
						entries["zipped/chai.js"].should.not.have.class("medium-red");
						entries["zipped/script.js"].should.have.classes(base + "js-icon dark-yellow");
						entries["zipped/script.js"].should.not.have.class("medium-yellow");
					});
				});
			
				it("shows a different colour if the icon is Bower", () => {
					const birds = ["zipped/.bowerrc", "zipped/bower_components", "zipped/bower_components/bower.json"];
					for(const bird of birds){
						entries[bird].should.have.classes("bower-icon medium-orange");
						entries[bird].should.not.have.class("medium-yellow");
					}
					return setTheme("atom-dark")
						.then(() => birds.forEach(bird => {
							entries[bird].should.have.classes("bower-icon medium-yellow");
							entries[bird].should.not.have.class("medium-orange");
						}));
				});
			}));
	});
	
	
	when("the zip-file is closed", () => {
		it("frees up memory", () => {
			ArchiveView.entries.size.should.equal(50);
			const samples = [...ArchiveView.entries];
			for(const sample of samples){
				sample.destroyed.should.be.false;
				sample.iconNode.should.be.ok.and.respondTo("destroy");
				sample.emitter.should.be.ok;
				sample.view.should.be.ok;
			}
			const activePaneItem = atom.workspace.getActivePaneItem();
			atom.workspace.closeActivePaneItemOrEmptyPaneOrWindow();
			expect(atom.workspace.getActivePaneItem()).not.to.equal(activePaneItem);
			expect(ArchiveView.entries.size).to.equal(0);
			for(const sample of samples){
				sample.destroyed.should.be.true;
				ArchiveView.entries.has(sample).should.be.false;
				expect(sample.iconNode).to.be.null;
				expect(sample.emitter).to.be.null;
				expect(sample.view).to.be.null;
			}
		});
		
		it("doesn't clobber other archives being shown", () => {
			atom.workspace.getActivePane().destroyItems();
			
			return chain(
				atom.packages.activatePackage("tabs"),
				() => open("zipped-2.zip"),
				() => open("zipped-1.zip"),
				() => wait(500)
			).then(() => {
				ArchiveView.entries.size.should.equal(285);
				const sampleSet1 = [...ArchiveView.entries]
					.filter(sample => /zipped-1\.zip$/.test(sample.archivePath))
					.map(sample => {
						sample.destroyed.should.be.false;
						sample.iconNode.should.be.ok.and.respondTo("destroy");
						sample.emitter.should.be.ok;
						sample.view.should.be.ok;
						return sample;
					});
				const sampleSet2 = [...ArchiveView.entries]
					.filter(sample => /zipped-2\.zip$/.test(sample.archivePath))
					.map(sample => {
						sample.destroyed.should.be.false;
						sample.iconNode.should.be.ok.and.respondTo("destroy");
						sample.emitter.should.be.ok;
						sample.view.should.be.ok;
						return sample;
					});
				let activePaneItem = atom.workspace.getActivePaneItem();
				activePaneItem.file.path.should.match(/zipped-1\.zip$/);
				atom.workspace.closeActivePaneItemOrEmptyPaneOrWindow();
				expect(atom.workspace.getActivePaneItem()).not.to.equal(activePaneItem);
				expect(ArchiveView.entries.size).to.equal(sampleSet2.length);
				for(const sample of sampleSet1){
					sample.destroyed.should.be.true;
					ArchiveView.entries.has(sample).should.be.false;
					expect(sample.iconNode).to.be.null;
					expect(sample.emitter).to.be.null;
					expect(sample.view).to.be.null;
				}
				for(const sample of sampleSet2){
					sample.destroyed.should.be.false;
					sample.iconNode.should.be.ok.and.respondTo("destroy");
					sample.emitter.should.be.ok;
					sample.view.should.be.ok;
				}
				activePaneItem = atom.workspace.getActivePaneItem();
				activePaneItem.file.path.should.match(/zipped-2\.zip$/);
				atom.workspace.closeActivePaneItemOrEmptyPaneOrWindow();
				expect(atom.workspace.getActivePaneItem()).not.to.be.ok;
				ArchiveView.entries.size.should.equal(0);
				for(const sample of sampleSet2){
					sample.destroyed.should.be.true;
					ArchiveView.entries.has(sample).should.be.false;
					expect(sample.iconNode).to.be.null;
					expect(sample.emitter).to.be.null;
					expect(sample.view).to.be.null;
				}
			});
		});
	});
	
	
	function ls(){
		const results = [];
		const entryNodes = archiveTree.querySelectorAll("li.entry");
		for(const entryNode of entryNodes){
			const entry = ArchiveView.entryNodes.get(entryNode.spacePenView);
			if(!entry) continue;
			const {path}  = entry.entry;
			results[path] = entryNode.querySelector(".icon");
			results.push(entryNode);
		}
		return results;
	}
});
