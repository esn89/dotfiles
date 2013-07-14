SHELL=/bin/bash

.PHONY: all jsl jshint

JSL=jsl -conf jsl.conf -nologo -nofilelisting -nosummary
JSHINT=jshint

INJECTED_SCRIPT_SOURCE=includes/ghostery.js
INJECTED_SCRIPT_TARGET=includes/ghostery-min.js

TEMPLATES=$(shell find templates -type f -name "*.html")
PRECOMPILED_TEMPLATES=$(shell find templates/precompiled -type f -name "*.js")

all: $(INJECTED_SCRIPT_TARGET) jsl jshint $(PRECOMPILED_TEMPLATES)

$(INJECTED_SCRIPT_TARGET): $(INJECTED_SCRIPT_SOURCE)
	$(JSL) -process $(INJECTED_SCRIPT_SOURCE)
	$(JSHINT) $(INJECTED_SCRIPT_SOURCE)
	uglifyjs $(INJECTED_SCRIPT_SOURCE) > $(INJECTED_SCRIPT_TARGET)
	@#cp $(INJECTED_SCRIPT_SOURCE) $(INJECTED_SCRIPT_TARGET)

jsl:
	@$(JSL)

jshint:
	@$(JSHINT) *

json:
	yaml2json --sort _locales/en/messages.{yml,json} && json2yaml --sort _locales/en/messages.{json,yml}

$(PRECOMPILED_TEMPLATES): $(TEMPLATES)
	node tools/compile_template.js $@
