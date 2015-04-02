
all: install bootstrap

install:
	@npm install
	@npm run build

watch:
	@npm run watch &
	@npm run watch-test

build:
	@npm run build-production

bootstrap:
	mkdir -p public/less/bootstrap
	cp -r node_modules/bootstrap/less/* public/less/bootstrap

test:
	@npm run test

test-file:
	find ./app -name *-test.js -print | awk '{print "require(\"."$$1"\");"}' > test/index.js

browser-tests: test-file
	@npm run build-test
	open test/index.html

.PHONY: all install server test

