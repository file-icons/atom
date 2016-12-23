"use strict";

const {isAbsolute, join, resolve} = require("path");
const {lstatSync}   = require("fs");
const {headless}    = atom.getLoadSettings();
const {chain, wait} = require("../../lib/utils/general.js");
const FileRegistry  = require("../../lib/filesystem/file-registry.js");
const Storage       = require("../../lib/storage.js");
Chai.should();


before(() => {
	global.workspace = atom.views.getView(atom.workspace);
	attachToDOM(global.workspace);
});

Object.assign(global, {
	chain, wait,
	
	assertIconClasses(nodes, assertions, negate = false){
		for(const [name, classes] of assertions){
			if(!nodes[name]){
				Object.freeze(nodes);
				headless
					? console.error(`Node for "${name}" not found in list`)
					: console.error(`Node for %c${name}%c not found in list:`, "font-weight: bold", "", nodes);
				throw new ReferenceError(`Node for "${name}" not found`);
			}
			negate
				? nodes[name].should.not.have.class(classes)
				: nodes[name].should.have.class(classes);
		}
	},
	
	
	open(path){
		const projectPath = atom.project.rootDirectories[0].path;
		path = path.split(/[\\\/]+/g);
		path = resolve(__dirname, "..", projectPath, ...path);
		lstatSync(path); // Raise an exception if file is missing
		return atom.workspace.open(path);
	},
	
	
	resolvePath(path){
		path = path.split(/[\\\/]+/g);
		path = join(__dirname, "..", ...path);
		return path;
	},
	
	
	resetIcons(){
		FileRegistry.files.forEach(file => {
			file.icon.destroy();
			Storage.deletePath(file.path);
		});
		FileRegistry.reset();
		FileRegistry.init();
	},
	
	
	setTheme(...names){
		const [ui, syntax] = names.length < 2
			? [`${names[0]}-ui`, `${names[0]}-syntax`]
			: names;
		
		return Promise.all([
			atom.packages.activatePackage(ui),
			atom.packages.activatePackage(syntax)
		]).then(() => {
			atom.config.set("core.themes", [ui, syntax]);
			atom.themes.addActiveThemeClasses();
			atom.themes.loadBaseStylesheets();
			atom.themes.emitter.emit("did-change-active-themes");
			atom.packages.loadedPackages["file-icons"].reloadStylesheets();
		}).then(() => wait(100));
	}
});
