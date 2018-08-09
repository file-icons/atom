"use strict";

const {collectStrings, wait} = require("../../lib/utils.js");

const fs            = require("fs");
const path          = require("path");
const {headless}    = atom.getLoadSettings();
const {FileSystem}  = require("atom-fs");
const Options       = require("../../lib/options.js");
let tmpDir          = null;

if(atom.inSpecMode()){
	Chai.should();
	before(() => {
		const workspace = atom.views.getView(atom.workspace);
		headless
			? document.body.appendChild(workspace)
			: attachToDOM(workspace);
	});
	
	// FIXME: Incorrigible hack which shouldn't exist.
	const UI = require("../../lib/ui.js");
	const {getThemeColour} = UI;
	UI.getThemeColour = () => {
		const [uiTheme] = atom.config.get("core.themes").filter(name => /-ui$/.test(name));
		switch(uiTheme){
			case "atom-light-ui": return [238, 238, 238];
			case "atom-dark-ui":  return [48,  48,  48 ];
			case "one-dark-ui":   return [43,  43,  43 ];
			case "one-light-ui":  return [240, 240, 240];
			case "seti-ui":       return [21,  25,  27 ];
			case "dash-ui":       return [13,  16,  19 ];
			case "aesthetic-ui":  return [255, 255, 255];
			default: return getThemeColour.call(UI);
		}
	};
}


module.exports = {
	assertIconClasses,
	condition,
	getTempDir,
	move,
	open,
	replaceText,
	resetOptions,
	resolvePath,
	revert,
	rm,
	rmrf,
	snapshot,
	setTheme,
	setup,
	wait,
};


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
 * @internal
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
			? expect(nodes[name], `Node ${name}`).not.to.have.class(classes)
			: expect(nodes[name], `Node ${name}`).to.have.class(classes);
	}
}


/**
 * Return a {@link Promise} that resolves once a condition is met.
 *
 * @async
 * @example await condition(() => window.height < 80)
 * @param {Function} predicate - A callback that returns `true` to indicate successful criteria.
 * @param {Object} [options={}] - Optional settings, described below.
 * @param {Number} [options.pollRate=100] - How many milliseconds to wait before checking again.
 * @param {Number} [timeoutDuration=3000] - Maximum amount of time to wait before rejecting.
 * @param {String} [timeoutMessage="Timed out waiting for condition"] - Text used by timeout errors
 * @return {Promise}
 */
async function condition(predicate, options = {}){
	const start = Date.now();
	const {
		pollRate = 100,
		timeoutDuration = 3000,
		timeoutMessage = "Timed out waiting for condition",
	} = options;
	for(;;){
		const result = await predicate();
		if(result) return result;
		if(Date.now() - start > timeoutDuration)
			throw new Error(timeoutMessage);
		await new Promise($ => setTimeout($, pollRate));
	}
}


/**
 * Synchronously write the DOM's current HTML state to a file.
 *
 * @param {String} outputPath - Path to write output to
 * @param {Element} [root=document.documentElement]
 * @internal
 */
function snapshot(outputPath, root = null){
	root = null === root
		? document.documentElement
		: HTMLDocument === root.constructor
			? root.lastElementChild
			: root;
	const {HOME} = process.env;
	if(HOME) outputPath = outputPath.replace(/^~\//, `${HOME}/`);
	fs.writeFileSync(path.resolve(outputPath), root.outerHTML);
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
	from = resolvePath(from);
	to   = resolvePath(to);
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
async function replaceText(find, replace){
	const editor = atom.workspace.getActiveTextEditor();
	editor.transact(100, () => {
		editor.scan(find, args => args.replace(replace));
	});
	await editor.save();
	await wait(100);
}


/** Restore each package setting to its default value. */
function resetOptions(){
	if(!atom.packages.isPackageActive("file-icons"))
		return; // Not initialised
	if(!Options.configNames)
		Options.init();
	const schema = atom.config.getSchema("file-icons").properties;
	Options.set("coloured",          schema.coloured.default);
	Options.set("colourChangedOnly", schema.onChanges.default);
	Options.set("defaultIconClass",  schema.defaultIconClass.default);
	Options.set("tabPaneIcon",       schema.tabPaneIcon.default);
	Options.set("grammar",           schema.strategies.properties.grammar.default);
	Options.set("hashbangs",         schema.strategies.properties.hashbangs.default);
	Options.set("modelines",         schema.strategies.properties.modelines.default);
	Options.set("usertypes",         schema.strategies.properties.usertypes.default);
	Options.set("linguist",          schema.strategies.properties.linguist.default);
}


/**
 * Resolve a path relative to the currently-active project fixture.
 *
 * @example resolvePath("files/1.jpg") -> "/private/tmp/FA4…EAC7/files/1.jpg"
 * @param {String} input - Path specified relative to project's root.
 * @return {String} Absolute pathname located in a temporary system directory
 */
function resolvePath(input){
	const projectPath = atom.project.rootDirectories[0].path;
	input = input.split(/[\\/]+/g);
	input = path.resolve(__dirname, "..", "..", projectPath, ...input);
	return input;
}


/**
 * Revert the current editor's last change.
 *
 * @param {Number} steps - Number of changes to undo
 * @return {Promise}
 */
async function revert(steps = 1){
	const editor = atom.workspace.getActiveTextEditor();
	for(let i = 0; i < steps; ++i)
		editor.undo();
	await editor.save();
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
	const rimraf = require("rimraf");
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
async function setTheme(...names){
	const [ui, syntax] = names.length < 2
		? [`${names[0]}-ui`, `${names[0]}-syntax`]
		: names;
	
	await atom.packages.activatePackage(ui);
	await atom.packages.activatePackage(syntax);
	atom.config.set("core.themes", [ui, syntax]);
	atom.themes.addActiveThemeClasses();
	atom.themes.loadBaseStylesheets();
	atom.themes.emitter.emit("did-change-active-themes");
	atom.packages.loadedPackages["file-icons"].reloadStylesheets();
	await wait(500);
}


/**
 * Construct a project environment inside a temporary directory.
 *
 * @param {String} name - Name of *.zip file in `test/fixtures`
 * @param {Object} opts - Option hash
 * @return {Promise}
 */
async function setup(name, opts = {}){
	const {chmod, symlinks} = opts;
	resetOptions();
	
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
	const source  = path.join(__dirname, "..", "fixtures", `${name}.zip`);
	const project = path.join(tmpPath, name);
	
	await rmrf(project);
	await unzip(source, tmpPath);
			
	// Symbolic links
	if(symlinks){
		const symlinkDir = path.join(project, "symlinks");
		
		if(!fs.existsSync(symlinkDir))
			fs.mkdirSync(symlinkDir);
		
		for(const [targetName, linkName] of symlinks){
			const linkFile = path.join(symlinkDir, linkName || targetName);
			fs.existsSync(linkFile) && fs.unlinkSync(linkFile);
			fs.symlinkSync(path.join("..", targetName), linkFile);
		}
		
		await wait(50);
	}
	
	// File permissions
	if(chmod){
		const {join} = path;
		for(const [path, mode] of chmod)
			fs.chmodSync(join(project, ...path.split(/[\\/]+/g)), mode);
	}
	atom.project.setPaths([project]);
}


/**
 * Extract a zip archive.
 *
 * @internal
 * @param {String} from - Absolute path of .zip file
 * @param {String} to   - Absolute path of where its contents go
 * @return {Promise}
 */
function unzip(from, to){
	const unzip = require("unzipper");
	return new Promise(done => {
		fs.createReadStream(from)
			.pipe(unzip.Extract({path: to}))
			.on("close", () => done());
	});
}
