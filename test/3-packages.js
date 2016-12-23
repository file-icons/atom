"use strict";

describe("Atom packages", () => {
	require("./spec-utils.js");
	
	before("Activate packages", () => {
		atom.project.setPaths([resolvePath("fixtures/project")]);
		
		return chain([
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
