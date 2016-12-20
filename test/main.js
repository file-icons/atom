"use strict";

require("./1-icons.js");
require("./2-utils.js");

describe("Atom packages", () => {
	require("electron").ipcRenderer.setMaxListeners(25);
	require("./3-package-tree-view.js");
	require("./4-package-tabs.js");
	require("./5-package-fuzzy-finder.js");
	require("./6-package-find-and-replace.js");
	require("./7-package-archive-view.js");
});
