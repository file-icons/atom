"use strict";

const TreeView = require("../lib/consumers/tree-view.js");
const Options = require("../lib/options.js");


describe("File signatures", () => {
	const base = "name icon ";
	const delay = 500;
	let files;
	
	before("Extracting fixtures", function(){
		this.timeout(0);
		return chain([
			() => setup("4.3-signature"),
			() => {
				files = TreeView.ls();
				files.should.not.be.empty;
				files.length.should.be.at.least(15);
				Options.get("hashbangs").should.be.true;
				Options.get("modelines").should.be.true;
				assertIconClasses(files, defaults);
				return wait(delay);
			}
		]);
	});
	
	
	const defaults = [
		["binary1",    "default-icon"],
		["chrome",     "default-icon"],
		["font",       "default-icon"],
		["image1",     "default-icon"],
		["image2",     "default-icon"],
		["music1",     "default-icon"],
		["music2",     "default-icon"],
		["music3",     "default-icon"],
		["music4",     "default-icon"],
		["photoshop",  "default-icon"],
		["portadoc",   "default-icon"],
		["postscript", "default-icon"],
		["tag1",       "default-icon"],
		["tag2",       "default-icon"],
		["zipped1",    "default-icon"]
	];
	
	const sigIcons = [
		["binary1",    base + "binary-icon medium-red"],
		["chrome",     base + "chrome-icon medium-red"],
		["font",       base + "font-icon medium-blue"],
		["image1",     base + "image-icon medium-orange"],
		["image2",     base + "image-icon medium-yellow"],
		["music1",     base + "audio-icon medium-red"],
		["music2",     base + "audio-icon dark-yellow"],
		["music3",     base + "audio-icon dark-red"],
		["music4",     base + "audio-icon medium-blue"],
		["photoshop",  base + "psd-icon medium-blue"],
		["portadoc",   base + "icon-file-pdf medium-red"],
		["postscript", base + "postscript-icon medium-red"],
		["tag1",       base + "code-icon medium-blue"],
		["tag2",       base + "php-icon dark-blue"],
		["zipped1",    base + "zip-icon"]
	];
	
	
	when("no other pattern matches a file", () => {
		it("checks its header for a recognised signature", () => {
			assertIconClasses(files, defaults, true);
			assertIconClasses(files, sigIcons);
		});
		
		it("caches every signature it recognises", () => {
			TreeView.collapse();
			TreeView.expand();
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
	
	
	when("header-scanning strategies are disabled", () => {
		it("does not send IO requests for missing data", () => {
			Options.set("modelines", false);
			Options.set("hashbangs", false);
			TreeView.collapse();
			resetIcons();
			TreeView.expand();
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
