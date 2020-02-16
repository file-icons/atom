all: icons lint test


# Install or download project dependencies
install: node_modules

node_modules:
	npm install .


# Regenerate icon-database
icons: install lib/icons/.icondb.js

lib/icons/.icondb.js: config.cson
	./bin/compile


# Check source for errors and style violations
lint: install
	npx eslint .
	npx coffeelint -q config.cson


# Run unit-tests
test: install
	atom -t ./test/
