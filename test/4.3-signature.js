"use strict";

const {assertIconClasses, setup, wait} = require("./utils");
const TreeView = require("./utils/tree-view.js");
const Options = require("../lib/options.js");


describe("File signatures", function(){
	this.timeout(0);
	
	before("Extracting fixtures", async () => {
		await setup("4.3-signature");
		TreeView.refresh();
		TreeView.entries.should.have.lengthOf.at.least(15);
		Options.set("hashbangs", true);
		Options.set("modelines", true);
	});
	
	
	const defaults = [
		["binary1",    "default-icon"],
		["chrome",     "default-icon"],
		["font",       "default-icon"],
		["image1",     "default-icon"],
		["image2",     "default-icon"],
		["media1",     "default-icon"],
		["media2",     "default-icon"],
		["media3",     "default-icon"],
		["media4",     "default-icon"],
		["photoshop",  "default-icon"],
		["portadoc",   "default-icon"],
		["postscript", "default-icon"],
		["tag1",       "default-icon"],
		["tag2",       "default-icon"],
		["zipped1",    "default-icon"],
	];
	const base = "name icon ";
	const sigIcons = [
		["binary1",    base + "binary-icon medium-red"],
		["chrome",     base + "chrome-icon medium-red"],
		["font",       base + "font-icon medium-blue"],
		["image1",     base + "image-icon medium-orange"],
		["image2",     base + "image-icon medium-yellow"],
		["media1",     base + "audio-icon medium-red"],
		["media2",     base + "audio-icon dark-yellow"],
		["media3",     base + "audio-icon dark-red"],
		["media4",     base + "video-icon dark-purple"],
		["photoshop",  base + "psd-icon medium-blue"],
		["portadoc",   base + "icon-file-pdf medium-red"],
		["postscript", base + "postscript-icon medium-red"],
		["tag1",       base + "code-icon medium-blue"],
		["tag2",       base + "php-icon dark-blue"],
		["zipped1",    base + "zip-icon"],
	];
	
	
	when("no other pattern matches a file", () => {
		it("checks its header for a recognised signature", async () => {
			assertIconClasses(TreeView.entries, defaults);
			await wait(1500);
			assertIconClasses(TreeView.entries, defaults, true);
			assertIconClasses(TreeView.entries, sigIcons);
		});
		
		it("caches every signature it recognises", async () => {
			TreeView.collapse();
			TreeView.expand();
			TreeView.refresh();
			TreeView.entries.length.should.be.at.least(15);
			assertIconClasses(TreeView.entries, sigIcons);
			assertIconClasses(TreeView.entries, defaults, true);
			await wait(1500);
			assertIconClasses(TreeView.entries, sigIcons);
			assertIconClasses(TreeView.entries, defaults, true);
		});
	});
});
