"use strict";

describe("Match strategies", () => {
	require("./spec-utils.js");
	
	before("Activate packages", () => {
		return chain([
			() => atom.themes.activateThemes(),
			() => atom.packages.activatePackage("file-icons"),
			() => atom.packages.activatePackage("tree-view"),
			() => atom.packages.activatePackage("tabs"),
			() => atom.packages.activatePackage("fuzzy-finder"),
			() => atom.packages.activatePackage("archive-view"),
			() => atom.packages.activatePackage("status-bar"),
			() => setTheme("atom-dark")
		]);
	});
	
	require("./4.1-path.js");
	require("./4.2-usertype.js");
	require("./4.3-signature.js");
	require("./4.4-linguist.js");
	require("./4.5-hashbang.js");
	require("./4.6-modeline.js");
	require("./4.7-grammar.js");
});
