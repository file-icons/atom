"use strict";

const TreeView = require("../lib/consumers/tree-view.js");
const Options = require("../lib/options.js");


describe("File signatures", () => {
	const base = "name icon ";
	const delay = 500;
	let files;
	
	const defaults = [
		["signature/binary1",    "default-icon"],
		["signature/chrome",     "default-icon"],
		["signature/font",       "default-icon"],
		["signature/image1",     "default-icon"],
		["signature/image2",     "default-icon"],
		["signature/music1",     "default-icon"],
		["signature/music2",     "default-icon"],
		["signature/music3",     "default-icon"],
		["signature/music4",     "default-icon"],
		["signature/photoshop",  "default-icon"],
		["signature/portadoc",   "default-icon"],
		["signature/postscript", "default-icon"],
		["signature/tag1",       "default-icon"],
		["signature/tag2",       "default-icon"],
		["signature/zipped1",    "default-icon"]
	];
	
	const sigIcons = [
		["signature/binary1",    base + "binary-icon medium-red"],
		["signature/chrome",     base + "chrome-icon medium-red"],
		["signature/font",       base + "font-icon medium-blue"],
		["signature/image1",     base + "image-icon medium-orange"],
		["signature/image2",     base + "image-icon medium-yellow"],
		["signature/music1",     base + "audio-icon medium-red"],
		["signature/music2",     base + "audio-icon dark-yellow"],
		["signature/music3",     base + "audio-icon dark-red"],
		["signature/music4",     base + "audio-icon medium-blue"],
		["signature/photoshop",  base + "psd-icon medium-blue"],
		["signature/portadoc",   base + "icon-file-pdf medium-red"],
		["signature/postscript", base + "postscript-icon medium-red"],
		["signature/tag1",       base + "code-icon medium-blue"],
		["signature/tag2",       base + "php-icon dark-blue"],
		["signature/zipped1",    base + "zip-icon"]
	];
	
	
	before(() => {
		TreeView.expand("signature");
		files = TreeView.ls();
		files.should.not.be.empty;
		files.length.should.be.at.least(15);
		Options.get("hashbangs").should.be.true;
		Options.get("modelines").should.be.true;
		assertIconClasses(files, defaults);
		return wait(delay);
	});
	
	
	describe("When no other pattern matches a file", () => {
		it("checks its header for a recognised signature", () => {
			assertIconClasses(files, defaults, true);
			assertIconClasses(files, sigIcons);
		});
		
		it("caches every signature it recognises", () => {
			TreeView.collapse("signature");
			TreeView.expand("signature");
			files = TreeView.ls();
			files.should.not.be.empty;
			files.length.should.be.at.least(15);
			assertIconClasses(files, sigIcons);
			assertIconClasses(files, defaults, true);
			return wait(delay).then(() => {
				assertIconClasses(files, sigIcons);
				assertIconClasses(files, defaults, true);
			});
		});
	});
	
	
	describe("When header-scanning strategies are disabled", () => {
		it("does not send IO requests for missing data", () => {
			Options.set("modelines", false);
			Options.set("hashbangs", false);
			TreeView.collapse("signature");
			resetIcons();
			TreeView.expand("signature");
			files = TreeView.ls();
			assertIconClasses(files, defaults);
		});
		
		it("loads data when such strategies are re-enabled", () => {
			return wait(delay).then(() => {
				assertIconClasses(files, defaults);
				Options.set("modelines", true);
				Options.set("hashbangs", true);
				return wait(delay);
			}).then(() => {
				assertIconClasses(files, sigIcons);
				assertIconClasses(files, defaults, true);
			});
		});
	});
});
