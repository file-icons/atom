Change Log
==========
All notable changes to the project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

[Unpublished]: https://github.com/file-icons/atom/compare/v2.0.15...HEAD


[2.0.15] - 2017-02-08
---------------------
### Added
- **New icons:** ABIF (`.abif`, `.ab1`, `.fsa`), EJS (`.ejs`), Hoplon (`.hl`), KiCad (`.kicad_pcb`), Mercurial (`.hg`), PlatformIO (`platformio.ini`), Polymer (`polymer.json`), Rhino3D (`.3dm`, `.rvb`), VirtualBox (`.vbox`), VMware (`.vmdk,` `.nvram`, `.vmsd`, `.vmsn`, `.vmss`, `.vmtm`, `.vmx`, `.vmxf`)
- **Support:** LookML (`.lkml`), SQL (`.hql`)

### Fixed
- [[`#537`][], [`#540`][]] Errors thrown for [`atom-svn`](https://atom.io/packages/svn) and [`atom-ng`](https://atom.io/packages/atom-hg) users
- [[`#541`][]] Certain filenames replacing `.tpl` icons
- `linguist-language` strategy not working on Windows
- Missing cache and repository icons on Windows. Seriously this time.
- Icons not cleared from memory when closing `find-and-replace`

[2.0.15]: https://github.com/file-icons/atom/releases/tag/v2.0.15
[`#537`]: https://github.com/file-icons/atom/issues/537
[`#540`]: https://github.com/file-icons/atom/issues/540
[`#541`]: https://github.com/file-icons/atom/issues/541


[2.0.14] - 2017-02-03
---------------------
### Added
- **33 new icons:** Ansible, Aurelia, bitHound, Brunch, Buck, Bundler, CakePHP (updated logo), Chef, COBOL, CodeKit, Delphi, Doclets, DoneJS, Drone, GitLab, HaxeDevelop, Jasmine, Jest, KitchenCI, Lerna, Lime, Microsoft InfoPath, Nuclide, Octave, PHPUnit, Redux, RSpec, Sequelize, Shipit, Shippable, Swagger, Template Toolkit, Twig
- **Support:** Blade (`.blade`), Erlang (`Emakefile`), GraphViz (`.plantuml`, `.iuml`, `.puml`, `.pu`), Jekyll (`_config.yml`, `.nojekyll`), MkDocs (`mkdocs.yml`), Paket (Various `paket.*` configs, `.paket` folders), Process IDs (`.pid`), Puppet (`.epp`), Tcl (`.exp`), Terminal (`.profile`), Visual Studio (`.vscodeignore`, `.vsix`, `.vssettings.json`, `.vscode` folders), Yarn (`.yarnrc`, `.yarn-metadata.json`, `.yarn-integrity`, `.yarnclean`), WeChat (`.wxml`, `.wxss`)

### Fixed
- __Icon config:__ Incorrect priority levels assigned to certain icons
- __Icon config:__ Icon names not fuzzed when generating alias pattern
- Submodule icons not showing in tree-view
- Missing repo icons in projects that were opened through a symlink
- Certain path separators not normalised on Windows; likely solves [`#528`][]

[2.0.14]: https://github.com/file-icons/atom/releases/tag/v2.0.14
[`#528`]: https://github.com/file-icons/atom/issues/528


[2.0.13] - 2017-01-28
---------------------
### Added
- **Support:** Gear (`.htmlhintrc`), NodeJS (`.node`)

### Fixed
- [[`#528`][]] Deleted files not cleared from memory on Windows
- [[`#530`][]] Error thrown after deactivating package
- Errors thrown when deactivating/reactivating package

[2.0.13]: https://github.com/file-icons/atom/releases/tag/v2.0.13
[`#528`]: https://github.com/file-icons/atom/issues/528
[`#530`]: https://github.com/file-icons/atom/issues/530


[2.0.12] - 2017-01-24
---------------------
### Fixed
- Regression introduced in 2.0.11 for Nuclide users

[2.0.12]: https://github.com/file-icons/atom/releases/tag/v2.0.12


[2.0.11] - 2017-01-24
---------------------
### Fixed
- [[`#525`][]] Breakage at startup on Windows

[2.0.11]: https://github.com/file-icons/atom/releases/tag/v2.0.11
[`#525`]: https://github.com/file-icons/atom/issues/525


[2.0.10] - 2017-01-20
---------------------
### Fixed
- [[`#502`][]] Sporadic breakage with fixing tab-classes
- [[`#518`][]] Repo icons missing on Windows
- [[`#519`][]] Error thrown at startup or when installed
- Icon cache resetting between sessions on Windows

[2.0.10]: https://github.com/file-icons/atom/releases/tag/v2.0.10
[`#502`]: https://github.com/file-icons/atom/issues/502
[`#518`]: https://github.com/file-icons/atom/issues/518
[`#519`]: https://github.com/file-icons/atom/issues/519


[2.0.9] - 2017-01-13
--------------------
### Fixed
- [[`#497`][]] Tree-view not showing when adding new project in empty window
- [[`#509`][]] Breakage with hashbangs with `#!/usr/bin/env` but no interpreter
- [[`#514`][]] Breakage if `document.styleSheets` is null
- Submodule icons not showing

[2.0.9]:  https://github.com/file-icons/atom/releases/tag/v2.0.9
[`#497`]: https://github.com/file-icons/atom/issues/497
[`#509`]: https://github.com/file-icons/atom/issues/509
[`#514`]: https://github.com/file-icons/atom/issues/514


[2.0.8] - 2017-01-11
--------------------
### Added
- [[`#471`][]] [Partial Nuclide support][2.0.8]
- [[`#501`][]] Support for DTML files
- Colour for SQL filetypes
- **Support:** Emacs (`Cask`, `.emacs.d` folders), SQL (`.mysql`)

### Fixed
- [[`#505`][]] Wrong icons used for certain `.tpl` files
- [[`#506`][]] Error thrown when changing project paths in Nuclide

[2.0.8]:  https://github.com/file-icons/atom/releases/tag/v2.0.8
[`#471`]: https://github.com/file-icons/atom/issues/471#issuecomment-271532231
[`#501`]: https://github.com/file-icons/atom/issues/501
[`#505`]: https://github.com/file-icons/atom/issues/505
[`#506`]: https://github.com/file-icons/atom/issues/506


[2.0.7] - 2017-01-04
--------------------
### Fixed
- [[`#492`][]] Breakage with `yosemate-ui`
- [[`#493`][]] Breakage for repositories with unreadable paths
- [[`#494`][]] Tree-view hidden at startup (for real this time)
- Breakage if creating file with name matching a deleted folder

[2.0.7]:  https://github.com/file-icons/atom/releases/tag/v2.0.7
[`#492`]: https://github.com/file-icons/atom/issues/492
[`#493`]: https://github.com/file-icons/atom/issues/493
[`#494`]: https://github.com/file-icons/atom/issues/494


[2.0.6] - 2017-01-04
--------------------
Updated URLs to use new GitHub [organisation](https://github.com/file-icons).

[2.0.6]:  https://github.com/file-icons/atom/releases/tag/v2.0.6


[2.0.5] - 2017-01-04
--------------------
### Fixed
- [[`#481`][]] Rendering issue in Fuzzy-Finder
- [[`#483`][]] Wrong colour used for `_spec.rb` files
- [[`#489`][]] Wrong icon used for Dockerfiles
- [[`#491`][]] Error thrown for empty pathname

[2.0.5]:  https://github.com/file-icons/atom/releases/tag/v2.0.5
[`#481`]: https://github.com/file-icons/atom/issues/481
[`#483`]: https://github.com/file-icons/atom/issues/483
[`#489`]: https://github.com/file-icons/atom/issues/489
[`#491`]: https://github.com/file-icons/atom/issues/491


[2.0.4] - 2017-01-02
--------------------
### Fixed
- [[`#478`][]] Occasional breakage opening `tree-view` on Arch Linux
- Icons reverted when changing certain `tree-view` settings

[2.0.4]:  https://github.com/file-icons/atom/releases/tag/v2.0.4
[`#478`]: https://github.com/file-icons/atom/issues/478


[2.0.3] - 2017-01-01
--------------------
### Added
- Icon service to [enable integration with third-party packages][served].

### Fixed
- [[`#476`][]] Exception thrown deserialising external file-paths

[2.0.3]:  https://github.com/file-icons/atom/releases/tag/v2.0.3
[`#476`]: https://github.com/file-icons/atom/issues/470
[served]: https://github.com/file-icons/atom#integration-with-other-packages


[2.0.2] - 2016-12-30
--------------------
### Added
- **Support:** [[`#470`][]] `source.octave` as a MATLAB scope

### Fixed
- [[`#470`][]] Lack of support for user-defined filetypes with leading dots
- [[`#472`][]] Tree-view hidden at startup
- [[`#473`][]] Sporadic breakage when switching project windows
- Failing file-signature specs

### Currently working on
- [[`#471`][]] Icons not showing in Nuclide file-tree

[2.0.2]:  https://github.com/file-icons/atom/releases/tag/v2.0.2
[`#470`]: https://github.com/file-icons/atom/issues/470
[`#471`]: https://github.com/file-icons/atom/issues/471
[`#472`]: https://github.com/file-icons/atom/issues/472
[`#473`]: https://github.com/file-icons/atom/issues/473



[2.0.1] - 2016-12-30
--------------------
Fixed breakage at startup when run on Windows.

[2.0.1]:  https://github.com/file-icons/atom/releases/tag/v2.0.1


[2.0.0] - 2016-12-30
--------------------
### Added
- **New features:** Hashbang detection, modeline recognition, and much more.
[Please consult the release notes for full details](https://github.com/file-icons/atom/releases/tag/v2.0.0).
- **New icons:** ArtText (`.artx` folders), Electron, FFmpeg, GN (`.gn`, `.gni`), ICU, libuv, Ninja (`.ninja`), Nodemon (`nodemon.json`, `.nodemonignore`), Rascal (`.rsc`), V8
- **Support:** HTML (`.vash`, `.xhtml`), Source maps (`.css.map`, `.js.map`)

[2.0.0]:  https://github.com/file-icons/atom/releases/tag/v2.0.0


[1.7.25] - 2016-11-13
---------------------
### Added
- **New icons:** Rollup (new logo), SilverStripe (`.ss`)
- [[`435769b`][]]: Copies of Octicons noticeably affected by Atom 1.13's [upgrade to Octicons 4.4.0](https://github.com/atom/atom/pull/13138): `Settings`, `Dashboard`, `Tag`, `Terminal`, `Video`

### Changed
- `.ss` files no longer associated with Scheme

[1.7.25]:    https://github.com/file-icons/atom/releases/tag/v1.7.25
[`435769b`]: https://github.com/file-icons/source/commit/435769bbc5d14f11352d9c633a60ebd5d3cf2142


[1.7.24] - 2016-11-03
---------------------
### Added
- **New icons:** Codecov (`codecov.yml`), NSIS (new logo), Reason (`.re`, `.rei`), Snyk (`.synk`)
- **Support:** Boot (`Makefile.boot`), Generic (`.abnf`, `.bnf`, `.ebnf`)

### Changed
- Solid-filled icons now used for `.js`, `.jsx`, `.ts` and `.tsx` files

[1.7.24]: https://github.com/file-icons/atom/releases/tag/v1.7.24


[1.7.23] - 2016-10-27
---------------------
### Added
- **New icon:** EditorConfig (`.editorconfig`)
- **Support:** Bower Rails (`Bowerfile`), Docker Compose (`.docker-compose.*`), Docker Sync (`docker-sync.yml`), Gear (`.lintstagedrc`), OpenType feature files (`.fea`), PostCSS (`.postcssrc`, `postcss.config.js`), Zsh (`.antigen`, `.zpreztorc`)

[1.7.23]: https://github.com/file-icons/atom/releases/tag/v1.7.23


[1.7.22] - 2016-10-14
---------------------
### Added
- **New icons:** Glyphs (`.glyphs`), Yarn (`yarn.lock`)

### Fixed
- [[`#435`](https://github.com/file-icons/atom/issues/435)] Icon of [`markdown-preview`](https://github.com/atom/markdown-preview) misaligned after reloading
- [[`#437`](https://github.com/file-icons/atom/issues/437)] Ambiguous wording of package settings

[1.7.22]: https://github.com/file-icons/atom/releases/tag/v1.7.22


[1.7.21] - 2016-10-12
---------------------
### Added
- **New icons:** DyLib (`.dylib`), mruby (`.mrb`), SVN (`.svn`), Wercker (`wercker.yml`)
- **Support:** Git (`.keep`), `.vagrant` folders

### Fixed
- [[`#429`](https://github.com/file-icons/atom/issues/429)] Tab-icon colours not obeying value of user's _"Changed only"_ setting.

[1.7.21]: https://github.com/file-icons/atom/releases/tag/v1.7.21


[1.7.20] - 2016-10-04
---------------------
### Added
- **New icons:** 1C (`.bsl`, `.os`), PowerBuilder (`.pbl`, `.pbt`, `.srw`, `.sru`, `.srp`, `.sra`, `.srj`), Regex (`.regex`, `.regexp`), REXX (`.rex`, `.rexx`, `.pprx`)
- **Support:** Emacs Lisp (`.eld`, `.gnus`, `.viper`, `Project.ede`, `_emacs`, `abbrev_defs`), Generic (`.asn`, `.asn1`), TextMate (`.tmcg`), TI-BASIC (`.8xp`, `.8xk`, `.8xp.txt`, `.8xk.txt`)

### Changed
- Pug icon improved; previous icon retained at [`U+E9D0`](https://github.com/file-icons/source/blob/master/charmap.md#E9D0)

[1.7.20]: https://github.com/file-icons/atom/releases/tag/v1.7.20


[1.7.19] - 2016-08-28
---------------------
### Added
- **New icons:** FontForge (`.pe`, `.sfd`)
- **Support:** Emacs Lisp (`.elc`), GNU's readline configuration (`.inputrc`), PostScript (`.afm`, `.pfb`)

### Changed
- Updated icons in readme's preview image

[1.7.19]: https://github.com/file-icons/atom/releases/tag/v1.7.19


[1.7.18] - 2016-08-05
---------------------
### Added
- **New icons:** CircleCI (`circle.yml`), Tern (`.tern-project`)
- **Support:** Flow (`.js.flow`), Jinja (`.jinja2`), Mocha (`mocha.opts`), Manpages (`.pic`), mSQL (`.dsql`), NodeJS (`.nvmrc`), Pug (`.pug-lintrc`)

### Changed
- `.x` files now use Objective-C icon

[1.7.18]: https://github.com/file-icons/atom/releases/tag/v1.7.18


[1.7.17] - 2016-07-14
---------------------
### Added
- **New icons:** Chai, Cordova, D3, Ember, ESLint (new), Mocha
- **Support:** Assembly (`.agc`), Docker (`.dockerfile`), ESLint (`.eslintcache`)

### Changed
- Laravel icon is now orange, as per their logo

### Fixed
- [[`#400`](https://github.com/file-icons/atom/issues/400)] Laravel icon too small in Atom Material UI

[1.7.17]: https://github.com/file-icons/atom/releases/tag/v1.7.17


[1.7.16] - 2016-07-05
---------------------
### Added
- **New icons:** Akka, ChartJS, CKEditor, CodeMirror, EQ, Fuel UX, GDB, Leaflet, MathJax, Neko, Normalize.css, Sinatra, Spray, TinyMCE, YUI
- **Support:** BibTeX (`.bst`), NPM (`npm-shrinkwrap.json`), Yeoman (`.yo-rc.json`)

### Changed
- New procedure for adding icons - a [separate repository](https://github.com/file-icons/source) now manages the package's icon-font.
Contributors should take heed of the new [submission process](https://github.com/file-icons/source#adding-new-icons).

[1.7.16]: https://github.com/file-icons/atom/releases/tag/v1.7.16


[1.7.15] - 2016-06-17
---------------------
### Added
- **New icons:** Arch Linux, TypeDoc
- **Support:** Atom (`.atom`), Bower (`bower_components`), Debian (`control`, `rules`), Red Hat (`.spec`), Webpack (`webpackfile.js`)

### Changed
- [[`#381`](https://github.com/file-icons/atom/issues/381)] Erosion removed from Vagrant icon

### Fixed
- [[`#390`](https://github.com/file-icons/atom/issues/390)] Directory icons now respect user's *"Colour only when changed"* setting

[1.7.15]: https://github.com/file-icons/atom/releases/tag/v1.7.15


[1.7.14] - 2016-06-10
---------------------
### Added
- **New icons:** Alpine Linux, Knockout, Rollup, Stylus (alternate icons)
- Added NodeJS icon to `node_modules` folder

### Changed
- Stylus icon changed to use the logotype's first letter, [as per Stylus's favicon](http://stylus-lang.com/favicon.ico). The previous icon is still included at codepoint `\E9F7`.

[1.7.14]: https://github.com/file-icons/atom/releases/tag/v1.7.14


[1.7.13] - 2016-05-30
---------------------
### Added
- **New icons:** Audacity, Blender, FBX, Khronos, LightWave 3D, Maya, Nib, Stylus (new logo)
- **Support:** 3DS Max (`.3ds`, `.max`), 3D models (`.stl`), Danmakufu (`.dnh`), Flash (`.swc`), Generic code (`.appxmanifest`), Images (`.dds`), Keys (`git-credential-osxkeychain`), Links (`.url`), Models (`.u3d`), PHPUnit Config (`.xml.dist`), Stylelint (`.stylelintrc.{json, yaml, js}`, `stylelint.config.js`), Unity3D (`.unityproj`), Visual Studio (`.sln`), Wavefront Materials (`.mtl`)
- Colour variations for MAXScript files

### Changed
- `.obj` class renamed `.model` to be less format-specific

### Fixed
- `CMakeLists.txt` no longer replaced with standard text-file icon

[1.7.13]: https://github.com/file-icons/atom/releases/tag/v1.7.13


[1.7.12] - 2016-05-21
---------------------
### Added
- **New icons:** Adobe CC (After Effects, InDesign, Premiere), APL, Blank page, C# Cake, C#-Script, Csound, Cucumber/Gherkin, dBASE, Finder, Keynote, Microsoft Office (Access, Excel, OneNote, PowerPoint, Word), NAnt, OpenOffice, Protractor, Storyist, Strings, Typings, Wavefront OBJ, ZBrush
- **Support:** Config files (`.htmlhintrc`), Generic code (`.aepx`, `.sgm`, `.sgml`), Git commit/merge messages (`COMMIT_EDITMSG`, `MERGE_HEAD`, `MERGE_MODE`, `MERGE_MSG`), Graph files (`.dif`, `.slk`), Music-related (`.chord`), Preprocessed FORTRAN (`.F`, `.F77`, `.F90`, `.F95`, `.F03`, `.F08`, `.FOR`, `.FPP`), Readme (`.1st`)
- Alternative solid-coloured icons for TypeScript (`\02A6`), TSX (`\E9E7`) and JSX (`\E9E6`). To use them, copy their codepoints into your stylesheet.

### Changed
- [[`#366`](https://github.com/file-icons/atom/issues/366)] Default icon changed to a blank page instead of a text file. This is more format-neutral, and makes "true" text formats easier to spot.
- Restricted text-file icons to the following formats: `.ans`, `.err`, `.etx`, `.irclog`, `.log`, `.msg`, `.nfo`, `.rtf`, `.srt`, `.sub`, `.text`, `.txt`, `.uof`, `.uop`, `.uos`, `.uot`, `.utf8`, `.utxt`, `.weechatlog`
- APL icon replaced with the more recognisable [grade up symbol](http://www.fileformat.info/info/unicode/char/234b/index.htm).
- Cakefile class-name changed from `.cake` to `.cakefile` to accommodate C#'s "cake"

### Fixed
- Horizontal alignment of symlinks and zip-files

[1.7.12]: https://github.com/file-icons/atom/releases/tag/v1.7.12


[1.7.11] - 2016-05-10
---------------------
### Added
- **New icons:** Julia, SQLite
- **Support:** Embedded Crystal (`.coffee.ecr`, `.htm.ecr`, `.html.ecr`, `.js.ecr`), Embedded Ruby (`.htm.erb`), NodeJS (`.node-version`), NPM (`npmrc`), Python (`pypirc`, `.pypirc`, `pythonrc`, `.pythonrc`, `.python-venv`), Ruby (`gemrc`, `pryrc`, `rspec`), ZSH (`zlogin`, `zlogout`, `zprofile`, `zshenv`, `zshrc`, `.zsh-theme`)

### Changed
- Size/alignment tweaked for PDF and Python icons
- Python icon used for `.python-version` files

### Fixed
- Alignment and advance widths of Docker, Gradle, Groovy, Lisp, R, and Vue icons
- PDF files now respect value of user's "Coloured" setting

[1.7.11]: https://github.com/file-icons/atom/releases/tag/v1.7.11


[1.7.10] - 2016-05-07
---------------------
### Added
- **Support:** APL (`.apl.history`), Binary (`.swp`), Config files (`.apl.ascii`), Manual pages (`mmn`, `mmt`, `tmac.`), Stylelint (`.stylelintignore`)

### Fixed
- [[`#352`](https://github.com/file-icons/atom/issues/352)] Reverted fix for modified files with yellow icons
- Babel icon now shows for all `.babel` files

[1.7.10]: https://github.com/file-icons/atom/releases/tag/v1.7.10


[1.7.9] - 2016-05-05
--------------------
### Added
- **New icons:** Brakeman, CakePHP, Code Climate, Hack, Jenkins, Karma, Minecraft, New Relic, NuGet, PowerShell, Pug, SBT, Scrutinizer, Service Fabric, Shopify, Thor, TSX (React/Typescript), Vagrant
- **Support:** Adobe Photoshop (`.psb`), ANSI Weather (`.ansiweatherrc`), `CNAME`, Config files (`.arcconfig`, `.codoopts`, `.ctags`, `.env.*`, `indent.pro`, `.pairs`, `.python-version`, `.yardopts`), Erlang (`.app.src`), Gears (`.dll`), Generic code (`.gdbinit`, `.resx`, `.fsh`, `.vsh`), Git (`.git*`), GNU (`.GPLv[2-3]`), Gradle (`gradlew`), Heroku (`.buildpacks`, `Procfile`, `.vendor_urls`), Images (`.apng`, `.bmp`, `.bpg`, `.cd5`, `.cpc`, `.dcm`, `.ecw`, `.exr`, `.fit`, `.fits`, `.flif`, `.fts`, `.hdp`, `.hdr`, `.heic`, `.heif`, `.icns`, `.iff`, `.jpf`, `.jps`, `.jxr`, `.lbm`, `.liff`, `.mpo`, `.nrrd`, `.ora`, `.pbm`, `.pcx`, `.pgf`, `.pict`, `.pxr`, `.raw`, `.sct`, `.tga`, `.wbm`, `.wdp`), Makefiles (`BSDmakefile`), Manual Pages (`.tmac`, `.tmac-u`, `.nroff`, `.troff`), `METADATA.pb`, Mention-bot configs (`.mention-bot`), Prolog (`.pro`, `.prolog`, `.yap`), Readme (`AUTHORS`, `CHANGELOG`, `CONTRIBUTING`, `CONTRIBUTORS`, `COPYING`, `HISTORY`, `INSTALL`, `LICENSE`, `NEWS`, `PROJECTS`, `.read.me`, `.readme`, `THANKS`), Shell (`bash_history`, `bash_logout`), Shockwave Flash (`.swf`), Tag files (`tags`, `.tags`), Texinfo (`.texi`), TextMate (`.JSON-tmLanguage`), Visual Studio (`.builds`), Windows shortcuts (`.lnk`)
- Colour for default PDF icons
- Command to toggle coloured icons. To use it, create a keybinding for `file-icons:toggle-colours` in your keymap

### Changed
- Clearer icon now used for Jenkinsfiles
- Git icon used for `.mailmap` files
- Prolog files now use a dedicated icon instead of a generic one

### Fixed
- [[`#341`](https://github.com/file-icons/atom/issues/341)] Yellow icons no longer share same colour as modification indicator
- `.eslintrc.js` files are no longer overridden by JS icon

[1.7.9]: https://github.com/file-icons/atom/releases/tag/v1.7.9


[1.7.8] - 2016-04-28
--------------------
### Added
- **New icons:** Cabal, eC, MuPAD, OOC, Opa, OpenEdge ABL, Ox, Oxygene, Oz, Pan, Papyrus, Parrot, PAWN, Pickle, Pike, PogoScript, Pony, POV-Ray SDL, Propeller Spin, Puppet, PureBasic, PureScript, Racket, RDoc, REALbasic/Xojo, Rebol, Red, reStructuredText, RobotFramework, Sage, Scheme, Scilab, Self, Shen, Slash, SQF, Stan, Stata, SuperCollider, SystemVerilog, Textile, TextMate, Turing, TXL, Uno, UnrealScript, UrWeb, Varnish, VHDL, X10, XMOS, XPages, Xtend, Zephir, Zimpl
- **Support:** [Over +120 new extensions added](https://github.com/file-icons/atom/releases/tag/v1.7.8)

### Changed
- [[`#339`](https://github.com/file-icons/atom/issues/339)] `.toc` files now use a more generic-looking icon
- [[`93e705d`](https://github.com/file-icons/atom/commit/93e705d4d)] Fixed advance widths of icons with portrait-sized dimensions
- Size and alignment corrections made to Boot, ClojureScript, Elm, Ionic, JSX, Leiningen, nginx and React icons

### Removed
- Dropped support for Graph Modelling Language; its extension conflicts with GameMaker Language (`.gml`)

[1.7.8]: https://github.com/file-icons/atom/releases/tag/v1.7.8


[1.7.7] - 2016-04-24
--------------------
### Added
- **New icons:** AMX, Inno Setup, Jupyter, Kotlin, KRL, LabVIEW, Lasso, Lean, LSL, Logtalk, LookML, Mako, Matlab, Max, Mercury, Metal, Mirah, Modula-2, Monkey-X, NetLogo, Nimrod, Nit, Nix, NSIS, NumPy, Objective-J, OpenCL, Processing, Sublime Text
- **Support:** Certificate files (`.crt`, `.key`), GraphQL (`.gql`), JFlex (`.flex`, `.jflex`), JSONiq (`.jq`), Lex (`.lex`), Logos (`.x`, `.xm`, `.xi`), M (`.mumps`), Modelica (`.mo`), Module Management Systems (`.mmk`, `.mms`), MoonScript (`.moon`), MUF (`.muf`), Myghty (`.myt`), NCL (`.ncl`), Nu (`.nu`), Pure Data (`.pd`), QMake (`.pri`), Unity3D assets (`.anim`, `.asset`, `.mat`, `.meta`, `.prefab`, `.unity`)

### Fixed
- [[`#336`](https://github.com/file-icons/atom/issues/336)] Errors thrown for users of the [`sublime-panes`](https://atom.io/packages/sublime-panes) package

[1.7.7]: https://github.com/file-icons/atom/releases/tag/v1.7.7


[1.7.6] - 2016-04-22
--------------------
### Added
- **New icons:** BYOND, Clean, Click, Common Lisp, Coq, Creole, Cython, Darcs, Diff, E, Eagle, Ecere, Eiffel, EmberScript, Factor, Fancy, Fantom, Flux, FreeMarker, Frege, GameMaker, GAMS, GAP, Genshi, Gentoo, Godot, Golo, Gosu, Grammatical Framework, GraphQL, Graphviz, Harbour, Hashicorp, Hy, Idris, IGOR Pro, Inform 7, Io, Ioke, NVIDIA, Patch, Perl 6, Pointwise
- **Support:** Composer (`composer.phar`), Cycript (`.cy`), DNS Zones (`.arpa`, `.zone`), Dust (`.dust`), Dylan (`.dylan`, `.dyl`, `.intr`, `.lid`), ECL (`.ecl`, `.eclxml`), Formatted (`.eam.fs`), Forth (`.4th`, `.fth`, `.forth`, `.frt`), G-code (`.gco`, `.gcode`), Grace (`.grace`), Graph Modelling Language (`.gml`)

### Changed
- [[`#331`](https://github.com/file-icons/atom/issues/331)] Generic config icon now used for `.conf` files instead of nginx logo
- [[`#199`](https://github.com/file-icons/atom/issues/199)] Python icon is now blue instead of orange
- Visual Basic files now distinguished by Visual Studio icon

[1.7.6]: https://github.com/file-icons/atom/releases/tag/v1.7.6


[1.7.5] - 2016-04-20
--------------------
### Added
- New selector variable to override tab-icons in user stylesheets
- **New icons:** AMPL, Ceylon, Chapel, Cirru, Clarion, Dogescript, Fabric, IDL, Jakefile, JSON-LD, LFE, MediaWiki, Nmap, Nunjucks, Tcl, OWL, Phalcon, PostScript, SAS, SPARQL, Verilog, YANG
- **Support:** [Over +150](https://github.com/file-icons/atom/releases/tag/v1.7.5#support) new extensions and filenames added

### Changed
- Font Awesome updated to [4.6.1](https://github.com/FortAwesome/Font-Awesome/releases/tag/v4.6.1)
- Devicons, Icomoon, and Mfizz fonts converted to WOFF2 for better compression

### Fixed
- Height of `.meteor` folders

[1.7.5]: https://github.com/file-icons/atom/releases/tag/v1.7.5


[1.7.4] - 2016-04-18
--------------------
### Added
- **New icons:** Ant Build System, Bluespec, Boo, Brainfuck, Bro, ChucK, CLIPS, CMake, Component Pascal, Glade, GNU, Isabelle, Jinja, Mapbox, Stylelint
- **Support:** AGS, ApacheConf (`.apacheconf`, `.vhost`), Befunge, BitBake, BlitzMax, Brightscript, C2hs, Cap'n Proto, COBOL, `.csx`, Extra extensions for C, C++ and Erlang, Haskell `.hsc` files, HTTP, Jenkins, JSONLD, TeX `.aux` files, TopoJSON

### Fixed
- [[`#296`](https://github.com/file-icons/atom/issues/296)] Material UI resets size adjustments applied to icons

[1.7.4]: https://github.com/file-icons/atom/releases/tag/v1.7.4


[1.7.3] - 2016-04-17
--------------------
### Added
- **New icons:** ABAP, ActionScript, Alloy, ANTLR, API Blueprint, Arc, Arduino, ATS, Augeas, AutoHotkey, AutoIt, ColdFusion, J, Manual pages, Pascal
- **Support:** Agda, ASP.net, AspectJ, AWK-scripts, Extra assembly extensions, `.pcss`

### Fixed
- `_osc` and `PKGBUILD` icons now show icons correctly

[1.7.3]: https://github.com/file-icons/atom/releases/tag/v1.7.3


[1.7.2] - 2016-04-14
--------------------
### Added
- **New icons:** Doxygen
- **Support:** `.ad`, `.am`, `Brewfile`, `.desktop`, `.directory`, `.ebuild`, `.github`, `.install`, `.m4`, `.menu`, `.msi`, `_osc`, `PKGBUILD`, `.sed`, `_service`, `.spacemacs`
- Support for numerous GNU Automake/Autoconf files

### Fixed
- [[`#193`](https://github.com/file-icons/atom/issues/193)] Tab icons now update when changing file extensions
- [[`#316`](https://github.com/file-icons/atom/issues/316)] Newly-saved files now display icons in tab

[1.7.2]: https://github.com/file-icons/atom/releases/tag/v1.7.2


[1.7.1] - 2016-04-05
--------------------
### Added
- **New icons:** AppleScript, Appveyor, Cakefile, Emacs Lisp, Illustrator, Photoshop, Sketch
- **Support:** `.jsbeautifyrc`, `.coffeelintignore`, additional Makefile names (`mkfile`, `Kbuild`, `GNUmakefile`), `.Rmd`

### Fixed
- [[`#310`](https://github.com/file-icons/atom/issues/310)] Go icon replaced with something clearer
- [[`#311`](https://github.com/file-icons/atom/issues/311)] Lowercase `makefile` no longer matches any filename
- Changelog now displays properly in Atom's Markdown preview

[1.7.1]: https://github.com/file-icons/atom/releases/tag/v1.7.1


[1.7.0] - 2016-04-02
--------------------
### Added
- **New icons:** Broccoli, Flow
- **Support:** Ruby gems

### Changed
- Webpack icon now used for all filenames containing `webpack.config.`
- Size/alignment tweaked for Kivy, SQL, Scala, OS X and Smarty icons

### Fixed
- Binary files now respect value of user's "Colourless Icons" setting
- Bright colours and faint icons now adjust for users of light-coloured themes
- Dark red/maroon are brightened for users of darker themes

[1.7.0]: https://github.com/file-icons/atom/releases/tag/v1.7.0


[1.6.21] - 2016-04-01
---------------------
### Added
- **New icons:** Babel, Marko, Webpack
- **Support:** `.pug` files (Jade)

[1.6.21]: https://github.com/file-icons/atom/releases/tag/v1.6.21


[1.6.20] - 2016-03-31
---------------------
### Added
- **Support:** TrueType Collections (`.ttc`), Perl 6 (`.pl6`), generic audio formats, `.geojson`, `.phtml`, uppercased SQL extensions

### Fixed
- Colour is now applied to Ruby manifests and Git/NPM-related config files

[1.6.20]: https://github.com/file-icons/atom/releases/tag/v1.6.20


[1.6.19] - 2016-03-26
---------------------
### Added
- **New icons:** LLVM assembly (`.ll`)

### Fixed
- [[`#271`](https://github.com/file-icons/atom/issues/271)] Tab icons misaligned in files opened by Remote-Edit

[1.6.19]: https://github.com/file-icons/atom/releases/tag/v1.6.19


[1.6.18] - 2016-03-06
---------------------
### Fixed
- [[`#296`](https://github.com/file-icons/atom/issues/296)] Riot tag too large in Atom Material theme's tree view

[1.6.18]: https://github.com/file-icons/atom/releases/tag/v1.6.18


[1.6.17] - 2016-03-01
---------------------
### Changed
- Elephant now used for PHP icon
- NPM icon changed to use block-shaped "n" used by npmjs.com

### Fixed
- [[`#284`](https://github.com/file-icons/atom/issues/284)] Pattern matching used for task runner config files
- [[`#246`](https://github.com/file-icons/atom/issues/246)] Text-file icons not showing in Flatland Dark UI theme

[1.6.17]: https://github.com/file-icons/atom/releases/tag/v1.6.17


[1.6.16] - 2016-02-27
---------------------
### Added
- **New icons:** OCaml, Lua

### Fixed
- Icons now display properly with the [Seti UI](https://github.com/jesseweed/seti-ui) theme

### Changed
- Composer and Haml icons replaced with silhouetted versions
- Java icon made slightly bolder

[1.6.16]: https://github.com/file-icons/atom/releases/tag/v1.6.16


[1.6.15] - 2016-02-22
---------------------
### Added
- This changelog
- **New icons:** AsciiDoc, LiveScript, OrgMode, RAML, Riot, SaltStack, Terraform
- **Support:** Video files, `.dockerignore`, `.json5`, `.lesshintrc`, `.hxml`, `.ko`, `bash_profile`, `bash_login`, `bashrc`, VimL

### Changed
- JSX/TSX files use JSX icon instead of React's
- Increased size of Rust icon

### Fixed
- Extension of PowerShell modules (`.psm1`)

[1.6.15]: https://github.com/file-icons/atom/releases/tag/v1.6.15


[1.6.14] - 2016-01-19
---------------------
### Added
- **New icons:** Jade, ESLint, Fonts, TypeScript, PostCSS, OpenSCAD
- **Support:** `.htaccess`, `.htpasswd`
- Font Awesome updated to [4.4](https://github.com/FortAwesome/Font-Awesome/releases/tag/v4.4.0)

### Fixed
- [[`#239`](https://github.com/file-icons/atom/issues/239)] Bottom border of inactive tabs hidden/incomplete
- [[`#248`](https://github.com/file-icons/atom/issues/248)] Incorrect alignment/centring of React/JSX icon

[1.6.14]: https://github.com/file-icons/atom/releases/tag/v1.6.14


[1.6.13] - 2015-12-01
---------------------
### Added
- **New icons:** Ada, APL, Crystal, FORTRAN, Gradle, Groovy, Haxe, Kivy, Lisp, MAXScript, R, Vue
- **Support:** Gnuplot scripts
- [CONTRIBUTING.md](CONTRIBUTING.md) file explaining how to add new icons
- Optimised version of preview image

### Changed
- Merged `latex`, `iconsxd` and `fontcustom` fonts into `file-icons`

### Removed
- `iconsxd`, `fontcustom` and `latex` fonts

[1.6.13]: https://github.com/file-icons/atom/releases/tag/v1.6.13


[1.6.12] - 2015-11-20
---------------------
### Added
- **New icons:** Dart
- **Support:** ICO images, HJSON, `.tsx` files

### Changed
- `.react.js` files now use the React logo

### Fixed
- Vertical alignment of Node icon

[1.6.12]: https://github.com/file-icons/atom/releases/tag/v1.6.12


[1.6.11] - 2015-10-19
---------------------
### Added
- **New icons:** Apache, Debian, Red Hat, OS/X
- **Support:** Package.json (NPM icon)
- Updated Mfizz font

### Changed
- SVG icon now drawn from Mfizz font instead of IcoMoon
- Colour of Scala icon changed from green to red

[1.6.11]: https://github.com/file-icons/atom/releases/tag/v1.6.11


[1.6.10] - 2015-10-11
---------------------
### Added
- **New icons:** Boot, ClojureScript, Elm, Leiningen, SVG
- **Support:** `.gitconfig`, `.gitignore_global`, `.gitkeep`, `.rake`

[1.6.10]: https://github.com/file-icons/atom/releases/tag/v1.6.10


[1.6.8] - 2015-08-26
--------------------
### Added
- **New icons:** Meteor
- **Support:** `.htm`

### Fixed
- Images with uppercased file extensions are now recognised

[1.6.8]: https://github.com/file-icons/atom/releases/tag/v1.6.8


[1.6.7] - 2015-08-21
--------------------
### Changed
- Git icon now used for `.gitignore`, `.gitattributes` and `.gitmodules`
- Colours of Sass/SCSS icons changed to pink to reflect product logo
- Docker icons now applied to files named `Dockerfile` (e.g., `Dockerfile.name`)

[1.6.7]: https://github.com/file-icons/atom/releases/tag/v1.6.7


[1.6.6] - 2015-08-19
--------------------
### Added
- **Support:** Iced CoffeeScript

[1.6.6]: https://github.com/file-icons/atom/releases/tag/v1.6.6


[1.6.5] - 2015-08-18
--------------------
### Added
- **New icons:** Graph (CSV/TSV files)
- **Support:** `.babelrc`, `.babelignore`

[1.6.5]: https://github.com/file-icons/atom/releases/tag/v1.6.5


[1.6.3] - 2015-08-10
--------------------
### Added
- **Support:** `.swig`, HackLang

### Fixed
- Colour of `.toml` icons easier to see on darker backgrounds
- Cargo.toml no longer overridden by other .toml rules

[1.6.3]: https://github.com/file-icons/atom/releases/tag/v1.6.3


[1.6.1] - 2015-07-31
--------------------
### Added
- Package setting to hide icons in file tabs

[1.6.1]: https://github.com/file-icons/atom/releases/tag/v1.6.1


[1.5.8] - 2015-06-24
--------------------
### Added
- **Support:** Cargo (`Cargo.lock`, `Cargo.toml`), IPython (`.ipy`)

[1.5.8]: https://github.com/file-icons/atom/releases/tag/v1.5.8


[1.5.7] - 2015-06-04
--------------------
### Fixed
- Vertical alignment of tab icons

[1.5.7]: https://github.com/file-icons/atom/releases/tag/v1.5.7


[1.5.6] - 2015-05-30
--------------------
### Added
- **New icons:** F#
- **Support:** `.eex` (Elixir)

[1.5.6]: https://github.com/file-icons/atom/releases/tag/v1.5.6


[1.5.5] - 2015-05-03
--------------------
### Added
- **New icons:** D lang, Elixir, Erlang
- Updated Devicons to [1.8.0](https://github.com/vorillaz/devicons/releases/tag/1.8.0)

### Fixed
- Prevent theme styling from italicising icons

[1.5.5]: https://github.com/file-icons/atom/releases/tag/v1.5.5


[1.5.4] - 2015-04-09
--------------------
### Added
- **Support:** TeX alternates (`.sty`, `.cls`), `.es`, `.hgignore`

### Changed
- Renamed `latex` CSS class to `tex`

[1.5.4]: https://github.com/file-icons/atom/releases/tag/v1.5.4


[1.5.3] - 2015-04-06
--------------------
### Added
- **New fonts:** `latex` (for LaTeX/BibTeX icons)
- **New icons:** TemplateToolkit TT, SQL, LaTeX, BibTeX, Windows-specific files (BAT, CMD, EXE, COM, REG)
- **Support:** `.ndjson`, Babel Gulpfiles

[1.5.3]: https://github.com/file-icons/atom/releases/tag/v1.5.3


[1.5.2] - 2015-03-24
--------------------
### Added
- **New icons:** Twig
- **New colour swatch:** Pink
- **Support:** Ren'Py (Python), ESLint

### Changed
- Renamed `stylesheets` directory to `styles` to comply with Atom 1.0 specs

[1.5.2]: https://github.com/file-icons/atom/releases/tag/v1.5.2


[1.5.1] - 2015-03-08
--------------------
### Added
- **New fonts:** `file-icons` for JSX and React icons
- **New icons:** JSX, React

[1.5.1]: https://github.com/file-icons/atom/releases/tag/v1.5.1


[1.5.0] - 2015-02-28
--------------------
### Added
- **New icons:** Node icon, NGINX
- **Support:** Go templates, `.es6`
- Package setting to limit icon colours only when file is modified

[1.5.0]: https://github.com/file-icons/atom/releases/tag/v1.5.0


[1.4.11] - 2015-02-16
---------------------
### Added
- **New icons:** Assembly, Binary, Config (`.ini`, `.properties`, `.toml`)

[1.4.11]: https://github.com/file-icons/atom/releases/tag/v1.4.11


[1.4.10] - 2015-02-12
---------------------
### Added
- **New fonts:** `iconsxd` for Ionic and HAML icons
- **New icons:** Ionic, HAML
- **Support:** `.jshintignore`, `.cjsx`

[1.4.10]: https://github.com/file-icons/atom/releases/tag/v1.4.10


[1.4.9] - 2015-02-09
--------------------
### Added
- **Support:** Nodemon

### Fixed
- [[`#103`](https://github.com/file-icons/atom/issues/103)] Tab icons for Settings and Release Notes disappearing

[1.4.9]: https://github.com/file-icons/atom/releases/tag/v1.4.9


[1.4.8] - 2015-01-19
--------------------
### Added
- **Support:** D lang, Makefiles, `.config`, `.manifest`, `.psd1`, `.ps1m`, `.ps1xml`

[1.4.8]: https://github.com/file-icons/atom/releases/tag/v1.4.8


[1.4.7] - 2015-01-18
--------------------
### Added
- **New icons:** ColdFusion

### Fixed
- Missing icons in file tabs

[1.4.7]: https://github.com/file-icons/atom/releases/tag/v1.4.7


[1.4.6] - 2015-01-15
--------------------
### Fixed
- [[`#104`](https://github.com/file-icons/atom/issues/104)] Updated core selectors to use new custom elements

### Changed
- Updated minimum compatible Atom version to 0.171.0

[1.4.6]: https://github.com/file-icons/atom/releases/tag/v1.4.6


[1.4.5] - 2015-01-13
--------------------
### Added
- **New icons:** Rust
- Readded `_spec.rb` with green colouring
- Update Devicons

[1.4.5]: https://github.com/file-icons/atom/releases/tag/v1.4.5


[1.4.4] - 2015-01-06
--------------------
### Added
- **New icons:** Clojure, Rails
- **Support:** Capfile, Guardfile, `.rspec`, `.ru`

### Removed
- `_spec.rb` now implemented as `.feature`

[1.4.4]: https://github.com/file-icons/atom/releases/tag/v1.4.4


[1.4.3] - 2014-12-18
--------------------
### Added
- **New icons:** Travis
- **Support:** Emblem.js templates, `.cxx`, `.cc`, `.hxx`

[1.4.3]: https://github.com/file-icons/atom/releases/tag/v1.4.3


[1.4.2] - 2014-11-03
--------------------
### Added
- **New icons:** Lua
- **Support:** `.shtml`

### Changed
- Size of JavaScript icons

[1.4.2]: https://github.com/file-icons/atom/releases/tag/v1.4.2


[1.4.1] - 2014-10-22
--------------------
### Added
- **New icons:** Composer.json, Laravel Blade, Sourcepawn
- **Support:** Lua (generic code icon)

[1.4.1]: https://github.com/file-icons/atom/releases/tag/v1.4.1


[1.4.0] - 2014-10-16
--------------------
### Added
- Package settings to forcefully show icons and disable colours

[1.4.0]: https://github.com/file-icons/atom/releases/tag/v1.4.0


[1.3.6] - 2014-10-04
--------------------
### Added
- Icon and colour combinations for `.erb` files

### Changed
- Git-related files now use Git SCM logo instead of GitHub

[1.3.6]: https://github.com/file-icons/atom/releases/tag/v1.3.6


[1.3.5] - 2014-09-19
--------------------
### Added
- **Support:** PowerShell, XAML, Skim templates, Readme files

### Changed
- Default icon for tabs

### Fixed
- Image icons in tabs

[1.3.5]: https://github.com/file-icons/atom/releases/tag/v1.3.5


[1.3.4] - 2014-09-05
--------------------
### Added
- **New icons:** Smarty templates (`.tpl`)
- **Support:** `.t` files (Perl)

### Changed
- Colour of Perl icons to a more appropriate blue

[1.3.4]: https://github.com/file-icons/atom/releases/tag/v1.3.4


[1.3.3] - 2014-08-25
--------------------
### Added
- **New icons:** Julia
- **Support:** `.mdown`, `.markdown`, `.mkd`, `.mkdown`, `.rmd`, `.ron`
- Minor change to JavaScript icon's vertical alignment

[1.3.3]: https://github.com/file-icons/atom/releases/tag/v1.3.3


[1.3.2] - 2014-08-01
--------------------
### Fixed
- [[`#57`](https://github.com/file-icons/atom/issues/57)] Console error causing dev tools to open when reloading window

[1.3.2]: https://github.com/file-icons/atom/releases/tag/v1.3.2


[1.3.1] - 2014-08-01
--------------------
### Added
- **New fonts:** `fontcustom` for Dockerfile icon
- **New icons:** Dockerfile
- **Support:** Stylus, ASP VB.net, `.gitmodules`, `.mailmap`, `.npmrc`, `.hpp`, `.ipp`, `.mm`
- Readded Go icon with adjustments
- Font smoothing to improve icon appearance on Mac OS

### Changed
- [[`#54`](https://github.com/file-icons/atom/issues/54)] Reverted CoffeeScript to use pre-1.3.0 icon
- Reverted C and C++ files to use generic icons

[1.3.1]: https://github.com/file-icons/atom/releases/tag/v1.3.1


[1.3.0] - 2014-07-20
--------------------
### Added
- **New fonts:** [Devicons](http://vorillaz.github.io/devicons/)
- **New icons:** Bower logo, Go, CoffeeScript, Swift
- **Support:** `.handlebars`, `.pp`
- Stylesheet to override Unity theme's icon removal
- Stylesheet to remove package colours
- Updated Font Awesome to [4.1](https://github.com/FortAwesome/Font-Awesome/releases/tag/4.1.0)

### Removed
- Go icon (too faint)

[1.3.0]: https://github.com/file-icons/atom/releases/tag/v1.3.0


[1.2.6] - 2014-07-16
--------------------
### Added
- **New icons:** CakePHP templates, Twitter/Bower files
- **Support:** `.ejs`

[1.2.6]: https://github.com/file-icons/atom/releases/tag/v1.2.6


[1.2.5] - 2014-07-14
--------------------
### Added
- **New icons:** Haskell
- **Support:** `.bash`, `.yaml`
- Examples folder

### Changed
- `.ts` files now use JavaScript icon
- Node icon now used instead of NPM
- Colour of Gruntfile.coffee icons now matches CoffeeScript colour

[1.2.5]: https://github.com/file-icons/atom/releases/tag/v1.2.5


[1.2.4] - 2014-06-29
--------------------
### Fixed
- [[`#30`](https://github.com/file-icons/atom/issues/30)] Text of active tab vertically misaligned

[1.2.4]: https://github.com/file-icons/atom/releases/tag/v1.2.4


[1.2.3] - 2014-06-28
--------------------
### Added
- **New fonts:** [IcoMoon](https://icomoon.io/preview-free.html)
- **New icons:** Grunt, Gulp, Sass, Handlebars/Mustache
- **Support:** `.gitattributes`, `.jscsrc`, TypeScript, `npm-debug.log`

### Changed
- `.npmignore` and `npm-debug.log` files now use NPM icon instead of gear

[1.2.3]: https://github.com/file-icons/atom/releases/tag/v1.2.3


[1.2.2] - 2014-06-25
--------------------
### Added
- **New icons:** Java Server Pages (.jsp)
- **Support:** `.pm`, `.bashrc`, `.zshrc`, `.fishrc`, Elixir, Erlang

### Changed
- Character mappings for [1.1.0] icons

[1.2.2]: https://github.com/file-icons/atom/releases/tag/v1.2.2


[1.2.1] - 2014-06-24
--------------------
### Added
- **Support:** `Rakefile`, `.gemspec`, `Gemfile.lock`

[1.2.1]: https://github.com/file-icons/atom/releases/tag/v1.2.1


[1.2.0] - 2014-06-22
--------------------
### Added
- **New icons:** Markdown
- **Support:** Opal Ruby, `.ruby-version`, `.ruby-gemset`
- Icon support in file tabs

[1.2.0]: https://github.com/file-icons/atom/releases/tag/v1.2.0


[1.1.0] - 2014-06-08
--------------------
### Added
- **New icons:** C, C++, C#, Go, Java, Objective-C, Perl, PHP, Scala, Shell

### Changed
- Icons are now specified with CSS only

[1.1.0]: https://github.com/file-icons/atom/releases/tag/v1.1.0


[1.0.2] - 2014-05-28
--------------------
### Fixed
- [[`#7`](https://github.com/file-icons/atom/issues/7)] Incorrectly-centred icons

[1.0.2]: https://github.com/file-icons/atom/releases/tag/v1.0.2


[1.0.1] - 2014-05-26
--------------------
### Fixed
- [[`#6`][]]: Console error when opening a project in dev mode

[1.0.1]: https://github.com/file-icons/atom/releases/tag/v1.0.1
[`#6`]:  https://github.com/file-icons/atom/issues/6


[1.0.0] - 2014-05-24
--------------------
### Added
- **New fonts:** [FontAwesome](http://fortawesome.github.io/Font-Awesome/), [Mfizz](http://fizzed.com/oss/font-mfizz)
- **New icons:** Checklists, Code, CoffeeScript, Comments, CSS3, Dashboard, Database, Gear, Git, HTML5, JSX, Package, Python, Secret

### Changed
- Moved colour and icon properties to different stylesheets

[1.0.0]: https://github.com/file-icons/atom/releases/tag/v1.0.0


[0.3.0] - 2014-04-14
--------------------
### Added
- Colouring for literate CoffeeScript files

### Changed
- Regex to match file extensions with dashes (e.g., `.ruby-version`)

[0.3.0]: https://github.com/file-icons/atom/releases/tag/v0.3.0


[0.2.0] - 2014-03-27
--------------------
### Fixed
- Wrong CSS class name
- Debugging feedback left in tree-view

[0.2.0]: https://github.com/file-icons/atom/releases/tag/v0.2.0


0.1.0 - 2014-03-27
--------------------
Initial release.
