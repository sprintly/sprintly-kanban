
all: install build

install:
	@npm install

watch:
	@node_modules/.bin/gulp

build:
	@npm run build &
	@npm run build-less &
	@npm run build-test &

build-production:
	@npm run build-production

bootstrap:
	mkdir -p public/less/bootstrap
	cp -r node_modules/bootstrap/less/* public/less/bootstrap

react-select:
	mkdir -p public/less/react-select
	cp -r node_modules/react-select/less/* public/less/react-select

test:
	@npm test

test-file:
	@find ./app -name *-test.js -print | awk '{print "require(\"."$$1"\");"}' > test/index.js
	@echo "test/index.js written"

test-server: test-file
	@npm run build-test
	@open http://localhost:8003/test/index.html
	@python -m SimpleHTTPServer 8003

.PHONY: all install server test watch
