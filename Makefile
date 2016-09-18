.PHONY : all test jshint eslint jscs literate david dist

ESLINT=node_modules/.bin/eslint
DAVID=node_modules/.bin/david
LJS=bin/ljs2.js

SRC=src bin

all : test

test : eslint jscs david

eslint :
	$(ESLINT) $(SRC)

david :
	$(DAVID)

literate :
	 $(LJS) --no-code -o README.md bin/ljs.js

dist : test literate
	git clean -fdx -e node_modules
