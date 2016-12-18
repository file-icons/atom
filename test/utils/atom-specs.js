"use strict";

const {isAbsolute, join} = require("path");
const {chain, wait} = require("../../lib/utils/general.js");
Chai.should();


module.exports = {
	
	activate(...packages){
		return chain(...packages.map(name => {
			return _=> atom.packages.activatePackage(name).then(result => {
				expect(result, name).not.to.be.undefined;
				if(result.mainModulePath && result.mainModuleRequired)
					expect(result.mainModule, name).to.be.an("object");
			});
		}));
	},
	
	
	assertIconClasses(nodes, assertions, negate = false){
		for(const [name, classes] of assertions)
			negate
				? nodes[name].should.not.have.class(classes)
				: nodes[name].should.have.class(classes);
	},
	
	
	dispatch(command, target = null){
		target = target || atom.views.getView(atom.workspace);
		return atom.commands.dispatch(target, command);
	},
	
	
	open(...paths){
		const projects = [];
		for(const path of paths)
			isAbsolute(path)
				? projects.push(path)
				: projects.push(join(__dirname, "..", ...path.split(/[\\\/]/)));
		atom.project.setPaths(projects);
	},
	
	
	setTheme(...names){
		const [ui, syntax] = names.length < 2
			? [`${names[0]}-ui`, `${names[0]}-syntax`]
			: names;
		
		return module.exports.activate(ui, syntax).then(() => {
			atom.config.set("core.themes", [ui, syntax]);
			atom.themes.addActiveThemeClasses();
			atom.themes.loadBaseStylesheets();
			atom.themes.emitter.emit("did-change-active-themes");
			atom.packages.loadedPackages["file-icons"].reloadStylesheets();
		}).then(() => wait(100));
	},
	
	
	setup(...args){
		let [name, handler] = args.length < 2
			? ["Setup", args[0]]
			: args;
		
		beforeEach(name, () => new Promise(handler));
	},
	
	
	waitForEvent(subject, event, timeout = 2000){
		return new Promise((resolve, reject) => {
			const disposable = subject.emitter.on(event, value => {
				disposable.dispose();
				resolve(value);
			});
			
			wait(timeout).then(() => {
				disposable.dispose();
				return reject(new Error(`Timed out waiting for ${event}`));
			});
		});
	}
};


const exp = module.exports;
for(const name in exp){
	const value = module.exports[name];
	if("function" === typeof value)
		module.exports[name] = value.bind(module.exports);
}
