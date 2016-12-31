"use strict";

const {isAbsolute, join, resolve} = require("path");
const fs            = require("fs");
const tmp           = require("tmp");
const rimraf        = require("rimraf");
const inSpecMode    = atom.inSpecMode();
const {headless}    = atom.getLoadSettings();
const {chain, wait, bindMethods, collectStrings} = require("../lib/utils/general.js");
const FileSystem    = require("../lib/filesystem/filesystem.js");
const TreeView      = require("../lib/consumers/tree-view.js");
const Storage       = require("../lib/storage.js");

let unpacking       = null;
let tmpDir          = null;

if(inSpecMode){
	Chai.should();
	before(() => {
		global.workspace = atom.views.getView(atom.workspace);
		attachToDOM(global.workspace);
	});
}


module.exports = {
	assertIconClasses,
	chain,
	getTempDir,
	move,
	open,
	replaceText,
	resetIcons,
	resolvePath,
	revert,
	rm,
	rmrf,
	setTheme,
	setup,
	wait
};

Object.assign(global, module.exports);


/**
 * Assert each element in a list has a given CSS class.
 *
 * TODO: Replace this function with a more elegant solution.
 *
 * @param {Array}   nodes
 * @param {Array}   assertions
 * @param {Boolean} [negate=false]
 * @throws {AssertionError} A node did not have the expected classes
 * @throws {ReferenceError} A node listed in `assertions` doesn't exist
 * @private
 */
function assertIconClasses(nodes, assertions, negate = false){
	for(let [name, ...classes] of assertions){
		if(!nodes[name]){
			Object.freeze(nodes);
			headless
				? console.error(`Node for "${name}" not found in list`)
				: console.error(`Node for %c${name}%c not found in list:`, "font-weight: bold", "", nodes);
			throw new ReferenceError(`Node for "${name}" not found`);
		}
		classes = collectStrings(classes).join(" ");
		negate
			? nodes[name].should.not.have.class(classes)
			: nodes[name].should.have.class(classes);
	}
}


/**
 * Retrieve or create the temporary file directory.
 *
 * Thin wrapper to cache the result of `tmp.dirSync`.
 * @return {Object}
 */
function getTempDir(){
	if(tmpDir)
		return tmpDir;
	
	const tmp = require("tmp");
	return tmpDir = tmp.dirSync({
		prefix: "file-icons@",
		mode:   0o755
	});
}


/**
 * Synchronously move a filesystem resource within a project fixture.
 *
 * @param {String} from
 * @param {String} to
 */
function move(from, to){
	from   = resolvePath(from);
	to     = resolvePath(to);
	fs.renameSync(from, to);
}


/**
 * Open a file in Atom.
 *
 * @throws {Error} Files must exist on disk. Otherwise, an exception is thrown.
 * @param {String} file - Resource path, relative to current project.
 * @return {Promise} A Promise which resolves to the {TextEditor} which opens the file.
 */
function open(path){
	path = resolvePath(path);
	fs.lstatSync(path); // Raise an exception if file is missing
	return atom.workspace.open(path);
}


/**
 * Perform in-place modification of the current editor's content.
 *
 * Data is written back to disk after being changed.
 *
 * @param {RegExp|String} find
 * @param {RegExp} replace
 * @return {Promise}
 */
function replaceText(find, replace){
	return new Promise(resolve => {
		const editor = atom.workspace.getActiveTextEditor();
		const done = editor.onDidStopChanging(() => {
			resolve();
			done.dispose();
		});
		editor.transact(100, () => {
			editor.scan(find, args => args.replace(replace));
		});
		editor.save();
	})
	// HACK: This shouldn't be necessary.
	.then(() => TreeView.collapse())
	.then(() => TreeView.expand());
}


/**
 * Crudely wipe currently-cached icon data.
 *
 * Used for testing the existence of cached info. NEVER wipe icon objects
 * at runtime unless you have a thing for interesting and random breakage.
 */
function resetIcons(){
	FileSystem.paths.forEach(resource => {
		resource.icon.destroy();
		Storage.deletePath(resource.path);
	});
	FileSystem.reset();
	FileSystem.init();
}


