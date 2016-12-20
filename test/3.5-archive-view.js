"use strict";

const ArchiveView = require("../lib/consumers/archive-view.js");
const Options     = require("../lib/options.js");


describe("Archive-view", () => {
	let archiveTree = null;
	let entries = [];
	
	before("Resetting options", () => {
		Options.set("coloured", true);
		Options.set("defaultIconClass", "default-icon");
	});
	
	
	describe("When a zip-file is opened", () => {
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
		
		describe("When files are listed", () => {
			const classes = [
				["FI-Config/.git/COMMIT_EDITMSG", "file icon git-commit-icon", "medium-red"],
				["FI-Config/changes.txt", "file icon icon-file-text", "medium-blue"],
				["FI-Config/config.cson", "file icon database-icon", "medium-maroon"],
				["FI-Config/config.json", "file icon database-icon", "medium-yellow"],
				["FI-Config/node_modules/assertion-error/.npmignore", "file icon npm-icon", "medium-red"],
				["FI-Config/node_modules/assertion-error/History.md", "file icon markdown-icon", "medium-blue"],
				["FI-Config/node_modules/chai/karma.conf.js", "file icon karma-icon", "medium-cyan"],
				["FI-Config/node_modules/chai/chai.js", "file icon chai-icon", "medium-red"],
				["FI-Config/node_modules/chai/bower.json", "file icon bower-icon", "medium-yellow"],
				["FI-Config/node_modules/mocha/lib/mocha.js", "file icon mocha-icon", "medium-maroon"],
				["FI-Config/node_modules/minimist/.travis.yml", "file icon travis-icon", "medium-red"],
				["FI-Config/node_modules/mkdirp/test/umask_sync.js", "file icon js-icon", "medium-yellow"],
				["FI-Config/node_modules/mocha/lib/browser/.eslintrc.yaml", "file icon eslint-icon", "light-purple"]
			];
			
			it("shows an icon next to their filename", () => {
				assertIconClasses(entries, classes);
			});
			
			it("shows uncoloured icons if colours are disabled", () => {
				const iconClasses = classes.map(args => args.slice(0,2));
				const colourClasses = classes.map(a => [a[0], a[2]]);
				Options.set("coloured", false);
				assertIconClasses(entries, iconClasses);
				assertIconClasses(entries, colourClasses, true);
				Options.set("coloured", true);
				assertIconClasses(entries, iconClasses);
				assertIconClasses(entries, colourClasses);
			});
			
			it("shows the default icon-class for unrecognised filetypes", () => {
				entries["FI-Config/.git/description"].should.have.classes("file icon default-icon");
				entries["FI-Config/.git/description"].should.not.have.class("foo-bar");
				
				Options.set("defaultIconClass", "foo-bar");
				entries["FI-Config/.git/description"].should.have.classes("file icon foo-bar");
				entries["FI-Config/.git/description"].should.not.have.class("default-icon");
				
				Options.set("defaultIconClass", "default-icon");
				entries["FI-Config/.git/description"].should.have.classes("file icon default-icon");
				entries["FI-Config/.git/description"].should.not.have.class("foo-bar");
			});
		});
		
		describe("When directories are listed", () => {
			it("shows an icon next to their name", () => {
				entries[".vagrant"].should.have.classes("directory icon vagrant-icon medium-cyan");
				entries["Dropbox"].should.have.classes("directory icon dropbox-icon medium-blue");
				entries["FI-Config/.git"].should.have.classes("directory icon git-icon medium-red");
				entries["FI-Config/node_modules"].should.have.classes("directory icon node-icon medium-green");
				entries["FI-Config/node_modules/assertion-error"].should.have.classes("directory icon icon-file-directory");
			});
			
			it("shows uncoloured icons if colours are disabled", () => {
				Options.set("coloured", false);
				entries[".vagrant"].should.have.classes("directory icon vagrant-icon");
				entries[".vagrant"].should.not.have.class("medium-cyan");
				entries["Dropbox"].should.have.classes("directory icon dropbox-icon");
				entries["Dropbox"].should.not.have.class("medium-blue");
				entries["FI-Config/.git"].should.have.classes("directory icon git-icon");
				entries["FI-Config/.git"].should.not.have.class("medium-red");
				entries["FI-Config/node_modules"].should.have.classes("directory icon node-icon");
				entries["FI-Config/node_modules"].should.not.have.class("medium-green");
				entries["FI-Config/node_modules/assertion-error"].should.have.classes("directory icon icon-file-directory");
				
				Options.set("coloured", true);
				entries[".vagrant"].should.have.classes("directory icon vagrant-icon medium-cyan");
				entries["Dropbox"].should.have.classes("directory icon dropbox-icon medium-blue");
				entries["FI-Config/.git"].should.have.classes("directory icon git-icon medium-red");
				entries["FI-Config/node_modules"].should.have.classes("directory icon node-icon medium-green");
			});
		});
		
		describe("When listing archives in a light-coloured theme", () => {
			it("uses darker colours for icons with thin geometry", () => {
				entries["FI-Config/node_modules/chai/chai.js"].should.have.classes("file icon chai-icon medium-red");
				entries["FI-Config/node_modules/chai/chai.js"].should.not.have.class("dark-red");
				entries["FI-Config/node_modules/mkdirp/test/umask_sync.js"].should.have.classes("file icon js-icon medium-yellow");
				entries["FI-Config/node_modules/mkdirp/test/umask_sync.js"].should.not.have.class("dark-yellow");
				
				return setTheme("atom-light").then(() => {
					entries["FI-Config/node_modules/chai/chai.js"].should.have.classes("file icon chai-icon dark-red");
					entries["FI-Config/node_modules/chai/chai.js"].should.not.have.class("medium-red");
					entries["FI-Config/node_modules/mkdirp/test/umask_sync.js"].should.have.classes("file icon js-icon dark-yellow");
					entries["FI-Config/node_modules/mkdirp/test/umask_sync.js"].should.not.have.class("medium-yellow");
				});
			});
			
			it("uses different colours for Bower icons", () => {
				entries["FI-Config/node_modules/chai/bower.json"].should.have.classes("file icon bower-icon medium-orange");
				entries["FI-Config/node_modules/chai/bower.json"].should.not.have.class("medium-yellow");
				
				return setTheme("atom-dark").then(() => {
					entries["FI-Config/node_modules/chai/bower.json"].should.have.classes("file icon bower-icon medium-yellow");
					entries["FI-Config/node_modules/chai/bower.json"].should.not.have.class("medium-orange");
				});
			});
		});
	});
	
	
	describe("When a zip-file is closed", () => {
		it("frees up memory", () => {
			ArchiveView.entries.size.should.be.above(400);
			const samples = Array.from(ArchiveView.entries).slice(200, 210);
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
		
		it("doesn't clobber other archives held in memory", () => {
			atom.workspace.getActivePane().destroyItems();
			
			return chain(
				atom.packages.activatePackage("tabs"),
				() => open("zipped-2.zip"),
				() => open("zipped-1.zip"),
				() => wait(500)
			).then(() => {
				ArchiveView.entries.size.should.be.above(500);
				const sampleSet1 = Array.from(ArchiveView.entries)
					.filter(sample => /zipped-1\.zip$/.test(sample.archivePath))
					.slice(0, 20);
				for(const sample of sampleSet1){
					sample.destroyed.should.be.false;
					sample.iconNode.should.be.ok.and.respondTo("destroy");
					sample.emitter.should.be.ok;
					sample.view.should.be.ok;
				}
				const sampleSet2 = Array.from(ArchiveView.entries)
					.filter(sample => /zipped-2\.zip$/.test(sample.archivePath));
				for(const sample of sampleSet2){
					sample.destroyed.should.be.false;
					sample.iconNode.should.be.ok.and.respondTo("destroy");
					sample.emitter.should.be.ok;
					sample.view.should.be.ok;
				}
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
