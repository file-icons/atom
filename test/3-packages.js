"use strict";

describe("Atom packages", function(){
	require("./spec-utils.js");
	this.timeout(0);
	
	before("Activate packages", () => {
		return chain([
			() => setup("3-packages", {
				symlinks: [
					["Dropbox"],
					["node_modules"],
					["data.json", "dat.a"],
					["blank.file", "empty.file"],
					["la.tex", "late.x"]
				]
			}),
			() => atom.themes.activateThemes(),
			() => atom.packages.activatePackage("file-icons"),
			() => atom.packages.activatePackage("tree-view"),
			() => atom.packages.activatePackage("tabs"),
			() => atom.packages.activatePackage("fuzzy-finder"),
			() => atom.packages.activatePackage("archive-view"),
			() => setTheme("atom-dark")
		]);
	});
	
	require("./3.1-tree-view.js");
	require("./3.2-tabs.js");
	require("./3.3-fuzzy-finder.js");
	require("./3.4-find-and-replace.js");
	require("./3.5-archive-view.js");
});
