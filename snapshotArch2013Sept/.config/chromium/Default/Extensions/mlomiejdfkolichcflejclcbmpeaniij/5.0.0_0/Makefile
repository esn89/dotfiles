SHELL=/bin/bash


JSHINT=./node_modules/.bin/jshint
UGLIFYJS=./node_modules/.bin/uglifyjs
MOCHA_PHANTOM=./node_modules/.bin/mocha-phantomjs

INJECTED_SCRIPT_SOURCE=includes/ghostery.js
INJECTED_SCRIPT_TARGET=includes/ghostery-min.js


.PHONY: all jshint json install test

all: $(INJECTED_SCRIPT_TARGET) jshint $(patsubst templates/%.html, templates/precompiled/%.js, $(wildcard templates/*.html))

$(INJECTED_SCRIPT_TARGET): $(INJECTED_SCRIPT_SOURCE)
	$(JSHINT) $(INJECTED_SCRIPT_SOURCE)
	$(UGLIFYJS) $(INJECTED_SCRIPT_SOURCE) -cm --comments "/ \* /" -o $(INJECTED_SCRIPT_TARGET)
	@#cp $(INJECTED_SCRIPT_SOURCE) $(INJECTED_SCRIPT_TARGET)

jshint:
	@$(JSHINT) *

json:
	yaml2json --sort _locales/en/messages.{yml,json} && json2yaml --sort _locales/en/messages.{json,yml}

# TODO from http://stackoverflow.com/questions/9787160/makefile-that-compiles-all-cpp-files-in-a-directory-into-separate-executable
templates/precompiled/%.js: templates/%.html
	node tools/compile_template.js $@

test:
	@$(MOCHA_PHANTOM) testRunner.html

install:
	@npm install
