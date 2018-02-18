"use strict";

describe("Match strategies", function(){
	const {setTheme} = require("./utils");
	this.timeout(30000);
	
	before("Activate packages", async () => {
		await atom.themes.activateThemes();
		await atom.packages.activatePackage("file-icons");
		await atom.packages.activatePackage("tree-view");
		await atom.packages.activatePackage("tabs");
		await atom.packages.activatePackage("fuzzy-finder");
		await atom.packages.activatePackage("archive-view");
		await atom.packages.activatePackage("status-bar");
		await setTheme("atom-dark");
	});
	
	require("./4.1-path.js");
	require("./4.2-usertype.js");
	require("./4.3-signature.js");
	require("./4.4-linguist.js");
	require("./4.5-hashbang.js");
	require("./4.6-modeline.js");
	require("./4.7-grammar.js");
});
