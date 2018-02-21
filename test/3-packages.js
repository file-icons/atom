"use strict";

describe("Atom packages", function(){
	const {setTheme, setup} = require("./utils");
	this.timeout(30000);
	
	before("Activate packages", async () => {
		atom.workspace.observeTextEditors(editor =>
			editor.shouldPromptToSave = () => false);
		await setup("3-packages", {
			symlinks: [
				["Dropbox"],
				["node_modules"],
				["data.json", "dat.a"],
				["blank.file", "empty.file"],
				["la.tex", "late.x"],
			]
		});
		await atom.themes.activateThemes();
		await atom.packages.activatePackage("file-icons");
		await atom.packages.activatePackage("tree-view");
		await atom.packages.activatePackage("tabs");
		await atom.packages.activatePackage("fuzzy-finder");
		await atom.packages.activatePackage("archive-view");
		await setTheme("atom-dark");
	});
	
	require("./3.1-tree-view.js");
	require("./3.2-tabs.js");
	require("./3.3-fuzzy-finder.js");
	require("./3.4-find-and-replace.js");
	require("./3.5-archive-view.js");
});