/**
 * Resolve a path relative to the currently-active project fixture.
 *
 * @example resolvePath("files/1.jpg") -> "/private/tmp/FA4…EAC7/files/1.jpg"
 * @param {String} path - Path specified relative to project's root.
 * @return {String} Absolute pathname located in a temporary system directory
 */
function resolvePath(path){
	const projectPath = atom.project.rootDirectories[0].path;
	path = path.split(/[\\\/]+/g);
	path = resolve(__dirname, projectPath, ...path);
	return path;
}


/**
 * Revert the current editor's last change.
 *
 * @param {Number} steps - Number of changes to undo
 * @return {Promise}
 */
function revert(steps = 1){
	return new Promise(resolve => {
		const editor = atom.workspace.getActiveTextEditor();
		const done = editor.onDidStopChanging(() => {
			resolve();
			done.dispose();
		});
		for(let i = 0; i < steps; ++i)
			editor.undo();
		editor.save();
	})
	.then(() => TreeView.collapse())
	.then(() => TreeView.expand());
}


/**
 * Delete a file as though `rm -f` were used.
 *
 * @param {String} path - Path relative to current project.
 */
function rm(path){
	path = resolvePath(path);
	try{
		fs.unlinkSync(path);
		FileSystem.get(path).destroy();
	} finally{ }
}


/**
 * Promise-enclosed wrapper for the `rimraf` module.
 *
 * @param {String} path
 * @return {Promise} Resolves once rimraffed.
 */
function rmrf(path){
	return new Promise(raffed => {
		rimraf(path, () => raffed());
	});
}


/**
 * Change the active UI theme.
 *
 * @example setTheme("one-dark").then(() => …);
 * @param {...String} names - Theme IDs, sans suffix.
 * @return {Promise}
 */
function setTheme(...names){
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


/**
 * Construct a project environment inside a temporary directory.
 *
 * @param {String} name - Name of *.zip file in `test/fixtures`
 * @param {Object} opts - Option hash
 * @return {Promise}
 */
function setup(name, opts = {}){
	const {
		postSetup = [],
		symlinks,
		chmod,
	} = opts;
	
	// Block cursor from stealing focus during specs
	if(!headless){
		let onPress = event => {
			event.stopImmediatePropagation();
			event.preventDefault();
			return false;
		};
		beforeEach(() => window.addEventListener("mousedown", onPress));
		afterEach(() => window.removeEventListener("mousedown", onPress));
	}
	
	// Resolve path to zipped files
	name = name.replace(/\.zip$/i, "");
	const tmpPath = getTempDir().name;
	const source  = join(__dirname, "fixtures", `${name}.zip`);
	const project = join(tmpPath, name);
	
	return rmrf(project)
		.then(() => unzip(source, tmpPath))
		.then(() => {
			
			// Symbolic links
			if(symlinks && "win32" !== process.platform){
				const symlinkDir = join(project, "symlinks");
				
				if(!fs.existsSync(symlinkDir))
					fs.mkdirSync(symlinkDir);
				
				for(const [targetName, linkName] of symlinks){
					const linkFile = join(symlinkDir, linkName || targetName);
					fs.existsSync(linkFile) && fs.unlinkSync(linkFile);
					fs.symlinkSync(join("..", targetName), linkFile);
				}
				
				TreeView.element && postSetup.push(
					() => wait(50),
					() => TreeView.expand("symlinks")
				);
			}
			
			// File permissions
			if(chmod)
				for(const [path, mode] of chmod)
					fs.chmodSync(join(project, ...path.split(/[\\\/]+/g)), mode);
			
			return atom.project.setPaths([project]);
		})
		.then(() => chain(postSetup));
}


/**
 * Extract a zip archive.
 *
 * @private
 * @param {String} from - Absolute path of .zip file
 * @param {String} to   - Absolute path of where its contents go
 * @return {Promise}
 */
function unzip(from, to){
	const unzip = require("unzip");
	return new Promise(done => {
		fs.createReadStream(from)
			.pipe(unzip.Extract({path: to}))
			.on("close", () => done());
	});
}
